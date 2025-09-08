import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PremiumBadge } from "@/components/ui/premium-badge";
import { Activity, Clock, TrendingUp, Shield, FileText, Users, DollarSign, Building } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/theme-context";
import { getMetallicCardStyle } from "@/lib/colors";
import type { CrownVaultStats } from "@/lib/api";

interface ActivitySectionProps {
  stats: CrownVaultStats | null;
}

export function ActivitySection({ stats }: ActivitySectionProps) {
  const { theme } = useTheme();
  
  const getActivityIcon = (details: string) => {
    const lowerDetails = details.toLowerCase();
    if (lowerDetails.includes('asset')) return Building;
    if (lowerDetails.includes('heir')) return Users;
    if (lowerDetails.includes('value') || lowerDetails.includes('money')) return DollarSign;
    if (lowerDetails.includes('document')) return FileText;
    if (lowerDetails.includes('security')) return Shield;
    return Activity;
  };
  
  const getActivityType = (details: string) => {
    const lowerDetails = details.toLowerCase();
    if (lowerDetails.includes('added') || lowerDetails.includes('created')) return 'success';
    if (lowerDetails.includes('updated') || lowerDetails.includes('modified')) return 'warning';
    if (lowerDetails.includes('deleted') || lowerDetails.includes('removed')) return 'destructive';
    if (lowerDetails.includes('security')) return 'secondary';
    return 'default';
  };
  
  const formatActionText = (action: string) => {
    // Convert snake_case or camelCase to readable text
    return action
      .replace(/[_-]/g, ' ') // Replace underscores and hyphens with spaces
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before capital letters
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  return (
    <div className="mt-10 space-y-6">
      
      {/* Clean Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-semibold text-foreground">Activity</h2>
        </div>
        <p className="text-sm text-muted-foreground">Track all changes and updates to your vault</p>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-4">
        {stats?.recent_activity && stats.recent_activity.length > 0 ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
                
                {/* Activity Items */}
                <div className="space-y-0">
                  {stats.recent_activity.map((activity, index) => {
                    const IconComponent = getActivityIcon(activity.details);
                    const activityType = getActivityType(activity.details);
                    
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="relative flex gap-4 pb-6 last:pb-0"
                      >
                        {/* Icon */}
                        <div className="relative z-10">
                          <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center
                            ${activityType === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                              activityType === 'warning' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' :
                              activityType === 'destructive' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                              activityType === 'secondary' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                              'bg-muted text-muted-foreground'}
                          `}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 pt-0.5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1 flex-1">
                              <p className="text-sm font-medium text-foreground">
                                {activity.details}
                              </p>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTimestamp(activity.timestamp)}
                                </span>
                                {activity.action && (
                                  <Badge 
                                    variant="outline"
                                    className={`text-xs font-normal border ${
                                      activityType === 'success' 
                                        ? theme === 'dark' 
                                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                          : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                        : activityType === 'warning' 
                                        ? theme === 'dark'
                                          ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                                          : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                                        : activityType === 'destructive' 
                                        ? theme === 'dark'
                                          ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                          : 'bg-red-50 border-red-200 text-red-700'
                                        : theme === 'dark'
                                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                                        : 'bg-blue-50 border-blue-200 text-blue-700'
                                    }`}
                                  >
                                    {formatActionText(activity.action)}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Clean Empty State */
          <Card className="border-dashed">
            <CardContent className="text-center py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Activity Yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Your vault activity will appear here as you add assets and manage heirs
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Activity Summary Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className={`${getMetallicCardStyle(theme).className} p-4 hover:shadow-xl transition-all duration-300`}
            style={getMetallicCardStyle(theme).style}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                theme === 'dark' 
                  ? 'bg-gradient-to-br from-zinc-800 via-zinc-700 to-zinc-900 border border-white/10' 
                  : 'bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 border border-black/5'
              }`}>
                <TrendingUp className={`h-4 w-4 ${theme === 'dark' ? 'text-primary' : 'text-black'}`} />
              </div>
              <div>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{stats.total_assets || 0}</p>
                <p className={`text-xs ${theme === 'dark' ? 'text-white/70' : 'text-black/70'}`}>Total Assets</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className={`${getMetallicCardStyle(theme).className} p-4 hover:shadow-xl transition-all duration-300`}
            style={getMetallicCardStyle(theme).style}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                theme === 'dark' 
                  ? 'bg-gradient-to-br from-zinc-800 via-zinc-700 to-zinc-900 border border-white/10' 
                  : 'bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 border border-black/5'
              }`}>
                <Users className={`h-4 w-4 ${theme === 'dark' ? 'text-primary' : 'text-black'}`} />
              </div>
              <div>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{stats.total_heirs || 0}</p>
                <p className={`text-xs ${theme === 'dark' ? 'text-white/70' : 'text-black/70'}`}>Total Heirs</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className={`${getMetallicCardStyle(theme).className} p-4 hover:shadow-xl transition-all duration-300`}
            style={getMetallicCardStyle(theme).style}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                theme === 'dark' 
                  ? 'bg-gradient-to-br from-zinc-800 via-zinc-700 to-zinc-900 border border-white/10' 
                  : 'bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 border border-black/5'
              }`}>
                <Shield className={`h-4 w-4 ${theme === 'dark' ? 'text-primary' : 'text-black'}`} />
              </div>
              <div>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Secured</p>
                <p className={`text-xs ${theme === 'dark' ? 'text-white/70' : 'text-black/70'}`}>Vault Status</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className={`${getMetallicCardStyle(theme).className} p-4 hover:shadow-xl transition-all duration-300`}
            style={getMetallicCardStyle(theme).style}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                theme === 'dark' 
                  ? 'bg-gradient-to-br from-zinc-800 via-zinc-700 to-zinc-900 border border-white/10' 
                  : 'bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 border border-black/5'
              }`}>
                <Activity className={`h-4 w-4 ${theme === 'dark' ? 'text-primary' : 'text-black'}`} />
              </div>
              <div>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{stats.recent_activity?.length || 0}</p>
                <p className={`text-xs ${theme === 'dark' ? 'text-white/70' : 'text-black/70'}`}>Recent Actions</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}