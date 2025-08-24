// lib/auth-utils.ts - Enhanced authentication utility functions with session state management

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
    const payload = JSON.parse(atob(token.split('.')[1]));
    
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
  
  const token = localStorage.getItem('token');
  return isTokenValid(token) ? token : null;
};

export const clearInvalidToken = (): void => {
  if (typeof window === 'undefined') return;
  
  const token = localStorage.getItem('token');
  if (token && !isTokenValid(token)) {
    localStorage.removeItem('token');
  }
};

// Get current session state
export const getSessionState = (): SessionState => {
  if (typeof window === 'undefined') return SessionState.UNAUTHENTICATED;
  
  const storedState = localStorage.getItem(SESSION_STATE_KEY) as SessionState;
  const token = getValidToken();
  
  // If no token, always unauthenticated
  if (!token) {
    if (storedState && storedState !== SessionState.UNAUTHENTICATED) {
      setSessionState(SessionState.UNAUTHENTICATED);
    }
    return SessionState.UNAUTHENTICATED;
  }
  
  // If token is invalid/expired, mark as expired
  if (!isTokenValid(token)) {
    setSessionState(SessionState.EXPIRED);
    return SessionState.EXPIRED;
  }
  
  // Return stored state or default to authenticated
  return storedState || SessionState.AUTHENTICATED;
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

// Legacy function - now considers locked state as authenticated for token purposes
export const isAuthenticated = (): boolean => {
  const state = getSessionState();
  return state === SessionState.AUTHENTICATED || state === SessionState.LOCKED_INACTIVE;
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
  console.warn('HNWI: Legacy session mode enabled - smart inactivity disabled');
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
  if (isLegacySessionMode()) {
    // In legacy mode, just check token validity
    return !!getValidToken();
  }
  
  return canAccessFeatures();
};