"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X,
  Filter,
  CheckCheck,
  Trash2,
  Search,
  RefreshCw,
  Settings,
  Inbox,
  AlertCircle,
  Loader2,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useNotificationContext } from "@/contexts/notification-context";
import { NotificationItem } from "./notification-item";

interface NotificationCenterProps {
  onClose: () => void;
  className?: string;
}

export function NotificationCenter({ 
  onClose, 
  className = "" 
}: NotificationCenterProps) {
  const {
    notifications,
    stats,
    loading,
    error,
    hasMore,
    unreadCount,
    selectedNotifications,
    filter,
    setFilter,
    toggleNotificationSelection,
    selectAllNotifications,
    clearSelection,
    fetchNotifications,
    markAllAsRead,
    batchMarkAsRead,
    batchDelete,
    refresh
  } = useNotificationContext();

  const [searchQuery, setSearchQuery] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState<string | undefined>(undefined);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Filter notifications based on search and type filter
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = searchQuery === "" || 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = eventTypeFilter === undefined || notification.event_type === eventTypeFilter;
    
    return matchesSearch && matchesType;
  });

  // Get unique event types for filter dropdown
  const eventTypes = Array.from(new Set(notifications.map(n => n.event_type)));

  const hasSelectedNotifications = selectedNotifications.size > 0;

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore || loading) return;
    
    setIsLoadingMore(true);
    try {
      const offset = notifications.length;
      const unreadOnly = filter === 'unread';
      await fetchNotifications(20, offset, unreadOnly);
    } catch (error) {
      // Failed to load more
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleBatchMarkAsRead = async () => {
    if (selectedNotifications.size === 0) return;
    
    try {
      await batchMarkAsRead(Array.from(selectedNotifications));
      clearSelection();
    } catch (error) {
      // Failed to batch mark as read
    }
  };

  const handleBatchDelete = async () => {
    if (selectedNotifications.size === 0) return;
    
    try {
      await batchDelete(Array.from(selectedNotifications));
      clearSelection();
    } catch (error) {
      // Failed to batch delete
    }
  };

  const handleRefresh = async () => {
    setSearchQuery("");
    setEventTypeFilter(undefined);
    clearSelection();
    await refresh();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4
        bg-black/50 backdrop-blur-sm
        ${className}
      `}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-4xl max-h-[90vh] bg-background border border-border rounded-lg shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Inbox className="w-6 h-6 text-primary" />
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Notification Center
                </h2>
                <p className="text-sm text-muted-foreground">
                  {stats && (
                    <>
                      {stats.total_count} total, {unreadCount} unread
                    </>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                className="hover:bg-muted/50"
                title="Refresh notifications"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="hover:bg-muted/50"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-2 pt-3">
            <div className="flex-1">
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            
            {/* Filter dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="group flex items-center gap-2 hover:text-white">
                  <Filter className="w-4 h-4 text-primary group-hover:text-white" />
                  {filter === 'all' ? 'All' : filter === 'unread' ? 'Unread' : 'Read'}
                  <ChevronDown className="w-4 h-4 text-primary group-hover:text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilter('all')}>
                  All notifications
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('unread')}>
                  Unread only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('read')}>
                  Read only
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setEventTypeFilter(undefined)}>
                  All types
                </DropdownMenuItem>
                {eventTypes.map(type => (
                  <DropdownMenuItem 
                    key={type}
                    onClick={() => setEventTypeFilter(type)}
                  >
                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Batch actions */}
          <AnimatePresence>
            {hasSelectedNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 pt-3"
              >
                <Badge variant="secondary">
                  {selectedNotifications.size} selected
                </Badge>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBatchMarkAsRead}
                  disabled={loading}
                  className="text-xs"
                >
                  <CheckCheck className="w-3 h-3 mr-1" />
                  Mark as read
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBatchDelete}
                  disabled={loading}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                  className="text-xs"
                >
                  Clear selection
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Quick actions */}
          {!hasSelectedNotifications && (
            <div className="flex items-center gap-2 pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllNotifications}
                disabled={loading || filteredNotifications.length === 0}
                className="text-xs"
              >
                Select all
              </Button>
              
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={loading}
                  className="text-xs"
                >
                  <CheckCheck className="w-3 h-3 mr-1" />
                  Mark all as read
                </Button>
              )}
            </div>
          )}
        </CardHeader>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading notifications...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">
                  Failed to load notifications
                </h3>
                <p className="text-muted-foreground mb-4">
                  {error}
                </p>
                <Button onClick={handleRefresh} variant="outline">
                  Try again
                </Button>
              </div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Inbox className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {searchQuery || eventTypeFilter ? 'No matching notifications' : 'No notifications'}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery || eventTypeFilter 
                    ? 'Try adjusting your filters to see more results.'
                    : 'You\'re all caught up! New notifications will appear here.'
                  }
                </p>
                {(searchQuery || eventTypeFilter) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setEventTypeFilter(undefined);
                    }}
                    className="mt-4"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <ScrollArea className="h-[60vh]">
              <div className="p-4">
                <AnimatePresence mode="popLayout">
                  {filteredNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      showActions={true}
                      isSelected={selectedNotifications.has(notification.id)}
                      onSelect={toggleNotificationSelection}
                      className="mb-2"
                    />
                  ))}
                </AnimatePresence>
                
                {/* Load more button */}
                {hasMore && !loading && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="flex items-center gap-2"
                    >
                      {isLoadingMore ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : null}
                      Load more notifications
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}