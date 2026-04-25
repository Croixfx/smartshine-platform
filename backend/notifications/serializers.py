from rest_framework import serializers
from .models import SMSLog


class SMSLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SMSLog
        fields = '__all__'
        read_only_fields = ['__all__']
