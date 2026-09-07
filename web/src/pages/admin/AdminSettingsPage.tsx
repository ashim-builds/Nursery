import React, { useState } from 'react';
import { useUI } from '../../context/UIContext';
import {
  Settings,
  Store,
  Phone,
  Mail,
  MapPin,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Bell,
  Clock,
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { showToast } = useUI();

  // Settings State (stored in localStorage or backend config)
  const [storeName, setStoreName] = useState(() => localStorage.getItem('nursery_store_name') || 'Nursery Botanical Nepal');
  const [supportPhone, setSupportPhone] = useState(() => localStorage.getItem('nursery_phone') || '+977 9801234567');
  const [whatsappPhone, setWhatsappPhone] = useState(() => localStorage.getItem('nursery_whatsapp') || '+977 9801234567');
  const [supportEmail, setSupportEmail] = useState(() => localStorage.getItem('nursery_email') || 'support@nursery.com.np');
  const [storeAddress, setStoreAddress] = useState(() => localStorage.getItem('nursery_address') || 'Baluwatar, Kathmandu 44600, Nepal');
  const [panNumber, setPanNumber] = useState(() => localStorage.getItem('nursery_pan') || '609823412');
  const [defaultThreshold, setDefaultThreshold] = useState<number>(() => Number(localStorage.getItem('nursery_threshold')) || 5);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(() => Number(localStorage.getItem('nursery_free_shipping')) || 3000);
  const [deliveryNotice, setDeliveryNotice] = useState(() => localStorage.getItem('nursery_delivery_notice') || 'Monsoon planting season deliveries scheduled within 24 hours across Kathmandu Valley.');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

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
    localStorage.setItem('nursery_pan', panNumber);
    localStorage.setItem('nursery_threshold', defaultThreshold.toString());
    localStorage.setItem('nursery_free_shipping', freeShippingThreshold.toString());
    localStorage.setItem('nursery_delivery_notice', deliveryNotice);

    setTimeout(() => {
      setSaving(false);
      showToast('Store settings and dispatch parameters updated!', 'success');
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
          Configure business details, PAN/VAT credentials, dispatch policies, and default thresholds.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Identity */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="font-serif font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
            <Store size={18} className="text-forest-700" />
            <span>Store Profile & Official PAN Details</span>
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
              <label className="block font-semibold text-slate-700 mb-1">Nepal PAN / VAT Number</label>
              <input
                type="text"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-forest-700"
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
              <label className="block font-semibold text-slate-700 mb-1">Official Support Email</label>
              <input
                type="email"
                required
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-forest-700"
              />
            </div>

            <div>
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

        {/* Fulfillment & Inventory Rules */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="font-serif font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
            <Clock size={18} className="text-forest-700" />
            <span>Shipping Rules & Low Stock Thresholds</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
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
              <label className="block font-semibold text-slate-700 mb-1">
                Default Low Stock Alert Threshold
              </label>
              <input
                type="number"
                min="1"
                value={defaultThreshold}
                onChange={(e) => setDefaultThreshold(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-forest-700"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Trigger inventory warning when plant variant stock drops to or below this unit count.
              </span>
            </div>
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
