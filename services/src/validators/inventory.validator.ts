import { z } from 'zod';

export const adjustStockSchema = z.object({
  body: z.object({
    variantId: z.string().uuid('Valid variant ID required'),
    changeAmount: z.number().int('Change amount must be an integer'),
    type: z.enum([
      'PURCHASE',
      'SALE',
      'RESERVATION',
      'RELEASE',
      'ADJUSTMENT',
      'RETURN',
      'DAMAGE',
      'RESTOCK',
    ]),
    note: z.string().optional(),
    referenceType: z.string().optional(),
    referenceId: z.string().optional(),
  }),
});

export const inventoryQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    lowStockOnly: z.enum(['true', 'false']).optional(),
    categoryId: z.string().optional(),
  }),
});
