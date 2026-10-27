import { io, Socket } from 'socket.io-client';
import { WS_BASE_URL } from './api';
import { TelemetryPoint } from '../types/waste';

class SocketService {
  private socket: Socket | null = null;
  private currentLoadId: string | null = null;
  private isSimulatingLocally: boolean = false;
  private localSimulationTimer: any = null;

  connect(loadId: string) {
    this.currentLoadId = loadId;

    if (!this.socket) {
      this.socket = io(WS_BASE_URL, {
        transports: ['websocket', 'polling'],
        timeout: 5000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('[Socket.IO] Connected to Geotera backend:', this.socket?.id);
        if (this.currentLoadId) {
          this.socket?.emit('join_load_tracking', { load_id: this.currentLoadId });
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('[Socket.IO] Disconnected:', reason);
      });

      this.socket.on('connect_error', (err) => {
        console.warn('[Socket.IO] Connection error (will use local simulation if requested):', err.message);
      });
    } else if (this.socket.connected) {
      this.socket.emit('join_load_tracking', { load_id: loadId });
    }
  }

  onTelemetryUpdate(callback: (point: TelemetryPoint) => void) {
    if (this.socket) {
      this.socket.off('telemetry_update');
      this.socket.on('telemetry_update', callback);
    }
  }

  onStatusChanged(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.off('status_changed');
      this.socket.on('status_changed', callback);
    }
  }

  onTripCompleted(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.off('trip_completed');
      this.socket.on('trip_completed', callback);
    }
  }

  triggerLiveSimulation(
    loadId: string,
    onPoint: (point: TelemetryPoint) => void,
    onComplete: (data: any) => void
  ) {
    // If socket is connected to server, let backend run the real-time simulation
    if (this.socket && this.socket.connected) {
      this.socket.emit('start_simulated_trip', { load_id: loadId });
      return;
    }

    // Fallback: Local Client-side Simulation Engine
    // Generates high-fidelity telemetry from pickup coordinates to recycling center
    console.log('[Simulation] Running local high-fidelity simulated telemetry loop...');
    if (this.localSimulationTimer) clearInterval(this.localSimulationTimer);

    const waypoints = [
      { lat: -6.2088, lng: 106.8456, status: 'DRIVER_ASSIGNED', desc: 'Driver dispatched to pickup address' },
      { lat: -6.2110, lng: 106.8430, status: 'DRIVER_ASSIGNED', desc: 'Driver arriving at pickup location' },
      { lat: -6.2145, lng: 106.8398, status: 'PICKED_UP', desc: 'Waste verified and loaded onto truck' },
      { lat: -6.2180, lng: 106.8375, status: 'IN_TRANSIT', desc: 'En route via Jl. Senopati' },
      { lat: -6.2225, lng: 106.8340, status: 'IN_TRANSIT', desc: 'Navigating South Jakarta Corridor' },
      { lat: -6.2270, lng: 106.8310, status: 'IN_TRANSIT', desc: 'Passing Sorting Hub Alpha' },
      { lat: -6.2315, lng: 106.8285, status: 'IN_TRANSIT', desc: 'Approaching Material Recovery Facility' },
      { lat: -6.2360, lng: 106.8250, status: 'IN_TRANSIT', desc: 'Weighbridge entry scan' },
      { lat: -6.2395, lng: 106.8220, status: 'DELIVERED_PROCESSED', desc: 'Unloaded & processed for recycling' },
    ];

    let step = 0;
    this.localSimulationTimer = setInterval(() => {
      if (step >= waypoints.length) {
        clearInterval(this.localSimulationTimer);
        onComplete({
          load_id: loadId,
          points_awarded: 120,
          carbon_offset_kg: 6.8,
          proof_image_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=500',
          message: 'Trash delivered and verified at GreenCycle Facility! Rewards credited.',
        });
        return;
      }

      const wp = waypoints[step];
      const point: TelemetryPoint = {
        load_id: loadId,
        driver_id: 'driver-001',
        driver_name: 'Budi Santoso (Truck #B-8421-GEO)',
        latitude: wp.lat,
        longitude: wp.lng,
        speed_kmh: wp.status === 'IN_TRANSIT' ? 34.2 : 0,
        heading: 215,
        status: wp.status as any,
        description: wp.desc,
        step: step + 1,
        total_steps: waypoints.length,
        timestamp: new Date().toISOString(),
      };

      onPoint(point);
      step++;
    }, 2000);
  }

  stopSimulation() {
    if (this.localSimulationTimer) {
      clearInterval(this.localSimulationTimer);
      this.localSimulationTimer = null;
    }
  }

  disconnect() {
    this.stopSimulation();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
