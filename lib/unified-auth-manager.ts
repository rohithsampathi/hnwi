// lib/unified-auth-manager.ts
// Unified Authentication Manager - Single Source of Truth
// Leverages secure-api for all backend communication with URL masking and secure routing

import { secureApi, setAuthState, isAuthenticated as secureApiAuthenticated } from '@/lib/secure-api'
import { authManager, loginUser, logoutUser, getCurrentUser, type User } from '@/lib/auth-manager'

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  isLoading: boolean
  error: string | null
}

export interface AuthActions {
  login: (email: string, password: string, rememberDevice?: boolean) => Promise<LoginResult>
  verifyMFA: (code: string, mfaToken: string, rememberDevice?: boolean) => Promise<LoginResult>
  logout: () => Promise<void>
  refreshSession: () => Promise<User | null>
  checkSession: () => Promise<AuthState>
  clearError: () => void
}

export interface LoginResult {
  success: boolean
  requiresMFA?: boolean
  mfaToken?: string
  user?: User
  error?: string
  message?: string
}

class UnifiedAuthManager {
  private static instance: UnifiedAuthManager
  private authState: AuthState = {
    isAuthenticated: false,
    user: null,
    isLoading: false,
    error: null
  }
  private listeners: Set<(state: AuthState) => void> = new Set()
  private mfaEmail: string | null = null

  private constructor() {
    // Initialize with existing auth state on startup
    this.initializeFromExistingState()
  }

  public static getInstance(): UnifiedAuthManager {
    if (!UnifiedAuthManager.instance) {
      UnifiedAuthManager.instance = new UnifiedAuthManager()
    }
    return UnifiedAuthManager.instance
  }

  // Initialize from existing auth-manager state
  private initializeFromExistingState(): void {
    const existingUser = getCurrentUser()
    const isAuth = secureApiAuthenticated()

    this.authState = {
      isAuthenticated: isAuth && !!existingUser,
      user: existingUser,
      isLoading: false,
      error: null
    }
  }

