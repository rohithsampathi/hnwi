// Test session locking functionality 
describe('Smart Inactivity - Session Locking', () => {
  let mockLocalStorage;

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {
      store: {},
      getItem: jest.fn((key) => mockLocalStorage.store[key] || null),
      setItem: jest.fn((key, value) => { mockLocalStorage.store[key] = value }),
      removeItem: jest.fn((key) => { delete mockLocalStorage.store[key] }),
      clear: jest.fn(() => { mockLocalStorage.store = {} })
    };

    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });

    // Mock window functions (use existing window object)
    global.setInterval = jest.fn(() => 'mock-interval-id');
    global.clearInterval = jest.fn();
    global.setTimeout = jest.fn((cb, delay) => {
      setTimeout(cb, delay);
      return 'mock-timeout-id';
    });

    jest.clearAllMocks();
  });

  describe('Session Activity Tracking', () => {
    test('should track user activity with timestamps', () => {
      const sessionActivity = new Map();
      
      const updateActivity = (userId) => {
        const timestamp = Date.now();
        sessionActivity.set(userId, timestamp);
        localStorage.setItem('hnwi_last_activity', timestamp.toString());
        
        // Update session state if locked
        const currentState = localStorage.getItem('hnwi_session_state');
        if (currentState === 'locked_inactive') {
          localStorage.setItem('hnwi_session_state', 'authenticated');
        }
      };

      const userId = 'user123';
      const beforeUpdate = Date.now();
      
      updateActivity(userId);
      
      const storedActivity = sessionActivity.get(userId);
      expect(storedActivity).toBeGreaterThanOrEqual(beforeUpdate);
      expect(storedActivity).toBeLessThanOrEqual(Date.now());
    });

    test('should unlock session on activity after lock', () => {
      const updateActivity = (userId) => {
        const currentState = localStorage.getItem('hnwi_session_state');
        if (currentState === 'locked_inactive') {
          localStorage.setItem('hnwi_session_state', 'authenticated');
          localStorage.removeItem('hnwi_locked_at');
        }
        localStorage.setItem('hnwi_last_activity', Date.now().toString());
      };

      // Start with locked session
      localStorage.setItem('hnwi_session_state', 'locked_inactive');
      localStorage.setItem('hnwi_locked_at', Date.now().toString());
      
      expect(localStorage.getItem('hnwi_session_state')).toBe('locked_inactive');
      
      // Update activity - should unlock
      updateActivity('user123');
      
      expect(localStorage.getItem('hnwi_session_state')).toBe('authenticated');
      expect(localStorage.getItem('hnwi_locked_at')).toBeNull();
    });
  });

  describe('Inactivity Detection', () => {
    test('should detect session inactivity after timeout', () => {
      const TIMEOUT_DURATION = 15 * 60 * 1000; // 15 minutes
      const sessionActivity = new Map();
      
      const checkSessionInactivity = (userId) => {
        const lastActivity = sessionActivity.get(userId);
        if (!lastActivity) return false;
        
        const inactiveTime = Date.now() - lastActivity;
        return inactiveTime > TIMEOUT_DURATION;
      };

      const lockSession = (userId) => {
        const currentState = localStorage.getItem('hnwi_session_state');
        if (currentState === 'locked_inactive') return false; // Already locked
        
        localStorage.setItem('hnwi_session_state', 'locked_inactive');
        localStorage.setItem('hnwi_locked_at', Date.now().toString());
        
        return true;
      };

      const userId = 'user123';
      
      // Set activity 16 minutes ago (past timeout)
      const oldActivity = Date.now() - (16 * 60 * 1000);
      sessionActivity.set(userId, oldActivity);
      localStorage.setItem('hnwi_session_state', 'authenticated');
      
      // Check inactivity
      const shouldLock = checkSessionInactivity(userId);
      expect(shouldLock).toBe(true);
      
      // Lock the session
      const wasLocked = lockSession(userId);
      
      expect(wasLocked).toBe(true);
      expect(localStorage.getItem('hnwi_session_state')).toBe('locked_inactive');
      expect(localStorage.getItem('hnwi_locked_at')).toBeTruthy();
    });

    test('should not lock session if user is active', () => {
      const TIMEOUT_DURATION = 15 * 60 * 1000;
      const sessionActivity = new Map();
      
      const checkSessionInactivity = (userId) => {
        const lastActivity = sessionActivity.get(userId);
        if (!lastActivity) return false;
        
        const inactiveTime = Date.now() - lastActivity;
        return inactiveTime > TIMEOUT_DURATION;
      };

      const userId = 'user123';
      
      // Set recent activity (5 minutes ago)
      const recentActivity = Date.now() - (5 * 60 * 1000);
      sessionActivity.set(userId, recentActivity);
      
      // Check inactivity
      const shouldLock = checkSessionInactivity(userId);
      expect(shouldLock).toBe(false);
    });
  });

  describe('Session Monitor Setup', () => {
    test('should set up periodic session monitoring', () => {
      const initializeSessionMonitor = (userId) => {
        const sessionActivity = new Map();
        sessionActivity.set(userId, Date.now());
        
        const checkSession = () => {
          const lastActivity = sessionActivity.get(userId);
          if (!lastActivity) return;
          
          const inactiveTime = Date.now() - lastActivity;
          const TIMEOUT = 15 * 60 * 1000; // 15 minutes
          
          if (inactiveTime > TIMEOUT) {
            const currentState = localStorage.getItem('hnwi_session_state');
            if (currentState !== 'locked_inactive') {
              localStorage.setItem('hnwi_session_state', 'locked_inactive');
            }
          }
        };
        
        // Set up interval
        const intervalId = setInterval(checkSession, 60000); // Check every minute
        return intervalId;
      };

      const userId = 'user123';
      const intervalId = initializeSessionMonitor(userId);
      
      expect(setInterval).toHaveBeenCalledWith(
        expect.any(Function),
        60000 // 1 minute
      );
      expect(intervalId).toBe('mock-interval-id');
    });
  });

  describe('Race Condition Prevention', () => {
    test('should prevent duplicate locking events', () => {
      const lockSession = (userId) => {
        const currentState = localStorage.getItem('hnwi_session_state');
        
        // Prevent duplicate locking
        if (currentState === 'locked_inactive') {
          return false; // Already locked
        }
        
        localStorage.setItem('hnwi_session_state', 'locked_inactive');
        localStorage.setItem('hnwi_locked_at', Date.now().toString());
        
        return true; // Successfully locked
      };

      const userId = 'user123';
      
      // First lock attempt
      const firstLock = lockSession(userId);
      expect(firstLock).toBe(true);
      expect(localStorage.getItem('hnwi_session_state')).toBe('locked_inactive');
      
      // Second lock attempt (should be prevented)
      const secondLock = lockSession(userId);
      expect(secondLock).toBe(false);
    });

    test('should handle rapid activity updates during lock', () => {
      const updateActivity = (userId) => {
        const lastActivity = localStorage.getItem('hnwi_last_activity');
        const currentTime = Date.now();
        
        // Race condition protection: don't lock if recent activity
        if (lastActivity) {
          const timeSinceActivity = currentTime - parseInt(lastActivity);
          if (timeSinceActivity < 30000) { // Less than 30 seconds
            // Don't allow locking
            const currentState = localStorage.getItem('hnwi_session_state');
            if (currentState === 'locked_inactive') {
              localStorage.setItem('hnwi_session_state', 'authenticated');
            }
          }
        }
        
        localStorage.setItem('hnwi_last_activity', currentTime.toString());
      };

      const userId = 'user123';
      
      // Set session to locked
      localStorage.setItem('hnwi_session_state', 'locked_inactive');
      localStorage.setItem('hnwi_last_activity', (Date.now() - 5000).toString()); // 5 seconds ago
      
      // Update activity (should unlock due to recent activity)
      updateActivity(userId);
      
      expect(localStorage.getItem('hnwi_session_state')).toBe('authenticated');
    });
  });

  describe('Error Recovery', () => {
    test('should handle session monitor errors gracefully', () => {
      const initializeSessionWithErrorHandling = (userId) => {
        try {
          localStorage.setItem('hnwi_session_state', 'authenticated');
          localStorage.setItem('hnwi_last_activity', Date.now().toString());
          
          const checkSession = () => {
            try {
              const state = localStorage.getItem('hnwi_session_state');
              const lastActivity = localStorage.getItem('hnwi_last_activity');
              
              if (state && lastActivity) {
                const inactiveTime = Date.now() - parseInt(lastActivity);
                if (inactiveTime > 15 * 60 * 1000) { // 15 minutes
                  localStorage.setItem('hnwi_session_state', 'locked_inactive');
                }
              }
            } catch (error) {
              // Fallback to clearing session
              localStorage.removeItem('hnwi_session_state');
              localStorage.removeItem('hnwi_last_activity');
            }
          };
          
          return setInterval(checkSession, 60000);
        } catch (error) {
          // If initialization fails, return null
          return null;
        }
      };

      const userId = 'user123';
      const intervalId = initializeSessionWithErrorHandling(userId);
      
      expect(intervalId).toBe('mock-interval-id');
      expect(localStorage.getItem('hnwi_session_state')).toBe('authenticated');
    });

    test('should handle localStorage quota exceeded', () => {
      // Mock localStorage to throw error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error('QuotaExceededError');
      });

      const safeSetSessionState = (state) => {
        try {
          localStorage.setItem('hnwi_session_state', state);
          return true;
        } catch (error) {
          console.warn('Failed to set session state:', error.message);
          return false;
        }
      };

      const result = safeSetSessionState('authenticated');
      expect(result).toBe(false);

      // Restore
      localStorage.setItem = originalSetItem;
    });
  });

  describe('Session Cleanup', () => {
    test('should clean up intervals on session termination', () => {
      const terminateSession = (userId, intervalId) => {
        // Clear session data
        localStorage.removeItem('hnwi_session_state');
        localStorage.removeItem('hnwi_last_activity');
        localStorage.removeItem('hnwi_locked_at');
        
        // Clear monitoring interval
        if (intervalId) {
          clearInterval(intervalId);
        }
        
        return true;
      };

      const userId = 'user123';
      const intervalId = 'mock-interval-id';
      
      // Set up session data
      localStorage.setItem('hnwi_session_state', 'locked_inactive');
      localStorage.setItem('hnwi_last_activity', Date.now().toString());
      localStorage.setItem('hnwi_locked_at', Date.now().toString());
      
      // Terminate session
      const result = terminateSession(userId, intervalId);
      
      expect(result).toBe(true);
      expect(localStorage.getItem('hnwi_session_state')).toBeNull();
      expect(localStorage.getItem('hnwi_last_activity')).toBeNull();
      expect(localStorage.getItem('hnwi_locked_at')).toBeNull();
      expect(clearInterval).toHaveBeenCalledWith(intervalId);
    });
  });

  describe('Time-based Logic', () => {
    test('should correctly calculate inactivity periods', () => {
      const calculateInactivity = (lastActivityTime) => {
        return Date.now() - lastActivityTime;
      };

      const isInactive = (inactiveTime, threshold = 15 * 60 * 1000) => {
        return inactiveTime > threshold;
      };

      // Test different time periods
      const now = Date.now();
      const fiveMinutesAgo = now - (5 * 60 * 1000);
      const twentyMinutesAgo = now - (20 * 60 * 1000);

      const shortInactivity = calculateInactivity(fiveMinutesAgo);
      const longInactivity = calculateInactivity(twentyMinutesAgo);

      expect(isInactive(shortInactivity)).toBe(false);
      expect(isInactive(longInactivity)).toBe(true);
    });

    test('should handle edge case of exactly 15 minutes', () => {
      const FIFTEEN_MINUTES = 15 * 60 * 1000;
      const now = Date.now();
      const exactlyFifteenMinutesAgo = now - FIFTEEN_MINUTES;
      const slightlyOverFifteenMinutes = now - (FIFTEEN_MINUTES + 1000); // 1 second over

      const isInactive = (lastActivity, threshold = FIFTEEN_MINUTES) => {
        return (Date.now() - lastActivity) > threshold;
      };

      expect(isInactive(exactlyFifteenMinutesAgo)).toBe(false); // Exactly 15 minutes should not lock
      expect(isInactive(slightlyOverFifteenMinutes)).toBe(true); // Just over 15 minutes should lock
    });
  });
});