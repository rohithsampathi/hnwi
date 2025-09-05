import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/secure-logger';
import { ApiAuth } from '@/lib/api-auth';
import { secureApi } from '@/lib/secure-api';

// Protected PUT handler for updating individual assets
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

    const updateData = await request.json();
    
    logger.info("Starting asset update", {
      userId: user.id,
      assetId,
      updateData: Object.keys(updateData)
    });

    // Use secureApi to update asset on backend - user is already validated
    const endpoint = `/api/crown-vault/assets/${assetId}`;
    const updatedAsset = await secureApi.put(endpoint, updateData, true);

    logger.info("Asset updated successfully", {
      userId: user.id,
      assetId
    });

    const response = NextResponse.json({
      success: true,
      message: 'Asset updated successfully',
      asset: updatedAsset
    }, { status: 200 });

    return ApiAuth.addSecurityHeaders(response);

  } catch (error) {
    logger.error('Crown Vault asset update error', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      userId: user.id,
      assetId: params.asset_id
    });
    
    return ApiAuth.addSecurityHeaders(NextResponse.json(
      { 
        error: 'Failed to update asset',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    ));
  }
}, { 
  requireAuth: true, 
  rateLimit: 'standard',
  auditLog: true 
});

// Protected DELETE handler for removing individual assets
export const DELETE = ApiAuth.withAuth(async (
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

    logger.info("Starting asset deletion", {
      userId: user.id,
      assetId
    });

    // Use secureApi to delete asset on backend - user is already validated
    const endpoint = `/api/crown-vault/assets/${assetId}`;
    const result = await secureApi.delete(endpoint, true);

    logger.info("Asset deleted successfully", {
      userId: user.id,
      assetId,
      result
    });

    const response = NextResponse.json({
      success: true,
      message: 'Asset deleted successfully',
      ...result
    }, { status: 200 });

    return ApiAuth.addSecurityHeaders(response);

  } catch (error) {
    logger.error('Crown Vault asset deletion error', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      userId: user.id,
      assetId: params.asset_id
    });
    
    return ApiAuth.addSecurityHeaders(NextResponse.json(
      { 
        error: 'Failed to delete asset', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    ));
  }
}, { 
  requireAuth: true, 
  rateLimit: 'standard',
  auditLog: true 
});