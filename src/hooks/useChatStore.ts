import { create } from 'zustand';

interface ChatState {
  readConversationIds: string[];
  markAsRead: (convId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  readConversationIds: [],
  markAsRead: (convId: string) => 
    set((state) => {
      if (state.readConversationIds.includes(convId)) return state;
      return { readConversationIds: [...state.readConversationIds, convId] };
    }),
}));
