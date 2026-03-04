/**
 * Auth Flow Unit Tests
 *
 * Tests the centralized auth flow in unified-auth-manager.ts:
 *
 * 1. login() calls secureApi.post with requireAuth=false
 *    → prevents the auth popup from appearing when CSRF/403 occurs during login
 *
 * 2. login() uses silentClearClientState() instead of clearAuthSystems()
 *    → prevents spurious auth:logout events during a fresh login attempt
 *
 * 3. verifyMFA() calls secureApi.post with requireAuth=false
 *    → prevents the auth popup during mid-auth MFA verification
 *
 * 4. Full login → MFA flow works end-to-end
 *
 * NOTE: jest.mock() factories are hoisted before const declarations,
 * so we use jest.fn() directly inside factories and retrieve references
 * via require() after the mocks are in place.
 */

// ── mocks (factories must not reference outer-scope const variables) ──────────

jest.mock('@/lib/auth-manager', () => ({
  loginUser: jest.fn((user: any) => user),
  logoutUser: jest.fn(),
  silentLogoutUser: jest.fn(), // used by silentClearClientState() — must NOT dispatch auth:logout
  getCurrentUser: jest.fn(() => null),
  isAuthenticated: jest.fn(() => false),
  authManager: {
    isAuthenticated: jest.fn(() => false),
    setAuthenticated: jest.fn(),
    getCurrentUser: jest.fn(() => null),
    getUserId: jest.fn(() => null),
    waitForInitialization: jest.fn(() => Promise.resolve()),
    login: jest.fn((user: any) => user),
    logout: jest.fn(),
  },
}));

// Track all post calls so we can assert requireAuth value
const postCallLog: Array<{ endpoint: string; data: any; requireAuth: boolean }> = [];

jest.mock('@/lib/secure-api', () => ({
  secureApi: {
    post: jest.fn((endpoint: string, data: any, requireAuth = true) => {
      postCallLog.push({ endpoint, data, requireAuth });

      if (endpoint.includes('/api/auth/login')) {
        return Promise.resolve({
          requires_mfa: true,
          mfa_token: 'frontend-mfa-token-xyz',
          message: 'MFA code sent',
        });
      }
      if (endpoint.includes('/api/auth/mfa/verify')) {
        return Promise.resolve({
          success: true,
          user: {
            id: 'user-123',
            user_id: 'user-123',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'user',
          },
          message: 'Login successful',
        });
      }
      return Promise.resolve({});
    }),
    get: jest.fn(() => Promise.resolve({ user: null })),
  },
  setAuthState: jest.fn(),
  isAuthenticated: jest.fn(() => false),
  registerAuthPopupCallback: jest.fn(),
  registerStepUpChallengeHandler: jest.fn(),
}));

jest.mock('@/lib/device-trust', () => ({
  DeviceTrustManager: {
    removeTrust: jest.fn(),
    isTrusted: jest.fn(() => false),
  },
}));

jest.mock('@/lib/storage/pwa-storage', () => ({
  pwaStorage: {
    getItemSync: jest.fn(() => null),
    setItemSync: jest.fn(),
    removeItemSync: jest.fn(),
    clear: jest.fn(),
  },
}));

