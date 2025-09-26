// lib/services/advanced-pwa-service.ts
// Advanced PWA features orchestration service

import { WebPermissionsService } from './web-permissions-service'
import { WebShareService } from './web-share-service'
import { BackgroundSyncService } from './background-sync-service'
import { EnhancedCacheService } from './enhanced-cache-service'

export interface PWACapabilities {
  installable: boolean
  standalone: boolean
  offlineCapable: boolean
  backgroundSync: boolean
  pushNotifications: boolean
  webShare: boolean
  persistentStorage: boolean
  criticalPermissions: boolean
}

export interface InstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export class AdvancedPWAService {
  private static installPrompt: InstallPromptEvent | null = null
  private static capabilities: PWACapabilities | null = null

  // Initialize all advanced PWA services
  static async initialize(): Promise<PWACapabilities> {
    try {
      // Initialize all services in parallel
      await Promise.all([
        BackgroundSyncService.initialize(),
        EnhancedCacheService.initialize(),
        this.setupInstallPrompt(),
        this.setupLifecycleEvents()
      ])

      // Check capabilities
      this.capabilities = await this.checkCapabilities()

      // Request critical permissions if not in standalone mode
      if (!this.capabilities.standalone && this.capabilities.installable) {
        await this.requestCriticalPermissions()
      }

      return this.capabilities
    } catch (error) {
      // Return basic capabilities even if initialization fails
      return this.getBasicCapabilities()
    }
  }

  // Check all PWA capabilities
  static async checkCapabilities(): Promise<PWACapabilities> {
    const [
      permissions,
      webShareSupported,
      backgroundSyncSupported,
      persistentStorageAvailable
    ] = await Promise.all([
      WebPermissionsService.checkCriticalPermissions(),
      Promise.resolve(WebShareService.isSupported()),
      Promise.resolve(BackgroundSyncService.isSupported()),
      this.checkPersistentStorage()
    ])

    const capabilities: PWACapabilities = {
      installable: this.isInstallable(),
      standalone: this.isStandalone(),
      offlineCapable: await this.isOfflineCapable(),
      backgroundSync: backgroundSyncSupported && permissions.backgroundSync,
      pushNotifications: permissions.notifications,
      webShare: webShareSupported,
      persistentStorage: persistentStorageAvailable && permissions.persistentStorage,
      criticalPermissions: permissions.allCritical
    }

    this.capabilities = capabilities
    return capabilities
  }

  // Check if app is installable
  static isInstallable(): boolean {
    return this.installPrompt !== null || this.isStandalone()
  }

