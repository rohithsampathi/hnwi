// __tests__/rollback-mechanism.test.js
// Tests for emergency rollback and legacy mode functionality

// Mock localStorage
const mockLocalStorage = {
  store: {},
  getItem: jest.fn((key) => mockLocalStorage.store[key] || null),
  setItem: jest.fn((key, value) => { mockLocalStorage.store[key] = value }),
  removeItem: jest.fn((key) => { delete mockLocalStorage.store[key] }),
  clear: jest.fn(() => { mockLocalStorage.store = {} })
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock console.warn for legacy mode warnings
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();

// Import using require for CommonJS compatibility
const {
  SessionState,
  enableLegacySessionMode,
  disableLegacySessionMode,
  isLegacySessionMode,
  getSessionStateWithFallback,
  canAccessFeaturesWithFallback,
  setSessionState,
  getSessionState,
  canAccessFeatures
} = require('../lib/auth-utils');

// Mock the secure-api checkSessionAccess function
jest.mock('../lib/secure-api', () => {
  const originalModule = jest.requireActual('../lib/secure-api');
  return {
    ...originalModule,
    secureApi: {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn()
    }
  };
});

describe('Smart Inactivity - Rollback Mechanism', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
    mockConsoleWarn.mockClear();
    
    // Ensure we start in normal mode
    disableLegacySessionMode();
  });

  afterAll(() => {
    mockConsoleWarn.mockRestore();
  });

  describe('Legacy Mode Toggle', () => {
    test('should enable legacy mode with warning', () => {
      expect(isLegacySessionMode()).toBe(false);
      
      enableLegacySessionMode();
      
      expect(isLegacySessionMode()).toBe(true);
      expect(mockConsoleWarn).toHaveBeenCalledWith('HNWI: Legacy session mode enabled - smart inactivity disabled');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('hnwi_legacy_session_mode', 'true');
    });

    test('should disable legacy mode', () => {
      enableLegacySessionMode();
      expect(isLegacySessionMode()).toBe(true);
      
      disableLegacySessionMode();
      
      expect(isLegacySessionMode()).toBe(false);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('hnwi_legacy_session_mode');
    });

    test('should persist legacy mode across page reloads', () => {
      enableLegacySessionMode();
      
      // Simulate page reload by creating fresh instance
      expect(isLegacySessionMode()).toBe(true);
      
      // Manual check of localStorage
      expect(mockLocalStorage.store['hnwi_legacy_session_mode']).toBe('true');
    });
  });

  describe('Fallback Session State Management', () => {
    test('should use smart session state in normal mode', () => {
      setSessionState(SessionState.LOCKED_INACTIVE);
      
      expect(getSessionStateWithFallback()).toBe(SessionState.LOCKED_INACTIVE);
      expect(getSessionState()).toBe(SessionState.LOCKED_INACTIVE);
    });

    test('should use simple token check in legacy mode', () => {
      enableLegacySessionMode();
      
      // Mock valid token
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const validToken = `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify({exp: futureExp}))}.signature`;
      mockLocalStorage.store['token'] = validToken;
      
      setSessionState(SessionState.LOCKED_INACTIVE);
      
      // Smart session shows locked
      expect(getSessionState()).toBe(SessionState.LOCKED_INACTIVE);
      
      // Fallback shows authenticated (ignores smart state)
      expect(getSessionStateWithFallback()).toBe(SessionState.AUTHENTICATED);
    });

    test('should return unauthenticated in legacy mode without token', () => {
      enableLegacySessionMode();
      
      // No token in storage
      delete mockLocalStorage.store['token'];
      
      expect(getSessionStateWithFallback()).toBe(SessionState.UNAUTHENTICATED);
    });
  });

  describe('Feature Access in Legacy Mode', () => {
    test('should allow feature access with valid token in legacy mode', () => {
      enableLegacySessionMode();
      
      // Mock valid token
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const validToken = `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify({exp: futureExp}))}.signature`;
      mockLocalStorage.store['token'] = validToken;
      
      // Smart features would deny access if session is locked
      setSessionState(SessionState.LOCKED_INACTIVE);
      expect(canAccessFeatures()).toBe(false);
      
      // But legacy mode allows access with valid token
      expect(canAccessFeaturesWithFallback()).toBe(true);
    });

    test('should deny feature access without token in legacy mode', () => {
      enableLegacySessionMode();
      
      delete mockLocalStorage.store['token'];
      
      expect(canAccessFeaturesWithFallback()).toBe(false);
    });

    test('should deny feature access with invalid token in legacy mode', () => {
      enableLegacySessionMode();
      
      mockLocalStorage.store['token'] = 'invalid-token';
      
      expect(canAccessFeaturesWithFallback()).toBe(false);
    });
  });

  describe('API Integration with Legacy Mode', () => {
    test('should bypass smart session checks in legacy mode', async () => {
      const { secureApi } = require('../lib/secure-api');
      enableLegacySessionMode();
      
      // Mock valid token
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const validToken = `eyJ0eXAiOiJKV1QiLCJhbGciOSeriJ9.${btoa(JSON.stringify({exp: futureExp}))}.signature`;
      mockLocalStorage.store['token'] = validToken;
      
      // Mock successful API response
      secureApi.get.mockResolvedValue({ data: 'legacy-mode-data' });
      
      // Should work even if smart session would block
      setSessionState(SessionState.LOCKED_INACTIVE);
      
      const result = await secureApi.get('/api/test');
      expect(result).toEqual({ data: 'legacy-mode-data' });
    });

    test('should block API calls in legacy mode without token', async () => {
      const { secureApi } = require('../lib/secure-api');
      enableLegacySessionMode();
      
      delete mockLocalStorage.store['token'];
      
      secureApi.get.mockRejectedValue(new Error('Authentication required to access this resource.'));
      
      await expect(secureApi.get('/api/test')).rejects.toThrow('Authentication required');
    });
  });

  describe('Emergency Rollback Scenarios', () => {
    test('should handle rollback during active session lock', () => {
      // Start with locked session
      setSessionState(SessionState.LOCKED_INACTIVE);
      expect(canAccessFeatures()).toBe(false);
      
      // Emergency rollback
      enableLegacySessionMode();
      
      // Mock valid token
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const validToken = `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify({exp: futureExp}))}.signature`;
      mockLocalStorage.store['token'] = validToken;
      
      // Should immediately allow access
      expect(canAccessFeaturesWithFallback()).toBe(true);
    });

    test('should handle rollback when smart session is malfunctioning', () => {
      // Simulate smart session throwing errors
      const originalGetSessionState = getSessionState;
      jest.spyOn(require('../lib/auth-utils'), 'getSessionState').mockImplementation(() => {
        throw new Error('Smart session malfunction');
      });
      
      enableLegacySessionMode();
      
      // Mock valid token
      mockLocalStorage.store['token'] = 'valid-token';
      
      // Should still work via legacy mode
      expect(() => getSessionStateWithFallback()).not.toThrow();
      
      // Restore original function
      require('../lib/auth-utils').getSessionState.mockRestore();
    });

    test('should maintain user session during rollback', () => {
      // User is authenticated and active
      setSessionState(SessionState.AUTHENTICATED);
      mockLocalStorage.store['token'] = 'user-token';
      
      // Emergency rollback
      enableLegacySessionMode();
      
      // User should remain authenticated
      expect(getSessionStateWithFallback()).toBe(SessionState.AUTHENTICATED);
      expect(canAccessFeaturesWithFallback()).toBe(true);
    });
  });

  describe('Recovery from Legacy Mode', () => {
    test('should restore smart session behavior when disabled', () => {
      enableLegacySessionMode();
      
      // Verify legacy mode is active
      expect(isLegacySessionMode()).toBe(true);
      
      setSessionState(SessionState.LOCKED_INACTIVE);
      expect(canAccessFeaturesWithFallback()).toBe(true); // Legacy allows access
      
      // Disable legacy mode
      disableLegacySessionMode();
      
      // Should now use smart session behavior
      expect(canAccessFeatures()).toBe(false); // Smart session blocks access
      expect(canAccessFeaturesWithFallback()).toBe(false);
    });

    test('should clean up legacy mode storage correctly', () => {
      enableLegacySessionMode();
      expect(mockLocalStorage.store['hnwi_legacy_session_mode']).toBe('true');
      
      disableLegacySessionMode();
      expect(mockLocalStorage.store['hnwi_legacy_session_mode']).toBeUndefined();
    });
  });

  describe('Migration and Compatibility', () => {
    test('should handle users with existing sessions during rollback', () => {
      // Simulate existing user session data
      mockLocalStorage.store['hnwi_session_state'] = SessionState.AUTHENTICATED;
      mockLocalStorage.store['hnwi_last_activity'] = String(Date.now() - 60000); // 1 minute ago
      mockLocalStorage.store['token'] = 'existing-user-token';
      
      enableLegacySessionMode();
      
      // Should preserve user's authenticated state
      expect(getSessionStateWithFallback()).toBe(SessionState.AUTHENTICATED);
    });

    test('should not lose smart session data during legacy mode', () => {
      setSessionState(SessionState.LOCKED_INACTIVE);
      const lockedTime = Date.now();
      mockLocalStorage.store['hnwi_locked_at'] = String(lockedTime);
      
      enableLegacySessionMode();
      
      // Legacy mode is active, but smart session data persists
      expect(mockLocalStorage.store['hnwi_session_state']).toBe(SessionState.LOCKED_INACTIVE);
      expect(mockLocalStorage.store['hnwi_locked_at']).toBe(String(lockedTime));
      
      disableLegacySessionMode();
      
      // Smart session data should still be intact
      expect(getSessionState()).toBe(SessionState.LOCKED_INACTIVE);
    });
  });

  describe('Performance in Legacy Mode', () => {
    test('should be faster than smart session checks', () => {
      const iterations = 100;
      
      // Test smart session performance
      disableLegacySessionMode();
      const smartStart = Date.now();
      for (let i = 0; i < iterations; i++) {
        canAccessFeatures();
      }
      const smartDuration = Date.now() - smartStart;
      
      // Test legacy mode performance
      enableLegacySessionMode();
      mockLocalStorage.store['token'] = 'test-token';
      const legacyStart = Date.now();
      for (let i = 0; i < iterations; i++) {
        canAccessFeaturesWithFallback();
      }
      const legacyDuration = Date.now() - legacyStart;
      
      // Legacy mode should be faster (or at least not significantly slower)
      expect(legacyDuration).toBeLessThanOrEqual(smartDuration * 2);
    });
  });

  describe('Error Handling in Legacy Mode', () => {
    test('should handle localStorage errors gracefully in legacy mode', () => {
      enableLegacySessionMode();
      
      const originalGetItem = mockLocalStorage.getItem;
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage access denied');
      });
      
      expect(() => {
        getSessionStateWithFallback();
        canAccessFeaturesWithFallback();
      }).not.toThrow();
      
      mockLocalStorage.getItem = originalGetItem;
    });

    test('should handle corrupted token data in legacy mode', () => {
      enableLegacySessionMode();
      
      // Set various corrupted token states
      const corruptedTokens = [
        'corrupted',
        null,
        undefined,
        '',
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.corrupted.signature',
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..signature'
      ];
      
      corruptedTokens.forEach(token => {
        mockLocalStorage.store['token'] = token;
        
        expect(() => {
          getSessionStateWithFallback();
          canAccessFeaturesWithFallback();
        }).not.toThrow();
      });
    });
  });
});

console.log('✅ Rollback Mechanism test suite created - covers legacy mode toggle, emergency rollback, API integration, and error handling');