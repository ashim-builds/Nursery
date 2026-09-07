import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types/product';
import { CareBadge } from '../common/CareBadge';
import { RatingStars } from '../common/RatingStars';
import { useCart } from '../../context/CartContext';
import { useUI } from '../../context/UIContext';
import { Plus } from 'lucide-react';

import { CloudinaryImage } from '../common/CloudinaryImage';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { showToast, openCartDrawer } = useUI();

  const primaryImage =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images.find((img) => img.isPrimary)?.url || product.images[0].url
      : 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80';

  const defaultVariant = product.variants?.find((v) => v.isDefault) || product.variants?.[0];
  const basePriceNum = Number(product.basePrice);
  const discountPriceNum = product.discountPrice ? Number(product.discountPrice) : null;
  const currentPrice = (discountPriceNum !== null ? discountPriceNum : basePriceNum) + Number(defaultVariant?.priceAdjustment || 0);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!defaultVariant) return;

    addToCart(product, defaultVariant, 1);
    showToast(`Added "${product.title}" to cart!`, 'success');
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-forest-100 overflow-hidden shadow-soft hover:shadow-lifted hover:border-forest-200 transition-all duration-300 flex flex-col h-full">
      {/* Product Image & Badges */}
      <Link to={`/products/${product.slug}`} className="relative block aspect-[4/3] sm:aspect-square overflow-hidden bg-forest-50/50">
        <CloudinaryImage
          src={primaryImage}
          alt={product.title}
          preset="card"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Floating Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
          {discountPriceNum && (
            <span className="bg-terracotta-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              Save रू {Math.round(basePriceNum - discountPriceNum)}
            </span>
          )}
          {product.isSeasonal && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              Seasonal
            </span>
          )}
        </div>

        {/* Quick Add Button (Mobile-friendly Floating Button) */}
        <button
          onClick={handleQuickAdd}
          className="absolute bottom-2 right-2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 hover:bg-forest-800 text-forest-900 hover:text-white shadow-md flex items-center justify-center transition-all duration-200 transform active:scale-95"
          aria-label="Quick Add to Cart"
          title="Add to cart"
        >
          <Plus size={18} />
        </button>
      </Link>

      {/* Product Details */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-grow justify-between gap-2">
        <div className="space-y-1">
          {/* Care Badges row (Compact for mobile) */}
          <div className="flex flex-wrap items-center gap-1">
            {product.sunlight && <CareBadge type="sunlight" value={product.sunlight} size="sm" />}
            {product.petFriendly && <CareBadge type="petFriendly" value={true} size="sm" />}
          </div>

          {/* Title & Scientific name */}
          <Link to={`/products/${product.slug}`} className="block group-hover:text-forest-700 transition-colors">
            <h3 className="font-semibold text-slate-900 text-sm sm:text-base leading-snug line-clamp-1">
              {product.title}
            </h3>
            {product.scientificName && (
              <p className="text-[11px] text-forest-600 italic font-serif line-clamp-1">
                {product.scientificName}
              </p>
            )}
          </Link>
        </div>

        {/* Price & Rating */}
        <div className="pt-1 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-forest-950 text-sm sm:text-base">
              रू {currentPrice.toLocaleString()}
            </span>
            {discountPriceNum && (
              <span className="text-xs text-slate-400 line-through">
                रू {basePriceNum.toLocaleString()}
              </span>
            )}
          </div>

          <RatingStars rating={product.averageRating} showCount={false} size={12} />
        </div>
      </div>
    </div>
  );
};
