// components/background-sync-initializer.tsx
// Initialize all PWA services including background sync, caching, permissions, and sharing

"use client"

import { useEffect } from "react"
import { BackgroundSyncService } from "@/lib/services/background-sync-service"
import { EnhancedCacheService } from "@/lib/services/enhanced-cache-service"
import { AdvancedPWAService } from "@/lib/services/advanced-pwa-service"

export default function BackgroundSyncInitializer() {
  useEffect(() => {
    // Skip PWA initialization in production if there are issues
    // This prevents IndexedDB errors from blocking the main app
    const isProduction = process.env.NODE_ENV === 'production'
    const skipPWA = isProduction && typeof window !== 'undefined' && !window.navigator?.serviceWorker

    if (skipPWA) {
      return
    }

    // Initialize PWA services with comprehensive error handling
    const initializeServices = async () => {
      try {
        // Add delay to ensure DOM is fully loaded
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Check if IndexedDB is available and working
        if (!window.indexedDB) {
          throw new Error('IndexedDB not available')
        }

        // Test IndexedDB access before initializing services
        const testDB = await new Promise<boolean>((resolve) => {
          try {
            const request = indexedDB.open('test-db', 1)
            request.onerror = () => resolve(false)
            request.onsuccess = () => {
              request.result.close()
              resolve(true)
            }
            request.onupgradeneeded = () => {
              request.result.close()
              resolve(true)
            }
          } catch {
            resolve(false)
          }
        })

        if (!testDB) {
          throw new Error('IndexedDB test failed')
        }

        // Initialize advanced PWA service (includes all others)
        const capabilities = await AdvancedPWAService.initialize()

        // Process any pending sync data on app start (with error handling)
        if (navigator.onLine) {
          try {
            await BackgroundSyncService.processAllPending()
          } catch (syncError) {
            // Background sync errors shouldn't break the app
          }
        }

        // Notify app of PWA capabilities
        window.dispatchEvent(new CustomEvent('pwa-initialized', {
          detail: { capabilities }
        }))

      } catch (error) {
        // Silent fail - PWA services are optional and shouldn't break the main app
        // In production, PWA failures are logged but don't affect functionality
        if (process.env.NODE_ENV === 'development') {
        }
      }
    }

    // Set up safe event handlers with error boundaries
    const handleOnline = () => {
      try {
        BackgroundSyncService.processAllPending().catch(() => {
          // Silent fail for background sync
        })
      } catch {
        // Prevent event handler errors from breaking the app
      }
    }

    const handleOffline = () => {
      // Could show offline indicator here if needed
    }

    // Listen for sync notifications with error handling
    const handleSyncNotification = (event: CustomEvent) => {
      try {
        const { message, type } = event.detail

        // Could integrate with toast system here
        if (type === 'success') {
          // Success notification
        } else if (type === 'error') {
          // Error notification
        }
      } catch {
        // Prevent notification errors from breaking the app
      }
    }

    // Initialize services asynchronously to prevent blocking
    initializeServices()

    // Add event listeners with error protection
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('sync-notification', handleSyncNotification as EventListener)

    return () => {
      try {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
        window.removeEventListener('sync-notification', handleSyncNotification as EventListener)
      } catch {
        // Cleanup errors shouldn't break the app
      }
    }
  }, [])

  // This component doesn't render anything
  return null
}