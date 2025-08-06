import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://uwind.onrender.com';

interface HeirAssignmentRequest {
  heir_ids: string[];
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { asset_id: string } }
) {
  try {
    const assetId = params.asset_id;
    
    if (!assetId) {
      return NextResponse.json(
        { error: 'Asset ID is required' },
        { status: 400 }
      );
    }

    const body: HeirAssignmentRequest = await request.json();
    
    if (!body.heir_ids || !Array.isArray(body.heir_ids)) {
      return NextResponse.json(
        { error: 'heir_ids must be an array' },
        { status: 400 }
      );
    }

    // Get user ID from request headers
    const userId = request.headers.get('X-User-ID');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Proxy to backend API
    const backendUrl = `${BACKEND_URL}/api/crown-vault/assets/${assetId}/heirs`;
    
    console.log('Proxying heir assignment request to:', backendUrl);
    console.log('Request body:', JSON.stringify(body, null, 2));
    console.log('User ID:', userId);

    try {
      const response = await fetch(backendUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-User-ID': userId,
        },
        body: JSON.stringify(body.heir_ids), // Send heir_ids array directly, not wrapped in object
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      console.log('Backend response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error details:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        return NextResponse.json(
          { error: `Backend error: ${response.status} ${response.statusText}`, details: errorText },
          { status: response.status }
        );
      }

      const data = await response.json();
      console.log('Backend response data:', JSON.stringify(data, null, 2));
      return NextResponse.json(data, { status: 200 });

    } catch (error) {
      console.error('Backend request failed with error:', error);
      return NextResponse.json(
        { error: 'Backend service unavailable. Please try again later.' },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('Crown Vault heir assignment error:', error);
    return NextResponse.json(
      { error: 'Failed to update heir assignment' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { asset_id: string } }
) {
  try {
    const assetId = params.asset_id;
    
    if (!assetId) {
      return NextResponse.json(
        { error: 'Asset ID is required' },
        { status: 400 }
      );
    }

    // Get user ID from request headers
    const userId = request.headers.get('X-User-ID');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Proxy to backend API
    const backendUrl = `${BACKEND_URL}/api/crown-vault/assets/${assetId}/heirs`;
    
    console.log('Fetching heir assignment from:', backendUrl);
    console.log('User ID:', userId);

    try {
      const response = await fetch(backendUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-User-ID': userId,
        },
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      console.log('Backend response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error details:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        return NextResponse.json(
          { error: `Backend error: ${response.status} ${response.statusText}`, details: errorText },
          { status: response.status }
        );
      }

      const data = await response.json();
      console.log('Backend response data:', JSON.stringify(data, null, 2));
      return NextResponse.json(data, { status: 200 });

    } catch (error) {
      console.error('Backend request failed with error:', error);
      return NextResponse.json(
        { error: 'Backend service unavailable. Please try again later.' },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('Crown Vault heir assignment fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch heir assignment' },
      { status: 500 }
    );
  }
}