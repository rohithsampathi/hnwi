// lib/secure-api.ts
// SOTA 2025 Centralized Secure API Handler
// Single source of truth for ALL authenticated API calls with built-in auth management
// All backend URLs are masked for security

import { API_BASE_URL } from "@/config/api";
import { 
  authManager,
  getAuthToken as getAuthManagerToken,
  getCurrentUserId,
  getCurrentUser,
  isAuthenticated as isAuthManagerAuthenticated,
  refreshUser
} from "@/lib/auth-manager";
import { cacheDebugger } from "@/lib/cache-debug";

// Mask backend URL for security - NEVER expose real backend URL
const MASKED_API_URL = '/api';

// Security function to mask any backend URLs in strings
const maskBackendUrl = (str: string): string => {
  if (!str) return str;
  // Replace any occurrence of the backend URL with masked version
  return str
    .replace(new RegExp(API_BASE_URL, 'g'), MASKED_API_URL)
    .replace(/https?:\/\/[^\s\/]+(\/api)?/g, MASKED_API_URL)
    .replace(/localhost:\d+/g, MASKED_API_URL);
};

interface SecureFetchOptions extends RequestInit {
  timeout?: number;
  enableCache?: boolean;
  cacheKey?: string;
  cacheDuration?: number;
}

// Ultra-fast cache with stale-while-revalidate and request deduplication
class FastCache {
  private cache = new Map<string, { data: any; timestamp: number; maxAge: number }>();
  private inFlight = new Map<string, Promise<any>>();
  
  set(key: string, data: any, maxAge: number = 600000): void {
    this.cache.set(key, { data, timestamp: Date.now(), maxAge });
  }
  
  get(key: string): { data: any; isStale: boolean } | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const age = Date.now() - entry.timestamp;
    const isStale = age > entry.maxAge;
    
    // Return data even if stale - caller decides what to do
    return { data: entry.data, isStale };
  }
  
  // Get or create a pending request to prevent duplicate API calls
  getOrSetPending(key: string, requestFn: () => Promise<any>): Promise<any> {
    // If request is already in flight, return the existing promise
    if (this.inFlight.has(key)) {
      return this.inFlight.get(key)!;
    }
    
    // Create new request and store the promise
    const promise = requestFn()
      .finally(() => {
        // Remove from in-flight when done (success or error)
        this.inFlight.delete(key);
      });
    
    this.inFlight.set(key, promise);
    return promise;
  }
  
  clear(): void {
    this.cache.clear();
    this.inFlight.clear();
  }
  
  delete(key: string): void {
    this.cache.delete(key);
    this.inFlight.delete(key);
  }
}

const fastCache = new FastCache();

// Export cache control functions
export const CacheControl = {
  clear: () => fastCache.clear(),
  delete: (key: string) => fastCache.delete(key),
  clearUserData: (userId: string) => {
    // Clear all Crown Vault related cache entries for a user
    const patterns = [
      `/api/crown-vault/assets/detailed?owner_id=${userId}`,
      `/api/crown-vault/heirs?owner_id=${userId}`,  
      `/api/crown-vault/stats?owner_id=${userId}`
    ];
    patterns.forEach(pattern => fastCache.delete(pattern));
  },
  
  // Force refresh data after mutations by clearing cache and fetching fresh data
  async refreshUserData(userId: string, apiClient: any): Promise<{
    assets: any[],
    heirs: any[],
    stats: any
  }> {
    // Clear existing cache
    this.clearUserData(userId);
    
    // Fetch fresh data in parallel
    const [freshAssets, freshHeirs, freshStats] = await Promise.all([
      apiClient.get(`/api/crown-vault/assets/detailed?owner_id=${userId}`, true, { enableCache: true, cacheDuration: 600000 }).catch(() => []),
      apiClient.get(`/api/crown-vault/heirs?owner_id=${userId}`, true, { enableCache: true, cacheDuration: 600000 }).catch(() => []),
      apiClient.get(`/api/crown-vault/stats?owner_id=${userId}`, true, { enableCache: true, cacheDuration: 600000 }).catch(() => null)
    ]);
    
    return {
      assets: Array.isArray(freshAssets) ? freshAssets : (freshAssets?.assets || []),
      heirs: Array.isArray(freshHeirs) ? freshHeirs : (freshHeirs?.heirs || []),
      stats: freshStats
    };
  }
};

