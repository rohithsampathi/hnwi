import { secureApi } from "@/lib/secure-api";

export interface NotificationRecord {
  id: string;
  user_id: string;
  event_type: 'elite_pulse_generated' | 'opportunity_added' | 'crown_vault_update' | 
    'social_event_added' | 'market_alert' | 'regulatory_update' | 'system_notification';
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
  page: number;
  limit: number;
}

export interface NotificationStats {
  total_count: number;
  unread_count: number;
  urgent_count: number;
  counts_by_type: Record<string, number>;
  counts_by_priority: Record<string, number>;
}

export interface UserNotificationPreferences {
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  sms_enabled: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  event_types: {
    elite_pulse_generated: boolean;
    opportunity_added: boolean;
    crown_vault_update: boolean;
    social_event_added: boolean;
    market_alert: boolean;
    regulatory_update: boolean;
    system_notification: boolean;
  };
  frequency_limits: {
    max_per_hour: number;
    max_per_day: number;
  };
}

export interface PushSubscription {
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  user_agent: string;
}

class NotificationService {
  private baseUrl = '/api/notifications';

  // Core notification management
  async getInbox(
    page = 1, 
    limit = 20, 
    filter?: 'unread' | 'read' | 'all',
    eventType?: string
  ): Promise<NotificationInboxResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filter && { filter }),
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
      console.error('Failed to fetch notification inbox:', error);
      throw error;
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      await secureApi.post(`${this.baseUrl}/${notificationId}/read`);
    } catch (error) {
      console.error(`Failed to mark notification ${notificationId} as read:`, error);
      throw error;
    }
  }

  async markAsUnread(notificationId: string): Promise<void> {
    try {
      await secureApi.post(`${this.baseUrl}/${notificationId}/unread`);
    } catch (error) {
      console.error(`Failed to mark notification ${notificationId} as unread:`, error);
      throw error;
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await secureApi.delete(`${this.baseUrl}/${notificationId}`);
    } catch (error) {
      console.error(`Failed to delete notification ${notificationId}:`, error);
      throw error;
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      await secureApi.post(`${this.baseUrl}/mark-all-read`);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
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
      console.error('Failed to fetch notification stats:', error);
      // Return fallback stats
      return {
        total_count: 0,
        unread_count: 0,
        urgent_count: 0,
        counts_by_type: {},
        counts_by_priority: {}
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
      console.error('Failed to fetch notification preferences:', error);
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
      console.error('Failed to update notification preferences:', error);
      throw error;
    }
  }

  // Push notifications
  async subscribeToPush(subscription: PushSubscription): Promise<void> {
    try {
      await secureApi.post(`${this.baseUrl}/push/subscribe`, subscription);
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  }

  async unsubscribeFromPush(): Promise<void> {
    try {
      await secureApi.delete(`${this.baseUrl}/push/unsubscribe`);
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      throw error;
    }
  }

  async getVAPIDKey(): Promise<{ public_key: string }> {
    try {
      const response = await secureApi.get(
        `${this.baseUrl}/push/vapid-key`,
        true,
        { enableCache: true, cacheDuration: 3600000 } // 1 hour cache for VAPID key
      );
      return response;
    } catch (error) {
      console.error('Failed to fetch VAPID key:', error);
      throw error;
    }
  }

  // Batch operations
  async batchMarkAsRead(notificationIds: string[]): Promise<void> {
    try {
      await secureApi.post(`${this.baseUrl}/batch/mark-read`, {
        notification_ids: notificationIds
      });
    } catch (error) {
      console.error('Failed to batch mark notifications as read:', error);
      throw error;
    }
  }

  async batchDelete(notificationIds: string[]): Promise<void> {
    try {
      await secureApi.post(`${this.baseUrl}/batch/delete`, {
        notification_ids: notificationIds
      });
    } catch (error) {
      console.error('Failed to batch delete notifications:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;