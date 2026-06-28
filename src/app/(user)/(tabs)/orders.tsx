import React from 'react';
import { View, StyleSheet, FlatList, Image, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const ORDERS = [
  {
    id: '1',
    vendorName: "Sarah's Sweet Delights",
    vendorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    items: 'Double Chocolate Fudge Cake × 1',
    total: '₹850',
    status: 'Preparing',
    statusColor: '#FFB800',
    date: 'Today, 2:30 PM',
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=200&q=80',
  },
  {
    id: '2',
    vendorName: 'Gourmet Grill & Roasts',
    vendorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
    items: 'Tandoori Skewers × 2, Butter Naan × 4',
    total: '₹720',
    status: 'On the Way',
    statusColor: '#34C759',
    date: 'Today, 1:15 PM',
    image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=200&q=80',
  },
  {
    id: '3',
    vendorName: "Auntie's Best Bakes",
    vendorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&q=80',
    items: 'Red Velvet Cupcakes × 6',
    total: '₹480',
    status: 'Delivered',
    statusColor: '#8E8E93',
    date: 'Yesterday, 6:45 PM',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&q=80',
  },
  {
    id: '4',
    vendorName: 'Spicy Treats',
    vendorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    items: 'Chicken Biryani Family Pack × 1',
    total: '₹550',
    status: 'Delivered',
    statusColor: '#8E8E93',
    date: 'Jun 25, 7:30 PM',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&q=80',
  },
];

export default function OrdersScreen() {
  const theme = useTheme();

  const renderOrder = ({ item }: { item: typeof ORDERS[0] }) => (
    <Pressable style={[styles.orderCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.orderTop}>
        <Image source={{ uri: item.image }} style={styles.orderImage} />
        <View style={styles.orderDetails}>
          <ThemedText style={styles.vendorName}>{item.vendorName}</ThemedText>
          <ThemedText style={[styles.orderItems, { color: theme.textSecondary }]}>{item.items}</ThemedText>
          <View style={styles.orderMeta}>
            <ThemedText style={styles.orderTotal}>{item.total}</ThemedText>
            <View style={[styles.statusBadge, { backgroundColor: item.statusColor + '20' }]}>
              <View style={[styles.statusDot, { backgroundColor: item.statusColor }]} />
              <ThemedText style={[styles.statusText, { color: item.statusColor }]}>{item.status}</ThemedText>
            </View>
          </View>
        </View>
      </View>
      <View style={[styles.orderBottom, { borderTopColor: theme.border }]}>
        <View style={styles.dateRow}>
          <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
          <ThemedText style={[styles.dateText, { color: theme.textSecondary }]}>{item.date}</ThemedText>
        </View>
        <View style={styles.actionButtons}>
          {item.status === 'Delivered' ? (
            <Pressable style={[styles.actionBtn, { borderColor: theme.primary }]}>
              <ThemedText style={[styles.actionBtnText, { color: theme.primary }]}>Reorder</ThemedText>
            </Pressable>
          ) : (
            <Pressable style={[styles.actionBtn, { borderColor: theme.primary }]}>
              <ThemedText style={[styles.actionBtnText, { color: theme.primary }]}>Track</ThemedText>
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.headerBar}>
        <ThemedText style={styles.headerTitle}>My Orders</ThemedText>
      </View>
      <View style={styles.tabBar}>
        <Pressable style={[styles.tab, styles.activeTab, { borderBottomColor: theme.primary }]}>
          <ThemedText style={[styles.tabText, { color: theme.primary, fontWeight: '700' }]}>Active</ThemedText>
        </Pressable>
        <Pressable style={styles.tab}>
          <ThemedText style={[styles.tabText, { color: theme.textSecondary }]}>History</ThemedText>
        </Pressable>
      </View>
      <FlatList
        data={ORDERS}
        keyExtractor={item => item.id}
        renderItem={renderOrder}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
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
});
