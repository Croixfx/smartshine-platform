import datetime
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from branches.models import Branch, ServiceType
from vehicles.models import Vehicle
from bookings.models import Booking

User = get_user_model()

BRANCHES = [
    {
        'name': 'SmartShine Kicukiro',
        'address': 'KG 15 Ave, Kicukiro',
        'latitude': -1.975,
        'longitude': 30.07,
        'capacity': 10,
        'opening_time': '07:00',
        'closing_time': '20:00',
    },
    {
        'name': 'SmartShine Kimironko',
        'address': 'KG 549 St, Kimironko',
        'latitude': -1.94,
        'longitude': 30.10,
        'capacity': 8,
        'opening_time': '07:00',
        'closing_time': '20:00',
    },
    {
        'name': 'SmartShine Nyamirambo',
        'address': 'KN 3 Rd, Nyamirambo',
        'latitude': -1.98,
        'longitude': 30.04,
        'capacity': 12,
        'opening_time': '06:30',
        'closing_time': '21:00',
    },
]

SERVICES = [
    {'name': 'Basic Automatic',    'category': 'automatic',    'price': 5000,  'duration_minutes': 7},
    {'name': 'Standard Automatic', 'category': 'automatic',    'price': 8000,  'duration_minutes': 12},
    {'name': 'Premium Automatic',  'category': 'automatic',    'price': 12000, 'duration_minutes': 15},
    {'name': 'Basic Hand Wash',    'category': 'traditional',  'price': 3000,  'duration_minutes': 20},
    {'name': 'Full Hand Wash',     'category': 'traditional',  'price': 5000,  'duration_minutes': 30},
    {'name': 'Premium Detailing',  'category': 'traditional',  'price': 15000, 'duration_minutes': 60},
    {'name': 'Engine Bay Cleaning','category': 'traditional',  'price': 5000,  'duration_minutes': 25},
    {'name': 'Mobile Basic',       'category': 'mobile',       'price': 5000,  'duration_minutes': 25},
    {'name': 'Mobile Full',        'category': 'mobile',       'price': 8000,  'duration_minutes': 40},
    {'name': 'Mobile Premium',     'category': 'mobile',       'price': 20000, 'duration_minutes': 60},
]

USERS = [
    {'phone': '+250781111111', 'full_name': 'Test Customer', 'email': 'customer@test.com', 'password': 'test1234', 'role': 'customer'},
    {'phone': '+250782222222', 'full_name': 'Test Worker',   'email': 'worker@test.com',   'password': 'test1234', 'role': 'worker'},
    {'phone': '+250783333333', 'full_name': 'Test Driver',   'email': 'driver@test.com',   'password': 'test1234', 'role': 'driver'},
    {'phone': '+250784444444', 'full_name': 'Test Admin',    'email': 'admin@test.com',    'password': 'test1234', 'role': 'admin'},
]

VEHICLES = [
    {'plate_number': 'RAC 123 A', 'make': 'Toyota', 'model': 'Corolla', 'color': 'White', 'is_primary': True},
    {'plate_number': 'RAB 456 B', 'make': 'Honda',  'model': 'CR-V',    'color': 'Silver', 'is_primary': False},
]


class Command(BaseCommand):
    help = 'Seed the database with test branches, services, users, vehicles, and bookings'

    def handle(self, *args, **options):
        created_summary = []

        # --- Branches ---
        branches = []
        for b in BRANCHES:
            obj, created = Branch.objects.get_or_create(
                name=b['name'],
                defaults={
                    'address': b['address'],
                    'latitude': b['latitude'],
                    'longitude': b['longitude'],
                    'capacity': b['capacity'],
                    'opening_time': b['opening_time'],
                    'closing_time': b['closing_time'],
                },
            )
            branches.append(obj)
            self.stdout.write(f"  {'Created' if created else 'Skipped'} branch: {obj.name}")

        # --- Services (for every branch) ---
        for branch in branches:
            for s in SERVICES:
                _, created = ServiceType.objects.get_or_create(
                    branch=branch,
                    name=s['name'],
                    defaults={
                        'category': s['category'],
                        'price': s['price'],
                        'duration_minutes': s['duration_minutes'],
                    },
                )
                self.stdout.write(f"  {'Created' if created else 'Skipped'} service: {s['name']} @ {branch.name}")

        # --- Users ---
        users = {}
        for u in USERS:
            user, created = User.objects.get_or_create(
                phone=u['phone'],
                defaults={
                    'full_name': u['full_name'],
                    'email': u['email'],
                    'role': u['role'],
                    'is_verified': True,
                },
            )
            if created:
                user.set_password(u['password'])
                if u['role'] == 'admin':
                    user.is_staff = True
                    user.is_superuser = True
                user.save()
            users[u['role']] = user
            self.stdout.write(f"  {'Created' if created else 'Skipped'} user: {u['full_name']} ({u['role']})")

        # --- Vehicles (owned by the customer) ---
        customer = users.get('customer')
        vehicles = []
        if customer:
            for v in VEHICLES:
                obj, created = Vehicle.objects.get_or_create(
                    plate_number=v['plate_number'],
                    defaults={
                        'customer': customer,
                        'make': v['make'],
                        'model': v['model'],
                        'color': v['color'],
                        'is_primary': v['is_primary'],
                    },
                )
                vehicles.append(obj)
                self.stdout.write(f"  {'Created' if created else 'Skipped'} vehicle: {v['plate_number']}")

        # --- Bookings ---
        if customer and branches and vehicles:
            branch = branches[0]
            service = ServiceType.objects.filter(branch=branch).first()
            vehicle = vehicles[0]
            today = datetime.date.today()

            booking_specs = [
                {'status': 'pending',     'date': today + datetime.timedelta(days=1), 'time': '08:00'},
                {'status': 'confirmed',   'date': today + datetime.timedelta(days=1), 'time': '09:00'},
                {'status': 'in_progress', 'date': today,                              'time': '10:00'},
                {'status': 'done',        'date': today - datetime.timedelta(days=1), 'time': '11:00'},
                {'status': 'cancelled',   'date': today - datetime.timedelta(days=2), 'time': '12:00'},
            ]

            for spec in booking_specs:
                exists = Booking.objects.filter(
                    customer=customer,
                    branch=branch,
                    date=spec['date'],
                    time_slot=spec['time'],
                ).exists()
                if not exists:
                    Booking.objects.create(
                        customer=customer,
                        branch=branch,
                        service=service,
                        vehicle=vehicle,
                        date=spec['date'],
                        time_slot=spec['time'],
                        status=spec['status'],
                    )
                    self.stdout.write(f"  Created booking: {spec['status']} on {spec['date']} @ {spec['time']}")
                else:
                    self.stdout.write(f"  Skipped booking: {spec['status']} on {spec['date']} @ {spec['time']}")

        # --- Summary ---
        self.stdout.write('\n' + '=' * 50)
        self.stdout.write(self.style.SUCCESS('Seed data complete! Test accounts:'))
        self.stdout.write('-' * 50)
        for u in USERS:
            self.stdout.write(f"  {u['role'].upper():10s}  phone: {u['phone']}  password: {u['password']}")
        self.stdout.write('=' * 50)
