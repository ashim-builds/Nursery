import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid, Heart, Package, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const BottomNav: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-forest-100 shadow-mobile-bar safe-bottom"
    >
      <div className="grid grid-cols-5 h-16 items-center max-w-md mx-auto px-1">
        {/* 1. Home */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 py-1 h-full min-h-[48px] touch-target transition-all ${
              isActive ? 'text-forest-800 font-bold scale-105' : 'text-slate-600 hover:text-forest-700'
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
            `flex flex-col items-center justify-center gap-1 py-1 h-full min-h-[48px] touch-target transition-all ${
              isActive ? 'text-forest-800 font-bold scale-105' : 'text-slate-600 hover:text-forest-700'
            }`
          }
        >
          <Grid size={20} />
          <span className="text-[10px] tracking-tight">Catalog</span>
        </NavLink>

        {/* 3. Wishlist */}
        <NavLink
          to={isAuthenticated ? '/profile?tab=wishlist' : '/login?redirect=/profile?tab=wishlist'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 py-1 h-full min-h-[48px] touch-target transition-all ${
              isActive ? 'text-forest-800 font-bold scale-105' : 'text-slate-600 hover:text-forest-700'
            }`
          }
        >
          <Heart size={20} className="text-terracotta-500" />
          <span className="text-[10px] tracking-tight">Wishlist</span>
        </NavLink>

        {/* 4. Orders */}
        <NavLink
          to={isAuthenticated ? '/profile?tab=orders' : '/login?redirect=/profile?tab=orders'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 py-1 h-full min-h-[48px] touch-target transition-all ${
              isActive ? 'text-forest-800 font-bold scale-105' : 'text-slate-600 hover:text-forest-700'
            }`
          }
        >
          <Package size={20} />
          <span className="text-[10px] tracking-tight">Orders</span>
        </NavLink>

        {/* 5. Account / Profile */}
        <NavLink
          to={isAuthenticated ? '/profile' : '/login'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 py-1 h-full min-h-[48px] touch-target transition-all ${
              isActive ? 'text-forest-800 font-bold scale-105' : 'text-slate-600 hover:text-forest-700'
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
