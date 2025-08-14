import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://uwind.onrender.com';

export async function GET(request: NextRequest) {
  try {
    // Forward the authorization header from the client
    const authHeader = request.headers.get('authorization');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Proxy the request to the real backend
    const backendUrl = `${BACKEND_URL}/api/analytics/members`;
    
    try {
      const response = await fetch(backendUrl, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        // If backend doesn't have this endpoint yet, return reasonable defaults
        if (response.status === 404) {
          return NextResponse.json({
            total_members: 0,
            active_members_24h: 0,
            current_online: 0,
            regions: {}
          }, { status: 200 });
        }
        
        const errorText = await response.text();
        return NextResponse.json(
          { error: `Backend error: ${response.status}`, details: errorText },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json(data, { status: 200 });
      
    } catch (fetchError) {
      console.error('Backend request failed:', fetchError);
      
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