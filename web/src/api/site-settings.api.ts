import { apiClient } from './client';

export interface SiteSettings {
  businessName?: string;
  tagline?: string;
  logo?: string;
  phone?: string;
  whatsappPhone?: string;
  email?: string;
  address?: string;
  province?: string;
  district?: string;
  city?: string;
  area?: string;
  latitude?: number;
  longitude?: number;
  openingHours?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  freeShippingThreshold?: number;
  deliveryNotice?: string;
  defaultDeliveryMessage?: string;
  emergencyContact?: string;
  setupCompleted?: boolean;
}

export const siteSettingsApi = {
  getSettings: async (): Promise<SiteSettings | null> => {
    const res = await apiClient.get('/site-settings');
    return res.data?.data || null;
  },

  setupSettings: async (settings: Partial<SiteSettings>): Promise<SiteSettings> => {
    const res = await apiClient.post('/site-settings/setup', settings);
    return res.data?.data;
  },

  updateSettings: async (settings: Partial<SiteSettings>): Promise<SiteSettings> => {
    const res = await apiClient.put('/site-settings', settings);
    return res.data?.data;
  },
};
