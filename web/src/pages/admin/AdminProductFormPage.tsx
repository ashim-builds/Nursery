import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api';
import { useUI } from '../../context/UIContext';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Image as ImageIcon,
  Sprout,
  Banknote,
  Sparkles,
  Check,
  UploadCloud,
  Layers,
} from 'lucide-react';
import { ImageUploader, ManagedImage } from '../../components/admin/ImageUploader';

// Quick Preset botanical photography if user doesn't have a photo ready
const PRESET_PLANT_PHOTOS = [
  {
    name: 'Monstera Deliciosa',
    url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Fiddle Leaf Fig',
    url: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Snake Plant Sansevieria',
    url: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Peace Lily Plant',
    url: 'https://images.unsplash.com/photo-1593482892290-f54927ae1bf6?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Golden Pothos / Money Plant',
    url: 'https://images.unsplash.com/photo-1596724817757-1901414457e5?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Flowering Rose Plant',
    url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80',
  },
];

export const AdminProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id && id !== 'new';
  const navigate = useNavigate();
  const { showToast } = useUI();
  const queryClient = useQueryClient();

  // Wizard Step: 1 = Name, 2 = Price, 3 = Photo & Save
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState<number | ''>(1000);
  const [stockStatus, setStockStatus] = useState<'IN_STOCK' | 'OUT_OF_STOCK'>('IN_STOCK');
  const [images, setImages] = useState<ManagedImage[]>([]);

  // Load existing product if editing
  const { data: existingProduct, isLoading: isProductLoading } = useQuery({
    queryKey: ['admin-product-edit', id],
    queryFn: () => adminApi.getProductById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existingProduct) {
      setName(existingProduct.name || existingProduct.title || '');
      setDescription(existingProduct.description || '');
      setBasePrice(Number(existingProduct.basePrice) || 1000);
      setStockStatus(
        existingProduct.available === false || existingProduct.isAvailable === false
          ? 'OUT_OF_STOCK'
          : 'IN_STOCK'
      );

      if (existingProduct.images && existingProduct.images.length > 0) {
        setImages(
          existingProduct.images.map((img: any, i: number) => ({
            id: img.id,
            url: img.url,
            altText: img.altText || existingProduct.name,
            isPrimary: img.isPrimary ?? i === 0,
            sortOrder: img.sortOrder ?? i + 1,
          }))
        );
      }
    }
  }, [existingProduct]);

  // Mutation to Save / Create
  const mutation = useMutation({
    mutationFn: (payload: any) => {
      if (isEdit) {
        return adminApi.updateProduct(id!, payload);
      }
      return adminApi.createProduct(payload);
    },
    onSuccess: () => {
      showToast(
        isEdit ? 'Plant updated successfully!' : 'New plant added successfully!',
        'success'
      );
      queryClient.invalidateQueries({ queryKey: ['admin-products-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/admin/products');
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to save plant', 'error');
    },
  });

  // Step 1 Validation -> Proceed to Step 2
  const handleGoToStep2 = () => {
    if (!name.trim()) {
      showToast('Please enter the plant name', 'error');
      return;
    }
    setCurrentStep(2);
  };

  // Step 2 Validation -> Proceed to Step 3
  const handleGoToStep3 = () => {
    if (!basePrice || Number(basePrice) <= 0) {
      showToast('Please enter a valid price in NPR रू', 'error');
      return;
    }
    setCurrentStep(3);
  };

  // Final Save Handler
  const handleFinalSave = () => {
    if (!name.trim()) {
      setCurrentStep(1);
      showToast('Please enter plant name', 'error');
      return;
    }
    if (!basePrice || Number(basePrice) <= 0) {
      setCurrentStep(2);
      showToast('Please enter plant price', 'error');
      return;
    }

    // Default image if none chosen
    const finalImages =
      images.length > 0
        ? images
        : [
            {
              url: PRESET_PLANT_PHOTOS[0].url,
              altText: name,
              isPrimary: true,
              sortOrder: 1,
            },
          ];

    const payload = {
      name: name.trim(),
      title: name.trim(),
      basePrice: Number(basePrice),
      description:
        description.trim() || `${name} - Fresh and healthy plant from Kathmandu nursery.`,
      available: stockStatus === 'IN_STOCK',
      stockStatus: stockStatus,
      images: finalImages.map((img, i) => ({
        url: img.url,
        altText: img.altText || name,
        isPrimary: img.isPrimary ?? i === 0,
        sortOrder: img.sortOrder ?? i + 1,
      })),
      variants: [
        {
          name: 'Default',
          sku: `PLT-${Date.now().toString().slice(-6)}`,
          price: Number(basePrice),
          stock: stockStatus === 'IN_STOCK' ? 100 : 0,
          isAvailable: stockStatus === 'IN_STOCK',
        },
      ],
    };

    if (isEdit) {
      payload.images = finalImages.map((image) => ({
        url: image.url,
        altText: image.altText || name,
        isPrimary: image.isPrimary ?? false,
        sortOrder: image.sortOrder ?? 0,
      }));
    }

    mutation.mutate(payload);
  };

  const handleSelectPresetPhoto = (photoUrl: string, photoName: string) => {
    const isFirst = images.length === 0;
    setImages([
      ...images,
      {
        url: photoUrl,
        altText: photoName,
        isPrimary: isFirst,
        sortOrder: images.length + 1,
      },
    ]);
    showToast(`Added ${photoName} photo`, 'success');
  };

  if (isProductLoading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading plant details...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors shadow-xs"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight flex items-center gap-2">
              <Sprout className="text-forest-700" size={26} />
              <span>{isEdit ? 'Edit Plant' : 'Add New Nursery Plant'}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Follow the 3 simple steps below to list your plant.
            </p>
          </div>
        </div>
      </div>

      {/* 3-Step Visual Progress Stepper */}
      <div className="bg-white p-3 sm:p-4 rounded-3xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-3 gap-2">
          {/* Step 1 Pill */}
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-2.5 p-2.5 sm:p-3 rounded-2xl transition-all text-left ${
              currentStep === 1
                ? 'bg-forest-900 text-white shadow-sm'
                : name.trim()
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-slate-50 text-slate-400'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                currentStep === 1
                  ? 'bg-emerald-400 text-forest-950'
                  : name.trim()
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600'
              }`}
            >
              {name.trim() && currentStep !== 1 ? <Check size={12} /> : '1'}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-75">
                Step 1
              </div>
              <div className="text-xs sm:text-sm font-bold truncate">Plant Name</div>
            </div>
          </button>

          {/* Step 2 Pill */}
          <button
            type="button"
            onClick={() => {
              if (name.trim()) setCurrentStep(2);
            }}
            disabled={!name.trim()}
            className={`flex items-center gap-2.5 p-2.5 sm:p-3 rounded-2xl transition-all text-left disabled:opacity-50 ${
              currentStep === 2
                ? 'bg-forest-900 text-white shadow-sm'
                : basePrice && Number(basePrice) > 0
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-slate-50 text-slate-400'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                currentStep === 2
                  ? 'bg-emerald-400 text-forest-950'
                  : basePrice && Number(basePrice) > 0
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600'
              }`}
            >
              {basePrice && Number(basePrice) > 0 && currentStep !== 2 ? <Check size={12} /> : '2'}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-75">
                Step 2
              </div>
              <div className="text-xs sm:text-sm font-bold truncate">Price & Stock</div>
            </div>
          </button>

          {/* Step 3 Pill */}
          <button
            type="button"
            onClick={() => {
              if (name.trim() && basePrice) setCurrentStep(3);
            }}
            disabled={!name.trim() || !basePrice}
            className={`flex items-center gap-2.5 p-2.5 sm:p-3 rounded-2xl transition-all text-left disabled:opacity-50 ${
              currentStep === 3
                ? 'bg-forest-900 text-white shadow-sm'
                : images.length > 0
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-slate-50 text-slate-400'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                currentStep === 3
                  ? 'bg-emerald-400 text-forest-950'
                  : images.length > 0
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600'
              }`}
            >
              {images.length > 0 && currentStep !== 3 ? <Check size={12} /> : '3'}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-75">
                Step 3
              </div>
              <div className="text-xs sm:text-sm font-bold truncate">Image & Save</div>
            </div>
          </button>
        </div>
      </div>

      {/* ================= STEP 1: PLANT NAME ================= */}
      {currentStep === 1 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 animate-fadeIn">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Sprout size={22} />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg sm:text-xl text-slate-900">
                Step 1: Enter Plant Name (बिरुवाको नाम)
              </h2>
              <p className="text-xs text-slate-500">
                What is the name of the plant you want to sell?
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block font-bold text-sm text-slate-800 mb-1.5">Plant Name *</label>
              <input
                type="text"
                autoFocus
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Type plant name here..."
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3.5 text-sm sm:text-base font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-forest-700 transition-all"
              />
            </div>

            <div>
              <label className="block font-bold text-xs text-slate-700 mb-1.5">
                Description (Optional / ऐच्छिक)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-forest-700"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleGoToStep2}
              className="px-6 py-3.5 bg-forest-900 hover:bg-forest-800 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md flex items-center gap-2 active:scale-98 transition-all"
            >
              <span>Next: Set Price (मूल्य राख्नुहोस्)</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 2: PRICE & STOCK ================= */}
      {currentStep === 2 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 animate-fadeIn">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Banknote size={22} />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg sm:text-xl text-slate-900">
                Step 2: Plant Price & Stock (मूल्य र स्टक)
              </h2>
              <p className="text-xs text-slate-500">
                Set the selling price and choose if it is in stock.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Price Input */}
            <div>
              <label className="block font-bold text-sm text-slate-800 mb-1.5">
                Selling Price in Nepali Rupees (NPR रू) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-forest-700 font-bold text-base">
                  रू
                </div>
                <input
                  type="number"
                  min="1"
                  autoFocus
                  required
                  value={basePrice}
                  onChange={(e) =>
                    setBasePrice(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="e.g. 850"
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl pl-10 pr-4 py-3.5 text-base sm:text-lg font-mono font-extrabold text-slate-900 focus:bg-white focus:outline-none focus:border-forest-700 transition-all"
                />
              </div>
            </div>

            {/* In Stock / Out of Stock Toggle */}
            <div>
              <label className="block font-bold text-sm text-slate-800 mb-2">
                Availability Status (स्टक अवस्था)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStockStatus('IN_STOCK')}
                  className={`py-4 px-4 rounded-2xl border-2 font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-1.5 transition-all ${
                    stockStatus === 'IN_STOCK'
                      ? 'border-emerald-500 bg-emerald-50/80 text-emerald-900 shadow-sm ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span>In Stock (उपलब्ध छ)</span>
                  <span className="text-[10px] font-normal opacity-80">Customers can order</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStockStatus('OUT_OF_STOCK')}
                  className={`py-4 px-4 rounded-2xl border-2 font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-1.5 transition-all ${
                    stockStatus === 'OUT_OF_STOCK'
                      ? 'border-rose-500 bg-rose-50/80 text-rose-900 shadow-sm ring-2 ring-rose-500/20'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  <span>Out of Stock (सकियो)</span>
                  <span className="text-[10px] font-normal opacity-80">Shows out of stock</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-5 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-all"
            >
              ⬅ Back
            </button>

            <button
              type="button"
              onClick={handleGoToStep3}
              className="px-6 py-3.5 bg-forest-900 hover:bg-forest-800 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md flex items-center gap-2 active:scale-98 transition-all"
            >
              <span>Next: Add Image & Save (फोटो राख्नुहोस्)</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 3: IMAGE & SAVE ================= */}
      {currentStep === 3 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 animate-fadeIn">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
              <ImageIcon size={22} />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg sm:text-xl text-slate-900">
                Step 3: Plant Photo & Save (फोटो र सेभ गर्नुहोस्)
              </h2>
              <p className="text-xs text-slate-500">
                Upload a photo from your phone or choose a preset botanical photo.
              </p>
            </div>
          </div>

          {/* Photo Uploader Component */}
          <div className="pt-2">
            <label className="block font-bold text-xs text-slate-700 mb-2">
              Or Upload Plant Photo From Phone / Computer:
            </label>
            <ImageUploader
              images={images}
              onChange={setImages}
              maxImages={6}
              folder="nursery_botanica/products"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-5 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-all"
            >
              ⬅ Back to Price
            </button>

            <button
              type="button"
              disabled={mutation.isPending}
              onClick={handleFinalSave}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-forest-950 font-extrabold text-xs sm:text-base rounded-2xl shadow-lifted flex items-center gap-2 active:scale-98 transition-all disabled:opacity-50"
            >
              {mutation.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-forest-950 border-t-transparent rounded-full animate-spin" />
                  <span>Saving Plant...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Save Plant (प्लान्ट सेभ गर्नुहोस्)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
