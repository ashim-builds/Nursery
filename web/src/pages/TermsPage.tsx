import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 pb-24 text-slate-700">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-forest-800 min-h-[44px]">
        <ArrowLeft size={16} />
        <span>Back to Home</span>
      </Link>

      <div className="space-y-2 border-b border-slate-200 pb-4">
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900">
          Terms of Service
        </h1>
        <p className="text-xs text-slate-500">Effective Date: January 1, 2026</p>
      </div>

      <div className="space-y-4 text-xs sm:text-sm leading-relaxed">
        <h2 className="font-serif font-bold text-base text-slate-900">1. Live Plant Guarantee & Delivery</h2>
        <p>
          Live botanical specimens are carefully packed in specialized nursery pots. If a plant arrives in damaged condition due to transit issues, please notify us within 24 hours of delivery with photos for immediate replacement or store credit.
        </p>

        <h2 className="font-serif font-bold text-base text-slate-900 pt-2">2. Pricing & Currency</h2>
        <p>
          All prices are listed in Nepali Rupees (NPR / रू). We reserve the right to correct pricing anomalies prior to order confirmation.
        </p>

        <h2 className="font-serif font-bold text-base text-slate-900 pt-2">3. Cancellations & Inventory Returns</h2>
        <p>
          Orders can be cancelled before they are dispatched for delivery. Once marked as Out for Delivery, perishable bouquets and potted plants cannot be cancelled.
        </p>
      </div>
    </div>
  );
};
