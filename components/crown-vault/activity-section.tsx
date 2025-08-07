import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp } from "lucide-react";
import type { CrownVaultStats } from "@/lib/api";

interface ActivitySectionProps {
  stats: CrownVaultStats | null;
}

export function ActivitySection({ stats }: ActivitySectionProps) {

  return (
    <div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Vault Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.recent_activity && stats.recent_activity.length > 0 ? (
            <div className="space-y-4">
              {stats.recent_activity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.details}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <TrendingUp className="h-3 w-3 text-emerald-600" />
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-foreground/70 dark:text-muted-foreground">No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}