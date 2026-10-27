from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'phone_number', 'full_name',
            'role', 'avatar_url', 'reward_points_balance',
            'carbon_saved_kg', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'reward_points_balance', 'carbon_saved_kg', 'created_at', 'updated_at']

class AuthRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    full_name = serializers.CharField(required=False, default='Geotera Eco Warrior')
    role = serializers.CharField(required=False, default='USER')

