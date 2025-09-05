// lib/feature-flags.ts - Feature Flag System for Safe Migration

"use client"

interface FeatureFlags {
  USE_NEW_NAVIGATION: boolean
  USE_NEW_AUTH_FLOW: boolean
  USE_NEW_STATE_MANAGEMENT: boolean
  ENABLE_DEVICE_TRUST: boolean
  ENABLE_PREDICTIVE_PRELOADING: boolean
  DEBUG_MIGRATION: boolean
}

class FeatureFlagManager {
  private static flags: FeatureFlags = {
    // Migration flags - start with new system DISABLED
    USE_NEW_NAVIGATION: false,
    USE_NEW_AUTH_FLOW: false, 
    USE_NEW_STATE_MANAGEMENT: false,
    
    // Feature flags - can be enabled independently
    ENABLE_DEVICE_TRUST: true,
    ENABLE_PREDICTIVE_PRELOADING: false,
    
    // Debug
    DEBUG_MIGRATION: false
  }
  
  private static overrides: Partial<FeatureFlags> = {}
  
  // Check if flag is enabled
  static isEnabled(flag: keyof FeatureFlags): boolean {
    // Check for URL override first (for testing)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const urlOverride = urlParams.get(`ff_${flag.toLowerCase()}`)
      if (urlOverride === 'true') return true
      if (urlOverride === 'false') return false
    }
    
    // Check for localStorage override (for persistent testing)
    if (typeof window !== 'undefined') {
      const storageOverride = localStorage.getItem(`ff_${flag}`)
      if (storageOverride === 'true') return true
      if (storageOverride === 'false') return false
    }
    
    // Check runtime overrides
    if (flag in this.overrides) {
      return this.overrides[flag]!
    }
    
    // Return default value
    return this.flags[flag]
  }
  
  // Enable a feature flag at runtime
  static enable(flag: keyof FeatureFlags) {
    this.overrides[flag] = true
    if (this.isEnabled('DEBUG_MIGRATION')) {
      // Feature flag enabled
    }
  }
  
  // Disable a feature flag at runtime
  static disable(flag: keyof FeatureFlags) {
    this.overrides[flag] = false
    if (this.isEnabled('DEBUG_MIGRATION')) {
      // Feature flag disabled
    }
  }
  
  // Enable all new system flags (for full migration)
  static enableNewSystem() {
    this.enable('USE_NEW_NAVIGATION')
    this.enable('USE_NEW_AUTH_FLOW')
    this.enable('USE_NEW_STATE_MANAGEMENT')
    // New system enabled
  }
  
  // Disable all new system flags (rollback)
  static disableNewSystem() {
    this.disable('USE_NEW_NAVIGATION')
    this.disable('USE_NEW_AUTH_FLOW')
    this.disable('USE_NEW_STATE_MANAGEMENT')
    // Rolled back to old system
  }
  
  // Get all flag states (for debugging)
  static getAllFlags(): Record<string, boolean> {
    const result: Record<string, boolean> = {}
    Object.keys(this.flags).forEach(key => {
      result[key] = this.isEnabled(key as keyof FeatureFlags)
    })
    return result
  }
  
  // Reset all overrides
  static reset() {
    this.overrides = {}
    if (typeof window !== 'undefined') {
      Object.keys(this.flags).forEach(flag => {
        localStorage.removeItem(`ff_${flag}`)
      })
    }
  }
}

// Helper functions for common patterns
export const useNewNavigation = () => FeatureFlagManager.isEnabled('USE_NEW_NAVIGATION')
export const useNewAuth = () => FeatureFlagManager.isEnabled('USE_NEW_AUTH_FLOW')
export const useNewStateManagement = () => FeatureFlagManager.isEnabled('USE_NEW_STATE_MANAGEMENT')
export const isDeviceTrustEnabled = () => FeatureFlagManager.isEnabled('ENABLE_DEVICE_TRUST')
export const isPredictivePreloadingEnabled = () => FeatureFlagManager.isEnabled('ENABLE_PREDICTIVE_PRELOADING')
export const isDebugMigration = () => FeatureFlagManager.isEnabled('DEBUG_MIGRATION')

// Migration control functions
export const enableNewSystem = () => FeatureFlagManager.enableNewSystem()
export const disableNewSystem = () => FeatureFlagManager.disableNewSystem()
export const getAllFlags = () => FeatureFlagManager.getAllFlags()
export const resetFlags = () => FeatureFlagManager.reset()

// Individual flag control
export const enableFlag = (flag: keyof FeatureFlags) => FeatureFlagManager.enable(flag)
export const disableFlag = (flag: keyof FeatureFlags) => FeatureFlagManager.disable(flag)
export const isEnabled = (flag: keyof FeatureFlags) => FeatureFlagManager.isEnabled(flag)

export default FeatureFlagManager