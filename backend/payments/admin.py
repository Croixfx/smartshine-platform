from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'booking', 'amount', 'payment_type', 'method', 'status', 'transaction_id', 'created_at']
    list_filter = ['status', 'method', 'payment_type']
    search_fields = ['transaction_id', 'booking__id', 'booking__customer__phone']
    readonly_fields = ['created_at']
