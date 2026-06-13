import { API_BASE_URL } from '@/config/api';
import { resolveCastleBriefCount } from '@/lib/castle-briefs/resolve-castle-brief-count';
import { logger } from '@/lib/secure-logger';
import { resolveDecisionMemoSurfaceData } from '@/lib/decision-memo/resolve-decision-memo-surface-data';
import {
  encodeDecisionMemoIdForPath,
  resolveCanonicalDecisionMemoId,
  resolvePublicDecisionMemoId,
} from '@/lib/decision-memo/memo-id-aliases';

type HeadersLike = Pick<Headers, 'get'>;
type BackendHeaders = Record<string, string>;

export class DecisionMemoBackendUnavailableError extends Error {
  status = 503;

  constructor(message = 'Decision memo service temporarily unavailable.') {
    super(message);
    this.name = 'DecisionMemoBackendUnavailableError';
  }
}

export class DecisionMemoMissingError extends Error {
  status = 404;

  constructor(message = 'Decision memo output is not available.') {
    super(message);
    this.name = 'DecisionMemoMissingError';
  }
}

async function fetchCastleBriefsCount(
  backendHeaders: BackendHeaders,
): Promise<number | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/castle-briefs/public/counts`, {
      method: 'GET',
      headers: backendHeaders,
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return null;
    }

    return resolveCastleBriefCount(await response.json());
  } catch {
    return null;
  }
}

export async function fetchDecisionMemoSurfaceData(
  intakeId: string,
  requestHeaders: HeadersLike,
) {
  const canonicalIntakeId = resolveCanonicalDecisionMemoId(intakeId);
  const publicIntakeId = resolvePublicDecisionMemoId(intakeId);
  const canonicalPathId = encodeDecisionMemoIdForPath(canonicalIntakeId);
  const authHeader =
    requestHeaders.get('authorization') ??
    requestHeaders.get('Authorization');
  const cookieHeader = requestHeaders.get('cookie');
  const backendHeaders: BackendHeaders = {
    Accept: 'application/json',
  };

  if (authHeader) {
    backendHeaders.Authorization = authHeader;
  }

  if (cookieHeader) {
    backendHeaders.Cookie = cookieHeader;
  }

  const endpoints = [
    `${API_BASE_URL}/api/decision-memo/${canonicalPathId}`,
    `${API_BASE_URL}/api/decision-memo/preview/${canonicalPathId}`,
    `${API_BASE_URL}/api/decision-memo/sfo-audit/${canonicalPathId}/full`,
  ];
  let lastError: string | null = null;
  let sawBackendOutage = false;
  let sawMissingMemo = false;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: backendHeaders,
        cache: 'no-store',
        signal: AbortSignal.timeout(300000),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        lastError = `status ${response.status}`;
        if (response.status >= 500) {
          sawBackendOutage = true;
        } else if (response.status === 404) {
          sawMissingMemo = true;
        }
        logger.warn('Decision memo surface endpoint returned non-OK status', {
          intakeId,
          endpoint,
          status: response.status,
          errorText: errorText.slice(0, 300),
        });
        continue;
      }

      const backendData = await response.json();
      const resolvedSurfaceData = resolveDecisionMemoSurfaceData({
        intakeId: publicIntakeId,
        backendData,
        fullArtifact:
          backendData?.full_artifact ??
          backendData?.fullArtifact ??
          backendData?.memoData?.full_artifact ??
          backendData?.memoData?.artifact ??
          backendData?.artifact ??
          null,
      });

      if (resolvedSurfaceData) {
        const publicSurfaceData = {
          ...resolvedSurfaceData,
          memoData: {
            ...resolvedSurfaceData.memoData,
            intake_id: publicIntakeId,
          },
          backendData: {
            ...resolvedSurfaceData.backendData,
            canonicalIntakeId,
            publicIntakeId,
          },
        };

        if (resolvedSurfaceData.developmentsCount !== null) {
          return publicSurfaceData;
        }

        const castleBriefsCount = await fetchCastleBriefsCount(backendHeaders);

        if (castleBriefsCount === null) {
          return publicSurfaceData;
        }

        return {
          ...publicSurfaceData,
          developmentsCount: castleBriefsCount,
          backendData: {
            ...publicSurfaceData.backendData,
            resolvedDevelopmentsCount: castleBriefsCount,
            castleBriefsCount,
          },
        };
      }

      logger.warn('Decision memo surface endpoint returned unresolved payload', {
        intakeId,
        endpoint,
      });
      lastError = 'unresolved payload';
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      sawBackendOutage = true;
      logger.warn('Decision memo surface endpoint fetch failed', {
        intakeId,
        endpoint,
        error: lastError,
      });
    }
  }

  if (sawBackendOutage) {
    throw new DecisionMemoBackendUnavailableError(
      `Decision memo service temporarily unavailable: ${lastError ?? 'no valid endpoints'}`,
    );
  }

  if (sawMissingMemo) {
    throw new DecisionMemoMissingError(
      `Decision memo output is not available for ${publicIntakeId}.`,
    );
  }

  throw new DecisionMemoMissingError(`Decision memo fetch failed: ${lastError ?? 'no valid endpoints'}`);
}
