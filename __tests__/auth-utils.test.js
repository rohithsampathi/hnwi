// __tests__/auth-utils.test.js
// Unit tests for smart inactivity session state management

// Mock localStorage for testing
const mockLocalStorage = {
  store: {},
  getItem: jest.fn((key) => mockLocalStorage.store[key] || null),
  setItem: jest.fn((key, value) => { mockLocalStorage.store[key] = value }),
  removeItem: jest.fn((key) => { delete mockLocalStorage.store[key] }),
  clear: jest.fn(() => { mockLocalStorage.store = {} })
};

// Mock window object
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Import the functions to test
const {
  SessionState,
  getSessionState,
  setSessionState,
  updateLastActivity,
  getLastActivity,
  isSessionLocked,
  canAccessFeatures,
  clearSessionState,
  enableLegacySessionMode,
  isLegacySessionMode,
  disableLegacySessionMode,
  getSessionStateWithFallback,
  canAccessFeaturesWithFallback
} = require('../lib/auth-utils');

describe('Smart Inactivity - Auth Utils', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  describe('SessionState Enum', () => {
    test('should have all required session states', () => {
      expect(SessionState.AUTHENTICATED).toBe('authenticated');
      expect(SessionState.LOCKED_INACTIVE).toBe('locked_inactive');
      expect(SessionState.EXPIRED).toBe('expired');
      expect(SessionState.INVALID).toBe('invalid');
      expect(SessionState.UNAUTHENTICATED).toBe('unauthenticated');
    });
  });

  describe('Session State Management', () => {
    test('should set and get session state correctly', () => {
      setSessionState(SessionState.AUTHENTICATED);
      expect(getSessionState()).toBe(SessionState.AUTHENTICATED);
      
      setSessionState(SessionState.LOCKED_INACTIVE);
      expect(getSessionState()).toBe(SessionState.LOCKED_INACTIVE);
    });

    test('should default to UNAUTHENTICATED when no token exists', () => {
      // No token in localStorage
      expect(getSessionState()).toBe(SessionState.UNAUTHENTICATED);
    });

    test('should track locked timestamp when session is locked', () => {
      const beforeLock = Date.now();
      setSessionState(SessionState.LOCKED_INACTIVE);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('hnwi_locked_at', expect.any(String));
      const lockedAt = parseInt(mockLocalStorage.store['hnwi_locked_at']);
      expect(lockedAt).toBeGreaterThanOrEqual(beforeLock);
    });

    test('should clear locked timestamp when session becomes authenticated', () => {
      // First lock the session
      setSessionState(SessionState.LOCKED_INACTIVE);
      expect(mockLocalStorage.store['hnwi_locked_at']).toBeDefined();
      
      // Then authenticate
      setSessionState(SessionState.AUTHENTICATED);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('hnwi_locked_at');
    });
  });

  describe('Activity Tracking', () => {
    test('should update last activity timestamp', () => {
      const beforeActivity = Date.now();
      updateLastActivity();
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('hnwi_last_activity', expect.any(String));
      const lastActivity = parseInt(mockLocalStorage.store['hnwi_last_activity']);
      expect(lastActivity).toBeGreaterThanOrEqual(beforeActivity);
    });

    test('should get last activity timestamp', () => {
      const testTime = '1640995200000'; // Test timestamp
      mockLocalStorage.store['hnwi_last_activity'] = testTime;
      
      expect(getLastActivity()).toBe(parseInt(testTime));
    });

    test('should return current time if no last activity stored', () => {
      const beforeCall = Date.now();
      const result = getLastActivity();
      const afterCall = Date.now();
      
      expect(result).toBeGreaterThanOrEqual(beforeCall);
      expect(result).toBeLessThanOrEqual(afterCall);
    });
  });

  describe('Session Lock Detection', () => {
    test('should correctly identify locked session', () => {
      setSessionState(SessionState.LOCKED_INACTIVE);
      expect(isSessionLocked()).toBe(true);
    });

    test('should correctly identify unlocked session', () => {
      setSessionState(SessionState.AUTHENTICATED);
      expect(isSessionLocked()).toBe(false);
    });
  });

  describe('Feature Access Control', () => {
    test('should allow access when authenticated', () => {
      setSessionState(SessionState.AUTHENTICATED);
      expect(canAccessFeatures()).toBe(true);
    });

    test('should deny access when locked', () => {
      setSessionState(SessionState.LOCKED_INACTIVE);
      expect(canAccessFeatures()).toBe(false);
    });

    test('should deny access when unauthenticated', () => {
      setSessionState(SessionState.UNAUTHENTICATED);
      expect(canAccessFeatures()).toBe(false);
    });
  });

  describe('Session Cleanup', () => {
    test('should clear all session state data', () => {
      // Set up some session data
      setSessionState(SessionState.LOCKED_INACTIVE);
      updateLastActivity();
      mockLocalStorage.store['token'] = 'test-token';
      
      // Clear session state
      clearSessionState();
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('hnwi_session_state');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('hnwi_last_activity');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('hnwi_locked_at');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
    });
  });

  describe('Legacy Mode Support', () => {
    test('should enable and detect legacy mode', () => {
      expect(isLegacySessionMode()).toBe(false);
      
      enableLegacySessionMode();
      expect(isLegacySessionMode()).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('hnwi_legacy_session_mode', 'true');
    });

    test('should disable legacy mode', () => {
      enableLegacySessionMode();
      expect(isLegacySessionMode()).toBe(true);
      
      disableLegacySessionMode();
      expect(isLegacySessionMode()).toBe(false);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('hnwi_legacy_session_mode');
    });

    test('should use legacy behavior when legacy mode enabled', () => {
      enableLegacySessionMode();
      
      // Mock a valid token
      mockLocalStorage.store['token'] = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjk5OTk5OTk5OTl9.invalid';
      
      // In legacy mode, should just check token existence
      expect(getSessionStateWithFallback()).toBe(SessionState.AUTHENTICATED);
      expect(canAccessFeaturesWithFallback()).toBe(true);
    });
  });

  describe('Race Condition Protection', () => {
    test('should not allow unauthenticated state when valid token exists', () => {
      // Mock a valid token that won't expire for a long time
      const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const validToken = `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify({exp: futureExp}))}.signature`;
      mockLocalStorage.store['token'] = validToken;
      
      // Try to set to unauthenticated - should be corrected to authenticated
      setSessionState(SessionState.UNAUTHENTICATED);
      expect(getSessionState()).toBe(SessionState.AUTHENTICATED);
    });

    test('should not lock session if user was recently active', () => {
      setSessionState(SessionState.AUTHENTICATED);
      updateLastActivity();
      
      // Try to lock immediately after activity (should be prevented)
      setSessionState(SessionState.LOCKED_INACTIVE);
      
      // Should remain authenticated due to recent activity
      expect(getSessionState()).toBe(SessionState.AUTHENTICATED);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid token gracefully', () => {
      mockLocalStorage.store['token'] = 'invalid-token';
      expect(() => getSessionState()).not.toThrow();
    });

    test('should handle missing localStorage gracefully', () => {
      // Temporarily remove localStorage
      const originalLocalStorage = window.localStorage;
      delete window.localStorage;
      
      expect(() => {
        setSessionState(SessionState.AUTHENTICATED);
        getSessionState();
        updateLastActivity();
      }).not.toThrow();
      
      // Restore localStorage
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true
      });
    });
  });
});

console.log('✅ Auth Utils test suite created - covers session state management, activity tracking, race conditions, and error handling');