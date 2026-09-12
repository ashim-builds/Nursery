import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { usePWA } from '../../context/PWAContext';

export const PWAInstallPrompt: React.FC = () => {
  const { isInstalled, promptInstall, deferredPrompt, isIOS } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if dismissed in this browser session
    const dismissed = sessionStorage.getItem('rj_pwa_prompt_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  // Don't show if already installed, dismissed, or if neither deferredPrompt nor iOS
  if (isInstalled || isDismissed || (!deferredPrompt && !isIOS)) {
    return null;
  }

  const handleInstallClick = async () => {
    await promptInstall();
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('rj_pwa_prompt_dismissed', 'true');
  };

  return (
    <aside
      aria-label="Install App"
      className="fixed bottom-20 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-sm z-40 animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-forest-950/95 backdrop-blur-xl border border-emerald-500/30 text-white rounded-2xl p-2.5 sm:p-3 shadow-2xl flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src="/the-bloom-patch-logo.png"
            alt="App Logo"
            className="w-9 h-9 rounded-xl border border-emerald-500/30 object-contain bg-white p-0.5 shrink-0 shadow-sm"
          />
          <div className="min-w-0">
            <h4 className="text-xs font-bold leading-tight truncate">Install The Bloom Patch</h4>
            <p className="text-[11px] text-forest-200 truncate">1-Tap plant shopping & tracking</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="bg-emerald-400 hover:bg-emerald-300 text-forest-950 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors active:scale-95 shadow-sm"
          >
            <Download size={13} />
            <span>Install</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 text-forest-300 hover:text-white rounded-lg transition-colors"
            aria-label="Dismiss"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
};
