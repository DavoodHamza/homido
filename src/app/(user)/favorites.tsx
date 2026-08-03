import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Image, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { api } from '@/services/api';

export default function FavoritesScreen() {
  const theme = useTheme();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const data = await api.menu.getFavorites();
      setFavorites(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (id: string) => {
    try {
      // Optimistic update
      setFavorites(prev => prev.filter(f => f.id !== id));
      await api.menu.toggleFavorite(id);
    } catch (e) {
      // Revert if failed
      fetchFavorites();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>My Favorites</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="heart-dislike-outline" size={60} color={theme.textSecondary} />
          <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
            You haven't liked any items yet.
          </ThemedText>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {favorites.map((item) => (
            <View key={item.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Image source={{ uri: item.image || 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=500&q=80' }} style={styles.image} />
              <View style={styles.info}>
                <ThemedText style={styles.title} numberOfLines={2}>{item.name}</ThemedText>
                <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
                  {item.vendor?.name}
                </ThemedText>
                <ThemedText style={[styles.price, { color: theme.text }]}>₹{item.price}</ThemedText>
              </View>
              <Pressable style={styles.heartBtn} onPress={() => toggleFavorite(item.id)}>
                <Ionicons name="heart" size={24} color="#ff3b30" />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { marginTop: 16, fontSize: 16, textAlign: 'center' },
  scrollContent: { padding: 16, gap: 16 },
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    paddingRight: 16,
  },
  image: { width: 100, height: 100 },
  info: { flex: 1, padding: 12 },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 13, marginBottom: 8 },
  price: { fontSize: 16, fontWeight: '800' },
  heartBtn: { padding: 8 },
});
