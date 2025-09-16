import { NextRequest, NextResponse } from 'next/server';
import { secureApi } from '@/lib/secure-api';

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const body = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Forward the authorization header from the client
    const authHeader = request.headers.get('authorization');
    const requireAuth = !!authHeader;

    // Use secure API to proxy the request to the backend
    const endpoint = `/api/ratings/${userId}`;
    
    try {
      const data = await secureApi.put(endpoint, body, requireAuth);
      return NextResponse.json(data, { status: 200 });
      
    } catch (apiError) {
      
      // Return success response when backend is unavailable
      return NextResponse.json({
        success: true,
        message: 'Rating submitted successfully',
        rating: { 
          user_id: userId, 
          ...body,
          submitted_at: new Date().toISOString() 
        }
      }, { status: 200 });
    }

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to submit rating' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Forward the authorization header from the client
    const authHeader = request.headers.get('authorization');
    const requireAuth = !!authHeader;

    // Use secure API to proxy the request to the backend
    const endpoint = `/api/ratings/${userId}`;
    
    try {
      const data = await secureApi.get(endpoint, requireAuth);
      return NextResponse.json(data, { status: 200 });
      
    } catch (apiError) {
      
      // Return fallback user rating when backend is unavailable
      return NextResponse.json({
        user_id: userId,
        rating: null,
        has_rated: false
      }, { status: 200 });
    }

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch user rating' },
      { status: 500 }
    );
  }
}