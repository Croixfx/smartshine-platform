from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import OTPCode

User = get_user_model()


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'phone', 'full_name', 'email', 'role', 'is_verified', 'created_at']
        read_only_fields = ['id', 'is_verified', 'created_at']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['phone', 'full_name', 'email', 'password']
        extra_kwargs = {'email': {'required': False, 'allow_blank': True}}

    def validate_phone(self, value):
        # Keep response generic to avoid account enumeration.
        if User.objects.filter(phone=value).exists():
            raise serializers.ValidationError('Unable to create account with provided details.')
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class OTPRequestSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=20)


class OTPVerifySerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=20)
    code = serializers.CharField(max_length=6, min_length=6)


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'phone', 'full_name', 'email', 'role', 'is_verified', 'created_at', 'updated_at']
        read_only_fields = ['id', 'phone', 'role', 'is_verified', 'created_at', 'updated_at']


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'phone', 'full_name', 'email', 'role', 'is_verified', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'phone', 'created_at', 'updated_at']


class ChangeRoleSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES)
