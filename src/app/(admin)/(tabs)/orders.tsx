import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';

export default function AdminOrders() {
  const theme = useTheme();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'refunds' | 'all'>('active');

  const fetchOrders = async () => {
    try {
      const res = await api.orders.get();
      setOrders(res);
    } catch (err) {
      console.error('Failed to fetch global orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    setLoading(true);
    try {
      await api.orders.updateStatus(orderId, nextStatus);
      fetchOrders();
    } catch (err: any) {
      console.error('Could not update order status:', err);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return theme.accent;
      case 'Preparing': return theme.primary;
      case 'On the Way': return '#34C759';
      case 'Delivered': return theme.success;
      case 'Cancelled': return theme.error;
      case 'Rejected': return theme.error;
      case 'Refund Started': return theme.accent;
      case 'Refund Completed': return theme.success;
      default: return theme.textSecondary;
    }
  };

  const getFilteredOrders = () => {
    return orders.filter((order) => {
      if (activeTab === 'active') {
        return ['Pending', 'Preparing', 'On the Way'].includes(order.status);
      }
      if (activeTab === 'pending') {
        return order.status === 'Pending';
      }
      if (activeTab === 'refunds') {
        return ['Rejected', 'Refund Started', 'Refund Completed'].includes(order.status);
      }
      return true; // All
    });
  };

  const renderOrder = ({ item }: { item: any }) => {
    const statusColor = getStatusColor(item.status);
    const dateFormatted = new Date(item.date).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <Card style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View>
            <ThemedText style={{ fontWeight: 'bold' }}>ORD-{item.id.substring(0, 8).toUpperCase()}</ThemedText>
            <ThemedText style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>{dateFormatted}</ThemedText>
          </View>
          <ThemedText style={{ fontWeight: 'bold', color: theme.text }}>₹{item.total}</ThemedText>
        </View>

        <View style={styles.orderBody}>
          <View style={styles.partiesRow}>
            <View style={styles.partyItem}>
              <Ionicons name="storefront-outline" size={16} color={theme.textSecondary} style={{ marginRight: 6 }} />
              <ThemedText style={{ fontSize: 14 }} numberOfLines={1}>
                {item.vendor?.name || 'Kitchen'}
              </ThemedText>
            </View>
            <Ionicons name="arrow-forward" size={16} color={theme.border} style={{ marginHorizontal: 8 }} />
            <View style={styles.partyItem}>
              <Ionicons name="person-outline" size={16} color={theme.textSecondary} style={{ marginRight: 6 }} />
              <ThemedText style={{ fontSize: 14 }} numberOfLines={1}>
                {item.user?.name || 'Customer'}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={[styles.orderFooter, { borderTopColor: theme.border }]}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <ThemedText style={{ fontSize: 14, fontWeight: '600', color: statusColor }}>
              {item.status}
            </ThemedText>
          </View>
          {activeTab === 'refunds' && (
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              {item.status === 'Rejected' && (
                <Pressable
                  style={[styles.actionBtn, { borderColor: theme.primary, backgroundColor: theme.primary + '10' }]}
                  onPress={() => handleUpdateStatus(item.id, 'Refund Started')}
                >
                  <ThemedText style={[styles.actionText, { color: theme.primary }]}>Start Refund</ThemedText>
                </Pressable>
              )}
              {item.status === 'Refund Started' && (
                <Pressable
                  style={[styles.actionBtn, { borderColor: theme.success, backgroundColor: theme.success + '10' }]}
                  onPress={() => handleUpdateStatus(item.id, 'Refund Completed')}
                >
                  <ThemedText style={[styles.actionText, { color: theme.success }]}>Complete Refund</ThemedText>
                </Pressable>
              )}
            </View>
          )}
        </View>
      </Card>
    );
  };

  const filtered = getFilteredOrders();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <ThemedText type="title">Global Orders</ThemedText>
        
        <View style={styles.filterTabs}>
          <Pressable
            onPress={() => setActiveTab('active')}
            style={[styles.tab, activeTab === 'active' && [styles.activeTab, { borderBottomColor: theme.primary }]]}
          >
            <ThemedText
              style={activeTab === 'active' ? { color: theme.primary, fontWeight: 'bold' } : { color: theme.textSecondary }}
            >
              Active ({orders.filter(o => ['Pending', 'Preparing', 'On the Way'].includes(o.status)).length})
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('pending')}
            style={[styles.tab, activeTab === 'pending' && [styles.activeTab, { borderBottomColor: theme.primary }]]}
          >
            <ThemedText
              style={activeTab === 'pending' ? { color: theme.primary, fontWeight: 'bold' } : { color: theme.textSecondary }}
            >
              Pending ({orders.filter(o => o.status === 'Pending').length})
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('refunds')}
            style={[styles.tab, activeTab === 'refunds' && [styles.activeTab, { borderBottomColor: theme.primary }]]}
          >
            <ThemedText
              style={activeTab === 'refunds' ? { color: theme.primary, fontWeight: 'bold' } : { color: theme.textSecondary }}
            >
              Refunds ({orders.filter(o => ['Rejected', 'Refund Started', 'Refund Completed'].includes(o.status)).length})
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('all')}
            style={[styles.tab, activeTab === 'all' && [styles.activeTab, { borderBottomColor: theme.primary }]]}
          >
            <ThemedText
              style={activeTab === 'all' ? { color: theme.primary, fontWeight: 'bold' } : { color: theme.textSecondary }}
            >
              All ({orders.length})
            </ThemedText>
          </Pressable>
        </View>
      </View>

      {loading && orders.length === 0 ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderOrder}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={48} color={theme.textSecondary} />
              <ThemedText style={{ color: theme.textSecondary, marginTop: 12 }}>
                No {activeTab} orders found.
              </ThemedText>
            </View>
          }
        />
      )}
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
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
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
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
});
