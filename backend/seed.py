import os
import django
import uuid

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'geotera.settings')
django.setup()

from apps.users.models import User, UserRole
from apps.drivers.models import Driver
from apps.facilities.models import Facility, FacilityType
from apps.trash_loads.models import TrashLoad, WasteType, VolumeTier, LoadStatus
from apps.rewards.models import Reward, RewardCategory

def seed_data():
    print("[*] Seeding Geotera foundational data...")

    # 1. Seed Users
    user1, _ = User.objects.get_or_create(
        email='alex.eco@geotera.app',
        defaults={
            'full_name': 'Alex Johnson',
            'phone_number': '+6281298765432',
            'role': UserRole.USER,
            'reward_points_balance': 480,
            'carbon_saved_kg': 34.50,
        }
    )

    driver_user, _ = User.objects.get_or_create(
        email='budi.driver@geotera.app',
        defaults={
            'full_name': 'Budi Santoso',
            'phone_number': '+6281123456789',
            'role': UserRole.COLLECTOR_DRIVER,
        }
    )

    # 2. Seed Driver Profile
    driver, _ = Driver.objects.get_or_create(
        user=driver_user,
        defaults={
            'vehicle_type': 'Compactor Truck 2.5T',
            'vehicle_plate_number': 'B 8421 GEO',
            'max_payload_kg': 2500.00,
            'current_capacity_kg': 1950.00,
            'is_online': True,
            'is_on_duty': True,
            'current_latitude': -6.2110,
            'current_longitude': 106.8430,
            'rating': 4.95,
            'total_trips_completed': 142,
        }
    )

    # 3. Seed Facilities
    facility1, _ = Facility.objects.get_or_create(
        name='GreenCycle Materials Recovery Facility',
        defaults={
            'facility_type': FacilityType.RECYCLING_CENTER,
            'address': 'Jl. Industri Daur Ulang No. 45, Jakarta Selatan',
            'latitude': -6.2395,
            'longitude': 106.8220,
            'contact_phone': '+62215551234',
            'max_daily_capacity_tons': 120.00,
            'accepted_waste_types': ['PLASTIC', 'E_WASTE', 'BULKY'],
            'is_active': True,
        }
    )

    facility2, _ = Facility.objects.get_or_create(
        name='EcoBio Composting Center',
        defaults={
            'facility_type': FacilityType.COMPOSTING_PLANT,
            'address': 'Jl. Taman Organik Asri No. 12, Jakarta',
            'latitude': -6.2480,
            'longitude': 106.8350,
            'contact_phone': '+62215555678',
            'max_daily_capacity_tons': 60.00,
            'accepted_waste_types': ['ORGANIC'],
            'is_active': True,
        }
    )

    # 4. Seed Trash Load for Live Tracking Demo
    load, _ = TrashLoad.objects.get_or_create(
        tracking_number='GEO-20261027-LIVE1',
        defaults={
            'user': user1,
            'driver': driver,
            'destination_facility': facility1,
            'waste_type': WasteType.PLASTIC,
            'volume_tier': VolumeTier.MEDIUM,
            'estimated_weight_kg': 25.00,
            'status': LoadStatus.IN_TRANSIT,
            'pickup_address': 'Jl. Senopati No. 18, Kebayoran Baru, Jakarta Selatan',
            'pickup_latitude': -6.2088,
            'pickup_longitude': 106.8456,
            'pickup_notes': 'Two blue sorted recycling bags by the front porch.',
            'is_immediate_dispatch': True,
            'points_awarded': 500,
            'carbon_offset_kg': 37.50,
        }
    )

    # 5. Seed Rewards Catalog
    rewards_data = [
        {
            'title': 'IDR 50,000 Organic Mart Voucher',
            'description': 'Redeemable at all participating local organic grocers.',
            'category': RewardCategory.LOCAL_VOUCHER,
            'points_required': 250,
            'stock_count': 40,
        },
        {
            'title': '1 Metric Ton Carbon Offset Certificate',
            'description': 'Verified gold-standard carbon reduction certificate.',
            'category': RewardCategory.CARBON_CREDIT,
            'points_required': 500,
            'stock_count': 100,
        },
        {
            'title': 'Plant 5 Mangrove Trees (North Coast)',
            'description': 'Supports coastal restoration and blue carbon sequestration.',
            'category': RewardCategory.TREE_PLANTING,
            'points_required': 300,
            'stock_count': 75,
        },
    ]

    for item in rewards_data:
        Reward.objects.get_or_create(title=item['title'], defaults=item)

    print("[+] Seed complete! Users, Driver, Facilities, Active Live Load, and Rewards created successfully.")

if __name__ == '__main__':
    seed_data()
