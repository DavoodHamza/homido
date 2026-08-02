import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useChatStore } from '@/hooks/useChatStore';

/**
 * Polls the conversations API every 5 seconds and returns
 * whether there are any unread messages (incoming messages from others).
 */
export function useUnreadMessages(): boolean {
  const { user } = useAuthStore();
  const { readConversationIds } = useChatStore();
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const conversations = await api.chat.getConversations();
        const unread = conversations.some((c: any) => {
          const convKey = c.orderId ? `order-${c.orderId}` : c.otherUser?.id;
          const isRead = readConversationIds.includes(convKey);
          const lastMsgIsIncoming = c.lastSenderId && c.lastSenderId !== user?.id;
          
          if (!isRead && lastMsgIsIncoming && c.lastMessage) {
            console.log('Unread message found!', { convKey, lastSenderId: c.lastSenderId, userId: user?.id, isRead });
            return true;
          }
          return false;
        });
        console.log('useUnreadMessages result:', unread, 'Conversations count:', conversations.length);
        setHasUnread(unread);
      } catch (e) {
        console.error('useUnreadMessages error:', e);
        // Silently fail — don't break the tab bar
      }
    };

    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, [user?.id, readConversationIds]);

  return hasUnread;
}
