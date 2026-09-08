/**
 * Botanical Image Management & Display Utilities (Database & Local Assets)
 */

export type ImagePreset = 'thumbnail' | 'card' | 'detail' | 'zoom';

export const FALLBACK_PLANT_IMAGE = '/hero-plant.jpg';
export const FALLBACK_CATEGORY_IMAGE = '/hero-plant.jpg';

/**
 * Returns clean image URL (supports database base64, local assets /hero-plant.jpg, or web URLs)
 */
export function getPlantImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return FALLBACK_PLANT_IMAGE;
  }
  return url;
}

// Backward compatibility alias
export const getCloudinaryUrl = (url?: string | null): string => getPlantImageUrl(url);
export const getResponsiveSrcSet = (_url?: string | null): string | undefined => undefined;
