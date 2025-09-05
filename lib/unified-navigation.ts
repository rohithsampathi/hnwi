// lib/unified-navigation.ts - Unified Navigation Interface for Migration

"use client"

import { useNewNavigation as _useNewNavigation, isDebugMigration } from './feature-flags'

// Re-export for convenience
export const useNewNavigation = _useNewNavigation

// Navigation interface that both old and new systems must implement
export interface NavigationInterface {
  navigate: (page: string, params?: Record<string, any>) => void
  goBack: () => void
  getCurrentPage: () => string
  getParams: () => Record<string, any>
  canGoBack: () => boolean
}

// Legacy navigation implementation (wraps old system)
class LegacyNavigationImpl implements NavigationInterface {
  private onNavigateCallback: ((page: string) => void) | null = null
  
  setOnNavigateCallback(callback: (page: string) => void) {
    this.onNavigateCallback = callback
  }
  
  navigate(page: string, params?: Record<string, any>) {
    if (isDebugMigration()) {
      // Legacy navigation
    }
    
    // Handle parameters by storing them in sessionStorage (legacy approach)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        sessionStorage.setItem(`nav_param_${key}`, value.toString())
      })
    }
    
    // Handle special routes
    if (page.startsWith("opportunity/")) {
      const opportunityId = page.split("/")[1]
      sessionStorage.setItem("currentOpportunityId", opportunityId)
      page = "opportunity"
    }
    
    if (page.startsWith("playbook/")) {
      const playbookId = page.split("/")[1]  
      sessionStorage.setItem("currentPlaybookId", playbookId)
      page = "playbook"
    }
    
    // Store page for persistence
    if (page !== 'splash' && page !== 'login') {
      sessionStorage.setItem("currentPage", page)
    }
    
    // Call legacy navigation
    if (this.onNavigateCallback) {
      this.onNavigateCallback(page)
    }
  }
  
  goBack() {
    if (isDebugMigration()) {
      // Legacy navigation: back
    }
    
    // Legacy back behavior
    const history = JSON.parse(sessionStorage.getItem('navigationHistory') || '[]')
    const previousPage = history.pop() || 'dashboard'
    sessionStorage.setItem('navigationHistory', JSON.stringify(history))
    
    this.navigate(previousPage)
  }
  
  getCurrentPage(): string {
    return sessionStorage.getItem('currentPage') || 'splash'
  }
  
  getParams(): Record<string, any> {
    const params: Record<string, any> = {}
    
    // Extract parameters from sessionStorage
    if (typeof window !== 'undefined') {
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('nav_param_')) {
          const paramName = key.replace('nav_param_', '')
          params[paramName] = sessionStorage.getItem(key)
        }
      })
    }
    
    return params
  }
  
  canGoBack(): boolean {
    const history = JSON.parse(sessionStorage.getItem('navigationHistory') || '[]')
    return history.length > 0
  }
}

// New navigation implementation (wraps new context system)
class NewNavigationImpl implements NavigationInterface {
  private navigationContext: any = null
  
  setNavigationContext(context: any) {
    this.navigationContext = context
  }
  
  navigate(page: string, params?: Record<string, any>) {
    if (isDebugMigration()) {
      // New navigation
    }
    
    if (this.navigationContext) {
      this.navigationContext.navigate(page, params)
    }
  }
  
  goBack() {
    if (isDebugMigration()) {
      // New navigation: back
    }
    
    if (this.navigationContext) {
      this.navigationContext.goBack()
    }
  }
  
  getCurrentPage(): string {
    return this.navigationContext?.currentPage || 'splash'
  }
  
  getParams(): Record<string, any> {
    return this.navigationContext?.params || {}
  }
  
  canGoBack(): boolean {
    return this.navigationContext?.canGoBack || false
  }
}

// Unified navigation manager
class UnifiedNavigationManager {
  private static legacyImpl = new LegacyNavigationImpl()
  private static newImpl = new NewNavigationImpl()
  
  // Get the active navigation implementation based on feature flags
  private static getActiveImpl(): NavigationInterface {
    return _useNewNavigation() ? this.newImpl : this.legacyImpl
  }
  
  // Public API - these functions automatically route to active implementation
  static navigate(page: string, params?: Record<string, any>) {
    this.getActiveImpl().navigate(page, params)
  }
  
  static goBack() {
    this.getActiveImpl().goBack()
  }
  
  static getCurrentPage(): string {
    return this.getActiveImpl().getCurrentPage()
  }
  
  static getParams(): Record<string, any> {
    return this.getActiveImpl().getParams()
  }
  
  static canGoBack(): boolean {
    return this.getActiveImpl().canGoBack()
  }
  
  // Setup methods for implementations
  static setLegacyCallback(callback: (page: string) => void) {
    this.legacyImpl.setOnNavigateCallback(callback)
  }
  
  static setNewContext(context: any) {
    this.newImpl.setNavigationContext(context)
  }
  
  // Debug method
  static getActiveSystemName(): string {
    return _useNewNavigation() ? 'NEW_SYSTEM' : 'LEGACY_SYSTEM'
  }
}

// Export convenience functions
export const navigate = (page: string, params?: Record<string, any>) => 
  UnifiedNavigationManager.navigate(page, params)

export const goBack = () => 
  UnifiedNavigationManager.goBack()

export const getCurrentPage = () => 
  UnifiedNavigationManager.getCurrentPage()

export const getParams = () => 
  UnifiedNavigationManager.getParams()

export const canGoBack = () => 
  UnifiedNavigationManager.canGoBack()

// Setup functions for migration
export const setupLegacyNavigation = (callback: (page: string) => void) =>
  UnifiedNavigationManager.setLegacyCallback(callback)

export const setupNewNavigation = (context: any) =>
  UnifiedNavigationManager.setNewContext(context)

export const getActiveNavigationSystem = () =>
  UnifiedNavigationManager.getActiveSystemName()

export default UnifiedNavigationManager