import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin.api';
import { useUI } from '../../context/UIContext';
import { OrderStatus, PaymentStatus } from '../../types/order';
import {
  ShoppingBag,
  Search,
  RotateCw,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  Eye,
  DollarSign,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

const SIMPLE_STATUS_FILTERS = [
  { id: 'ALL', label: 'All Orders' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'DELIVERED', label: 'Delivered' },
  { id: 'CANCELLED', label: 'Cancelled' },
];

export const AdminOrdersPage: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { showToast, confirmAction } = useUI();
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-orders-list', selectedStatus, search, page],
    queryFn: () =>
      adminApi.getAllOrders({
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
        search: search.trim() || undefined,
        page,
        limit: 30,
      }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      orderId,
      orderStatus,
      paymentStatus,
    }: {
      orderId: string;
      orderStatus?: OrderStatus;
      paymentStatus?: PaymentStatus;
    }) => adminApi.updateOrderStatus(orderId, { orderStatus, paymentStatus }),
    onSuccess: (_, variables) => {
      if (variables.paymentStatus) {
        showToast(`Payment marked as ${variables.paymentStatus}`, 'success');
      } else if (variables.orderStatus) {
        showToast(`Order marked as ${variables.orderStatus}`, 'success');
      }
      queryClient.invalidateQueries({ queryKey: ['admin-orders-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to update order', 'error');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ orderId }: { orderId: string }) =>
      adminApi.cancelOrder(orderId, 'Cancelled by store manager'),
    onSuccess: () => {
      showToast('Order cancelled and inventory restored', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-orders-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to cancel order', 'error');
    },
  });

  const handleTogglePayment = async (order: any) => {
    const nextStatus: PaymentStatus = order.paymentStatus === 'PAID' ? 'PENDING' : 'PAID';
    const confirmMessage =
      nextStatus === 'PAID'
        ? `Are you sure you want to mark Order #${order.orderNumber} as PAID?`
        : `Are you sure you want to mark Order #${order.orderNumber} as UNPAID?`;

    if (await confirmAction(confirmMessage, { title: 'Update payment status' })) {
      updateStatusMutation.mutate({
        orderId: order.id,
        paymentStatus: nextStatus,
      });
    }
  };

  const handleToggleDeliveryStatus = async (order: any) => {
    const nextStatus: OrderStatus = order.orderStatus === 'DELIVERED' ? 'PENDING' : 'DELIVERED';
    const confirmMessage =
      nextStatus === 'DELIVERED'
        ? `Mark Order #${order.orderNumber} as DELIVERED in 1-click?`
        : `Change Order #${order.orderNumber} back to PENDING?`;

    if (await confirmAction(confirmMessage, { title: 'Update delivery status' })) {
      updateStatusMutation.mutate({
        orderId: order.id,
        orderStatus: nextStatus,
      });
    }
  };

  const handleCancelOrder = async (order: any) => {
    if (order.orderStatus === 'CANCELLED') {
      showToast('This order is already cancelled.', 'info');
      return;
    }
    if (
      await confirmAction(
        `Are you sure you want to CANCEL Order #${order.orderNumber}?\nThis will clear the order and return plants to stock.`
        , { title: 'Cancel order', confirmLabel: 'Cancel order' }
      )
    ) {
      cancelMutation.mutate({ orderId: order.id });
    }
  };

  const openMapLocation = (order: any) => {
    const lat = Number(order.deliveryLatitude);
    const lng = Number(order.deliveryLongitude);

    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      window.open(
        `https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`,
        '_blank'
      );
    } else {
      showToast('This order has no saved GPS coordinates. Text address: ' + (order.deliveryAddress || 'N/A'), 'info');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShoppingBag className="text-forest-700" size={28} />
            <span>Manage Orders</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Easy 1-click delivery status, payment toggles, and live customer map tracking.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors shadow-xs"
        >
          <RotateCw size={14} className={isLoading ? 'animate-spin' : ''} />
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
              placeholder="Search by customer name, phone number, order #, or location..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-forest-700"
            />
          </div>
        </div>

        {/* Simplified Status Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {SIMPLE_STATUS_FILTERS.map((st) => (
            <button
              key={st.id}
              onClick={() => {
                setSelectedStatus(st.id);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedStatus === st.id
                  ? 'bg-forest-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!data?.orders || data.orders.length === 0) && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <ShoppingBag size={40} className="mx-auto text-slate-300" />
          <h3 className="font-serif font-bold text-lg text-slate-800">No Orders Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No customer orders found matching your search.
          </p>
        </div>
      )}

      {/* DESKTOP TABLE VIEW */}
      {!isLoading && data?.orders && data.orders.length > 0 && (
        <div className="hidden lg:block bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sand-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Order # & Date</th>
                <th className="py-3.5 px-4">Customer & Phone</th>
                <th className="py-3.5 px-4">Location & Map</th>
                <th className="py-3.5 px-4">Items & Total</th>
                <th className="py-3.5 px-4 text-center">Payment (1-Click)</th>
                <th className="py-3.5 px-4 text-center">Delivery (1-Click)</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {data.orders.map((order: any) => {
                const isDelivered = order.orderStatus === 'DELIVERED';
                const isCancelled = order.orderStatus === 'CANCELLED';
                const isPaid = order.paymentStatus === 'PAID';

                return (
                  <tr
                    key={order.id}
                    className={`hover:bg-sand-50/40 transition-colors ${
                      isCancelled ? 'bg-rose-50/30 opacity-70' : ''
                    }`}
                  >
                    {/* Order ID */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900 block text-xs">
                        {order.orderNumber}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{order.customerName}</div>
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="text-[11px] text-forest-700 hover:underline font-mono"
                      >
                        {order.customerPhone}
                      </a>
                    </td>

                    {/* Location & Map Track */}
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <div className="text-[11px] text-slate-700 truncate font-medium" title={order.deliveryAddress}>
                        {order.deliveryAddress || 'No street address'}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-bold text-slate-500">
                          {order.deliveryCity || 'Pokhara'}
                        </span>
                        {order.deliveryLatitude && order.deliveryLongitude ? (
                          <button
                            onClick={() => openMapLocation(order)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold transition-colors border border-emerald-200 cursor-pointer shadow-2xs"
                            title={`Open exact GPS pin (${Number(order.deliveryLatitude).toFixed(5)}, ${Number(order.deliveryLongitude).toFixed(5)})`}
                          >
                            <MapPin size={11} className="text-emerald-600" />
                            <span>Show Map</span>
                          </button>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400 text-[10px] font-medium"
                            title="No GPS pin recorded for this order"
                          >
                            <MapPin size={10} className="text-slate-400" />
                            <span>No GPS</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Items & Amount */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-forest-950 font-mono text-sm">
                        रू {Number(order.totalAmount).toLocaleString()}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate max-w-[150px]">
                        {order.items?.length || 0} item(s):{' '}
                        {order.items?.map((i: any) => i.productTitle).join(', ')}
                      </p>
                    </td>

                    {/* 1-Click Payment Status */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleTogglePayment(order)}
                        disabled={isCancelled}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-xs cursor-pointer active:scale-95 ${
                          isPaid
                            ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300'
                        }`}
                        title="Click to toggle Paid / Unpaid (with confirmation)"
                      >
                        {isPaid ? (
                          <>
                            <CheckCircle2 size={13} className="text-emerald-700" />
                            <span>PAID</span>
                          </>
                        ) : (
                          <>
                            <Clock size={13} className="text-amber-700" />
                            <span>UNPAID (COD)</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* 1-Click Order Status: Pending vs Delivered */}
                    <td className="py-3.5 px-4 text-center">
                      {isCancelled ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200">
                          <XCircle size={13} />
                          <span>CANCELLED</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleToggleDeliveryStatus(order)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all shadow-xs cursor-pointer active:scale-95 ${
                            isDelivered
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-amber-500 hover:bg-amber-600 text-white'
                          }`}
                          title="Click to switch between Pending and Delivered"
                        >
                          {isDelivered ? (
                            <>
                              <CheckCircle2 size={13} />
                              <span>DELIVERED ✓</span>
                            </>
                          ) : (
                            <>
                              <Clock size={13} />
                              <span>PENDING</span>
                            </>
                          )}
                        </button>
                      )}
                    </td>

                    {/* Actions: Cancel (X) & View Details */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="p-1.5 rounded-lg bg-sand-100 hover:bg-sand-200 text-slate-700 transition-colors"
                          title="View order details"
                        >
                          <Eye size={15} />
                        </Link>

                        {!isCancelled && (
                          <button
                            onClick={() => handleCancelOrder(order)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
                            title="Cancel & clear order"
                          >
                            <XCircle size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MOBILE / TABLET CARD VIEW */}
      {!isLoading && data?.orders && data.orders.length > 0 && (
        <div className="lg:hidden space-y-3">
          {data.orders.map((order: any) => {
            const isDelivered = order.orderStatus === 'DELIVERED';
            const isCancelled = order.orderStatus === 'CANCELLED';
            const isPaid = order.paymentStatus === 'PAID';

            return (
              <div
                key={order.id}
                className={`bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3 text-xs ${
                  isCancelled ? 'bg-rose-50/20' : ''
                }`}
              >
                {/* Header: Order # & Cancel Cross */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div>
                    <span className="font-mono font-bold text-sm text-slate-900 block">
                      {order.orderNumber}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="p-1.5 rounded-xl bg-sand-100 text-slate-700"
                      title="View Details"
                    >
                      <Eye size={15} />
                    </Link>
                    {!isCancelled && (
                      <button
                        onClick={() => handleCancelOrder(order)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-[11px] font-bold"
                        title="Cancel order"
                      >
                        <XCircle size={13} />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Customer Details */}
                <div className="space-y-1 bg-sand-50/60 p-2.5 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Customer:</span>
                    <span className="font-bold text-slate-900">{order.customerName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Phone:</span>
                    <a
                      href={`tel:${order.customerPhone}`}
                      className="font-mono font-bold text-forest-800 underline"
                    >
                      {order.customerPhone}
                    </a>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200/50">
                    <span className="text-slate-500 font-medium">Delivery Street:</span>
                    <span className="font-semibold text-slate-800 text-right truncate max-w-[180px]">
                      {order.deliveryAddress}
                    </span>
                  </div>
                </div>

                {/* Map Location Tracker Button */}
                {order.deliveryLatitude && order.deliveryLongitude ? (
                  <button
                    onClick={() => openMapLocation(order)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 transition-colors shadow-2xs cursor-pointer active:scale-95"
                  >
                    <MapPin size={15} className="text-emerald-700" />
                    <span>Show Map ({Number(order.deliveryLatitude).toFixed(4)}, {Number(order.deliveryLongitude).toFixed(4)}) 📍</span>
                    <ExternalLink size={12} className="opacity-60" />
                  </button>
                ) : (
                  <div className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl bg-slate-100 text-slate-400 font-medium text-xs border border-slate-200">
                    <MapPin size={14} className="text-slate-400" />
                    <span>No GPS Coordinates Saved</span>
                  </div>
                )}

                {/* Items & Total */}
                <div className="flex items-center justify-between py-1">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Total ({order.items?.length || 0} items)
                    </span>
                    <span className="font-serif font-bold text-base text-forest-950">
                      रू {Number(order.totalAmount).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* 1-Click Action Buttons for Operator */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  {/* Payment Button */}
                  <button
                    onClick={() => handleTogglePayment(order)}
                    disabled={isCancelled}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl text-xs font-extrabold shadow-xs transition-transform active:scale-95 ${
                      isPaid
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {isPaid ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                    <span>{isPaid ? 'PAID ✓' : 'UNPAID (COD)'}</span>
                  </button>

                  {/* Delivery Status Button */}
                  {isCancelled ? (
                    <div className="flex items-center justify-center gap-1 py-2.5 px-2 rounded-2xl bg-rose-100 text-rose-800 font-bold text-xs">
                      <XCircle size={14} />
                      <span>CANCELLED</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleToggleDeliveryStatus(order)}
                      className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl text-xs font-extrabold text-white shadow-xs transition-transform active:scale-95 ${
                        isDelivered ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-500 hover:bg-amber-600'
                      }`}
                    >
                      {isDelivered ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                      <span>{isDelivered ? 'DELIVERED ✓' : 'PENDING'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
