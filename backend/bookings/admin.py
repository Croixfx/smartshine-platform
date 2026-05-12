from django.contrib import admin
from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
     # Fields displayed in the admin list view
    list_display = [
        'id', 'customer', 'branch', 'service', 'vehicle',
        'date', 'time_slot', 'status', 'payment_status', 'pickup_requested', 'created_at',
    ]
    list_filter = ['status', 'payment_status', 'pickup_requested', 'branch', 'date']
    search_fields = ['customer__phone', 'vehicle__plate_number', 'branch__name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'date'
