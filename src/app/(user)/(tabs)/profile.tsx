import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Image, Alert, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/hooks/useAuthStore';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { api } from '@/services/api';

const MENU_ITEMS = [
  { id: '1', icon: 'heart-outline' as const, label: 'Favorites', badge: '12' },
  { id: '2', icon: 'location-outline' as const, label: 'Saved Addresses', route: '/(user)/address-modal' },
  { id: '3', icon: 'card-outline' as const, label: 'Payment Methods' },
  { id: '4', icon: 'notifications-outline' as const, label: 'Notifications', badge: '3' },
  { id: '5', icon: 'star-outline' as const, label: 'My Reviews' },
  { id: '6', icon: 'gift-outline' as const, label: 'Rewards & Offers' },
];

const SETTINGS_ITEMS = [
  { id: '7', icon: 'help-circle-outline' as const, label: 'Help & Support' },
  { id: '8', icon: 'document-text-outline' as const, label: 'Terms & Privacy' },
  { id: '9', icon: 'information-circle-outline' as const, label: 'About Homido' },
];

export default function ProfileScreen() {
  const theme = useTheme();
  const { logout, user, updateUser } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);

  const handlePickImage = async () => {
    const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (lib.status !== 'granted') {
      Alert.alert('Permission Required', 'Photo library access is needed to pick an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    setIsUploading(true);

    try {
      const mimeType = asset.mimeType || 'image/jpeg';
      const serverUrl = await api.upload.image(asset.uri, asset.fileName ?? undefined, mimeType);
      
      await api.users.update({ profileImage: serverUrl });
      updateUser({ profileImage: serverUrl });
    } catch (err: any) {
      console.error(err);
      Alert.alert('Upload Failed', err.message || 'Could not upload profile picture.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Pressable onPress={handlePickImage} style={[styles.avatarLarge, { backgroundColor: theme.primary, overflow: 'hidden' }]}>
            {isUploading ? (
              <ActivityIndicator color="#FFF" />
            ) : user?.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={{ width: '100%', height: '100%' }} />
            ) : (
              <ThemedText style={styles.avatarText}>
                {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
              </ThemedText>
            )}
          </Pressable>
          <View style={styles.profileInfo}>
            <ThemedText style={styles.profileName}>{user?.name || 'User'}</ThemedText>
            <ThemedText style={[styles.profilePhone, { color: theme.textSecondary }]}>{user?.phoneNumber || ''}</ThemedText>
          </View>
          <Pressable style={[styles.editButton, { borderColor: theme.border }]}>
            <Ionicons name="pencil" size={16} color={theme.primary} />
          </Pressable>
        </View>

        {/* Stats Row */}
        <View style={[styles.statsRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.statItem}>
            <ThemedText style={[styles.statNumber, { color: theme.primary }]}>24</ThemedText>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>Orders</ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.statItem}>
            <ThemedText style={[styles.statNumber, { color: theme.primary }]}>12</ThemedText>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>Favorites</ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.statItem}>
            <ThemedText style={[styles.statNumber, { color: theme.primary }]}>8</ThemedText>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>Reviews</ThemedText>
          </View>
        </View>

        {/* Menu Items */}
        <View style={[styles.menuSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {MENU_ITEMS.map((item, index) => (
            <Pressable
              key={item.id}
              style={[styles.menuItem, index < MENU_ITEMS.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: theme.border }]}
              onPress={() => item.route ? router.push(item.route as any) : null}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconBg, { backgroundColor: theme.primary + '15' }]}>
                  <Ionicons name={item.icon} size={20} color={theme.primary} />
                </View>
                <ThemedText style={styles.menuLabel}>{item.label}</ThemedText>
              </View>
              <View style={styles.menuRight}>
                {item.badge && (
                  <View style={[styles.menuBadge, { backgroundColor: theme.primary + '20' }]}>
                    <ThemedText style={[styles.menuBadgeText, { color: theme.primary }]}>{item.badge}</ThemedText>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
              </View>
            </Pressable>
          ))}
        </View>

        {/* Settings */}
        <View style={[styles.menuSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {SETTINGS_ITEMS.map((item, index) => (
            <Pressable
              key={item.id}
              style={[styles.menuItem, index < SETTINGS_ITEMS.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: theme.border }]}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconBg, { backgroundColor: theme.textSecondary + '15' }]}>
                  <Ionicons name={item.icon} size={20} color={theme.textSecondary} />
                </View>
                <ThemedText style={styles.menuLabel}>{item.label}</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
            </Pressable>
          ))}
        </View>

        {/* Logout */}
        <Pressable
          style={[styles.logoutButton, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => {
            logout();
            router.replace('/(auth)/login');
          }}
        >
          <Ionicons name="log-out-outline" size={22} color={theme.error} />
          <ThemedText style={[styles.logoutText, { color: theme.error }]}>Logout</ThemedText>
        </Pressable>

        {/* Delete Account */}
        <Pressable
          style={[styles.logoutButton, { backgroundColor: theme.card, borderColor: theme.error }]}
          onPress={() => {
            Alert.alert(
              'Delete Account',
              'Are you sure you want to delete your account? This action cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await api.users.deleteAccount();
                      logout();
                      router.replace('/(auth)/login');
                    } catch (error: any) {
                      Alert.alert('Error', error.message || 'Failed to delete account');
                    }
                  }
                }
              ]
            );
          }}
        >
          <Ionicons name="trash-outline" size={22} color={theme.error} />
          <ThemedText style={[styles.logoutText, { color: theme.error }]}>Delete Account</ThemedText>
        </Pressable>

        <ThemedText style={[styles.version, { color: theme.textSecondary }]}>Homido v1.0.0</ThemedText>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 14,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 18,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 36,
  },
  menuSection: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  menuBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 16,
    gap: 10,
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
  },
});
