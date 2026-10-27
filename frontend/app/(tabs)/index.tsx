import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Container from "@/components/Container";
import { StatusLifecycleBar } from "@/components/StatusLifecycleBar";
import { apiService, FALLBACK_LOAD } from "@/services/api";
import { TrashLoad } from "@/types/waste";

const Home = () => {
  const router = useRouter();
  const [activeLoad, setActiveLoad] = useState<TrashLoad>(FALLBACK_LOAD);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const loads = await apiService.getActiveLoads();
      if (loads.length > 0) {
        setActiveLoad(loads[0]);
      }
    } catch (e) {
      console.warn("Failed to fetch active loads:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <Container className="bg-base-100 px-5 pb-24 pt-14">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#58A399" />}
      >
        {/* Header Section */}
        <View className="mb-6 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-extrabold text-neutral">Geotera</Text>
            <Text className="text-sm font-medium text-accent">Smart Waste Telemetry</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/profile" as any)}
            className="h-10 w-10 items-center justify-center rounded-full bg-base-200"
          >
            <Ionicons name="notifications-outline" size={20} color="#F0E6FF" />
          </TouchableOpacity>
        </View>

        {/* Eco Rewards & Carbon Impact Header Card */}
        <View className="mb-6 rounded-3xl bg-accent p-6 shadow-lg">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xs font-semibold uppercase tracking-wider text-base-100/80">
                Eco-Reward Points
              </Text>
              <Text className="text-4xl font-extrabold text-base-100">
                {activeLoad.user?.reward_points_balance ?? 480} pts
              </Text>
            </View>
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-base-100/20">
              <MaterialCommunityIcons name="leaf" size={28} color="#1F1E22" />
            </View>
          </View>

          <View className="mt-4 flex-row items-center justify-between border-t border-base-100/20 pt-3">
            <View className="flex-row items-center">
              <Ionicons name="earth" size={16} color="#1F1E22" />
              <Text className="ml-1.5 text-xs font-bold text-base-100">
                34.5 kg CO2 Avoided
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/profile" as any)}
              className="rounded-full bg-base-100 px-3 py-1"
            >
              <Text className="text-xs font-bold text-accent">Redeem Rewards</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* MVP Core: Active Trash Load Dispatch Tracking Card */}
        <View className="mb-6 rounded-3xl border border-base-300 bg-base-200 p-5 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="mr-2 h-3 w-3 animate-ping rounded-full bg-primary" />
              <Text className="text-xs font-bold uppercase tracking-wider text-primary">
                Active Live Dispatch
              </Text>
            </View>
            <Text className="text-xs font-medium text-neutral/60">
              {activeLoad.tracking_number}
            </Text>
          </View>

          <View className="mt-3 flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-bold text-neutral">
                {activeLoad.waste_type} Waste
              </Text>
              <Text className="text-xs text-neutral/70">
                Est. {activeLoad.estimated_weight_kg} kg • {activeLoad.volume_tier}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/tracking" as any)}
              className="flex-row items-center rounded-xl bg-primary px-3.5 py-2"
            >
              <Ionicons name="navigate" size={14} color="#1F1E22" />
              <Text className="ml-1.5 text-xs font-bold text-base-100">Live Map</Text>
            </TouchableOpacity>
          </View>

          {/* Real-time Status Tracker */}
          <StatusLifecycleBar currentStatus={activeLoad.status} />

          <View className="mt-1 flex-row items-center justify-between rounded-xl bg-base-100/60 p-3">
            <View className="flex-row items-center">
              <Ionicons name="car-outline" size={18} color="#58A399" />
              <View className="ml-2">
                <Text className="text-xs font-bold text-neutral">
                  {activeLoad.driver?.vehicle_plate_number ?? "B 8421 GEO"}
                </Text>
                <Text className="text-[10px] text-neutral/60">
                  {activeLoad.driver?.vehicle_type ?? "Compactor Truck 2.5T"}
                </Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-xs font-semibold text-accent">
                Facility Destination
              </Text>
              <Text className="text-[10px] text-neutral/60">
                GreenCycle Facility
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Action: Schedule New Waste Pickup */}
        <View className="mb-6">
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/dispatch" as any)}
            activeOpacity={0.85}
            className="flex-row items-center justify-between rounded-2xl bg-primary p-4 shadow-md"
          >
            <View className="flex-row items-center">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-base-100/20">
                <Ionicons name="add" size={24} color="#1F1E22" />
              </View>
              <View className="ml-3">
                <Text className="text-base font-bold text-base-100">
                  Schedule Waste Pickup
                </Text>
                <Text className="text-xs text-base-100/80">
                  Instant dispatch or book for later
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#1F1E22" />
          </TouchableOpacity>
        </View>

        {/* Waste Categories Supported */}
        <Text className="mb-3 text-sm font-bold uppercase tracking-wider text-accent">
          Supported Recycling Streams
        </Text>
        <View className="flex-row flex-wrap justify-between gap-2.5">
          {[
            { name: "Plastics", icon: "water-outline", pts: "+20/kg" },
            { name: "Organics", icon: "leaf-outline", pts: "+10/kg" },
            { name: "E-Waste", icon: "hardware-chip-outline", pts: "+50/kg" },
            { name: "Hazardous", icon: "warning-outline", pts: "+35/kg" },
          ].map((item) => (
            <TouchableOpacity
              key={item.name}
              onPress={() => router.push("/(tabs)/dispatch" as any)}
              className="w-[48%] flex-row items-center justify-between rounded-2xl border border-base-300 bg-base-200 p-3.5"
            >
              <View className="flex-row items-center">
                <Ionicons name={item.icon as any} size={20} color="#58A399" />
                <Text className="ml-2 text-xs font-bold text-neutral">
                  {item.name}
                </Text>
              </View>
              <Text className="text-[10px] font-bold text-accent">{item.pts}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </Container>
  );
};

export default Home;
