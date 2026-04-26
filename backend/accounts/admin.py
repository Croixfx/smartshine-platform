from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import CustomUser, OTPCode


@admin.register(CustomUser)
class CustomUserAdmin(BaseUserAdmin):
    ordering = ['phone']
    list_display = ['phone', 'full_name', 'email', 'role', 'is_verified', 'is_active', 'is_staff', 'created_at']
    list_filter = ['role', 'is_verified', 'is_active', 'is_staff']
    search_fields = ['phone', 'full_name', 'email']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        (None, {'fields': ('phone', 'password')}),
        ('Personal', {'fields': ('full_name', 'email', 'role', 'is_verified')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
    add_fieldsets = (
        (None, {'classes': ('wide',), 'fields': ('phone', 'full_name', 'email', 'role', 'password1', 'password2')}),
    )


@admin.register(OTPCode)
class OTPCodeAdmin(admin.ModelAdmin):
    list_display = ['phone', 'code', 'is_used', 'created_at', 'is_valid']
    list_filter = ['is_used']
    search_fields = ['phone']
    readonly_fields = ['created_at']

    @admin.display(boolean=True)
    def is_valid(self, obj):
        return obj.is_valid()
