import React, { useState } from 'react';
import { getPlantImageUrl } from '../../utils/image';

interface PlantImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  alt: string;
  preset?: string;
  responsive?: boolean;
  className?: string;
  fallbackSrc?: string;
}

export const DatabaseImage: React.FC<PlantImageProps> = ({
  src,
  alt,
  preset: _preset,
  responsive: _responsive,
  className = '',
  fallbackSrc = '',
  ...props
}) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const finalSrc = error ? fallbackSrc : src ? getPlantImageUrl(src) : '';

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {finalSrc ? (
        <>
          {!loaded && <div className="absolute inset-0 bg-slate-200/80 animate-pulse" />}
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
        </>
      ) : (
        <div className="w-full h-full min-h-24 border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400 flex items-center justify-center text-center">
          No image
        </div>
      )}
    </div>
  );
};