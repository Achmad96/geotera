from rest_framework import viewsets
from .models import Facility
from .serializers import FacilitySerializer

class FacilityViewSet(viewsets.ModelViewSet):
    queryset = Facility.objects.filter(is_active=True)
    serializer_class = FacilitySerializer

