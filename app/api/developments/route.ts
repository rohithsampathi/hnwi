import { NextRequest, NextResponse } from 'next/server';
import { secureApi } from '@/lib/secure-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward the authorization header from the client
    const authHeader = request.headers.get('authorization');
    const requireAuth = !!authHeader;

    // Use secure API to proxy the request to the backend
    const endpoint = '/api/developments';
    
    try {
      const data = await secureApi.post(endpoint, body, requireAuth, { enableCache: false });
      return NextResponse.json(data, { status: 200 });
      
    } catch (apiError) {
      console.error('Backend request failed:', apiError);
      
      // Return fallback data when backend is unavailable
      return NextResponse.json({
        developments: [],
        total_count: 0,
        page: body.page || 1,
        page_size: body.page_size || 10,
        has_more: false
      }, { status: 200 });
    }

  } catch (error) {
    console.error('Developments API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch developments' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('page_size') || '10';
    
    // Forward the authorization header from the client
    const authHeader = request.headers.get('authorization');
    const requireAuth = !!authHeader;

    // Use secure API to proxy the request to the backend
    const endpoint = `/api/developments?page=${page}&page_size=${pageSize}`;
    
    try {
      const data = await secureApi.get(endpoint, requireAuth, { enableCache: false });
      return NextResponse.json(data, { status: 200 });
      
    } catch (apiError) {
      console.error('Backend request failed:', apiError);
      
      // Return fallback data when backend is unavailable
      return NextResponse.json({
        developments: [],
        total_count: 0,
        page: parseInt(page),
        page_size: parseInt(pageSize),
        has_more: false
      }, { status: 200 });
    }

  } catch (error) {
    console.error('Developments API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch developments' },
      { status: 500 }
    );
  }
}