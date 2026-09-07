import { z } from 'zod';

export const addToCartSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Valid product ID required'),
    variantId: z.string().uuid('Valid variant ID required'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
  }),
});

export const updateCartItemSchema = z.object({
  params: z.object({
    id: z.string().uuid('Valid cart item ID required'),
  }),
  body: z.object({
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  }),
});

export const deleteCartItemSchema = z.object({
  params: z.object({
    id: z.string().uuid('Valid cart item ID required'),
  }),
});

export const mergeCartSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        productId: z.string().uuid('Valid product ID required'),
        variantId: z.string().uuid('Valid variant ID required'),
        quantity: z.number().int().min(1).default(1),
      })
    ),
  }),
});

export const wishlistParamSchema = z.object({
  params: z.object({
    productId: z.string().uuid('Valid product ID required'),
  }),
});
