// lib/sw-version.ts
// Service Worker Version Management
// Auto-updates service worker when version changes

export const SW_VERSION = '2.2.0'; // Increment this to force SW update
export const SW_CACHE_NAME = `hnwi-sw-v${SW_VERSION}`;

// Check if service worker needs update
export function shouldUpdateServiceWorker(currentVersion?: string): boolean {
  if (!currentVersion) return true;
  return currentVersion !== SW_VERSION;
}

// Get service worker version from registration
export async function getServiceWorkerVersion(): Promise<string | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return null;

    // Try to get version from active service worker
    const sw = registration.active || registration.waiting || registration.installing;
    if (!sw) return null;

    // Send message to get version
    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data?.version || null);
      };

      sw.postMessage({ type: 'GET_VERSION' }, [messageChannel.port2]);

      // Timeout after 1 second
      setTimeout(() => resolve(null), 1000);
    });
  } catch (error) {
    return null;
  }
}

// Force service worker update
export async function forceServiceWorkerUpdate(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return false;

    // Skip waiting if there's a waiting worker
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      return true;
    }

    // Otherwise trigger update check
    await registration.update();
    return true;
  } catch (error) {
    return false;
  }
}
