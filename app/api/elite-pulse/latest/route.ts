import { NextRequest, NextResponse } from 'next/server';
import { secureApi } from '@/lib/secure-api';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Forward the authorization header from the client
    const authHeader = request.headers.get('authorization');
    
    // Use ONLY secure API - NO direct backend URL exposure
    try {
      const requireAuth = !!authHeader;
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