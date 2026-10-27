import asyncio
import socketio
import logging
from datetime import datetime

logger = logging.getLogger('geotera.socketio')

# Async Socket.IO Server with CORS allowed
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    logger=False,
    engineio_logger=False
)

# Active simulation tasks mapping
simulation_tasks = {}

@sio.event
async def connect(sid, environ):
    logger.info(f"Socket.io client connected: {sid}")
    await sio.emit('connected', {'sid': sid, 'server_time': datetime.utcnow().isoformat()}, to=sid)

@sio.event
async def disconnect(sid):
    logger.info(f"Socket.io client disconnected: {sid}")

@sio.event
async def join_load_tracking(sid, data):
    """
    User or Driver joins the room for a specific trash load.
    data: { "load_id": "GEO-..." or UUID }
    """
    load_id = str(data.get('load_id', 'default_load'))
    room_name = f"load_{load_id}"
    await sio.enter_room(sid, room_name)
    logger.info(f"Client {sid} joined room {room_name}")
    await sio.emit('tracking_joined', {'room': room_name, 'load_id': load_id}, to=sid)

@sio.event
async def leave_load_tracking(sid, data):
    load_id = str(data.get('load_id', 'default_load'))
    room_name = f"load_{load_id}"
    await sio.leave_room(sid, room_name)
    logger.info(f"Client {sid} left room {room_name}")

@sio.event
async def driver_telemetry_ping(sid, data):
    """
    Driver client sends high-frequency live GPS telemetry.
    data: {
        "load_id": "...",
        "driver_id": "...",
        "latitude": -6.2088,
        "longitude": 106.8456,
        "speed_kmh": 32.5,
        "heading": 145.2,
        "status": "IN_TRANSIT"
    }
    """
    load_id = str(data.get('load_id'))
    room_name = f"load_{load_id}"
    
    payload = {
        'load_id': load_id,
        'driver_id': data.get('driver_id'),
        'latitude': float(data.get('latitude', 0.0)),
        'longitude': float(data.get('longitude', 0.0)),
        'speed_kmh': float(data.get('speed_kmh', 0.0)),
        'heading': float(data.get('heading', 0.0)),
        'status': data.get('status', 'IN_TRANSIT'),
        'timestamp': datetime.utcnow().isoformat()
    }
    # Broadcast to all clients in the room (e.g. user app listening)
    await sio.emit('telemetry_update', payload, room=room_name)

@sio.event
async def update_status(sid, data):
    """
    Update trash lifecycle status (e.g., Driver clicks Picked Up or Delivered).
    data: { "load_id": "...", "status": "PICKED_UP" | "DELIVERED_PROCESSED", ... }
    """
    load_id = str(data.get('load_id'))
    room_name = f"load_{load_id}"
    status = data.get('status')
    
    logger.info(f"Broadcasting status change for load {load_id}: {status}")
    await sio.emit('status_changed', {
        'load_id': load_id,
        'status': status,
        'timestamp': datetime.utcnow().isoformat(),
        'extra': data.get('extra', {})
    }, room=room_name)

@sio.event
async def start_simulated_trip(sid, data):
    """
    Triggers an automated trip simulation from pickup point to recycling plant.
    Useful for testing the live tracking loop on mobile without needing a physical vehicle!
    """
    load_id = str(data.get('load_id', 'SIMULATED-LOAD-001'))
    
    # Cancel any existing simulation for this load
    if load_id in simulation_tasks and not simulation_tasks[load_id].done():
        simulation_tasks[load_id].cancel()
    
    task = asyncio.create_task(run_trip_simulation(load_id))
    simulation_tasks[load_id] = task
    await sio.emit('simulation_started', {'load_id': load_id}, to=sid)

async def run_trip_simulation(load_id: str):
    """
    Simulates a 5-stage waste collection journey:
    Pickup location -> Assigned -> Picked Up -> Navigating 10 GPS waypoints -> Facility Drop-off
    """
    room_name = f"load_{load_id}"
    logger.info(f"Starting simulation for {room_name}")

    # Simulated path coordinates (e.g., Jakarta / Metropolitan route)
    waypoints = [
        {"lat": -6.2088, "lng": 106.8456, "status": "DRIVER_ASSIGNED", "desc": "Collector assigned and dispatching"},
        {"lat": -6.2110, "lng": 106.8430, "status": "DRIVER_ASSIGNED", "desc": "Collector arriving at user location"},
        {"lat": -6.2145, "lng": 106.8398, "status": "PICKED_UP", "desc": "Trash picked up & loaded onto truck"},
        {"lat": -6.2180, "lng": 106.8375, "status": "IN_TRANSIT", "desc": "In transit to Eco-Cycle Facility"},
        {"lat": -6.2225, "lng": 106.8340, "status": "IN_TRANSIT", "desc": "En route via Greenway Boulevard"},
        {"lat": -6.2270, "lng": 106.8310, "status": "IN_TRANSIT", "desc": "Passing Central Sorting Hub"},
        {"lat": -6.2315, "lng": 106.8285, "status": "IN_TRANSIT", "desc": "Approaching Material Recovery Facility"},
        {"lat": -6.2360, "lng": 106.8250, "status": "IN_TRANSIT", "desc": "Entering Facility Gate"},
        {"lat": -6.2395, "lng": 106.8220, "status": "DELIVERED_PROCESSED", "desc": "Delivered, weighed & recyclables sorted"}
    ]

    for i, pt in enumerate(waypoints):
        payload = {
            'load_id': load_id,
            'driver_id': 'driver-sim-001',
            'driver_name': 'Budi Santoso (Truck #B-8421-GEO)',
            'latitude': pt['lat'],
            'longitude': pt['lng'],
            'speed_kmh': 28.5 if pt['status'] == 'IN_TRANSIT' else 0.0,
            'heading': 225.0,
            'status': pt['status'],
            'description': pt['desc'],
            'step': i + 1,
            'total_steps': len(waypoints),
            'timestamp': datetime.utcnow().isoformat()
        }
        await sio.emit('telemetry_update', payload, room=room_name)
        await sio.emit('status_changed', payload, room=room_name)
        
        # Interval between waypoints
        await asyncio.sleep(2.5)

    # Award points summary event at completion
    await sio.emit('trip_completed', {
        'load_id': load_id,
        'points_awarded': 120,
        'carbon_offset_kg': 6.8,
        'proof_image_url': 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=500',
        'message': 'Waste has been successfully processed at the facility! Rewards added to your account.'
    }, room=room_name)

