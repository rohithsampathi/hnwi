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
  error: string | null;
  hasMore: boolean;
  
  // Computed values
  unreadCount: number;
  urgentCount: number;
  
  // Actions
  fetchNotifications: (page?: number, filter?: 'unread' | 'read' | 'all') => Promise<void>;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Refs for cleanup
  const pollIntervalRef = useRef<NodeJS.Timeout>();
  const mountedRef = useRef(true);

  // Computed values
  const unreadCount = stats?.unread_count || 0;
  const urgentCount = stats?.urgent_count || 0;

  // Fetch notifications with error handling
  const fetchNotifications = useCallback(async (
    page = 1, 
    filter?: 'unread' | 'read' | 'all'
  ) => {
    if (!mountedRef.current) return;
    
    // Check if user is authenticated before making API call
    if (!canAccessFeaturesWithFallback()) {
      console.log('Skipping notification fetch - user not authenticated');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response: NotificationInboxResponse = await notificationService.getInbox(
        page, 
        20, 
        filter
      );
      
      if (!mountedRef.current) return;
      
      if (page === 1) {
        setNotifications(response.notifications);
      } else {
        setNotifications(prev => [...prev, ...response.notifications]);
      }
      
      setHasMore(response.has_more);
      setCurrentPage(page);
      
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
      console.error('Failed to fetch notifications:', err);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    if (!mountedRef.current) return;
    
    // Check if user is authenticated before making API call
    if (!canAccessFeaturesWithFallback()) {
      return;
    }
    
    try {
      const statsData = await notificationService.getStats();
      if (mountedRef.current) {
        setStats(statsData);
      }
    } catch (err) {
      console.error('Failed to fetch notification stats:', err);
    }
  }, []);

  // Fetch preferences
  const fetchPreferences = useCallback(async () => {
    if (!mountedRef.current) return;
    
    try {
      const prefs = await notificationService.getPreferences();
      if (mountedRef.current) {
        setPreferences(prefs);
      }
    } catch (err) {
      console.error('Failed to fetch notification preferences:', err);
      // Set default preferences on error
      if (mountedRef.current) {
        const defaultPrefs = {
          email_enabled: true,
          push_enabled: false,
          in_app_enabled: true,
          sms_enabled: false,
          quiet_hours_enabled: false,
          quiet_hours_start: "22:00",
          quiet_hours_end: "08:00",
          event_types: {
            elite_pulse_generated: true,
            opportunity_added: true,
            crown_vault_update: true,
            social_event_added: true,
            market_alert: true,
            regulatory_update: true,
            system_notification: true
          },
          frequency_limits: {
            max_per_hour: 10,
            max_per_day: 50
          }
        };
        setPreferences(defaultPrefs);
      }
    }
  }, []);

  // Mark as read with optimistic update
  const markAsRead = useCallback(async (id: string) => {
    try {
      // Optimistic update
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, status: 'read' as const, read_at: new Date().toISOString() } : n)
      );
      setStats(prev => prev ? { ...prev, unread_count: Math.max(0, prev.unread_count - 1) } : null);
      
      await notificationService.markAsRead(id);
      
      // Refresh stats to get accurate count
      await fetchStats();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
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
      setStats(prev => prev ? { ...prev, unread_count: prev.unread_count + 1 } : null);
      
      await notificationService.markAsUnread(id);
      
      // Refresh stats to get accurate count
      await fetchStats();
    } catch (err) {
      console.error('Failed to mark notification as unread:', err);
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
        setStats(prev => prev ? { ...prev, unread_count: Math.max(0, prev.unread_count - 1) } : null);
      }
      
      await notificationService.deleteNotification(id);
      
      // Refresh stats to get accurate count
      await fetchStats();
    } catch (err) {
      console.error('Failed to delete notification:', err);
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
      setStats(prev => prev ? { ...prev, unread_count: 0 } : null);
      
      await notificationService.markAllAsRead();
      
      // Refresh to ensure consistency
      await Promise.all([fetchNotifications(1), fetchStats()]);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
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
      console.error('Failed to update notification preferences:', err);
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
      setStats(prev => prev ? { ...prev, unread_count: Math.max(0, prev.unread_count - unreadIds.length) } : null);
      
      await notificationService.batchMarkAsRead(ids);
      await fetchStats();
    } catch (err) {
      console.error('Failed to batch mark notifications as read:', err);
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
      setStats(prev => prev ? { ...prev, unread_count: Math.max(0, prev.unread_count - unreadDeletedCount) } : null);
      
      await notificationService.batchDelete(ids);
      await fetchStats();
    } catch (err) {
      console.error('Failed to batch delete notifications:', err);
      await fetchNotifications(1);
      throw err;
    }
  }, [notifications, fetchStats, fetchNotifications]);

  // Refresh all data
  const refresh = useCallback(async () => {
    await Promise.all([
      fetchNotifications(1),
      fetchStats(),
      fetchPreferences()
    ]);
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
    if (autoFetch) {
      refresh();
    }
  }, [autoFetch, refresh]);

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