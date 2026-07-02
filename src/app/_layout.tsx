import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useThemeStore } from '@/hooks/useThemeStore';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { themeMode } = useThemeStore();

  useEffect(() => {
    // Hide splash screen after root layout mounts
    SplashScreen.hideAsync();
  }, []);

  const isDark = themeMode === 'dark';

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
