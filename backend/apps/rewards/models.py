import uuid
from django.db import models
from apps.users.models import User

class RewardCategory(models.TextChoices):
    LOCAL_VOUCHER = 'LOCAL_VOUCHER', 'Local Merchant Voucher'
    CARBON_CREDIT = 'CARBON_CREDIT', 'Certified Carbon Offset Credit'
    TREE_PLANTING = 'TREE_PLANTING', 'Plant-a-Tree Initiative'
    GROCERY_DISCOUNT = 'GROCERY_DISCOUNT', 'Eco Grocery Discount'

class Reward(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=150)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=RewardCategory.choices, default=RewardCategory.LOCAL_VOUCHER)
    points_required = models.PositiveIntegerField(default=100)
    stock_count = models.PositiveIntegerField(default=50)
    image_url = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'rewards'

    def __str__(self):
        return f"{self.title} ({self.points_required} pts)"

class RewardRedemption(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='redemptions')
    reward = models.ForeignKey(Reward, on_delete=models.CASCADE)
    points_spent = models.PositiveIntegerField()
    redemption_code = models.CharField(max_length=64, unique=True)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reward_redemptions'

