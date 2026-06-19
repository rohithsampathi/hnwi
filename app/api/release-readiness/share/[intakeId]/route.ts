import { NextRequest, NextResponse } from "next/server";
import {
  DecisionMemoBackendUnavailableError,
  DecisionMemoMissingError,
  fetchDecisionMemoSurfaceData,
} from "@/lib/decision-memo/fetch-decision-memo-surface-data";
import { buildReleaseReadinessSharePayload } from "@/lib/decision-memo/build-release-readiness-share-surface";
import { resolvePublicDecisionMemoId } from "@/lib/decision-memo/memo-id-aliases";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";
export const maxDuration = 300;

interface ReleaseReadinessShareRouteProps {
  params: Promise<{ intakeId: string }>;
}

function errorStatus(error: unknown): number {
  if (error instanceof DecisionMemoBackendUnavailableError) return 503;
  if (error instanceof DecisionMemoMissingError) return 404;
  return 500;
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Release readiness output is not available.";
}

export async function GET(request: NextRequest, { params }: ReleaseReadinessShareRouteProps) {
  const { intakeId } = await params;
  const publicId = resolvePublicDecisionMemoId(intakeId);

  try {
    const fullSurfaceData = await fetchDecisionMemoSurfaceData(intakeId, request.headers);
    const payload = buildReleaseReadinessSharePayload(publicId, fullSurfaceData);
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: errorMessage(error) },
      {
        status: errorStatus(error),
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  }
}
