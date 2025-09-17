import { NextRequest, NextResponse } from 'next/server';
import { serverSecureApi } from '@/lib/secure-api';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Backend expects array format for batch processing
    let batchData;
    
    // Handle both old format (single object) and new format (array)
    if (Array.isArray(body)) {
      batchData = body;
    } else if (body.raw_text) {
      // Convert old single object format to array format
      batchData = [body];
    } else {
      return NextResponse.json(
        { error: 'Invalid request format. Expected array of asset objects or single asset object with raw_text.' },
        { status: 400 }
      );
    }
    
    // Validate each item in the batch
    for (const item of batchData) {
      if (!item.raw_text || item.raw_text.length < 50) {
        return NextResponse.json(
          { error: 'Each asset raw_text must be at least 50 characters' },
          { status: 400 }
        );
      }
    }


    // Get authentication cookies
    const accessTokenCookie = cookies().get('access_token');
    const refreshTokenCookie = cookies().get('refresh_token');
    const authCookies = `access_token=${accessTokenCookie?.value || ''}; refresh_token=${refreshTokenCookie?.value || ''}`;

    // Use serverSecureApi to call external backend - no fallbacks
    const endpoint = '/api/crown-vault/assets/batch';
    const data = await serverSecureApi.post(endpoint, batchData, authCookies);

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process assets' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to process assets.' },
    { status: 405 }
  );
}