class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public endpoint?: string
  ) {
    super(maskBackendUrl(message));
    this.name = 'APIError';
    // Sanitize endpoint to hide backend URL
    if (this.endpoint) {
      this.endpoint = maskBackendUrl(this.endpoint);
    }
    // Mask stack trace as well
    if (this.stack) {
      this.stack = maskBackendUrl(this.stack);
    }
  }
}

// Central Auth Wrapper - ALL auth logic in one place
class AuthWrapper {
  private static instance: AuthWrapper;
  private tokenRefreshPromise: Promise<any> | null = null;
  
  private constructor() {}
  
  public static getInstance(): AuthWrapper {
    if (!AuthWrapper.instance) {
      AuthWrapper.instance = new AuthWrapper();
    }
    return AuthWrapper.instance;
  }
  
  // Get valid token with automatic refresh if needed
  public async getValidToken(): Promise<string | null> {
    // Ensure auth manager is initialized
    authManager.ensureInitialized();
    
    const token = getAuthManagerToken();
    if (!token) return null;
    
    // Check if token is about to expire (within 5 minutes)
    const expiry = authManager.getTokenExpiry();
    if (expiry.expiresIn < 300000) { // 5 minutes
      // Token about to expire, try to refresh
      if (!this.tokenRefreshPromise) {
        this.tokenRefreshPromise = refreshUser().finally(() => {
          this.tokenRefreshPromise = null;
        });
      }
      await this.tokenRefreshPromise;
      return getAuthManagerToken();
    }
    
    return token;
  }
  
  // Check if user is authenticated and can make API calls
  public canMakeApiCall(): boolean {
    authManager.ensureInitialized();
    return isAuthManagerAuthenticated();
  }
  
  // Get auth headers for requests
  public async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getValidToken();
    if (!token) return {};
    
    // Only return Authorization header - backend extracts user ID from JWT
    // X-User-Id header causes CORS issues with the backend
    return {
      'Authorization': `Bearer ${token}`
    };
  }
  
  // Handle auth errors
  public handleAuthError(error: any): void {
    // Only logout on 401 (unauthorized) - means token is invalid
    if (error?.status === 401) {
      // Token invalid or expired - logout
      authManager.logout();
      // Redirect to login page (root with splash screen)
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
    // 403 (forbidden) means user is authenticated but lacks permission
    // Don't logout, just show error to user
  }
}

const authWrapper = AuthWrapper.getInstance();

export class SecureAPI {
  private static logSafeError(endpoint: string, status?: number, error?: string): void {
    // Log without exposing full URLs - only show masked endpoint paths
    const safeEndpoint = maskBackendUrl(endpoint);
    // Don't log in production to avoid any URL exposure in browser console
    if (process.env.NODE_ENV === 'development') {
    }
  }

