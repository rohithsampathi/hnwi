// lib/auth-utils.ts - Enhanced authentication utility functions with session state management
// Layer 4: Auth Utilities - Uses ONLY auth-manager (no circular deps)

import DeviceTrustManager from './device-trust';
import { 
  getCurrentUser as getAuthManagerUser, 
  getCurrentUserId as getAuthManagerUserId, 
  getAuthToken as getAuthManagerToken,
  isAuthenticated as isAuthManagerAuthenticated,
  authManager
} from '@/lib/auth-manager';

// Session states for smart inactivity management
export enum SessionState {
  AUTHENTICATED = 'authenticated',           // User is active and authenticated
  LOCKED_INACTIVE = 'locked_inactive',       // Session locked due to inactivity, data preserved
  EXPIRED = 'expired',                       // Session expired (24h server timeout)
  INVALID = 'invalid',                       // Invalid/corrupted session
  UNAUTHENTICATED = 'unauthenticated'       // No session
}

interface SessionInfo {
  state: SessionState;
  token: string | null;
  lockedAt?: number;
  lastActivity?: number;
}

// Session state storage key
const SESSION_STATE_KEY = 'hnwi_session_state';
const LAST_ACTIVITY_KEY = 'hnwi_last_activity';
const LOCKED_AT_KEY = 'hnwi_locked_at';

export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  
  try {
    // Decode JWT payload (second part of token)
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const payload = JSON.parse(atob(parts[1]));
    
    // Check if token has expired
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
};

export const getValidToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // Use auth manager to get token
  const token = getAuthManagerToken();
  return isTokenValid(token) ? token : null;
};

export const clearInvalidToken = (): void => {
  if (typeof window === 'undefined') return;
  
  // Use auth manager to check token
  const token = getAuthManagerToken();
  if (token && !isTokenValid(token)) {
    // Token is invalid, use auth manager to logout
    authManager.logout();
  }
};

// Get current session state
export const getSessionState = (): SessionState => {
  if (typeof window === 'undefined') return SessionState.UNAUTHENTICATED;
  
  try {
    const storedState = localStorage.getItem(SESSION_STATE_KEY) as SessionState;
    const token = getValidToken();
    
    // If no token, always unauthenticated
    if (!token) {
      try {
        if (storedState && storedState !== SessionState.UNAUTHENTICATED) {
          setSessionState(SessionState.UNAUTHENTICATED);
        }
      } catch {
        // Ignore setSessionState errors
      }
      return SessionState.UNAUTHENTICATED;
    }
    
    // If token is invalid/expired, mark as expired
    if (!isTokenValid(token)) {
      try {
        setSessionState(SessionState.EXPIRED);
      } catch {
        // Ignore setSessionState errors
      }
      return SessionState.EXPIRED;
    }
    
    // If we have a valid token but no stored state, set as authenticated
    if (!storedState) {
      try {
        setSessionState(SessionState.AUTHENTICATED);
      } catch {
        // Ignore setSessionState errors
      }
      return SessionState.AUTHENTICATED;
    }
    
    // Return stored state or default to authenticated
    return storedState || SessionState.AUTHENTICATED;
  } catch (error) {
    // If anything fails, fall back to simple token-based check
    try {
      const token = getValidToken();
      return token ? SessionState.AUTHENTICATED : SessionState.UNAUTHENTICATED;
    } catch {
      return SessionState.UNAUTHENTICATED;
    }
  }
};

// Set session state with race condition protection
export const setSessionState = (state: SessionState): void => {
  if (typeof window === 'undefined') return;
  
  // Race condition protection: Don't allow setting to unauthenticated if we have a valid token
  if (state === SessionState.UNAUTHENTICATED) {
    const currentToken = getValidToken();
    if (currentToken && isTokenValid(currentToken)) {
      // We have a valid token, so we shouldn't be unauthenticated
      // This might be a race condition - set to authenticated instead
      state = SessionState.AUTHENTICATED;
    }
  }
  
  // Race condition protection: Don't lock if session was just unlocked
  if (state === SessionState.LOCKED_INACTIVE) {
    const currentState = localStorage.getItem(SESSION_STATE_KEY) as SessionState;
    const lastActivity = getLastActivity();
    const timeSinceLastActivity = Date.now() - lastActivity;
    
    // If user was just active (within last 30 seconds), don't lock
    if (currentState === SessionState.AUTHENTICATED && timeSinceLastActivity < 30000) {
      return; // Don't lock the session
    }
  }
  
  localStorage.setItem(SESSION_STATE_KEY, state);
  
  // Track when session was locked for timeout purposes
  if (state === SessionState.LOCKED_INACTIVE) {
    localStorage.setItem(LOCKED_AT_KEY, Date.now().toString());
  } else if (state === SessionState.AUTHENTICATED) {
    // Clear locked timestamp when session becomes active again
    localStorage.removeItem(LOCKED_AT_KEY);
    updateLastActivity();
  }
};

// Update last activity timestamp
export const updateLastActivity = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
};

