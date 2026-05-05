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
    AdminUserSerializer,
    ChangeRoleSerializer,
)
from .services import send_otp

User = get_user_model()


def _no_cache(response):
    response['Cache-Control'] = 'no-store, no-cache, must-revalidate'
    response['Pragma'] = 'no-cache'
    return response


def _mask_email(email):
    if not email or '@' not in email:
        return None
    local, domain = email.split('@', 1)
    if not local:
        return f'***@{domain}'

    # Keep first 4 and last 3 chars of local-part when possible.
    prefix = local[:4]
    suffix = local[-3:] if len(local) > 4 else ''
    star_count = max(len(local) - len(prefix) - len(suffix), 3)
    return f'{prefix}{"*" * star_count}{suffix}@{domain}'


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        send_otp(user.phone, user.email or None)

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        response.data = {
            'detail': 'Account created. OTP sent to your email (and printed to console).',
            'phone': response.data.get('phone'),
        }
        return _no_cache(response)


class OTPRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OTPRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone = serializer.validated_data['phone']
        try:
            user = User.objects.get(phone=phone)
            email = user.email or None
        except User.DoesNotExist:
            email = None
        send_otp(phone, email)
        return _no_cache(
            Response({
                'detail': 'OTP sent. Check your email.',
                'masked_email': _mask_email(email),
            })
        )


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
            return _no_cache(Response(
                {'detail': 'Invalid or expired OTP.'},
                status=status.HTTP_400_BAD_REQUEST,
            ))

        otp.is_used = True
        otp.save()

        try:
            user = User.objects.get(phone=phone)
        except User.DoesNotExist:
            return _no_cache(Response(
                {'detail': 'Invalid or expired OTP.'}, status=status.HTTP_400_BAD_REQUEST,
            ))

        user.is_verified = True
        user.save(update_fields=['is_verified'])

        refresh = RefreshToken.for_user(user)
        return _no_cache(Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': CustomUserSerializer(user).data,
        }))


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class AdminUserListView(generics.ListAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'admin':
            return User.objects.none()
        return User.objects.all().order_by('-created_at')

    def list(self, request, *args, **kwargs):
        if request.user.role != 'admin':
            return Response({'detail': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)
        return super().list(request, *args, **kwargs)


class AdminUserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_target(self, request, user_id):
        if request.user.role != 'admin':
            return None, Response({'detail': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            return User.objects.get(pk=user_id), None
        except User.DoesNotExist:
            return None, Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, user_id):
        target_user, err = self._get_target(request, user_id)
        if err:
            return err
        serializer = AdminUserSerializer(target_user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        if 'role' in request.data:
            target_user.is_staff = target_user.role == 'admin'
            target_user.save(update_fields=['is_staff'])
        return Response(AdminUserSerializer(target_user).data)

    def delete(self, request, user_id):
        target_user, err = self._get_target(request, user_id)
        if err:
            return err
        if target_user == request.user:
            return Response({'detail': 'Cannot delete your own account.'}, status=status.HTTP_400_BAD_REQUEST)
        target_user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
