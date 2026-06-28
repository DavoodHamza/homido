import { Redirect } from 'expo-router';
import { useAuthStore } from '@/hooks/useAuthStore';

export default function Index() {
  const { isLoggedIn, role } = useAuthStore();

  if (!isLoggedIn) {
    return <Redirect href="/(auth)/login" />;
  }

  if (role === 'vendor') {
    return <Redirect href="/(vendor)/(tabs)" />;
  }

  if (role === 'admin') {
    return <Redirect href="/(admin)/(tabs)" />;
  }

  return <Redirect href="/(user)/(tabs)" />;
}
