// app/api/developments/counts/route.ts
// Returns the count of HNWI World developments

import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

function buildFallbackPayload() {
  const count = 2016;

  return {
    total_count: count,
    count,
    total: count,
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
  };
}

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/castle-briefs/counts`, {
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
      count: count,
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
    });
  } catch {
    return NextResponse.json(buildFallbackPayload());
  }
}
