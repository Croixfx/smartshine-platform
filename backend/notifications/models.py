from django.db import models
from django.conf import settings


class SMSLog(models.Model):
    SENT = 'sent'
    FAILED = 'failed'
    PENDING = 'pending'
    STATUS_CHOICES = [
        (SENT, 'Sent'),
        (FAILED, 'Failed'),
        (PENDING, 'Pending'),
    ]

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sms_logs'
    )
    phone_number = models.CharField(max_length=20)
    message = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=PENDING)
    provider_message_id = models.CharField(max_length=200, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'SMS to {self.phone_number} — {self.status}'
