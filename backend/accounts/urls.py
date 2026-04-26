from django.urls import path
from .views import RegisterView, OTPRequestView, OTPVerifyView, ProfileView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('otp/request/', OTPRequestView.as_view(), name='otp-request'),
    path('otp/verify/', OTPVerifyView.as_view(), name='otp-verify'),
    path('profile/', ProfileView.as_view(), name='profile'),
]
