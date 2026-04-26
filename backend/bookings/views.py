from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import IsCustomer, IsWorkerOrAdmin
from .models import Booking
from .serializers import BookingSerializer, BookingCreateSerializer

# Valid worker-driven status progressions
STATUS_TRANSITIONS = {
    Booking.PENDING: Booking.CONFIRMED,
    Booking.CONFIRMED: Booking.IN_PROGRESS,
    Booking.IN_PROGRESS: Booking.WASHING,
    Booking.WASHING: Booking.DONE,
}


class BookingViewSet(viewsets.ModelViewSet):
    filterset_fields = ['status', 'payment_status', 'branch', 'date']
    search_fields = ['customer__phone', 'vehicle__plate_number']
    ordering_fields = ['date', 'time_slot', 'created_at']

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return BookingCreateSerializer
        return BookingSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [IsCustomer()]
        if self.action == 'update_status':
            return [IsWorkerOrAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        base = Booking.objects.select_related('customer', 'branch', 'service', 'vehicle')
        if user.role == 'admin':
            return base.all()
        if user.role == 'worker':
            return base.exclude(status__in=(Booking.CANCELLED, Booking.PENDING))
        # customer
        return base.filter(customer=user)

    def retrieve(self, request, *args, **kwargs):
        booking = self.get_object()
        user = request.user
        if user.role not in ('admin', 'worker') and booking.customer != user:
            raise PermissionDenied('You do not have access to this booking.')
        return Response(BookingSerializer(booking).data)

    # ── Custom action: cancel ─────────────────────────────────────────────────
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

    # ── Custom action: worker status progression ──────────────────────────────
    @action(detail=True, methods=['patch'], url_path='status', permission_classes=[IsWorkerOrAdmin])
    def update_status(self, request, pk=None):
        booking = self.get_object()
        next_status = STATUS_TRANSITIONS.get(booking.status)

        if next_status is None:
            return Response(
                {'detail': f'No further progression from status "{booking.status}".'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking.status = next_status
        booking.save(update_fields=['status', 'updated_at'])
        return Response(BookingSerializer(booking).data)
