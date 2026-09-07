import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { orderApi } from '../api/order.api';
import { 
  ShoppingBag, 
  MapPin, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  ArrowRight, 
  Truck, 
  Heart, 
  ShieldCheck,
  Building2,
  Phone,
  User,
  Mail
} from 'lucide-react';
import { PaymentMethod } from '../types/order';

export const CheckoutPage: React.FC = () => {
  const { items, subtotal, deliveryFee, total, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useUI();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phoneNumber || '');
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [deliveryCity, setDeliveryCity] = useState(user?.city || 'Kathmandu');
  const [deliveryArea, setDeliveryArea] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH_ON_DELIVERY');

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 text-center p-8 bg-white rounded-3xl border border-slate-200 space-y-4">
        <div className="w-14 h-14 rounded-full bg-forest-50 text-forest-700 flex items-center justify-center mx-auto">
          <ShoppingBag size={28} />
        </div>
        <h2 className="font-serif font-bold text-xl text-slate-800">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500">Add some plants or flowers to proceed to checkout.</p>
        <Link to="/catalog" className="inline-block bg-forest-800 text-white text-xs font-semibold px-5 py-2.5 rounded-xl">
          Explore Plants
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !customerPhone || !deliveryAddress) {
      showToast('Please fill in all required delivery contact fields', 'error');
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        customerName,
        customerEmail,
        customerPhone,
        deliveryAddress,
        deliveryCity,
        deliveryArea: deliveryArea || undefined,
        scheduledDeliveryDate: scheduledDate || undefined,
        giftMessage: giftMessage || undefined,
        deliveryNotes: deliveryNotes || undefined,
        paymentMethod,
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      };

      const createdOrder = await orderApi.createOrder(orderPayload);
      clearCart();
      showToast('🌿 Order confirmed! We are packaging your plants.', 'success');
      navigate(`/order-success/${createdOrder.id}`, { state: { order: createdOrder } });
    } catch (err: any) {
      showToast(err.message || 'Failed to place order. Please verify details.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-24 space-y-6">
      <div className="space-y-1">
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900">
          Plant & Flower Delivery Checkout
        </h1>
        <p className="text-xs text-slate-500">Secure dispatch across Kathmandu Valley</p>
      </div>

      {/* Checkout Steps Navigation (Mobile-first) */}
      <div className="flex items-center justify-between bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs max-w-2xl">
        {[
          { num: 1, label: 'Delivery' },
          { num: 2, label: 'Gifting & Schedule' },
          { num: 3, label: 'Payment' },
        ].map((s) => (
          <button
            key={s.num}
            type="button"
            onClick={() => setStep(s.num as any)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              step === s.num
                ? 'bg-forest-800 text-white'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === s.num ? 'bg-white text-forest-900' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {s.num}
            </span>
            <span className="hidden xs:inline">{s.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Multi-step Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Address & Contact */}
          {step === 1 && (
            <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-soft space-y-5 animate-in fade-in">
              <h2 className="font-serif font-bold text-lg text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <MapPin size={20} className="text-forest-700" />
                <span>1. Recipient & Delivery Address</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <User size={13} /> Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Recipient's Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-3 border border-slate-300 rounded-xl focus:border-forest-600 focus:ring-1 focus:ring-forest-600 outline-none text-base sm:text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <Phone size={13} /> Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+977-98XXXXXXXX"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-3 border border-slate-300 rounded-xl focus:border-forest-600 focus:ring-1 focus:ring-forest-600 outline-none text-base sm:text-xs"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <Mail size={13} /> Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    inputMode="email"
                    autoComplete="email"
                    placeholder="your@email.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3.5 py-3 border border-slate-300 rounded-xl focus:border-forest-600 focus:ring-1 focus:ring-forest-600 outline-none text-base sm:text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <Building2 size={13} /> City / Region *
                  </label>
                  <select
                    value={deliveryCity}
                    onChange={(e) => setDeliveryCity(e.target.value)}
                    className="w-full px-3.5 py-3 border border-slate-300 rounded-xl focus:border-forest-600 focus:ring-1 focus:ring-forest-600 outline-none bg-white font-medium text-base sm:text-xs min-h-[44px]"
                  >
                    <option value="Kathmandu">Kathmandu</option>
                    <option value="Lalitpur">Lalitpur</option>
                    <option value="Bhaktapur">Bhaktapur</option>
                    <option value="Pokhara">Pokhara</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Area / Neighborhood</label>
                  <input
                    type="text"
                    placeholder="e.g. Jhamsikhel, Baluwatar, Baneshwor"
                    value={deliveryArea}
                    onChange={(e) => setDeliveryArea(e.target.value)}
                    className="w-full px-3.5 py-3 border border-slate-300 rounded-xl focus:border-forest-600 focus:ring-1 focus:ring-forest-600 outline-none text-base sm:text-xs"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="font-bold text-slate-700">Street Address & Nearest Landmark *</label>
                  <textarea
                    required
                    rows={2}
                    autoComplete="street-address"
                    placeholder="House number, street name, opposite to bakery, etc."
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full px-3.5 py-3 border border-slate-300 rounded-xl focus:border-forest-600 focus:ring-1 focus:ring-forest-600 outline-none text-base sm:text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full sm:w-auto bg-forest-800 hover:bg-forest-900 active:scale-98 text-white font-bold text-xs py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm min-h-[44px]"
                >
                  <span>Continue to Gifting & Schedule</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Scheduled Date & Gift Card */}
          {step === 2 && (
            <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-soft space-y-5 animate-in fade-in">
              <h2 className="font-serif font-bold text-lg text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Calendar size={20} className="text-terracotta-600" />
                <span>2. Scheduled Delivery & Personal Gift Card</span>
              </h2>

              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Preferred Delivery Date (Optional):</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:border-forest-600 outline-none"
                  />
                  <p className="text-[11px] text-slate-500">
                    Leave blank for earliest standard same-day / next-day delivery.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Heart size={14} className="text-terracotta-600" />
                    <span>Handwritten Gift Message Card (Free):</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Wishing you prosperous growth and joy! - From Aarav"
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:border-forest-600 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Special Delivery Instructions:</label>
                  <input
                    type="text"
                    placeholder="e.g. Ring the bell twice, leave with security gate"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:border-forest-600 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-slate-600 font-bold hover:underline"
                >
                  ← Back to Address
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs py-3 px-6 rounded-xl flex items-center gap-2 transition-colors shadow-sm"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment Method */}
          {step === 3 && (
            <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-soft space-y-5 animate-in fade-in">
              <h2 className="font-serif font-bold text-lg text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <CreditCard size={20} className="text-forest-700" />
                <span>3. Select Payment Method</span>
              </h2>

              <div className="space-y-3">
                {[
                  {
                    id: 'CASH_ON_DELIVERY',
                    title: 'Cash on Delivery (COD)',
                    desc: 'Pay cash or Scan-to-Pay QR when your plants arrive safely at your door.',
                    badge: 'Most Popular',
                  },
                  {
                    id: 'ESEWA',
                    title: 'eSewa Mobile Wallet',
                    desc: 'Instant digital wallet payment verification.',
                    badge: 'Instant QR',
                  },
                  {
                    id: 'KHALTI',
                    title: 'Khalti Digital Wallet',
                    desc: 'Pay securely using Khalti balance or linked bank account.',
                    badge: 'Fast',
                  },
                  {
                    id: 'BANK_TRANSFER',
                    title: 'Direct Bank Fonepay / QR Transfer',
                    desc: 'Bank transfer via connectIPS / mobile banking.',
                    badge: null,
                  },
                ].map((pm) => {
                  const isSelected = paymentMethod === pm.id;
                  return (
                    <div
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id as any)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'border-forest-800 bg-forest-50/70 ring-1 ring-forest-800'
                          : 'border-slate-200 hover:border-forest-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-forest-800 bg-forest-800 text-white' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 text-xs sm:text-sm block">
                            {pm.title}
                          </span>
                          <p className="text-[11px] text-slate-500 mt-0.5">{pm.desc}</p>
                        </div>
                      </div>

                      {pm.badge && (
                        <span className="text-[10px] font-extrabold text-forest-800 bg-forest-100 px-2 py-0.5 rounded-full shrink-0">
                          {pm.badge}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs text-slate-600 font-bold hover:underline"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-emerald-600 to-forest-800 hover:from-emerald-700 hover:to-forest-900 text-white font-bold text-xs sm:text-sm py-3.5 px-8 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Confirming Order...</span>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      <span>Place Order (रू {total.toLocaleString()})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-soft space-y-4 sticky top-20">
          <h3 className="font-serif font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
            <span>Order Summary</span>
            <span className="text-xs text-slate-500 font-sans">{items.length} items</span>
          </h3>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3 text-xs items-center">
                <img
                  src={
                    item.product.images?.[0]?.url ||
                    'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=200&q=80'
                  }
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 truncate">{item.product.title}</h4>
                  <span className="text-[11px] text-forest-700 block truncate">{item.variant.name}</span>
                  <span className="text-[11px] text-slate-400">Qty: {item.quantity}</span>
                </div>
                <span className="font-bold text-slate-900 shrink-0">
                  रू {item.totalPrice.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-bold text-slate-900">रू {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Delivery Fee (Kathmandu):</span>
              <span className="font-bold text-slate-900">
                {deliveryFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `रू ${deliveryFee}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-serif font-bold text-forest-950 pt-2 border-t border-slate-100">
              <span>Total Payable:</span>
              <span className="text-forest-900">रू {total.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-forest-50 p-3 rounded-xl border border-forest-100 text-[11px] text-forest-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck size={14} className="text-forest-700" />
              <span>Plant Safe Packaging</span>
            </div>
            <p className="text-forest-700">
              Live foliage and fragile terracotta pots are protected with customized biodegradable shock-absorbing crates.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
