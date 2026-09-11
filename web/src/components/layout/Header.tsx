import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, X, Sprout, Shield, LogOut } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { useQuery } from '@tanstack/react-query';
import { siteSettingsApi } from '../../api/site-settings.api';

export const Header: React.FC = () => {
  const { itemCount } = useCart();
  const { openCartDrawer, isSearchOpen, toggleSearch, closeSearch } = useUI();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();
  const { data: siteSettings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: siteSettingsApi.getSettings,
  });
  const businessName = siteSettings?.businessName || 'RJ Flowers';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchInput.trim())}`);
      closeSearch();
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full glass-header border-b border-forest-100/80 transition-all bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src="/rj-flowers-icon.svg"
                alt={`${businessName} logo`}
                className="w-8 h-8 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform border border-emerald-500/20"
              />
              <div className="flex flex-col">
                <span className="font-serif font-bold text-lg sm:text-xl tracking-tight text-forest-950 leading-none">
                  {businessName}
                </span>
                <span className="text-[10px] tracking-widest text-forest-600 uppercase font-semibold">
                  Flowers & Nursery
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-forest-900">
            <Link to="/" className="hover:text-forest-600 transition-colors">
              Home
            </Link>

            {/* Simple Direct Shop Link */}
            <Link to="/catalog" className="hover:text-forest-600 transition-colors font-medium">
              Shop
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="text-amber-700 font-semibold flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200"
              >
                <Shield size={14} />
                <span>Admin Portal</span>
              </Link>
            )}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Search Button */}
            <button
              onClick={toggleSearch}
              className="p-2 text-forest-900 hover:bg-forest-100/80 rounded-full transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Desktop User profile or Login */}
            <div className="hidden sm:block">
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 text-xs font-semibold bg-forest-100 hover:bg-forest-200 text-forest-900 px-3 py-1.5 rounded-full transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>{user?.fullName.split(' ')[0]}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="p-1.5 text-slate-500 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors"
                    title="Sign out"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="text-xs font-semibold text-forest-800 hover:text-forest-950 px-3 py-1.5 border border-forest-300 rounded-full hover:bg-forest-50 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Notification Bell */}
            <NotificationCenter variant="customer" />

            {/* Cart Trigger */}
            <button
              onClick={openCartDrawer}
              className="relative p-2 text-forest-900 hover:bg-forest-100/80 rounded-full transition-colors"
              aria-label="Open Cart"
            >
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-terracotta-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-scale shadow-sm">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Expandable Search Input Bar */}
        {isSearchOpen && (
          <div className="py-2.5 pb-3 border-t border-forest-100 animate-in fade-in slide-in-from-top-2">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="Search indoor plants, bouquets, pots, seeds..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                autoFocus
                className="w-full bg-white border border-forest-300 focus:border-forest-600 focus:ring-2 focus:ring-forest-200 rounded-xl px-4 py-2 text-sm pl-10 pr-20 outline-none text-slate-900 placeholder:text-slate-600 transition-all shadow-sm"
              />
              <Search size={16} className="absolute left-3.5 text-forest-500 pointer-events-none" />
              <div className="absolute right-2 flex items-center gap-1">
                <button
                  type="submit"
                  className="bg-forest-700 hover:bg-forest-800 text-white text-xs px-2.5 py-1 rounded-lg font-medium transition-colors"
                >
                  Find
                </button>
                <button
                  type="button"
                  onClick={closeSearch}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                >
                  <X size={16} />
                </button>
              </div>
            </form>

            {/* Quick search pills */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar py-0.5 text-xs">
              <span className="text-slate-600 font-medium shrink-0">Popular:</span>
              {['Monstera', 'Money Plant', 'Sayapatri', 'Peace Lily', 'Rose Bouquet', 'Succulent', 'Terracotta'].map(
                (term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setSearchInput(term);
                      navigate(`/catalog?search=${encodeURIComponent(term)}`);
                      closeSearch();
                    }}
                    className="bg-white hover:bg-forest-50 text-forest-800 border border-forest-200 rounded-full px-2.5 py-0.5 whitespace-nowrap transition-colors"
                  >
                    {term}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
