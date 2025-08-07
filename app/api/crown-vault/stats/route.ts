import { NextRequest, NextResponse } from 'next/server';

interface VaultStats {
  total_assets: number;
  total_value: number;
  total_heirs: number;
  last_updated: string;
  asset_breakdown: {
    [key: string]: {
      count: number;
      total_value: number;
    };
  };
  recent_activity: {
    action: string;
    asset_name?: string;
    timestamp: string;
    details: string;
  }[];
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

    // Fetch assets from real backend to calculate stats
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://uwind.onrender.com';
    const assetsUrl = `${backendUrl}/api/crown-vault/assets/detailed?owner_id=${ownerId}`;
    
    try {
      const response = await fetch(assetsUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': ownerId
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }

      const assets = await response.json();
      
      if (!Array.isArray(assets)) {
        throw new Error('Invalid assets data format');
      }

      // Calculate stats from real assets data
      const totalAssets = assets.length;
      const totalValue = assets.reduce((sum: number, asset: any) => {
        return sum + (asset.asset_data?.value || 0);
      }, 0);

      // Get unique heirs count
      const uniqueHeirIds = new Set();
      assets.forEach((asset: any) => {
        if (asset.heir_ids && Array.isArray(asset.heir_ids)) {
          asset.heir_ids.forEach((heirId: string) => uniqueHeirIds.add(heirId));
        }
      });

      // Calculate asset breakdown by type
      const assetBreakdown: Record<string, { count: number; total_value: number }> = {};
      assets.forEach((asset: any) => {
        const assetType = asset.asset_data?.asset_type || 'Unknown';
        const value = asset.asset_data?.value || 0;
        
        if (!assetBreakdown[assetType]) {
          assetBreakdown[assetType] = { count: 0, total_value: 0 };
        }
        assetBreakdown[assetType].count += 1;
        assetBreakdown[assetType].total_value += value;
      });

      // Generate recent activity from assets (most recent first)
      const recentActivity = assets
        .sort((a: any, b: any) => {
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          return dateB - dateA; // Newest first
        })
        .slice(0, 5) // Take only 5 most recent
        .map((asset: any) => ({
          action: "asset_added",
          asset_name: asset.asset_data?.name || 'Unnamed Asset',
          timestamp: asset.created_at || new Date().toISOString(),
          details: `Added ${asset.asset_data?.name || 'asset'} worth $${(asset.asset_data?.value || 0).toLocaleString()}`
        }));

      const stats: VaultStats = {
        total_assets: totalAssets,
        total_value: totalValue,
        total_heirs: uniqueHeirIds.size,
        last_updated: new Date().toISOString(),
        asset_breakdown: assetBreakdown,
        recent_activity: recentActivity
      };

      console.log('Crown Vault stats generated:', {
        total_assets: totalAssets,
        total_heirs: uniqueHeirIds.size,
        recent_activity_count: recentActivity.length,
        first_activity: recentActivity[0] || 'None'
      });

      return NextResponse.json(stats, { status: 200 });

    } catch (fetchError) {
      console.error('Error fetching assets for stats:', fetchError);
      
      // Return default empty stats if backend fails
      const fallbackStats: VaultStats = {
        total_assets: 0,
        total_value: 0,
        total_heirs: 0,
        last_updated: new Date().toISOString(),
        asset_breakdown: {},
        recent_activity: []
      };

      return NextResponse.json(fallbackStats, { status: 200 });
    }

  } catch (error) {
    console.error('Crown Vault stats fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vault statistics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to fetch statistics.' },
    { status: 405 }
  );
}