import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const VENDORS = [
  {
    id: 'V-102',
    name: 'Spicy Treats',
    owner: 'Rahul Sharma',
    status: 'Pending',
    date: '2025-08-10',
    type: 'Food',
  },
  {
    id: 'V-103',
    name: 'Home Bakes by Anjali',
    owner: 'Anjali Desai',
    status: 'Pending',
    date: '2025-08-09',
    type: 'Cakes',
  },
  {
    id: 'V-098',
    name: 'Sarah\'s Sweets',
    owner: 'Sarah Khan',
    status: 'Active',
    date: '2025-07-20',
    type: 'Cakes',
  }
];

export default function AdminVendors() {
  const theme = useTheme();

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Pending': return theme.accent;
      case 'Active': return theme.success;
      case 'Rejected': return theme.error;
      default: return theme.textSecondary;
    }
  };

  const renderVendor = ({ item }: { item: typeof VENDORS[0] }) => (
    <Card style={styles.vendorCard}>
      <View style={styles.vendorHeader}>
        <View style={styles.avatar}>
          <ThemedText style={{ fontWeight: 'bold' }}>{item.name.charAt(0)}</ThemedText>
        </View>
        <View style={styles.vendorInfo}>
          <ThemedText style={{ fontWeight: 'bold', fontSize: 16 }}>{item.name}</ThemedText>
          <ThemedText style={{ color: theme.textSecondary, fontSize: 14 }}>{item.owner}</ThemedText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <ThemedText style={{ fontSize: 12, fontWeight: 'bold', color: getStatusColor(item.status) }}>
            {item.status}
          </ThemedText>
        </View>
      </View>

      <View style={styles.vendorDetails}>
        <View style={styles.detailItem}>
          <ThemedText style={styles.detailLabel}>Type</ThemedText>
          <ThemedText style={styles.detailValue}>{item.type}</ThemedText>
        </View>
        <View style={styles.detailItem}>
          <ThemedText style={styles.detailLabel}>Applied On</ThemedText>
          <ThemedText style={styles.detailValue}>{item.date}</ThemedText>
        </View>
      </View>

      {item.status === 'Pending' && (
        <View style={[styles.actionRow, { borderTopColor: theme.border }]}>
          <Button title="Reject" variant="outline" size="sm" style={{ flex: 1, marginRight: 8 }} />
          <Button title="Approve" size="sm" style={{ flex: 1 }} />
        </View>
      )}
      {item.status === 'Active' && (
        <View style={[styles.actionRow, { borderTopColor: theme.border }]}>
          <Button title="Issue Warning" variant="outline" size="sm" style={{ flex: 1, marginRight: 8 }} />
          <Button title="Suspend" variant="secondary" size="sm" style={{ flex: 1 }} />
        </View>
      )}
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <ThemedText type="title">Vendors</ThemedText>
        
        <View style={styles.filterTabs}>
          <Pressable style={[styles.tab, styles.activeTab, { borderBottomColor: theme.primary }]}>
            <ThemedText style={{ color: theme.primary, fontWeight: 'bold' }}>Pending (2)</ThemedText>
          </Pressable>
          <Pressable style={styles.tab}>
            <ThemedText style={{ color: theme.textSecondary }}>Active</ThemedText>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={VENDORS}
        keyExtractor={item => item.id}
        renderItem={renderVendor}
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
  vendorCard: {
    padding: 0,
    marginBottom: 16,
    overflow: 'hidden',
  },
  vendorHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EADFCF',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF7A0020', // Primary with opacity
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  vendorDetails: {
    flexDirection: 'row',
    padding: 16,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#60646C', // textSecondary
    marginBottom: 4,
  },
  detailValue: {
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#F9F9F910',
    borderTopWidth: 1,
  }
});
