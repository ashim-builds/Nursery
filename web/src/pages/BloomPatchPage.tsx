import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Sprout,
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Truck,
  CheckCircle2,
  Navigation,
  Sparkles,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { siteSettingsApi } from '../api/site-settings.api';
import { productApi } from '../api/product.api';
import { ProductCard } from '../components/product/ProductCard';

export const BloomPatchPage: React.FC = () => {
  const { data: siteSettings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: siteSettingsApi.getSettings,
  });

  const { data: featuredProductsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ['bloom-patch-featured-products'],
    queryFn: () => productApi.getProducts({ limit: 4, sortBy: 'popular' }),
  });

  const phone =
    siteSettings?.phone && siteSettings.phone !== '9800000000'
      ? siteSettings.phone
      : '9815155580';
  const whatsappPhone = siteSettings?.whatsappPhone || phone;
  const address =
    siteSettings?.address || 'Pokhara-26, Arghau Chowk, Pokhara, Nepal';
  const openingHours =
    siteSettings?.openingHours || 'Every day: 7:00 AM – 7:00 PM';

  const pageStructuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': 'https://rjflowers.com/bloom-patch#webpage',
      url: 'https://rjflowers.com/bloom-patch',
      name: 'Bloom Patch Pokhara | RJ Flowers',
      description:
        "Bloom Patch is the specialized floral collection and boutique of RJ Flowers & Nursery in Pokhara-26, Arghau Chowk. Discover fresh floral bouquets, indoor houseplants, succulents, outdoor blooms, and garden accessories with delivery across Pokhara.",
      isPartOf: {
        '@type': 'WebSite',
        '@id': 'https://rjflowers.com/#website',
        name: 'RJ Flowers & Nursery',
        url: 'https://rjflowers.com/',
      },
      about: {
        '@id': 'https://rjflowers.com/#business',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Home',
          'item': 'https://rjflowers.com/',
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': 'Bloom Patch',
          'item': 'https://rjflowers.com/bloom-patch',
        },
      ],
    },
  ];

  return (
    <div className="space-y-10 sm:space-y-14 pb-24">
      {/* 1. Page SEO Metadata */}
      <SEO
        title="Bloom Patch Pokhara | RJ Flowers"
        description="Bloom Patch is the specialized floral collection and boutique of RJ Flowers & Nursery in Pokhara-26, Arghau Chowk. Discover fresh floral bouquets, indoor houseplants, succulents, outdoor blooms, and garden accessories with delivery across Pokhara."
        keywords="Bloom Patch, Bloom Patch Pokhara, Bloom Patch RJ Flowers, RJ Flowers, RJ Flowers Pokhara, flower shop Pokhara, flower nursery Pokhara, fresh flowers Pokhara, plant nursery Arghau Chowk"
        canonical="https://rjflowers.com/bloom-patch"
        ogType="website"
        ogImage="/hero-flowers-banner.jpg"
        structuredData={pageStructuredData}
      />

      {/* 2. Breadcrumbs & Header Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {/* Navigation Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-4 sm:mb-6"
        >
          <Link
            to="/"
            className="hover:text-forest-700 transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={13} />
            <span>RJ Flowers Home</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-forest-900 font-semibold">Bloom Patch</span>
        </nav>

        {/* Hero Visual Card */}
        <div className="relative rounded-3xl overflow-hidden shadow-soft bg-[#fbf6f5] border border-forest-100/70 min-h-[380px] lg:min-h-[440px] flex flex-col justify-center">
          {/* Background image showing actual fresh floral arrangements */}
          <img
            src="/hero-flowers-banner.jpg"
            alt="Fresh floral bouquet arrangement handcrafted by RJ Flowers Bloom Patch in Pokhara"
            className="absolute inset-0 w-full h-full object-cover object-right select-none pointer-events-none"
          />
          {/* Subtle soft gradient overlay to guarantee text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#fbf6f5] via-[#fbf6f5]/90 to-transparent w-full md:w-3/4 lg:w-3/5 pointer-events-none" />

          {/* Hero Content */}
          <div className="relative z-10 p-6 sm:p-10 lg:p-14 max-w-xl space-y-4 sm:space-y-5">
            <div className="inline-flex items-center gap-2 bg-emerald-100/80 text-forest-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-300/60">
              <Sprout size={14} className="text-emerald-700" />
              <span>Curated by RJ Flowers & Nursery</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-forest-950 leading-[1.15] tracking-tight">
              Bloom Patch – <br />
              RJ Flowers Pokhara
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Bloom Patch is the signature floral showcase and curated boutique
              experience created by <strong>RJ Flowers &amp; Nursery</strong> in
              Pokhara. We bring together fresh botanical cuts, seasonal floral
              bouquets, and acclimatized greenhouse plants grown with care in
              Gandaki.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/catalog"
                className="bg-forest-800 hover:bg-forest-900 text-white text-xs sm:text-sm font-semibold px-6 py-3 rounded-full inline-flex items-center gap-2 shadow-sm transition-all active:scale-98"
              >
                <span>Browse Products</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/contact"
                className="bg-white hover:bg-forest-50 text-forest-900 border border-forest-200 text-xs sm:text-sm font-semibold px-5 py-3 rounded-full inline-flex items-center gap-2 shadow-2xs transition-colors"
              >
                <span>Visit &amp; Contact</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. What is Bloom Patch & Relationship with RJ Flowers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-forest-700">
              <Sparkles size={14} />
              <span>Botanical Craftsmanship</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
              What is Bloom Patch at RJ Flowers?
            </h2>

            <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
              <p>
                <strong>Bloom Patch</strong> represents the dedicated floral
                studio and retail brand initiative of{' '}
                <strong>RJ Flowers &amp; Nursery</strong>, situated at Arghau
                Chowk in Pokhara-26. While the RJ Flowers greenhouse nurtures a
                broad variety of outdoor nursery stock, landscape greenery, and
                seedlings, the Bloom Patch collection highlights our finest
                ready-to-gift floral designs and premium indoor houseplants.
              </p>
              <p>
                Every arrangement featured under Bloom Patch is sourced, potted,
                and arranged directly by the experienced nursery team at RJ
                Flowers. This direct connection ensures every bloom is fresh,
                healthy, and perfectly acclimatized to Pokhara&apos;s climate.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-white border border-forest-100 shadow-2xs">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">One Trusted Location</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Nurtured at RJ Flowers Nursery in Pokhara-26.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-white border border-forest-100 shadow-2xs">
                <Truck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Pokhara-Wide Delivery</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Same-day doorstep delivery across Pokhara Valley.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Plant Showcase Banner Image */}
          <div className="relative rounded-3xl overflow-hidden bg-forest-50 border border-forest-100 shadow-soft">
            <img
              src="/hero-plant.jpg"
              alt="Lush potted green houseplants at RJ Flowers nursery in Pokhara"
              className="w-full h-80 sm:h-96 object-cover object-center hover:scale-102 transition-transform duration-500"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-forest-700 block">
                    Greenhouse Direct
                  </span>
                  <span className="font-serif font-bold text-slate-900 text-sm">
                    Healthy, Acclimatized Botanical Stock
                  </span>
                </div>
                <Link
                  to="/catalog"
                  className="text-xs font-bold text-forest-800 hover:text-forest-950 inline-flex items-center gap-1"
                >
                  <span>Shop</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Flowers, Plants & Products Available */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-2">
          <span className="text-xs uppercase tracking-widest text-forest-700 font-bold">
            Available at RJ Flowers
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Flowers &amp; Plants at Bloom Patch
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Everything offered through Bloom Patch is directly grown and prepared
            at our Pokhara greenhouse and flower shop.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Category 1: Fresh Flower Bouquets */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs hover:shadow-soft transition-all space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <ShoppingBag size={20} />
            </div>
            <h3 className="font-serif font-bold text-lg text-slate-900">
              Fresh Flower Bouquets
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Handcrafted rose bouquets, fresh seasonal floral arrangements,
              ceremonial garlands, and Sayapatri (marigold) blooms suitable for
              birthdays, anniversaries, weddings, and festive occasions.
            </p>
            <Link
              to="/catalog?search=Bouquet"
              className="inline-flex items-center gap-1 text-xs font-bold text-forest-700 hover:text-forest-900 pt-1"
            >
              <span>Explore flower bouquets</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {/* Category 2: Indoor Houseplants & Foliage */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs hover:shadow-soft transition-all space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Sprout size={20} />
            </div>
            <h3 className="font-serif font-bold text-lg text-slate-900">
              Indoor Plants &amp; Succulents
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Air-purifying indoor houseplants including Monstera Deliciosa,
              Money Plants, Peace Lilies, tabletop succulents, and decorative
              bonsai that thrive indoors in Pokhara homes and offices.
            </p>
            <Link
              to="/catalog"
              className="inline-flex items-center gap-1 text-xs font-bold text-forest-700 hover:text-forest-900 pt-1"
            >
              <span>Explore indoor plants</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {/* Category 3: Pots, Planters & Garden Accessories */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs hover:shadow-soft transition-all space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Sparkles size={20} />
            </div>
            <h3 className="font-serif font-bold text-lg text-slate-900">
              Planters &amp; Garden Supplies
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Handcrafted terracotta pots, decorative ceramic planters, hanging
              baskets, nutrient-rich potting soil mixes, and gardening
              accessories to keep your greenery flourishing.
            </p>
            <Link
              to="/catalog"
              className="inline-flex items-center gap-1 text-xs font-bold text-forest-700 hover:text-forest-900 pt-1"
            >
              <span>Explore pots &amp; accessories</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Live Product Showcase from the Catalog */}
      {featuredProductsData?.products && featuredProductsData.products.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h3 className="font-serif font-bold text-xl sm:text-2xl text-slate-900">
                Popular Botanical Items
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Current favorites ready for pickup or valley-wide delivery
              </p>
            </div>
            <Link
              to="/catalog"
              className="text-xs font-bold text-forest-700 hover:text-forest-900 flex items-center gap-1"
            >
              <span>View Full Catalog</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {featuredProductsData.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 6. Location, Hours, and How to Contact RJ Flowers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-forest-950 via-forest-900 to-[#102a1e] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-emerald-300 font-bold text-xs uppercase tracking-widest">
                Visit &amp; Order
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                How to Visit or Contact RJ Flowers
              </h2>
              <p className="text-xs sm:text-sm text-forest-200 leading-relaxed">
                Whether you wish to order a custom bouquet from Bloom Patch or
                walk through our greenhouse aisles at RJ Flowers, we welcome you
                every day of the week in Pokhara.
              </p>

              <div className="space-y-3 text-xs text-forest-200 pt-1">
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Address:</strong> {address}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Clock size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Hours:</strong> {openingHours}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Telephone:</strong> +977 {phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
              <a
                href={`tel:+977${phone}`}
                className="w-full inline-flex items-center justify-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-forest-950 font-bold text-sm py-3.5 px-6 rounded-2xl shadow-md transition-all text-center"
              >
                <Phone size={18} />
                <span>Call +977 {phone}</span>
              </a>

              <a
                href={`https://wa.me/977${whatsappPhone}?text=${encodeURIComponent(
                  'Hello RJ Flowers! I am inquiring about the Bloom Patch flower and plant collection.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] active:scale-98 text-white font-bold text-sm py-3.5 px-6 rounded-2xl shadow-md transition-all text-center"
              >
                <MessageCircle size={18} />
                <span>Message on WhatsApp</span>
              </a>

              <a
                href="https://maps.google.com/?q=28.2365,84.0036"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs py-3 px-6 rounded-2xl border border-white/20 transition-colors text-center"
              >
                <Navigation size={15} />
                <span>Get Directions in Google Maps</span>
              </a>
            </div>
          </div>

          {/* Subtle Ambient Glow */}
          <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        </div>
      </section>
    </div>
  );
};
