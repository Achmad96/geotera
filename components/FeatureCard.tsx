import { View, Text, Pressable, GestureResponderEvent } from "react-native";

interface IFeatureCard {
  icon: React.ReactNode;
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
}

const FeatureCard = ({ icon, title, onPress }: IFeatureCard) => {
  return (
    <Pressable
      className="flex h-28 w-40 items-center justify-center rounded-xl bg-base-200"
      onPress={onPress}
    >
      <View className="w-full">
        <Text className="text-center text-2xl font-bold text-neutral">
          {icon}
        </Text>
        <Text className="text-center text-base text-neutral">{title}</Text>
      </View>
    </Pressable>
  );
};

export default FeatureCard;
