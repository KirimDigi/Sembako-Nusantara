// Sembako Nusantara Jepang - PWA Utilities & Install Manager
import { useState, useEffect } from 'react';

// Store global deferred prompt so it survives across navigation
let deferredPrompt: any = null;
const installListeners = new Set<(canInstall: boolean) => void>();
const updateListeners = new Set<(isUpdated: boolean) => void>();

// Register Service Worker with intelligent zero-egress caching & auto-update
export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        // Check for updates periodically (once every 30 minutes, very low overhead)
        setInterval(() => {
          registration.update().catch(() => {});
        }, 30 * 60 * 1000);

        // Listen for updates found
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New update available! Notify listeners
                notifyUpdateAvailable();
              }
            }
          });
        });
      })
      .catch((err) => {
        console.warn('[PWA] Service Worker registration failed:', err);
      });

    // Listen for direct messages from SW (SW_ACTIVATED)
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SW_ACTIVATED') {
        notifyUpdateAvailable();
      }
    });

    // Listen for controllerchange (when new SW claims the page)
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        // Optional automatic reload or state notification
        console.log('[PWA] Controller changed: new version active.');
      }
    });
  });

  // Capture beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e: any) => {
    e.preventDefault();
    deferredPrompt = e;
    notifyInstallState(true);
  });

  // Track appinstalled event
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notifyInstallState(false);
  });
}

function notifyInstallState(canInstall: boolean) {
  installListeners.forEach((fn) => fn(canInstall));
}

function notifyUpdateAvailable() {
  updateListeners.forEach((fn) => fn(true));
}

// React hook to use PWA install features
export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState<boolean>(() => !!deferredPrompt);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => checkIsStandalone());
  const [isUpdateAvailable, setIsUpdateAvailable] = useState<boolean>(false);

  useEffect(() => {
    const handleInstallState = (state: boolean) => setCanInstall(state);
    const handleUpdate = (state: boolean) => setIsUpdateAvailable(state);

    installListeners.add(handleInstallState);
    updateListeners.add(handleUpdate);

    // Initial check
    setIsInstalled(checkIsStandalone());
    setCanInstall(!!deferredPrompt);

    return () => {
      installListeners.delete(handleInstallState);
      updateListeners.delete(handleUpdate);
    };
  }, []);

  const promptInstall = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }

    try {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice && choice.outcome === 'accepted') {
        deferredPrompt = null;
        setCanInstall(false);
        return true;
      }
    } catch (err) {
      console.warn('[PWA] Install prompt error:', err);
    }
    return false;
  };

  const applyUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg && reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        window.location.reload();
      });
    } else {
      window.location.reload();
    }
  };

  return {
    canInstall,
    isInstalled,
    isUpdateAvailable,
    promptInstall,
    applyUpdate
  };
}

// Helper to detect if running in standalone PWA / installed mode
export function checkIsStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const isStandaloneMatch = window.matchMedia('(display-mode: standalone)').matches;
  const isNavigatorStandalone = (window.navigator as any).standalone === true;
  return isStandaloneMatch || isNavigatorStandalone;
}
