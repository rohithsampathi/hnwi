import { NextRequest, NextResponse } from 'next/server';
import { secureApi } from '@/lib/secure-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Never require authentication for fetching development details
    // These are public data points that can be referenced in shared conversations
    const requireAuth = false;

    // Check if this is a request for specific development IDs
    if (body.dev_ids && Array.isArray(body.dev_ids)) {
      // Fetch specific developments by IDs
      const developments = [];

      for (const devId of body.dev_ids) {
        try {
          // Try to fetch from the developments endpoint with the specific ID
          const endpoint = `/api/developments/by-id/${devId}`;

          const devData = await secureApi.get(endpoint, requireAuth, {
            enableCache: true,
            cacheDuration: 600000 // Cache for 10 minutes
          });

          if (devData) {
            developments.push({
              id: devId,
              ...devData
            });
          }
        } catch (err: any) {
          // Skip this development if it fails to fetch
          continue;
        }
      }

      return NextResponse.json({ developments }, { status: 200 });
    }

    // Otherwise, use the regular developments endpoint
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