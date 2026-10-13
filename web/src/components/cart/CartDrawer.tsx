import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useUI } from '../../context/UIContext';
import {
  X,
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
import { isGenericVariantName } from '../../utils/orderDisplay';
import { OptimizedImage } from '../common/OptimizedImage';

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

  const handleQuickNavigate = (path: string) => {
    closeCartDrawer();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={closeCartDrawer}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-[min(100vw,28rem)] bg-[#fafbf9] shadow-2xl flex flex-col justify-between border-l border-forest-100">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200/80 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-forest-800 text-white flex items-center justify-center shadow-xs">
                <ShoppingBag size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif font-bold text-base sm:text-lg text-forest-950">
                    Your Garden Cart
                  </h2>
                  <span className="bg-forest-100 text-forest-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {itemCount}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  {itemCount === 1 ? '1 botanical item' : `${itemCount} botanical items`}
                </span>
              </div>
            </div>

            <button
              onClick={closeCartDrawer}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              aria-label="Close cart"
            >
              <X size={20} />
            </button>
          </div>

          {/* Free delivery progress bar */}
          <div className="bg-gradient-to-r from-[#0f241c] via-[#1b4332] to-[#0f241c] text-white px-4 py-3 text-xs shadow-inner">
            <div className="flex items-center justify-between mb-1.5 font-medium">
              <span className="flex items-center gap-1.5">
                <Truck size={14} className="text-emerald-400 shrink-0" />
                {remainingForFree === 0 ? (
                  <span className="text-emerald-300 font-bold flex items-center gap-1">
                    <Sparkles size={13} />
                    <span>Free Pokhara Delivery Unlocked!</span>
                  </span>
                ) : (
                  <span>
                    Add <strong className="text-emerald-300 font-bold">रू {remainingForFree.toLocaleString()}</strong> for Free Delivery
                  </span>
                )}
              </span>
              <span className="font-bold text-emerald-300">{progressPercent}%</span>
            </div>
            <div className="w-full bg-forest-950/80 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-5">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 shadow-inner">
                    <Leaf size={36} className="text-forest-600 animate-pulse" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-forest-800 text-white flex items-center justify-center border-2 border-white shadow-xs">
                    <ShoppingBag size={14} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-serif font-bold text-xl text-slate-800">Your Cart is Empty</h3>
                  <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                    Fill your home with lush indoor foliage, vibrant floral bouquets, and nursery essentials!
                  </p>
                </div>

                {/* Quick explore categories */}
                <div className="w-full pt-1 flex flex-wrap gap-1.5 justify-center">
                  <button
                    onClick={() => handleQuickNavigate('/catalog?category=indoor-plants')}
                    className="text-[11px] font-semibold bg-white hover:bg-forest-50 text-forest-800 border border-forest-200/80 px-3 py-1.5 rounded-full transition-colors"
                  >
                    🌿 Indoor Plants
                  </button>
                  <button
                    onClick={() => handleQuickNavigate('/bloom-patch')}
                    className="text-[11px] font-semibold bg-white hover:bg-forest-50 text-forest-800 border border-forest-200/80 px-3 py-1.5 rounded-full transition-colors"
                  >
                    🌸 Bloom Patch
                  </button>
                  <button
                    onClick={() => handleQuickNavigate('/catalog?category=pots-planters')}
                    className="text-[11px] font-semibold bg-white hover:bg-forest-50 text-forest-800 border border-forest-200/80 px-3 py-1.5 rounded-full transition-colors"
                  >
                    🪴 Pots & Planters
                  </button>
                </div>

                <button
                  onClick={() => handleQuickNavigate('/catalog')}
                  className="w-full bg-gradient-to-r from-forest-800 to-forest-900 hover:from-forest-900 hover:to-forest-950 text-white text-xs sm:text-sm font-semibold py-3 px-6 rounded-2xl shadow-md hover:shadow-lg inline-flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <span>Explore All Plants</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            ) : (
              items.map((item) => {
                const productTitle = item.product?.title || item.product?.name || 'Botanical Plant';
                const productSlug = item.product?.slug || '';
                const itemImg =
                  item.product?.images?.[0]?.url ||
                  (typeof item.product?.images?.[0] === 'string' ? item.product.images[0] : null) ||
                  'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=300&q=80';

                return (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:shadow-sm hover:border-forest-300 transition-all duration-200 group"
                  >
                    {/* Item Image */}
                    <Link
                      to={productSlug ? `/products/${productSlug}` : '#'}
                      onClick={closeCartDrawer}
                      className="w-18 h-18 sm:w-20 sm:h-20 aspect-square rounded-xl overflow-hidden bg-forest-50/50 border border-slate-100 shrink-0 relative block"
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
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <Link
                            to={productSlug ? `/products/${productSlug}` : '#'}
                            onClick={closeCartDrawer}
                            className="font-bold text-xs sm:text-sm text-slate-900 hover:text-forest-800 line-clamp-1 transition-colors"
                          >
                            {productTitle}
                          </Link>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded-lg transition-colors shrink-0"
                            title="Remove item"
                            aria-label="Remove item"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                        {item.variant && !isGenericVariantName(item.variant.name) && (
                          <span className="text-[10px] sm:text-[11px] font-semibold text-forest-700 bg-forest-50 border border-forest-100/80 px-2 py-0.5 rounded-md inline-block mt-0.5">
                            {item.variant.name}
                          </span>
                        )}
                      </div>

                      {/* Quantity & Total */}
                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100">
                        {/* Stepper Controls */}
                        <div className="flex items-center border border-slate-200/90 rounded-xl bg-slate-50/80 p-0.5 shadow-2xs">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center hover:bg-white hover:shadow-xs active:scale-90 text-slate-700 rounded-lg transition-all"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center hover:bg-white hover:shadow-xs active:scale-90 text-slate-700 rounded-lg transition-all"
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="font-serif font-bold text-xs sm:text-sm text-forest-950 block">
                            रू {item.totalPrice.toLocaleString()}
                          </span>
                          {item.quantity > 1 && (
                            <span className="text-[10px] text-slate-400 block">
                              रू {item.unitPrice.toLocaleString()} each
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout Summary */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200/80 bg-white space-y-3.5 safe-bottom shadow-lg">
              <div className="space-y-1.5 text-xs text-slate-600 bg-[#fbfcfb] p-3 rounded-2xl border border-forest-100/70">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Items Subtotal:</span>
                  <span className="font-bold text-slate-900">रू {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Delivery in Pokhara:</span>
                  <span className="font-bold">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md text-[11px] font-bold">
                        FREE
                      </span>
                    ) : (
                      <span className="text-slate-900">रू {deliveryFee.toLocaleString()}</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-sm font-bold text-forest-950 pt-2 border-t border-slate-200/60">
                  <span className="text-forest-900">Total Amount:</span>
                  <span className="font-serif text-lg text-forest-950">रू {total.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleCheckoutClick}
                  className="w-full bg-gradient-to-r from-forest-800 via-forest-900 to-[#143225] hover:from-forest-900 hover:to-forest-950 text-white py-3.5 px-5 rounded-2xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg flex items-center justify-between transition-all active:scale-[0.98]"
                >
                  <span className="flex items-center gap-1.5">
                    <span>Proceed to Checkout</span>
                  </span>
                  <div className="flex items-center gap-1 text-emerald-300">
                    <span>रू {total.toLocaleString()}</span>
                    <ArrowRight size={16} />
                  </div>
                </button>

                <div className="flex items-center justify-center gap-3 text-xs pt-1">
                  <Link
                    to="/cart"
                    onClick={closeCartDrawer}
                    className="text-forest-800 hover:text-forest-950 font-semibold text-[11px] underline underline-offset-2 transition-colors"
                  >
                    View detailed cart &amp; items
                  </Link>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={12} className="text-forest-600" />
                  <span>Plant Care &amp; Safe Box</span>
                </span>
                <span>&bull;</span>
                <span>eSewa / Khalti / COD</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
