// lib/auth-manager.ts
// Cookie-Based Authentication Manager - No Token Storage
// Works with httpOnly cookies set by backend

import {
  AUTH_LOGIN_TIMESTAMP_KEY,
  AUTH_SESSION_ACTIVE_KEY,
  AUTH_USER_ID_KEY,
} from './auth-storage'
import { fetchAuthSession } from './client-auth-session'

export interface User {
  id: string;
  user_id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role?: string;
  [key: string]: any;
}

export class AuthenticationManager {
  private static instance: AuthenticationManager;
  private user: User | null = null;
  private authenticated: boolean = false;
  private isInitialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {
    // Don't initialize here - will be done synchronously on module load
  }

  public static getInstance(): AuthenticationManager {
    if (!AuthenticationManager.instance) {
      AuthenticationManager.instance = new AuthenticationManager();
      // Initialize immediately when instance is created
      AuthenticationManager.instance.initializeSync();
    }
    return AuthenticationManager.instance;
  }

  // CRITICAL: Synchronous initialization that happens immediately
  private initializeSync(): void {
    if (this.isInitialized || typeof window === 'undefined') {
      this.isInitialized = true;
      return;
    }

    // Recover only minimal same-tab markers from storage.
    // Full user objects remain in memory and are revalidated from the server.
    try {
      const hasActiveSession = sessionStorage.getItem(AUTH_SESSION_ACTIVE_KEY) === 'true';
      const userId =
        sessionStorage.getItem(AUTH_USER_ID_KEY) || localStorage.getItem(AUTH_USER_ID_KEY);

      if (hasActiveSession && userId) {
        this.user = { id: userId, user_id: userId, email: '' } as User;
        this.authenticated = true;
      } else {
        this.user = null;
        this.authenticated = false;
      }
    } catch {
      this.user = null;
      this.authenticated = false;
    }

    this.isInitialized = true;
  }

