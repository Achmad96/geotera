# Geotera: On-Demand Waste Management & Real-Time Tracking

**Geotera** is a full-stack, on-demand waste management mobile and server platform that allows users to schedule, dispatch, and track the delivery of their household trash and recyclables to designated collection centers or pickup drivers with real-time telemetry.

---

## 🌟 Core Architecture & Tech Stack

| Tier | Technology | Description |
|---|---|---|
| **Frontend** | React Native (Expo Router v58, NativeWind v4, Reanimated) | Native mobile client with SVG Interactive Map, Socket.IO live stream HUD, Waste Categorization booking UI, and Collector Console. |
| **Backend** | Python 3.13, Django 5.2, Django REST Framework | Domain-driven REST API, capacity validation, carbon calculations, and automated dispatch logic. |
| **Real-Time Telemetry** | Python-SocketIO & Django Channels ASGI | Bi-directional WebSocket & Socket.IO telemetry rooms (`load_<id>`) handling high-frequency GPS pings and state transitions. |
| **Database** | Supabase (PostgreSQL with PostGIS) & Redis | Relational data persistence with geospatial indexing (`ST_MakePoint`, GIST) and Redis Channel layers. |

---

## 🚀 Quick Start Guide

### 1. Backend Setup & Startup

1. **Activate the Virtual Environment & Dependencies:**
   ```bash
   cd backend
   # Virtualenv is located at backend/venv
   ./venv/Scripts/activate      # On Windows
   # source venv/bin/activate   # On macOS/Linux
   pip install -r requirements.txt
   ```

2. **Configure Environment Variables:**
   ```bash
   cp .env.example .env
   # Set your Supabase DATABASE_URL or leave blank for local SQLite development
   ```

3. **Run Migrations & Seed Sample Data:**
   ```bash
   python manage.py migrate
   python seed.py
   ```

4. **Launch the Real-Time ASGI Server (Django + Socket.IO + Channels):**
   ```bash
   python run_server.py
   # Or using uvicorn directly:
   uvicorn geotera.asgi:application --host 0.0.0.0 --port 8000 --reload
   ```
   *Health Check:* `http://localhost:8000/api/v1/health/`

---

### 2. Frontend Mobile Setup & Startup

1. **Install Dependencies:**
   ```bash
   cd frontend
   npm install --legacy-peer-deps
   ```

2. **Launch the Expo Development Server:**
   ```bash
   npx expo start
   ```
   - Press `w` to open in browser (Web preview with full SVG map and animation support).
   - Press `a` for Android emulator or scan QR code with Expo Go on iOS/Android.

---

## 🗺️ MVP Core Feature: Real-Time Trash Tracking

1. **State Machine (`StatusLifecycleBar`):**
   `SCHEDULED` ➔ `DRIVER_ASSIGNED` ➔ `PICKED_UP` ➔ `IN_TRANSIT` ➔ `DELIVERED_PROCESSED`
2. **Interactive Map Canvas (`MapCanvas.tsx`):**
   - Renders user pickup pin, recycling destination facility pin, and active routing corridor.
   - Live collector vehicle marker with animated radar pulse and real-time heading/speed telemetry HUD.
3. **Automated Telemetry Simulation (`services/socket.ts`):**
   - Click **"Simulate Trip"** on the Tracking screen to see a live 9-waypoint journey from the citizen's doorstep through the metropolitan corridor into GreenCycle Facility.
   - Upon facility arrival, automatically verifies scale weight, presents proof of delivery photo, awards points, and calculates carbon offset kg.

---

## 📁 Repository Structure

```
geotera/
├── backend/
│   ├── apps/
│   │   ├── users/            # User auth, citizen profiles, impact metrics
│   │   ├── drivers/          # Driver toggle status, truck capacity management
│   │   ├── facilities/       # Drop-off centers (recycling, composting, e-waste)
│   │   ├── trash_loads/      # Dispatch orders, categorization, volume tiers
│   │   ├── tracking/         # Telemetry events, WebSocket consumers, Socket.IO server
│   │   └── rewards/          # Gamification points catalog & vouchers
│   ├── geotera/              # Settings, ASGI routing (Socket.IO + Channels), WSGI
│   ├── schema.sql            # Supabase PostgreSQL + PostGIS SQL schema & RLS policies
│   ├── seed.py               # Foundational seed data generator
│   ├── run_server.py         # ASGI uvicorn launcher
│   └── requirements.txt      # Python dependencies
└── frontend/
    ├── app/
    │   └── (tabs)/
    │       ├── index.tsx     # Citizen Dashboard & Impact Overview
    │       ├── dispatch.tsx  # Waste Categorization & Dispatch Booking Form
    │       ├── tracking.tsx  # Real-Time Trash Tracking Map (MVP Core)
    │       ├── driver.tsx    # Collector Console & Capacity Management
    │       └── profile.tsx   # Rewards Marketplace & Historical Log
    ├── components/
    │   ├── MapCanvas.tsx            # SVG interactive real-time map
    │   ├── StatusLifecycleBar.tsx   # Trash lifecycle stage tracker
    │   ├── WasteCategoryPicker.tsx  # Waste & Volume selection cards
    │   └── TabBar.tsx               # Animated tab bar navigation
    ├── services/
    │   ├── api.ts            # REST API client
    │   └── socket.ts         # Socket.IO telemetry and simulation engine
    └── types/
        └── waste.ts          # TypeScript domain models
```

