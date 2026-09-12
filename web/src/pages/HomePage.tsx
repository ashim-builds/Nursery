import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../api/product.api';
import { ProductCard } from '../components/product/ProductCard';
import { SEO } from '../components/common/SEO';
import {
  Sprout,
  ArrowRight,
  Truck,
  MapPin,
  Phone,
  Mail,
  Clock,
  ExternalLink,
  Smartphone,
  Download,
  CheckCircle,
  Shield,
  Search,
  X,
} from 'lucide-react';
import { siteSettingsApi } from '../api/site-settings.api';
import { useUI } from '../context/UIContext';
import { usePWA } from '../context/PWAContext';
import { useAuth } from '../context/AuthContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { promptInstall, isInstalled } = usePWA();
  const { showToast } = useUI();
  const { isAdmin } = useAuth();
  const [isBannerDismissed, setIsBannerDismissed] = useState(() => {
    return localStorage.getItem('rj_home_app_banner_dismissed') === 'true';
  });

  const handleDismissBanner = () => {
    setIsBannerDismissed(true);
    localStorage.setItem('rj_home_app_banner_dismissed', 'true');
  };

  const handleInstallApp = async () => {
    const res = await promptInstall();
    if (res === 'accepted') {
      showToast('The Bloom Patch app installed successfully!', 'success');
    }
  };

  // Show the eight newest published products added from the admin panel.
  const { data: latestProductsData, isLoading: latestProductsLoading } = useQuery({
    queryKey: ['latest-products'],
    queryFn: () => productApi.getProducts({ limit: 8, sortBy: 'newest' }),
  });

  // Fetch Site Settings for verified phone, email, and location
  const { data: siteSettings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: siteSettingsApi.getSettings,
  });

  const businessName = siteSettings?.businessName || 'The Bloom Patch';

  const nurserySchema = {
    '@context': 'https://schema.org',
    '@type': 'GardenStore',
    name: businessName,
    image:
      'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=1200&q=80',
    url: typeof window !== 'undefined' ? window.location.origin : '/',
    telephone: siteSettings?.phone ? `+977-${siteSettings.phone}` : '+977-9815155580',
    priceRange: 'रू 200 - रू 25,000',
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteSettings?.address || 'Pokhara-26, Arghau Chowk',
      addressLocality: siteSettings?.city || 'Pokhara',
      addressRegion: siteSettings?.province || 'Gandaki',
      postalCode: '33700',
      addressCountry: 'NP',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: Number(siteSettings?.latitude) || 28.2365,
      longitude: Number(siteSettings?.longitude) || 84.0036,
    },
  };

  return (
    <div className="space-y-8 sm:space-y-12 pb-16">
      {/* Dynamic SEO Meta */}
      <SEO
        title={`${businessName} | Flowers and Nursery in Pokhara`}
        description={`${businessName} and Nursery in Pokhara-26, Arghau Chowk. Shop flowers and plants with delivery across Pokhara.`}
        canonical={typeof window !== 'undefined' ? `${window.location.origin}/` : '/'}
        structuredData={nurserySchema}
      />

      {/* Admin Quick Access Banner (Mobile & Desktop) */}
      {isAdmin && (
        <div className="mx-3 sm:mx-6 lg:mx-8 mt-3 bg-gradient-to-r from-amber-950 via-forest-950 to-emerald-950 text-white p-3.5 sm:p-4 rounded-2xl border border-amber-500/40 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
              <Shield size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-amber-200">Admin Mode Active</span>
                <span className="text-[10px] bg-amber-500/30 text-amber-200 px-2 py-0.5 rounded-full font-mono font-semibold">Staff Access</span>
              </div>
              <p className="text-[11px] text-forest-200 truncate">Manage plants, inventory, orders & store settings</p>
            </div>
          </div>
          <Link
            to="/admin"
            className="w-full sm:w-auto text-center shrink-0 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <span>Go to Admin Panel</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Mobile Search Bar (as shown in mobile mockup) */}
      <div className="md:hidden px-3 sm:px-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const input = form.elements.namedItem('mobileSearch') as HTMLInputElement;
            if (input?.value.trim()) {
              navigate(`/catalog?search=${encodeURIComponent(input.value.trim())}`);
            }
          }}
          className="relative flex items-center"
        >
          <Search size={17} className="absolute left-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            name="mobileSearch"
            placeholder="Search flowers..."
            className="w-full bg-[#f8faf9] border border-slate-200/90 text-slate-800 placeholder-slate-400 text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-600/30 focus:border-forest-600 transition-all shadow-2xs"
          />
        </form>
      </div>

      {/* 1. Hero Section (Seamless Floral Panorama for Web & Mobile, No Borders) */}
      <section className="mx-3 sm:mx-6 lg:mx-8 mt-1 sm:mt-4">
        {/* Desktop / Tablet Hero Banner (Seamless Full-Width Floral Panorama, No Borders) */}
        <div className="hidden md:block relative rounded-3xl overflow-hidden shadow-xs bg-[#fbf6f5] min-h-[360px] lg:min-h-[420px] xl:min-h-[460px]">
          {/* Background Floral Image positioned on the right */}
          <img
            src="/hero-flowers-banner.jpg"
            alt="Make Every Moment Special"
            className="absolute inset-0 w-full h-full object-cover object-right select-none pointer-events-none"
          />
          {/* Soft Left Gradient Overlay to guarantee pristine text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#fbf6f5] via-[#fbf6f5]/85 to-transparent w-full md:w-3/4 lg:w-3/5 pointer-events-none" />

          {/* Left Content Column */}
          <div className="relative z-10 p-8 lg:p-14 xl:p-16 max-w-xl flex flex-col justify-center min-h-[360px] lg:min-h-[420px] xl:min-h-[460px] space-y-4 lg:space-y-6">
            <span className="text-forest-700 font-bold text-xs tracking-widest uppercase">
              Fresh Flowers
            </span>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#14281d] leading-[1.12] tracking-tight">
              Make Every <br />
              Moment Special
            </h1>

            <p className="text-slate-600 text-sm sm:text-base font-normal max-w-md leading-relaxed">
              Beautiful bouquets for birthdays, anniversaries, gifts and more.
            </p>

            <div className="pt-2">
              <Link
                to="/catalog"
                className="bg-[#1b4332] hover:bg-[#143225] text-white font-medium text-xs sm:text-sm px-7 py-3 rounded-full inline-flex items-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-98"
              >
                <span>Shop Now</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Hero Banner (Seamless Floral Panorama matching Web feel, No Borders) */}
        <div className="md:hidden relative rounded-2xl overflow-hidden shadow-xs bg-[#fbf6f5] min-h-[220px] sm:min-h-[250px]">
          {/* Background Floral Image positioned on the right */}
          <img
            src="/hero-flowers-banner.jpg"
            alt="Make Every Moment Special"
            className="absolute inset-0 w-full h-full object-cover object-right select-none pointer-events-none"
          />
          {/* Soft Left Gradient Overlay for seamless text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#fbf6f5] via-[#fbf6f5]/90 to-transparent w-[72%] pointer-events-none" />

          {/* Left Content Column */}
          <div className="relative z-10 p-5 sm:p-6 max-w-[62%] flex flex-col justify-center min-h-[220px] sm:min-h-[250px] space-y-2">
            <span className="text-forest-700 font-bold text-[10px] uppercase tracking-widest">
              Fresh Flowers
            </span>

            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#14281d] leading-tight">
              Make Every <br />
              Moment Special
            </h2>

            <p className="text-slate-600 text-[11px] leading-snug line-clamp-2">
              Beautiful bouquets for birthdays, anniversaries, and gifts.
            </p>

            <div className="pt-1.5">
              <Link
                to="/catalog"
                className="bg-[#1b4332] hover:bg-[#143225] active:scale-95 text-white text-[11px] font-semibold px-4 py-2 rounded-full inline-flex items-center gap-1.5 shadow-sm shadow-emerald-950/20 transition-transform"
              >
                <span>Shop Now</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PWA Mobile App Installation Banner */}
      {!isBannerDismissed && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-r from-emerald-900 via-forest-900 to-forest-950 rounded-3xl p-5 sm:p-7 border border-emerald-500/30 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Top Right Cross (Close) Button */}
            <button
              onClick={handleDismissBanner}
              className="absolute top-3 right-3 p-1.5 text-forest-300 hover:text-white bg-forest-950/60 hover:bg-forest-900 rounded-full transition-colors"
              title="Close"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3.5 text-center sm:text-left flex-col sm:flex-row pr-6 sm:pr-0">
              <img
                src="/the-bloom-patch-logo.png"
                alt="The Bloom Patch App Logo"
                className="w-14 h-14 rounded-2xl shadow-lg border border-emerald-400/30 object-contain bg-white p-1 shrink-0"
              />
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                  Official Mobile App
                </div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                  Install {businessName} App
                </h3>
                <p className="text-xs text-forest-200 mt-0.5">
                  Fast 1-tap plant shopping & live delivery tracking directly from your phone home screen.
                </p>
              </div>
            </div>

            {isInstalled ? (
              <button
                onClick={handleDismissBanner}
                className="w-full sm:w-auto bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 shrink-0"
                title="Dismiss Banner"
              >
                <X size={16} />
                <span>Dismiss</span>
              </button>
            ) : (
              <button
                onClick={handleInstallApp}
                className="w-full sm:w-auto bg-emerald-400 hover:bg-emerald-300 text-forest-950 font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 shrink-0"
              >
                <Download size={16} />
                <span>Install Mobile App</span>
              </button>
            )}
          </div>
        </section>
      )}

      {/* 3. Featured Products Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-slate-900">
              Latest Plants
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Handpicked favorites for home and office
            </p>
          </div>
          <Link
            to="/catalog"
            className="text-xs font-bold text-forest-700 hover:text-forest-900 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {latestProductsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : !latestProductsData?.products || latestProductsData.products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-2">
            <Sprout size={32} className="mx-auto text-slate-300" />
            <h3 className="font-serif font-bold text-base text-slate-800">
              Fresh Catalog Opening Soon
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              New botanical stock is being potted. Check back shortly!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {latestProductsData.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
