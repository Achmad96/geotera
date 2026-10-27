import uvicorn
import os

if __name__ == "__main__":
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'geotera.settings')
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    print(f"[*] Starting Geotera ASGI Server with Socket.IO & Django Channels on http://{host}:{port}")
    uvicorn.run("geotera.asgi:application", host=host, port=port, reload=True, log_level="info")

