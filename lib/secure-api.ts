// lib/secure-api.ts
// Cookie-Based Secure API Handler - SOTA httpOnly Cookie Authentication
// No tokens in JavaScript = XSS-proof authentication
// All requests go through Next.js API routes - backend URL never exposed to client

import { EnhancedCacheService } from './services/enhanced-cache-service'
import { CachePolicyService } from './services/cache-policy-service'
import { authManager } from './auth-manager'

// Helper to read CSRF token from cookie (only CSRF is readable)
const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
};

// Check if user is authenticated (based on session check, not tokens)
let isAuthenticatedCache: boolean | null = null;

export const isAuthenticated = (): boolean => {
  // Check both our cache and authManager for consistency
  const managerAuth = authManager.isAuthenticated()
  if (managerAuth && isAuthenticatedCache === false) {
    // AuthManager has auth but we don't - sync it
    isAuthenticatedCache = true
  } else if (!managerAuth && isAuthenticatedCache === true) {
    // We have auth but authManager doesn't - clear it
    isAuthenticatedCache = false
  }
  return isAuthenticatedCache ?? managerAuth
};

export const setAuthState = (authenticated: boolean): void => {
  isAuthenticatedCache = authenticated;
  // Keep authManager in sync
  authManager.setAuthenticated(authenticated)
};

// Request queue for handling 401s
interface QueuedRequest {
  resolve: (value: Response) => void;
  reject: (reason: any) => void;
  endpoint: string;
  options: RequestInit;
  requireAuth: boolean;
}

let requestQueue: QueuedRequest[] = [];
let isRefreshingAuth = false;
let authPopupCallback: ((options?: any) => void) | null = null;

// Register auth popup callback (called from AuthPopupProvider)
export const registerAuthPopupCallback = (callback: (options?: any) => void): void => {
  authPopupCallback = callback;
};

// Try to refresh token before showing auth error
const tryRefreshToken = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        setAuthState(true);
        return true;
      }
    }

    return false;
  } catch (error) {
    return false;
  }
};

// Clear auth state (no redirect - let the layout handle it)
const handleAuthError = async (): Promise<boolean> => {
  // If already refreshing, just return false
  if (isRefreshingAuth) {
    return false;
  }

  isRefreshingAuth = true;

  // First try to refresh the token
  const tokenRefreshed = await tryRefreshToken();

  if (tokenRefreshed) {
    // Token refresh successful
    isRefreshingAuth = false;
    processRequestQueue();
    return true;
  }

  // Token refresh failed, now show auth popup
  isAuthenticatedCache = false;

  // Show auth popup if registered
  if (authPopupCallback) {
    return new Promise((resolve) => {
      authPopupCallback!({
        title: "Session Expired",
        description: "Your session has expired. Please sign in again to continue.",
        onSuccess: () => {
          // Auth successful, retry queued requests
          isRefreshingAuth = false;
          isAuthenticatedCache = true;
          processRequestQueue();
          resolve(true);
        },
        onClose: () => {
          // Auth cancelled, fail queued requests
          isRefreshingAuth = false;
          failRequestQueue();
          resolve(false);
        }
      });
    });
  }

  isRefreshingAuth = false;
  return false;
};

// Process queued requests after successful re-auth
const processRequestQueue = async (): Promise<void> => {
  const queue = [...requestQueue];
  requestQueue = [];

  for (const request of queue) {
    try {
      const response = await secureApiCall(
        request.endpoint,
        request.options,
        request.requireAuth,
        0, // Reset retry count for queued requests
        3  // Standard max retries
      );
      request.resolve(response);
    } catch (error) {
      request.reject(error);
    }
  }
};

// Fail all queued requests
const failRequestQueue = (): void => {
  const queue = [...requestQueue];
  requestQueue = [];

  for (const request of queue) {
    request.reject(new Error('Authentication failed'));
  }
};

