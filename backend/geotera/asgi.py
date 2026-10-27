import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'geotera.settings')
django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import socketio

from apps.tracking.routing import websocket_urlpatterns
from apps.tracking.socket_server import sio

# Django Channels ASGI Application
channels_application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})

# Wrap with python-socketio ASGIApp
# Routes `/socket.io/` to Socket.IO engine, and passes all other HTTP/WebSocket traffic to Channels!
application = socketio.ASGIApp(sio, other_asgi_app=channels_application)

