/**
 * Botanical Image Management & Display Utilities (Database & Local Assets)
 */

export type ImagePreset = 'thumbnail' | 'card' | 'detail' | 'zoom';

export const FALLBACK_CATEGORY_IMAGE = '/hero-plant.jpg';

/**
 * Returns clean image URL (supports database base64, local assets /hero-plant.jpg, or web URLs)
 */
export function getPlantImageUrl(url?: string | null): string {
  if (typeof url !== 'string') return '';

  const value = url.trim();
  if (!value || value.startsWith('data:') || /^https?:\/\//i.test(value)) return value;

  const configuredApiUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (configuredApiUrl && value.startsWith('/api/')) {
    return `${configuredApiUrl.replace(/\/$/, '')}${value.slice(4)}`;
  }

  return value;
}

export const getResponsiveSrcSet = (_url?: string | null): string | undefined => undefined;
