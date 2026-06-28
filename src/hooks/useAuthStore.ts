import { create } from 'zustand';

type Role = 'user' | 'vendor' | 'admin' | null;

interface AuthState {
  isLoggedIn: boolean;
  role: Role;
  login: (role: Role) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: true,
  role: 'user',
  login: (role) => set({ isLoggedIn: true, role }),
  logout: () => set({ isLoggedIn: false, role: null }),
}));
