import uuid
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Reward, RewardRedemption
from .serializers import RewardSerializer, RewardRedemptionSerializer
from apps.users.models import User

class RewardViewSet(viewsets.ModelViewSet):
    queryset = Reward.objects.filter(is_active=True)
    serializer_class = RewardSerializer

    @action(detail=True, methods=['post'], url_path='redeem')
    def redeem(self, request, pk=None):
        reward = self.get_object()
        user_id = request.data.get('user_id')
        user = User.objects.filter(id=user_id).first()
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        if user.reward_points_balance < reward.points_required:
            return Response(
                {"error": f"Insufficient points. Required: {reward.points_required}, Current: {user.reward_points_balance}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if reward.stock_count <= 0:
            return Response({"error": "Reward out of stock"}, status=status.HTTP_400_BAD_REQUEST)

        # Deduct user points and stock
        user.reward_points_balance -= reward.points_required
        user.save(update_fields=['reward_points_balance'])

        reward.stock_count -= 1
        reward.save(update_fields=['stock_count'])

        code = f"GEO-{uuid.uuid4().hex[:8].upper()}"
        redemption = RewardRedemption.objects.create(
            user=user,
            reward=reward,
            points_spent=reward.points_required,
            redemption_code=code
        )

        return Response(RewardRedemptionSerializer(redemption).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='my-redemptions')
    def user_redemptions(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response({"error": "user_id parameter required"}, status=status.HTTP_400_BAD_REQUEST)
        redemptions = RewardRedemption.objects.filter(user_id=user_id).order_by('-created_at')
        return Response(RewardRedemptionSerializer(redemptions, many=True).data)

