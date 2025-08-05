import { NextRequest, NextResponse } from 'next/server';

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('owner_id');
    
    if (!ownerId) {
      return NextResponse.json(
        { error: 'Owner ID is required' },
        { status: 400 }
      );
    }

    // Fetch from real backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://uwind.onrender.com';
    const apiUrl = `${backendUrl}/api/crown-vault/assets/detailed?owner_id=${ownerId}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': ownerId
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      // Fallback to empty assets if backend fails
      return NextResponse.json({
        assets: [],
        total_count: 0,
        total_value: 0
      }, { status: 200 });
    }

    const backendAssets = await response.json();

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

    return NextResponse.json({
      assets: transformedAssets,
      total_count: transformedAssets.length,
      total_value: totalValue
    }, { status: 200 });

  } catch (error) {
    console.error('Crown Vault assets fetch error:', error);
    // Return empty assets on error to prevent UI breaking
    return NextResponse.json({
      assets: [],
      total_count: 0,
      total_value: 0
    }, { status: 200 });
  }
}

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

    const assetData = await request.json();
    
    // In a real implementation, this would validate and save to database
    const newAsset: Asset = {
      asset_id: `asset_${Date.now()}`,
      asset_data: {
        name: assetData.name || "Unnamed Asset",
        asset_type: assetData.asset_type || "Other",
        value: assetData.value || 0,
        currency: assetData.currency || "USD",
        location: assetData.location,
        notes: assetData.notes
      },
      heir_ids: assetData.heir_ids || [],
      heir_names: assetData.heir_names || [],
      created_at: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      asset: newAsset
    }, { status: 201 });

  } catch (error) {
    console.error('Crown Vault asset creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create asset' },
      { status: 500 }
    );
  }
}