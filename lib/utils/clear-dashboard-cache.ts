// lib/utils/clear-dashboard-cache.ts
// Utility to clear all dashboard caches (in-memory + Service Worker)

/**
 * USAGE (from browser console):
 *
 * await window.clearDashboardCache()
 *
 * This will:
 * 1. Clear Service Worker cache for dashboard API endpoints
 * 2. Emit event to clear in-memory cache in elite-pulse-context
 * 3. Force next dashboard load to fetch fresh data
 *
 * For Service Worker cache only (lighter):
 * await window.clearServiceWorkerDashboardCache()
 */

/**
 * Clears all dashboard-related caches
 *
 * This clears:
 * 1. Service Worker API cache (dashboard endpoint)
 * 2. In-memory cache via event emission
 *
 * The elite-pulse-context listens for 'dashboard:clear-cache' event
 * and clears its internal cached data Map
 */
export async function clearDashboardCache(): Promise<void> {
  console.log('[Dashboard Cache] Clearing all dashboard caches...')

  if (typeof window === 'undefined') {
    console.warn('[Dashboard Cache] Not in browser environment')
    return
  }

  try {
    // 1. Clear Service Worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys()

      // Find API cache (contains dashboard endpoint)
      const apiCache = cacheNames.find(name => name.includes('api'))

      if (apiCache) {
        const cache = await caches.open(apiCache)
        const requests = await cache.keys()

        // Delete dashboard-specific requests
        let deletedCount = 0
        for (const request of requests) {
          if (request.url.includes('/api/hnwi/intelligence/dashboard')) {
            await cache.delete(request)
            deletedCount++
          }
        }

        console.log(`[Dashboard Cache] Deleted ${deletedCount} dashboard cache entries from Service Worker`)
      } else {
        console.log('[Dashboard Cache] No API cache found in Service Worker')
      }
    } else {
      console.log('[Dashboard Cache] Service Worker caches not available')
    }

    // 2. Dispatch event to notify elite-pulse-context to clear in-memory cache
    window.dispatchEvent(new CustomEvent('dashboard:clear-cache'))
    console.log('[Dashboard Cache] Dispatched clear-cache event')

    // 3. Clear localStorage preferences if needed (optional)
    // Uncomment if you want to also reset user preferences
    // localStorage.removeItem('elitePulsePreferences')

    console.log('[Dashboard Cache] ✅ Dashboard cache cleared successfully')
  } catch (error) {
    console.error('[Dashboard Cache] ❌ Error clearing cache:', error)
    throw error
  }
}

/**
 * Clears only the Service Worker cache for dashboard
 * (Lighter version that doesn't require context)
 */
export async function clearServiceWorkerDashboardCache(): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return
  }

  try {
    const cacheNames = await caches.keys()
    const apiCache = cacheNames.find(name => name.includes('api'))

    if (apiCache) {
      const cache = await caches.open(apiCache)
      const requests = await cache.keys()

      for (const request of requests) {
        if (request.url.includes('/api/hnwi/intelligence/dashboard')) {
          await cache.delete(request)
        }
      }
    }
  } catch (error) {
    console.error('[Dashboard Cache] Error clearing Service Worker cache:', error)
  }
}

// Expose to window for easy console access
if (typeof window !== 'undefined') {
  (window as any).clearDashboardCache = clearDashboardCache;
  (window as any).clearServiceWorkerDashboardCache = clearServiceWorkerDashboardCache;
}
