from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import TrackingEvent, TelemetryEventType
from .serializers import TrackingEventSerializer, DriverTelemetryPingSerializer
from apps.trash_loads.models import TrashLoad
from apps.drivers.models import Driver

class TrackingViewSet(viewsets.ModelViewSet):
    queryset = TrackingEvent.objects.all()
    serializer_class = TrackingEventSerializer

    @action(detail=False, methods=['post'], url_path='ping')
    def record_ping(self, request):
        serializer = DriverTelemetryPingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        load = TrashLoad.objects.filter(id=data['trash_load_id']).first()
        driver = Driver.objects.filter(id=data['driver_id']).first()

        if not load or not driver:
            return Response({"error": "Load or Driver not found"}, status=status.HTTP_404_NOT_FOUND)

        # Update driver location
        driver.current_latitude = data['latitude']
        driver.current_longitude = data['longitude']
        driver.last_ping_at = timezone.now()
        driver.save(update_fields=['current_latitude', 'current_longitude', 'last_ping_at'])

        event = TrackingEvent.objects.create(
            trash_load=load,
            driver=driver,
            event_type=TelemetryEventType.HEARTBEAT_PING,
            status=data.get('status', load.status),
            latitude=data['latitude'],
            longitude=data['longitude'],
            speed_kmh=data.get('speed_kmh', 0.0),
            heading_degrees=data.get('heading_degrees', 0.0),
            battery_percentage=data.get('battery_percentage', 90),
            telemetry_metadata=data.get('metadata', {}),
        )

        return Response(TrackingEventSerializer(event).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='history')
    def trail_history(self, request):
        load_id = request.query_params.get('load_id')
        if not load_id:
            return Response({"error": "load_id query parameter required"}, status=status.HTTP_400_BAD_REQUEST)
        
        events = TrackingEvent.objects.filter(trash_load_id=load_id).order_by('recorded_at')[:200]
        return Response(TrackingEventSerializer(events, many=True).data)

