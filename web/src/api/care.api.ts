import { apiClient } from './client';
import { CareGuide } from '../types/care';

export const careApi = {
  getGuides: async (): Promise<CareGuide[]> => {
    const res = await apiClient.get('/care-guides');
    return res.data.data;
  },

  getGuideBySlug: async (slug: string): Promise<CareGuide> => {
    const res = await apiClient.get(`/care-guides/${slug}`);
    return res.data.data;
  },
};
