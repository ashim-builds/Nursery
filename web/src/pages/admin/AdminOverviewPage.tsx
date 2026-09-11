import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin.api';
import {
  ShoppingBag,
  PlusCircle,
  CreditCard,
  Users,
  Package,
  Clock,
  ArrowRight,
  Phone,
  Truck,
  RotateCw,
  CheckCircle,
} from 'lucide-react';
import { siteSettingsApi } from '../../api/site-settings.api';

export const AdminOverviewPage: React.FC = () => {
  const { data: metrics, isLoading, refetch } = useQuery({
    queryKey: ['admin-metrics-full'],
    queryFn: adminApi.getDashboard,
    refetchInterval: 30000,
  });

  const { data: siteSettings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: siteSettingsApi.getSettings,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-2xl w-60" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const pendingCount = metrics?.pendingOrders || 0;
  const todaySales = Number(metrics?.todaySales || 0);
  const totalRevenue = Number(metrics?.totalRevenue || 0);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="font-serif font-bold text-xl sm:text-2xl text-slate-900">
            {siteSettings?.businessName || 'Nursery'} Manager
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Simple store control: manage orders, update plants, and check payments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <RotateCw size={14} />
            <span>Refresh</span>
          </button>
          <Link
            to="/admin/products/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            <PlusCircle size={15} />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* 4 Compact Action Cards in Responsive 2x2 Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* 1. Orders & Tracking */}
        <Link
          to="/admin/orders"
          className="p-3.5 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-200 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <ShoppingBag size={18} />
            </div>
            {pendingCount > 0 ? (
              <span className="bg-amber-600 text-white text-[10px] sm:text-xs font-extrabold px-2 py-0.5 rounded-full animate-bounce">
                {pendingCount} NEW
              </span>
            ) : (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                Active
              </span>
            )}
          </div>
          <div className="mt-2.5 sm:mt-3 text-left">
            <span className="text-[10px] sm:text-xs font-bold text-amber-950 uppercase tracking-wide block truncate">
              Manage Orders
            </span>
            <div className="font-serif font-bold text-base sm:text-xl text-amber-900 mt-0.5 leading-tight">
              {pendingCount} Deliveries
            </div>
            <p className="text-[10px] sm:text-[11px] text-amber-800 mt-1 flex items-center gap-1 font-medium">
              <span>View & track</span>
              <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
            </p>
          </div>
        </Link>

        {/* 2. Add / Edit Products */}
        <Link
          to="/admin/products"
          className="p-3.5 sm:p-5 rounded-2xl bg-emerald-50/90 border border-emerald-200 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Package size={18} />
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
              In Stock
            </span>
          </div>
          <div className="mt-2.5 sm:mt-3 text-left">
            <span className="text-[10px] sm:text-xs font-bold text-emerald-950 uppercase tracking-wide block truncate">
              Plants & Catalog
            </span>
            <div className="font-serif font-bold text-base sm:text-xl text-emerald-900 mt-0.5 leading-tight">
              Manage Items
            </div>
            <p className="text-[10px] sm:text-[11px] text-emerald-800 mt-1 flex items-center gap-1 font-medium">
              <span>Edit catalog</span>
              <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
            </p>
          </div>
        </Link>

        {/* 3. Payments & COD */}
        <Link
          to="/admin/payments"
          className="p-3.5 sm:p-5 rounded-2xl bg-blue-50/90 border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <CreditCard size={18} />
            </div>
            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
              COD
            </span>
          </div>
          <div className="mt-2.5 sm:mt-3 text-left">
            <span className="text-[10px] sm:text-xs font-bold text-blue-950 uppercase tracking-wide block truncate">
              Total Revenue
            </span>
            <div className="font-serif font-bold text-base sm:text-xl text-blue-900 mt-0.5 leading-tight font-mono">
              रू {totalRevenue.toLocaleString()}
            </div>
            <p className="text-[10px] sm:text-[11px] text-blue-800 mt-1 font-medium truncate">
              Today: <strong>रू {todaySales.toLocaleString()}</strong>
            </p>
          </div>
        </Link>

        {/* 4. Customers */}
        <Link
          to="/admin/customers"
          className="p-3.5 sm:p-5 rounded-2xl bg-purple-50/90 border border-purple-200 hover:border-purple-400 hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Users size={18} />
            </div>
            <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
              Buyers
            </span>
          </div>
          <div className="mt-2.5 sm:mt-3 text-left">
            <span className="text-[10px] sm:text-xs font-bold text-purple-950 uppercase tracking-wide block truncate">
              Customers
            </span>
            <div className="font-serif font-bold text-base sm:text-xl text-purple-900 mt-0.5 leading-tight">
              View Buyers
            </div>
            <p className="text-[10px] sm:text-[11px] text-purple-800 mt-1 flex items-center gap-1 font-medium">
              <span>Phone list</span>
              <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
            </p>
          </div>
        </Link>
      </div>

      {/* Recent Orders - Simple, Clean & Easy to Read */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
              <Truck size={18} className="text-forest-700" />
              <span>Orders to Pack & Deliver</span>
            </h2>
            <p className="text-xs text-slate-500">Click any order to view details or change status</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
          >
            <span>See All Orders</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="space-y-3">
          {metrics?.recentOrders && metrics.recentOrders.length > 0 ? (
            metrics.recentOrders.slice(0, 6).map((order: any) => {
              const statusColors: Record<string, string> = {
                PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
                CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
                PROCESSING: 'bg-indigo-100 text-indigo-800 border-indigo-200',
                OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-800 border-purple-200',
                DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                CANCELLED: 'bg-rose-100 text-rose-800 border-rose-200',
              };

              return (
                <Link
                  key={order.id}
                  to={`/admin/orders/${order.id}`}
                  className="p-3.5 sm:p-4 rounded-xl border border-slate-200 hover:border-forest-700 hover:bg-forest-50/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group block"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">
                        Order #{order.orderNumber || order.id.slice(-6)}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          statusColors[order.status] || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                      <span className="font-medium text-slate-800">
                        👤 {order.user?.fullName || order.recipientName || 'Customer'}
                      </span>
                      {(order.user?.phone || order.recipientPhone) && (
                        <span className="flex items-center gap-1 text-slate-500 font-mono">
                          <Phone size={12} />
                          {order.user?.phone || order.recipientPhone}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <span className="font-serif font-bold text-base text-slate-900 block">
                        रू {Number(order.totalAmount || 0).toLocaleString()}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {order.items?.length || 1} item(s) • COD
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-forest-800 group-hover:text-white flex items-center justify-center text-slate-500 transition-colors">
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Clock size={28} className="mx-auto mb-2 text-slate-300" />
              <span>No orders received yet</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
