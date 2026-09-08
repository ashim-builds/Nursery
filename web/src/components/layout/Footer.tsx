import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Facebook, Heart, MapPin, Phone, ShieldCheck, Truck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const Footer: React.FC = () => {
  const { data: siteSettings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const res = await axios.get('/api/site-settings');
      return res.data?.data;
    },
  });

  const businessName = siteSettings?.businessName || 'RJ Flowers';

  return (
    <footer className="bg-forest-950 text-forest-100 pt-14 pb-24 lg:pb-10 mt-16 border-t-4 border-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_2fr] gap-12 pb-12">
          <div className="max-w-sm">
            <div className="flex items-center gap-3 mb-5">
              <img src="/rj-flowers-icon.svg" alt={`${businessName} logo`} className="w-11 h-11 rounded-2xl shadow-lg shadow-black/10" />
              <div>
                <span className="block font-serif font-bold text-2xl text-white leading-none">{businessName}</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-300">Grow beautifully</span>
              </div>
            </div>
            <p className="text-sm text-forest-300 leading-relaxed mb-6">
              Fresh flowers and nursery plants chosen to make Pokhara homes feel more alive.
            </p>
            <div className="space-y-3 text-xs text-forest-300">
              <div className="flex items-start gap-3"><MapPin size={15} className="text-accent shrink-0 mt-0.5" /><span>{siteSettings?.address || 'Pokhara-26, Arghau Chowk, Pokhara'}</span></div>
              <a href="tel:+9779815155580" className="flex items-center gap-3 hover:text-white transition-colors"><Phone size={15} className="text-accent shrink-0" /><span>+977 {siteSettings?.phone || '9815155580'}</span></a>
              <a href="https://www.facebook.com/p/RJ-Flower-Nursery-100038914454450/" target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-white transition-colors"><Facebook size={15} className="text-accent shrink-0" /><span>Message us on Facebook</span></a>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="text-[11px] uppercase tracking-[0.18em] text-emerald-300 mb-4">Explore</h4>
              <nav className="space-y-3 text-sm text-forest-200">
                <Link to="/catalog" className="flex items-center gap-1 hover:text-white transition-colors">Shop all <ArrowUpRight size={13} /></Link>
                <Link to="/categories" className="flex items-center gap-1 hover:text-white transition-colors">Categories <ArrowUpRight size={13} /></Link>
                <Link to="/wishlist" className="flex items-center gap-1 hover:text-white transition-colors">Wishlist <ArrowUpRight size={13} /></Link>
              </nav>
            </div>
            <div>
              <h4 className="text-[11px] uppercase tracking-[0.18em] text-emerald-300 mb-4">Help</h4>
              <nav className="space-y-3 text-sm text-forest-200">
                <Link to="/contact" className="flex items-center gap-1 hover:text-white transition-colors">Contact us <ArrowUpRight size={13} /></Link>
                <Link to="/orders" className="flex items-center gap-1 hover:text-white transition-colors">Track an order <ArrowUpRight size={13} /></Link>
                <Link to="/privacy" className="flex items-center gap-1 hover:text-white transition-colors">Privacy <ArrowUpRight size={13} /></Link>
                <Link to="/terms" className="flex items-center gap-1 hover:text-white transition-colors">Terms <ArrowUpRight size={13} /></Link>
              </nav>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h4 className="text-[11px] uppercase tracking-[0.18em] text-emerald-300 mb-4">Visit the nursery</h4>
              <p className="text-sm text-forest-200 leading-relaxed mb-2">{siteSettings?.openingHours || 'Sun - Sat: 8:00 AM - 7:00 PM'}</p>
              <p className="text-xs text-forest-400 leading-relaxed">Delivery across Pokhara. Rs. 100 below Rs. 2,000; free delivery from Rs. 2,000.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-y border-forest-900 py-5 mb-6">
          <div className="flex items-center gap-3"><Truck size={18} className="text-accent" /><span className="text-xs text-forest-200">Careful valley-wide delivery</span></div>
          <div className="flex items-center gap-3"><ShieldCheck size={18} className="text-accent" /><span className="text-xs text-forest-200">Healthy, acclimatized plants</span></div>
          <div className="flex items-center gap-3"><Heart size={18} className="text-accent" /><span className="text-xs text-forest-200">Made with local craft</span></div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-forest-400">© {new Date().getFullYear()} {businessName}. All rights reserved.</p>
          <Link to="/admin/login" className="text-[11px] text-forest-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1">
            Admin staff login <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>
    </footer>
  );
};
