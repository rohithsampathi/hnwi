import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  notificationService, 
  NotificationRecord, 
  NotificationInboxResponse, 
  NotificationStats,
  UserNotificationPreferences 
} from '@/lib/services/notification-service';
import { canAccessFeaturesWithFallback } from '@/lib/auth-utils';

export interface UseNotificationsOptions {
  pollInterval?: number; // ms, default 30000 (30s)
  enablePolling?: boolean; // default true
  autoFetch?: boolean; // default true
}

export interface UseNotificationsReturn {
  // State
  notifications: NotificationRecord[];
  stats: NotificationStats | null;
  preferences: UserNotificationPreferences | null;
  loading: boolean;
  preferencesLoading: boolean;
  error: string | null;
  hasMore: boolean;
  
  // Computed values
  unreadCount: number;
  urgentCount: number;
  
  // Actions
  fetchNotifications: (limit?: number, offset?: number, unreadOnly?: boolean) => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchPreferences: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAsUnread: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  updatePreferences: (prefs: Partial<UserNotificationPreferences>) => Promise<void>;
  refresh: () => Promise<void>;
  
  // Batch operations
  batchMarkAsRead: (ids: string[]) => Promise<void>;
  batchDelete: (ids: string[]) => Promise<void>;
}

export function useNotifications(
  options: UseNotificationsOptions = {}
): UseNotificationsReturn {
  const {
    pollInterval = 30000, // 30 seconds
    enablePolling = true,
    autoFetch = true
  } = options;

  // State
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [preferences, setPreferences] = useState<UserNotificationPreferences | null>(null);
  const [loading, setLoading] = useState(false); // Start with loading false
  const [preferencesLoading, setPreferencesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Refs for cleanup
  const pollIntervalRef = useRef<NodeJS.Timeout>();
  const mountedRef = useRef(true);

  // Computed values
  const unreadCount = stats?.unread_notifications || 0;
  const urgentCount = notifications.filter(n => n.priority === 'urgent' && n.status !== 'read').length;

  // Fetch notifications with error handling
  const fetchNotifications = useCallback(async (
    limit = 20, 
    offset = 0, 
    unreadOnly = false
  ) => {
    if (!mountedRef.current) return;
    
    // For first fetch, always set loading and clear error
    if (offset === 0) {
      setLoading(true);
      setError(null);
    }
    
    
    try {
      const response: NotificationInboxResponse = await notificationService.getInbox(
        limit, 
        offset, 
        unreadOnly
      );
      
      if (!mountedRef.current) {
        // Still set loading to false even if unmounted (React strict mode issue)
        if (offset === 0) {
          setLoading(false);
        }
        return;
      }
      
      if (offset === 0) {
        setNotifications(response.notifications || []);
      } else {
        setNotifications(prev => [...prev, ...(response.notifications || [])]);
      }
      
      setHasMore(response.has_more || false);
      setCurrentPage(Math.floor(offset / limit) + 1);
      
    } catch (err) {
      if (!mountedRef.current) {
        if (offset === 0) {
          setLoading(false);
        }
        return;
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notifications';
      setError(errorMessage);
      
      if (offset === 0) {
        setNotifications([]);
      }
    }
    
    // ALWAYS set loading to false after first fetch
    if (mountedRef.current && offset === 0) {
      setLoading(false);
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    if (!mountedRef.current) return;
    
    
    try {
      const statsData = await notificationService.getStats();
      if (mountedRef.current) {
        setStats(statsData);
      }
    } catch (err) {
      // Silently fail stats fetch
    }
  }, []);

  // Fetch preferences
  const fetchPreferences = useCallback(async () => {
    
    try {
      setPreferencesLoading(true);
      const prefs = await notificationService.getPreferences();
      setPreferences(prefs);
    } catch (err) {
      // Set default preferences on error
      const defaultPrefs = {
        email_enabled: true,
        push_enabled: false,
        in_app_enabled: true,
        sms_enabled: false,
        quiet_hours_enabled: false,
        quiet_hours_start: "22:00",
        quiet_hours_end: "08:00",
        event_types: {
          elite_pulse: true,
          hnwi_world: true,
          crown_vault: true,
          social_hub: true,
          system_notification: true
        },
        frequency_limits: {
          max_per_hour: 10,
          max_per_day: 50
        }
      };
      setPreferences(defaultPrefs);
    } finally {
      setPreferencesLoading(false);
    }
  }, []);

  // Mark as read with optimistic update
  const markAsRead = useCallback(async (id: string) => {
    try {
      // Optimistic update
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, status: 'read' as const, read_at: new Date().toISOString() } : n)
      );
      setStats(prev => prev ? { ...prev, unread_notifications: Math.max(0, prev.unread_notifications - 1) } : null);
      
      await notificationService.markAsRead(id);
      
      // Refresh stats to get accurate count
      await fetchStats();
    } catch (err) {
      // Revert optimistic update
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, status: 'delivered' as const, read_at: undefined } : n)
      );
      throw err;
    }
  }, [fetchStats]);

  // Mark as unread with optimistic update
  const markAsUnread = useCallback(async (id: string) => {
    try {
      // Optimistic update
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, status: 'delivered' as const, read_at: undefined } : n)
      );
      setStats(prev => prev ? { ...prev, unread_notifications: prev.unread_notifications + 1 } : null);
      
      await notificationService.markAsUnread(id);
      
      // Refresh stats to get accurate count
      await fetchStats();
    } catch (err) {
      // Revert optimistic update
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, status: 'read' as const, read_at: new Date().toISOString() } : n)
      );
      throw err;
    }
  }, [fetchStats]);

  // Delete notification with optimistic update
  const deleteNotification = useCallback(async (id: string) => {
    try {
      const notification = notifications.find(n => n.id === id);
      
      // Optimistic update
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      if (notification?.status !== 'read') {
        setStats(prev => prev ? { ...prev, unread_notifications: Math.max(0, prev.unread_notifications - 1) } : null);
      }
      
      await notificationService.deleteNotification(id);
      
      // Refresh stats to get accurate count
      await fetchStats();
    } catch (err) {
      // Revert would require re-fetching, so just refresh
      await fetchNotifications(1);
      throw err;
    }
  }, [notifications, fetchStats, fetchNotifications]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      // Optimistic update
      setNotifications(prev => 
        prev.map(n => ({ ...n, status: 'read' as const, read_at: new Date().toISOString() }))
      );
      setStats(prev => prev ? { ...prev, unread_notifications: 0 } : null);
      
      await notificationService.markAllAsRead();
      
      // Refresh to ensure consistency
      await Promise.all([fetchNotifications(1), fetchStats()]);
    } catch (err) {
      // Refresh on error
      await fetchNotifications(1);
      throw err;
    }
  }, [fetchNotifications, fetchStats]);

  // Update preferences
  const updatePreferences = useCallback(async (prefs: Partial<UserNotificationPreferences>) => {
    try {
      const updatedPrefs = await notificationService.updatePreferences(prefs);
      setPreferences(updatedPrefs);
    } catch (err) {
      throw err;
    }
  }, []);

  // Batch operations
  const batchMarkAsRead = useCallback(async (ids: string[]) => {
    try {
      // Optimistic update
      setNotifications(prev => 
        prev.map(n => ids.includes(n.id) ? { ...n, status: 'read' as const, read_at: new Date().toISOString() } : n)
      );
      
      const unreadIds = notifications.filter(n => ids.includes(n.id) && n.status !== 'read');
      setStats(prev => prev ? { ...prev, unread_notifications: Math.max(0, prev.unread_notifications - unreadIds.length) } : null);
      
      await notificationService.batchMarkAsRead(ids);
      await fetchStats();
    } catch (err) {
      await fetchNotifications(1);
      throw err;
    }
  }, [notifications, fetchStats, fetchNotifications]);

  const batchDelete = useCallback(async (ids: string[]) => {
    try {
      const deletedNotifications = notifications.filter(n => ids.includes(n.id));
      const unreadDeletedCount = deletedNotifications.filter(n => n.status !== 'read').length;
      
      // Optimistic update
      setNotifications(prev => prev.filter(n => !ids.includes(n.id)));
      setStats(prev => prev ? { ...prev, unread_notifications: Math.max(0, prev.unread_notifications - unreadDeletedCount) } : null);
      
      await notificationService.batchDelete(ids);
      await fetchStats();
    } catch (err) {
      await fetchNotifications(1);
      throw err;
    }
  }, [notifications, fetchStats, fetchNotifications]);

  // Refresh all data
  const refresh = useCallback(async () => {
    
    // Don't set loading here - let fetchNotifications handle it
    try {
      await fetchNotifications(20, 0);
      await fetchStats();
      await fetchPreferences();
    } catch (error) {
      // Error handling is done in individual functions
    }
  }, [fetchNotifications, fetchStats, fetchPreferences]);

  // Setup polling
  useEffect(() => {
    if (!enablePolling) return;
    
    // Start polling for stats (lightweight)
    const startPolling = () => {
      pollIntervalRef.current = setInterval(() => {
        if (mountedRef.current) {
          fetchStats();
        }
      }, pollInterval);
    };
    
    startPolling();
    
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [enablePolling, pollInterval, fetchStats]);

  // Initial fetch
  useEffect(() => {
    // Skip if already initialized
    if (hasInitialized) return;
    
    setHasInitialized(true);
    
    const initializeData = async () => {
      if (autoFetch && canAccessFeaturesWithFallback()) {
        // Only fetch if auto-fetch is enabled and user is authenticated
        await fetchNotifications(20, 0);
        fetchStats(); // Don't await this as it doesn't affect loading state
        fetchPreferences(); // Don't await this as it doesn't affect loading state
      } else {
        // Ensure loading is false if we're not fetching
        setLoading(false);
      }
    };
    
    initializeData();
  }, [hasInitialized, autoFetch, fetchNotifications, fetchStats, fetchPreferences]); // Add deps to ensure it runs

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  return {
    // State
    notifications,
    stats,
    preferences,
    loading,
    preferencesLoading,
    error,
    hasMore,
    
    // Computed
    unreadCount,
    urgentCount,
    
    // Actions
    fetchNotifications,
    fetchStats,
    fetchPreferences,
    markAsRead,
    markAsUnread,
    deleteNotification,
    markAllAsRead,
    updatePreferences,
    refresh,
    
    // Batch operations
    batchMarkAsRead,
    batchDelete
  };
}