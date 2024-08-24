import { useTheme } from "@/hooks/useTheme";
import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useAnimatedStyle, withTiming } from "react-native-reanimated";
import Ionicons from "@expo/vector-icons/Ionicons";

import Animated from "react-native-reanimated";

const ThemeSettings = () => {
  const [_, setCurrentTheme] = useTheme();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const rotateStyle = useAnimatedStyle(() => {
    const rotateValue = isOpen ? "90deg" : "0deg";
    return {
      transform: [{ rotate: withTiming(rotateValue, { duration: 250 }) }],
    };
  });

  const handleSelectTheme = (theme: "dark" | "light") => {
    setCurrentTheme(theme);
    setIsOpen(false);
  };

  return (
    <View className="relative w-full bg-base-100">
      <TouchableOpacity onPress={() => setIsOpen(!isOpen)}>
        <View className="flex flex-row items-center justify-between">
          <Text className="text-xl text-neutral">Theme Settings</Text>
          <Animated.View style={rotateStyle}>
            <Ionicons
              name="chevron-forward"
              className="text-neutral"
              size={20}
            />
          </Animated.View>
        </View>
      </TouchableOpacity>
      {isOpen && (
        <Animated.View className="absolute top-8 w-full gap-3 rounded-xl bg-base-300 p-3">
          <TouchableOpacity onPress={() => handleSelectTheme("dark")}>
            <Text className="pl-5 text-lg text-neutral">Dark</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleSelectTheme("light")}>
            <Text className="pl-5 text-lg text-neutral">Light</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

export default ThemeSettings;
