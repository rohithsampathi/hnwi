// lib/fast-secure-api.ts

import { API_BASE_URL, createSafeApiError } from "@/config/api";
import { getValidToken, clearInvalidToken } from "@/lib/auth-utils";

interface FastAPIOptions extends RequestInit {
  timeout?: number;
  requireAuth?: boolean;
}

class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    endpoint?: string
  ) {
    // Use safe error creation to mask the backend URL
    const safeError = createSafeApiError(message, endpoint);
    super(safeError.message);
    this.name = 'APIError';
  }
}

// Simple in-memory cache for GET requests only (no complex stale-while-revalidate)
class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly TTL = 600000; // 10 minutes

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const isExpired = Date.now() - entry.timestamp > this.TTL;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
    
    // Simple cleanup: remove oldest entries if cache gets too large
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

const cache = new SimpleCache();

class FastSecureAPI {
  private static async request<T = any>(
    endpoint: string,
    options: FastAPIOptions = {}
  ): Promise<T> {
    const { 
      timeout = 10000, // Reduced from 30s to 10s
      requireAuth = true,
      ...fetchOptions 
    } = options;

    // Quick auth check
    if (requireAuth) {
      clearInvalidToken(); // Only clear if needed
      const token = getValidToken();
      if (!token) {
        throw new APIError('Authentication required', 401, endpoint);
      }
    }

    // Simple timeout implementation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const token = requireAuth ? getValidToken() : null;
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...fetchOptions.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          clearInvalidToken(); // Clear invalid token
        }
        throw new APIError(
          `Request failed: ${response.status}`,
          response.status,
          `${API_BASE_URL}${endpoint}`
        );
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof APIError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new APIError('Request timeout', 408, `${API_BASE_URL}${endpoint}`);
      }

      throw new APIError('Network error', 0, `${API_BASE_URL}${endpoint}`);
    }
  }

  // GET with optional simple caching
  static async get<T = any>(
    endpoint: string, 
    requireAuth: boolean = true,
    useCache: boolean = false
  ): Promise<T> {
    // Check cache first for GET requests
    if (useCache) {
      const cached = cache.get(endpoint);
      if (cached) return cached;
    }

    const data = await this.request<T>(endpoint, { 
      method: 'GET',
      requireAuth 
    });

    // Cache successful GET requests
    if (useCache) {
      cache.set(endpoint, data);
    }

    return data;
  }

  // POST - no caching
  static async post<T = any>(
    endpoint: string,
    data: any,
    requireAuth: boolean = true
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth,
    });
  }

  // PUT - no caching, clear related cache entries
  static async put<T = any>(
    endpoint: string,
    data: any,
    requireAuth: boolean = true
  ): Promise<T> {
    const result = await this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      requireAuth,
    });

    // Clear cache entries that might be affected by this PUT
    cache.delete(endpoint);
    // Clear related GET endpoints (simple pattern matching)
    const baseEndpoint = endpoint.split('/').slice(0, -1).join('/');
    cache.delete(baseEndpoint);

    return result;
  }

  // DELETE - clear related cache entries
  static async delete<T = any>(
    endpoint: string,
    requireAuth: boolean = true
  ): Promise<T> {
    const result = await this.request<T>(endpoint, {
      method: 'DELETE',
      requireAuth,
    });

    // Clear cache entries that might be affected by this DELETE
    cache.delete(endpoint);
    const baseEndpoint = endpoint.split('/').slice(0, -1).join('/');
    cache.delete(baseEndpoint);

    return result;
  }

  // Cache management
  static clearCache(): void {
    cache.clear();
  }

  static deleteCacheEntry(key: string): void {
    cache.delete(key);
  }

  // Clear user-specific cache entries
  static clearUserCache(userId: string): void {
    // Clear Crown Vault related entries for specific user
    cache.delete(`/api/crown-vault/assets/detailed?owner_id=${userId}`);
    cache.delete(`/api/crown-vault/heirs?owner_id=${userId}`);
    cache.delete(`/api/crown-vault/stats?owner_id=${userId}`);
  }

  // Build URL with parameters (for compatibility)
  static buildUrl(path: string, params?: Record<string, string>): string {
    const url = `${API_BASE_URL}${path}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      return `${url}?${searchParams.toString()}`;
    }
    return url;
  }

  // JSON fetch method for compatibility
  static async secureJsonFetch<T = any>(
    endpoint: string,
    options: FastAPIOptions = {}
  ): Promise<T> {
    return this.get<T>(endpoint, options.requireAuth !== false, false);
  }
}

// Cache control for backward compatibility
export const CacheControl = {
  clear: () => cache.clear(),
  delete: (key: string) => cache.delete(key),
  clearUserData: (userId: string) => {
    // Clear all Crown Vault related cache entries for a user
    const patterns = [
      `/api/crown-vault/assets/detailed?owner_id=${userId}`,
      `/api/crown-vault/heirs?owner_id=${userId}`,  
      `/api/crown-vault/stats?owner_id=${userId}`
    ];
    patterns.forEach(pattern => cache.delete(pattern));
  },
  
  // Force refresh data after mutations by clearing cache and fetching fresh data
  async refreshUserData(userId: string, secureApi: any): Promise<{
    assets: any[],
    heirs: any[],
    stats: any
  }> {
    // Clear existing cache
    this.clearUserData(userId);
    
    // Fetch fresh data in parallel
    const [freshAssets, freshHeirs, freshStats] = await Promise.all([
      FastSecureAPI.get(`/api/crown-vault/assets/detailed?owner_id=${userId}`, true, true).catch(() => []),
      FastSecureAPI.get(`/api/crown-vault/heirs?owner_id=${userId}`, true, true).catch(() => []),
      FastSecureAPI.get(`/api/crown-vault/stats?owner_id=${userId}`, true, true).catch(() => null)
    ]);
    
    return {
      assets: Array.isArray(freshAssets) ? freshAssets : (freshAssets?.assets || []),
      heirs: Array.isArray(freshHeirs) ? freshHeirs : (freshHeirs?.heirs || []),
      stats: freshStats
    };
  }
};

// Export the class and convenient methods
export { FastSecureAPI, APIError };
export default FastSecureAPI;

// Backward compatibility exports
export const fastSecureApi = {
  get: FastSecureAPI.get,
  post: FastSecureAPI.post,
  put: FastSecureAPI.put,
  delete: FastSecureAPI.delete,
  clearCache: FastSecureAPI.clearCache,
  clearUserCache: FastSecureAPI.clearUserCache,
};

// Export SecureAPI class for compatibility
export const SecureAPI = FastSecureAPI;

// Additional compatibility exports
export const secureApi = fastSecureApi;