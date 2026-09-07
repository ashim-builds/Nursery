import { apiClient } from './client';
import { PaymentMethod } from '../types/order';

export interface InitiatePaymentPayload {
  orderId: string;
  paymentMethod: PaymentMethod;
  returnUrl?: string;
}

export interface InitiatePaymentResponse {
  paymentId: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  billNumber: string;
  paymentMethod: PaymentMethod;
  paymentUrl?: string;
  qrData?: string;
  pidx?: string;
  transactionReference?: string;
  instructions: string;
  expiresAt?: string;
  metadata?: Record<string, any>;
}

export interface VerifyPaymentPayload {
  paymentId?: string;
  orderId?: string;
  transactionReference?: string;
  pidx?: string;
  token?: string;
  method?: PaymentMethod;
  rawPayload?: any;
}

export interface VerifyPaymentResponse {
  success: boolean;
  paymentStatus: string;
  transactionReference: string;
  amount: number;
  orderNumber: string;
  message: string;
}

export const paymentApi = {
  createPayment: async (payload: InitiatePaymentPayload): Promise<InitiatePaymentResponse> => {
    const res = await apiClient.post('/payments/create', payload);
    return res.data.data;
  },

  verifyPayment: async (payload: VerifyPaymentPayload): Promise<VerifyPaymentResponse> => {
    const res = await apiClient.post('/payments/verify', payload);
    return res.data.data;
  },

  getPayment: async (id: string) => {
    const res = await apiClient.get(`/payments/${id}`);
    return res.data.data;
  },

  getPaymentsByOrder: async (orderId: string) => {
    const res = await apiClient.get(`/payments/order/${orderId}`);
    return res.data.data;
  },
};
