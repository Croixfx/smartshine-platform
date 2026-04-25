from django.db import models
from django.conf import settings


class Vehicle(models.Model):
    SEDAN = 'sedan'
    SUV = 'suv'
    TRUCK = 'truck'
    VAN = 'van'
    MOTORCYCLE = 'motorcycle'
    TYPE_CHOICES = [
        (SEDAN, 'Sedan'),
        (SUV, 'SUV'),
        (TRUCK, 'Truck'),
        (VAN, 'Van'),
        (MOTORCYCLE, 'Motorcycle'),
    ]

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='vehicles'
    )
    plate_number = models.CharField(max_length=20, unique=True)
    vehicle_type = models.CharField(max_length=15, choices=TYPE_CHOICES, default=SEDAN)
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    color = models.CharField(max_length=50, blank=True)
    plate_image = models.ImageField(upload_to='plates/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.plate_number} — {self.make} {self.model}'
