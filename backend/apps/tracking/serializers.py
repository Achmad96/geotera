from rest_framework import serializers
from .models import TrackingEvent

class TrackingEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrackingEvent
        fields = '__all__'

class DriverTelemetryPingSerializer(serializers.Serializer):
    trash_load_id = serializers.UUIDField()
    driver_id = serializers.UUIDField()
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()
    status = serializers.CharField(required=False)
    speed_kmh = serializers.FloatField(required=False, default=0.0)
    heading_degrees = serializers.FloatField(required=False, default=0.0)
    battery_percentage = serializers.IntegerField(required=False, default=95)
    metadata = serializers.DictField(required=False, default=dict)

