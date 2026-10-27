import { cn } from "@/utils/tailwindMerge";
import {
  GestureResponderEvent,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const handlePressIn = (event: GestureResponderEvent): void => {
  console.log("Press In");
};

const handlePressOut = (event: GestureResponderEvent): void => {
  console.log("Press Out");
};

interface IButton {
  value: string;
  className?: string;
  onPress: ((event: GestureResponderEvent) => void) | undefined;
}

const Button = ({ value, className, onPress }: IButton) => {
  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <TouchableOpacity onPress={onPress}>
        <View
          className={cn(
            `flex h-14 w-fit items-center justify-center rounded-xl bg-accent px-3 ${className ? className : ""}`,
          )}
        >
          <Text className="text-neutral">{value}</Text>
        </View>
      </TouchableOpacity>
    </Pressable>
  );
};
export default Button;
