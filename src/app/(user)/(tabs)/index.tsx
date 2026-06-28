import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Image, Pressable, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const CATEGORIES = [
  { id: 'all', name: 'All Food', icon: '🍽️' },
  { id: 'cakes', name: 'Cakes', icon: '🎂' },
  { id: 'meals', name: 'Meals', icon: '🍲' },
  { id: 'pickles', name: 'Pickles', icon: '🥒' },
  { id: 'snacks', name: 'Snacks', icon: '🥨' },
  { id: 'desserts', name: 'Desserts', icon: '🍨' },
];

const FEATURED_VENDORS = [
  { id: '1', name: "Auntie's Best Bakes", rating: 4.8, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80', time: '15-20 mins', timeVal: 15, category: 'cakes' },
  { id: '2', name: "Spicy Treats", rating: 4.5, image: 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=500&q=80', time: '30-40 mins', timeVal: 30, category: 'meals' },
  { id: '3', name: "Sarah's Sweet Delights", rating: 4.9, image: 'https://images.unsplash.com/photo-1557925923-33b251d59265?w=500&q=80', time: '20-25 mins', timeVal: 20, category: 'desserts' },
  { id: '4', name: "Grandma's Pickles", rating: 4.7, image: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=500&q=80', time: '10-15 mins', timeVal: 10, category: 'pickles' },
];

export default function Home() {
  const theme = useTheme();
  
  // State for filtering and sorting
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'time'>('rating');

  // Filter & Sort Logic
  const filteredVendors = FEATURED_VENDORS.filter(vendor => {
    const matchesCategory = selectedCategory === 'all' || vendor.category === selectedCategory;
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'rating') {
      return b.rating - a.rating; // Highest rating first
    } else {
      return a.timeVal - b.timeVal; // Fastest delivery first
    }
  });

  const toggleSort = () => {
    const nextSort = sortBy === 'rating' ? 'time' : 'rating';
    setSortBy(nextSort);
    Alert.alert(
      "Sorting Changed",
      nextSort === 'rating' ? "Showing top-rated kitchens first." : "Showing fastest delivery kitchens first."
    );
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
              <ThemedText style={{ color: theme.textSecondary, fontSize: 12 }}>Signature Towers, Hitech City</ThemedText>
            </View>
          </View>
          <View style={styles.headerActions}>
            <View style={styles.profileButton}>
              <ThemedText style={{ color: '#FFF', fontWeight: 'bold' }}>DK</ThemedText>
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
          <Pressable 
            onPress={toggleSort}
            style={[styles.filterButton, { backgroundColor: theme.primary }]}
          >
            <Ionicons name={sortBy === 'rating' ? "star" : "time"} size={20} color="#FFF" />
          </Pressable>
        </View>

        {/* Categories (Food Items Only) */}
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
                      : { borderColor: theme.border, borderWidth: 1, backgroundColor: theme.card }
                  ]}
                >
                  <ThemedText style={{ fontSize: 24, marginBottom: 4 }}>{cat.icon}</ThemedText>
                  <ThemedText style={{ fontSize: 12, color: isSelected ? theme.primary : theme.text, fontWeight: isSelected ? '600' : '400' }}>
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
            <ThemedText style={{ color: theme.accent, fontWeight: 'bold', marginBottom: 4 }}>VENDOR OF THE MONTH</ThemedText>
            <ThemedText type="subtitle" style={{ fontSize: 20 }}>Sarah's Sweet Delights</ThemedText>
            <ThemedText style={{ fontSize: 12, color: theme.textSecondary, marginTop: 4 }}>Award winning custom cakes</ThemedText>
          </View>
          <Image source={{ uri: 'https://images.unsplash.com/photo-1557925923-33b251d59265?w=200&q=80' }} style={styles.promoImage} />
        </View>

        {/* Popular Near You (Filtered & Sorted List) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Popular Near You</ThemedText>
            <ThemedText style={{ color: theme.primary, fontWeight: '600' }}>
              Sort: {sortBy === 'rating' ? 'Rating' : 'Delivery Time'}
            </ThemedText>
          </View>
          
          {filteredVendors.length > 0 ? (
            filteredVendors.map(vendor => (
              <View key={vendor.id} style={[styles.vendorCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Image source={{ uri: vendor.image }} style={styles.vendorImage} />
                <View style={styles.vendorInfo}>
                  <ThemedText style={{ fontWeight: 'bold', fontSize: 18 }}>{vendor.name}</ThemedText>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={14} color={theme.accent} />
                    <ThemedText style={{ fontSize: 12, marginLeft: 4, fontWeight: '600' }}>{vendor.rating}</ThemedText>
                  </View>
                </View>
                <View style={styles.vendorMeta}>
                  <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
                  <ThemedText style={{ fontSize: 12, color: theme.textSecondary, marginLeft: 4 }}>{vendor.time}</ThemedText>
                </View>
              </View>
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
});
