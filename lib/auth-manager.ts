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

    // Try to recover user from sessionStorage
    const storedUser = sessionStorage.getItem('userObject');
    if (storedUser) {
      try {
        this.user = JSON.parse(storedUser);
        // If we have user data in sessionStorage, we're authenticated
        // (the backend cookies will validate on API calls)
        this.authenticated = true;
      } catch (error) {
        console.error('Failed to parse stored user:', error);
      }
    }
  }

  public login(userData: User): User {
    if (typeof window === 'undefined') return userData;

    // Store user data in memory and sessionStorage
    this.user = userData;
    this.authenticated = true;

    // Store user data in sessionStorage (NOT localStorage - session only)
    sessionStorage.setItem('userEmail', userData.email || '');
    sessionStorage.setItem('userId', userData.id || userData.user_id || '');
    sessionStorage.setItem('userObject', JSON.stringify(userData));

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

    // Clear all storage
    sessionStorage.clear();

    // Clear legacy localStorage (migration cleanup)
    // Cookies handle auth - no token removal needed
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('userObject');

    // Emit logout event
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }

  public getAuthToken(): string | null {
    // Tokens are in httpOnly cookies now - not accessible to JS
    return null;
  }

  public getCurrentUser(): User | null {
    return this.user;
  }

  public getUserId(): string | null {
    if (this.user) {
      return this.user.id || this.user.user_id;
    }

    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('userId');
    }

    return null;
  }

  public isAuthenticated(): boolean {
    // We track auth state based on successful login/logout
    // The actual auth is determined by httpOnly cookies
    return this.authenticated;
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
      sessionStorage.setItem('userObject', JSON.stringify(this.user));

      // Emit update event
      window.dispatchEvent(new CustomEvent('auth:userUpdated', {
        detail: { user: this.user }
      }));
    }

    return this.user;
  }

  public async refreshAuth(): Promise<User | null> {
    try {
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
      console.warn('Failed to refresh auth:', error);
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
      expiresIn: this.authenticated ? 900000 : 0 // 15 minutes assumed
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