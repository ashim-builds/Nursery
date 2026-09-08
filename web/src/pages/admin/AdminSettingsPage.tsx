import React, { useState } from 'react';
import { useUI } from '../../context/UIContext';
import {
  Settings,
  Store,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { showToast } = useUI();

  // Settings State
  const [storeName, setStoreName] = useState(() => localStorage.getItem('nursery_store_name') || 'RJ Flowers');
  const [supportPhone, setSupportPhone] = useState(() => localStorage.getItem('nursery_phone') || '+977 9815155580');
  const [whatsappPhone, setWhatsappPhone] = useState(() => localStorage.getItem('nursery_whatsapp') || '+977 9815155580');
  const [supportEmail, setSupportEmail] = useState(() => localStorage.getItem('nursery_email') || 'nursery@gmail.com');
  const [storeAddress, setStoreAddress] = useState(() => localStorage.getItem('nursery_address') || 'Pokhara-26, Arghau Chowk, Pokhara');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(() => Number(localStorage.getItem('nursery_free_shipping')) || 2000);
  const [deliveryNotice, setDeliveryNotice] = useState(() => localStorage.getItem('nursery_delivery_notice') || 'Delivery across Pokhara. Rs. 100 below Rs. 2,000; free delivery from Rs. 2,000.');

  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Save to localStorage
    localStorage.setItem('nursery_store_name', storeName);
    localStorage.setItem('nursery_phone', supportPhone);
    localStorage.setItem('nursery_whatsapp', whatsappPhone);
    localStorage.setItem('nursery_email', supportEmail);
    localStorage.setItem('nursery_address', storeAddress);
    localStorage.setItem('nursery_free_shipping', freeShippingThreshold.toString());
    localStorage.setItem('nursery_delivery_notice', deliveryNotice);

    setTimeout(() => {
      setSaving(false);
      showToast('Store settings updated successfully!', 'success');
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight flex items-center gap-2.5">
          <Settings className="text-forest-700" size={28} />
          <span>Nursery & Store Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure business contact details, delivery announcement, and store rules.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Identity */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="font-serif font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
            <Store size={18} className="text-forest-700" />
            <span>Store Contact & Location</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Business Name</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-forest-700 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Customer Support Phone</label>
              <input
                type="text"
                required
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-forest-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">WhatsApp Plant Dispatch Line</label>
              <input
                type="text"
                value={whatsappPhone}
                onChange={(e) => setWhatsappPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-forest-700"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Physical Nursery Location</label>
              <input
                type="text"
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-forest-700"
              />
            </div>
          </div>
        </div>

        {/* Fulfillment Rules */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="font-serif font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
            <Clock size={18} className="text-forest-700" />
            <span>Shipping & Announcements</span>
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Free Shipping Threshold (NPR रू)
              </label>
              <input
                type="number"
                min="0"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-forest-700"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Orders above this amount qualify for zero delivery fee in Kathmandu Valley.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 text-xs">
                Storefront Header Delivery Announcement Banner
              </label>
              <textarea
                rows={2}
                value={deliveryNotice}
                onChange={(e) => setDeliveryNotice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-forest-700"
              />
            </div>
          </div>
        </div>

        {/* Save Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs uppercase tracking-wider shadow-xs flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 size={15} />
                <span>Save Store Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
