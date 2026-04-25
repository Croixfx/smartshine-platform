from rest_framework import viewsets, permissions
from .models import SMSLog
from .serializers import SMSLogSerializer


class SMSLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SMSLogSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = SMSLog.objects.select_related('recipient').order_by('-created_at')
