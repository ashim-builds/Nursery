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
};
