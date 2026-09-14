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

// In-memory site settings cache (5 minutes TTL)
let cachedSettings: { data: SiteSettings | null; expiry: number } | null = null;

export const invalidateSettingsCache = () => {
  cachedSettings = null;
};

export const siteSettingsApi = {
  getSettings: async (options?: { forceRefresh?: boolean } | boolean | any): Promise<SiteSettings | null> => {
    const forceRefresh = typeof options === 'boolean' ? options : !!options?.forceRefresh;
    if (!forceRefresh && cachedSettings && Date.now() < cachedSettings.expiry) {
      return cachedSettings.data;
    }
    const res = await apiClient.get('/site-settings');
    const data = res.data?.data || null;
    cachedSettings = {
      data,
      expiry: Date.now() + 5 * 60 * 1000,
    };
    return data;
  },

  setupSettings: async (settings: Partial<SiteSettings>): Promise<SiteSettings> => {
    invalidateSettingsCache();
    const res = await apiClient.post('/site-settings/setup', settings);
    return res.data?.data;
  },

  updateSettings: async (settings: Partial<SiteSettings>): Promise<SiteSettings> => {
    invalidateSettingsCache();
    const res = await apiClient.put('/site-settings', settings);
    return res.data?.data;
  },
};
