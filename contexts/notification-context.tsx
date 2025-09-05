"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useNotifications, UseNotificationsReturn } from "@/lib/hooks/useNotifications";
import { 
  NotificationRecord, 
  UserNotificationPreferences 
} from "@/lib/services/notification-service";

interface NotificationContextType extends UseNotificationsReturn {
  // UI state
  isDropdownOpen: boolean;
  isCenterOpen: boolean;
  selectedNotifications: Set<string>;
  filter: 'all' | 'unread' | 'read';
  
  // UI actions
  setDropdownOpen: (open: boolean) => void;
  setCenterOpen: (open: boolean) => void;
  toggleNotificationSelection: (id: string) => void;
  selectAllNotifications: () => void;
  clearSelection: () => void;
  setFilter: (filter: 'all' | 'unread' | 'read') => void;
  
  // Convenience methods
  getNotificationsByType: (eventType: string) => NotificationRecord[];
  getNotificationsByPriority: (priority: string) => NotificationRecord[];
  hasUnreadNotifications: boolean;
  hasUrgentNotifications: boolean;
  
  // Sound and visual feedback
  playNotificationSound: () => void;
  showBrowserNotification: (notification: NotificationRecord) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export interface NotificationProviderProps {
  children: React.ReactNode;
  enablePolling?: boolean;
  pollInterval?: number;
  enableSounds?: boolean;
  enableBrowserNotifications?: boolean;
}

export function NotificationProvider({ 
  children,
  enablePolling = true,
  pollInterval = 30000, // 30 seconds
  enableSounds = true,
  enableBrowserNotifications = true
}: NotificationProviderProps) {
  // Use the notifications hook
  const notificationHook = useNotifications({
    enablePolling,
    pollInterval,
    autoFetch: true
  });

  // UI state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCenterOpen, setIsCenterOpen] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  
  // Track previous unread count for sound/notification triggers
  const [prevUnreadCount, setPrevUnreadCount] = useState(0);

  // UI actions
  const setDropdownOpen = useCallback((open: boolean) => {
    setIsDropdownOpen(open);
    // Close center when dropdown opens
    if (open && isCenterOpen) {
      setIsCenterOpen(false);
    }
  }, [isCenterOpen]);

  const setCenterOpen = useCallback((open: boolean) => {
    console.log('setCenterOpen called with:', open);
    setIsCenterOpen(open);
    // Close dropdown when center opens
    if (open && isDropdownOpen) {
      setIsDropdownOpen(false);
    }
  }, [isDropdownOpen]);

  const toggleNotificationSelection = useCallback((id: string) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAllNotifications = useCallback(() => {
    const visibleIds = notificationHook.notifications.map(n => n.id);
    setSelectedNotifications(new Set(visibleIds));
  }, [notificationHook.notifications]);

  const clearSelection = useCallback(() => {
    setSelectedNotifications(new Set());
  }, []);

  // Convenience getters
  const getNotificationsByType = useCallback((eventType: string) => {
    return notificationHook.notifications.filter(n => n.event_type === eventType);
  }, [notificationHook.notifications]);

  const getNotificationsByPriority = useCallback((priority: string) => {
    return notificationHook.notifications.filter(n => n.priority === priority);
  }, [notificationHook.notifications]);

  const hasUnreadNotifications = notificationHook.unreadCount > 0;
  const hasUrgentNotifications = notificationHook.urgentCount > 0;

  // Sound and notification functions
  const playNotificationSound = useCallback(() => {
    if (!enableSounds) return;
    
    try {
      // Create audio context for notification sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }, [enableSounds]);

  const showBrowserNotification = useCallback((notification: NotificationRecord) => {
    if (!enableBrowserNotifications) return;
    
    // Check if browser notifications are supported and granted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const browserNotification = new Notification(notification.title, {
          body: notification.content,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          tag: notification.id,
          timestamp: Date.now(),
          requireInteraction: notification.priority === 'urgent',
          data: {
            notificationId: notification.id,
            eventType: notification.event_type,
            priority: notification.priority
          }
        });

        // Auto close after 8 seconds for non-urgent notifications
        if (notification.priority !== 'urgent') {
          setTimeout(() => {
            browserNotification.close();
          }, 8000);
        }

        // Handle click
        browserNotification.onclick = () => {
          window.focus();
          notificationHook.markAsRead(notification.id);
          browserNotification.close();
          
          // Open notification center or specific page based on notification type
          setCenterOpen(true);
        };
      } catch (error) {
        console.warn('Failed to show browser notification:', error);
      }
    }
  }, [enableBrowserNotifications, notificationHook.markAsRead, setCenterOpen]);

  // Request notification permission on mount
  useEffect(() => {
    if (enableBrowserNotifications && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            console.log('Browser notification permission granted');
          }
        });
      }
    }
  }, [enableBrowserNotifications]);

  // Trigger sound and browser notification for new unread notifications
  useEffect(() => {
    const currentUnreadCount = notificationHook.unreadCount;
    
    // Only trigger if unread count increased (new notifications)
    if (currentUnreadCount > prevUnreadCount && prevUnreadCount > 0) {
      const newNotificationCount = currentUnreadCount - prevUnreadCount;
      
      // Play sound for new notifications
      if (newNotificationCount > 0) {
        playNotificationSound();
        
        // Show browser notification for urgent notifications
        const urgentNotifications = notificationHook.notifications
          .filter(n => n.priority === 'urgent' && n.status !== 'read')
          .slice(0, 3); // Show max 3 urgent notifications
          
        urgentNotifications.forEach(notification => {
          showBrowserNotification(notification);
        });
      }
    }
    
    setPrevUnreadCount(currentUnreadCount);
  }, [
    notificationHook.unreadCount, 
    notificationHook.notifications, 
    prevUnreadCount, 
    playNotificationSound, 
    showBrowserNotification
  ]);

  // Auto-fetch notifications based on filter
  useEffect(() => {
    const filterParam = filter === 'all' ? undefined : filter;
    notificationHook.fetchNotifications(1, filterParam);
  }, [filter, notificationHook.fetchNotifications]); // Include fetchNotifications in dependencies

  // Close dropdown/center when clicking outside (handled by components)
  const closeAll = useCallback(() => {
    setIsDropdownOpen(false);
    setIsCenterOpen(false);
    clearSelection();
  }, [clearSelection]);

  // Enhanced mark as read that clears selection if notification was selected
  const enhancedMarkAsRead = useCallback(async (id: string) => {
    await notificationHook.markAsRead(id);
    // Remove from selection if selected
    setSelectedNotifications(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, [notificationHook.markAsRead]);

  // Enhanced delete that clears selection if notification was selected
  const enhancedDeleteNotification = useCallback(async (id: string) => {
    await notificationHook.deleteNotification(id);
    // Remove from selection if selected
    setSelectedNotifications(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, [notificationHook.deleteNotification]);

  const value: NotificationContextType = {
    // Hook values
    ...notificationHook,
    
    // Override with enhanced versions
    markAsRead: enhancedMarkAsRead,
    deleteNotification: enhancedDeleteNotification,
    
    // UI state
    isDropdownOpen,
    isCenterOpen,
    selectedNotifications,
    filter,
    
    // UI actions
    setDropdownOpen,
    setCenterOpen,
    toggleNotificationSelection,
    selectAllNotifications,
    clearSelection,
    setFilter,
    
    // Convenience methods
    getNotificationsByType,
    getNotificationsByPriority,
    hasUnreadNotifications,
    hasUrgentNotifications,
    
    // Sound and visual feedback
    playNotificationSound,
    showBrowserNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}

// Optional hook that returns null if not in provider (for optional usage)
export function useNotificationContextOptional(): NotificationContextType | null {
  const context = useContext(NotificationContext);
  return context || null;
}