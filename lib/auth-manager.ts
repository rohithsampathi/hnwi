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

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  public static getInstance(): AuthenticationManager {
    if (!AuthenticationManager.instance) {
      AuthenticationManager.instance = new AuthenticationManager();
    }
    return AuthenticationManager.instance;
  }

  private initialize(): void {
    if (typeof window === 'undefined') return;

    // Try to recover user from localStorage (changed from sessionStorage for hard refresh persistence)
    const storedUser = localStorage.getItem('userObject');

    if (storedUser) {
      try {
        this.user = JSON.parse(storedUser);
        // If we have user data in localStorage, we're authenticated
        // (the backend cookies will validate on API calls)
        this.authenticated = true;
      } catch (error) {
        // Failed to parse stored user;
      }
    }
  }

  public login(userData: User): User {
    if (typeof window === 'undefined') return userData;

    // Store user data in memory and localStorage
    this.user = userData;
    this.authenticated = true;

    // Store user data in localStorage (changed from sessionStorage for hard refresh persistence)
    localStorage.setItem('userEmail', userData.email || '');
    localStorage.setItem('userId', userData.id || userData.user_id || '');
    localStorage.setItem('userObject', JSON.stringify(userData));

    // CRITICAL FIX: Also sync to pwaStorage for lib/api.ts compatibility
    // lib/api.ts reads from pwaStorage via secure-api's getCurrentUserId()
    if (typeof window !== 'undefined') {
      try {
        // Dynamic import to avoid circular dependency
        import('./storage/pwa-storage').then(({ pwaStorage }) => {
          pwaStorage.setItemSync('userEmail', userData.email || '');
          pwaStorage.setItemSync('userId', userData.id || userData.user_id || '');
          pwaStorage.setItemSync('userObject', JSON.stringify(userData));
        });
      } catch (error) {
        // pwaStorage not available - sessionStorage will be used as fallback
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

    // Clear user data
    this.user = null;
    this.authenticated = false;

    // Clear all storage (including login timestamp)
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('userObject');

    // Also clear any legacy sessionStorage items
    sessionStorage.clear();

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
    // Always check localStorage first to ensure we have the latest data
    // This is important for navigation between pages and hard refreshes
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('userObject');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Update in-memory cache if localStorage has newer data
          if (!this.user || JSON.stringify(this.user) !== storedUser) {
            this.user = parsedUser;
            this.authenticated = true;
          }
        } catch (error) {
          // Failed to parse stored user;
        }
      } else {
        // No user in localStorage - clear memory cache
        this.user = null;
        this.authenticated = false;
      }
    }
    return this.user;
  }

  public getUserId(): string | null {
    // First ensure we have the latest user data
    this.getCurrentUser();

    if (this.user) {
      return this.user.id || this.user.user_id;
    }

    if (typeof window !== 'undefined') {
      return localStorage.getItem('userId');
    }

    return null;
  }

  public isAuthenticated(): boolean {
    // Check if we have user data which indicates authentication
    const user = this.getCurrentUser();
    return this.authenticated || !!user;
  }

  public setAuthenticated(value: boolean): void {
    this.authenticated = value;
  }

  public ensureInitialized(): void {
    // No-op for compatibility
  }

  public updateUser(updates: Partial<User>): User | null {
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
      // First try to refresh the token
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
            this.login(data.user);
            return this.user;
          }
        }
      }

      // If token refresh failed, try session check directly
      const response = await fetch('/api/auth/session', {
        credentials: 'include', // Send cookies
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();

        if (data.user) {
          this.login(data.user);
          return this.user;
        }
      } else if (response.status === 401) {
        // Not authenticated
        this.logout();
      }
    } catch (error) {
      // Failed to refresh auth;
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

// Export singleton instance
export const authManager = AuthenticationManager.getInstance();

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