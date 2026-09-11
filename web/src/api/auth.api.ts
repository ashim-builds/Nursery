import { apiClient } from './client';
import { AuthResponse, User } from '../types/auth';

export const authApi = {
  register: async (data: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber?: string;
    address?: string;
    city?: string;
  }): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/register', data);
    return res.data.data;
  },

  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/login', credentials);
    return res.data.data;
  },

  getProfile: async (): Promise<User> => {
    const res = await apiClient.get('/auth/me');
    return res.data.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const res = await apiClient.put('/auth/profile', data);
    return res.data.data;
  },

  adminLogin: async (password: string): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/admin-login', { password });
    return res.data.data;
  },

  getGoogleAuthUrl: async (): Promise<string> => {
    const res = await apiClient.get('/auth/google/url');
    return res.data?.data?.url;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout', {});
    } catch {
      // Ignore network errors during logout
    }
  },
};


