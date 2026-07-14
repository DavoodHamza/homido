import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, Pressable, TextInput, Modal, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/services/api';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useLocalSearchParams, router } from 'expo-router';

export default function ChatScreen() {
  const theme = useTheme();
  const { user } = useAuthStore();
  
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const params = useLocalSearchParams();
  const openVendorId = params.vendorId as string | undefined;
  const openVendorName = params.vendorName as string | undefined;

  // Active Chat Modal
  const [selectedPartner, setSelectedPartner] = useState<any | null>(null);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [openedFromExternal, setOpenedFromExternal] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  
  const messageScrollRef = useRef<ScrollView>(null);

  const fetchConversations = async () => {
    try {
      const res = await api.chat.getConversations();
      setConversations(res);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchConversations();
    }, 0);
    
    // Set up auto-poll for recent messages every 5 seconds when chat list is open
    const interval = setInterval(fetchConversations, 5000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (openVendorId && openVendorName) {
      router.setParams({ vendorId: '', vendorName: '' });
      setOpenedFromExternal(true);
      openConversation({
        id: openVendorId,
        name: openVendorName
      });
    }
  }, [openVendorId, openVendorName]);

  const openConversation = async (partner: any) => {
    setSelectedPartner(partner);
    setChatModalVisible(true);
    setMessages([]);
    setNewMessage('');
    setMessagesLoading(true);
    
    try {
      const msgs = await api.chat.getConversation(partner.id);
      setMessages(msgs);
      setTimeout(() => messageScrollRef.current?.scrollToEnd({ animated: false }), 100);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setMessagesLoading(false);
    }
  };

  // Poll conversation history when details modal is open
  useEffect(() => {
    if (!chatModalVisible || !selectedPartner) return;
    
    const pollMessages = async () => {
      try {
        const msgs = await api.chat.getConversation(selectedPartner.id);
        setMessages(msgs);
      } catch (err) {
        console.error(err);
      }
    };

    const msgInterval = setInterval(pollMessages, 3000);
    return () => clearInterval(msgInterval);
  }, [chatModalVisible, selectedPartner]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedPartner) return;
    
    const textToSend = newMessage.trim();
    setNewMessage('');

    try {
      const sentMsg = await api.chat.sendMessage(selectedPartner.id, textToSend);
      setMessages(prev => [...prev, sentMsg]);
      setTimeout(() => messageScrollRef.current?.scrollToEnd({ animated: true }), 100);
      fetchConversations();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const getFilteredConversations = () => {
    return conversations.filter(c => 
      c.otherUser?.name.toLowerCase().includes(search.toLowerCase())
    );
  };

  const renderConversation = ({ item }: { item: any }) => {
    const timeFormatted = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isVendor = item.otherUser?.role === 'vendor';

    return (
      <Pressable 
        onPress={() => openConversation(item.otherUser)}
        style={[styles.conversationCard, { borderBottomColor: theme.border }]}
      >
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: isVendor ? theme.primary + '15' : theme.textSecondary + '15' }]}>
            <ThemedText style={[styles.avatarText, { color: isVendor ? theme.primary : theme.text }]}>
              {item.otherUser?.name.charAt(0).toUpperCase()}
            </ThemedText>
          </View>
        </View>
        <View style={styles.messageContent}>
          <View style={styles.messageTop}>
            <ThemedText style={styles.senderName}>{item.otherUser?.name}</ThemedText>
            <ThemedText style={[styles.timeText, { color: theme.textSecondary }]}>{timeFormatted}</ThemedText>
          </View>
          <View style={styles.messageBottom}>
            <ThemedText
              numberOfLines={1}
              style={[styles.lastMessage, { color: theme.textSecondary }]}
            >
              {item.lastMessage}
            </ThemedText>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.headerBar}>
        <ThemedText style={styles.headerTitle}>Messages</ThemedText>
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

      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={getFilteredConversations()}
          keyExtractor={item => item.otherUser?.id}
          renderItem={renderConversation}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={fetchConversations}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-ellipses-outline" size={48} color={theme.textSecondary} />
              <ThemedText style={{ color: theme.textSecondary, marginTop: 12 }}>
                No active conversations yet.
              </ThemedText>
            </View>
          }
        />
      )}

      {/* Chat Details Modal */}
      <Modal
        animationType="slide"
        visible={chatModalVisible}
        onRequestClose={() => {
          setChatModalVisible(false);
          if (openedFromExternal) {
            setOpenedFromExternal(false);
            if (router.canGoBack()) router.back();
          }
        }}
      >
        <SafeAreaView style={[styles.modalWrapper, { backgroundColor: theme.background }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Pressable onPress={() => {
                setChatModalVisible(false);
                if (openedFromExternal) {
                  setOpenedFromExternal(false);
                  if (router.canGoBack()) router.back();
                }
              }} style={styles.backBtn}>
                <Ionicons name="chevron-back" size={24} color={theme.primary} />
              </Pressable>
              <ThemedText style={styles.modalHeaderTitle}>{selectedPartner?.name}</ThemedText>
              <View style={{ width: 40 }} />
            </View>

            {/* Chat Body */}
            {messagesLoading ? (
              <ActivityIndicator size="large" color={theme.primary} style={{ flex: 1 }} />
            ) : (
              <ScrollView
                ref={messageScrollRef}
                contentContainerStyle={styles.messagesContainer}
                onContentSizeChange={() => messageScrollRef.current?.scrollToEnd({ animated: true })}
              >
                {messages.map((msg) => {
                  const isOwn = msg.senderId === user?.id;
                  return (
                    <View
                      key={msg.id}
                      style={[
                        styles.msgRow,
                        isOwn ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }
                      ]}
                    >
                      <View
                        style={[
                          styles.msgBubble,
                          isOwn 
                            ? { backgroundColor: theme.primary, borderBottomRightRadius: 2 } 
                            : { backgroundColor: theme.card, borderBottomLeftRadius: 2, borderColor: theme.border, borderWidth: 0.5 }
                        ]}
                      >
                        <ThemedText style={[styles.msgText, isOwn ? { color: '#FFF' } : { color: theme.text }]}>
                          {msg.message}
                        </ThemedText>
                        <ThemedText style={[styles.msgTime, isOwn ? { color: '#FFF8' } : { color: theme.textSecondary }]}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </ThemedText>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            )}

            {/* Input Footer */}
            <View style={[styles.inputFooter, { borderTopColor: theme.border, backgroundColor: theme.card }]}>
              <TextInput
                placeholder="Type a message..."
                placeholderTextColor={theme.textSecondary}
                style={[styles.inputField, { color: theme.text, borderColor: theme.border }]}
                value={newMessage}
                onChangeText={setNewMessage}
                multiline
              />
              <Pressable
                onPress={handleSendMessage}
                disabled={!newMessage.trim()}
                style={[styles.sendBtn, { backgroundColor: newMessage.trim() ? theme.primary : theme.border }]}
              >
                <Ionicons name="send" size={16} color="#FFF" />
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: 'bold',
    fontSize: 20,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 120,
  },
  // Modal Styles
  modalWrapper: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  backBtn: {
    padding: 6,
  },
  modalHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  msgBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  msgText: {
    fontSize: 15,
    lineHeight: 20,
  },
  msgTime: {
    fontSize: 10,
    textAlign: 'right',
    marginTop: 4,
  },
  inputFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 0.5,
  },
  inputField: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    fontSize: 15,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
