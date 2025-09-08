"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  IntelligenceNotificationContainer, 
  useIntelligenceNotifications,
  type IntelligenceNotification 
} from "@/components/ui/intelligence-notification";
import { useElitePulse } from "@/contexts/elite-pulse-context";
import { canAccessFeaturesWithFallback } from "@/lib/auth-utils";

interface IntelligenceNotificationContextType {
  addNotification: (notification: Omit<IntelligenceNotification, 'id' | 'timestamp'>) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  hasNotifications: boolean;
  urgentNotifications: number;
  notifications: IntelligenceNotification[];
  
  // Convenience methods for different notification types
  notifyThreat: (title: string, message: string, metadata?: IntelligenceNotification['metadata']) => string;
  notifyOpportunity: (title: string, message: string, metadata?: IntelligenceNotification['metadata']) => string;
  notifyInsight: (title: string, message: string, metadata?: IntelligenceNotification['metadata']) => string;
  notifyAlert: (title: string, message: string, metadata?: IntelligenceNotification['metadata']) => string;
}

const IntelligenceNotificationContext = createContext<IntelligenceNotificationContextType | undefined>(undefined);

export interface IntelligenceNotificationProviderProps {
  children: React.ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxNotifications?: number;
  enableAutoNotifications?: boolean; // Auto-create notifications from Elite Pulse updates
}

export function IntelligenceNotificationProvider({ 
  children, 
  position = 'top-right',
  maxNotifications = 5,
  enableAutoNotifications = true
}: IntelligenceNotificationProviderProps) {
  const router = useRouter();
  const {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    hasNotifications,
    urgentNotifications
  } = useIntelligenceNotifications();

  // Check authentication first
  const isAuthenticated = canAccessFeaturesWithFallback();
  
  // Always call useElitePulse (React hook rules), but guard the usage
  const { state, hasIntelligence } = useElitePulse();
  const [lastUpdateTime, setLastUpdateTime] = useState<number | null>(null);

  // Auto-generate notifications from Elite Pulse intelligence updates
  useEffect(() => {
    if (!enableAutoNotifications || !hasIntelligence || !isAuthenticated) return;

    const currentUpdateTime = state.intelligence.lastUpdate?.getTime();
    if (!currentUpdateTime || currentUpdateTime === lastUpdateTime) return;

    setLastUpdateTime(currentUpdateTime);

    // Skip first load
    if (lastUpdateTime === null) return;

    // Create notification for new intelligence update
    addNotification({
      type: 'insight',
      severity: 'medium',
      title: 'Elite Pulse Intelligence Updated',
      message: 'New market intelligence is available across Crown Vault, Opportunities, and Peer Analysis.',
      source: 'elite_pulse',
      actionLabel: 'View Dashboard',
      actionUrl: '/dashboard',
      autoHide: true,
      hideAfter: 10000
    });
  }, [state.intelligence.lastUpdate, hasIntelligence, enableAutoNotifications, lastUpdateTime, addNotification, isAuthenticated]);

  // Handle notification actions (navigation, etc.)
  const handleNotificationAction = useCallback((notification: IntelligenceNotification) => {
    if (!isAuthenticated) return;
    
    if (notification.actionUrl) {
      // Navigate to the specified URL
      router.push(notification.actionUrl);
      
      // Dismiss the notification after navigation
      removeNotification(notification.id);
    }
    
    // Track the action
    if (state.intelligence.subscriptions.has('user_interactions')) {
      // Track notification action
      
    }
  }, [router, removeNotification, state.intelligence.subscriptions, isAuthenticated]);

  // Convenience methods for creating different types of notifications
  const notifyThreat = useCallback((title: string, message: string, metadata?: IntelligenceNotification['metadata']) => {
    return addNotification({
      type: 'threat',
      severity: 'high',
      title,
      message,
      source: 'crown_vault',
      metadata,
      actionLabel: 'Review Alert',
      autoHide: false // Threats should be manually dismissed
    });
  }, [addNotification]);

  const notifyOpportunity = useCallback((title: string, message: string, metadata?: IntelligenceNotification['metadata']) => {
    return addNotification({
      type: 'opportunity',
      severity: 'medium',
      title,
      message,
      source: 'opportunity_alignment',
      metadata,
      actionLabel: 'View Details',
      autoHide: true,
      hideAfter: 12000
    });
  }, [addNotification]);

  const notifyInsight = useCallback((title: string, message: string, metadata?: IntelligenceNotification['metadata']) => {
    return addNotification({
      type: 'insight',
      severity: 'low',
      title,
      message,
      source: 'elite_pulse',
      metadata,
      actionLabel: 'Learn More',
      autoHide: true,
      hideAfter: 8000
    });
  }, [addNotification]);

  const notifyAlert = useCallback((title: string, message: string, metadata?: IntelligenceNotification['metadata']) => {
    return addNotification({
      type: 'alert',
      severity: 'medium',
      title,
      message,
      source: 'elite_pulse',
      metadata,
      actionLabel: 'View Alert',
      autoHide: true,
      hideAfter: 10000
    });
  }, [addNotification]);

  const value: IntelligenceNotificationContextType = {
    addNotification,
    removeNotification,
    clearAllNotifications,
    hasNotifications,
    urgentNotifications,
    notifications,
    notifyThreat,
    notifyOpportunity,
    notifyInsight,
    notifyAlert
  };

  return (
    <IntelligenceNotificationContext.Provider value={value}>
      {children}
      <IntelligenceNotificationContainer
        notifications={notifications}
        onDismiss={removeNotification}
        onAction={handleNotificationAction}
        position={position}
        maxNotifications={maxNotifications}
      />
    </IntelligenceNotificationContext.Provider>
  );
}

export function useIntelligenceNotificationContext(): IntelligenceNotificationContextType {
  const context = useContext(IntelligenceNotificationContext);
  if (context === undefined) {
    throw new Error('useIntelligenceNotificationContext must be used within an IntelligenceNotificationProvider');
  }
  return context;
}

// Convenience hook that provides a safe way to access notifications (returns null if not in provider)
export function useIntelligenceNotificationsOptional(): IntelligenceNotificationContextType | null {
  const context = useContext(IntelligenceNotificationContext);
  return context || null;
}