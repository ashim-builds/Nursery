import React, { useState } from 'react';
import { getPlantImageUrl } from '../../utils/image';

interface PlantImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  alt: string;
  preset?: string;
  responsive?: boolean;
  className?: string;
  imgClassName?: string;
  fallbackSrc?: string;
  fit?: 'contain' | 'cover' | 'fill';
  showBackdrop?: boolean;
}

export const DatabaseImage: React.FC<PlantImageProps> = ({
  src,
  alt,
  preset: _preset,
  responsive: _responsive,
  className = '',
  imgClassName = '',
  fallbackSrc = '',
  fit = 'contain',
  showBackdrop = true,
  ...props
}) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const finalSrc = error ? fallbackSrc : src ? getPlantImageUrl(src) : '';

  return (
    <div className={`relative overflow-hidden flex items-center justify-center ${className}`}>
      {finalSrc ? (
        <>
          {!loaded && <div className="absolute inset-0 bg-slate-200/80 animate-pulse z-10" />}

          {/* Ambient blurred backdrop for letterboxed/portrait/landscape plant images */}
          {fit === 'contain' && showBackdrop && (
            <img
              src={finalSrc}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-20 scale-125 pointer-events-none select-none"
            />
          )}

          <img
            src={finalSrc}
            alt={alt}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => {
              setError(true);
              setLoaded(true);
            }}
            className={`relative z-1 max-w-full max-h-full transition-opacity duration-300 ${
              fit === 'contain'
                ? 'w-full h-full object-contain'
                : fit === 'cover'
                  ? 'w-full h-full object-cover'
                  : 'w-full h-full object-fill'
            } ${loaded ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
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