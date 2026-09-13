/**
 * Universal Image & Asset Resolution Helper for RJ Flowers
 * Resolves cross-domain backend uploads, base64 data URIs, and local static assets.
 */

export type ImagePreset = 'thumbnail' | 'card' | 'detail' | 'zoom';

export const FALLBACK_CATEGORY_IMAGE = '/hero-plant.jpg';

/**
 * Extracts backend origin from VITE_API_URL or VITE_BACKEND_URL
 */
export function getBackendOrigin(): string {
  const apiUrl = (import.meta.env.VITE_API_URL as string) || (import.meta.env.VITE_BACKEND_URL as string) || '';
  if (!apiUrl) return '';
  try {
    const parsed = new URL(apiUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return apiUrl.replace(/\/api\/?$/, '');
  }
}

/**
 * Universal Image URL resolver:
 * - Returns base64 (data:), blob:, or absolute http(s) URLs directly
 * - Prepends backend origin to /uploads/... or uploads/... relative paths for cross-domain support
 * - Prepends configured API URL if path starts with /api/
 * - Fallbacks gracefully to provided default fallback
 */
export function getImageUrl(url?: string | null, fallback: string = ''): string {
  if (!url || typeof url !== 'string') return fallback;

  const clean = url.trim();
  if (!clean) return fallback;

  // 1. Data URLs, Blob URLs, or Absolute URLs
  if (clean.startsWith('data:') || clean.startsWith('blob:') || /^https?:\/\//i.test(clean)) {
    return clean;
  }

  const backendOrigin = getBackendOrigin();

  // 2. Relative uploads (/uploads/... or uploads/...)
  if (clean.startsWith('/uploads/') || clean.startsWith('uploads/')) {
    const uploadPath = clean.startsWith('/') ? clean : `/${clean}`;
    return backendOrigin ? `${backendOrigin}${uploadPath}` : uploadPath;
  }

  // 3. Relative /api/... endpoints
  if (clean.startsWith('/api/')) {
    const configuredApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '';
    return configuredApiUrl ? `${configuredApiUrl}${clean.slice(4)}` : clean;
  }

  // 4. Other relative paths (e.g. /hero-plant.jpg or local assets)
  return clean;
}

/**
 * Alias for backward compatibility across components
 */
export const getPlantImageUrl = getImageUrl;

export const getResponsiveSrcSet = (_url?: string | null): string | undefined => undefined;