  // Subscribe to auth state changes
  public subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener)
    // Send current state immediately
    listener(this.authState)

    return () => {
      this.listeners.delete(listener)
    }
  }

  // Notify all listeners of state changes
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.authState))
  }

  // Update auth state and notify listeners
  private updateAuthState(updates: Partial<AuthState>): void {
    this.authState = { ...this.authState, ...updates }
    this.notifyListeners()
  }

  // Login using secure-api (leverages URL masking and secure routing)
  public async login(email: string, password: string, rememberDevice = false): Promise<LoginResult> {
    this.updateAuthState({ isLoading: true, error: null })

    try {
      // Use secure-api for masked backend communication
      const result = await secureApi.post('/api/auth/login', {
        email,
        password,
        rememberDevice
      })

      if (result.requires_mfa && result.mfa_token) {
        // MFA required - store email for MFA verification and don't update auth state yet
        this.mfaEmail = email
        this.updateAuthState({ isLoading: false })
        return {
          success: true,
          requiresMFA: true,
          mfaToken: result.mfa_token,
          message: result.message
        }
      }

      if (result.success && result.user) {
        // Direct login success - sync all auth systems
        await this.syncAuthSystems(result.user)

        this.updateAuthState({
          isAuthenticated: true,
          user: result.user,
          isLoading: false,
          error: null
        })

        return {
          success: true,
          user: result.user,
          message: result.message
        }
      }

      // Login failed
      this.updateAuthState({
        isLoading: false,
        error: result.error || 'Login failed'
      })

      return {
        success: false,
        error: result.error || 'Login failed'
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      this.updateAuthState({
        isLoading: false,
        error: errorMessage
      })

      return {
        success: false,
        error: errorMessage
      }
    }
  }

  // Verify MFA using secure-api
  public async verifyMFA(code: string, mfaToken: string, rememberDevice = false): Promise<LoginResult> {
    this.updateAuthState({ isLoading: true, error: null })

    if (typeof console !== 'undefined') {
      console.debug('[Auth] MFA verification started', {
        email: this.mfaEmail,
        hasToken: !!mfaToken,
        rememberDevice,
        timestamp: new Date().toISOString()
      })
    }

    try {
      // Use secure-api for masked backend communication
      const result = await secureApi.post('/api/auth/mfa/verify', {
        email: this.mfaEmail,
        mfa_code: code,
        mfa_token: mfaToken,
        rememberMe: rememberDevice
      })

      if (result.success && result.user) {
        if (typeof console !== 'undefined') {
          console.debug('[Auth] MFA verification successful - syncing auth systems', {
            userId: result.user.id || result.user.user_id,
            email: result.user.email,
            timestamp: new Date().toISOString()
          })
        }

        // MFA success - sync all auth systems and clear stored email
        await this.syncAuthSystems(result.user)
        this.mfaEmail = null

        // SOTA FIX: No need for delayed session check - we already have verified user data
        // The backend just confirmed authentication and returned user object
        // syncAuthSystems already stored everything we need
        // Removed redundant session check that caused race condition with cookie propagation
        this.updateAuthState({
          isAuthenticated: true,
          user: result.user,
          isLoading: false,
          error: null
        })

        if (typeof console !== 'undefined') {
          console.debug('[Auth] Auth state updated successfully', {
            isAuthenticated: true,
            userId: result.user.id || result.user.user_id,
            timestamp: new Date().toISOString()
          })
        }

        return {
          success: true,
          user: result.user,
          message: result.message
        }
      }

      // MFA failed
      if (typeof console !== 'undefined') {
        console.warn('[Auth] MFA verification failed', {
          email: this.mfaEmail,
          error: result.error,
          timestamp: new Date().toISOString()
        })
      }

      this.updateAuthState({
        isLoading: false,
        error: result.error || 'Invalid verification code'
      })

      return {
        success: false,
        error: result.error || 'Invalid verification code'
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Verification failed'

      if (typeof console !== 'undefined') {
        console.error('[Auth] MFA verification exception', {
          email: this.mfaEmail,
          error: errorMessage,
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString()
        })
      }

      this.updateAuthState({
        isLoading: false,
        error: errorMessage
      })

      return {
        success: false,
        error: errorMessage
      }
    }
  }

  // Check session using secure-api
  public async checkSession(): Promise<AuthState> {
    this.updateAuthState({ isLoading: true, error: null })

    try {
      // Use secure-api for masked backend communication
      const result = await secureApi.get('/api/auth/session')

      if (result.user) {
        // Preserve existing user data and merge with session response
        // This prevents losing user profile fields like 'name' that might not be in session response
        const existingUser = getCurrentUser()
        const mergedUser = existingUser ? { ...existingUser, ...result.user } : result.user

        // Session valid - sync all auth systems with merged user data
        await this.syncAuthSystems(mergedUser)

        this.updateAuthState({
          isAuthenticated: true,
          user: mergedUser,
          isLoading: false,
          error: null
        })
      } else {
        // No session - clear auth state
        await this.clearAuthSystems()

        this.updateAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: null
        })
      }

    } catch (error) {
      // Session check failed - might be network issue, keep existing state if user exists
      const existingUser = getCurrentUser()
      if (existingUser) {
        this.updateAuthState({ isLoading: false })
      } else {
        await this.clearAuthSystems()
        this.updateAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: null
        })
      }
    }

    return this.authState
  }

  // Refresh session using secure-api
  public async refreshSession(): Promise<User | null> {
    try {
      // Use secure-api for masked backend communication
      const result = await secureApi.post('/api/auth/refresh')

      if (result.success) {
        // Token refreshed, now check session
        return await this.checkSession().then(state => state.user)
      }

      return null
    } catch (error) {
      return null
    }
  }

  // Logout using secure-api
  public async logout(): Promise<void> {
    this.updateAuthState({ isLoading: true, error: null })

    try {
      // Use secure-api for masked backend communication
      await secureApi.post('/api/auth/logout')
    } catch (error) {
      // Continue with logout even if backend call fails
    }

    // Clear all auth systems
    await this.clearAuthSystems()

    this.updateAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null
    })
  }

  // SOTA: Check if authentication cookies are ready (server-side validation)
  private async checkCookieReadiness(maxAttempts = 3): Promise<boolean> {
    if (typeof window === 'undefined') return true;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        // Make a lightweight session check to verify cookies are readable server-side
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            if (typeof console !== 'undefined') {
              console.debug('[Auth] Cookies ready and validated server-side', {
                attempt: attempt + 1
              })
            }
            return true;
          }
        }

        // Wait with exponential backoff before retry
        if (attempt < maxAttempts - 1) {
          const delay = 150 * Math.pow(2, attempt); // 150ms, 300ms, 600ms
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        if (attempt === maxAttempts - 1) {
          if (typeof console !== 'undefined') {
            console.warn('[Auth] Cookie readiness check failed', { error });
          }
        }
      }
    }

    return false; // Cookies not ready after retries
  }

  // SOTA: Validate auth state with exponential backoff retry
  private async validateAuthStateWithRetry(user: User, maxAttempts = 3): Promise<boolean> {
    if (typeof window === 'undefined') return true;

    if (typeof console !== 'undefined') {
      console.debug('[Auth] Validating auth state with retry', {
        userId: user.id || user.user_id,
        maxAttempts
      })
    }

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Check if auth state is properly synced
      const storedUser = getCurrentUser()
      const isAuthSynced = secureApiAuthenticated()

      if (storedUser?.id === user.id && isAuthSynced) {
        if (typeof console !== 'undefined') {
          console.debug('[Auth] Auth state validated successfully', {
            attempt: attempt + 1,
            userId: user.id || user.user_id
          })
        }
        return true // Auth state validated
      }

      if (typeof console !== 'undefined') {
        console.debug('[Auth] Auth state validation attempt failed', {
          attempt: attempt + 1,
          hasStoredUser: !!storedUser,
          storedUserId: storedUser?.id,
          expectedUserId: user.id || user.user_id,
          isAuthSynced
        })
      }

      // Wait with exponential backoff before retry
      if (attempt < maxAttempts - 1) {
        const delay = 100 * Math.pow(2, attempt) // 100ms, 200ms, 400ms
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    if (typeof console !== 'undefined') {
      console.warn('[Auth] Auth state validation failed after all retries', {
        maxAttempts,
        userId: user.id || user.user_id
      })
    }

    return false // Validation failed after retries
  }

  // Sync all authentication systems after successful login
  private async syncAuthSystems(user: User): Promise<void> {
    if (typeof console !== 'undefined') {
      console.debug('[Auth] Starting auth systems sync', {
        userId: user.id || user.user_id,
        email: user.email,
        timestamp: new Date().toISOString()
      })
    }

    // 1. Store user in auth-manager (sessionStorage + memory)
    loginUser(user)

    // 2. Mark secure-api as authenticated
    setAuthState(true)

    // 3. Ensure sessionStorage persistence (critical for PWA)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('userObject', JSON.stringify(user))
      sessionStorage.setItem('userId', user.id || user.user_id || '')
      sessionStorage.setItem('userEmail', user.email || '')
    }

    // 4. Emit auth events for other components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:login', {
        detail: { user }
      }))
    }

    if (typeof console !== 'undefined') {
      console.debug('[Auth] Auth systems synced - starting validation', {
        userId: user.id || user.user_id,
        timestamp: new Date().toISOString()
      })
    }

    // 5. SOTA: Defensive validation with retry logic
    // Ensures all auth systems are properly synced before continuing
    const isValid = await this.validateAuthStateWithRetry(user)
    if (!isValid && typeof console !== 'undefined') {
      console.warn('[Auth] Auth state validation failed - some systems may not be synced')
    } else if (typeof console !== 'undefined') {
      console.debug('[Auth] Auth systems sync completed successfully', {
        userId: user.id || user.user_id,
        timestamp: new Date().toISOString()
      })
    }
  }

  // Clear all authentication systems
  private async clearAuthSystems(): Promise<void> {
    // 1. Clear auth-manager
    logoutUser()

    // 2. Clear secure-api state
    setAuthState(false)

    // 3. Clear stored MFA email
    this.mfaEmail = null

    // 4. Clear Service Worker caches (prevents data leakage on shared devices)
    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        const cacheNames = await caches.keys()
        await Promise.all(
          cacheNames
            .filter(name =>
              name.includes('api') ||
              name.includes('pages') ||
              name.includes('intelligence')
            )
            .map(name => caches.delete(name))
        )
      } catch (error) {
        // Silent fail - cache clearing is enhancement, not critical for logout
        console.error('[Auth] Failed to clear caches on logout:', error)
      }
    }

    // 5. Emit logout event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:logout'))
    }
  }

  // Clear error state
  public clearError(): void {
    this.updateAuthState({ error: null })
  }

  // Get current auth state
  public getAuthState(): AuthState {
    return this.authState
  }

  // Get current user
  public getCurrentUser(): User | null {
    return this.authState.user
  }

  // Check if authenticated
  public isAuthenticated(): boolean {
    return this.authState.isAuthenticated
  }
}

// Export singleton instance
export const unifiedAuthManager = UnifiedAuthManager.getInstance()

// Export convenience functions that leverage secure-api
export const useUnifiedAuth = () => {
  const manager = UnifiedAuthManager.getInstance()

  return {
    // State
    getAuthState: () => manager.getAuthState(),
    getCurrentUser: () => manager.getCurrentUser(),
    isAuthenticated: () => manager.isAuthenticated(),

    // Actions (all use secure-api internally)
    login: (email: string, password: string, rememberDevice?: boolean) =>
      manager.login(email, password, rememberDevice),
    verifyMFA: (code: string, mfaToken: string, rememberDevice?: boolean) =>
      manager.verifyMFA(code, mfaToken, rememberDevice),
    logout: () => manager.logout(),
    refreshSession: () => manager.refreshSession(),
    checkSession: () => manager.checkSession(),
    clearError: () => manager.clearError(),

    // Subscription
    subscribe: (listener: (state: AuthState) => void) => manager.subscribe(listener)
  }
}