import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '../api/order.api';
import { useCart } from '../context/CartContext';
import { useUI } from '../context/UIContext';
import { formatOrderAmount, isGenericVariantName } from '../utils/orderDisplay';
import {
  User,
  Package,
  Phone,
  Mail,
  LogOut,
  Sprout,
  Plus,
  Trash2,
  Calendar,
  Truck,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { showToast } = useUI();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentTab = searchParams.get('tab') || 'orders';

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => orderApi.getMyOrders(1),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto my-16 text-center p-8 bg-white rounded-3xl border border-slate-200 space-y-4 shadow-soft">
        <div className="w-14 h-14 rounded-full bg-forest-50 text-forest-700 flex items-center justify-center mx-auto">
          <User size={28} />
        </div>
        <h2 className="font-serif font-bold text-xl text-slate-800">Sign In to Your Garden Account</h2>
        <p className="text-xs text-slate-500">Access your past plant orders, track deliveries, and view saved plants.</p>
        <div className="flex gap-2 justify-center pt-2">
          <Link to="/login" className="bg-forest-800 text-white text-xs font-bold px-6 py-3 rounded-xl min-h-[44px] flex items-center">
            Log In
          </Link>
          <Link to="/register" className="bg-forest-100 text-forest-900 text-xs font-bold px-6 py-3 rounded-xl min-h-[44px] flex items-center">
            Sign Up
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 pb-28">
      {/* 1. User Header Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-soft">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-forest-100 border-2 border-forest-300 text-forest-800 flex items-center justify-center font-bold text-xl font-serif shrink-0">
            {user.fullName.charAt(0)}
          </div>
          <div className="space-y-1">
            <h1 className="font-serif font-bold text-xl sm:text-2xl text-slate-900 leading-tight">
              {user.fullName}
            </h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Mail size={12} /> {user.email}
              </span>
              {user.phoneNumber && (
                <span className="flex items-center gap-1">
                  <Phone size={12} /> {user.phoneNumber}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-4 py-2.5 rounded-xl transition-colors shrink-0 min-h-[44px]"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* 2. Mobile-First Tab Navigation Buttons (Min 44px touch targets) */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setSearchParams({ tab: 'orders' })}
          className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 min-h-[44px] transition-colors whitespace-nowrap ${
            currentTab === 'orders'
              ? 'border-forest-800 text-forest-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package size={16} />
          <span>Orders ({ordersData?.orders.length || 0})</span>
        </button>
      </div>

      {/* 3. Orders Tab Content */}
      {currentTab === 'orders' && (
        <div className="space-y-4">
          {ordersLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : ordersData?.orders.length === 0 ? (
            <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-3 shadow-soft">
              <div className="w-12 h-12 rounded-full bg-forest-50 text-forest-700 flex items-center justify-center mx-auto">
                <Sprout size={24} />
              </div>
              <h3 className="font-semibold text-sm text-slate-800">No plant orders yet</h3>
              <p className="text-xs text-slate-500">Explore our indoor greenery and blooming bouquets for Kathmandu delivery!</p>
              <Link
                to="/catalog"
                className="inline-flex items-center bg-forest-800 text-white text-xs font-semibold px-5 py-2.5 rounded-xl min-h-[44px]"
              >
                Start Plant Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {ordersData?.orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 text-xs">
                    <div>
                      <span className="font-bold font-mono text-slate-900">{order.orderNumber}</span>
                      <span className="text-slate-400 block sm:inline sm:ml-2">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="bg-forest-100 text-forest-800 font-bold px-2.5 py-0.5 rounded-full text-[11px] capitalize">
                        {order.orderStatus.toLowerCase().replace(/_/g, ' ')}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">
                        रू {formatOrderAmount(order.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Items in this order */}
                  <div className="space-y-2">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between text-xs text-slate-700">
                        <span className="font-medium truncate max-w-xs">
                          {item.productName || item.productTitle || 'Plant'}{!isGenericVariantName(item.variantName) && ` (${item.variantName})`} × {item.quantity}
                        </span>
                        <span className="font-semibold text-slate-900 shrink-0">
                          रू {formatOrderAmount(item.lineTotal ?? item.totalPrice)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Link
                      to={`/order-success/${order.id}`}
                      className="text-xs font-bold text-forest-700 hover:text-forest-900 hover:underline min-h-[44px] flex items-center"
                    >
                      View Receipt & Tracking →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
