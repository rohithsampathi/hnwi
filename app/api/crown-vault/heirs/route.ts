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

    // Call backend heirs endpoint directly (backend expects trailing slash)
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://uwind.onrender.com';
    const heirsUrl = `${backendUrl}/api/crown-vault/heirs/?owner_id=${ownerId}`;
    
    try {
      const response = await fetch(heirsUrl, {
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

      const backendHeirs = await response.json();
      
      // Backend returns direct array, not wrapped in {heirs: [...]}
      if (!Array.isArray(backendHeirs)) {
        console.error('Invalid heirs data format - expected array, got:', typeof backendHeirs);
        throw new Error('Invalid heirs data format');
      }

      // Transform backend data to frontend format (heir_id -> id)
      const heirs = backendHeirs.map((heir: any) => ({
        id: heir.heir_id || heir.id, // Transform heir_id to id
        name: heir.name,
        relationship: heir.relationship,
        email: heir.email || '',
        phone: heir.phone || '',
        notes: heir.notes || '',
        created_at: heir.created_at || new Date().toISOString()
      }));


      return NextResponse.json({
        heirs: heirs,
        total_count: heirs.length
      }, { status: 200 });

    } catch (fetchError) {
      console.error('Error fetching heirs from backend:', fetchError);
      
      // Try to fetch heirs from assets endpoint as fallback
      try {
        const assetsUrl = `${backendUrl}/api/crown-vault/assets/detailed?owner_id=${ownerId}`;
        if (process.env.NODE_ENV === 'development') {
          console.log('Attempting to fetch heirs from assets endpoint: /api/crown-vault/assets/detailed');
        }
        
        const assetsResponse = await fetch(assetsUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-User-ID': ownerId
          },
          cache: 'no-store'
        });

        if (assetsResponse.ok) {
          const assets = await assetsResponse.json();
          
          if (Array.isArray(assets)) {
            // Extract unique heirs from assets
            const heirsMap = new Map();
            
            assets.forEach((asset: any) => {
              if (asset.heir_ids && asset.heir_names) {
                asset.heir_ids.forEach((heirId: string, index: number) => {
                  if (heirId && asset.heir_names[index] && !heirsMap.has(heirId)) {
                    heirsMap.set(heirId, {
                      id: heirId,
                      name: asset.heir_names[index],
                      relationship: 'Family Member', // Default relationship
                      email: '',
                      phone: '',
                      notes: '',
                      created_at: new Date().toISOString()
                    });
                  }
                });
              }
            });
            
            const extractedHeirs = Array.from(heirsMap.values());
            console.log('Extracted heirs from assets:', extractedHeirs);
            
            return NextResponse.json({
              heirs: extractedHeirs,
              total_count: extractedHeirs.length
            }, { status: 200 });
          }
        }
      } catch (assetsError) {
        console.error('Error fetching heirs from assets:', assetsError);
      }
      
      // Return empty heirs if all fails
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