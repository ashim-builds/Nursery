import React from 'react';
import { OptimizedImage } from './OptimizedImage';

interface PlantImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  alt: string;
  preset?: string;
  responsive?: boolean;
  className?: string;
  imgClassName?: string;
  fallbackSrc?: string;
  aspectRatio?: 'square' | '4/3' | '16/9' | 'auto';
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
  fallbackSrc,
  aspectRatio = 'square',
  fit = 'contain',
  showBackdrop = true,
  ...props
}) => {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={className}
      imgClassName={imgClassName}
      fallbackSrc={fallbackSrc}
      aspectRatio={aspectRatio}
      fit={fit}
      showBackdrop={showBackdrop}
      {...props}
    />
  );
};
