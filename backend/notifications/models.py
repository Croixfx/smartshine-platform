from django.db import models


class SMSLog(models.Model):
    SENT = 'sent'
    FAILED = 'failed'
    PENDING = 'pending'
    STATUS_CHOICES = [
        (SENT, 'Sent'),
        (FAILED, 'Failed'),
        (PENDING, 'Pending'),
    ]

    recipient_phone = models.CharField(max_length=20)
    message = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=PENDING)
    sent_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f'SMS → {self.recipient_phone} [{self.status}]'
