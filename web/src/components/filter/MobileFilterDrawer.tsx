import React from 'react';
import { useUI } from '../../context/UIContext';
import { 
  X, 
  RotateCcw, 
  Check, 
  Sparkles, 
  Sun, 
  Droplets, 
  ShieldCheck, 
  Wind, 
  DollarSign, 
  Layers, 
  PackageCheck, 
  Flame, 
  Flower2, 
  Ruler 
} from 'lucide-react';

export interface FilterState {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  isSeasonal?: boolean;
  size?: string;
  sunlight?: string;
  watering?: string;
  difficulty?: string;
  petFriendly?: boolean;
  airPurifying?: boolean;
  sortBy?: string;
}

interface MobileFilterDrawerProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onReset: () => void;
  totalResults: number;
  categories?: Array<{ id: string; name: string; slug: string }>;
}

export const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  filters,
  onFilterChange,
  onReset,
  totalResults,
  categories = [],
}) => {
  const { isFilterDrawerOpen, closeFilterDrawer } = useUI();

  if (!isFilterDrawerOpen) return null;

  const handleToggle = (key: keyof FilterState, value: any) => {
    onFilterChange({
      ...filters,
      [key]: filters[key] === value ? undefined : value,
    });
  };

  const handleBooleanToggle = (key: 'inStock' | 'isFeatured' | 'isSeasonal' | 'petFriendly' | 'airPurifying') => {
    onFilterChange({
      ...filters,
      [key]: filters[key] ? undefined : true,
    });
  };

  const handlePricePreset = (min?: number, max?: number) => {
    onFilterChange({
      ...filters,
      minPrice: min,
      maxPrice: max,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
        onClick={closeFilterDrawer} 
      />

      {/* Mobile Bottom Sheet (slides from bottom on phones) / Desktop Right Drawer */}
      <div className="fixed inset-x-0 bottom-0 sm:inset-y-0 sm:right-0 sm:left-auto max-h-[88vh] sm:max-h-full w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-none shadow-2xl flex flex-col z-50 overflow-hidden">
        {/* Touch drag handle bar on mobile */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-forest-50/60 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-forest-800 text-emerald-300 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-forest-950 leading-tight">
                Filter Plants & Pots
              </h2>
              <span className="text-[11px] text-slate-500 font-medium">
                {totalResults} items matching current options
              </span>
            </div>
          </div>
          <button
            onClick={closeFilterDrawer}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Close filters"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Filters Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs text-slate-800">
          {/* 1. Category Selector */}
          {categories.length > 0 && (
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers size={14} className="text-forest-700" />
                <span>Botanical Category</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleToggle('category', undefined)}
                  className={`px-3 py-1.5 rounded-xl border font-semibold transition-all ${
                    !filters.category
                      ? 'bg-forest-800 text-white border-forest-800 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  All Collections
                </button>
                {categories.map((cat) => {
                  const isSelected = filters.category === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleToggle('category', cat.slug)}
                      className={`px-3 py-1.5 rounded-xl border font-semibold transition-all ${
                        isSelected
                          ? 'bg-forest-800 text-white border-forest-800 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Price Range */}
          <div className="space-y-2.5 pt-1 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign size={14} className="text-emerald-700" />
              <span>Price Range (NPR)</span>
            </label>

            {/* Quick Presets */}
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: 'Under रू 500', min: undefined, max: 500 },
                { label: 'रू 500 – रू 1,500', min: 500, max: 1500 },
                { label: 'रू 1,500 – रू 3,000', min: 1500, max: 3000 },
                { label: 'Above रू 3,000', min: 3000, max: undefined },
              ].map((preset, idx) => {
                const isSelected = filters.minPrice === preset.min && filters.maxPrice === preset.max;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePricePreset(isSelected ? undefined : preset.min, isSelected ? undefined : preset.max)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-forest-800 bg-forest-50 text-forest-900 ring-1 ring-forest-800'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span>{preset.label}</span>
                    {isSelected && <Check size={12} className="text-forest-800" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Min / Max inputs */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Min Price (रू)</span>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice || ''}
                  onChange={(e) =>
                    onFilterChange({
                      ...filters,
                      minPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-forest-700"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Max Price (रू)</span>
                <input
                  type="number"
                  placeholder="10000"
                  value={filters.maxPrice || ''}
                  onChange={(e) =>
                    onFilterChange({
                      ...filters,
                      maxPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-forest-700"
                />
              </div>
            </div>
          </div>

          {/* 3. Availability & Curations (Toggles) */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Availability & Highlights
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleBooleanToggle('inStock')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  filters.inStock
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <PackageCheck size={16} className="text-emerald-600" />
                  In Stock Only (Ready for Valley Delivery)
                </span>
                {filters.inStock && <Check size={14} className="text-emerald-700" />}
              </button>

              <button
                type="button"
                onClick={() => handleBooleanToggle('isFeatured')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  filters.isFeatured
                    ? 'border-amber-600 bg-amber-50 text-amber-900'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Flame size={16} className="text-amber-600" />
                  Featured Botanicals
                </span>
                {filters.isFeatured && <Check size={14} className="text-amber-700" />}
              </button>

              <button
                type="button"
                onClick={() => handleBooleanToggle('isSeasonal')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  filters.isSeasonal
                    ? 'border-rose-600 bg-rose-50 text-rose-900'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Flower2 size={16} className="text-rose-600" />
                  Seasonal Blooms & Fresh Bouquets
                </span>
                {filters.isSeasonal && <Check size={14} className="text-rose-700" />}
              </button>
            </div>
          </div>

          {/* 4. Plant Size / Dimensions */}
          <div className="space-y-2.5 pt-1 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Ruler size={14} className="text-indigo-600" />
              <span>Plant & Pot Size</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { key: 'Small', label: 'Small (4" - 5" Pot)' },
                { key: 'Medium', label: 'Medium (6" - 8" Pot)' },
                { key: 'Large', label: 'Large (10"+ Planter)' },
                { key: 'Moss Pole', label: 'Moss Pole Climber' },
              ].map((sizeItem) => {
                const isSelected = filters.size === sizeItem.key;
                return (
                  <button
                    key={sizeItem.key}
                    type="button"
                    onClick={() => handleToggle('size', sizeItem.key)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-forest-800 bg-forest-50 text-forest-900 ring-1 ring-forest-800'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span>{sizeItem.label}</span>
                    {isSelected && <Check size={12} className="text-forest-800" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Sunlight Requirement */}
          <div className="space-y-2.5 pt-1 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sun size={14} className="text-amber-500" />
              <span>Sunlight Requirement</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { key: 'BRIGHT_INDIRECT', label: 'Bright Indirect Light' },
                { key: 'LOW_LIGHT', label: 'Low Light / Shade' },
                { key: 'MEDIUM_LIGHT', label: 'Medium Filtered' },
                { key: 'FULL_SUN', label: 'Full Sunshine' },
              ].map((item) => {
                const isSelected = filters.sunlight === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleToggle('sunlight', item.key)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-forest-800 bg-forest-50 text-forest-900 ring-1 ring-forest-800'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isSelected && <Check size={12} className="text-forest-800" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Watering Frequency */}
          <div className="space-y-2.5 pt-1 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Droplets size={14} className="text-sky-500" />
              <span>Watering Schedule</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { key: 'WEEKLY_ONCE', label: '1x / Week' },
                { key: 'WEEKLY_TWICE', label: '2x / Week' },
                { key: 'BIWEEKLY', label: 'Every 2 Wks' },
                { key: 'WHEN_DRY', label: 'When Topsoil Dry' },
              ].map((item) => {
                const isSelected = filters.watering === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleToggle('watering', item.key)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-forest-800 bg-forest-50 text-forest-900 ring-1 ring-forest-800'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isSelected && <Check size={12} className="text-forest-800" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 7. Special Attributes */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Health & Home Safety
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleBooleanToggle('petFriendly')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  filters.petFriendly
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  Pet Safe (100% Non-toxic for Dogs/Cats)
                </span>
                {filters.petFriendly && <Check size={14} className="text-emerald-700" />}
              </button>

              <button
                type="button"
                onClick={() => handleBooleanToggle('airPurifying')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  filters.airPurifying
                    ? 'border-teal-600 bg-teal-50 text-teal-900'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Wind size={16} className="text-teal-600" />
                  NASA-rated Air-Purifying
                </span>
                {filters.airPurifying && <Check size={14} className="text-teal-700" />}
              </button>
            </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 border-t border-slate-100 bg-sand-50 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onReset}
            className="p-3 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition-colors shrink-0"
            title="Reset all filters"
          >
            <RotateCcw size={16} />
          </button>
          <button
            type="button"
            onClick={closeFilterDrawer}
            className="flex-1 bg-forest-800 hover:bg-forest-900 text-white py-3 px-4 rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-colors text-center"
          >
            Show {totalResults} Results
          </button>
        </div>
      </div>
    </div>
  );
};
