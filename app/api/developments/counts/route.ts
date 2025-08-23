import { NextRequest, NextResponse } from 'next/server';
import { secureApi } from '@/lib/secure-api';

export async function GET(request: NextRequest) {
  try {
    // Always require authentication for backend calls
    const requireAuth = true;

    // Use secure API to proxy the request to the backend
    const endpoint = '/api/developments/counts';
    
    const data = await secureApi.get(endpoint, requireAuth, { enableCache: true, cacheDuration: 300000 }); // 5 minutes cache
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    // API error occurred
    return NextResponse.json(
      { error: 'Failed to fetch development counts' },
      { status: 500 }
    );
  }
}