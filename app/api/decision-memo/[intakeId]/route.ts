// app/api/decision-memo/[intakeId]/route.ts
// UNIFIED ENDPOINT - Returns complete decision memo data including MCP fields
// Replaces separate preview/artifact endpoints

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';
import { logger } from '@/lib/secure-logger';
import { safeError } from '@/lib/security/api-response';

export const maxDuration = 300; // 5 minutes

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
    logger.info('Unified endpoint fetch', { intakeId });

    // Call backend unified endpoint
    const backendUrl = `${API_BASE_URL}/api/decision-memo/${intakeId}`;
    logger.info('Calling backend unified endpoint', { intakeId });

    // Forward Authorization header from client to backend (report auth tokens)
    const authHeader = request.headers.get('Authorization');
    const backendHeaders: Record<string, string> = { 'Accept': 'application/json' };
    if (authHeader) {
      backendHeaders['Authorization'] = authHeader;
    }

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: backendHeaders,
      signal: AbortSignal.timeout(300000), // 5 minutes
    });

    // Pass through 401 directly so frontend can show auth popup
    if (response.status === 401) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Backend error in unified endpoint', { status: response.status });
      return NextResponse.json(
        { success: false, error: `Backend returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    logger.info('Backend unified response received', { intakeId, isUnlocked: data.is_unlocked });

    // Return the unified response directly
    // Backend now provides:
    // - mitigationTimeline: string (e.g., "14 days (multiple critical risks)")
    // - risk_assessment: { total_exposure_formatted, critical_items, high_priority, is_mcp }
    // - all_mistakes: array with cost_numeric field
    // - preview_data, memo_data, artifact (depending on unlock status)
    return NextResponse.json(data);

  } catch (error) {
    logger.error('Error fetching decision memo', { error: error instanceof Error ? error.message : String(error) });
    return safeError(error);
  }
}
