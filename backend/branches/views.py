from rest_framework import viewsets, permissions
from .models import Branch, ServiceType
from .serializers import BranchSerializer, ServiceTypeSerializer


class BranchViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Branch.objects.filter(is_active=True)
    serializer_class = BranchSerializer
    permission_classes = [permissions.AllowAny]


class ServiceTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ServiceType.objects.select_related('branch')
    serializer_class = ServiceTypeSerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields = ['branch', 'category']
