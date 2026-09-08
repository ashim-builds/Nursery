import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../api/product.api';
import { ProductCard } from '../components/product/ProductCard';
import { SEO } from '../components/common/SEO';
import { ChevronRight, Sprout, Filter, ArrowUpDown } from 'lucide-react';

export const CategoryDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'popular'>('newest');

  const { data: categoryData, isLoading } = useQuery({
    queryKey: ['category-products', slug, sortBy],
    queryFn: () => productApi.getProducts({ category: slug, sortBy, limit: 24 }),
    enabled: !!slug,
  });

  const categoryName = slug
    ? slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    : 'Plants';

  const seoTitle = `${categoryName} Plants & Floral Arrangements — Shop Online | RJ Flowers`;
  const seoDescription = `Explore fresh ${categoryName.toLowerCase()} with home delivery across Pokhara from RJ Flowers Nursery.`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 pb-24">
      {/* Dynamic SEO Meta */}
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonical={`https://ktmbotanica.com/category/${slug}`}
      />

      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link to="/" className="hover:text-forest-800">Home</Link>
        <ChevronRight size={12} />
        <Link to="/categories" className="hover:text-forest-800">Categories</Link>
        <ChevronRight size={12} />
        <span className="font-semibold text-slate-900">{categoryName}</span>
      </div>

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900">
            {categoryName}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {categoryData?.meta?.total || 0} plants available for Pokhara delivery
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <ArrowUpDown size={14} className="text-slate-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-forest-600 min-h-[44px]"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : categoryData?.products?.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3 shadow-soft max-w-md mx-auto my-8">
          <div className="w-14 h-14 rounded-full bg-forest-50 text-forest-700 flex items-center justify-center mx-auto">
            <Sprout size={28} />
          </div>
          <h3 className="font-serif font-bold text-lg text-slate-800">No plants in this category</h3>
          <p className="text-xs text-slate-500">Check back soon as new seasonal specimens arrive weekly.</p>
          <Link to="/catalog" className="inline-flex items-center bg-forest-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl min-h-[44px]">
            Browse All Plants
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {categoryData?.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
