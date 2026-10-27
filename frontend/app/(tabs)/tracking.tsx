import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Container from "@/components/Container";
import { MapCanvas } from "@/components/MapCanvas";
import { StatusLifecycleBar } from "@/components/StatusLifecycleBar";
import { TrashLoad, TelemetryPoint, LoadStatus } from "@/types/waste";
import { apiService, FALLBACK_LOAD } from "@/services/api";
import { socketService } from "@/services/socket";

const TrackingScreen = () => {
  const [load, setLoad] = useState<TrashLoad>(FALLBACK_LOAD);
  const [telemetry, setTelemetry] = useState<TelemetryPoint | null>({
    load_id: FALLBACK_LOAD.id,
    driver_name: "Budi Santoso (Truck #B-8421-GEO)",
    latitude: FALLBACK_LOAD.pickup_latitude,
    longitude: FALLBACK_LOAD.pickup_longitude,
    speed_kmh: 0,
    heading: 180,
    status: FALLBACK_LOAD.status,
    description: "Collector dispatched and en route",
    step: 1,
    total_steps: 9,
    timestamp: new Date().toISOString(),
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const [completionData, setCompletionData] = useState<any | null>(null);

  // Initialize Socket.io connection & telemetry listeners
  useEffect(() => {
    socketService.connect(load.id);

    socketService.onTelemetryUpdate((point: TelemetryPoint) => {
      setTelemetry(point);
      if (point.status && point.status !== load.status) {
        setLoad((prev) => ({ ...prev, status: point.status }));
      }
    });

    socketService.onStatusChanged((data: any) => {
      if (data.status) {
        setLoad((prev) => ({ ...prev, status: data.status }));
      }
    });

    socketService.onTripCompleted((data: any) => {
      setIsSimulating(false);
      setCompletionData(data);
      setLoad((prev) => ({
        ...prev,
        status: "DELIVERED_PROCESSED",
        points_awarded: data.points_awarded,
        carbon_offset_kg: data.carbon_offset_kg,
        proof_image_url: data.proof_image_url,
      }));
    });

    return () => {
      socketService.disconnect();
    };
  }, [load.id]);

  // Start or Stop the Real-Time Simulated Tracking Loop
  const handleToggleSimulation = () => {
    if (isSimulating) {
      socketService.stopSimulation();
      setIsSimulating(false);
    } else {
      setCompletionData(null);
      setIsSimulating(true);
      setLoad((prev) => ({ ...prev, status: "DRIVER_ASSIGNED" }));

      socketService.triggerLiveSimulation(
        load.id,
        (point) => {
          setTelemetry(point);
          setLoad((prev) => ({ ...prev, status: point.status }));
        },
        (complete) => {
          setIsSimulating(false);
          setCompletionData(complete);
          setLoad((prev) => ({
            ...prev,
            status: "DELIVERED_PROCESSED",
            points_awarded: complete.points_awarded,
            carbon_offset_kg: complete.carbon_offset_kg,
            proof_image_url: complete.proof_image_url,
          }));
        }
      );
    }
  };

  return (
    <Container className="bg-base-100 px-5 pb-24 pt-14">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-black text-neutral">
              Live Trash Tracking
            </Text>
            <Text className="text-xs font-semibold text-accent">
              Telemetry Room: {load.tracking_number}
            </Text>
          </View>
          <View className="flex-row items-center rounded-full bg-emerald-500/20 px-3 py-1">
            <View className="mr-1.5 h-2 w-2 rounded-full bg-emerald-400" />
            <Text className="text-[11px] font-bold text-emerald-400">
              Socket.IO Live
            </Text>
          </View>
        </View>

        {/* 1. Core Map Canvas (Interactive SVG Route & Animated Vehicle Pulse) */}
        <MapCanvas
          pickupLocation={{
            latitude: load.pickup_latitude,
            longitude: load.pickup_longitude,
            address: load.pickup_address,
          }}
          facilityLocation={{
            latitude: load.destination_facility?.latitude ?? -6.2395,
            longitude: load.destination_facility?.longitude ?? 106.822,
            name: load.destination_facility?.name ?? "GreenCycle Facility",
          }}
          currentTelemetry={telemetry}
          status={load.status}
          isSimulating={isSimulating}
        />

        {/* 2. Trash Lifecycle State Management Tracker */}
        <StatusLifecycleBar currentStatus={load.status} />

        {/* 3. Real-Time Telemetry Simulation Control */}
        <View className="mb-5 rounded-3xl border border-base-300 bg-base-200 p-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xs font-bold uppercase tracking-wider text-accent">
                MVP Tracking Demonstration
              </Text>
              <Text className="text-xs text-neutral/70">
                Simulate driver GPS telemetry loop
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleToggleSimulation}
              activeOpacity={0.8}
              className={`flex-row items-center rounded-xl px-4 py-2.5 ${
                isSimulating ? "bg-red-500" : "bg-primary"
              }`}
            >
              <Ionicons
                name={isSimulating ? "stop" : "play"}
                size={16}
                color="#1F1E22"
              />
              <Text className="ml-1.5 text-xs font-extrabold text-base-100">
                {isSimulating ? "Stop Telemetry" : "Simulate Trip"}
              </Text>
            </TouchableOpacity>
          </View>

          {isSimulating && (
            <View className="mt-3 flex-row items-center rounded-xl bg-base-300/80 p-2.5">
              <View className="mr-2 h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
              <Text className="text-[11px] font-medium text-neutral/90">
                Broadcasting GPS telemetry every 2.0s along metropolitan route...
              </Text>
            </View>
          )}
        </View>

        {/* 4. Driver & Vehicle Information Card */}
        <View className="mb-5 rounded-3xl border border-base-300 bg-base-200 p-4">
          <Text className="mb-3 text-xs font-bold uppercase tracking-wider text-accent">
            Assigned Collector Vehicle
          </Text>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-base-300">
                <Ionicons name="car" size={26} color="#58A399" />
              </View>
              <View className="ml-3">
                <Text className="text-sm font-bold text-neutral">
                  {load.driver?.vehicle_plate_number ?? "B 8421 GEO"}
                </Text>
                <Text className="text-xs text-neutral/60">
                  {load.driver?.vehicle_type ?? "Compactor Truck 2.5T"}
                </Text>
              </View>
            </View>

            <View className="items-end">
              <View className="flex-row items-center">
                <Ionicons name="star" size={14} color="#FBBF24" />
                <Text className="ml-1 text-xs font-bold text-neutral">
                  {load.driver?.rating ?? "4.95"}
                </Text>
              </View>
              <Text className="text-[10px] text-neutral/60">
                {load.driver?.total_trips_completed ?? 142} trips completed
              </Text>
            </View>
          </View>

          <View className="mt-3 flex-row justify-between border-t border-base-300 pt-3">
            <View>
              <Text className="text-[10px] uppercase text-neutral/50">Waste Category</Text>
              <Text className="text-xs font-bold text-accent">{load.waste_type}</Text>
            </View>
            <View>
              <Text className="text-[10px] uppercase text-neutral/50">Payload Est.</Text>
              <Text className="text-xs font-bold text-neutral">{load.estimated_weight_kg} kg</Text>
            </View>
            <View>
              <Text className="text-[10px] uppercase text-neutral/50">Truck Capacity</Text>
              <Text className="text-xs font-bold text-emerald-400">
                {load.driver?.current_capacity_kg ?? 1950} kg left
              </Text>
            </View>
          </View>
        </View>

        {/* 5. Completion & Proof of Delivery Card (Displayed once delivered) */}
        {load.status === "DELIVERED_PROCESSED" && (
          <View className="mb-6 rounded-3xl border border-emerald-500/50 bg-emerald-950/20 p-5 shadow-lg">
            <View className="flex-row items-center">
              <View className="h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/30">
                <Ionicons name="checkmark-done" size={24} color="#34D399" />
              </View>
              <View className="ml-3">
                <Text className="text-base font-extrabold text-emerald-400">
                  Tracking Loop Completed!
                </Text>
                <Text className="text-xs text-neutral/70">
                  Waste delivered to GreenCycle Facility
                </Text>
              </View>
            </View>

            {/* Proof of Delivery Photo */}
            <View className="mt-4 overflow-hidden rounded-2xl bg-base-300">
              <Image
                source={{
                  uri:
                    load.proof_image_url ||
                    "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600",
                }}
                className="h-40 w-full"
                resizeMode="cover"
              />
              <View className="p-3">
                <Text className="text-[11px] font-bold text-accent">
                  Verified Facility Weight: 26.4 kg Sorted Recyclables
                </Text>
                <Text className="text-[10px] text-neutral/60">
                  Timestamp: {new Date().toLocaleTimeString()} • Inspector: GreenCycle Staff
                </Text>
              </View>
            </View>

            {/* Reward Points Credited */}
            <View className="mt-4 flex-row items-center justify-between rounded-xl bg-accent/20 p-3">
              <View className="flex-row items-center">
                <Ionicons name="gift" size={20} color="#58A399" />
                <Text className="ml-2 text-xs font-bold text-neutral">
                  Eco-Warrior Points Earned
                </Text>
              </View>
              <Text className="text-sm font-extrabold text-accent">
                +{load.points_awarded || 120} pts
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </Container>
  );
};

export default TrackingScreen;

