import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../api/product.api';
import { ProductCard } from '../components/product/ProductCard';
import { SEO } from '../components/common/SEO';
import { 
  Sprout, 
  Sparkles, 
  ArrowRight, 
  Heart, 
  ShieldCheck, 
  Truck, 
  Wind, 
  Sun,
  Home as HomeIcon,
  ShoppingBag
} from 'lucide-react';

export const HomePage: React.FC = () => {
  // Fetch featured products
  const { data: featuredData, isLoading: featuredLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productApi.getProducts({ isFeatured: true, limit: 6 }),
  });

  // Fetch seasonal plants
  const { data: seasonalData } = useQuery({
    queryKey: ['seasonal-products'],
    queryFn: () => productApi.getProducts({ isSeasonal: true, limit: 4 }),
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: productApi.getCategories,
  });

  const nurserySchema = {
    '@context': 'https://schema.org',
    '@type': 'GardenStore',
    name: 'KtmBotanica Botanical Nursery & Florist',
    image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=1200&q=80',
    url: 'https://ktmbotanica.com',
    telephone: '+977-9800000000',
    priceRange: 'रू 250 - रू 25,000',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Lazimpat Botanical Row',
      addressLocality: 'Kathmandu',
      addressRegion: 'Bagmati',
      postalCode: '44600',
      addressCountry: 'NP',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 27.7215,
      longitude: 85.3206,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '08:00',
      closes: '19:00',
    },
  };

  return (
    <div className="space-y-10 sm:space-y-16 pb-16">
      {/* Dynamic SEO Meta */}
      <SEO
        title="KtmBotanica | Nepal's Premier Botanical Nursery & Floral Studio"
        description="Kathmandu's premier mobile-first plant nursery & florist. Shop indoor air-purifiers, exotic monsteras, seasonal Sayapatri blooms, handmade terracotta planters, and expert Kathmandu plant care."
        canonical="https://ktmbotanica.com/"
        structuredData={nurserySchema}
      />

      {/* 1. Mobile-First Botanical Hero Section */}
      <section className="relative overflow-hidden rounded-3xl mx-3 sm:mx-6 lg:mx-8 mt-3 sm:mt-6 bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 text-white shadow-lifted">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-terracotta-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-5 py-10 sm:py-16 md:py-20 lg:py-24 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md">
              <Sprout size={14} className="text-emerald-400" />
              <span>Kathmandu’s Premier Botanical Nursery</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
              Bring Living Nature <br className="hidden sm:inline" />
              <span className="text-emerald-300 italic">Into Your Home.</span>
            </h1>

            <p className="text-forest-100 text-xs sm:text-base max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
              Acclimatized indoor foliage, festive Sayapatri blooms, luxury rose bouquets, and hand-turned Bhaktapur clay planters delivered carefully to your doorstep.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <Link
                to="/catalog"
                className="bg-emerald-400 hover:bg-emerald-300 text-forest-950 font-bold px-6 py-3.5 rounded-2xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <span>Shop All Plants</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/plant-doctor"
                className="bg-forest-800/80 hover:bg-forest-800 text-white font-semibold px-5 py-3.5 rounded-2xl text-xs sm:text-sm border border-forest-700/80 transition-all flex items-center gap-2 backdrop-blur-sm"
              >
                <Sparkles size={16} className="text-emerald-300" />
                <span>Plant Doctor Guides</span>
              </Link>
            </div>

            {/* Valley Trust Signals */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-forest-200">
              <div className="flex items-center gap-1.5">
                <Truck size={14} className="text-emerald-400" />
                <span>Valley Same-Day Delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>Healthy Plant Guarantee</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Card / Floating preview */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-xs sm:max-w-sm rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 group">
              <img
                src="https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80"
                alt="Lush Monstera and Indoor Plants"
                className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-transparent to-transparent flex flex-col justify-end p-5">
                <span className="text-[11px] font-bold text-emerald-300 tracking-wider uppercase">Best Seller</span>
                <h3 className="font-serif text-lg font-bold text-white">Swiss Cheese Monstera</h3>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-bold text-white">रू 1,050</span>
                  <span className="text-[11px] bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-white">Includes Care Guide</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Category Quick Pills (Mobile Horizontal Scroll) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-slate-900">
              Explore Collections
            </h2>
            <p className="text-xs text-slate-500">Find the perfect botanical match for your space</p>
          </div>
          <Link
            to="/catalog"
            className="text-xs font-bold text-forest-700 hover:text-forest-900 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            {
              title: 'Indoor Plants',
              slug: 'indoor-plants',
              subtitle: 'Air-purifying foliage',
              icon: HomeIcon,
              img: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=400&q=80',
            },
            {
              title: 'Sayapatri & Blooms',
              slug: 'flowering-plants',
              subtitle: 'Festive Nepali flowers',
              icon: Sun,
              img: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=400&q=80',
            },
            {
              title: 'Flower Bouquets',
              slug: 'flower-bouquets',
              subtitle: 'Fresh cut celebration gifts',
              icon: Heart,
              img: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=400&q=80',
            },
            {
              title: 'Clay Planters & Pots',
              slug: 'pots-planters',
              subtitle: 'Bhaktapur terracotta',
              icon: ShoppingBag,
              img: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=400&q=80',
            },
          ].map((cat) => (
            <Link
              key={cat.slug}
              to={`/catalog?category=${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl bg-white border border-forest-100 shadow-soft hover:shadow-lifted hover:border-forest-300 transition-all p-3 sm:p-4 flex flex-col justify-between h-32 sm:h-40"
            >
              <div className="relative z-10 space-y-0.5">
                <span className="font-serif font-bold text-sm sm:text-base text-slate-900 group-hover:text-forest-700 transition-colors block">
                  {cat.title}
                </span>
                <span className="text-[11px] text-slate-500 block">{cat.subtitle}</span>
              </div>

              <div className="absolute right-0 bottom-0 w-20 h-20 sm:w-24 sm:h-24 opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-300 rounded-tl-3xl overflow-hidden">
                <img src={cat.img} alt={cat.title} className="w-full h-full object-cover" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Plant Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="flex items-center gap-1.5 text-forest-700 font-semibold text-xs tracking-wider uppercase">
              <Sparkles size={14} className="text-emerald-500" />
              <span>Handpicked Botanicals</span>
            </div>
            <h2 className="font-serif font-bold text-xl sm:text-3xl text-slate-900 mt-1">
              Kathmandu Valley Favorites
            </h2>
          </div>
          <Link
            to="/catalog"
            className="hidden sm:flex text-xs font-bold text-forest-700 hover:text-forest-900 items-center gap-1"
          >
            <span>See All Products</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {featuredLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {featuredData?.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Seasonal & Festive Blooms Banner */}
      {seasonalData && seasonalData.products.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-amber-900 via-terracotta-900 to-forest-950 rounded-3xl p-5 sm:p-8 text-white relative overflow-hidden shadow-lifted">
            <div className="relative z-10 max-w-2xl space-y-2 sm:space-y-3">
              <span className="bg-amber-400 text-forest-950 text-[10px] sm:text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                Festive Season Ready
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight">
                Sayapatri & Fresh Celebration Blooms
              </h2>
              <p className="text-xs sm:text-sm text-amber-100 font-light">
                Order freshly bloomed golden Marigolds, Dutch Rose bouquets, and traditional brass/terracotta gift planters for celebrations across Kathmandu.
              </p>
              <div className="pt-2">
                <Link
                  to="/catalog?isSeasonal=true"
                  className="bg-white hover:bg-amber-50 text-forest-950 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl inline-flex items-center gap-2 transition-colors shadow-sm"
                >
                  <span>Explore Seasonal Collection</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. Plant Doctor Feature Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-forest-50 border border-forest-200/70 rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-forest-700 bg-white border border-forest-200 px-3 py-1 rounded-full text-xs font-bold">
              <Sparkles size={14} className="text-emerald-500" />
              <span>Free Botanical Health Support</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest-950">
              Never Lose a Houseplant Again.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Our in-house botanists curate watering schedules, light diagnosis, and monsoon care tips specifically calibrated for Kathmandu Valley homes.
            </p>
            <div className="pt-1">
              <Link
                to="/plant-doctor"
                className="bg-forest-800 hover:bg-forest-900 text-white font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl inline-flex items-center gap-2 transition-colors"
              >
                <span>Read Plant Care Guides</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0 w-full md:w-auto">
            <div className="bg-white p-4 rounded-2xl border border-forest-100 shadow-xs space-y-1 text-center">
              <Wind size={24} className="mx-auto text-teal-600 mb-1" />
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Air Quality</h4>
              <p className="text-[10px] text-slate-500">Filters indoor dust & smog</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-forest-100 shadow-xs space-y-1 text-center">
              <ShieldCheck size={24} className="mx-auto text-emerald-600 mb-1" />
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Pet Safe</h4>
              <p className="text-[10px] text-slate-500">Non-toxic plant varieties</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
