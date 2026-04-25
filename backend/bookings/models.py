from django.db import models
from django.conf import settings


class Booking(models.Model):
    PENDING = 'pending'
    CONFIRMED = 'confirmed'
    IN_PROGRESS = 'in_progress'
    COMPLETED = 'completed'
    CANCELLED = 'cancelled'
    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (CONFIRMED, 'Confirmed'),
        (IN_PROGRESS, 'In Progress'),
        (COMPLETED, 'Completed'),
        (CANCELLED, 'Cancelled'),
    ]

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='bookings', limit_choices_to={'role': 'customer'}
    )
    branch = models.ForeignKey('branches.Branch', on_delete=models.CASCADE, related_name='bookings')
    service_type = models.ForeignKey('branches.ServiceType', on_delete=models.CASCADE)
    vehicle = models.ForeignKey('vehicles.Vehicle', on_delete=models.CASCADE)
    assigned_worker = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='assigned_bookings', limit_choices_to={'role': 'worker'}
    )
    scheduled_at = models.DateTimeField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default=PENDING)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-scheduled_at']

    def __str__(self):
        return f'Booking #{self.pk} — {self.customer} ({self.status})'
