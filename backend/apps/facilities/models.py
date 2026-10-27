import uuid
from django.db import models

class FacilityType(models.TextChoices):
    RECYCLING_CENTER = 'RECYCLING_CENTER', 'Recycling Processing Plant'
    COMPOSTING_PLANT = 'COMPOSTING_PLANT', 'Organic Composting Facility'
    E_WASTE_DEPOT = 'E_WASTE_DEPOT', 'Certified E-Waste Depot'
    HAZARDOUS_DISPOSAL = 'HAZARDOUS_DISPOSAL', 'Hazardous Waste Processing'
    MUNICIPAL_TRANSFER = 'MUNICIPAL_TRANSFER_STATION', 'Municipal Waste Transfer Station'
    SANITARY_LANDFILL = 'SANITARY_LANDFILL', 'Sanitary Landfill'

class Facility(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    facility_type = models.CharField(max_length=50, choices=FacilityType.choices)
    address = models.TextField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    contact_phone = models.CharField(max_length=30, blank=True, null=True)
    max_daily_capacity_tons = models.DecimalField(max_digits=10, decimal_places=2, default=50.00)
    accepted_waste_types = models.JSONField(default=list)  # List of waste types
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'facilities'
        verbose_name_plural = 'Facilities'

    def __str__(self):
        return f"{self.name} ({self.get_facility_type_display()})"

