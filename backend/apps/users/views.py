from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import User
from .serializers import UserSerializer, AuthRequestSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_serializer = UserSerializer
    serializer_class = UserSerializer

    @action(detail=False, methods=['post'], url_path='authenticate')
    def authenticate(self, request):
        """Mock login/signup handler for Supabase OAuth/OTP or dev login."""
        serializer = AuthRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        full_name = serializer.validated_data.get('full_name', 'Eco User')
        role = serializer.validated_data.get('role', 'USER')
        
        user, created = User.objects.get_or_create(
            email=email,
            defaults={'full_name': full_name, 'role': role}
        )
        return Response(UserSerializer(user).data, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], url_path='impact-summary')
    def impact_summary(self, request, pk=None):
        user = self.get_object()
        from apps.trash_loads.models import TrashLoad
        total_loads = TrashLoad.objects.filter(user=user).count()
        completed_loads = TrashLoad.objects.filter(user=user, status='DELIVERED_PROCESSED').count()
        return Response({
            'user_id': user.id,
            'full_name': user.full_name,
            'reward_points_balance': user.reward_points_balance,
            'carbon_saved_kg': float(user.carbon_saved_kg),
            'total_pickups': total_loads,
            'completed_pickups': completed_loads,
        })

