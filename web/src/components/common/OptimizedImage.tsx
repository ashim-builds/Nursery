import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../../utils/image';

export interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
  fallbackSrc?: string;
  aspectRatio?: 'square' | '4/3' | '16/9' | 'auto';
  fit?: 'contain' | 'cover' | 'fill';
  showBackdrop?: boolean;
}

// Minimal inline SVG botanical placeholder for instant zero-network fallback
const DEFAULT_PLACEHOLDER_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="%23f1f5f9"><rect width="200" height="200" fill="%23f8fafc"/><path d="M100 45c-20 0-38 12-45 30 15 2 30-2 40-12 10 10 25 14 40 12-7-18-25-30-35-30zm0 40c-3 15-12 35-25 45 15 0 25-5 30-15 5 10 15 15 30 15-13-10-22-30-25-45z" fill="%2394a3b8"/><circle cx="100" cy="155" r="5" fill="%23cbd5e1"/></svg>`;

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  imgClassName = '',
  fallbackSrc = DEFAULT_PLACEHOLDER_SVG,
  aspectRatio = 'square',
  fit = 'contain',
  showBackdrop = false,
  onError,
  onLoad,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Reset state when src changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const rawUrl = hasError ? fallbackSrc : src ? getImageUrl(src) : fallbackSrc;
  const finalSrc = rawUrl || fallbackSrc;

  // Map aspect ratio to fixed CSS utility to guarantee 0 Cumulative Layout Shift (CLS)
  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === '4/3'
        ? 'aspect-[4/3]'
        : aspectRatio === '16/9'
          ? 'aspect-video'
          : '';

  const fitClass =
    fit === 'contain'
      ? 'w-full h-full object-contain'
      : fit === 'cover'
        ? 'w-full h-full object-cover'
        : 'w-full h-full object-fill';

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center bg-slate-100/70 ${aspectClass} ${className}`}
    >
      {/* Animated Skeleton Pulse Placeholder while loading */}
      {!isLoaded && (
        <div
          className="absolute inset-0 bg-slate-200/90 animate-pulse pointer-events-none z-10"
          aria-hidden="true"
        />
      )}

      {/* Ambient blurred backdrop for letterboxed/landscape plant images */}
      {showBackdrop && fit === 'contain' && finalSrc && (
        <img
          src={finalSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-20 scale-125 pointer-events-none select-none"
        />
      )}

      {/* High-Performance Off-Thread Decoded Image */}
      <img
        src={finalSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={(e) => {
          setIsLoaded(true);
          if (onLoad) onLoad(e);
        }}
        onError={(e) => {
          if (!hasError) {
            setHasError(true);
            setIsLoaded(true);
          }
          if (onError) onError(e);
        }}
        className={`relative z-[1] max-w-full max-h-full transition-all duration-500 ease-out ${fitClass} ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        } ${imgClassName}`}
        {...props}
      />
    </div>
  );
};

export default OptimizedImage;