  static async secureFetch(
    endpoint: string,
    options: SecureFetchOptions = {}
  ): Promise<Response> {
    const { timeout = 30000, ...fetchOptions } = options;
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(endpoint, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        this.logSafeError(endpoint, response.status, `HTTP ${response.status}`);
        throw new APIError(
          `Request failed with status ${response.status}`,
          response.status,
          endpoint
        );
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof APIError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        this.logSafeError(endpoint, undefined, 'Request timeout');
        throw new APIError('Request timeout', 408, endpoint);
      }

      // For CORS and network errors, don't expose the URL
      this.logSafeError(endpoint, undefined, 'Network error (possibly CORS)');
      throw new APIError('Network error', 0, endpoint);
    }
  }

  static async secureJsonFetch<T = any>(
    endpoint: string,
    options: SecureFetchOptions = {}
  ): Promise<T> {
    const { enableCache = false, cacheKey, cacheDuration = 600000, ...fetchOptions } = options;
    
    // Only enable caching for GET requests
    if (enableCache && (!fetchOptions.method || fetchOptions.method === 'GET')) {
      const key = cacheKey || endpoint;
      
      // Check if we have cached data
      const cached = fastCache.get(key);
      
      if (cached) {
        // If data is fresh, return immediately
        if (!cached.isStale) {
          cacheDebugger.logCacheHit(key);
          return cached.data as T;
        }
        
        // Data is stale - start background refresh but return stale data immediately
        fastCache.getOrSetPending(key, async () => {
          try {
            cacheDebugger.logCacheMiss(key + ' (stale refresh)');
            const response = await this.secureFetch(endpoint, {
              ...fetchOptions,
              headers: {
                'Content-Type': 'application/json',
                ...fetchOptions.headers,
              },
            });
            const freshData = await response.json();
            fastCache.set(key, freshData, cacheDuration);
            cacheDebugger.logRequestComplete(key + ' (stale refresh)');
            return freshData;
          } catch (error) {
            // If background refresh fails, keep stale data
            return cached.data;
          }
        });
        
        // Return stale data immediately for better perceived performance
        cacheDebugger.logCacheHit(key + ' (stale)');
        return cached.data as T;
      }
      
      // No cached data - use request deduplication for first-time requests
      cacheDebugger.logCacheMiss(key);
      return await fastCache.getOrSetPending(key, async () => {
        const response = await this.secureFetch(endpoint, {
          ...fetchOptions,
          headers: {
            'Content-Type': 'application/json',
            ...fetchOptions.headers,
          },
        });
        const data = await response.json();
        fastCache.set(key, data, cacheDuration);
        cacheDebugger.logRequestComplete(key);
        return data;
      }) as T;
    }
    
    // Non-cached request - standard flow
    try {
      const response = await this.secureFetch(endpoint, {
        ...fetchOptions,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
      });

      const data = await response.json();
      return data as T;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      
      this.logSafeError(endpoint, undefined, 'Failed to parse JSON response');
      throw new APIError('Invalid response format', 422, endpoint);
    }
  }

  static buildUrl(path: string, params?: Record<string, string>): string {
    const url = `${API_BASE_URL}${path}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      return `${url}?${searchParams.toString()}`;
    }
    return url;
  }
}

// Create a safe error message that doesn't expose the URL
const createSecureError = (message: string, statusCode?: number): Error => {
  const secureMessage = `API Error: ${message}${statusCode ? ` (${statusCode})` : ''}`;
  const error = new Error(secureMessage);
  // Ensure no URL leaks in stack traces
  if (error.stack) {
    error.stack = error.stack.replace(/https?:\/\/[^\/\s]+/g, '[REDACTED]');
  }
  return error;
};

// Check if session allows API calls - centralized auth check
const checkSessionAccess = async (endpoint: string): Promise<void> => {
  // Skip check for public endpoints (like auth endpoints)
  const publicEndpoints = ['/api/auth/', '/api/csrf-token', '/api/og'];
  
  if (publicEndpoints.some(pub => endpoint.includes(pub))) {
    return; // Allow public endpoints
  }
  
  // Use centralized auth wrapper
  if (!authWrapper.canMakeApiCall()) {
    throw new APIError(
      'Authentication required. Please sign in to continue.',
      401,
      endpoint
    );
  }
  
  // Verify we can get a valid token
  const token = await authWrapper.getValidToken();
  if (!token) {
    throw new APIError(
      'Session expired. Please sign in again.',
      401,
      endpoint
    );
  }
};

// Secure fetch wrapper that matches backend expectations - CENTRALIZED
export const secureApiCall = async (
  endpoint: string, 
  options: RequestInit = {},
  requireAuth: boolean = true,
  serverToken?: string
): Promise<Response> => {
  try {
    // Always use the backend URL directly (but never expose it)
    const url = `${API_BASE_URL}${endpoint}`;
    
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Use centralized auth wrapper for auth headers
    if (requireAuth && !serverToken) {
      const authHeaders = await authWrapper.getAuthHeaders();
      if (!authHeaders.Authorization) {
        throw new APIError('Authentication required - please log in', 401, endpoint);
      }
      Object.assign(headers, authHeaders);
    } else if (serverToken) {
      // Server-side token
      headers['Authorization'] = `Bearer ${serverToken}`;
    }

    
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    
    // Handle auth errors centrally - only for 401 (unauthorized)
    if (response.status === 401 && !endpoint.includes('/api/auth/')) {
      authWrapper.handleAuthError({ status: response.status });
    }
    // 403 is a permission issue, not an auth issue - don't logout

    return response;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    // Don't expose the actual URL in error messages
    throw createSecureError('Connection failed', 0);
  }
};

// Secure API methods
export const secureApi = {
  async post(endpoint: string, data: any, requireAuth: boolean = true, cacheOptions?: { enableCache?: boolean; cacheDuration?: number; cacheKey?: string }): Promise<any> {
    // Check session access if auth is required
    if (requireAuth) {
      await checkSessionAccess(endpoint);
    }
    
    const { enableCache = false, cacheDuration = 300000, cacheKey: customCacheKey } = cacheOptions || {}; // 5 minutes default for POST
    
    // Create cache key based on custom key or endpoint + data for POST requests
    const cacheKey = enableCache ? (customCacheKey || `${endpoint}:${JSON.stringify(data)}`) : null;
    
    if (enableCache && cacheKey) {
      const cached = fastCache.get(cacheKey);
      
      if (cached) {
        // If data is fresh, return immediately
        if (!cached.isStale) {
          cacheDebugger.logCacheHit(cacheKey);
          return cached.data;
        }
        
        // Data is stale - start background refresh but return stale data immediately
        fastCache.getOrSetPending(cacheKey, async () => {
          try {
            cacheDebugger.logCacheMiss(cacheKey + ' (stale refresh)');
            const response = await secureApiCall(endpoint, { method: 'POST', body: JSON.stringify(data) }, requireAuth);
            if (!response.ok) {
              throw createSecureError('Request failed', response.status);
            }
            const freshData = await response.json();
            fastCache.set(cacheKey, freshData, cacheDuration);
            cacheDebugger.logRequestComplete(cacheKey + ' (stale refresh)');
            return freshData;
          } catch (error) {
            return cached.data;
          }
        });
        
        cacheDebugger.logCacheHit(cacheKey + ' (stale)');
        return cached.data;
      }
      
      // No cached data - use request deduplication
      cacheDebugger.logCacheMiss(cacheKey);
      return await fastCache.getOrSetPending(cacheKey, async () => {
        const response = await secureApiCall(endpoint, { method: 'POST', body: JSON.stringify(data) }, requireAuth);
        if (!response.ok) {
          throw createSecureError('Request failed', response.status);
        }
        const result = await response.json();
        fastCache.set(cacheKey, result, cacheDuration);
        cacheDebugger.logRequestComplete(cacheKey);
        return result;
      });
    }
    
    // Non-cached request
    try {
      const response = await secureApiCall(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      }, requireAuth);

      // Special handling for auth endpoints - return data even on non-OK status
      if (endpoint.includes('/api/auth/')) {
        try {
          const responseData = await response.json();
          return responseData;
        } catch (jsonError) {
          // Return error object to prevent crash
          return { error: 'Failed to parse response', status: response.status };
        }
      }

      if (!response.ok) {
        throw createSecureError('Request failed', response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw createSecureError('Unknown error occurred');
    }
  },

  async get(endpoint: string, requireAuth: boolean = true, cacheOptions?: { enableCache?: boolean; cacheDuration?: number }): Promise<any> {
    // Check session access if auth is required
    if (requireAuth) {
      await checkSessionAccess(endpoint);
    }
    
    const { enableCache = false, cacheDuration = 600000 } = cacheOptions || {};
    
    if (enableCache) {
      const cached = fastCache.get(endpoint);
      
      if (cached) {
        // If data is fresh, return immediately
        if (!cached.isStale) {
          return cached.data;
        }
        
        // Data is stale - start background refresh but return stale data immediately
        fastCache.getOrSetPending(endpoint, async () => {
          try {
            const response = await secureApiCall(endpoint, { method: 'GET' }, requireAuth);
            if (!response.ok) {
              throw createSecureError('Request failed', response.status);
            }
            const freshData = await response.json();
            fastCache.set(endpoint, freshData, cacheDuration);
            return freshData;
          } catch (error) {
            return cached.data;
          }
        });
        
        return cached.data;
      }
      
      // No cached data - use request deduplication
      return await fastCache.getOrSetPending(endpoint, async () => {
        const response = await secureApiCall(endpoint, { method: 'GET' }, requireAuth);
        if (!response.ok) {
          throw createSecureError('Request failed', response.status);
        }
        const data = await response.json();
        fastCache.set(endpoint, data, cacheDuration);
        return data;
      });
    }
    
    // Non-cached request
    try {
      const response = await secureApiCall(endpoint, {
        method: 'GET',
      }, requireAuth);

      if (!response.ok) {
        throw createSecureError('Request failed', response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw createSecureError('Unknown error occurred');
    }
  },

  async put(endpoint: string, data: any, requireAuth: boolean = true): Promise<any> {
    // Check session access if auth is required
    if (requireAuth) {
      await checkSessionAccess(endpoint);
    }
    
    try {
      const response = await secureApiCall(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
      }, requireAuth);

      if (!response.ok) {
        throw createSecureError('Request failed', response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw createSecureError('Unknown error occurred');
    }
  },

  async delete(endpoint: string, requireAuth: boolean = true): Promise<any> {
    // Check session access if auth is required
    if (requireAuth) {
      await checkSessionAccess(endpoint);
    }
    
    try {
      const response = await secureApiCall(endpoint, {
        method: 'DELETE',
      }, requireAuth);

      if (!response.ok) {
        throw createSecureError('Request failed', response.status);
      }

      // DELETE responses might not have JSON body
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return { success: true };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw createSecureError('Unknown error occurred');
    }
  }
};

// Export helper functions for backward compatibility
export const secureFetch = SecureAPI.secureFetch.bind(SecureAPI);
export const secureJsonFetch = SecureAPI.secureJsonFetch.bind(SecureAPI);
export const buildApiUrl = SecureAPI.buildUrl.bind(SecureAPI);

// Server-side API for use in API routes (bypasses client-side session checks)
export const serverSecureApi = {
  async post(endpoint: string, data: any, serverToken?: string): Promise<any> {
    try {
      const { API_BASE_URL } = await import("@/config/api");
      const url = `${API_BASE_URL}${endpoint}`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (serverToken) {
        headers['Authorization'] = `Bearer ${serverToken}`;
      }
      
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers,
      });

      if (!response.ok) {
        throw new APIError(`Request failed with status ${response.status}`, response.status, endpoint);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError('Server request failed', 500, endpoint);
    }
  },

  async get(endpoint: string, serverToken?: string): Promise<any> {
    try {
      const { API_BASE_URL } = await import("@/config/api");
      const url = `${API_BASE_URL}${endpoint}`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (serverToken) {
        headers['Authorization'] = `Bearer ${serverToken}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new APIError(`Request failed with status ${response.status}`, response.status, endpoint);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError('Server request failed', 500, endpoint);
    }
  },

  async put(endpoint: string, data: any, serverToken?: string): Promise<any> {
    try {
      const { API_BASE_URL } = await import("@/config/api");
      const url = `${API_BASE_URL}${endpoint}`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (serverToken) {
        headers['Authorization'] = `Bearer ${serverToken}`;
      }
      
      const response = await fetch(url, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers,
      });

      if (!response.ok) {
        throw new APIError(`Request failed with status ${response.status}`, response.status, endpoint);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError('Server request failed', 500, endpoint);
    }
  },

  async delete(endpoint: string, serverToken?: string): Promise<any> {
    try {
      const { API_BASE_URL } = await import("@/config/api");
      const url = `${API_BASE_URL}${endpoint}`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (serverToken) {
        headers['Authorization'] = `Bearer ${serverToken}`;
      }
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new APIError(`Request failed with status ${response.status}`, response.status, endpoint);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return { success: true };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError('Server request failed', 500, endpoint);
    }
  }
};

// Export centralized auth utilities
export const getAuthenticatedUser = () => getCurrentUser();
export const getAuthenticatedUserId = () => getCurrentUserId();
export const isUserAuthenticated = () => isAuthManagerAuthenticated();
export const refreshAuthToken = () => refreshUser();

// Debug helper for auth issues
export const debugAuth = () => {
  if (typeof window === 'undefined') return;
  
};

// Add debug helper to window for debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).secureApiDebug = debugAuth;
  (window as any).secureApi = secureApi;
}

// Export only secure methods, not the base URL
export default secureApi;