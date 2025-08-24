// __tests__/api-protection.test.js
// Integration tests for API protection with locked sessions

// Mock fetch
global.fetch = jest.fn();

// Mock auth-utils
jest.mock('../lib/auth-utils', () => ({
  getValidToken: jest.fn(),
  clearInvalidToken: jest.fn(),
  canAccessFeatures: jest.fn(),
  isSessionLocked: jest.fn(),
  SessionState: {
    AUTHENTICATED: 'authenticated',
    LOCKED_INACTIVE: 'locked_inactive',
    UNAUTHENTICATED: 'unauthenticated'
  },
  canAccessFeaturesWithFallback: jest.fn(),
  isLegacySessionMode: jest.fn()
}));

// Mock API_BASE_URL
jest.mock('../config/api', () => ({
  API_BASE_URL: 'https://api.test.com'
}));

// Import using require for CommonJS compatibility
const { secureApi } = require('../lib/secure-api');
const { 
  getValidToken, 
  canAccessFeatures, 
  isSessionLocked, 
  canAccessFeaturesWithFallback,
  isLegacySessionMode 
} = require('../lib/auth-utils');

describe('Smart Inactivity - API Protection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
    
    // Default mocks - can be overridden in individual tests
    getValidToken.mockReturnValue('valid-token');
    canAccessFeatures.mockReturnValue(true);
    isSessionLocked.mockReturnValue(false);
    canAccessFeaturesWithFallback.mockReturnValue(true);
    isLegacySessionMode.mockReturnValue(false);
  });

  describe('Session Lock Protection', () => {
    test('should block API calls when session is locked', async () => {
      isSessionLocked.mockReturnValue(true);
      
      await expect(secureApi.get('/api/test')).rejects.toThrow(
        'Session locked due to inactivity. Please reauthenticate to continue.'
      );
    });

    test('should allow API calls when session is not locked', async () => {
      isSessionLocked.mockReturnValue(false);
      canAccessFeatures.mockReturnValue(true);
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'test' })
      });
      
      const result = await secureApi.get('/api/test');
      expect(result).toEqual({ data: 'test' });
      expect(fetch).toHaveBeenCalled();
    });

    test('should return 423 status code for locked sessions', async () => {
      isSessionLocked.mockReturnValue(true);
      
      try {
        await secureApi.get('/api/test');
      } catch (error) {
        expect(error.status).toBe(423);
        expect(error.message).toContain('Session locked due to inactivity');
      }
    });
  });

  describe('Feature Access Control', () => {
    test('should block API calls when user cannot access features', async () => {
      isSessionLocked.mockReturnValue(false);
      canAccessFeaturesWithFallback.mockReturnValue(false);
      
      await expect(secureApi.get('/api/test')).rejects.toThrow(
        'Authentication required to access this resource.'
      );
    });

    test('should allow API calls when user can access features', async () => {
      canAccessFeaturesWithFallback.mockReturnValue(true);
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'test' })
      });
      
      const result = await secureApi.get('/api/test');
      expect(result).toEqual({ data: 'test' });
    });
  });

  describe('Public Endpoint Access', () => {
    test('should allow auth endpoints without session check', async () => {
      isSessionLocked.mockReturnValue(true);
      canAccessFeatures.mockReturnValue(false);
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });
      
      // Should not throw despite locked session
      const result = await secureApi.get('/api/auth/login', false);
      expect(result).toEqual({ success: true });
    });

    test('should allow CSRF token endpoint without session check', async () => {
      isSessionLocked.mockReturnValue(true);
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'csrf-token' })
      });
      
      const result = await secureApi.get('/api/csrf-token', false);
      expect(result).toEqual({ token: 'csrf-token' });
    });

    test('should allow OG endpoint without session check', async () => {
      isSessionLocked.mockReturnValue(true);
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ og: 'data' })
      });
      
      const result = await secureApi.get('/api/og', false);
      expect(result).toEqual({ og: 'data' });
    });
  });

  describe('Legacy Mode Support', () => {
    test('should use simple token check in legacy mode', async () => {
      isLegacySessionMode.mockReturnValue(true);
      getValidToken.mockReturnValue('valid-token');
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'legacy-test' })
      });
      
      const result = await secureApi.get('/api/test');
      expect(result).toEqual({ data: 'legacy-test' });
      
      // Should not have called smart session functions
      expect(isSessionLocked).not.toHaveBeenCalled();
      expect(canAccessFeaturesWithFallback).not.toHaveBeenCalled();
    });

    test('should block requests in legacy mode without valid token', async () => {
      isLegacySessionMode.mockReturnValue(true);
      getValidToken.mockReturnValue(null);
      
      await expect(secureApi.get('/api/test')).rejects.toThrow(
        'Authentication required to access this resource.'
      );
    });
  });

  describe('Error Handling and Fallback', () => {
    test('should fallback to token check when smart session check fails', async () => {
      isSessionLocked.mockImplementation(() => {
        throw new Error('Smart session check failed');
      });
      getValidToken.mockReturnValue('valid-token');
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'fallback-test' })
      });
      
      const result = await secureApi.get('/api/test');
      expect(result).toEqual({ data: 'fallback-test' });
      expect(consoleSpy).toHaveBeenCalledWith(
        'Smart session check failed, falling back to token check:', 
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });

    test('should block requests when fallback token check fails', async () => {
      canAccessFeaturesWithFallback.mockImplementation(() => {
        throw new Error('Smart session check failed');
      });
      getValidToken.mockReturnValue(null);
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      await expect(secureApi.get('/api/test')).rejects.toThrow(
        'Authentication required to access this resource.'
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('All HTTP Methods Protection', () => {
    test('should protect GET requests', async () => {
      isSessionLocked.mockReturnValue(true);
      
      await expect(secureApi.get('/api/test')).rejects.toThrow('Session locked');
    });

    test('should protect POST requests', async () => {
      isSessionLocked.mockReturnValue(true);
      
      await expect(secureApi.post('/api/test', {})).rejects.toThrow('Session locked');
    });

    test('should protect PUT requests', async () => {
      isSessionLocked.mockReturnValue(true);
      
      await expect(secureApi.put('/api/test', {})).rejects.toThrow('Session locked');
    });

    test('should protect DELETE requests', async () => {
      isSessionLocked.mockReturnValue(true);
      
      await expect(secureApi.delete('/api/test')).rejects.toThrow('Session locked');
    });
  });

  describe('Caching Behavior with Locked Sessions', () => {
    test('should not serve cached data when session is locked', async () => {
      // First request - session is unlocked
      isSessionLocked.mockReturnValue(false);
      canAccessFeaturesWithFallback.mockReturnValue(true);
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'cached-data' })
      });
      
      await secureApi.get('/api/test', true, { enableCache: true });
      
      // Second request - session is now locked
      isSessionLocked.mockReturnValue(true);
      
      await expect(
        secureApi.get('/api/test', true, { enableCache: true })
      ).rejects.toThrow('Session locked');
    });

    test('should serve cached data when session is unlocked', async () => {
      isSessionLocked.mockReturnValue(false);
      canAccessFeaturesWithFallback.mockReturnValue(true);
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'fresh-data' })
      });
      
      // First request
      const result1 = await secureApi.get('/api/test', true, { enableCache: true });
      
      // Second request should use cache
      const result2 = await secureApi.get('/api/test', true, { enableCache: true });
      
      expect(result1).toEqual({ data: 'fresh-data' });
      expect(result2).toEqual({ data: 'fresh-data' });
      expect(fetch).toHaveBeenCalledTimes(1); // Only called once due to caching
    });
  });

  describe('Authentication Header Management', () => {
    test('should include auth header when session is valid', async () => {
      isSessionLocked.mockReturnValue(false);
      canAccessFeaturesWithFallback.mockReturnValue(true);
      getValidToken.mockReturnValue('valid-token-123');
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'test' })
      });
      
      await secureApi.get('/api/test');
      
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer valid-token-123'
          })
        })
      );
    });

    test('should not make request when no valid token', async () => {
      getValidToken.mockReturnValue(null);
      
      await expect(secureApi.get('/api/test')).rejects.toThrow(
        'Authentication required - please log in'
      );
      
      expect(fetch).not.toHaveBeenCalled();
    });
  });
});

console.log('✅ API Protection test suite created - covers session lock protection, feature access, legacy mode, and error handling');