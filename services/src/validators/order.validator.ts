import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    idempotencyKey: z.string().optional(),
    customerName: z
      .string()
      .min(2, 'Customer name must be at least 2 characters')
      .max(70, 'Customer name must not exceed 70 characters')
      .regex(/^[a-zA-Z\s\.\'-]+$/, 'Customer name cannot contain numbers or special symbols'),
    customerEmail: z
      .string()
      .email('Please provide a valid email address')
      .transform((val) => val.toLowerCase().trim()),
    customerPhone: z
      .string()
      .regex(/^[9][0-9]{9}$/, 'Phone number must be exactly 10 digits and start with 9'),
    deliveryAddress: z.string().min(5, 'Delivery address is required'),
    deliveryProvince: z.string().optional(),
    deliveryDistrict: z.string().optional(),
    deliveryCity: z.string().default('Pokhara'),
    deliveryArea: z.string().optional(),
    deliveryPostalCode: z.string().optional(),
    deliveryLatitude: z.number().optional(),
    deliveryLongitude: z.number().optional(),
    deliveryZoneCode: z.string().optional(),
    deliveryZoneId: z.string().uuid().optional(),
    couponCode: z.string().trim().optional(),
    scheduledDeliveryDate: z.string().optional(),
    giftMessage: z.string().optional(),
    deliveryNotes: z.string().optional(),
    paymentMethod: z.enum(['CASH', 'FONEPAY_QR', 'ESEWA', 'KHALTI', 'CARD', 'ONLINE']).default('CASH'),
    items: z
      .array(
        z.object({
          productId: z.string().uuid('Valid product ID required'),
          variantId: z.string().uuid('Valid variant ID required'),
          quantity: z.number().int().positive('Quantity must be at least 1'),
        })
      )
      .min(1, 'Order must contain at least one item'),
  }),
});

export const cancelOrderSchema = z.object({
  params: z.object({
    id: z.string().uuid('Valid order ID required'),
  }),
  body: z.object({
    reason: z.string().min(3, 'Cancellation reason required').optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Valid order ID required'),
  }),
  body: z.object({
    orderStatus: z
      .enum([
        'PENDING',
        'CONFIRMED',
        'PROCESSING',
        'READY',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'COMPLETED',
        'CANCELLED',
      ])
      .optional(),
    paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED']).optional(),
    deliveryStatus: z
      .enum(['PENDING', 'ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RETURNED'])
      .optional(),
    riderName: z.string().optional(),
    riderPhone: z.string().optional(),
    comment: z.string().optional(),
    deliveryNotes: z.string().optional(),
  }),
});

export const orderQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z
      .enum([
        'PENDING',
        'CONFIRMED',
        'PROCESSING',
        'READY',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'COMPLETED',
        'CANCELLED',
      ])
      .optional(),
    search: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});
