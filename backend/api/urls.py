from django.urls import path, include
from rest_framework.routers import DefaultRouter

from accounts.views import (
    RegisterView, OTPRequestView, OTPVerifyView, ProfileView,
    AdminUserListView, AdminUserDetailView, DriverLocationView, DriverListView,
)
from branches.views import BranchViewSet, ServiceTypeViewSet
from vehicles.views import VehicleViewSet
from bookings.views import BookingViewSet, AvailableSlotsView
from payments.views import PaymentViewSet, InitiatePaymentView
from notifications.views import SMSLogViewSet

router = DefaultRouter()
router.register(r'branches', BranchViewSet, basename='branch')
router.register(r'services', ServiceTypeViewSet, basename='service-type')
router.register(r'vehicles', VehicleViewSet, basename='vehicle')
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'notifications/sms-logs', SMSLogViewSet, basename='sms-log')

urlpatterns = [
    # Explicit paths before router so they don't get swallowed by viewset lookups
    path('bookings/available-slots/', AvailableSlotsView.as_view(), name='available-slots'),
    path('payments/initiate/', InitiatePaymentView.as_view(), name='payment-initiate'),

    # Router endpoints
    path('', include(router.urls)),

    # Accounts (non-viewset)
    path('accounts/register/', RegisterView.as_view(), name='register'),
    path('accounts/otp/request/', OTPRequestView.as_view(), name='otp-request'),
    path('accounts/otp/verify/', OTPVerifyView.as_view(), name='otp-verify'),
    path('accounts/profile/', ProfileView.as_view(), name='profile'),
    path('accounts/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('accounts/users/<int:user_id>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('accounts/drivers/', DriverListView.as_view(), name='driver-list'),
    path('accounts/driver/location/', DriverLocationView.as_view(), name='driver-location'),
]
