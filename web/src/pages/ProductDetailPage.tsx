import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../api/product.api';
import { reviewApi, ProductReviewItem } from '../api/review.api';
import { useCart } from '../context/CartContext';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import { VariantSelector } from '../components/product/VariantSelector';
import { CareRequirementsMeter } from '../components/product/CareRequirementsMeter';
import { RatingStars } from '../components/common/RatingStars';
import { CloudinaryImage } from '../components/common/CloudinaryImage';
import { SEO } from '../components/common/SEO';
import { 
  ShoppingBag, 
  Sparkles, 
  Truck, 
  ShieldCheck, 
  HeartHandshake, 
  Plus, 
  Minus, 
  ChevronRight, 
  MessageSquareHeart, 
  Star, 
  Camera, 
  CheckCircle2, 
  Lock
} from 'lucide-react';
import { ProductVariant } from '../types/product';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const { addToCart } = useCart();
  const { showToast, openCartDrawer } = useUI();
  const { isAuthenticated } = useAuth();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewPhotoUrl, setReviewPhotoUrl] = useState('');
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<string | null>(null);

  // 1. Fetch Product by Slug
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productApi.getProductBySlug(slug!),
    enabled: !!slug,
  });

  // 2. Fetch Detailed Reviews & Stats for this Product
  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ['product-reviews', product?.id],
    queryFn: () => reviewApi.getProductReviews(product!.id),
    enabled: !!product?.id,
  });

  // 3. Check Review Eligibility (Verified Purchase check)
  const { data: eligibility } = useQuery({
    queryKey: ['review-eligibility', product?.id, isAuthenticated],
    queryFn: () => reviewApi.canUserReview(product!.id),
    enabled: !!product?.id && isAuthenticated,
  });

  // Set default variant when product loads
  React.useEffect(() => {
    if (product && product.variants?.length > 0 && !selectedVariant) {
      const defaultVar = product.variants.find((v) => v.isDefault) || product.variants[0];
      setSelectedVariant(defaultVar);
    }
  }, [product, selectedVariant]);

  // Review submission mutation
  const reviewMutation = useMutation({
    mutationFn: (data: { productId: string; rating: number; title?: string; comment: string; plantPhotoUrl?: string }) =>
      reviewApi.createReview(data),
    onSuccess: () => {
      showToast('Thank you! Your verified plant review was posted.', 'success');
      setShowReviewForm(false);
      setReviewTitle('');
      setReviewComment('');
      setReviewPhotoUrl('');
      queryClient.invalidateQueries({ queryKey: ['product-reviews', product?.id] });
      queryClient.invalidateQueries({ queryKey: ['review-eligibility', product?.id] });
      queryClient.invalidateQueries({ queryKey: ['product', slug] });
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to submit review', 'error');
    },
  });

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!isAuthenticated) {
      showToast('Please sign in to submit a verified review', 'error');
      return;
    }
    reviewMutation.mutate({
      productId: product.id,
      rating: reviewRating,
      title: reviewTitle.trim() || undefined,
      comment: reviewComment.trim(),
      plantPhotoUrl: reviewPhotoUrl.trim() || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-6 w-1/3 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-96 bg-slate-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4" />
            <div className="h-5 bg-slate-200 rounded w-1/2" />
            <div className="h-24 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto my-16 text-center p-8 bg-white rounded-3xl border border-slate-200 space-y-4">
        <h2 className="font-serif font-bold text-xl text-slate-800">Plant Not Found</h2>
        <p className="text-xs text-slate-500">The plant variety you are looking for might be out of season or moved.</p>
        <Link
          to="/catalog"
          className="inline-block bg-forest-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-forest-900 transition-colors"
        >
          Browse All Plants
        </Link>
      </div>
    );
  }

  // Price calculations
  const basePriceNum = Number(product.basePrice);
  const discountPriceNum = product.discountPrice ? Number(product.discountPrice) : null;
  const currentPrice = (discountPriceNum !== null ? discountPriceNum : basePriceNum) + Number(selectedVariant?.priceAdjustment || 0);
  const totalItemPrice = currentPrice * quantity;

  // Images fallback
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [{ url: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80', isPrimary: true }];

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addToCart(product, selectedVariant, quantity);
    showToast(`Added ${quantity}x "${product.title}" to cart!`, 'success');
    openCartDrawer();
  };

  const reviewsList = reviewsData?.reviews || product.reviews || [];
  const rawAvg = reviewsData?.stats?.averageRating ?? product.averageRating ?? 5.0;
  const numAvg = Number(rawAvg) || 5.0;
  const reviewStats = reviewsData?.stats || {
    averageRating: numAvg,
    reviewCount: reviewsList.length,
    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  };

  // Generate structured product data
  const seoTitle = `${product.title}${selectedVariant ? ' — ' + selectedVariant.name : ''} — NPR ${currentPrice.toLocaleString()} | KtmBotanica Nursery`;
  const seoDescription = product.shortDescription || product.fullDescription || `Buy ${product.title} online with same-day Kathmandu Valley delivery and botanical care advice from KtmBotanica.`;
  const primaryImageUrl = images[0]?.url || 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=1200&q=80';

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: images.map((img) => img.url),
    description: seoDescription,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'KtmBotanica Nursery',
    },
    offers: {
      '@type': 'Offer',
      url: `https://ktmbotanica.com/product/${product.slug}`,
      priceCurrency: 'NPR',
      price: currentPrice,
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: selectedVariant && selectedVariant.stockQuantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'KtmBotanica Nursery & Florist',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: numAvg.toFixed(1),
      reviewCount: Math.max(1, reviewStats.reviewCount),
      bestRating: '5',
      worstRating: '1',
    },
  };

  return (
    <div className="pb-24 sm:pb-16 animate-in fade-in duration-300">
      {/* Dynamic SEO Meta & Structured Data */}
      <SEO
        title={seoTitle}
        description={seoDescription}
        ogType="product"
        ogImage={primaryImageUrl}
        canonical={`https://ktmbotanica.com/product/${product.slug}`}
        structuredData={productSchema}
      />

      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-1.5 text-xs text-slate-500">
        <Link to="/" className="hover:text-forest-700">Home</Link>
        <ChevronRight size={12} className="text-slate-400" />
        <Link to="/catalog" className="hover:text-forest-700">Plants</Link>
        {product.category && (
          <>
            <ChevronRight size={12} className="text-slate-400" />
            <Link to={`/catalog?category=${product.category.slug}`} className="hover:text-forest-700">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight size={12} className="text-slate-400" />
        <span className="text-slate-900 font-medium truncate max-w-[150px]">{product.title}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 space-y-3">
            {/* Primary Image with Cloudinary detail preset */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-forest-50/50 border border-forest-100 shadow-soft">
              <CloudinaryImage
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

            {/* Thumbnail dots / buttons */}
            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      activeImageIndex === idx
                        ? 'border-forest-800 ring-2 ring-forest-200'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <CloudinaryImage src={img.url} alt="" preset="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Trust Badges */}
            <div className="hidden sm:grid grid-cols-3 gap-2.5 pt-3 border-t border-slate-100 text-center">
              <div className="bg-sand-50 p-2.5 rounded-xl border border-slate-200/60">
                <Truck size={18} className="mx-auto text-forest-700 mb-1" />
                <span className="text-[11px] font-bold text-slate-800 block">Valley Delivery</span>
                <span className="text-[10px] text-slate-500">Same-day available</span>
              </div>
              <div className="bg-sand-50 p-2.5 rounded-xl border border-slate-200/60">
                <ShieldCheck size={18} className="mx-auto text-emerald-600 mb-1" />
                <span className="text-[11px] font-bold text-slate-800 block">Healthy Arrival</span>
                <span className="text-[10px] text-slate-500">7-day guarantee</span>
              </div>
              <div className="bg-sand-50 p-2.5 rounded-xl border border-slate-200/60">
                <HeartHandshake size={18} className="mx-auto text-terracotta-600 mb-1" />
                <span className="text-[11px] font-bold text-slate-800 block">Free Care Advice</span>
                <span className="text-[10px] text-slate-500">Doctor on call</span>
              </div>
            </div>
          </div>

          {/* Right Column: Product Info & Actions */}
          <div className="lg:col-span-6 space-y-5">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                {product.category && (
                  <span className="text-xs font-bold uppercase tracking-wider text-forest-700 bg-forest-50 px-2.5 py-0.5 rounded-full">
                    {product.category.name}
                  </span>
                )}
                <a href="#reviews-section" className="hover:opacity-80 transition-opacity">
                  <RatingStars rating={numAvg} reviewCount={reviewStats.reviewCount} size={14} />
                </a>
              </div>

              <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight leading-tight">
                {product.title}
              </h1>

              {product.scientificName && (
                <p className="text-xs sm:text-sm text-forest-600 italic font-serif mt-0.5">
                  {product.scientificName}
                </p>
              )}

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

            {/* Short Description */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {product.shortDescription || product.fullDescription}
            </p>

            {/* Botanical Care Meter */}
            <CareRequirementsMeter product={product} />

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
                  className="p-1 text-slate-600 hover:text-slate-900"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="px-3 text-xs font-bold text-slate-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1 text-slate-600 hover:text-slate-900"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.stockQuantity <= 0}
                className="flex-1 bg-forest-800 hover:bg-forest-900 active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-xl shadow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <ShoppingBag size={16} />
                <span>
                  {!selectedVariant || selectedVariant.stockQuantity <= 0
                    ? 'Currently Out of Stock'
                    : `Add to Cart • रू ${totalItemPrice.toLocaleString()}`}
                </span>
              </button>
            </div>

            {/* Full Botanical Care Guide Snippet */}
            {product.careGuide && (
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-forest-900 flex items-center gap-1.5">
                    <span>🌿 Species Care Blueprint:</span>
                    <span className="text-emerald-700">{product.careGuide.title}</span>
                  </span>
                  <Link
                    to={`/plant-doctor`}
                    className="text-xs font-bold text-forest-700 hover:underline"
                  >
                    Full Clinic →
                  </Link>
                </div>
                {product.careGuide.summary && (
                  <p className="text-xs text-slate-600 leading-relaxed">{product.careGuide.summary}</p>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* CUSTOMER REVIEWS & RATINGS SECTION                       */}
            {/* ======================================================== */}
            <div id="reviews-section" className="space-y-5 pt-6 border-t border-slate-200">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-lg text-slate-900 flex items-center gap-2">
                  <MessageSquareHeart size={20} className="text-forest-700" />
                  <span>Customer Reviews ({reviewStats.reviewCount})</span>
                </h3>

                {eligibility?.hasReviewed ? (
                  <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    <span>You reviewed this</span>
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        showToast('Please sign in to write a verified review', 'error');
                        return;
                      }
                      if (!eligibility?.hasPurchased) {
                        showToast('Only verified purchasers of this plant can leave a review', 'error');
                        return;
                      }
                      setShowReviewForm(!showReviewForm);
                    }}
                    className="text-xs font-bold bg-sand-100 hover:bg-sand-200 text-forest-800 px-3 py-1.5 rounded-xl border border-sand-300 transition-colors"
                  >
                    {showReviewForm ? 'Cancel' : '✍️ Write a Review'}
                  </button>
                )}
              </div>

              {/* Reviews Summary Stats Card */}
              <div className="bg-sand-50/80 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                {/* Big Rating */}
                <div className="sm:col-span-4 text-center sm:border-r border-slate-200/80 sm:pr-4">
                  <div className="font-serif font-bold text-3xl text-forest-950">
                    {numAvg.toFixed(1)}
                  </div>
                  <div className="flex justify-center my-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={15}
                        className={s <= Math.round(numAvg) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-500 font-semibold block">
                    Based on {reviewStats.reviewCount} verified ratings
                  </span>
                </div>

                {/* Rating Distribution Bars */}
                <div className="sm:col-span-8 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((starNum) => {
                    const count = (reviewStats.ratingBreakdown as any)?.[starNum] || 0;
                    const pct = reviewStats.reviewCount > 0 ? (count / reviewStats.reviewCount) * 100 : 0;
                    return (
                      <div key={starNum} className="flex items-center gap-2 text-xs">
                        <span className="w-6 font-semibold text-slate-600 text-right">{starNum}★</span>
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-8 text-[11px] text-slate-400 font-mono text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Review Eligibility Notice */}
              {isAuthenticated && !eligibility?.hasPurchased && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                  <Lock size={15} className="text-amber-700 shrink-0" />
                  <span>
                    Verified Purchaser Policy: Only customers who have purchased and received this plant can submit a review.
                  </span>
                </div>
              )}

              {/* Review Submission Form */}
              {showReviewForm && (
                <form
                  onSubmit={handleReviewSubmit}
                  className="p-5 bg-white border border-forest-200 rounded-3xl space-y-4 shadow-sm animate-in fade-in zoom-in-95 duration-200"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold text-xs text-forest-950 uppercase tracking-wider">
                      Write Verified Plant Review
                    </span>
                    <span className="text-[11px] text-emerald-700 bg-emerald-50 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                      Verified Buyer
                    </span>
                  </div>

                  {/* Interactive Star Picker */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 block">Overall Rating *</label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onMouseEnter={() => setReviewHoverRating(star)}
                          onMouseLeave={() => setReviewHoverRating(0)}
                          onClick={() => setReviewRating(star)}
                          className="p-1 hover:scale-125 transition-transform focus:outline-none"
                        >
                          <Star
                            size={24}
                            className={
                              star <= (reviewHoverRating || reviewRating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300'
                            }
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-2">
                        {reviewRating === 5 && '🌟 Exceptional / Flawless'}
                        {reviewRating === 4 && '🌿 Great & Healthy'}
                        {reviewRating === 3 && '🪴 Average'}
                        {reviewRating === 2 && '🍂 Below expectations'}
                        {reviewRating === 1 && '🥀 Poor'}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 block">
                      Headline / Title (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Arrived lush and thriving in Kathmandu!"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl focus:border-forest-700 focus:outline-none bg-slate-50 focus:bg-white"
                    />
                  </div>

                  {/* Comment */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 block">
                      Detailed Review & Experience *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Describe the plant's health, leaf condition, packaging, and how it is acclimating to your space..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:border-forest-700 focus:outline-none bg-slate-50 focus:bg-white"
                    />
                  </div>

                  {/* Optional Plant Photo URL */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Camera size={13} className="text-forest-700" />
                      <span>Plant Photo URL (Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="https://res.cloudinary.com/... or image link"
                      value={reviewPhotoUrl}
                      onChange={(e) => setReviewPhotoUrl(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:border-forest-700 focus:outline-none bg-slate-50 focus:bg-white"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={reviewMutation.isPending}
                      className="bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold py-2.5 px-6 rounded-xl transition-colors shadow-xs disabled:opacity-50"
                    >
                      {reviewMutation.isPending ? 'Submitting...' : 'Publish Plant Review'}
                    </button>
                  </div>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-3">
                {reviewsLoading ? (
                  <div className="p-8 text-center text-slate-400 space-y-2">
                    <div className="w-5 h-5 border-2 border-forest-700 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs">Loading customer reviews...</p>
                  </div>
                ) : reviewsList.length === 0 ? (
                  <div className="p-8 bg-sand-50/50 rounded-2xl border border-dashed border-slate-300 text-center space-y-1.5">
                    <p className="text-sm font-semibold text-slate-700">No reviews yet</p>
                    <p className="text-xs text-slate-500">
                      Be the first verified gardener to order and review this botanical variety!
                    </p>
                  </div>
                ) : (
                  reviewsList.map((r: ProductReviewItem) => (
                    <div
                      key={r.id}
                      className="p-4 bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-xs hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-forest-800 text-emerald-300 flex items-center justify-center font-bold text-xs shadow-xs">
                            {r.customerName?.charAt(0) || 'G'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-slate-900">{r.customerName}</span>
                              {r.isVerifiedBuyer && (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                                  <ShieldCheck size={11} className="text-emerald-700" />
                                  <span>Verified Buyer</span>
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {new Date(r.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex text-amber-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={13}
                              className={star <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
                            />
                          ))}
                        </div>
                      </div>

                      {r.title && (
                        <h4 className="font-bold text-xs text-slate-900 leading-snug">
                          {r.title}
                        </h4>
                      )}

                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                        {r.comment}
                      </p>

                      {/* Plant Photo */}
                      {r.plantPhotoUrl && (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => setSelectedPhotoPreview(r.plantPhotoUrl!)}
                            className="group relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 block focus:outline-none"
                          >
                            <img
                              src={r.plantPhotoUrl}
                              alt="Customer plant photo"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Lightbox Preview Modal */}
      {selectedPhotoPreview && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedPhotoPreview(null)}
        >
          <div className="relative max-w-lg w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-2 animate-in zoom-in-95">
            <img
              src={selectedPhotoPreview}
              alt="Customer plant photo full"
              className="w-full max-h-[75vh] object-contain rounded-2xl"
            />
            <button
              onClick={() => setSelectedPhotoPreview(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900/70 text-white flex items-center justify-center hover:bg-slate-900 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Mobile-First Sticky Action Bar (Fixed at viewport bottom on phones) */}
      <div className="sm:hidden fixed bottom-14 left-0 right-0 z-30 bg-white/98 backdrop-blur-xl border-t border-slate-200 p-3 shadow-mobile-bar flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-slate-500 block">Total</span>
          <span className="font-serif font-bold text-base text-forest-950">
            रू {totalItemPrice.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Qty pill */}
          <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 px-1 py-0.5">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-1 text-slate-600"
            >
              <Minus size={12} />
            </button>
            <span className="px-2 text-xs font-bold">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-1 text-slate-600"
            >
              <Plus size={12} />
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant || selectedVariant.stockQuantity <= 0}
            className="bg-forest-800 hover:bg-forest-900 active:scale-95 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow flex items-center gap-1.5 transition-all"
          >
            <ShoppingBag size={14} />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};
