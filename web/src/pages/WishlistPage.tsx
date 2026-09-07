import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistApi } from '../api/wishlist.api';
import { useUI } from '../context/UIContext';
import { Heart, Trash2, Sprout, ShoppingBag, ArrowRight } from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useUI();

  const { data: wishlistData, isLoading } = useQuery({
    queryKey: ['my-wishlist'],
    queryFn: () => wishlistApi.getWishlist(),
  });

  const removeMutation = useMutation({
    mutationFn: (productId: string) => wishlistApi.removeFromWishlist(productId),
    onSuccess: () => {
      showToast('Item removed from wishlist', 'info');
      queryClient.invalidateQueries({ queryKey: ['my-wishlist'] });
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 pb-24">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 flex items-center gap-2">
            <Heart size={24} className="text-terracotta-500 fill-terracotta-500" />
            <span>Saved Plants & Flowers</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {wishlistData?.items?.length || 0} plants in your personal botanical wishlist
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : wishlistData?.items?.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-soft max-w-md mx-auto my-12">
          <div className="w-16 h-16 rounded-full bg-forest-50 text-terracotta-500 flex items-center justify-center mx-auto">
            <Heart size={32} />
          </div>
          <h2 className="font-serif font-bold text-xl text-slate-800">Your Wishlist is Empty</h2>
          <p className="text-xs text-slate-500">
            Tap the heart icon on any plant or flower bouquet to save it for your next garden update!
          </p>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 bg-forest-800 text-white font-bold text-xs px-6 py-3 rounded-2xl min-h-[44px]"
          >
            <span>Browse Plants</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {wishlistData?.items?.map((item) => (
            <div
              key={item.wishlistItemId}
              className="bg-white rounded-3xl border border-forest-100 overflow-hidden shadow-soft flex flex-col justify-between"
            >
              <Link to={`/products/${item.slug}`} className="relative aspect-square block bg-forest-50/50">
                <img
                  src={item.imageUrl || 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80'}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    removeMutation.mutate(item.productId);
                  }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 text-rose-500 flex items-center justify-center shadow-xs min-h-[36px] min-w-[36px]"
                  title="Remove from wishlist"
                >
                  <Trash2 size={14} />
                </button>
              </Link>

              <div className="p-4 space-y-2">
                <Link to={`/products/${item.slug}`} className="block font-semibold text-xs sm:text-sm text-slate-900 truncate">
                  {item.name}
                </Link>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-forest-950">
                    रू {item.basePrice.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">
                    {item.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                <Link
                  to={`/products/${item.slug}`}
                  className="w-full bg-forest-50 hover:bg-forest-800 text-forest-800 hover:text-white text-xs font-bold py-2 rounded-xl text-center transition-colors block min-h-[40px] flex items-center justify-center"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
