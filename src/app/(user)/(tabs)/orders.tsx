import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Image, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/services/api';

export default function OrdersScreen() {
  const theme = useTheme();
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  const fetchOrders = async () => {
    try {
      const res = await api.orders.get();
      setOrders(res);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Pending':
        return { color: '#FFB800', dot: '#FFB800' };
      case 'Preparing':
        return { color: '#FF9500', dot: '#FF9500' };
      case 'On the Way':
        return { color: '#34C759', dot: '#34C759' };
      case 'Delivered':
        return { color: '#8E8E93', dot: '#8E8E93' };
      case 'Cancelled':
        return { color: '#FF3B30', dot: '#FF3B30' };
      default:
        return { color: theme.textSecondary, dot: theme.border };
    }
  };

  const getFilteredOrders = () => {
    return orders.filter(order => {
      const isActive = ['Pending', 'Preparing', 'On the Way'].includes(order.status);
      return activeTab === 'active' ? isActive : !isActive;
    });
  };

  const renderOrder = ({ item }: { item: any }) => {
    const statusStyle = getStatusStyle(item.status);
    const itemsText = item.items.map((line: any) => `${line.name} × ${line.quantity}`).join(', ');
    const formattedDate = new Date(item.date).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <Pressable style={[styles.orderCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.orderTop}>
          <Image
            source={{ uri: item.vendor?.image || 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=200&q=80' }}
            style={styles.orderImage}
          />
          <View style={styles.orderDetails}>
            <ThemedText style={styles.vendorName}>{item.vendor?.name || 'Kitchen'}</ThemedText>
            <ThemedText style={[styles.orderItems, { color: theme.textSecondary }]} numberOfLines={2}>
              {itemsText}
            </ThemedText>
            <View style={styles.orderMeta}>
              <ThemedText style={styles.orderTotal}>₹{item.total}</ThemedText>
              <View style={[styles.statusBadge, { backgroundColor: statusStyle.color + '15' }]}>
                <View style={[styles.statusDot, { backgroundColor: statusStyle.dot }]} />
                <ThemedText style={[styles.statusText, { color: statusStyle.color }]}>{item.status}</ThemedText>
              </View>
            </View>
          </View>
        </View>
        <View style={[styles.orderBottom, { borderTopColor: theme.border }]}>
          <View style={styles.dateRow}>
            <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
            <ThemedText style={[styles.dateText, { color: theme.textSecondary }]}>{formattedDate}</ThemedText>
          </View>
          <View style={styles.actionButtons}>
            {item.status === 'Delivered' ? (
              <Pressable style={[styles.actionBtn, { borderColor: theme.primary }]} onPress={() => Alert.alert('Success', 'Items added to cart!')}>
                <ThemedText style={[styles.actionBtnText, { color: theme.primary }]}>Reorder</ThemedText>
              </Pressable>
            ) : (
              <Pressable style={[styles.actionBtn, { borderColor: theme.primary }]} onPress={() => fetchOrders()}>
                <ThemedText style={[styles.actionBtnText, { color: theme.primary }]}>Refresh</ThemedText>
              </Pressable>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.headerBar}>
        <ThemedText style={styles.headerTitle}>My Orders</ThemedText>
      </View>
      
      <View style={styles.tabBar}>
        <Pressable
          onPress={() => setActiveTab('active')}
          style={[styles.tab, activeTab === 'active' && [styles.activeTab, { borderBottomColor: theme.primary }]]}
        >
          <ThemedText
            style={[
              styles.tabText,
              activeTab === 'active' ? { color: theme.primary, fontWeight: '700' } : { color: theme.textSecondary }
            ]}
          >
            Active
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('history')}
          style={[styles.tab, activeTab === 'history' && [styles.activeTab, { borderBottomColor: theme.primary }]]}
        >
          <ThemedText
            style={[
              styles.tabText,
              activeTab === 'history' ? { color: theme.primary, fontWeight: '700' } : { color: theme.textSecondary }
            ]}
          >
            History
          </ThemedText>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={getFilteredOrders()}
          keyExtractor={item => item.id}
          renderItem={renderOrder}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
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
  headerBar: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  tab: {
    paddingVertical: 10,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  orderCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  orderTop: {
    flexDirection: 'row',
    padding: 14,
  },
  orderImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
  },
  orderDetails: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  orderItems: {
    fontSize: 13,
    marginBottom: 8,
  },
  orderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF7A00',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
});
