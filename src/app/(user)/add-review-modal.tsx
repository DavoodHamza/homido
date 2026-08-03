import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput, ActivityIndicator, Alert, Image } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { api } from '@/services/api';

export default function AddReviewModal() {
  const theme = useTheme();
  const params = useLocalSearchParams();
  const items = params.items ? JSON.parse(params.items as string) : [];

  const [selectedItem, setSelectedItem] = useState<any>(items.length > 0 ? items[0] : null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedItem) {
      Alert.alert('Error', 'Please select an item to review.');
      return;
    }
    
    setLoading(true);
    try {
      await api.menu.addReview(selectedItem.menuItemId || selectedItem.id, rating, comment);
      Alert.alert('Success', 'Thank you for your review!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not submit review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <ThemedText style={styles.headerTitle}>Leave a Review</ThemedText>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={theme.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {items.length > 1 && (
          <View style={styles.section}>
            <ThemedText style={styles.label}>Select Item to Review</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {items.map((item: any, idx: number) => (
                <Pressable
                  key={idx}
                  onPress={() => setSelectedItem(item)}
                  style={[
                    styles.itemPill,
                    { borderColor: selectedItem?.menuItemId === item.menuItemId ? theme.primary : theme.border },
                    selectedItem?.menuItemId === item.menuItemId && { backgroundColor: theme.primary + '15' }
                  ]}
                >
                  <ThemedText style={{ color: selectedItem?.menuItemId === item.menuItemId ? theme.primary : theme.text }}>
                    {item.name}
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {selectedItem && (
          <View style={styles.section}>
            <ThemedText style={styles.label}>Rate {selectedItem.name}</ThemedText>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(star => (
                <Pressable key={star} onPress={() => setRating(star)} style={styles.starBtn}>
                  <Ionicons name={star <= rating ? "star" : "star-outline"} size={40} color={star <= rating ? "#FFD700" : theme.border} />
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <ThemedText style={styles.label}>Comment (Optional)</ThemedText>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.card }]}
            placeholder="Write your review here..."
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={comment}
            onChangeText={setComment}
          />
        </View>

        <Pressable 
          style={[styles.submitBtn, { backgroundColor: theme.primary }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#FFF" /> : <ThemedText style={styles.submitText}>Submit Review</ThemedText>}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  closeBtn: { padding: 4 },
  content: { padding: 20 },
  section: { marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  itemPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 10,
  },
  starBtn: { padding: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
  },
  submitBtn: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  submitText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
