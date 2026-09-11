import React, { useState, useEffect } from 'react';
import { useUI } from '../../context/UIContext';
import { useQuery } from '@tanstack/react-query';
import { siteSettingsApi } from '../../api/site-settings.api';
import {
  Settings,
  Store,
  Clock,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { showToast } = useUI();

  // Settings State initialized from MySQL API
  const [storeName, setStoreName] = useState('RJ Flowers');
  const [supportPhone, setSupportPhone] = useState('9815155580');
  const [whatsappPhone, setWhatsappPhone] = useState('9815155580');
  const [supportEmail, setSupportEmail] = useState('contact@rjflowers.com');
  const [storeAddress, setStoreAddress] = useState('Pokhara-26, Arghau Chowk, Pokhara');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(2000);
  const [deliveryNotice, setDeliveryNotice] = useState('Delivery across Pokhara. Rs. 100 below Rs. 2,000; free delivery from Rs. 2,000.');

  const [saving, setSaving] = useState(false);

  // Load from MySQL
  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-site-settings'],
    queryFn: siteSettingsApi.getSettings,
  });

  useEffect(() => {
    if (settings) {
      if (settings.businessName) setStoreName(settings.businessName);
      if (settings.phone) setSupportPhone(settings.phone);
      if (settings.whatsappPhone) setWhatsappPhone(settings.whatsappPhone);
      if (settings.email) setSupportEmail(settings.email);
      if (settings.address) setStoreAddress(settings.address);
      if (settings.freeShippingThreshold !== undefined) setFreeShippingThreshold(Number(settings.freeShippingThreshold));
      if (settings.deliveryNotice) setDeliveryNotice(settings.deliveryNotice);
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await siteSettingsApi.updateSettings({
        businessName: storeName,
        phone: supportPhone,
        whatsappPhone,
        email: supportEmail,
        address: storeAddress,
        freeShippingThreshold,
        deliveryNotice,
      });
      showToast('Store settings saved to MySQL database!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 size={32} className="animate-spin text-forest-700" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight flex items-center gap-2.5">
          <Settings className="text-forest-700" size={28} />
          <span>Nursery & Store Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure business contact details, delivery announcement, and store rules stored in MySQL.
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

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Customer Support Email</label>
              <input
                type="email"
                required
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-forest-700"
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
                Orders above this amount qualify for zero delivery fee.
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
