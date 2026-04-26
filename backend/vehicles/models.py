from django.db import models
from django.conf import settings


class Vehicle(models.Model):
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='vehicles', limit_choices_to={'role': 'customer'}
    )
    plate_number = models.CharField(max_length=20, unique=True)
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    color = models.CharField(max_length=50, blank=True)
    is_primary = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.plate_number} — {self.make} {self.model}'
