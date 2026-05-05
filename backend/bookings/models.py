import uuid
from django.db import models
from django.conf import settings


def generate_booking_ref():
    return uuid.uuid4().hex[:10].upper()


class Booking(models.Model):
    # Status
    PENDING = 'pending'
    CONFIRMED = 'confirmed'
    IN_PROGRESS = 'in_progress'
    WASHING = 'washing'
    DONE = 'done'
    CANCELLED = 'cancelled'
    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (CONFIRMED, 'Confirmed'),
        (IN_PROGRESS, 'In Progress'),
        (WASHING, 'Washing'),
        (DONE, 'Done'),
        (CANCELLED, 'Cancelled'),
    ]

    # Payment status
    UNPAID = 'unpaid'
    DEPOSIT_PAID = 'deposit_paid'
    FULLY_PAID = 'fully_paid'
    REFUNDED = 'refunded'
    PAYMENT_STATUS_CHOICES = [
        (UNPAID, 'Unpaid'),
        (DEPOSIT_PAID, 'Deposit Paid'),
        (FULLY_PAID, 'Fully Paid'),
        (REFUNDED, 'Refunded'),
    ]

    booking_ref = models.CharField(max_length=10, unique=True, default=generate_booking_ref)

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='bookings', limit_choices_to={'role': 'customer'}
    )
    branch = models.ForeignKey('branches.Branch', on_delete=models.CASCADE, related_name='bookings')
    service = models.ForeignKey('branches.ServiceType', on_delete=models.CASCADE, related_name='bookings')
    vehicle = models.ForeignKey('vehicles.Vehicle', on_delete=models.CASCADE, related_name='bookings')

    date = models.DateField()
    time_slot = models.TimeField()

    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default=PENDING)
    payment_status = models.CharField(max_length=15, choices=PAYMENT_STATUS_CHOICES, default=UNPAID)

    assigned_worker = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='assigned_washes',
        limit_choices_to={'role': 'worker'},
    )
    assigned_driver = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='assigned_pickups',
        limit_choices_to={'role': 'driver'},
    )

    pickup_requested = models.BooleanField(default=False)
    pickup_address = models.TextField(null=True, blank=True)
    pickup_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    pickup_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Booking {self.booking_ref} — {self.customer} on {self.date} ({self.status})'
