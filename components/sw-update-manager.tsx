// components/sw-update-manager.tsx
// Manages service worker updates and version checking
// Silently auto-updates SW when new version is deployed - no user interaction needed

'use client';

import { useEffect } from 'react';
import { SW_VERSION, getServiceWorkerVersion, forceServiceWorkerUpdate } from '@/lib/sw-version';

export function ServiceWorkerUpdateManager() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    let refreshing = false;
    let updateInProgress = false;

    // Listen for controller change (SW update activated)
    const handleControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      // Smooth reload without user noticing
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    // Silently handle update
    const performSilentUpdate = async () => {
      if (updateInProgress) return;

      updateInProgress = true;
      const success = await forceServiceWorkerUpdate();

      if (success) {
        // Wait a moment for SW to activate, then reload
        // This happens automatically and smoothly
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        updateInProgress = false;
      }
    };

    // Check for updates on mount
    const checkForUpdate = async () => {
      try {
        const currentVersion = await getServiceWorkerVersion();

        if (!currentVersion || currentVersion !== SW_VERSION) {
          // Immediately and silently update - no notification, no delay
          await performSilentUpdate();
        }
      } catch (error) {
        // Silent fail - no console logs, no alerts
      }
    };

    // Initial check
    checkForUpdate();

    // Check for updates every 10 minutes (increased from 5 to reduce frequency)
    const interval = setInterval(checkForUpdate, 10 * 60 * 1000);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      clearInterval(interval);
    };
  }, []);

  // No UI rendering - completely silent operation
  return null;
}
