import json
from channels.generic.websocket import AsyncWebsocketConsumer

class TrashTrackingConsumer(AsyncWebsocketConsumer):
    """
    Native WebSocket Consumer for real-time tracking of trash loads.
    Connects to /ws/tracking/<load_id>/
    """
    async def connect(self):
        self.load_id = self.scope['url_route']['kwargs']['load_id']
        self.room_group_name = f"trash_load_{self.load_id}"

        # Join load tracking group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': f'Connected to live telemetry feed for load {self.load_id}',
            'load_id': self.load_id
        }))

    async def disconnect(self, close_code):
        # Leave load tracking group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        """
        Receives telemetry payload from driver device and broadcasts to all clients
        watching this trash load.
        """
        try:
            data = json.loads(text_data)
            event_type = data.get('event', 'telemetry_update')

            # Broadcast to load group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'tracking_message',
                    'payload': data
                }
            )
        except Exception as e:
            await self.send(text_data=json.dumps({'error': str(e)}))

    async def tracking_message(self, event):
        """Handler for group messages."""
        await self.send(text_data=json.dumps(event['payload']))

