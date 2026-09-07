import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Boxes,
  Users,
  CreditCard,
  Tag,
  Star,
  Truck,
  Bell,
  ShieldAlert,
  Settings,
  Store,
  LogOut,
  ExternalLink,
  ChevronRight,
  Sprout,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminSidebarProps {
  onItemClick?: () => void;
  pendingOrdersCount?: number;
  lowStockCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  onItemClick,
  pendingOrdersCount = 0,
  lowStockCount = 0,
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
    { 
      name: 'Orders', 
      href: '/admin/orders', 
      icon: ShoppingBag, 
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
      badgeColor: 'bg-amber-500 text-white'
    },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Categories', href: '/admin/categories', icon: Layers },
    { 
      name: 'Inventory', 
      href: '/admin/inventory', 
      icon: Boxes,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-rose-500 text-white'
    },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard },
    { name: 'Coupons', href: '/admin/coupons', icon: Tag },
    { name: 'Reviews', href: '/admin/reviews', icon: Star },
    { name: 'Delivery Zones', href: '/admin/delivery-zones', icon: Truck },
    { name: 'Notifications', href: '/admin/notifications', icon: Bell },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: ShieldAlert },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col h-full bg-forest-950 text-slate-100 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-forest-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-forest-700/80 border border-forest-600 flex items-center justify-center text-forest-200 shadow-inner">
            <Sprout size={24} className="text-emerald-400" />
          </div>
          <div>
            <div className="font-serif font-bold text-base text-white tracking-wide flex items-center gap-1.5">
              <span>Nursery Admin</span>
              <span className="text-[10px] uppercase font-sans font-extrabold tracking-wider bg-forest-800 text-emerald-300 px-1.5 py-0.5 rounded">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-forest-300">Botanical Operations Console</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        {navigation.map((item) => {
          const isActive = item.exact 
            ? location.pathname === item.href 
            : location.pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onItemClick}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-forest-800 text-white font-semibold shadow-xs border-l-4 border-emerald-400 pl-2.5'
                  : 'text-slate-300 hover:text-white hover:bg-forest-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={18}
                  className={`transition-colors ${
                    isActive ? 'text-emerald-400' : 'text-forest-400 group-hover:text-forest-200'
                  }`}
                />
                <span>{item.name}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Storefront Link & Admin User Footer */}
      <div className="p-3 border-t border-forest-800/80 bg-forest-950/80 space-y-2">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-semibold text-emerald-300 bg-forest-900/80 hover:bg-forest-850 transition-colors border border-forest-800"
        >
          <div className="flex items-center gap-2">
            <Store size={15} />
            <span>View Live Storefront</span>
          </div>
          <ExternalLink size={13} className="text-emerald-400/80" />
        </a>

        <div className="flex items-center justify-between px-2 pt-2 text-xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-forest-800 border border-forest-700 flex items-center justify-center text-xs font-bold text-emerald-300 shrink-0">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="truncate">
              <p className="font-semibold text-slate-100 truncate">{user?.fullName || 'Administrator'}</p>
              <p className="text-[10px] text-forest-400 capitalize">{user?.role?.toLowerCase() || 'Admin'}</p>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="p-1.5 text-forest-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
