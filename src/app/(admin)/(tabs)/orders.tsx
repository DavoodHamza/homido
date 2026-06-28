import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Ionicons } from '@expo/vector-icons';

const GLOBAL_ORDERS = [
  {
    id: 'ORD-8273',
    vendorName: 'Sarah\'s Sweets',
    customerName: 'Rahul M.',
    total: '₹1300',
    status: 'Pending Vendor',
    time: '10 mins ago',
  },
  {
    id: 'ORD-8272',
    vendorName: 'Spicy Treats',
    customerName: 'Priya K.',
    total: '₹1200',
    status: 'In Progress',
    time: '45 mins ago',
  },
  {
    id: 'ORD-8271',
    vendorName: 'Home Bakes by Anjali',
    customerName: 'Amit S.',
    total: '₹350',
    status: 'Flagged',
    time: '3 hours ago',
  }
];

export default function AdminOrders() {
  const theme = useTheme();

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Pending Vendor': return theme.accent;
      case 'In Progress': return theme.primary;
      case 'Flagged': return theme.error;
      default: return theme.textSecondary;
    }
  };

  const renderOrder = ({ item }: { item: typeof GLOBAL_ORDERS[0] }) => (
    <Card style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <ThemedText style={{ fontWeight: 'bold' }}>{item.id}</ThemedText>
          <ThemedText style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>{item.time}</ThemedText>
        </View>
        <ThemedText style={{ fontWeight: 'bold', color: theme.text }}>{item.total}</ThemedText>
      </View>

      <View style={styles.orderBody}>
        <View style={styles.partiesRow}>
          <View style={styles.partyItem}>
            <Ionicons name="storefront-outline" size={16} color={theme.textSecondary} style={{ marginRight: 6 }} />
            <ThemedText style={{ fontSize: 14 }}>{item.vendorName}</ThemedText>
          </View>
          <Ionicons name="arrow-forward" size={16} color={theme.border} />
          <View style={styles.partyItem}>
            <Ionicons name="person-outline" size={16} color={theme.textSecondary} style={{ marginRight: 6 }} />
            <ThemedText style={{ fontSize: 14 }}>{item.customerName}</ThemedText>
          </View>
        </View>
      </View>

      <View style={[styles.orderFooter, { borderTopColor: theme.border }]}>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
          <ThemedText style={{ fontSize: 14, fontWeight: '600', color: getStatusColor(item.status) }}>
            {item.status}
          </ThemedText>
        </View>
        <Pressable>
          <ThemedText style={{ color: theme.primary, fontWeight: '600' }}>View Details</ThemedText>
        </Pressable>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <ThemedText type="title">Global Orders</ThemedText>
        
        <View style={styles.filterTabs}>
          <Pressable style={[styles.tab, styles.activeTab, { borderBottomColor: theme.primary }]}>
            <ThemedText style={{ color: theme.primary, fontWeight: 'bold' }}>Active (3)</ThemedText>
          </Pressable>
          <Pressable style={styles.tab}>
            <ThemedText style={{ color: theme.textSecondary }}>Flagged (1)</ThemedText>
          </Pressable>
          <Pressable style={styles.tab}>
            <ThemedText style={{ color: theme.textSecondary }}>All</ThemedText>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={GLOBAL_ORDERS}
        keyExtractor={item => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 0,
  },
  filterTabs: {
    flexDirection: 'row',
    marginTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EADFCF',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  orderCard: {
    padding: 0,
    marginBottom: 16,
    overflow: 'hidden',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EADFCF',
  },
  orderBody: {
    padding: 16,
  },
  partiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  partyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9F9F910',
    borderTopWidth: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  }
});
