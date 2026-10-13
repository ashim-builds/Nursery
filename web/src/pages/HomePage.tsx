import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { productApi } from "../api/product.api";
import { ProductCard } from "../components/product/ProductCard";
import { OptimizedImage } from "../components/common/OptimizedImage";
import { SEO } from "../components/common/SEO";
import { getSessionCache, setSessionCache } from "../utils/sessionCache";
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
  Sparkles,
  X,
} from "lucide-react";
import { siteSettingsApi } from "../api/site-settings.api";
import { useUI } from "../context/UIContext";
import { usePWA } from "../context/PWAContext";
import { useAuth } from "../context/AuthContext";

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { promptInstall, isInstalled } = usePWA();
  const { showToast } = useUI();
  const { isAdmin } = useAuth();
  const [isBannerDismissed, setIsBannerDismissed] = useState(() => {
    return localStorage.getItem("rj_home_app_banner_dismissed") === "true";
  });

  const handleDismissBanner = () => {
    setIsBannerDismissed(true);
    localStorage.setItem("rj_home_app_banner_dismissed", "true");
  };

  const handleInstallApp = async () => {
    const res = await promptInstall();
    if (res === "accepted") {
      showToast("The Bloom Patch app installed successfully!", "success");
    }
  };

  // Show the eight newest published products added from the admin panel.
  const { data: latestProductsData, isLoading: latestProductsLoading } =
    useQuery({
      queryKey: ["latest-products"],
      queryFn: async () => {
        const data = await productApi.getProducts({ limit: 8, sortBy: "newest" });
        setSessionCache("home:latest-products", data);
        return data;
      },
      initialData: () => getSessionCache<any>("home:latest-products") ?? undefined,
      initialDataUpdatedAt: () => 0,
    });

  // Fetch Categories for quick navigation & 0 CLS cards
  const { data: categoriesData } = useQuery({
    queryKey: ["categories-home"],
    queryFn: async () => {
      const data = await productApi.getCategories();
      setSessionCache("categories:all", data);
      return data;
    },
    initialData: () => getSessionCache<any>("categories:all") ?? undefined,
    initialDataUpdatedAt: () => 0,
  });

  // Fetch Site Settings for verified phone, email, and location
  const { data: siteSettings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: siteSettingsApi.getSettings,
  });

  const businessName = siteSettings?.businessName || "The Bloom Patch";

  const nurserySchema = {
    "@context": "https://schema.org",
    "@type": ["Florist", "GardenStore", "LocalBusiness"],
    "@id": "https://rjflowers.com/#business",
    name: "RJ Flowers & Nursery",
    legalName: "RJ Flowers & Nursery",
    alternateName: [
      "RJ Flowers",
      "Bloom Patch",
      "The Bloom Patch",
      "Bloom Patch Pokhara",
      "RJ Flowers & Nursery"
    ],
    image: [
      "https://rjflowers.com/the-bloom-patch-logo.png",
      "https://rjflowers.com/hero-flowers-banner.jpg",
      "https://rjflowers.com/hero-plant.jpg"
    ],
    url: "https://rjflowers.com/",
    telephone: siteSettings?.phone ? `+977-${siteSettings.phone}` : "+977-9815155580",
    priceRange: "रू 200 - रू 25,000",
    currenciesAccepted: "NPR",
    paymentAccepted: "Cash, eSewa, Khalti, Mobile Banking, Card",
    address: {
      "@type": "PostalAddress",
      streetAddress: siteSettings?.address || "Pokhara-26, Arghau Chowk",
      addressLocality: siteSettings?.city || "Pokhara",
      addressRegion: siteSettings?.province || "Gandaki",
      postalCode: "33700",
      addressCountry: "NP",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: Number(siteSettings?.latitude) || 28.2365,
      longitude: Number(siteSettings?.longitude) || 84.0036,
    },
    hasMap: "https://maps.google.com/?q=28.2365,84.0036",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "07:00",
        closes: "19:00"
      }
    ],
    sameAs: [
      "https://www.facebook.com/p/RJ-Flower-Nursery-100038914454450/"
    ]
  };

  return (
    <div className="space-y-8 sm:space-y-12 pb-16">
      {/* Dynamic SEO Meta */}
      <SEO
        title="RJ Flowers | Bloom Patch & Flower Nursery in Pokhara"
        description="RJ Flowers is Pokhara's premier flower shop and plant nursery at Arghau Chowk. Discover fresh floral bouquets, indoor plants, and garden supplies through our Bloom Patch collection with delivery across Pokhara."
        keywords="RJ Flowers, RJ Flowers Pokhara, Flower shop Pokhara, Flower nursery Pokhara, Bloom Patch Pokhara, buy plants Pokhara, flower delivery Pokhara"
        canonical="https://rjflowers.com/"
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
                <span className="font-bold text-xs sm:text-sm text-amber-200">
                  Admin Mode Active
                </span>
                <span className="text-[10px] bg-amber-500/30 text-amber-200 px-2 py-0.5 rounded-full font-mono font-semibold">
                  Staff Access
                </span>
              </div>
              <p className="text-[11px] text-forest-200 truncate">
                Manage plants, inventory, orders & store settings
              </p>
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

      {/* 1. Hero Section (Seamless Floral Panorama for Web & Mobile, No Borders) */}
      <section className="mx-3 sm:mx-6 lg:mx-8 mt-2 sm:mt-4">
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
              RJ Flowers &bull; Bloom Patch Collection
            </span>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#14281d] leading-[1.12] tracking-tight">
              Make Every <br />
              Moment Special
            </h1>

            <p className="text-slate-600 text-sm sm:text-base font-normal max-w-md leading-relaxed">
              RJ Flowers &amp; Nursery in Pokhara — Handcrafted bouquets through our signature{' '}
              <Link to="/bloom-patch" className="text-forest-800 font-semibold underline underline-offset-2 hover:text-forest-950">
                Bloom Patch
              </Link>{' '}
              collection, rare houseplants, outdoor blooms, and garden supplies delivered across Pokhara.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/catalog"
                className="bg-[#1b4332] hover:bg-[#143225] text-white font-semibold text-xs sm:text-sm px-7 py-3 rounded-full inline-flex items-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-98"
              >
                <span>Shop Now</span>
                <ArrowRight size={15} />
              </Link>
              <Link
                to="/bloom-patch"
                className="bg-white/90 hover:bg-white text-forest-900 border border-forest-300 font-semibold text-xs sm:text-sm px-5 py-3 rounded-full inline-flex items-center gap-1.5 shadow-2xs transition-all active:scale-98"
              >
                <Sparkles size={14} className="text-forest-600" />
                <span>Explore Bloom Patch</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Hero Banner (Seamless Floral Panorama matching Web feel, No Borders) */}
        <div className="md:hidden relative rounded-2xl overflow-hidden shadow-xs bg-[#fbf6f5] min-h-[230px] xs:min-h-[250px]">
          {/* Background Floral Image positioned on the right */}
          <img
            src="/hero-flowers-banner.jpg"
            alt="Make Every Moment Special"
            className="absolute inset-0 w-full h-full object-cover object-right select-none pointer-events-none"
          />
          {/* Soft Left Gradient Overlay for seamless text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#fbf6f5] via-[#fbf6f5]/95 to-transparent w-[80%] xs:w-[75%] pointer-events-none" />

          {/* Left Content Column */}
          <div className="relative z-10 p-4 xs:p-5 max-w-[82%] xs:max-w-[74%] flex flex-col justify-center min-h-[230px] xs:min-h-[250px] space-y-2">
            <span className="text-forest-700 font-bold text-[10px] uppercase tracking-widest">
              RJ Flowers &bull; Bloom Patch
            </span>

            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#14281d] leading-tight">
              Make Every <br />
              Moment Special
            </h2>

            <p className="text-slate-600 text-[11px] leading-snug line-clamp-2">
              Fresh flowers &amp; plants in Pokhara. Explore our{' '}
              <Link to="/bloom-patch" className="underline font-semibold text-forest-900">
                Bloom Patch
              </Link>{' '}
              collection.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2">
              <Link
                to="/catalog"
                className="bg-[#1b4332] hover:bg-[#143225] active:scale-95 text-white text-xs font-semibold px-4 py-2 rounded-full inline-flex items-center gap-1.5 shadow-sm shadow-emerald-950/20 transition-transform"
              >
                <span>Shop Now</span>
                <ArrowRight size={13} />
              </Link>
              <Link
                to="/bloom-patch"
                className="bg-white/90 hover:bg-white active:scale-95 text-forest-900 border border-forest-300 text-xs font-semibold px-3 py-2 rounded-full inline-flex items-center gap-1 shadow-2xs backdrop-blur-xs transition-transform"
              >
                <Sparkles size={12} className="text-forest-600" />
                <span>Bloom Patch</span>
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* 2. PWA Mobile App Installation Banner (Ultra-Compact & High-UX) */}
      {!isBannerDismissed && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden bg-gradient-to-r from-forest-950 via-[#102a1e] to-emerald-950 rounded-2xl p-2.5 sm:p-3.5 border border-emerald-500/30 text-white shadow-md flex items-center justify-between gap-2.5 sm:gap-4">
            {/* Ambient background glow */}
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-400/10 rounded-full blur-xl pointer-events-none" />

            {/* Left: App Logo & Info */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <img
                src="/the-bloom-patch-logo.png"
                alt="App Logo"
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl shadow-sm border border-emerald-400/30 object-contain bg-white p-0.5 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 leading-none mb-0.5">
                  <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold uppercase tracking-wider border border-emerald-400/20 shrink-0">
                    Official App
                  </span>
                </div>
                <h3 className="font-semibold text-xs sm:text-sm text-white truncate">
                  Install {businessName} App
                </h3>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {isInstalled ? (
                <button
                  onClick={handleDismissBanner}
                  className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 font-bold text-xs px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl flex items-center gap-1 shadow-sm transition-transform active:scale-95"
                  title="Dismiss Banner"
                >
                  <X size={13} />
                  <span>Dismiss</span>
                </button>
              ) : (
                <button
                  onClick={handleInstallApp}
                  className="bg-emerald-400 hover:bg-emerald-300 text-forest-950 font-bold text-xs px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 whitespace-nowrap"
                >
                  <Download size={13} />
                  <span>Install</span>
                </button>
              )}
              <button
                onClick={handleDismissBanner}
                className="p-1 sm:p-1.5 text-forest-300 hover:text-white hover:bg-forest-900/60 rounded-lg transition-colors"
                title="Close"
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 2b. Botanical Categories Showcase */}
      {categoriesData && categoriesData.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-3.5">
            <div>
              <h2 className="font-serif font-bold text-lg sm:text-2xl text-slate-900">
                Explore Collections
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Potted houseplants, exotic blooms, terracotta & gardening essentials
              </p>
            </div>
            <Link
              to="/categories"
              className="text-xs font-bold text-forest-700 hover:text-forest-900 flex items-center gap-1"
            >
              <span>All Collections</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
            {categoriesData.slice(0, 6).map((cat: any) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="group bg-white p-3 rounded-2xl border border-slate-200/90 hover:border-emerald-400/80 shadow-2xs hover:shadow-sm transition-all duration-300 flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 aspect-square rounded-2xl overflow-hidden mb-2 bg-forest-50/60 p-1">
                  <OptimizedImage
                    src={cat.imageUrl}
                    alt={cat.name}
                    aspectRatio="square"
                    fit="cover"
                    className="w-full h-full rounded-xl"
                    imgClassName="group-hover:scale-108 transition-transform duration-500"
                  />
                </div>
                <span className="font-semibold text-xs text-slate-800 group-hover:text-forest-800 line-clamp-1 transition-colors">
                  {cat.name}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  {cat._count?.products ? `${cat._count.products} plants` : 'Explore →'}
                </span>
              </Link>
            ))}
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

        {latestProductsLoading && !latestProductsData?.products?.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-64 bg-slate-100 animate-pulse rounded-2xl"
              />
            ))}
          </div>
        ) : !latestProductsData?.products ||
          latestProductsData.products.length === 0 ? (
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
            {latestProductsData.products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
