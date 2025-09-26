// lib/services/cache-policy-service.ts
// Enhanced caching policies for different data types and user contexts

export interface CachePolicy {
  maxAge: number // Cache TTL in seconds
  staleWhileRevalidate?: number // SWR window in seconds
  strategy: 'cache-first' | 'network-first' | 'stale-while-revalidate' | 'network-only'
  background?: boolean // Enable background refresh
  userSpecific?: boolean // Cache per user
}

export class CachePolicyService {

  // Define cache policies for different data types
  static readonly POLICIES = {
    // Real-time data - short cache with background refresh
    INTELLIGENCE_BRIEF: {
      maxAge: 300, // 5 minutes
      staleWhileRevalidate: 1800, // 30 minutes SWR window
      strategy: 'stale-while-revalidate' as const,
      background: true,
      userSpecific: true
    },

    // Market data - medium cache with network first
    MARKET_DATA: {
      maxAge: 600, // 10 minutes
      staleWhileRevalidate: 3600, // 1 hour SWR window
      strategy: 'network-first' as const,
      background: true,
      userSpecific: false
    },

    // User portfolio - user-specific with medium cache
    CROWN_VAULT: {
      maxAge: 900, // 15 minutes
      staleWhileRevalidate: 3600, // 1 hour SWR window
      strategy: 'stale-while-revalidate' as const,
      background: true,
      userSpecific: true
    },

    // Opportunities - medium cache with background refresh
    OPPORTUNITIES: {
      maxAge: 1200, // 20 minutes
      staleWhileRevalidate: 7200, // 2 hours SWR window
      strategy: 'stale-while-revalidate' as const,
      background: true,
      userSpecific: false
    },

    // Static content - long cache
    STATIC_CONTENT: {
      maxAge: 86400, // 24 hours
      staleWhileRevalidate: 604800, // 1 week SWR window
      strategy: 'cache-first' as const,
      background: false,
      userSpecific: false
    },

    // Chat messages - immediate cache with user context
    ROHITH_MESSAGES: {
      maxAge: 60, // 1 minute
      staleWhileRevalidate: 300, // 5 minutes SWR window
      strategy: 'network-first' as const,
      background: true,
      userSpecific: true
    },

    // Social events - medium cache
    SOCIAL_EVENTS: {
      maxAge: 1800, // 30 minutes
      staleWhileRevalidate: 7200, // 2 hours SWR window
      strategy: 'stale-while-revalidate' as const,
      background: true,
      userSpecific: false
    },

    // User preferences - long cache with immediate updates
    USER_PREFERENCES: {
      maxAge: 3600, // 1 hour
      staleWhileRevalidate: 86400, // 24 hours SWR window
      strategy: 'network-first' as const,
      background: false,
      userSpecific: true
    }
  } as const

  // Get cache policy for a specific data type
  static getPolicy(dataType: keyof typeof CachePolicyService.POLICIES): CachePolicy {
    return this.POLICIES[dataType]
  }

  // Generate cache headers for a response based on policy
  static generateHeaders(policy: CachePolicy, userId?: string): Record<string, string> {
    const headers: Record<string, string> = {}

    if (policy.strategy === 'cache-first' || policy.strategy === 'stale-while-revalidate') {
      headers['Cache-Control'] = policy.staleWhileRevalidate
        ? `public, max-age=${policy.maxAge}, stale-while-revalidate=${policy.staleWhileRevalidate}`
        : `public, max-age=${policy.maxAge}`
    } else if (policy.strategy === 'network-first') {
      headers['Cache-Control'] = `public, max-age=${policy.maxAge}, must-revalidate`
    } else {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    }

    // Add user-specific cache key if needed
    if (policy.userSpecific && userId) {
      headers['Vary'] = 'Authorization, Cookie'
      headers['X-Cache-Key'] = `user-${userId}`
    }

    return headers
  }

  // Check if data should be cached based on context
  static shouldCache(dataType: keyof typeof CachePolicyService.POLICIES, context: {
    isOnline: boolean
    batteryLevel?: number
    connectionType?: string
  }): boolean {
    const policy = this.getPolicy(dataType)

    // Always cache if offline
    if (!context.isOnline) return true

    // Skip caching for network-only policies on slow connections
    if (policy.strategy === 'network-only' && context.connectionType === 'slow-2g') {
      return false
    }

    // Reduce caching on low battery
    if (context.batteryLevel && context.batteryLevel < 0.2) {
      return policy.strategy === 'cache-first' || policy.strategy === 'stale-while-revalidate'
    }

    return true
  }

  // Get cache key for user-specific data
  static getCacheKey(dataType: keyof typeof CachePolicyService.POLICIES, params: {
    endpoint: string
    userId?: string
    queryParams?: Record<string, any>
  }): string {
    const policy = this.getPolicy(dataType)
    let key = params.endpoint

    // Add query parameters to key
    if (params.queryParams) {
      const sortedParams = Object.keys(params.queryParams)
        .sort()
        .map(k => `${k}=${params.queryParams![k]}`)
        .join('&')
      key += `?${sortedParams}`
    }

    // Add user context for user-specific caches
    if (policy.userSpecific && params.userId) {
      key = `user-${params.userId}:${key}`
    }

    return btoa(key) // Base64 encode for safe storage
  }

  // Determine if cache entry is stale but acceptable
  static isStaleButFresh(
    cacheTimestamp: number,
    dataType: keyof typeof CachePolicyService.POLICIES
  ): boolean {
    const policy = this.getPolicy(dataType)
    const now = Date.now()
    const age = (now - cacheTimestamp) / 1000

    // Within max-age: fresh
    if (age <= policy.maxAge) return true

    // Beyond max-age but within SWR window: stale but acceptable
    if (policy.staleWhileRevalidate && age <= policy.maxAge + policy.staleWhileRevalidate) {
      return true
    }

    return false
  }

  // Get cache configuration for service worker
  static getServiceWorkerConfig() {
    return {
      intelligence: {
        urlPattern: /\/api\/(intelligence|hnwi|developments)/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'intelligence-data',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: this.POLICIES.INTELLIGENCE_BRIEF.maxAge
          }
        }
      },

      portfolio: {
        urlPattern: /\/api\/crown-vault/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'portfolio-data',
          networkTimeoutSeconds: 5,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: this.POLICIES.CROWN_VAULT.maxAge
          }
        }
      },

      opportunities: {
        urlPattern: /\/api\/opportunities/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'opportunities-data',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: this.POLICIES.OPPORTUNITIES.maxAge
          }
        }
      },

      rohith: {
        urlPattern: /\/api\/rohith/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'rohith-data',
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 1000,
            maxAgeSeconds: this.POLICIES.ROHITH_MESSAGES.maxAge
          }
        }
      }
    }
  }
}