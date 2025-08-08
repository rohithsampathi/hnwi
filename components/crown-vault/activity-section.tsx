import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, TrendingUp, Shield, FileText, Users, DollarSign, Building } from "lucide-react";
import { motion } from "framer-motion";
import type { CrownVaultStats } from "@/lib/api";

interface ActivitySectionProps {
  stats: CrownVaultStats | null;
}

export function ActivitySection({ stats }: ActivitySectionProps) {
  
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
    <div className="space-y-6">
      
      {/* Clean Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Activity</h2>
          <p className="text-sm text-muted-foreground mt-1">Track all changes and updates to your vault</p>
        </div>
        
        {/* Live Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full">
          <div className="relative">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <div className="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping opacity-75" />
          </div>
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            Live
          </span>
        </div>
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
                                    variant={
                                      activityType === 'success' ? 'default' :
                                      activityType === 'warning' ? 'secondary' :
                                      activityType === 'destructive' ? 'destructive' :
                                      'outline'
                                    }
                                    className="text-xs font-normal"
                                  >
                                    {activity.action}
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
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">{stats.total_assets || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Assets</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">{stats.total_heirs || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Heirs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Secured</p>
                  <p className="text-xs text-muted-foreground">Vault Status</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">{stats.recent_activity?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Recent Actions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}