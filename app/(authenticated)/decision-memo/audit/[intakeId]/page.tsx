// =============================================================================
// DECISION MEMO PUBLIC AUDIT SURFACE
// Route: /decision-memo/audit/[intakeId]
// =============================================================================

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import DecisionMemoAuditClientPage from '@/components/decision-memo/audit/DecisionMemoAuditClientPage';
import {
  DecisionMemoBackendUnavailableError,
  DecisionMemoMissingError,
  fetchDecisionMemoSurfaceData,
} from '@/lib/decision-memo/fetch-decision-memo-surface-data';
import { resolvePublicDecisionMemoId } from '@/lib/decision-memo/memo-id-aliases';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 300;

interface DecisionMemoAuditPageProps {
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

function readableSurfaceError(error: unknown): string {
  if (error instanceof DecisionMemoBackendUnavailableError) {
    return 'Decision memo service temporarily unavailable. The memo may exist, but the backend did not return it.';
  }

  if (error instanceof DecisionMemoMissingError) {
    return error.message;
  }

  return error instanceof Error ? error.message : 'Decision memo output is not available.';
}

export default async function DecisionMemoAuditPage({
  params,
  searchParams,
}: DecisionMemoAuditPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const query = buildQuery(resolvedSearchParams);
  const publicId = resolvePublicDecisionMemoId(resolvedParams.intakeId);

  if (publicId !== resolvedParams.intakeId) {
    redirect(`/decision-memo/audit/${encodeURIComponent(publicId)}${query ? `?${query}` : ''}`);
  }

  let initialSurfaceData = null;
  let initialSurfaceError: string | null = null;

  try {
    initialSurfaceData = await fetchDecisionMemoSurfaceData(
      resolvedParams.intakeId,
      await headers(),
    );
  } catch (error) {
    initialSurfaceError = readableSurfaceError(error);
  }

  return (
    <Suspense fallback={null}>
      <DecisionMemoAuditClientPage
        initialIntakeId={resolvedParams.intakeId}
        initialSearchParamsString={query}
        initialSurfaceData={initialSurfaceData}
        initialSurfaceError={initialSurfaceError}
      />
    </Suspense>
  );
}
