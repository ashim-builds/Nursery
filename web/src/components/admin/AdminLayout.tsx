import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api';
import { AdminSidebar } from './AdminSidebar';
import { 
  Menu, 
  X, 
  Bell, 
  ExternalLink, 
  Sprout, 
  Search, 
  ChevronRight,
  ShieldCheck,
  Package
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationCenter } from '../notifications/NotificationCenter';

export const AdminLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  // Load metrics for badges
  const { data: metrics } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: adminApi.getMetrics,
    refetchInterval: 30000, // auto refresh every 30s
  });

  // Calculate current breadcrumb label
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const currentSection = pathSegments[1] ? pathSegments[1].charAt(0).toUpperCase() + pathSegments[1].slice(1) : 'Dashboard';

  return (
    <div className="min-h-screen bg-sand-50/50 flex flex-col antialiased">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div 
        className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] z-50 lg:hidden transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <AdminSidebar 
          onItemClick={() => setMobileMenuOpen(false)}
          pendingOrdersCount={metrics?.pendingOrders || 0}
          lowStockCount={metrics?.lowStockCount || 0}
        />
      </div>

      <div className="flex flex-1 min-h-screen">
        {/* Desktop Fixed Sidebar */}
        <aside className="hidden lg:block w-64 bg-forest-950 shrink-0 sticky top-0 h-screen z-30">
          <AdminSidebar 
            pendingOrdersCount={metrics?.pendingOrders || 0}
            lowStockCount={metrics?.lowStockCount || 0}
          />
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Admin Navigation Bar */}
          <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Mobile Drawer Trigger */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none"
                aria-label="Open sidebar"
              >
                <Menu size={22} />
              </button>

              {/* Breadcrumb Path */}
              <div className="flex items-center gap-2 text-xs">
                <Link to="/admin" className="font-bold text-forest-900 hover:text-forest-700 flex items-center gap-1.5">
                  <Sprout size={16} className="text-emerald-600 hidden sm:inline" />
                  <span>Admin</span>
                </Link>
                {pathSegments[1] && (
                  <>
                    <ChevronRight size={13} className="text-slate-400" />
                    <span className="font-semibold text-slate-600 capitalize">
                      {currentSection.replace('-', ' ')}
                    </span>
                  </>
                )}
                {pathSegments[2] && (
                  <>
                    <ChevronRight size={13} className="text-slate-400" />
                    <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      #{pathSegments[2].substring(0, 8)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Quick Actions & Status */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Quick Status Pill */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[11px] font-semibold text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Nursery Online</span>
              </div>

              {/* View Store Button */}
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-forest-800 bg-sand-100 hover:bg-sand-200 px-3 py-1.5 rounded-xl border border-sand-300 transition-colors"
              >
                <span>Store</span>
                <ExternalLink size={13} />
              </a>

              {/* Low Stock Alert Bubble */}
              {(metrics?.lowStockCount || 0) > 0 && (
                <Link
                  to="/admin/inventory"
                  className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors"
                  title={`${metrics?.lowStockCount} items low in stock`}
                >
                  <Package size={14} />
                  <span>{metrics?.lowStockCount} Low</span>
                </Link>
              )}

              {/* Notification Center */}
              <NotificationCenter variant="admin" />

              {/* Admin Profile Pill */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-forest-800 text-emerald-300 flex items-center justify-center font-bold text-xs shadow-xs">
                  {user?.fullName?.charAt(0) || 'A'}
                </div>
                <div className="hidden md:block text-left text-xs">
                  <div className="font-bold text-slate-800 leading-tight">{user?.fullName || 'Administrator'}</div>
                  <div className="text-[10px] text-slate-400">Botanist / Ops</div>
                </div>
              </div>
            </div>
          </header>

          {/* Render Active Admin Sub-Page */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
