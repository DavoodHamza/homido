import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Pressable, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';

import { api } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function VendorOrdersScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

  const fetchOrders = async () => {
    try {
      const prof = await api.vendors.getProfileMe();
      setProfile(prof);

      if (prof) {
        const res = await api.orders.get();
        setOrders(res);
      }
    } catch (err) {
      console.error('Failed to fetch vendor orders:', err);
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
      Alert.alert('Status Updated', `Order marked as ${nextStatus}.`);
      fetchOrders();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not update order status.');
      setLoading(false);
    }
  };

  const handleCompleteOrder = (orderId: string) => {
    Alert.prompt(
      'Complete Order',
      'Enter the 6-digit Delivery OTP provided by the customer:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Complete', 
          onPress: async (otp?: string) => {
            if (!otp || otp.length !== 6) {
              Alert.alert('Invalid', 'OTP must be 6 digits');
              return;
            }
            setLoading(true);
            try {
              await api.orders.complete(orderId, otp);
              Alert.alert('Success', 'Order completed successfully!');
              fetchOrders();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Invalid OTP');
              setLoading(false);
            }
          }
        }
      ],
      'plain-text',
      '',
      'numeric'
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return theme.error;
      case 'Preparing': return theme.accent;
      case 'On the Way': return theme.primary;
      case 'Delivered': return theme.success;
      case 'Rejected': return theme.error;
      case 'Cancelled': return theme.textSecondary;
      default: return theme.textSecondary;
    }
  };

  const getFilteredOrders = () => {
    return orders.filter((order) => {
      const isActive = ['Pending', 'Preparing', 'On the Way'].includes(order.status);
      return activeTab === 'active' ? isActive : !isActive;
    });
  };

  const renderOrder = ({ item }: { item: any }) => {
    const timeFormatted = new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateFormatted = new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' });

    return (
      <Card style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View>
            <ThemedText style={{ fontWeight: 'bold' }}>ORD-{item.id.substring(0, 8).toUpperCase()}</ThemedText>
            <ThemedText style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
              {dateFormatted}, {timeFormatted}
            </ThemedText>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <ThemedText style={{ fontWeight: 'bold', color: theme.primary }}>₹{item.total}</ThemedText>
            <View style={[styles.typeBadge, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
              <ThemedText style={{ fontSize: 10, color: theme.textSecondary, textTransform: 'capitalize' }}>{item.deliveryType || 'pickup'}</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.orderBody}>
          <ThemedText style={{ fontWeight: '600', marginBottom: 8 }}>{item.user?.name || 'Customer'}</ThemedText>
          <ThemedText style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 8 }}>
            Phone: {item.user?.phoneNumber || 'N/A'}
          </ThemedText>
          {item.items.map((lineItem: any, index: number) => (
            <ThemedText key={index} style={{ fontSize: 14, color: theme.textSecondary, marginBottom: 4 }}>
              • {lineItem.name} × {lineItem.quantity}
            </ThemedText>
          ))}
          {item.status !== 'Pending' && item.status !== 'Cancelled' && (
            <Pressable 
              style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.primary + '15', padding: 8, borderRadius: 8, alignSelf: 'flex-start' }}
              onPress={() => router.push({ pathname: '/(vendor)/(tabs)/chat', params: { orderId: item.id, customerName: item.user?.name } })}
            >
              <Ionicons name="chatbubble-outline" size={16} color={theme.primary} style={{ marginRight: 6 }} />
              <ThemedText style={{ color: theme.primary, fontWeight: '600', fontSize: 13 }}>Chat with Customer</ThemedText>
            </Pressable>
          )}
        </View>

        <View style={[styles.orderFooter, { borderTopColor: theme.border }]}>
          {/* Status Row */}
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
            <ThemedText style={{ fontSize: 14, fontWeight: '600', color: getStatusColor(item.status) }}>
              {item.status}
            </ThemedText>
          </View>

          {/* Action Buttons */}
          {item.status === 'Pending' && (
            <View style={styles.actionButtons}>
              <Pressable
                style={[styles.actionBtn, { backgroundColor: theme.primary, borderColor: theme.primary }]}
                onPress={() => handleUpdateStatus(item.id, 'Preparing')}
              >
                <Ionicons name="checkmark" size={14} color="#FFF" />
                <ThemedText style={[styles.actionBtnText, { color: '#FFF' }]}>Accept</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.actionBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => handleUpdateStatus(item.id, 'Rejected')}
              >
                <Ionicons name="close" size={14} color={theme.error} />
                <ThemedText style={[styles.actionBtnText, { color: theme.error }]}>Reject</ThemedText>
              </Pressable>
            </View>
          )}
          {item.status === 'Preparing' && (
            <Pressable
              style={[styles.actionBtn, { backgroundColor: theme.primary, borderColor: theme.primary, flex: 1 }]}
              onPress={() => handleUpdateStatus(item.id, 'On the Way')}
            >
              <Ionicons name="bicycle" size={14} color="#FFF" />
              <ThemedText style={[styles.actionBtnText, { color: '#FFF' }]}>
                {item.deliveryType === 'delivery' ? 'Mark On the Way' : 'Ready for Pickup'}
              </ThemedText>
            </Pressable>
          )}
          {item.status === 'On the Way' && (
            <Pressable
              style={[styles.actionBtn, { backgroundColor: theme.primary, borderColor: theme.primary, flex: 1 }]}
              onPress={() => handleCompleteOrder(item.id)}
            >
              <Ionicons name="checkmark-circle" size={14} color="#FFF" />
              <ThemedText style={[styles.actionBtnText, { color: '#FFF' }]}>
                {item.deliveryType === 'delivery' ? 'Mark Delivered' : 'Complete Pickup'}
              </ThemedText>
            </Pressable>
          )}
        </View>
      </Card>
    );
  };

  if (loading && orders.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, paddingTop: Math.max(insets.top, 16) }]}>
        <ActivityIndicator size="large" color={theme.primary} style={{ flex: 1 }} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, paddingTop: Math.max(insets.top, 16) }]}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Ionicons name="storefront-outline" size={48} color={theme.textSecondary} />
          <ThemedText style={{ color: theme.textSecondary, marginTop: 12, textAlign: 'center' }}>
            Please register your kitchen dashboard profile first on the Home tab.
          </ThemedText>
        </View>
      </View>
    );
  }

  const filtered = getFilteredOrders();

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: Math.max(insets.top, 16) }]}>
      <View style={styles.header}>
        <ThemedText type="title">Orders</ThemedText>

        {/* Tabs for filtering */}
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
            onPress={() => setActiveTab('past')}
            style={[styles.tab, activeTab === 'past' && [styles.activeTab, { borderBottomColor: theme.primary }]]}
          >
            <ThemedText
              style={activeTab === 'past' ? { color: theme.primary, fontWeight: 'bold' } : { color: theme.textSecondary }}
            >
              Past
            </ThemedText>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
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
    </View>
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
    flexDirection: 'column',
    padding: 14,
    borderTopWidth: 1,
    gap: 12,
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
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
});
