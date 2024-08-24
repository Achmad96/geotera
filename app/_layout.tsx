import '../global.css';

import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from '@expo-google-fonts/poppins';
import { Stack } from 'expo-router/stack';

import React, { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [loaded, error] = useFonts({ Poppins: require('../assets/fonts/Poppins-Regular.ttf') });
  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);
  if (!loaded && !error) {
    return null;
  }
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
};

export default RootLayout;
