import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Pressable, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';

export default function VendorOrders() {
  const theme = useTheme();

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
              <Button
                title="Accept"
                size="sm"
                onPress={() => handleUpdateStatus(item.id, 'Preparing')}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Reject"
                size="sm"
                variant="outline"
                onPress={() => handleUpdateStatus(item.id, 'Rejected')}
                style={{ flex: 1 }}
              />
            </View>
          )}
          {item.status === 'Preparing' && (
            <Button
              title={item.deliveryType === 'delivery' ? "Mark On the Way" : "Mark Ready for Pickup"}
              size="sm"
              onPress={() => handleUpdateStatus(item.id, 'On the Way')}
            />
          )}
          {item.status === 'On the Way' && (
            <Button
              title={item.deliveryType === 'delivery' ? "Deliver" : "Complete Pickup"}
              size="sm"
              onPress={() => handleCompleteOrder(item.id)}
            />
          )}
        </View>
      </Card>
    );
  };

  if (loading && orders.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <ActivityIndicator size="large" color={theme.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Ionicons name="storefront-outline" size={48} color={theme.textSecondary} />
          <ThemedText style={{ color: theme.textSecondary, marginTop: 12, textAlign: 'center' }}>
            Please register your kitchen dashboard profile first on the Home tab.
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const filtered = getFilteredOrders();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
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
  actionButtons: {
    flexDirection: 'row',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
});
