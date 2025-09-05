"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, TrendingUp, Brain, Zap, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/theme-context";

export interface IntelligenceNotification {
  id: string;
  type: 'threat' | 'opportunity' | 'insight' | 'alert';
  severity: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  source: 'crown_vault' | 'opportunity_alignment' | 'peer_intelligence' | 'elite_pulse';
  timestamp: Date;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: {
    confidence?: number;
    exposure?: string;
    timeline?: string;
    rationale?: string;
  };
  autoHide?: boolean;
  hideAfter?: number; // milliseconds
}

interface IntelligenceNotificationProps {
  notification: IntelligenceNotification;
  onDismiss: (id: string) => void;
  onAction?: (notification: IntelligenceNotification) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  className?: string;
}

export function IntelligenceNotificationItem({
  notification,
  onDismiss,
  onAction,
  className = ""
}: Omit<IntelligenceNotificationProps, 'position'>) {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(true);

  // Auto-hide notification
  useEffect(() => {
    if (notification.autoHide && notification.hideAfter) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onDismiss(notification.id), 300);
      }, notification.hideAfter);

      return () => clearTimeout(timer);
    }
  }, [notification, onDismiss]);

  // Get styling based on type and severity
  const getNotificationStyle = () => {
    const baseClasses = "border transition-all duration-300";
    
    switch (notification.type) {
      case 'threat':
        return {
          className: `${baseClasses} bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/30`,
          iconColor: 'text-red-600 dark:text-red-400',
          Icon: AlertTriangle
        };
      case 'opportunity':
        return {
          className: `${baseClasses} bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/30`,
          iconColor: 'text-emerald-600 dark:text-emerald-400',
          Icon: TrendingUp
        };
      case 'insight':
        return {
          className: `${baseClasses} bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/30`,
          iconColor: 'text-blue-600 dark:text-blue-400',
          Icon: Brain
        };
      case 'alert':
      default:
        return {
          className: `${baseClasses} bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/30`,
          iconColor: 'text-amber-600 dark:text-amber-400',
          Icon: Bell
        };
    }
  };

  const getSeverityBadge = () => {
    switch (notification.severity) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">HIGH</Badge>;
      case 'medium':
        return <Badge variant="outline" className="text-xs border-amber-500 text-amber-600 dark:text-amber-400">MED</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-xs">LOW</Badge>;
      default:
        return null;
    }
  };

  const getSourceBadge = () => {
    const sourceLabels = {
      crown_vault: 'Crown Vault',
      opportunity_alignment: 'Opportunities',
      peer_intelligence: 'Peer Intel',
      elite_pulse: 'Elite Pulse'
    };
    
    return (
      <Badge variant="outline" className="text-xs">
        <Zap className="w-3 h-3 mr-1" />
        {sourceLabels[notification.source]}
      </Badge>
    );
  };

  const style = getNotificationStyle();
  const Icon = style.Icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={className}
        >
          <Card className={style.className}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 ${style.iconColor} mt-0.5 flex-shrink-0`} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-sm truncate">
                        {notification.title}
                      </h4>
                      {getSeverityBadge()}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDismiss(notification.id)}
                      className="h-6 w-6 p-0 hover:bg-background/80 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                    {notification.message}
                  </p>
                  
                  {/* Metadata */}
                  {notification.metadata && (
                    <div className="space-y-1 mb-3">
                      {notification.metadata.exposure && (
                        <div className="text-xs text-muted-foreground">
                          <strong>Exposure:</strong> {notification.metadata.exposure}
                        </div>
                      )}
                      {notification.metadata.timeline && (
                        <div className="text-xs text-muted-foreground">
                          <strong>Timeline:</strong> {notification.metadata.timeline}
                        </div>
                      )}
                      {notification.metadata.rationale && (
                        <div className="text-xs text-muted-foreground italic">
                          {notification.metadata.rationale}
                        </div>
                      )}
                      {notification.metadata.confidence && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Confidence:</span>
                          <div className="w-16 bg-muted rounded-full h-1">
                            <div 
                              className="h-1 rounded-full transition-all duration-300 bg-primary"
                              style={{ width: `${notification.metadata.confidence}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">{Math.round(notification.metadata.confidence)}%</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Actions and Source */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getSourceBadge()}
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    
                    {notification.actionLabel && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onAction?.(notification)}
                        className="text-xs h-6 px-2"
                      >
                        {notification.actionLabel}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface IntelligenceNotificationContainerProps {
  notifications: IntelligenceNotification[];
  onDismiss: (id: string) => void;
  onAction?: (notification: IntelligenceNotification) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxNotifications?: number;
  className?: string;
}

export function IntelligenceNotificationContainer({
  notifications,
  onDismiss,
  onAction,
  position = 'top-right',
  maxNotifications = 5,
  className = ""
}: IntelligenceNotificationContainerProps) {
  
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-right':
      default:
        return 'top-4 right-4';
    }
  };

  // Show only the most recent notifications
  const visibleNotifications = notifications
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, maxNotifications);

  return (
    <div 
      className={`fixed z-50 ${getPositionClasses()} w-96 max-w-[calc(100vw-2rem)] space-y-3 ${className}`}
    >
      <AnimatePresence mode="popLayout">
        {visibleNotifications.map((notification) => (
          <IntelligenceNotificationItem
            key={notification.id}
            notification={notification}
            onDismiss={onDismiss}
            onAction={onAction}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook for managing intelligence notifications
export function useIntelligenceNotifications() {
  const [notifications, setNotifications] = useState<IntelligenceNotification[]>([]);

  const addNotification = (notification: Omit<IntelligenceNotification, 'id' | 'timestamp'>) => {
    const newNotification: IntelligenceNotification = {
      ...notification,
      id: `intel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      autoHide: notification.autoHide ?? true,
      hideAfter: notification.hideAfter ?? 8000 // 8 seconds default
    };

    setNotifications(prev => [newNotification, ...prev]);
    return newNotification.id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const hasNotifications = notifications.length > 0;
  const urgentNotifications = notifications.filter(n => n.severity === 'high');

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    hasNotifications,
    urgentNotifications: urgentNotifications.length
  };
}