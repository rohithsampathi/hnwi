import { NextRequest, NextResponse } from 'next/server';

interface Heir {
  id: string;
  name: string;
  relationship: string;
  email?: string;
  phone?: string;
  notes?: string;
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

    // Fetch assets from backend to extract heir information
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

      // Extract unique heirs from assets
      const heirsMap = new Map<string, Heir>();
      
      assets.forEach((asset: any) => {
        if (asset.heir_ids && asset.heir_names && Array.isArray(asset.heir_ids) && Array.isArray(asset.heir_names)) {
          asset.heir_ids.forEach((heirId: string, index: number) => {
            if (!heirsMap.has(heirId)) {
              const heirName = asset.heir_names[index] || 'Unknown Heir';
              
              // Try to get relationship from mentioned_heirs in asset_data
              let relationship = 'Family Member';
              if (asset.asset_data?.mentioned_heirs && Array.isArray(asset.asset_data.mentioned_heirs)) {
                const mentionedHeir = asset.asset_data.mentioned_heirs.find((mh: any) => 
                  mh.name?.toLowerCase() === heirName.toLowerCase()
                );
                if (mentionedHeir?.relationship) {
                  relationship = mentionedHeir.relationship.charAt(0).toUpperCase() + mentionedHeir.relationship.slice(1);
                }
              }
              
              heirsMap.set(heirId, {
                id: heirId,
                name: heirName,
                relationship: relationship,
                email: '', // Not available in backend data
                phone: '', // Not available in backend data
                notes: `Heir assigned to ${assets.filter((a: any) => a.heir_ids?.includes(heirId)).length} asset(s)`,
                created_at: asset.created_at || new Date().toISOString()
              });
            }
          });
        }
      });

      const heirs = Array.from(heirsMap.values());

      return NextResponse.json({
        heirs: heirs,
        total_count: heirs.length
      }, { status: 200 });

    } catch (fetchError) {
      console.error('Error fetching assets to extract heirs:', fetchError);
      
      // Return empty heirs if backend fails
      return NextResponse.json({
        heirs: [],
        total_count: 0
      }, { status: 200 });
    }

  } catch (error) {
    console.error('Crown Vault heirs fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch heirs' },
      { status: 500 }
    );
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

    const heirData = await request.json();
    
    if (!heirData.name || !heirData.relationship) {
      return NextResponse.json(
        { error: 'Name and relationship are required' },
        { status: 400 }
      );
    }

    // In a real implementation, this would validate and save to database
    const newHeir: Heir = {
      id: `heir_${Date.now()}`,
      name: heirData.name,
      relationship: heirData.relationship,
      email: heirData.email,
      phone: heirData.phone,
      notes: heirData.notes,
      created_at: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      heir: newHeir
    }, { status: 201 });

  } catch (error) {
    console.error('Crown Vault heir creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create heir' },
      { status: 500 }
    );
  }
}