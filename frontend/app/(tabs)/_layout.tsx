import { ThemeProvider } from "@/hooks/useTheme";
import { Tabs } from "expo-router";
import TabBar from "@/components/TabBar";

const TabLayout = () => {
  return (
    <ThemeProvider>
      <Tabs tabBar={(props) => <TabBar {...props} />}>
        <Tabs.Screen
          name="index"
          options={{ title: "Home", headerShown: false }}
        />
        <Tabs.Screen
          name="dispatch"
          options={{ title: "Book", headerShown: false }}
        />
        <Tabs.Screen
          name="tracking"
          options={{ title: "Track", headerShown: false }}
        />
        <Tabs.Screen
          name="driver"
          options={{ title: "Collector", headerShown: false }}
        />
        <Tabs.Screen
          name="profile"
          options={{ title: "Profile", headerShown: false }}
        />
        {/* Hidden legacy tab to prevent router break */}
        <Tabs.Screen
          name="camera"
          options={{
            href: null,
            title: "Camera",
            headerShown: false,
          }}
        />
      </Tabs>
    </ThemeProvider>
  );
};

export default TabLayout;
