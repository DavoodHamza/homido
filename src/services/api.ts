import { Platform } from 'react-native';
import { useAuthStore } from '../hooks/useAuthStore';
import { API_CONFIG } from '../config';

export const BASE_URL = API_CONFIG.BASE_URL;
export const SERVER_ROOT = API_CONFIG.SERVER_ROOT;

console.log(`[API Client] Initialized with Base URL: ${BASE_URL}`);

// Helper — JSON request
async function request(endpoint: string, options: RequestInit = {}) {
  const token = useAuthStore.getState().token;

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const config = { ...options, headers };
  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (response.status === 204) return null;

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data?.message || 'Something went wrong';
    throw new Error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
  }

  return data;
}

// Helper — FormData (multipart) request; no Content-Type set so RN adds boundary
async function requestFormData(endpoint: string, formData: FormData) {
  const token = useAuthStore.getState().token;

  const headers = new Headers();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const url = `${BASE_URL}${endpoint}`;
  console.log(`[Upload] POST ${url}`);

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  const text = await response.text();
  console.log(`[Upload] Response ${response.status}: ${text}`);

  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Upload failed: server returned non-JSON response (${response.status})`);
  }

  if (!response.ok) {
    const errorMessage = data?.message || 'Upload failed';
    throw new Error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
  }

  return data as { url: string };
}

export const api = {
  // Authentication
  auth: {
    login: (phoneNumber: string, pass: string) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber, password: pass }),
      }),
    signup: (name: string, phoneNumber: string, pass: string, role: string = 'user') =>
      request('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, phoneNumber, password: pass, role }),
      }),
  },

  // Upload (image or video file → server disk → returns absolute URL)
  upload: {
    image: async (uri: string, fileName?: string, mimeType?: string): Promise<string> => {
      const formData = new FormData();
      const name = fileName || uri.split('/').pop() || `photo_${Date.now()}.jpg`;
      const type = mimeType || 'image/jpeg';

      if (Platform.OS === 'web') {
        // Web: fetch the blob URL and convert to a real File object
        const response = await fetch(uri);
        const blob = await response.blob();
        const file = new File([blob], name, { type });
        formData.append('file', file);
      } else {
        // Native: RN's fetch polyfill understands the { uri, name, type } pattern
        formData.append('file', { uri, name, type } as any);
      }

      const result = await requestFormData('/upload/image', formData);
      return `${SERVER_ROOT}${result.url}`;
    },

    video: async (uri: string, fileName?: string, mimeType?: string): Promise<string> => {
      const formData = new FormData();
      const name = fileName || uri.split('/').pop() || `video_${Date.now()}.mp4`;
      const type = mimeType || 'video/mp4';

      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        const file = new File([blob], name, { type });
        formData.append('file', file);
      } else {
        formData.append('file', { uri, name, type } as any);
      }

      const result = await requestFormData('/upload/video', formData);
      return `${SERVER_ROOT}${result.url}`;
    },
  },

  // Vendors
  vendors: {
    getAll: (filters: { category?: string; search?: string; minRating?: number; sortBy?: 'rating' | 'time'; location?: string } = {}) => {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.minRating) params.append('minRating', filters.minRating.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.location) params.append('location', filters.location);

      const queryString = params.toString();
      return request(`/vendors${queryString ? `?${queryString}` : ''}`);
    },
    getById: (id: string) =>
      request(`/vendors/${id}`),
    getProfileMe: () =>
      request('/vendors/profile/me'),
    register: (name: string, image?: string, timeVal?: number, category?: string, location?: string) =>
      request('/vendors/register', {
        method: 'POST',
        body: JSON.stringify({ name, image, timeVal, category, location }),
      }),
    getAdminAll: () =>
      request('/vendors/admin/all'),
    approve: (id: string, status: 'approved' | 'rejected' | 'pending') =>
      request(`/vendors/admin/approve/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },

  // Menu Items
  menu: {
    getByVendor: (vendorId: string) =>
      request(`/menu/vendor/${vendorId}`),
    create: (name: string, description: string, price: number, image: string, category: string) =>
      request('/menu', {
        method: 'POST',
        body: JSON.stringify({ name, description, price, image, category }),
      }),
    update: (id: string, data: any) =>
      request(`/menu/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request(`/menu/${id}`, { method: 'DELETE' }),
  },

  // Orders
  orders: {
    create: (vendorId: string, items: { menuItemId: string; quantity: number }[]) =>
      request('/orders', {
        method: 'POST',
        body: JSON.stringify({ vendorId, items }),
      }),
    get: () =>
      request('/orders'),
    updateStatus: (id: string, status: string) =>
      request(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },

  // Chat/Messaging
  chat: {
    getConversations: () =>
      request('/chat/conversations'),
    getConversation: (otherUserId: string) =>
      request(`/chat/messages/${otherUserId}`),
    sendMessage: (receiverId: string, message: string) =>
      request('/chat/send', {
        method: 'POST',
        body: JSON.stringify({ receiverId, message }),
      }),
  },
};
