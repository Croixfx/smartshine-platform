from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class CustomUserManager(BaseUserManager):
    def create_user(self, phone, password=None, **extra):
        if not phone:
            raise ValueError('Phone number is required')
        user = self.model(phone=phone, **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone, password, **extra):
        extra.setdefault('role', CustomUser.ADMIN)
        extra.setdefault('is_staff', True)
        extra.setdefault('is_superuser', True)
        return self.create_user(phone, password, **extra)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    CUSTOMER = 'customer'
    WORKER = 'worker'
    DRIVER = 'driver'
    ADMIN = 'admin'
    ROLE_CHOICES = [
        (CUSTOMER, 'Customer'),
        (WORKER, 'Worker'),
        (DRIVER, 'Driver'),
        (ADMIN, 'Admin'),
    ]

    phone = models.CharField(max_length=20, unique=True)
    full_name = models.CharField(max_length=150, blank=True)
    email = models.EmailField(blank=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default=CUSTOMER)
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return f'{self.phone} ({self.role})'


class OTPCode(models.Model):
    phone = models.CharField(max_length=20)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def is_valid(self):
        age = timezone.now() - self.created_at
        return not self.is_used and age.total_seconds() < 600  # 10 minutes

    def __str__(self):
        return f'OTP {self.code} → {self.phone} (used={self.is_used})'


class DriverProfile(models.Model):
    user = models.OneToOneField(
        CustomUser, on_delete=models.CASCADE,
        related_name='driver_profile', limit_choices_to={'role': 'driver'},
    )
    license_number       = models.CharField(max_length=50, blank=True)
    vehicle_info         = models.CharField(max_length=200, blank=True)
    is_available         = models.BooleanField(default=True)
    current_latitude     = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    current_longitude    = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    last_location_update = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f'DriverProfile({self.user.phone})'
