import { Platform } from 'react-native';
import { useAuthStore } from '../hooks/useAuthStore';
import { API_CONFIG } from '../config';
import * as FileSystem from 'expo-file-system/legacy';


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

/**
 * Upload a local file URI to S3 via the backend.
 * Reads the file as base64 using expo-file-system and sends it as JSON.
 * This is the most reliable method — avoids all multipart/binary issues.
 */
async function uploadFile(
  endpoint: string,
  uri: string,
  mimeType: string,
): Promise<string> {
  const token = useAuthStore.getState().token;

  console.log('[Upload] Reading file as base64:', uri.substring(0, 60));

  // Read local file as base64 — works reliably for all file:// URIs on iOS/Android
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  console.log('[Upload] base64 length:', base64.length, '— sending to', endpoint);

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ base64, mimeType }),
  });

  const text = await res.text();
  let data: any;
  try { data = JSON.parse(text); } catch { throw new Error(`Upload failed (${res.status})`); }

  if (!res.ok) {
    throw new Error(data?.message || `Upload failed with status ${res.status}`);
  }

  console.log('[Upload] Success, url:', data.url);
  return data.url;
}

export const api = {
  // Authentication
  auth: {
    login: (phoneNumber: string, pass: string) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber, password: pass }),
      }),
    signup: (name: string, phoneNumber: string, pass: string, role: string = 'user', referralCode?: string) =>
      request('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, phoneNumber, password: pass, role, referralCode }),
      }),
  },

  // Upload — reads file as base64 and uploads via backend to S3
  upload: {
    image: (uri: string, fileName?: string, mimeType?: string): Promise<string> =>
      uploadFile('/upload/image', uri, mimeType || 'image/jpeg'),

    video: (uri: string, fileName?: string, mimeType?: string): Promise<string> =>
      uploadFile('/upload/video', uri, mimeType || 'video/mp4'),
  },

  // Vendors
  vendors: {
    getAll: (filters: { category?: string; search?: string; minRating?: number; sortBy?: 'rating' | 'time'; location?: string; userLat?: number; userLng?: number } = {}) => {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.minRating) params.append('minRating', filters.minRating.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.location) params.append('location', filters.location);
      if (filters.userLat !== undefined) params.append('userLat', filters.userLat.toString());
      if (filters.userLng !== undefined) params.append('userLng', filters.userLng.toString());

      const queryString = params.toString();
      return request(`/vendors${queryString ? `?${queryString}` : ''}`);
    },
    getById: (id: string) =>
      request(`/vendors/${id}`),
    getProfileMe: () => request('/vendors/profile/me'),
    updateProfile: (data: any) =>
      request('/vendors/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    addPayment: (id: string, amount: number) =>
      request(`/vendors/admin/pay/${id}`, {
        method: 'POST',
        body: JSON.stringify({ amount }),
      }),
    register: (name: string, image?: string, timeVal?: number, category?: string, location?: string, latitude?: number, longitude?: number, bankName?: string, bankAccountName?: string, bankAccountNumber?: string, bankIFSC?: string, fssaiCertificate?: string) =>
      request('/vendors/register', {
        method: 'POST',
        body: JSON.stringify({ name, image, timeVal, category, location, latitude, longitude, bankName, bankAccountName, bankAccountNumber, bankIFSC, fssaiCertificate }),
      }),
    getAdminAll: () =>
      request('/vendors/admin/all'),
    approve: (id: string, status: 'approved' | 'rejected' | 'pending' | 'deactivated') =>
      request(`/vendors/admin/approve/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },

  // Menu Items
  menu: {
    getAll: (filters: { category?: string; search?: string; userLat?: number; userLng?: number; maxDistanceKm?: number } = {}) => {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.userLat !== undefined) params.append('userLat', filters.userLat.toString());
      if (filters.userLng !== undefined) params.append('userLng', filters.userLng.toString());
      if (filters.maxDistanceKm !== undefined) params.append('maxDistanceKm', filters.maxDistanceKm.toString());
      
      const queryString = params.toString();
      return request(`/menu/all${queryString ? `?${queryString}` : ''}`);
    },
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

  // Users
  users: {
    me: () => request('/users/me'),
    update: (data: any) =>
      request('/users/me', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    deleteAccount: () =>
      request('/users/me', {
        method: 'DELETE',
      }),
    getPrimaryAdmin: () => request('/chat/admin/primary'),
  },

  // Orders
  orders: {
    cartCheckout: (items: any[]) =>
      request('/orders/cart-checkout', {
        method: 'POST',
        body: JSON.stringify({ items }),
      }),
    create: (vendorId: string, items: { menuItemId: string; quantity: number }[]) =>
      request('/orders', {
        method: 'POST',
        body: JSON.stringify({ vendorId, items }),
      }),
    verifyPayment: (orderId: string, paymentData: any) =>
      request(`/orders/${orderId}/verify-payment`, {
        method: 'POST',
        body: JSON.stringify(paymentData),
      }),
    verifyCartPayment: (paymentData: any) =>
      request(`/orders/cart-checkout-verify`, {
        method: 'POST',
        body: JSON.stringify(paymentData),
      }),
    get: () =>
      request('/orders'),
    updateStatus: (id: string, status: string) =>
      request(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    complete: (id: string, otp: string) =>
      request(`/orders/${id}/complete`, {
        method: 'POST',
        body: JSON.stringify({ otp }),
      }),
    getVendorAnalytics: () =>
      request('/orders/vendor/analytics'),
    getAdminVendorAnalytics: () =>
      request('/orders/admin/vendor-analytics'),
  },
  settings: {
    get: (key: string) => request(`/settings/${key}`),
    set: (key: string, value: string) => 
      request(`/settings/${key}`, {
        method: 'PUT',
        body: JSON.stringify({ value }),
      }),
  },

  // Chat/Messaging
  chat: {
    getConversations: () =>
      request('/chat/conversations'),
    getConversation: (otherUserId: string, orderId?: string) =>
      request(`/chat/messages/${otherUserId}${orderId ? `?orderId=${orderId}` : ''}`),
    sendMessage: (receiverId: string, message: string, orderId?: string) =>
      request('/chat/send', {
        method: 'POST',
        body: JSON.stringify({ receiverId, message, orderId }),
      }),
  },
  
  // Categories
  categories: {
    getAll: () => request('/categories'),
    create: (data: { name: string; icon: string }) => 
      request('/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    delete: (id: string) => 
      request(`/categories/${id}`, { method: 'DELETE' }),
  },
  
  // Stories
  stories: {
    getActive: () => request('/stories'),
    getMyStories: () => request('/stories/me'),
    add: (mediaUrl: string) => 
      request('/stories', {
        method: 'POST',
        body: JSON.stringify({ mediaUrl }),
      }),
    delete: (id: string) => 
      request(`/stories/${id}`, { method: 'DELETE' }),
  },

  // Wallets
  wallets: {
    getMe: () => request('/wallets/me'),
  },
};


