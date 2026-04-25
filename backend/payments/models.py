from django.db import models
from django.conf import settings


class Payment(models.Model):
    PENDING = 'pending'
    SUCCESS = 'success'
    FAILED = 'failed'
    REVERSED = 'reversed'
    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (SUCCESS, 'Success'),
        (FAILED, 'Failed'),
        (REVERSED, 'Reversed'),
    ]

    MOMO = 'momo'
    CASH = 'cash'
    METHOD_CHOICES = [
        (MOMO, 'MTN MoMo'),
        (CASH, 'Cash'),
    ]

    booking = models.OneToOneField('bookings.Booking', on_delete=models.CASCADE, related_name='payment')
    payer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=10, choices=METHOD_CHOICES, default=MOMO)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=PENDING)
    transaction_id = models.CharField(max_length=200, blank=True)
    momo_reference = models.CharField(max_length=200, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Payment #{self.pk} — {self.status} ({self.amount})'
