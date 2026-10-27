import uuid
from django.db import models
from apps.users.models import User

class Driver(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='driver_profile')
    vehicle_type = models.CharField(max_length=80, default='Flatbed Eco-Truck')
    vehicle_plate_number = models.CharField(max_length=30, unique=True)
    
    # Capacity Management
    max_payload_kg = models.DecimalField(max_digits=10, decimal_places=2, default=1500.00)
    current_capacity_kg = models.DecimalField(max_digits=10, decimal_places=2, default=1500.00)
    
    # Live Status & Telemetry Toggle
    is_online = models.BooleanField(default=False)
    is_on_duty = models.BooleanField(default=False)
    current_latitude = models.FloatField(blank=True, null=True)
    current_longitude = models.FloatField(blank=True, null=True)
    
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=5.00)
    total_trips_completed = models.PositiveIntegerField(default=0)
    last_ping_at = models.DateTimeField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'drivers'
        ordering = ['-created_at']

    def __str__(self):
        return f"Driver {self.user.full_name} ({self.vehicle_plate_number}) - Remaining: {self.current_capacity_kg}kg"

