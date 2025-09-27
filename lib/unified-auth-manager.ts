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
      const response = await secureApi.post('/api/auth/login', {
        email,
        password,
        rememberDevice
      })

      const result = await response.json()

      if (result.requires_mfa && result.mfa_token) {
        // MFA required - don't update auth state yet
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

    try {
      // Use secure-api for masked backend communication
      const response = await secureApi.post('/api/auth/mfa/verify', {
        mfa_code: code,
        mfa_token: mfaToken,
        rememberDevice
      })

      const result = await response.json()

      if (result.success && result.user) {
        // MFA success - sync all auth systems
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

      // MFA failed
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
      const response = await secureApi.get('/api/auth/session')
      const result = await response.json()

      if (result.user) {
        // Session valid - sync all auth systems
        await this.syncAuthSystems(result.user)

        this.updateAuthState({
          isAuthenticated: true,
          user: result.user,
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
      const response = await secureApi.post('/api/auth/refresh')

      if (response.ok) {
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

  // Sync all authentication systems after successful login
  private async syncAuthSystems(user: User): Promise<void> {
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
  }

  // Clear all authentication systems
  private async clearAuthSystems(): Promise<void> {
    // 1. Clear auth-manager
    logoutUser()

    // 2. Clear secure-api state
    setAuthState(false)

    // 3. Emit logout event
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