import { NextRequest, NextResponse } from 'next/server';

interface AssetProcessingRequest {
  raw_text: string;
  context?: string;
}

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

interface ProcessingResponse {
  assets: Asset[];
  total_value: number;
  suggested_heirs: {
    name: string;
    relationship: string;
    confidence_score: number;
  }[];
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

    const body: AssetProcessingRequest = await request.json();
    
    if (!body.raw_text || body.raw_text.length < 50) {
      return NextResponse.json(
        { error: 'Input text must be at least 50 characters' },
        { status: 400 }
      );
    }

    // Simulate AI processing of the raw text
    // In a real implementation, this would involve:
    // 1. Natural language processing to extract asset information
    // 2. Value parsing and normalization
    // 3. Heir identification and matching
    // 4. Security encryption of sensitive data
    
    // Extract basic information from the input text for more realistic mock data
    const text = body.raw_text.toLowerCase();
    const hasVilla = text.includes('villa') || text.includes('house') || text.includes('property');
    const hasArt = text.includes('art') || text.includes('painting') || text.includes('collection');
    const hasJewelry = text.includes('jewelry') || text.includes('diamond') || text.includes('gold');
    const hasCar = text.includes('car') || text.includes('vehicle') || text.includes('bmw') || text.includes('mercedes');
    
    // Parse potential values
    const valueMatches = text.match(/\$?([\d,]+\.?\d*)\s*(m|million|k|thousand)?/gi) || [];
    let estimatedValue = 1500000; // Default
    
    if (valueMatches.length > 0) {
      const valueStr = valueMatches[0].replace(/[$,]/g, '');
      let num = parseFloat(valueStr);
      if (valueStr.includes('m') || valueStr.includes('million')) {
        num *= 1000000;
      } else if (valueStr.includes('k') || valueStr.includes('thousand')) {
        num *= 1000;
      }
      if (num > 0) estimatedValue = num;
    }

    // Helper function to resolve heir names from heir IDs
    const resolveHeirNames = (heirIds: string[]): string[] => {
      return heirIds.map(id => {
        switch (id) {
          case "heir_1": return "Priya Sharma";
          case "heir_2": return "Rahul Sharma";
          case "heir_3": return "Arjun Sharma";
          case "heir-1": return "Priya Sharma";
          case "heir-2": return "Rahul Sharma";
          case "heir-3": return "Arjun Sharma";
          default: {
            // Try to extract heir name from ID or return a fallback
            if (id.includes('heir')) {
              const heirNum = parseInt(id.replace(/[^0-9]/g, ''));
              const heirNames = ["Priya Sharma", "Rahul Sharma", "Arjun Sharma"];
              return heirNames[heirNum - 1] || "Family Member";
            }
            return "Family Member";
          }
        }
      });
    };

    // Generate realistic assets based on input
    const mockAssets: Asset[] = [];
    
    if (hasVilla) {
      const heirIds = ["heir_1"];
      mockAssets.push({
        asset_id: `asset_${Date.now()}_1`,
        asset_data: {
          name: text.includes('mumbai') ? "Mumbai Luxury Villa" : "Luxury Villa Estate",
          asset_type: "Real Estate",
          value: Math.max(estimatedValue, 2000000),
          currency: "USD",
          location: text.includes('mumbai') ? "Mumbai, India" : text.includes('london') ? "London, UK" : "Premium Location",
          notes: "Extracted from user input - luxury residential property"
        },
        heir_ids: heirIds,
        heir_names: resolveHeirNames(heirIds),
        created_at: new Date().toISOString()
      });
    }

    if (hasArt) {
      const heirIds = ["heir_1"];
      mockAssets.push({
        asset_id: `asset_${Date.now()}_2`,
        asset_data: {
          name: "Art Collection",
          asset_type: "Art",
          value: Math.min(estimatedValue * 0.6, 1200000),
          currency: "USD",
          location: "Private Gallery",
          notes: "Fine art collection as described"
        },
        heir_ids: heirIds,
        heir_names: resolveHeirNames(heirIds),
        created_at: new Date().toISOString()
      });
    }

    if (hasJewelry) {
      const heirIds = ["heir_2"];
      mockAssets.push({
        asset_id: `asset_${Date.now()}_3`,
        asset_data: {
          name: "Jewelry Collection",
          asset_type: "Jewelry",
          value: Math.min(estimatedValue * 0.4, 850000),
          currency: "USD",
          location: "Secure Bank Vault",
          notes: "Precious jewelry and gems collection"
        },
        heir_ids: heirIds,
        heir_names: resolveHeirNames(heirIds),
        created_at: new Date().toISOString()
      });
    }

    if (hasCar) {
      const heirIds = ["heir_1"];
      mockAssets.push({
        asset_id: `asset_${Date.now()}_4`,
        asset_data: {
          name: "Luxury Vehicle",
          asset_type: "Vehicles",
          value: Math.min(estimatedValue * 0.15, 250000),
          currency: "USD",
          location: "Private Garage",
          notes: "High-end luxury vehicle"
        },
        heir_ids: heirIds,
        heir_names: resolveHeirNames(heirIds),
        created_at: new Date().toISOString()
      });
    }

    // If no specific assets detected, create a general asset
    if (mockAssets.length === 0) {
      const heirIds = ["heir_1"];
      mockAssets.push({
        asset_id: `asset_${Date.now()}_1`,
        asset_data: {
          name: "Investment Asset",
          asset_type: "Investments",
          value: estimatedValue,
          currency: "USD",
          location: "Portfolio",
          notes: "Asset extracted from description"
        },
        heir_ids: heirIds,
        heir_names: resolveHeirNames(heirIds),
        created_at: new Date().toISOString()
      });
    }

    // Extract potential heir information from the text
    const suggestedHeirs = [
      {
        name: text.includes('priya') ? "Priya" : text.includes('daughter') ? "Daughter" : "Primary Heir",
        relationship: text.includes('daughter') ? "Daughter" : text.includes('son') ? "Son" : "Child",
        confidence_score: 0.85
      }
    ];

    const totalValue = mockAssets.reduce((sum, asset) => sum + asset.asset_data.value, 0);

    const response: ProcessingResponse = {
      assets: mockAssets,
      total_value: totalValue,
      suggested_heirs: suggestedHeirs
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Crown Vault batch processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process assets' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to process assets.' },
    { status: 405 }
  );
}