import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0003_new_statuses_status_updated_at'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='booking',
            name='service_type',
            field=models.CharField(
                choices=[('station', 'Station Drop-off'), ('pickup', 'Pickup & Delivery')],
                default='station',
                max_length=10,
            ),
        ),
        migrations.AddField(
            model_name='booking',
            name='return_method',
            field=models.CharField(
                blank=True,
                choices=[('self_pickup', 'Self Pickup'), ('delivery', 'Delivery')],
                max_length=15,
                null=True,
            ),
        ),
        migrations.AddField(
            model_name='booking',
            name='driver_assigned_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='booking',
            name='status',
            field=models.CharField(
                choices=[
                    ('pending', 'Pending'),
                    ('confirmed', 'Confirmed'),
                    ('driver_assigned', 'Driver Assigned'),
                    ('en_route_pickup', 'En Route to Customer'),
                    ('at_customer', 'At Customer Location'),
                    ('en_route_branch', 'En Route to Branch'),
                    ('received', 'Received'),
                    ('washing', 'Washing'),
                    ('rinsing', 'Rinsing'),
                    ('drying', 'Drying'),
                    ('done', 'Done'),
                    ('out_for_delivery', 'Out for Delivery'),
                    ('delivered', 'Delivered'),
                    ('collected', 'Collected'),
                    ('cancelled', 'Cancelled'),
                ],
                default='pending',
                max_length=20,
            ),
        ),
        migrations.CreateModel(
            name='PlateCapture',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('plate_image', models.ImageField(blank=True, null=True, upload_to='plates/')),
                ('plate_text', models.CharField(blank=True, max_length=20)),
                ('capture_type', models.CharField(
                    choices=[('entry', 'Entry'), ('exit', 'Exit')],
                    max_length=5,
                )),
                ('captured_at', models.DateTimeField(auto_now_add=True)),
                ('booking', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='plate_captures',
                    to='bookings.booking',
                )),
                ('captured_by', models.ForeignKey(
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='plate_captures',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
        ),
    ]
