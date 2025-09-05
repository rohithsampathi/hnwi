"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCheck, 
  Settings, 
  Eye,
  Loader2,
  AlertCircle,
  Inbox
} from "lucide-react";
import { useNotificationContext } from "@/contexts/notification-context";
import { useTheme } from "@/contexts/theme-context";
import { NotificationItem } from "./notification-item";

interface NotificationDropdownProps {
  onClose: () => void;
  className?: string;
}

export function NotificationDropdown({ 
  onClose, 
  className = "" 
}: NotificationDropdownProps) {
  const { theme } = useTheme();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAllAsRead,
    fetchNotifications,
    hasMore,
    setCenterOpen
  } = useNotificationContext();

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleViewAll = () => {
    onClose();
    setCenterOpen(true);
  };

  const recentNotifications = notifications.slice(0, 8); // Show max 8 in dropdown

  return (
    <motion.div
      ref={dropdownRef}
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={`
        absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)]
        bg-background border border-border
        rounded-lg shadow-xl backdrop-blur-sm
        z-50 overflow-hidden
        ${className}
      `}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-foreground">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={loading}
                className="text-xs h-7 px-2"
                title="Mark all as read"
              >
                <CheckCheck className="w-3 h-3 mr-1" />
                Mark all
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewAll}
              className="text-xs h-7 px-2"
              title="View all notifications"
            >
              <Eye className="w-3 h-3 mr-1" />
              View all
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-hidden">
        {loading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading notifications...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8 px-4">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                Failed to load notifications
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchNotifications(1)}
                className="text-xs"
              >
                Try again
              </Button>
            </div>
          </div>
        ) : recentNotifications.length === 0 ? (
          <div className="flex items-center justify-center py-8 px-4">
            <div className="text-center">
              <Inbox className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No notifications yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                You're all caught up!
              </p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="p-2">
              <AnimatePresence mode="popLayout">
                {recentNotifications.map((notification, index) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    compact={true}
                    showActions={true}
                    className="mb-1 last:mb-0"
                  />
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Footer */}
      {recentNotifications.length > 0 && (
        <>
          <Separator />
          <div className="p-3 bg-muted/50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Showing {recentNotifications.length} of {notifications.length}
                {hasMore && ' (more available)'}
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewAll}
                className="text-xs h-6 px-2 text-primary hover:text-primary/80 hover:bg-primary/10"
              >
                View all notifications →
              </Button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}