from django.contrib import admin
from .models import SMSLog


@admin.register(SMSLog)
class SMSLogAdmin(admin.ModelAdmin):
    list_display = ['recipient_phone', 'status', 'sent_at', 'short_message']
    list_filter = ['status']
    search_fields = ['recipient_phone', 'message']
    readonly_fields = ['sent_at']

    @admin.display(description='Message')
    def short_message(self, obj):
        return obj.message[:60] + '…' if len(obj.message) > 60 else obj.message
