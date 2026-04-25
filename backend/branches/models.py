from django.db import models


class Branch(models.Model):
    name = models.CharField(max_length=200)
    address = models.TextField()
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    phone = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class ServiceType(models.Model):
    EXTERIOR = 'exterior'
    INTERIOR = 'interior'
    FULL = 'full'
    CATEGORY_CHOICES = [
        (EXTERIOR, 'Exterior'),
        (INTERIOR, 'Interior'),
        (FULL, 'Full Detail'),
    ]

    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='service_types')
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_minutes = models.PositiveIntegerField(default=30)
    description = models.TextField(blank=True)

    def __str__(self):
        return f'{self.name} — {self.branch.name}'
