import type {
  ReleaseReadinessSharePayload,
  ReleaseReadinessSourceMap,
} from '@/lib/decision-memo/build-release-readiness-share-surface';
import {
  encodeDecisionMemoIdForPath,
  resolvePublicDecisionMemoId,
} from '@/lib/decision-memo/memo-id-aliases';

export const RELEASE_READINESS_PUBLIC_SNAPSHOT_CONTRACT =
  'hnwi_release_readiness_public_snapshot_v1';

const KINGDOM_CORE_PUBLIC_READ_URL =
  process.env.KINGDOM_CORE_BASE_URL?.trim().replace(/\/$/, '') ||
  'https://kingdom-core.montaigne.co';

const RELEASE_READINESS_SOURCE_EVIDENCE_CONTRACT =
  'granthika_release_readiness_source_evidence_aquarium_v1';

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
  sourceMap?: ReleaseReadinessSourceMap & {
    source?: string;
    builder?: string;
    omits?: string[];
  };
  productAquariumPacket?: {
    contract?: string;
    authority?: string;
    storageRail?: string;
    graphEdgeShape?: string;
    counts?: Record<string, number>;
    outcomeAtoms?: string[];
    readback?: {
      status?: string;
      dueStates?: string[];
    };
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

  const routeIntelligence = payload.routeIntelligenceV2;
  if (
    !routeIntelligence ||
    !Array.isArray(routeIntelligence.routeOptions) ||
    routeIntelligence.routeOptions.length === 0
  ) {
    throw new ReleaseReadinessPublicSnapshotError('Release readiness public snapshot is missing route intelligence.');
  }
}

function assertCompletedMemoPayload(payload: ReleaseReadinessPublicSnapshotPayload): void {
  if (!Array.isArray(payload.publicSources) || payload.publicSources.length === 0) {
    throw new ReleaseReadinessPublicSnapshotError('Release readiness public snapshot has no public source rows.', 503);
  }

  if (!Array.isArray(payload.privateEvidence) || payload.privateEvidence.length < 8) {
    throw new ReleaseReadinessPublicSnapshotError('Release readiness public snapshot is missing private evidence classes.', 503);
  }

  if (!Array.isArray(payload.methodDrivers) || payload.methodDrivers.length === 0) {
    throw new ReleaseReadinessPublicSnapshotError('Release readiness public snapshot is missing route judgment drivers.', 503);
  }

  if (!Array.isArray(payload.citations) || payload.citations.length === 0) {
    throw new ReleaseReadinessPublicSnapshotError('Release readiness public snapshot is missing central citation rows.', 503);
  }

  if (!Array.isArray(payload.evidenceSections) || payload.evidenceSections.length === 0) {
    throw new ReleaseReadinessPublicSnapshotError('Release readiness public snapshot is missing evidence methodology sections.', 503);
  }

  const sourceMap = payload.sourceMap;
  if (
    !sourceMap ||
    sourceMap.readback?.status !== 'central_source_read_model_ready' ||
    (sourceMap.readback?.dueStates?.length ?? 0) > 0 ||
    (sourceMap.centralSourceBriefs?.missingSourceBriefRows ?? 1) > 0 ||
    sourceMap.evidenceRows.privateEvidenceClasses !== payload.privateEvidence.length
  ) {
    throw new ReleaseReadinessPublicSnapshotError('Release readiness public source map is not clean.', 503);
  }

  const aquarium = payload.productAquariumPacket;
  if (
    !aquarium ||
    aquarium.contract !== RELEASE_READINESS_SOURCE_EVIDENCE_CONTRACT ||
    aquarium.readback?.status !== 'accepted' ||
    (aquarium.readback?.dueStates?.length ?? 0) > 0
  ) {
    throw new ReleaseReadinessPublicSnapshotError('Release readiness Product Aquarium packet is not accepted.', 503);
  }

  const routes = payload.routeIntelligenceV2.routeOptions;
  if (!Array.isArray(routes) || routes.length < 5) {
    throw new ReleaseReadinessPublicSnapshotError('Release readiness public snapshot is missing the five route options.', 503);
  }

  const requiredRouteFields = [
    'evidenceGates',
    'responsibilityTransfer',
    'recordMismatchMap',
    'counselQuestionPack',
    'stressSignals',
    'antiFragility',
    'crisisResilience',
    'g1g2g3',
    'sourceBoundary',
  ];
  const incompleteRoute = routes.find((route) => {
    const record = route as unknown as Record<string, unknown>;
    const metrics = (record.metrics && typeof record.metrics === 'object' ? record.metrics : {}) as Record<string, unknown>;
    const acquisitionRoute = metrics.routeHasAcquisition !== false;
    return requiredRouteFields.some((field) => {
      const value = record[field];
      if (Array.isArray(value)) return value.length === 0;
      if (value && typeof value === 'object') return Object.keys(value).length === 0;
      return !value;
    }) || (acquisitionRoute && (!Array.isArray(record.scenarios) || record.scenarios.length === 0));
  });

  if (incompleteRoute) {
    throw new ReleaseReadinessPublicSnapshotError(
      `Release readiness route intelligence is incomplete for ${incompleteRoute.routeName || incompleteRoute.id}.`,
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
  const snapshot = {
    ...payload,
    reference: publicIntakeId,
  };
  assertCompletedMemoPayload(snapshot);
  return snapshot;
}
