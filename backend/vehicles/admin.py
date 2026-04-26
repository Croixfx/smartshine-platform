from django.contrib import admin
from .models import Vehicle


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ['plate_number', 'customer', 'make', 'model', 'color', 'is_primary']
    list_filter = ['is_primary', 'make']
    search_fields = ['plate_number', 'make', 'model', 'customer__phone']
