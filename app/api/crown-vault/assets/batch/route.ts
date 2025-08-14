import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://uwind.onrender.com';

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

    // Proxy the request to the real backend (no owner_id needed - backend gets it from auth)
    const backendUrl = `${BACKEND_URL}/api/crown-vault/assets/batch`;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Proxying Crown Vault batch request to: /api/crown-vault/assets/batch');
      console.log('Request body:', JSON.stringify(batchData, null, 2));
    }
    
    try {
      // Forward the authorization header from the client
      const authHeader = request.headers.get('authorization');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      if (authHeader) {
        headers['Authorization'] = authHeader;
      }
      
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(batchData),
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