// app/api/decision-memo/[intakeId]/route.ts
// UNIFIED ENDPOINT - Returns complete decision memo data including MCP fields
// Replaces separate preview/artifact endpoints

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';

interface RouteParams {
  params: {
    intakeId: string;
  };
}

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  const { intakeId } = await Promise.resolve(context.params);

  try {
    console.log('📊 Unified endpoint fetch for:', intakeId);

    // Call backend unified endpoint
    const backendUrl = `${API_BASE_URL}/api/decision-memo/${intakeId}`;
    console.log('🔗 Calling backend:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend error:', response.status, errorText);
      return NextResponse.json(
        { success: false, error: `Backend returned ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Backend unified response received:', {
      intake_id: data.intake_id,
      is_unlocked: data.is_unlocked,
      has_mitigationTimeline: !!data.mitigationTimeline,
      has_risk_assessment: !!data.risk_assessment,
      has_all_mistakes: !!data.all_mistakes
    });

    // Return the unified response directly
    // Backend now provides:
    // - mitigationTimeline: string (e.g., "14 days (multiple critical risks)")
    // - risk_assessment: { total_exposure_formatted, critical_items, high_priority, is_mcp }
    // - all_mistakes: array with cost_numeric field
    // - preview_data, memo_data, artifact (depending on unlock status)
    return NextResponse.json(data);

  } catch (error) {
    console.error('💥 Error fetching decision memo:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch decision memo',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
