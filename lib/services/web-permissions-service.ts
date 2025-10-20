// lib/services/web-permissions-service.ts
// Advanced web permissions management for PWA features

export type PermissionName =
  | 'notifications'
  | 'geolocation'
  | 'camera'
  | 'microphone'
  | 'background-sync'
  | 'persistent-storage'

export interface PermissionStatus {
  name: PermissionName
  state: 'granted' | 'denied' | 'prompt' | 'unsupported'
  supported: boolean
}

export class WebPermissionsService {
  private static permissionCallbacks = new Map<string, ((status: PermissionStatus) => void)[]>()

  // Check if a permission is supported
  static isPermissionSupported(permission: PermissionName): boolean {
    switch (permission) {
      case 'notifications':
        return 'Notification' in window
      case 'geolocation':
        return 'geolocation' in navigator
      case 'camera':
        return 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices
      case 'microphone':
        return 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices
      case 'background-sync':
        return 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype
      case 'persistent-storage':
        return 'storage' in navigator && 'persist' in navigator.storage
      default:
        return false
    }
  }

  // Get current permission status
  static async getPermissionStatus(permission: PermissionName): Promise<PermissionStatus> {
    if (!this.isPermissionSupported(permission)) {
      return {
        name: permission,
        state: 'unsupported',
        supported: false
      }
    }

    // Camera and microphone are blocked by Permissions-Policy, so return denied immediately
    // to prevent browser console warnings
    if (permission === 'camera' || permission === 'microphone') {
      return {
        name: permission,
        state: 'denied',
        supported: true
      }
    }

    let state: 'granted' | 'denied' | 'prompt' | 'unsupported' = 'prompt'

    try {
      switch (permission) {
        case 'notifications':
          if ('permission' in Notification) {
            state = Notification.permission as any
          }
          break

        case 'geolocation':
          if ('permissions' in navigator) {
            const result = await navigator.permissions.query({ name: 'geolocation' })
            state = result.state as any
          }
          break

        case 'camera':
          // Blocked by Permissions-Policy - handled above
          break

        case 'microphone':
          // Blocked by Permissions-Policy - handled above
          break

        case 'persistent-storage':
          if ('storage' in navigator) {
            const isPersistent = await navigator.storage.persisted()
            state = isPersistent ? 'granted' : 'prompt'
          }
          break

        case 'background-sync':
          // Background sync permission is implicit with service worker registration
          if ('serviceWorker' in navigator) {
            try {
              await navigator.serviceWorker.ready
              state = 'granted'
            } catch {
              state = 'denied'
            }
          }
          break
      }
    } catch (error) {
      state = 'denied'
    }

    return {
      name: permission,
      state,
      supported: true
    }
  }

  // Request permission
  static async requestPermission(permission: PermissionName): Promise<PermissionStatus> {
    const currentStatus = await this.getPermissionStatus(permission)

    if (!currentStatus.supported) {
      return currentStatus
    }

    if (currentStatus.state === 'granted') {
      return currentStatus
    }

    let newState = currentStatus.state

    try {
      switch (permission) {
        case 'notifications':
          if ('requestPermission' in Notification) {
            newState = await Notification.requestPermission() as any
          }
          break

        case 'geolocation':
          // Request by attempting to get current position
          return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
              () => resolve({ ...currentStatus, state: 'granted' }),
              () => resolve({ ...currentStatus, state: 'denied' }),
              { timeout: 5000 }
            )
          })

