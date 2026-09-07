import { apiClient } from './client';
import { Order, PaymentMethod } from '../types/order';

export interface CreateOrderPayload {
  idempotencyKey?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryCity?: string;
  deliveryArea?: string;
  deliveryPostalCode?: string;
  deliveryZoneCode?: string;
  couponCode?: string;
  scheduledDeliveryDate?: string;
  giftMessage?: string;
  deliveryNotes?: string;
  paymentMethod: PaymentMethod;
  items: Array<{
    productId: string;
    variantId: string;
    quantity: number;
  }>;
}

export const orderApi = {
  createOrder: async (payload: CreateOrderPayload): Promise<Order> => {
    const res = await apiClient.post('/orders', payload, {
      headers: payload.idempotencyKey ? { 'Idempotency-Key': payload.idempotencyKey } : undefined,
    });
    return res.data.data;
  },

  getMyOrders: async (page = 1): Promise<{ orders: Order[]; meta: any }> => {
    const res = await apiClient.get('/orders/my-orders', { params: { page } });
    return { orders: res.data.data, meta: res.data.meta };
  },

  getOrderById: async (id: string): Promise<Order> => {
    const res = await apiClient.get(`/orders/${id}`);
    return res.data.data;
  },

  cancelOrder: async (id: string, reason?: string): Promise<{ id: string; orderNumber: string; status: string; message: string }> => {
    const res = await apiClient.post(`/orders/${id}/cancel`, { reason });
    return res.data.data;
  },
};
