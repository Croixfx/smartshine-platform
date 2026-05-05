from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from accounts.permissions import IsAdmin
from .models import Branch, ServiceType
from .serializers import BranchSerializer, BranchDetailSerializer, ServiceTypeSerializer


class BranchViewSet(viewsets.ModelViewSet):
    filterset_fields = ['is_active']
    search_fields = ['name', 'address']
    ordering_fields = ['name', 'created_at']
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.role == 'admin':
            return Branch.objects.all()
        return Branch.objects.filter(is_active=True)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return BranchDetailSerializer
        return BranchSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsAdmin()]


class ServiceTypeViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceTypeSerializer
    filterset_fields = ['branch', 'category', 'is_available']
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'duration_minutes', 'name']

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.role == 'admin':
            return ServiceType.objects.select_related('branch')
        return ServiceType.objects.filter(is_available=True).select_related('branch')

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsAdmin()]
