import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { useAuthStore } from '@/hooks/useAuthStore';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isLoggedIn, role } = useAuthStore();

  useEffect(() => {
    // Hide splash screen after root layout mounts
    SplashScreen.hideAsync();
  }, []);

  const isDark = colorScheme === 'dark';

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(user)/(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(vendor)/(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(admin)/(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
