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
    # Returns the full absolute URL for any uploaded image, falling back to
    # the explicit image_url URLField, then null.
    image_url = serializers.SerializerMethodField()

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        # Fallback: explicit external URL stored in the URLField
        return obj.image_url or None

    class Meta:
        model = Branch
        fields = [
            'id', 'name', 'address', 'latitude', 'longitude',
            'capacity', 'is_active', 'opening_time', 'closing_time', 'image', 'image_url', 'created_at',
        ]
        read_only_fields = ['created_at', 'image_url']


class BranchDetailSerializer(BranchSerializer):
    service_types = ServiceTypeSerializer(many=True, read_only=True)

    class Meta(BranchSerializer.Meta):
        fields = BranchSerializer.Meta.fields + ['service_types']
