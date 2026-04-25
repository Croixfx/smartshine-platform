import random
from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import OTPCode
from .serializers import (
    CustomUserSerializer,
    RegisterSerializer,
    OTPRequestSerializer,
    OTPVerifySerializer,
    UserProfileSerializer,
)

User = get_user_model()


def _generate_otp(phone):
    code = f"{random.randint(0, 999999):06d}"
    OTPCode.objects.create(phone=phone, code=code)
    print(f"\n{'='*40}")
    print(f"  OTP for {phone}: {code}")
    print(f"{'='*40}\n")
    return code


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        _generate_otp(user.phone)

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        response.data = {
            'detail': 'Account created. Check the console for your OTP.',
            'phone': response.data.get('phone'),
        }
        return response


class OTPRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OTPRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone = serializer.validated_data['phone']
        _generate_otp(phone)
        return Response({'detail': 'OTP sent. Check the console.'})


class OTPVerifyView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone = serializer.validated_data['phone']
        code = serializer.validated_data['code']

        otp = (
            OTPCode.objects
            .filter(phone=phone, code=code, is_used=False)
            .order_by('-created_at')
            .first()
        )

        if not otp or not otp.is_valid():
            return Response(
                {'detail': 'Invalid or expired OTP.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        otp.is_used = True
        otp.save()

        try:
            user = User.objects.get(phone=phone)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        user.is_verified = True
        user.save(update_fields=['is_verified'])

        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': CustomUserSerializer(user).data,
        })


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
