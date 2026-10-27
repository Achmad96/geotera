import { TrashLoad, WasteType, VolumeTier, LoadStatus, RewardItem, DriverProfile } from '../types/waste';
import { Platform } from 'react-native';

// In Android emulator localhost is 10.0.2.2; on web / iOS simulator it is localhost
export const API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:8000/api/v1',
  default: 'http://localhost:8000/api/v1',
});

export const WS_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:8000',
  default: 'http://localhost:8000',
});

// Fallback seed load for instant offline demo
export const FALLBACK_LOAD: TrashLoad = {
  id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  tracking_number: 'GEO-20261027-LIVE1',
  user: {
    id: 'user-001',
    full_name: 'Alex Johnson',
    reward_points_balance: 480,
  },
  driver: {
    id: 'driver-001',
    vehicle_type: 'Compactor Truck 2.5T',
    vehicle_plate_number: 'B 8421 GEO',
    max_payload_kg: 2500,
    current_capacity_kg: 1950,
    is_online: true,
    is_on_duty: true,
    current_latitude: -6.211,
    current_longitude: 106.843,
    rating: 4.95,
    total_trips_completed: 142,
  },
  destination_facility: {
    id: 'fac-001',
    name: 'GreenCycle Materials Recovery Facility',
    facility_type: 'RECYCLING_CENTER',
    address: 'Jl. Industri Daur Ulang No. 45, Jakarta Selatan',
    latitude: -6.2395,
    longitude: 106.822,
    max_daily_capacity_tons: 120,
    accepted_waste_types: ['PLASTIC', 'E_WASTE', 'BULKY'],
  },
  waste_type: 'PLASTIC',
  volume_tier: 'MEDIUM',
  estimated_weight_kg: 25,
  status: 'IN_TRANSIT',
  pickup_address: 'Jl. Senopati No. 18, Kebayoran Baru, Jakarta Selatan',
  pickup_latitude: -6.2088,
  pickup_longitude: 106.8456,
  pickup_notes: 'Two blue sorted recycling bags by the front porch.',
  is_immediate_dispatch: true,
  scheduled_pickup_at: new Date().toISOString(),
  points_awarded: 500,
  carbon_offset_kg: 37.5,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const apiService = {
  async getActiveLoads(): Promise<TrashLoad[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/trash-loads/active-feed/`);
      if (!res.ok) throw new Error('Failed to fetch active loads');
      const data = await res.json();
      return data.length > 0 ? data : [FALLBACK_LOAD];
    } catch {
      return [FALLBACK_LOAD];
    }
  },

  async getLoadById(id: string): Promise<TrashLoad> {
    try {
      const res = await fetch(`${API_BASE_URL}/trash-loads/${id}/`);
      if (!res.ok) throw new Error('Failed to fetch load');
      return await res.json();
    } catch {
      return FALLBACK_LOAD;
    }
  },

  async createBooking(payload: {
    waste_type: WasteType;
    volume_tier: VolumeTier;
    estimated_weight_kg: number;
    pickup_address: string;
    pickup_latitude: number;
    pickup_longitude: number;
    pickup_notes?: string;
    is_immediate_dispatch: boolean;
    scheduled_pickup_at?: string;
  }): Promise<TrashLoad> {
    try {
      const userRes = await fetch(`${API_BASE_URL}/users/`);
      let userId = 'user-001';
      if (userRes.ok) {
        const users = await userRes.json();
        if (users?.results?.length > 0) userId = users.results[0].id;
        else if (Array.isArray(users) && users.length > 0) userId = users[0].id;
      }

      const res = await fetch(`${API_BASE_URL}/trash-loads/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          user: userId,
        }),
      });

      if (!res.ok) throw new Error('Failed to create trash booking');
      return await res.json();
    } catch {
      // Return simulated optimistic booking
      return {
        ...FALLBACK_LOAD,
        id: Math.random().toString(36).substring(7),
        tracking_number: `GEO-${Date.now().toString().slice(-6)}`,
        waste_type: payload.waste_type,
        volume_tier: payload.volume_tier,
        estimated_weight_kg: payload.estimated_weight_kg,
        pickup_address: payload.pickup_address,
        pickup_notes: payload.pickup_notes,
        status: payload.is_immediate_dispatch ? 'DRIVER_ASSIGNED' : 'SCHEDULED',
      };
    }
  },

  async updateLoadStatus(
    loadId: string,
    status: LoadStatus,
    actualWeight?: number,
    proofUrl?: string
  ): Promise<TrashLoad> {
    try {
      const res = await fetch(`${API_BASE_URL}/trash-loads/${loadId}/update-status/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          actual_weight_kg: actualWeight,
          proof_image_url: proofUrl,
        }),
      });
      if (!res.ok) throw new Error('Status update failed');
      return await res.json();
    } catch {
      return {
        ...FALLBACK_LOAD,
        status,
        actual_weight_kg: actualWeight,
      };
    }
  },

  async toggleDriverDuty(
    driverId: string,
    isOnline: boolean,
    isOnDuty: boolean,
    coords?: { latitude: number; longitude: number }
  ): Promise<DriverProfile> {
    try {
      const res = await fetch(`${API_BASE_URL}/drivers/${driverId}/toggle-status/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_online: isOnline,
          is_on_duty: isOnDuty,
          latitude: coords?.latitude,
          longitude: coords?.longitude,
        }),
      });
      if (!res.ok) throw new Error('Driver toggle failed');
      return await res.json();
    } catch {
      return {
        ...FALLBACK_LOAD.driver!,
        is_online: isOnline,
        is_on_duty: isOnDuty,
      };
    }
  },

  async updateDriverCapacity(driverId: string, remainingKg: number): Promise<DriverProfile> {
    try {
      const res = await fetch(`${API_BASE_URL}/drivers/${driverId}/update-capacity/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          remaining_capacity_kg: remainingKg,
        }),
      });
      if (!res.ok) throw new Error('Capacity update failed');
      return await res.json();
    } catch {
      return {
        ...FALLBACK_LOAD.driver!,
        current_capacity_kg: remainingKg,
      };
    }
  },

  async getRewards(): Promise<RewardItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/rewards/`);
      if (!res.ok) throw new Error('Failed to fetch rewards');
      const data = await res.json();
      return data.results || data;
    } catch {
      return [
        {
          id: 'rew-1',
          title: 'IDR 50,000 Organic Mart Voucher',
          description: 'Redeemable at all local participating eco grocers.',
          category: 'LOCAL_VOUCHER',
          points_required: 250,
          stock_count: 38,
        },
        {
          id: 'rew-2',
          title: '1 Ton Carbon Offset Certificate',
          description: 'Verified gold-standard carbon reduction certificate.',
          category: 'CARBON_CREDIT',
          points_required: 500,
          stock_count: 95,
        },
        {
          id: 'rew-3',
          title: 'Plant 5 Mangrove Trees',
          description: 'Restores coastal habitats and captures blue carbon.',
          category: 'TREE_PLANTING',
          points_required: 300,
          stock_count: 72,
        },
      ];
    }
  },
};

