import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import Container from "@/components/Container";
import { WasteCategoryPicker } from "@/components/WasteCategoryPicker";
import { WasteType, VolumeTier } from "@/types/waste";
import { apiService } from "@/services/api";

const DispatchScreen = () => {
  const router = useRouter();

  const [wasteType, setWasteType] = useState<WasteType>("PLASTIC");
  const [volumeTier, setVolumeTier] = useState<VolumeTier>("MEDIUM");
  const [address, setAddress] = useState(
    "Jl. Senopati No. 18, Kebayoran Baru, Jakarta Selatan"
  );
  const [notes, setNotes] = useState("Two recycling bags placed outside garage gate");
  const [isImmediate, setIsImmediate] = useState(true);
  const [scheduledDate, setScheduledDate] = useState("Tomorrow at 09:00 AM");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic point & carbon calculations based on waste type and volume
  const getEstimatedWeight = (tier: VolumeTier) => {
    switch (tier) {
      case "SMALL":
        return 10;
      case "MEDIUM":
        return 25;
      case "LARGE":
        return 75;
      case "TRUCKLOAD":
        return 200;
    }
  };

  const getMultipliers = (type: WasteType) => {
    switch (type) {
      case "PLASTIC":
        return { pts: 20, co2: 1.5 };
      case "ORGANIC":
        return { pts: 10, co2: 0.85 };
      case "E_WASTE":
        return { pts: 50, co2: 3.2 };
      case "HAZARDOUS":
        return { pts: 35, co2: 2.1 };
      case "BULKY":
        return { pts: 15, co2: 1.1 };
      default:
        return { pts: 5, co2: 0.2 };
    }
  };

  const weight = getEstimatedWeight(volumeTier);
  const multipliers = getMultipliers(wasteType);
  const estimatedPoints = Math.round(weight * multipliers.pts);
  const estimatedCo2 = (weight * multipliers.co2).toFixed(1);

  const handleSubmit = async () => {
    if (!address.trim()) {
      Alert.alert("Missing Address", "Please provide a valid pickup location.");
      return;
    }

    setIsSubmitting(true);
    try {
      const load = await apiService.createBooking({
        waste_type: wasteType,
        volume_tier: volumeTier,
        estimated_weight_kg: weight,
        pickup_address: address,
        pickup_latitude: -6.2088,
        pickup_longitude: 106.8456,
        pickup_notes: notes,
        is_immediate_dispatch: isImmediate,
      });

      setIsSubmitting(false);
      Alert.alert(
        "Dispatch Confirmed!",
        `Your ${wasteType} pickup has been scheduled (${load.tracking_number}). Connecting to live tracking telemetry.`,
        [
          {
            text: "Track Now",
            onPress: () => router.push("/(tabs)/tracking" as any),
          },
        ]
      );
    } catch {
      setIsSubmitting(false);
      router.push("/(tabs)/tracking" as any);
    }
  };

  return (
    <Container className="bg-base-100 px-5 pb-24 pt-14">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-5 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-black text-neutral">
              Book Waste Dispatch
            </Text>
            <Text className="text-xs text-neutral/60">
              Categorize, schedule, and track to facility
            </Text>
          </View>
          <View className="rounded-full bg-accent/20 px-3 py-1">
            <Text className="text-xs font-bold text-accent">Smart Dispatch</Text>
          </View>
        </View>

        {/* Waste Categorization Component */}
        <WasteCategoryPicker
          selectedCategory={wasteType}
          onSelectCategory={setWasteType}
          selectedVolume={volumeTier}
          onSelectVolume={setVolumeTier}
        />

        {/* Dispatch Scheduling Toggle */}
        <Text className="mb-2 text-sm font-bold uppercase tracking-wider text-accent">
          3. Dispatch Timing
        </Text>
        <View className="mb-5 flex-row gap-3">
          <TouchableOpacity
            onPress={() => setIsImmediate(true)}
            className={`flex-1 flex-row items-center justify-center rounded-2xl border p-3.5 ${
              isImmediate
                ? "border-primary bg-primary/20"
                : "border-base-300 bg-base-200"
            }`}
          >
            <Ionicons
              name="flash-outline"
              size={18}
              color={isImmediate ? "#37E8E2" : "#A0A0A0"}
            />
            <Text
              className={`ml-2 text-xs font-bold ${
                isImmediate ? "text-primary" : "text-neutral"
              }`}
            >
              Pickup Now (On-Demand)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsImmediate(false)}
            className={`flex-1 flex-row items-center justify-center rounded-2xl border p-3.5 ${
              !isImmediate
                ? "border-primary bg-primary/20"
                : "border-base-300 bg-base-200"
            }`}
          >
            <Ionicons
              name="calendar-outline"
              size={18}
              color={!isImmediate ? "#37E8E2" : "#A0A0A0"}
            />
            <Text
              className={`ml-2 text-xs font-bold ${
                !isImmediate ? "text-primary" : "text-neutral"
              }`}
            >
              Schedule Later
            </Text>
          </TouchableOpacity>
        </View>

        {!isImmediate && (
          <View className="mb-5 rounded-2xl border border-base-300 bg-base-200 p-3.5">
            <Text className="text-xs font-semibold text-neutral/70">
              Selected Time Slot:
            </Text>
            <TextInput
              value={scheduledDate}
              onChangeText={setScheduledDate}
              className="mt-1 text-sm font-bold text-accent"
              placeholder="e.g. Tomorrow at 10:00 AM"
              placeholderTextColor="#777"
            />
          </View>
        )}

        {/* Pickup Location & Notes */}
        <Text className="mb-2 text-sm font-bold uppercase tracking-wider text-accent">
          4. Geolocation & Address
        </Text>
        <View className="mb-5 rounded-2xl border border-base-300 bg-base-200 p-4">
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={18} color="#58A399" />
            <Text className="ml-2 text-xs font-bold text-neutral">
              Pickup Address
            </Text>
          </View>
          <TextInput
            value={address}
            onChangeText={setAddress}
            className="mt-2 text-xs font-medium text-neutral"
            placeholder="Enter full street address"
            placeholderTextColor="#666"
            multiline
          />

          <View className="mt-3 border-t border-base-300 pt-3">
            <Text className="text-[11px] font-semibold text-neutral/60">
              Collector Instructions / Notes:
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              className="mt-1 text-xs text-neutral"
              placeholder="e.g. Front porch, ring buzzer #4"
              placeholderTextColor="#666"
            />
          </View>
        </View>

        {/* Environmental Reward Forecast Card */}
        <View className="mb-6 rounded-2xl bg-accent/20 border border-accent p-4">
          <Text className="text-xs font-bold uppercase tracking-wider text-accent">
            Estimated Environmental Impact & Rewards
          </Text>
          <View className="mt-3 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="gift-outline" size={20} color="#58A399" />
              <View className="ml-2">
                <Text className="text-xs text-neutral/70">Reward Points</Text>
                <Text className="text-base font-extrabold text-accent">
                  +{estimatedPoints} pts
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <Ionicons name="leaf-outline" size={20} color="#37E8E2" />
              <View className="ml-2">
                <Text className="text-xs text-neutral/70">CO2 Avoided</Text>
                <Text className="text-base font-extrabold text-primary">
                  ~{estimatedCo2} kg
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Submit Booking Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.85}
          className={`flex-row items-center justify-center rounded-2xl py-4 shadow-lg ${
            isSubmitting ? "bg-base-300" : "bg-primary"
          }`}
        >
          <Ionicons name="paper-plane" size={18} color="#1F1E22" />
          <Text className="ml-2 text-base font-extrabold text-base-100">
            {isSubmitting ? "Dispatching..." : "Confirm & Dispatch Pickup"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </Container>
  );
};

export default DispatchScreen;

