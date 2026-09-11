import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { orderApi } from '../api/order.api';
import {
  ShoppingBag,
  MapPin,
  CreditCard,
  ArrowRight,
  Phone,
  User,
  Mail,
  Lock,
  CheckCircle,
  Truck,
  ShieldCheck,
} from 'lucide-react';
import { LocationPickerMap } from '../components/common/LocationPickerMap';

export const CheckoutPage: React.FC = () => {
  const { items, subtotal, deliveryFee, total, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useUI();
  const navigate = useNavigate();

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('Pokhara');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [latitude, setLatitude] = useState<number>(28.2096);
  const [longitude, setLongitude] = useState<number>(83.9595);
  const [hasMapSelected, setHasMapSelected] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill user data when authenticated
  useEffect(() => {
    if (user) {
      if (user.fullName) {
        setCustomerName(user.fullName.replace(/[^a-zA-Z\s\.\'-]/g, ''));
      }
      if (user.email) setCustomerEmail(user.email);
      if (user.phoneNumber) setCustomerPhone(user.phoneNumber);
    }
  }, [user]);

  // If not logged in, enforce sign-in
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-forest-100 text-forest-800 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <Lock size={30} />
        </div>
        <h2 className="font-serif font-bold text-2xl text-slate-900">Sign In to Complete Order</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Please log in or create an account to proceed with your order. This ensures accurate order
          tracking and live dispatch updates.
        </p>
        <div className="flex gap-3 pt-2">
          <Link
            to="/login"
            className="flex-1 bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs py-3 rounded-xl shadow-xs transition-colors text-center"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="flex-1 bg-forest-100 hover:bg-forest-200 text-forest-900 font-bold text-xs py-3 rounded-xl transition-colors text-center"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  // If cart is empty, redirect or prompt
  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-sand-100 text-slate-400 rounded-3xl flex items-center justify-center mx-auto">
          <ShoppingBag size={30} />
        </div>
        <h2 className="font-serif font-bold text-xl text-slate-800">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500">Add some plants or flowers to proceed to checkout.</p>
        <Link
          to="/catalog"
          className="inline-block bg-forest-800 text-white text-xs font-semibold px-5 py-2.5 rounded-xl"
        >
          Explore Plants
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Strict validation
    const nameRegex = /^[a-zA-Z\s\.\'-]+$/;
    if (!nameRegex.test(customerName.trim())) {
      showToast('Name must only contain letters and spaces (no numbers allowed)', 'error');
      return;
    }

    const phoneRegex = /^[9][0-9]{9}$/;
    if (!phoneRegex.test(customerPhone.trim())) {
      showToast('Phone number must be exactly 10 digits starting with 9 (e.g. 9841234567)', 'error');
      return;
    }

    if (!shippingAddress.trim()) {
      showToast('Please provide a delivery street address or landmark', 'error');
      return;
    }

    if (!hasMapSelected) {
      showToast('Please pin your location on the map for delivery accuracy', 'info');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        deliveryAddress: shippingAddress.trim(),
        deliveryCity: city.trim() || 'Pokhara',
        deliveryLatitude: latitude,
        deliveryLongitude: longitude,
        deliveryNotes: deliveryNotes.trim() || undefined,
        paymentMethod: 'CASH' as const,
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      };

      const res = await orderApi.createOrder(orderPayload as any);
      clearCart();
      showToast('Order confirmed! We are preparing your fresh plants.', 'success');
      navigate(`/order-success/${res.id || res.orderNumber}`);
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Failed to place order. Please check your details.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900">Checkout</h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete your order for fast delivery across Pokhara and nearby areas.
        </p>
      </div>

      <form
        onSubmit={handlePlaceOrder}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
      >
        {/* Left Column: Delivery & Contact Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-soft space-y-5">
            <h2 className="font-serif font-bold text-lg text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin size={20} className="text-forest-700" />
              <span>Recipient & Delivery Address</span>
            </h2>

            {/* Recipient details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center gap-1">
                  <User size={13} /> Full Name *
                </label>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="e.g. Ramesh Shrestha"
                  value={customerName}
                  onChange={(e) => {
                    // Strict letters only filter - immediately strips any numbers/symbols
                    const filtered = e.target.value.replace(/[^a-zA-Z\s\.\'-]/g, '');
                    setCustomerName(filtered);
                  }}
                  className="w-full px-3.5 py-3 border border-slate-300 rounded-xl focus:border-forest-600 focus:ring-1 focus:ring-forest-600 outline-none text-base sm:text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center gap-1">
                  <Phone size={13} /> Phone Number * (10 digits starting with 9)
                </label>
                <input
                  type="tel"
                  required
                  autoComplete="tel"
                  maxLength={10}
                  placeholder="98XXXXXXXX"
                  value={customerPhone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setCustomerPhone(val);
                  }}
                  className="w-full px-3.5 py-3 border border-slate-300 rounded-xl focus:border-forest-600 focus:ring-1 focus:ring-forest-600 outline-none text-base sm:text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <Mail size={13} /> Email Address *
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="ramesh@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3.5 py-3 border border-slate-300 rounded-xl focus:border-forest-600 focus:ring-1 focus:ring-forest-600 outline-none text-base sm:text-xs"
              />
            </div>

            {/* Interactive Map Picker with Auto-Fill */}
            <div className="pt-2 border-t border-slate-100">
              <LocationPickerMap
                latitude={latitude}
                longitude={longitude}
                onChange={(coords) => {
                  setLatitude(coords.latitude);
                  setLongitude(coords.longitude);
                  setHasMapSelected(true);
                  setShippingAddress('');
                  setCity('');
                }}
                onAddressFound={(addr) => {
              <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                <label className="space-y-1">
                  <span className="font-semibold text-slate-600">Latitude</span>
                  <input
                    value={latitude.toFixed(6)}
                    readOnly
                    aria-label="Selected latitude"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-slate-700"
                  />
                </label>
                <label className="space-y-1">
                  <span className="font-semibold text-slate-600">Longitude</span>
                  <input
                    value={longitude.toFixed(6)}
                    readOnly
                    aria-label="Selected longitude"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-slate-700"
                  />
                </label>
              </div>
                  if (addr.formatted || addr.street) {
                    setShippingAddress(addr.formatted || addr.street);
                  }
                  if (addr.city) {
                    setCity(addr.city);
                  }
                }}
              />
            </div>

            {/* Payment Method Banner (Default COD) */}
            <div className="p-4 rounded-2xl border border-forest-800 bg-forest-50/60 shadow-xs space-y-1 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <CreditCard size={16} className="text-forest-700" />
                <span>Payment: Cash on Delivery (COD)</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Pay upon receiving your healthy plants at your doorstep via Cash or Fonepay QR scan.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-soft space-y-5 sticky top-24">
          <h2 className="font-serif font-bold text-lg text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
            <span>Order Summary</span>
            <span className="text-xs text-slate-500 font-sans">{items.length} items</span>
          </h2>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1 text-xs">
            {items.map((item) => (
              <div key={item.variantId} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src={
                      item.product?.images?.[0]?.url ||
                      'https://images.unsplash.com/photo-1545241047-6083a3684587?w=100'
                    }
                    alt={item.product?.title || 'Product'}
                    className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                  />
                  <div>
                    <span className="font-semibold text-slate-800 line-clamp-1">
                      {item.product?.title}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {item.variant?.name} × {item.quantity}
                    </span>
                  </div>
                </div>
                <span className="font-bold text-slate-900 shrink-0">
                  रू {(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>रू {subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Valley Delivery Fee:</span>
              <span>
                {deliveryFee === 0 ? (
                  <span className="text-emerald-700 font-bold">FREE</span>
                ) : (
                  `रू ${deliveryFee}`
                )}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold text-forest-950 pt-2 border-t border-slate-200">
              <span>Total Amount:</span>
              <span>रू {total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm py-4 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
          >
            <span>
              {isSubmitting
                ? 'Placing Order...'
                : `Confirm Order • रू ${total.toLocaleString('en-IN')}`}
            </span>
            <ArrowRight size={16} />
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-1">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Moisture-sealed packaging guaranteed</span>
          </div>
        </div>
      </form>
    </div>
  );
};
