import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Switch, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/hooks/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { api } from '@/services/api';
import * as Location from 'expo-location';

export default function VendorSettings() {
  const theme = useTheme();
  const { logout } = useAuthStore();
  
  const [diningEnabled, setDiningEnabled] = useState(false);
  const [capacity, setCapacity] = useState('10');
  const [diningCharge, setDiningCharge] = useState('50');

  const [profile, setProfile] = useState<any>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.vendors.getProfileMe();
        setProfile(res);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow location access to update your coordinates.');
        setLoadingLocation(false);
        return;
      }
      
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = loc.coords;
      
      const geocoded = await Location.reverseGeocodeAsync({ latitude, longitude });
      let addressStr = profile?.location || 'Unknown Location';
      if (geocoded.length > 0) {
        const item = geocoded[0];
        addressStr = [item.street, item.district, item.city].filter(Boolean).join(', ');
      }

      await api.vendors.updateProfile({ 
        latitude, 
        longitude, 
        location: addressStr 
      });
      
      const res = await api.vendors.getProfileMe();
      setProfile(res);
      Alert.alert('Success', 'Your kitchen location has been updated successfully.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update location.');
    } finally {
      setLoadingLocation(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <ThemedText type="title">Settings</ThemedText>
        </View>

        {/* Profile Section */}
        <Card style={styles.sectionCard}>
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
              <ThemedText style={{ color: '#FFF', fontWeight: 'bold', fontSize: 24 }}>S</ThemedText>
            </View>
            <View style={{ marginLeft: 16 }}>
              <ThemedText type="subtitle">Sarah&apos;s Sweets</ThemedText>
              <ThemedText style={{ color: theme.textSecondary }}>sarah@example.com</ThemedText>
            </View>
          </View>
          <Button title="Edit Profile" variant="outline" style={{ marginTop: 16 }} />
        </Card>

        {/* Dining Configuration */}
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Dining Configuration</ThemedText>
        </View>
        <Card style={styles.sectionCard}>
          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.settingTitle}>Enable Dine-in</ThemedText>
              <ThemedText style={{ fontSize: 12, color: theme.textSecondary, marginTop: 4 }}>
                Allow customers to dine at your location.
              </ThemedText>
            </View>
            <Switch
              value={diningEnabled}
              onValueChange={setDiningEnabled}
              trackColor={{ false: theme.border, true: theme.primary }}
            />
          </View>

          {diningEnabled && (
            <>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              
              <View style={styles.inputRow}>
                <ThemedText style={styles.settingTitle}>Dining Capacity (Persons)</ThemedText>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
                  keyboardType="number-pad"
                  value={capacity}
                  onChangeText={setCapacity}
                />
              </View>

              <View style={styles.inputRow}>
                <ThemedText style={styles.settingTitle}>Extra Dining Charge (₹)</ThemedText>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
                  keyboardType="number-pad"
                  value={diningCharge}
                  onChangeText={setDiningCharge}
                />
                <ThemedText style={{ fontSize: 12, color: theme.textSecondary, marginTop: 4 }}>
                  Applied to the total bill for dine-in orders.
                </ThemedText>
              </View>
              
              <Button title="Save Changes" style={{ marginTop: 16 }} />
            </>
          )}
        </Card>

        {/* Business Settings */}
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Business</ThemedText>
        </View>
        <Card style={styles.sectionCard}>
          <View style={styles.linkRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="time-outline" size={20} color={theme.text} style={{ marginRight: 12 }} />
              <ThemedText>Operating Hours</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.linkRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="location-outline" size={20} color={theme.text} style={{ marginRight: 12 }} />
              <View>
                <ThemedText>Pickup Location</ThemedText>
                {profile?.location && (
                  <ThemedText style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>{profile.location}</ThemedText>
                )}
              </View>
            </View>
            <Pressable onPress={handleUpdateLocation} disabled={loadingLocation} style={{ padding: 8, backgroundColor: theme.primary + '20', borderRadius: 8 }}>
              {loadingLocation ? <ActivityIndicator size="small" color={theme.primary} /> : <ThemedText style={{ color: theme.primary, fontWeight: 'bold' }}>Update</ThemedText>}
            </Pressable>
          </View>
        </Card>

        <Pressable
          style={[styles.switchRole, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => {
            const state = useAuthStore.getState();
            state.login(state.token || '', {
              id: state.user?.id || '',
              name: state.user?.name || '',
              phoneNumber: state.user?.phoneNumber || '',
              role: 'user'
            });
            router.replace('/(user)/(tabs)');
          }}
        >
          <Ionicons name="swap-horizontal" size={20} color={theme.primary} />
          <ThemedText style={{ color: theme.primary, fontWeight: '600', marginLeft: 8 }}>Switch back to User</ThemedText>
        </Pressable>

        <Button 
          title="Logout" 
          variant="secondary" 
          onPress={() => {
            logout();
            router.replace('/(auth)/login');
          }}
          style={{ marginBottom: 40 }} 
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  sectionCard: {
    padding: 16,
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingTitle: {
    fontWeight: '600',
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  inputRow: {
    marginBottom: 16,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    fontSize: 16,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  switchRole: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 16,
    marginTop: 8,
    marginBottom: 12,
  },
});
