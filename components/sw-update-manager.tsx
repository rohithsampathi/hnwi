// components/sw-update-manager.tsx
// Manages service worker updates and version checking
// Auto-updates SW when new version is deployed

'use client';

import { useEffect, useState } from 'react';
import { SW_VERSION, getServiceWorkerVersion, forceServiceWorkerUpdate } from '@/lib/sw-version';

export function ServiceWorkerUpdateManager() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    let refreshing = false;

    // Listen for controller change (SW update activated)
    const handleControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    // Check for updates on mount
    const checkForUpdate = async () => {
      try {
        const currentVersion = await getServiceWorkerVersion();

        if (!currentVersion || currentVersion !== SW_VERSION) {
          setUpdateAvailable(true);

          // Auto-update after 3 seconds if user doesn't interact
          setTimeout(() => {
            if (!isUpdating) {
              handleUpdate();
            }
          }, 3000);
        }
      } catch (error) {
        // Silent fail
      }
    };

    checkForUpdate();

    // Check for updates every 5 minutes
    const interval = setInterval(checkForUpdate, 5 * 60 * 1000);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      clearInterval(interval);
    };
  }, [isUpdating]);

  const handleUpdate = async () => {
    if (isUpdating) return;

    setIsUpdating(true);

    const success = await forceServiceWorkerUpdate();

    if (success) {
      // Wait for new SW to activate, then reload
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      setIsUpdating(false);
    }
  };

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-sm">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="font-semibold text-sm">Update Available</p>
          <p className="text-xs opacity-90">A new version is ready</p>
        </div>
        <button
          onClick={handleUpdate}
          disabled={isUpdating}
          className="bg-white text-purple-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdating ? 'Updating...' : 'Update'}
        </button>
      </div>
    </div>
  );
}
