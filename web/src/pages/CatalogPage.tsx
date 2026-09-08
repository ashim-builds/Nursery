import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../api/product.api';
import { ProductCard } from '../components/product/ProductCard';
import { SEO } from '../components/common/SEO';
import { ArrowUpDown, X, Sprout, Search } from 'lucide-react';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') || searchParams.get('q') || undefined;
  const sortBy = searchParams.get('sortBy') || searchParams.get('sort') || 'popular';

  const [searchInput, setSearchInput] = useState(search || '');

  const { data, isLoading } = useQuery({
    queryKey: ['products-catalog-simple', search, sortBy],
    queryFn: () =>
      productApi.getProducts({
        search,
        sortBy: sortBy as any,
        limit: 50,
      }),
  });

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

  const handleClearSearch = () => {
    setSearchInput('');
    const params = new URLSearchParams(searchParams);
    params.delete('search');
    params.delete('q');
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5 pb-24">
      {/* Dynamic SEO Meta */}
      <SEO
        title={search ? `Search: "${search}" | KtmBotanica Shop` : 'Shop All Plants & Planters | KtmBotanica'}
        description="Browse our complete collection of healthy indoor plants, outdoor shrubs, flowers, and ceramic pots in Kathmandu."
        canonical="https://ktmbotanica.com/catalog"
      />

      {/* Header Title & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            {search ? `Search Results for "${search}"` : 'Shop Plants & Products'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Carefully grown indoor foliage, outdoor blooms, and handcrafted planters.
          </p>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search plant name, species..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-20 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 shadow-xs focus:outline-none focus:border-forest-700"
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
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

      {/* Simple Controls: Item Count & Sort Selector */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <span className="text-xs text-slate-600 font-semibold">
          {data?.products?.length || 0} Products
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
            <option value="popular">Most Popular</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {/* Product Grid (Responsive: 2-col on mobile, 4-col on desktop) */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-72 bg-slate-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : !data?.products || data.products.length === 0 ? (
        <div className="text-center py-16 space-y-3 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          <div className="w-14 h-14 bg-forest-50 text-forest-700 rounded-full flex items-center justify-center mx-auto">
            <Sprout size={28} />
          </div>
          <h3 className="font-serif font-bold text-lg text-slate-800">No products found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search ? `No results found for "${search}".` : 'No items currently in the catalog.'}
          </p>
          {search && (
            <button
              onClick={handleClearSearch}
              className="bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              Show All Products
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {data.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
