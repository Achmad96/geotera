import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Container from "@/components/Container";
import { apiService } from "@/services/api";
import { RewardItem } from "@/types/waste";

const ProfileScreen = () => {
  const [points, setPoints] = useState(480);
  const [carbonSaved, setCarbonSaved] = useState(34.5);
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [isRedeeming, setIsRedeeming] = useState(false);

  useEffect(() => {
    apiService.getRewards().then((items) => setRewards(items));
  }, []);

  const handleRedeem = (reward: RewardItem) => {
    if (points < reward.points_required) {
      Alert.alert(
        "Insufficient Points",
        `You need ${reward.points_required} points for this reward. Keep sorting and dispatching recyclables!`
      );
      return;
    }

    setIsRedeeming(true);
    setTimeout(() => {
      setPoints((prev) => prev - reward.points_required);
      setIsRedeeming(false);
      const code = `GEO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      Alert.alert(
        "Reward Redeemed!",
        `Successfully redeemed: ${reward.title}\n\nVoucher Code: ${code}\nPoints deducted: ${reward.points_required}`
      );
    }, 600);
  };

  return (
    <Container className="bg-base-100 px-5 pb-24 pt-14">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View className="mb-6 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-accent">
              <Text className="text-xl font-extrabold text-base-100">AJ</Text>
            </View>
            <View className="ml-3">
              <Text className="text-lg font-bold text-neutral">Alex Johnson</Text>
              <Text className="text-xs text-accent">Eco-Warrior Tier 2</Text>
            </View>
          </View>
          <View className="rounded-full bg-accent/20 px-3 py-1">
            <Text className="text-xs font-bold text-accent">Verified Citizen</Text>
          </View>
        </View>

        {/* Gamification Points & Carbon Metrics Card */}
        <View className="mb-6 rounded-3xl bg-accent p-6 shadow-xl">
          <Text className="text-xs font-bold uppercase tracking-wider text-base-100/80">
            Total Points Balance
          </Text>
          <Text className="text-4xl font-black text-base-100">{points} pts</Text>

          <View className="mt-4 flex-row items-center justify-between border-t border-base-100/20 pt-4">
            <View>
              <Text className="text-[11px] font-semibold text-base-100/80">
                Landfill Diverted
              </Text>
              <Text className="text-lg font-extrabold text-base-100">
                85.4 kg
              </Text>
            </View>

            <View className="items-end">
              <Text className="text-[11px] font-semibold text-base-100/80">
                Carbon Offset
              </Text>
              <Text className="text-lg font-extrabold text-base-100">
                {carbonSaved.toFixed(1)} kg CO2
              </Text>
            </View>
          </View>
        </View>

        {/* Reward Marketplace */}
        <Text className="mb-3 text-sm font-bold uppercase tracking-wider text-accent">
          Redeem Eco-Rewards & Vouchers
        </Text>
        <View className="mb-6 space-y-3">
          {rewards.map((reward) => {
            const canAfford = points >= reward.points_required;
            return (
              <View
                key={reward.id}
                className="my-1.5 rounded-2xl border border-base-300 bg-base-200 p-4"
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 pr-3">
                    <Text className="text-sm font-bold text-neutral">
                      {reward.title}
                    </Text>
                    <Text className="mt-0.5 text-xs text-neutral/60">
                      {reward.description}
                    </Text>
                    <Text className="mt-2 text-xs font-extrabold text-accent">
                      {reward.points_required} Points
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleRedeem(reward)}
                    disabled={!canAfford || isRedeeming}
                    className={`rounded-xl px-4 py-2 ${
                      canAfford ? "bg-primary" : "bg-base-300 opacity-60"
                    }`}
                  >
                    <Text className="text-xs font-bold text-base-100">
                      {canAfford ? "Redeem" : "Locked"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* Pickup & Environmental Impact Transaction History */}
        <Text className="mb-3 text-sm font-bold uppercase tracking-wider text-accent">
          Pickup History & Audit Log
        </Text>
        <View className="mb-6 space-y-2">
          {[
            {
              id: "GEO-20261026-X491",
              date: "Yesterday",
              type: "Recyclable Plastics (18.2 kg)",
              facility: "GreenCycle Recovery",
              pts: "+360 pts",
              co2: "27.3 kg CO2",
            },
            {
              id: "GEO-20261022-P108",
              date: "Oct 22, 2026",
              type: "Organic Composting (32.0 kg)",
              facility: "EcoBio Composting",
              pts: "+320 pts",
              co2: "27.2 kg CO2",
            },
            {
              id: "GEO-20261015-E882",
              date: "Oct 15, 2026",
              type: "E-Waste Batteries (4.5 kg)",
              facility: "Certified E-Depot",
              pts: "+225 pts",
              co2: "14.4 kg CO2",
            },
          ].map((tx) => (
            <View
              key={tx.id}
              className="my-1 rounded-2xl border border-base-300 bg-base-200 p-3.5"
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-bold text-neutral">{tx.type}</Text>
                <Text className="text-xs font-extrabold text-accent">{tx.pts}</Text>
              </View>
              <View className="mt-1 flex-row items-center justify-between">
                <Text className="text-[10px] text-neutral/60">
                  {tx.id} • {tx.date}
                </Text>
                <Text className="text-[10px] text-primary">{tx.co2}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </Container>
  );
};

export default ProfileScreen;
