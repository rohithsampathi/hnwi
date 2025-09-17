// lib/secure-api.ts
// Cookie-Based Secure API Handler - SOTA httpOnly Cookie Authentication
// No tokens in JavaScript = XSS-proof authentication
// All requests go through Next.js API routes - backend URL never exposed to client

// Helper to read CSRF token from cookie (only CSRF is readable)
const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
};

// Check if user is authenticated (based on session check, not tokens)
let isAuthenticatedCache: boolean | null = null;

export const isAuthenticated = (): boolean => {
  // We can't check httpOnly cookies, so we track auth state
  return isAuthenticatedCache ?? false;
};

export const setAuthState = (authenticated: boolean): void => {
  isAuthenticatedCache = authenticated;
};

// Clear auth state and redirect
const handleAuthError = (): void => {
  isAuthenticatedCache = false;

  // Clear any client-side state
  if (typeof window !== 'undefined') {
    // Clear any legacy localStorage (migration cleanup)
    // Cookies handle auth - no token removal needed
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userObject');
    sessionStorage.clear();

    // Redirect to login
    window.location.href = '/';
  }
};

// Cookie-based API call wrapper
export const secureApiCall = async (
  endpoint: string,
  options: RequestInit = {},
  requireAuth: boolean = true
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

    // Handle authentication errors
    if (response.status === 401 && requireAuth) {
      // Try to refresh token automatically
      try {
        const refreshResponse = await fetch(`/api/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': getCookie('csrf_token') || '',
          },
          credentials: 'include',
        });

        if (refreshResponse.ok) {
          // Retry original request with new token
          return fetch(url, {
            ...options,
            headers,
            credentials: 'include',
          });
        }
      } catch (error) {
        // Refresh failed, clear auth
        handleAuthError();
        throw new Error('Authentication failed - session expired');
      }

      // If refresh didn't work, clear auth
      handleAuthError();
      throw new Error('Authentication failed - please login again');
    }

    return response;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Authentication')) {
      throw error;
    }
    throw new Error('Network request failed');
  }
};

// Simple in-memory cache for GET requests
const apiCache = new Map<string, { data: any; timestamp: number; duration: number }>();

// Clear expired cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of apiCache) {
    if (now - entry.timestamp > entry.duration) {
      apiCache.delete(key);
    }
  }
}, 60000); // Clean every minute

// Simplified secure API methods
export const secureApi = {
  async get(endpoint: string, requireAuth: boolean = true, options?: { enableCache?: boolean; cacheDuration?: number }): Promise<any> {
    const { enableCache = false, cacheDuration = 300000 } = options || {}; // Default 5 minutes

    // Check cache first if enabled
    if (enableCache) {
      const cacheKey = `${endpoint}`;
      const cached = apiCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < cached.duration) {
        return cached.data;
      }
    }

    const response = await secureApiCall(endpoint, { method: 'GET' }, requireAuth);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
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
      throw new Error(`Request failed with status ${response.status}`);
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
      throw new Error(`Request failed with status ${response.status}`);
    }

    return await response.json();
  },

  async delete(endpoint: string, requireAuth: boolean = true, options?: { enableCache?: boolean }): Promise<any> {
    // DELETE methods typically don't use cache, but support it for compatibility
    const response = await secureApiCall(endpoint, { method: 'DELETE' }, requireAuth);

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
    console.warn('Logout request failed:', error);
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
    console.warn('Failed to refresh token:', error);
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