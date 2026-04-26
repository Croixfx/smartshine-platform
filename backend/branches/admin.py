from django.contrib import admin
from .models import Branch, ServiceType


@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ['name', 'address', 'capacity', 'is_active', 'opening_time', 'closing_time', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'address']
    readonly_fields = ['created_at']


@admin.register(ServiceType)
class ServiceTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'branch', 'category', 'price', 'duration_minutes', 'is_available']
    list_filter = ['category', 'is_available', 'branch']
    search_fields = ['name', 'branch__name']
