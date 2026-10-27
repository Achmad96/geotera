import uuid
from django.db import models

class UserRole(models.TextChoices):
    USER = 'USER', 'End User / Citizen'
    COLLECTOR_DRIVER = 'COLLECTOR_DRIVER', 'Collector / Driver'
    FACILITY_OPERATOR = 'FACILITY_OPERATOR', 'Disposal Facility Operator'
    ADMIN = 'ADMIN', 'System Administrator'

class User(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=30, blank=True, null=True, unique=True)
    full_name = models.CharField(max_length=150)
    role = models.CharField(max_length=30, choices=UserRole.choices, default=UserRole.USER)
    avatar_url = models.URLField(blank=True, null=True)
    
    # Rewards & Sustainability Metrics
    reward_points_balance = models.PositiveIntegerField(default=0)
    carbon_saved_kg = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.full_name} ({self.role}) - {self.email}"

