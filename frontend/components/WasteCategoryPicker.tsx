import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { WasteType, VolumeTier } from '../types/waste';

interface Props {
  selectedCategory: WasteType;
  onSelectCategory: (type: WasteType) => void;
  selectedVolume: VolumeTier;
  onSelectVolume: (tier: VolumeTier) => void;
}

interface CategoryInfo {
  type: WasteType;
  title: string;
  desc: string;
  icon: any;
  pointsRate: string;
  co2Rate: string;
}

const CATEGORIES: CategoryInfo[] = [
  {
    type: 'PLASTIC',
    title: 'Recyclable Plastic',
    desc: 'PET bottles, HDPE containers, clean packaging',
    icon: 'water-outline',
    pointsRate: '20 pts/kg',
    co2Rate: '1.50 kg CO2/kg',
  },
  {
    type: 'ORGANIC',
    title: 'Organic / Compost',
    desc: 'Food scraps, yard trimmings, coffee grounds',
    icon: 'leaf-outline',
    pointsRate: '10 pts/kg',
    co2Rate: '0.85 kg CO2/kg',
  },
  {
    type: 'E_WASTE',
    title: 'Electronic Waste',
    desc: 'Laptops, chargers, batteries, discarded phones',
    icon: 'hardware-chip-outline',
    pointsRate: '50 pts/kg',
    co2Rate: '3.20 kg CO2/kg',
  },
  {
    type: 'HAZARDOUS',
    title: 'Hazardous Waste',
    desc: 'Paints, solvents, fluorescents, chemicals',
    icon: 'warning-outline',
    pointsRate: '35 pts/kg',
    co2Rate: '2.10 kg CO2/kg',
  },
  {
    type: 'BULKY',
    title: 'Bulky Waste',
    desc: 'Furniture, mattresses, large appliances',
    icon: 'cube-outline',
    pointsRate: '15 pts/kg',
    co2Rate: '1.10 kg CO2/kg',
  },
  {
    type: 'MIXED',
    title: 'Mixed Solid Waste',
    desc: 'Non-sorted household residual trash',
    icon: 'trash-outline',
    pointsRate: '5 pts/kg',
    co2Rate: '0.20 kg CO2/kg',
  },
];

const VOLUMES: { tier: VolumeTier; label: string; estKg: number; icon: any }[] = [
  { tier: 'SMALL', label: 'Small (1-2 bags)', estKg: 10, icon: 'bag-handle-outline' },
  { tier: 'MEDIUM', label: 'Medium (1 bin)', estKg: 30, icon: 'trash-outline' },
  { tier: 'LARGE', label: 'Large (Multiple)', estKg: 80, icon: 'albums-outline' },
  { tier: 'TRUCKLOAD', label: 'Truckload', estKg: 200, icon: 'car-outline' },
];

export const WasteCategoryPicker: React.FC<Props> = ({
  selectedCategory,
  onSelectCategory,
  selectedVolume,
  onSelectVolume,
}) => {
  return (
    <View className="mb-4">
      {/* Waste Category Selection */}
      <Text className="mb-2 text-sm font-bold uppercase tracking-wider text-accent">
        1. Select Waste Category
      </Text>
      <View className="flex-row flex-wrap justify-between gap-2.5">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.type;
          return (
            <TouchableOpacity
              key={cat.type}
              activeOpacity={0.8}
              onPress={() => onSelectCategory(cat.type)}
              className={`w-[48%] rounded-2xl border p-3.5 ${
                isSelected
                  ? 'border-accent bg-accent/20'
                  : 'border-base-300 bg-base-200'
              }`}
            >
              <View className="flex-row items-center justify-between">
                <View
                  className={`h-9 w-9 items-center justify-center rounded-xl ${
                    isSelected ? 'bg-accent text-base-100' : 'bg-base-300'
                  }`}
                >
                  <Ionicons
                    name={cat.icon}
                    size={20}
                    color={isSelected ? '#1F1E22' : '#58A399'}
                  />
                </View>
                <View className="rounded-md bg-accent/30 px-1.5 py-0.5">
                  <Text className="text-[10px] font-bold text-accent">
                    {cat.pointsRate}
                  </Text>
                </View>
              </View>

              <Text className="mt-2 text-sm font-bold text-neutral">
                {cat.title}
              </Text>
              <Text className="mt-0.5 text-[11px] leading-4 text-neutral/60" numberOfLines={2}>
                {cat.desc}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Volume Tier Selection */}
      <Text className="mb-2 mt-5 text-sm font-bold uppercase tracking-wider text-accent">
        2. Estimated Volume / Payload
      </Text>
      <View className="flex-row justify-between gap-2">
        {VOLUMES.map((vol) => {
          const isSelected = selectedVolume === vol.tier;
          return (
            <TouchableOpacity
              key={vol.tier}
              activeOpacity={0.8}
              onPress={() => onSelectVolume(vol.tier)}
              className={`flex-1 items-center rounded-2xl border py-3 px-1 ${
                isSelected
                  ? 'border-primary bg-primary/20'
                  : 'border-base-300 bg-base-200'
              }`}
            >
              <Ionicons
                name={vol.icon}
                size={22}
                color={isSelected ? '#37E8E2' : '#A0A0A0'}
              />
              <Text
                className={`mt-1 text-center text-xs font-semibold ${
                  isSelected ? 'text-primary' : 'text-neutral'
                }`}
              >
                {vol.tier}
              </Text>
              <Text className="text-[10px] text-neutral/50">~{vol.estKg} kg</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

