import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';

// Default notification preferences for new users
const DEFAULT_PREFERENCES = {
  email_enabled: true,
  push_enabled: false,
  in_app_enabled: true,
  sms_enabled: false,
  quiet_hours_enabled: false,
  quiet_hours_start: "22:00",
  quiet_hours_end: "08:00",
  event_types: {
    elite_pulse_generated: true,
    opportunity_added: true,
    crown_vault_update: true,
    social_event_added: true,
    market_alert: true,
    regulatory_update: true,
    system_notification: true
  },
  frequency_limits: {
    max_per_hour: 10,
    max_per_day: 50
  }
};

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, return default preferences
    // In production, you'd fetch from database based on user.id
    return NextResponse.json(DEFAULT_PREFERENCES);
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const preferences = await request.json();

    // Validate preferences structure
    const validatedPreferences = {
      ...DEFAULT_PREFERENCES,
      ...preferences
    };

    // In production, you'd save to database based on user.id
    // For now, just return the updated preferences
    return NextResponse.json(validatedPreferences);
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}