  // Check if running in standalone mode
  static isStandalone(): boolean {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')
    )
  }

  // Check if app has offline capability
  static async isOfflineCapable(): Promise<boolean> {
    try {
      const caches = await window.caches.keys()
      return caches.length > 0 && 'serviceWorker' in navigator
    } catch {
      return false
    }
  }

  // Check persistent storage
  static async checkPersistentStorage(): Promise<boolean> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate()
        return (estimate.quota || 0) > 100 * 1024 * 1024 // 100MB threshold
      }
      return false
    } catch {
      return false
    }
  }

  // Setup install prompt handling
  private static setupInstallPrompt(): Promise<void> {
    return new Promise((resolve) => {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault()
        this.installPrompt = e as InstallPromptEvent

        // Notify app that install is available
        window.dispatchEvent(new CustomEvent('pwa-installable', {
          detail: { available: true }
        }))

        resolve()
      })

      // Also resolve after a short timeout in case event doesn't fire
      setTimeout(resolve, 1000)
    })
  }

  // Setup PWA lifecycle events
  private static setupLifecycleEvents(): void {
    // App installed
    window.addEventListener('appinstalled', () => {
      this.capabilities = null // Reset capabilities cache
      window.dispatchEvent(new CustomEvent('pwa-installed'))
    })

    // Display mode change
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    mediaQuery.addEventListener('change', (e) => {
      window.dispatchEvent(new CustomEvent('pwa-display-mode-change', {
        detail: { standalone: e.matches }
      }))
    })
  }

  // Show install prompt
  static async showInstallPrompt(): Promise<{
    success: boolean
    outcome?: 'accepted' | 'dismissed'
    error?: string
  }> {
    if (!this.installPrompt) {
      return {
        success: false,
        error: 'Install prompt not available'
      }
    }

    try {
      await this.installPrompt.prompt()
      const { outcome } = await this.installPrompt.userChoice

      // Clear the prompt after use
      this.installPrompt = null

      return {
        success: true,
        outcome
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to show install prompt'
      }
    }
  }

  // Request critical permissions for HNWI app
  static async requestCriticalPermissions(): Promise<{
    success: boolean
    message: string
  }> {
    try {
      const result = await WebPermissionsService.requestCriticalPermissionsFlow()

      // Update capabilities cache
      this.capabilities = await this.checkCapabilities()

      return {
        success: result.success,
        message: result.message
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to request permissions'
      }
    }
  }

  // Get basic capabilities without full checks
  private static getBasicCapabilities(): PWACapabilities {
    return {
      installable: false,
      standalone: this.isStandalone(),
      offlineCapable: false,
      backgroundSync: false,
      pushNotifications: false,
      webShare: false,
      persistentStorage: false,
      criticalPermissions: false
    }
  }

  // Get current capabilities (cached)
  static getCurrentCapabilities(): PWACapabilities | null {
    return this.capabilities
  }

  // Share HNWI content intelligently
  static async shareIntelligence(data: {
    type: 'opportunity' | 'insight' | 'conversation'
    title: string
    content: string
    url?: string
    opportunityId?: string
    shareId?: string
  }): Promise<{ success: boolean, method?: 'share' | 'clipboard' }> {
    try {
      switch (data.type) {
        case 'opportunity':
          if (data.opportunityId) {
            return {
              success: await WebShareService.shareOpportunity(
                data.opportunityId,
                data.title,
                data.content
              ),
              method: 'share'
            }
          }
          break

        case 'conversation':
          if (data.shareId) {
            return {
              success: await WebShareService.shareConversation(
                data.shareId,
                data.title
              ),
              method: 'share'
            }
          }
          break

        case 'insight':
          return {
            success: await WebShareService.shareInsight(
              data.title,
              data.content,
              data.url
            ),
            method: 'share'
          }
      }

      // Fallback to smart share
      const result = await WebShareService.smartShare({
        title: data.title,
        text: data.content,
        url: data.url || window.location.href
      })

      return {
        success: result.success,
        method: result.method
      }

    } catch (error) {
      return { success: false }
    }
  }

  // Preload critical HNWI data for offline access
  static async preloadCriticalData(userId: string): Promise<void> {
    if (!this.capabilities?.offlineCapable) return

    try {
      await EnhancedCacheService.preloadCriticalData(userId)
    } catch (error) {
      // Silent fail
    }
  }

  // Get app statistics for HNWI users
  static async getAppStats(): Promise<{
    cacheSize: number
    offlineCapable: boolean
    lastSync?: Date
    permissions: string[]
  }> {
    try {
      const [cacheStats, permissions] = await Promise.all([
        EnhancedCacheService.getCacheStats(),
        WebPermissionsService.getAllPermissions()
      ])

      return {
        cacheSize: cacheStats.totalSize,
        offlineCapable: await this.isOfflineCapable(),
        permissions: permissions
          .filter(p => p.state === 'granted')
          .map(p => p.name)
      }
    } catch (error) {
      return {
        cacheSize: 0,
        offlineCapable: false,
        permissions: []
      }
    }
  }

  // Check for app updates
  static async checkForUpdates(): Promise<{
    available: boolean
    version?: string
  }> {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()

        if (registration) {
          await registration.update()

          return {
            available: !!registration.waiting,
            version: 'latest'
          }
        }
      }

      return { available: false }
    } catch (error) {
      return { available: false }
    }
  }

  // Apply app update
  static async applyUpdate(): Promise<boolean> {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()

        if (registration?.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
          return true
        }
      }

      return false
    } catch (error) {
      return false
    }
  }
}