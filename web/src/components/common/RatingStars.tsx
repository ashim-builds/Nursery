import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number | string;
  reviewCount?: number;
  size?: number;
  showCount?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  reviewCount,
  size = 14,
  showCount = true,
}) => {
  const numericRating = Number(rating) || 5;
  const rounded = Math.round(numericRating * 10) / 10;

  return (
    <div className="inline-flex items-center gap-1">
      <div className="flex text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={star <= Math.round(numericRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-slate-700">{rounded.toFixed(1)}</span>
      {showCount && reviewCount !== undefined && (
        <span className="text-xs text-slate-600">({reviewCount})</span>
      )}
    </div>
  );
};
