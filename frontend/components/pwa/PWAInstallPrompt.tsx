'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Don't show if already installed as standalone
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    // Don't show if already dismissed this session
    if (sessionStorage.getItem('pwa-banner-dismissed')) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show banner after a short delay (feels less intrusive)
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
    }
    setShowBanner(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('pwa-banner-dismissed', '1');
  };

  if (installed || !showBanner || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9999] md:left-auto md:right-4 md:w-[340px] animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#BB99CD]/40 overflow-hidden">
        {/* Purple accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-[#3D1860] via-[#643579] to-[#BB99CD]" />

        <div className="p-4 flex items-start gap-3">
          {/* App icon */}
          <img
            src="/pwa-icon-192.png"
            alt="CivicLens"
            className="w-12 h-12 rounded-xl shadow-sm shrink-0 border border-[#BB99CD]/30"
          />

          <div className="flex-1 min-w-0">
            <div className="text-sm font-black text-gray-900 mb-0.5">Install CivicLens</div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Add to your home screen for the full offline map experience — works without internet.
            </p>

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleInstall}
                className="flex items-center gap-1.5 bg-[#3D1860] hover:bg-[#643579] text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Install App
              </button>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 text-xs font-medium px-2 py-2 transition cursor-pointer"
              >
                Not now
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
