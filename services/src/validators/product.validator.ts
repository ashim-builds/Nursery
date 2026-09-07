import { z } from 'zod';

export const productQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    q: z.string().optional(),
    category: z.string().optional(),
    sort: z.enum(['price_asc', 'price_desc', 'newest', 'rating', 'popular', 'name_asc', 'relevance']).optional(),
    sortBy: z.enum(['price_asc', 'price_desc', 'newest', 'rating', 'popular', 'name_asc', 'relevance']).optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    featured: z.enum(['true', 'false']).optional(),
    isFeatured: z.enum(['true', 'false']).optional(),
    seasonal: z.enum(['true', 'false']).optional(),
    isSeasonal: z.enum(['true', 'false']).optional(),
    inStock: z.enum(['true', 'false']).optional(),
    size: z.string().optional(),
    plantType: z.string().optional(),
    productType: z.string().optional(),
    sunlight: z.enum(['FULL_SUN', 'BRIGHT_INDIRECT', 'MEDIUM_LIGHT', 'LOW_LIGHT']).optional(),
    watering: z.enum(['DAILY', 'WEEKLY_TWICE', 'WEEKLY_ONCE', 'BIWEEKLY', 'WHEN_DRY']).optional(),
    difficulty: z.enum(['EASY', 'MODERATE', 'CHALLENGING']).optional(),
    petFriendly: z.enum(['true', 'false']).optional(),
    airPurifying: z.enum(['true', 'false']).optional(),
  }),
});

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Product name is required'),
    sku: z.string().min(2, 'SKU is required'),
    shortDescription: z.string().min(5, 'Short description is required'),
    description: z.string().min(10, 'Full description is required'),
    categoryId: z.string().uuid('Valid category ID required'),
    basePrice: z.number().positive('Base price must be greater than 0'),
    compareAtPrice: z.number().positive().optional().nullable(),
    costPrice: z.number().positive().optional().nullable(),
    available: z.boolean().default(true),
    featured: z.boolean().default(false),
    published: z.boolean().default(true),
    seasonal: z.boolean().default(false),
    lowStockThreshold: z.number().int().default(5),
    careInstructions: z.string().optional(),
    sunlightRequirement: z.enum(['FULL_SUN', 'BRIGHT_INDIRECT', 'MEDIUM_LIGHT', 'LOW_LIGHT']).optional(),
    wateringRequirement: z.enum(['DAILY', 'WEEKLY_TWICE', 'WEEKLY_ONCE', 'BIWEEKLY', 'WHEN_DRY']).optional(),
    difficultyLevel: z.enum(['EASY', 'MODERATE', 'CHALLENGING']).optional(),
    dimensions: z.string().optional(),
    weight: z.number().optional(),
    images: z.array(
      z.object({
        url: z.string().url(),
        altText: z.string().optional(),
        isPrimary: z.boolean().default(false),
        sortOrder: z.number().int().default(0),
      })
    ).optional(),
    attributes: z.array(
      z.object({
        name: z.string().min(1),
        value: z.string().min(1),
      })
    ).optional(),
    variants: z.array(
      z.object({
        name: z.string().min(1, 'Variant name required (e.g. Small, 6 inch)'),
        sku: z.string().min(1, 'Variant SKU required'),
        price: z.number().positive('Price must be positive'),
        stock: z.number().int().nonnegative().default(0),
        weight: z.number().optional(),
        isAvailable: z.boolean().default(true),
        sortOrder: z.number().int().default(0),
      })
    ).optional(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    sku: z.string().min(2).optional(),
    shortDescription: z.string().optional(),
    description: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    basePrice: z.number().positive().optional(),
    compareAtPrice: z.number().positive().optional().nullable(),
    costPrice: z.number().positive().optional().nullable(),
    available: z.boolean().optional(),
    featured: z.boolean().optional(),
    published: z.boolean().optional(),
    seasonal: z.boolean().optional(),
    lowStockThreshold: z.number().int().optional(),
    careInstructions: z.string().optional(),
    sunlightRequirement: z.enum(['FULL_SUN', 'BRIGHT_INDIRECT', 'MEDIUM_LIGHT', 'LOW_LIGHT']).optional(),
    wateringRequirement: z.enum(['DAILY', 'WEEKLY_TWICE', 'WEEKLY_ONCE', 'BIWEEKLY', 'WHEN_DRY']).optional(),
    difficultyLevel: z.enum(['EASY', 'MODERATE', 'CHALLENGING']).optional(),
    dimensions: z.string().optional(),
    weight: z.number().optional(),
  }),
});

export const createVariantSchema = z.object({
  params: z.object({
    id: z.string().uuid(), // Product ID
  }),
  body: z.object({
    name: z.string().min(1, 'Variant name required'),
    sku: z.string().min(1, 'SKU required'),
    price: z.number().positive('Price must be positive'),
    stock: z.number().int().nonnegative().default(0),
    weight: z.number().optional(),
    isAvailable: z.boolean().default(true),
    sortOrder: z.number().int().default(0),
  }),
});

export const updateVariantSchema = z.object({
  params: z.object({
    id: z.string().uuid(), // Variant ID
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    sku: z.string().min(1).optional(),
    price: z.number().positive().optional(),
    stock: z.number().int().nonnegative().optional(),
    weight: z.number().optional(),
    isAvailable: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  }),
});

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Category name is required'),
    description: z.string().optional(),
    imageUrl: z.string().url().optional(),
    parentId: z.string().uuid().optional().nullable(),
    displayOrder: z.number().int().default(0),
    isActive: z.boolean().default(true),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    imageUrl: z.string().url().optional(),
    parentId: z.string().uuid().optional().nullable(),
    displayOrder: z.number().int().optional(),
    isActive: z.boolean().optional(),
  }),
});
