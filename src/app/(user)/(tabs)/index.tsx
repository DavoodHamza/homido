import { View, StyleSheet, ScrollView, TextInput, Image, Pressable, FlatList } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const CATEGORIES = [
  { id: '1', name: 'Cakes', icon: '🎂' },
  { id: '2', name: 'Food', icon: '🍲' },
  { id: '3', name: 'Crafts', icon: '🎨' },
  { id: '4', name: 'Clothing', icon: '👕' },
  { id: '5', name: 'Pickles', icon: '🥒' },
  { id: '6', name: 'Snacks', icon: '🥨' },
];

const FEATURED_VENDORS = [
  { id: '1', name: "Auntie's Best Bakes", rating: 4.8, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80', time: '15-20 mins' },
  { id: '2', name: "Spicy Treats", rating: 4.5, image: 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=500&q=80', time: '30-40 mins' },
];

export default function Home() {
  const theme = useTheme();

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
            <Pressable style={styles.iconButton}>
              <Ionicons name="moon" size={24} color={theme.text} />
            </Pressable>
            <Pressable style={styles.profileButton}>
              <ThemedText style={{ color: '#FFF', fontWeight: 'bold' }}>DK</ThemedText>
            </Pressable>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="search" size={20} color={theme.textSecondary} style={{ marginRight: 8 }} />
            <TextInput 
              placeholder="Search for food, chefs..."
              placeholderTextColor={theme.textSecondary}
              style={[styles.searchInput, { color: theme.text }]}
            />
          </View>
          <Pressable style={[styles.filterButton, { backgroundColor: theme.primary }]}>
            <Ionicons name="options" size={20} color="#FFF" />
          </Pressable>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Quick Categories</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {CATEGORIES.map((cat, index) => (
              <View key={cat.id} style={[styles.categoryItem, index === 0 ? { borderColor: theme.primary, borderWidth: 2 } : { borderColor: theme.border, borderWidth: 1, backgroundColor: theme.card }]}>
                <ThemedText style={{ fontSize: 24, marginBottom: 4 }}>{cat.icon}</ThemedText>
                <ThemedText style={{ fontSize: 12, color: index === 0 ? theme.primary : theme.text, fontWeight: index === 0 ? '600' : '400' }}>
                  {cat.name}
                </ThemedText>
              </View>
            ))}
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

        {/* Popular Near You */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Popular Near You</ThemedText>
            <ThemedText style={{ color: theme.primary, fontWeight: '600' }}>View All {'>'}</ThemedText>
          </View>
          {FEATURED_VENDORS.map(vendor => (
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
          ))}
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
  iconButton: {
    padding: 8,
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
    marginBottom: 16,
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
});
