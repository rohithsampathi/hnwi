// app/(authenticated)/dashboard/clear-cache/page.tsx
// Special page that clears dashboard cache and redirects back

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ClearDashboardCachePage() {
  const router = useRouter()

  useEffect(() => {
    const clearAndRedirect = async () => {
      console.log('[Clear Cache Page] Starting cache clear...')

      try {
        // 1. Clear Service Worker caches
        if ('caches' in window) {
          const cacheNames = await caches.keys()
          const apiCache = cacheNames.find(name => name.includes('api'))

          if (apiCache) {
            const cache = await caches.open(apiCache)
            const requests = await cache.keys()

            let deletedCount = 0
            const deletedUrls: string[] = []
            for (const request of requests) {
              // Clear dashboard AND opportunities caches
              if (request.url.includes('/api/hnwi/intelligence/dashboard') ||
                  request.url.includes('/api/opportunities') ||
                  request.url.includes('/api/command-centre/opportunities') ||
                  request.url.includes('/api/hnwi')) {
                console.log(`[Clear Cache Page] 🗑️ Deleting cache entry: ${request.url}`)
                await cache.delete(request)
                deletedUrls.push(request.url)
                deletedCount++
              }
            }

            console.log(`[Clear Cache Page] ✅ Deleted ${deletedCount} API cache entries:`, deletedUrls)
          } else {
            console.log('[Clear Cache Page] ⚠️ No API cache found in Service Worker')
          }
        }

        // 2. Dispatch events to clear all in-memory caches
        window.dispatchEvent(new CustomEvent('dashboard:clear-cache'))
        window.dispatchEvent(new CustomEvent('app-data:clear-intelligence'))
        console.log('[Clear Cache Page] ✅ Dispatched clear-cache events')

        // 3. Wait a moment for event to process
        await new Promise(resolve => setTimeout(resolve, 500))

        // 4. Clear all other potential caches
        // Clear localStorage cache timestamps
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.includes('dashboard') || key.includes('intelligence') || key.includes('command')) {
            console.log(`[Clear Cache Page] Clearing localStorage: ${key}`)
            localStorage.removeItem(key)
          }
        })

        // Clear sessionStorage
        const sessionKeys = Object.keys(sessionStorage)
        sessionKeys.forEach(key => {
          if (key.includes('dashboard') || key.includes('intelligence') || key.includes('command')) {
            console.log(`[Clear Cache Page] Clearing sessionStorage: ${key}`)
            sessionStorage.removeItem(key)
          }
        })

        console.log('[Clear Cache Page] ✅ All caches cleared! Redirecting to dashboard...')

        // 5. Hard refresh to dashboard (bypasses all browser caches)
        window.location.href = '/dashboard?refresh=' + Date.now()

      } catch (error) {
        console.error('[Clear Cache Page] ❌ Error clearing cache:', error)
        // Redirect anyway
        router.replace('/dashboard')
      }
    }

    clearAndRedirect()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Clearing Dashboard Cache</h2>
        <p className="text-muted-foreground">This will only take a moment...</p>
      </div>
    </div>
  )
}
