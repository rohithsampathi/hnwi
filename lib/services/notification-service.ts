import { secureApi } from "@/lib/secure-api";

export const LEGACY_NOTIFICATION_EVENT_TYPES = [
  'elite_pulse',
  'hnwi_world',
  'crown_vault',
  'social_hub',
  'system_notification'
] as const;

export const DETAILED_NOTIFICATION_EVENT_TYPES = [
  'elite_pulse_generated',
  'opportunity_added',
  'crown_vault_update',
  'social_event_added',
  'market_alert',
  'regulatory_update',
  'system_notification'
] as const;

export const NOTIFICATION_EVENT_TYPES = Array.from(
  new Set([
    ...LEGACY_NOTIFICATION_EVENT_TYPES,
    ...DETAILED_NOTIFICATION_EVENT_TYPES
  ])
) as NotificationEventType[];

export type LegacyNotificationEventType = typeof LEGACY_NOTIFICATION_EVENT_TYPES[number];
export type DetailedNotificationEventType = typeof DETAILED_NOTIFICATION_EVENT_TYPES[number];
export type NotificationEventType = LegacyNotificationEventType | DetailedNotificationEventType;
export type NotificationPreferenceEventType = NotificationEventType;
export type NotificationEventPreferences = Record<NotificationPreferenceEventType, boolean>;

export interface NotificationRecord {
  id: string;
  user_id: string;
  event_type: NotificationEventType;
  channel: 'email' | 'push' | 'in_app' | 'sms';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  content: string;
  data: Record<string, any>;
  status: 'queued' | 'processing' | 'sent' | 'delivered' | 'read' | 'failed' | 'expired';
  created_at: string;
  read_at?: string;
  clicked_at?: string;
}

export interface NotificationInboxResponse {
  notifications: NotificationRecord[];
  total_count: number;
  unread_count: number;
  has_more: boolean;
}

export interface NotificationStats {
  user_id: string;
  unread_notifications: number;
  total_notifications: number;
  notifications_by_type: Record<string, number>;
}

export interface UserNotificationPreferences {
  user_id?: string;
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  sms_enabled: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  event_types: NotificationEventPreferences;
  frequency_limits: {
    max_per_hour: number;
    max_per_day: number;
  };
}

export const DEFAULT_NOTIFICATION_EVENT_PREFERENCES: NotificationEventPreferences = {
  elite_pulse: true,
  hnwi_world: true,
  crown_vault: true,
  social_hub: true,
  elite_pulse_generated: true,
  opportunity_added: true,
  crown_vault_update: true,
  social_event_added: true,
  market_alert: true,
  regulatory_update: true,
  system_notification: true
};

export const DEFAULT_NOTIFICATION_PREFERENCES: UserNotificationPreferences = {
  email_enabled: true,
  push_enabled: false,
  in_app_enabled: true,
  sms_enabled: false,
  quiet_hours_enabled: false,
  quiet_hours_start: "22:00",
  quiet_hours_end: "08:00",
  event_types: DEFAULT_NOTIFICATION_EVENT_PREFERENCES,
  frequency_limits: {
    max_per_hour: 10,
    max_per_day: 50
  }
};

