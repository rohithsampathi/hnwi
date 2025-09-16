import { useState, useEffect, useCallback } from 'react';
import { pushNotificationService, PushNotificationService } from '@/lib/services/push-notification-service';

export interface UsePushNotificationsReturn {
  // Status
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission;
  loading: boolean;
  error: string | null;

  // Actions
  requestPermission: () => Promise<boolean>;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  showTestNotification: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const [isSupported] = useState(PushNotificationService.isSupported());
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check current status
  const checkStatus = useCallback(async () => {
    if (!isSupported) return;

    try {
      const currentPermission = PushNotificationService.getPermissionStatus();
      setPermission(currentPermission);

      const subscribed = await pushNotificationService.isSubscribed();
      setIsSubscribed(subscribed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check status');
    }
  }, [isSupported]);

  // Request permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Push notifications are not supported in this browser');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const newPermission = await PushNotificationService.requestPermission();
      setPermission(newPermission);
      
      return newPermission === 'granted';
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request permission';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isSupported]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Push notifications are not supported in this browser');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const success = await pushNotificationService.subscribe();
      
      if (success) {
        setIsSubscribed(true);
        setPermission('granted');
      }
      
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to subscribe to push notifications';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isSupported]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const success = await pushNotificationService.unsubscribe();
      
      if (success) {
        setIsSubscribed(false);
      }
      
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unsubscribe from push notifications';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Show test notification
  const showTestNotification = useCallback(async (): Promise<void> => {
    if (!isSupported) {
      throw new Error('Push notifications are not supported in this browser');
    }

    if (permission !== 'granted') {
      throw new Error('Push notification permission not granted');
    }

    setError(null);

    try {
      await pushNotificationService.showTestNotification();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to show test notification';
      setError(errorMessage);
      throw err;
    }
  }, [isSupported, permission]);

  // Refresh status
  const refresh = useCallback(async (): Promise<void> => {
    await checkStatus();
  }, [checkStatus]);

  // Check status on mount and when permission changes
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Listen for permission changes
  useEffect(() => {
    if (!isSupported || !('permissions' in navigator)) return;

    const handlePermissionChange = () => {
      const newPermission = PushNotificationService.getPermissionStatus();
      setPermission(newPermission);
      
      if (newPermission === 'denied') {
        setIsSubscribed(false);
      }
    };

    // Query permission and listen for changes
    navigator.permissions.query({ name: 'notifications' as PermissionName })
      .then(permissionStatus => {
        permissionStatus.addEventListener('change', handlePermissionChange);
        
        return () => {
          permissionStatus.removeEventListener('change', handlePermissionChange);
        };
      })
      .catch(() => {
        // Permissions API not supported, fallback to periodic checks
        const interval = setInterval(handlePermissionChange, 5000);
        return () => clearInterval(interval);
      });
  }, [isSupported]);

  return {
    // Status
    isSupported,
    isSubscribed,
    permission,
    loading,
    error,
    
    // Actions
    requestPermission,
    subscribe,
    unsubscribe,
    showTestNotification,
    refresh
  };
}