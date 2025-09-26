// lib/services/background-sync-service.ts
// Background sync service for offline form submissions and data synchronization

export interface SyncData {
  id: string
  type: 'form_submission' | 'message_send' | 'data_update' | 'feedback_submit'
  endpoint: string
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  data: any
  headers?: Record<string, string>
  timestamp: number
  retries?: number
  maxRetries?: number
}

export class BackgroundSyncService {
  private static readonly SYNC_STORE_NAME = 'sync-store'
  private static readonly SYNC_TAG = 'background-sync'
  private static readonly MAX_RETRIES = 3

  // Check if Background Sync is supported
  static isSupported(): boolean {
    return 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype
  }

  // Initialize background sync service
  static async initialize(): Promise<void> {
    if (!this.isSupported()) {
      return
    }

    try {
      const registration = await navigator.serviceWorker.ready

      // Listen for sync events in the main thread
      navigator.serviceWorker.addEventListener('message', this.handleSyncMessage)

      // Register sync event if supported
      if ('sync' in registration) {
        await (registration as any).sync.register(this.SYNC_TAG)
      }
    } catch (error) {
      // Fallback to immediate submission
    }
  }

  // Queue data for background sync
  static async queueForSync(syncData: Omit<SyncData, 'id' | 'timestamp'>): Promise<string> {
    const data: SyncData = {
      ...syncData,
      id: this.generateSyncId(),
      timestamp: Date.now(),
      retries: 0,
      maxRetries: syncData.maxRetries || this.MAX_RETRIES
    }

    try {
      // Store in IndexedDB for persistence
      await this.storeSyncData(data)

      // Try immediate submission if online
      if (navigator.onLine) {
        await this.processSyncData(data)
        return data.id
      }

      // Register for background sync if supported
      if (this.isSupported()) {
        const registration = await navigator.serviceWorker.ready
        if ('sync' in registration) {
          await (registration as any).sync.register(this.SYNC_TAG)
        }
      }

      return data.id
    } catch (error) {
      throw new Error(`Failed to queue data for sync: ${error}`)
    }
  }

  // Process sync data immediately
  private static async processSyncData(syncData: SyncData): Promise<boolean> {
    try {
      const response = await fetch(syncData.endpoint, {
        method: syncData.method,
        headers: {
          'Content-Type': 'application/json',
          ...syncData.headers
        },
        body: JSON.stringify(syncData.data),
        credentials: 'include'
      })

      if (response.ok) {
        await this.removeSyncData(syncData.id)
        this.notifySuccess(syncData)
        return true
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      syncData.retries = (syncData.retries || 0) + 1

      if (syncData.retries >= (syncData.maxRetries || this.MAX_RETRIES)) {
        await this.removeSyncData(syncData.id)
        this.notifyFailure(syncData, error)
        return false
      }

      // Update retry count
      await this.storeSyncData(syncData)
      throw error
    }
  }

  // Store sync data in IndexedDB
  private static async storeSyncData(data: SyncData): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.SYNC_STORE_NAME, 2) // Increment version to force upgrade

      request.onerror = () => reject(request.error)

      request.onupgradeneeded = () => {
        const db = request.result
        // Clear old object stores if they exist to avoid conflicts
        if (db.objectStoreNames.contains('sync_queue')) {
          db.deleteObjectStore('sync_queue')
        }
        // Create new object store
        db.createObjectStore('sync_queue', { keyPath: 'id' })
      }

