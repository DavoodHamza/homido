import { create } from 'zustand';

type Role = 'user' | 'vendor' | 'admin' | null;

interface UserProfile {
  id: string;
  name: string;
  phoneNumber: string;
  role: Role;
  profileImage?: string;
  address?: string;
  addressLocation?: string;
  addressLandmark?: string;
  addressPhone?: string;
  addressSecondaryPhone?: string;
}

interface AuthState {
  isLoggedIn: boolean;
  role: Role;
  token: string | null;
  user: UserProfile | null;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  updateUser: (user: Partial<UserProfile>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  role: null,
  token: null,
  user: null,
  login: (token, user) => set({ isLoggedIn: true, role: user.role, token, user }),
  logout: () => set({ isLoggedIn: false, role: null, token: null, user: null }),
  updateUser: (updatedFields) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updatedFields } : null,
    })),
}));
