import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ChatState {
  readTimestamps: Record<string, string>;
  markAsRead: (convKey: string, timestamp: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      readTimestamps: {},
      markAsRead: (convKey: string, timestamp: string) => 
        set((state) => {
          // Only update if the new timestamp is newer or doesn't exist
          const existing = state.readTimestamps[convKey];
          if (!existing || new Date(timestamp) > new Date(existing)) {
            return { readTimestamps: { ...state.readTimestamps, [convKey]: timestamp } };
          }
          return state;
        }),
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
