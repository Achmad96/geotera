import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import Octicons from "@expo/vector-icons/Octicons";
import FeatureCard from "@/components/FeatureCard";
import Entypo from "@expo/vector-icons/Entypo";
import Container from "@/components/Container";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { View, Text } from "react-native";

const Home = () => {
  return (
    <Container className="bg-base-100 px-7 pb-20 pt-32">
      {/* Header Section */}
      <View className="flex w-full flex-row items-start justify-between">
        <View className="mb-5">
          <Text className="text-2xl font-bold text-neutral">Hello Achmad</Text>
          <Text className="text-lg text-neutral">Welcome Back!</Text>
        </View>
        <Ionicons name="settings-outline" size={25} className="text-neutral" />
      </View>

      {/* Stats Section */}
      <View className="flex-row flex-wrap justify-between gap-3">
        <FeatureCard
          icon={<MaterialIcons name="factory" size={25} />}
          title="Geo-Carbon"
        />
        <FeatureCard
          icon={<Octicons name="trash" size={25} />}
          title="Geo-Waste"
        />
        <FeatureCard
          icon={<Entypo name="newsletter" size={25} />}
          title="Geo-Campaign"
        />
        <FeatureCard
          icon={<Entypo name="newsletter" size={25} />}
          title="Geo-Campaign"
        />
      </View>

      {/* Revenue Section */}
      <View className="my-5">
        <View className="mb-7 items-center rounded-2xl bg-accent p-7">
          <Text className="text-3xl font-bold text-neutral">$432190</Text>
          <Text className="text-base text-neutral">
            + $150,102 since last week
          </Text>
        </View>

        {/* Circular Progress */}
        <View className="relative items-center justify-center">
          <View className="absolute">
            <Text className="text-2xl font-bold text-neutral">45%</Text>
          </View>
          <View className="h-[150px] w-[150px] rounded-full border-8 border-accent" />
        </View>
      </View>

      {/* Bottom Stats */}
      <View className="mt-5 rounded-2xl bg-base-200 p-5">
        <Text className="mb-2 text-base text-neutral">
          Sales since last week
        </Text>
        <Text className="mb-3 text-2xl font-bold text-neutral">230K</Text>

        <Text className="mb-2 text-base text-neutral">
          Customers since last week
        </Text>
        <Text className="mb-3 text-2xl font-bold text-neutral">8.549K</Text>

        <Text className="mb-2 text-base text-neutral">
          Products since last week
        </Text>
        <Text className="mb-3 text-2xl font-bold text-neutral">1.423K</Text>

        <Text className="mb-2 text-base text-neutral">
          Revenue since last week
        </Text>
        <Text className="mb-3 text-2xl font-bold text-neutral">$9745</Text>
      </View>
    </Container>
  );
};
export default Home;
