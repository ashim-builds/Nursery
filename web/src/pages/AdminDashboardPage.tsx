import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  CheckCircle2, 
  Clock, 
  RotateCw, 
  Shield, 
  Plus, 
  Minus,
  Edit3,
  Layers,
  History
} from 'lucide-react';
import { OrderStatus } from '../types/order';

export const AdminDashboardPage: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const { showToast } = useUI();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'audit'>('orders');

  // Queries
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: adminApi.getMetrics,
  });

  const { data: ordersData, refetch: refetchOrders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => adminApi.getAllOrders(),
  });

  const { data: lowStockItems, refetch: refetchLowStock } = useQuery({
    queryKey: ['admin-low-stock'],
    queryFn: adminApi.getLowStockAlerts,
  });

  const { data: auditLogs } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: () => adminApi.getAuditLogs(20),
  });

  // Stock adjust mutation
  const stockMutation = useMutation({
    mutationFn: ({ variantId, changeAmount, reason }: { variantId: string; changeAmount: number; reason: string }) =>
      adminApi.adjustStock({
        variantId,
        changeAmount,
        type: changeAmount > 0 ? 'RESTOCK' : 'DAMAGE',
        note: reason || 'Admin manual dashboard adjustment',
      }),
    onSuccess: () => {
      showToast('Inventory stock adjusted successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-low-stock'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to adjust stock', 'error');
    },
  });

  // Order status mutation
  const statusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      adminApi.updateOrderStatus(orderId, { orderStatus: status }),
    onSuccess: () => {
      showToast('Order status updated and customer notified', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to update order status', 'error');
    },
  });

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 text-center p-8 bg-white rounded-3xl border border-rose-200 space-y-3">
        <Shield size={36} className="text-rose-600 mx-auto" />
        <h2 className="font-serif font-bold text-xl text-slate-900">Restricted Administrator Area</h2>
        <p className="text-xs text-slate-500">
          You must be logged in as an administrator to access the Nursery Fulfillment & Inventory Console.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Botanical Control Center
            </span>
            <span className="text-xs text-slate-400">Welcome, {user?.fullName}</span>
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 mt-1">
            Nursery Admin & Live Inventory
          </h1>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'orders' ? 'bg-white text-forest-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Orders & Fulfillment
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'inventory' ? 'bg-white text-forest-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Inventory ({metrics?.lowStockCount || 0} Low)
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'audit' ? 'bg-white text-forest-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Total Revenue</span>
            <TrendingUp size={16} className="text-emerald-600" />
          </div>
          <span className="font-serif font-bold text-lg sm:text-2xl text-slate-900 block">
            रू {Number(metrics?.totalRevenue || 0).toLocaleString()}
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Total Orders</span>
            <Package size={16} className="text-forest-700" />
          </div>
          <span className="font-serif font-bold text-lg sm:text-2xl text-slate-900 block">
            {metrics?.totalOrders || 0}
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Low Stock Plants</span>
            <AlertTriangle size={16} className="text-amber-500" />
          </div>
          <span className="font-serif font-bold text-lg sm:text-2xl text-amber-600 block">
            {metrics?.lowStockCount || 0}
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Active Customers</span>
            <Users size={16} className="text-sky-600" />
          </div>
          <span className="font-serif font-bold text-lg sm:text-2xl text-slate-900 block">
            {metrics?.totalCustomers || 0}
          </span>
        </div>
      </div>

      {/* Tab Content 1: Orders & Fulfillment */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-soft space-y-4 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
              <Package size={18} className="text-forest-700" />
              <span>Customer Orders</span>
            </h3>
            <button
              onClick={() => refetchOrders()}
              className="text-xs font-semibold text-slate-600 hover:text-forest-800 flex items-center gap-1"
            >
              <RotateCw size={13} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="space-y-4">
            {ordersData?.orders.map((order: any) => (
              <div
                key={order.id}
                className="p-4 rounded-2xl border border-slate-200/90 bg-sand-50/50 space-y-3"
              >
                {/* Header info */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5 text-xs">
                  <div>
                    <span className="font-bold font-mono text-slate-900 text-sm">{order.orderNumber}</span>
                    <span className="text-slate-500 ml-2">Customer: <strong>{order.customerName}</strong> ({order.customerPhone})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Status:</span>
                    <select
                      value={order.orderStatus}
                      onChange={(e) =>
                        statusMutation.mutate({ orderId: order.id, status: e.target.value as OrderStatus })
                      }
                      className="bg-white border border-slate-300 font-bold text-xs px-2.5 py-1 rounded-xl text-forest-900 focus:outline-none cursor-pointer"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PACKING">PACKING</option>
                      <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </div>

                {/* Destination & Gift Message */}
                <div className="text-xs text-slate-600 flex flex-wrap gap-x-6 gap-y-1">
                  <div><strong>Address:</strong> {order.deliveryAddress}, {order.deliveryCity}</div>
                  <div><strong>Payment:</strong> {order.paymentMethod} ({order.paymentStatus})</div>
                  {order.scheduledDeliveryDate && (
                    <div><strong>Scheduled:</strong> {new Date(order.scheduledDeliveryDate).toLocaleDateString()}</div>
                  )}
                  {order.giftMessage && (
                    <div className="w-full text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-100 mt-1">
                      <strong>Card Message:</strong> "{order.giftMessage}"
                    </div>
                  )}
                </div>

                {/* Items */}
                <div className="space-y-1.5 pt-1">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between text-xs bg-white p-2 rounded-xl border border-slate-100">
                      <span className="font-medium text-slate-800">
                        {item.productTitle} — <span className="text-forest-700">{item.variantName}</span> × {item.quantity}
                      </span>
                      <span className="font-bold text-slate-900">रू {Number(item.totalPrice).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Footer Total */}
                <div className="flex justify-between items-center text-xs font-bold pt-1 border-t border-slate-200">
                  <span className="text-slate-500">Order Placed: {new Date(order.createdAt).toLocaleDateString()}</span>
                  <span className="text-sm font-serif text-forest-950">Total: रू {Number(order.totalAmount).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 2: First-Class Inventory Stock Management */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-soft space-y-4 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
                <Layers size={18} className="text-forest-700" />
                <span>Live Botanical Stock & Pot Variants</span>
              </h3>
              <p className="text-xs text-slate-500">
                Adjust pot variants, intake new nursery stock, or log damaged goods.
              </p>
            </div>
            <button
              onClick={() => refetchLowStock()}
              className="text-xs font-semibold text-slate-600 hover:text-forest-800 flex items-center gap-1"
            >
              <RotateCw size={13} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="space-y-3">
            {lowStockItems?.map((item: any) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-slate-200 bg-sand-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{item.product.title}</span>
                    <span className="bg-forest-100 text-forest-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {item.sku}
                    </span>
                  </div>
                  <span className="text-xs text-forest-700 font-semibold block mt-0.5">
                    Option / Pot Size: {item.name}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span>Threshold: {item.lowStockThreshold} units</span>
                    <span className="text-amber-700 font-bold">
                      Current Live Stock: {item.stockQuantity} units
                    </span>
                  </div>
                </div>

                {/* Instant Stock Adjustment buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      stockMutation.mutate({ variantId: item.id, changeAmount: -1, reason: 'DAMAGED_RETURN' })
                    }
                    className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    title="Deduct 1 unit"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-xs">
                    {item.stockQuantity}
                  </span>
                  <button
                    onClick={() =>
                      stockMutation.mutate({ variantId: item.id, changeAmount: 5, reason: 'RESTOCK' })
                    }
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs transition-colors shadow-xs"
                    title="Restock +5 units"
                  >
                    <Plus size={13} />
                    <span>+5 Restock</span>
                  </button>
                  <button
                    onClick={() =>
                      stockMutation.mutate({ variantId: item.id, changeAmount: 20, reason: 'RESTOCK' })
                    }
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
                    title="Restock +20 units"
                  >
                    <Plus size={13} />
                    <span>+20 Intake</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 3: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-soft space-y-4 p-5 sm:p-6">
          <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
            <History size={18} className="text-forest-700" />
            <span>System & Stock Audit Logs</span>
          </h3>

          <div className="space-y-2">
            {auditLogs?.map((log: any) => (
              <div
                key={log.id}
                className="p-3 bg-sand-50/80 rounded-xl border border-slate-200 text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-slate-900">{log.action}</span>
                  <span className="text-slate-500 ml-2">on {log.resource} ({log.resourceId || 'N/A'})</span>
                  {log.details && (
                    <p className="text-[11px] text-slate-600 font-mono mt-0.5">
                      {JSON.stringify(log.details)}
                    </p>
                  )}
                </div>
                <span className="text-slate-400 text-[11px] shrink-0">
                  {new Date(log.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
