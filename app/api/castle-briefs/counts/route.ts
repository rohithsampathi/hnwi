import { NextResponse } from 'next/server';

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

function buildFallbackPayload() {
  const count = 2016;

  return {
    total_count: count,
    count,
    total: count,
    castle_briefs: {
      total_count: count,
      source: 'fallback',
    },
    developments: {
      total_count: count,
      source: 'fallback',
    },
    opportunities: {
      total_count: 0,
      active_count: 0,
      source: 'fallback',
    },
    library_stats: {
      available: false,
      developments: {
        total_count: count,
        snapshot_total_count: 0,
      },
      castle: {
        total_extractions: 0,
        quality_score_gte_7: 0,
        quality_score_10: 0,
        context_exempt_count: 0,
        dead_letter_count: 0,
      },
      patterns: {
        deep_patterns_total: 0,
      },
      kgv3: {
        unified_total: 0,
      },
      opportunities: {
        command_centre_total: 0,
        prive_total: 0,
        prive_active_count: 0,
      },
    },
    kingdom_contract: KINGDOM_CONTRACT,
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
      return NextResponse.json(buildFallbackPayload());
    }

    const data = await response.json();

    const count =
      data.castle_briefs?.total_count ||
      data.developments?.total_count ||
      data.count ||
      data.total_count ||
      data.total ||
      2016;

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
      opportunities: data.opportunities || {
        total_count: 0,
        active_count: 0,
      },
      library_stats: data.library_stats || null,
      kingdom_contract: data.kingdom_contract || KINGDOM_CONTRACT,
    });
  } catch {
    return NextResponse.json(buildFallbackPayload());
  }
}
