import React from 'react';
import { Product } from '../../types/product';
import { Sun, Droplets, ShieldCheck, ShieldAlert, Wind, Sprout, HeartHandshake } from 'lucide-react';

interface CareRequirementsMeterProps {
  product: Product;
}

export const CareRequirementsMeter: React.FC<CareRequirementsMeterProps> = ({ product }) => {
  if (product.productType !== 'PLANT' && product.productType !== 'SEED') {
    return null;
  }

  const getSunlightScore = () => {
    switch (product.sunlight) {
      case 'LOW_LIGHT': return 1;
      case 'MEDIUM_LIGHT': return 2;
      case 'BRIGHT_INDIRECT': return 3;
      case 'FULL_SUN': return 4;
      default: return 2;
    }
  };

  const getWateringText = () => {
    switch (product.watering) {
      case 'DAILY': return 'Daily hydration';
      case 'WEEKLY_TWICE': return '2x per week';
      case 'WEEKLY_ONCE': return 'Once weekly when topsoil dries';
      case 'BIWEEKLY': return 'Every 2-3 weeks (Drought-tolerant)';
      case 'WHEN_DRY': return 'Only when completely dry';
      default: return 'Moderate watering';
    }
  };

  return (
    <div className="bg-forest-50/70 border border-forest-200/80 rounded-2xl p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-forest-200/60 pb-2.5">
        <h4 className="font-serif font-bold text-sm text-forest-950 flex items-center gap-1.5">
          <Sprout size={16} className="text-forest-700" />
          <span>Botanical Care Specs</span>
        </h4>
        <span className="text-[11px] font-semibold text-forest-700 bg-white px-2 py-0.5 rounded-full border border-forest-200">
          Pokhara Subtropical Climate
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Sunlight Meter */}
        <div className="bg-white p-3 rounded-xl border border-forest-100/80 shadow-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-amber-600">
            <Sun size={16} />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Light</span>
          </div>
          <div className="flex gap-1 py-1">
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`h-1.5 flex-1 rounded-full ${
                  level <= getSunlightScore() ? 'bg-amber-500' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] font-medium text-slate-800 block capitalize">
            {product.sunlight?.replace(/_/g, ' ').toLowerCase() || 'Bright Indirect'}
          </span>
        </div>

        {/* Watering Meter */}
        <div className="bg-white p-3 rounded-xl border border-forest-100/80 shadow-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-sky-600">
            <Droplets size={16} />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Watering</span>
          </div>
          <p className="text-[11px] font-medium text-slate-800 leading-tight">
            {getWateringText()}
          </p>
        </div>

        {/* Pet Safety */}
        <div className="bg-white p-3 rounded-xl border border-forest-100/80 shadow-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-600">
            {product.petFriendly ? (
              <ShieldCheck size={16} className="text-emerald-600" />
            ) : (
              <ShieldAlert size={16} className="text-amber-600" />
            )}
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Pet Safety</span>
          </div>
          <span
            className={`text-[11px] font-bold inline-block px-1.5 py-0.5 rounded ${
              product.petFriendly ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
            }`}
          >
            {product.petFriendly ? '100% Non-Toxic' : 'Keep Away From Pets'}
          </span>
        </div>

        {/* Care Difficulty */}
        <div className="bg-white p-3 rounded-xl border border-forest-100/80 shadow-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-forest-700">
            <HeartHandshake size={16} />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Difficulty</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-800 block">
            {product.difficulty === 'EASY'
              ? 'Beginner Friendly'
              : product.difficulty === 'MODERATE'
              ? 'Moderate'
              : 'Experienced Plant Parent'}
          </span>
        </div>
      </div>

      {/* Extra Badges (Air purifying, fragrant) */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        {product.airPurifying && (
          <span className="inline-flex items-center gap-1 bg-white text-forest-800 border border-forest-200 px-2.5 py-1 rounded-lg font-medium">
            <Wind size={13} className="text-teal-600" /> NASA-rated Air Cleaner
          </span>
        )}
        {product.matureHeight && (
          <span className="inline-flex items-center gap-1 bg-white text-forest-800 border border-forest-200 px-2.5 py-1 rounded-lg font-medium">
            <Sprout size={13} className="text-forest-600" /> Mature Height: {product.matureHeight}
          </span>
        )}
      </div>
    </div>
  );
};
