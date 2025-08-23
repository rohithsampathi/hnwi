import { NextRequest, NextResponse } from 'next/server';
import { secureApi } from '@/lib/secure-api';

export async function GET(request: NextRequest) {
  try {
    // Forward the authorization header from the client
    const authHeader = request.headers.get('authorization');
    
    // First try to fetch from the real backend with auth
    if (authHeader) {
      try {
        const response = await fetch('https://hnwi-uwind-p8oqb.ondigitalocean.app/api/elite-pulse/latest', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          return NextResponse.json(data, { status: 200 });
        }
      } catch (backendError) {
        // Backend request failed, will try fallback
      }
    }
    
    // Fallback to secureApi if direct fetch fails
    try {
      // For development, don't require authentication 
      const requireAuth = process.env.NODE_ENV === 'production' && !!authHeader;
      const data = await secureApi.get('/api/elite-pulse/latest', requireAuth);
      return NextResponse.json(data, { status: 200 });
      
    } catch (apiError) {
      throw apiError;
    }

  } catch (error) {
    // Elite Pulse API error occurred
    return NextResponse.json(
      { 
        success: false,
        analysis: null,
        record_id: null,
        generated_at: null,
        message: "No Elite Pulse analysis found" 
      },
      { status: 404 }
    );
  }
}