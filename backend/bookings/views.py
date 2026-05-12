import base64
import datetime
import io

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsCustomer, IsWorkerOrAdmin, IsAdmin
from branches.models import Branch
from .models import Booking, PlateCapture
from .serializers import BookingSerializer, BookingCreateSerializer, PlateCaptureSerializer

# ── Forward-only status chain (worker wash progression) ───────────────────────
STATUS_TRANSITIONS = {
    Booking.PENDING:         Booking.CONFIRMED,
    Booking.CONFIRMED:       Booking.RECEIVED,
    Booking.EN_ROUTE_BRANCH: Booking.RECEIVED,
    Booking.RECEIVED:        Booking.WASHING,
    Booking.WASHING:         Booking.RINSING,
    Booking.RINSING:         Booking.DRYING,
    Booking.DRYING:          Booking.DONE,
}

# Driver-only milestone chain
DRIVER_TRANSITIONS = {
    Booking.CONFIRMED:        Booking.EN_ROUTE_PICKUP,  # edge-case: assigned before status updated
    Booking.DRIVER_ASSIGNED:  Booking.EN_ROUTE_PICKUP,
    Booking.EN_ROUTE_PICKUP:  Booking.AT_CUSTOMER,
    Booking.AT_CUSTOMER:      Booking.EN_ROUTE_BRANCH,
    Booking.DONE:             Booking.OUT_FOR_DELIVERY,
    Booking.OUT_FOR_DELIVERY: Booking.DELIVERED,
}

STATUS_ORDER = [
    Booking.PENDING, Booking.CONFIRMED, Booking.RECEIVED,
    Booking.WASHING, Booking.RINSING, Booking.DRYING, Booking.DONE,
]


def _send_status_email(booking, new_status):
    email = booking.customer.email
    if not email:
        return

    branch   = booking.branch
    vehicle  = booking.vehicle
    balance  = int(float(booking.service.price) * 0.7)
    time_str = booking.time_slot.strftime('%H:%M') if booking.time_slot else ''

    templates = {
        Booking.CONFIRMED: (
            f'Booking Confirmed – SmartShine {branch.name}',
            f'Hi {booking.customer.full_name or "there"},\n\n'
            f'Your booking at SmartShine {branch.name} is confirmed for {booking.date} at {time_str}!\n\n'
            f'See you then.',
        ),
        Booking.RECEIVED: (
            f'Your car has arrived – SmartShine {branch.name}',
            f'Hi {booking.customer.full_name or "there"},\n\n'
            f'Your car has arrived at SmartShine {branch.name}! '
            f'We\'ll start washing shortly.',
        ),
        Booking.WASHING: (
            f'Washing started – SmartShine',
            f'Hi {booking.customer.full_name or "there"},\n\n'
            f'We\'ve started washing your {vehicle.make} {vehicle.model}! 🚗',
        ),
        Booking.RINSING: (
            f'Rinsing in progress – SmartShine',
            f'Hi {booking.customer.full_name or "there"},\n\n'
            f'Washing done! Rinsing your car now...',
        ),
        Booking.DRYING: (
            f'Almost ready! – SmartShine',
            f'Hi {booking.customer.full_name or "there"},\n\n'
            f'Almost ready! Drying your car now ✨',
        ),
        Booking.DONE: (
            f'Your car is ready! – SmartShine 🎉',
            f'Hi {booking.customer.full_name or "there"},\n\n'
            f'Your car is ready! 🎉\n\n'
            f'Come collect at {branch.name}, {branch.address}.\n\n'
            f'Remember to bring your remaining balance of {balance:,} RWF.\n\n'
            f'Thank you for choosing SmartShine!',
        ),
        Booking.COLLECTED: (
            f'Car released – SmartShine',
            f'Hi {booking.customer.full_name or "there"},\n\n'
            f'Your car has been released. Thank you for choosing SmartShine!',
        ),
        Booking.DELIVERED: (
            f'Your car has been delivered – SmartShine',
            f'Hi {booking.customer.full_name or "there"},\n\n'
            f'Your freshly washed car has been delivered. Thank you for choosing SmartShine!',
        ),
        Booking.DRIVER_ASSIGNED: (
            f'Driver assigned – SmartShine',
            f'Hi {booking.customer.full_name or "there"},\n\n'
            f'A driver has been assigned to pick up your car. They will arrive soon.',
        ),
    }

    subject, body = templates.get(new_status, (None, None))
    if not subject:
        return

    try:
        send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [email], fail_silently=True)
    except Exception:
        pass


