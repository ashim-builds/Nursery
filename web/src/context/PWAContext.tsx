import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface PWAContextType {
  deferredPrompt: any;
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  showInstallModal: boolean;
  setShowInstallModal: (show: boolean) => void;
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'manual_guide' | 'already_installed'>;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  // Platform detection
  const userAgent = typeof window !== 'undefined' ? (window.navigator.userAgent || '') : '';
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
  const isAndroid = /Android/.test(userAgent);
  const isMobile = isIOS || isAndroid || /Mobi|Tablet|Mobile/.test(userAgent);

  useEffect(() => {
    // 1. Check if already running in standalone / installed mode
    const checkIsInstalled = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');

      if (isStandalone) {
        setIsInstalled(true);
      }
    };

    checkIsInstalled();

    // Listen to display-mode change
    const matcher = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    };
    try {
      matcher.addEventListener('change', handleDisplayModeChange);
    } catch {
      // Fallback for older browsers
      matcher.addListener?.(handleDisplayModeChange);
    }

    // 2. Capture Chrome/Android beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent browser default mini-infobar
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowInstallModal(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // 3. Register Service Worker reliably for PWA installability
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .catch((err) => {
            console.warn('PWA Service Worker registration:', err);
          });
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      try {
        matcher.removeEventListener('change', handleDisplayModeChange);
      } catch {
        matcher.removeListener?.(handleDisplayModeChange);
      }
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'manual_guide' | 'already_installed'> => {
    if (isInstalled) {
      return 'already_installed';
    }

    // Direct native installation prompt (Android / Chrome / Edge / Desktop)
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
          return 'accepted';
        } else {
          return 'dismissed';
        }
      } catch (err) {
        console.warn('Native install prompt failed:', err);
        setShowInstallModal(true);
        return 'manual_guide';
      }
    }

    // If native prompt not available (e.g., iOS Safari, in-app browser, or Chrome without prompt fired yet),
    // show clear, device-tailored step-by-step install instructions modal
    setShowInstallModal(true);
    return 'manual_guide';
  }, [deferredPrompt, isInstalled]);

  const isInstallable = !isInstalled && (!!deferredPrompt || isIOS || isAndroid);

  return (
    <PWAContext.Provider
      value={{
        deferredPrompt,
        isInstallable,
        isInstalled,
        isIOS,
        isAndroid,
        isMobile,
        showInstallModal,
        setShowInstallModal,
        promptInstall,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
};

export const usePWA = () => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
};
