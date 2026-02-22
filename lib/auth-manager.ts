// lib/auth-manager.ts
// Cookie-Based Authentication Manager - No Token Storage
// Works with httpOnly cookies set by backend

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

    // Recovery priority: sessionStorage (full user) > localStorage (userId only)
    // localStorage no longer stores userObject/userEmail for security
    try {
      // Try sessionStorage first (has full user for same-tab recovery)
      const storedUser = sessionStorage.getItem('userObject');
      const sessionUserId = sessionStorage.getItem('userId');

      if (storedUser && sessionUserId) {
        try {
          this.user = JSON.parse(storedUser);
          this.authenticated = true;
        } catch {
          this.user = null;
          this.authenticated = false;
        }
      } else {
        // Fallback to localStorage (only has userId + loginTimestamp)
        const userId = localStorage.getItem('userId');
        if (userId) {
          // Minimal user — profile will be hydrated by refreshAuth()
          this.user = { id: userId, user_id: userId, email: '' } as User;
          this.authenticated = true;
        } else {
          this.user = null;
          this.authenticated = false;
        }
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

    // Store user data in memory and localStorage
    this.user = userData;
    this.authenticated = true;

    // DUAL STORAGE: Write to both localStorage AND sessionStorage
    // localStorage: Persists across hard refresh and new tabs
    // sessionStorage: Backup for single session, more secure for shared computers
    const userEmail = userData.email || '';
    const userId = userData.id || userData.user_id || '';
    const userObjectStr = JSON.stringify(userData);
    const timestamp = Date.now().toString();

    // localStorage: ONLY userId + loginTimestamp (no PII / full profile)
    localStorage.setItem('userId', userId);
    localStorage.setItem('loginTimestamp', timestamp);

    // sessionStorage: full user for same-tab recovery (dies with tab close)
    sessionStorage.setItem('userEmail', userEmail);
    sessionStorage.setItem('userId', userId);
    sessionStorage.setItem('userObject', userObjectStr);
    sessionStorage.setItem('loginTimestamp', timestamp);

    // CRITICAL FIX: Also sync to pwaStorage for lib/api.ts compatibility
    // lib/api.ts reads from pwaStorage via secure-api's getCurrentUserId()
    if (typeof window !== 'undefined') {
      try {
        // Dynamic import to avoid circular dependency
        import('./storage/pwa-storage').then(({ pwaStorage }) => {
          pwaStorage.setItemSync('userEmail', userEmail);
          pwaStorage.setItemSync('userId', userId);
          pwaStorage.setItemSync('userObject', userObjectStr);
          pwaStorage.setItemSync('loginTimestamp', timestamp);
        });
      } catch (error) {
        // pwaStorage not available - dual storage will handle fallback
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
    localStorage.removeItem('userId');
    localStorage.removeItem('loginTimestamp');
    // Also remove legacy keys that may exist from before hardening
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userObject');

    // Clear sessionStorage
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userObject');
    sessionStorage.removeItem('loginTimestamp');

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
        const hasStorageData = sessionStorage.getItem('userId') || localStorage.getItem('userId');
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
      // sessionStorage has full user (same tab), localStorage only has userId
      const storedUser = sessionStorage.getItem('userObject');
      const userId = sessionStorage.getItem('userId') || localStorage.getItem('userId');

      if (storedUser && userId) {
        try {
          this.user = JSON.parse(storedUser);
          this.authenticated = true;
          return this.user;
        } catch {
          // Fall through to minimal recovery
        }
      }

      if (userId) {
        // Minimal user — profile hydrated by refreshAuth()
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
      return sessionStorage.getItem('userId') || localStorage.getItem('userId');
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

    if (typeof window !== 'undefined') {
      localStorage.setItem('userObject', JSON.stringify(this.user));

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
        const sessionResponse = await fetch('/api/auth/session', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (sessionResponse.ok) {
          const data = await sessionResponse.json();
          if (data.user) {
            // Backend validated - sync localStorage with backend truth
            this.login(data.user);
            return this.user;
          }
        }
      }

      // Step 2: If token refresh failed, try session check directly
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          // Backend validated - sync localStorage with backend truth
          this.login(data.user);
          return this.user;
        }
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