import { View, Text, GestureResponderEvent } from "react-native";
import Button from "@/components/Button";

interface IAccessRequire {
  message: string;
  onPress: (event: GestureResponderEvent) => void;
}

const AccessRequire = ({ message, onPress }: IAccessRequire) => {
  return (
    <View className="flex flex-col items-center gap-5 rounded-xl bg-base-300 p-5">
      <Text className="text-center text-neutral">
        We need your permission to {message}
      </Text>
      <View className="w-52">
        <Button value="Grant" onPress={onPress} />
      </View>
    </View>
  );
};

export default AccessRequire;
