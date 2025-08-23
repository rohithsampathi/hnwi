import { NextRequest, NextResponse } from 'next/server';
import { secureApi } from '@/lib/secure-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // For development, don't require authentication for developments POST
    const requireAuth = process.env.NODE_ENV === 'production';

    // Use secure API to proxy the request to the backend
    const endpoint = '/api/developments';
    
    const data = await secureApi.post(endpoint, body, requireAuth, { enableCache: false });
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    // API error occurred
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
    
    // For development, don't require authentication for developments GET
    const requireAuth = process.env.NODE_ENV === 'production';

    // Use secure API to proxy the request to the backend
    const endpoint = `/api/developments?page=${page}&page_size=${pageSize}`;
    
    const data = await secureApi.get(endpoint, requireAuth, { enableCache: false });
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    // API error occurred
    return NextResponse.json(
      { error: 'Failed to fetch developments' },
      { status: 500 }
    );
  }
}