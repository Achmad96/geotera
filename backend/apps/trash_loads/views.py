from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import TrashLoad, LoadStatus
from .serializers import (
    TrashLoadSerializer,
    TrashLoadCreateSerializer,
    TrashLoadStatusUpdateSerializer,
)
from apps.drivers.models import Driver
from apps.facilities.models import Facility

class TrashLoadViewSet(viewsets.ModelViewSet):
    queryset = TrashLoad.objects.all().select_related('user', 'driver', 'destination_facility')

    def get_serializer_class(self):
        if self.action == 'create':
            return TrashLoadCreateSerializer
        return TrashLoadSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        load = serializer.save()

        # If immediate dispatch, auto-assign nearest active driver if available
        if load.is_immediate_dispatch:
            available_driver = Driver.objects.filter(
                is_online=True,
                is_on_duty=True,
                current_capacity_kg__gte=load.estimated_weight_kg
            ).first()
            if available_driver:
                load.driver = available_driver
                load.status = LoadStatus.DRIVER_ASSIGNED
                load.driver_assigned_at = timezone.now()
                # Deduct driver's current available capacity
                available_driver.current_capacity_kg -= load.estimated_weight_kg
                available_driver.save(update_fields=['current_capacity_kg'])
                load.save()

        # Suggest optimal destination facility based on waste type
        default_facility = Facility.objects.filter(is_active=True).first()
        if default_facility and not load.destination_facility:
            load.destination_facility = default_facility
            load.save(update_fields=['destination_facility'])

        return Response(TrashLoadSerializer(load).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='update-status')
    def update_status(self, request, pk=None):
        load = self.get_object()
        serializer = TrashLoadStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        new_status = data['status']
        load.status = new_status

        if 'driver_id' in data:
            driver = Driver.objects.filter(id=data['driver_id']).first()
            if driver:
                load.driver = driver
                load.driver_assigned_at = timezone.now()

        if 'facility_id' in data:
            facility = Facility.objects.filter(id=data['facility_id']).first()
            if facility:
                load.destination_facility = facility

        if new_status == LoadStatus.PICKED_UP:
            load.picked_up_at = timezone.now()

        elif new_status == LoadStatus.DELIVERED_PROCESSED:
            load.delivered_at = timezone.now()
            if 'actual_weight_kg' in data:
                load.actual_weight_kg = data['actual_weight_kg']
            if 'proof_image_url' in data:
                load.proof_image_url = data['proof_image_url']
            if 'proof_notes' in data:
                load.proof_notes = data['proof_notes']

            # Calculate and award gamification points & carbon savings
            points, co2 = load.calculate_rewards_and_carbon()
            user = load.user
            user.reward_points_balance += points
            user.carbon_saved_kg += co2
            user.save(update_fields=['reward_points_balance', 'carbon_saved_kg'])

            # Restore driver capacity & increment completed trip counter
            if load.driver:
                driver = load.driver
                driver.current_capacity_kg = min(
                    driver.max_payload_kg,
                    driver.current_capacity_kg + (load.actual_weight_kg or load.estimated_weight_kg)
                )
                driver.total_trips_completed += 1
                driver.save(update_fields=['current_capacity_kg', 'total_trips_completed'])

        load.save()
        return Response(TrashLoadSerializer(load).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='active-feed')
    def active_feed(self, request):
        user_id = request.query_params.get('user_id')
        qs = self.queryset.exclude(status__in=[LoadStatus.DELIVERED_PROCESSED, LoadStatus.CANCELLED])
        if user_id:
            qs = qs.filter(user_id=user_id)
        return Response(TrashLoadSerializer(qs, many=True).data)

