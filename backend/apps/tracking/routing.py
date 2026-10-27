from django.urls import re_path
from .consumers import TrashTrackingConsumer

websocket_urlpatterns = [
    re_path(r'ws/tracking/(?P<load_id>[^/]+)/$', TrashTrackingConsumer.as_asgi()),
]

