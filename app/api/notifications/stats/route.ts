import { NextRequest, NextResponse } from 'next/server';
import { secureApi } from '@/lib/secure-api';

export async function GET(request: NextRequest) {
  try {
    // Forward request to backend using secureApi (same pattern as Crown Vault)
    const backendEndpoint = `/api/notifications/stats`;
    const response = await secureApi.get(backendEndpoint, true);
    
    return NextResponse.json(response);
  } catch (error) {
    // Return empty stats on error to prevent UI breaking
    const fallbackStats = {
      user_id: '',
      unread_notifications: 0,
      total_notifications: 0,
      notifications_by_type: {}
    };
    
    return NextResponse.json(fallbackStats);
  }
}