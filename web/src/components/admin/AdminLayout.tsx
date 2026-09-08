import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api';
import { AdminSidebar } from './AdminSidebar';
import { AdminBottomNav } from './AdminBottomNav';
import { 
  ExternalLink, 
  Sprout, 
  ChevronRight,
  Package
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationCenter } from '../notifications/NotificationCenter';

export const AdminLayout: React.FC = () => {
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
  const currentSection = pathSegments[1]
    ? pathSegments[1].charAt(0).toUpperCase() + pathSegments[1].slice(1)
    : 'Dashboard';

  return (
    <div className="min-h-screen bg-sand-50/50 flex flex-col antialiased">
      <div className="flex flex-1 min-h-screen">
        {/* Desktop Fixed Sidebar — Locked to screen height, never scrolls with page */}
        <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-forest-950 z-30 flex-col">
          <AdminSidebar 
            pendingOrdersCount={metrics?.pendingOrders || 0}
            lowStockCount={metrics?.lowStockCount || 0}
          />
        </aside>

        {/* Main Content Area (Offset by sidebar width on desktop) */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
          {/* Top Admin Navigation Bar */}
          <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Breadcrumb Path */}
              <div className="flex items-center gap-2 text-xs">
                <Link to="/admin" className="font-bold text-forest-900 hover:text-forest-700 flex items-center gap-1.5">
                  <Sprout size={16} className="text-emerald-600" />
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

              {/* Notification Center */}
              <NotificationCenter variant="admin" />

              {/* Admin Profile Pill */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-forest-800 text-emerald-300 flex items-center justify-center font-bold text-xs shadow-xs">
                  {user?.fullName?.charAt(0) || 'A'}
                </div>
                <div className="hidden md:block text-left text-xs">
                  <div className="font-bold text-slate-800 leading-tight">{user?.fullName || 'Administrator'}</div>
                </div>
              </div>
            </div>
          </header>

          {/* Render Active Admin Sub-Page with mobile bottom clearance */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 max-w-7xl w-full mx-auto space-y-6">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Admin Mobile Bottom Navigation */}
      <AdminBottomNav pendingOrdersCount={metrics?.pendingOrders || 0} />
    </div>
  );
};
