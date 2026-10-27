from rest_framework import serializers
from .models import TrashLoad, WasteType, VolumeTier, LoadStatus
from apps.users.serializers import UserSerializer
from apps.drivers.serializers import DriverSerializer
from apps.facilities.serializers import FacilitySerializer

class TrashLoadSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    driver_details = DriverSerializer(source='driver', read_only=True)
    facility_details = FacilitySerializer(source='destination_facility', read_only=True)

    class Meta:
        model = TrashLoad
        fields = '__all__'

class TrashLoadCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrashLoad
        fields = [
            'user', 'waste_type', 'volume_tier', 'estimated_weight_kg',
            'pickup_address', 'pickup_latitude', 'pickup_longitude',
            'pickup_notes', 'is_immediate_dispatch', 'scheduled_pickup_at'
        ]

class TrashLoadStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=LoadStatus.choices)
    driver_id = serializers.UUIDField(required=False)
    facility_id = serializers.UUIDField(required=False)
    actual_weight_kg = serializers.DecimalField(max_digits=8, decimal_places=2, required=False)
    proof_image_url = serializers.URLField(required=False)
    proof_notes = serializers.CharField(required=False, allow_blank=True)