// Get last activity timestamp
export const getLastActivity = (): number => {
  if (typeof window === 'undefined') return Date.now();
  const stored = localStorage.getItem(LAST_ACTIVITY_KEY);
  return stored ? parseInt(stored) : Date.now();
};

// Get when session was locked
export const getLockedAt = (): number | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(LOCKED_AT_KEY);
  return stored ? parseInt(stored) : null;
};

// Check if session is locked due to inactivity
export const isSessionLocked = (): boolean => {
  return getSessionState() === SessionState.LOCKED_INACTIVE;
};

// Legacy function - now uses auth manager for authentication check
export const isAuthenticated = (): boolean => {
  try {
    // Use auth manager's authentication check
    return isAuthManagerAuthenticated();
  } catch (error) {
    // If checking fails, fall back to token validation
    try {
      return !!getValidToken();
    } catch {
      return false;
    }
  }
};

// New function to check if user can access features (not locked)
export const canAccessFeatures = (): boolean => {
  return getSessionState() === SessionState.AUTHENTICATED;
};

// Get comprehensive session info
export const getSessionInfo = (): SessionInfo => {
  return {
    state: getSessionState(),
    token: getValidToken(),
    lockedAt: getLockedAt(),
    lastActivity: getLastActivity()
  };
};

// Clear all session state (for logout)
export const clearSessionState = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(SESSION_STATE_KEY);
  localStorage.removeItem(LAST_ACTIVITY_KEY);
  localStorage.removeItem(LOCKED_AT_KEY);
  localStorage.removeItem('token');
};

// ROLLBACK FUNCTION: Disable smart inactivity and revert to old behavior
export const enableLegacySessionMode = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('hnwi_legacy_session_mode', 'true');
};

// Check if legacy mode is enabled
export const isLegacySessionMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('hnwi_legacy_session_mode') === 'true';
};

// Disable legacy mode
export const disableLegacySessionMode = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('hnwi_legacy_session_mode');
};

// Get session state with legacy fallback
export const getSessionStateWithFallback = (): SessionState => {
  if (isLegacySessionMode()) {
    // In legacy mode, just check if token exists
    const token = getValidToken();
    return token ? SessionState.AUTHENTICATED : SessionState.UNAUTHENTICATED;
  }
  
  return getSessionState();
};

// Check if can access features with legacy fallback
export const canAccessFeaturesWithFallback = (): boolean => {
  try {
    if (isLegacySessionMode()) {
      // In legacy mode, just check token validity
      return !!getValidToken();
    }
    
    // For notifications, we should allow access if user is authenticated (even if locked)
    // since notifications don't require active interaction
    return isAuthenticated();
  } catch (error) {
    // If there's any error in session checking, fall back to simple token check
    try {
      return !!getValidToken();
    } catch {
      return false;
    }
  }
};

// Device Trust Integration
export const isDeviceTrusted = (): boolean => {
  if (typeof window === 'undefined') return false;
  const userId = getAuthManagerUserId();
  if (!userId) return false;
  
  return DeviceTrustManager.isDeviceTrusted(userId);
};

export const trustCurrentDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  const userId = getAuthManagerUserId();
  if (!userId) return false;
  
  try {
    DeviceTrustManager.trustDevice(userId);
    return true;
  } catch (error) {
    return false;
  }
};

export const shouldSkip2FA = (): boolean => {
  if (typeof window === 'undefined') return false;
  const userId = getAuthManagerUserId();
  if (!userId) return false;
  
  return DeviceTrustManager.shouldSkip2FA(userId);
};

export const getDeviceTrustInfo = (): { isTrusted: boolean; timeRemaining: string } => {
  if (typeof window === 'undefined') return { isTrusted: false, timeRemaining: '' };
  const userId = getAuthManagerUserId();
  if (!userId) return { isTrusted: false, timeRemaining: '' };
  
  return {
    isTrusted: DeviceTrustManager.isDeviceTrusted(userId),
    timeRemaining: DeviceTrustManager.getTrustTimeRemainingText(userId)
  };
};

// Enhanced authentication with device trust
export const isAuthenticatedWithDeviceTrust = (): {
  isAuthenticated: boolean;
  isDeviceTrusted: boolean;
  needsReauth: boolean;
} => {
  const authenticated = isAuthenticated();
  const deviceTrusted = isDeviceTrusted();
  const sessionState = getSessionState();
  
  return {
    isAuthenticated: authenticated,
    isDeviceTrusted: deviceTrusted,
    needsReauth: sessionState === SessionState.LOCKED_INACTIVE && !deviceTrusted
  };
};

// Get current user from centralized auth manager
export const getCurrentUser = (): { userId: string; token: string } | null => {
  if (typeof window === 'undefined') return null;
  
  const token = getValidToken();
  const userId = getAuthManagerUserId();
  
  if (!token || !userId) {
    return null;
  }
  
  return { userId, token };
};

// Get user object from centralized auth manager
export const getCurrentUserObject = (): any | null => {
  if (typeof window === 'undefined') return null;
  
  return getAuthManagerUser();
};