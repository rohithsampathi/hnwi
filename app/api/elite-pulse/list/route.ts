import { NextRequest, NextResponse } from 'next/server';
import { secureApi } from '@/lib/secure-api';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(parseInt(searchParams.get('page_size') || '10'), 50);
    
    // Forward the authorization header from the client
    const authHeader = request.headers.get('authorization');
    const requireAuth = !!authHeader;

    // Use secure API to proxy the request to the backend
    const endpoint = `/api/elite-pulse/list?page=${page}&page_size=${pageSize}`;
    
    try {
      const data = await secureApi.get(endpoint, requireAuth);
      return NextResponse.json(data, { status: 200 });
      
    } catch (apiError) {
      
      // Return fallback analysis list when backend is unavailable
      return NextResponse.json({
        analyses: [],
        total_count: 0,
        page: page,
        page_size: pageSize
      }, { status: 200 });
    }

  } catch (error) {
    return NextResponse.json(
      { 
        analyses: [],
        total_count: 0,
        page: 1,
        page_size: 10
      },
      { status: 200 }
    );
  }
}