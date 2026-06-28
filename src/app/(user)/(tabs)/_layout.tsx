import { Tabs } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';

export default function UserTabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
        },
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTintColor: theme.text,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => <Ionicons name="images" size={24} color={color} />,
          headerTitle: 'Feed',
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color }) => <Ionicons name="receipt" size={24} color={color} />,
          headerTitle: 'My Orders',
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <Ionicons name="chatbubbles" size={24} color={color} />,
          headerTitle: 'Messages',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
          headerTitle: 'My Profile',
        }}
      />
      <Tabs.Screen
        name="vendor-test"
        options={{
          title: 'Testing',
          tabBarIcon: ({ color }) => <Ionicons name="bug" size={24} color={color} />,
          headerTitle: 'Role Testing',
        }}
      />
    </Tabs>
  );
}
