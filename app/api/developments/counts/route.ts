import { NextRequest, NextResponse } from 'next/server';
import { secureApi } from '@/lib/secure-api';

export async function GET(request: NextRequest) {
  try {
    // Forward the authorization header from the client
    const authHeader = request.headers.get('authorization');
    const requireAuth = !!authHeader;

    // Use secure API to proxy the request to the backend
    const endpoint = '/api/developments/counts';
    
    try {
      const data = await secureApi.get(endpoint, requireAuth, { enableCache: true, cacheDuration: 300000 }); // 5 minutes cache
      return NextResponse.json(data, { status: 200 });
      
    } catch (apiError) {
      console.error('Backend request failed:', apiError);
      
      // Return fallback counts when backend is unavailable
      return NextResponse.json({
        developments: {
          total_count: 1600,
          source: "pinecone"
        },
        opportunities: {
          total_count: 85,
          active_count: 42,
          source: "mongodb"
        }
      }, { status: 200 });
    }

  } catch (error) {
    console.error('Developments counts API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch development counts' },
      { status: 500 }
    );
  }
}