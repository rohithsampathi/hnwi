import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock stats data
    const stats = {
      total_count: 2,
      unread_count: 2,
      urgent_count: 0,
      counts_by_type: {
        elite_pulse_generated: 1,
        opportunity_added: 1,
        crown_vault_update: 0,
        social_event_added: 0,
        market_alert: 0,
        regulatory_update: 0,
        system_notification: 0
      },
      counts_by_priority: {
        low: 0,
        medium: 1,
        high: 1,
        urgent: 0
      }
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}