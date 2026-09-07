import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../api/product.api';
import { Sprout, ArrowRight, Sparkles } from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: productApi.getCategories,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 pb-24">
      {/* Header */}
      <div className="space-y-1 text-center sm:text-left">
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900">
          Plant & Flower Categories
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Explore indoor foliage, festive blooms, exotic bonsai, pottery, and organic soils.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 bg-slate-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {categories?.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group relative bg-white rounded-3xl border border-forest-100 overflow-hidden shadow-soft hover:shadow-lifted hover:border-forest-300 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-forest-50/50">
                <img
                  src={cat.imageUrl || 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80'}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-3.5 sm:p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900 group-hover:text-forest-800 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Explore collection →
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-forest-50 group-hover:bg-forest-800 text-forest-800 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                  <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
