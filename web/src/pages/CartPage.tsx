import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { OptimizedImage } from '../components/common/OptimizedImage';
import {
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Truck,
  Sparkles,
  ShieldCheck,
  Leaf,
  CheckCircle2,
} from 'lucide-react';
import { isGenericVariantName } from '../utils/orderDisplay';
import { SEO } from '../components/common/SEO';

export const CartPage: React.FC = () => {
  const {
    items,
    itemCount,
    subtotal,
    deliveryFee,
    total,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  const navigate = useNavigate();

  const freeDeliveryThreshold = 2000;
  const progressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));
  const remainingForFree = Math.max(0, freeDeliveryThreshold - subtotal);

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto my-12 sm:my-16 px-4 text-center">
        <SEO
          title="Garden Cart | The Bloom Patch Pokhara"
          description="Your garden cart is currently empty. Explore our collection of indoor plants and fresh floral bouquets."
          canonical={typeof window !== 'undefined' ? `${window.location.origin}/cart` : '/cart'}
        />

        <div className="bg-white rounded-3xl border border-forest-100 p-8 sm:p-10 shadow-soft space-y-6">
          <div className="relative mx-auto w-24 h-24">
            <div className="w-full h-full rounded-full bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 shadow-inner">
              <Leaf size={44} className="text-forest-600 animate-pulse" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-forest-800 text-white flex items-center justify-center border-2 border-white shadow-xs">
              <ShoppingBag size={16} />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900">
              Your Cart is Empty
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              Discover our lush indoor houseplants, handcrafted floral bouquets, and gardening pots!
            </p>
          </div>

          {/* Quick Categories */}
          <div className="flex flex-wrap gap-2 justify-center pt-1">
            <Link
              to="/catalog?category=indoor-plants"
              className="text-xs font-semibold bg-slate-50 hover:bg-forest-50 text-forest-900 border border-slate-200 px-3.5 py-2 rounded-full transition-colors"
            >
              🌿 Indoor Plants
            </Link>
            <Link
              to="/bloom-patch"
              className="text-xs font-semibold bg-slate-50 hover:bg-forest-50 text-forest-900 border border-slate-200 px-3.5 py-2 rounded-full transition-colors"
            >
              🌸 Bloom Patch Bouquets
            </Link>
            <Link
              to="/catalog?category=pots-planters"
              className="text-xs font-semibold bg-slate-50 hover:bg-forest-50 text-forest-900 border border-slate-200 px-3.5 py-2 rounded-full transition-colors"
            >
              🪴 Pots &amp; Planters
            </Link>
          </div>

          <div className="pt-2">
            <Link
              to="/catalog"
              className="w-full bg-gradient-to-r from-forest-800 via-forest-900 to-[#143225] hover:from-forest-900 hover:to-forest-950 text-white font-bold text-xs sm:text-sm py-3.5 px-8 rounded-2xl shadow-md hover:shadow-lg inline-flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <span>Explore Plant Catalog</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 pb-28">
      <SEO
        title={`Garden Cart (${itemCount}) | The Bloom Patch Pokhara`}
        description="Review your selected plants, bouquets, and garden accessories before checkout."
        canonical={typeof window !== 'undefined' ? `${window.location.origin}/cart` : '/cart'}
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-forest-800 text-white flex items-center justify-center shadow-xs">
            <ShoppingBag size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900">
                Garden Cart
              </h1>
              <span className="bg-forest-100 text-forest-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Review and manage your selected plants &amp; flowers
            </p>
          </div>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-xl transition-colors min-h-[40px] flex items-center gap-1.5"
        >
          <Trash2 size={14} />
          <span>Clear Cart</span>
        </button>
      </div>

      {/* Free Delivery Bar */}
      <div className="bg-gradient-to-r from-[#0f241c] via-[#1b4332] to-[#0f241c] text-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-soft space-y-2.5">
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
          <span className="flex items-center gap-2">
            <Truck size={18} className="text-emerald-400 shrink-0" />
            {remainingForFree === 0 ? (
              <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                <Sparkles size={15} />
                <span>🎉 Free Pokhara delivery unlocked!</span>
              </span>
            ) : (
              <span>
                Add <strong className="text-emerald-300">रू {remainingForFree.toLocaleString()}</strong> more to get Free Delivery in Pokhara!
              </span>
            )}
          </span>
          <span className="text-emerald-300 font-bold">{progressPercent}%</span>
        </div>
        <div className="w-full bg-forest-950/80 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Cart Item List */}
        <div className="lg:col-span-8 space-y-3.5">
          {items.map((item) => {
            const productTitle = item.product?.title || item.product?.name || 'Botanical Plant';
            const productSlug = item.product?.slug || '';
            const itemImg =
              item.product?.images?.[0]?.url ||
              (typeof item.product?.images?.[0] === 'string' ? item.product.images[0] : null) ||
              'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=300&q=80';

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-5 flex gap-4 items-center shadow-2xs hover:shadow-sm hover:border-forest-200 transition-all group"
              >
                {/* Product Thumbnail */}
                <Link
                  to={productSlug ? `/products/${productSlug}` : '#'}
                  className="w-20 h-20 sm:w-24 sm:h-24 aspect-square rounded-2xl overflow-hidden bg-forest-50/50 border border-slate-100 shrink-0 relative block"
                >
                  <OptimizedImage
                    src={itemImg}
                    alt={productTitle}
                    aspectRatio="square"
                    fit="cover"
                    className="w-full h-full"
                    imgClassName="group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1 sm:space-y-1.5">
                  <Link
                    to={productSlug ? `/products/${productSlug}` : '#'}
                    className="block font-bold text-xs sm:text-base text-slate-900 hover:text-forest-800 truncate transition-colors"
                  >
                    {productTitle}
                  </Link>

                  {item.variant && !isGenericVariantName(item.variant.name) && (
                    <span className="text-[11px] font-semibold text-forest-700 bg-forest-50 border border-forest-100/80 px-2 py-0.5 rounded-md inline-block">
                      {item.variant.name}
                    </span>
                  )}

                  <div className="flex items-baseline gap-2">
                    <span className="font-serif font-bold text-sm sm:text-base text-forest-950">
                      रू {item.totalPrice.toLocaleString()}
                    </span>
                    {item.quantity > 1 && (
                      <span className="text-[11px] text-slate-400">
                        (रू {item.unitPrice.toLocaleString()} each)
                      </span>
                    )}
                  </div>
                </div>

                {/* Stepper Controls & Delete */}
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2.5 sm:gap-4 shrink-0">
                  <div className="flex items-center border border-slate-200/90 rounded-xl bg-slate-50 p-0.5 shadow-2xs">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 sm:p-2 text-slate-600 hover:bg-white hover:shadow-xs active:scale-90 rounded-lg min-w-[32px] sm:min-w-[36px] min-h-[32px] sm:min-h-[36px] flex items-center justify-center transition-all"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="px-2.5 sm:px-3 text-xs sm:text-sm font-bold text-slate-900 min-w-[28px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 sm:p-2 text-slate-600 hover:bg-white hover:shadow-xs active:scale-90 rounded-lg min-w-[32px] sm:min-w-[36px] min-h-[32px] sm:min-h-[36px] flex items-center justify-center transition-all"
                      aria-label="Increase quantity"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    aria-label="Remove item"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 space-y-5 shadow-soft lg:sticky lg:top-24">
          <h2 className="font-serif font-bold text-lg sm:text-xl text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
            <span>Order Summary</span>
            <span className="text-xs font-sans text-forest-700 bg-forest-50 px-2.5 py-1 rounded-full font-semibold">
              {itemCount} Items
            </span>
          </h2>

          <div className="space-y-3 text-xs sm:text-sm text-slate-600">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Items Subtotal</span>
              <span className="font-bold text-slate-900">रू {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Pokhara Delivery</span>
              <span className="font-bold">
                {deliveryFee === 0 ? (
                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md text-xs font-bold">
                    FREE
                  </span>
                ) : (
                  <span className="text-slate-900">रू {deliveryFee.toLocaleString()}</span>
                )}
              </span>
            </div>
            <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline text-sm sm:text-base font-bold text-slate-900">
              <span className="text-forest-900">Estimated Total</span>
              <span className="text-lg sm:text-xl text-forest-950 font-serif">
                रू {total.toLocaleString()}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-gradient-to-r from-forest-800 via-forest-900 to-[#143225] hover:from-forest-900 hover:to-forest-950 text-white font-bold text-xs sm:text-sm py-3.5 px-6 rounded-2xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all min-h-[48px] active:scale-98"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={16} />
          </button>

          <div className="pt-2 text-[11px] text-slate-500 text-center space-y-2 border-t border-slate-100">
            <p className="flex items-center justify-center gap-1.5 text-forest-900 font-medium">
              <ShieldCheck size={15} className="text-emerald-600" />
              <span>Safe Plant Packaging Guarantee</span>
            </p>
            <p className="text-slate-400">
              Pay via eSewa, Khalti, Mobile Banking or Cash on Delivery
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
