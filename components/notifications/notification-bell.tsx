"use client";

import { useState, useEffect } from "react";
import { Bell, BellRing } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotificationContext } from "@/contexts/notification-context";
import { useTheme } from "@/contexts/theme-context";
import { NotificationDropdown } from "./notification-dropdown";

interface NotificationBellProps {
  className?: string;
  size?: number;
  showDropdown?: boolean;
}

export function NotificationBell({ 
  className = "", 
  size = 20,
  showDropdown = true 
}: NotificationBellProps) {
  const { theme } = useTheme();
  const {
    unreadCount,
    hasUrgentNotifications,
    isDropdownOpen,
    setDropdownOpen,
    setCenterOpen,
    loading,
    error
  } = useNotificationContext();

  const [isAnimating, setIsAnimating] = useState(false);

  // Animate bell when new urgent notifications arrive
  useEffect(() => {
    if (hasUrgentNotifications && !isDropdownOpen) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasUrgentNotifications, isDropdownOpen]);

  // Format unread count display
  const displayCount = unreadCount > 99 ? '99+' : unreadCount.toString();

  const handleClick = () => {
    if (!showDropdown) return;
    
    console.log('Bell clicked, unreadCount:', unreadCount, 'loading:', loading);
    
    try {
      // If there are no notifications or we're in an error state, go directly to notification center
      if (unreadCount === 0 || error) {
        console.log('Opening notification center');
        setCenterOpen(true);
      } else {
        // Otherwise show dropdown as normal
        console.log('Opening dropdown');
        setDropdownOpen(!isDropdownOpen);
      }
    } catch (error) {
      console.error('Error in handleClick:', error);
      // Fallback: always try to open notification center
      setCenterOpen(true);
    }
  };

  // Different bell icon based on state
  const BellIcon = hasUrgentNotifications ? BellRing : Bell;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        disabled={false}
        className={`
          relative p-2 rounded-full transition-all duration-200 cursor-pointer
          ${theme === 'dark' 
            ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
            : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
          }
          ${hasUrgentNotifications 
            ? theme === 'dark' ? 'text-red-400' : 'text-red-600'
            : ''
          }
          ${error 
            ? theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
            : ''
          }
          ${className}
        `}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <motion.div
          animate={isAnimating ? {
            rotate: [0, -10, 10, -10, 10, 0],
            scale: [1, 1.1, 1, 1.1, 1]
          } : {}}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <BellIcon size={size} />
        </motion.div>

        {/* Unread count badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute -top-1 -right-1"
            >
              <Badge 
                variant={hasUrgentNotifications ? "destructive" : "default"}
                className={`
                  h-5 min-w-[20px] flex items-center justify-center text-xs font-medium
                  ${hasUrgentNotifications 
                    ? 'bg-red-500 text-white animate-pulse border-0' 
                    : theme === 'dark'
                      ? 'bg-primary text-white border-0'
                      : 'bg-primary text-white border-0'
                  }
                `}
              >
                {displayCount}
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Urgent notification indicator */}
        <AnimatePresence>
          {hasUrgentNotifications && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-0.5 -right-0.5"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-3 h-3 bg-red-500 rounded-full"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading indicator */}
        {loading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-2 border-transparent border-t-gray-400 rounded-full"
          />
        )}
      </Button>

      {/* Dropdown */}
      {showDropdown && (
        <AnimatePresence>
          {isDropdownOpen && (
            <NotificationDropdown onClose={() => setDropdownOpen(false)} />
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

// Simplified version without dropdown for use in mobile/compact layouts
export function NotificationBellCompact({ 
  className = "",
  size = 16,
  onClick 
}: {
  className?: string;
  size?: number;
  onClick?: () => void;
}) {
  const { unreadCount, hasUrgentNotifications } = useNotificationContext();
  
  const displayCount = unreadCount > 99 ? '99+' : unreadCount.toString();
  const BellIcon = hasUrgentNotifications ? BellRing : Bell;

  return (
    <button
      onClick={onClick}
      className={`
        relative p-1 transition-colors duration-200
        ${hasUrgentNotifications ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-300'}
        hover:text-gray-900 dark:hover:text-gray-100
        ${className}
      `}
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
    >
      <BellIcon size={size} />
      
      {unreadCount > 0 && (
        <span className={`
          absolute -top-1 -right-1 h-4 min-w-[16px] flex items-center justify-center
          text-xs font-medium rounded-full
          ${hasUrgentNotifications 
            ? 'bg-red-500 text-white' 
            : 'bg-blue-500 text-white'
          }
        `}>
          {displayCount}
        </span>
      )}
    </button>
  );
}