"use client";

import { useState, useEffect } from "react";
import { 
  Bell, 
  Mail, 
  Smartphone, 
  MessageSquare, 
  Clock,
  Save,
  Volume2,
  VolumeX,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useNotificationContext } from "@/contexts/notification-context";
import { pushNotificationService } from "@/lib/services/push-notification-service";
import { UserNotificationPreferences } from "@/lib/services/notification-service";

interface NotificationPreferencesProps {
  className?: string;
}

export function NotificationPreferences({ className = "" }: NotificationPreferencesProps) {
  const {
    preferences,
    updatePreferences,
    fetchPreferences,
    loading,
    preferencesLoading
  } = useNotificationContext();

  const [localPreferences, setLocalPreferences] = useState<UserNotificationPreferences | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);

  // Initialize local preferences
  useEffect(() => {
    if (preferences && !localPreferences) {
      // Ensure all required fields are present with defaults
      const normalizedPreferences = {
        email_enabled: true,
        push_enabled: false,
        in_app_enabled: true,
        sms_enabled: false,
        quiet_hours_enabled: false,
        quiet_hours_start: "22:00",
        quiet_hours_end: "08:00",
        event_types: {
          elite_pulse: true,
          hnwi_world: true,
          crown_vault: true,
          social_hub: true,
          system_notification: true
        },
        frequency_limits: {
          max_per_hour: 10,
          max_per_day: 50
        },
        ...preferences,
        event_types: {
          elite_pulse_generated: true,
          opportunity_added: true,
          crown_vault_update: true,
          social_event_added: true,
          market_alert: true,
          regulatory_update: true,
          system_notification: true,
          ...preferences.event_types
        },
        frequency_limits: {
          max_per_hour: 10,
          max_per_day: 50,
          ...preferences.frequency_limits
        }
      };
      setLocalPreferences(normalizedPreferences);
    } else if (!preferences && !preferencesLoading && !localPreferences) {
      // If no preferences from context and not loading, create default ones
      const defaultPreferences: UserNotificationPreferences = {
        email_enabled: true,
        push_enabled: false,
        in_app_enabled: true,
        sms_enabled: false,
        quiet_hours_enabled: false,
        quiet_hours_start: "22:00",
        quiet_hours_end: "08:00",
        event_types: {
          elite_pulse: true,
          hnwi_world: true,
          crown_vault: true,
          social_hub: true,
          system_notification: true
        },
        frequency_limits: {
          max_per_hour: 10,
          max_per_day: 50
        }
      };
      setLocalPreferences(defaultPreferences);
    }
  }, [preferences, preferencesLoading]);

  // Check push notification support and status
  useEffect(() => {
    const checkPushStatus = async () => {
      const supported = pushNotificationService.constructor.isSupported();
      setPushSupported(supported);

      if (supported) {
        const subscribed = await pushNotificationService.isSubscribed();
        setPushEnabled(subscribed);
        
        // Update local preferences to match actual browser state
        if (localPreferences && localPreferences.push_enabled !== subscribed) {
          setLocalPreferences(prev => prev ? {
            ...prev,
            push_enabled: subscribed
          } : null);
        }
      }
    };

    checkPushStatus();
  }, [localPreferences]);

  // Fetch preferences on mount
  useEffect(() => {
    fetchPreferences();
  }, []); // Remove fetchPreferences from dependencies to avoid infinite loop

  if (preferencesLoading || !localPreferences) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Loading preferences...</span>
      </div>
    );
  }

  const handleChannelToggle = (channel: keyof Pick<UserNotificationPreferences, 'email_enabled' | 'push_enabled' | 'in_app_enabled'>) => {
    setLocalPreferences(prev => prev ? {
      ...prev,
      [channel]: !prev[channel]
    } : null);
    setSaveStatus('idle');
  };

  const handleEventTypeToggle = (eventType: keyof UserNotificationPreferences['event_types']) => {
    setLocalPreferences(prev => prev ? {
      ...prev,
      event_types: {
        ...prev.event_types,
        [eventType]: !prev.event_types[eventType]
      }
    } : null);
    setSaveStatus('idle');
  };

  const handleQuietHoursToggle = () => {
    setLocalPreferences(prev => prev ? {
      ...prev,
      quiet_hours_enabled: !prev.quiet_hours_enabled
    } : null);
    setSaveStatus('idle');
  };

  const handleQuietHourChange = (field: 'quiet_hours_start' | 'quiet_hours_end', value: string) => {
    setLocalPreferences(prev => prev ? {
      ...prev,
      [field]: value
    } : null);
    setSaveStatus('idle');
  };

  const handleFrequencyChange = (field: 'max_per_hour' | 'max_per_day', value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 0) return;

    setLocalPreferences(prev => prev ? {
      ...prev,
      frequency_limits: {
        max_per_hour: 10,
        max_per_day: 50,
        ...prev.frequency_limits,
        [field]: numValue
      }
    } : null);
    setSaveStatus('idle');
  };

  const handlePushToggle = async () => {
    if (!pushSupported) return;

    const currentlyEnabled = localPreferences.push_enabled;
    
    if (currentlyEnabled) {
      // Disable push notifications
      await pushNotificationService.unsubscribe();
      setPushEnabled(false);
      setLocalPreferences(prev => prev ? {
        ...prev,
        push_enabled: false
      } : null);
    } else {
      // Enable push notifications - browser will ask for permission
      const success = await pushNotificationService.subscribe();
      if (success) {
        setPushEnabled(true);
        setLocalPreferences(prev => prev ? {
          ...prev,
          push_enabled: true
        } : null);
      }
    }
    setSaveStatus('idle');
  };

  const handleTestNotification = async () => {
    try {
      await pushNotificationService.showTestNotification();
    } catch (error) {
      alert('Failed to show test notification. Please check your browser permissions.');
    }
  };

  const handleSave = async () => {
    if (!localPreferences) return;

    setSaving(true);
    setSaveStatus('idle');

    try {
      await updatePreferences(localPreferences);
      setSaveStatus('success');
      
      // Clear success status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = JSON.stringify(preferences) !== JSON.stringify(localPreferences);


  return (
    <div className={`space-y-6 ${className}`}>
      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Channels
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <div>
                <Label className="text-sm font-medium">Email Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive notifications via email</p>
              </div>
            </div>
            <Switch 
              checked={localPreferences.email_enabled}
              onCheckedChange={() => handleChannelToggle('email_enabled')}
            />
          </div>

          {/* Push Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-green-600" />
              <div>
                <Label className="text-sm font-medium">Push Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  {pushSupported 
                    ? 'Browser push notifications' 
                    : 'Not supported in this browser'
                  }
                </p>
                {pushSupported && (
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant={pushEnabled ? "default" : "secondary"} 
                      className="text-xs"
                    >
                      {pushEnabled ? 'Subscribed' : 'Not Subscribed'}
                    </Badge>
                    {pushEnabled && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={handleTestNotification}
                        className="text-xs h-6 px-2"
                      >
                        Test
                      </Button>
                    )}
                    {Notification?.permission === 'denied' && (
                      <span className="text-xs text-red-500">
                        Permission denied - enable in browser settings
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <Switch 
              checked={localPreferences.push_enabled}
              onCheckedChange={handlePushToggle}
              disabled={!pushSupported}
            />
          </div>

          {/* In-App Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-purple-600" />
              <div>
                <Label className="text-sm font-medium">In-App Notifications</Label>
                <p className="text-xs text-muted-foreground">Show notifications within the app</p>
              </div>
            </div>
            <Switch 
              checked={localPreferences.in_app_enabled}
              onCheckedChange={() => handleChannelToggle('in_app_enabled')}
            />
          </div>

        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {localPreferences?.event_types && Object.entries(localPreferences.event_types).map(([eventType, enabled]) => {
            const labels = {
              elite_pulse: 'Elite Pulse Intelligence Reports',
              hnwi_world: 'Investment Opportunities',
              crown_vault: 'Crown Vault Updates',
              social_hub: 'Social Events & Gatherings',
              system_notification: 'System Notifications'
            };

            const descriptions = {
              elite_pulse: 'Strategic market intelligence and analysis',
              hnwi_world: 'Exclusive investment and wealth opportunities',
              crown_vault: 'Updates to your assets and heirs',
              social_hub: 'High-society events and networking opportunities',
              system_notification: 'Important system updates and maintenance'
            };

            return (
              <div key={eventType} className="flex items-center justify-between py-2">
                <div className="flex-1">
                  <Label className="text-sm font-medium">
                    {labels[eventType as keyof typeof labels] || eventType}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {descriptions[eventType as keyof typeof descriptions] || ''}
                  </p>
                </div>
                <Switch 
                  checked={enabled}
                  onCheckedChange={() => handleEventTypeToggle(eventType as keyof UserNotificationPreferences['event_types'])}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Quiet Hours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Enable Quiet Hours</Label>
              <p className="text-xs text-muted-foreground">
                Suppress non-urgent notifications during specified hours
              </p>
            </div>
            <Switch 
              checked={localPreferences.quiet_hours_enabled}
              onCheckedChange={handleQuietHoursToggle}
            />
          </div>

          {localPreferences.quiet_hours_enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quiet-start" className="text-sm">Start Time</Label>
                <Input
                  id="quiet-start"
                  type="time"
                  value={localPreferences.quiet_hours_start}
                  onChange={(e) => handleQuietHourChange('quiet_hours_start', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="quiet-end" className="text-sm">End Time</Label>
                <Input
                  id="quiet-end"
                  type="time"
                  value={localPreferences.quiet_hours_end}
                  onChange={(e) => handleQuietHourChange('quiet_hours_end', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Frequency Limits */}
      <Card>
        <CardHeader>
          <CardTitle>Frequency Limits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="max-per-hour" className="text-sm">Maximum per Hour</Label>
            <Input
              id="max-per-hour"
              type="number"
              min="1"
              max="100"
              value={localPreferences.frequency_limits?.max_per_hour || 10}
              onChange={(e) => handleFrequencyChange('max_per_hour', e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Limit notifications to prevent spam
            </p>
          </div>

          <div>
            <Label htmlFor="max-per-day" className="text-sm">Maximum per Day</Label>
            <Input
              id="max-per-day"
              type="number"
              min="1"
              max="1000"
              value={localPreferences.frequency_limits?.max_per_day || 50}
              onChange={(e) => handleFrequencyChange('max_per_day', e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Daily limit for all notifications
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <div className="flex items-center gap-2">
          {saveStatus === 'success' && (
            <>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">Preferences saved successfully</span>
            </>
          )}
          {saveStatus === 'error' && (
            <>
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-600">Failed to save preferences</span>
            </>
          )}
          {hasChanges && saveStatus === 'idle' && (
            <span className="text-sm text-amber-600">You have unsaved changes</span>
          )}
        </div>

        <Button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="flex items-center gap-2"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Preferences
        </Button>
      </div>
    </div>
  );
}