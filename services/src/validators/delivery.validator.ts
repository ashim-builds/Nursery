import { z } from 'zod';

export const createZoneSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Zone name is required'),
    code: z.string().min(2, 'Zone code is required').toUpperCase(),
    description: z.string().optional(),
    deliveryCharge: z.number().min(0, 'Delivery charge must be non-negative').default(0),
    baseDeliveryCharge: z.number().min(0).optional(),
    minimumOrder: z.number().min(0).default(0),
    estimatedHours: z.number().int().min(1).default(24),
    estimatedDeliveryTime: z.string().default('Within 24 Hours'),
    isActive: z.boolean().default(true),
  }),
});

export const updateZoneSchema = z.object({
  params: z.object({
    id: z.string().uuid('Valid zone ID required'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    code: z.string().min(2).toUpperCase().optional(),
    description: z.string().optional(),
    deliveryCharge: z.number().min(0).optional(),
    baseDeliveryCharge: z.number().min(0).optional(),
    minimumOrder: z.number().min(0).optional(),
    estimatedHours: z.number().int().min(1).optional(),
    estimatedDeliveryTime: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const calculateZoneSchema = z.object({
  body: z.object({
    city: z.string().default('Pokhara'),
    area: z.string().optional(),
    streetAddress: z.string().optional(),
    subtotal: z.number().min(0).default(0),
  }),
});

export const assignRiderSchema = z.object({
  params: z.object({
    id: z.string().uuid('Valid delivery ID required'),
  }),
  body: z.object({
    riderName: z.string().min(2, 'Rider name is required'),
    riderPhone: z.string().min(7, 'Rider phone is required'),
  }),
});

export const updateDeliveryStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Valid delivery ID required'),
  }),
  body: z.object({
    status: z.enum([
      'PENDING',
      'ASSIGNED',
      'PICKED_UP',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'FAILED',
      'RETURNED',
    ]),
    trackingNotes: z.string().optional(),
  }),
});
