from rest_framework import serializers
from .models import Booking, PlateCapture


class PlateCaptureSerializer(serializers.ModelSerializer):
    captured_by_name = serializers.CharField(source='captured_by.full_name', read_only=True, default=None)

    class Meta:
        model = PlateCapture
        fields = ['id', 'booking', 'plate_text', 'plate_image', 'capture_type', 'captured_by', 'captured_by_name', 'captured_at']
        read_only_fields = ['id', 'booking', 'captured_by', 'captured_by_name', 'captured_at']


class BookingSerializer(serializers.ModelSerializer):
    customer_phone  = serializers.CharField(source='customer.phone',     read_only=True)
    customer_name   = serializers.CharField(source='customer.full_name', read_only=True)
    customer_email  = serializers.EmailField(source='customer.email',    read_only=True)

    branch_name    = serializers.CharField(source='branch.name',    read_only=True)
    branch_address = serializers.CharField(source='branch.address', read_only=True)

    service_name             = serializers.CharField(source='service.name',             read_only=True)
    service_price            = serializers.DecimalField(source='service.price', max_digits=10, decimal_places=2, read_only=True)
    service_duration_minutes = serializers.IntegerField(source='service.duration_minutes', read_only=True)

    vehicle_plate = serializers.CharField(source='vehicle.plate_number', read_only=True)
    vehicle_make  = serializers.CharField(source='vehicle.make',         read_only=True)
    vehicle_model = serializers.CharField(source='vehicle.model',        read_only=True)
    vehicle_color = serializers.CharField(source='vehicle.color',        read_only=True)

    status_display         = serializers.CharField(source='get_status_display',         read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    service_type_display   = serializers.CharField(source='get_service_type_display',   read_only=True)

    assigned_worker_name  = serializers.CharField(source='assigned_worker.full_name', read_only=True, default=None)
    assigned_worker_phone = serializers.CharField(source='assigned_worker.phone',     read_only=True, default=None)
    assigned_driver_name  = serializers.CharField(source='assigned_driver.full_name', read_only=True, default=None)
    assigned_driver_phone = serializers.CharField(source='assigned_driver.phone',     read_only=True, default=None)

    plate_captures = PlateCaptureSerializer(many=True, read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'booking_ref',
            'customer', 'customer_phone', 'customer_name', 'customer_email',
            'branch', 'branch_name', 'branch_address',
            'service', 'service_name', 'service_price', 'service_duration_minutes',
            'vehicle', 'vehicle_plate', 'vehicle_make', 'vehicle_model', 'vehicle_color',
            'date', 'time_slot',
            'service_type', 'service_type_display', 'return_method',
            'status', 'status_display', 'status_updated_at',
            'payment_status', 'payment_status_display',
            'assigned_worker', 'assigned_worker_name', 'assigned_worker_phone',
            'assigned_driver', 'assigned_driver_name', 'assigned_driver_phone',
            'driver_assigned_at',
            'pickup_requested', 'pickup_address', 'pickup_latitude', 'pickup_longitude',
            'plate_captures',
            'notes', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'booking_ref',
            'customer', 'customer_phone', 'customer_name', 'customer_email',
            'branch_name', 'branch_address',
            'service_name', 'service_price', 'service_duration_minutes',
            'vehicle_plate', 'vehicle_make', 'vehicle_model', 'vehicle_color',
            'status', 'status_display', 'status_updated_at',
            'payment_status', 'payment_status_display',
            'service_type_display',
            'assigned_worker_name', 'assigned_worker_phone',
            'assigned_driver_name', 'assigned_driver_phone',
            'driver_assigned_at',
            'plate_captures',
            'created_at', 'updated_at',
        ]


class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = [
            'branch', 'service', 'vehicle',
            'date', 'time_slot',
            'service_type',
            'pickup_requested', 'pickup_address', 'pickup_latitude', 'pickup_longitude',
            'notes',
        ]

    def validate(self, attrs):
        branch    = attrs.get('branch')
        date      = attrs.get('date')
        time_slot = attrs.get('time_slot')

        conflict_qs = Booking.objects.filter(
            branch=branch, date=date, time_slot=time_slot,
        ).exclude(status=Booking.CANCELLED)

        if self.instance:
            conflict_qs = conflict_qs.exclude(pk=self.instance.pk)

        if conflict_qs.exists():
            raise serializers.ValidationError(
                {'time_slot': 'This time slot is already booked at this branch.'}
            )
        return attrs

    def create(self, validated_data):
        validated_data['customer'] = self.context['request'].user
        validated_data['status']   = Booking.PENDING
        return super().create(validated_data)
