import { View, StyleSheet, FlatList, Image, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';

const { width } = Dimensions.get('window');

const FEED_POSTS = [
  {
    id: '1',
    vendorName: 'Sarah\'s Sweet Delights',
    vendorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    location: 'Bandra West, Mumbai',
    images: ['https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80'],
    title: 'Double Chocolate Fudge Cake',
    description: 'Freshly baked using premium Belgian chocolate. Perfect for birthdays or special occasions! 🍫✨',
    price: '₹850',
    likes: 245,
  },
  {
    id: '2',
    vendorName: 'Gourmet Grill & Roasts',
    vendorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
    location: 'Hitech City, Hyderabad',
    images: ['https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&q=80'],
    title: 'Special Tandoori Skewers',
    description: 'Marinated overnight in our secret spice blend and slow-roasted to perfection. Served with mint chutney.',
    price: '₹280',
    likes: 182,
  }
];

export default function Feed() {
  const theme = useTheme();

  const renderPost = ({ item }: { item: typeof FEED_POSTS[0] }) => (
    <View style={[styles.postContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.vendorInfo}>
          <Image source={{ uri: item.vendorAvatar }} style={styles.avatar} />
          <View>
            <ThemedText style={styles.vendorName}>{item.vendorName}</ThemedText>
            <ThemedText style={{ fontSize: 12, color: theme.textSecondary }}>{item.location}</ThemedText>
          </View>
        </View>
        <Pressable>
          <Ionicons name="ellipsis-horizontal" size={20} color={theme.textSecondary} />
        </Pressable>
      </View>

      {/* Post Image */}
      <Image source={{ uri: item.images[0] }} style={styles.postImage} />

      {/* Post Actions */}
      <View style={styles.postActions}>
        <View style={styles.actionGroup}>
          <Pressable style={styles.actionIcon}>
            <Ionicons name="heart-outline" size={26} color={theme.text} />
          </Pressable>
          <Pressable style={styles.actionIcon}>
            <Ionicons name="chatbubble-outline" size={24} color={theme.text} />
          </Pressable>
          <Pressable style={styles.actionIcon}>
            <Ionicons name="share-outline" size={26} color={theme.text} />
          </Pressable>
        </View>
        <Pressable>
          <Ionicons name="bookmark-outline" size={24} color={theme.text} />
        </Pressable>
      </View>

      {/* Post Content */}
      <View style={styles.postContent}>
        <ThemedText style={{ fontWeight: 'bold', marginBottom: 4 }}>{item.likes} likes</ThemedText>
        <View style={styles.titleRow}>
          <ThemedText style={styles.postTitle}>{item.title}</ThemedText>
          <ThemedText style={styles.postPrice}>{item.price}</ThemedText>
        </View>
        <ThemedText style={{ color: theme.textSecondary, lineHeight: 20 }}>
          <ThemedText style={{ fontWeight: 'bold' }}>{item.vendorName} </ThemedText>
          {item.description}
        </ThemedText>

        <Button title="Order Now" size="sm" style={styles.orderButton} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.headerBar}>
        <ThemedText style={styles.headerTitle}>Feed</ThemedText>
      </View>
      <FlatList
        data={FEED_POSTS}
        keyExtractor={item => item.id}
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 8 }}
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
  postContainer: {
    marginBottom: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  vendorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  vendorName: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  postImage: {
    width: width,
    height: width, // Square images
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    paddingBottom: 8,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionIcon: {
    // padding: 4,
  },
  postContent: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 4,
    marginBottom: 4,
  },
  postTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
  },
  postPrice: {
    fontWeight: 'bold',
    color: '#FF7A00',
    fontSize: 16,
    marginLeft: 12,
  },
  orderButton: {
    marginTop: 12,
  }
});
