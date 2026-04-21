import { NextRequest, NextResponse } from 'next/server';
import { fetchDecisionMemoSurfaceData } from '@/lib/decision-memo/fetch-decision-memo-surface-data';
import { logger } from '@/lib/secure-logger';
import { safeError } from '@/lib/security/api-response';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 300;

interface RouteParams {
  params: Promise<{
    intakeId: string;
  }>;
}

export async function GET(
  request: NextRequest,
  context: RouteParams,
) {
  const { intakeId } = await context.params;

  try {
    const resolvedSurfaceData = await fetchDecisionMemoSurfaceData(
      intakeId,
      request.headers,
    );

    if (!resolvedSurfaceData) {
      return NextResponse.json(
        { error: 'Decision memo surface unavailable' },
        {
          status: 404,
          headers: { 'Cache-Control': 'no-store' },
        },
      );
    }

    return NextResponse.json(resolvedSurfaceData, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    logger.error('Decision memo surface route failed', {
      intakeId,
      error: error instanceof Error ? error.message : String(error),
    });
    return safeError(error);
  }
}
