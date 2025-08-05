import { NextRequest, NextResponse } from 'next/server';

interface HeirAssignmentRequest {
  heir_ids: string[];
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { asset_id: string } }
) {
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

    // In a real implementation, this would:
    // 1. Validate that the asset exists and belongs to the user
    // 2. Validate that all heir_ids exist and belong to the user
    // 3. Update the asset's heir assignments in the database
    // 4. Log the activity for audit trail
    // 5. Send notifications if required

    // Mock heir name lookup with more comprehensive mapping
    const heirNames = body.heir_ids.map(id => {
      switch (id) {
        case "heir_1": return "Priya Sharma";
        case "heir_2": return "Rahul Sharma";
        case "heir_3": return "Arjun Sharma";
        case "heir-1": return "Priya Sharma";
        case "heir-2": return "Rahul Sharma";
        case "heir-3": return "Arjun Sharma";
        // Handle dynamic heir IDs
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

    // Simulate database update delay
    await new Promise(resolve => setTimeout(resolve, 800));

    return NextResponse.json({
      success: true,
      asset_id: assetId,
      heir_ids: body.heir_ids,
      heir_names: heirNames,
      updated_at: new Date().toISOString(),
      message: `Asset reassigned to ${heirNames.join(", ")}`
    }, { status: 200 });

  } catch (error) {
    console.error('Crown Vault heir assignment error:', error);
    return NextResponse.json(
      { error: 'Failed to update heir assignment' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { asset_id: string } }
) {
  try {
    const assetId = params.asset_id;
    
    if (!assetId) {
      return NextResponse.json(
        { error: 'Asset ID is required' },
        { status: 400 }
      );
    }

    // In a real implementation, this would fetch current heir assignments from database
    // For now, return mock data
    const mockAssignment = {
      asset_id: assetId,
      heir_ids: ["heir_1"],
      heir_names: ["Priya Sharma"],
      last_updated: "2024-01-15T10:30:00Z"
    };

    return NextResponse.json(mockAssignment, { status: 200 });

  } catch (error) {
    console.error('Crown Vault heir assignment fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch heir assignment' },
      { status: 500 }
    );
  }
}