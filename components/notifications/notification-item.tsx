"use client";

import { useState } from "react";
import { 
  Bell, 
  TrendingUp, 
  Shield, 
  Calendar, 
  AlertTriangle, 
  FileText,
  Settings,
  X,
  Eye,
  EyeOff,
  Trash2,
  Clock,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { NotificationRecord } from "@/lib/services/notification-service";
import { useNotificationContext } from "@/contexts/notification-context";
import { formatDistanceToNow } from "date-fns";
import { getNotificationContent, handleCrownVaultNotification, NotificationTypeConfigs } from "@/lib/notification-config";
import { useRouter } from "next/navigation";

interface NotificationItemProps {
  notification: NotificationRecord;
  className?: string;
  showActions?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  compact?: boolean;
}

export function NotificationItem({
  notification,
  className = "",
  showActions = true,
  isSelected = false,
  onSelect,
  compact = false
}: NotificationItemProps) {
  const {
    markAsRead,
    markAsUnread,
    deleteNotification,
    loading
  } = useNotificationContext();
  const router = useRouter();

  const [isActionsVisible, setIsActionsVisible] = useState(false);

  // Get notification content from config
  const content = getNotificationContent(notification);
  const config = NotificationTypeConfigs[notification.event_type];

  // Get icon and styling based on event type (enhanced with new config)
  const getNotificationDetails = () => {
    const baseClasses = "border transition-all duration-300";
    
    // Use config colors if available
    const color = config?.color || '#64748b';
    
    switch (notification.event_type) {
      case 'elite_pulse_generated':
        return {
          icon: Zap,
          className: `${baseClasses} bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-300 dark:border-yellow-800/30`,
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          typeLabel: config?.title || 'Elite Pulse'
        };
      case 'opportunity_added':
        return {
          icon: TrendingUp,
          className: `${baseClasses} bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/20 dark:to-sky-950/20 border-blue-300 dark:border-blue-800/30`,
          iconColor: 'text-blue-600 dark:text-blue-400',
          typeLabel: config?.title || 'Opportunity'
        };
      case 'crown_vault_update':
        return {
          icon: Shield,
          className: `${baseClasses} bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-300 dark:border-purple-800/30`,
          iconColor: 'text-purple-600 dark:text-purple-400',
          typeLabel: config?.title || 'Crown Vault'
        };
      case 'social_event_added':
        return {
          icon: Calendar,
          className: `${baseClasses} bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 border-pink-300 dark:border-pink-800/30`,
          iconColor: 'text-pink-600 dark:text-pink-400',
          typeLabel: config?.title || 'Social Event'
        };
      case 'market_alert':
        return {
          icon: AlertTriangle,
          className: `${baseClasses} bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-300 dark:border-red-800/30`,
          iconColor: 'text-red-600 dark:text-red-400',
          typeLabel: config?.title || 'Market Alert'
        };
      case 'regulatory_update':
        return {
          icon: FileText,
          className: `${baseClasses} bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20 border-gray-300 dark:border-gray-800/30`,
          iconColor: 'text-gray-600 dark:text-gray-400',
          typeLabel: config?.title || 'Regulatory'
        };
      case 'system_notification':
        return {
          icon: Settings,
          className: `${baseClasses} bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800/30`,
          iconColor: 'text-gray-600 dark:text-gray-400',
          typeLabel: config?.title || 'System'
        };
      default:
        return {
          icon: Bell,
          className: `${baseClasses} bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800/30`,
          iconColor: 'text-gray-600 dark:text-gray-400',
          typeLabel: config?.title || 'Notification'
        };
    }
  };

  const getPriorityBadge = () => {
    switch (notification.priority) {
      case 'urgent':
        return (
          <Badge variant="destructive" className="text-xs animate-pulse">
            URGENT
          </Badge>
        );
      case 'high':
        return (
          <Badge variant="destructive" className="text-xs">
            HIGH
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="outline" className="text-xs border-amber-500 text-amber-600 dark:text-amber-400">
            MED
          </Badge>
        );
      case 'low':
        return (
          <Badge variant="outline" className="text-xs">
            LOW
          </Badge>
        );
      default:
        return null;
    }
  };

  const details = getNotificationDetails();
  const Icon = details.icon;
  const isUnread = notification.status !== 'read';
  const createdAt = new Date(notification.created_at);
  const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true });

  const handleMarkAsRead = async () => {
    try {
      if (isUnread) {
        await markAsRead(notification.id);
      } else {
        await markAsUnread(notification.id);
      }
    } catch (error) {
      // Failed to toggle read status
    }
  };

  const handleDelete = async () => {
    try {
      await deleteNotification(notification.id);
    } catch (error) {
      // Failed to delete notification
    }
  };

  const handleClick = () => {
    if (onSelect) {
      onSelect(notification.id);
    }
    
    // Auto-mark as read when clicked (if unread)
    if (isUnread) {
      markAsRead(notification.id);
    }

    // Handle notification navigation using the config-based actionUrl
    if (content.actionUrl && content.actionUrl !== '/') {
      router.push(content.actionUrl);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.2 }}
      className={`
        ${className}
        ${isSelected ? 'ring-2 ring-blue-500' : ''}
        ${compact ? 'mb-1' : 'mb-3'}
      `}
      onMouseEnter={() => setIsActionsVisible(true)}
      onMouseLeave={() => setIsActionsVisible(false)}
    >
      <Card 
        className={`
          ${details.className}
          ${isUnread ? 'shadow-md' : 'shadow-sm opacity-90'}
          hover:shadow-lg transition-all duration-200 cursor-pointer
          ${compact ? 'min-h-0' : ''}
        `}
        onClick={handleClick}
      >
        <CardContent className={compact ? "p-3" : "p-4"}>
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              <Icon className={`w-5 h-5 ${details.iconColor}`} />
              {isUnread && (
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 mx-auto" />
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className={`
                    font-semibold truncate
                    ${compact ? 'text-sm' : 'text-sm'}
                    ${isUnread ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}
                  `}>
                    {content.primaryText || notification.title}
                  </h4>
                  {getPriorityBadge()}
                </div>
                
                {/* Actions */}
                {showActions && (
                  <div className={`
                    flex items-center gap-1 transition-opacity duration-200
                    ${isActionsVisible || compact ? 'opacity-100' : 'opacity-0'}
                  `}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead();
                      }}
                      disabled={loading}
                      className="h-6 w-6 p-0 hover:bg-background/80"
                      title={isUnread ? "Mark as read" : "Mark as unread"}
                    >
                      {isUnread ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                      }}
                      disabled={loading}
                      className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600"
                      title="Delete notification"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Message */}
              <p className={`
                text-muted-foreground mb-2 leading-relaxed
                ${compact ? 'text-xs' : 'text-sm'}
                ${compact ? 'line-clamp-2' : 'line-clamp-3'}
              `}>
                {notification.event_type === 'crown_vault_update' 
                  ? handleCrownVaultNotification(notification)
                  : content.secondaryText || notification.content}
              </p>
              
              {/* Metadata */}
              {notification.data && Object.keys(notification.data).length > 0 && !compact && (
                <div className="space-y-1 mb-2">
                  {notification.data.exposure && (
                    <div className="text-xs text-muted-foreground">
                      <strong>Exposure:</strong> {notification.data.exposure}
                    </div>
                  )}
                  {notification.data.timeline && (
                    <div className="text-xs text-muted-foreground">
                      <strong>Timeline:</strong> {notification.data.timeline}
                    </div>
                  )}
                  {notification.data.confidence && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Confidence:</span>
                      <div className="w-16 bg-muted rounded-full h-1">
                        <div 
                          className="h-1 rounded-full transition-all duration-300 bg-primary"
                          style={{ width: `${notification.data.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">{notification.data.confidence}%</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {details.typeLabel}
                  </Badge>
                  <span className={`
                    flex items-center gap-1 text-muted-foreground
                    ${compact ? 'text-xs' : 'text-xs'}
                  `}>
                    <Clock className="w-3 h-3" />
                    {timeAgo}
                  </span>
                </div>
                
                {config?.actionText && content.actionUrl && content.actionUrl !== '/' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClick();
                    }}
                    className={`text-xs h-6 px-2 ${compact ? 'hidden' : ''}`}
                  >
                    {config.actionText}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}