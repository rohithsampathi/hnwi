// sw-auth-handler.js
// Custom Service Worker Auth Handler
// This handles authentication-related messages from the main thread
// Add this to your service worker (sw.js) after workbox initialization

// Listen for auth-related messages from main thread
self.addEventListener('message', (event) => {
  if (!event.data || !event.data.type) return

  const { type, timestamp, clearCaches } = event.data

  switch (type) {
    case 'AUTH_LOGOUT':
      // User logged out - immediately clear all auth-related caches
      handleAuthLogout(timestamp)
      break

    case 'AUTH_LOGIN':
      // User logged in - CRITICAL: Clear stale caches to prevent re-auth issues
      // This prevents cached API responses from previous sessions causing auth failures
      console.log('[SW] User authenticated at', timestamp)
      if (clearCaches) {
        handleAuthLogin(timestamp)
      }
      break

    case 'SKIP_WAITING':
      // Standard service worker update message
      self.skipWaiting()
      break

    default:
      // Unknown message type - ignore
      break
  }
})

// Handle logout by clearing all auth-sensitive caches
async function handleAuthLogout(timestamp) {
  try {
    console.log('[SW] Handling logout, clearing caches...', timestamp)

    const cacheNames = await caches.keys()

    // Filter and delete caches that may contain user-specific data
    const cachesToDelete = cacheNames.filter(name =>
      name.includes('api-cache') ||
      name.includes('intelligence-cache') ||
      name.includes('api') ||
      name.includes('intelligence') ||
      name.includes('crown-vault') ||
      name.includes('rohith') ||
      name.includes('opportunities')
    )

    // Delete all identified caches
    await Promise.all(
      cachesToDelete.map(cacheName => {
        console.log('[SW] Deleting cache:', cacheName)
        return caches.delete(cacheName)
      })
    )

    console.log('[SW] Cache clearing complete. Deleted', cachesToDelete.length, 'caches')

    // Notify all clients that caches have been cleared
    const clients = await self.clients.matchAll()
    clients.forEach(client => {
      client.postMessage({
        type: 'CACHE_CLEARED',
        timestamp: Date.now(),
        clearedCaches: cachesToDelete
      })
    })
  } catch (error) {
    console.error('[SW] Error clearing caches on logout:', error)
  }
}

// Handle login by clearing stale caches from previous sessions
// CRITICAL: This prevents re-auth popup issues when logging into a browser
// where the user previously logged in with different/expired credentials
async function handleAuthLogin(timestamp) {
  try {
    console.log('[SW] Handling login, clearing stale caches...', timestamp)

    const cacheNames = await caches.keys()

    // Clear all API-related caches to ensure fresh data for new session
    // This is more aggressive than logout clearing to ensure no stale data remains
    const cachesToDelete = cacheNames.filter(name =>
      name.includes('api') ||
      name.includes('pages') ||
      name.includes('intelligence') ||
      name.includes('crown-vault') ||
      name.includes('rohith') ||
      name.includes('opportunities') ||
      name.includes('dashboard')
    )

    // Delete all identified caches
    await Promise.all(
      cachesToDelete.map(cacheName => {
        console.log('[SW] Clearing stale cache on login:', cacheName)
        return caches.delete(cacheName)
      })
    )

    console.log('[SW] Login cache clearing complete. Cleared', cachesToDelete.length, 'caches')

    // Notify all clients that caches have been cleared for fresh session
    const clients = await self.clients.matchAll()
    clients.forEach(client => {
      client.postMessage({
        type: 'LOGIN_CACHE_CLEARED',
        timestamp: Date.now(),
        clearedCaches: cachesToDelete
      })
    })
  } catch (error) {
    console.error('[SW] Error clearing caches on login:', error)
  }
}

// Export for potential future use
self.authHandler = {
  handleAuthLogout,
  handleAuthLogin
}