# ── Viewset ────────────────────────────────────────────────────────────────────

class BookingViewSet(viewsets.ModelViewSet):
    filterset_fields = ['status', 'payment_status', 'branch', 'date', 'service_type']
    search_fields    = ['customer__phone', 'vehicle__plate_number', 'booking_ref']
    ordering_fields  = ['date', 'time_slot', 'created_at']

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return BookingCreateSerializer
        return BookingSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [IsCustomer()]
        if self.action in ('update_status', 'confirm', 'update_payment', 'assign_staff'):
            return [IsWorkerOrAdmin()]
        if self.action in ('capture_plate', 'release_car'):
            return [IsWorkerOrAdmin()]
        if self.action == 'assign_driver':
            return [IsAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        base = Booking.objects.select_related(
            'customer', 'branch', 'service', 'vehicle',
            'assigned_worker', 'assigned_driver',
        ).prefetch_related('plate_captures')
        if user.role == 'admin':
            return base.all()
        if user.role == 'worker':
            return base.exclude(status=Booking.CANCELLED)
        if user.role == 'driver':
            return base.filter(assigned_driver=user)
        return base.filter(customer=user)

    def retrieve(self, request, *args, **kwargs):
        booking = self.get_object()
        user    = request.user
        if user.role not in ('admin', 'worker', 'driver') and booking.customer != user:
            raise PermissionDenied('You do not have access to this booking.')
        return Response(BookingSerializer(booking).data)

    # ── Cancel ────────────────────────────────────────────────────────────────

    @action(detail=True, methods=['patch'], url_path='cancel')
    def cancel(self, request, pk=None):
        booking = self.get_object()
        user    = request.user
        if user.role not in ('admin',) and booking.customer != user:
            raise PermissionDenied('You cannot cancel this booking.')
        if booking.status not in (Booking.PENDING, Booking.CONFIRMED):
            return Response(
                {'detail': f'Cannot cancel a booking with status "{booking.status}".'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        booking.status            = Booking.CANCELLED
        booking.status_updated_at = timezone.now()
        booking.save(update_fields=['status', 'status_updated_at', 'updated_at'])
        return Response(BookingSerializer(booking).data)

    # ── Confirm (pending → confirmed) ─────────────────────────────────────────

    @action(detail=True, methods=['post'], url_path='confirm', permission_classes=[IsWorkerOrAdmin])
    def confirm(self, request, pk=None):
        booking = self.get_object()
        if booking.status != Booking.PENDING:
            return Response(
                {'detail': 'Only pending bookings can be confirmed.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        booking.status            = Booking.CONFIRMED
        booking.status_updated_at = timezone.now()
        booking.save(update_fields=['status', 'status_updated_at', 'updated_at'])
        _send_status_email(booking, Booking.CONFIRMED)
        return Response(BookingSerializer(booking).data)

    # ── Status progression (worker wash chain) ────────────────────────────────

    @action(detail=True, methods=['patch'], url_path='status', permission_classes=[IsWorkerOrAdmin])
    def update_status(self, request, pk=None):
        booking = self.get_object()
        user    = request.user

        if user.role == 'admin' and 'status' in request.data:
            new_status = request.data['status']
            valid = [c[0] for c in Booking.STATUS_CHOICES]
            if new_status not in valid:
                return Response(
                    {'detail': f'Invalid status. Choose from: {", ".join(valid)}'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            old_status = booking.status
            booking.status            = new_status
            booking.status_updated_at = timezone.now()
            booking.save(update_fields=['status', 'status_updated_at', 'updated_at'])
            if new_status != old_status:
                _send_status_email(booking, new_status)
            return Response(BookingSerializer(booking).data)

        next_status = STATUS_TRANSITIONS.get(booking.status)
        if next_status is None:
            return Response(
                {'detail': f'No further progression from status "{booking.status}".'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking.status            = next_status
        booking.status_updated_at = timezone.now()
        update_fields = ['status', 'status_updated_at', 'updated_at']

        if user.role == 'worker' and not booking.assigned_worker:
            booking.assigned_worker = user
            update_fields.append('assigned_worker')

        booking.save(update_fields=update_fields)
        _send_status_email(booking, next_status)
        return Response(BookingSerializer(booking).data)

    # ── Payment status (admin only) ───────────────────────────────────────────

    @action(detail=True, methods=['patch'], url_path='payment', permission_classes=[IsAdmin])
    def update_payment(self, request, pk=None):
        booking    = self.get_object()
        new_status = request.data.get('payment_status')
        valid      = [c[0] for c in Booking.PAYMENT_STATUS_CHOICES]
        if new_status not in valid:
            return Response(
                {'detail': f'Invalid payment status. Choose from: {", ".join(valid)}'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        booking.payment_status = new_status
        booking.save(update_fields=['payment_status', 'updated_at'])
        return Response(BookingSerializer(booking).data)

    # ── Assign staff (admin only) ─────────────────────────────────────────────

    @action(detail=True, methods=['patch'], url_path='assign', permission_classes=[IsAdmin])
    def assign_staff(self, request, pk=None):
        booking       = self.get_object()
        update_fields = ['updated_at']
        if 'assigned_worker' in request.data:
            booking.assigned_worker_id = request.data['assigned_worker'] or None
            update_fields.append('assigned_worker')
        if 'assigned_driver' in request.data:
            new_driver_id = request.data['assigned_driver'] or None
            booking.assigned_driver_id = new_driver_id
            update_fields.append('assigned_driver')
            # Auto-advance pickup booking status when a driver is assigned
            if new_driver_id and booking.service_type == Booking.PICKUP and booking.status == Booking.CONFIRMED:
                booking.status             = Booking.DRIVER_ASSIGNED
                booking.driver_assigned_at = timezone.now()
                booking.status_updated_at  = timezone.now()
                update_fields.extend(['status', 'driver_assigned_at', 'status_updated_at'])
        booking.save(update_fields=update_fields)
        return Response(BookingSerializer(booking).data)

    # ── Plate capture (worker) ────────────────────────────────────────────────

    @action(detail=True, methods=['post'], url_path='capture-plate', permission_classes=[IsWorkerOrAdmin])
    def capture_plate(self, request, pk=None):
        booking = self.get_object()
        capture_type = request.data.get('capture_type', 'entry')
        if capture_type not in ('entry', 'exit'):
            return Response({'detail': 'capture_type must be "entry" or "exit".'}, status=status.HTTP_400_BAD_REQUEST)

        capture = PlateCapture.objects.create(
            booking=booking,
            plate_text=request.data.get('plate_text', ''),
            plate_image=request.FILES.get('plate_image'),
            capture_type=capture_type,
            captured_by=request.user,
        )
        return Response(PlateCaptureSerializer(capture).data, status=status.HTTP_201_CREATED)

    # ── Release car (worker — requires fully paid + done) ─────────────────────

    @action(detail=True, methods=['post'], url_path='release-car', permission_classes=[IsWorkerOrAdmin])
    def release_car(self, request, pk=None):
        booking = self.get_object()

        if booking.status != Booking.DONE:
            return Response(
                {'detail': 'Car must be in "done" status before release.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if booking.payment_status != Booking.FULLY_PAID:
            return Response(
                {'detail': 'Balance must be fully paid before releasing the car.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        plate_text  = request.data.get('plate_text', '')
        plate_image = request.FILES.get('plate_image')
        if plate_text or plate_image:
            PlateCapture.objects.create(
                booking=booking,
                plate_text=plate_text,
                plate_image=plate_image,
                capture_type='exit',
                captured_by=request.user,
            )

        booking.status            = Booking.COLLECTED
        booking.status_updated_at = timezone.now()
        booking.save(update_fields=['status', 'status_updated_at', 'updated_at'])
        _send_status_email(booking, Booking.COLLECTED)
        return Response(BookingSerializer(booking).data)

    # ── Assign driver (admin only) ────────────────────────────────────────────

    @action(detail=True, methods=['patch'], url_path='assign-driver', permission_classes=[IsAdmin])
    def assign_driver(self, request, pk=None):
        booking = self.get_object()

        from accounts.models import CustomUser
        driver_id = request.data.get('driver_id')
        try:
            driver = CustomUser.objects.get(pk=driver_id, role='driver')
        except (CustomUser.DoesNotExist, TypeError, ValueError):
            return Response({'detail': 'Valid driver ID required.'}, status=status.HTTP_400_BAD_REQUEST)

        booking.assigned_driver    = driver
        booking.driver_assigned_at = timezone.now()
        booking.status             = Booking.DRIVER_ASSIGNED
        booking.status_updated_at  = timezone.now()
        booking.save(update_fields=[
            'assigned_driver', 'driver_assigned_at',
            'status', 'status_updated_at', 'updated_at',
        ])
        _send_status_email(booking, Booking.DRIVER_ASSIGNED)
        return Response(BookingSerializer(booking).data)

    # ── Available pickups (broadcast — all confirmed, unassigned pickup jobs) ──

    @action(detail=False, methods=['get'], url_path='available-pickups')
    def available_pickups(self, request):
        user = request.user
        if user.role != 'driver':
            raise PermissionDenied('Only drivers can see available pickups.')
        qs = Booking.objects.filter(
            service_type=Booking.PICKUP,
            assigned_driver__isnull=True,
            status=Booking.CONFIRMED,
        ).select_related(
            'customer', 'branch', 'service', 'vehicle',
            'assigned_worker', 'assigned_driver',
        ).prefetch_related('plate_captures')
        return Response(BookingSerializer(qs, many=True).data)

    # ── Accept pickup (driver self-assigns an available broadcast job) ─────────

    @action(detail=True, methods=['post'], url_path='accept-pickup')
    def accept_pickup(self, request, pk=None):
        user = request.user
        if user.role != 'driver':
            raise PermissionDenied('Only drivers can accept pickups.')
        try:
            booking = Booking.objects.get(pk=pk)
        except Booking.DoesNotExist:
            return Response({'detail': 'Booking not found.'}, status=status.HTTP_404_NOT_FOUND)
        if booking.service_type != Booking.PICKUP:
            return Response({'detail': 'Not a pickup booking.'}, status=status.HTTP_400_BAD_REQUEST)
        if booking.assigned_driver_id is not None:
            return Response({'detail': 'This pickup has already been claimed by another driver.'}, status=status.HTTP_400_BAD_REQUEST)
        if booking.status != Booking.CONFIRMED:
            return Response({'detail': f'Cannot accept a booking with status "{booking.status}".'}, status=status.HTTP_400_BAD_REQUEST)
        booking.assigned_driver    = user
        booking.driver_assigned_at = timezone.now()
        booking.status             = Booking.DRIVER_ASSIGNED
        booking.status_updated_at  = timezone.now()
        booking.save(update_fields=[
            'assigned_driver', 'driver_assigned_at',
            'status', 'status_updated_at', 'updated_at',
        ])
        _send_status_email(booking, Booking.DRIVER_ASSIGNED)
        return Response(BookingSerializer(booking).data)

    # ── Driver milestone progression ──────────────────────────────────────────

    @action(detail=True, methods=['patch'], url_path='driver-status')
    def driver_update_status(self, request, pk=None):
        user = request.user
        if user.role != 'driver':
            raise PermissionDenied('Only drivers can use this endpoint.')

        booking = self.get_object()
        if booking.assigned_driver_id != user.pk:
            raise PermissionDenied('You are not the assigned driver for this booking.')

        next_status = DRIVER_TRANSITIONS.get(booking.status)
        if next_status is None:
            return Response(
                {'detail': f'No driver milestone from status "{booking.status}".'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking.status            = next_status
        booking.status_updated_at = timezone.now()
        booking.save(update_fields=['status', 'status_updated_at', 'updated_at'])
        return Response(BookingSerializer(booking).data)

    # ── Customer sets return method (self_pickup | delivery) ──────────────────

    @action(detail=True, methods=['patch'], url_path='return-method')
    def set_return_method(self, request, pk=None):
        booking = self.get_object()
        user    = request.user

        if user.role not in ('admin',) and booking.customer != user:
            raise PermissionDenied('Only the booking customer can set the return method.')

        if booking.status != Booking.DONE:
            return Response(
                {'detail': 'Return method can only be set when the booking status is "done".'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        method = request.data.get('method')
        if method not in (Booking.SELF_PICKUP, Booking.DELIVERY):
            return Response(
                {'detail': 'method must be "self_pickup" or "delivery".'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking.return_method = method
        update_fields = ['return_method', 'updated_at']

        if method == Booking.DELIVERY:
            booking.status            = Booking.OUT_FOR_DELIVERY
            booking.status_updated_at = timezone.now()
            update_fields += ['status', 'status_updated_at']

        booking.save(update_fields=update_fields)
        return Response(BookingSerializer(booking).data)

    # ── QR code for self-pickup verification ──────────────────────────────────

    @action(detail=True, methods=['get'], url_path='qr-code')
    def qr_code(self, request, pk=None):
        booking = self.get_object()
        user    = request.user

        if user.role not in ('admin',) and booking.customer != user:
            raise PermissionDenied('You cannot access this QR code.')

        try:
            import qrcode

            data = f'SMARTSHINE|{booking.booking_ref}|{booking.id}'
            img  = qrcode.make(data)
            buf  = io.BytesIO()
            img.save(buf, format='PNG')
            qr_b64 = base64.b64encode(buf.getvalue()).decode()

            return Response({
                'qr_code':     f'data:image/png;base64,{qr_b64}',
                'booking_ref': booking.booking_ref,
            })
        except ImportError:
            return Response(
                {'detail': 'QR code library not installed on server.'},
                status=status.HTTP_501_NOT_IMPLEMENTED,
            )


# ── Available slots ────────────────────────────────────────────────────────────

class AvailableSlotsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        branch_id = request.query_params.get('branch')
        date_str  = request.query_params.get('date')

        if not branch_id or not date_str:
            return Response(
                {'detail': 'Both "branch" and "date" query parameters are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            branch = Branch.objects.get(pk=branch_id)
        except Branch.DoesNotExist:
            return Response({'detail': 'Branch not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            date = datetime.date.fromisoformat(date_str)
        except ValueError:
            return Response({'detail': 'Invalid date format. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)

        today = timezone.localdate()
        if date < today:
            return Response([])

        now = timezone.localtime().time() if date == today else None

        booking_counts = {}
        for t in Booking.objects.filter(branch=branch, date=date).exclude(status=Booking.CANCELLED).values_list('time_slot', flat=True):
            key = t.strftime('%H:%M')
            booking_counts[key] = booking_counts.get(key, 0) + 1

        slots   = []
        current = datetime.datetime.combine(date, branch.opening_time)
        end     = datetime.datetime.combine(date, branch.closing_time)
        delta   = datetime.timedelta(minutes=30)

        while current < end:
            slot_time = current.time()
            time_str  = slot_time.strftime('%H:%M')
            if now and slot_time <= now:
                current += delta
                continue
            booked = booking_counts.get(time_str, 0)
            slots.append({'time': time_str, 'available': booked < branch.capacity})
            current += delta

        return Response(slots)
