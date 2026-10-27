'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

function subscribeToBrowserState() {
  return () => {};
}

function getIsIOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function getIsStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export default function PwaInstallButton() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [appInstalled, setAppInstalled] = useState(false);
  const [message, setMessage] = useState('');
  const isIOS = useSyncExternalStore(subscribeToBrowserState, getIsIOS, () => false);
  const isInstalled = useSyncExternalStore(subscribeToBrowserState, getIsStandalone, () => false)
    || appInstalled;

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const handleAppInstalled = () => {
      setAppInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (isInstalled || (!installPrompt && !isIOS)) {
    return null;
  }

  async function installApp() {
    setMessage('');
    if (!installPrompt) {
      setMessage('Safari mein Share par tap karein, phir Add to Home Screen chunein.');
      return;
    }

    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') setAppInstalled(true);
      setInstallPrompt(null);
    } catch {
      setMessage('Install prompt nahi khul saka. Browser menu se Install app chunein.');
    }
  }

  return (
    <aside className="admin-pwa-install" aria-label="Install admin app">
      <button type="button" className="btn btn-secondary btn-sm" onClick={installApp}>
        Install PW Admin
      </button>
      {message && <p role="status">{message}</p>}
    </aside>
  );
}
