import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../api/product.api';
import { ProductCard } from '../components/product/ProductCard';
import { MobileFilterDrawer, FilterState } from '../components/filter/MobileFilterDrawer';
import { SEO } from '../components/common/SEO';
import { useUI } from '../context/UIContext';
import { SlidersHorizontal, ArrowUpDown, X, Sprout, Search } from 'lucide-react';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { openFilterDrawer } = useUI();

  // Extract filter parameters from URL
  const search = searchParams.get('search') || searchParams.get('q') || undefined;
  const category = searchParams.get('category') || undefined;
  const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
  const inStock = searchParams.get('inStock') === 'true';
  const isFeatured = searchParams.get('isFeatured') === 'true';
  const isSeasonal = searchParams.get('isSeasonal') === 'true';
  const size = searchParams.get('size') || undefined;
  const sunlight = searchParams.get('sunlight') || undefined;
  const watering = searchParams.get('watering') || undefined;
  const difficulty = searchParams.get('difficulty') || undefined;
  const petFriendly = searchParams.get('petFriendly') === 'true';
  const airPurifying = searchParams.get('airPurifying') === 'true';
  const sortBy = searchParams.get('sortBy') || searchParams.get('sort') || (search ? 'relevance' : 'popular');

  const [searchInput, setSearchInput] = useState(search || '');

  const { data, isLoading } = useQuery({
    queryKey: [
      'products-catalog',
      search,
      category,
      minPrice,
      maxPrice,
      inStock,
      isFeatured,
      isSeasonal,
      size,
      sunlight,
      watering,
      difficulty,
      petFriendly,
      airPurifying,
      sortBy,
    ],
    queryFn: () =>
      productApi.getProducts({
        search,
        category,
        minPrice,
        maxPrice,
        inStock: inStock ? true : undefined,
        isFeatured: isFeatured ? true : undefined,
        isSeasonal: isSeasonal ? true : undefined,
        size,
        sunlight,
        watering,
        difficulty,
        petFriendly: petFriendly ? true : undefined,
        airPurifying: airPurifying ? true : undefined,
        sortBy: sortBy as any,
        limit: 30,
      }),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: productApi.getCategories,
  });

  // Calculate active filters count
  const activeFiltersCount = [
    category,
    minPrice !== undefined || maxPrice !== undefined,
    inStock,
    isFeatured,
    isSeasonal,
    size,
    sunlight,
    watering,
    difficulty,
    petFriendly,
    airPurifying,
  ].filter(Boolean).length;

  const updateFilters = (newFilters: FilterState) => {
    const params = new URLSearchParams(searchParams);
    Object.keys(newFilters).forEach((key) => {
      const val = (newFilters as any)[key];
      if (val !== undefined && val !== null && val !== '') {
        params.set(key, String(val));
      } else {
        params.delete(key);
      }
    });
    setSearchParams(params);
  };

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams);
    params.delete(key);
    setSearchParams(params);
  };

  const resetAllFilters = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    setSearchParams(params);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      params.set('search', searchInput.trim());
      params.delete('q');
    } else {
      params.delete('search');
      params.delete('q');
    }
    setSearchParams(params);
  };

  const seoTitle = search
    ? `Search Results for "${search}" | KtmBotanica Nursery`
    : category
    ? `${category.replace(/-/g, ' ').toUpperCase()} Plants & Planters | KtmBotanica Nursery`
    : `Shop Live Plants, Exotic Bonsai & Pots | KtmBotanica Nursery Kathmandu`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5 pb-24">
      {/* Dynamic SEO Meta */}
      <SEO
        title={seoTitle}
        description="Explore 100+ healthy live indoor & outdoor plants, fresh Kathmandu flower bouquets, and handmade terracotta planters at KtmBotanica."
        canonical="https://ktmbotanica.com/catalog"
      />
      {/* Search & Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            {search ? `Search Results for "${search}"` : 'Botanical Nursery Catalog'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Discover lush live plants, seasonal blossoms, handcrafted planters, and soil nutrients.
          </p>
        </div>

        {/* Inline Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search plant name, SKU, species..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-20 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 shadow-xs focus:outline-none focus:border-forest-700"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                const params = new URLSearchParams(searchParams);
                params.delete('search');
                params.delete('q');
                setSearchParams(params);
              }}
              className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-forest-800 text-white font-bold text-[11px] px-2.5 py-1.5 rounded-lg hover:bg-forest-900 transition-colors"
          >
            Find
          </button>
        </form>
      </div>

      {/* Category Horizontal Pills (Touch scrollable) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => removeFilter('category')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
            !category
              ? 'bg-forest-800 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Plants & Floral
        </button>
        {categories?.map((cat) => {
          const isSelected = category === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set('category', cat.slug);
                setSearchParams(params);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                isSelected
                  ? 'bg-forest-800 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Action Bar: Filters trigger button & Sort dropdown */}
      <div className="flex items-center justify-between gap-3 bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-xs">
        {/* Mobile / Desktop Filter Button */}
        <button
          onClick={openFilterDrawer}
          className="flex items-center gap-2 bg-forest-50 hover:bg-forest-100 text-forest-900 px-3.5 py-2 rounded-xl text-xs font-bold border border-forest-200 transition-colors"
        >
          <SlidersHorizontal size={14} />
          <span>Filter Products</span>
          {activeFiltersCount > 0 && (
            <span className="bg-forest-800 text-white w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Results counter */}
        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          Showing {data?.products.length || 0} matching items
        </span>

        {/* Sort Selector */}
        <div className="flex items-center gap-1.5 text-xs">
          <ArrowUpDown size={14} className="text-slate-400 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => {
              const params = new URLSearchParams(searchParams);
              params.set('sortBy', e.target.value);
              setSearchParams(params);
            }}
            className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer text-xs pr-2"
          >
            {search && <option value="relevance">Best Relevance</option>}
            <option value="popular">Most Popular</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest Intake</option>
          </select>
        </div>
      </div>

      {/* Active Filter Tags */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-500 font-medium">Applied:</span>
          {category && (
            <button
              onClick={() => removeFilter('category')}
              className="inline-flex items-center gap-1 bg-forest-50 text-forest-900 border border-forest-200 px-2.5 py-0.5 rounded-full"
            >
              <span>Category: {category}</span>
              <X size={12} />
            </button>
          )}
          {(minPrice !== undefined || maxPrice !== undefined) && (
            <button
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.delete('minPrice');
                params.delete('maxPrice');
                setSearchParams(params);
              }}
              className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-0.5 rounded-full"
            >
              <span>रू {minPrice || 0} – रू {maxPrice || '∞'}</span>
              <X size={12} />
            </button>
          )}
          {inStock && (
            <button
              onClick={() => removeFilter('inStock')}
              className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-0.5 rounded-full"
            >
              <span>In Stock Only</span>
              <X size={12} />
            </button>
          )}
          {isFeatured && (
            <button
              onClick={() => removeFilter('isFeatured')}
              className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-full"
            >
              <span>Featured</span>
              <X size={12} />
            </button>
          )}
          {isSeasonal && (
            <button
              onClick={() => removeFilter('isSeasonal')}
              className="inline-flex items-center gap-1 bg-rose-50 text-rose-900 border border-rose-200 px-2.5 py-0.5 rounded-full"
            >
              <span>Seasonal</span>
              <X size={12} />
            </button>
          )}
          {size && (
            <button
              onClick={() => removeFilter('size')}
              className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-900 border border-indigo-200 px-2.5 py-0.5 rounded-full"
            >
              <span>Size: {size}</span>
              <X size={12} />
            </button>
          )}
          {sunlight && (
            <button
              onClick={() => removeFilter('sunlight')}
              className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-full"
            >
              <span>{sunlight.replace(/_/g, ' ')}</span>
              <X size={12} />
            </button>
          )}
          {watering && (
            <button
              onClick={() => removeFilter('watering')}
              className="inline-flex items-center gap-1 bg-sky-50 text-sky-900 border border-sky-200 px-2.5 py-0.5 rounded-full"
            >
              <span>{watering.replace(/_/g, ' ')}</span>
              <X size={12} />
            </button>
          )}
          {petFriendly && (
            <button
              onClick={() => removeFilter('petFriendly')}
              className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-0.5 rounded-full"
            >
              <span>Pet Friendly</span>
              <X size={12} />
            </button>
          )}
          {airPurifying && (
            <button
              onClick={() => removeFilter('airPurifying')}
              className="inline-flex items-center gap-1 bg-teal-50 text-teal-900 border border-teal-200 px-2.5 py-0.5 rounded-full"
            >
              <span>Air Purifier</span>
              <X size={12} />
            </button>
          )}
          <button
            onClick={resetAllFilters}
            className="text-xs text-rose-600 hover:underline font-bold ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Product Grid (2-column on mobile, 3-4 on tablet/desktop) */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-72 bg-slate-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : data?.products.length === 0 ? (
        <div className="text-center py-16 space-y-3 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          <div className="w-14 h-14 bg-forest-50 text-forest-700 rounded-full flex items-center justify-center mx-auto">
            <Sprout size={28} />
          </div>
          <h3 className="font-serif font-bold text-lg text-slate-800">No botanical matches found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try searching for broader keywords like &quot;Monstera&quot;, &quot;Bouquet&quot;, &quot;Pot&quot; or clearing active filters.
          </p>
          <button
            onClick={resetAllFilters}
            className="bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {data?.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Mobile-friendly Bottom Sheet Filter Drawer */}
      <MobileFilterDrawer
        filters={{
          category,
          minPrice,
          maxPrice,
          inStock,
          isFeatured,
          isSeasonal,
          size,
          sunlight,
          watering,
          difficulty,
          petFriendly,
          airPurifying,
          sortBy,
        }}
        categories={categories}
        onFilterChange={updateFilters}
        onReset={resetAllFilters}
        totalResults={data?.products.length || 0}
      />
    </div>
  );
};
