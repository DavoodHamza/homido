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

// Helper — FormData (multipart) request; no Content-Type set so browser adds boundary
async function requestFormData(endpoint: string, formData: FormData) {
  const token = useAuthStore.getState().token;

  const headers = new Headers();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json();

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
      formData.append('file', {
        uri,
        name: fileName || `photo_${Date.now()}.jpg`,
        type: mimeType || 'image/jpeg',
      } as any);
      const result = await requestFormData('/upload/image', formData);
      return `${SERVER_ROOT}${result.url}`;
    },
    video: async (uri: string, fileName?: string, mimeType?: string): Promise<string> => {
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: fileName || `video_${Date.now()}.mp4`,
        type: mimeType || 'video/mp4',
      } as any);
      const result = await requestFormData('/upload/video', formData);
      return `${SERVER_ROOT}${result.url}`;
    },
  },

  // Vendors
  vendors: {
    getAll: (filters: { category?: string; search?: string; minRating?: number; sortBy?: 'rating' | 'time' } = {}) => {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.minRating) params.append('minRating', filters.minRating.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);

      const queryString = params.toString();
      return request(`/vendors${queryString ? `?${queryString}` : ''}`);
    },
    getById: (id: string) =>
      request(`/vendors/${id}`),
    getProfileMe: () =>
      request('/vendors/profile/me'),
    register: (name: string, image?: string, timeVal?: number, category?: string) =>
      request('/vendors/register', {
        method: 'POST',
        body: JSON.stringify({ name, image, timeVal, category }),
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
