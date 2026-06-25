import {
  buildReleaseReadinessSharePayload,
  type ReleaseReadinessSharePayload,
} from '@/lib/decision-memo/build-release-readiness-share-surface';
import { fetchDecisionMemoSurfaceData } from '@/lib/decision-memo/fetch-decision-memo-surface-data';
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

type HeadersLike = Pick<Headers, 'get'>;

function errorText(value: BackendErrorPayload): string {
  const message = value.detail ?? value.error ?? value.degradedReason;
  return typeof message === 'string' && message.trim()
    ? message.trim()
    : 'Release readiness public snapshot is not available.';
}

function hasTableRows(value: unknown, minimumRows = 1): boolean {
  if (!value || typeof value !== 'object') return false;
  const rows = (value as { rows?: unknown }).rows;
  return Array.isArray(rows) && rows.length >= minimumRows;
}

function hasPrincipalDecisionPack(
  payload: Partial<ReleaseReadinessPublicSnapshotPayload>,
): boolean {
  const principalView = payload.principalView;
  if (!principalView || typeof principalView !== 'object') return false;

  return (
    hasTableRows(principalView.decisionMinute) &&
    hasTableRows(principalView.familyActionAnswer) &&
    hasTableRows(principalView.capitalTruth) &&
    hasTableRows(principalView.purposeBoundary) &&
    hasTableRows(principalView.releaseRule) &&
    hasTableRows(principalView.signedGateMap, 8) &&
    hasTableRows(principalView.whatChanged) &&
    hasTableRows(principalView.whatCaught) &&
    Array.isArray(principalView.routeAlternatives) &&
    principalView.routeAlternatives.length >= 5 &&
    Array.isArray(principalView.familyActionTests) &&
    principalView.familyActionTests.length >= 8 &&
    hasTableRows(principalView.sevenDayInstruction) &&
    hasTableRows(principalView.evidenceBoundary) &&
    hasTableRows(principalView.finalInstruction) &&
    Array.isArray(payload.privateEvidence) &&
    payload.privateEvidence.length >= 8 &&
    Array.isArray(payload.methodDrivers) &&
    payload.methodDrivers.length >= 8 &&
    Array.isArray(payload.reportSections) &&
    payload.reportSections.length >= 10
  );
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

  if (!hasPrincipalDecisionPack(payload)) {
    throw new ReleaseReadinessPublicSnapshotError(
      'Release readiness public snapshot is missing the principal decision pack.',
      503,
    );
  }
}

export async function fetchReleaseReadinessPublicSnapshot(
  intakeId: string,
): Promise<ReleaseReadinessPublicSnapshotPayload> {
  const publicIntakeId = resolvePublicDecisionMemoId(intakeId);
  const publicPathId = encodeDecisionMemoIdForPath(publicIntakeId);
  const response = await fetch(
    `${KINGDOM_CORE_PUBLIC_READ_URL}/api/decision-memo/release-readiness/public/${publicPathId}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
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

export async function buildNativeReleaseReadinessPublicPayload(
  intakeId: string,
  requestHeaders: HeadersLike = new Headers(),
): Promise<ReleaseReadinessPublicSnapshotPayload> {
  const publicIntakeId = resolvePublicDecisionMemoId(intakeId);
  const resolvedSurfaceData = await fetchDecisionMemoSurfaceData(publicIntakeId, requestHeaders);
  const payload = buildReleaseReadinessSharePayload(publicIntakeId, resolvedSurfaceData);

  return {
    ...payload,
    success: true,
    snapshotContract: RELEASE_READINESS_PUBLIC_SNAPSHOT_CONTRACT,
    intakeId: publicIntakeId,
    intakeType: 'release_readiness',
    generatedAt: new Date().toISOString(),
    publishedReadModel: false,
    payloadBytes: JSON.stringify(payload).length,
    cache: {
      cacheable: true,
      sMaxAgeSeconds: 300,
      staleWhileRevalidateSeconds: 3600,
    },
    sourceMap: {
      source: 'local_decision_memo_store',
      builder: 'release_readiness_native_share_payload',
      omits: [],
    },
  };
}
