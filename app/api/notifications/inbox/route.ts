import { NextRequest, NextResponse } from 'next/server';
import { secureApi } from '@/lib/secure-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '20';
    const offset = searchParams.get('offset') || '0';
    const unreadOnly = searchParams.get('unread_only') || 'false';

    // Build query parameters for backend
    const params = new URLSearchParams({
      limit,
      offset,
      unread_only: unreadOnly
    });

    // Forward request to backend using secureApi (same pattern as Crown Vault)
    const backendEndpoint = `/api/notifications/inbox?${params}`;
    const response = await secureApi.get(backendEndpoint, true);
    
    return NextResponse.json(response);
  } catch (error) {
    // Return empty response on error to prevent UI breaking
    const fallbackResponse = {
      notifications: [],
      total_count: 0,
      unread_count: 0,
      has_more: false
    };
    
    return NextResponse.json(fallbackResponse);
  }
}