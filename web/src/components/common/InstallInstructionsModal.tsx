import React from 'react';
import { X, Share, PlusSquare, MoreVertical, Download, CheckCircle2 } from 'lucide-react';
import { usePWA } from '../../context/PWAContext';

export const InstallInstructionsModal: React.FC = () => {
  const { showInstallModal, setShowInstallModal, isIOS, isAndroid, deferredPrompt, promptInstall } = usePWA();

  if (!showInstallModal) return null;

  const handleDirectInstall = async () => {
    const res = await promptInstall();
    if (res === 'accepted') {
      setShowInstallModal(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-sm sm:max-w-md w-full p-4 sm:p-6 shadow-2xl border border-forest-100 relative overflow-hidden animate-in zoom-in-95 duration-200 text-forest-950">
        {/* Header subtle glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-100 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => setShowInstallModal(false)}
          className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* App Logo & Header */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src="/the-bloom-patch-logo.png"
            alt="App Logo"
            className="w-12 h-12 rounded-xl shadow-sm border border-emerald-500/20 object-contain bg-white p-1 shrink-0"
          />
          <div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider mb-0.5">
              Official App
            </div>
            <h3 className="font-serif font-bold text-base text-slate-900 leading-tight">
              The Bloom Patch & Nursery
            </h3>
            <p className="text-[11px] text-slate-500">Install to your Home Screen</p>
          </div>
        </div>

        {/* If deferredPrompt is available on Android / Chrome, allow direct 1-tap install */}
        {deferredPrompt && (
          <div className="mb-4">
            <button
              onClick={handleDirectInstall}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-forest-950 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
            >
              <Download size={15} />
              <span>Direct Download & Install</span>
            </button>
          </div>
        )}

        {/* Instructions based on platform */}
        {isIOS ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              In <strong>Safari</strong> on your iPhone, follow these steps:
            </p>

            <div className="space-y-2.5 bg-forest-50/70 p-3 sm:p-4 rounded-xl border border-forest-100">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-forest-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                  1
                </div>
                <div className="text-xs text-slate-700 pt-0.5">
                  Tap the <strong className="text-forest-900 font-semibold">Share</strong> button{' '}
                  <Share className="inline-block mx-1 text-forest-700 -mt-0.5" size={14} /> at the bottom of Safari.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-forest-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                  2
                </div>
                <div className="text-xs text-slate-700 pt-0.5">
                  Scroll down and tap <strong className="text-forest-900 font-semibold">"Add to Home Screen"</strong>{' '}
                  <PlusSquare className="inline-block mx-1 text-forest-700 -mt-0.5" size={14} />.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-forest-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                  3
                </div>
                <div className="text-xs text-slate-700 pt-0.5">
                  Tap <strong className="text-forest-900 font-semibold">"Add"</strong> in top-right to finish.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              In <strong>Chrome / Android browser</strong>:
            </p>

            <div className="space-y-2.5 bg-forest-50/70 p-3 sm:p-4 rounded-xl border border-forest-100">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-forest-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                  1
                </div>
                <div className="text-xs text-slate-700 pt-0.5">
                  Tap the <strong className="text-forest-900 font-semibold">3-dots menu</strong>{' '}
                  <MoreVertical className="inline-block mx-0.5 text-forest-700 -mt-0.5" size={14} /> at top-right.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-forest-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                  2
                </div>
                <div className="text-xs text-slate-700 pt-0.5">
                  Tap <strong className="text-forest-900 font-semibold">"Install app"</strong> or <strong className="text-forest-900 font-semibold">"Add to Home screen"</strong>{' '}
                  <Download className="inline-block mx-1 text-forest-700 -mt-0.5" size={14} />.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-forest-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                  3
                </div>
                <div className="text-xs text-slate-700 pt-0.5">
                  Tap <strong className="text-forest-900 font-semibold">"Install"</strong> to add to your Home Screen.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Benefits list */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <CheckCircle2 size={12} className="text-emerald-600" /> 1-Tap Access
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 size={12} className="text-emerald-600" /> Offline Ready
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 size={12} className="text-emerald-600" /> Order Tracking
          </span>
        </div>

        {/* Action button */}
        <button
          onClick={() => setShowInstallModal(false)}
          className="mt-4 w-full bg-forest-900 hover:bg-forest-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
};