        case 'camera':
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true })
            stream.getTracks().forEach(track => track.stop()) // Clean up
            newState = 'granted' as const
          } catch {
            newState = 'denied' as const
          }
          break

        case 'microphone':
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            stream.getTracks().forEach(track => track.stop()) // Clean up
            newState = 'granted' as const
          } catch {
            newState = 'denied' as const
          }
          break

        case 'persistent-storage':
          if ('storage' in navigator && 'persist' in navigator.storage) {
            const granted = await navigator.storage.persist()
            newState = granted ? ('granted' as const) : ('denied' as const)
          }
          break

        case 'background-sync':
          // Implicit with service worker - already handled in getPermissionStatus
          break
      }
    } catch (error) {
      newState = 'denied'
    }

    const finalStatus = {
      name: permission,
      state: newState,
      supported: true
    }

    // Notify listeners
    this.notifyPermissionChange(finalStatus)

    return finalStatus
  }

  // Listen for permission changes
  static onPermissionChange(permission: PermissionName, callback: (status: PermissionStatus) => void): () => void {
    const key = permission
    if (!this.permissionCallbacks.has(key)) {
      this.permissionCallbacks.set(key, [])
    }

    this.permissionCallbacks.get(key)!.push(callback)

    // Set up native permission monitoring if available
    this.setupPermissionMonitoring(permission)

    // Return unsubscribe function
    return () => {
      const callbacks = this.permissionCallbacks.get(key)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    }
  }

  // Set up native permission monitoring
  private static async setupPermissionMonitoring(permission: PermissionName) {
    if (!('permissions' in navigator)) return

    try {
      let queryName: string
      switch (permission) {
        case 'notifications':
          queryName = 'notifications'
          break
        case 'geolocation':
          queryName = 'geolocation'
          break
        case 'camera':
          queryName = 'camera'
          break
        case 'microphone':
          queryName = 'microphone'
          break
        default:
          return // Not supported for native monitoring
      }

      const permissionStatus = await navigator.permissions.query({ name: queryName as any })

      permissionStatus.addEventListener('change', () => {
        const status: PermissionStatus = {
          name: permission,
          state: permissionStatus.state as any,
          supported: true
        }
        this.notifyPermissionChange(status)
      })
    } catch (error) {
      // Silent fail - not all browsers support all permissions
    }
  }

  // Notify permission change
  private static notifyPermissionChange(status: PermissionStatus) {
    const callbacks = this.permissionCallbacks.get(status.name)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(status)
        } catch (error) {
          // Silent fail for callback errors
        }
      })
    }
  }

  // Get all permission statuses
  static async getAllPermissions(): Promise<PermissionStatus[]> {
    // Exclude camera and microphone as they are blocked by Permissions-Policy
    // to prevent browser warnings
    const permissions: PermissionName[] = [
      'notifications',
      'geolocation',
      // 'camera', // Blocked by Permissions-Policy
      // 'microphone', // Blocked by Permissions-Policy
      'background-sync',
      'persistent-storage'
    ]

    return Promise.all(
      permissions.map(permission => this.getPermissionStatus(permission))
    )
  }

  // Request multiple permissions
  static async requestMultiplePermissions(permissions: PermissionName[]): Promise<PermissionStatus[]> {
    return Promise.all(
      permissions.map(permission => this.requestPermission(permission))
    )
  }

  // Check if critical permissions are granted for HNWI features
  static async checkCriticalPermissions(): Promise<{
    notifications: boolean
    persistentStorage: boolean
    backgroundSync: boolean
    allCritical: boolean
  }> {
    const [notifications, persistentStorage, backgroundSync] = await Promise.all([
      this.getPermissionStatus('notifications'),
      this.getPermissionStatus('persistent-storage'),
      this.getPermissionStatus('background-sync')
    ])

    const result = {
      notifications: notifications.state === 'granted',
      persistentStorage: persistentStorage.state === 'granted',
      backgroundSync: backgroundSync.state === 'granted',
      allCritical: false
    }

    result.allCritical = result.notifications && result.persistentStorage && result.backgroundSync

    return result
  }

  // Smart permission request flow for HNWI app
  static async requestCriticalPermissionsFlow(): Promise<{
    success: boolean
    permissions: PermissionStatus[]
    message: string
  }> {
    try {
      // Check current status first
      const current = await this.checkCriticalPermissions()

      if (current.allCritical) {
        return {
          success: true,
          permissions: await this.getAllPermissions(),
          message: 'All critical permissions already granted'
        }
      }

      // Request in order of importance
      const permissions: PermissionStatus[] = []

      // 1. Persistent storage (for offline intelligence)
      if (!current.persistentStorage) {
        const storage = await this.requestPermission('persistent-storage')
        permissions.push(storage)
      }

      // 2. Background sync (for real-time updates)
      if (!current.backgroundSync) {
        const sync = await this.requestPermission('background-sync')
        permissions.push(sync)
      }

      // 3. Notifications (for intelligence alerts)
      if (!current.notifications) {
        const notifs = await this.requestPermission('notifications')
        permissions.push(notifs)
      }

      const finalCheck = await this.checkCriticalPermissions()

      return {
        success: finalCheck.allCritical,
        permissions,
        message: finalCheck.allCritical
          ? 'All critical permissions granted'
          : 'Some permissions were not granted - app functionality may be limited'
      }

    } catch (error) {
      return {
        success: false,
        permissions: [],
        message: 'Failed to request permissions'
      }
    }
  }
}