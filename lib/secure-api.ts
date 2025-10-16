// lib/secure-api.ts
// Cookie-Based Secure API Handler - SOTA httpOnly Cookie Authentication
// No tokens in JavaScript = XSS-proof authentication
// All requests go through Next.js API routes - backend URL never exposed to client

import { EnhancedCacheService } from './services/enhanced-cache-service'
import { CachePolicyService } from './services/cache-policy-service'
import { authManager } from './auth-manager'
import { pwaStorage } from './storage/pwa-storage'

export interface StepUpDeliveryInfo {
  method?: string;
  channel?: string;
  channel_label?: string;
  sent?: boolean;
  address?: string;
  [key: string]: unknown;
}

export interface StepUpChallengeInfo {
  mfaToken: string;
  expiresInSeconds?: number;
  delivery?: StepUpDeliveryInfo;
}

export interface StepUpHandlerPayload {
  endpoint: string;
  method: string;
  requireAuth: boolean;
  reason?: string;
  challenge?: StepUpChallengeInfo;
  risk?: Record<string, unknown>;
  safePayload?: Record<string, unknown> | null;
}

export interface StepUpHandlerResult {
  status: 'verified' | 'retry' | 'cancelled' | 'failed';
  error?: string;
}

type StepUpHandler = (payload: StepUpHandlerPayload) => Promise<StepUpHandlerResult>;

// Helper to read CSRF token from cookie (only CSRF is readable)
const csrfCookieNames = ['csrf_token', '__Secure-csrf_token', '__Host-csrf_token'];

const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  const escaped = name.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
  const match = document.cookie.match(new RegExp('(?:^|; )' + escaped + '=([^;]+)'));
  return match ? decodeURIComponent(match[1]) : null;
};

const readCsrfToken = (): string | null => {
  for (const name of csrfCookieNames) {
    const value = getCookie(name);
    if (value) {
      try {
        // Cookie contains base64-encoded JSON: { token, timestamp, userAgent }
        const tokenData = JSON.parse(atob(value));

        // Verify token hasn't expired (1 hour)
        const now = Date.now();
        if (tokenData.timestamp && (now - tokenData.timestamp) > 3600000) {
          continue; // Try next cookie
        }

        return tokenData.token;
      } catch {
        // If decoding fails, return raw value for backwards compatibility
        return value;
      }
    }
  }
  return null;
};

let pendingCsrfRefresh: Promise<string | null> | null = null;

const ensureCsrfToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined') {
    return null;
  }

  const existing = readCsrfToken();
  if (existing) {
    return existing;
  }

  if (!pendingCsrfRefresh) {
    pendingCsrfRefresh = (async () => {
      try {
        const response = await fetch('/api/auth/csrf-token', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          return null;
        }

        const data = await parseJsonSafely(response);
        const tokenFromResponse = (data && typeof data === 'object' && data.csrfToken) ? data.csrfToken as string : null;

        // CRITICAL FIX: Browser cookie storage is asynchronous
        // Wait 200ms for Set-Cookie header to be processed by browser
        // Then retry reading with exponential backoff
        await new Promise(resolve => setTimeout(resolve, 200));

        // Retry reading cookie up to 3 times with increasing delays
        for (let attempt = 0; attempt < 3; attempt++) {
          const token = readCsrfToken();
          if (token) {
            return token;
          }
          // Exponential backoff: 100ms, 200ms, 400ms
          if (attempt < 2) {
            await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt)));
          }
        }

        // Fallback: return token from response if cookie still not accessible
        return tokenFromResponse;
      } catch {
        return null;
      } finally {
        pendingCsrfRefresh = null;
      }
    })();
  }

  return pendingCsrfRefresh;
};

const buildCsrfHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const csrfToken = readCsrfToken();
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }
  return headers;
};

const sanitizeZeroTrustPayload = (payload: any): Record<string, unknown> | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  try {
    const clone = JSON.parse(JSON.stringify(payload)) as Record<string, unknown>;
    const challenge = (clone as any)?.challenge;
    if (challenge && typeof challenge === 'object') {
      if ('mfa_token' in challenge) {
        (challenge as Record<string, unknown>).mfa_token = '[REDACTED]';
      }
      const delivery = (challenge as any).delivery;
      if (delivery && typeof delivery === 'object' && 'address' in delivery) {
        (delivery as Record<string, unknown>).address = '[REDACTED]';
      }
    }
    return clone;
  } catch {
    return null;
  }
};

