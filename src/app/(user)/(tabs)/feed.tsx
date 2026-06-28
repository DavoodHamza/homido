import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Image, Pressable, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 40) / 2;

const FEED_CATEGORIES = [
  { id: 'All', name: 'All Dishes' },
  { id: 'Cakes', name: 'Cakes' },
  { id: 'Food', name: 'Meals' },
];

const FEED_ITEMS = [
  {
    id: '1',
    vendorName: "Sarah's Sweets",
    vendorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    location: 'Bandra, Mumbai',
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80',
    title: 'Double Chocolate Fudge Cake',
    description: 'Baked using premium Belgian chocolate.',
    price: '₹850',
    rating: 4.9,
    category: 'Cakes',
  },
  {
    id: '2',
    vendorName: 'Gourmet Grill',
    vendorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
    location: 'Hitech City, Hyd',
    image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&q=80',
    title: 'Special Tandoori Skewers',
    description: 'Marinated overnight in spices.',
    price: '₹280',
    rating: 4.7,
    category: 'Food',
  },
  {
    id: '3',
    vendorName: "Auntie's Bakes",
    vendorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&q=80',
    location: 'Jubilee Hills, Hyd',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80',
    title: 'Red Velvet Cupcakes',
    description: 'Fluffy cupcakes with cream cheese icing.',
    price: '₹480',
    rating: 4.8,
    category: 'Cakes',
  },
  {
    id: '4',
    vendorName: 'Spicy Treats',
    vendorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    location: 'Gachibowli, Hyd',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
    title: 'Hyderabadi Chicken Biryani',
    description: 'Rich basmati rice cooked with chicken.',
    price: '₹350',
    rating: 4.6,
    category: 'Food',
  },
];

export default function Feed() {
  const theme = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]
    );
  };

  const filteredItems = FEED_ITEMS.filter(item => 
    selectedCategory === 'All' || item.category === selectedCategory
  );

  const renderFeedItem = ({ item }: { item: typeof FEED_ITEMS[0] }) => {
    const isFav = favorites.includes(item.id);
    return (
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        {/* Card Image with overlay elements */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.cardImage} />
          
          {/* Category Tag */}
          <View style={[styles.tag, { backgroundColor: theme.primary }]}>
            <ThemedText style={styles.tagText}>{item.category}</ThemedText>
          </View>

          {/* Favorite Button */}
          <Pressable 
            onPress={() => toggleFavorite(item.id)}
            style={[styles.favBtn, { backgroundColor: theme.card + 'D0' }]}
          >
            <Ionicons 
              name={isFav ? "heart" : "heart-outline"} 
              size={18} 
              color={isFav ? theme.error : theme.text} 
            />
          </Pressable>

          {/* Rating Overlay */}
          <View style={[styles.ratingOverlay, { backgroundColor: theme.card + 'D0' }]}>
            <Ionicons name="star" size={12} color={theme.accent} />
            <ThemedText style={styles.ratingText}>{item.rating}</ThemedText>
          </View>
        </View>

        {/* Content Area */}
        <View style={styles.infoArea}>
          <ThemedText style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </ThemedText>
          
          <ThemedText style={[styles.cardDesc, { color: theme.textSecondary }]} numberOfLines={2}>
            {item.description}
          </ThemedText>

          {/* Vendor Row */}
          <View style={styles.vendorRow}>
            <Image source={{ uri: item.vendorAvatar }} style={styles.vendorAvatar} />
            <View style={{ flex: 1, marginLeft: 6 }}>
              <ThemedText style={styles.vendorName} numberOfLines={1}>
                {item.vendorName}
              </ThemedText>
            </View>
          </View>

          {/* Price and Add button */}
          <View style={styles.actionRow}>
            <ThemedText style={[styles.priceText, { color: theme.primary }]}>
              {item.price}
            </ThemedText>
            <Pressable style={[styles.addBtn, { backgroundColor: theme.primary }]}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.headerBar}>
        <View>
          <ThemedText style={styles.headerTitle}>Homemade Feed</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Hot & fresh from local kitchens
          </ThemedText>
        </View>
      </View>

      {/* Product Filter Chips */}
      <View style={styles.filterChipsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          {FEED_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                style={[
                  styles.chip,
                  isSelected 
                    ? { backgroundColor: theme.primary, borderColor: theme.primary } 
                    : { backgroundColor: theme.card, borderColor: theme.border }
                ]}
              >
                <ThemedText 
                  style={[
                    styles.chipText, 
                    { color: isSelected ? '#FFFFFF' : theme.text }
                  ]}
                >
                  {cat.name}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        renderItem={renderFeedItem}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
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
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  filterChipsContainer: {
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  chipsScroll: {
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 14,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: COLUMN_WIDTH,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  imageContainer: {
    width: '100%',
    height: COLUMN_WIDTH * 1.1,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  tag: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  favBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
  },
  infoArea: {
    padding: 12,
  },
  cardTitle: {
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  vendorAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  vendorName: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontWeight: '800',
    fontSize: 16,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
