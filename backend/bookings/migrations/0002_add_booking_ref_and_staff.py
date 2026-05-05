import uuid

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


def populate_booking_refs(apps, schema_editor):
    Booking = apps.get_model('bookings', 'Booking')
    for booking in Booking.objects.filter(booking_ref__isnull=True):
        booking.booking_ref = uuid.uuid4().hex[:10].upper()
        booking.save(update_fields=['booking_ref'])


class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # Step 1: Add booking_ref as nullable, no unique constraint yet
        migrations.AddField(
            model_name='booking',
            name='booking_ref',
            field=models.CharField(max_length=10, null=True, blank=True),
        ),
        # Step 2: Add assigned_worker and assigned_driver
        migrations.AddField(
            model_name='booking',
            name='assigned_worker',
            field=models.ForeignKey(
                blank=True, null=True,
                limit_choices_to={'role': 'worker'},
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='assigned_washes',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name='booking',
            name='assigned_driver',
            field=models.ForeignKey(
                blank=True, null=True,
                limit_choices_to={'role': 'driver'},
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='assigned_pickups',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        # Step 3: Populate existing rows with unique booking refs
        migrations.RunPython(populate_booking_refs, migrations.RunPython.noop),
        # Step 4: Make booking_ref non-nullable with default, then add unique constraint
        migrations.AlterField(
            model_name='booking',
            name='booking_ref',
            field=models.CharField(
                default=None,
                max_length=10,
                unique=True,
            ),
            preserve_default=False,
        ),
        # Step 5: Update ordering
        migrations.AlterModelOptions(
            name='booking',
            options={'ordering': ['-created_at']},
        ),
    ]
