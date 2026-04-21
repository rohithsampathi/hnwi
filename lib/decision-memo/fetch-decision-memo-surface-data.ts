import { API_BASE_URL } from '@/config/api';
import { resolveCastleBriefCount } from '@/lib/castle-briefs/resolve-castle-brief-count';
import { logger } from '@/lib/secure-logger';
import { resolveDecisionMemoSurfaceData } from '@/lib/decision-memo/resolve-decision-memo-surface-data';

type HeadersLike = Pick<Headers, 'get'>;
type BackendHeaders = Record<string, string>;

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
    `${API_BASE_URL}/api/decision-memo/${intakeId}`,
    `${API_BASE_URL}/api/decision-memo/preview/${intakeId}`,
    `${API_BASE_URL}/api/decision-memo/sfo-audit/${intakeId}/full`,
  ];
  let lastError: string | null = null;

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
        intakeId,
        backendData,
        fullArtifact:
          backendData?.full_artifact ??
          backendData?.fullArtifact ??
          backendData?.artifact ??
          null,
      });

      if (resolvedSurfaceData) {
        if (resolvedSurfaceData.developmentsCount !== null) {
          return resolvedSurfaceData;
        }

        const castleBriefsCount = await fetchCastleBriefsCount(backendHeaders);

        if (castleBriefsCount === null) {
          return resolvedSurfaceData;
        }

        return {
          ...resolvedSurfaceData,
          developmentsCount: castleBriefsCount,
          backendData: {
            ...resolvedSurfaceData.backendData,
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
      logger.warn('Decision memo surface endpoint fetch failed', {
        intakeId,
        endpoint,
        error: lastError,
      });
    }
  }

  throw new Error(`Decision memo fetch failed: ${lastError ?? 'no valid endpoints'}`);
}
