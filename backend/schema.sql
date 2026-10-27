-- =====================================================================
-- GEOTERA DATABASE SCHEMA (SUPABASE / POSTGRESQL + POSTGIS)
-- Architecture: Relational, Geospatial, High-Throughput Telemetry
-- =====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Enumerated Types
CREATE TYPE user_role AS ENUM ('USER', 'COLLECTOR_DRIVER', 'FACILITY_OPERATOR', 'ADMIN');
CREATE TYPE waste_type AS ENUM ('ORGANIC', 'PLASTIC', 'E_WASTE', 'HAZARDOUS', 'MIXED', 'BULKY');
CREATE TYPE volume_tier AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'TRUCKLOAD');
CREATE TYPE load_status AS ENUM (
    'SCHEDULED',
    'DRIVER_ASSIGNED',
    'PICKED_UP',
    'IN_TRANSIT',
    'DELIVERED_PROCESSED',
    'CANCELLED'
);
CREATE TYPE facility_type AS ENUM (
    'RECYCLING_CENTER',
    'COMPOSTING_PLANT',
    'E_WASTE_DEPOT',
    'HAZARDOUS_DISPOSAL',
    'MUNICIPAL_TRANSFER_STATION',
    'SANITARY_LANDFILL'
);
CREATE TYPE telemetry_event_type AS ENUM (
    'HEARTBEAT_PING',
    'ROUTE_DEVIATION',
    'SPEED_ALERT',
    'STATUS_TRANSITION',
    'CHECKPOINT_REACHED',
    'GEOFENCE_ENTER',
    'GEOFENCE_EXIT'
);

-- =====================================================================
-- 3. Core Tables
-- =====================================================================

-- 3.1 Users Table (Extends Supabase auth.users or standalone app auth)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(30) UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    role user_role DEFAULT 'USER' NOT NULL,
    avatar_url TEXT,
    reward_points_balance INTEGER DEFAULT 0 NOT NULL CHECK (reward_points_balance >= 0),
    carbon_saved_kg NUMERIC(10, 2) DEFAULT 0.00 NOT NULL CHECK (carbon_saved_kg >= 0),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3.2 Waste Facilities (Drop-off points, recycling plants, landfills)
CREATE TABLE IF NOT EXISTS facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    facility_type facility_type NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)) STORED,
    contact_phone VARCHAR(30),
    max_daily_capacity_tons NUMERIC(10, 2) DEFAULT 50.00,
    accepted_waste_types waste_type[] NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3.3 Drivers / Collectors
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_type VARCHAR(80) NOT NULL, -- e.g., 'Compactor Truck', 'Flatbed Pickup', 'Cargo Van', 'Electric Trike'
    vehicle_plate_number VARCHAR(30) UNIQUE NOT NULL,
    max_payload_kg NUMERIC(10, 2) NOT NULL DEFAULT 1500.00 CHECK (max_payload_kg > 0),
    current_capacity_kg NUMERIC(10, 2) NOT NULL DEFAULT 1500.00 CHECK (current_capacity_kg >= 0),
    is_online BOOLEAN DEFAULT FALSE NOT NULL,
    is_on_duty BOOLEAN DEFAULT FALSE NOT NULL,
    current_latitude DOUBLE PRECISION,
    current_longitude DOUBLE PRECISION,
    current_geom GEOMETRY(Point, 4326),
    rating NUMERIC(3, 2) DEFAULT 5.00 NOT NULL CHECK (rating >= 1.0 AND rating <= 5.0),
    total_trips_completed INTEGER DEFAULT 0 NOT NULL,
    last_ping_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3.4 Trash Loads (The core dispatch entity)
CREATE TABLE IF NOT EXISTS trash_loads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_number VARCHAR(32) UNIQUE NOT NULL, -- Human-friendly e.g., "GEO-20261027-X9F4"
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    destination_facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
    waste_type waste_type NOT NULL,
    volume_tier volume_tier NOT NULL DEFAULT 'MEDIUM',
    estimated_weight_kg NUMERIC(8, 2) NOT NULL CHECK (estimated_weight_kg > 0),
    actual_weight_kg NUMERIC(8, 2) CHECK (actual_weight_kg > 0),
    status load_status DEFAULT 'SCHEDULED' NOT NULL,
    
    -- Pickup Geolocation Details
    pickup_address TEXT NOT NULL,
    pickup_latitude DOUBLE PRECISION NOT NULL,
    pickup_longitude DOUBLE PRECISION NOT NULL,
    pickup_geom GEOMETRY(Point, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(pickup_longitude, pickup_latitude), 4326)) STORED,
    pickup_notes TEXT,
    
    -- Lifecycle Timestamps
    scheduled_pickup_at TIMESTAMPTZ NOT NULL,
    driver_assigned_at TIMESTAMPTZ,
    picked_up_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    
    -- Verification & Proof of Delivery
    proof_of_delivery_image_url TEXT,
    proof_notes TEXT,
    
    -- Rewards & Impact
    points_awarded INTEGER DEFAULT 0 NOT NULL,
    carbon_offset_kg NUMERIC(8, 2) DEFAULT 0.00 NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3.5 Tracking Events (High-frequency live telemetry & audit trail)
