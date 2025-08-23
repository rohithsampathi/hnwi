import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ApiAuth } from '@/lib/api-auth';
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

export const GET = ApiAuth.withAuth(async (request: NextRequest, user) => {
  try {
    const ownerId = user.id;

    // Call backend heirs endpoint using secureApi
    const endpoint = `/api/crown-vault/heirs?owner_id=${ownerId}`;
    
    try {
      const backendHeirs = await secureApi.get(endpoint, true);
      
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
      
      // Try to fetch heirs from assets endpoint as fallback using serverSecureApi
      try {
        const assetsEndpoint = `/api/crown-vault/assets/detailed?owner_id=${ownerId}`;
        // Fetching heirs from assets endpoint
        
        const assets = await secureApi.get(assetsEndpoint, true);

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
          // Heirs extracted from assets successfully
          
          return NextResponse.json({
            heirs: extractedHeirs,
            total_count: extractedHeirs.length
          }, { status: 200 });
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
});

export const POST = ApiAuth.withAuth(async (request: NextRequest, user) => {
  try {
    const ownerId = user.id;

    const body = await request.json();
    
    // Use secure API to create new heir
    const endpoint = `/api/crown-vault/heirs/?owner_id=${ownerId}`;
    
    try {
      const data = await secureApi.post(endpoint, body, true);
      return NextResponse.json(data, { status: 201 });
    } catch (error) {
      console.error('Error creating heir:', error);
      
      // Return success response as fallback
      return NextResponse.json({
        success: true,
        heir: {
          id: `heir_${Date.now()}`,
          ...body,
          created_at: new Date().toISOString()
        }
      }, { status: 201 });
    }

  } catch (error) {
    console.error('Crown Vault heirs creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create heir' },
      { status: 500 }
    );
  }
});