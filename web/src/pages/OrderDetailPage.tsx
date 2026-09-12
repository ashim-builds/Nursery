import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '../api/order.api';
import { useUI } from '../context/UIContext';
import {
  Package,
  Truck,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowLeft,
  XCircle,
  AlertCircle,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { formatOrderAmount, isGenericVariantName } from '../utils/orderDisplay';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { showToast, confirmAction } = useUI();
  const queryClient = useQueryClient();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order-detail', id],
    queryFn: () => orderApi.getOrderById(id!),
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: () => orderApi.cancelOrder(id!, 'Customer requested cancellation'),
    onSuccess: (data) => {
      showToast(data.message || 'Order cancelled successfully', 'info');
      queryClient.invalidateQueries({ queryKey: ['order-detail', id] });
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to cancel order', 'error');
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/3 animate-pulse" />
        <div className="h-48 bg-slate-100 rounded-3xl animate-pulse" />
        <div className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto my-16 text-center p-8 bg-white rounded-3xl border border-slate-200 space-y-4 shadow-soft">
        <AlertCircle size={32} className="mx-auto text-rose-500" />
        <h2 className="font-serif font-bold text-xl text-slate-800">Order Not Found</h2>
        <p className="text-xs text-slate-500">We couldn't retrieve the requested order information.</p>
        <Link to="/orders" className="inline-block bg-forest-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl min-h-[44px]">
          Back to Orders
        </Link>
      </div>
    );
  }

  const isCancellable = ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.status || (order as any).orderStatus);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 pb-24">
      {/* Back button */}
      <Link to="/orders" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-forest-800 min-h-[44px]">
        <ArrowLeft size={16} />
        <span>Back to Order History</span>
      </Link>

      {/* Header Info */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h1 className="font-serif font-bold text-xl sm:text-2xl text-slate-900 font-mono">
              {order.orderNumber}
            </h1>
            <span className="text-xs text-slate-400">
              Placed on {new Date(order.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-forest-100 text-forest-800 font-bold text-xs px-3.5 py-1.5 rounded-full capitalize">
              {order.status?.toLowerCase().replace(/_/g, ' ') || 'Confirmed'}
            </span>
          </div>
        </div>

        {/* Cancellation Button if eligible */}
        {isCancellable && (
          <div className="pt-2 flex justify-end">
            <button
              onClick={async () => {
                if (await confirmAction('Are you sure you want to cancel this order? Reserved items will be restored.', { title: 'Cancel order', confirmLabel: 'Cancel order' })) {
                  cancelMutation.mutate();
                }
              }}
              disabled={cancelMutation.isPending}
              className="text-xs font-semibold text-rose-600 hover:text-rose-800 min-h-[44px] flex items-center"
            >
              {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Order'}
            </button>
          </div>
        )}
      </div>

      {/* Delivery Tracking Snapshot */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-soft">
        <h2 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
          <Truck size={18} className="text-forest-700" />
          <span>Delivery Details</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="space-y-1">
            <span className="font-bold text-slate-800 block">Recipient</span>
            <p>{order.customerName}</p>
            <p>{order.customerPhone}</p>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-slate-800 block">Delivery Address</span>
            <p>{order.deliveryAddress || 'No street address'}</p>
            <p>{order.deliveryCity || 'Pokhara'}</p>
            {order.deliveryLatitude && order.deliveryLongitude && (
              <a
                href={`https://maps.google.com/?q=${Number(order.deliveryLatitude).toFixed(6)},${Number(order.deliveryLongitude).toFixed(6)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-800 font-bold mt-1"
              >
                <MapPin size={12} />
                <span>View Pinned Location on Map</span>
                <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>

        {order.scheduledDeliveryDate && (
          <div className="p-3 bg-forest-50/60 rounded-2xl border border-forest-200 flex items-center gap-2 text-xs text-forest-900">
            <Calendar size={16} className="text-forest-700 shrink-0" />
            <span>Scheduled Delivery: <strong>{new Date(order.scheduledDeliveryDate).toLocaleDateString()}</strong></span>
          </div>
        )}
      </div>

      {/* Items List */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-soft">
        <h2 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
          <Package size={18} className="text-forest-700" />
          <span>Items Ordered</span>
        </h2>

        <div className="divide-y divide-slate-100">
          {order.items?.map((item: any) => (
            <div key={item.id} className="py-3 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-900 block">
                  {item.productName || item.productTitle || 'Plant'}
                </span>
                <span className="text-slate-500 block">
                  {!isGenericVariantName(item.variantName) && `Variant: ${item.variantName} `}× {item.quantity}
                </span>
              </div>
              <span className="font-bold text-slate-900">
                रू {formatOrderAmount(item.lineTotal ?? item.totalPrice)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>रू {formatOrderAmount(order.subtotal)}</span>
          </div>
          {Number(order.discountAmount) > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Coupon Discount</span>
              <span>- रू {formatOrderAmount(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Delivery Charge</span>
            <span>{Number(order.deliveryFee) === 0 ? 'FREE' : `रू ${formatOrderAmount(order.deliveryFee)}`}</span>
          </div>
          <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-sm text-slate-900">
            <span>Grand Total</span>
            <span className="font-serif text-forest-950">रू {formatOrderAmount(order.totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
