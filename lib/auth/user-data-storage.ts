// lib/auth/user-data-storage.ts
// Layer 2: User Data Storage - Depends ONLY on token storage
// Handles user object storage and normalization

import { tokenStorage } from './secure-token-storage'

/**
 * Normalized user interface - consistent across all backend responses
 */
export interface NormalizedUser {
  // Primary identifiers (always present)
  userId: string
  email: string
  
  // Mirrored IDs for compatibility
  user_id: string
  id: string
  _id: string
  
  // User details
  firstName?: string
  lastName?: string
  name?: string
  role?: string
  
  // Profile information
  profile?: any
  company?: string
  company_info?: any
  net_worth?: number
  city?: string
  country?: string
  bio?: string
  industries?: string[]
  phone_number?: string
  linkedin?: string
  office_address?: string
  crypto_investor?: boolean
  land_investor?: boolean
  
  // Subscription info
  subscription?: {
    tier: string
    status: string
    billing_cycle?: string
  }
  
  // Timestamps
  createdAt?: Date | string
  updatedAt?: Date | string
  
  // Raw data (preserve original)
  _raw?: any
}

const USER_KEY = 'hnwi_user_data'
const USER_ID_KEY = 'userId' // Legacy support
const USER_OBJECT_KEY = 'userObject' // Legacy support

/**
 * User Data Storage - Manages user information
 */
export class UserDataStorage {
  private static instance: UserDataStorage
  private cachedUser: NormalizedUser | null = null

  private constructor() {
    this.initializeFromStorage()
  }

  public static getInstance(): UserDataStorage {
    if (!UserDataStorage.instance) {
      UserDataStorage.instance = new UserDataStorage()
    }
    return UserDataStorage.instance
  }

  private initializeFromStorage(): void {
    if (typeof window === 'undefined') return
    
    // Try to load user from storage
    const stored = localStorage.getItem(USER_KEY)
    if (stored) {
      try {
        const user = JSON.parse(stored)
        this.cachedUser = this.normalizeUser(user)
      } catch (error) {
        console.error('[UserDataStorage] Failed to parse stored user:', error)
        this.clearUser()
      }
    } else {
      // Try legacy storage
      this.loadFromLegacyStorage()
    }
  }

  private loadFromLegacyStorage(): void {
    if (typeof window === 'undefined') return
    
    const userObject = localStorage.getItem(USER_OBJECT_KEY)
    if (userObject) {
      try {
        const user = JSON.parse(userObject)
        const normalized = this.normalizeUser(user)
        if (normalized) {
          this.setUser(normalized)
        }
      } catch (error) {
        console.error('[UserDataStorage] Failed to migrate legacy user:', error)
      }
    }
  }

  /**
   * Normalize user data from any backend format
   * This is CRITICAL for handling inconsistent backend responses
   */
  private normalizeUser(userData: any): NormalizedUser | null {
    if (!userData) return null
    
    // Extract user ID from various possible fields
    const userId = userData.user_id || 
                  userData.userId || 
                  userData.id || 
                  userData._id ||
                  userData.ID ||
                  userData.uid ||
                  null
    
    if (!userId) {
      console.error('[UserDataStorage] No user ID found in data:', userData)
      return null
    }
    
    // Extract email
    const email = userData.email || 
                 userData.Email || 
                 userData.user_email || 
                 userData.userEmail || 
                 ''
    
    // Create normalized user object
    const normalized: NormalizedUser = {
      // Primary fields
      userId: userId,
      email: email,
      
      // Mirror IDs for compatibility
      user_id: userId,
      id: userId,
      _id: userId,
      
      // User details
      firstName: userData.firstName || userData.first_name || userData.firstname || '',
      lastName: userData.lastName || userData.last_name || userData.lastname || '',
      name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
      role: userData.role || userData.user_role || 'user',
      
      // Profile (preserve all profile data)
      profile: userData.profile || {},
      
      // Company info
      company: userData.company || userData.profile?.company_info?.name || '',
      company_info: userData.company_info || userData.profile?.company_info || {},
      
      // Additional fields
      net_worth: userData.net_worth || userData.netWorth || userData.profile?.net_worth,
      city: userData.city || userData.profile?.city,
      country: userData.country || userData.profile?.country,
      bio: userData.bio || userData.profile?.bio,
      industries: userData.industries || userData.profile?.industries || [],
      phone_number: userData.phone_number || userData.phoneNumber || userData.profile?.phone_number,
      linkedin: userData.linkedin || userData.linkedIn || userData.profile?.linkedin,
      office_address: userData.office_address || userData.officeAddress || userData.profile?.office_address,
      crypto_investor: userData.crypto_investor || userData.cryptoInvestor || userData.profile?.crypto_investor,
      land_investor: userData.land_investor || userData.landInvestor || userData.profile?.land_investor,
      
      // Subscription
      subscription: userData.subscription || {
        tier: userData.subscription_tier || 'free',
        status: userData.subscription_status || 'active',
        billing_cycle: userData.billing_cycle
      },
      
      // Timestamps
      createdAt: userData.createdAt || userData.created_at,
      updatedAt: userData.updatedAt || userData.updated_at,
      
      // Preserve raw data for debugging
      _raw: userData
    }
    
    return normalized
  }

