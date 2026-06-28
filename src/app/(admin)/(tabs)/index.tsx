import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/hooks/useAuthStore';
import { router } from 'expo-router';

export default function AdminDashboard() {
  const theme = useTheme();
  const { logout } = useAuthStore();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <ThemedText type="title">Admin Overview</ThemedText>
          <Pressable
            onPress={() => {
              logout();
              router.replace('/(auth)/login');
            }}
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
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>Total Users</ThemedText>
            <ThemedText type="stat" style={{ color: theme.text }}>1,420</ThemedText>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.statIconBg, { backgroundColor: theme.accent + '15' }]}>
              <Ionicons name="storefront" size={22} color={theme.accent} />
            </View>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>Total Vendors</ThemedText>
            <ThemedText type="stat" style={{ color: theme.text }}>85</ThemedText>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.statIconBg, { backgroundColor: theme.success + '15' }]}>
              <Ionicons name="receipt" size={22} color={theme.success} />
            </View>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>Total Orders</ThemedText>
            <ThemedText type="stat" style={{ color: theme.text }}>3,245</ThemedText>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.statIconBg, { backgroundColor: theme.error + '15' }]}>
              <Ionicons name="alert-circle" size={22} color={theme.error} />
            </View>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>Pending</ThemedText>
            <ThemedText type="stat" style={{ color: theme.text }}>15</ThemedText>
          </View>
        </View>

        {/* Revenue Card */}
        <View style={[styles.revenueCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.revenueHeader}>
            <View>
              <ThemedText style={[styles.revenueLabel, { color: theme.textSecondary }]}>Platform Revenue (30 days)</ThemedText>
              <ThemedText type="bigStat" style={{ marginTop: 4 }}>₹45,200</ThemedText>
            </View>
            <View style={[styles.trendBadge, { backgroundColor: theme.success + '20' }]}>
              <Ionicons name="trending-up" size={16} color={theme.success} />
              <ThemedText style={{ color: theme.success, fontWeight: '700', marginLeft: 4, fontSize: 13 }}>+8%</ThemedText>
            </View>
          </View>
        </View>

        {/* Action Required */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Action Required</ThemedText>
          
          <Pressable style={[styles.actionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.actionIconBg, { backgroundColor: theme.error + '15' }]}>
              <Ionicons name="alert-circle" size={22} color={theme.error} />
            </View>
            <View style={styles.actionText}>
              <ThemedText style={{ fontWeight: '600', fontSize: 15 }}>3 Vendors Awaiting Approval</ThemedText>
              <ThemedText style={{ color: theme.textSecondary, fontSize: 13, marginTop: 2 }}>Review new vendor applications</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </Pressable>

          <Pressable style={[styles.actionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.actionIconBg, { backgroundColor: theme.accent + '15' }]}>
              <Ionicons name="warning" size={22} color={theme.accent} />
            </View>
            <View style={styles.actionText}>
              <ThemedText style={{ fontWeight: '600', fontSize: 15 }}>12 Flagged Orders</ThemedText>
              <ThemedText style={{ color: theme.textSecondary, fontSize: 13, marginTop: 2 }}>Orders taking too long to accept</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </Pressable>

          <Pressable style={[styles.actionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.actionIconBg, { backgroundColor: theme.primary + '15' }]}>
              <Ionicons name="chatbubbles" size={22} color={theme.primary} />
            </View>
            <View style={styles.actionText}>
              <ThemedText style={{ fontWeight: '600', fontSize: 15 }}>5 Support Tickets</ThemedText>
              <ThemedText style={{ color: theme.textSecondary, fontSize: 13, marginTop: 2 }}>Unresolved customer issues</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </Pressable>
        </View>

        {/* Back to User */}
        <Pressable
          style={[styles.switchRole, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => {
            useAuthStore.getState().login('user');
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