const parseJsonSafely = async (response: Response): Promise<any> => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const isZeroTrustResponse = (payload: any): boolean => {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  return Boolean(
    payload.requires_step_up ||
    payload.step_up_required ||
    payload.error === 'ZERO_TRUST_BLOCKED' ||
    payload.code === 'ZERO_TRUST_BLOCKED'
  );
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
let stepUpChallengeHandler: StepUpHandler | null = null;

// Register auth popup callback (called from AuthPopupProvider)
export const registerAuthPopupCallback = (callback: (options?: any) => void): void => {
  authPopupCallback = callback;
};

// Register zero-trust step up handler (called from StepUpMfaProvider)
export const registerStepUpChallengeHandler = (handler: StepUpHandler | null): void => {
  stepUpChallengeHandler = handler;
};

export interface StepUpActionResult<T = any> {
  success: boolean;
  status: number;
  data: T | null;
  message?: string;
}

export const submitStepUpVerification = async (
  payload: { mfaToken: string; code: string }
): Promise<StepUpActionResult> => {
  const csrfToken = await ensureCsrfToken();
  const response = await fetch('/api/auth/mfa/verify', {
    method: 'POST',
    headers: buildCsrfHeaders(),
    credentials: 'include',
    body: JSON.stringify({
      mfa_token: payload.mfaToken,
      mfa_code: payload.code,
      context: 'step_up'
    })
  });

  const data = await parseJsonSafely(response);
  if (!response.ok) {
    return {
      success: false,
      status: response.status,
      data,
      message: data?.error || 'Verification failed'
    };
  }

  if (data && typeof data === 'object' && data.success === false) {
    return {
      success: false,
      status: response.status,
      data,
      message: data.error || 'Verification failed'
    };
  }

  return {
    success: true,
    status: response.status,
    data,
    message: data?.message
  };
};

export const resendStepUpChallenge = async (
  payload: { mfaToken: string }
): Promise<StepUpActionResult> => {
  const csrfToken = await ensureCsrfToken();
  const response = await fetch('/api/auth/mfa/resend', {
    method: 'POST',
    headers: buildCsrfHeaders(),
    credentials: 'include',
    body: JSON.stringify({
      sessionToken: payload.mfaToken,
      context: 'step_up'
    })
  });

  const data = await parseJsonSafely(response);
  if (!response.ok) {
    return {
      success: false,
      status: response.status,
      data,
      message: data?.error || 'Failed to resend verification code'
    };
  }

  if (data && typeof data === 'object' && data.success === false) {
    return {
      success: false,
      status: response.status,
      data,
      message: data.error || 'Failed to resend verification code'
    };
  }

  return {
    success: true,
    status: response.status,
    data,
    message: data?.message
  };
};

export const getClientCsrfToken = (): string | null => readCsrfToken();
export const ensureClientCsrfToken = async (): Promise<string | null> => ensureCsrfToken();

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

  // Wait for cookies to propagate before processing ALL queued requests
  // This ensures all queued requests have access to the refreshed tokens
  // Critical for Crown Vault and other sensitive endpoints
  await new Promise(resolve => setTimeout(resolve, 750));

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

// Enhanced API call wrapper with session recovery
//
// Retry Strategy:
// - 429 Rate Limit: Retry up to 3 times with exponential backoff
// - 401 Unauthorized: Attempt reauth ONCE, then retry request ONCE
// - 403 Forbidden (non-zero-trust): Attempt reauth ONCE, then retry request ONCE
// - 403 Forbidden (zero-trust): Handled by step-up MFA flow
// - 500 Server Error: NO RETRY - these are backend bugs
// - Network Errors: Retry up to 3 times with exponential backoff
export const secureApiCall = async (
  endpoint: string,
  options: RequestInit = {},
  requireAuth: boolean = true,
  retryCount: number = 0,
  maxRetries: number = 3
): Promise<Response> => {
  // Always use relative URLs - goes through Next.js API routes
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // Add CSRF token for state-changing requests
  const method = options.method?.toUpperCase() || 'GET';
  let csrfToken: string | null = null;
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    csrfToken = readCsrfToken();
    if (!csrfToken) {
      csrfToken = await ensureCsrfToken();
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // CRITICAL: Send cookies with request
    });

    // Handle rate limiting with exponential backoff (retry up to maxRetries)
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
        // Auth restoration failed - user cancelled or no auth popup available
        // Clear state and redirect
        console.error(`[API] 401 Unauthorized on ${endpoint} - auth restoration failed`);
        setAuthState(false);

        // Clear user session data
        if (typeof window !== 'undefined') {
          pwaStorage.clear();

          // If no auth popup showed, redirect to login
          if (!authPopupCallback) {
            window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.pathname);
          }
        }

        throw new Error('Authentication required');
      }
    }

    // Handle 403 Forbidden errors
    if (response.status === 403 && requireAuth) {
      const detail = await parseJsonSafely(response.clone());

      // Check if this is a zero-trust step-up challenge
      if (isZeroTrustResponse(detail)) {
        if (!stepUpChallengeHandler) {
          const fallbackMessage = detail?.message || detail?.error || 'Additional verification required';
          throw new Error(fallbackMessage);
        }

        const challengePayload = detail?.challenge;
        const challengeInfo: StepUpChallengeInfo | undefined =
          challengePayload && typeof challengePayload === 'object' && challengePayload?.mfa_token
            ? {
                mfaToken: challengePayload.mfa_token as string,
                expiresInSeconds: challengePayload.expires_in_seconds as number | undefined,
                delivery: challengePayload.delivery as StepUpDeliveryInfo | undefined
              }
            : undefined;

        const handlerResult = await stepUpChallengeHandler({
          endpoint,
          method,
          requireAuth,
          reason: detail?.message || detail?.error,
          challenge: challengeInfo,
          risk: (detail?.risk || detail?.telemetry || null) ?? undefined,
          safePayload: sanitizeZeroTrustPayload(detail)
        });

        if (handlerResult?.status === 'verified' || handlerResult?.status === 'retry') {
          // Give a brief moment for verification cookies/state to propagate
          await new Promise(resolve => setTimeout(resolve, 200));
          return secureApiCall(endpoint, options, requireAuth, retryCount + 1, maxRetries);
        }

        const errorMessage = handlerResult?.error || detail?.message || detail?.error || 'Verification cancelled';
        throw new Error(errorMessage);
      }

      // Not a zero-trust challenge - treat as regular auth failure (CSRF, expired session, etc.)
      // Only attempt reauth ONCE (when retryCount === 0)
      if (retryCount === 0) {
        console.warn(`[API] 403 Forbidden on ${endpoint}, attempting reauth (will not retry again)...`);

        // Try to refresh authentication
        const authRestored = await handleAuthError();

        if (authRestored) {
          // Wait for cookies and CSRF token to propagate
          await new Promise(resolve => setTimeout(resolve, 750));
          // Retry with retryCount=1 to prevent infinite loops
          return secureApiCall(endpoint, options, requireAuth, 1, maxRetries);
        } else {
          throw new Error('Access forbidden - authentication required');
        }
      }

      // If retryCount > 0, we already tried reauth - don't retry again
      // Clear auth state and redirect to login
      console.error(`[API] 403 Forbidden on ${endpoint} after reauth attempt - redirecting to auth`);
      setAuthState(false);

      // Clear user session data
      if (typeof window !== 'undefined') {
        pwaStorage.clear();
      }

      // Show auth popup if available, otherwise redirect
      if (authPopupCallback) {
        authPopupCallback({
          title: "Authentication Required",
          description: "Your session is no longer valid. Please sign in again to continue.",
          onSuccess: () => {
            setAuthState(true);
            // Reload the page to retry failed requests
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          },
          onClose: () => {
            // User cancelled - redirect to home
            if (typeof window !== 'undefined') {
              window.location.href = '/';
            }
          }
        });
      } else {
        // No popup handler - redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.pathname);
        }
      }

      throw new Error('Access forbidden - authentication required');
    }

    // DO NOT retry 500 errors - these are backend bugs that need fixing
    // Just return the response and let the caller handle it

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
  // Store only non-sensitive user data in PWA-compatible storage
  if (typeof window !== 'undefined') {
    pwaStorage.setItemSync('userEmail', userData.email || '');
    pwaStorage.setItemSync('userId', userData.id || userData.user_id || '');
    pwaStorage.setItemSync('userObject', JSON.stringify(userData));

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
    pwaStorage.clear();

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

  // Try pwaStorage first
  const userObject = pwaStorage.getItemSync('userObject');
  if (userObject) {
    try {
      return JSON.parse(userObject);
    } catch (error) {
      // Fall through to authManager fallback
    }
  }

  // CRITICAL FIX: Fallback to authManager if pwaStorage is empty
  // This handles cases where authManager.login() hasn't synced to pwaStorage yet
  const authManagerUser = authManager.getCurrentUser();
  if (authManagerUser) {
    // Sync to pwaStorage for future calls
    try {
      pwaStorage.setItemSync('userObject', JSON.stringify(authManagerUser));
      pwaStorage.setItemSync('userId', authManagerUser.id || authManagerUser.user_id || '');
      pwaStorage.setItemSync('userEmail', authManagerUser.email || '');
    } catch (error) {
      // Sync failed but we still have the user
    }
    return authManagerUser;
  }

  return null;
};

export const getCurrentUserId = (): string | null => {
  if (typeof window === 'undefined') return null;

  // Try pwaStorage first
  const userId = pwaStorage.getItemSync('userId');
  if (userId) return userId;

  // CRITICAL FIX: Fallback to authManager if pwaStorage is empty
  // This handles cases where authManager.login() hasn't synced to pwaStorage yet
  const authManagerUserId = authManager.getUserId();
  if (authManagerUserId) {
    // Sync to pwaStorage for future calls
    try {
      pwaStorage.setItemSync('userId', authManagerUserId);
      const authManagerUser = authManager.getCurrentUser();
      if (authManagerUser) {
        pwaStorage.setItemSync('userObject', JSON.stringify(authManagerUser));
        pwaStorage.setItemSync('userEmail', authManagerUser.email || '');
      }
    } catch (error) {
      // Sync failed but we still have the userId
    }
    return authManagerUserId;
  }

  return null;
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
