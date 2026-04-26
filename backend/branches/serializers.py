from rest_framework import serializers
from .models import Branch, ServiceType


class ServiceTypeSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = ServiceType
        fields = [
            'id', 'branch', 'name', 'description', 'price',
            'duration_minutes', 'category', 'category_display', 'is_available',
        ]


class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = [
            'id', 'name', 'address', 'latitude', 'longitude',
            'capacity', 'is_active', 'opening_time', 'closing_time', 'created_at',
        ]
        read_only_fields = ['created_at']


class BranchDetailSerializer(BranchSerializer):
    service_types = ServiceTypeSerializer(many=True, read_only=True)

    class Meta(BranchSerializer.Meta):
        fields = BranchSerializer.Meta.fields + ['service_types']
