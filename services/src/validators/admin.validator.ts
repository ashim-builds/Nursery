import { z } from 'zod';

export const createCouponSchema = z.object({
  body: z.object({
    code: z.string().min(3, 'Coupon code must be at least 3 characters').toUpperCase(),
    description: z.string().optional(),
    discountType: z.enum(['PERCENTAGE', 'FIXED']).default('PERCENTAGE'),
    discountValue: z.number().positive('Discount value must be positive'),
    minimumOrderAmount: z.number().min(0).optional(),
    maxDiscountAmount: z.number().min(0).optional(),
    startDate: z.string().optional(),
    expiryDate: z.string().min(1, 'Expiry date is required'),
    usageLimit: z.number().int().positive().optional(),
    perUserLimit: z.number().int().positive().default(1),
    isActive: z.boolean().default(true),
  }),
});

export const updateCouponSchema = z.object({
  params: z.object({
    id: z.string().uuid('Valid coupon ID required'),
  }),
  body: z.object({
    code: z.string().min(3).toUpperCase().optional(),
    description: z.string().optional(),
    discountType: z.enum(['PERCENTAGE', 'FIXED']).optional(),
    discountValue: z.number().positive().optional(),
    minimumOrderAmount: z.number().min(0).optional(),
    maxDiscountAmount: z.number().min(0).optional(),
    startDate: z.string().optional(),
    expiryDate: z.string().optional(),
    usageLimit: z.number().int().positive().optional(),
    perUserLimit: z.number().int().positive().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const moderateReviewSchema = z.object({
  params: z.object({
    id: z.string().uuid('Valid review ID required'),
  }),
  body: z.object({
    isApproved: z.boolean(),
  }),
});

export const broadcastNotificationSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title is required'),
    message: z.string().min(5, 'Message is required'),
    type: z.enum(['ORDER_STATUS', 'CARE_REMINDER', 'INVENTORY_ALERT', 'PROMOTION', 'SYSTEM']).default('PROMOTION'),
    linkUrl: z.string().optional(),
    userIds: z.array(z.string().uuid()).optional(), // Empty means broadcast to all
  }),
});
