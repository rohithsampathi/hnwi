import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';
import { resolveCastleBriefCount } from '@/lib/castle-briefs/resolve-castle-brief-count';

function buildUnavailablePayload(reason: string) {
  return {
    total_count: null,
    count: null,
    total: null,
    castle_briefs: {
      total_count: null,
      source: 'unavailable',
    },
    developments: {
      total_count: null,
      source: 'unavailable',
    },
    opportunities: null,
    degraded: true,
    reason,
  };
}

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/castle-briefs/public/counts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(buildUnavailablePayload('backend_unavailable'), {
        status: 502,
      });
    }

    const data = await response.json();
    const count = resolveCastleBriefCount(data);

    if (count === null) {
      return NextResponse.json(
        {
          ...buildUnavailablePayload('count_unavailable'),
          upstream: {
            count_shape_available: Boolean(data.castle_briefs || data.developments),
          },
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ...data,
      total_count: count,
      count,
      total: count,
      castle_briefs: {
        ...(data.castle_briefs || {}),
        total_count: count,
      },
      developments: {
        ...(data.developments || {}),
        total_count: count,
      },
      opportunities: data.opportunities ?? null,
    });
  } catch {
    return NextResponse.json(buildUnavailablePayload('proxy_exception'), {
      status: 503,
    });
  }
}
