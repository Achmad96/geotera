import uuid
from django.db import models
from apps.trash_loads.models import TrashLoad, LoadStatus
from apps.drivers.models import Driver

class TelemetryEventType(models.TextChoices):
    HEARTBEAT_PING = 'HEARTBEAT_PING', 'Periodic GPS Heartbeat'
    ROUTE_DEVIATION = 'ROUTE_DEVIATION', 'Route Deviation Alert'
    STATUS_TRANSITION = 'STATUS_TRANSITION', 'Status Transition Event'
    CHECKPOINT_REACHED = 'CHECKPOINT_REACHED', 'Checkpoint Reached'
    FACILITY_ARRIVAL = 'FACILITY_ARRIVAL', 'Arrived at Facility'

class TrackingEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trash_load = models.ForeignKey(TrashLoad, on_delete=models.CASCADE, related_name='tracking_events')
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE, related_name='telemetry_logs')
    event_type = models.CharField(
        max_length=40,
        choices=TelemetryEventType.choices,
        default=TelemetryEventType.HEARTBEAT_PING
    )
    status = models.CharField(max_length=30, choices=LoadStatus.choices)
    
    latitude = models.FloatField()
    longitude = models.FloatField()
    speed_kmh = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    heading_degrees = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    battery_percentage = models.SmallIntegerField(blank=True, null=True)
    telemetry_metadata = models.JSONField(default=dict, blank=True)
    
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'tracking_events'
        ordering = ['-recorded_at']
        indexes = [
            models.Index(fields=['trash_load', '-recorded_at']),
            models.Index(fields=['driver', '-recorded_at']),
        ]

    def __str__(self):
        return f"Event {self.event_type} for Load {self.trash_load.tracking_number} ({self.latitude}, {self.longitude})"

