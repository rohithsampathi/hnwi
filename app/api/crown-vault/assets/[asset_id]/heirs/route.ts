import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
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

    // Use secureApi for secure backend communication with proper PUT method
    const endpoint = `/api/crown-vault/assets/${assetId}/heirs?owner_id=${user.id}`;
    
    // Debug: Log the exact data being sent to backend
    console.log('Heir assignment - sending to backend:', {
      endpoint,
      heirIds: body.heir_ids,
      heirIdsType: typeof body.heir_ids,
      isArray: Array.isArray(body.heir_ids)
    });
    
    const response = await secureApi.put(endpoint, body.heir_ids, true);

    return ApiAuth.addSecurityHeaders(NextResponse.json(response, { status: 200 }));

  } catch (error) {
    console.error('Crown Vault heir assignment error:', error);
    return ApiAuth.addSecurityHeaders(NextResponse.json(
      { error: 'Failed to update heir assignment' },
      { status: 500 }
    ));
  }
}, { 
  requireAuth: true, 
  rateLimit: 'standard',
  auditLog: true 
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
    // fetch the asset details which includes heir information using secureApi
    const endpoint = `/api/crown-vault/assets/detailed?owner_id=${user.id}`;
    const assets = await secureApi.get(endpoint, true);

    // Find the specific asset and return its heir information
    if (Array.isArray(assets)) {
      const asset = assets.find((a: any) => a.asset_id === assetId || a.id === assetId);
      if (asset) {
        return ApiAuth.addSecurityHeaders(NextResponse.json({
          heir_ids: asset.heir_ids || [],
          heir_names: asset.heir_names || []
        }, { status: 200 }));
      }
    }

    return ApiAuth.addSecurityHeaders(NextResponse.json(
      { error: 'Asset not found.' },
      { status: 404 }
    ));

  } catch (error) {
    console.error('Crown Vault heir assignment fetch error:', error);
    return ApiAuth.addSecurityHeaders(NextResponse.json(
      { error: 'Failed to fetch heir assignment' },
      { status: 500 }
    ));
  }
}, { 
  requireAuth: true, 
  rateLimit: 'standard',
  auditLog: true 
});