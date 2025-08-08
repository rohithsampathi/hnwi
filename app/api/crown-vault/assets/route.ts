import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateInput, assetSchema, queryParamSchema } from '@/lib/validation';
import { logger } from '@/lib/secure-logger';
import { ApiAuth } from '@/lib/api-auth';

interface Asset {
  asset_id: string;
  asset_data: {
    name: string;
    asset_type: string;
    value: number;
    currency: string;
    location?: string;
    notes?: string;
  };
  heir_ids: string[];
  heir_names: string[];
  created_at: string;
}

// Protected GET handler using authentication middleware
export const GET = ApiAuth.withAuth(async (request: NextRequest, user) => {
  try {
    // Validate request size
    if (!ApiAuth.validateRequestSize(request)) {
      return NextResponse.json(
        { error: 'Request too large' },
        { status: 413 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Validate query parameters
    const queryValidation = validateInput(queryParamSchema, {
      owner_id: searchParams.get('owner_id'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit')
    });
    
    if (!queryValidation.success) {
      logger.warn("Asset GET validation failed", { 
        errors: queryValidation.errors,
        userId: user.id
      });
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryValidation.errors },
        { status: 400 }
      );
    }

    const { owner_id: ownerId } = queryValidation.data!;
    
    if (!ownerId) {
      return NextResponse.json(
        { error: 'Owner ID is required' },
        { status: 400 }
      );
    }

    // Validate ownership - users can only access their own assets
    if (!await ApiAuth.validateOwnership(user.id, ownerId)) {
      logger.warn("Asset access denied - ownership validation failed", {
        userId: user.id,
        requestedOwnerId: ownerId
      });
      return NextResponse.json(
        { error: 'Access denied - insufficient permissions' },
        { status: 403 }
      );
    }

    // Get session token for authentication
    const sessionCookie = cookies().get('session');
    const authToken = sessionCookie?.value || '';
    
    // Fetch from real backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://uwind.onrender.com';
    const apiUrl = `${backendUrl}/api/crown-vault/assets/detailed?owner_id=${ownerId}`;
    
    const backendResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': ownerId,
        'Authorization': `Bearer ${authToken}`
      },
      cache: 'no-store'
    });

    if (!backendResponse.ok) {
      // Fallback to empty assets if backend fails
      return NextResponse.json({
        assets: [],
        total_count: 0,
        total_value: 0
      }, { status: 200 });
    }

    const backendAssets = await backendResponse.json();

    // Map asset types to match frontend expectations
    const mapAssetType = (type: string) => {
      const typeMap: Record<string, string> = {
        'real_estate': 'Real Estate',
        'collectible': 'Collectibles',
        'investment': 'Investments',
        'precious_metals': 'Precious Metals',
        'art': 'Art',
        'luxury_asset': 'Luxury Assets',
        'vehicle': 'Vehicles',
        'jewelry': 'Jewelry'
      };
      return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
    };

    // Transform backend data to match frontend expectations
    const transformedAssets = Array.isArray(backendAssets) ? backendAssets.map((asset: any) => ({
      asset_id: asset.asset_id,
      asset_data: {
        name: asset.asset_data?.name || 'Unnamed Asset',
        asset_type: mapAssetType(asset.asset_data?.asset_type || 'unknown'),
        value: asset.asset_data?.value || 0,
        currency: asset.asset_data?.currency || 'USD',
        location: asset.asset_data?.location || '',
        notes: asset.asset_data?.notes || ''
      },
      heir_ids: asset.heir_ids || [],
      heir_names: asset.heir_names || [],
      created_at: asset.created_at || new Date().toISOString()
    })) : [];

    const totalValue = transformedAssets.reduce((sum: number, asset: any) => {
      return sum + (asset.asset_data?.value || 0);
    }, 0);

    const response = NextResponse.json({
      assets: transformedAssets,
      total_count: transformedAssets.length,
      total_value: totalValue
    }, { status: 200 });

    return ApiAuth.addSecurityHeaders(response);

  } catch (error) {
    logger.error('Crown Vault assets fetch error', { 
      error: error instanceof Error ? error.message : String(error),
      userId: user.id
    });
    // Return empty assets on error to prevent UI breaking
    return ApiAuth.addSecurityHeaders(NextResponse.json({
      assets: [],
      total_count: 0,
      total_value: 0
    }, { status: 200 }));
  }
}, { 
  requireAuth: true, 
  rateLimit: 'standard',
  auditLog: true 
});

// Protected POST handler using authentication middleware  
export const POST = ApiAuth.withAuth(async (request: NextRequest, user) => {
  try {
    // Validate request size
    if (!ApiAuth.validateRequestSize(request)) {
      return NextResponse.json(
        { error: 'Request too large' },
        { status: 413 }
      );
    }

    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('owner_id');
    
    if (!ownerId) {
      return NextResponse.json(
        { error: 'Owner ID is required' },
        { status: 400 }
      );
    }

    // Validate ownership - users can only create assets for themselves
    if (!await ApiAuth.validateOwnership(user.id, ownerId)) {
      logger.warn("Asset creation denied - ownership validation failed", {
        userId: user.id,
        requestedOwnerId: ownerId
      });
      return NextResponse.json(
        { error: 'Access denied - insufficient permissions' },
        { status: 403 }
      );
    }

    const assetData = await request.json();
    
    // Validate asset data
    const validation = validateInput(assetSchema, assetData);
    if (!validation.success) {
      logger.warn("Asset POST validation failed", { 
        errors: validation.errors,
        userId: user.id
      });
      return NextResponse.json(
        { error: 'Invalid asset data', details: validation.errors },
        { status: 400 }
      );
    }
    
    // Create asset with validated data
    const validatedData = validation.data!;
    const newAsset: Asset = {
      asset_id: `asset_${Date.now()}`,
      asset_data: {
        name: validatedData.name,
        asset_type: validatedData.asset_type,
        value: validatedData.value,
        currency: validatedData.currency,
        location: validatedData.location || '',
        notes: validatedData.notes || ''
      },
      heir_ids: validatedData.heir_ids || [],
      heir_names: validatedData.heir_names || [],
      created_at: new Date().toISOString()
    };

    const response = NextResponse.json({
      success: true,
      asset: newAsset
    }, { status: 201 });

    return ApiAuth.addSecurityHeaders(response);

  } catch (error) {
    logger.error('Crown Vault asset creation error', { 
      error: error instanceof Error ? error.message : String(error),
      userId: user.id
    });
    return ApiAuth.addSecurityHeaders(NextResponse.json(
      { error: 'Failed to create asset' },
      { status: 500 }
    ));
  }
}, { 
  requireAuth: true, 
  rateLimit: 'strict',
  auditLog: true 
});