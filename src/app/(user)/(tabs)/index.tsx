import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, TextInput, View, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useThemeStore } from '@/hooks/useThemeStore';
import { useAuthStore } from '@/hooks/useAuthStore';
import { api } from '@/services/api';

const CATEGORIES = [
  { id: 'all', name: 'All Food', icon: '🍽️' },
  { id: 'cakes', name: 'Cakes', icon: '🎂' },
  { id: 'meals', name: 'Meals', icon: '🍲' },
  { id: 'pickles', name: 'Pickles', icon: '🥒' },
  { id: 'snacks', name: 'Snacks', icon: '🥨' },
  { id: 'desserts', name: 'Desserts', icon: '🍨' },
];

export default function Home() {
  const theme = useTheme();
  const { themeMode, toggleTheme } = useThemeStore();
  const { user, isLoggedIn } = useAuthStore();

  // State for filtering and sorting
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'time'>('rating');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);

  // Temporary states for Modal to apply on press
  const [tempSortBy, setTempSortBy] = useState<'rating' | 'time'>('rating');
  const [tempMinRating, setTempMinRating] = useState<number>(0);

  // Dynamic lists from backend
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Selected Vendor Menu Modal
  const [selectedVendor, setSelectedVendor] = useState<any | null>(null);
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [cart, setCart] = useState<{ [itemId: string]: { item: any; quantity: number } }>({});

  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchVendors = async () => {
        setLoading(true);
        try {
          const res = await api.vendors.getAll({
            category: selectedCategory,
            search: searchQuery,
            minRating: minRating > 0 ? minRating : undefined,
            sortBy: sortBy,
          });
          setVendors(res);
        } catch (err: any) {
          console.error('Failed to fetch vendors:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchVendors();
    }, 0);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery, minRating, sortBy]);

  const openVendorMenu = async (vendor: any) => {
    if (!isLoggedIn) {
      Alert.alert(
        'Sign in Required',
        'Please sign in or create an account to view menus and place orders.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
          { text: 'Sign Up', onPress: () => router.push('/(auth)/signup') },
        ]
      );
      return;
    }
    setSelectedVendor(vendor);
    setCart({});
    setMenuModalVisible(true);
    setMenuItems([]);
    setMenuLoading(true);
    try {
      const items = await api.menu.getByVendor(vendor.id);
      setMenuItems(items);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not load menu items.');
    } finally {
      setMenuLoading(false);
    }
  };

  const updateCartQuantity = (item: any, delta: number) => {
    setCart((prev) => {
      const current = prev[item.id];
      const newQty = (current?.quantity || 0) + delta;

      if (newQty <= 0) {
        const next = { ...prev };
        delete next[item.id];
        return next;
      }

      return {
        ...prev,
        [item.id]: {
          item,
          quantity: newQty,
        },
      };
    });
  };

  const getCartTotal = () => {
    return Object.values(cart).reduce((sum, c) => sum + Number(c.item.price) * c.quantity, 0);
  };

  const handlePlaceOrder = async () => {
    if (!isLoggedIn) {
      Alert.alert(
        'Sign in Required',
        'You need an account to place orders.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
        ]
      );
      return;
    }
    if (!selectedVendor) return;
    const cartItems = Object.values(cart);
    if (cartItems.length === 0) return;

    setLoading(true);
    try {
      const itemsPayload = cartItems.map((c) => ({
        menuItemId: c.item.id,
        quantity: c.quantity,
      }));
      await api.orders.create(selectedVendor.id, itemsPayload);
      setMenuModalVisible(false);
      setCart({});
      Alert.alert('Success', 'Your order has been placed successfully!', [
        { text: 'OK', onPress: () => router.replace('/(user)/(tabs)/orders') },
      ]);
    } catch (err: any) {
      Alert.alert('Checkout Failed', err.message || 'Could not place order.');
    } finally {
      setLoading(false);
    }
  };

  const openFilterModal = () => {
    setTempSortBy(sortBy);
    setTempMinRating(minRating);
    setFilterModalVisible(true);
  };

  const applyFilters = () => {
    setSortBy(tempSortBy);
    setMinRating(tempMinRating);
    setFilterModalVisible(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header - Location */}
        <View style={styles.header}>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={24} color={theme.primary} />
            <View style={{ marginLeft: 8 }}>
              <ThemedText style={styles.locationTitle}>Home</ThemedText>
              <ThemedText style={{ color: theme.textSecondary, fontSize: 12 }}>
                {user?.address || 'Signature Towers, Hitech City'}
              </ThemedText>
            </View>
          </View>
          <View style={styles.headerActions}>
            <Pressable onPress={toggleTheme} style={{ padding: 8, marginRight: 4 }}>
              <Ionicons name={themeMode === 'dark' ? 'sunny' : 'moon'} size={22} color={theme.text} />
            </Pressable>
            <View style={styles.profileButton}>
              <ThemedText style={{ color: '#FFF', fontWeight: 'bold' }}>
                {user?.name ? user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'DK'}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Search & Filter Button */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="search" size={20} color={theme.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Search for food, chefs..."
              placeholderTextColor={theme.textSecondary}
              style={[styles.searchInput, { color: theme.text }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={theme.textSecondary} style={{ marginLeft: 8 }} />
              </Pressable>
            )}
          </View>
          <Pressable onPress={openFilterModal} style={[styles.filterButton, { backgroundColor: theme.primary }]}>
            <Ionicons name="options-outline" size={20} color="#FFF" />
          </Pressable>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Quick Categories</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                  style={[
                    styles.categoryItem,
                    isSelected
                      ? { borderColor: theme.primary, borderWidth: 2, backgroundColor: theme.card }
                      : { borderColor: theme.border, borderWidth: 1, backgroundColor: theme.card },
                  ]}
                >
                  <ThemedText style={{ fontSize: 24, marginBottom: 4 }}>{cat.icon}</ThemedText>
                  <ThemedText
                    style={{
                      fontSize: 12,
                      color: isSelected ? theme.primary : theme.text,
                      fontWeight: isSelected ? '600' : '400',
                    }}
                  >
                    {cat.name}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Vendor of the Month Banner */}
        <View style={[styles.promoBanner, { backgroundColor: theme.card }]}>
          <View style={{ flex: 1 }}>
            <ThemedText style={{ color: theme.accent, fontWeight: 'bold', marginBottom: 4 }}>
              VENDOR OF THE MONTH
            </ThemedText>
            <ThemedText type="subtitle" style={{ fontSize: 20 }}>Sarah&apos;s Sweet Delights</ThemedText>
            <ThemedText style={{ fontSize: 12, color: theme.textSecondary, marginTop: 4 }}>
              Award winning custom cakes
            </ThemedText>
          </View>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1557925923-33b251d59265?w=200&q=80' }}
            style={styles.promoImage}
          />
        </View>

        {/* Popular Near You */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Kitchens Near You</ThemedText>
            <ThemedText style={{ color: theme.primary, fontWeight: '600' }}>
              Sort: {sortBy === 'rating' ? 'Rating' : 'Delivery Time'}
            </ThemedText>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 20 }} />
          ) : vendors.length > 0 ? (
            vendors.map((vendor) => (
              <Pressable
                key={vendor.id}
                onPress={() => openVendorMenu(vendor)}
                style={[styles.vendorCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <Image source={{ uri: vendor.image || 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=500&q=80' }} style={styles.vendorImage} />
                <View style={styles.vendorInfo}>
                  <ThemedText style={{ fontWeight: 'bold', fontSize: 18 }}>{vendor.name}</ThemedText>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={14} color={theme.accent} />
                    <ThemedText style={{ fontSize: 12, marginLeft: 4, fontWeight: '600' }}>
                      {Number(vendor.rating).toFixed(1)}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.vendorMeta}>
                  <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
                  <ThemedText style={{ fontSize: 12, color: theme.textSecondary, marginLeft: 4 }}>
                    {vendor.timeVal} mins
                  </ThemedText>
                  <View style={{ flex: 1 }} />
                  <ThemedText style={{ fontSize: 12, color: theme.primary, fontWeight: '700' }}>
                    View Menu
                  </ThemedText>
                </View>
              </Pressable>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="restaurant-outline" size={48} color={theme.textSecondary} />
              <ThemedText style={{ color: theme.textSecondary, marginTop: 12 }}>
                No kitchens match your filter.
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modern Bottom Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setFilterModalVisible(false)}>
          <Pressable style={[styles.modalContainer, { backgroundColor: theme.card }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Filters & Sort</ThemedText>
              <Pressable onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </Pressable>
            </View>

            {/* Sort Section */}
            <View style={styles.modalSection}>
              <ThemedText style={styles.modalSectionTitle}>Sort By</ThemedText>
              <View style={styles.modalOptionRow}>
                <Pressable
                  onPress={() => setTempSortBy('rating')}
                  style={[
                    styles.modalOption,
                    { borderColor: theme.border },
                    tempSortBy === 'rating' && [
                      styles.modalOptionActive,
                      { backgroundColor: theme.primary, borderColor: theme.primary },
                    ],
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.modalOptionText,
                      { color: theme.text },
                      tempSortBy === 'rating' && styles.modalOptionActiveText,
                    ]}
                  >
                    Top Rated ⭐️
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => setTempSortBy('time')}
                  style={[
                    styles.modalOption,
                    { borderColor: theme.border },
                    tempSortBy === 'time' && [
                      styles.modalOptionActive,
                      { backgroundColor: theme.primary, borderColor: theme.primary },
                    ],
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.modalOptionText,
                      { color: theme.text },
                      tempSortBy === 'time' && styles.modalOptionActiveText,
                    ]}
                  >
                    Fastest Delivery 🕒
                  </ThemedText>
                </Pressable>
              </View>
            </View>

            {/* Minimum Rating Section */}
            <View style={styles.modalSection}>
              <ThemedText style={styles.modalSectionTitle}>Minimum Rating</ThemedText>
              <View style={styles.modalOptionRow}>
                {[0, 4.5, 4.8].map((ratingVal) => (
                  <Pressable
                    key={ratingVal}
                    onPress={() => setTempMinRating(ratingVal)}
                    style={[
                      styles.modalOption,
                      { borderColor: theme.border },
                      tempMinRating === ratingVal && [
                        styles.modalOptionActive,
                        { backgroundColor: theme.primary, borderColor: theme.primary },
                      ],
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.modalOptionText,
                        { color: theme.text },
                        tempMinRating === ratingVal && styles.modalOptionActiveText,
                      ]}
                    >
                      {ratingVal === 0 ? 'Show All' : `${ratingVal}⭐️ +`}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActionRow}>
              <Pressable
                onPress={() => {
                  setTempSortBy('rating');
                  setTempMinRating(0);
                }}
                style={[styles.modalBtn, { borderColor: theme.border, borderWidth: 1 }]}
              >
                <ThemedText style={{ color: theme.textSecondary, fontWeight: '600' }}>Reset</ThemedText>
              </Pressable>
              <Pressable
                onPress={applyFilters}
                style={[styles.modalBtn, styles.modalApplyBtn, { backgroundColor: theme.primary }]}
              >
                <ThemedText style={styles.modalApplyBtnText}>Apply</ThemedText>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Menu / Checkout Drawer Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={menuModalVisible}
        onRequestClose={() => setMenuModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setMenuModalVisible(false)}>
          <Pressable style={[styles.menuModalContainer, { backgroundColor: theme.card }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View>
                <ThemedText style={styles.modalTitle}>{selectedVendor?.name}</ThemedText>
                <ThemedText style={{ color: theme.textSecondary, fontSize: 13, marginTop: 4 }}>
                  {selectedVendor?.category.toUpperCase()} • ⭐️ {Number(selectedVendor?.rating).toFixed(1)}
                </ThemedText>
              </View>
              <Pressable onPress={() => setMenuModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={theme.text} />
              </Pressable>
            </View>

            {menuLoading ? (
              <ActivityIndicator size="large" color={theme.primary} style={{ marginVertical: 40 }} />
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
                {menuItems.length > 0 ? (
                  menuItems.map((item) => {
                    const quantity = cart[item.id]?.quantity || 0;
                    return (
                      <View key={item.id} style={[styles.menuItemRow, { borderBottomColor: theme.border }]}>
                        {item.image && <Image source={{ uri: item.image }} style={styles.menuItemImage} />}
                        <View style={{ flex: 1, marginLeft: item.image ? 12 : 0 }}>
                          <ThemedText style={{ fontWeight: '700', fontSize: 15 }}>{item.name}</ThemedText>
                          {item.description && (
                            <ThemedText style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
                              {item.description}
                            </ThemedText>
                          )}
                          <ThemedText style={{ color: theme.primary, fontWeight: '700', marginTop: 4 }}>
                            ₹{item.price}
                          </ThemedText>
                        </View>

                        {/* Quantity Controls */}
                        <View style={styles.quantityControls}>
                          {quantity > 0 ? (
                            <>
                              <Pressable
                                onPress={() => updateCartQuantity(item, -1)}
                                style={[styles.qtyBtn, { backgroundColor: theme.border }]}
                              >
                                <Ionicons name="remove" size={16} color={theme.text} />
                              </Pressable>
                              <ThemedText style={{ marginHorizontal: 12, fontWeight: 'bold' }}>{quantity}</ThemedText>
                              <Pressable
                                onPress={() => updateCartQuantity(item, 1)}
                                style={[styles.qtyBtn, { backgroundColor: theme.primary }]}
                              >
                                <Ionicons name="add" size={16} color="#FFF" />
                              </Pressable>
                            </>
                          ) : (
                            <Pressable
                              onPress={() => updateCartQuantity(item, 1)}
                              style={[styles.addBtn, { borderColor: theme.primary }]}
                            >
                              <ThemedText style={{ color: theme.primary, fontWeight: '700', fontSize: 13 }}>
                                ADD
                              </ThemedText>
                            </Pressable>
                          )}
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                    <Ionicons name="fast-food-outline" size={40} color={theme.textSecondary} />
                    <ThemedText style={{ color: theme.textSecondary, marginTop: 10 }}>
                      No menu items listed yet.
                    </ThemedText>
                  </View>
                )}
              </ScrollView>
            )}

            {/* Cart checkout footer */}
            {Object.keys(cart).length > 0 && (
              <View style={[styles.cartSummary, { borderTopColor: theme.border }]}>
                <View>
                  <ThemedText style={{ color: theme.textSecondary, fontSize: 12 }}>Total Price</ThemedText>
                  <ThemedText style={{ fontSize: 20, fontWeight: '800', color: theme.text }}>
                    ₹{getCartTotal()}
                  </ThemedText>
                </View>
                <Pressable
                  onPress={handlePlaceOrder}
                  style={[styles.placeOrderBtn, { backgroundColor: theme.primary }]}
                  disabled={loading}
                >
                  <ThemedText style={{ color: '#FFF', fontWeight: 'bold', fontSize: 15 }}>
                    {loading ? 'Placing Order...' : 'Place Order'}
                  </ThemedText>
                  <Ionicons name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 8 }} />
                </Pressable>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
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
    marginBottom: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF7A00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    height: 50,
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
  sectionTitle: {
    fontSize: 20,
    marginBottom: 0,
  },
  categoryScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  categoryItem: {
    width: 80,
    height: 90,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  promoBanner: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
    overflow: 'hidden',
  },
  promoImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginLeft: 16,
  },
  vendorCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  vendorImage: {
    width: '100%',
    height: 180,
  },
  vendorInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFB80020',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  vendorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalOptionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  modalOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  modalOptionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalOptionActive: {},
  modalOptionActiveText: {
    color: '#FFFFFF',
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 10,
  },
  modalBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalApplyBtn: {},
  modalApplyBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  // Menu Modal Styles
  menuModalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 34,
    minHeight: 300,
  },
  closeBtn: {
    padding: 4,
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  menuItemImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cartSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 16,
    marginTop: 16,
  },
  placeOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    height: 50,
    borderRadius: 12,
  },
});
