import { NextRequest, NextResponse } from 'next/server';
import { secureApi } from '@/lib/secure-api';

export async function GET(request: NextRequest) {
  try {
    // Forward the authorization header from the client
    const authHeader = request.headers.get('authorization');
    const requireAuth = !!authHeader;

    // Use secure API to proxy the request to the backend
    const endpoint = '/api/analytics/members';
    
    try {
      const data = await secureApi.get(endpoint, requireAuth);
      return NextResponse.json(data, { status: 200 });
      
    } catch (apiError) {
      console.error('Backend request failed:', apiError);
      
      // Check if it's a 404 error and return reasonable defaults
      if (apiError instanceof Error && apiError.message.includes('404')) {
        return NextResponse.json({
          total_members: 0,
          active_members_24h: 0,
          current_online: 0,
          regions: {}
        }, { status: 200 });
      }
      
      // Return fallback data when backend is unavailable
      return NextResponse.json({
        total_members: 0,
        active_members_24h: 0,
        current_online: 0,
        regions: {}
      }, { status: 200 });
    }

  } catch (error) {
    console.error('Member analytics error:', error);
    
    // Always return some data even if there's an error
    return NextResponse.json({
      total_members: 0,
      active_members_24h: 0,
      current_online: 0,
      regions: {}
    }, { status: 200 });
  }
}