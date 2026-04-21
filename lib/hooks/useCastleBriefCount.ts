import { useEffect, useState } from 'react';
import { resolveCastleBriefCount } from '@/lib/castle-briefs/resolve-castle-brief-count';

let cachedCastleBriefCount: number | null = null;
let pendingCastleBriefCountPromise: Promise<number | null> | null = null;

async function loadCastleBriefCount(): Promise<number | null> {
  if (cachedCastleBriefCount !== null) {
    return cachedCastleBriefCount;
  }

  if (!pendingCastleBriefCountPromise) {
    pendingCastleBriefCountPromise = fetch('/api/castle-briefs/counts', {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }

        return resolveCastleBriefCount(await response.json());
      })
      .catch(() => null)
      .finally(() => {
        pendingCastleBriefCountPromise = null;
      });
  }

  const count = await pendingCastleBriefCountPromise;
  if (count !== null) {
    cachedCastleBriefCount = count;
  }
  return count;
}

interface UseCastleBriefCountOptions {
  initialCount?: number | null;
  enabled?: boolean;
}

export function useCastleBriefCount(
  options: UseCastleBriefCountOptions = {},
): number | null {
  const { initialCount = null, enabled = true } = options;
  const [count, setCount] = useState<number | null>(cachedCastleBriefCount ?? initialCount);

  useEffect(() => {
    if (initialCount === null) {
      return;
    }

    if (cachedCastleBriefCount === null) {
      cachedCastleBriefCount = initialCount;
    }

    setCount((currentCount) => currentCount ?? initialCount);
  }, [initialCount]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    loadCastleBriefCount().then((resolvedCount) => {
      if (!cancelled && resolvedCount !== null) {
        setCount(resolvedCount);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return count;
}
