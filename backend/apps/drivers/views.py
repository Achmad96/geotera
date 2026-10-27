from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Driver
from .serializers import (
    DriverSerializer,
    DriverStatusToggleSerializer,
    DriverCapacityUpdateSerializer
)

class DriverViewSet(viewsets.ModelViewSet):
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer

    @action(detail=True, methods=['post'], url_path='toggle-status')
    def toggle_status(self, request, pk=None):
        driver = self.get_object()
        serializer = DriverStatusToggleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        if 'is_online' in data:
            driver.is_online = data['is_online']
        if 'is_on_duty' in data:
            driver.is_on_duty = data['is_on_duty']
        if 'latitude' in data and 'longitude' in data:
            driver.current_latitude = data['latitude']
            driver.current_longitude = data['longitude']
            driver.last_ping_at = timezone.now()

        driver.save()
        return Response(DriverSerializer(driver).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='update-capacity')
    def update_capacity(self, request, pk=None):
        driver = self.get_object()
        serializer = DriverCapacityUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        remaining = serializer.validated_data['remaining_capacity_kg']
        if remaining > driver.max_payload_kg:
            return Response(
                {"error": f"Remaining capacity ({remaining}kg) cannot exceed max payload ({driver.max_payload_kg}kg)"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        driver.current_capacity_kg = remaining
        driver.save(update_fields=['current_capacity_kg', 'updated_at'])
        return Response(DriverSerializer(driver).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='available')
    def available_drivers(self, request):
        min_capacity = request.query_params.get('min_capacity_kg', 0)
        drivers = Driver.objects.filter(
            is_online=True,
            is_on_duty=True,
            current_capacity_kg__gte=float(min_capacity)
        )
        return Response(DriverSerializer(drivers, many=True).data)

