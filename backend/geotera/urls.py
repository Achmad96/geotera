from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.response import Response
from rest_framework.decorators import api_view

@api_view(['GET'])
def health_check(request):
    return Response({
        'status': 'healthy',
        'service': 'Geotera Waste Management Telemetry Backend',
        'version': '1.0.0',
        'realtime_engine': 'Socket.IO & Django Channels ASGI'
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/health/', health_check, name='health-check'),
    path('api/v1/users/', include('apps.users.urls')),
    path('api/v1/drivers/', include('apps.drivers.urls')),
    path('api/v1/facilities/', include('apps.facilities.urls')),
    path('api/v1/trash-loads/', include('apps.trash_loads.urls')),
    path('api/v1/tracking/', include('apps.tracking.urls')),
    path('api/v1/rewards/', include('apps.rewards.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

