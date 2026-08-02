import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert, TextInput, Image } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/hooks/useAuthStore';
import { router } from 'expo-router';
import { api } from '@/services/api';
import * as ImagePicker from 'expo-image-picker';

export default function AdminDashboard() {
  const theme = useTheme();
  const { logout } = useAuthStore();

  const [vendors, setVendors] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deliveryCharge, setDeliveryCharge] = useState('0');
  const [banners, setBanners] = useState<string[]>([]);
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const loadData = async () => {
    try {
      const v = await api.vendors.getAdminAll();
      setVendors(v);
      const o = await api.orders.get();
      setOrders(o);
      const chargeRes = await api.settings.get('DELIVERY_CHARGE') as any;
      if (chargeRes && chargeRes.value) setDeliveryCharge(chargeRes.value);
      const bannerRes = await api.settings.get('BANNERS') as any;
      if (bannerRes && bannerRes.value) {
        try { setBanners(JSON.parse(bannerRes.value)); } catch(e){}
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const getPendingApprovalsCount = () => {
    return vendors.filter((v) => v.status === 'pending').length;
  };

  const getPlatformRevenue = () => {
    return orders
      .filter((o) => o.status === 'Delivered')
      .reduce((sum, o) => sum + Number(o.total), 0);
  };

  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true);
      await api.settings.set('DELIVERY_CHARGE', deliveryCharge);
      Alert.alert('Success', 'Settings updated');
    } catch (e) {
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAddBanner = async () => {
    try {
      const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (lib.status !== 'granted') {
        Alert.alert('Permission Required', 'Need photo library access to upload a banner.');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) return;
      setUploadingBanner(true);
      const uploadedUrl = await api.upload.image(result.assets[0].uri, result.assets[0].fileName ?? undefined, result.assets[0].mimeType ?? 'image/jpeg');
      
      const newBanners = [...banners, uploadedUrl];
      setBanners(newBanners);
      await api.settings.set('BANNERS', JSON.stringify(newBanners));
    } catch(e: any) {
      Alert.alert('Upload Failed', e.message || 'Could not upload banner');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleRemoveBanner = async (index: number) => {
    const newBanners = banners.filter((_, i) => i !== index);
    setBanners(newBanners);
    setUploadingBanner(true);
    await api.settings.set('BANNERS', JSON.stringify(newBanners));
    setUploadingBanner(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <ActivityIndicator size="large" color={theme.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <View>
            <ThemedText type="title">Admin Overview</ThemedText>
            <Pressable onPress={loadData} style={{ marginTop: 4 }}>
              <ThemedText style={{ color: theme.primary, fontSize: 13, fontWeight: '600' }}>Tap to Refresh</ThemedText>
            </Pressable>
          </View>
          <Pressable
            onPress={() => {
              logout();
              router.replace('/(auth)/login');
            }}
            style={{ padding: 8 }}
          >
            <Ionicons name="log-out-outline" size={24} color={theme.error} />
          </Pressable>
        </View>

        {/* Global Settings */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Global Settings</ThemedText>
          <View style={[styles.actionCard, { backgroundColor: theme.card, borderColor: theme.border, paddingVertical: 16, flexDirection: 'column', alignItems: 'stretch' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View>
                <ThemedText style={{ fontWeight: '600', fontSize: 15 }}>Delivery Charge (₹)</ThemedText>
                <ThemedText style={{ color: theme.textSecondary, fontSize: 13, marginTop: 2 }}>Applied to all delivery orders</ThemedText>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TextInput
                style={{ flex: 1, backgroundColor: theme.background, color: theme.text, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: theme.border }}
                value={deliveryCharge}
                onChangeText={setDeliveryCharge}
                keyboardType="numeric"
                placeholder="e.g. 50"
                placeholderTextColor={theme.textSecondary}
              />
              <Pressable
                style={{ backgroundColor: theme.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}
                onPress={handleSaveSettings}
                disabled={savingSettings}
              >
                {savingSettings ? <ActivityIndicator color="#FFF" size="small" /> : <ThemedText style={{ color: '#FFF', fontWeight: 'bold' }}>Save</ThemedText>}
              </Pressable>
            </View>
          </View>
        </View>

        {/* Ad Banners Settings */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Home Banners (Ads)</ThemedText>
          <View style={[styles.actionCard, { backgroundColor: theme.card, borderColor: theme.border, paddingVertical: 16, flexDirection: 'column', alignItems: 'stretch' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View>
                <ThemedText style={{ fontWeight: '600', fontSize: 15 }}>Manage Banners</ThemedText>
                <ThemedText style={{ color: theme.textSecondary, fontSize: 13, marginTop: 2 }}>Auto-rotates every 7s on user home screen</ThemedText>
              </View>
              <Pressable onPress={handleAddBanner} disabled={uploadingBanner} style={{ backgroundColor: theme.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
                {uploadingBanner ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <ThemedText style={{ color: '#FFF', fontSize: 13, fontWeight: 'bold' }}>+ Add</ThemedText>
                )}
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {banners.map((url, i) => (
                <View key={i} style={{ width: 200, height: 100, borderRadius: 8, overflow: 'hidden', position: 'relative', backgroundColor: theme.border }}>
                  <Image source={{ uri: url }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                  <Pressable onPress={() => handleRemoveBanner(i)} style={{ position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, padding: 4 }}>
                    <Ionicons name="trash" size={16} color="#FFF" />
                  </Pressable>
                </View>
              ))}
              {banners.length === 0 && <ThemedText style={{ color: theme.textSecondary, fontSize: 13, marginVertical: 12 }}>No banners added.</ThemedText>}
            </ScrollView>
          </View>
        </View>

        {/* Global Stats */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.statIconBg, { backgroundColor: theme.primary + '15' }]}>
              <Ionicons name="people" size={22} color={theme.primary} />
            </View>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>Total Accounts</ThemedText>
            <ThemedText type="stat" style={{ color: theme.text }}>{vendors.length + 5}</ThemedText>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.statIconBg, { backgroundColor: theme.accent + '15' }]}>
              <Ionicons name="storefront" size={22} color={theme.accent} />
            </View>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>Total Vendors</ThemedText>
            <ThemedText type="stat" style={{ color: theme.text }}>{vendors.length}</ThemedText>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.statIconBg, { backgroundColor: theme.success + '15' }]}>
              <Ionicons name="receipt" size={22} color={theme.success} />
            </View>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>Total Orders</ThemedText>
            <ThemedText type="stat" style={{ color: theme.text }}>{orders.length}</ThemedText>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.statIconBg, { backgroundColor: theme.error + '15' }]}>
              <Ionicons name="alert-circle" size={22} color={theme.error} />
            </View>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>Pending Approvals</ThemedText>
            <ThemedText type="stat" style={{ color: theme.text }}>{getPendingApprovalsCount()}</ThemedText>
          </View>
        </View>

        {/* Revenue Card */}
        <View style={[styles.revenueCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.revenueHeader}>
            <View>
              <ThemedText style={[styles.revenueLabel, { color: theme.textSecondary }]}>Total Platform Gross Revenue</ThemedText>
              <ThemedText type="bigStat" style={{ marginTop: 4 }}>₹{getPlatformRevenue()}</ThemedText>
            </View>
            <View style={[styles.trendBadge, { backgroundColor: theme.success + '20' }]}>
              <Ionicons name="trending-up" size={16} color={theme.success} />
              <ThemedText style={{ color: theme.success, fontWeight: '700', marginLeft: 4, fontSize: 13 }}>Live</ThemedText>
            </View>
          </View>
        </View>

        {/* Action Required */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Action Required</ThemedText>
          
          <Pressable 
            style={[styles.actionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => router.push('/(admin)/(tabs)/vendors')}
          >
            <View style={[styles.actionIconBg, { backgroundColor: theme.error + '15' }]}>
              <Ionicons name="alert-circle" size={22} color={theme.error} />
            </View>
            <View style={styles.actionText}>
              <ThemedText style={{ fontWeight: '600', fontSize: 15 }}>
                {getPendingApprovalsCount()} Vendors Awaiting Approval
              </ThemedText>
              <ThemedText style={{ color: theme.textSecondary, fontSize: 13, marginTop: 2 }}>Review new kitchen profiles</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </Pressable>

          <Pressable 
            style={[styles.actionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => router.push('/(admin)/(tabs)/orders')}
          >
            <View style={[styles.actionIconBg, { backgroundColor: theme.accent + '15' }]}>
              <Ionicons name="warning" size={22} color={theme.accent} />
            </View>
            <View style={styles.actionText}>
              <ThemedText style={{ fontWeight: '600', fontSize: 15 }}>
                {orders.filter(o => o.status === 'Pending').length} Pending Orders
              </ThemedText>
              <ThemedText style={{ color: theme.textSecondary, fontSize: 13, marginTop: 2 }}>Monitor kitchen response times</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </Pressable>
        </View>

        {/* Back to User */}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  revenueCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginTop: 4,
    marginBottom: 24,
  },
  revenueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  revenueLabel: {
    fontSize: 13,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 14,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  actionIconBg: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  actionText: {
    flex: 1,
  },
  switchRole: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 16,
    marginBottom: 16,
  },
});
