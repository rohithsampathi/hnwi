import { NextRequest, NextResponse } from 'next/server';
import {
  DecisionMemoBackendUnavailableError,
  DecisionMemoMissingError,
  fetchDecisionMemoSurfaceData,
} from '@/lib/decision-memo/fetch-decision-memo-surface-data';
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

type SurfaceRecord = Record<string, unknown>;

function asSurfaceRecord(value: unknown): SurfaceRecord {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as SurfaceRecord
    : {};
}

function compactResolvedSurfaceData<T extends SurfaceRecord>(data: T): T {
  const memoData = { ...asSurfaceRecord(data.memoData) };
  const backendData = { ...asSurfaceRecord(data.backendData) };

  const fullArtifact =
    data.fullArtifact ??
    memoData.full_artifact ??
    memoData.artifact ??
    memoData.fullArtifact ??
    backendData.full_artifact_v2 ??
    backendData.full_artifact ??
    backendData.fullArtifact ??
    backendData.artifact ??
    null;

  if (fullArtifact && !memoData.full_artifact) {
    memoData.full_artifact = fullArtifact;
  }

  delete memoData.artifact;
  delete memoData.formatted_output;
  delete memoData.formatted_output_v2;

  delete backendData.full_artifact;
  delete backendData.full_artifact_v2;
  delete backendData.fullArtifact;
  delete backendData.artifact;
  delete backendData.formatted_output;
  delete backendData.formatted_output_v2;

  return {
    ...data,
    memoData,
    backendData,
    fullArtifact: null,
  };
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

    return NextResponse.json(compactResolvedSurfaceData(resolvedSurfaceData), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    logger.error('Decision memo surface route failed', {
      intakeId,
      error: error instanceof Error ? error.message : String(error),
    });
    if (error instanceof DecisionMemoBackendUnavailableError) {
      return NextResponse.json(
        {
          success: false,
          error: 'decision_memo_service_unavailable',
          message: 'Decision memo service temporarily unavailable. The memo may exist, but the backend did not return it.',
          intakeId,
        },
        {
          status: 503,
          headers: { 'Cache-Control': 'no-store' },
        },
      );
    }
    if (error instanceof DecisionMemoMissingError) {
      return NextResponse.json(
        {
          success: false,
          error: 'decision_memo_not_found',
          message: error.message,
          intakeId,
        },
        {
          status: 404,
          headers: { 'Cache-Control': 'no-store' },
        },
      );
    }
    return safeError(error);
  }
}
