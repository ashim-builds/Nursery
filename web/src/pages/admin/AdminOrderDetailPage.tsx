import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api';
import { useUI } from '../../context/UIContext';
import { OrderStatus, PaymentStatus } from '../../types/order';
import {
  ArrowLeft,
  ShoppingBag,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Truck,
  CheckCircle2,
  Calendar,
  Gift,
  FileText,
  AlertCircle,
  RotateCw,
  Package,
} from 'lucide-react';

export const AdminOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useUI();
  const queryClient = useQueryClient();

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<PaymentStatus | ''>('');
  const [adminNotes, setAdminNotes] = useState('');

  const { data: order, isLoading, refetch } = useQuery({
    queryKey: ['admin-order-detail', id],
    queryFn: () => adminApi.getOrderById(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: { orderStatus?: OrderStatus; paymentStatus?: PaymentStatus; deliveryNotes?: string }) =>
      adminApi.updateOrderStatus(id!, data),
    onSuccess: (updated) => {
      showToast('Order fulfillment updated successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-order-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to update order', 'error');
    },
  });

  const handleUpdate = () => {
    updateMutation.mutate({
      orderStatus: (selectedStatus || order?.orderStatus) as OrderStatus,
      paymentStatus: (selectedPaymentStatus || order?.paymentStatus) as PaymentStatus,
      deliveryNotes: adminNotes || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-xl w-60" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 bg-white rounded-3xl border border-slate-200 lg:col-span-2" />
          <div className="h-96 bg-white rounded-3xl border border-slate-200" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
        <AlertCircle size={40} className="mx-auto text-rose-500" />
        <h2 className="font-serif font-bold text-xl text-slate-800">Order Not Found</h2>
        <p className="text-xs text-slate-500">The requested order ID does not exist in the database.</p>
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest-800 text-white font-bold text-xs"
        >
          <ArrowLeft size={14} />
          <span>Back to Orders List</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar with Back Link & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/orders"
            className="p-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors shadow-xs"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xl sm:text-2xl text-slate-900">
                {order.orderNumber}
              </span>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  order.orderStatus === 'DELIVERED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : order.orderStatus === 'PENDING'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-forest-100 text-forest-800'
                }`}
              >
                {order.orderStatus}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors shadow-xs"
        >
          <RotateCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Order Items & Delivery Snapshot (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Table/Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="font-serif font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
              <Package size={18} className="text-forest-700" />
              <span>Botanical Order Line Items ({order.items?.length || 0})</span>
            </h2>

            <div className="divide-y divide-slate-100">
              {order.items?.map((item: any) => (
                <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-forest-50 border border-forest-100 flex items-center justify-center shrink-0">
                      <ShoppingBag size={20} className="text-forest-700" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{item.productTitle}</div>
                      <div className="text-slate-500">
                        Option: <strong className="text-forest-800">{item.variantName}</strong> • SKU: {item.sku || 'N/A'}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        रू {Number(item.unitPrice).toLocaleString()} × {item.quantity} unit(s)
                      </div>
                    </div>
                  </div>

                  <div className="text-right sm:self-center">
                    <span className="font-bold text-sm text-slate-900 font-mono block">
                      रू {Number(item.totalPrice).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Totals */}
            <div className="pt-4 border-t border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono">रू {Number(order.subtotal || order.totalAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Shipping Fee</span>
                <span className="font-mono">रू {Number(order.deliveryFee || 0).toLocaleString()}</span>
              </div>
              {Number(order.discountAmount || order.discount || 0) > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon / Botanical Discount</span>
                  <span className="font-mono">- रू {Number(order.discountAmount || order.discount).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm sm:text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Grand Total</span>
                <span className="font-serif text-forest-950 font-bold font-mono">
                  रू {Number(order.totalAmount).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery & Gift Card Details */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="font-serif font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
              <MapPin size={18} className="text-forest-700" />
              <span>Delivery & Address Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-sand-50/80 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-slate-400 font-semibold block text-[11px]">DELIVERY ADDRESS</span>
                <p className="font-bold text-slate-900">{order.deliveryAddress}</p>
                <p className="text-slate-600">{order.deliveryCity}, Nepal</p>
                {order.scheduledDeliveryDate && (
                  <p className="text-forest-800 font-semibold pt-1">
                    Scheduled Date: {new Date(order.scheduledDeliveryDate).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="p-3.5 bg-sand-50/80 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-slate-400 font-semibold block text-[11px]">CUSTOMER CONTACT</span>
                <p className="font-bold text-slate-900">{order.customerName}</p>
                <p className="text-slate-600 font-mono">{order.customerPhone}</p>
                <p className="text-slate-500">{order.customerEmail || 'No email provided'}</p>
              </div>
            </div>

            {order.giftMessage && (
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <Gift size={15} className="text-amber-700" />
                  <span>Personalized Botanical Gift Card</span>
                </div>
                <p className="text-amber-800 italic">"{order.giftMessage}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order State Controls (1 col) */}
        <div className="space-y-6">
          {/* Status & Payment Pipeline Updater */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
              <Clock size={18} className="text-forest-700" />
              <span>Fulfillment Controls</span>
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Order Status Pipeline
                </label>
                <select
                  value={selectedStatus || order.orderStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-forest-700"
                >
                  <option value="PENDING">PENDING (New)</option>
                  <option value="CONFIRMED">CONFIRMED (Payment Verified)</option>
                  <option value="PROCESSING">PROCESSING (Greenhouse Intake)</option>
                  <option value="READY">READY (Packed with Care Guide)</option>
                  <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY (With Rider)</option>
                  <option value="DELIVERED">DELIVERED (Fulfilled)</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED (Restock items)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Status
                </label>
                <select
                  value={selectedPaymentStatus || order.paymentStatus}
                  onChange={(e) => setSelectedPaymentStatus(e.target.value as PaymentStatus)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-forest-700"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PAID">PAID (Settled)</option>
                  <option value="FAILED">FAILED</option>
                  <option value="REFUNDED">REFUNDED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Delivery / Fulfillment Notes
                </label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Optional rider notes or dispatch instructions..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-forest-700"
                />
              </div>

              <button
                onClick={handleUpdate}
                disabled={updateMutation.isPending}
                className="w-full py-3 px-4 bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {updateMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    <span>Save & Notify Customer</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Payment Gateway Snapshot */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3 text-xs">
            <h2 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
              <CreditCard size={18} className="text-forest-700" />
              <span>Payment Details</span>
            </h2>

            <div className="space-y-2 text-slate-600">
              <div className="flex justify-between">
                <span>Method:</span>
                <span className="font-bold text-slate-900">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-bold text-emerald-700">{order.paymentStatus}</span>
              </div>
              {(order.paymentReference || (order as any).paymentId) && (
                <div className="flex justify-between">
                  <span>Payment Ref:</span>
                  <span className="font-mono text-[11px] text-slate-500">
                    {order.paymentReference || (order as any).paymentId}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