jest.mock('@/lib/secure-logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// ── test lifecycle ────────────────────────────────────────────────────────────

beforeAll(() => {
  Object.defineProperty(window, 'caches', {
    value: { keys: jest.fn(() => Promise.resolve([])) },
    writable: true,
  });
  Object.defineProperty(navigator, 'serviceWorker', {
    value: { controller: null },
    writable: true,
  });
});

beforeEach(() => {
  postCallLog.length = 0;
  jest.clearAllMocks();
  // Re-apply the default mock implementations after clearAllMocks
  const { secureApi } = require('@/lib/secure-api');
  (secureApi.post as jest.Mock).mockImplementation(
    (endpoint: string, data: any, requireAuth = true) => {
      postCallLog.push({ endpoint, data, requireAuth });
      if (endpoint.includes('/api/auth/login')) {
        return Promise.resolve({
          requires_mfa: true,
          mfa_token: 'frontend-mfa-token-xyz',
          message: 'MFA code sent',
        });
      }
      if (endpoint.includes('/api/auth/mfa/verify')) {
        return Promise.resolve({
          success: true,
          user: {
            id: 'user-123',
            user_id: 'user-123',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'user',
          },
          message: 'Login successful',
        });
      }
      if (endpoint.includes('/api/auth/session')) {
        return Promise.resolve({ user: null });
      }
      return Promise.resolve({});
    }
  );
  const { authManager } = require('@/lib/auth-manager');
  (authManager.getCurrentUser as jest.Mock).mockReturnValue(null);
  const { getCurrentUser } = require('@/lib/auth-manager');
  (getCurrentUser as jest.Mock).mockReturnValue(null);
});

// ── subject under test ────────────────────────────────────────────────────────

import { unifiedAuthManager } from '@/lib/unified-auth-manager';

// ── tests ─────────────────────────────────────────────────────────────────────

describe('UnifiedAuthManager.login()', () => {
  test('calls secureApi.post with requireAuth=false', async () => {
    await unifiedAuthManager.login('test@example.com', 'password123');

    const loginCall = postCallLog.find(c => c.endpoint.includes('/api/auth/login'));
    expect(loginCall).toBeDefined();
    expect(loginCall!.requireAuth).toBe(false);
  });

  test('returns requiresMFA=true when backend requires MFA', async () => {
    const result = await unifiedAuthManager.login('test@example.com', 'password123');

    expect(result.success).toBe(true);
    expect(result.requiresMFA).toBe(true);
    expect(result.mfaToken).toBe('frontend-mfa-token-xyz');
  });

  test('does NOT dispatch auth:logout event during login', async () => {
    const logoutFired: string[] = [];
    const handler = () => logoutFired.push('fired');
    window.addEventListener('auth:logout', handler);

    await unifiedAuthManager.login('test@example.com', 'password123');

    window.removeEventListener('auth:logout', handler);
    expect(logoutFired).toHaveLength(0);
  });

  test('returns error on failed login without triggering auth popup', async () => {
    const { secureApi } = require('@/lib/secure-api');
    (secureApi.post as jest.Mock).mockResolvedValueOnce({
      success: false,
      error: 'Invalid credentials',
    });

    const result = await unifiedAuthManager.login('test@example.com', 'wrong-password');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid credentials');
  });

  test('returns error on CSRF failure without triggering auth popup', async () => {
    const { secureApi } = require('@/lib/secure-api');
    (secureApi.post as jest.Mock).mockResolvedValueOnce({
      error: 'CSRF validation failed',
      code: 'CSRF_TOKEN_INVALID',
    });

    const result = await unifiedAuthManager.login('test@example.com', 'password123');

    // Should return a clean error, not throw or show popup
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });
});

describe('UnifiedAuthManager.verifyMFA()', () => {
  beforeEach(async () => {
    // Seed the internal mfaEmail via a login call
    await unifiedAuthManager.login('test@example.com', 'password123');
    postCallLog.length = 0;
  });

  test('calls secureApi.post with requireAuth=false', async () => {
    await unifiedAuthManager.verifyMFA('123456', 'frontend-mfa-token-xyz');

    const mfaCall = postCallLog.find(c => c.endpoint.includes('/api/auth/mfa/verify'));
    expect(mfaCall).toBeDefined();
    expect(mfaCall!.requireAuth).toBe(false);
  });

  test('sends the stored mfaEmail, code, and token to the verify endpoint', async () => {
    await unifiedAuthManager.verifyMFA('123456', 'frontend-mfa-token-xyz');

    const mfaCall = postCallLog.find(c => c.endpoint.includes('/api/auth/mfa/verify'));
    expect(mfaCall!.data.email).toBe('test@example.com');
    expect(mfaCall!.data.mfa_code).toBe('123456');
    expect(mfaCall!.data.mfa_token).toBe('frontend-mfa-token-xyz');
  });

  test('returns success with user object on valid code', async () => {
    const result = await unifiedAuthManager.verifyMFA('123456', 'frontend-mfa-token-xyz');

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user!.email).toBe('test@example.com');
  });

  test('returns error on invalid code without triggering auth popup', async () => {
    const { secureApi } = require('@/lib/secure-api');
    (secureApi.post as jest.Mock).mockResolvedValueOnce({
      success: false,
      error: 'Invalid verification code',
    });

    const result = await unifiedAuthManager.verifyMFA('000000', 'frontend-mfa-token-xyz');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid verification code');
  });
});

describe('Full login → MFA flow', () => {
  test('end-to-end: both steps use requireAuth=false', async () => {
    const loginResult = await unifiedAuthManager.login('user@example.com', 'pass');
    expect(loginResult.requiresMFA).toBe(true);

    const mfaResult = await unifiedAuthManager.verifyMFA('654321', loginResult.mfaToken!);
    expect(mfaResult.success).toBe(true);
    expect(mfaResult.user!.id).toBe('user-123');

    const loginCall = postCallLog.find(c => c.endpoint.includes('/api/auth/login'));
    const mfaCall = postCallLog.find(c => c.endpoint.includes('/api/auth/mfa/verify'));
    expect(loginCall!.requireAuth).toBe(false);
    expect(mfaCall!.requireAuth).toBe(false);
  });

  test('direct login (no MFA) sets auth state correctly', async () => {
    const { secureApi } = require('@/lib/secure-api');
    (secureApi.post as jest.Mock).mockImplementationOnce(
      (endpoint: string, data: any, requireAuth = true) => {
        postCallLog.push({ endpoint, data, requireAuth });
        return Promise.resolve({
          success: true,
          user: {
            id: 'direct-456',
            user_id: 'direct-456',
            email: 'direct@example.com',
            firstName: 'Direct',
            lastName: 'User',
            role: 'user',
          },
        });
      }
    );

    const result = await unifiedAuthManager.login('direct@example.com', 'password');

    expect(result.success).toBe(true);
    expect(result.requiresMFA).toBeUndefined();
    expect(result.user!.email).toBe('direct@example.com');

    const { loginUser } = require('@/lib/auth-manager');
    expect(loginUser).toHaveBeenCalled();
  });
});
