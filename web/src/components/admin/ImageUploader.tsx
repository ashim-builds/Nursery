import React, { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { uploadApi } from '../../api/upload.api';
import { useUI } from '../../context/UIContext';
import {
  UploadCloud,
  Image as ImageIcon,
  Star,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Plus,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';

export interface ManagedImage {
  id?: string;
  url: string;
  altText?: string;
  isPrimary?: boolean;
  sortOrder?: number;
  publicId?: string;
}

interface ImageUploaderProps {
  images: ManagedImage[];
  onChange: (images: ManagedImage[]) => void;
  folder?: string;
  productId?: string;
  maxImages?: number;
  allowUrlInput?: boolean;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
const MAX_FILE_SIZE_MB = 10;

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChange,
  folder = 'nursery_botanica/products',
  productId,
  maxImages = 8,
  allowUrlInput = true,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [urlInputOpen, setUrlInputOpen] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { showToast } = useUI();

  // Validate and upload a single file
  const handleFileUpload = async (file: File) => {
    // 1. Validate MIME type
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      showToast(`Invalid format (${file.type}). Use JPG, PNG, WebP, or AVIF.`, 'error');
      return;
    }

    // 2. Validate File Size
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      showToast(`File too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max limit is ${MAX_FILE_SIZE_MB}MB.`, 'error');
      return;
    }

    try {
      setIsUploading(true);
      const res = await uploadApi.uploadImage(file, folder);

      const isFirst = images.length === 0;
      const newImage: ManagedImage = {
        url: res.secureUrl || res.url,
        publicId: res.publicId,
        isPrimary: isFirst,
        sortOrder: images.length + 1,
        altText: file.name.replace(/\.[^/.]+$/, ''),
      };

      onChange([...images, newImage]);
      showToast('Image uploaded and optimized successfully', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to upload image', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files);

    if (images.length + files.length > maxImages) {
      showToast(`Maximum ${maxImages} images allowed per item.`, 'error');
      return;
    }

    for (const file of files) {
      await handleFileUpload(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    if (!e.dataTransfer.files?.length) return;
    const files = Array.from(e.dataTransfer.files);

    for (const file of files) {
      await handleFileUpload(file);
    }
  };

  const handleAddUrl = () => {
    if (!customUrl.trim()) return;

    const isFirst = images.length === 0;
    const newImage: ManagedImage = {
      url: customUrl.trim(),
      isPrimary: isFirst,
      sortOrder: images.length + 1,
      altText: 'Botanical Plant Image',
    };

    onChange([...images, newImage]);
    setCustomUrl('');
    setUrlInputOpen(false);
    showToast('Image URL added', 'success');
  };

  // Reorder Images (Move item by delta: -1 for left/up, +1 for right/down)
  const handleMove = (index: number, delta: number) => {
    const targetIndex = index + delta;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Refresh sortOrder numbers
    const reordered = updated.map((img, i) => ({
      ...img,
      sortOrder: i + 1,
    }));

    onChange(reordered);
  };

  // Set Primary Image
  const handleSetPrimary = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    onChange(updated);
    showToast('Primary plant photo updated', 'success');
  };

  // Delete Image
  const handleDelete = (index: number) => {
    const isDeletedPrimary = images[index].isPrimary;
    const remaining = images.filter((_, i) => i !== index);

    // If we deleted the primary image and other images exist, make the first one primary
    if (isDeletedPrimary && remaining.length > 0) {
      remaining[0].isPrimary = true;
    }

    // Refresh sortOrder
    const reordered = remaining.map((img, i) => ({
      ...img,
      sortOrder: i + 1,
    }));

    onChange(reordered);
    showToast('Image removed', 'success');
  };

  return (
    <div className="space-y-4">
      {/* Upload Drag & Drop Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
          dragOver
            ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
            : 'border-slate-300 hover:border-forest-600 bg-sand-50/60 hover:bg-sand-100/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={handleFilesSelected}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2 text-forest-800 py-2">
            <Loader2 size={32} className="animate-spin text-forest-700" />
            <p className="text-xs font-bold">Optimizing & Uploading to Cloudinary...</p>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-forest-800 shadow-xs">
              <UploadCloud size={24} />
            </div>

            <div>
              <p className="font-bold text-xs sm:text-sm text-slate-800">
                Click to upload plant photography or drag & drop files
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                PNG, JPG, WebP, AVIF up to 10MB • Auto Cloudinary WebP/AVIF optimization
              </p>
            </div>
          </>
        )}
      </div>

      {/* Alternative URL Input Toggle */}
      {allowUrlInput && (
        <div>
          {!urlInputOpen ? (
            <button
              type="button"
              onClick={() => setUrlInputOpen(true)}
              className="text-xs font-semibold text-forest-700 hover:text-forest-900 inline-flex items-center gap-1"
            >
              <LinkIcon size={13} />
              <span>Or add image from URL...</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-sand-50 p-2.5 rounded-2xl border border-slate-200 text-xs">
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-forest-700"
              />
              <button
                type="button"
                onClick={handleAddUrl}
                className="px-3 py-1.5 bg-forest-800 text-white rounded-xl font-bold hover:bg-forest-900 shadow-xs"
              >
                Add URL
              </button>
              <button
                type="button"
                onClick={() => setUrlInputOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700"
              >
                <X size={15} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Image Gallery Grid (Reorder, Set Primary, Delete) */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">
              Attached Photos ({images.length}/{maxImages})
            </span>
            <span className="text-[11px] text-slate-400">
              Starred photo is displayed as the primary catalog cover
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <div
                key={idx}
                className={`relative group rounded-2xl overflow-hidden border-2 transition-all bg-white shadow-xs ${
                  img.isPrimary ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200'
                }`}
              >
                <div className="aspect-square relative">
                  <img
                    src={img.url}
                    alt={img.altText || `Plant photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Primary Badge */}
                  {img.isPrimary && (
                    <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                      <Star size={10} fill="currentColor" />
                      <span>Primary</span>
                    </div>
                  )}

                  {/* Sort Order Indicator */}
                  <div className="absolute top-2 right-2 bg-slate-900/60 text-white text-[10px] font-mono px-1.5 py-0.5 rounded backdrop-blur-xs">
                    #{idx + 1}
                  </div>
                </div>

                {/* Bottom Action Controls */}
                <div className="p-2 bg-sand-50/90 border-t border-slate-100 flex items-center justify-between text-xs">
                  {/* Reorder Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, -1)}
                      className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 disabled:opacity-30"
                      title="Move Left / Earlier"
                    >
                      <ArrowLeft size={13} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === images.length - 1}
                      onClick={() => handleMove(idx, 1)}
                      className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 disabled:opacity-30"
                      title="Move Right / Later"
                    >
                      <ArrowRight size={13} />
                    </button>
                  </div>

                  {/* Set Primary Button */}
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(idx)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      img.isPrimary
                        ? 'text-amber-500 bg-amber-50'
                        : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'
                    }`}
                    title={img.isPrimary ? 'Primary cover image' : 'Make primary cover image'}
                  >
                    <Star size={14} fill={img.isPrimary ? 'currentColor' : 'none'} />
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDelete(idx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete photo"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
