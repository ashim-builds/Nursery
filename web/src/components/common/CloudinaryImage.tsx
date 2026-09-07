import React, { useState } from 'react';
import {
  ImagePreset,
  getCloudinaryUrl,
  getResponsiveSrcSet,
  FALLBACK_PLANT_IMAGE,
} from '../../utils/image';

interface CloudinaryImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  alt: string;
  preset?: ImagePreset;
  responsive?: boolean;
  className?: string;
  fallbackSrc?: string;
}

export const CloudinaryImage: React.FC<CloudinaryImageProps> = ({
  src,
  alt,
  preset = 'card',
  responsive = true,
  className = '',
  fallbackSrc = FALLBACK_PLANT_IMAGE,
  ...props
}) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const finalSrc = error || !src ? fallbackSrc : getCloudinaryUrl(src, preset);
  const srcSet = responsive && !error && src ? getResponsiveSrcSet(src, preset) : undefined;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Shimmer skeleton while loading */}
      {!loaded && (
        <div className="absolute inset-0 bg-slate-200/80 animate-pulse" />
      )}

      <img
        src={finalSrc}
        srcSet={srcSet}
        sizes={responsive ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw' : undefined}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => {
          setError(true);
          setLoaded(true);
        }}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
    </div>
  );
};
