import { CameraView, type CameraType, useCameraPermissions } from "expo-camera";
import { Text, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import AccessRequire from "@/components/AccessRequire";

const Camera = () => {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <AccessRequire message="show the camera" onPress={requestPermission} />
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  return (
    <CameraView className="h-full w-full" facing={facing}>
      <View className="flex h-full w-full items-center justify-end pb-10">
        <View className="relative flex h-14 w-full items-center justify-center">
          <TouchableOpacity onPress={toggleCameraFacing}>
            <Text className="text-xl text-white">Flip the camera</Text>
          </TouchableOpacity>
        </View>
      </View>
    </CameraView>
  );
};

export default Camera;
