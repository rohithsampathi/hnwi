// lib/services/enhanced-cache-service.ts
// Enhanced caching service that works with the existing PWA setup

import { CachePolicyService } from './cache-policy-service'

export class EnhancedCacheService {
  private static readonly CACHE_PREFIX = 'hnwi-chronicles-v1'
  private static isServiceWorkerReady = false

  // Initialize enhanced caching
  static async initialize() {
    if (!('serviceWorker' in navigator)) return

    try {
      const registration = await navigator.serviceWorker.ready
      this.isServiceWorkerReady = true

      // Send cache policies to service worker
      const policies = CachePolicyService.getServiceWorkerConfig()
      registration.active?.postMessage({
        type: 'CACHE_POLICIES_UPDATE',
        policies
      })

      // Listen for cache events from service worker
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage)

    } catch (error) {
      // Silent fail if service worker is not available
    }
  }

  // Handle messages from service worker
  private static handleServiceWorkerMessage = (event: MessageEvent) => {
    const { type, data } = event.data

    switch (type) {
      case 'CACHE_HIT':
        // Track cache hit analytics
        break
      case 'CACHE_MISS':
        // Track cache miss analytics
        break
      case 'BACKGROUND_FETCH_SUCCESS':
        // Notify components of fresh data
        this.notifyDataUpdate(data.endpoint, data.data)
        break
    }
  }

  // Notify components of data updates
  private static notifyDataUpdate(endpoint: string, data: any) {
    window.dispatchEvent(new CustomEvent('cache-data-updated', {
      detail: { endpoint, data }
    }))
  }

  // Enhanced fetch with intelligent caching
  static async fetch(url: string, options: RequestInit = {}, dataType?: keyof typeof CachePolicyService.POLICIES): Promise<Response> {
    const policy = dataType ? CachePolicyService.getPolicy(dataType) : null

    try {
      // Check if we should use cache based on context
      const context = await this.getNetworkContext()
      const shouldCache = policy ? CachePolicyService.shouldCache(dataType!, context) : true

      if (!shouldCache) {
        return fetch(url, options)
      }

      // Try cache first for cache-first strategies
      if (policy?.strategy === 'cache-first') {
        const cached = await this.getFromCache(url, dataType!)
        if (cached) return cached
      }

      // Network request
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          ...this.getRequestHeaders(policy, context)
        }
      })

      // Cache successful responses
      if (response.ok && shouldCache) {
        this.storeInCache(url, response.clone(), dataType!)
      }

      return response

    } catch (error) {
      // Fallback to cache on network error
      if (policy?.strategy !== 'network-only') {
        const cached = await this.getFromCache(url, dataType!)
        if (cached) return cached
      }

      throw error
    }
  }

  // Get network context for intelligent caching decisions
  private static async getNetworkContext(): Promise<{
    isOnline: boolean
    batteryLevel?: number
    connectionType?: string
  }> {
    const context = {
      isOnline: navigator.onLine
    }

    try {
      // Add battery info if available
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery()
        Object.assign(context, { batteryLevel: battery.level })
      }

      // Add connection info if available
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        Object.assign(context, { connectionType: connection.effectiveType })
      }
    } catch (error) {
      // Ignore errors from experimental APIs
    }

    return context
  }

  // Get request headers based on policy and context
  private static getRequestHeaders(policy: any, context: any): Record<string, string> {
    const headers: Record<string, string> = {}

    // Add cache control headers
    if (context.connectionType === 'slow-2g' || context.batteryLevel < 0.2) {
      headers['Cache-Control'] = 'max-age=3600' // Longer cache on slow/low-power
    }

    return headers
  }

  // Get data from cache
  private static async getFromCache(url: string, dataType: keyof typeof CachePolicyService.POLICIES): Promise<Response | null> {
    try {
      const cacheName = this.getCacheName(dataType)
      const cache = await caches.open(cacheName)
      const response = await cache.match(url)

      if (response) {
        const cacheTimestamp = parseInt(response.headers.get('X-Cache-Timestamp') || '0')

        // Check if cache is still valid
        if (CachePolicyService.isStaleButFresh(cacheTimestamp, dataType)) {
          return response
        } else {
          // Remove stale cache entry
          await cache.delete(url)
        }
      }
    } catch (error) {
      // Silent fail
    }

    return null
  }

  // Store response in cache
  private static async storeInCache(url: string, response: Response, dataType: keyof typeof CachePolicyService.POLICIES) {
    try {
      const cacheName = this.getCacheName(dataType)
      const cache = await caches.open(cacheName)

      // Add timestamp header for cache validation
      const headers = new Headers(response.headers)
      headers.set('X-Cache-Timestamp', Date.now().toString())

      const responseToCache = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      })

      await cache.put(url, responseToCache)

      // Clean up old entries
      this.cleanupCache(cacheName, dataType)

    } catch (error) {
      // Silent fail
    }
  }

  // Generate cache name for data type
  private static getCacheName(dataType: keyof typeof CachePolicyService.POLICIES): string {
    return `${this.CACHE_PREFIX}-${dataType.toLowerCase()}`
  }

  // Clean up old cache entries
  private static async cleanupCache(cacheName: string, dataType: keyof typeof CachePolicyService.POLICIES) {
    try {
      const cache = await caches.open(cacheName)
      const requests = await cache.keys()
      const policy = CachePolicyService.getPolicy(dataType)
      const maxAge = policy.maxAge * 1000 // Convert to milliseconds
      const now = Date.now()

      // Remove expired entries
      for (const request of requests) {
        const response = await cache.match(request)
        if (response) {
          const timestamp = parseInt(response.headers.get('X-Cache-Timestamp') || '0')
          if (now - timestamp > maxAge) {
            await cache.delete(request)
          }
        }
      }
    } catch (error) {
      // Silent fail
    }
  }

  // Preload critical data
  static async preloadCriticalData(userId: string) {
    const criticalEndpoints = [
      { url: `/api/hnwi/intelligence/dashboard/${userId}`, type: 'INTELLIGENCE_BRIEF' as const },
      { url: `/api/crown-vault/stats?owner_id=${userId}`, type: 'CROWN_VAULT' as const },
      { url: `/api/opportunities`, type: 'OPPORTUNITIES' as const }
    ]

    // Preload in parallel but don't wait for completion
    Promise.all(
      criticalEndpoints.map(endpoint =>
        this.fetch(endpoint.url, {}, endpoint.type).catch(() => null)
      )
    )
  }

  // Get cache statistics
  static async getCacheStats(): Promise<{
    totalSize: number
    entryCount: number
    hitRate: number
  }> {
    try {
      const cacheNames = await caches.keys()
      let totalSize = 0
      let entryCount = 0

      for (const cacheName of cacheNames) {
        if (cacheName.startsWith(this.CACHE_PREFIX)) {
          const cache = await caches.open(cacheName)
          const requests = await cache.keys()
          entryCount += requests.length

          // Estimate size (rough approximation)
          for (const request of requests) {
            const response = await cache.match(request)
            if (response) {
              const text = await response.text()
              totalSize += text.length
            }
          }
        }
      }

      return {
        totalSize,
        entryCount,
        hitRate: 0 // Would need analytics to calculate
      }
    } catch (error) {
      return { totalSize: 0, entryCount: 0, hitRate: 0 }
    }
  }

  // Clear specific cache by data type
  static async clearCache(dataType: keyof typeof CachePolicyService.POLICIES): Promise<void> {
    try {
      const cacheName = this.getCacheName(dataType)
      await caches.delete(cacheName)

      console.log(`[Cache] Cleared cache for ${dataType}`)
    } catch (error) {
      console.error(`[Cache] Failed to clear cache for ${dataType}:`, error)
    }
  }

  // Clear all Service Worker caches (including 'api' cache used by Workbox)
  static async clearAllServiceWorkerCaches(): Promise<void> {
    try {
      const cacheNames = await caches.keys()

      // Clear all caches that match opportunities endpoint
      for (const cacheName of cacheNames) {
        if (cacheName === 'api' || cacheName.includes('opportunities')) {
          await caches.delete(cacheName)
          console.log(`[Cache] Cleared Service Worker cache: ${cacheName}`)
        }
      }
    } catch (error) {
      console.error('[Cache] Failed to clear Service Worker caches:', error)
    }
  }

  // Clear opportunities cache specifically
  static async clearOpportunitiesCache(): Promise<void> {
    try {
      // Clear our custom cache
      await this.clearCache('OPPORTUNITIES')

      // Also clear the Service Worker 'api' cache which holds /api/opportunities
      const apiCache = await caches.open('api')
      const requests = await apiCache.keys()

      for (const request of requests) {
        if (request.url.includes('/api/opportunities')) {
          await apiCache.delete(request)
          console.log(`[Cache] Cleared cached opportunity data from Service Worker`)
        }
      }
    } catch (error) {
      console.error('[Cache] Failed to clear opportunities cache:', error)
    }
  }
}