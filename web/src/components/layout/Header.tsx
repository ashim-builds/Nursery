import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, X, Sprout, Shield, LogOut } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { useQuery } from '@tanstack/react-query';
import { siteSettingsApi } from '../../api/site-settings.api';

import { getSessionCache, setSessionCache } from '../../utils/sessionCache';

export const Header: React.FC = () => {
  const { itemCount } = useCart();
  const { openCartDrawer, isSearchOpen, toggleSearch, closeSearch } = useUI();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();
  const { data: siteSettings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const data = await siteSettingsApi.getSettings();
      setSessionCache('site-settings:global', data);
      return data;
    },
    initialData: () => getSessionCache<any>('site-settings:global') ?? undefined,
    initialDataUpdatedAt: () => 0,
  });
  const businessName = siteSettings?.businessName || 'The Bloom Patch';

  // Live Instant Search Suggestions hydrated from client sessionStorage (0ms)
  const cachedCatalog = getSessionCache<any>('catalog:all:popular') || getSessionCache<any>('home:latest-products');
  const cachedCategories = getSessionCache<any[]>('categories:all') || [];

  const searchSuggestions = React.useMemo(() => {
    const query = searchInput.trim().toLowerCase();
    if (!query) return { products: [], categories: [] };

    const matchedProducts = (cachedCatalog?.products || [])
      .filter((p: any) => p.name?.toLowerCase().includes(query) || p.title?.toLowerCase().includes(query))
      .slice(0, 4);

    const matchedCategories = (cachedCategories || [])
      .filter((c: any) => c.name?.toLowerCase().includes(query))
      .slice(0, 2);

    return { products: matchedProducts, categories: matchedCategories };
  }, [searchInput, cachedCatalog, cachedCategories]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchInput.trim())}`);
      closeSearch();
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full glass-header border-b border-forest-100/80 transition-all bg-white/95 backdrop-blur-md pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src="/the-bloom-patch-logo.png"
                alt={`${businessName} logo`}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-contain shadow-xs group-hover:scale-105 transition-transform bg-white border border-slate-200/80 p-0.5"
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

            <Link to="/contact" className="hover:text-forest-600 transition-colors font-medium">
              Contact
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
            {/* Mobile Admin Shortcut Badge */}
            {isAdmin && (
              <Link
                to="/admin"
                className="lg:hidden flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 px-2 py-1 rounded-lg text-[11px] font-bold transition-all shadow-xs"
                title="Go to Admin Portal"
              >
                <Shield size={13} className="text-amber-700" />
                <span>Admin</span>
              </Link>
            )}

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

            {/* 0ms Instant Client Storage Search Suggestions Dropdown */}
            {searchInput.trim().length > 0 && (
              <div className="mt-2 bg-white rounded-2xl border border-forest-100 shadow-lifted overflow-hidden animate-in fade-in zoom-in-95">
                {searchSuggestions.categories.length > 0 && (
                  <div className="p-2 border-b border-slate-100 bg-forest-50/40">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700 px-2 block mb-1">
                      Categories
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {searchSuggestions.categories.map((c: any) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            navigate(`/category/${c.slug}`);
                            closeSearch();
                          }}
                          className="text-xs bg-white hover:bg-forest-100 text-forest-900 border border-forest-200 px-2.5 py-1 rounded-lg transition-colors font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <Sprout size={12} className="text-forest-600" />
                          <span>{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {searchSuggestions.products.length > 0 ? (
                  <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                    {searchSuggestions.products.map((p: any) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          navigate(`/products/${p.slug}`);
                          closeSearch();
                        }}
                        className="w-full p-2.5 hover:bg-forest-50/60 flex items-center gap-3 text-left transition-colors cursor-pointer group"
                      >
                        <div className="w-10 h-10 aspect-square rounded-lg overflow-hidden bg-slate-100 shrink-0">
                          <img
                            src={p.images?.[0]?.url || '/the-bloom-patch-logo.png'}
                            alt={p.name || p.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-xs text-slate-800 group-hover:text-forest-800 truncate block">
                            {p.title || p.name}
                          </span>
                          <span className="text-[11px] font-bold text-forest-700 block">
                            रू {p.pricing?.basePrice ?? p.basePrice}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-center">
                    <p className="text-xs text-slate-500">
                      Press <span className="font-bold text-forest-800">Find</span> or Enter to search the full catalog
                    </p>
                  </div>
                )}
              </div>
            )}

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
