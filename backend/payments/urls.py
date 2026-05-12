from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import PaymentViewSet, InitiatePaymentView

router = DefaultRouter()
router.register('', PaymentViewSet, basename='payment')

urlpatterns = [
    path('initiate/', InitiatePaymentView.as_view(), name='payment-initiate'),
] + router.urls
