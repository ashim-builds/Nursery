import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight, Truck, Sprout, ShieldCheck } from 'lucide-react';
import { isGenericVariantName } from '../utils/orderDisplay';

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
      <div className="max-w-md mx-auto my-16 text-center p-8 bg-white rounded-3xl border border-slate-200 space-y-4 shadow-soft">
        <div className="w-16 h-16 rounded-full bg-forest-50 text-forest-700 flex items-center justify-center mx-auto">
          <ShoppingBag size={32} />
        </div>
        <h1 className="font-serif font-bold text-2xl text-slate-800">Your Garden Cart is Empty</h1>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          Discover our vibrant indoor plants, exotic orchids, Sayapatri garlands, and handcrafted terracotta pots!
        </p>
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 bg-forest-800 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-sm hover:bg-forest-900 transition-all min-h-[44px]"
        >
          <span>Explore Plants</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900">
            Garden Cart
          </h1>
          <span className="text-xs text-slate-500">
            {itemCount} {itemCount === 1 ? 'botanical item' : 'botanical items'}
          </span>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:underline min-h-[44px] flex items-center"
        >
          Clear Cart
        </button>
      </div>

      {/* Free Delivery Bar */}
      <div className="bg-forest-900 text-white p-4 rounded-2xl shadow-soft space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="flex items-center gap-1.5">
            <Truck size={16} className="text-emerald-400" />
            {remainingForFree === 0 ? (
              <span className="text-emerald-300 font-bold">🎉 Free Delivery in Kathmandu Valley unlocked!</span>
            ) : (
              <span>Add <strong>रू {remainingForFree.toLocaleString()}</strong> more for Free Delivery</span>
            )}
          </span>
          <span>{progressPercent}%</span>
        </div>
        <div className="w-full bg-forest-950 rounded-full h-2 overflow-hidden">
          <div
            className="bg-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Item List */}
        <div className="lg:col-span-8 space-y-3.5">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-5 flex gap-4 items-center shadow-xs"
            >
              <Link
                to={`/products/${item.product.slug}`}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-forest-50 shrink-0"
              >
                <img
                  src={item.product.images?.[0]?.url || 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=300&q=80'}
                  alt={item.product.title}
                  className="w-full h-full object-cover"
                />
              </Link>

              <div className="flex-1 min-w-0 space-y-1">
                <Link to={`/products/${item.product.slug}`} className="block font-semibold text-xs sm:text-sm text-slate-900 hover:text-forest-800 truncate">
                  {item.product.title}
                </Link>
                {!isGenericVariantName(item.variant.name) && (
                  <span className="text-[11px] text-slate-500 block">Variant: {item.variant.name}</span>
                )}
                <span className="font-bold text-xs sm:text-sm text-forest-950 block">
                  रू {item.unitPrice.toLocaleString()}
                </span>
              </div>

              {/* Stepper Controls */}
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 shrink-0">
                <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 p-0.5">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="px-3 text-xs font-bold text-slate-900">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center"
                    aria-label="Increase quantity"
                  >
                    <Plus size={13} />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-soft">
          <h2 className="font-serif font-bold text-lg text-slate-900 border-b border-slate-100 pb-3">
            Order Summary
          </h2>

          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-bold text-slate-900">रू {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Kathmandu Valley Delivery</span>
              <span className="font-bold text-slate-900">
                {deliveryFee === 0 ? <span className="text-emerald-600">FREE</span> : `रू ${deliveryFee.toLocaleString()}`}
              </span>
            </div>
            <div className="border-t border-slate-100 pt-3 flex justify-between text-sm font-bold text-slate-900">
              <span>Estimated Total</span>
              <span className="text-base text-forest-950 font-serif">रू {total.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs sm:text-sm py-3.5 px-6 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all min-h-[48px]"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={16} />
          </button>

          <div className="pt-2 text-[11px] text-slate-400 text-center space-y-1">
            <p className="flex items-center justify-center gap-1">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Safe Plant Packaging Guarantee</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
