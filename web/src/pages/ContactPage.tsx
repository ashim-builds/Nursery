import React, { useState } from 'react';
import { useUI } from '../context/UIContext';
import { Facebook, MapPin, Phone, Clock, Send, Sprout, ShieldCheck } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { showToast } = useUI();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitted(true);
    showToast('Message sent! Our botanist team will reply within 24 hours.', 'success');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 space-y-10 pb-28">
      {/* Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 bg-forest-50 text-forest-800 px-3 py-1 rounded-full text-xs font-bold">
          <Sprout size={14} />
          <span>RJ Flowers and Nursery</span>
        </div>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-slate-900">
          Get in Touch
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Have questions about flowers, plants, delivery, or nursery visits? We'd love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-soft">
            <h2 className="font-serif font-bold text-lg text-slate-900 border-b border-slate-100 pb-3">
              Visit Our Greenhouse
            </h2>

            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-forest-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Main Nursery & Studio:</strong>
                  <span>Pokhara-26, Arghau Chowk, Pokhara, Nepal</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={18} className="text-forest-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Phone:</strong>
                  <a href="tel:+9779815155580" className="hover:text-forest-700">+977 9815155580</a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Facebook size={18} className="text-forest-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Facebook:</strong>
                  <a href="https://www.facebook.com/p/RJ-Flower-Nursery-100038914454450/" target="_blank" rel="noreferrer" className="hover:text-forest-700">RJ Flower Nursery</a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock size={18} className="text-forest-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Opening Hours:</strong>
                  <span>Every day: 7:00 AM – 7:00 PM</span>
                  <span className="block text-slate-400">Closed on festival holidays</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-soft">
          <h2 className="font-serif font-bold text-xl text-slate-900">Send Us a Message</h2>

          {submitted ? (
            <div className="p-8 bg-forest-50 border border-forest-200 rounded-2xl text-center space-y-3">
              <ShieldCheck size={32} className="mx-auto text-emerald-600" />
              <h3 className="font-bold text-sm text-forest-950">Thank you for reaching out!</h3>
              <p className="text-xs text-slate-600">Our nursery team has received your message and will respond promptly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suman Thapa"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-3 border border-slate-300 rounded-xl focus:border-forest-700 focus:outline-none min-h-[44px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Your Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="suman@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-3 border border-slate-300 rounded-xl focus:border-forest-700 focus:outline-none min-h-[44px]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">How can we assist you?</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Ask about plant care, event floral arrangements, delivery times..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-3 border border-slate-300 rounded-xl focus:border-forest-700 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs py-3.5 px-6 rounded-2xl shadow transition-all min-h-[48px]"
              >
                <span>Send Message</span>
                <Send size={15} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
