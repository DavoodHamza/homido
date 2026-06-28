import { View, StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/hooks/useAuthStore';

export default function AdminDashboard() {
  const theme = useTheme();
  const { logout } = useAuthStore();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <ThemedText type="title">Admin Overview</ThemedText>
        </View>

        {/* Global Stats */}
        <View style={styles.statsGrid}>
          <Card style={[styles.statCard, { backgroundColor: theme.primary + '15' }]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="people" size={24} color={theme.primary} />
            </View>
            <ThemedText style={{ color: theme.textSecondary, marginTop: 12 }}>Total Users</ThemedText>
            <ThemedText style={{ fontSize: 24, fontWeight: 'bold', marginTop: 4 }}>1,420</ThemedText>
          </Card>
          
          <Card style={[styles.statCard, { backgroundColor: theme.accent + '15' }]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="storefront" size={24} color={theme.accent} />
            </View>
            <ThemedText style={{ color: theme.textSecondary, marginTop: 12 }}>Total Vendors</ThemedText>
            <ThemedText style={{ fontSize: 24, fontWeight: 'bold', marginTop: 4 }}>85</ThemedText>
          </Card>
        </View>

        <Card style={styles.projectionCard}>
          <View style={styles.projectionHeader}>
            <View>
              <ThemedText style={{ color: theme.textSecondary }}>Platform Revenue (30 days)</ThemedText>
              <ThemedText style={{ fontSize: 28, fontWeight: 'bold', marginTop: 4 }}>₹45,200</ThemedText>
            </View>
            <View style={[styles.trendBadge, { backgroundColor: theme.success + '20' }]}>
              <Ionicons name="trending-up" size={16} color={theme.success} />
              <ThemedText style={{ color: theme.success, fontWeight: 'bold', marginLeft: 4 }}>8%</ThemedText>
            </View>
          </View>
        </Card>

        {/* Pending Actions */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Action Required</ThemedText>
          
          <Card style={styles.actionCard}>
            <View style={styles.actionIcon}>
              <Ionicons name="alert-circle" size={24} color={theme.error} />
            </View>
            <View style={styles.actionText}>
              <ThemedText style={{ fontWeight: 'bold' }}>3 Vendors Awaiting Approval</ThemedText>
              <ThemedText style={{ color: theme.textSecondary, fontSize: 12 }}>Review new vendor applications.</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </Card>

          <Card style={styles.actionCard}>
            <View style={styles.actionIcon}>
              <Ionicons name="warning" size={24} color={theme.accent} />
            </View>
            <View style={styles.actionText}>
              <ThemedText style={{ fontWeight: 'bold' }}>12 Flagged Orders</ThemedText>
              <ThemedText style={{ color: theme.textSecondary, fontSize: 12 }}>Orders taking too long to accept.</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </Card>
        </View>

        <Button 
          title="Logout" 
          variant="secondary" 
          onPress={logout}
          style={{ marginTop: 24, marginBottom: 40 }} 
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
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  actionIcon: {
    marginRight: 16,
  },
  actionText: {
    flex: 1,
  }
});
