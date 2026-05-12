import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='DriverProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('license_number', models.CharField(blank=True, max_length=50)),
                ('vehicle_info', models.CharField(blank=True, max_length=200)),
                ('is_available', models.BooleanField(default=True)),
                ('current_latitude', models.DecimalField(
                    blank=True, decimal_places=6, max_digits=9, null=True,
                )),
                ('current_longitude', models.DecimalField(
                    blank=True, decimal_places=6, max_digits=9, null=True,
                )),
                ('last_location_update', models.DateTimeField(blank=True, null=True)),
                ('user', models.OneToOneField(
                    limit_choices_to={'role': 'driver'},
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='driver_profile',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
        ),
    ]
