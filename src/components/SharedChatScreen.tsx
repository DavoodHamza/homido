import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, Pressable, TextInput, Modal, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Animated } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/services/api';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';

export function SharedChatScreen({ role }: { role: 'user' | 'vendor' | 'admin' }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const params = useLocalSearchParams();
  const openVendorId = params.vendorId as string | undefined;
  const openVendorName = params.vendorName as string | undefined;
  const openOrderId = params.orderId as string | undefined;
  const openCustomerName = params.customerName as string | undefined;
  const openAdminChat = params.openAdminChat as string | undefined;
  const adminId = params.adminId as string | undefined;
  const adminName = params.adminName as string | undefined;

  // Active Chat Modal
  const [selectedPartner, setSelectedPartner] = useState<any | null>(null);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [openedFromExternal, setOpenedFromExternal] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  
  // Voice Mock State
  const [isRecording, setIsRecording] = useState(false);
  
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
    
    const interval = setInterval(fetchConversations, 5000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (openAdminChat === 'true' && adminId) {
      router.setParams({ openAdminChat: '', adminId: '', adminName: '' });
      setOpenedFromExternal(true);
      openConversation({
        id: adminId,
        name: adminName || 'Support Admin'
      });
    } else if (openOrderId) {
      router.setParams({ vendorId: '', vendorName: '', orderId: '', customerName: '' });
      setOpenedFromExternal(true);
      openConversation({
        isGroup: true,
        orderId: openOrderId,
        otherUser: {
          id: `order-${openOrderId}`,
          name: `Order #${openOrderId.substring(0,6)} - ${openCustomerName || openVendorName || 'Details'}`
        }
      }, true);
    } else if (openVendorId && openVendorName) {
      router.setParams({ vendorId: '', vendorName: '', orderId: '' });
      setOpenedFromExternal(true);
      openConversation({
        id: openVendorId,
        name: openVendorName
      });
    }
  }, [openVendorId, openVendorName, openOrderId, openCustomerName, openAdminChat, adminId, adminName]);

  const openConversation = async (partnerOrGroup: any, isGroupFlag?: boolean) => {
    const isGroup = isGroupFlag || partnerOrGroup.isGroup;
    const orderId = partnerOrGroup.orderId;
    const partner = partnerOrGroup.otherUser || partnerOrGroup;
    setSelectedPartner({ ...partner, isGroup, orderId });
    setChatModalVisible(true);
    setMessages([]);
    setNewMessage('');
    setMessagesLoading(true);
    
    try {
      const msgs = await api.chat.getConversation(partner.id, orderId);
      setMessages(msgs);
      setTimeout(() => messageScrollRef.current?.scrollToEnd({ animated: false }), 100);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    if (!chatModalVisible || !selectedPartner) return;
    
    const pollMessages = async () => {
      try {
        const msgs = await api.chat.getConversation(selectedPartner.id, selectedPartner.orderId);
        setMessages(msgs);
      } catch (err) {
        console.error(err);
      }
    };

    const msgInterval = setInterval(pollMessages, 3000);
    return () => clearInterval(msgInterval);
  }, [chatModalVisible, selectedPartner]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !isRecording) return;
    
    // If recording, we mock sending a voice note
    const textToSend = isRecording ? `[Voice] 0:12` : newMessage.trim();
    
    setNewMessage('');
    setIsRecording(false);

    // Optimistic update for snappier UI
    const optimisticMsg = {
      id: Date.now().toString(),
      senderId: user?.id,
      message: textToSend,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setTimeout(() => messageScrollRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const sentMsg = await api.chat.sendMessage(selectedPartner.id, textToSend, selectedPartner.orderId);
      // Replace optimistic message
      setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? sentMsg : m));
      fetchConversations();
    } catch (err) {
      console.error('Failed to send message:', err);
      // Remove optimistic message on fail
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
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
    const isGroup = item.isGroup;

    return (
      <Pressable 
        onPress={() => openConversation(item)}
        style={[styles.conversationCard, { borderBottomColor: theme.border }]}
      >
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: `https://ui-avatars.com/api/?name=${item.otherUser?.name || 'Support'}&background=random` }} 
            style={styles.avatar}
          />
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
              {item.lastMessage?.startsWith('[Voice]') ? '🎙 Voice Message' : item.lastMessage}
            </ThemedText>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <View style={styles.headerBar}>
        <ThemedText style={styles.headerTitle}>Messages</ThemedText>
        <Pressable 
          style={[styles.supportBtn, { backgroundColor: theme.primary + '20' }]} 
          onPress={async () => {
            const admin = await api.users.getPrimaryAdmin();
            if (admin && admin.id) {
              openConversation(admin);
            }
          }}
        >
          <Ionicons name="help-buoy-outline" size={16} color={theme.primary} />
          <ThemedText style={[styles.supportBtnText, { color: theme.primary }]}>Support</ThemedText>
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
              <Ionicons name="chatbubbles-outline" size={64} color={theme.border} />
              <ThemedText style={{ color: theme.textSecondary, marginTop: 12 }}>
                No messages yet.
              </ThemedText>
            </View>
          }
        />
      )}

      {/* Modern Chat Details Modal */}
      <Modal
        animationType="slide"
        visible={chatModalVisible}
        onRequestClose={() => {
          setChatModalVisible(false);
          if (openedFromExternal) {
            setOpenedFromExternal(false);
            if (role === 'vendor') {
              router.replace('/(vendor)/(tabs)/orders');
            } else if (role === 'admin') {
              router.replace('/(admin)/(tabs)');
            } else {
              router.replace('/(user)/(tabs)/orders');
            }
          }
        }}
      >
        {/* We use a slight yellow tint for the background behind the modal content */}
        <View style={[styles.modalWrapper, { backgroundColor: theme.background }]}>
          <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}>
            <View style={[styles.modalInner, { backgroundColor: theme.card }]}>
              
              {/* Premium Header */}
              <View style={styles.modernHeader}>
                <Pressable onPress={() => {
                  setChatModalVisible(false);
                  if (openedFromExternal) {
                    setOpenedFromExternal(false);
                    if (role === 'vendor') {
                      router.replace('/(vendor)/(tabs)/orders');
                    } else if (role === 'admin') {
                      router.replace('/(admin)/(tabs)');
                    } else {
                      router.replace('/(user)/(tabs)/orders');
                    }
                  }
                }} style={[styles.modernBackBtn, { borderColor: theme.border }]}>
                  <Ionicons name="chevron-back" size={20} color={theme.text} />
                </Pressable>
                
                <View style={[styles.headerProfile, { flex: 1, justifyContent: 'center', marginHorizontal: 10 }]}>
                  <Image 
                    source={{ uri: `https://ui-avatars.com/api/?name=${selectedPartner?.name}&background=random` }} 
                    style={styles.headerAvatar}
                  />
                  <View style={{ flex: 1 }}>
                    <ThemedText style={[styles.headerName, { color: theme.text }]} numberOfLines={1} ellipsizeMode="tail">{selectedPartner?.name}</ThemedText>
                    {selectedPartner?.orderId && (
                      <ThemedText style={{ fontSize: 11, color: theme.textSecondary }} numberOfLines={1}>Ord #{selectedPartner.orderId.substring(0,8).toUpperCase()}</ThemedText>
                    )}
                  </View>
                </View>
              </View>

              {/* Chat Body */}
              {messagesLoading ? (
                <ActivityIndicator size="large" color={theme.primary} style={{ flex: 1 }} />
              ) : (
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  style={{ flex: 1 }}
                >
                  <ScrollView
                    ref={messageScrollRef}
                    contentContainerStyle={styles.messagesContainer}
                    onContentSizeChange={() => messageScrollRef.current?.scrollToEnd({ animated: true })}
                    showsVerticalScrollIndicator={false}
                  >
                    {/* Date Separator Example */}
                    <View style={styles.dateSeparator}>
                      <ThemedText style={styles.dateSeparatorText}>Today</ThemedText>
                    </View>

                    {messages.map((msg, index) => {
                      const isOwn = msg.senderId === user?.id;
                      const isVoice = msg.message.startsWith('[Voice]');
                      
                      return (
                        <View key={msg.id} style={{ marginBottom: 16 }}>
                          <View
                            style={[
                              styles.msgRow,
                              isOwn ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }
                            ]}
                          >
                            <View
                              style={[
                                styles.msgBubble,
                                isOwn 
                                  ? { backgroundColor: theme.primary, borderTopRightRadius: 4 }
                                  : { backgroundColor: theme.border, borderTopLeftRadius: 4 }
                              ]}
                            >
                              {isVoice ? (
                                /* Voice Message UI */
                                <View style={styles.voiceContainer}>
                                  <Pressable style={[styles.playButton, { borderColor: isOwn ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.1)', backgroundColor: isOwn ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)' }]}>
                                    <Ionicons name="play" size={14} color={isOwn ? "#FFF" : theme.text} style={{ marginLeft: 2 }} />
                                  </Pressable>
                                  <View style={styles.waveformMock}>
                                    {[...Array(15)].map((_, i) => (
                                      <View key={i} style={[styles.waveBar, { height: Math.max(4, Math.random() * 20) }]} />
                                    ))}
                                  </View>
                                  <ThemedText style={[styles.voiceTime, { color: isOwn ? "#FFF" : theme.textSecondary }]}>0:12</ThemedText>
                                </View>
                              ) : (
                                /* Standard Text Message */
                                <ThemedText style={[styles.msgText, { color: isOwn ? '#FFF' : theme.text }]}>
                                  {msg.message}
                                </ThemedText>
                              )}
                            </View>
                          </View>
                          {/* Time below message */}
                          <ThemedText style={[styles.msgTime, isOwn ? { textAlign: 'right', marginRight: 4 } : { textAlign: 'left', marginLeft: 4 }]}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </ThemedText>
                        </View>
                      );
                    })}
                  </ScrollView>

                  {/* Modern Pill Input Footer */}
                  <View style={[styles.inputFooter, { backgroundColor: theme.card }]}>
                    <View style={[styles.pillContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                      {isRecording ? (
                        <View style={styles.recordingUi}>
                          <ThemedText style={styles.recordingTime}>0:12</ThemedText>
                          <View style={styles.waveformMock}>
                            {[...Array(20)].map((_, i) => (
                              <View key={i} style={[styles.waveBar, { height: Math.max(4, Math.random() * 20), backgroundColor: '#FF3B30' }]} />
                            ))}
                          </View>
                          <Pressable onPress={() => setIsRecording(false)} style={styles.cancelRecord}>
                            <Ionicons name="close-circle" size={24} color="#999" />
                          </Pressable>
                        </View>
                      ) : (
                        <TextInput
                          placeholder="Type a message..."
                          placeholderTextColor={theme.textSecondary}
                          style={[styles.pillInput, { color: theme.text }]}
                          value={newMessage}
                          onChangeText={setNewMessage}
                          multiline
                        />
                      )}

                      <Pressable
                        onPress={newMessage.trim() || isRecording ? handleSendMessage : () => setIsRecording(true)}
                        style={[styles.actionCircleBtn, { backgroundColor: theme.primary }]}
                      >
                        <Ionicons 
                          name={newMessage.trim() || isRecording ? "send" : "mic"} 
                          size={18} 
                          color="#FFF" 
                          style={newMessage.trim() || isRecording ? { marginLeft: 2 } : {}}
                        />
                      </Pressable>
                    </View>
                  </View>

                </KeyboardAvoidingView>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    fontSize: 24,
    fontWeight: 'bold',
  },
  supportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  supportBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
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
    backgroundColor: '#EEE',
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
    fontWeight: '700',
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
  modalInner: {
    flex: 1,
    overflow: 'hidden',
  },
  modernHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  modernBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEE',
  },
  headerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  headerSettings: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8D849', // Yellow accent button
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    borderWidth: 1,
    borderColor: '#F8D849',
  },
  messagesContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateSeparatorText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  msgRow: {
    flexDirection: 'row',
  },
  msgBubble: {
    maxWidth: '80%',
    padding: 16,
    borderRadius: 24,
  },
  msgText: {
    fontSize: 15,
    lineHeight: 22,
  },
  msgTime: {
    fontSize: 11,
    color: '#A0A0A0',
    marginTop: 4,
  },
  
  // Voice Message Styles
  voiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 180,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  waveformMock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  waveBar: {
    width: 3,
    backgroundColor: '#444',
    borderRadius: 2,
  },
  voiceTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
  },

  // Pill Input Footer
  inputFooter: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    backgroundColor: '#FFF',
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 30,
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  pillInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    color: '#111',
  },
  actionCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#000', // Black circle as requested
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  
  // Recording UI
  recordingUi: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  recordingTime: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },
  cancelRecord: {
    marginLeft: 'auto',
  }
});
