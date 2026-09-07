import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Phone, Mail, MapPin, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-forest-950 text-forest-100 pt-12 pb-24 lg:pb-12 mt-16 border-t border-forest-900">
      {/* Service Highlights */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 pb-10 border-b border-forest-900/80">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3.5 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-xl bg-forest-900 flex items-center justify-center text-emerald-400 shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Kathmandu Valley Delivery</h4>
              <p className="text-xs text-forest-300">Free delivery on plant orders above Rs. 2000</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-xl bg-forest-900 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">7-Day Plant Health Guarantee</h4>
              <p className="text-xs text-forest-300">Free replacement if your plant arrives unhealthy</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-xl bg-forest-900 flex items-center justify-center text-emerald-400 shrink-0">
              <RefreshCw size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Free Plant Doctor Support</h4>
              <p className="text-xs text-forest-300">WhatsApp our botanists anytime for care tips</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-forest-800 flex items-center justify-center text-emerald-400">
              <Sprout size={18} />
            </div>
            <span className="font-serif font-bold text-xl text-white">KtmBotanica</span>
          </div>
          <p className="text-xs text-forest-300 leading-relaxed">
            Kathmandu Valley's premier boutique nursery, connecting plant lovers with locally-grown indoor foliage, festive blooms, fresh bouquets, and handcrafted terracotta pottery.
          </p>
          <div className="pt-2 flex flex-col gap-2 text-xs text-forest-300">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-emerald-400 shrink-0" />
              <span>Jhamsikhel & Sanepa, Lalitpur, Nepal</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-emerald-400 shrink-0" />
              <span>+977 9841-BOTANICA (268264)</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-emerald-400 shrink-0" />
              <span>support@ktmbotanica.com</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-serif text-white font-semibold mb-3 text-sm">Botanical Collections</h4>
          <ul className="space-y-2 text-xs text-forest-300">
            <li><Link to="/catalog?category=indoor-plants" className="hover:text-white transition-colors">Indoor Foliage</Link></li>
            <li><Link to="/catalog?category=flowering-plants" className="hover:text-white transition-colors">Sayapatri & Festive Flowers</Link></li>
            <li><Link to="/catalog?category=flower-bouquets" className="hover:text-white transition-colors">Rose & Gift Bouquets</Link></li>
            <li><Link to="/catalog?category=succulents-cacti" className="hover:text-white transition-colors">Lucky Jade & Succulents</Link></li>
            <li><Link to="/catalog?category=pots-planters" className="hover:text-white transition-colors">Bhaktapur Clay Planters</Link></li>
            <li><Link to="/catalog?category=soil-fertilizers" className="hover:text-white transition-colors">Himalayan Vermicompost</Link></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h4 className="font-serif text-white font-semibold mb-3 text-sm">Customer Care</h4>
          <ul className="space-y-2 text-xs text-forest-300">
            <li><Link to="/plant-doctor" className="hover:text-white transition-colors">Plant Care Guides & Doctor</Link></li>
            <li><Link to="/catalog?petFriendly=true" className="hover:text-white transition-colors">Pet-Friendly Plants</Link></li>
            <li><Link to="/catalog?sunlight=LOW_LIGHT" className="hover:text-white transition-colors">Low-Light Apartment Plants</Link></li>
            <li><Link to="/profile" className="hover:text-white transition-colors">Order Tracking</Link></li>
            <li><span className="text-forest-400">Cash on Delivery / eSewa / Khalti</span></li>
          </ul>
        </div>

        {/* Newsletter & Valley Hours */}
        <div>
          <h4 className="font-serif text-white font-semibold mb-3 text-sm">Nursery Hours</h4>
          <p className="text-xs text-forest-300 mb-2">
            Open 7 Days a Week<br />
            <strong>Sun – Sat:</strong> 7:00 AM – 7:30 PM
          </p>
          <div className="mt-4 p-3 rounded-xl bg-forest-900 border border-forest-800">
            <span className="text-xs font-semibold text-emerald-400 block mb-1">Live Delivery Active</span>
            <p className="text-[11px] text-forest-300">
              Same-day delivery across Kathmandu, Lalitpur & Bhaktapur for orders placed before 3 PM.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-forest-900 text-center text-xs text-forest-400">
        <p>© {new Date().getFullYear()} KtmBotanica Pvt. Ltd. All rights reserved. Made with 🌿 for Nepali plant lovers.</p>
      </div>
    </footer>
  );
};
