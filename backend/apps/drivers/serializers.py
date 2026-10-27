from rest_framework import serializers
from .models import Driver
from apps.users.serializers import UserSerializer

class DriverSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)

    class Meta:
        model = Driver
        fields = [
            'id', 'user', 'user_details', 'vehicle_type',
            'vehicle_plate_number', 'max_payload_kg', 'current_capacity_kg',
            'is_online', 'is_on_duty', 'current_latitude', 'current_longitude',
            'rating', 'total_trips_completed', 'last_ping_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'rating', 'total_trips_completed', 'last_ping_at', 'created_at', 'updated_at']

class DriverStatusToggleSerializer(serializers.Serializer):
    is_online = serializers.BooleanField(required=False)
    is_on_duty = serializers.BooleanField(required=False)
    latitude = serializers.FloatField(required=False)
    longitude = serializers.FloatField(required=False)

class DriverCapacityUpdateSerializer(serializers.Serializer):
    remaining_capacity_kg = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0)

