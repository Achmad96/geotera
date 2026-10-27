export type WasteType =
  | 'ORGANIC'
  | 'PLASTIC'
  | 'E_WASTE'
  | 'HAZARDOUS'
  | 'MIXED'
  | 'BULKY';

export type VolumeTier = 'SMALL' | 'MEDIUM' | 'LARGE' | 'TRUCKLOAD';

export type LoadStatus =
  | 'SCHEDULED'
  | 'DRIVER_ASSIGNED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED_PROCESSED'
  | 'CANCELLED';

export interface Facility {
  id: string;
  name: string;
  facility_type: string;
  address: string;
  latitude: number;
  longitude: number;
  contact_phone?: string;
  max_daily_capacity_tons: number;
  accepted_waste_types: WasteType[];
}

export interface DriverProfile {
  id: string;
  user?: {
    id: string;
    full_name: string;
    phone_number: string;
  };
  vehicle_type: string;
  vehicle_plate_number: string;
  max_payload_kg: number;
  current_capacity_kg: number;
  is_online: boolean;
  is_on_duty: boolean;
  current_latitude?: number;
  current_longitude?: number;
  rating: number;
  total_trips_completed: number;
}

export interface TrashLoad {
  id: string;
  tracking_number: string;
  user?: {
    id: string;
    full_name: string;
    reward_points_balance: number;
  };
  driver?: DriverProfile;
  destination_facility?: Facility;
  waste_type: WasteType;
  volume_tier: VolumeTier;
  estimated_weight_kg: number;
  actual_weight_kg?: number;
  status: LoadStatus;
  pickup_address: string;
  pickup_latitude: number;
  pickup_longitude: number;
  pickup_notes?: string;
  is_immediate_dispatch: boolean;
  scheduled_pickup_at: string;
  driver_assigned_at?: string;
  picked_up_at?: string;
  delivered_at?: string;
  proof_image_url?: string;
  proof_notes?: string;
  points_awarded: number;
  carbon_offset_kg: number;
  created_at: string;
  updated_at: string;
}

export interface TelemetryPoint {
  load_id: string;
  driver_id?: string;
  driver_name?: string;
  latitude: number;
  longitude: number;
  speed_kmh: number;
  heading: number;
  status: LoadStatus;
  description?: string;
  step?: number;
  total_steps?: number;
  timestamp: string;
}

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  category: 'LOCAL_VOUCHER' | 'CARBON_CREDIT' | 'TREE_PLANTING' | 'GROCERY_DISCOUNT';
  points_required: number;
  stock_count: number;
}

