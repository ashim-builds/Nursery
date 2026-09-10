import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useUI } from '../../context/UIContext';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Truck, Sparkles } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { items, itemCount, subtotal, deliveryFee, total, updateQuantity, removeFromCart } = useCart();
  const { isCartDrawerOpen, closeCartDrawer } = useUI();
  const navigate = useNavigate();

  if (!isCartDrawerOpen) return null;

  const freeDeliveryThreshold = 2000;
  const progressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));
  const remainingForFree = Math.max(0, freeDeliveryThreshold - subtotal);

  const handleCheckoutClick = () => {
    closeCartDrawer();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={closeCartDrawer}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-[min(100vw,28rem)] bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-forest-50/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-forest-800 text-white flex items-center justify-center">
                <ShoppingBag size={18} />
              </div>
              <div>
                <h2 className="font-serif font-bold text-base sm:text-lg text-forest-950">
                  Your Garden Cart
                </h2>
                <span className="text-xs text-forest-600 font-medium">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'} selected
                </span>
              </div>
            </div>

            <button
              onClick={closeCartDrawer}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              aria-label="Close cart"
            >
              <X size={20} />
            </button>
          </div>

          {/* Free delivery progress bar */}
          <div className="bg-forest-900 text-white px-4 py-2.5 text-xs">
            <div className="flex items-center justify-between mb-1.5 font-medium">
              <span className="flex items-center gap-1.5">
                <Truck size={14} className="text-emerald-400" />
                {remainingForFree === 0 ? (
                  <span className="text-emerald-300 font-bold">🎉 Free Pokhara delivery unlocked!</span>
                ) : (
                  <span>Add <strong>रू {remainingForFree.toLocaleString()}</strong> for Free Delivery</span>
                )}
              </span>
              <span className="font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full bg-forest-950/80 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700">
                  <SproutIcon size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-lg text-slate-800">Your cart is empty</h3>
                  <p className="text-xs text-slate-500 max-w-xs">
                    Explore our lush collection of indoor plants, fresh sayapatri blooms, and artisan planters!
                  </p>
                </div>
                <button
                  onClick={() => {
                    closeCartDrawer();
                    navigate('/catalog');
                  }}
                  className="bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold px-5 py-2.5 rounded-full transition-colors"
                >
                  Start Plant Shopping
                </button>
              </div>
            ) : (
              items.map((item) => {
                const itemImg =
                  item.product.images?.[0]?.url ||
                  'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=300&q=80';

                return (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 bg-sand-50/70 border border-slate-200/80 rounded-2xl relative group"
                  >
                    {/* Item Image */}
                    <img
                      src={itemImg}
                      alt={item.product.title}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl shrink-0 border border-slate-200 bg-white"
                    />

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <Link
                            to={`/products/${item.product.slug}`}
                            onClick={closeCartDrawer}
                            className="font-semibold text-slate-900 text-xs sm:text-sm hover:text-forest-700 line-clamp-1 leading-tight"
                          >
                            {item.product.title}
                          </Link>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-slate-400 hover:text-rose-500 p-0.5"
                            title="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <span className="text-[11px] text-forest-700 font-medium block mt-0.5">
                          {item.variant.name}
                        </span>
                      </div>

                      {/* Quantity & Total */}
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200/60">
                        {/* Qty Controls */}
                        <div className="flex items-center border border-slate-300 rounded-lg bg-white">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-slate-100 text-slate-600 rounded-l-lg transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-slate-100 text-slate-600 rounded-r-lg transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <span className="font-bold text-xs sm:text-sm text-forest-950">
                          रू {item.totalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout Summary */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-white space-y-3 safe-bottom">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-900">रू {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery (Pokhara):</span>
                  <span className="font-semibold text-slate-900">
                    {deliveryFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `रू ${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-forest-950 pt-2 border-t border-slate-100">
                  <span>Total Amount:</span>
                  <span className="text-base text-forest-900">रू {total.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCheckoutClick}
                  className="flex-1 bg-gradient-to-r from-forest-800 to-forest-700 hover:from-forest-900 hover:to-forest-800 text-white py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              <p className="text-[10px] text-center text-slate-600">
                🔒 Safe Delivery Packaging • Cash on Delivery / Digital Wallets Accepted
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SproutIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 20h10" />
    <path d="M10 20c5.5-2.5.8-6.4 3-10" />
    <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4.1 5.5.8z" />
    <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
  </svg>
);
