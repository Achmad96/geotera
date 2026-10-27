import uuid
from django.db import models
from django.utils import timezone
from apps.users.models import User
from apps.drivers.models import Driver
from apps.facilities.models import Facility

class WasteType(models.TextChoices):
    ORGANIC = 'ORGANIC', 'Organic / Compostable'
    PLASTIC = 'PLASTIC', 'Recyclable Plastics & Polymers'
    E_WASTE = 'E_WASTE', 'Electronic & Electrical Waste'
    HAZARDOUS = 'HAZARDOUS', 'Chemical & Hazardous Items'
    MIXED = 'MIXED', 'General Mixed Solid Waste'
    BULKY = 'BULKY', 'Bulky Furniture / Appliances'

class VolumeTier(models.TextChoices):
    SMALL = 'SMALL', 'Small (1-2 bags, ~5-15kg)'
    MEDIUM = 'MEDIUM', 'Medium (Standard bin, ~20-50kg)'
    LARGE = 'LARGE', 'Large (Multiple bins, ~60-150kg)'
    TRUCKLOAD = 'TRUCKLOAD', 'Full Truckload (>150kg)'

class LoadStatus(models.TextChoices):
    SCHEDULED = 'SCHEDULED', 'Scheduled'
    DRIVER_ASSIGNED = 'DRIVER_ASSIGNED', 'Driver Assigned'
    PICKED_UP = 'PICKED_UP', 'Picked Up'
    IN_TRANSIT = 'IN_TRANSIT', 'In Transit'
    DELIVERED_PROCESSED = 'DELIVERED_PROCESSED', 'Delivered & Processed'
    CANCELLED = 'CANCELLED', 'Cancelled'

class TrashLoad(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tracking_number = models.CharField(max_length=32, unique=True, db_index=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trash_loads')
    driver = models.ForeignKey(Driver, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_loads')
    destination_facility = models.ForeignKey(Facility, on_delete=models.SET_NULL, null=True, blank=True, related_name='incoming_loads')
    
    waste_type = models.CharField(max_length=30, choices=WasteType.choices, default=WasteType.MIXED)
    volume_tier = models.CharField(max_length=30, choices=VolumeTier.choices, default=VolumeTier.MEDIUM)
    estimated_weight_kg = models.DecimalField(max_digits=8, decimal_places=2, default=15.00)
    actual_weight_kg = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    
    status = models.CharField(max_length=30, choices=LoadStatus.choices, default=LoadStatus.SCHEDULED)
    
    # Geolocation Details
    pickup_address = models.TextField()
    pickup_latitude = models.FloatField()
    pickup_longitude = models.FloatField()
    pickup_notes = models.TextField(blank=True, null=True)
    
    # Scheduling & Execution Timestamps
    is_immediate_dispatch = models.BooleanField(default=True)
    scheduled_pickup_at = models.DateTimeField(default=timezone.now)
    driver_assigned_at = models.DateTimeField(blank=True, null=True)
    picked_up_at = models.DateTimeField(blank=True, null=True)
    delivered_at = models.DateTimeField(blank=True, null=True)
    
    # Proof of Delivery
    proof_of_delivery_image = models.ImageField(upload_to='proofs/%Y/%m/%d/', blank=True, null=True)
    proof_image_url = models.URLField(blank=True, null=True)
    proof_notes = models.TextField(blank=True, null=True)
    
    # Reward & Environmental Calculations
    points_awarded = models.PositiveIntegerField(default=0)
    carbon_offset_kg = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'trash_loads'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.tracking_number:
            prefix = "GEO"
            date_str = timezone.now().strftime("%Y%m%d")
            unique_part = str(uuid.uuid4())[:6].upper()
            self.tracking_number = f"{prefix}-{date_str}-{unique_part}"
        super().save(*args, **kwargs)

    def calculate_rewards_and_carbon(self):
        """Calculates eco-reward points and carbon avoided based on waste category."""
        weight = float(self.actual_weight_kg or self.estimated_weight_kg)
        
        # Multipliers based on environmental benefits
        multipliers = {
            WasteType.ORGANIC: {'points_per_kg': 10, 'co2_saved_per_kg': 0.85},
            WasteType.PLASTIC: {'points_per_kg': 20, 'co2_saved_per_kg': 1.50},
            WasteType.E_WASTE: {'points_per_kg': 50, 'co2_saved_per_kg': 3.20},
            WasteType.HAZARDOUS: {'points_per_kg': 35, 'co2_saved_per_kg': 2.10},
            WasteType.BULKY: {'points_per_kg': 15, 'co2_saved_per_kg': 1.10},
            WasteType.MIXED: {'points_per_kg': 5, 'co2_saved_per_kg': 0.20},
        }
        meta = multipliers.get(self.waste_type, {'points_per_kg': 5, 'co2_saved_per_kg': 0.20})
        from decimal import Decimal
        points = int(weight * meta['points_per_kg'])
        co2 = Decimal(str(round(weight * meta['co2_saved_per_kg'], 2)))
        
        self.points_awarded = points
        self.carbon_offset_kg = co2
        return points, co2

    def __str__(self):
        return f"{self.tracking_number} - {self.get_waste_type_display()} [{self.status}]"
