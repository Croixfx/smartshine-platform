from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    booking_id = serializers.IntegerField(source='booking.id', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_type_display = serializers.CharField(source='get_payment_type_display', read_only=True)
    method_display = serializers.CharField(source='get_method_display', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'booking', 'booking_id',
            'amount', 'payment_type', 'payment_type_display',
            'method', 'method_display',
            'transaction_id', 'status', 'status_display',
            'created_at',
        ]
        read_only_fields = ['id', 'status', 'transaction_id', 'created_at']


class InitiatePaymentSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    payment_type = serializers.ChoiceField(choices=Payment.PAYMENT_TYPE_CHOICES)
    method = serializers.ChoiceField(choices=Payment.METHOD_CHOICES, default=Payment.MOMO)
