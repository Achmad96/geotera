from django.test import TestCase
from rest_framework.test import APIClient
from apps.users.models import User, UserRole
from apps.drivers.models import Driver
from apps.facilities.models import Facility, FacilityType
from apps.trash_loads.models import TrashLoad, WasteType, VolumeTier, LoadStatus
from apps.tracking.models import TrackingEvent, TelemetryEventType

class GeoteraCoreTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create(
            email='test.citizen@geotera.app',
            full_name='Citizen Tester',
            role=UserRole.USER,
            reward_points_balance=100
        )
        self.driver_user = User.objects.create(
            email='test.driver@geotera.app',
            full_name='Driver Tester',
            role=UserRole.COLLECTOR_DRIVER
        )
        self.driver = Driver.objects.create(
            user=self.driver_user,
            vehicle_plate_number='B 1234 TEST',
            max_payload_kg=2000.0,
            current_capacity_kg=2000.0,
            is_online=True,
            is_on_duty=True
        )
        self.facility = Facility.objects.create(
            name='Test Recycling Depot',
            facility_type=FacilityType.RECYCLING_CENTER,
            address='123 Green Way',
            latitude=-6.2395,
            longitude=106.8220,
            accepted_waste_types=['PLASTIC']
        )

    def test_health_check(self):
        res = self.client.get('/api/v1/health/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['status'], 'healthy')

    def test_booking_creation_and_auto_assign(self):
        res = self.client.post('/api/v1/trash-loads/', {
            'user': str(self.user.id),
            'waste_type': WasteType.PLASTIC,
            'volume_tier': VolumeTier.MEDIUM,
            'estimated_weight_kg': 30.0,
            'pickup_address': 'Jl. Senopati No. 10',
            'pickup_latitude': -6.2088,
            'pickup_longitude': 106.8456,
            'is_immediate_dispatch': True
        }, format='json')
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.data['status'], LoadStatus.DRIVER_ASSIGNED)
        self.assertEqual(str(res.data['driver']), str(self.driver.id))

    def test_telemetry_ping(self):
        load = TrashLoad.objects.create(
            user=self.user,
            driver=self.driver,
            destination_facility=self.facility,
            waste_type=WasteType.PLASTIC,
            volume_tier=VolumeTier.SMALL,
            estimated_weight_kg=15.0,
            pickup_address='Jl. Test',
            pickup_latitude=-6.2100,
            pickup_longitude=106.8400
        )
        res = self.client.post('/api/v1/tracking/ping/', {
            'trash_load_id': str(load.id),
            'driver_id': str(self.driver.id),
            'latitude': -6.2150,
            'longitude': 106.8350,
            'speed_kmh': 35.0,
            'heading_degrees': 210.0
        }, format='json')
        self.assertEqual(res.status_code, 201)
        self.assertEqual(TrackingEvent.objects.count(), 1)

    def test_status_update_and_rewards_trigger(self):
        load = TrashLoad.objects.create(
            user=self.user,
            driver=self.driver,
            destination_facility=self.facility,
            waste_type=WasteType.PLASTIC,
            volume_tier=VolumeTier.SMALL,
            estimated_weight_kg=20.0,
            pickup_address='Jl. Test',
            pickup_latitude=-6.2100,
            pickup_longitude=106.8400,
            status=LoadStatus.IN_TRANSIT
        )
        res = self.client.post(f'/api/v1/trash-loads/{load.id}/update-status/', {
            'status': LoadStatus.DELIVERED_PROCESSED,
            'actual_weight_kg': 20.0,
            'proof_image_url': 'https://example.com/proof.jpg'
        }, format='json')
        self.assertEqual(res.status_code, 200)
        
        # Verify points awarded to user
        self.user.refresh_from_db()
        # Plastic awards 20 pts/kg * 20kg = 400 pts + initial 100 = 500
        self.assertEqual(self.user.reward_points_balance, 500)
        self.assertEqual(float(self.user.carbon_saved_kg), 30.00)
