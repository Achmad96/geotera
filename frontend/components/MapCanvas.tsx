import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, {
  Path,
  Circle,
  Rect,
  Line,
  G,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { TelemetryPoint, LoadStatus } from '../types/waste';

interface Props {
  pickupLocation: { latitude: number; longitude: number; address: string };
  facilityLocation: { latitude: number; longitude: number; name: string };
  currentTelemetry?: TelemetryPoint | null;
  status: LoadStatus;
  isSimulating?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAP_WIDTH = SCREEN_WIDTH - 40;
const MAP_HEIGHT = 280;

export const MapCanvas: React.FC<Props> = ({
  pickupLocation,
  facilityLocation,
  currentTelemetry,
  status,
  isSimulating,
}) => {
  // Pulsing animation for active live telemetry radar ring
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.8);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withTiming(2.2, { duration: 1800, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );
    pulseOpacity.value = withRepeat(
      withTiming(0, { duration: 1800, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );
  }, []);

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  // Coordinate normalizer for canvas projection
  // Lat range: [-6.205, -6.245], Lng range: [106.815, 106.850]
  const minLat = -6.245;
  const maxLat = -6.205;
  const minLng = 106.815;
  const maxLng = 106.850;

  const projectToCanvas = (lat: number, lng: number) => {
    const clampedLat = Math.min(Math.max(lat, minLat), maxLat);
    const clampedLng = Math.min(Math.max(lng, minLng), maxLng);

    const x = ((clampedLng - minLng) / (maxLng - minLng)) * (MAP_WIDTH - 60) + 30;
    // Latitude decreases as you go south, so invert Y
    const y = ((maxLat - clampedLat) / (maxLat - minLat)) * (MAP_HEIGHT - 60) + 30;
    return { x, y };
  };

  const pickupPos = projectToCanvas(pickupLocation.latitude, pickupLocation.longitude);
  const facilityPos = projectToCanvas(facilityLocation.latitude, facilityLocation.longitude);

  const truckLat = currentTelemetry?.latitude ?? pickupLocation.latitude;
  const truckLng = currentTelemetry?.longitude ?? pickupLocation.longitude;
  const truckPos = projectToCanvas(truckLat, truckLng);

  // SVG route path string (smooth curved path)
  const midX = (pickupPos.x + facilityPos.x) / 2 + 25;
  const midY = (pickupPos.y + facilityPos.y) / 2 - 15;
  const routePathD = `M ${pickupPos.x} ${pickupPos.y} Q ${midX} ${midY} ${facilityPos.x} ${facilityPos.y}`;

  return (
    <View className="overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-xl">
      {/* Map Header / Live HUD */}
      <View className="flex-row items-center justify-between border-b border-base-300 bg-base-200/80 px-4 py-2.5">
        <View className="flex-row items-center">
          <View
            className={`mr-2 h-2.5 w-2.5 rounded-full ${
              isSimulating ? 'bg-emerald-400' : 'bg-accent'
            }`}
          />
          <Text className="text-xs font-bold text-neutral">
            {isSimulating ? 'LIVE TELEMETRY STREAM' : 'GEOLOCATION DISPATCH ROUTE'}
          </Text>
        </View>

        {currentTelemetry && (
          <View className="flex-row items-center gap-2">
            <View className="rounded-md bg-base-300 px-2 py-0.5">
              <Text className="text-[11px] font-bold text-accent">
                {currentTelemetry.speed_kmh.toFixed(1)} km/h
              </Text>
            </View>
            <View className="rounded-md bg-base-300 px-2 py-0.5">
              <Text className="text-[11px] font-medium text-neutral">
                {currentTelemetry.heading.toFixed(0)}°
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Interactive Map Visual Layer */}
      <View style={{ width: MAP_WIDTH, height: MAP_HEIGHT, position: 'relative' }}>
        <Svg width={MAP_WIDTH} height={MAP_HEIGHT}>
          <Defs>
            <LinearGradient id="routeGradient" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#37E8E2" stopOpacity="0.8" />
              <Stop offset="100%" stopColor="#58A399" stopOpacity="1" />
            </LinearGradient>
            <LinearGradient id="bgGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#252A34" stopOpacity="1" />
              <Stop offset="100%" stopColor="#1F1E22" stopOpacity="1" />
            </LinearGradient>
          </Defs>

          {/* Background Topographic Map Grid */}
          <Rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#bgGradient)" />

          {/* Road Network Grid Lines */}
          {[60, 120, 180, 240].map((y) => (
            <Line
              key={`h-${y}`}
              x1="0"
              y1={y}
              x2={MAP_WIDTH}
              y2={y}
              stroke="#344050"
              strokeWidth="0.8"
              strokeDasharray="4 6"
            />
          ))}
          {[80, 160, 240, 320].map((x) => (
            <Line
              key={`v-${x}`}
              x1={x}
              y1="0"
              x2={x}
              y2={MAP_HEIGHT}
              stroke="#344050"
              strokeWidth="0.8"
              strokeDasharray="4 6"
            />
          ))}

          {/* Zone Corridor */}
          <Path
            d={routePathD}
            stroke="#58A399"
            strokeWidth="8"
            strokeOpacity="0.2"
            fill="none"
          />

          {/* Active Navigation Route */}
          <Path
            d={routePathD}
            stroke="url(#routeGradient)"
            strokeWidth="3.5"
            strokeDasharray="6 4"
            fill="none"
          />

          {/* Destination Recycling Facility Pin */}
          <G x={facilityPos.x} y={facilityPos.y}>
            <Circle r="12" fill="#58A399" fillOpacity="0.3" />
            <Circle r="7" fill="#58A399" />
            <Circle r="3.5" fill="#FFFFFF" />
          </G>

          {/* User Pickup Location Pin */}
          <G x={pickupPos.x} y={pickupPos.y}>
            <Circle r="12" fill="#37E8E2" fillOpacity="0.3" />
            <Circle r="7" fill="#37E8E2" />
            <Circle r="3.5" fill="#1F1E22" />
          </G>
        </Svg>

        {/* Live Truck Marker with Animated Radar Pulse Overlay */}
        <View
          style={{
            position: 'absolute',
            left: truckPos.x - 18,
            top: truckPos.y - 18,
            width: 36,
            height: 36,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Animated radar wave */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: 'rgba(55, 232, 226, 0.4)',
              },
              animatedPulseStyle,
            ]}
          />
          {/* Truck Badge */}
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: '#58A399',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: '#FFFFFF',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.4,
              shadowRadius: 3,
            }}
          >
            <Ionicons name="car" size={15} color="#FFFFFF" />
          </View>
        </View>

        {/* Pin Labels */}
        <View
          style={{
            position: 'absolute',
            left: Math.max(10, pickupPos.x - 50),
            top: pickupPos.y + 12,
            backgroundColor: 'rgba(31, 30, 34, 0.85)',
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: '#37E8E2',
          }}
        >
          <Text className="text-[10px] font-bold text-[#37E8E2]">Pickup Address</Text>
        </View>

        <View
          style={{
            position: 'absolute',
            left: Math.max(10, facilityPos.x - 65),
            top: facilityPos.y - 32,
            backgroundColor: 'rgba(31, 30, 34, 0.85)',
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: '#58A399',
          }}
        >
          <Text className="text-[10px] font-bold text-[#58A399]">GreenCycle Facility</Text>
        </View>
      </View>

      {/* Bottom Route Status Strip */}
      <View className="flex-row items-center justify-between border-t border-base-300 bg-base-200/90 px-4 py-3">
        <View className="flex-1 pr-2">
          <Text className="text-[11px] font-medium text-neutral/60">CURRENT LOCATION</Text>
          <Text className="text-xs font-semibold text-neutral" numberOfLines={1}>
            {currentTelemetry?.description || 'En route between pickup and facility'}
          </Text>
        </View>
        {currentTelemetry?.step && (
          <View className="items-end">
            <Text className="text-[10px] font-bold text-accent">
              Waypoint {currentTelemetry.step} / {currentTelemetry.total_steps}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

