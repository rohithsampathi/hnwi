import { NextRequest, NextResponse } from 'next/server';
import { secureApi } from '@/lib/secure-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '10';
    const industry = searchParams.get('industry') || '';
    const product = searchParams.get('product') || '';
    
    // Build query string
    const params = new URLSearchParams();
    params.set('limit', limit);
    if (industry) params.set('industry', industry);
    if (product) params.set('product', product);
    
    // Always require authentication for backend calls
    const requireAuth = true;

    // Use secure API to proxy the request to the backend
    const endpoint = `/api/developments/latest-brief?${params.toString()}`;
    
    const data = await secureApi.get(endpoint, requireAuth, { enableCache: true, cacheDuration: 300000 });
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    // API error occurred
    return NextResponse.json(
      { error: 'Failed to fetch latest brief' },
      { status: 500 }
    );
  }
}