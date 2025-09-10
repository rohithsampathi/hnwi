// lib/auth/secure-token-storage.ts
// Layer 1: Token Storage - NO DEPENDENCIES on other auth modules
// This is the foundation layer for secure token management

/**
 * SOTA 2025 Security-First Token Storage
 * - Handles ONLY token operations
 * - Direct localStorage access (controlled & audited)
 * - Token validation and expiry checking
 * - No circular dependencies possible
 */

const TOKEN_KEY = 'hnwi_auth_token'
const TOKEN_EXPIRY_KEY = 'hnwi_token_expiry'
const REFRESH_TOKEN_KEY = 'hnwi_refresh_token'

// Security: Add a layer of obfuscation (not encryption, but better than plain text)
const obfuscate = (str: string): string => {
  if (typeof window === 'undefined') return str
  return btoa(encodeURIComponent(str))
}

const deobfuscate = (str: string): string => {
  if (typeof window === 'undefined') return str
  try {
    return decodeURIComponent(atob(str))
  } catch {
    return str
  }
}

export class SecureTokenStorage {
  private static instance: SecureTokenStorage
  private memoryToken: string | null = null // In-memory cache for performance

  private constructor() {
    // Singleton pattern
    this.initializeFromStorage()
  }

  public static getInstance(): SecureTokenStorage {
    if (!SecureTokenStorage.instance) {
      SecureTokenStorage.instance = new SecureTokenStorage()
    }
    return SecureTokenStorage.instance
  }

  private initializeFromStorage(): void {
    if (typeof window === 'undefined') return
    
    // Load token into memory on initialization
    const stored = localStorage.getItem(TOKEN_KEY)
    if (stored) {
      this.memoryToken = deobfuscate(stored)
      this.validateStoredToken()
    }
  }

  private validateStoredToken(): void {
    if (!this.memoryToken) return
    
    // Check if token is expired
    const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY)
    if (expiryStr) {
      const expiry = parseInt(expiryStr)
      if (Date.now() > expiry) {
        this.clearToken()
        console.warn('[SecureTokenStorage] Token expired, cleared from storage')
      }
    }
    
    // Validate JWT structure
    if (!this.isValidJWT(this.memoryToken)) {
      this.clearToken()
      console.warn('[SecureTokenStorage] Invalid token format, cleared from storage')
    }
  }

  private isValidJWT(token: string): boolean {
    if (!token) return false
    const parts = token.split('.')
    if (parts.length !== 3) return false
    
    try {
      // Decode and validate JWT payload
      const payload = JSON.parse(atob(parts[1]))
      
      // Check expiration if present
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return false
      }
      
      return true
    } catch {
      return false
    }
  }

  /**
   * Store a token securely
   */
  public setToken(token: string, expiresIn?: number): void {
    if (typeof window === 'undefined') return
    
    if (!token) {
      this.clearToken()
      return
    }
    
    // Validate token format
    if (!this.isValidJWT(token)) {
      console.error('[SecureTokenStorage] Attempted to store invalid token')
      return
    }
    
    // Store in memory and localStorage
    this.memoryToken = token
    localStorage.setItem(TOKEN_KEY, obfuscate(token))
    
    // Set expiry if provided (in seconds)
    if (expiresIn) {
      const expiryTime = Date.now() + (expiresIn * 1000)
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString())
    } else {
      // Default 24 hour expiry
      const expiryTime = Date.now() + (24 * 60 * 60 * 1000)
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString())
    }
    
    // Audit log
  }

  /**
   * Get the current token
   */
  public getToken(): string | null {
    if (typeof window === 'undefined') return null
    
    // Use memory cache for performance
    if (this.memoryToken && this.isValidJWT(this.memoryToken)) {
      return this.memoryToken
    }
    
    // Fallback to localStorage
    const stored = localStorage.getItem(TOKEN_KEY)
    if (stored) {
      const token = deobfuscate(stored)
      if (this.isValidJWT(token)) {
        this.memoryToken = token
        return token
      }
    }
    
    return null
  }

  /**
   * Get raw token (for backwards compatibility)
   */
  public getRawToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('token') // Legacy support
  }

  /**
   * Clear token from storage
   */
  public clearToken(): void {
    if (typeof window === 'undefined') return
    
    this.memoryToken = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(TOKEN_EXPIRY_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    
    // Also clear legacy token
    localStorage.removeItem('token')
    
  }

  /**
   * Set refresh token
   */
  public setRefreshToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(REFRESH_TOKEN_KEY, obfuscate(token))
  }

  /**
   * Get refresh token
   */
  public getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    const stored = localStorage.getItem(REFRESH_TOKEN_KEY)
    return stored ? deobfuscate(stored) : null
  }

  /**
   * Check if token exists and is valid
   */
  public hasValidToken(): boolean {
    const token = this.getToken()
    return !!token && this.isValidJWT(token)
  }

  /**
   * Get token expiry time
   */
  public getTokenExpiry(): number | null {
    if (typeof window === 'undefined') return null
    const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY)
    return expiryStr ? parseInt(expiryStr) : null
  }

  /**
   * Get time until token expires (in seconds)
   */
  public getTimeUntilExpiry(): number {
    const expiry = this.getTokenExpiry()
    if (!expiry) return 0
    const remaining = Math.max(0, expiry - Date.now())
    return Math.floor(remaining / 1000)
  }

  /**
   * Decode token payload (without validation)
   */
  public decodeToken(): any | null {
    const token = this.getToken()
    if (!token) return null
    
    try {
      const parts = token.split('.')
      if (parts.length !== 3) return null
      return JSON.parse(atob(parts[1]))
    } catch {
      return null
    }
  }
}

// Export singleton instance
export const tokenStorage = SecureTokenStorage.getInstance()

// Export convenience functions
export const setAuthToken = (token: string, expiresIn?: number) => tokenStorage.setToken(token, expiresIn)
export const getAuthToken = () => tokenStorage.getToken()
export const clearAuthToken = () => tokenStorage.clearToken()
export const hasValidToken = () => tokenStorage.hasValidToken()
export const getTokenPayload = () => tokenStorage.decodeToken()