export function normalizeNotificationPreferences(
  preferences?: Partial<UserNotificationPreferences> | null
): UserNotificationPreferences {
  const eventTypes = preferences?.event_types as Partial<NotificationEventPreferences> | undefined;
  const frequencyLimits = preferences?.frequency_limits;

  return {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...preferences,
    event_types: {
      ...DEFAULT_NOTIFICATION_EVENT_PREFERENCES,
      ...eventTypes
    },
    frequency_limits: {
      ...DEFAULT_NOTIFICATION_PREFERENCES.frequency_limits,
      ...frequencyLimits
    }
  };
}

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class NotificationService {
  private baseUrl = '/api/notifications';

  // Core notification management
  async getInbox(
    limit = 20, 
    offset = 0, 
    unreadOnly = false,
    eventType?: NotificationEventType
  ): Promise<NotificationInboxResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      unread_only: unreadOnly.toString(),
      ...(eventType && { event_type: eventType })
    });

    try {
      const response = await secureApi.get(
        `${this.baseUrl}/inbox?${params}`,
        true,
        { enableCache: true, cacheDuration: 30000 } // 30s cache for inbox
      );
      return response;
    } catch (error) {
      // Error:('Failed to fetch notification inbox:', error);
      throw error;
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      await secureApi.post(`${this.baseUrl}/${notificationId}/read`);
    } catch (error) {
      // Error:(`Failed to mark notification ${notificationId} as read:`, error);
      throw error;
    }
  }

  async markAsUnread(notificationId: string): Promise<void> {
    try {
      await secureApi.post(`${this.baseUrl}/${notificationId}/unread`);
    } catch (error) {
      // Error:(`Failed to mark notification ${notificationId} as unread:`, error);
      throw error;
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await secureApi.delete(`${this.baseUrl}/${notificationId}`);
    } catch (error) {
      // Error:(`Failed to delete notification ${notificationId}:`, error);
      throw error;
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      await secureApi.post(`${this.baseUrl}/mark-all-read`);
    } catch (error) {
      // Error:('Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  async getStats(): Promise<NotificationStats> {
    try {
      const response = await secureApi.get(
        `${this.baseUrl}/stats`,
        true,
        { enableCache: true, cacheDuration: 30000 } // 30s cache for stats
      );
      return response;
    } catch (error) {
      // Error:('Failed to fetch notification stats:', error);
      // Return fallback stats
      return {
        user_id: '',
        unread_notifications: 0,
        total_notifications: 0,
        notifications_by_type: {}
      };
    }
  }

  // User preferences
  async getPreferences(): Promise<UserNotificationPreferences> {
    try {
      const response = await secureApi.get(
        `${this.baseUrl}/preferences`,
        true,
        { enableCache: true, cacheDuration: 300000 } // 5min cache for preferences
      );
      return response;
    } catch (error) {
      // Error:('Failed to fetch notification preferences:', error);
      throw error;
    }
  }

  async updatePreferences(
    preferences: Partial<UserNotificationPreferences>
  ): Promise<UserNotificationPreferences> {
    try {
      const response = await secureApi.put(
        `${this.baseUrl}/preferences`,
        preferences,
        true
      );
      return response;
    } catch (error) {
      // Error:('Failed to update notification preferences:', error);
      throw error;
    }
  }

  // Push notifications
  async subscribeToPush(subscription: PushSubscriptionPayload): Promise<void> {
    try {
      await secureApi.post(`${this.baseUrl}/push/subscribe`, subscription);
    } catch (error) {
      // Error:('Failed to subscribe to push notifications:', error);
      throw error;
    }
  }

  async unsubscribeFromPush(): Promise<void> {
    try {
      await secureApi.delete(`${this.baseUrl}/push/unsubscribe`);
    } catch (error) {
      // Error:('Failed to unsubscribe from push notifications:', error);
      throw error;
    }
  }

  async getVAPIDKey(): Promise<{ vapid_public_key: string }> {
    try {
      const response = await secureApi.get(
        `${this.baseUrl}/push/vapid-key`,
        true,
        { enableCache: true, cacheDuration: 3600000 } // 1 hour cache for VAPID key
      );
      return response;
    } catch (error) {
      // Error:('Failed to fetch VAPID key:', error);
      throw error;
    }
  }

  // Batch operations (fallback to individual operations since backend doesn't support batch)
  async batchMarkAsRead(notificationIds: string[]): Promise<void> {
    try {
      // Since backend doesn't support batch operations, do them individually
      const promises = notificationIds.map(id => this.markAsRead(id));
      await Promise.all(promises);
    } catch (error) {
      // Error:('Failed to batch mark notifications as read:', error);
      throw error;
    }
  }

  async batchDelete(notificationIds: string[]): Promise<void> {
    try {
      // Since backend doesn't support batch operations, do them individually
      const promises = notificationIds.map(id => this.deleteNotification(id));
      await Promise.all(promises);
    } catch (error) {
      // Error:('Failed to batch delete notifications:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;
