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

// In-memory delivery zones cache (5 minutes TTL)
let cachedZones: { data: DeliveryZoneDto[]; expiry: number } | null = null;

export const invalidateZonesCache = () => {
  cachedZones = null;
};

export const deliveryApi = {
  getZones: async (all?: boolean | any, options?: { forceRefresh?: boolean } | boolean): Promise<DeliveryZoneDto[]> => {
    const isAll = typeof all === 'boolean' ? all : false;
    const forceRefresh = typeof options === 'boolean' ? options : !!options?.forceRefresh;

    if (!isAll && !forceRefresh && cachedZones && Date.now() < cachedZones.expiry) {
      return cachedZones.data;
    }
    const res = await apiClient.get('/delivery-zones', { params: { all: isAll } });
    if (!isAll) {
      cachedZones = {
        data: res.data.data,
        expiry: Date.now() + 5 * 60 * 1000,
      };
    }
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
