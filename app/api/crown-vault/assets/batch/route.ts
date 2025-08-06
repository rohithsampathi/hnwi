import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://uwind.onrender.com';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('owner_id');
    
    if (!ownerId) {
      return NextResponse.json(
        { error: 'Owner ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    if (!body.raw_text || body.raw_text.length < 50) {
      return NextResponse.json(
        { error: 'Input text must be at least 50 characters' },
        { status: 400 }
      );
    }

    // Proxy the request to the real backend
    const backendUrl = `${BACKEND_URL}/api/crown-vault/assets/batch?owner_id=${ownerId}`;
    
    console.log('Proxying Crown Vault batch request to:', backendUrl);
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(body),
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      console.log('Backend response status:', response.status);
      console.log('Backend response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error details:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        // Return the backend error instead of using mock data
        return NextResponse.json(
          { error: `Backend error: ${response.status} ${response.statusText}`, details: errorText },
          { status: response.status }
        );
      } else {
        // Success path - return backend response
        const data = await response.json();
        console.log('Backend response data:', JSON.stringify(data, null, 2));
        return NextResponse.json(data, { status: 200 });
      }
    } catch (error) {
      console.error('Backend request failed with error:', error);
      return NextResponse.json(
        { error: 'Backend service unavailable. Please try again later.' },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('Crown Vault batch processing error:', error);
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