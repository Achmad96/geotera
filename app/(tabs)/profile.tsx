import Container from "@/components/Container";
import ThemeSettings from "@/components/settings/ThemeSettings";

import { Text, View } from "react-native";

const Profile = () => {
  return (
    <Container className="items-center justify-center bg-base-100">
      <View className="w-[85%]">
        <Text className="text-3xl font-bold text-neutral">Settings</Text>
        <View className="mb-7 mt-2 border-b border-base-200" />
        <ThemeSettings />
      </View>
    </Container>
  );
};
export default Profile;
