import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Pressable, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, SERVER_ROOT } from '@/services/api';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=200&q=80';

// Resolves relative /uploads/... paths into full server URLs
const getImageUrl = (path?: string | null): string => {
  if (!path) return FALLBACK_IMAGE;
  if (path.startsWith('http')) return path;
  return `${SERVER_ROOT}${path}`;
};

export default function OrdersScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  
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

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

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
            source={{ uri: getImageUrl(item.vendor?.image) }}
            style={[styles.orderImage, { backgroundColor: theme.border }]}
            contentFit="cover"
            transition={200}
          />
          <View style={styles.orderDetails}>
            <ThemedText style={styles.vendorName}>{item.vendor?.name || 'Kitchen'}</ThemedText>
            <ThemedText style={[styles.orderItems, { color: theme.textSecondary }]}>
              {itemsText}
            </ThemedText>
            <View style={styles.orderMeta}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ThemedText style={[styles.orderTotal, { color: theme.primary }]}>₹{item.total}</ThemedText>
                {item.deliveryCharge > 0 && (
                  <ThemedText style={{ fontSize: 10, color: theme.textSecondary, marginLeft: 4 }}>
                    (+₹{item.deliveryCharge} Del.)
                  </ThemedText>
                )}
              </View>
              <View style={[styles.statusBadge, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
                <ThemedText style={[styles.statusText, { color: theme.textSecondary, textTransform: 'capitalize' }]}>{item.deliveryType || 'pickup'}</ThemedText>
              </View>
            </View>
          </View>
        </View>
        <View style={[styles.orderBottom, { borderTopColor: theme.border }]}>
          {/* Date Row */}
          <View style={styles.metaRow}>
            <View style={styles.dateRow}>
              <Ionicons name="time-outline" size={13} color={theme.textSecondary} />
              <ThemedText style={[styles.dateText, { color: theme.textSecondary }]}>{formattedDate}</ThemedText>
            </View>
            {/* Status badge inline with date */}
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.color + '15' }]}>
              <View style={[styles.statusDot, { backgroundColor: statusStyle.dot }]} />
              <ThemedText style={[styles.statusText, { color: statusStyle.color }]}>{item.status}</ThemedText>
            </View>
          </View>

          {/* Contact Number Row */}
          {item.vendor?.user?.phoneNumber && (
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={13} color={theme.textSecondary} />
              <ThemedText style={[styles.infoText, { color: theme.textSecondary }]}>
                {item.vendor.user.phoneNumber}
              </ThemedText>
            </View>
          )}

          {/* Delivery OTP Row */}
          {item.deliveryOtp && activeTab === 'active' && (
            <View style={styles.otpRow}>
              <Ionicons name="keypad-outline" size={13} color={theme.textSecondary} />
              <ThemedText style={[styles.infoText, { color: theme.textSecondary }]}>OTP:</ThemedText>
              <View style={[styles.otpBadge, { backgroundColor: theme.primary + '18', borderColor: theme.primary + '40' }]}>
                <ThemedText style={[styles.otpText, { color: theme.primary }]}>{item.deliveryOtp}</ThemedText>
              </View>
            </View>
          )}

          {/* Action Buttons Row */}
          <View style={styles.actionButtons}>
            {item.status !== 'Pending' && item.status !== 'Cancelled' && (
              <Pressable 
                style={[styles.actionBtn, { borderColor: theme.primary, backgroundColor: theme.primary + '10' }]} 
                onPress={() => router.push({ pathname: '/(user)/(tabs)/chat', params: { orderId: item.id, vendorId: item.vendor?.userId, vendorName: item.vendor?.name } })}
              >
                <Ionicons name="chatbubble-outline" size={14} color={theme.primary} />
                <ThemedText style={[styles.actionBtnText, { color: theme.primary }]}>Chat</ThemedText>
              </Pressable>
            )}
            {item.status === 'Delivered' ? (
              <Pressable style={[styles.actionBtn, { borderColor: theme.border }]} onPress={() => Alert.alert('Success', 'Items added to cart!')}>
                <Ionicons name="refresh-outline" size={14} color={theme.textSecondary} />
                <ThemedText style={[styles.actionBtnText, { color: theme.textSecondary }]}>Reorder</ThemedText>
              </Pressable>
            ) : (
              <Pressable style={[styles.actionBtn, { borderColor: theme.border }]} onPress={() => fetchOrders()}>
                <Ionicons name="sync-outline" size={14} color={theme.textSecondary} />
                <ThemedText style={[styles.actionBtnText, { color: theme.textSecondary }]}>Refresh</ThemedText>
              </Pressable>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: Math.max(insets.top, 16) }]}>
      <View style={[styles.headerBar, { borderBottomColor: theme.border }]}>
        <ThemedText style={[styles.headerTitle, { color: theme.text }]}>My Orders</ThemedText>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
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
    flexDirection: 'column',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateText: {
    fontSize: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
  },
  otpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  otpBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  otpText: {
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 3,
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
