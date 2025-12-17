// Service Worker utility functions for cache management

/**
 * Clear all service worker caches
 */
export const clearAllCaches = async (): Promise<void> => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
  }

  // Also try to clear browser caches directly
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
  }
};

/**
 * Clear only assessment-related caches
 */
export const clearAssessmentCache = async (): Promise<void> => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_ASSESSMENT_CACHE' });
  }

  // Also clear sessionStorage for assessment data
  if (typeof window !== 'undefined') {
    // Clear assessment-related session storage
    const keysToRemove = Object.keys(sessionStorage).filter(key =>
      key.includes('assessment') || key.includes('simulation')
    );
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
  }
};

/**
 * Force service worker update
 */
export const updateServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();

      // Check if there's a waiting service worker
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        // Reload the page after the new service worker takes over
        window.location.reload();
      }
    }
  }
};

/**
 * Check if service worker needs update (useful for mobile PWAs)
 */
export const checkForServiceWorkerUpdate = async (): Promise<boolean> => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      // Check for updates
      await registration.update();
      return !!registration.waiting;
    }
  }
  return false;
};

/**
 * Initialize service worker message listener for cache events
 */
export const initServiceWorkerListener = (callbacks?: {
  onCacheCleared?: () => void;
  onAssessmentCacheCleared?: () => void;
}): void => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data) {
        switch (event.data.type) {
          case 'CACHE_CLEARED':
            callbacks?.onCacheCleared?.();
            console.log('[SW Client] Cache cleared successfully');
            break;
          case 'ASSESSMENT_CACHE_CLEARED':
            callbacks?.onAssessmentCacheCleared?.();
            console.log('[SW Client] Assessment cache cleared successfully');
            break;
          default:
            break;
        }
      }
    });
  }
};

/**
 * Check if running as PWA (useful for mobile detection)
 */
export const isPWA = (): boolean => {
  // Check if app is running in standalone mode (PWA)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone ||
                       document.referrer.includes('android-app://');

  // Check if it's installed as PWA
  const isInstalled = 'BeforeInstallPromptEvent' in window ||
                      'standalone' in window.navigator;

  return isStandalone || isInstalled;
};

/**
 * Clear PWA cache and refresh for assessment issues
 */
export const fixAssessmentIssues = async (): Promise<void> => {
  console.log('[SW Client] Fixing assessment issues...');

  // 1. Clear assessment cache
  await clearAssessmentCache();

  // 2. Update service worker
  await updateServiceWorker();

  // 3. Clear local storage assessment data
  if (typeof window !== 'undefined') {
    const keysToRemove = Object.keys(localStorage).filter(key =>
      key.includes('assessment') || key.includes('simulation')
    );
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  // 4. If on mobile PWA, show a message
  if (isPWA()) {
    console.log('[SW Client] Running in PWA mode, cache cleared');
  }
};