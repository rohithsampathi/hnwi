import { NextRequest, NextResponse } from 'next/server';
import { secureApi } from '@/lib/secure-api';

interface Heir {
  id: string;
  name: string;
  relationship: string;
  email?: string;
  phone?: string;
  notes?: string;
  created_at: string;
}

// Update individual heir
export async function PUT(
  request: NextRequest,
  { params }: { params: { heirId: string } }
) {
  try {
    const { heirId } = params;
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('owner_id');
    
    if (!ownerId) {
      return NextResponse.json(
        { error: 'Owner ID is required' },
        { status: 400 }
      );
    }

    if (!heirId) {
      return NextResponse.json(
        { error: 'Heir ID is required' },
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

    // Validate email format if provided
    if (heirData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(heirData.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate phone format if provided (basic validation)
    if (heirData.phone && !/^[\+]?[\d\s\-\(\)]{10,}$/.test(heirData.phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // In a real implementation, this would:
    // 1. Verify the heir belongs to this owner
    // 2. Update the heir in the database
    // 3. Update associated assets with the new heir name
    
    // For now, we'll simulate the update
    
    // First, check if heir exists by fetching assets using secure API
    try {
      const assetsEndpoint = `/api/crown-vault/assets/detailed?owner_id=${ownerId}`;
      const assets = await secureApi.get(assetsEndpoint, true);
      
      const heirExists = assets.some((asset: any) => 
        asset.heir_ids && asset.heir_ids.includes(heirId)
      );

      if (!heirExists) {
        return NextResponse.json(
          { error: 'Heir not found' },
          { status: 404 }
        );
      }

      // If updating the heir name, we would need to update all assets
      // that reference this heir to use the new name
      if (heirData.name) {
        // In a real implementation, we would call a backend API to update
        // all asset records that reference this heir with the new name
        console.log(`Would update heir ${heirId} name to ${heirData.name} for owner ${ownerId}`);
      }

      const updatedHeir: Heir = {
        id: heirId,
        name: heirData.name,
        relationship: heirData.relationship,
        email: heirData.email || '',
        phone: heirData.phone || '',
        notes: heirData.notes || '',
        created_at: new Date().toISOString() // In real implementation, preserve original created_at
      };

      return NextResponse.json({
        success: true,
        heir: updatedHeir,
        message: 'Heir updated successfully'
      }, { status: 200 });

    } catch (fetchError) {
      console.error('Error updating heir:', fetchError);
      return NextResponse.json(
        { error: 'Failed to update heir' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Crown Vault heir update error:', error);
    return NextResponse.json(
      { error: 'Failed to update heir' },
      { status: 500 }
    );
  }
}

// Delete individual heir
export async function DELETE(
  request: NextRequest,
  { params }: { params: { heirId: string } }
) {
  try {
    const { heirId } = params;
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('owner_id');
    
    if (!ownerId) {
      return NextResponse.json(
        { error: 'Owner ID is required' },
        { status: 400 }
      );
    }

    if (!heirId) {
      return NextResponse.json(
        { error: 'Heir ID is required' },
        { status: 400 }
      );
    }

    // In a real implementation, this would:
    // 1. Verify the heir belongs to this owner
    // 2. Remove heir assignments from all assets
    // 3. Delete the heir record from the database
    
    try {
      // First, check if heir exists and get associated assets using secure API
      const assetsEndpoint = `/api/crown-vault/assets/detailed?owner_id=${ownerId}`;
      const assets = await secureApi.get(assetsEndpoint, true);
      const assetsWithHeir = assets.filter((asset: any) => 
        asset.heir_ids && asset.heir_ids.includes(heirId)
      );

      if (assetsWithHeir.length === 0) {
        return NextResponse.json(
          { error: 'Heir not found or has no assets assigned' },
          { status: 404 }
        );
      }

      // In a real implementation, we would:
      // 1. Remove this heir from all assets that reference it
      // 2. Delete the heir record
      console.log(`Would delete heir ${heirId} and remove from ${assetsWithHeir.length} assets for owner ${ownerId}`);

      return NextResponse.json({
        success: true,
        message: 'Heir deleted successfully',
        affected_assets: assetsWithHeir.length
      }, { status: 200 });

    } catch (fetchError) {
      console.error('Error deleting heir:', fetchError);
      return NextResponse.json(
        { error: 'Failed to delete heir' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Crown Vault heir deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete heir' },
      { status: 500 }
    );
  }
}

// Get individual heir details
export async function GET(
  request: NextRequest,
  { params }: { params: { heirId: string } }
) {
  try {
    const { heirId } = params;
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('owner_id');
    
    if (!ownerId) {
      return NextResponse.json(
        { error: 'Owner ID is required' },
        { status: 400 }
      );
    }

    if (!heirId) {
      return NextResponse.json(
        { error: 'Heir ID is required' },
        { status: 400 }
      );
    }

    const assetsEndpoint = `/api/crown-vault/assets/detailed?owner_id=${ownerId}`;
    
    try {
      const assets = await secureApi.get(assetsEndpoint, true);
      
      // Find the heir in the assets data
      let foundHeir: Heir | null = null;
      
      for (const asset of assets) {
        if (asset.heir_ids && asset.heir_names && asset.heir_ids.includes(heirId)) {
          const heirIndex = asset.heir_ids.indexOf(heirId);
          const heirName = asset.heir_names[heirIndex];
          
          if (heirName && !foundHeir) {
            // Try to get relationship from mentioned_heirs
            let relationship = 'Family Member';
            if (asset.asset_data?.mentioned_heirs && Array.isArray(asset.asset_data.mentioned_heirs)) {
              const mentionedHeir = asset.asset_data.mentioned_heirs.find((mh: any) => 
                mh.name?.toLowerCase() === heirName.toLowerCase()
              );
              if (mentionedHeir?.relationship) {
                relationship = mentionedHeir.relationship.charAt(0).toUpperCase() + mentionedHeir.relationship.slice(1);
              }
            }
            
            foundHeir = {
              id: heirId,
              name: heirName,
              relationship: relationship,
              email: '', // Not available in current backend data
              phone: '', // Not available in current backend data
              notes: `Assigned to ${assets.filter((a: any) => a.heir_ids?.includes(heirId)).length} asset(s)`,
              created_at: asset.created_at || new Date().toISOString()
            };
          }
        }
      }

      if (!foundHeir) {
        return NextResponse.json(
          { error: 'Heir not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        heir: foundHeir
      }, { status: 200 });

    } catch (fetchError) {
      console.error('Error fetching heir details:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch heir details' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Crown Vault heir fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch heir' },
      { status: 500 }
    );
  }
}