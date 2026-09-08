import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  CreditCard,
  Users,
  Store,
  LogOut,
  ExternalLink,
  Sprout,
  PlusCircle,
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
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Simple, non-confusing core navigation
  const navigation = [
    { 
      name: 'Dashboard', 
      subtitle: 'Overview',
      href: '/admin', 
      icon: LayoutDashboard, 
      exact: true 
    },
    {
      name: 'Manage Orders',
      subtitle: 'Track & Deliver',
      href: '/admin/orders',
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    { 
      name: 'Plants & Products', 
      subtitle: 'In Stock / Out of Stock',
      href: '/admin/products', 
      icon: Package 
    },
    { 
      name: 'Customers', 
      subtitle: 'Phone & Details',
      href: '/admin/customers', 
      icon: Users 
    },
  ];

  return (
    <div className="flex flex-col h-full bg-forest-950 text-slate-100 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-forest-800/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <img
            src="/icon-192.png"
            alt="KtmBotanica Logo"
            className="w-9 h-9 rounded-xl object-cover border border-emerald-500/40 shadow-inner"
          />
          <div>
            <div className="font-serif font-bold text-sm text-white tracking-wide">
              KtmBotanica Admin
            </div>
            <div className="text-[10px] text-emerald-400 font-medium">Control Panel</div>
          </div>
        </div>
      </div>

      {/* Quick Add Product CTA Button in Sidebar */}
      <div className="px-3 pt-3 pb-1 shrink-0">
        <NavLink
          to="/admin/products/new"
          onClick={onItemClick}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-forest-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-98 text-white"
        >
          <PlusCircle size={16} />
          <span>Add New Product</span>
        </NavLink>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-1 custom-scrollbar">
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
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group ${
                isActive
                  ? 'bg-forest-800 text-white font-bold shadow-xs border-l-4 border-emerald-400 pl-2'
                  : 'text-slate-300 hover:text-white hover:bg-forest-900/60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  size={18}
                  className={`shrink-0 transition-colors ${
                    isActive ? 'text-emerald-400' : 'text-forest-400 group-hover:text-forest-200'
                  }`}
                />
                <div className="truncate text-left">
                  <div className="text-xs font-semibold leading-tight truncate">{item.name}</div>
                  <div className="text-[10px] text-forest-300 font-normal leading-tight truncate">
                    {item.subtitle}
                  </div>
                </div>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Storefront Link & Admin User Footer */}
      <div className="p-3 border-t border-forest-800/80 bg-forest-950/90 space-y-2 shrink-0">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-semibold text-emerald-300 bg-forest-900/80 hover:bg-forest-850 transition-colors border border-forest-800"
        >
          <div className="flex items-center gap-2">
            <Store size={15} />
            <span>Open Customer Website</span>
          </div>
          <ExternalLink size={13} className="text-emerald-400/80" />
        </a>

        <div className="flex items-center justify-between px-2 pt-1 text-xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-forest-800 border border-forest-700 flex items-center justify-center text-xs font-bold text-emerald-300 shrink-0">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="truncate">
              <p className="font-semibold text-slate-100 truncate text-xs">
                {user?.fullName || 'Manager'}
              </p>
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
