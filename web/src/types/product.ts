export type ProductType = 
  | 'PLANT' 
  | 'FLOWER_BOUQUET' 
  | 'POT_PLANTER' 
  | 'SEED' 
  | 'FERTILIZER_SOIL' 
  | 'GARDEN_TOOL';

export type SunlightLevel = 
  | 'FULL_SUN' 
  | 'BRIGHT_INDIRECT' 
  | 'MEDIUM_LIGHT' 
  | 'LOW_LIGHT';

export type WateringFrequency = 
  | 'DAILY' 
  | 'WEEKLY_TWICE' 
  | 'WEEKLY_ONCE' 
  | 'BIWEEKLY' 
  | 'WHEN_DRY';

export type CareDifficulty = 'EASY' | 'MODERATE' | 'CHALLENGING';

export interface ProductImage {
  url: string;
  isPrimary?: boolean;
  alt?: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  priceAdjustment: number;
  stockQuantity: number;
  lowStockThreshold: number;
  dimensions?: string;
  isDefault: boolean;
  isActive: boolean;
  stockStatus?: 'IN_STOCK' | 'OUT_OF_STOCK';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  iconName?: string;
  _count?: {
    products: number;
  };
}

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  plantPhotoUrl?: string;
  isVerifiedBuyer: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  title: string;
  name?: string;
  slug: string;
  sku: string;
  scientificName?: string;
  shortDescription: string;
  description?: string;
  fullDescription: string;
  productType: ProductType;
  basePrice: number | string;
  discountPrice?: number | string | null;
  isFeatured: boolean;
  isSeasonal: boolean;
  seasonMonths?: string;
  isAvailable: boolean;
  images: ProductImage[];
  
  sunlight?: SunlightLevel;
  watering?: WateringFrequency;
  petFriendly: boolean;
  difficulty?: CareDifficulty;
  matureHeight?: string;
  airPurifying: boolean;
  fragrant: boolean;
  potIncluded: boolean;
  careSummary?: string;

  averageRating: number | string;
  rating?: number;
  reviewCount: number;
  reviewsCount?: number;
  totalSold: number;
  stockStatus?: 'IN_STOCK' | 'OUT_OF_STOCK';

  categoryId: string;
  category?: Category;
  variants: ProductVariant[];
  reviews?: Review[];
  careGuideId?: string;
  careGuide?: {
    id: string;
    title: string;
    slug: string;
    summary?: string;
  };
}
