import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import Container from "@/components/Container";
import { apiService, FALLBACK_LOAD } from "@/services/api";
import { DriverProfile, LoadStatus } from "@/types/waste";

const DriverScreen = () => {
  const router = useRouter();

  const [driver, setDriver] = useState<DriverProfile>(FALLBACK_LOAD.driver!);
  const [isOnline, setIsOnline] = useState(true);
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [remainingCapacity, setRemainingCapacity] = useState("1950");
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("IN_TRANSIT");
  const [proofImage, setProofImage] = useState<string | null>(null);

  // Toggle online / broadcasting status
  const handleToggleOnline = async () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    try {
      await apiService.toggleDriverDuty(driver.id, nextState, isOnDuty, {
        latitude: -6.211,
        longitude: 106.843,
      });
    } catch (e) {
      console.warn("Toggle offline:", e);
    }
  };

  // Update Truck Remaining Capacity
  const handleUpdateCapacity = async () => {
    const kg = parseFloat(remainingCapacity);
    if (isNaN(kg) || kg < 0 || kg > driver.max_payload_kg) {
      Alert.alert(
        "Invalid Capacity",
        `Please enter a value between 0 and ${driver.max_payload_kg} kg.`
      );
      return;
    }

    try {
      const updated = await apiService.updateDriverCapacity(driver.id, kg);
      setDriver(updated);
      Alert.alert(
        "Capacity Updated",
        `Truck capacity is now set to ${kg} kg. Geotera dispatch algorithm will only assign loads <= this limit.`
      );
    } catch {
      setDriver((prev) => ({ ...prev, current_capacity_kg: kg }));
      Alert.alert("Capacity Saved", `Truck remaining capacity updated to ${kg} kg.`);
    }
  };

  // Transition Trash Load Status
  const handleAdvanceStatus = async (nextStatus: LoadStatus) => {
    setLoadStatus(nextStatus);
    try {
      await apiService.updateLoadStatus(
        FALLBACK_LOAD.id,
        nextStatus,
        26.4,
        proofImage || "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600"
      );
      Alert.alert("Status Updated", `Load transitioned to: ${nextStatus.replace("_", " ")}`);
    } catch (e) {
      console.warn("Status update fallback:", e);
    }
  };

  // Mock Camera Snap for Proof of Delivery
  const handleSnapProofOfDelivery = () => {
    // In mobile, expo-camera can capture; here we provide a verified drop-off snapshot
    const mockFacilityProof =
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600";
    setProofImage(mockFacilityProof);
    Alert.alert(
      "Proof Captured!",
      "Waste drop-off photo verified at GreenCycle Facility. Completing tracking loop and issuing rewards.",
      [
        {
          text: "Confirm Drop-off",
          onPress: () => handleAdvanceStatus("DELIVERED_PROCESSED"),
        },
      ]
    );
  };

  // Truck Capacity Bar percentage
  const capacityPct = Math.min(
    100,
    Math.round((parseFloat(remainingCapacity) / driver.max_payload_kg) * 100)
  );

  return (
    <Container className="bg-base-100 px-5 pb-24 pt-14">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-5 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-black text-neutral">
              Collector Console
            </Text>
            <Text className="text-xs text-neutral/60">
              Vehicle: {driver.vehicle_plate_number} • {driver.vehicle_type}
            </Text>
          </View>
          <View
            className={`rounded-full px-3 py-1 ${
              isOnline ? "bg-emerald-500/20" : "bg-red-500/20"
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                isOnline ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {isOnline ? "Broadcasting" : "Offline"}
            </Text>
          </View>
        </View>

        {/* 1. Live Broadcast Toggle */}
        <View className="mb-5 rounded-3xl border border-base-300 bg-base-200 p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View
                className={`h-10 w-10 items-center justify-center rounded-2xl ${
                  isOnline ? "bg-emerald-500/20" : "bg-base-300"
                }`}
              >
                <Ionicons
                  name="radio-outline"
                  size={20}
                  color={isOnline ? "#34D399" : "#777"}
                />
              </View>
              <View className="ml-3">
                <Text className="text-sm font-bold text-neutral">
                  Location & Telemetry Broadcast
                </Text>
                <Text className="text-xs text-neutral/60">
                  {isOnline
                    ? "Transmitting live GPS to dispatch & clients"
                    : "Telemetry paused"}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleToggleOnline}
              className={`rounded-xl px-4 py-2 ${
                isOnline ? "bg-emerald-500" : "bg-base-300"
              }`}
            >
              <Text className="text-xs font-extrabold text-base-100">
                {isOnline ? "ON" : "OFF"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Capacity Management */}
        <View className="mb-5 rounded-3xl border border-base-300 bg-base-200 p-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-bold uppercase tracking-wider text-accent">
              Truck Capacity Management
            </Text>
            <Text className="text-xs font-bold text-neutral">
              {capacityPct}% Available
            </Text>
          </View>

          {/* Progress Bar */}
          <View className="my-3 h-3 w-full overflow-hidden rounded-full bg-base-300">
            <View
              style={{ width: `${capacityPct}%` }}
              className={`h-full rounded-full ${
                capacityPct > 30 ? "bg-accent" : "bg-amber-400"
              }`}
            />
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-neutral/60">
              Max Payload: {driver.max_payload_kg} kg
            </Text>
            <Text className="text-xs font-bold text-accent">
              {remainingCapacity} kg remaining
            </Text>
          </View>

          {/* Capacity Input Adjustment */}
          <View className="mt-4 flex-row items-center gap-3">
            <View className="flex-1 rounded-xl bg-base-100 px-3 py-2 border border-base-300">
              <Text className="text-[10px] uppercase text-neutral/50">
                Update Remaining (kg)
              </Text>
              <TextInput
                value={remainingCapacity}
                onChangeText={setRemainingCapacity}
                keyboardType="numeric"
                className="text-base font-extrabold text-neutral"
              />
            </View>

            <TouchableOpacity
              onPress={handleUpdateCapacity}
              className="rounded-xl bg-accent px-4 py-3.5"
            >
              <Text className="text-xs font-extrabold text-base-100">
                Update Capacity
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Zone Geofenced Route Optimization */}
        <View className="mb-5 rounded-3xl border border-base-300 bg-base-200 p-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-bold uppercase tracking-wider text-accent">
              Geofence Zone Route Plan
            </Text>
            <View className="rounded-md bg-accent/20 px-2 py-0.5">
              <Text className="text-[10px] font-bold text-accent">Zone South-A</Text>
            </View>
          </View>

          <View className="mt-3 space-y-2">
            {[
              {
                stop: "1",
                addr: "Jl. Senopati No. 18 (Current Load)",
                type: "Plastic (25kg)",
                status: "Assigned",
                icon: "cube",
              },
              {
                stop: "2",
                addr: "Jl. Suryo No. 42",
                type: "Organic (30kg)",
                status: "Pending",
                icon: "leaf",
              },
              {
                stop: "3",
                addr: "GreenCycle Recovery Facility",
                type: "Drop-off",
                status: "Final Destination",
                icon: "business",
              },
            ].map((routeStop) => (
              <View
                key={routeStop.stop}
                className="my-1 flex-row items-center justify-between rounded-xl bg-base-100/70 p-3"
              >
                <View className="flex-row items-center">
                  <View className="h-6 w-6 items-center justify-center rounded-full bg-accent/30">
                    <Text className="text-xs font-bold text-accent">{routeStop.stop}</Text>
                  </View>
                  <View className="ml-3">
                    <Text className="text-xs font-bold text-neutral">{routeStop.addr}</Text>
                    <Text className="text-[10px] text-neutral/60">{routeStop.type}</Text>
                  </View>
                </View>
                <Text className="text-[10px] font-bold text-accent">{routeStop.status}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 4. Proof of Delivery Camera Verification */}
        <View className="mb-6 rounded-3xl border border-accent bg-accent/10 p-5">
          <Text className="text-xs font-bold uppercase tracking-wider text-accent">
            Proof of Delivery & Loop Completion
          </Text>
          <Text className="mt-1 text-xs text-neutral/70">
            Snap photo of sorted recyclables at facility scale to release user reward points.
          </Text>

          <TouchableOpacity
            onPress={handleSnapProofOfDelivery}
            activeOpacity={0.85}
            className="mt-4 flex-row items-center justify-center rounded-2xl bg-primary py-4 shadow-md"
          >
            <Ionicons name="camera" size={20} color="#1F1E22" />
            <Text className="ml-2 text-sm font-extrabold text-base-100">
              Snap Facility Proof Photo
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Container>
  );
};

export default DriverScreen;

