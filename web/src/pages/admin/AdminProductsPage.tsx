import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin.api';
import { useUI } from '../../context/UIContext';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  RotateCw,
  Eye,
  CheckCircle2,
  ChevronRight,
  Sprout,
} from 'lucide-react';

export const AdminProductsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [page, setPage] = useState(1);
  const { showToast } = useUI();
  const queryClient = useQueryClient();

  const { data: productsData, isLoading, refetch } = useQuery({
    queryKey: ['admin-products-list', search, selectedCategory, page],
    queryFn: () =>
      adminApi.getProducts({
        search: search.trim() || undefined,
        category: selectedCategory || undefined,
        page,
        limit: 20,
      }),
  });

  const { data: categories } = useQuery({
    queryKey: ['admin-categories-quick'],
    queryFn: adminApi.getCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteProduct(id),
    onSuccess: () => {
      showToast('Product deleted/archived successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-products-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to delete product', 'error');
    },
  });

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to remove/archive "${title}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight flex items-center gap-2.5">
            <Package className="text-forest-700" size={28} />
            <span>Botanical Product Catalog</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage living plants, pot variants, botanical specs, care guides, and pricing.
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
          <Link
            to="/admin/products/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            <Plus size={16} />
            <span>New Plant</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search plants by name, botanical name, slug..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-forest-700"
          />
        </div>

        <div className="sm:w-60">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold focus:bg-white focus:outline-none focus:border-forest-700"
          >
            <option value="">All Botanical Categories</option>
            {categories?.map((c: any) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!productsData?.products || productsData.products.length === 0) && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Package size={40} className="mx-auto text-slate-300" />
          <h3 className="font-serif font-bold text-lg text-slate-800">No Plants Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria or add a new plant to the nursery inventory.
          </p>
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-forest-800 text-white rounded-xl text-xs font-bold mt-2"
          >
            <Plus size={14} />
            <span>Add Plant Now</span>
          </Link>
        </div>
      )}

      {/* DESKTOP TABLE VIEW */}
      {!isLoading && productsData?.products && productsData.products.length > 0 && (
        <div className="hidden md:block bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sand-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Plant & Botanical Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Variants / Pots</th>
                <th className="py-3.5 px-4">Total Stock</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {productsData.products.map((p: any) => {
                const totalStock = p.variants?.reduce((sum: number, v: any) => sum + (v.stockQuantity || 0), 0) ?? 0;
                const isLowStock = p.variants?.some((v: any) => (v.stockQuantity || 0) <= (v.lowStockThreshold || 5));

                return (
                  <tr key={p.id} className="hover:bg-sand-50/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=100&auto=format&fit=crop'}
                          alt={p.title}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{p.title}</div>
                          {p.botanicalName && (
                            <div className="text-[11px] text-forest-700 italic">{p.botanicalName}</div>
                          )}
                          <div className="text-[10px] text-slate-400 font-mono">{p.slug}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 bg-sand-100 px-2 py-0.5 rounded-md text-[11px]">
                        {p.category?.name || 'Uncategorized'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      रू {Number(p.basePrice).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-700">
                        {p.variants?.length || 0} pot option(s)
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold font-mono text-slate-900">{totalStock} units</span>
                        {isLowStock && (
                          <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded">
                            Low
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Link
                        to={`/products/${p.slug}`}
                        target="_blank"
                        className="inline-flex p-1.5 rounded-lg text-slate-400 hover:text-forest-800 hover:bg-slate-100 transition-colors"
                        title="View on store"
                      >
                        <Eye size={16} />
                      </Link>
                      <Link
                        to={`/admin/products/${p.id}`}
                        className="inline-flex p-1.5 rounded-lg text-slate-600 hover:text-forest-800 hover:bg-forest-50 transition-colors"
                        title="Edit plant"
                      >
                        <Edit2 size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id, p.title)}
                        className="inline-flex p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete plant"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MOBILE CARD VIEW */}
      {!isLoading && productsData?.products && productsData.products.length > 0 && (
        <div className="md:hidden space-y-3">
          {productsData.products.map((p: any) => {
            const totalStock = p.variants?.reduce((sum: number, v: any) => sum + (v.stockQuantity || 0), 0) ?? 0;
            const isLowStock = p.variants?.some((v: any) => (v.stockQuantity || 0) <= (v.lowStockThreshold || 5));

            return (
              <div
                key={p.id}
                className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=100&auto=format&fit=crop'}
                    alt={p.title}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-slate-900 truncate">{p.title}</h3>
                    {p.botanicalName && (
                      <p className="text-[11px] text-forest-700 italic">{p.botanicalName}</p>
                    )}
                    <span className="inline-block bg-sand-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded mt-1">
                      {p.category?.name || 'General'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs py-2 border-y border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Price</span>
                    <span className="font-bold text-slate-900 font-mono">रू {Number(p.basePrice).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Total Stock</span>
                    <span className="font-bold text-slate-900 font-mono">{totalStock} units</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Pots / Variants</span>
                    <span className="font-bold text-slate-900">{p.variants?.length || 0}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <Link
                    to={`/products/${p.slug}`}
                    target="_blank"
                    className="text-xs text-slate-500 hover:text-forest-800 font-medium inline-flex items-center gap-1"
                  >
                    <Eye size={13} />
                    <span>View Store</span>
                  </Link>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(p.id, p.title)}
                      className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                    <Link
                      to={`/admin/products/${p.id}`}
                      className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-forest-800 text-white font-bold text-xs shadow-xs"
                    >
                      <Edit2 size={13} />
                      <span>Edit</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
