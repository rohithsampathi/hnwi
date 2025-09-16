// lib/auth-manager.ts
// Layer 3: Authentication Manager - Orchestrates auth operations
// Uses ONLY the storage layers (no circular dependencies)

import { tokenStorage, getAuthToken as getStoredToken, setAuthToken, clearAuthToken } from './auth/secure-token-storage'
import { userStorage, getUserData, setUserData, clearUserData, getUserId as getStoredUserId, type NormalizedUser } from './auth/user-data-storage'

/**
 * SOTA 2025 Authentication Manager
 * - Central orchestrator for all auth operations
 * - Uses layered storage architecture
 * - No direct localStorage access
 * - Single source of truth for auth state
 */
export class AuthenticationManager {
  private static instance: AuthenticationManager
  private initialized: boolean = false

  private constructor() {
    // Only initialize in browser environment
    if (typeof window !== 'undefined') {
      this.initialize()
    }
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): AuthenticationManager {
    if (!AuthenticationManager.instance) {
      AuthenticationManager.instance = new AuthenticationManager()
    }
    return AuthenticationManager.instance
  }

  /**
   * Initialize the auth manager
   */
  private initialize(): void {
    if (this.initialized || typeof window === 'undefined') return
    
    
    // Storage layers auto-initialize from localStorage
    // Just verify we have consistent state
    this.verifyAuthState()
    
    this.initialized = true
  }

  /**
   * Verify auth state consistency
   */
  private verifyAuthState(): void {
    const hasToken = tokenStorage.hasValidToken()
    const hasUser = userStorage.hasUser()
    
    if (hasToken && !hasUser) {
      // Try to get user from token
      const userFromToken = userStorage.getUserFromToken()
      if (userFromToken && userFromToken.userId) {
        userStorage.setUser(userFromToken)
      } else {
        // Inconsistent state - clear everything
        this.logout()
      }
    } else if (!hasToken && hasUser) {
      userStorage.clearUser()
    }
  }

  /**
   * Login user - store token and user data
   */
  public login(userData: any, token?: string): NormalizedUser | null {
    
    // Store token if provided
    if (token) {
      setAuthToken(token)
      
      // Also store in legacy location for backwards compatibility
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token)
      }
    }
    
    // Store user data
    const normalizedUser = setUserData(userData)
    
    if (!normalizedUser) {
      clearAuthToken()
      return null
    }
    
    
    // Emit login event for other components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:login', { 
        detail: { user: normalizedUser } 
      }))
    }
    
    return normalizedUser
  }

  /**
   * Logout user - clear all auth data
   */
  public logout(): void {
    
    // Clear storage layers
    clearAuthToken()
    clearUserData()
    
    // Clear legacy storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('userEmail')
      sessionStorage.clear()
      
      // Emit logout event
      window.dispatchEvent(new CustomEvent('auth:logout'))
    }
    
  }

  /**
   * Get current user
   */
  public getCurrentUser(): NormalizedUser | null {
    // Ensure initialization before getting user
    this.ensureInitialized()
    return getUserData()
  }

  /**
   * Get current user ID (optimized)
   */
  public getUserId(): string | null {
    // Ensure initialization before getting user ID
    this.ensureInitialized()
    return getStoredUserId()
  }

  /**
   * Get authentication token
   */
  public getAuthToken(): string | null {
    // First try the new secure storage
    const token = getStoredToken()
    if (token) return token
    
    // Fallback to legacy token for backwards compatibility
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    
    return null
  }

  /**
   * Ensure initialization (for client-side)
   */
  public ensureInitialized(): void {
    if (!this.initialized && typeof window !== 'undefined') {
      this.initialize()
    }
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    // Ensure we're initialized if on client
    this.ensureInitialized()
    return tokenStorage.hasValidToken() && userStorage.hasUser()
  }

  /**
   * Update user data
   */
  public updateUser(updates: Partial<NormalizedUser>): NormalizedUser | null {
    const updated = userStorage.updateUser(updates)
    
    if (updated && typeof window !== 'undefined') {
      // Emit update event
      window.dispatchEvent(new CustomEvent('auth:userUpdated', { 
        detail: { user: updated } 
      }))
    }
    
    return updated
  }

  /**
   * Refresh authentication from backend
   */
  public async refreshAuth(): Promise<NormalizedUser | null> {
    try {
      const token = this.getAuthToken()
      if (!token) {
        return null
      }
      
      const response = await fetch('/api/auth/session', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          // Update user data
          return this.updateUser(data.user)
        }
      } else if (response.status === 401) {
        // Token invalid - logout
        this.logout()
      }
    } catch (error) {
    }
    
    return null
  }

  /**
   * Set authentication from session (for SSR)
   */
  public setAuthFromSession(userData: any, token: string): void {
    if (!userData || !token) return
    this.login(userData, token)
  }

  /**
   * Get auth headers for API requests
   */
  public getAuthHeaders(): Record<string, string> {
    const token = this.getAuthToken()
    if (!token) return {}
    
    return {
      'Authorization': `Bearer ${token}`
    }
  }

  /**
   * Check token expiry
   */
  public getTokenExpiry(): { expired: boolean; expiresIn: number } {
    const expiresIn = tokenStorage.getTimeUntilExpiry()
    return {
      expired: expiresIn <= 0,
      expiresIn
    }
  }

  /**
   * Debug authentication state
   */
  public debug(): void {
  }
}

// Export singleton instance
export const authManager = AuthenticationManager.getInstance()

// Export convenience functions (for backwards compatibility)
export const getCurrentUserId = () => authManager.getUserId()
export const getCurrentUser = () => authManager.getCurrentUser()
export const getAuthToken = () => authManager.getAuthToken()
export const isAuthenticated = () => authManager.isAuthenticated()
export const loginUser = (userData: any, token?: string) => authManager.login(userData, token)
export const logoutUser = () => authManager.logout()
export const updateUser = (updates: any) => authManager.updateUser(updates)
export const refreshUser = () => authManager.refreshAuth()
export const getAuthHeaders = () => authManager.getAuthHeaders()
export const debugAuth = () => authManager.debug()

// Export type
export type { NormalizedUser } from './auth/user-data-storage'