      request.onsuccess = () => {
        const db = request.result

        // Check if object store exists before creating transaction
        if (!db.objectStoreNames.contains('sync_queue')) {
          db.close()
          reject(new Error('Object store sync_queue not found'))
          return
        }

        try {
          const transaction = db.transaction(['sync_queue'], 'readwrite')
          const store = transaction.objectStore('sync_queue')

          const putRequest = store.put(data)
          putRequest.onsuccess = () => {
            db.close()
            resolve()
          }
          putRequest.onerror = () => {
            db.close()
            reject(putRequest.error)
          }

          transaction.onerror = () => {
            db.close()
            reject(transaction.error)
          }
        } catch (error) {
          db.close()
          reject(error)
        }
      }
    })
  }

  // Remove sync data from IndexedDB
  private static async removeSyncData(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.SYNC_STORE_NAME, 2)

      request.onerror = () => reject(request.error)

      request.onupgradeneeded = () => {
        const db = request.result
        // Clear old object stores if they exist to avoid conflicts
        if (db.objectStoreNames.contains('sync_queue')) {
          db.deleteObjectStore('sync_queue')
        }
        // Create new object store
        db.createObjectStore('sync_queue', { keyPath: 'id' })
      }

      request.onsuccess = () => {
        const db = request.result

        // Check if object store exists before creating transaction
        if (!db.objectStoreNames.contains('sync_queue')) {
          db.close()
          reject(new Error('Object store sync_queue not found'))
          return
        }

        try {
          const transaction = db.transaction(['sync_queue'], 'readwrite')
          const store = transaction.objectStore('sync_queue')

          const deleteRequest = store.delete(id)
          deleteRequest.onsuccess = () => {
            db.close()
            resolve()
          }
          deleteRequest.onerror = () => {
            db.close()
            reject(deleteRequest.error)
          }

          transaction.onerror = () => {
            db.close()
            reject(transaction.error)
          }
        } catch (error) {
          db.close()
          reject(error)
        }
      }
    })
  }

  // Get all pending sync data
  static async getPendingSyncData(): Promise<SyncData[]> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.SYNC_STORE_NAME, 2)

      request.onerror = () => reject(request.error)

      request.onupgradeneeded = () => {
        const db = request.result
        // Clear old object stores if they exist to avoid conflicts
        if (db.objectStoreNames.contains('sync_queue')) {
          db.deleteObjectStore('sync_queue')
        }
        // Create new object store
        db.createObjectStore('sync_queue', { keyPath: 'id' })
      }

      request.onsuccess = () => {
        const db = request.result

        // Check if object store exists before creating transaction
        if (!db.objectStoreNames.contains('sync_queue')) {
          db.close()
          resolve([]) // Return empty array if no object store
          return
        }

        try {
          const transaction = db.transaction(['sync_queue'], 'readonly')
          const store = transaction.objectStore('sync_queue')

          const getAllRequest = store.getAll()
          getAllRequest.onsuccess = () => {
            db.close()
            resolve(getAllRequest.result || [])
          }
          getAllRequest.onerror = () => {
            db.close()
            reject(getAllRequest.error)
          }

          transaction.onerror = () => {
            db.close()
            reject(transaction.error)
          }
        } catch (error) {
          db.close()
          resolve([]) // Return empty array on error
        }
      }
    })
  }

  // Process all pending sync data
  static async processAllPending(): Promise<void> {
    try {
      const pendingData = await this.getPendingSyncData()

      for (const data of pendingData) {
        try {
          await this.processSyncData(data)
        } catch (error) {
          // Continue processing other items even if one fails
        }
      }
    } catch (error) {
      throw new Error(`Failed to process pending sync data: ${error}`)
    }
  }

  // Handle messages from service worker
  private static handleSyncMessage = (event: MessageEvent) => {
    if (event.data && event.data.type === 'SYNC_COMPLETE') {
      const { syncId, success } = event.data

      if (success) {
        // Notify user of successful sync
        this.showSyncNotification('Data synchronized successfully', 'success')
      } else {
        this.showSyncNotification('Failed to synchronize data', 'error')
      }
    }
  }

  // Show sync notification
  private static showSyncNotification(message: string, type: 'success' | 'error') {
    // Use existing notification service if available
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('sync-notification', {
        detail: { message, type }
      }))
    }
  }

  // Notify sync success
  private static notifySuccess(syncData: SyncData) {
    this.showSyncNotification(`${syncData.type.replace('_', ' ')} completed`, 'success')
  }

  // Notify sync failure
  private static notifyFailure(syncData: SyncData, error: any) {
    this.showSyncNotification(`${syncData.type.replace('_', ' ')} failed`, 'error')
  }

  // Generate unique sync ID
  private static generateSyncId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Queue form submission for background sync
  static async queueFormSubmission(endpoint: string, formData: any, headers?: Record<string, string>): Promise<string> {
    return this.queueForSync({
      type: 'form_submission',
      endpoint,
      method: 'POST',
      data: formData,
      headers
    })
  }

  // Queue message send for background sync
  static async queueMessageSend(endpoint: string, messageData: any): Promise<string> {
    return this.queueForSync({
      type: 'message_send',
      endpoint,
      method: 'POST',
      data: messageData
    })
  }

  // Queue feedback submission for background sync
  static async queueFeedbackSubmit(endpoint: string, feedbackData: any): Promise<string> {
    return this.queueForSync({
      type: 'feedback_submit',
      endpoint,
      method: 'POST',
      data: feedbackData
    })
  }
}