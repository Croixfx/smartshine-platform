from django.db import models


class Payment(models.Model):
    # Payment type
    DEPOSIT = 'deposit'
    BALANCE = 'balance'
    FULL = 'full'
    PAYMENT_TYPE_CHOICES = [
        (DEPOSIT, 'Deposit'),
        (BALANCE, 'Balance'),
        (FULL, 'Full'),
    ]

    # Method
    MOMO = 'momo'
    CASH = 'cash'
    METHOD_CHOICES = [
        (MOMO, 'MTN MoMo'),
        (CASH, 'Cash'),
    ]

    # Status
    PENDING = 'pending'
    COMPLETED = 'completed'
    FAILED = 'failed'
    REFUNDED = 'refunded'
    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (COMPLETED, 'Completed'),
        (FAILED, 'Failed'),
        (REFUNDED, 'Refunded'),
    ]

    booking = models.ForeignKey('bookings.Booking', on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_type = models.CharField(max_length=10, choices=PAYMENT_TYPE_CHOICES)
    method = models.CharField(max_length=10, choices=METHOD_CHOICES, default=MOMO)
    transaction_id = models.CharField(max_length=200, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Payment #{self.pk} [{self.payment_type}] — {self.status} ({self.amount})'
