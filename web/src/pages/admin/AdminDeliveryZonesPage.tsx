import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api';
import { useUI } from '../../context/UIContext';
import {
  Truck,
  Edit2,
  Plus,
  RotateCw,
  X,
  CheckCircle2,
  Clock,
  MapPin,
} from 'lucide-react';

export const AdminDeliveryZonesPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<any | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [deliveryCharge, setDeliveryCharge] = useState<number>(100);
  const [minimumOrder, setMinimumOrder] = useState<number>(0);
  const [estimatedHours, setEstimatedHours] = useState<number>(24);
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState('Same Day (Within 24 Hours)');
  const [isActive, setIsActive] = useState(true);

  const { showToast } = useUI();
  const queryClient = useQueryClient();

  const { data: zones, isLoading, refetch } = useQuery({
    queryKey: ['admin-delivery-zones-page'],
    queryFn: adminApi.getDeliveryZones,
  });

  const saveMutation = useMutation({
    mutationFn: (payload: any) => {
      if (editingZone) {
        return adminApi.updateDeliveryZone(editingZone.id, payload);
      }
      return adminApi.createDeliveryZone(payload);
    },
    onSuccess: () => {
      showToast(`Delivery zone ${editingZone ? 'updated' : 'configured'} successfully`, 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-delivery-zones-page'] });
      setModalOpen(false);
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to save delivery zone', 'error');
    },
  });

  const openEdit = (zone: any) => {
    setEditingZone(zone);
    setName(zone.name || '');
    setCode(zone.code || '');
    setDescription(zone.description || '');
    setDeliveryCharge(Number(zone.deliveryCharge ?? zone.baseDeliveryCharge ?? 100));
    setMinimumOrder(Number(zone.minimumOrder || 0));
    setEstimatedHours(Number(zone.estimatedHours || 24));
    setEstimatedDeliveryTime(zone.estimatedDeliveryTime || 'Within 24 Hours');
    setIsActive(zone.isActive !== false && zone.active !== false);
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditingZone(null);
    setName('');
    setCode('');
    setDescription('');
    setDeliveryCharge(100);
    setMinimumOrder(0);
    setEstimatedHours(24);
    setEstimatedDeliveryTime('Within 24-48 Hours');
    setIsActive(true);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) {
      showToast('Please enter zone name and unique code', 'error');
      return;
    }

    saveMutation.mutate({
      name,
      code: code.toUpperCase().trim(),
      description,
      deliveryCharge: Number(deliveryCharge),
      baseDeliveryCharge: Number(deliveryCharge),
      minimumOrder: Number(minimumOrder),
      estimatedHours: Number(estimatedHours),
      estimatedDeliveryTime,
      isActive,
      active: isActive,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight flex items-center gap-2.5">
            <Truck className="text-forest-700" size={28} />
            <span>Delivery Zones & Shipping Rates</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure delivery tariffs and transit time guarantees for Kathmandu Valley and Outside Valley.
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
            onClick={openCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            <Plus size={16} />
            <span>New Zone</span>
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      )}

      {/* DESKTOP TABLE VIEW */}
      {!isLoading && zones && zones.length > 0 && (
        <div className="hidden md:block bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sand-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Zone Name & Code</th>
                <th className="py-3.5 px-4">Coverage Description</th>
                <th className="py-3.5 px-4">Shipping Fee</th>
                <th className="py-3.5 px-4">Transit Time</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {zones.map((z: any) => (
                <tr key={z.id} className="hover:bg-sand-50/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{z.name}</div>
                    <span className="font-mono text-[10px] text-forest-700 bg-sand-100 px-1.5 py-0.5 rounded">
                      {z.code}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                    {z.description || 'General valley coverage'}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    रू {Number(z.deliveryCharge ?? z.baseDeliveryCharge ?? 0).toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    {z.estimatedDeliveryTime || `${z.estimatedHours || 24} hours`}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        z.isActive !== false && z.active !== false
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {z.isActive !== false && z.active !== false ? 'Active' : 'Disabled'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => openEdit(z)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-forest-800 hover:bg-forest-50 transition-colors"
                      title="Edit Zone Rates"
                    >
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MOBILE CARD VIEW */}
      {!isLoading && zones && zones.length > 0 && (
        <div className="md:hidden space-y-3">
          {zones.map((z: any) => (
            <div
              key={z.id}
              className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3 text-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{z.name}</h3>
                  <span className="font-mono text-[10px] text-forest-700 bg-sand-100 px-1.5 py-0.5 rounded">
                    {z.code}
                  </span>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    z.isActive !== false && z.active !== false
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {z.isActive !== false && z.active !== false ? 'Active' : 'Disabled'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-sand-50/80 p-2.5 rounded-2xl border border-slate-100 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Shipping Fee</span>
                  <span className="font-serif font-bold text-slate-900 font-mono">
                    रू {Number(z.deliveryCharge ?? z.baseDeliveryCharge ?? 0).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Delivery Time</span>
                  <span className="font-semibold text-slate-800">
                    {z.estimatedDeliveryTime || `${z.estimatedHours || 24}h`}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-[11px] text-slate-500 truncate max-w-[200px]">
                  {z.description || 'Nepal Logistics'}
                </span>
                <button
                  onClick={() => openEdit(z)}
                  className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-forest-800 text-white font-bold text-xs shadow-xs"
                >
                  <Edit2 size={13} />
                  <span>Edit Rate</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT / CREATE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl relative text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-slate-900">
                {editingZone ? 'Edit Delivery Zone Rate' : 'New Delivery Zone'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Zone Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kathmandu Ring Road Core"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-forest-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Zone Code *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="KTM_RING"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:bg-white focus:outline-none focus:border-forest-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Delivery Charge (रू) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={deliveryCharge}
                    onChange={(e) => setDeliveryCharge(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:bg-white focus:outline-none focus:border-forest-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Estimated Delivery Guarantee</label>
                <input
                  type="text"
                  value={estimatedDeliveryTime}
                  onChange={(e) => setEstimatedDeliveryTime(e.target.value)}
                  placeholder="Same Day (Within 24 Hours)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-forest-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Coverage Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Areas covered (e.g. Baluwatar, Baneshwor, Thamel, Lazimpat)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs focus:bg-white focus:outline-none focus:border-forest-700"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-forest-700"
                />
                <span className="font-semibold text-slate-700">Active Delivery Zone</span>
              </label>

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
                      <span>{editingZone ? 'Save Changes' : 'Create Zone'}</span>
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
