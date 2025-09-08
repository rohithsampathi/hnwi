import { notificationService } from './notification-service';

export class PushNotificationService {
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;

  // Check if push notifications are supported
  static isSupported(): boolean {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  // Check current permission status
  static getPermissionStatus(): NotificationPermission {
    if ('Notification' in window) {
      return Notification.permission;
    }
    return 'denied';
  }

  // Request notification permission
  static async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  // Initialize push notifications
  async initialize(): Promise<boolean> {
    try {
      if (!PushNotificationService.isSupported()) {
        // Warning:('Push notifications are not supported');
        return false;
      }

      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      // Log:('Service Worker registered successfully');

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;

      return true;
    } catch (error) {
      // Error:('Failed to initialize push notifications:', error);
      return false;
    }
  }

  // Subscribe to push notifications
  async subscribe(): Promise<boolean> {
    try {
      if (!this.registration) {
        const initialized = await this.initialize();
        if (!initialized) return false;
      }

      // Request permission if not granted
      const permission = await PushNotificationService.requestPermission();
      if (permission !== 'granted') {
        // Warning:('Push notification permission denied');
        return false;
      }

      // Get VAPID key from backend
      const { vapid_public_key } = await notificationService.getVAPIDKey();

      // Subscribe to push notifications
      this.subscription = await this.registration!.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapid_public_key)
      });

      // Send subscription to backend
      const subscriptionJson = this.subscription.toJSON();
      await notificationService.subscribeToPush({
        endpoint: subscriptionJson.endpoint!,
        keys: {
          p256dh: subscriptionJson.keys!.p256dh,
          auth: subscriptionJson.keys!.auth
        }
      });

      // Log:('Successfully subscribed to push notifications');
      return true;
    } catch (error) {
      // Error:('Failed to subscribe to push notifications:', error);
      return false;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe(): Promise<boolean> {
    try {
      if (this.subscription) {
        await this.subscription.unsubscribe();
        this.subscription = null;
      }

      // Notify backend
      await notificationService.unsubscribeFromPush();

      // Log:('Successfully unsubscribed from push notifications');
      return true;
    } catch (error) {
      // Error:('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  // Get current subscription status
  async getSubscription(): Promise<PushSubscription | null> {
    try {
      if (!this.registration) {
        const initialized = await this.initialize();
        if (!initialized) return null;
      }

      this.subscription = await this.registration!.pushManager.getSubscription();
      return this.subscription;
    } catch (error) {
      // Error:('Failed to get push subscription:', error);
      return null;
    }
  }

  // Check if currently subscribed
  async isSubscribed(): Promise<boolean> {
    const subscription = await this.getSubscription();
    return subscription !== null;
  }

  // Show a test notification
  async showTestNotification(): Promise<void> {
    try {
      const permission = PushNotificationService.getPermissionStatus();
      if (permission !== 'granted') {
        throw new Error('Notification permission not granted');
      }

      new Notification('HNWI Chronicles', {
        body: 'Push notifications are working correctly!',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: 'test-notification',
        timestamp: Date.now(),
        data: {
          testNotification: true
        }
      });
    } catch (error) {
      // Error:('Failed to show test notification:', error);
      throw error;
    }
  }

  // Convert VAPID key from base64 to Uint8Array
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  // Setup push event handlers (called by service worker)
  static setupPushEventHandlers() {
    // This runs in the service worker context
    if (typeof self !== 'undefined' && 'addEventListener' in self) {
      self.addEventListener('push', (event: any) => {
        // Log:('Push message received:', event);

        let notificationData: any = {};
        
        try {
          if (event.data) {
            notificationData = event.data.json();
          }
        } catch (error) {
          // Warning:('Failed to parse push data as JSON:', error);
          notificationData = {
            title: 'New Notification',
            body: event.data?.text() || 'You have a new notification'
          };
        }

        const notificationOptions: NotificationOptions = {
          body: notificationData.content || notificationData.body || 'You have a new notification',
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          tag: notificationData.id || 'notification',
          timestamp: Date.now(),
          requireInteraction: notificationData.priority === 'urgent',
          vibrate: [200, 100, 200],
          data: {
            ...notificationData,
            clickUrl: notificationData.actionUrl || '/'
          },
          actions: [
            {
              action: 'view',
              title: 'View',
              icon: '/images/view-icon.png'
            },
            {
              action: 'dismiss',
              title: 'Dismiss',
              icon: '/images/dismiss-icon.png'
            }
          ]
        };

        const title = notificationData.title || 'HNWI Chronicles';

        event.waitUntil(
          (self as any).registration.showNotification(title, notificationOptions)
        );
      });

      self.addEventListener('notificationclick', (event: any) => {
        // Log:('Notification clicked:', event);

        event.notification.close();

        if (event.action === 'dismiss') {
          return;
        }

        // Default action or 'view' action
        const clickUrl = event.notification.data?.clickUrl || '/';

        event.waitUntil(
          (self as any).clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clients: any[]) => {
              // Check if there's already a window/tab open with the target URL
              for (const client of clients) {
                if (client.url === clickUrl && 'focus' in client) {
                  return client.focus();
                }
              }

              // If no window/tab is open, open a new one
              if ((self as any).clients.openWindow) {
                return (self as any).clients.openWindow(clickUrl);
              }
            })
        );
      });

      self.addEventListener('notificationclose', (event: any) => {
        // Log:('Notification closed:', event);
        // Track notification close analytics here if needed
      });
    }
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();
export default pushNotificationService;