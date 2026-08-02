import { Tabs } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View } from 'react-native';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';

export default function UserTabLayout() {
  const theme = useTheme();
  const hasUnread = useUnreadMessages();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: theme.card,
          borderTopWidth: 0,
          bottom: 24,
          left: 24,
          right: 24,
          elevation: 10,
          height: 64,
          borderRadius: 32,
          paddingBottom: 0,
          paddingTop: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
        },
        tabBarShowLabel: false,
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTintColor: theme.text,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <View style={{
              width: 44,
              height: 44,
              marginTop: 12,
              borderRadius: 22,
              backgroundColor: focused ? theme.primary + '20' : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ focused, color }) => (
            <View style={{
              width: 44,
              height: 44,
              marginTop: 12,
              borderRadius: 22,
              backgroundColor: focused ? theme.primary + '20' : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Ionicons name={focused ? "receipt" : "receipt-outline"} size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ focused, color }) => (
            <View style={{
              width: 44,
              height: 44,
              marginTop: 12,
              borderRadius: 22,
              backgroundColor: focused ? theme.primary + '20' : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}>
              <Ionicons name={focused ? "chatbubbles" : "chatbubbles-outline"} size={24} color={color} />
              {hasUnread && (
                <View style={{
                  position: 'absolute',
                  top: 7,
                  right: 8,
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: '#EF4444',
                  borderWidth: 1.5,
                  borderColor: theme.card,
                  zIndex: 999,
                }} />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <View style={{
              width: 44,
              height: 44,
              marginTop: 12,
              borderRadius: 22,
              backgroundColor: focused ? theme.primary + '20' : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          href: null,
          tabBarIcon: ({ focused, color }) => (
            <View style={{
              width: 44,
              height: 44,
              marginTop: 12,
              borderRadius: 22,
              backgroundColor: focused ? theme.primary + '20' : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Ionicons name={focused ? "wallet" : "wallet-outline"} size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="vendor-test"
        options={{
          href: null, // hidden from tab bar
        }}
      />
    </Tabs>
  );
}
