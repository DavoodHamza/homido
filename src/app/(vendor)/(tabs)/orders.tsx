import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const ORDERS = [
  {
    id: 'ORD-8273',
    customerName: 'Rahul M.',
    items: ['1x Double Chocolate Fudge Cake', '2x Red Velvet Cupcakes'],
    total: '₹1300',
    status: 'Pending',
    time: '10 mins ago',
    type: 'Delivery',
  },
  {
    id: 'ORD-8272',
    customerName: 'Priya K.',
    items: ['1x Custom Birthday Cake (1kg)'],
    total: '₹1200',
    status: 'In Progress',
    time: '45 mins ago',
    type: 'Dine-in',
  },
  {
    id: 'ORD-8271',
    customerName: 'Amit S.',
    items: ['1x Assorted Snacks Box'],
    total: '₹350',
    status: 'Delivered',
    time: '2 hours ago',
    type: 'Takeaway',
  }
];

export default function VendorOrders() {
  const theme = useTheme();

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Pending': return theme.error;
      case 'In Progress': return theme.accent;
      case 'Delivered': return theme.success;
      default: return theme.textSecondary;
    }
  };

  const renderOrder = ({ item }: { item: typeof ORDERS[0] }) => (
    <Card style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <ThemedText style={{ fontWeight: 'bold' }}>{item.id}</ThemedText>
          <ThemedText style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>{item.time}</ThemedText>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <ThemedText style={{ fontWeight: 'bold', color: theme.primary }}>{item.total}</ThemedText>
          <View style={[styles.typeBadge, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
            <ThemedText style={{ fontSize: 10, color: theme.textSecondary }}>{item.type}</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.orderBody}>
        <ThemedText style={{ fontWeight: '600', marginBottom: 8 }}>{item.customerName}</ThemedText>
        {item.items.map((lineItem, index) => (
          <ThemedText key={index} style={{ fontSize: 14, color: theme.textSecondary, marginBottom: 4 }}>
            • {lineItem}
          </ThemedText>
        ))}
      </View>

      <View style={[styles.orderFooter, { borderTopColor: theme.border }]}>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
          <ThemedText style={{ fontSize: 14, fontWeight: '600', color: getStatusColor(item.status) }}>
            {item.status}
          </ThemedText>
        </View>
        
        {item.status === 'Pending' && (
          <View style={styles.actionButtons}>
            <Button title="Reject" variant="outline" size="sm" style={{ marginRight: 8 }} />
            <Button title="Accept" size="sm" />
          </View>
        )}
        {item.status === 'In Progress' && (
          <Button title="Mark Ready" size="sm" />
        )}
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <ThemedText type="title">Orders</ThemedText>
        
        {/* Simple Tabs for filtering */}
        <View style={styles.filterTabs}>
          <Pressable style={[styles.tab, styles.activeTab, { borderBottomColor: theme.primary }]}>
            <ThemedText style={{ color: theme.primary, fontWeight: 'bold' }}>Active (2)</ThemedText>
          </Pressable>
          <Pressable style={styles.tab}>
            <ThemedText style={{ color: theme.textSecondary }}>Past</ThemedText>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={ORDERS}
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
    marginRight: 16,
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
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  orderBody: {
    padding: 16,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9F9F910', // Just a slight contrast
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
  },
  actionButtons: {
    flexDirection: 'row',
  }
});
