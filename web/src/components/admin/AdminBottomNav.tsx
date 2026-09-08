import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users,
} from 'lucide-react';

interface AdminBottomNavProps {
  pendingOrdersCount?: number;
}

export const AdminBottomNav: React.FC<AdminBottomNavProps> = ({
  pendingOrdersCount = 0,
}) => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
    { 
      name: 'Orders', 
      href: '/admin/orders', 
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined 
    },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Customers', href: '/admin/customers', icon: Users },
  ];

  return (
    <nav 
      className="lg:hidden fixed bottom-0 inset-x-0 bg-forest-950/95 backdrop-blur-md border-t border-forest-800/80 z-40 px-2 py-1 shadow-2xl safe-bottom"
      aria-label="Admin mobile navigation"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.href
            : location.pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all relative min-w-[56px] ${
                isActive
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-2'} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 bg-amber-500 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
