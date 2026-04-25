from rest_framework import viewsets, permissions
from .models import Booking
from .serializers import BookingSerializer


class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status', 'branch', 'service_type']

    def get_queryset(self):
        user = self.request.user
        if user.role in ('admin', 'worker'):
            return Booking.objects.select_related('customer', 'branch', 'service_type', 'vehicle')
        return Booking.objects.filter(customer=user).select_related('branch', 'service_type', 'vehicle')
