import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api';
import { useUI } from '../../context/UIContext';
import {
  Tag,
  Plus,
  Trash2,
  Edit2,
  X,
  CheckCircle2,
  RotateCw,
  Calendar,
  Percent,
} from 'lucide-react';

export const AdminCouponsPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(1000);
  const [maxDiscount, setMaxDiscount] = useState<number>(500);
  const [usageLimit, setUsageLimit] = useState<number>(100);
  const [expiresAt, setExpiresAt] = useState('');

  const { showToast, confirmAction } = useUI();
  const queryClient = useQueryClient();

  const { data: coupons, isLoading, refetch } = useQuery({
    queryKey: ['admin-coupons-page'],
    queryFn: adminApi.getCoupons,
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => adminApi.createCoupon(payload),
    onSuccess: () => {
      showToast('Coupon code generated successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-coupons-page'] });
      setModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to create coupon', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteCoupon(id),
    onSuccess: () => {
      showToast('Coupon deleted successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-coupons-page'] });
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to delete coupon', 'error');
    },
  });

  const resetForm = () => {
    setCode('');
    setDiscountType('PERCENTAGE');
    setDiscountValue(10);
    setMinOrderAmount(1000);
    setMaxDiscount(500);
    setUsageLimit(100);
    setExpiresAt('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue) {
      showToast('Please enter coupon code and discount value', 'error');
      return;
    }

    createMutation.mutate({
      code: code.toUpperCase().trim(),
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount),
      maxDiscount: discountType === 'PERCENTAGE' ? Number(maxDiscount) : undefined,
      usageLimit: Number(usageLimit),
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight flex items-center gap-2.5">
            <Tag className="text-forest-700" size={28} />
            <span>Botanical Coupons & Promotions</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create promotional discount codes for seasonal campaigns and plant sales.
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
            onClick={() => {
              resetForm();
              setModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            <Plus size={16} />
            <span>New Coupon</span>
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

      {/* Empty State */}
      {!isLoading && (!coupons || coupons.length === 0) && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Tag size={40} className="mx-auto text-slate-300" />
          <h3 className="font-serif font-bold text-lg text-slate-800">No Active Coupons</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create a coupon code (e.g. MONSOON20, BOTANICAL10) to offer checkout discounts.
          </p>
          <button
            onClick={() => {
              resetForm();
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-forest-800 text-white rounded-xl text-xs font-bold mt-2"
          >
            <Plus size={14} />
            <span>Create First Coupon</span>
          </button>
        </div>
      )}

      {/* DESKTOP TABLE VIEW */}
      {!isLoading && coupons && coupons.length > 0 && (
        <div className="hidden md:block bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sand-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Coupon Code</th>
                <th className="py-3.5 px-4">Discount</th>
                <th className="py-3.5 px-4">Min Spend</th>
                <th className="py-3.5 px-4 text-center">Usage Count</th>
                <th className="py-3.5 px-4">Expiry Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {coupons.map((c: any) => (
                <tr key={c.id} className="hover:bg-sand-50/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-slate-900 bg-sand-100 px-2.5 py-1 rounded-xl text-xs">
                      {c.code}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-forest-900">
                    {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `रू ${c.discountValue} OFF`}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-600">
                    रू {Number(c.minOrderAmount || 0).toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono">
                    {c.usedCount || 0} / {c.usageLimit || '∞'}
                  </td>

                  <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'No expiry'}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.isActive !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {c.isActive !== false ? 'Active' : 'Disabled'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={async () => {
                        if (await confirmAction(`Delete coupon "${c.code}"?`, { title: 'Delete coupon', confirmLabel: 'Delete' })) {
                          deleteMutation.mutate(c.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Coupon"
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
      {!isLoading && coupons && coupons.length > 0 && (
        <div className="md:hidden space-y-3">
          {coupons.map((c: any) => (
            <div
              key={c.id}
              className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sm text-slate-900 bg-sand-100 px-3 py-1 rounded-xl">
                  {c.code}
                </span>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    c.isActive !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {c.isActive !== false ? 'Active' : 'Disabled'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-sand-50/80 p-2.5 rounded-2xl border border-slate-100 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Discount</span>
                  <span className="font-bold text-forest-900">
                    {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `रू ${c.discountValue} OFF`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Min Order</span>
                  <span className="font-bold text-slate-700 font-mono">
                    रू {Number(c.minOrderAmount || 0).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Usage</span>
                  <span className="font-mono text-slate-700">
                    {c.usedCount || 0} / {c.usageLimit || '∞'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Expires</span>
                  <span className="text-slate-700">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={async () => {
                    if (await confirmAction(`Delete coupon "${c.code}"?`, { title: 'Delete coupon', confirmLabel: 'Delete' })) {
                      deleteMutation.mutate(c.id);
                    }
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs"
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl relative text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-slate-900">Generate New Promo Coupon</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. MONSOON15"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase focus:bg-white focus:outline-none focus:border-forest-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-none focus:border-forest-700"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed NPR (रू)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:bg-white focus:outline-none focus:border-forest-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Order (रू)</label>
                  <input
                    type="number"
                    min="0"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:bg-white focus:outline-none focus:border-forest-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Discount (रू)</label>
                  <input
                    type="number"
                    min="0"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:bg-white focus:outline-none focus:border-forest-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:bg-white focus:outline-none focus:border-forest-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-forest-700"
                  />
                </div>
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
                  disabled={createMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-forest-800 text-white font-bold hover:bg-forest-900 shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {createMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Generate Code</span>
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