CREATE TABLE IF NOT EXISTS tracking_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trash_load_id UUID NOT NULL REFERENCES trash_loads(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    event_type telemetry_event_type DEFAULT 'HEARTBEAT_PING' NOT NULL,
    status load_status NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)) STORED,
    speed_kmh NUMERIC(5, 2) DEFAULT 0.00,
    heading_degrees NUMERIC(5, 2) DEFAULT 0.00,
    battery_percentage SMALLINT,
    telemetry_metadata JSONB DEFAULT '{}'::jsonb,
    recorded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3.6 Reward Redemptions & Catalog
CREATE TABLE IF NOT EXISTS rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'VOUCHER', 'CARBON_CREDIT', 'TREE_PLANTING'
    points_required INTEGER NOT NULL CHECK (points_required > 0),
    stock_count INTEGER DEFAULT 100 NOT NULL,
    icon_name VARCHAR(50) DEFAULT 'gift',
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS reward_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE RESTRICT,
    points_spent INTEGER NOT NULL,
    redemption_code VARCHAR(64) UNIQUE NOT NULL,
    is_redeemed BOOLEAN DEFAULT FALSE NOT NULL,
    redeemed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================================
-- 4. Indexes (High Performance Spatial & Telemetry Optimization)
-- =====================================================================

-- Spatial GIST indexes
CREATE INDEX IF NOT EXISTS idx_facilities_geom ON facilities USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_trash_loads_pickup_geom ON trash_loads USING GIST (pickup_geom);
CREATE INDEX IF NOT EXISTS idx_tracking_events_geom ON tracking_events USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_drivers_current_geom ON drivers USING GIST (current_geom);

-- Telemetry query indexes (load tracking timeline)
CREATE INDEX IF NOT EXISTS idx_tracking_events_load_time ON tracking_events (trash_load_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_trash_loads_status_user ON trash_loads (user_id, status);
CREATE INDEX IF NOT EXISTS idx_trash_loads_driver_status ON trash_loads (driver_id, status);
CREATE INDEX IF NOT EXISTS idx_drivers_duty_online ON drivers (is_online, is_on_duty);

-- =====================================================================
-- 5. Automatic updated_at Trigger
-- =====================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;
CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trigger_facilities_updated_at ON facilities;
CREATE TRIGGER trigger_facilities_updated_at BEFORE UPDATE ON facilities FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trigger_drivers_updated_at ON drivers;
CREATE TRIGGER trigger_drivers_updated_at BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trigger_trash_loads_updated_at ON trash_loads;
CREATE TRIGGER trigger_trash_loads_updated_at BEFORE UPDATE ON trash_loads FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =====================================================================
-- 6. Row Level Security (RLS) Policies for Supabase
-- =====================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trash_loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;

-- Facilities & Rewards are readable by everyone authenticated
CREATE POLICY "Allow authenticated read facilities" ON facilities FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read rewards" ON rewards FOR SELECT USING (true);

-- Users can read and update their own profile
CREATE POLICY "Users view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Trash loads: Users see their own loads; Drivers see assigned loads; Facility operators see destination loads
CREATE POLICY "Users read own loads" ON trash_loads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own loads" ON trash_loads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Drivers read assigned loads" ON trash_loads FOR SELECT USING (auth.uid() IN (SELECT user_id FROM drivers WHERE id = trash_loads.driver_id));
CREATE POLICY "Drivers update assigned loads" ON trash_loads FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM drivers WHERE id = trash_loads.driver_id));

-- Tracking events: Viewable if user owns the load or driver is assigned
CREATE POLICY "View tracking events" ON tracking_events FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM trash_loads
        WHERE trash_loads.id = tracking_events.trash_load_id
        AND (trash_loads.user_id = auth.uid() OR trash_loads.driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()))
    )
);

