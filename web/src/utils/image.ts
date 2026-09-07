/**
 * Botanical Image Management & Cloudinary Transformation Utilities
 */

export type ImagePreset = 'thumbnail' | 'card' | 'detail' | 'zoom';

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'thumb' | 'limit' | 'scale' | 'fit' | 'pad';
  gravity?: 'auto' | 'face' | 'center';
  quality?: 'auto' | 'auto:good' | 'auto:best' | number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
}

export const PRESET_CONFIGS: Record<ImagePreset, ImageTransformOptions> = {
  thumbnail: { width: 150, height: 150, crop: 'fill', gravity: 'auto', quality: 'auto', format: 'auto' },
  card: { width: 500, height: 500, crop: 'fill', gravity: 'auto', quality: 'auto', format: 'auto' },
  detail: { width: 1000, height: 1000, crop: 'limit', quality: 'auto', format: 'auto' },
  zoom: { width: 1800, height: 1800, crop: 'limit', quality: 'auto:best', format: 'auto' },
};

export const FALLBACK_PLANT_IMAGE =
  'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&auto=format&fit=crop&q=80';

export const FALLBACK_CATEGORY_IMAGE =
  'https://images.unsplash.com/photo-1545241047-6083a3684587?w=800&auto=format&fit=crop&q=80';

/**
 * Transforms an image URL to a Cloudinary optimized preset or dimensions
 */
export function getCloudinaryUrl(
  url?: string | null,
  presetOrOptions: ImagePreset | ImageTransformOptions = 'card'
): string {
  if (!url) return FALLBACK_PLANT_IMAGE;

  // Resolve options
  const options: ImageTransformOptions =
    typeof presetOrOptions === 'string'
      ? PRESET_CONFIGS[presetOrOptions] || PRESET_CONFIGS.card
      : presetOrOptions;

  // If it's a Cloudinary URL, inject transformations
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    const parts = url.split('/upload/');
    const base = parts[0] + '/upload/';
    const path = parts[1];

    // Remove any existing transformation parameters in the path if already present
    const cleanPath = path.replace(/^[a-z]_[a-z0-9,:]+\//, '');

    const transformParts: string[] = [];
    if (options.crop) transformParts.push(`c_${options.crop}`);
    if (options.gravity) transformParts.push(`g_${options.gravity}`);
    if (options.width) transformParts.push(`w_${options.width}`);
    if (options.height) transformParts.push(`h_${options.height}`);
    if (options.quality) transformParts.push(`q_${options.quality}`);
    if (options.format) transformParts.push(`f_${options.format}`);

    const transformStr = transformParts.length > 0 ? `${transformParts.join(',')}/` : '';
    return `${base}${transformStr}${cleanPath}`;
  }

  // If it's an Unsplash image, inject Unsplash resize parameters
  if (url.includes('unsplash.com')) {
    const base = url.split('?')[0];
    const width = options.width || 800;
    return `${base}?w=${width}&auto=format&fit=crop&q=80`;
  }

  return url;
}

/**
 * Generates a responsive srcSet string for an image
 */
export function getResponsiveSrcSet(url?: string | null, basePreset: ImagePreset = 'card'): string {
  if (!url) return '';

  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    const w360 = getCloudinaryUrl(url, { width: 360, crop: 'fill', gravity: 'auto', quality: 'auto', format: 'auto' });
    const w640 = getCloudinaryUrl(url, { width: 640, crop: 'fill', gravity: 'auto', quality: 'auto', format: 'auto' });
    const w960 = getCloudinaryUrl(url, { width: 960, crop: 'limit', quality: 'auto', format: 'auto' });
    const w1200 = getCloudinaryUrl(url, { width: 1200, crop: 'limit', quality: 'auto', format: 'auto' });

    return `${w360} 360w, ${w640} 640w, ${w960} 960w, ${w1200} 1200w`;
  }

  if (url.includes('unsplash.com')) {
    const base = url.split('?')[0];
    return `${base}?w=360&auto=format&fit=crop&q=80 360w, ${base}?w=640&auto=format&fit=crop&q=80 640w, ${base}?w=960&auto=format&fit=crop&q=80 960w, ${base}?w=1200&auto=format&fit=crop&q=80 1200w`;
  }

  return `${url} 1x`;
}
