import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Switch, TextInput, Pressable, Alert, ActivityIndicator, Image } from 'react-native';
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
import * as ImagePicker from 'expo-image-picker';

export default function VendorSettings() {
  const theme = useTheme();
  const { logout } = useAuthStore();
  
  const [diningEnabled, setDiningEnabled] = useState(false);
  const [capacity, setCapacity] = useState('10');
  const [diningCharge, setDiningCharge] = useState('50');

  const [profile, setProfile] = useState<any>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingHours, setLoadingHours] = useState(false);
  const [loadingDining, setLoadingDining] = useState(false);
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [loadingCover, setLoadingCover] = useState(false);
  const [loadingFssai, setLoadingFssai] = useState(false);
  const [locationStr, setLocationStr] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [operatingHours, setOperatingHours] = useState('');
  const [timeVal, setTimeVal] = useState('20');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.vendors.getProfileMe();
        setProfile(res);
        if (res) {
          setLocationStr(res.location || '');
          setLatitude(res.latitude);
          setLongitude(res.longitude);
          setOperatingHours(res.operatingHours || '09:00 AM - 10:00 PM');
          setDiningEnabled(res.diningEnabled || false);
          setCapacity(res.diningCapacity ? res.diningCapacity.toString() : '10');
          setDiningCharge(res.diningCharge ? res.diningCharge.toString() : '50');
          setTimeVal(res.timeVal ? res.timeVal.toString() : '20');
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const handleFetchLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow location access to update your coordinates.');
        setLoadingLocation(false);
        return;
      }
      
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude: lat, longitude: lng } = loc.coords;
      
      const geocoded = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      let addressStr = locationStr || 'Unknown Location';
      if (geocoded.length > 0) {
        const item = geocoded[0];
        addressStr = [item.street, item.district, item.city].filter(Boolean).join(', ');
      }

      setLatitude(lat);
      setLongitude(lng);
      setLocationStr(addressStr);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to fetch location.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleUpdateLocation = async () => {
    try {
      await api.vendors.updateProfile({ 
        latitude, 
        longitude, 
        location: locationStr 
      });
      const res = await api.vendors.getProfileMe();
      setProfile(res);
      Alert.alert('Success', 'Your kitchen location has been updated successfully.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update location.');
    }
  };

  const handleUpdateBusiness = async () => {
    setLoadingHours(true);
    try {
      await api.vendors.updateProfile({ 
        operatingHours,
        timeVal: Number(timeVal)
      });
      const res = await api.vendors.getProfileMe();
      setProfile(res);
      Alert.alert('Success', 'Your business settings have been updated successfully.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update business settings.');
    } finally {
      setLoadingHours(false);
    }
  };

  const handleUpdateDining = async () => {
    setLoadingDining(true);
    try {
      await api.vendors.updateProfile({ 
        diningEnabled,
        diningCapacity: Number(capacity),
        diningCharge: Number(diningCharge)
      });
      const res = await api.vendors.getProfileMe();
      setProfile(res);
      Alert.alert('Success', 'Your dining configuration has been updated successfully.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update dining config.');
    } finally {
      setLoadingDining(false);
    }
  };

  const handleUpdateProfilePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library.');
        return;
      }
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (pickerResult.canceled || !pickerResult.assets?.length) return;
      const asset = pickerResult.assets[0];

      setLoadingPhoto(true);
      const uploadedUrl = await api.upload.image(asset.uri, asset.fileName ?? undefined, asset.mimeType ?? 'image/jpeg');
      await api.vendors.updateProfile({ image: uploadedUrl });
      const res = await api.vendors.getProfileMe();
      setProfile(res);
      Alert.alert('Success', 'Profile photo updated successfully.');
    } catch (err: any) {
      Alert.alert('Upload Error', err.message || 'Failed to update profile photo.');
    } finally {
      setLoadingPhoto(false);
    }
  };

  const handleUpdateCoverPhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library.');
        return;
      }
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.5,
      });

      if (pickerResult.canceled || !pickerResult.assets?.length) return;
      const asset = pickerResult.assets[0];

      setLoadingCover(true);
      const uploadedUrl = await api.upload.image(asset.uri, asset.fileName ?? undefined, asset.mimeType ?? 'image/jpeg');
      await api.vendors.updateProfile({ coverPhoto: uploadedUrl });
      const res = await api.vendors.getProfileMe();
      setProfile(res);
      Alert.alert('Success', 'Cover photo updated successfully.');
    } catch (err: any) {
      Alert.alert('Upload Error', err.message || 'Failed to update cover photo.');
    } finally {
      setLoadingCover(false);
    }
  };

  const handleUpdateFssai = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library.');
        return;
      }
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.5,
      });

      if (pickerResult.canceled || !pickerResult.assets?.length) return;
      const asset = pickerResult.assets[0];

      setLoadingFssai(true);
      const uploadedUrl = await api.upload.image(asset.uri, asset.fileName ?? undefined, asset.mimeType ?? 'image/jpeg');
      await api.vendors.updateProfile({ fssaiCertificate: uploadedUrl });
      const res = await api.vendors.getProfileMe();
      setProfile(res);
      Alert.alert('Success', 'FSSAI certificate updated successfully.');
    } catch (err: any) {
      Alert.alert('Upload Error', err.message || 'Failed to update FSSAI certificate.');
    } finally {
      setLoadingFssai(false);
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
            {profile?.image ? (
              <Image source={{ uri: profile.image }} style={[styles.avatar, { width: 48, height: 48, borderRadius: 24 }]} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                <ThemedText style={{ color: '#FFF', fontWeight: 'bold', fontSize: 24 }}>
                  {profile?.name ? profile.name.charAt(0).toUpperCase() : 'V'}
                </ThemedText>
              </View>
            )}
            <View style={{ marginLeft: 16 }}>
              <ThemedText type="subtitle">{profile?.name || 'Your Kitchen'}</ThemedText>
              <ThemedText style={{ color: theme.textSecondary }}>{profile?.user?.email || 'vendor@example.com'}</ThemedText>
            </View>
          </View>
          <Button 
            title={loadingPhoto ? "Uploading..." : "Update Profile Photo"} 
            variant="outline" 
            style={{ marginTop: 16 }} 
            onPress={handleUpdateProfilePhoto} 
            disabled={loadingPhoto}
          />
          {profile?.coverPhoto && (
            <Image source={{ uri: profile.coverPhoto }} style={{ width: '100%', height: 100, borderRadius: 8, marginTop: 16 }} />
          )}
          <Button 
            title={loadingCover ? "Uploading..." : "Update Cover Photo"} 
            variant="outline" 
            style={{ marginTop: profile?.coverPhoto ? 8 : 16 }} 
            onPress={handleUpdateCoverPhoto} 
            disabled={loadingCover}
          />
        </Card>

        {/* Certificate Section */}
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Certificates</ThemedText>
        </View>
        <Card style={styles.sectionCard}>
          <ThemedText style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 12 }}>
            Your FSSAI Certificate ensures customers your food is safe and regulated.
          </ThemedText>
          {profile?.fssaiCertificate && (
            <Image source={{ uri: profile.fssaiCertificate }} style={{ width: '100%', height: 150, borderRadius: 8, marginBottom: 8 }} />
          )}
          <Button 
            title={loadingFssai ? "Uploading..." : "Update FSSAI Certificate"} 
            variant="outline" 
            onPress={handleUpdateFssai} 
            disabled={loadingFssai}
          />
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
            </>
          )}
          <Button title={loadingDining ? "Saving..." : "Save Dining Settings"} style={{ marginTop: 16 }} onPress={handleUpdateDining} disabled={loadingDining} />
        </Card>

        {/* Business Settings */}
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Business</ThemedText>
        </View>
        <Card style={styles.sectionCard}>
          <View style={[styles.linkRow, { flexDirection: 'column', alignItems: 'stretch' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Ionicons name="time-outline" size={20} color={theme.text} style={{ marginRight: 12 }} />
              <ThemedText>Business Settings (Hours & Prep Time)</ThemedText>
            </View>
            
            <ThemedText style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 4 }}>Operating Hours</ThemedText>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.background, borderRadius: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: theme.border, marginBottom: 12 }}>
              <TextInput
                style={{ flex: 1, color: theme.text, paddingVertical: 8, fontSize: 13 }}
                placeholderTextColor={theme.textSecondary}
                placeholder="e.g. 09:00 AM - 10:00 PM"
                value={operatingHours}
                onChangeText={setOperatingHours}
              />
            </View>

            <ThemedText style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 4 }}>Preparation Time (mins)</ThemedText>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.background, borderRadius: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: theme.border, marginBottom: 12 }}>
              <TextInput
                style={{ flex: 1, color: theme.text, paddingVertical: 8, fontSize: 13 }}
                placeholderTextColor={theme.textSecondary}
                keyboardType="number-pad"
                placeholder="e.g. 20"
                value={timeVal}
                onChangeText={setTimeVal}
              />
            </View>

            <Pressable onPress={handleUpdateBusiness} disabled={loadingHours} style={{ padding: 12, backgroundColor: theme.primary, borderRadius: 8, alignItems: 'center' }}>
              {loadingHours ? <ActivityIndicator size="small" color="#fff" /> : <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>Save Business Settings</ThemedText>}
            </Pressable>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={[styles.linkRow, { flexDirection: 'column', alignItems: 'stretch' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Ionicons name="location-outline" size={20} color={theme.text} style={{ marginRight: 12 }} />
              <ThemedText>Pickup Location</ThemedText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.background, borderRadius: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: theme.border, marginBottom: 12 }}>
              <TextInput
                style={{ flex: 1, color: theme.text, paddingVertical: 8, fontSize: 13 }}
                placeholderTextColor={theme.textSecondary}
                placeholder="Kitchen Location / Address"
                value={locationStr}
                onChangeText={setLocationStr}
                multiline
              />
              <Pressable onPress={handleFetchLocation} disabled={loadingLocation} style={{ padding: 8 }}>
                {loadingLocation ? <ActivityIndicator size="small" color={theme.primary} /> : <Ionicons name="locate" size={20} color={theme.primary} />}
              </Pressable>
            </View>
            <Pressable onPress={handleUpdateLocation} style={{ padding: 12, backgroundColor: theme.primary, borderRadius: 8, alignItems: 'center' }}>
              <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>Save Location</ThemedText>
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
