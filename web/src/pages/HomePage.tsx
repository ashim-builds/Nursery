import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';
import axios from 'axios';
import { useUI } from '../context/UIContext';

export const HomePage: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const { showToast } = useUI();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallSuccess(true);
      }
      setDeferredPrompt(null);
    } else {
      // If iOS or PWA prompt unavailable, show browser instruction
      showToast(
        'To install RJ Flowers on your phone:\n\n• On iPhone/Safari: Tap Share (⎋) and select "Add to Home Screen" (+).\n• On Android/Chrome: Tap the 3 dots menu (⋮) and tap "Install app" or "Add to Home Screen".'
        , 'info'
      );
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
    queryFn: async () => {
      const res = await axios.get('/api/site-settings');
      return res.data?.data;
    },
  });

  const nurserySchema = {
    '@context': 'https://schema.org',
    '@type': 'GardenStore',
    name: siteSettings?.businessName || 'RJ Flowers',
    image:
      'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=1200&q=80',
    url: 'https://ktmbotanica.com',
    telephone: siteSettings?.phone ? `+977-${siteSettings.phone}` : '+977-9800000000',
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
        title="RJ Flowers | Flowers and Nursery in Pokhara"
        description="RJ Flowers and Nursery in Pokhara-26, Arghau Chowk. Shop flowers and plants with delivery across Pokhara."
        canonical="https://rjflowers.com/"
        structuredData={nurserySchema}
      />

      {/* 1. Mobile-First Botanical Hero Section */}
      <section className="relative overflow-hidden rounded-3xl mx-3 sm:mx-6 lg:mx-8 mt-3 sm:mt-6 bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 text-white shadow-lifted">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-terracotta-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-5 py-8 sm:py-12 md:py-16 lg:py-16 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-center lg:text-left">
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md">
              <Sprout size={14} className="text-emerald-400" />
              <span>Kathmandu’s Premier Botanical Nursery</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
              Bring Living Nature <br className="hidden sm:inline" />
              <span className="text-emerald-300 italic">Into Your Home.</span>
            </h1>

            <p className="text-forest-100 text-xs sm:text-base font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
              Acclimatized indoor foliage, outdoor plants, and hand-turned clay planters delivered
              with care across Kathmandu, Lalitpur, and Bhaktapur.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <Link
                to="/catalog"
                className="bg-emerald-400 hover:bg-emerald-300 text-forest-950 font-bold px-6 py-3.5 rounded-2xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-98"
              >
                <span>Shop Plants & Products</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Valley Trust Signal */}
            <div className="pt-2 flex items-center justify-center lg:justify-start gap-2 text-xs text-forest-200">
              <Truck size={15} className="text-emerald-400" />
              <span>
                {siteSettings?.defaultDeliveryMessage ||
                  'Same-day careful delivery across Kathmandu Valley'}
              </span>
            </div>
          </div>

          {/* Right Column: Plant Showcase Image */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-[340px] lg:h-[340px] xl:w-[380px] xl:h-[380px] rounded-3xl overflow-hidden border-2 border-emerald-400/30 shadow-2xl bg-forest-900/50 backdrop-blur-md group">
              <img
                src="/hero-plant.jpg"
                alt="Kathmandu Botanical Plant Nursery"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3.5 left-3.5 right-3.5 bg-forest-950/85 backdrop-blur-md rounded-2xl p-3 border border-emerald-500/20 text-left flex items-center gap-3 shadow-lg">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-emerald-300 truncate">
                    Acclimatized Nursery Stock
                  </p>
                  <p className="text-[10px] text-forest-200 truncate">
                    Guaranteed healthy on arrival in KTM
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PWA Mobile App Installation Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-900 via-forest-900 to-forest-950 rounded-3xl p-5 sm:p-7 border border-emerald-500/30 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left flex-col sm:flex-row">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <Smartphone size={24} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                Install KtmBotanica App
              </h3>
              <p className="text-xs text-forest-200 mt-0.5">
                Fast 1-tap plant shopping & live delivery tracking directly from your phone home
                screen.
              </p>
            </div>
          </div>

          <button
            onClick={handleInstallApp}
            className="w-full sm:w-auto bg-emerald-400 hover:bg-emerald-300 text-forest-950 font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 shrink-0"
          >
            {installSuccess || isInstalled ? (
              <>
                <CheckCircle size={16} className="text-forest-950" />
                <span>App Installed</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Install Mobile App</span>
              </>
            )}
          </button>
        </div>
      </section>

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
