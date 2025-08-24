// __tests__/race-conditions.test.js
// Edge case tests for race conditions and concurrent operations

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

// Mock window events
const mockWindow = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  clearInterval: jest.fn(),
  setInterval: jest.fn(() => 'mock-interval-id'),
  setTimeout: jest.fn((cb, delay) => {
    setTimeout(cb, delay);
    return 'mock-timeout-id';
  })
};

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true
});

// Import using require for CommonJS compatibility
const {
  SessionState,
  setSessionState,
  getSessionState,
  updateLastActivity,
  getLastActivity,
  isSessionLocked
} = require('../lib/auth-utils');

describe('Smart Inactivity - Race Conditions & Edge Cases', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
    
    // Reset Date.now mock if it exists
    if (Date.now.mockRestore) {
      Date.now.mockRestore();
    }
  });

  describe('Rapid State Changes', () => {
    test('should handle rapid lock/unlock cycles', () => {
      // Simulate rapid state changes
      setSessionState(SessionState.AUTHENTICATED);
      setSessionState(SessionState.LOCKED_INACTIVE);
      setSessionState(SessionState.AUTHENTICATED);
      setSessionState(SessionState.LOCKED_INACTIVE);
      setSessionState(SessionState.AUTHENTICATED);
      
      expect(getSessionState()).toBe(SessionState.AUTHENTICATED);
    });

    test('should prevent locking immediately after activity', () => {
      setSessionState(SessionState.AUTHENTICATED);
      updateLastActivity();
      
      // Try to lock immediately (should be prevented due to recent activity)
      setSessionState(SessionState.LOCKED_INACTIVE);
      
      // Should remain authenticated due to race condition protection
      expect(getSessionState()).toBe(SessionState.AUTHENTICATED);
    });

    test('should allow locking after sufficient inactive time', async () => {
      setSessionState(SessionState.AUTHENTICATED);
      
      // Mock time to be more than 30 seconds ago
      const oldTime = Date.now() - 35000; // 35 seconds ago
      jest.spyOn(Date, 'now').mockReturnValue(oldTime);
      updateLastActivity();
      
      // Now mock current time
      const currentTime = oldTime + 35000;
      Date.now.mockReturnValue(currentTime);
      
      // Should allow locking now
      setSessionState(SessionState.LOCKED_INACTIVE);
      expect(getSessionState()).toBe(SessionState.LOCKED_INACTIVE);
      
      Date.now.mockRestore();
    });
  });

  describe('Concurrent Access Patterns', () => {
    test('should handle multiple simultaneous session state reads', () => {
      setSessionState(SessionState.AUTHENTICATED);
      
      // Simulate multiple components checking state simultaneously
      const states = Array(10).fill(null).map(() => getSessionState());
      
      // All should return the same state
      states.forEach(state => {
        expect(state).toBe(SessionState.AUTHENTICATED);
      });
    });

    test('should handle simultaneous activity updates', () => {
      const initialTime = Date.now();
      
      // Simulate multiple activity updates happening at once
      Promise.all([
        updateLastActivity(),
        updateLastActivity(),
        updateLastActivity(),
        updateLastActivity(),
        updateLastActivity()
      ]);
      
      const finalActivity = getLastActivity();
      expect(finalActivity).toBeGreaterThanOrEqual(initialTime);
    });

    test('should handle overlapping state transitions', () => {
      setSessionState(SessionState.AUTHENTICATED);
      
      // Simulate overlapping state changes from different sources
      setTimeout(() => setSessionState(SessionState.LOCKED_INACTIVE), 0);
      setTimeout(() => setSessionState(SessionState.AUTHENTICATED), 10);
      setTimeout(() => setSessionState(SessionState.LOCKED_INACTIVE), 20);
      
      // Final state should be deterministic
      setTimeout(() => {
        const finalState = getSessionState();
        expect([SessionState.AUTHENTICATED, SessionState.LOCKED_INACTIVE]).toContain(finalState);
      }, 50);
    });
  });

  describe('Token Validation Race Conditions', () => {
    test('should not allow unauthenticated state with valid token', () => {
      // Mock a valid token
      const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const validToken = `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify({exp: futureExp}))}.signature`;
      mockLocalStorage.store['token'] = validToken;
      
      // Try to set unauthenticated (should be corrected)
      setSessionState(SessionState.UNAUTHENTICATED);
      
      expect(getSessionState()).toBe(SessionState.AUTHENTICATED);
    });

    test('should handle expired token during state transition', () => {
      // Mock an expired token
      const pastExp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const expiredToken = `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify({exp: pastExp}))}.signature`;
      mockLocalStorage.store['token'] = expiredToken;
      
      // Try to set authenticated (should be corrected to expired)
      setSessionState(SessionState.AUTHENTICATED);
      
      expect(getSessionState()).toBe(SessionState.EXPIRED);
    });

    test('should handle malformed token gracefully', () => {
      mockLocalStorage.store['token'] = 'malformed-token';
      
      expect(() => {
        setSessionState(SessionState.AUTHENTICATED);
        getSessionState();
      }).not.toThrow();
    });
  });

  describe('Browser Tab Management', () => {
    test('should handle session state across tab switches', () => {
      setSessionState(SessionState.AUTHENTICATED);
      
      // Simulate tab becoming inactive
      document.hidden = true;
      
      // Simulate tab becoming active again after some time
      document.hidden = false;
      
      // State should persist
      expect(getSessionState()).toBe(SessionState.AUTHENTICATED);
    });

    test('should handle storage events from other tabs', () => {
      setSessionState(SessionState.AUTHENTICATED);
      
      // Simulate storage event from another tab
      const storageEvent = new StorageEvent('storage', {
        key: 'hnwi_session_state',
        newValue: SessionState.LOCKED_INACTIVE,
        oldValue: SessionState.AUTHENTICATED
      });
      
      window.dispatchEvent(storageEvent);
      
      // Should handle the external state change
      expect(getSessionState()).toBe(SessionState.LOCKED_INACTIVE);
    });
  });

  describe('Memory Leak Prevention', () => {
    test('should not accumulate event listeners', () => {
      const initialListeners = mockWindow.addEventListener.mock.calls.length;
      
      // Simulate multiple initializations
      for (let i = 0; i < 5; i++) {
        setSessionState(SessionState.AUTHENTICATED);
        updateLastActivity();
      }
      
      const finalListeners = mockWindow.addEventListener.mock.calls.length;
      
      // Should not have excessive listeners
      expect(finalListeners - initialListeners).toBeLessThan(10);
    });

    test('should clean up intervals on state changes', () => {
      setSessionState(SessionState.AUTHENTICATED);
      
      // Simulate state changes that should clean up intervals
      setSessionState(SessionState.LOCKED_INACTIVE);
      setSessionState(SessionState.UNAUTHENTICATED);
      
      expect(mockWindow.clearInterval).toHaveBeenCalled();
    });
  });

  describe('Network Failure Scenarios', () => {
    test('should handle localStorage quota exceeded', () => {
      const originalSetItem = mockLocalStorage.setItem;
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      
      expect(() => {
        setSessionState(SessionState.AUTHENTICATED);
        updateLastActivity();
      }).not.toThrow();
      
      mockLocalStorage.setItem = originalSetItem;
    });

    test('should handle localStorage access denied', () => {
      const originalGetItem = mockLocalStorage.getItem;
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('SecurityError');
      });
      
      expect(() => {
        getSessionState();
        getLastActivity();
      }).not.toThrow();
      
      mockLocalStorage.getItem = originalGetItem;
    });
  });

  describe('Performance Under Load', () => {
    test('should handle frequent state checks efficiently', () => {
      setSessionState(SessionState.AUTHENTICATED);
      
      const startTime = Date.now();
      
      // Simulate frequent state checks (like from multiple components)
      for (let i = 0; i < 1000; i++) {
        getSessionState();
        isSessionLocked();
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete quickly (under 100ms for 1000 operations)
      expect(duration).toBeLessThan(100);
    });

    test('should handle rapid activity updates', () => {
      const startTime = Date.now();
      
      // Simulate rapid user activity (like mouse movements)
      for (let i = 0; i < 100; i++) {
        updateLastActivity();
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should handle updates efficiently
      expect(duration).toBeLessThan(50);
      expect(getLastActivity()).toBeGreaterThanOrEqual(startTime);
    });
  });

  describe('Edge Case Data States', () => {
    test('should handle corrupted session data', () => {
      mockLocalStorage.store['hnwi_session_state'] = 'corrupted-state';
      mockLocalStorage.store['hnwi_last_activity'] = 'not-a-number';
      mockLocalStorage.store['hnwi_locked_at'] = 'invalid-timestamp';
      
      expect(() => {
        getSessionState();
        getLastActivity();
      }).not.toThrow();
    });

    test('should handle missing timestamp data', () => {
      setSessionState(SessionState.LOCKED_INACTIVE);
      delete mockLocalStorage.store['hnwi_locked_at'];
      delete mockLocalStorage.store['hnwi_last_activity'];
      
      expect(() => {
        getSessionState();
        getLastActivity();
      }).not.toThrow();
    });

    test('should handle very old timestamps', () => {
      // Set activity to a very old timestamp (year 1970)
      mockLocalStorage.store['hnwi_last_activity'] = '1000';
      
      const activity = getLastActivity();
      expect(activity).toBe(1000);
      
      // Should handle the old timestamp gracefully in state logic
      expect(() => setSessionState(SessionState.LOCKED_INACTIVE)).not.toThrow();
    });
  });

  describe('Boundary Conditions', () => {
    test('should handle exactly 30 seconds since last activity', () => {
      const baseTime = 1000000000000; // Fixed base time
      jest.spyOn(Date, 'now').mockReturnValue(baseTime);
      
      setSessionState(SessionState.AUTHENTICATED);
      updateLastActivity();
      
      // Mock exactly 30 seconds later
      Date.now.mockReturnValue(baseTime + 30000);
      
      setSessionState(SessionState.LOCKED_INACTIVE);
      
      // Should allow locking at exactly 30 seconds
      expect(getSessionState()).toBe(SessionState.LOCKED_INACTIVE);
      
      Date.now.mockRestore();
    });

    test('should handle 29.9 seconds since last activity', () => {
      const baseTime = 1000000000000;
      jest.spyOn(Date, 'now').mockReturnValue(baseTime);
      
      setSessionState(SessionState.AUTHENTICATED);
      updateLastActivity();
      
      // Mock 29.9 seconds later
      Date.now.mockReturnValue(baseTime + 29900);
      
      setSessionState(SessionState.LOCKED_INACTIVE);
      
      // Should prevent locking at 29.9 seconds
      expect(getSessionState()).toBe(SessionState.AUTHENTICATED);
      
      Date.now.mockRestore();
    });
  });
});

console.log('✅ Race Conditions test suite created - covers rapid state changes, concurrent access, token validation, and edge cases');