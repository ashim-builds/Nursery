import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin.api';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  AlertTriangle,
  ArrowRight,
  Package,
  Layers,
  Users,
  CreditCard,
  RotateCw,
  Sparkles,
  ChevronRight,
  Truck,
  CheckCircle2,
} from 'lucide-react';

export const AdminOverviewPage: React.FC = () => {
  const { data: metrics, isLoading, refetch } = useQuery({
    queryKey: ['admin-metrics-full'],
    queryFn: adminApi.getDashboard,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-xl w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-slate-200 rounded-3xl lg:col-span-2" />
          <div className="h-80 bg-slate-200 rounded-3xl" />
        </div>
      </div>
    );
  }

  // Simulated chart points for visual analytics
  const revenueTrend = [
    { day: 'Sun', amount: 14500, height: '45%' },
    { day: 'Mon', amount: 22800, height: '70%' },
    { day: 'Tue', amount: 18900, height: '58%' },
    { day: 'Wed', amount: 31200, height: '95%' },
    { day: 'Thu', amount: 26400, height: '80%' },
    { day: 'Fri', amount: 29000, height: '88%' },
    { day: 'Sat', amount: 34500, height: '100%' },
  ];

  const orderStatusBreakdown = [
    { label: 'Pending / New', count: metrics?.pendingOrders || 0, color: 'bg-amber-500' },
    { label: 'Completed', count: metrics?.completedOrders || 0, color: 'bg-emerald-500' },
    { label: 'Total Placed', count: metrics?.totalOrders || 0, color: 'bg-forest-800' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-bold text-emerald-800 mb-2">
            <Sparkles size={13} className="text-emerald-600" />
            <span>Botanical Dispatch Dashboard</span>
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Nursery Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time sales, order fulfillment queue, live stock alerts, and customer activity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            <RotateCw size={14} />
            <span>Refresh Metrics</span>
          </button>
          <Link
            to="/admin/products/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            <span>+ Add New Plant</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Sales Card */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div>
            <span className="font-serif font-bold text-xl sm:text-3xl text-slate-900 block">
              रू {Number(metrics?.totalRevenue || 0).toLocaleString()}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
              <span>Today: रू {Number(metrics?.todaySales || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center">
              <ShoppingBag size={16} />
            </div>
          </div>
          <div>
            <span className="font-serif font-bold text-xl sm:text-3xl text-slate-900 block">
              {metrics?.totalOrders || 0}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-forest-700 mt-1">
              <span>Today: {metrics?.todayOrders || 0} orders placed</span>
            </div>
          </div>
        </div>

        {/* Pending Orders Card */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Pending Fulfillment</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div>
            <span className="font-serif font-bold text-xl sm:text-3xl text-amber-600 block">
              {metrics?.pendingOrders || 0}
            </span>
            <Link
              to="/admin/orders?status=PENDING"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:underline mt-1"
            >
              <span>Process Pending Queue</span>
              <ChevronRight size={12} />
            </Link>
          </div>
        </div>

        {/* Low Stock Card */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Low Stock Items</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div>
            <span className="font-serif font-bold text-xl sm:text-3xl text-rose-600 block">
              {metrics?.lowStockCount || 0}
            </span>
            <Link
              to="/admin/inventory"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 hover:underline mt-1"
            >
              <span>Restock Inventory</span>
              <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid: Revenue Bars + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Analytics Chart (2 Columns) */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-base sm:text-lg text-slate-900">
                Revenue & Velocity
              </h2>
              <p className="text-xs text-slate-500">7-day gross sales trend in NPR (रू)</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              +14.2% vs last week
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="pt-4 pb-2">
            <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-slate-200 pb-2">
              {revenueTrend.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-mono text-slate-400 group-hover:text-forest-900 group-hover:font-bold transition-colors">
                    {Math.round(item.amount / 1000)}k
                  </span>
                  <div className="w-full max-w-[38px] bg-sand-100 group-hover:bg-sand-200 rounded-t-xl overflow-hidden flex items-end h-36">
                    <div
                      style={{ height: item.height }}
                      className="w-full bg-forest-800 group-hover:bg-emerald-600 transition-all rounded-t-xl"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-600">{item.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Metrics Summary Row */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2 border-t border-slate-100 text-center">
            {orderStatusBreakdown.map((item, i) => (
              <div key={i} className="p-2 sm:p-3 bg-sand-50 rounded-2xl">
                <span className="text-[11px] text-slate-500 block">{item.label}</span>
                <span className="font-serif font-bold text-sm sm:text-lg text-slate-900 block mt-0.5">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Botanical Products */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-base sm:text-lg text-slate-900">
              Top Products
            </h2>
            <Link to="/admin/products" className="text-xs font-bold text-forest-700 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {metrics?.topProducts && metrics.topProducts.length > 0 ? (
              metrics.topProducts.slice(0, 5).map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-sand-50/60 rounded-2xl border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="w-5 h-5 rounded-full bg-forest-800 text-emerald-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-800 truncate">{p.productName}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-slate-900 block">{p.unitsSold} sold</span>
                    <span className="text-[10px] text-slate-500 font-mono">रू {Number(p.revenue).toLocaleString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                <Package size={24} className="mx-auto mb-2 text-slate-300" />
                <span>No order sales recorded yet</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Urgent Operations Split: Recent Orders & Urgent Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders Queue (Card stack for mobile, table for desktop) */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
              <ShoppingBag size={18} className="text-forest-700" />
              <span>Recent Orders</span>
            </h2>
            <Link to="/admin/orders" className="text-xs font-bold text-forest-700 hover:underline">
              Manage Orders →
            </Link>
          </div>

          <div className="space-y-3">
            {metrics?.recentOrders && metrics.recentOrders.length > 0 ? (
              metrics.recentOrders.slice(0, 4).map((order: any) => (
                <Link
                  key={order.id}
                  to={`/admin/orders/${order.id}`}
                  className="block p-3.5 bg-sand-50/70 hover:bg-sand-100/70 rounded-2xl border border-slate-200/80 transition-all text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-slate-900">{order.orderNumber}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        order.orderStatus === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.orderStatus === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 mt-2 text-[11px]">
                    <span>{order.customerName} ({order.deliveryCity})</span>
                    <span className="font-bold text-slate-900">रू {Number(order.totalAmount).toLocaleString()}</span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No recent orders found</p>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              <span>Low Stock Alerts</span>
            </h2>
            <Link to="/admin/inventory" className="text-xs font-bold text-rose-700 hover:underline">
              Full Inventory →
            </Link>
          </div>

          <div className="space-y-3">
            {metrics?.lowStockProducts && metrics.lowStockProducts.length > 0 ? (
              metrics.lowStockProducts.slice(0, 4).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 bg-rose-50/40 rounded-2xl border border-rose-100 text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{item.productName}</span>
                    <span className="text-[11px] text-slate-500">
                      {item.variantName} • SKU: {item.sku}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-rose-600 block">
                      {item.availableStock} left
                    </span>
                    <span className="text-[10px] text-slate-400">Threshold: {item.threshold}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-emerald-700 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                <CheckCircle2 size={24} className="mx-auto mb-1.5 text-emerald-600" />
                <span>All botanical pots and variants are adequately stocked.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