// Enhanced API call wrapper with session recovery and exponential backoff
export const secureApiCall = async (
  endpoint: string,
  options: RequestInit = {},
  requireAuth: boolean = true,
  retryCount: number = 0,
  maxRetries: number = 3
): Promise<Response> => {
  // Always use relative URLs - goes through Next.js API routes
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Add CSRF token for state-changing requests
  const method = options.method?.toUpperCase() || 'GET';
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const csrfToken = getCookie('csrf_token');
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // CRITICAL: Send cookies with request
    });

    // Handle rate limiting with exponential backoff
    if (response.status === 429 && retryCount < maxRetries) {
      const retryAfter = response.headers.get('retry-after');
      const backoffDelay = retryAfter ?
        parseInt(retryAfter) * 1000 :
        Math.min(1000 * Math.pow(2, retryCount), 10000); // Cap at 10 seconds

      console.warn(`[API] Rate limited on ${endpoint}, retrying after ${backoffDelay}ms (attempt ${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
      return secureApiCall(endpoint, options, requireAuth, retryCount + 1, maxRetries);
    }

    // Handle authentication errors with session recovery
    if (response.status === 401 && requireAuth && retryCount === 0) {
      // If already refreshing, queue this request
      if (isRefreshingAuth) {
        return new Promise((resolve, reject) => {
          requestQueue.push({
            resolve,
            reject,
            endpoint,
            options,
            requireAuth
          });
        });
      }

      // Try to refresh authentication
      const authRestored = await handleAuthError();

      if (authRestored) {
        // Wait for cookies to propagate after refresh (critical for Crown Vault endpoints)
        // The browser needs time to process Set-Cookie headers from the refresh response
        // Especially important with httpOnly cookies that can't be accessed by JavaScript
        await new Promise(resolve => setTimeout(resolve, 750));
        return secureApiCall(endpoint, options, requireAuth, 1, maxRetries);
      } else {
        throw new Error('Authentication required');
      }
    }

    // Handle 500 errors with exponential backoff (backend session corruption)
    if (response.status === 500 && retryCount < maxRetries) {
      // Check if this is the specific "user_context" error from backend
      try {
        const errorText = await response.clone().text();
        if (errorText.includes('user_context') || errorText.includes('State') || response.status === 500) {
          // Backend session corruption - wait with exponential backoff
          const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 5000); // Cap at 5 seconds
          await new Promise(resolve => setTimeout(resolve, backoffDelay));

          // Retry the request
          return secureApiCall(endpoint, options, requireAuth, retryCount + 1, maxRetries);
        }
      } catch {
        // If we can't read the error, still try backoff for 500 errors
        const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 5000);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        return secureApiCall(endpoint, options, requireAuth, retryCount + 1, maxRetries);
      }
    }

    return response;
  } catch (error) {
    // Network errors - retry with exponential backoff
    if (retryCount < maxRetries && !error.message.includes('Authentication')) {
      const backoffDelay = Math.min(500 * Math.pow(2, retryCount), 3000); // Start smaller for network errors
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
      return secureApiCall(endpoint, options, requireAuth, retryCount + 1, maxRetries);
    }

    if (error instanceof Error && error.message.includes('Authentication')) {
      throw error;
    }
    throw new Error('Network request failed after retries');
  }
};

// Simple in-memory cache for GET requests
const apiCache = new Map<string, { data: any; timestamp: number; duration: number }>();

// Request deduplication to prevent multiple parallel requests
const pendingRequests = new Map<string, Promise<any>>();

// Clear expired cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of apiCache) {
    if (now - entry.timestamp > entry.duration) {
      apiCache.delete(key);
    }
  }
}, 60000); // Clean every minute

// Determine cache type based on endpoint
function getCacheType(endpoint: string): keyof typeof CachePolicyService.POLICIES | null {
  if (endpoint.includes('/intelligence') || endpoint.includes('/hnwi') || endpoint.includes('/developments')) {
    return 'INTELLIGENCE_BRIEF'
  }
  if (endpoint.includes('/crown-vault')) {
    return 'CROWN_VAULT'
  }
  if (endpoint.includes('/opportunities')) {
    return 'OPPORTUNITIES'
  }
  if (endpoint.includes('/rohith')) {
    return 'ROHITH_MESSAGES'
  }
  if (endpoint.includes('/social') || endpoint.includes('/events')) {
    return 'SOCIAL_EVENTS'
  }
  if (endpoint.includes('/profile') || endpoint.includes('/preferences')) {
    return 'USER_PREFERENCES'
  }
  return null
}

// Simplified secure API methods
export const secureApi = {
  async get(endpoint: string, requireAuth: boolean = true, options?: {
    enableCache?: boolean;
    cacheDuration?: number;
    intelligentCache?: boolean;
  }): Promise<any> {
    const { enableCache = false, cacheDuration = 300000, intelligentCache = true } = options || {};

    // Request deduplication - prevent multiple parallel requests to the same endpoint
    const requestKey = `GET:${endpoint}`;
    if (pendingRequests.has(requestKey)) {
      return pendingRequests.get(requestKey);
    }

    // Use intelligent caching if enabled - but go through secureApiCall for auth handling
    if (intelligentCache) {
      const cacheType = getCacheType(endpoint)
      if (cacheType) {
        try {
          // Use secureApiCall to ensure proper auth handling
          const response = await secureApiCall(endpoint, { method: 'GET' }, requireAuth)

          if (!response.ok) {
            // Extract error details from response body before throwing
            let errorDetail;
            try {
              errorDetail = await response.json();
            } catch {
              errorDetail = { error: `Request failed with status ${response.status}` };
            }

            // Throw error with full details from backend
            const error = new Error(`Request failed with status ${response.status}`);
            (error as any).status = response.status;
            (error as any).detail = errorDetail;
            (error as any).response = { status: response.status, data: errorDetail };
            throw error;
          }

          return await response.json()
        } catch (error) {
          // Fallback to standard API call
        }
      }
    }

    // Create and store the request promise
    const requestPromise = (async () => {
      try {
        // Fallback to original caching logic
        if (enableCache) {
          const cacheKey = `${endpoint}`;
          const cached = apiCache.get(cacheKey);
          if (cached && (Date.now() - cached.timestamp) < cached.duration) {
            return cached.data;
          }
        }

        const response = await secureApiCall(endpoint, { method: 'GET' }, requireAuth);

        if (!response.ok) {
          // Extract error details from response body before throwing
          let errorDetail;
          try {
            errorDetail = await response.json();
          } catch {
            errorDetail = { error: `Request failed with status ${response.status}` };
          }

          // Throw error with full details from backend
          const error = new Error(`Request failed with status ${response.status}`);
          (error as any).status = response.status;
          (error as any).detail = errorDetail;
          (error as any).response = { status: response.status, data: errorDetail };
          throw error;
        }

        const data = await response.json();

        // Store in cache if enabled
        if (enableCache) {
          const cacheKey = `${endpoint}`;
          apiCache.set(cacheKey, {
            data,
            timestamp: Date.now(),
            duration: cacheDuration
          });
        }

        return data;
      } finally {
        // Clean up pending request
        pendingRequests.delete(requestKey);
      }
    })();

    pendingRequests.set(requestKey, requestPromise);
    return requestPromise;
  },

  async post(endpoint: string, data: any, requireAuth: boolean = true, options?: { enableCache?: boolean }): Promise<any> {
    // POST methods typically don't use cache, but support it for compatibility
    const response = await secureApiCall(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify(data)
      },
      requireAuth
    );

    // Special handling for auth endpoints
    if (endpoint.includes('/api/auth/')) {
      try {
        const responseData = await response.json();

        // Update auth state based on response
        if (response.ok && (endpoint.includes('login') || endpoint.includes('verify'))) {
          setAuthState(true);
        } else if (endpoint.includes('logout')) {
          setAuthState(false);
        }

        return responseData;
      } catch (error) {
        return { error: 'Failed to parse response', status: response.status };
      }
    }

    if (!response.ok) {
      // Extract error details from response body before throwing
      let errorDetail;
      try {
        errorDetail = await response.json();
      } catch {
        errorDetail = { error: `Request failed with status ${response.status}` };
      }

      // Throw error with full details from backend
      const error = new Error(`Request failed with status ${response.status}`);
      (error as any).status = response.status;
      (error as any).detail = errorDetail;
      (error as any).response = { status: response.status, data: errorDetail };
      throw error;
    }

    return await response.json();
  },

  async put(endpoint: string, data: any, requireAuth: boolean = true, options?: { enableCache?: boolean }): Promise<any> {
    // PUT methods typically don't use cache, but support it for compatibility
    const response = await secureApiCall(
      endpoint,
      {
        method: 'PUT',
        body: JSON.stringify(data)
      },
      requireAuth
    );

    if (!response.ok) {
      // Extract error details from response body before throwing
      let errorDetail;
      try {
        errorDetail = await response.json();
      } catch {
        errorDetail = { error: `Request failed with status ${response.status}` };
      }

      // Throw error with full details from backend
      const error = new Error(`Request failed with status ${response.status}`);
      (error as any).status = response.status;
      (error as any).detail = errorDetail;
      (error as any).response = { status: response.status, data: errorDetail };
      throw error;
    }

    return await response.json();
  },

  async delete(endpoint: string, requireAuth: boolean = true, options?: { enableCache?: boolean }): Promise<any> {
    // DELETE methods typically don't use cache, but support it for compatibility
    const response = await secureApiCall(endpoint, { method: 'DELETE' }, requireAuth);

    if (!response.ok) {
      // Extract error details from response body before throwing
      let errorDetail;
      try {
        errorDetail = await response.json();
      } catch {
        errorDetail = { error: `Request failed with status ${response.status}` };
      }

      // Throw error with full details from backend
      const error = new Error(`Request failed with status ${response.status}`);
      (error as any).status = response.status;
      (error as any).detail = errorDetail;
      (error as any).response = { status: response.status, data: errorDetail };
      throw error;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return { success: true };
  }
};

// Token refresh function (exported for external use)
export const refreshToken = async (): Promise<boolean> => {
  return tryRefreshToken();
};

// Session management functions (no tokens!)
export const checkSession = async (): Promise<any> => {
  try {
    const response = await secureApi.get('/api/auth/session', true);
    setAuthState(true);
    return response;
  } catch (error) {
    setAuthState(false);
    return null;
  }
};

export const loginUser = (userData: any): void => {
  // Store only non-sensitive user data in memory/sessionStorage
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('userEmail', userData.email || '');
    sessionStorage.setItem('userId', userData.id || userData.user_id || '');
    sessionStorage.setItem('userObject', JSON.stringify(userData));

    // Emit login event
    window.dispatchEvent(new CustomEvent('auth:login', {
      detail: { user: userData }
    }));
  }

  // Mark as authenticated
  setAuthState(true);
};

export const logoutUser = async (): Promise<void> => {
  try {
    // Call logout endpoint to clear cookies
    await secureApi.post('/api/auth/logout', {}, true);
  } catch (error) {
    // Logout request failed;
  }

  // Clear client state
  setAuthState(false);

  if (typeof window !== 'undefined') {
    sessionStorage.clear();

    // Clear legacy localStorage (migration cleanup)
    // Cookies handle auth - no token removal needed
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userObject');

    window.dispatchEvent(new CustomEvent('auth:logout'));
  }
};

export const getCurrentUser = (): any | null => {
  if (typeof window === 'undefined') return null;

  const userObject = sessionStorage.getItem('userObject');
  if (userObject) {
    try {
      return JSON.parse(userObject);
    } catch (error) {
      return null;
    }
  }
  return null;
};

export const getCurrentUserId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('userId');
};

// Refresh token function
export const refreshAuthToken = async (): Promise<any> => {
  try {
    const response = await fetch(`/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCookie('csrf_token') || '',
      },
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      setAuthState(true);
      return data;
    }

    setAuthState(false);
    return null;
  } catch (error) {
    setAuthState(false);
    // Failed to refresh token;
    return null;
  }
};

