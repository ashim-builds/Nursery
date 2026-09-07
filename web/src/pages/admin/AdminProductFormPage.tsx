import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api';
import { useUI } from '../../context/UIContext';
import {
  ArrowLeft,
  Package,
  Plus,
  Trash2,
  CheckCircle2,
  Image as ImageIcon,
  Layers,
  Sprout,
  Sun,
  Droplets,
  HeartHandshake,
  AlertTriangle,
} from 'lucide-react';

import { ImageUploader, ManagedImage } from '../../components/admin/ImageUploader';

interface VariantFormItem {
  id?: string;
  name: string;
  sku: string;
  price: number;
  stockQuantity: number;
  lowStockThreshold: number;
}

export const AdminProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id && id !== 'new';
  const navigate = useNavigate();
  const { showToast } = useUI();
  const queryClient = useQueryClient();

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [botanicalName, setBotanicalName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState<number>(1000);
  const [categoryId, setCategoryId] = useState('');
  const [images, setImages] = useState<ManagedImage[]>([]);
  const [sunlight, setSunlight] = useState('BRIGHT_INDIRECT');
  const [watering, setWatering] = useState('MODERATE');
  const [difficulty, setDifficulty] = useState('EASY');
  const [petFriendly, setPetFriendly] = useState(false);
  const [airPurifying, setAirPurifying] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // Variants state
  const [variants, setVariants] = useState<VariantFormItem[]>([
    { name: 'Standard 6" Nursery Pot', sku: 'NUR-01', price: 1000, stockQuantity: 15, lowStockThreshold: 5 },
  ]);

  // Load Categories
  const { data: categories } = useQuery({
    queryKey: ['admin-categories-form'],
    queryFn: adminApi.getCategories,
  });

  // Load existing product if editing
  const { data: existingProduct, isLoading: isProductLoading } = useQuery({
    queryKey: ['admin-product-edit', id],
    queryFn: () => adminApi.getProductById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existingProduct) {
      setTitle(existingProduct.name || existingProduct.title || '');
      setSlug(existingProduct.slug || '');
      setBotanicalName(existingProduct.botanicalName || '');
      setDescription(existingProduct.description || '');
      setBasePrice(Number(existingProduct.basePrice) || 1000);
      setCategoryId(existingProduct.categoryId || '');
      setSunlight(existingProduct.sunlightRequirement || existingProduct.sunlight || 'BRIGHT_INDIRECT');
      setWatering(existingProduct.wateringRequirement || existingProduct.watering || 'MODERATE');
      setDifficulty(existingProduct.difficultyLevel || existingProduct.difficulty || 'EASY');
      setPetFriendly(!!existingProduct.petFriendly);
      setAirPurifying(!!existingProduct.airPurifying);
      setIsFeatured(!!existingProduct.featured || !!existingProduct.isFeatured);

      if (existingProduct.images && existingProduct.images.length > 0) {
        setImages(
          existingProduct.images.map((img: any, i: number) => ({
            id: img.id,
            url: img.url,
            altText: img.altText || existingProduct.title,
            isPrimary: img.isPrimary ?? i === 0,
            sortOrder: img.sortOrder ?? i + 1,
          }))
        );
      }

      if (existingProduct.variants && existingProduct.variants.length > 0) {
        setVariants(
          existingProduct.variants.map((v: any) => ({
            id: v.id,
            name: v.name,
            sku: v.sku,
            price: Number(v.price),
            stockQuantity: v.stockQuantity ?? v.inventory?.availableQuantity ?? v.stock ?? 0,
            lowStockThreshold: v.lowStockThreshold || 5,
          }))
        );
      }
    }
  }, [existingProduct]);

  // Auto-generate slug from title if creating
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEdit) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        name: 'Ceramic 8" Planter',
        sku: `PLT-${Date.now().toString().slice(-4)}`,
        price: basePrice + 500,
        stockQuantity: 10,
        lowStockThreshold: 3,
      },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 1) {
      showToast('A product must have at least one pot variant', 'error');
      return;
    }
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: keyof VariantFormItem, val: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: val };
    setVariants(updated);
  };

  const mutation = useMutation({
    mutationFn: (payload: any) => {
      if (isEdit) {
        return adminApi.updateProduct(id!, payload);
      }
      return adminApi.createProduct(payload);
    },
    onSuccess: () => {
      showToast(`Product ${isEdit ? 'updated' : 'created'} successfully`, 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-products-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
      navigate('/admin/products');
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to save product', 'error');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !basePrice || !categoryId) {
      showToast('Please fill all required botanical fields', 'error');
      return;
    }

    const payload = {
      title,
      slug,
      botanicalName,
      description,
      basePrice: Number(basePrice),
      categoryId,
      sunlight,
      watering,
      difficulty,
      petFriendly,
      airPurifying,
      isFeatured,
      images: images.length
        ? images.map((img, i) => ({
            url: img.url,
            altText: img.altText || title,
            isPrimary: img.isPrimary ?? i === 0,
            sortOrder: img.sortOrder ?? i + 1,
          }))
        : undefined,
      variants: variants.map((v) => ({
        name: v.name,
        sku: v.sku,
        price: Number(v.price),
        stockQuantity: Number(v.stockQuantity),
        lowStockThreshold: Number(v.lowStockThreshold),
      })),
    };

    mutation.mutate(payload);
  };

  if (isProductLoading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading plant details...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
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
            <span>{isEdit ? 'Edit Botanical Plant' : 'Add New Nursery Plant'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure plant metadata, pot size variants, greenhouse pricing, and botanical care rules.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Plant Details */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="font-serif font-bold text-base sm:text-lg text-slate-900">
            Botanical Identification
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Common Plant Name *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Monstera Deliciosa (Swiss Cheese Plant)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-forest-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">URL Slug *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="monstera-deliciosa"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-forest-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Latin / Botanical Name</label>
              <input
                type="text"
                value={botanicalName}
                onChange={(e) => setBotanicalName(e.target.value)}
                placeholder="e.g. Monstera deliciosa Liebm."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs italic text-slate-900 focus:bg-white focus:outline-none focus:border-forest-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Botanical Category *</label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-forest-700"
              >
                <option value="">Select a Category</option>
                {categories?.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Base Price (NPR रू) *</label>
              <input
                type="number"
                min="0"
                required
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-forest-700"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1 text-xs">
              Plant Description & Nursery Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the plant aesthetic, lush foliage, origin, and potting instructions..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-forest-700"
            />
          </div>
        </div>

        {/* Cloudinary Plant Photography & Image Management */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
              <ImageIcon size={18} className="text-forest-700" />
              <span>Plant Photography & Gallery</span>
            </h2>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 font-semibold">
              Cloudinary Optimized
            </span>
          </div>

          <ImageUploader
            images={images}
            onChange={setImages}
            folder="nursery_botanica/plants"
            productId={isEdit ? id : undefined}
            maxImages={8}
          />
        </div>

        {/* Botanical Care Rules & Attributes */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="font-serif font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
            <Sun size={18} className="text-amber-500" />
            <span>Plant Care & Horticultural Guidelines</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sunlight Needs</label>
              <select
                value={sunlight}
                onChange={(e) => setSunlight(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-forest-700"
              >
                <option value="FULL_SUN">Full Sun (6+ hrs direct)</option>
                <option value="BRIGHT_INDIRECT">Bright Indirect Light</option>
                <option value="MEDIUM_LIGHT">Medium Ambient Light</option>
                <option value="LOW_LIGHT">Low Light / Shade</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Watering Routine</label>
              <select
                value={watering}
                onChange={(e) => setWatering(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-forest-700"
              >
                <option value="LOW">Low (Allow to dry completely)</option>
                <option value="MODERATE">Moderate (When top 2 inches dry)</option>
                <option value="HIGH">High (Keep evenly moist)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Care Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-forest-700"
              >
                <option value="EASY">Beginner / Easy</option>
                <option value="MODERATE">Moderate / Intermediate</option>
                <option value="HARD">Expert / Collector</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 pt-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={petFriendly}
                onChange={(e) => setPetFriendly(e.target.checked)}
                className="w-4 h-4 rounded text-forest-700 focus:ring-forest-600"
              />
              <span className="font-semibold text-slate-700">Pet Friendly (Non-toxic)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={airPurifying}
                onChange={(e) => setAirPurifying(e.target.checked)}
                className="w-4 h-4 rounded text-forest-700 focus:ring-forest-600"
              />
              <span className="font-semibold text-slate-700">NASA Air Purifier</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-forest-700 focus:ring-forest-600"
              />
              <span className="font-semibold text-slate-700">Featured on Homepage</span>
            </label>
          </div>
        </div>

        {/* Variants & Pot Options Management */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
                <Layers size={18} className="text-forest-700" />
                <span>Pots, Planters & Stock Variants</span>
              </h2>
              <p className="text-xs text-slate-500">
                Each plant variant maintains its own independent live inventory & threshold.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddVariant}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sand-100 hover:bg-sand-200 text-forest-900 text-xs font-bold transition-colors"
            >
              <Plus size={14} />
              <span>Add Pot Variant</span>
            </button>
          </div>

          <div className="space-y-3">
            {variants.map((v, idx) => (
              <div
                key={idx}
                className="p-4 bg-sand-50/70 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs items-end"
              >
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Option / Pot Name
                  </label>
                  <input
                    type="text"
                    required
                    value={v.name}
                    onChange={(e) => handleVariantChange(idx, 'name', e.target.value)}
                    placeholder="e.g. 6-inch Terracotta"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-forest-700"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    value={v.sku}
                    onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-forest-700"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Price (रू)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={v.price}
                    onChange={(e) => handleVariantChange(idx, 'price', Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-forest-700"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={v.stockQuantity}
                      onChange={(e) =>
                        handleVariantChange(idx, 'stockQuantity', Number(e.target.value))
                      }
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-forest-700"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(idx)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                    title="Remove variant"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Link
            to="/admin/products"
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-6 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs shadow-xs flex items-center gap-2 disabled:opacity-50"
          >
            {mutation.isPending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 size={15} />
                <span>{isEdit ? 'Save Changes' : 'Publish Botanical Plant'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
