import { ThemeProvider } from '@/hooks/useTheme';
import { Tabs } from 'expo-router';
import TabBar from '@/components/TabBar';

const TabLayout = () => {
  return (
    <ThemeProvider>
      <Tabs tabBar={(props) => <TabBar {...props} />}>
        <Tabs.Screen name="index" options={{ title: 'Home', headerShown: false }} />
        <Tabs.Screen name="camera" options={{ title: 'Camera', headerShown: false }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile', headerShown: false }} />
      </Tabs>
    </ThemeProvider>
  );
};

export default TabLayout;
