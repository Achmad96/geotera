import React from "react";
import {
  type GestureResponderEvent,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

interface TabBarButtonProps {
  onPress: (event: GestureResponderEvent) => void;
  onLongPress: (event: GestureResponderEvent) => void;
  label: string;
  isFocused: boolean;
  icons: any[];
  routeName: string;
  accessibilityLabel?: string;
  tabBarTestID?: string;
}

const TabBarButton = ({
  routeName,
  isFocused,
  icons,
  accessibilityLabel,
  tabBarTestID,
  onPress,
  onLongPress,
}: TabBarButtonProps) => {
  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isFocused ? 1 : 0.5, { duration: 200 }),
    };
  });

  return (
    <TouchableOpacity
      style={stylesheet.item}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={accessibilityLabel}
      testID={tabBarTestID}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <Animated.View style={animatedIconStyle}>
        {icons[routeName as any]({ size: 24 })}
      </Animated.View>
    </TouchableOpacity>
  );
};

const stylesheet = StyleSheet.create({
  item: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default TabBarButton;
