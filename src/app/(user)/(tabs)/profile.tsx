import { View, Text, Button } from 'react-native';
import { useAuthStore } from '@/hooks/useAuthStore';
export default function Profile() { 
  const { logout } = useAuthStore();
  return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Profile</Text><Button title="Logout" onPress={logout} /></View>; 
}
