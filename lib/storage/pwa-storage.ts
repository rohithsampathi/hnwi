// lib/storage/pwa-storage.ts
// PWA-compatible storage using IndexedDB as fallback for sessionStorage
// Addresses Issue #7: sessionStorage is cleared in PWA standalone mode

const DB_NAME = 'hnwi_chronicles_storage';
const DB_VERSION = 1;
const STORE_NAME = 'pwa_session';

// Session timeout: 24 hours (in milliseconds)
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;

interface StorageItem {
  key: string;
  value: string;
  timestamp: number;
  expiresAt?: number;
}

class PWAStorage {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;
  private memoryCache: Map<string, string> = new Map();
  private isInitialized = false;

  constructor() {
    // Initialize on creation if in browser
    if (typeof window !== 'undefined') {
      this.initPromise = this.init();
    }
  }

  // Initialize IndexedDB
  private async init(): Promise<void> {
    if (this.isInitialized) return;

    // Check if IndexedDB is available
    if (typeof window === 'undefined' || !window.indexedDB) {
      this.isInitialized = true;
      return;
    }

    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      return new Promise((resolve, reject) => {
        request.onerror = () => {
          // Fall back to memory storage
          this.isInitialized = true;
          resolve();
        };

        request.onsuccess = () => {
          this.db = request.result;
          this.isInitialized = true;
          // Clean up expired items on init
          this.cleanupExpired();
          resolve();
        };

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;

          // Create object store if it doesn't exist
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
            objectStore.createIndex('timestamp', 'timestamp', { unique: false });
          }
        };
      });
    } catch (error) {
      this.isInitialized = true;
    }
  }

  // Ensure DB is initialized before operations
  private async ensureInit(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = this.init();
    }
    await this.initPromise;
  }

  // Set item with optional expiration
  async setItem(key: string, value: string, ttlMs?: number): Promise<void> {
    await this.ensureInit();

    // Update memory cache
    this.memoryCache.set(key, value);

    // If no IndexedDB, memory cache is enough
    if (!this.db) {
      // Also try sessionStorage as fallback
      try {
        sessionStorage.setItem(key, value);
      } catch (e) {
        // Ignore sessionStorage errors
      }
      return;
    }

    const item: StorageItem = {
      key,
      value,
      timestamp: Date.now(),
      expiresAt: ttlMs ? Date.now() + ttlMs : undefined
    };

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(item);

        request.onsuccess = () => resolve();
        request.onerror = () => {
          resolve(); // Don't reject, we have memory cache
        };
      } catch (error) {
        resolve();
      }
    });
  }

  // Get item
  async getItem(key: string): Promise<string | null> {
    await this.ensureInit();

    // Check memory cache first
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key)!;
    }

    // Try sessionStorage fallback
    try {
      const sessionValue = sessionStorage.getItem(key);
      if (sessionValue) {
        this.memoryCache.set(key, sessionValue);
        return sessionValue;
      }
    } catch (e) {
      // Ignore sessionStorage errors
    }

    // If no IndexedDB, return null
    if (!this.db) {
      return null;
    }

    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);

        request.onsuccess = () => {
          const item = request.result as StorageItem | undefined;

          if (!item) {
            resolve(null);
            return;
          }

          // Check if expired
          if (item.expiresAt && Date.now() > item.expiresAt) {
            // Remove expired item
            this.removeItem(key);
            resolve(null);
            return;
          }

          // Update memory cache
          this.memoryCache.set(key, item.value);
          resolve(item.value);
        };

        request.onerror = () => {
          resolve(null);
        };
      } catch (error) {
        resolve(null);
      }
    });
  }

  // Remove item
  async removeItem(key: string): Promise<void> {
    await this.ensureInit();

    // Remove from memory cache
    this.memoryCache.delete(key);

    // Try sessionStorage
    try {
      sessionStorage.removeItem(key);
    } catch (e) {
      // Ignore errors
    }

    // If no IndexedDB, done
    if (!this.db) {
      return;
    }

    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(key);

        request.onsuccess = () => resolve();
        request.onerror = () => {
          resolve();
        };
      } catch (error) {
        resolve();
      }
    });
  }

  // Clear all items
  async clear(): Promise<void> {
    await this.ensureInit();

    // Clear memory cache
    this.memoryCache.clear();

    // Try sessionStorage
    try {
      sessionStorage.clear();
    } catch (e) {
      // Ignore errors
    }

    // If no IndexedDB, done
    if (!this.db) {
      return;
    }

    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => {
          resolve();
        };
      } catch (error) {
        resolve();
      }
    });
  }

  // Get all keys
  async keys(): Promise<string[]> {
    await this.ensureInit();

    // If no IndexedDB, return memory cache keys
    if (!this.db) {
      return Array.from(this.memoryCache.keys());
    }

    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAllKeys();

        request.onsuccess = () => {
          resolve(request.result as string[]);
        };

        request.onerror = () => {
          resolve(Array.from(this.memoryCache.keys()));
        };
      } catch (error) {
        resolve(Array.from(this.memoryCache.keys()));
      }
    });
  }

  // Clean up expired items
  private async cleanupExpired(): Promise<void> {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const item = cursor.value as StorageItem;
          // Remove if expired or older than session timeout
          if (
            (item.expiresAt && Date.now() > item.expiresAt) ||
            (Date.now() - item.timestamp > SESSION_TIMEOUT)
          ) {
            cursor.delete();
          }
          cursor.continue();
        }
      };
    } catch (error) {
    }
  }

  // Synchronous API compatibility (returns cached values or null)
  // These should be used sparingly - prefer async methods
  getItemSync(key: string): string | null {
    // Return from memory cache only
    return this.memoryCache.get(key) || null;
  }

  setItemSync(key: string, value: string): void {
    // Update memory cache immediately
    this.memoryCache.set(key, value);
    // Async update to IndexedDB in background
    this.setItem(key, value).catch(err => {
    });
  }

  removeItemSync(key: string): void {
    // Remove from memory cache immediately
    this.memoryCache.delete(key);
    // Async remove from IndexedDB in background
    this.removeItem(key).catch(err => {
    });
  }
}

// Create singleton instance
export const pwaStorage = new PWAStorage();

// Export storage API that mimics sessionStorage
export const storage = {
  // Async methods (preferred for PWA)
  getItem: (key: string) => pwaStorage.getItem(key),
  setItem: (key: string, value: string, ttlMs?: number) => pwaStorage.setItem(key, value, ttlMs),
  removeItem: (key: string) => pwaStorage.removeItem(key),
  clear: () => pwaStorage.clear(),
  keys: () => pwaStorage.keys(),

  // Sync methods for compatibility (use sparingly)
  getItemSync: (key: string) => pwaStorage.getItemSync(key),
  setItemSync: (key: string, value: string) => pwaStorage.setItemSync(key, value),
  removeItemSync: (key: string) => pwaStorage.removeItemSync(key),
};

// Export default
export default storage;
