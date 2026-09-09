import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 pb-24 text-slate-700">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-forest-800 min-h-[44px]">
        <ArrowLeft size={16} />
        <span>Back to Home</span>
      </Link>

      <div className="space-y-2 border-b border-slate-200 pb-4">
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 flex items-center gap-2">
          <ShieldCheck size={28} className="text-emerald-600" />
          <span>Privacy Policy</span>
        </h1>
        <p className="text-xs text-slate-500">Effective Date: January 1, 2026</p>
      </div>

      <div className="space-y-4 text-xs sm:text-sm leading-relaxed">
        <p>
          At <strong>RJ Flowers</strong>, we value the trust you place in us when sharing your personal details for flower and plant orders delivered across Pokhara.
        </p>

        <h2 className="font-serif font-bold text-base text-slate-900 pt-2">1. Information We Collect</h2>
        <p>
          We collect your recipient name, delivery address, phone number, and email strictly to fulfill orders, schedule delivery dates, and provide live plant care advice.
        </p>

        <h2 className="font-serif font-bold text-base text-slate-900 pt-2">2. Payment Security</h2>
        <p>
          We do not store your digital wallet passwords or full credit card details. All online transactions (Khalti, Fonepay QR, and cards) are securely processed via encrypted server-side verification channels.
        </p>

        <h2 className="font-serif font-bold text-base text-slate-900 pt-2">3. Address Snapshots & Data Retention</h2>
        <p>
          When you place an order, an immutable delivery snapshot is preserved for logistical tracking. We never sell your personal data to third parties.
        </p>
      </div>
    </div>
  );
};
