import React, { useState, useRef } from 'react';
import { useUI } from '../../context/UIContext';
import {
  UploadCloud,
  Image as ImageIcon,
  Star,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Link as LinkIcon,
  CheckCircle2,
  Loader2,
  X,
} from 'lucide-react';

export interface ManagedImage {
  id?: string;
  url: string;
  altText?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

interface ImageUploaderProps {
  images: ManagedImage[];
  onChange: (images: ManagedImage[]) => void;
  folder?: string;
  productId?: string;
  maxImages?: number;
  allowUrlInput?: boolean;
}

// Compress image on browser canvas to keep MySQL database lean and super-fast
const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIMENSION = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIMENSION) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          }
        } else {
          if (height > MAX_DIMENSION) {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Output clean JPEG data URI
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
        resolve(compressedBase64);
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChange,
  maxImages = 8,
  allowUrlInput = true,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [urlInputOpen, setUrlInputOpen] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { showToast } = useUI();

  const handleProcessFile = async (file: File) => {
    try {
      setIsProcessing(true);
      const base64Data = await compressImageFile(file);

      const isFirst = images.length === 0;
      const newImage: ManagedImage = {
        url: base64Data,
        isPrimary: isFirst,
        sortOrder: images.length + 1,
        altText: file.name.replace(/\.[^/.]+$/, ''),
      };

      onChange([...images, newImage]);
      showToast('Image attached and stored in MySQL database', 'success');
    } catch (err) {
      showToast('Failed to process image file', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files);

    if (images.length + files.length > maxImages) {
      showToast(`Maximum ${maxImages} images allowed per plant.`, 'error');
      return;
    }

    for (const file of files) {
      await handleProcessFile(file);
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
      await handleProcessFile(file);
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
    showToast('Image URL saved to database', 'success');
  };

  const handleMove = (index: number, delta: number) => {
    const targetIndex = index + delta;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const reordered = updated.map((img, i) => ({
      ...img,
      sortOrder: i + 1,
    }));

    onChange(reordered);
  };

  const handleSetPrimary = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    onChange(updated);
    showToast('Primary plant photo updated', 'success');
  };

  const handleDelete = (index: number) => {
    const isDeletedPrimary = images[index].isPrimary;
    const remaining = images.filter((_, i) => i !== index);

    if (isDeletedPrimary && remaining.length > 0) {
      remaining[0].isPrimary = true;
    }

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
        className={`border-2 border-dashed rounded-3xl p-5 sm:p-7 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 ${
          dragOver
            ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
            : 'border-slate-300 hover:border-forest-600 bg-sand-50/60 hover:bg-sand-100/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFilesSelected}
          className="hidden"
        />

        {isProcessing ? (
          <div className="flex flex-col items-center gap-2 text-forest-800 py-2">
            <Loader2 size={28} className="animate-spin text-forest-700" />
            <p className="text-xs font-bold">Processing & optimizing for database...</p>
          </div>
        ) : (
          <>
            <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-forest-800 shadow-xs">
              <UploadCloud size={22} />
            </div>

            <div>
              <p className="font-bold text-xs sm:text-sm text-slate-800">
                Click to pick photo from phone/computer or drag file here
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
              <span>Or paste image URL / link...</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-sand-50 p-2.5 rounded-2xl border border-slate-200 text-xs">
              <input
                type="text"
                placeholder="https://... or /hero-plant.jpg"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-forest-700"
              />
              <button
                type="button"
                onClick={handleAddUrl}
                className="px-3 py-1.5 bg-forest-800 text-white rounded-xl font-bold hover:bg-forest-900 shadow-xs"
              >
                Attach
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

      {/* Image Gallery Grid */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">
              Attached Photos ({images.length}/{maxImages})
            </span>
            <span className="text-[11px] text-slate-400">
              Starred photo will be the main plant cover
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

                  {img.isPrimary && (
                    <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                      <Star size={10} fill="currentColor" />
                      <span>Primary</span>
                    </div>
                  )}

                  <div className="absolute top-2 right-2 bg-slate-900/60 text-white text-[10px] font-mono px-1.5 py-0.5 rounded backdrop-blur-xs">
                    #{idx + 1}
                  </div>
                </div>

                <div className="p-2 bg-sand-50/90 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, -1)}
                      className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 disabled:opacity-30"
                      title="Move Left"
                    >
                      <ArrowLeft size={13} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === images.length - 1}
                      onClick={() => handleMove(idx, 1)}
                      className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 disabled:opacity-30"
                      title="Move Right"
                    >
                      <ArrowRight size={13} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSetPrimary(idx)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      img.isPrimary
                        ? 'text-amber-500 bg-amber-50'
                        : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'
                    }`}
                    title={img.isPrimary ? 'Primary cover' : 'Set as primary'}
                  >
                    <Star size={14} fill={img.isPrimary ? 'currentColor' : 'none'} />
                  </button>

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
