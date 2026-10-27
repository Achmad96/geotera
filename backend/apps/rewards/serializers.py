from rest_framework import serializers
from .models import Reward, RewardRedemption

class RewardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reward
        fields = '__all__'

class RewardRedemptionSerializer(serializers.ModelSerializer):
    reward_title = serializers.CharField(source='reward.title', read_only=True)

    class Meta:
        model = RewardRedemption
        fields = '__all__'
        read_only_fields = ['id', 'redemption_code', 'is_used', 'created_at']

