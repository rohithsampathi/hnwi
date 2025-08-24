// __tests__/client-security.test.js
// Unit tests for ClientSecurityManager smart locking behavior

// Mock dependencies
jest.mock('../lib/auth-utils', () => ({
  SessionState: {
    AUTHENTICATED: 'authenticated',
    LOCKED_INACTIVE: 'locked_inactive',
    UNAUTHENTICATED: 'unauthenticated'
  },
  setSessionState: jest.fn(),
  updateLastActivity: jest.fn(),
  getSessionState: jest.fn()
}));

jest.mock('../lib/security/encryption', () => ({
  SecureStorage: {
    clear: jest.fn()
  }
}));

// Mock window and DOM
const mockWindow = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  clearInterval: jest.fn(),
  setInterval: jest.fn(() => 'mock-interval-id'),
  setTimeout: jest.fn((cb) => { cb(); return 'mock-timeout-id'; })
};

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true
});

import { ClientSecurityManager } from '../lib/security/client-security';
import { SessionState, setSessionState, updateLastActivity, getSessionState } from '../lib/auth-utils';

describe('Smart Inactivity - ClientSecurityManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset static maps
    ClientSecurityManager.sessionActivity = new Map();
    ClientSecurityManager.loginAttempts = new Map();
  });

  describe('Session Initialization', () => {
    test('should initialize session correctly', () => {
      const userId = 'user123';
      
      ClientSecurityManager.initializeSession(userId);
      
      expect(setSessionState).toHaveBeenCalledWith(SessionState.AUTHENTICATED);
      expect(updateLastActivity).toHaveBeenCalled();
      expect(mockWindow.setInterval).toHaveBeenCalled();
    });

    test('should store session activity timestamp', () => {
      const userId = 'user123';
      const beforeInit = Date.now();
      
      ClientSecurityManager.initializeSession(userId);
      
      const storedActivity = ClientSecurityManager.sessionActivity.get(userId);
      expect(storedActivity).toBeGreaterThanOrEqual(beforeInit);
    });
  });

  describe('Activity Tracking', () => {
    test('should update activity and session state', () => {
      const userId = 'user123';
      getSessionState.mockReturnValue(SessionState.LOCKED_INACTIVE);
      
      ClientSecurityManager.updateActivity(userId);
      
      expect(setSessionState).toHaveBeenCalledWith(SessionState.AUTHENTICATED);
      expect(updateLastActivity).toHaveBeenCalled();
    });

    test('should not change state if already authenticated', () => {
      const userId = 'user123';
      getSessionState.mockReturnValue(SessionState.AUTHENTICATED);
      
      ClientSecurityManager.updateActivity(userId);
      
      // Should still call updateLastActivity but not setSessionState
      expect(updateLastActivity).toHaveBeenCalled();
      expect(setSessionState).not.toHaveBeenCalled();
    });

    test('should store updated activity timestamp', () => {
      const userId = 'user123';
      ClientSecurityManager.sessionActivity.set(userId, 1000); // Old timestamp
      
      const beforeUpdate = Date.now();
      ClientSecurityManager.updateActivity(userId);
      const afterUpdate = Date.now();
      
      const newActivity = ClientSecurityManager.sessionActivity.get(userId);
      expect(newActivity).toBeGreaterThanOrEqual(beforeUpdate);
      expect(newActivity).toBeLessThanOrEqual(afterUpdate);
    });
  });

  describe('Session Locking', () => {
    test('should lock session without clearing data', () => {
      const userId = 'user123';
      getSessionState.mockReturnValue(SessionState.AUTHENTICATED);
      
      ClientSecurityManager.lockSession(userId);
      
      expect(setSessionState).toHaveBeenCalledWith(SessionState.LOCKED_INACTIVE);
      expect(mockWindow.setTimeout).toHaveBeenCalled();
      expect(mockWindow.dispatchEvent).toHaveBeenCalled();
    });

    test('should not lock if already locked', () => {
      const userId = 'user123';
      getSessionState.mockReturnValue(SessionState.LOCKED_INACTIVE);
      
      ClientSecurityManager.lockSession(userId);
      
      expect(setSessionState).not.toHaveBeenCalled();
      expect(mockWindow.dispatchEvent).not.toHaveBeenCalled();
    });

    test('should dispatch session-locked event', () => {
      const userId = 'user123';
      getSessionState.mockReturnValue(SessionState.AUTHENTICATED);
      
      ClientSecurityManager.lockSession(userId);
      
      expect(mockWindow.setTimeout).toHaveBeenCalledWith(expect.any(Function), 100);
      expect(mockWindow.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'session-locked',
          detail: { userId, reason: 'inactivity' }
        })
      );
    });

    test('should handle locking errors gracefully', () => {
      const userId = 'user123';
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Make setSessionState throw an error
      setSessionState.mockImplementation(() => {
        throw new Error('Test error');
      });
      
      expect(() => ClientSecurityManager.lockSession(userId)).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('Error locking session:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('Session Monitoring', () => {
    test('should set up session monitor with correct interval', () => {
      const userId = 'user123';
      
      ClientSecurityManager.initializeSession(userId);
      
      expect(mockWindow.setInterval).toHaveBeenCalledWith(
        expect.any(Function),
        60000 // 1 minute
      );
    });

    test('should check session inactivity correctly', () => {
      const userId = 'user123';
      const currentTime = Date.now();
      const inactiveTime = currentTime - (16 * 60 * 1000); // 16 minutes ago (past 15-minute timeout)
      
      ClientSecurityManager.sessionActivity.set(userId, inactiveTime);
      getSessionState.mockReturnValue(SessionState.AUTHENTICATED);
      
      // Simulate the interval check
      ClientSecurityManager.initializeSession(userId);
      const checkSessionFn = mockWindow.setInterval.mock.calls[0][0];
      
      // Mock Date.now to return current time
      jest.spyOn(Date, 'now').mockReturnValue(currentTime);
      
      checkSessionFn();
      
      expect(setSessionState).toHaveBeenCalledWith(SessionState.LOCKED_INACTIVE);
      
      Date.now.mockRestore();
    });

    test('should not lock if session already locked', () => {
      const userId = 'user123';
      const currentTime = Date.now();
      const inactiveTime = currentTime - (16 * 60 * 1000);
      
      ClientSecurityManager.sessionActivity.set(userId, inactiveTime);
      getSessionState.mockReturnValue(SessionState.LOCKED_INACTIVE);
      
      ClientSecurityManager.initializeSession(userId);
      const checkSessionFn = mockWindow.setInterval.mock.calls[0][0];
      
      jest.spyOn(Date, 'now').mockReturnValue(currentTime);
      
      checkSessionFn();
      
      // Should not call lockSession since already locked
      expect(setSessionState).not.toHaveBeenCalledWith(SessionState.LOCKED_INACTIVE);
      
      Date.now.mockRestore();
    });

    test('should not lock if within timeout window', () => {
      const userId = 'user123';
      const currentTime = Date.now();
      const recentTime = currentTime - (10 * 60 * 1000); // 10 minutes ago (within 15-minute timeout)
      
      ClientSecurityManager.sessionActivity.set(userId, recentTime);
      getSessionState.mockReturnValue(SessionState.AUTHENTICATED);
      
      ClientSecurityManager.initializeSession(userId);
      const checkSessionFn = mockWindow.setInterval.mock.calls[0][0];
      
      jest.spyOn(Date, 'now').mockReturnValue(currentTime);
      
      checkSessionFn();
      
      expect(setSessionState).not.toHaveBeenCalledWith(SessionState.LOCKED_INACTIVE);
      
      Date.now.mockRestore();
    });
  });

  describe('Session Termination', () => {
    test('should clear session data on termination', () => {
      const userId = 'user123';
      ClientSecurityManager.sessionActivity.set(userId, Date.now());
      mockWindow.__sessionMonitor = 'mock-interval-id';
      
      ClientSecurityManager.terminateSession(userId);
      
      expect(ClientSecurityManager.sessionActivity.has(userId)).toBe(false);
      expect(setSessionState).toHaveBeenCalledWith(SessionState.UNAUTHENTICATED);
      expect(mockWindow.clearInterval).toHaveBeenCalledWith('mock-interval-id');
    });

    test('should handle termination without monitor', () => {
      const userId = 'user123';
      delete mockWindow.__sessionMonitor;
      
      expect(() => ClientSecurityManager.terminateSession(userId)).not.toThrow();
    });
  });

  describe('Login Attempts Management', () => {
    test('should track failed login attempts', () => {
      const email = 'test@example.com';
      
      ClientSecurityManager.recordFailedLogin(email);
      
      const attempt = ClientSecurityManager.loginAttempts.get(email);
      expect(attempt.count).toBe(1);
    });

    test('should check login attempt limits', () => {
      const email = 'test@example.com';
      
      // Record 3 failed attempts (max allowed)
      ClientSecurityManager.recordFailedLogin(email);
      ClientSecurityManager.recordFailedLogin(email);
      ClientSecurityManager.recordFailedLogin(email);
      
      const result = ClientSecurityManager.checkLoginAttempt(email);
      expect(result.allowed).toBe(false);
      expect(result.lockedUntil).toBeDefined();
    });

    test('should clear login attempts on success', () => {
      const email = 'test@example.com';
      
      ClientSecurityManager.recordFailedLogin(email);
      expect(ClientSecurityManager.loginAttempts.has(email)).toBe(true);
      
      ClientSecurityManager.clearLoginAttempts(email);
      expect(ClientSecurityManager.loginAttempts.has(email)).toBe(false);
    });
  });

  describe('Password Validation', () => {
    test('should validate strong passwords', () => {
      const strongPassword = 'MyStr0ngP@ssw0rd!';
      
      const result = ClientSecurityManager.validatePassword(strongPassword);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject weak passwords', () => {
      const weakPassword = '123';
      
      const result = ClientSecurityManager.validatePassword(weakPassword);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Error Recovery', () => {
    test('should fallback to termination on lock error', () => {
      const userId = 'user123';
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Make getSessionState throw an error
      getSessionState.mockImplementation(() => {
        throw new Error('Test error');
      });
      
      const terminateSessionSpy = jest.spyOn(ClientSecurityManager, 'terminateSession');
      
      ClientSecurityManager.lockSession(userId);
      
      expect(terminateSessionSpy).toHaveBeenCalledWith(userId);
      
      consoleSpy.mockRestore();
      terminateSessionSpy.mockRestore();
    });
  });
});

console.log('✅ ClientSecurityManager test suite created - covers session locking, monitoring, activity tracking, and error recovery');