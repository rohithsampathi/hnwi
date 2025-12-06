// sw-auth-handler.js
// Custom Service Worker Auth Handler
// This handles authentication-related messages from the main thread
// Add this to your service worker (sw.js) after workbox initialization

// Service Worker Version - MUST MATCH lib/sw-version.ts
const SW_VERSION = '2.2.0';

// Listen for auth-related messages from main thread
self.addEventListener('message', (event) => {
  if (!event.data || !event.data.type) return

  const { type, timestamp, clearCaches } = event.data

  switch (type) {
    case 'GET_VERSION':
      // Return current SW version
      event.ports[0]?.postMessage({ version: SW_VERSION });
      break

    case 'AUTH_LOGOUT':
      // User logged out - immediately clear all auth-related caches
      handleAuthLogout(timestamp)
      break

    case 'AUTH_LOGIN':
      // User logged in - CRITICAL: Clear stale caches to prevent re-auth issues
      // This prevents cached API responses from previous sessions causing auth failures
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
      cachesToDelete.map(cacheName => caches.delete(cacheName))
    )

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
    // Silent fail
  }
}

// Handle login by clearing stale caches from previous sessions
// CRITICAL: This prevents re-auth popup issues when logging into a browser
// where the user previously logged in with different/expired credentials
async function handleAuthLogin(timestamp) {
  try {
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
      cachesToDelete.map(cacheName => caches.delete(cacheName))
    )

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
    // Silent fail
  }
}

// Export for potential future use
self.authHandler = {
  handleAuthLogout,
  handleAuthLogin
}
