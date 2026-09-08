import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../api/product.api';
import { ProductCard } from '../components/product/ProductCard';
import { MobileFilterDrawer, FilterState } from '../components/filter/MobileFilterDrawer';
import { SEO } from '../components/common/SEO';
import { useUI } from '../context/UIContext';
import { Search, Sprout, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

const POPULAR_SEARCH_TAGS = [
  'Monstera',
  'Sayapatri',
  'Peace Lily',
  'Pothos',
  'Rose Bouquet',
  'Terracotta Planter',
  'Snake Plant',
  'Ficus Bonsai',
];

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { openFilterDrawer } = useUI();

  const query = searchParams.get('q') || searchParams.get('search') || '';
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
  const sortBy = searchParams.get('sortBy') || searchParams.get('sort') || 'relevance';

  const [searchTerm, setSearchTerm] = useState(query);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: [
      'search-products',
      query,
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
        search: query || undefined,
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchTerm.trim()) {
      params.set('q', searchTerm.trim());
      params.delete('search');
    } else {
      params.delete('q');
      params.delete('search');
    }
    setSearchParams(params);
  };

  const handleChipClick = (tag: string) => {
    setSearchTerm(tag);
    const params = new URLSearchParams(searchParams);
    params.set('q', tag);
    params.delete('search');
    setSearchParams(params);
  };

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

  const resetAllFilters = () => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    setSearchParams(params);
  };

  const seoTitle = query
    ? `Search Results for "${query}" | RJ Flowers Nursery`
    : 'Search Plants, Pots & Flowers | RJ Flowers';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5 pb-24">
      {/* Dynamic SEO Meta */}
      <SEO
        title={seoTitle}
        description={`Find healthy plants and planters matching ${query || 'flowers and greenery'} in Pokhara with local delivery.`}
        canonical={`https://rjflowers.com/search${query ? '?q=' + encodeURIComponent(query) : ''}`}
      />
      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto">
        <div className="relative flex items-center">
          <Search size={18} className="absolute left-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search plant name, SKU, species, care guides..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-24 py-3.5 bg-white border border-forest-200 rounded-2xl text-xs sm:text-sm text-slate-800 shadow-soft focus:outline-none focus:border-forest-700 min-h-[44px]"
            autoFocus
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                const params = new URLSearchParams(searchParams);
                params.delete('q');
                params.delete('search');
                setSearchParams(params);
              }}
              className="absolute right-16 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-2 bg-forest-800 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-forest-900 transition-colors shadow-xs"
          >
            Search
          </button>
        </div>
      </form>

      {/* Quick Suggestion Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar justify-start sm:justify-center py-1">
        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mr-1 shrink-0">
          Popular:
        </span>
        {POPULAR_SEARCH_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => handleChipClick(tag)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all whitespace-nowrap min-h-[34px] flex items-center shrink-0 ${
              query.toLowerCase() === tag.toLowerCase()
                ? 'bg-forest-800 text-white border-forest-800 font-bold shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:border-forest-400'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Action Bar: Filters trigger & Sort selector */}
      <div className="flex items-center justify-between gap-3 bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-xs">
        {/* Mobile Filter Button */}
        <button
          onClick={openFilterDrawer}
          className="flex items-center gap-2 bg-forest-50 hover:bg-forest-100 text-forest-900 px-3.5 py-2 rounded-xl text-xs font-bold border border-forest-200 transition-colors"
        >
          <SlidersHorizontal size={14} />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="bg-forest-800 text-white w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Results count */}
        <span className="text-xs text-slate-500 font-medium">
          {query ? (
            <span>
              Results for &ldquo;<strong className="text-slate-800">{query}</strong>&rdquo; ({searchResults?.products?.length || 0})
            </span>
          ) : (
            <span>Showing {searchResults?.products?.length || 0} plants</span>
          )}
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
            <option value="relevance">Best Relevance</option>
            <option value="popular">Most Popular</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest Intake</option>
          </select>
        </div>
      </div>

      {/* Results Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : searchResults?.products?.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3 shadow-soft max-w-md mx-auto my-6">
          <div className="w-14 h-14 rounded-full bg-forest-50 text-forest-700 flex items-center justify-center mx-auto">
            <Sprout size={28} />
          </div>
          <h3 className="font-serif font-bold text-lg text-slate-800">No botanical matches found</h3>
          <p className="text-xs text-slate-500">
            Try searching for &quot;Monstera&quot;, &quot;Peace Lily&quot;, &quot;Bouquet&quot;, or &quot;Planter&quot;.
          </p>
          <div className="flex justify-center gap-2 pt-1">
            <button
              onClick={resetAllFilters}
              className="bg-sand-100 hover:bg-sand-200 text-forest-900 text-xs font-bold px-4 py-2 rounded-xl transition-colors"
            >
              Reset Filters
            </button>
            <Link
              to="/catalog"
              className="bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {searchResults?.products?.map((product) => (
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
        totalResults={searchResults?.products?.length || 0}
      />
    </div>
  );
};
