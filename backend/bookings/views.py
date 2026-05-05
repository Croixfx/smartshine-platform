import datetime

from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsCustomer, IsWorkerOrAdmin, IsAdmin
from branches.models import Branch
from .models import Booking
from .serializers import BookingSerializer, BookingCreateSerializer

STATUS_TRANSITIONS = {
    Booking.PENDING: Booking.CONFIRMED,
    Booking.CONFIRMED: Booking.IN_PROGRESS,
    Booking.IN_PROGRESS: Booking.WASHING,
    Booking.WASHING: Booking.DONE,
}


class BookingViewSet(viewsets.ModelViewSet):
    filterset_fields = ['status', 'payment_status', 'branch', 'date']
    search_fields = ['customer__phone', 'vehicle__plate_number', 'booking_ref']
    ordering_fields = ['date', 'time_slot', 'created_at']

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return BookingCreateSerializer
        return BookingSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [IsCustomer()]
        if self.action in ('update_status', 'update_payment', 'assign_staff'):
            return [IsWorkerOrAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        base = Booking.objects.select_related(
            'customer', 'branch', 'service', 'vehicle',
            'assigned_worker', 'assigned_driver',
        )
        if user.role == 'admin':
            return base.all()
        if user.role == 'worker':
            return base.exclude(status__in=(Booking.CANCELLED, Booking.PENDING))
        return base.filter(customer=user)

    def retrieve(self, request, *args, **kwargs):
        booking = self.get_object()
        user = request.user
        if user.role not in ('admin', 'worker') and booking.customer != user:
            raise PermissionDenied('You do not have access to this booking.')
        return Response(BookingSerializer(booking).data)

    @action(detail=True, methods=['patch'], url_path='cancel')
    def cancel(self, request, pk=None):
        booking = self.get_object()
        user = request.user
        if user.role not in ('admin',) and booking.customer != user:
            raise PermissionDenied('You cannot cancel this booking.')
        if booking.status not in (Booking.PENDING, Booking.CONFIRMED):
            return Response(
                {'detail': f'Cannot cancel a booking with status "{booking.status}".'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        booking.status = Booking.CANCELLED
        booking.save(update_fields=['status', 'updated_at'])
        return Response(BookingSerializer(booking).data)

    @action(detail=True, methods=['patch'], url_path='status', permission_classes=[IsWorkerOrAdmin])
    def update_status(self, request, pk=None):
        booking = self.get_object()
        user = request.user

        # Admin can set any valid status directly
        if user.role == 'admin' and 'status' in request.data:
            new_status = request.data['status']
            valid = [c[0] for c in Booking.STATUS_CHOICES]
            if new_status not in valid:
                return Response(
                    {'detail': f'Invalid status. Choose from: {", ".join(valid)}'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            booking.status = new_status
            booking.save(update_fields=['status', 'updated_at'])
            return Response(BookingSerializer(booking).data)

        # Worker: follow the progression chain and auto-assign themselves
        next_status = STATUS_TRANSITIONS.get(booking.status)
        if next_status is None:
            return Response(
                {'detail': f'No further progression from status "{booking.status}".'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking.status = next_status
        update_fields = ['status', 'updated_at']

        if user.role == 'worker' and not booking.assigned_worker:
            booking.assigned_worker = user
            update_fields.append('assigned_worker')

        booking.save(update_fields=update_fields)
        return Response(BookingSerializer(booking).data)

    @action(detail=True, methods=['patch'], url_path='payment', permission_classes=[IsAdmin])
    def update_payment(self, request, pk=None):
        booking = self.get_object()
        new_status = request.data.get('payment_status')
        valid = [c[0] for c in Booking.PAYMENT_STATUS_CHOICES]
        if new_status not in valid:
            return Response(
                {'detail': f'Invalid payment status. Choose from: {", ".join(valid)}'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        booking.payment_status = new_status
        booking.save(update_fields=['payment_status', 'updated_at'])
        return Response(BookingSerializer(booking).data)

    @action(detail=True, methods=['patch'], url_path='assign', permission_classes=[IsAdmin])
    def assign_staff(self, request, pk=None):
        booking = self.get_object()
        update_fields = ['updated_at']
        if 'assigned_worker' in request.data:
            booking.assigned_worker_id = request.data['assigned_worker'] or None
            update_fields.append('assigned_worker')
        if 'assigned_driver' in request.data:
            booking.assigned_driver_id = request.data['assigned_driver'] or None
            update_fields.append('assigned_driver')
        booking.save(update_fields=update_fields)
        return Response(BookingSerializer(booking).data)


class AvailableSlotsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        branch_id = request.query_params.get('branch')
        date_str = request.query_params.get('date')

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

        slots = []
        current = datetime.datetime.combine(date, branch.opening_time)
        end = datetime.datetime.combine(date, branch.closing_time)
        delta = datetime.timedelta(minutes=30)

        while current < end:
            slot_time = current.time()
            time_str = slot_time.strftime('%H:%M')
            if now and slot_time <= now:
                current += delta
                continue
            booked = booking_counts.get(time_str, 0)
            slots.append({'time': time_str, 'available': booked < branch.capacity})
            current += delta

        return Response(slots)
