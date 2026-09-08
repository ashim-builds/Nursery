import React from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../api/order.api';
import { CheckCircle2, Package, MapPin, Calendar, ArrowRight, Sprout, Phone } from 'lucide-react';
import { formatOrderAmount, isGenericVariantName } from '../utils/orderDisplay';

export const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const initialOrder = (location.state as any)?.order;

  const { data: order } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.getOrderById(id!),
    initialData: initialOrder,
    enabled: !!id,
  });

  if (!order) {
    return (
      <div className="max-w-md mx-auto my-16 text-center p-8 bg-white rounded-3xl border border-slate-200">
        <h2 className="font-serif font-bold text-xl text-slate-800">Order Information</h2>
        <p className="text-xs text-slate-500 mt-2">Loading your botanical dispatch details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 pb-20">
      {/* Success Hero */}
      <div className="bg-white rounded-3xl border border-forest-200 p-6 sm:p-8 text-center space-y-4 shadow-soft">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto animate-in zoom-in">
          <CheckCircle2 size={36} />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold text-forest-700 uppercase tracking-wider">
            Order Successfully Placed
          </span>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900">
            Thank You, {order.customerName.split(' ')[0]}!
          </h1>
          <p className="text-xs text-slate-500">
            Order Reference: <strong className="text-slate-800 font-mono">{order.orderNumber}</strong>
          </p>
        </div>

        <div className="p-4 bg-forest-50/80 rounded-2xl border border-forest-100/80 text-xs text-forest-900 max-w-lg mx-auto">
          🌿 Our nursery specialists in Sanepa are preparing your healthy plants with moisture seals for secure transit.
        </div>
      </div>

      {/* Order & Delivery Details */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-xs">
        <h3 className="font-serif font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
          Delivery & Payment Breakdown
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <MapPin size={13} className="text-forest-700" /> Delivery Address:
            </span>
            <p className="text-slate-800 font-medium leading-relaxed">
              {order.deliveryAddress}, {order.deliveryCity}
              {order.deliveryArea && ` (${order.deliveryArea})`}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Phone size={13} className="text-forest-700" /> Contact Phone:
            </span>
            <p className="text-slate-800 font-medium">{order.customerPhone}</p>
          </div>

          {order.scheduledDeliveryDate && (
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold flex items-center gap-1">
                <Calendar size={13} className="text-terracotta-600" /> Scheduled Date:
              </span>
              <p className="text-slate-800 font-medium">
                {new Date(order.scheduledDeliveryDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          )}

          <div className="space-y-1">
            <span className="text-slate-400 font-semibold">Payment Method:</span>
            <p className="text-slate-800 font-bold capitalize">
              {order.paymentMethod.replace(/_/g, ' ')} ({order.paymentStatus})
            </p>
          </div>
        </div>

        {order.giftMessage && (
          <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200/70 text-xs space-y-1">
            <span className="font-bold text-amber-900 block">Personal Gift Message:</span>
            <p className="italic text-amber-800">"{order.giftMessage}"</p>
          </div>
        )}

        {/* Ordered Items list */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-700 block">Ordered Items:</span>
          <div className="space-y-2">
            {order.items?.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-sand-50/60 rounded-xl border border-slate-200/60 text-xs"
              >
                <div>
                  <h4 className="font-semibold text-slate-900">{item.productName || item.productTitle || 'Plant'}</h4>
                  <span className="text-[11px] text-forest-700">
                    {!isGenericVariantName(item.variantName) && `${item.variantName} `}× {item.quantity}
                  </span>
                </div>
                <span className="font-bold text-slate-900">
                  रू {formatOrderAmount(item.lineTotal ?? item.totalPrice)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-sm font-bold text-slate-900">
          <span>Total Paid / Due:</span>
          <span className="font-serif text-lg text-forest-900">
            रू {formatOrderAmount(order.totalAmount)}
          </span>
        </div>
      </div>

      {/* Continue shopping button */}
      <div className="text-center">
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-2xl transition-all shadow-sm"
        >
          <Sprout size={16} />
          <span>Continue Plant Shopping</span>
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
};
