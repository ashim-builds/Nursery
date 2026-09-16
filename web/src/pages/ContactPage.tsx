import React from 'react';
import { Facebook, MapPin, Phone, Clock, Sprout, MessageCircle, Navigation, PhoneCall } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { useQuery } from '@tanstack/react-query';
import { siteSettingsApi } from '../api/site-settings.api';

export const ContactPage: React.FC = () => {
  const { data: siteSettings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: siteSettingsApi.getSettings,
  });

  const phone = siteSettings?.phone && siteSettings.phone !== '9800000000'
    ? siteSettings.phone
    : '9815155580';
  const whatsappPhone = siteSettings?.whatsappPhone || phone;
  const address = siteSettings?.address || 'Pokhara-26, Arghau Chowk, Pokhara, Nepal';
  const openingHours = siteSettings?.openingHours || 'Every day: 7:00 AM – 7:00 PM';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 space-y-8 sm:space-y-10 pb-28">
      {/* Dynamic SEO Meta */}
      <SEO
        title="Contact & Phone Number | The Bloom Patch Pokhara"
        description={`Call The Bloom Patch & RJ Flowers at +977-${phone}. Fresh flowers, potted plants, and citywide delivery across Pokhara. Located at ${address}.`}
        keywords="The Bloom Patch phone, The Bloom Patch contact, RJ Flowers phone number, nursery Pokhara phone, flower delivery contact Pokhara"
        canonical={typeof window !== 'undefined' ? `${window.location.origin}/contact` : '/contact'}
      />

      {/* Header */}
      <div className="text-center space-y-2.5 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 bg-forest-50 text-forest-800 px-3.5 py-1 rounded-full text-xs font-bold border border-forest-200/60">
          <Sprout size={14} className="text-forest-700" />
          <span>The Bloom Patch &bull; RJ Flowers</span>
        </div>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">
          Contact Us
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Call or WhatsApp us directly for instant flower orders, plant advice, or visit our greenhouse in Pokhara.
        </p>
      </div>

      {/* Primary Contact Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {/* Card 1: Direct Phone Call */}
        <div className="bg-gradient-to-br from-forest-900 to-forest-950 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <PhoneCall size={24} />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-widest text-emerald-300 font-bold">Direct Phone</span>
              <h2 className="font-serif font-bold text-2xl text-white mt-0.5">+977 {phone}</h2>
            </div>
            <p className="text-xs text-forest-200 leading-relaxed">
              Speak directly with our florist & nursery specialists for same-day flower bouquets, plant availability, or custom orders.
            </p>
          </div>

          <div className="relative z-10 pt-2 space-y-2.5">
            <a
              href={`tel:+977${phone}`}
              className="w-full inline-flex items-center justify-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-forest-950 font-bold text-sm py-3.5 px-6 rounded-2xl shadow-md transition-all"
            >
              <Phone size={18} />
              <span>Call +977 {phone}</span>
            </a>
          </div>

          {/* Decorative background blur */}
          <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
        </div>

        {/* Card 2: WhatsApp Chat */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-soft flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <MessageCircle size={24} />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-widest text-emerald-700 font-bold">WhatsApp Support</span>
              <h2 className="font-serif font-bold text-2xl text-slate-900 mt-0.5">Chat on WhatsApp</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Send us pictures of flowers you want, ask for care tips, or confirm delivery timing with instant replies on WhatsApp.
            </p>
          </div>

          <div className="pt-2">
            <a
              href={`https://wa.me/977${whatsappPhone}?text=${encodeURIComponent('Hello The Bloom Patch! I would like to inquire about flowers and plants.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] active:scale-98 text-white font-bold text-sm py-3.5 px-6 rounded-2xl shadow-sm transition-all"
            >
              <MessageCircle size={18} />
              <span>Message on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Location & Visiting Hours Information */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-soft space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-serif font-bold text-xl text-slate-900">Greenhouse & Nursery Location</h2>
            <p className="text-xs text-slate-500 mt-0.5">We welcome walk-in customers 7 days a week</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-forest-50 flex items-center justify-center text-forest-700 shrink-0">
            <MapPin size={20} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
          {/* Address */}
          <div className="p-4 rounded-2xl bg-[#faf9f6] border border-slate-100 space-y-1.5">
            <strong className="text-slate-900 block font-bold text-xs">Address:</strong>
            <span className="text-slate-600 leading-relaxed block">{address}</span>
            <div className="pt-2">
              <a
                href="https://maps.google.com/?q=28.2365,84.0036"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-forest-700 font-bold hover:underline text-[11px]"
              >
                <Navigation size={13} />
                <span>Open in Google Maps</span>
              </a>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="p-4 rounded-2xl bg-[#faf9f6] border border-slate-100 space-y-1.5">
            <strong className="text-slate-900 block font-bold text-xs">Opening Hours:</strong>
            <span className="text-slate-600 leading-relaxed block">{openingHours}</span>
            <span className="text-slate-400 block text-[11px]">Open all 7 days a week</span>
          </div>

          {/* Social */}
          <div className="p-4 rounded-2xl bg-[#faf9f6] border border-slate-100 space-y-1.5">
            <strong className="text-slate-900 block font-bold text-xs">Social Media:</strong>
            <span className="text-slate-600 leading-relaxed block">Follow for fresh arrivals and floral inspiration.</span>
            <div className="pt-2">
              <a
                href="https://www.facebook.com/p/RJ-Flower-Nursery-100038914454450/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-blue-600 font-bold hover:underline text-[11px]"
              >
                <Facebook size={13} />
                <span>Facebook Page</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
