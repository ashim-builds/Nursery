import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin.api';
import { useUI } from '../../context/UIContext';
import { OrderStatus } from '../../types/order';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  RotateCw,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  XCircle,
  Calendar,
  ChevronRight,
} from 'lucide-react';

const STATUS_FILTERS = [
  'ALL',
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
];

export const AdminOrdersPage: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { showToast } = useUI();
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-orders-list', selectedStatus, search, page],
    queryFn: () =>
      adminApi.getAllOrders({
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
        search: search.trim() || undefined,
        page,
        limit: 20,
      }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      adminApi.updateOrderStatus(orderId, { orderStatus: status }),
    onSuccess: () => {
      showToast('Order status updated successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-orders-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to update order status', 'error');
    },
  });

  const getStatusBadge = (status: OrderStatus | string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CONFIRMED':
      case 'PROCESSING':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'READY':
      case 'OUT_FOR_DELIVERY':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'DELIVERED':
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShoppingBag className="text-forest-700" size={28} />
            <span>Orders & Dispatch Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review live order requests, assign riders, change statuses, and track deliveries.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors shadow-xs"
        >
          <RotateCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by order #, customer name, phone, city..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-forest-700"
            />
          </div>
        </div>

        {/* Status Pills Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {STATUS_FILTERS.map((st) => (
            <button
              key={st}
              onClick={() => {
                setSelectedStatus(st);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedStatus === st
                  ? 'bg-forest-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!data?.orders || data.orders.length === 0) && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <ShoppingBag size={40} className="mx-auto text-slate-300" />
          <h3 className="font-serif font-bold text-lg text-slate-800">No Orders Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No orders match the selected filters or search keyword.
          </p>
        </div>
      )}

      {/* DESKTOP TABLE VIEW (Visible md and up) */}
      {!isLoading && data?.orders && data.orders.length > 0 && (
        <div className="hidden md:block bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sand-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Order ID & Date</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Status & Action</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {data.orders.map((order: any) => (
                <tr key={order.id} className="hover:bg-sand-50/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-slate-900 block">{order.orderNumber}</span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{order.customerName}</div>
                    <div className="text-[11px] text-slate-500">{order.customerPhone}</div>
                    <div className="text-[10px] text-forest-700">{order.deliveryCity}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-800">
                      {order.items?.length || 0} item(s)
                    </span>
                    <p className="text-[11px] text-slate-400 truncate max-w-[160px]">
                      {order.items?.map((i: any) => i.productTitle).join(', ')}
                    </p>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 font-mono">
                      रू {Number(order.totalAmount).toLocaleString()}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{order.paymentMethod}</div>
                    <span
                      className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        order.paymentStatus === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <select
                      value={order.orderStatus}
                      onChange={(e) =>
                        statusMutation.mutate({
                          orderId: order.id,
                          status: e.target.value as OrderStatus,
                        })
                      }
                      className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border focus:outline-none cursor-pointer ${getStatusBadge(
                        order.orderStatus
                      )}`}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="READY">READY</option>
                      <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sand-100 hover:bg-sand-200 text-forest-900 font-bold text-xs transition-colors"
                    >
                      <Eye size={13} />
                      <span>View</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MOBILE CARD VIEW (Visible on phones & small viewports < 768px) */}
      {!isLoading && data?.orders && data.orders.length > 0 && (
        <div className="md:hidden space-y-3">
          {data.orders.map((order: any) => (
            <div
              key={order.id}
              className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3 text-xs"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <span className="font-mono font-bold text-sm text-slate-900 block">
                    {order.orderNumber}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(
                    order.orderStatus
                  )}`}
                >
                  {order.orderStatus.replace('_', ' ')}
                </span>
              </div>

              {/* Customer & Location */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-semibold text-slate-900">{order.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-mono text-slate-700">{order.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">City / Zone:</span>
                  <span className="font-semibold text-forest-800">{order.deliveryCity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment:</span>
                  <span className="font-semibold text-slate-800">
                    {order.paymentMethod} ({order.paymentStatus})
                  </span>
                </div>
              </div>

              {/* Items summary */}
              <div className="bg-sand-50/70 p-2.5 rounded-2xl border border-slate-100">
                <span className="text-[11px] text-slate-500 block mb-1 font-semibold">
                  Items ({order.items?.length || 0}):
                </span>
                <div className="space-y-1">
                  {order.items?.slice(0, 3).map((item: any) => (
                    <div key={item.id} className="flex justify-between text-[11px]">
                      <span className="text-slate-700 truncate max-w-[200px]">
                        {item.quantity}× {item.productTitle} ({item.variantName})
                      </span>
                      <span className="font-mono font-semibold text-slate-900">
                        रू {Number(item.totalPrice).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {(order.items?.length || 0) > 3 && (
                    <span className="text-[10px] text-slate-400 italic block">
                      +{order.items.length - 3} more items...
                    </span>
                  )}
                </div>
              </div>

              {/* Action and Total */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Amount</span>
                  <span className="font-serif font-bold text-base text-forest-950">
                    रू {Number(order.totalAmount).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/admin/orders/${order.id}`}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-forest-800 text-white font-bold text-xs shadow-xs"
                  >
                    <span>Manage</span>
                    <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
