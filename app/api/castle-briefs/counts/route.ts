import { NextResponse } from 'next/server';
import { resolveCastleBriefCount } from '@/lib/castle-briefs/resolve-castle-brief-count';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

const KINGDOM_CONTRACT = {
  source_of_truth: 'kingdom_central_library',
  central_library: 'granthika_knowledge_world',
  central_registry: 'kingdom_central_library',
  canonical_versions: {
    castle_briefs: 'v3.1-library',
    kgv21_analytical: '2.1',
    kgv31_validated: '3.1',
    pattern_intelligence: '2.0',
    kgdm_relationship: '2.0',
  },
  substrate_order: [
    'native_castle_briefs',
    'native_kgv21_analytical',
    'native_kgv3_validated',
    'native_pattern_intelligence',
    'native_kgdm_relationship',
    'native_transaction_cases',
  ],
  brain_dimensions: [
    'structural',
    'validated',
    'trust',
    'temporal',
    'relational',
    'emotional',
    'psychological',
    'operating',
  ],
  state_channels: [
    'pattern_intelligence',
    'validated_facts',
    'room_state',
    'timing_window',
    'runtime_state',
  ],
};

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
    library_stats: null,
    kingdom_contract: KINGDOM_CONTRACT,
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
            library_stats_available: Boolean(data.library_stats?.available),
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
      library_stats: data.library_stats || null,
      kingdom_contract: data.kingdom_contract || KINGDOM_CONTRACT,
    });
  } catch {
    return NextResponse.json(buildUnavailablePayload('proxy_exception'), {
      status: 503,
    });
  }
}
