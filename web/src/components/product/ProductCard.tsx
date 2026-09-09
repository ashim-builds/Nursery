import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types/product';
import { CareBadge } from '../common/CareBadge';
import { DatabaseImage } from '../common/DatabaseImage';
import { useCart } from '../../context/CartContext';
import { useUI } from '../../context/UIContext';
import { Plus, Check, X } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { showToast } = useUI();

  const primaryImage = Array.isArray(product.images) && product.images.length > 0
    ? product.images.find((img) => img.isPrimary)?.url || product.images[0].url
    : null;

  const defaultVariant = product.variants?.find((v) => v.isDefault) || product.variants?.[0];
  const basePriceNum = Number(product.basePrice);
  const discountPriceNum = product.discountPrice ? Number(product.discountPrice) : null;
  const currentPrice =
    (discountPriceNum !== null ? discountPriceNum : basePriceNum) +
    Number(defaultVariant?.priceAdjustment || 0);

  const savingsAmount =
    discountPriceNum !== null && basePriceNum > discountPriceNum
      ? Math.round(basePriceNum - discountPriceNum)
      : 0;

  const isOutOfStock = product.stockStatus === 'OUT_OF_STOCK' || product.isAvailable === false;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || !defaultVariant) return;

    addToCart(product, defaultVariant, 1);
    showToast(`Added "${product.title}" to cart!`, 'success');
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-300 transition-all duration-300 flex flex-col h-full">
      {/* Product Image & Badges */}
      <Link
        to={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-sand-50/60"
      >
        <DatabaseImage
          src={primaryImage}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Floating Stock & Savings Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start z-10">
          {isOutOfStock ? (
            <span className="bg-slate-900/85 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 backdrop-blur-xs">
              <X size={10} />
              <span>Out of Stock</span>
            </span>
          ) : (
            <span className="bg-emerald-700/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 backdrop-blur-xs">
              <Check size={10} />
              <span>In Stock</span>
            </span>
          )}

          {savingsAmount > 0 && !isOutOfStock && (
            <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
              Save रू {savingsAmount}
            </span>
          )}
        </div>

        {/* Quick Add Button */}
        {!isOutOfStock && (
          <button
            onClick={handleQuickAdd}
            className="absolute bottom-2 right-2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white text-forest-900 hover:bg-forest-800 hover:text-white shadow-md flex items-center justify-center transition-all duration-200 transform active:scale-90 border border-slate-100 z-10"
            aria-label="Quick Add to Cart"
            title="Add to cart"
          >
            <Plus size={16} />
          </button>
        )}
      </Link>

      {/* Product Details */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-grow justify-between gap-2 text-left">
        <div className="space-y-1">
          {/* Care Badges (Compact) */}
          <div className="flex flex-wrap items-center gap-1">
            {product.sunlight && <CareBadge type="sunlight" value={product.sunlight} size="sm" />}
            {product.petFriendly && <CareBadge type="petFriendly" value={true} size="sm" />}
          </div>

          {/* Title */}
          <Link
            to={`/products/${product.slug}`}
            className="block group-hover:text-forest-700 transition-colors"
          >
            <h3 className="font-semibold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-1">
              {product.title}
            </h3>
            {product.scientificName && (
              <p className="text-[10px] sm:text-[11px] text-forest-600/80 italic font-serif line-clamp-1">
                {product.scientificName}
              </p>
            )}
          </Link>
        </div>

        {/* Price Row */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="font-bold text-forest-950 text-xs sm:text-sm font-mono">
              रू {currentPrice.toLocaleString('en-IN')}
            </span>
            {savingsAmount > 0 && (
              <span className="text-[10px] text-slate-400 line-through font-mono">
                रू {(basePriceNum + Number(defaultVariant?.priceAdjustment || 0)).toLocaleString('en-IN')}
              </span>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
