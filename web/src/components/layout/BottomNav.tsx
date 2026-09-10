import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Grid, Package, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const BottomNav: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Hide general bottom nav on product detail pages so product's dedicated sticky bar fits cleanly without double-stacking
  if (location.pathname.startsWith('/product/') || location.pathname.startsWith('/products/')) {
    return null;
  }

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#071a14] border-t border-forest-800 shadow-2xl safe-bottom"
    >
      <div className="grid grid-cols-4 h-14 items-center max-w-md mx-auto px-2">
        {/* 1. Home */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 py-1 h-full touch-target transition-all ${
              isActive ? 'text-white font-bold scale-105' : 'text-white/70 hover:text-white'
            }`
          }
        >
          <Home size={20} />
          <span className="text-[10px] tracking-tight">Home</span>
        </NavLink>

        {/* 2. Categories / Shop */}
        <NavLink
          to="/catalog"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 py-1 h-full touch-target transition-all ${
              isActive ? 'text-white font-bold scale-105' : 'text-white/70 hover:text-white'
            }`
          }
        >
          <Grid size={20} />
          <span className="text-[10px] tracking-tight">Catalog</span>
        </NavLink>

        {/* 3. Orders */}
        <NavLink
          to={isAuthenticated ? '/orders' : '/login?redirect=/orders'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 py-1 h-full touch-target transition-all ${
              isActive ? 'text-white font-bold scale-105' : 'text-white/70 hover:text-white'
            }`
          }
        >
          <Package size={20} />
          <span className="text-[10px] tracking-tight">Orders</span>
        </NavLink>

        {/* 4. Account / Profile */}
        <NavLink
          to={isAuthenticated ? '/profile' : '/login'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 py-1 h-full touch-target transition-all ${
              isActive ? 'text-white font-bold scale-105' : 'text-white/70 hover:text-white'
            }`
          }
        >
          <User size={20} />
          <span className="text-[10px] tracking-tight">{isAuthenticated ? 'Account' : 'Login'}</span>
        </NavLink>
      </div>
    </nav>
  );
};
