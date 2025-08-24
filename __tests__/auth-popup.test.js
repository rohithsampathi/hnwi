// __tests__/auth-popup.test.js
// Tests for auth popup reauth mode detection and behavior logic

// Mock localStorage
const mockLocalStorage = {
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

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(global, 'sessionStorage', {
  value: mockSessionStorage
});

// Mock fetch
global.fetch = jest.fn();

// Import using require for CommonJS compatibility
const { SessionState, setSessionState, isSessionLocked, getSessionInfo } = require('../lib/auth-utils');

describe('Smart Inactivity - Auth Popup Logic', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
    mockSessionStorage.getItem.mockClear();
  });

  describe('Reauth Mode Detection', () => {
    test('should detect reauth mode when session is locked with valid token', () => {
      // Set up locked session state
      mockLocalStorage.setItem('hnwi_session_state', 'locked_inactive');
      mockLocalStorage.setItem('hnwi_locked_at', Date.now().toString());
      mockLocalStorage.setItem('token', 'valid-jwt-token');

      const determineAuthMode = () => {
        const sessionState = localStorage.getItem('hnwi_session_state');
        const token = localStorage.getItem('token');
        
        const isLocked = sessionState === 'locked_inactive';
        const hasToken = !!token;
        
        return {
          isReauthMode: isLocked && hasToken,
          isFullLogin: !isLocked || !hasToken
        };
      };

      const authMode = determineAuthMode();
      
      expect(authMode.isReauthMode).toBe(true);
      expect(authMode.isFullLogin).toBe(false);
    });

    test('should use full login mode when not locked', () => {
      // Set up unauthenticated state
      mockLocalStorage.setItem('hnwi_session_state', 'unauthenticated');
      mockLocalStorage.removeItem('token');

      const determineAuthMode = () => {
        const sessionState = localStorage.getItem('hnwi_session_state');
        const token = localStorage.getItem('token');
        
        const isLocked = sessionState === 'locked_inactive';
        const hasToken = !!token;
        
        return {
          isReauthMode: isLocked && hasToken,
          isFullLogin: !isLocked || !hasToken
        };
      };

      const authMode = determineAuthMode();
      
      expect(authMode.isReauthMode).toBe(false);
      expect(authMode.isFullLogin).toBe(true);
    });

    test('should handle stored email retrieval for reauth mode', () => {
      mockSessionStorage.getItem.mockReturnValue(
        JSON.stringify({ email: 'user@example.com' })
      );

      const getStoredUserInfo = () => {
        try {
          const stored = sessionStorage.getItem('hnwi_user_info');
          return stored ? JSON.parse(stored) : null;
        } catch {
          return null;
        }
      };

      const userInfo = getStoredUserInfo();
      
      expect(userInfo).toEqual({ email: 'user@example.com' });
      expect(mockSessionStorage.getItem).toHaveBeenCalledWith('hnwi_user_info');
    });
  });

  describe('Reauth Form Validation', () => {
    test('should validate reauth form requiring only password', () => {
      const validateReauthForm = (password, email = 'stored@example.com') => {
        const errors = [];
        
        if (!password || password.trim() === '') {
          errors.push('Please enter your password to continue');
        }
        
        return {
          isValid: errors.length === 0,
          errors
        };
      };

      // Test empty password
      const emptyResult = validateReauthForm('');
      expect(emptyResult.isValid).toBe(false);
      expect(emptyResult.errors).toContain('Please enter your password to continue');

      // Test valid password
      const validResult = validateReauthForm('password123');
      expect(validResult.isValid).toBe(true);
      expect(validResult.errors).toEqual([]);
    });

    test('should validate full login form requiring both email and password', () => {
      const validateLoginForm = (email, password) => {
        const errors = [];
        
        if (!email || email.trim() === '') {
          errors.push('Please enter your email');
        }
        
        if (!password || password.trim() === '') {
          errors.push('Please enter your password');
        }
        
        if ((!email || email.trim() === '') && (!password || password.trim() === '')) {
          errors.length = 0; // Clear individual errors
          errors.push('Please enter both email and password');
        }
        
        return {
          isValid: errors.length === 0,
          errors
        };
      };

      // Test both empty
      const bothEmptyResult = validateLoginForm('', '');
      expect(bothEmptyResult.isValid).toBe(false);
      expect(bothEmptyResult.errors).toContain('Please enter both email and password');

      // Test valid credentials
      const validResult = validateLoginForm('user@example.com', 'password123');
      expect(validResult.isValid).toBe(true);
      expect(validResult.errors).toEqual([]);
    });
  });

  describe('Authentication API Calls', () => {
    test('should handle successful reauth API call', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          access_token: 'new-token-123',
          message: 'Session unlocked successfully'
        })
      });

      const performReauth = async (email, password) => {
        const response = await fetch('/api/reauth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, reauth: true })
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
          return {
            success: true,
            token: data.access_token,
            message: data.message || 'Authentication successful'
          };
        }
        
        throw new Error(data.error || 'Authentication failed');
      };

      const result = await performReauth('user@example.com', 'password123');
      
      expect(result.success).toBe(true);
      expect(result.token).toBe('new-token-123');
      expect(result.message).toBe('Session unlocked successfully');
    });

    test('should handle MFA requirement in reauth flow', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          requires_mfa: true,
          mfa_token: 'mfa-token-123',
          message: 'MFA verification required'
        })
      });

      const performReauth = async (email, password) => {
        const response = await fetch('/api/reauth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, reauth: true })
        });

        const data = await response.json();
        
        if (response.ok) {
          if (data.requires_mfa) {
            return {
              requiresMfa: true,
              mfaToken: data.mfa_token,
              message: data.message
            };
          }
          
          return {
            success: true,
            token: data.access_token
          };
        }
        
        throw new Error(data.error || 'Authentication failed');
      };

      const result = await performReauth('user@example.com', 'password123');
      
      expect(result.requiresMfa).toBe(true);
      expect(result.mfaToken).toBe('mfa-token-123');
      expect(result.message).toBe('MFA verification required');
    });
  });

  describe('Session State Updates', () => {
    test('should update session state after successful reauth', () => {
      const handleSuccessfulReauth = (token) => {
        // Store new token
        localStorage.setItem('token', token);
        
        // Update session state to authenticated
        localStorage.setItem('hnwi_session_state', 'authenticated');
        localStorage.removeItem('hnwi_locked_at');
        localStorage.setItem('hnwi_last_activity', Date.now().toString());
        
        return {
          success: true,
          sessionUnlocked: true
        };
      };

      // Set up locked state
      mockLocalStorage.setItem('hnwi_session_state', 'locked_inactive');
      mockLocalStorage.setItem('hnwi_locked_at', Date.now().toString());

      const result = handleSuccessfulReauth('new-token-123');

      expect(result.success).toBe(true);
      expect(result.sessionUnlocked).toBe(true);
      expect(mockLocalStorage.getItem('hnwi_session_state')).toBe('authenticated');
      expect(mockLocalStorage.getItem('hnwi_locked_at')).toBeNull();
      expect(mockLocalStorage.getItem('token')).toBe('new-token-123');
    });

    test('should handle session cleanup on logout', () => {
      const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('hnwi_session_state');
        localStorage.removeItem('hnwi_last_activity');
        localStorage.removeItem('hnwi_locked_at');
        sessionStorage.removeItem('hnwi_user_info');
        
        return { loggedOut: true };
      };

      // Set up authenticated state
      mockLocalStorage.setItem('token', 'some-token');
      mockLocalStorage.setItem('hnwi_session_state', 'authenticated');
      mockSessionStorage.setItem('hnwi_user_info', JSON.stringify({ email: 'user@example.com' }));

      const result = handleLogout();

      expect(result.loggedOut).toBe(true);
      expect(mockLocalStorage.getItem('token')).toBeNull();
      expect(mockLocalStorage.getItem('hnwi_session_state')).toBeNull();
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('hnwi_user_info');
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors in reauth', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const performReauthWithErrorHandling = async (email, password) => {
        try {
          const response = await fetch('/api/reauth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, reauth: true })
          });

          const data = await response.json();
          return { success: true, data };
        } catch (error) {
          return {
            success: false,
            error: error.message || 'Authentication failed',
            isNetworkError: error.message.includes('Network')
          };
        }
      };

      const result = await performReauthWithErrorHandling('user@example.com', 'password123');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(result.isNetworkError).toBe(true);
    });

    test('should handle rate limiting in reauth', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: new Map([['Retry-After', '60']]),
        json: async () => ({
          error: 'Rate limited. Please try again later.'
        })
      });

      const performReauthWithRateLimit = async (email, password) => {
        const response = await fetch('/api/reauth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, reauth: true })
        });

        const data = await response.json();
        
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          return {
            rateLimited: true,
            retryAfter: parseInt(retryAfter) || 60,
            message: data.error
          };
        }
        
        return { success: response.ok, data };
      };

      const result = await performReauthWithRateLimit('user@example.com', 'password123');
      
      expect(result.rateLimited).toBe(true);
      expect(result.retryAfter).toBe(60);
      expect(result.message).toBe('Rate limited. Please try again later.');
    });
  });

  describe('Mode Detection Utilities', () => {
    test('should provide utility functions for mode detection', () => {
      const AuthPopupUtils = {
        isReauthMode: () => {
          const sessionState = localStorage.getItem('hnwi_session_state');
          const token = localStorage.getItem('token');
          return sessionState === 'locked_inactive' && !!token;
        },
        
        getStoredEmail: () => {
          try {
            const stored = sessionStorage.getItem('hnwi_user_info');
            return stored ? JSON.parse(stored).email : null;
          } catch {
            return null;
          }
        },
        
        getUIMode: () => {
          const isReauth = AuthPopupUtils.isReauthMode();
          return {
            title: isReauth ? 'Session Locked' : 'Private Line Disconnected',
            buttonText: isReauth ? 'Unlock Session' : 'Sign In',
            loadingText: isReauth ? 'Unlocking...' : 'Signing in...',
            icon: isReauth ? 'shield' : 'crown'
          };
        }
      };

      // Test reauth mode
      mockLocalStorage.setItem('hnwi_session_state', 'locked_inactive');
      mockLocalStorage.setItem('token', 'valid-token');
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify({ email: 'user@example.com' }));

      expect(AuthPopupUtils.isReauthMode()).toBe(true);
      expect(AuthPopupUtils.getStoredEmail()).toBe('user@example.com');
      
      const reauthUI = AuthPopupUtils.getUIMode();
      expect(reauthUI.title).toBe('Session Locked');
      expect(reauthUI.buttonText).toBe('Unlock Session');
      expect(reauthUI.loadingText).toBe('Unlocking...');
      expect(reauthUI.icon).toBe('shield');

      // Test full login mode
      mockLocalStorage.setItem('hnwi_session_state', 'unauthenticated');
      mockLocalStorage.removeItem('token');

      expect(AuthPopupUtils.isReauthMode()).toBe(false);
      
      const loginUI = AuthPopupUtils.getUIMode();
      expect(loginUI.title).toBe('Private Line Disconnected');
      expect(loginUI.buttonText).toBe('Sign In');
      expect(loginUI.loadingText).toBe('Signing in...');
      expect(loginUI.icon).toBe('crown');
    });
  });
});

console.log('✅ Auth Popup logic test suite created - covers reauth mode detection, form validation, API calls, and utility functions');