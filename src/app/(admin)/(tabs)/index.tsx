import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/hooks/useAuthStore';
import { router } from 'expo-router';
import { api } from '@/services/api';

export default function AdminDashboard() {
  const theme = useTheme();
  const { logout } = useAuthStore();

  const [vendors, setVendors] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const v = await api.vendors.getAdminAll();
      setVendors(v);
      const o = await api.orders.get();
      setOrders(o);
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
