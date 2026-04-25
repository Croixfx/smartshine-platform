from rest_framework import serializers
from .models import Branch, ServiceType


class ServiceTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceType
        fields = '__all__'


class BranchSerializer(serializers.ModelSerializer):
    service_types = ServiceTypeSerializer(many=True, read_only=True)

    class Meta:
        model = Branch
        fields = '__all__'
