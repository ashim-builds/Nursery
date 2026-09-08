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
  Layers,
  PackageCheck,
  Flame,
  Flower2,
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
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-150">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={closeFilterDrawer}
      />

      {/* Normal Compact Filter Drawer / Sheet */}
      <div className="fixed inset-x-0 bottom-0 sm:inset-y-0 sm:right-0 sm:left-auto max-h-[85vh] sm:max-h-full w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-none shadow-xl flex flex-col z-50 overflow-hidden text-xs">
        {/* Mobile handle indicator */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-emerald-700" />
            <span className="font-semibold text-slate-900 text-sm">Filters</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {totalResults} items
            </span>
          </div>
          <button
            onClick={closeFilterDrawer}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors"
            aria-label="Close filters"
          >
            <X size={18} />
          </button>
        </div>

        {/* Normal Compact Filter Form */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 1. Quick Badges & Availability */}
          <div className="space-y-1.5">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
              Quick Highlights
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleBooleanToggle('inStock')}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
                  filters.inStock
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                }`}
              >
                <PackageCheck size={13} className={filters.inStock ? 'text-emerald-700' : 'text-slate-400'} />
                <span>In Stock</span>
                {filters.inStock && <Check size={12} />}
              </button>

              <button
                type="button"
                onClick={() => handleBooleanToggle('isFeatured')}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
                  filters.isFeatured
                    ? 'border-amber-600 bg-amber-50 text-amber-800 font-semibold'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                }`}
              >
                <Flame size={13} className={filters.isFeatured ? 'text-amber-600' : 'text-slate-400'} />
                <span>Featured</span>
                {filters.isFeatured && <Check size={12} />}
              </button>

              <button
                type="button"
                onClick={() => handleBooleanToggle('isSeasonal')}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
                  filters.isSeasonal
                    ? 'border-rose-600 bg-rose-50 text-rose-800 font-semibold'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                }`}
              >
                <Flower2 size={13} className={filters.isSeasonal ? 'text-rose-600' : 'text-slate-400'} />
                <span>Seasonal</span>
                {filters.isSeasonal && <Check size={12} />}
              </button>

              <button
                type="button"
                onClick={() => handleBooleanToggle('petFriendly')}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
                  filters.petFriendly
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                }`}
              >
                <ShieldCheck size={13} className={filters.petFriendly ? 'text-emerald-600' : 'text-slate-400'} />
                <span>Pet Safe</span>
                {filters.petFriendly && <Check size={12} />}
              </button>

              <button
                type="button"
                onClick={() => handleBooleanToggle('airPurifying')}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
                  filters.airPurifying
                    ? 'border-teal-600 bg-teal-50 text-teal-800 font-semibold'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                }`}
              >
                <Wind size={13} className={filters.airPurifying ? 'text-teal-600' : 'text-slate-400'} />
                <span>Air Purifier</span>
                {filters.airPurifying && <Check size={12} />}
              </button>
            </div>
          </div>

          {/* 2. Categories */}
          {categories.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Layers size={12} className="text-forest-700" />
                <span>Category</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleToggle('category', undefined)}
                  className={`px-2.5 py-1 rounded-md border transition-all ${
                    !filters.category
                      ? 'bg-forest-800 text-white border-forest-800 font-medium'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => {
                  const isSelected = filters.category === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleToggle('category', cat.slug)}
                      className={`px-2.5 py-1 rounded-md border transition-all ${
                        isSelected
                          ? 'bg-forest-800 text-white border-forest-800 font-medium'
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

          {/* 3. Price Range (NPR) */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
              Price Range (NPR)
            </span>

            {/* Quick Price Chips */}
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: '< रू 500', min: undefined, max: 500 },
                { label: 'रू 500–1,500', min: 500, max: 1500 },
                { label: 'रू 1,500–3,000', min: 1500, max: 3000 },
                { label: '> रू 3,000', min: 3000, max: undefined },
              ].map((preset, idx) => {
                const isSelected = filters.minPrice === preset.min && filters.maxPrice === preset.max;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      handlePricePreset(
                        isSelected ? undefined : preset.min,
                        isSelected ? undefined : preset.max
                      )
                    }
                    className={`px-2 py-1.5 rounded-lg border text-center transition-all ${
                      isSelected
                        ? 'border-forest-800 bg-forest-50 text-forest-900 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Range Inputs */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Min (रू)"
                  value={filters.minPrice || ''}
                  onChange={(e) =>
                    onFilterChange({
                      ...filters,
                      minPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-forest-700"
                />
              </div>
              <span className="text-slate-400 font-medium">—</span>
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Max (रू)"
                  value={filters.maxPrice || ''}
                  onChange={(e) =>
                    onFilterChange({
                      ...filters,
                      maxPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-forest-700"
                />
              </div>
            </div>
          </div>

          {/* 4. Sunlight Requirements */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Sun size={12} className="text-amber-500" />
              <span>Sunlight</span>
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { key: 'BRIGHT_INDIRECT', label: 'Bright Indirect' },
                { key: 'LOW_LIGHT', label: 'Low Light / Shade' },
                { key: 'MEDIUM_LIGHT', label: 'Medium Light' },
                { key: 'FULL_SUN', label: 'Full Sunshine' },
              ].map((item) => {
                const isSelected = filters.sunlight === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleToggle('sunlight', item.key)}
                    className={`px-2 py-1.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-forest-800 bg-forest-50 text-forest-900 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="truncate">{item.label}</span>
                    {isSelected && <Check size={11} className="text-forest-800 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Watering Schedule */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Droplets size={12} className="text-sky-500" />
              <span>Watering Schedule</span>
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { key: 'WEEKLY_ONCE', label: '1x / Week' },
                { key: 'WEEKLY_TWICE', label: '2x / Week' },
                { key: 'BIWEEKLY', label: 'Every 2 Weeks' },
                { key: 'WHEN_DRY', label: 'When Dry' },
              ].map((item) => {
                const isSelected = filters.watering === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleToggle('watering', item.key)}
                    className={`px-2 py-1.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-forest-800 bg-forest-50 text-forest-900 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="truncate">{item.label}</span>
                    {isSelected && <Check size={11} className="text-forest-800 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Clean Compact Action Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onReset}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors shrink-0"
            title="Reset filters"
          >
            <RotateCcw size={15} />
          </button>
          <button
            type="button"
            onClick={closeFilterDrawer}
            className="flex-1 bg-forest-800 hover:bg-forest-900 text-white py-2.5 px-4 rounded-lg font-bold text-xs shadow-xs transition-colors text-center"
          >
            Show {totalResults} Results
          </button>
        </div>
      </div>
    </div>
  );
};
