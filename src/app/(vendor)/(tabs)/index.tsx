import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/hooks/useAuthStore';
import { api } from '@/services/api';
import MediaPicker from '@/components/MediaPicker';

export default function VendorDashboard() {
  const theme = useTheme();
  const { user } = useAuthStore();

  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Kitchen Profile Form
  const [kitchenName, setKitchenName] = useState('');
  const [category, setCategory] = useState('cakes');
  const [timeVal, setTimeVal] = useState('20');
  const [imageUrl, setImageUrl] = useState('');
  const [locationStr, setLocationStr] = useState('Signature Towers, Hitech City');

  const loadData = async () => {
    try {
      const prof = await api.vendors.getProfileMe();
      setProfile(prof);

      if (prof) {
        const ords = await api.orders.get();
        setOrders(ords);
      }
    } catch (err) {
      console.error('Failed to load vendor dashboard:', err);
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

  const handleRegisterKitchen = async () => {
    if (!kitchenName.trim()) {
      Alert.alert('Error', 'Please enter a kitchen name.');
      return;
    }

    setLoading(true);
    try {
      const prof = await api.vendors.register(
        kitchenName.trim(),
        imageUrl.trim() || undefined,
        parseInt(timeVal) || 20,
        category,
        locationStr.trim() || undefined
      );
      setProfile(prof);
      Alert.alert('Success', 'Kitchen profile registered successfully!');
      loadData();
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message || 'Could not register kitchen.');
      setLoading(false);
    }
  };

  // Calculations
  const getTodayRevenue = () => {
    const today = new Date().toDateString();
    return orders
      .filter((o) => o.status === 'Delivered' && new Date(o.date).toDateString() === today)
      .reduce((sum, o) => sum + Number(o.total), 0);
  };

  const getPendingOrdersCount = () => {
    return orders.filter((o) => o.status === 'Pending').length;
  };

  const getEstMonthlySales = () => {
    // Basic projection: 30x today's revenue, or sum of last 30 days. Let's do sum of all delivered orders.
    return orders
      .filter((o) => o.status === 'Delivered')
      .reduce((sum, o) => sum + Number(o.total), 0);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <ActivityIndicator size="large" color={theme.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  // 1. If no kitchen profile registered yet
  if (!profile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View>
              <ThemedText style={{ color: theme.textSecondary }}>Welcome back,</ThemedText>
              <ThemedText type="title">{user?.name || 'Chef'}</ThemedText>
            </View>
          </View>

          <Card style={styles.formCard}>
            <ThemedText type="subtitle" style={styles.formTitle}>Register Your Kitchen</ThemedText>
            <ThemedText style={{ color: theme.textSecondary, marginBottom: 20, fontSize: 13 }}>
              Enter your kitchen details to start selling homemade goodness on Homido!
            </ThemedText>

            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.card }]}
              placeholder="Kitchen Name (e.g. Grandma's Pickles)"
              placeholderTextColor={theme.textSecondary}
              value={kitchenName}
              onChangeText={setKitchenName}
            />

            <ThemedText style={{ color: theme.textSecondary, marginBottom: 8, fontSize: 13 }}>Primary Category:</ThemedText>
            <View style={styles.categoryPickerRow}>
              {['cakes', 'meals', 'pickles', 'desserts'].map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[
                    styles.pickerBtn,
                    { borderColor: theme.border },
                    category === cat && { backgroundColor: theme.primary, borderColor: theme.primary },
                  ]}
                >
                  <ThemedText style={[styles.pickerBtnText, category === cat && { color: '#FFF' }]}>
                    {cat.toUpperCase()}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.card, marginTop: 16 }]}
              placeholder="Est. Prep & Delivery Time (mins)"
              placeholderTextColor={theme.textSecondary}
              keyboardType="number-pad"
              value={timeVal}
              onChangeText={setTimeVal}
            />

            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.card }]}
              placeholder="Kitchen Location / Address"
              placeholderTextColor={theme.textSecondary}
              value={locationStr}
              onChangeText={setLocationStr}
            />

            <ThemedText style={{ color: theme.textSecondary, marginBottom: 8, fontSize: 13 }}>Kitchen Cover Photo:</ThemedText>
            <MediaPicker
              value={imageUrl}
              onUploaded={(url) => setImageUrl(url)}
              mediaType="image"
              label="Add Kitchen Cover Photo"
            />

            <Button title="Create Kitchen Profile" onPress={handleRegisterKitchen} style={{ height: 50, marginTop: 10 }} />
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 2. Kitchen Profile Registered
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText style={{ color: theme.textSecondary }}>Welcome back,</ThemedText>
            <ThemedText type="title">{profile.name}</ThemedText>
          </View>
          <Pressable
            onPress={loadData}
            style={[styles.iconButton, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}
          >
            <Ionicons name="refresh" size={20} color={theme.text} />
          </Pressable>
        </View>

        {/* Approval Banner */}
        {profile.status === 'pending' && (
          <View style={[styles.pendingBanner, { backgroundColor: theme.accent + '15', borderColor: theme.accent }]}>
            <Ionicons name="alert-circle" size={20} color={theme.accent} />
            <ThemedText style={[styles.pendingText, { color: theme.accent }]}>
              Pending Approval: Customers cannot order from your kitchen yet.
            </ThemedText>
          </View>
        )}

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <Card style={[styles.statCard, { backgroundColor: theme.primary + '15' }]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="cash-outline" size={24} color={theme.primary} />
            </View>
            <ThemedText style={{ color: theme.textSecondary, marginTop: 12 }}>Today&apos;s Revenue</ThemedText>
            <ThemedText style={{ fontSize: 24, fontWeight: 'bold', marginTop: 4 }}>₹{getTodayRevenue()}</ThemedText>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: theme.accent + '15' }]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="time-outline" size={24} color={theme.accent} />
            </View>
            <ThemedText style={{ color: theme.textSecondary, marginTop: 12 }}>Pending Orders</ThemedText>
            <ThemedText style={{ fontSize: 24, fontWeight: 'bold', marginTop: 4 }}>{getPendingOrdersCount()}</ThemedText>
          </Card>
        </View>

        {/* Monthly Sales */}
        <Card style={styles.projectionCard}>
          <View style={styles.projectionHeader}>
            <View>
              <ThemedText style={{ color: theme.textSecondary }}>All-Time Delivered Sales</ThemedText>
              <ThemedText style={{ fontSize: 28, fontWeight: 'bold', marginTop: 4 }}>₹{getEstMonthlySales()}</ThemedText>
            </View>
            <View style={[styles.trendBadge, { backgroundColor: theme.success + '20' }]}>
              <Ionicons name="trending-up" size={16} color={theme.success} />
              <ThemedText style={{ color: theme.success, fontWeight: 'bold', marginLeft: 4 }}>Live</ThemedText>
            </View>
          </View>

          {/* simple graph mapping */}
          <View style={styles.mockChart}>
            {[40, 60, 45, 80, 55, 90, 70].map((height, i) => (
              <View key={i} style={[styles.bar, { height: `${height}%`, backgroundColor: theme.primary }]} />
            ))}
          </View>
        </Card>

        {/* Reviews */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Kitchen Rating</ThemedText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="star" size={16} color={theme.accent} />
              <ThemedText style={{ fontWeight: 'bold' }}>{Number(profile.rating).toFixed(1)} / 5.0</ThemedText>
            </View>
          </View>

          <Card style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.avatar, { backgroundColor: theme.border }]}>
                  <ThemedText style={{ fontWeight: 'bold' }}>AJ</ThemedText>
                </View>
                <View style={{ marginLeft: 12 }}>
                  <ThemedText style={{ fontWeight: 'bold' }}>Ankit J.</ThemedText>
                  <View style={{ flexDirection: 'row', marginTop: 2 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons key={star} name="star" size={12} color={theme.accent} />
                    ))}
                  </View>
                </View>
              </View>
              <ThemedText style={{ color: theme.textSecondary, fontSize: 12 }}>2 hours ago</ThemedText>
            </View>
            <ThemedText style={{ marginTop: 12, lineHeight: 20 }}>
              &quot;Everything was absolutely amazing! Moist texture and perfectly spiced. Highly recommended.&quot;
            </ThemedText>
          </Card>
        </View>
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  projectionCard: {
    padding: 20,
    marginBottom: 24,
  },
  projectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mockChart: {
    height: 120,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#EADFCF',
  },
  bar: {
    width: 24,
    borderRadius: 6,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewCard: {
    padding: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    gap: 8,
  },
  pendingText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  // Form Styles
  formCard: {
    padding: 20,
    borderRadius: 16,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 14,
    fontSize: 15,
  },
  categoryPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  pickerBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  pickerBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
