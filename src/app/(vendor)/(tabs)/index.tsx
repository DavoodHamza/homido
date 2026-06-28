import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';

export default function VendorDashboard() {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText style={{ color: theme.textSecondary }}>Welcome back,</ThemedText>
            <ThemedText type="title">Sarah's Sweets</ThemedText>
          </View>
          <Pressable style={[styles.iconButton, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
            <Ionicons name="notifications-outline" size={24} color={theme.text} />
            <View style={[styles.notificationDot, { backgroundColor: theme.primary }]} />
          </Pressable>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <Card style={[styles.statCard, { backgroundColor: theme.primary + '15' }]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="cash-outline" size={24} color={theme.primary} />
            </View>
            <ThemedText style={{ color: theme.textSecondary, marginTop: 12 }}>Today's Revenue</ThemedText>
            <ThemedText style={{ fontSize: 24, fontWeight: 'bold', marginTop: 4 }}>₹4,250</ThemedText>
          </Card>
          
          <Card style={[styles.statCard, { backgroundColor: theme.accent + '15' }]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="time-outline" size={24} color={theme.accent} />
            </View>
            <ThemedText style={{ color: theme.textSecondary, marginTop: 12 }}>Pending Orders</ThemedText>
            <ThemedText style={{ fontSize: 24, fontWeight: 'bold', marginTop: 4 }}>12</ThemedText>
          </Card>
        </View>

        {/* Monthly Projection */}
        <Card style={styles.projectionCard}>
          <View style={styles.projectionHeader}>
            <View>
              <ThemedText style={{ color: theme.textSecondary }}>Est. Monthly Sales</ThemedText>
              <ThemedText style={{ fontSize: 28, fontWeight: 'bold', marginTop: 4 }}>₹1,24,000</ThemedText>
            </View>
            <View style={[styles.trendBadge, { backgroundColor: theme.success + '20' }]}>
              <Ionicons name="trending-up" size={16} color={theme.success} />
              <ThemedText style={{ color: theme.success, fontWeight: 'bold', marginLeft: 4 }}>14%</ThemedText>
            </View>
          </View>
          {/* Simple mock chart area */}
          <View style={styles.mockChart}>
            {[40, 60, 45, 80, 55, 90, 70].map((height, i) => (
              <View key={i} style={[styles.bar, { height: `${height}%`, backgroundColor: theme.primary }]} />
            ))}
          </View>
        </Card>

        {/* Recent Reviews */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Recent Reviews</ThemedText>
            <ThemedText style={{ color: theme.primary, fontWeight: '600' }}>See All</ThemedText>
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
                    {[1, 2, 3, 4, 5].map(star => (
                      <Ionicons key={star} name="star" size={12} color={theme.accent} />
                    ))}
                  </View>
                </View>
              </View>
              <ThemedText style={{ color: theme.textSecondary, fontSize: 12 }}>2 hours ago</ThemedText>
            </View>
            <ThemedText style={{ marginTop: 12, lineHeight: 20 }}>
              "The chocolate fudge cake was absolutely amazing! Perfect moist texture and not too sweet. Highly recommended."
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
    position: 'relative',
  },
  notificationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: 'absolute',
    top: 10,
    right: 12,
    borderWidth: 2,
    borderColor: '#FFF',
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
    borderTopColor: '#EADFCF', // Using a static color for the mock chart line for now
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
});
