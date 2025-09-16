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

export async function GET(request: NextRequest) {
  try {
    const user = getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, return default preferences with user_id
    // In production, you'd fetch from database based on user.userId
    const preferencesWithUserId = {
      user_id: user.userId,
      ...DEFAULT_PREFERENCES
    };
    
    return NextResponse.json(preferencesWithUserId);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const preferences = await request.json();

    // Validate preferences structure
    const validatedPreferences = {
      ...DEFAULT_PREFERENCES,
      ...preferences
    };

    // In production, you'd save to database based on user.userId
    // For now, just return the updated preferences with user_id
    const updatedPreferencesWithUserId = {
      user_id: user.userId,
      ...validatedPreferences
    };
    
    return NextResponse.json(updatedPreferencesWithUserId);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}