import uuid
from django.db import models
from django.conf import settings


def generate_booking_ref():
    return uuid.uuid4().hex[:10].upper()


class Booking(models.Model):
    # Status choices — strict forward-only progression
    PENDING          = 'pending'
    CONFIRMED        = 'confirmed'
    # Pickup-only pre-wash statuses
    DRIVER_ASSIGNED  = 'driver_assigned'
    EN_ROUTE_PICKUP  = 'en_route_pickup'
    AT_CUSTOMER      = 'at_customer'
    EN_ROUTE_BRANCH  = 'en_route_branch'
    # Wash statuses
    RECEIVED         = 'received'
    WASHING          = 'washing'
    RINSING          = 'rinsing'
    DRYING           = 'drying'
    DONE             = 'done'
    # Post-wash completion statuses
    OUT_FOR_DELIVERY = 'out_for_delivery'
    DELIVERED        = 'delivered'
    COLLECTED        = 'collected'
    CANCELLED        = 'cancelled'

    STATUS_CHOICES = [
        (PENDING,          'Pending'),
        (CONFIRMED,        'Confirmed'),
        (DRIVER_ASSIGNED,  'Driver Assigned'),
        (EN_ROUTE_PICKUP,  'En Route to Customer'),
        (AT_CUSTOMER,      'At Customer Location'),
        (EN_ROUTE_BRANCH,  'En Route to Branch'),
        (RECEIVED,         'Received'),
        (WASHING,          'Washing'),
        (RINSING,          'Rinsing'),
        (DRYING,           'Drying'),
        (DONE,             'Done'),
        (OUT_FOR_DELIVERY, 'Out for Delivery'),
        (DELIVERED,        'Delivered'),
        (COLLECTED,        'Collected'),
        (CANCELLED,        'Cancelled'),
    ]

    # Payment status
    UNPAID       = 'unpaid'
    DEPOSIT_PAID = 'deposit_paid'
    FULLY_PAID   = 'fully_paid'
    REFUNDED     = 'refunded'
    PAYMENT_STATUS_CHOICES = [
        (UNPAID,       'Unpaid'),
        (DEPOSIT_PAID, 'Deposit Paid'),
        (FULLY_PAID,   'Fully Paid'),
        (REFUNDED,     'Refunded'),
    ]

    # Service type
    STATION = 'station'
    PICKUP  = 'pickup'
    SERVICE_TYPE_CHOICES = [
        (STATION, 'Station Drop-off'),
        (PICKUP,  'Pickup & Delivery'),
    ]

    # Return method (for pickup bookings after wash is done)
    SELF_PICKUP = 'self_pickup'
    DELIVERY    = 'delivery'
    RETURN_METHOD_CHOICES = [
        (SELF_PICKUP, 'Self Pickup'),
        (DELIVERY,    'Delivery'),
    ]

    booking_ref = models.CharField(max_length=10, unique=True, default=generate_booking_ref)

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='bookings', limit_choices_to={'role': 'customer'},
    )
    branch  = models.ForeignKey('branches.Branch', on_delete=models.CASCADE, related_name='bookings')
    service = models.ForeignKey('branches.ServiceType', on_delete=models.CASCADE, related_name='bookings')
    vehicle = models.ForeignKey('vehicles.Vehicle', on_delete=models.CASCADE, related_name='bookings')

    date      = models.DateField()
    time_slot = models.TimeField()

    service_type  = models.CharField(max_length=10, choices=SERVICE_TYPE_CHOICES, default=STATION)
    return_method = models.CharField(max_length=15, choices=RETURN_METHOD_CHOICES, null=True, blank=True)

    status         = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)
    payment_status = models.CharField(max_length=15, choices=PAYMENT_STATUS_CHOICES, default=UNPAID)

    status_updated_at  = models.DateTimeField(null=True, blank=True)
    driver_assigned_at = models.DateTimeField(null=True, blank=True)

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
    pickup_address   = models.TextField(null=True, blank=True)
    pickup_latitude  = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    pickup_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    notes      = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Booking {self.booking_ref} — {self.customer} on {self.date} ({self.status})'


class PlateCapture(models.Model):
    ENTRY = 'entry'
    EXIT  = 'exit'
    CAPTURE_TYPE_CHOICES = [
        (ENTRY, 'Entry'),
        (EXIT,  'Exit'),
    ]

    booking      = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='plate_captures')
    plate_image  = models.ImageField(upload_to='plates/', null=True, blank=True)
    plate_text   = models.CharField(max_length=20, blank=True)
    capture_type = models.CharField(max_length=5, choices=CAPTURE_TYPE_CHOICES)
    captured_by  = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='plate_captures',
    )
    captured_at  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.capture_type} capture for Booking {self.booking.booking_ref}'
