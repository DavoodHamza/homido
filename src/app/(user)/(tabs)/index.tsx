import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, TextInput, View, ActivityIndicator, Alert, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import RazorpayCheckout from 'react-native-razorpay';

// react-native-maps doesn't support web — conditionally import for native only
let MapView: any;
let Marker: any;
let Callout: any;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Callout = Maps.Callout;
}

import { useThemeStore } from '@/hooks/useThemeStore';
import { useAuthStore } from '@/hooks/useAuthStore';
import { api } from '@/services/api';
import * as Location from 'expo-location';

// Dynamic categories will be fetched from the backend.
// We prepended 'All Food' to this list manually.

export default function Home() {
  const theme = useTheme();
  const { themeMode, toggleTheme } = useThemeStore();
  const { user, isLoggedIn } = useAuthStore();

  // State for filtering and sorting
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<{id: string, name: string, icon: string}[]>([
    { id: 'all', name: 'All Food', icon: '🍽️' }
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'time'>('rating');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [locationFilter, setLocationFilter] = useState('');
  const [currentAddress, setCurrentAddress] = useState('Fetching location...');
  const [userCoords, setUserCoords] = useState({ latitude: 17.448292, longitude: 78.374112 });
  const [mapVisible, setMapVisible] = useState(false);

  // Temporary states for Modal to apply on press
  const [tempSortBy, setTempSortBy] = useState<'rating' | 'time'>('rating');
  const [tempMinRating, setTempMinRating] = useState<number>(0);
  const [tempLocationFilter, setTempLocationFilter] = useState('');

  const requestAndFetchLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setCurrentAddress('Signature Towers, Hitech City');
        setLocationFilter('Hitech City');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUserCoords({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      const geocoded = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (geocoded.length > 0) {
        const item = geocoded[0];
        const readable = [item.district, item.city, item.subregion].filter(Boolean).join(', ');
        setCurrentAddress(readable || 'Signature Towers, Hitech City');

        // Use city or subregion/district as query filter keyword
        const queryKeyword = item.district || item.city || item.subregion || '';
        setLocationFilter(queryKeyword);
      } else {
        setCurrentAddress('Signature Towers, Hitech City');
        setLocationFilter('Hitech City');
      }
    } catch (err) {
      console.error('Error getting location:', err);
      setCurrentAddress('Signature Towers, Hitech City');
      setLocationFilter('Hitech City');
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    requestAndFetchLocation();
  }, []);

  // Dynamic lists from backend
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Selected Vendor Menu Modal
  const [selectedVendor, setSelectedVendor] = useState<any | null>(null);
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [cart, setCart] = useState<{ [itemId: string]: { item: any; quantity: number } }>({});

  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchCategories = async () => {
        try {
          const backendCats = await api.categories.getAll();
          const mappedCats = backendCats.map((c: any) => ({
            id: c.name.toLowerCase(),
            name: c.name,
            icon: c.icon || '🍽️'
          }));
          setCategories([{ id: 'all', name: 'All Food', icon: '🍽️' }, ...mappedCats]);
        } catch (err) {
          console.error('Failed to load categories:', err);
        }
      };

      const fetchVendors = async () => {
        setLoading(true);
        try {
          const res = await api.menu.getAll({
            category: selectedCategory,
            search: searchQuery,
            userLat: userCoords.latitude,
            userLng: userCoords.longitude,
          });
          setProducts(res);
        } catch (err: any) {
          console.error('Failed to fetch vendors:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchCategories();
      fetchVendors();
    }, 500);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery, minRating, sortBy, locationFilter, userCoords]);


  const [productModalVisible, setProductModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const openProductModal = (product: any) => {
    setSelectedProduct(product);
    setProductModalVisible(true);
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

    if (!user?.addressLocation || !user?.addressPhone) {
      setMenuModalVisible(false);
      Alert.alert(
        'Address Required',
        'Please add your delivery address and contact number before placing an order.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Address', onPress: () => router.push('/(user)/address-modal' as any) },
        ]
      );
      return;
    }

    setLoading(true);
    try {
      const itemsPayload = cartItems.map((c) => ({
        menuItemId: c.item.id,
        quantity: c.quantity,
      }));
      const orderRes = await api.orders.create(selectedVendor.id, itemsPayload);
      
      const options = {
        description: 'Homido Order Payment',
        image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=200&q=80',
        currency: 'INR',
        key: 'rzp_test_TJcEIObFUIvYfC',
        amount: Math.round(getCartTotal() * 100),
        name: 'Homido',
        order_id: orderRes.razorpayOrderId,
        theme: { color: theme.primary }
      };

      try {
        const paymentData = await RazorpayCheckout.open(options);
        // Verify payment
        await api.orders.verifyPayment(orderRes.id, paymentData);
        setMenuModalVisible(false);
        setCart({});
        Alert.alert('Success', 'Your order has been placed successfully!', [
          { text: 'OK', onPress: () => router.replace('/(user)/(tabs)/orders') },
        ]);
      } catch (error: any) {
        Alert.alert('Payment Failed', `Payment could not be completed. Order pending.`);
      }
    } catch (err: any) {
      Alert.alert('Checkout Failed', err.message || 'Could not place order.');
    } finally {
      setLoading(false);
    }
  };

  const openFilterModal = () => {
    setTempSortBy(sortBy);
    setTempMinRating(minRating);
    setTempLocationFilter(locationFilter);
    setFilterModalVisible(true);
  };

  const applyFilters = () => {
    setSortBy(tempSortBy);
    setMinRating(tempMinRating);
    setLocationFilter(tempLocationFilter);
    setFilterModalVisible(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header - Location */}
        <View style={[styles.header, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Pressable onPress={requestAndFetchLocation} style={[styles.locationContainer, { flex: 1, marginRight: 16 }]}>
            <Ionicons name="location" size={24} color={theme.text} />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <ThemedText style={[styles.locationTitle, { color: theme.text, fontWeight: '800' }]}>Current Location ↻</ThemedText>
              <ThemedText style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '500' }} numberOfLines={1}>
                {currentAddress}
              </ThemedText>
            </View>
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable onPress={toggleTheme} style={{ padding: 8, marginRight: 4 }}>
              <Ionicons name={themeMode === 'dark' ? 'sunny' : 'moon'} size={22} color={theme.text} />
            </Pressable>
            <Pressable 
            style={[styles.profileButton, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/(user)/(tabs)/profile')}
          >
            {user?.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={{ width: 36, height: 36, borderRadius: 18 }} />
            ) : (
              <ThemedText style={{ color: '#FFF', fontWeight: 'bold' }}>
                {user?.name ? user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'DK'}
              </ThemedText>
            )}
          </Pressable>
          </View>
        </View>
        {/* Categories */}
        <View style={{ marginTop: 16, marginBottom: 24 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
            {categories.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                style={[
                  styles.categoryPill,
                  { backgroundColor: selectedCategory === cat.id ? theme.primary : theme.card },
                ]}
              >
                <ThemedText style={{ fontSize: 16 }}>{cat.icon}</ThemedText>
                <ThemedText
                  style={[
                    styles.categoryPillText,
                    { color: selectedCategory === cat.id ? '#FFF' : theme.text },
                  ]}
                >
                  {cat.name}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Hero Featured Vendor */}
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 20 }} />
        ) : products.length > 0 && (() => {
          const hero = products[0];
          return (
            <View style={styles.heroSection}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>Most Sold Near You</ThemedText>
                <View style={{ backgroundColor: '#FFEDD5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                  <ThemedText style={{ color: '#EA580C', fontSize: 12, fontWeight: 'bold' }}>🔥 Trending</ThemedText>
                </View>
              </View>

              <Pressable onPress={() => hero.available !== false && openProductModal(hero)}>
                <View style={[styles.heroImageContainer, hero.available === false && { opacity: 0.7 }]}>
                  <Image
                    source={require('../../../../assets/images/featured_food.png')}
                    style={styles.heroImage}
                  />
                  <View style={styles.heroOverlay}>
                    <ThemedText style={styles.heroTitle}>{hero.name}</ThemedText>
                    <View style={styles.heroMeta}>
                      <ThemedText style={styles.heroSubtitle}>₹{hero.price} • {hero.vendor?.name || 'Local Kitchen'}</ThemedText>
                    </View>
                    {hero.available === false && (
                      <View style={{ marginTop: 8, alignItems: 'flex-start' }}>
                        <ThemedText style={{ color: '#ff3b30', fontSize: 13, fontWeight: 'bold', backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, overflow: 'hidden' }}>Not available today</ThemedText>
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            </View>
          );
        })()}

        {/* Search & Action Pills */}
        <View style={styles.modernActionRow}>
          <Pressable onPress={openFilterModal} style={[styles.modernPill, { backgroundColor: theme.card }]}>
            <Ionicons name="options-outline" size={16} color={theme.text} />
            <ThemedText style={[styles.modernPillText, { color: theme.text }]}>Filters</ThemedText>
          </Pressable>
          <Pressable onPress={() => setMapVisible(true)} style={[styles.modernPill, { backgroundColor: theme.card }]}>
            <Ionicons name="map-outline" size={16} color={theme.text} />
            <ThemedText style={[styles.modernPillText, { color: theme.text }]}>Map</ThemedText>
          </Pressable>
        </View>

        {/* Popular Dishes List */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Popular Dishes</ThemedText>

          {products.length > 0 ? (
            products.map((vendor) => (
              <Pressable
                key={vendor.id}
                onPress={() => vendor.available !== false && openProductModal(vendor)}
                style={{ opacity: vendor.available === false ? 0.6 : 1 }}
              >
                <View style={[styles.modernProductCard, { backgroundColor: theme.card }]}>
                  <Image source={{ uri: vendor.image || 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=500&q=80' }} style={styles.modernProductImage} />

                  <View style={styles.modernProductInfo}>
                    <View>
                      <ThemedText style={[styles.modernProductTitle, { color: theme.text }]} numberOfLines={2}>{vendor.name}</ThemedText>
                      {vendor.vendor && (
                        <ThemedText style={{ color: theme.textSecondary, fontSize: 12, marginTop: 4, fontWeight: '600' }}>
                          from {vendor.vendor.name}
                        </ThemedText>
                      )}
                    </View>

                    <View style={styles.modernProductBottom}>
                      <ThemedText style={{ fontSize: 18, fontWeight: '800', color: theme.text }}>
                        ₹{vendor.price}
                      </ThemedText>

                      {vendor.available === false ? (
                        <ThemedText style={{ color: '#ff3b30', fontSize: 12, fontWeight: 'bold' }}>Not available today</ThemedText>
                      ) : (
                        <Pressable
                          onPress={() => openProductModal(vendor)}
                          style={[styles.modernAddButton, { backgroundColor: theme.primary + '20' }]}
                        >
                          <ThemedText style={{ color: theme.primary, fontWeight: '800', fontSize: 13 }}>ADD</ThemedText>
                          <Ionicons name="add" size={16} color={theme.primary} />
                        </Pressable>
                      )}
                    </View>
                  </View>
                </View>
              </Pressable>
            ))
          ) : (
            null
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

            {/* Location Section */}
            <View style={styles.modalSection}>
              <ThemedText style={styles.modalSectionTitle}>Filter by Location</ThemedText>
              <TextInput
                style={[
                  styles.locationInput,
                  { borderColor: theme.border, color: theme.text, backgroundColor: theme.background },
                ]}
                placeholder="Enter city or area (e.g. Hitech City)"
                placeholderTextColor={theme.textSecondary}
                value={tempLocationFilter}
                onChangeText={setTempLocationFilter}
              />
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

      {/* Map View Modal */}
      <Modal
        animationType="slide"
        visible={mapVisible}
        onRequestClose={() => setMapVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
          <View style={[styles.mapHeader, { borderBottomColor: theme.border }]}>
            <Pressable onPress={() => setMapVisible(false)} style={styles.mapBackBtn}>
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            </Pressable>
            <ThemedText style={styles.mapTitle}>Kitchens Nearby</ThemedText>
            <View style={{ width: 40 }} />
          </View>

          <MapView
            style={styles.map}
            initialRegion={{
              latitude: userCoords.latitude,
              longitude: userCoords.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            showsUserLocation
          >
            {products.map((vendor) => {
              const vLat = Number(vendor.latitude);
              const vLng = Number(vendor.longitude);
              if (isNaN(vLat) || isNaN(vLng)) return null;

              return (
                <Marker
                  key={vendor.id}
                  coordinate={{ latitude: vLat, longitude: vLng }}
                  title={vendor.name}
                  description={`${vendor.category} • ⭐️ ${vendor.rating}`}
                >
                  <Callout
                    onPress={() => {
                      setMapVisible(false);
                      openProductModal(vendor);
                    }}
                  >
                    <View style={styles.calloutContainer}>
                      <ThemedText style={styles.calloutTitle}>{vendor.name}</ThemedText>
                      <ThemedText style={styles.calloutSub}>{vendor.category.toUpperCase()}</ThemedText>
                      <ThemedText style={styles.calloutRating}>⭐️ {vendor.rating} • {vendor.timeVal} mins</ThemedText>
                      {vendor.available === false ? (
                        <ThemedText style={[styles.calloutAction, { color: '#ff3b30' }]}>Not available today</ThemedText>
                      ) : (
                        <ThemedText style={styles.calloutAction}>Tap to view menu</ThemedText>
                      )}
                    </View>
                  </Callout>
                </Marker>
              );
            })}
          </MapView>

          {/* Floating Cart Button */}
          {Object.values(cart).length > 0 && (
            <Pressable
              style={[styles.floatingCartBtn, { backgroundColor: theme.primary }]}
              onPress={() => setMenuModalVisible(true)}
            >
              <Ionicons name="cart" size={24} color="#FFF" />
              <View style={styles.cartBadge}>
                <ThemedText style={{ color: theme.primary, fontSize: 12, fontWeight: 'bold' }}>
                  {Object.values(cart).reduce((sum, c) => sum + c.quantity, 0)}
                </ThemedText>
              </View>
            </Pressable>
          )}

        </SafeAreaView>
      </Modal>


      {/* Product Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={productModalVisible}
        onRequestClose={() => setProductModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setProductModalVisible(false)}>
          <Pressable style={[styles.menuModalContainer, { backgroundColor: theme.card, padding: 24 }]} onPress={(e) => e.stopPropagation()}>
            {selectedProduct && (
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1, marginRight: 16 }}>
                    <ThemedText style={{ fontSize: 22, fontWeight: 'bold' }}>{selectedProduct.name}</ThemedText>
                    <ThemedText style={{ color: theme.textSecondary, marginTop: 4 }}>
                      From {selectedProduct.vendor?.name || 'Local Kitchen'}
                    </ThemedText>
                  </View>
                  <Pressable onPress={() => setProductModalVisible(false)}>
                    <Ionicons name="close" size={24} color={theme.text} />
                  </Pressable>
                </View>

                {selectedProduct.image && (
                  <Image
                    source={{ uri: selectedProduct.image }}
                    style={{ width: '100%', height: 200, borderRadius: 16, marginTop: 16 }}
                  />
                )}

                <ThemedText style={{ marginTop: 16, fontSize: 15, lineHeight: 22, color: theme.textSecondary }}>
                  {selectedProduct.description || 'No description available for this item.'}
                </ThemedText>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
                  <ThemedText style={{ fontSize: 24, fontWeight: 'bold', color: theme.primary }}>
                    ₹{selectedProduct.price}
                  </ThemedText>
                  <Pressable
                    style={{ backgroundColor: theme.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
                    onPress={() => {
                      // Check vendor consistency
                      const currentVendorId = Object.values(cart)[0]?.item?.vendorId;
                      if (currentVendorId && currentVendorId !== selectedProduct.vendorId) {
                        Alert.alert(
                          'Different Kitchen',
                          'Your cart contains items from a different kitchen. Clear cart to add this item?',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Clear Cart',
                              style: 'destructive',
                              onPress: () => {
                                setCart({ [selectedProduct.id]: { item: selectedProduct, quantity: 1 } });
                                setProductModalVisible(false);
                                setMenuModalVisible(true); // Open cart drawer
                              }
                            }
                          ]
                        );
                      } else {
                        updateCartQuantity(selectedProduct, 1);
                        setProductModalVisible(false);
                        setMenuModalVisible(true); // Open cart drawer
                      }
                    }}
                  >
                    <ThemedText style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>Add to Cart</ThemedText>
                  </Pressable>
                </View>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Cart / Checkout Drawer Modal */}
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
                <ThemedText style={styles.modalTitle}>Your Cart</ThemedText>
                <ThemedText style={{ color: theme.textSecondary, fontSize: 13, marginTop: 4 }}>
                  Review your items
                </ThemedText>
              </View>
              <Pressable onPress={() => setMenuModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={theme.text} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              {Object.values(cart).length > 0 ? (
                Object.values(cart).map((c) => {
                  const item = c.item;
                  const quantity = c.quantity;
                  return (
                    <View key={item.id} style={[styles.menuItemRow, { borderBottomColor: theme.border }]}>
                      {item.image && <Image source={{ uri: item.image }} style={styles.menuItemImage} />}
                      <View style={{ flex: 1, marginLeft: item.image ? 12 : 0 }}>
                        <ThemedText style={{ fontWeight: '700', fontSize: 15 }}>{item.name}</ThemedText>
                        <ThemedText style={{ color: theme.primary, fontWeight: '700', marginTop: 4 }}>
                          ₹{item.price}
                        </ThemedText>
                      </View>

                      {/* Quantity Controls */}
                      <View style={styles.quantityControls}>
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
                      </View>
                    </View>
                  );
                })
              ) : (
                <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                  <Ionicons name="cart-outline" size={40} color={theme.textSecondary} />
                  <ThemedText style={{ color: theme.textSecondary, marginTop: 10 }}>
                    Your cart is empty.
                  </ThemedText>
                </View>
              )}
            </ScrollView>

            {Object.values(cart).length > 0 && (
              <View style={[styles.checkoutFooter, { borderTopColor: theme.border }]}>
                <View style={styles.checkoutTotalRow}>
                  <ThemedText style={{ fontSize: 16, fontWeight: 'bold' }}>Total:</ThemedText>
                  <ThemedText style={{ fontSize: 20, fontWeight: 'bold', color: theme.primary }}>
                    ₹{getCartTotal()}
                  </ThemedText>
                </View>
                <Pressable
                  style={[styles.checkoutBtn, { backgroundColor: theme.primary }]}
                  onPress={() => {
                    // Since cart items are checked to be from the same vendor, we can safely take the first item's vendorId
                    const vendorId = Object.values(cart)[0]?.item?.vendorId;
                    if (vendorId) {
                      // We need to temporarily set selectedVendor for handlePlaceOrder
                      setSelectedVendor({ id: vendorId });
                      setTimeout(handlePlaceOrder, 100);
                    }
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <ThemedText style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>Place Order</ThemedText>
                  )}
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

  floatingCartBtn: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FFF',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutFooter: {
    paddingTop: 16,
    marginTop: 16,
  },
  checkoutTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    height: 50,
    borderRadius: 12,
  },


  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
  },
  categoryPillText: {
    fontWeight: '700',
    fontSize: 14,
  },

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
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
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
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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
    width: 90,
    height: 110,
    borderRadius: 45, // Pill shape
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
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
    borderRadius: 36, // Large rounded corners like the image
    borderWidth: 0,
    overflow: 'hidden',
    marginBottom: 32,
    backgroundColor: '#FAF7F2',
  },
  vendorImage: {
    width: '100%',
    height: 280, // Taller image like the image
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
  locationInput: {
    height: 50,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '500',
  },
  mapToggleBtn: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  mapBackBtn: {
    padding: 8,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 112, // subtracting header heights
  },
  calloutContainer: {
    width: 160,
    padding: 4,
    alignItems: 'center',
  },
  calloutTitle: {
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
  },
  calloutSub: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  calloutRating: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  calloutAction: {
    fontSize: 10,
    color: '#FF7A00',
    fontWeight: '700',
    marginTop: 6,
    textDecorationLine: 'underline',
  },

  heroSection: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  heroImageContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    height: 280,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingTop: 80,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modernActionRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  modernPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 27,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  modernPillText: {
    fontSize: 15,
    fontWeight: '800',
  },
  modernProductCard: {
    flexDirection: 'row',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  modernProductImage: {
    width: 110,
    height: 110,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
  },
  modernProductInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  modernProductTitle: {
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 22,
  },
  modernProductBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  modernAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
});
