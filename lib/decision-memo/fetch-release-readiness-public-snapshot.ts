import type { ReleaseReadinessSharePayload } from '@/lib/decision-memo/build-release-readiness-share-surface';
import {
  encodeDecisionMemoIdForPath,
  resolvePublicDecisionMemoId,
} from '@/lib/decision-memo/memo-id-aliases';

export const RELEASE_READINESS_PUBLIC_SNAPSHOT_CONTRACT =
  'hnwi_release_readiness_public_snapshot_v1';

const KINGDOM_CORE_PUBLIC_READ_URL =
  process.env.KINGDOM_CORE_BASE_URL?.trim().replace(/\/$/, '') ||
  'https://kingdom-core.montaigne.co';

export class ReleaseReadinessPublicSnapshotError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = 'ReleaseReadinessPublicSnapshotError';
    this.status = status;
  }
}

export type ReleaseReadinessPublicSnapshotPayload = ReleaseReadinessSharePayload & {
  success?: boolean;
  snapshotContract?: typeof RELEASE_READINESS_PUBLIC_SNAPSHOT_CONTRACT;
  intakeId?: string;
  intakeType?: string;
  generatedAt?: string;
  publishedReadModel?: boolean;
  payloadBytes?: number;
  cache?: {
    cacheable?: boolean;
    sMaxAgeSeconds?: number;
    staleWhileRevalidateSeconds?: number;
  };
  sourceMap?: {
    source?: string;
    builder?: string;
    omits?: string[];
  };
  degradedReason?: unknown;
};

type BackendErrorPayload = {
  detail?: unknown;
  error?: unknown;
  degradedReason?: unknown;
};

function errorText(value: BackendErrorPayload): string {
  const message = value.detail ?? value.error ?? value.degradedReason;
  return typeof message === 'string' && message.trim()
    ? message.trim()
    : 'Release readiness public snapshot is not available.';
}

function assertPublicSnapshotPayload(
  value: unknown,
): asserts value is ReleaseReadinessPublicSnapshotPayload {
  if (!value || typeof value !== 'object') {
    throw new ReleaseReadinessPublicSnapshotError('Release readiness public snapshot payload was empty.');
  }

  const payload = value as Partial<ReleaseReadinessPublicSnapshotPayload>;
  if (payload.success === false) {
    throw new ReleaseReadinessPublicSnapshotError(
      typeof payload.degradedReason === 'string'
        ? payload.degradedReason
        : 'Release readiness public snapshot is not ready.',
      503,
    );
  }

  if (payload.snapshotContract !== RELEASE_READINESS_PUBLIC_SNAPSHOT_CONTRACT) {
    throw new ReleaseReadinessPublicSnapshotError('Release readiness public snapshot contract mismatch.');
  }

  if (!payload.reference || !payload.selectedRoute || !Array.isArray(payload.routeOptions)) {
    throw new ReleaseReadinessPublicSnapshotError('Release readiness public snapshot is missing required fields.');
  }
}

export async function fetchReleaseReadinessPublicSnapshot(
  intakeId: string,
): Promise<ReleaseReadinessPublicSnapshotPayload> {
  const publicIntakeId = resolvePublicDecisionMemoId(intakeId);
  const publicPathId = encodeDecisionMemoIdForPath(publicIntakeId);
  const backendUrl = new URL(
    `/api/decision-memo/release-readiness/public/${publicPathId}`,
    KINGDOM_CORE_PUBLIC_READ_URL,
  );
  backendUrl.searchParams.set('contract', RELEASE_READINESS_PUBLIC_SNAPSHOT_CONTRACT);

  const response = await fetch(
    backendUrl.toString(),
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      next: {
        revalidate: 86400,
      },
      signal: AbortSignal.timeout(15000),
    },
  );

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ReleaseReadinessPublicSnapshotError(
      errorText((payload ?? {}) as BackendErrorPayload),
      response.status,
    );
  }

  assertPublicSnapshotPayload(payload);
  return {
    ...payload,
    reference: publicIntakeId,
  };
}
