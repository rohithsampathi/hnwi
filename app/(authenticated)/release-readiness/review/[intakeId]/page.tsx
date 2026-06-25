// =============================================================================
// RELEASE READINESS PUBLIC SHARE SURFACE
// Route: /release-readiness/review/[intakeId]
//
// This first-paint route must consume the compact backend public read model.
// Keep full audit/memo objects behind internal audit and print surfaces.
// =============================================================================

import PrincipalReleaseReadinessSharePage from '@/components/decision-memo/share/PrincipalReleaseReadinessSharePage';
import {
  ReleaseReadinessPublicSnapshotError,
  fetchReleaseReadinessPublicSnapshot,
} from '@/lib/decision-memo/fetch-release-readiness-public-snapshot';
import { resolvePublicDecisionMemoId } from '@/lib/decision-memo/memo-id-aliases';

interface ReleaseReadinessReviewPageProps {
  params: Promise<{
    intakeId: string;
  }>;
}

export const revalidate = 86400;
export const runtime = 'nodejs';
export const maxDuration = 30;

function publicSnapshotErrorMessage(error: unknown): string {
  if (error instanceof ReleaseReadinessPublicSnapshotError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Release readiness public snapshot is not available.';
}

export default async function ReleaseReadinessReviewPage({
  params,
}: ReleaseReadinessReviewPageProps) {
  const { intakeId } = await params;
  const reference = resolvePublicDecisionMemoId(intakeId);

  try {
    const payload = await fetchReleaseReadinessPublicSnapshot(reference);
    return (
      <PrincipalReleaseReadinessSharePage
        reference={reference}
        payload={payload}
        initialSurfaceError={null}
      />
    );
  } catch (error) {
    return (
      <PrincipalReleaseReadinessSharePage
        reference={reference}
        payload={null}
        initialSurfaceError={publicSnapshotErrorMessage(error)}
      />
    );
  }
}
