from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied

from accounts.permissions import IsCustomer, IsOwnerOrAdmin
from .models import Vehicle
from .serializers import VehicleSerializer


class VehicleViewSet(viewsets.ModelViewSet):
    serializer_class = VehicleSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [IsCustomer()]
        if self.action in ('update', 'partial_update', 'destroy'):
            return [IsOwnerOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Vehicle.objects.select_related('customer')
        return Vehicle.objects.filter(customer=user)

    def get_object(self):
        obj = super().get_object()
        if self.action in ('update', 'partial_update', 'destroy'):
            if obj.customer != self.request.user and self.request.user.role != 'admin':
                raise PermissionDenied('You do not own this vehicle.')
        return obj

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)