  /**
   * Store user data
   */
  public setUser(userData: any): NormalizedUser | null {
    if (typeof window === 'undefined') return null
    
    const normalized = this.normalizeUser(userData)
    if (!normalized) {
      console.error('[UserDataStorage] Failed to normalize user data')
      return null
    }
    
    // Cache in memory
    this.cachedUser = normalized
    
    // Store in localStorage
    localStorage.setItem(USER_KEY, JSON.stringify(normalized))
    
    // Update legacy storage for backwards compatibility
    localStorage.setItem(USER_ID_KEY, normalized.userId)
    localStorage.setItem(USER_OBJECT_KEY, JSON.stringify(normalized))
    
    return normalized
  }

  /**
   * Get current user
   */
  public getUser(): NormalizedUser | null {
    if (typeof window === 'undefined') return null
    
    // Check if we have a valid token
    if (!tokenStorage.hasValidToken()) {
      // Only clear and warn if we actually had user data
      if (this.cachedUser) {
        console.warn('[UserDataStorage] Token expired, clearing user data')
        this.clearUser()
      }
      return null
    }
    
    // Return cached user
    if (this.cachedUser) {
      return this.cachedUser
    }
    
    // Try to load from storage
    const stored = localStorage.getItem(USER_KEY)
    if (stored) {
      try {
        const user = JSON.parse(stored)
        this.cachedUser = this.normalizeUser(user)
        return this.cachedUser
      } catch (error) {
        console.error('[UserDataStorage] Failed to parse stored user:', error)
        this.clearUser()
      }
    }
    
    return null
  }

  /**
   * Get user ID only (performance optimization)
   */
  public getUserId(): string | null {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      return null
    }
    
    // Fast path - check cached user first
    if (this.cachedUser?.userId) {
      return this.cachedUser.userId
    }
    
    // Try to initialize if not already done
    if (!this.cachedUser) {
      this.initializeFromStorage()
    }
    
    // Check again after initialization
    if (this.cachedUser?.userId) {
      return this.cachedUser.userId
    }
    
    // Check localStorage directly for performance
    const storedId = localStorage.getItem(USER_ID_KEY)
    if (storedId) {
      return storedId
    }
    
    // Load full user if needed
    const user = this.getUser()
    return user?.userId || null
  }

  /**
   * Update user data (partial update)
   */
  public updateUser(updates: Partial<NormalizedUser>): NormalizedUser | null {
    const current = this.getUser()
    if (!current) {
      console.error('[UserDataStorage] Cannot update - no user found')
      return null
    }
    
    // Merge updates with current user
    const updated = {
      ...current,
      ...updates,
      // Never allow changing primary IDs
      userId: current.userId,
      user_id: current.userId,
      id: current.userId,
      _id: current.userId
    }
    
    return this.setUser(updated)
  }

  /**
   * Clear user data
   */
  public clearUser(): void {
    if (typeof window === 'undefined') return
    
    // Only log if we're actually clearing something
    const hadUser = this.cachedUser !== null
    
    this.cachedUser = null
    
    // Clear all storage
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(USER_ID_KEY)
    localStorage.removeItem(USER_OBJECT_KEY)
    
    // Clear session storage
    sessionStorage.removeItem('userDisplay')
    
    if (hadUser) {
    }
  }

  /**
   * Check if user exists
   */
  public hasUser(): boolean {
    return !!this.getUserId()
  }

  /**
   * Get user from token payload
   */
  public getUserFromToken(): Partial<NormalizedUser> | null {
    const payload = tokenStorage.decodeToken()
    if (!payload) return null
    
    return {
      userId: payload.sub || payload.user_id || payload.userId,
      email: payload.email,
      role: payload.role,
      firstName: payload.firstName,
      lastName: payload.lastName
    }
  }
}

// Export singleton instance
export const userStorage = UserDataStorage.getInstance()

// Export convenience functions
export const setUserData = (userData: any) => userStorage.setUser(userData)
export const getUserData = () => userStorage.getUser()
export const getUserId = () => userStorage.getUserId()
export const updateUserData = (updates: Partial<NormalizedUser>) => userStorage.updateUser(updates)
export const clearUserData = () => userStorage.clearUser()
export const hasUser = () => userStorage.hasUser()