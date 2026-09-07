import { apiClient } from './client';

export interface DeliveryZoneDto {
  id: string;
  name: string;
  code: string;
  description?: string;
  deliveryCharge: number;
  baseDeliveryCharge: number;
  minimumOrder: number;
  estimatedHours: number;
  estimatedDeliveryTime?: string;
  isActive: boolean;
  active: boolean;
}

export interface CalculateZoneResponse {
  zoneId?: string;
  zoneName: string;
  zoneCode: string;
  baseDeliveryCharge: number;
  deliveryCharge: number;
  minimumOrder: number;
  estimatedDeliveryTime: string;
  isFreeDelivery: boolean;
  freeDeliveryThreshold: number;
  amountNeededForFreeDelivery: number;
}

export const deliveryApi = {
  getZones: async (all = false): Promise<DeliveryZoneDto[]> => {
    const res = await apiClient.get('/delivery-zones', { params: { all } });
    return res.data.data;
  },

  getZoneById: async (id: string): Promise<DeliveryZoneDto> => {
    const res = await apiClient.get(`/delivery-zones/${id}`);
    return res.data.data;
  },

  calculateZone: async (payload: {
    city: string;
    area?: string;
    streetAddress?: string;
    subtotal: number;
  }): Promise<CalculateZoneResponse> => {
    const res = await apiClient.post('/delivery-zones/calculate', payload);
    return res.data.data;
  },
};