  // Ensure initialization before any operation
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      this.initializeSync();
    }
  }

  // Wait for initialization to complete (for async operations)
  public async waitForInitialization(): Promise<void> {
    if (this.isInitialized) return;

    if (!this.initializationPromise) {
      this.initializationPromise = new Promise<void>((resolve) => {
        this.initializeSync();
        resolve();
      });
    }

    return this.initializationPromise;
  }

  public login(userData: User): User {
    if (typeof window === 'undefined') return userData;

    this.ensureInitialized();

    // Ensure `name` is always present (synthesize from firstName/lastName if missing)
    if (!userData.name && (userData.firstName || userData.first_name)) {
      const first = userData.firstName || userData.first_name || '';
      const last = userData.lastName || userData.last_name || '';
      userData.name = `${first} ${last}`.trim();
    }

    // Store user data in memory
    this.user = userData;
    this.authenticated = true;

    const userId = userData.id || userData.user_id || '';
    const timestamp = Date.now().toString();

    // Persist only non-PII recovery markers. Profile/email stay in memory.
    localStorage.setItem(AUTH_USER_ID_KEY, userId);
    localStorage.setItem(AUTH_LOGIN_TIMESTAMP_KEY, timestamp);
    sessionStorage.setItem(AUTH_USER_ID_KEY, userId);
    sessionStorage.setItem(AUTH_LOGIN_TIMESTAMP_KEY, timestamp);
    sessionStorage.setItem(AUTH_SESSION_ACTIVE_KEY, 'true');

    // Keep a minimal PWA recovery marker for flows that need a user id before hydration.
    if (typeof window !== 'undefined') {
      try {
        import('./storage/pwa-storage').then(({ pwaStorage }) => {
          pwaStorage.setItemSync('userId', userId);
          pwaStorage.setItemSync('loginTimestamp', timestamp);
        });
      } catch {
        // pwaStorage not available
      }
    }

    // Emit login event
    window.dispatchEvent(new CustomEvent('auth:login', {
      detail: { user: userData }
    }));

    return userData;
  }

  public logout(): void {
    if (typeof window === 'undefined') return;

    this.ensureInitialized();

    // Clear user data
    this.user = null;
    this.authenticated = false;

    // Clear localStorage (only stores userId + loginTimestamp)
    localStorage.removeItem(AUTH_USER_ID_KEY);
    localStorage.removeItem(AUTH_LOGIN_TIMESTAMP_KEY);
    // Also remove legacy keys that may exist from before hardening
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userObject');

    // Clear sessionStorage
    sessionStorage.removeItem(AUTH_SESSION_ACTIVE_KEY);
    sessionStorage.removeItem(AUTH_USER_ID_KEY);
    sessionStorage.removeItem(AUTH_LOGIN_TIMESTAMP_KEY);
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userObject');

    // CRITICAL FIX: Also clear pwaStorage to stay in sync
    if (typeof window !== 'undefined') {
      try {
        // Dynamic import to avoid circular dependency
        import('./storage/pwa-storage').then(({ pwaStorage }) => {
          pwaStorage.clear();
        });
      } catch (error) {
        // pwaStorage not available
      }
    }

    // Emit logout event
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }

  // Silent logout: clears state and storage WITHOUT dispatching auth:logout.
  // Use for pre-login cleanup to avoid triggering the authenticated layout's
  // auth:logout listener which would redirect to "/" mid-login-attempt.
  public silentLogout(): void {
    if (typeof window === 'undefined') return;

    this.ensureInitialized();

    this.user = null;
    this.authenticated = false;

    localStorage.removeItem(AUTH_USER_ID_KEY);
    localStorage.removeItem(AUTH_LOGIN_TIMESTAMP_KEY);
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userObject');

    sessionStorage.removeItem(AUTH_SESSION_ACTIVE_KEY);
    sessionStorage.removeItem(AUTH_USER_ID_KEY);
    sessionStorage.removeItem(AUTH_LOGIN_TIMESTAMP_KEY);
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userObject');

    try {
      import('./storage/pwa-storage').then(({ pwaStorage }) => {
        pwaStorage.clear();
      });
    } catch {
      // pwaStorage not available
    }

    // Intentionally NO auth:logout event dispatch
  }

  public getAuthToken(): string | null {
    // Tokens are in httpOnly cookies now - not accessible to JS
    return null;
  }

  public getCurrentUser(): User | null {
    this.ensureInitialized();

    // If we have a user in memory and storage hasn't been explicitly cleared, return it
    // This prevents unnecessary re-checking of storage which can cause race conditions
    if (this.user) {
      // Quick check to ensure storage wasn't cleared externally
      if (typeof window !== 'undefined') {
        const hasStorageData =
          sessionStorage.getItem(AUTH_USER_ID_KEY) || localStorage.getItem(AUTH_USER_ID_KEY);
        if (!hasStorageData) {
          // Storage was cleared externally - clear memory cache
          this.user = null;
          this.authenticated = false;
          return null;
        }
      }
      return this.user;
    }

    // No user in memory - try to recover from storage
    if (typeof window !== 'undefined') {
      const hasActiveSession = sessionStorage.getItem(AUTH_SESSION_ACTIVE_KEY) === 'true';
      const userId =
        sessionStorage.getItem(AUTH_USER_ID_KEY) || localStorage.getItem(AUTH_USER_ID_KEY);

      if (hasActiveSession && userId) {
        // Same-tab minimal recovery — profile hydrated by refreshAuth().
        this.user = { id: userId, user_id: userId, email: '' } as User;
        this.authenticated = true;
        return this.user;
      }

      this.user = null;
      this.authenticated = false;
    }

    return this.user;
  }

  public getUserId(): string | null {
    this.ensureInitialized();

    // First ensure we have the latest user data
    this.getCurrentUser();

    if (this.user) {
      return this.user.id || this.user.user_id;
    }

    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(AUTH_USER_ID_KEY) || localStorage.getItem(AUTH_USER_ID_KEY);
    }

    return null;
  }

  public isAuthenticated(): boolean {
    this.ensureInitialized();

    // CRITICAL: Always check current user to ensure we have latest state
    // This prevents false negatives after hard refresh
    const user = this.getCurrentUser();

    // We're authenticated if we have a valid user with an ID
    const hasValidUser = !!(user && (user.id || user.user_id));

    // Update internal state if needed
    if (hasValidUser && !this.authenticated) {
      this.authenticated = true;
    } else if (!hasValidUser && this.authenticated) {
      this.authenticated = false;
    }

    return hasValidUser;
  }

  public setAuthenticated(value: boolean): void {
    this.ensureInitialized();
    this.authenticated = value;
  }

  public updateUser(updates: Partial<User>): User | null {
    this.ensureInitialized();
    if (!this.user) return null;

    this.user = { ...this.user, ...updates };

    // Ensure `name` is always present (synthesize from firstName/lastName if missing)
    if (!this.user.name && (this.user.firstName || this.user.first_name)) {
      const first = this.user.firstName || this.user.first_name || '';
      const last = this.user.lastName || this.user.last_name || '';
      this.user.name = `${first} ${last}`.trim();
    }

    if (typeof window !== 'undefined') {
      sessionStorage.setItem(AUTH_SESSION_ACTIVE_KEY, 'true');

      // Emit update event
      window.dispatchEvent(new CustomEvent('auth:userUpdated', {
        detail: { user: this.user }
      }));
    }

    return this.user;
  }

  public async refreshAuth(): Promise<User | null> {
    try {
      // SOTA AUTHENTICATION: Backend is source of truth
      // Step 1: Try to refresh the token first
      const refreshResponse = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (refreshResponse.ok) {
        // Token refreshed successfully, now get current session
        const data = await fetchAuthSession({ force: true })

        if (data?.user) {
          // Backend validated - sync localStorage with backend truth
          this.login(data.user);
          return this.user;
        }
      }

      // Step 2: If token refresh failed, try session check directly
      const data = await fetchAuthSession({ force: true })

      if (data?.user) {
        // Backend validated - sync localStorage with backend truth
        this.login(data.user);
        return this.user;
      }

      // Step 3: Backend says not authenticated (401/403)
      // Clear localStorage cache to stay in sync with backend
      // Don't auto-logout here - let calling code decide
      // This prevents clearing cache during temporary network issues
    } catch (error) {
      // Network error - don't modify localStorage
      // Let calling code handle fallback behavior
    }

    return null;
  }

  public getAuthHeaders(): Record<string, string> {
    // No Authorization header needed - cookies handle auth
    return {};
  }

  public getTokenExpiry(): { expired: boolean; expiresIn: number } {
    // We can't check httpOnly cookie expiry from JS
    // Assume valid if authenticated
    return {
      expired: !this.authenticated,
      expiresIn: this.authenticated ? 3600000 : 0 // 1 hour (60 * 60 * 1000 ms)
    };
  }
}

// CRITICAL: Initialize singleton immediately on module load to prevent race conditions
// This ensures auth state is recovered from storage before any code can check it
export const authManager = AuthenticationManager.getInstance();

// Force initialization to happen immediately if we're in the browser
if (typeof window !== 'undefined') {
  // This ensures the singleton is initialized synchronously before any other code runs
  authManager.isAuthenticated(); // This will trigger ensureInitialized()
}

// Export convenience functions
export const getCurrentUserId = () => authManager.getUserId();
export const getCurrentUser = () => authManager.getCurrentUser();
export const getAuthToken = () => authManager.getAuthToken(); // Always returns null now
export const isAuthenticated = () => authManager.isAuthenticated();
export const loginUser = (userData: User) => authManager.login(userData); // No token param!
export const logoutUser = () => authManager.logout();
export const silentLogoutUser = () => authManager.silentLogout();
export const updateUser = (updates: Partial<User>) => authManager.updateUser(updates);
export const refreshUser = () => authManager.refreshAuth();
export const getAuthHeaders = () => authManager.getAuthHeaders();
export const debugAuth = () => {
  if (typeof window === 'undefined') return;

  const user = authManager.getCurrentUser();

  // Debug logging disabled
};

// Export type
export type { User as NormalizedUser };
