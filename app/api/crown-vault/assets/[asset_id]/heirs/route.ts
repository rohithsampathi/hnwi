import { NextRequest, NextResponse } from 'next/server';
import { secureApi } from '@/lib/secure-api';
import { ApiAuth } from '@/lib/api-auth';

interface HeirAssignmentRequest {
  heir_ids: string[];
}

export const PUT = ApiAuth.withAuth(async (
  request: NextRequest,
  user,
  { params }: { params: { asset_id: string } }
) => {
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

    // Backend expects direct array of heir IDs, not wrapped in object
    const backendRequestBody = body.heir_ids;

    // Proxy to backend API using secure API - include owner_id as query parameter
    const endpoint = `/api/crown-vault/assets/${assetId}/heirs?owner_id=${user.id}`;
    

    try {
      
      const data = await secureApi.put(endpoint, backendRequestBody);

      return NextResponse.json(data, { status: 200 });

    } catch (error: any) {
      console.error('Backend request failed with error:', error);
      
      // Check if it's an authentication error
      if (error?.message?.includes('401') || error?.status === 401) {
        return NextResponse.json(
          { error: 'Authentication required. Please log in again.' },
          { status: 401 }
        );
      }
      
      // Check if it's a forbidden error
      if (error?.message?.includes('403') || error?.status === 403) {
        return NextResponse.json(
          { error: 'Access denied. You do not have permission to modify this asset.' },
          { status: 403 }
        );
      }
      
      // Check if it's a validation error
      if (error?.message?.includes('400') || error?.status === 400) {
        return NextResponse.json(
          { error: 'Invalid request data. Please check your input.' },
          { status: 400 }
        );
      }
      
      // Check if it's a data validation error (422)
      if (error?.message?.includes('422') || error?.status === 422) {
        return NextResponse.json(
          { error: 'The request data could not be processed. Please verify the heir IDs are valid.' },
          { status: 422 }
        );
      }
      
      // Check if it's a not found error
      if (error?.message?.includes('404') || error?.status === 404) {
        return NextResponse.json(
          { error: 'Asset not found.' },
          { status: 404 }
        );
      }
      
      // For other errors, return 503
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
});

// NOTE: Backend doesn't support GET for heir assignments (405 Method Not Allowed)
// Heir assignments are fetched through the assets endpoint instead
export const GET = ApiAuth.withAuth(async (
  request: NextRequest,
  user,
  { params }: { params: { asset_id: string } }
) => {
  try {
    const assetId = params.asset_id;
    
    if (!assetId) {
      return NextResponse.json(
        { error: 'Asset ID is required' },
        { status: 400 }
      );
    }

    // Since backend doesn't support GET on heirs endpoint, 
    // fetch the asset details which includes heir information
    const endpoint = `/api/crown-vault/assets/detailed?owner_id=${user.id}`;
    

    try {
      const assets = await secureApi.get(endpoint, true);

      // Find the specific asset and return its heir information
      if (Array.isArray(assets)) {
        const asset = assets.find((a: any) => a.asset_id === assetId || a.id === assetId);
        if (asset) {
          return NextResponse.json({
            heir_ids: asset.heir_ids || [],
            heir_names: asset.heir_names || []
          }, { status: 200 });
        }
      }

      return NextResponse.json(
        { error: 'Asset not found.' },
        { status: 404 }
      );

    } catch (error: any) {
      console.error('Backend request failed with error:', error);
      
      // Check if it's an authentication error
      if (error?.message?.includes('401') || error?.status === 401) {
        return NextResponse.json(
          { error: 'Authentication required. Please log in again.' },
          { status: 401 }
        );
      }
      
      // Check if it's a forbidden error
      if (error?.message?.includes('403') || error?.status === 403) {
        return NextResponse.json(
          { error: 'Access denied. You do not have permission to view this asset.' },
          { status: 403 }
        );
      }
      
      // For other errors, return 503
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
});