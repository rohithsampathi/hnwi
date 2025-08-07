import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityItem {
  action: string;
  asset_name?: string;
  timestamp: string;
  details: string;
}

interface ActivityTabProps {
  activities: ActivityItem[];
}

export function ActivityTab({ activities }: ActivityTabProps) {

  return (
    <div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={index} className="border-l-4 border-primary pl-4 py-2">
                  <p className="font-medium">{activity.details}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric'
                    })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-foreground/70 dark:text-muted-foreground">No recent activity</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}