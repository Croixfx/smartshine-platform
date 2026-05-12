from django.db import models


class Branch(models.Model):
    name = models.CharField(max_length=200)
    address = models.TextField()
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    capacity = models.PositiveIntegerField(default=10)
    is_active = models.BooleanField(default=True)
    opening_time = models.TimeField()
    closing_time = models.TimeField()
    image = models.ImageField(upload_to='branches/', blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class ServiceType(models.Model):
    AUTOMATIC = 'automatic'
    TRADITIONAL = 'traditional'
    MOBILE = 'mobile'
    CATEGORY_CHOICES = [
        (AUTOMATIC, 'Automatic'),
        (TRADITIONAL, 'Traditional'),
        (MOBILE, 'Mobile'),
    ]

    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='service_types')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_minutes = models.PositiveIntegerField(default=30)
    category = models.CharField(max_length=15, choices=CATEGORY_CHOICES)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f'{self.name} ({self.get_category_display()}) — {self.branch.name}'
