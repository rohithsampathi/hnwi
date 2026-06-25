import { NextResponse } from 'next/server';
import {
  ReleaseReadinessPublicSnapshotError,
  fetchReleaseReadinessPublicSnapshot,
} from '@/lib/decision-memo/fetch-release-readiness-public-snapshot';
import { resolvePublicDecisionMemoId } from '@/lib/decision-memo/memo-id-aliases';

export const revalidate = 86400;
export const runtime = 'nodejs';
export const maxDuration = 30;

interface ReleaseReadinessShareRouteProps {
  params: Promise<{ intakeId: string }>;
}

function errorStatus(error: unknown): number {
  if (error instanceof ReleaseReadinessPublicSnapshotError) return error.status;
  return 500;
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Release readiness public snapshot is not available.';
}

export async function GET(_request: Request, { params }: ReleaseReadinessShareRouteProps) {
  const { intakeId } = await params;
  const reference = resolvePublicDecisionMemoId(intakeId);

  try {
    const payload = await fetchReleaseReadinessPublicSnapshot(reference);
    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
        'X-Kingdom-Surface-Contract': payload.surfaceContract,
        'X-Kingdom-Read-Model': payload.snapshotContract ?? 'release_readiness_public_snapshot',
        'X-Kingdom-Read-Source': payload.sourceMap?.source ?? 'release_readiness_public_snapshot',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        reference,
        error: errorMessage(error),
      },
      {
        status: errorStatus(error),
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  }
}
