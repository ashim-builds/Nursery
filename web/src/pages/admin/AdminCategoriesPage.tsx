import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api';
import { useUI } from '../../context/UIContext';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Image as ImageIcon,
  RotateCw,
  FolderTree,
} from 'lucide-react';
import { ImageUploader } from '../../components/admin/ImageUploader';

export const AdminCategoriesPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const { showToast, confirmAction } = useUI();
  const queryClient = useQueryClient();

  const { data: categories, isLoading, refetch } = useQuery({
    queryKey: ['admin-categories-page'],
    queryFn: adminApi.getCategories,
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('');
    setModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    setName(cat.name || '');
    setSlug(cat.slug || '');
    setDescription(cat.description || '');
    setImageUrl(cat.imageUrl || '');
    setModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  const saveMutation = useMutation({
    mutationFn: (payload: any) => {
      if (editingCategory) {
        return adminApi.updateCategory(editingCategory.id, payload);
      }
      return adminApi.createCategory(payload);
    },
    onSuccess: () => {
      showToast(`Category ${editingCategory ? 'updated' : 'created'} successfully`, 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-categories-page'] });
      setModalOpen(false);
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to save category', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteCategory(id),
    onSuccess: () => {
      showToast('Category deleted successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-categories-page'] });
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to delete category', 'error');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      showToast('Please provide name and slug', 'error');
      return;
    }
    saveMutation.mutate({
      name,
      slug,
      description,
      imageUrl: imageUrl || undefined,
    });
  };

  const handleDelete = async (id: string, catName: string) => {
    if (await confirmAction(`Are you sure you want to delete category "${catName}"?`, { title: 'Delete category', confirmLabel: 'Delete' })) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight flex items-center gap-2.5">
            <Layers className="text-forest-700" size={28} />
            <span>Botanical Categories</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organize plants into botanical collections (Indoor, Flowering, Bonsai, Herbs, etc.).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            <RotateCw size={14} />
            <span>Refresh</span>
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            <Plus size={16} />
            <span>New Category</span>
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (!categories || categories.length === 0) && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <FolderTree size={40} className="mx-auto text-slate-300" />
          <h3 className="font-serif font-bold text-lg text-slate-800">No Categories Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create botanical categories so customers can easily browse indoor, outdoor, or bonsai species.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-forest-800 text-white rounded-xl text-xs font-bold mt-2"
          >
            <Plus size={14} />
            <span>Create First Category</span>
          </button>
        </div>
      )}

      {/* DESKTOP TABLE VIEW */}
      {!isLoading && categories && categories.length > 0 && (
        <div className="hidden md:block bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sand-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Category Name & Slug</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Products</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {categories.map((cat: any) => (
                <tr key={cat.id} className="hover:bg-sand-50/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={cat.imageUrl || 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=100&auto=format&fit=crop'}
                        alt={cat.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{cat.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">/category/{cat.slug}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs text-slate-600 truncate">
                    {cat.description || '—'}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-forest-800 bg-forest-50 px-2.5 py-1 rounded-full text-[11px]">
                      {cat.productCount ?? cat._count?.products ?? 0} plants
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-forest-800 hover:bg-forest-50 transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MOBILE CARD VIEW */}
      {!isLoading && categories && categories.length > 0 && (
        <div className="md:hidden space-y-3">
          {categories.map((cat: any) => (
            <div
              key={cat.id}
              className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <img
                  src={cat.imageUrl || 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=100&auto=format&fit=crop'}
                  alt={cat.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-slate-900">{cat.name}</h3>
                  <p className="text-[11px] text-slate-400 font-mono">/category/{cat.slug}</p>
                  <span className="inline-block text-[10px] font-bold text-forest-800 bg-forest-50 px-2 py-0.5 rounded mt-1">
                    {cat.productCount ?? cat._count?.products ?? 0} plants
                  </span>
                </div>
              </div>

              {cat.description && (
                <p className="text-slate-600 text-xs bg-sand-50/80 p-2.5 rounded-xl">
                  {cat.description}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
                <button
                  onClick={() => openEditModal(cat)}
                  className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-forest-800 text-white font-bold text-xs shadow-xs"
                >
                  <Edit2 size={13} />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT CATEGORY MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-slate-900">
                {editingCategory ? 'Edit Category' : 'New Botanical Category'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Indoor Foliage"
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
                  placeholder="indoor-foliage"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-forest-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category Image / Banner</label>
                <ImageUploader
                  images={imageUrl ? [{ url: imageUrl, isPrimary: true, altText: name }] : []}
                  onChange={(imgs) => setImageUrl(imgs[0]?.url || '')}
                  folder="nursery_botanica/categories"
                  maxImages={1}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of plants in this category..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-forest-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-forest-800 text-white font-bold hover:bg-forest-900 shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saveMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>{editingCategory ? 'Update' : 'Create'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
