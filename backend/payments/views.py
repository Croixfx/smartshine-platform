from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from bookings.models import Booking
from .models import Payment
from .serializers import PaymentSerializer, InitiatePaymentSerializer


class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'method', 'payment_type', 'booking']
    ordering_fields = ['created_at', 'amount']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Payment.objects.select_related('booking')
        return Payment.objects.filter(booking__customer=user).select_related('booking')


class InitiatePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = InitiatePaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        booking = get_object_or_404(Booking, pk=data['booking_id'])

        # Only the booking owner or admin can pay
        if booking.customer != request.user and request.user.role != 'admin':
            return Response(
                {'detail': 'You do not have permission to pay for this booking.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        if booking.status == Booking.CANCELLED:
            return Response(
                {'detail': 'Cannot pay for a cancelled booking.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create payment — status=completed (MoMo integration comes later)
        payment = Payment.objects.create(
            booking=booking,
            amount=data['amount'],
            payment_type=data['payment_type'],
            method=data['method'],
            status=Payment.COMPLETED,
        )

        # Update booking payment_status
        total_paid = sum(
            p.amount for p in Payment.objects.filter(booking=booking, status=Payment.COMPLETED)
        )
        service_price = booking.service.price
        if total_paid >= service_price:
            booking.payment_status = Booking.FULLY_PAID
        elif total_paid > 0:
            booking.payment_status = Booking.DEPOSIT_PAID
        booking.save(update_fields=['payment_status', 'updated_at'])

        return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)
