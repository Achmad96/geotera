import React from 'react';
import { View, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LoadStatus } from '../types/waste';

interface Props {
  currentStatus: LoadStatus;
}

const STAGES: { key: LoadStatus; label: string; icon: any }[] = [
  { key: 'SCHEDULED', label: 'Scheduled', icon: 'calendar-outline' },
  { key: 'DRIVER_ASSIGNED', label: 'Assigned', icon: 'person-outline' },
  { key: 'PICKED_UP', label: 'Picked Up', icon: 'cube-outline' },
  { key: 'IN_TRANSIT', label: 'In Transit', icon: 'navigate-outline' },
  { key: 'DELIVERED_PROCESSED', label: 'Delivered', icon: 'checkmark-circle-outline' },
];

const STATUS_ORDER: Record<LoadStatus, number> = {
  SCHEDULED: 0,
  DRIVER_ASSIGNED: 1,
  PICKED_UP: 2,
  IN_TRANSIT: 3,
  DELIVERED_PROCESSED: 4,
  CANCELLED: -1,
};

export const StatusLifecycleBar: React.FC<Props> = ({ currentStatus }) => {
  const currentStep = STATUS_ORDER[currentStatus] ?? 0;

  return (
    <View className="my-3 rounded-2xl bg-base-200 p-4">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-xs font-semibold uppercase tracking-wider text-accent">
          Trash Lifecycle Status
        </Text>
        <View className="flex-row items-center rounded-full bg-accent/20 px-2.5 py-1">
          <View className="mr-1.5 h-2 w-2 rounded-full bg-accent" />
          <Text className="text-xs font-bold text-accent">
            {currentStatus.replace('_', ' ')}
          </Text>
        </View>
      </View>

      {/* Progress Dots & Lines */}
      <View className="flex-row items-center justify-between">
        {STAGES.map((stage, idx) => {
          const isPassed = idx <= currentStep;
          const isCurrent = idx === currentStep;

          return (
            <React.Fragment key={stage.key}>
              <View className="items-center">
                <View
                  className={`h-9 w-9 items-center justify-center rounded-full border-2 ${
                    isCurrent
                      ? 'border-accent bg-accent'
                      : isPassed
                      ? 'border-accent/80 bg-accent/30'
                      : 'border-base-300 bg-base-100'
                  }`}
                >
                  <Ionicons
                    name={isPassed && !isCurrent ? 'checkmark' : stage.icon}
                    size={16}
                    color={isCurrent ? '#1F1E22' : isPassed ? '#58A399' : '#8E8E93'}
                  />
                </View>
                <Text
                  className={`mt-1 text-[10px] font-medium ${
                    isCurrent ? 'font-bold text-accent' : isPassed ? 'text-neutral' : 'text-neutral/40'
                  }`}
                >
                  {stage.label}
                </Text>
              </View>

              {idx < STAGES.length - 1 && (
                <View
                  className={`mx-1 h-0.5 flex-1 ${
                    idx < currentStep ? 'bg-accent' : 'bg-base-300'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

