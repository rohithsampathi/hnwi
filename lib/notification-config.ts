export interface NotificationTypeConfig {
  icon: string;
  title: string;
  color: string;
  actionText: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export const NotificationTypeConfigs: Record<string, NotificationTypeConfig> = {
  elite_pulse_generated: {
    icon: '🏛️',
    title: 'Elite Pulse Intelligence',
    color: '#d4af37',
    actionText: 'View Analysis',
    priority: 'high'
  },
  opportunity_added: {
    icon: '💎',
    title: 'New Investment Opportunity',
    color: '#3b82f6',
    actionText: 'View Opportunity',
    priority: 'high'
  },
  crown_vault_update: {
    icon: '👑',
    title: 'Crown Vault Update',
    color: '#8b5cf6',
    actionText: 'View Vault',
    priority: 'medium'
  },
  social_event_added: {
    icon: '🎭',
    title: 'New Social Event',
    color: '#ec4899',
    actionText: 'View Event',
    priority: 'medium'
  },
  market_alert: {
    icon: '📈',
    title: 'Market Alert',
    color: '#ef4444',
    actionText: 'View Alert',
    priority: 'urgent'
  },
  regulatory_update: {
    icon: '📋',
    title: 'Regulatory Update',
    color: '#6b7280',
    actionText: 'View Update',
    priority: 'low'
  },
  system_notification: {
    icon: '🔔',
    title: 'System Notification',
    color: '#64748b',
    actionText: 'View Details',
    priority: 'low'
  }
};

export const EventTypeLabels: Record<string, string> = {
  elite_pulse: 'Elite Pulse Intelligence Reports',
  hnwi_world: 'Investment Opportunities',
  crown_vault: 'Crown Vault Updates',
  social_hub: 'Social Events & Gatherings',
  system_notification: 'System Notifications'
};

export const EventTypeDescriptions: Record<string, string> = {
  elite_pulse: 'Strategic market intelligence and analysis',
  hnwi_world: 'Exclusive investment and wealth opportunities',
  crown_vault: 'Updates to your assets and heirs',
  social_hub: 'High-society events and networking opportunities',
  system_notification: 'Important system updates and maintenance'
};

export function getNotificationContent(notification: any) {
  const config = NotificationTypeConfigs[notification.event_type];
  
  switch (notification.event_type) {
    case 'elite_pulse_generated':
      return {
        icon: config?.icon || '🏛️',
        primaryText: 'New Elite Pulse Analysis Available',
        secondaryText: notification.data?.analysis?.wealth_migration?.volume || 'Strategic intelligence update',
        actionUrl: `/elite-pulse/${notification.data?.analysis_id || ''}`,
        color: config?.color
      };
    
    case 'opportunity_added':
      return {
        icon: config?.icon || '💎',
        primaryText: notification.data?.opportunity_title || 'New Investment Opportunity',
        secondaryText: notification.data?.opportunity_summary || 'Exclusive opportunity available',
        actionUrl: `/opportunities/${notification.data?.opportunity_id || ''}`,
        color: config?.color
      };
    
    case 'crown_vault_update':
      return {
        icon: config?.icon || '👑',
        primaryText: notification.data?.update_type || 'Crown Vault Updated',
        secondaryText: notification.data?.summary || 'Your Crown Vault has been updated',
        actionUrl: '/crown-vault',
        color: config?.color
      };
    
    case 'social_event_added':
      return {
        icon: config?.icon || '🎭',
        primaryText: notification.data?.event_name || 'New Social Event',
        secondaryText: notification.data?.location && notification.data?.venue 
          ? `${notification.data.location} - ${notification.data.venue}`
          : 'New event available',
        actionUrl: `/events/${notification.data?.event_id || ''}`,
        color: config?.color
      };
    
    case 'market_alert':
      return {
        icon: config?.icon || '📈',
        primaryText: 'Market Alert',
        secondaryText: notification.data?.summary || 'Important market update',
        actionUrl: '/market-alerts',
        color: config?.color
      };
    
    case 'regulatory_update':
      return {
        icon: config?.icon || '📋',
        primaryText: 'Regulatory Update',
        secondaryText: notification.data?.summary || 'New regulatory information',
        actionUrl: '/regulatory-updates',
        color: config?.color
      };
    
    default:
      return {
        icon: '🔔',
        primaryText: notification.title || 'New Notification',
        secondaryText: notification.content || 'You have a new notification',
        actionUrl: '/',
        color: '#64748b'
      };
  }
}

export function handleCrownVaultNotification(notification: any): string {
  const { update_type, details } = notification.data || {};
  
  switch (update_type) {
    case 'Asset Added':
      return `New asset "${details?.asset_name || 'Unnamed Asset'}" added to your Crown Vault`;
    case 'Heir Added':
      return `${details?.heir_name || 'New heir'} (${details?.relationship || 'Heir'}) added as heir`;
    case 'Asset Updated':
      return `Asset "${details?.asset_name || 'Asset'}" has been updated`;
    case 'Heir Updated':
      return `Heir information for ${details?.heir_name || 'heir'} has been updated`;
    case 'Asset Removed':
      return `Asset "${details?.asset_name || 'Asset'}" has been removed`;
    case 'Heir Removed':
      return `${details?.heir_name || 'Heir'} has been removed as heir`;
    default:
      return 'Your Crown Vault has been updated';
  }
}