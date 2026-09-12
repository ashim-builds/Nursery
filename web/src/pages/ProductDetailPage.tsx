import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../api/product.api';
import { useCart } from '../context/CartContext';
import { useUI } from '../context/UIContext';
import { VariantSelector } from '../components/product/VariantSelector';
import { DatabaseImage } from '../components/common/DatabaseImage';
import { SEO } from '../components/common/SEO';
import { 
  ShoppingBag, 
  Truck, 
  Plus, 
  Minus, 
  ChevronRight, 
  ShieldCheck,
  Sprout
} from 'lucide-react';
import { ProductVariant } from '../types/product';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const { showToast, openCartDrawer } = useUI();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // 1. Fetch Product by Slug
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productApi.getProductBySlug(slug!),
    enabled: !!slug,
  });

  // Set default variant when product loads
  React.useEffect(() => {
    if (product && product.variants?.length > 0 && !selectedVariant) {
      const defaultVar = product.variants.find((v) => v.isDefault) || product.variants[0];
      setSelectedVariant(defaultVar);
    }
  }, [product, selectedVariant]);

  const handleAddToCart = () => {
    if (!product) return;

    const variant = selectedVariant || (product.variants && product.variants[0]);
    if (!variant) {
      showToast('Please select an option', 'error');
      return;
    }

    addToCart(product, variant, quantity);
    showToast(`Added ${quantity}x "${product.title || product.name}" to cart!`, 'success');
    openCartDrawer();
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          <div className="lg:col-span-5 aspect-[4/3] sm:aspect-square max-h-[380px] bg-slate-100 rounded-3xl" />
          <div className="lg:col-span-7 space-y-4">
            <div className="h-8 bg-slate-100 rounded-xl w-3/4" />
            <div className="h-6 bg-slate-100 rounded-xl w-1/3" />
            <div className="h-24 bg-slate-100 rounded-2xl w-full" />
            <div className="h-12 bg-slate-100 rounded-xl w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-4 shadow-soft">
        <Sprout size={48} className="mx-auto text-slate-300" />
        <h2 className="font-serif font-bold text-xl text-slate-900">Plant Not Found</h2>
        <p className="text-xs text-slate-500">The plant you are looking for might have been moved or is currently unavailable.</p>
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 bg-forest-800 text-white font-bold text-xs px-5 py-3 rounded-xl hover:bg-forest-900 transition-colors"
        >
          <span>Browse All Plants</span>
          <ChevronRight size={14} />
        </Link>
      </div>
    );
  }

  const basePriceNum = Number(product.basePrice || 0);
  const discountPriceNum = product.discountPrice ? Number(product.discountPrice) : null;
  const currentPrice = discountPriceNum !== null 
    ? discountPriceNum + Number(selectedVariant?.priceAdjustment || 0)
    : basePriceNum + Number(selectedVariant?.priceAdjustment || 0);

  const isProductOutOfStock = !product.isAvailable;

  const images = (product.images && product.images.length > 0)
    ? product.images
    : [{ id: 'fallback', url: '/images/plant-fallback.webp', isPrimary: true, altText: product.title }];

  const totalItemPrice = currentPrice * quantity;

  return (
    <div className="pb-32 sm:pb-16 animate-in fade-in duration-300">
      {/* Dynamic SEO Meta */}
      <SEO
        title={`${product.title} | RJ Flowers`}
        description={product.shortDescription || product.description || `Buy ${product.title} in Pokhara`}
        ogType="product"
        ogImage={images[0]?.url}
        canonical={`${typeof window !== 'undefined' ? window.location.origin : ''}/product/${product.slug}`}
      />

      {/* Breadcrumbs */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-1.5 text-xs text-slate-500">
        <Link to="/" className="hover:text-forest-700">Home</Link>
        <ChevronRight size={12} className="text-slate-400" />
        <Link to="/catalog" className="hover:text-forest-700">Plants</Link>
        <ChevronRight size={12} className="text-slate-400" />
        <span className="text-slate-900 font-medium truncate max-w-xs sm:max-w-md">{product.title}</span>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-5 space-y-3 max-w-md mx-auto lg:max-w-none w-full">
            <div className="relative aspect-[4/3] sm:aspect-square max-h-[380px] sm:max-h-[420px] rounded-2xl sm:rounded-3xl overflow-hidden bg-forest-50/50 border border-forest-100 shadow-soft">
              <DatabaseImage
                src={images[activeImageIndex]?.url || images[0].url}
                alt={product.title}
                preset="detail"
                className="w-full h-full object-cover"
              />
              {discountPriceNum && (
                <div className="absolute top-3 left-3 bg-terracotta-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm z-10">
                  Save रू {Math.round(basePriceNum - discountPriceNum)}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-forest-800 ring-2 ring-forest-200'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <DatabaseImage src={img.url} alt="" preset="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info & Actions */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight leading-tight">
                {product.title}
              </h1>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 mt-3">
                <span className="font-serif font-bold text-2xl sm:text-3xl text-forest-950">
                  रू {currentPrice.toLocaleString()}
                </span>
                {discountPriceNum && (
                  <span className="text-sm sm:text-base text-slate-400 line-through">
                    रू {(basePriceNum + Number(selectedVariant?.priceAdjustment || 0)).toLocaleString()}
                  </span>
                )}
                <span className="text-[11px] text-slate-500">VAT Included</span>
              </div>
            </div>

            {/* Product Description */}
            {(product.fullDescription || product.description || product.shortDescription) && (
              <div className="space-y-1.5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {(product.fullDescription || product.description || product.shortDescription || '').replace(/Kathmandu/gi, 'Pokhara')}
                </p>
              </div>
            )}

            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && selectedVariant && (
              <VariantSelector
                variants={product.variants}
                selectedVariant={selectedVariant}
                onSelectVariant={(v) => setSelectedVariant(v)}
                basePrice={basePriceNum}
              />
            )}

            {/* Desktop Add to Cart Controls */}
            <div className="hidden sm:flex items-center gap-3 pt-2">
              {/* Quantity */}
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 px-2 py-1.5">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 text-slate-600 hover:text-slate-900 cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="px-3 text-xs font-bold text-slate-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1 text-slate-600 hover:text-slate-900 cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={isProductOutOfStock || !selectedVariant || selectedVariant.stockQuantity <= 0}
                className="flex-1 bg-forest-800 hover:bg-forest-900 active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-xl shadow flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                <ShoppingBag size={16} />
                <span>
                  {isProductOutOfStock || !selectedVariant || selectedVariant.stockQuantity <= 0
                    ? 'Currently Out of Stock'
                    : `Add to Cart • रू ${totalItemPrice.toLocaleString()}`}
                </span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
              <div className="bg-sand-50 p-3 rounded-xl border border-slate-200/60 flex items-center gap-2.5">
                <Truck size={18} className="text-forest-700 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Careful Delivery</span>
                  <span className="text-[10px] text-slate-500">Fast delivery across Pokhara</span>
                </div>
              </div>
              <div className="bg-sand-50 p-3 rounded-xl border border-slate-200/60 flex items-center gap-2.5">
                <ShieldCheck size={18} className="text-forest-700 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Healthy Plant Guarantee</span>
                  <span className="text-[10px] text-slate-500">Fresh from our nursery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Add to Cart Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-2.5 shadow-lg safe-bottom flex items-center gap-2">
        <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 px-2 py-1.5 shrink-0">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-1 text-slate-600 active:scale-95"
            aria-label="Decrease quantity"
          >
            <Minus size={14} />
          </button>
          <span className="px-2 text-xs font-bold text-slate-800 font-mono">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="p-1 text-slate-600 active:scale-95"
            aria-label="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isProductOutOfStock || !selectedVariant || selectedVariant.stockQuantity <= 0}
          className="flex-1 min-w-0 bg-forest-800 active:bg-forest-900 text-white font-bold text-xs py-3 px-3 rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-[0.98] transition-transform shadow-xs"
        >
          <ShoppingBag size={14} className="shrink-0" />
          <span className="truncate">
            {isProductOutOfStock || !selectedVariant || selectedVariant.stockQuantity <= 0
              ? 'Out of Stock'
              : `Add • रू ${totalItemPrice.toLocaleString()}`}
          </span>
        </button>
      </div>
    </div>
  );
};
