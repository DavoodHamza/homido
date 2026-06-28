import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Image, Pressable, TextInput } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const CONVERSATIONS = [
  {
    id: '1',
    name: "Sarah's Sweet Delights",
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    lastMessage: 'Your cake will be ready by 4 PM! 🎂',
    time: '2m ago',
    unread: 2,
    online: true,
  },
  {
    id: '2',
    name: 'Gourmet Grill & Roasts',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
    lastMessage: 'Thank you for your order! We are preparing it now.',
    time: '15m ago',
    unread: 0,
    online: true,
  },
  {
    id: '3',
    name: "Auntie's Best Bakes",
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&q=80',
    lastMessage: 'We have a new special this week - vanilla bean macarons!',
    time: '1h ago',
    unread: 1,
    online: false,
  },
  {
    id: '4',
    name: 'Spicy Treats',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    lastMessage: 'How did you like the biryani? Please leave a review 😊',
    time: '3h ago',
    unread: 0,
    online: false,
  },
  {
    id: '5',
    name: 'Craft Corner by Priya',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
    lastMessage: 'Your handmade candle set has been shipped!',
    time: 'Yesterday',
    unread: 0,
    online: false,
  },
];

export default function ChatScreen() {
  const theme = useTheme();
  const [search, setSearch] = useState('');

  const renderConversation = ({ item }: { item: typeof CONVERSATIONS[0] }) => (
    <Pressable style={[styles.conversationCard, { borderBottomColor: theme.border }]}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.online && <View style={[styles.onlineDot, { borderColor: theme.background }]} />}
      </View>
      <View style={styles.messageContent}>
        <View style={styles.messageTop}>
          <ThemedText style={[styles.senderName, item.unread > 0 && { fontWeight: '800' }]}>{item.name}</ThemedText>
          <ThemedText style={[styles.timeText, { color: item.unread > 0 ? theme.primary : theme.textSecondary }]}>{item.time}</ThemedText>
        </View>
        <View style={styles.messageBottom}>
          <ThemedText
            numberOfLines={1}
            style={[styles.lastMessage, { color: item.unread > 0 ? theme.text : theme.textSecondary }]}
          >
            {item.lastMessage}
          </ThemedText>
          {item.unread > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: theme.primary }]}>
              <ThemedText style={styles.unreadText}>{item.unread}</ThemedText>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.headerBar}>
        <ThemedText style={styles.headerTitle}>Messages</ThemedText>
        <Pressable>
          <Ionicons name="create-outline" size={24} color={theme.primary} />
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="search" size={18} color={theme.textSecondary} />
          <TextInput
            placeholder="Search conversations..."
            placeholderTextColor={theme.textSecondary}
            style={[styles.searchInput, { color: theme.text }]}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={CONVERSATIONS}
        keyExtractor={item => item.id}
        renderItem={renderConversation}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#34C759',
    borderWidth: 2.5,
  },
  messageContent: {
    flex: 1,
    marginLeft: 14,
  },
  messageTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  senderName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  messageBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
