import React, { useState } from 'react';
import { getPlantImageUrl, FALLBACK_PLANT_IMAGE } from '../../utils/image';

interface PlantImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  alt: string;
  preset?: string;
  responsive?: boolean;
  className?: string;
  fallbackSrc?: string;
}

export const CloudinaryImage: React.FC<PlantImageProps> = ({
  src,
  alt,
  preset,
  responsive,
  className = '',
  fallbackSrc = FALLBACK_PLANT_IMAGE,
  ...props
}) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const finalSrc = error || !src ? fallbackSrc : getPlantImageUrl(src);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-slate-200/80 animate-pulse" />
      )}

      <img
        src={finalSrc}
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
