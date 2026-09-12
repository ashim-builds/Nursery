import React from 'react';
import { X, Share, PlusSquare, MoreVertical, Download, CheckCircle2, Smartphone, ExternalLink } from 'lucide-react';
import { usePWA } from '../../context/PWAContext';

export const InstallInstructionsModal: React.FC = () => {
  const { showInstallModal, setShowInstallModal, isIOS, isAndroid } = usePWA();

  if (!showInstallModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-forest-100 relative overflow-hidden animate-in zoom-in-95 duration-200 text-forest-950">
        {/* Header background subtle glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-100 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => setShowInstallModal(false)}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* App Logo & Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <img
            src="/the-bloom-patch-logo.png"
            alt="App Logo"
            className="w-14 h-14 rounded-2xl shadow-md border border-emerald-500/20 object-contain bg-white p-1 shrink-0"
          />
          <div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider mb-0.5">
              Official Web App
            </div>
            <h3 className="font-serif font-bold text-lg text-slate-900 leading-tight">
              The Bloom Patch & Nursery
            </h3>
            <p className="text-xs text-slate-500">Install to your Home Screen</p>
          </div>
        </div>

        {/* Instructions based on platform */}
        {isIOS ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Follow these simple steps in <strong>Safari</strong> on your iPhone to install the app:
            </p>

            <div className="space-y-3 bg-forest-50/70 p-4 rounded-2xl border border-forest-100">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-forest-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                  1
                </div>
                <div className="text-xs text-slate-700 pt-0.5">
                  Tap the <strong className="text-forest-900 font-semibold">Share</strong> button{' '}
                  <Share className="inline-block mx-1 text-forest-700 -mt-0.5" size={15} /> at the bottom of Safari.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-forest-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                  2
                </div>
                <div className="text-xs text-slate-700 pt-0.5">
                  Scroll down and tap <strong className="text-forest-900 font-semibold">"Add to Home Screen"</strong>{' '}
                  <PlusSquare className="inline-block mx-1 text-forest-700 -mt-0.5" size={15} />.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-forest-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                  3
                </div>
                <div className="text-xs text-slate-700 pt-0.5">
                  Tap <strong className="text-forest-900 font-semibold">"Add"</strong> in the top-right corner to finish.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Follow these steps in <strong>Chrome / Android browser</strong> to install:
            </p>

            <div className="space-y-3 bg-forest-50/70 p-4 rounded-2xl border border-forest-100">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-forest-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                  1
                </div>
                <div className="text-xs text-slate-700 pt-0.5">
                  Tap the <strong className="text-forest-900 font-semibold">Menu (3 dots)</strong>{' '}
                  <MoreVertical className="inline-block mx-0.5 text-forest-700 -mt-0.5" size={15} /> at the top-right of your browser.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-forest-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                  2
                </div>
                <div className="text-xs text-slate-700 pt-0.5">
                  Tap <strong className="text-forest-900 font-semibold">"Install app"</strong> or <strong className="text-forest-900 font-semibold">"Add to Home screen"</strong>{' '}
                  <Download className="inline-block mx-1 text-forest-700 -mt-0.5" size={15} />.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-forest-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                  3
                </div>
                <div className="text-xs text-slate-700 pt-0.5">
                  Tap <strong className="text-forest-900 font-semibold">"Install"</strong> when prompted to add RJ Flowers to your Home Screen.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Benefits list */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <CheckCircle2 size={13} className="text-emerald-600" /> Fast 1-Tap Access
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 size={13} className="text-emerald-600" /> Offline Browsing
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 size={13} className="text-emerald-600" /> Order Tracking
          </span>
        </div>

        {/* Action button */}
        <button
          onClick={() => setShowInstallModal(false)}
          className="mt-5 w-full bg-forest-900 hover:bg-forest-800 text-white font-bold py-3 px-4 rounded-2xl text-xs transition-colors shadow-sm"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
