from rest_framework import serializers
from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    service_name = serializers.CharField(source='service.name', read_only=True)
    service_price = serializers.DecimalField(source='service.price', max_digits=10, decimal_places=2, read_only=True)
    vehicle_plate = serializers.CharField(source='vehicle.plate_number', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    assigned_worker_name = serializers.CharField(source='assigned_worker.full_name', read_only=True, default=None)
    assigned_worker_phone = serializers.CharField(source='assigned_worker.phone', read_only=True, default=None)
    assigned_driver_name = serializers.CharField(source='assigned_driver.full_name', read_only=True, default=None)
    assigned_driver_phone = serializers.CharField(source='assigned_driver.phone', read_only=True, default=None)

    class Meta:
        model = Booking
        fields = [
            'id', 'booking_ref',
            'customer', 'customer_phone', 'customer_name',
            'branch', 'branch_name',
            'service', 'service_name', 'service_price',
            'vehicle', 'vehicle_plate',
            'date', 'time_slot',
            'status', 'status_display',
            'payment_status', 'payment_status_display',
            'assigned_worker', 'assigned_worker_name', 'assigned_worker_phone',
            'assigned_driver', 'assigned_driver_name', 'assigned_driver_phone',
            'pickup_requested', 'pickup_address', 'pickup_latitude', 'pickup_longitude',
            'notes', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'booking_ref', 'customer', 'customer_phone', 'customer_name',
            'branch_name', 'service_name', 'service_price', 'vehicle_plate',
            'status', 'status_display', 'payment_status', 'payment_status_display',
            'assigned_worker_name', 'assigned_worker_phone',
            'assigned_driver_name', 'assigned_driver_phone',
            'created_at', 'updated_at',
        ]


class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = [
            'branch', 'service', 'vehicle',
            'date', 'time_slot',
            'pickup_requested', 'pickup_address', 'pickup_latitude', 'pickup_longitude',
            'notes',
        ]

    def validate(self, attrs):
        branch = attrs.get('branch')
        date = attrs.get('date')
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
        validated_data['status'] = Booking.PENDING
        return super().create(validated_data)
