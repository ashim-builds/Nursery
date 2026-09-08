import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../api/order.api';
import { Package, Sprout, ChevronRight, Clock } from 'lucide-react';
import { formatOrderAmount, isGenericVariantName } from '../utils/orderDisplay';

export const OrdersPage: React.FC = () => {
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => orderApi.getMyOrders(1),
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 pb-24">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4">
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 flex items-center gap-2">
          <Package size={24} className="text-forest-700" />
          <span>Your Orders</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Track fulfillment status, view receipts, and scheduled Kathmandu deliveries.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-slate-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : ordersData?.orders?.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3 shadow-soft max-w-md mx-auto my-10">
          <div className="w-14 h-14 rounded-full bg-forest-50 text-forest-700 flex items-center justify-center mx-auto">
            <Sprout size={28} />
          </div>
          <h2 className="font-serif font-bold text-lg text-slate-800">No orders placed yet</h2>
          <p className="text-xs text-slate-500">Your garden begins with your first living plant!</p>
          <Link
            to="/catalog"
            className="inline-flex items-center bg-forest-800 text-white text-xs font-bold px-6 py-3 rounded-2xl min-h-[44px]"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {ordersData?.orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-4 shadow-xs hover:border-forest-200 transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 text-xs">
                <div>
                  <span className="font-bold font-mono text-slate-900 text-sm">{order.orderNumber}</span>
                  <span className="text-slate-400 block sm:inline sm:ml-2">
                    {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-forest-100 text-forest-800 font-bold px-3 py-1 rounded-full text-xs capitalize">
                    {order.orderStatus.toLowerCase().replace(/_/g, ' ')}
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    रू {formatOrderAmount(order.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Items summary */}
              <div className="space-y-1.5 text-xs text-slate-600">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <span className="truncate max-w-sm">
                      {item.productName || item.productTitle || 'Plant'}{!isGenericVariantName(item.variantName) && ` (${item.variantName})`} × {item.quantity}
                    </span>
                    <span className="font-semibold text-slate-800 shrink-0">
                      रू {formatOrderAmount(item.lineTotal ?? item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Paid via: <strong>{order.paymentMethod || 'Cash on Delivery'}</strong>
                </span>
                <Link
                  to={`/orders/${order.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-forest-700 hover:text-forest-900 min-h-[44px]"
                >
                  <span>Track Order</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
