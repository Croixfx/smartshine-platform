from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['payer', 'status', 'transaction_id', 'momo_reference', 'paid_at', 'created_at']
