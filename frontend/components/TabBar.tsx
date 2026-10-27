import React, { useEffect } from "react";
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from "react-native-reanimated";
import Ionicons from "@expo/vector-icons/Ionicons";
import TabBarButton from "@/components/TabBarButton";

import { View, Dimensions } from "react-native";
import { BottomTabBarProps } from "expo-router/tabs";
import { StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/utils/tailwindMerge";

const isClassNotFilled = (className: string) => {
  return !className ? "" : className;
};

export default function TabBar({
  state,
  descriptors,
  emitter,
  navigateToTab,
}: BottomTabBarProps) {
  const [currentTheme] = useTheme();
  const indicatorPosition = useSharedValue(0);
  const screenWidth = Dimensions.get("window").width;
  const tabWidth = screenWidth / state.routes.length;

  useEffect(() => {
    indicatorPosition.value = withSpring(state.index * tabWidth, {
      damping: 20,
      stiffness: 100,
    });
  }, [state.index, tabWidth]);

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: indicatorPosition.value }],
      width: tabWidth,
    };
  });

  const stylesheet = StyleSheet.create({
    container: {
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
    indicator: {
      position: "absolute",
      height: 3,
      backgroundColor: `rgb(88, 163, 153)`,
      bottom: 0,
    },
  });

  return (
    <View
      style={[stylesheet.container, currentTheme]}
      className="h-16 flex-row bg-base-100"
    >
      <Animated.View style={[stylesheet.indicator, animatedIndicatorStyle]} />
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;
        const isFocused = state.index === index;
        const icons: any = {
          index: ({ className, ...props }: any) => (
            <Ionicons
              name="home-outline"
              className={cn(`text-neutral ${isClassNotFilled(className)}`)}
              {...props}
            />
          ),
          dispatch: ({ className, ...props }: any) => (
            <Ionicons
              name="add-circle-outline"
              className={cn(`text-neutral ${isClassNotFilled(className)}`)}
              {...props}
            />
          ),
          tracking: ({ className, ...props }: any) => (
            <Ionicons
              name="map-outline"
              className={cn(`text-neutral ${isClassNotFilled(className)}`)}
              {...props}
            />
          ),
          driver: ({ className, ...props }: any) => (
            <Ionicons
              name="car-outline"
              className={cn(`text-neutral ${isClassNotFilled(className)}`)}
              {...props}
            />
          ),
          camera: ({ className, ...props }: any) => (
            <Ionicons
              name="camera-outline"
              className={cn(`text-neutral ${isClassNotFilled(className)}`)}
              {...props}
            />
          ),
          profile: ({ className, ...props }: any) => (
            <Ionicons
              name="person-outline"
              className={cn(`text-neutral ${isClassNotFilled(className)}`)}
              {...props}
            />
          ),
        };

        const onPress = () => {
          const event = emitter.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigateToTab(route.key);
          }
        };

        const onLongPress = () => {
          emitter.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };
        return (
          <TabBarButton
            key={route.name}
            routeName={route.name}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            icons={icons}
            isFocused={isFocused}
            label={label as string}
            onLongPress={onLongPress}
            onPress={onPress}
          />
        );
      })}
    </View>
  );
}
