// =============================================================================
// RELEASE READINESS PRINCIPAL SHARE SURFACE
// Route: /release-readiness/review/[intakeId]
// =============================================================================

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import PrincipalReleaseReadinessSharePage from "@/components/decision-memo/share/PrincipalReleaseReadinessSharePage";
import type { ReleaseReadinessSharePayload } from "@/lib/decision-memo/build-release-readiness-share-surface";
import { resolvePublicDecisionMemoId } from "@/lib/decision-memo/memo-id-aliases";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 300;

interface ReleaseReadinessReviewPageProps {
  params: Promise<{ intakeId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function buildQuery(searchParams: Record<string, string | string[] | undefined> | undefined): string {
  const params = new URLSearchParams();

  Object.entries(searchParams ?? {}).forEach(([key, value]) => {
    if (value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, entry));
      return;
    }
    params.set(key, value);
  });

  return params.toString();
}

async function fetchSharePayload(
  intakeId: string,
  requestHeaders: Headers,
): Promise<ReleaseReadinessSharePayload> {
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const response = await fetch(`${protocol}://${host}/api/release-readiness/share/${encodeURIComponent(intakeId)}`, {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(requestHeaders.get("cookie") ? { Cookie: requestHeaders.get("cookie") as string } : {}),
      ...(requestHeaders.get("authorization") ? { Authorization: requestHeaders.get("authorization") as string } : {}),
    },
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error ?? "Release readiness output is not available.");
  }

  return payload as ReleaseReadinessSharePayload;
}

export default async function ReleaseReadinessReviewPage({
  params,
  searchParams,
}: ReleaseReadinessReviewPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const query = buildQuery(resolvedSearchParams);
  const publicId = resolvePublicDecisionMemoId(resolvedParams.intakeId);

  if (publicId !== resolvedParams.intakeId) {
    redirect(`/release-readiness/review/${encodeURIComponent(publicId)}${query ? `?${query}` : ""}`);
  }

  let payload: ReleaseReadinessSharePayload | null = null;
  let initialSurfaceError: string | null = null;

  try {
    payload = await fetchSharePayload(resolvedParams.intakeId, await headers());
  } catch (error) {
    initialSurfaceError = error instanceof Error ? error.message : "Release readiness output is not available.";
  }

  return (
    <PrincipalReleaseReadinessSharePage
      reference={publicId}
      payload={payload}
      initialSurfaceError={initialSurfaceError}
    />
  );
}