// Server-side API removed - all calls go through client-side secureApi
// which uses relative URLs to Next.js API routes
// Backend URL is never exposed to the client
export const serverSecureApi = {
  async get(endpoint: string, cookies?: string): Promise<any> {
    // Always use relative URLs - goes through Next.js API routes
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (cookies) {
      headers['Cookie'] = cookies;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return await response.json();
  },

  async post(endpoint: string, data: any, cookies?: string): Promise<any> {
    // Always use relative URLs - goes through Next.js API routes
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (cookies) {
      headers['Cookie'] = cookies;
    }

    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers,
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return await response.json();
  },

  async put(endpoint: string, data: any, cookies?: string): Promise<any> {
    // Always use relative URLs - goes through Next.js API routes
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (cookies) {
      headers['Cookie'] = cookies;
    }

    const response = await fetch(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers,
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return await response.json();
  },

  async delete(endpoint: string, cookies?: string): Promise<any> {
    // Always use relative URLs - goes through Next.js API routes
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (cookies) {
      headers['Cookie'] = cookies;
    }

    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return { success: true };
  }
};

// Cache control (simplified - no token management needed)
export const CacheControl = {
  clear: () => {}, // No-op
  delete: (key: string) => {}, // No-op
  clearUserData: (userId: string) => {}, // No-op
  async refreshUserData(userId: string, apiClient: any): Promise<any> {
    return {
      assets: [],
      heirs: [],
      stats: null
    };
  }
};

// Backward compatibility exports
export const getAuthToken = () => null; // Tokens are in httpOnly cookies now
export const setAuthToken = () => {}; // No-op
export const clearAuthToken = () => logoutUser(); // Redirect to logout
export const getAuthenticatedUser = getCurrentUser;
export const getAuthenticatedUserId = getCurrentUserId;
export const isUserAuthenticated = isAuthenticated;

// Export default
export default secureApi;