import { z } from 'zod';

export const createPaymentSchema = z.object({
  body: z.object({
    orderId: z.string().uuid('Valid order ID required'),
    paymentMethod: z.enum(['CASH', 'FONEPAY_QR', 'ESEWA', 'KHALTI', 'CARD', 'ONLINE']).default('CASH'),
    returnUrl: z.string().url().optional(),
  }),
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    paymentId: z.string().uuid().optional(),
    orderId: z.string().uuid().optional(),
    transactionReference: z.string().optional(),
    pidx: z.string().optional(),
    token: z.string().optional(),
    method: z.enum(['CASH', 'FONEPAY_QR', 'ESEWA', 'KHALTI', 'CARD', 'ONLINE']).optional(),
    rawPayload: z.any().optional(),
  }),
});

export const webhookPaymentSchema = z.object({
  query: z.object({
    method: z.enum(['CASH', 'FONEPAY_QR', 'ESEWA', 'KHALTI', 'CARD', 'ONLINE']).optional(),
  }),
});

export const markCashPaidSchema = z.object({
  params: z.object({
    id: z.string().uuid('Valid payment ID required'),
  }),
  body: z.object({
    reference: z.string().optional(),
  }),
});
