import React from 'react';
import { ProductVariant } from '../../types/product';
import { Check, AlertCircle } from 'lucide-react';

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant;
  onSelectVariant: (variant: ProductVariant) => void;
  basePrice: number;
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedVariant,
  onSelectVariant,
  basePrice,
}) => {
  if (!variants || variants.length <= 1) return null;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Select Option / Pot Size:
        </label>
        <span className="text-xs text-forest-700 font-medium">
          {selectedVariant.name}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {variants.map((v) => {
          const isSelected = v.id === selectedVariant.id;
          const isOutOfStock = v.stockQuantity <= 0;
          const isLowStock = v.stockQuantity > 0 && v.stockQuantity <= v.lowStockThreshold;
          const variantFinalPrice = basePrice + Number(v.priceAdjustment);

          return (
            <button
              key={v.id}
              type="button"
              disabled={isOutOfStock}
              onClick={() => onSelectVariant(v)}
              className={`relative flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-200 ${
                isSelected
                  ? 'border-forest-800 bg-forest-50/70 ring-1 ring-forest-800 text-forest-950'
                  : isOutOfStock
                  ? 'border-slate-200 bg-slate-50/80 text-slate-400 opacity-60 cursor-not-allowed'
                  : 'border-slate-200 hover:border-forest-300 bg-white text-slate-800'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div
                  className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-forest-800 bg-forest-800 text-white' : 'border-slate-300'
                  }`}
                >
                  {isSelected && <Check size={10} strokeWidth={3} />}
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-semibold block leading-tight">
                    {v.name}
                  </span>
                  {v.dimensions && (
                    <span className="text-[11px] text-slate-500 block">{v.dimensions}</span>
                  )}
                  {isLowStock && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 mt-0.5">
                      <AlertCircle size={10} /> Only {v.stockQuantity} left
                    </span>
                  )}
                  {isOutOfStock && (
                    <span className="text-[10px] font-bold text-rose-500 mt-0.5 block">
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs sm:text-sm font-bold text-forest-900 block">
                  रू {variantFinalPrice.toLocaleString()}
                </span>
                {Number(v.priceAdjustment) !== 0 && (
                  <span className="text-[10px] text-slate-500">
                    {Number(v.priceAdjustment) > 0 ? `+रू ${v.priceAdjustment}` : `-रू ${Math.abs(Number(v.priceAdjustment))}`}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
