import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';
import { logger } from '@/lib/secure-logger';
import { sanitizeCommandCentreOpportunityDisplaySource } from '@/lib/opportunity-display-fields';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const MAX_PUBLIC_OPPORTUNITIES = 5;
const MAX_PUBLIC_ANALYSIS_TEXT_LENGTH = 2400;

const COMMAND_CENTRE_ARRAY_KEYS = [
  'opportunities',
  'hnwi_opportunities',
  'prive_opportunities',
  'crown_vault_opportunities',
] as const;

type RecordLike = Record<string, unknown>;

type PublicOpportunity = {
  id: string;
  title: string;
  name: string;
  location: string;
  city: string;
  state?: string;
  country: string;
  latitude: number;
  longitude: number;
  value?: string;
  risk?: string;
  summary: string;
  description: string;
  analysis: string;
  command_centre_display_summary: string;
  category: string;
  industry?: string;
  product?: string;
  source: string;
  source_surface: string;
  public_preview: true;
  follow_through_blocked: true;
  public_access_note: string;
  public_preview_source: string;
  source_development_id?: string;
  dev_id?: string;
  castle_brief_id?: string;
  citation_ids: string[];
  generated_at: string;
};

const isRecord = (value: unknown): value is RecordLike =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const cleanText = (value: unknown): string => {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
};

const firstText = (...values: unknown[]): string => {
  for (const value of values) {
    const text = cleanText(value);
    if (text) return text;
  }
  return '';
};

const asFiniteNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const boundedLimit = (request: NextRequest): number => {
  const requested = Number(request.nextUrl.searchParams.get('limit') || MAX_PUBLIC_OPPORTUNITIES);
  if (!Number.isFinite(requested)) return MAX_PUBLIC_OPPORTUNITIES;
  return Math.max(1, Math.min(MAX_PUBLIC_OPPORTUNITIES, Math.floor(requested)));
};

const rowIdentity = (row: RecordLike, index: number, sourceKey: string): string =>
  firstText(
    row.id,
    row._id,
    row.opportunity_id,
    row.dev_id,
    row.devid,
    row.castle_brief_id,
    row.source_development_id,
    `${sourceKey}:${index}`,
  );

const isCrownVaultRow = (row: RecordLike): boolean => {
  const source = firstText(row.source, row.source_collection, row._source_collection).toLowerCase();
  return source.includes('crown vault') || row.isCrownVault === true;
};

const redactPublicText = (value: unknown, maxLength = MAX_PUBLIC_ANALYSIS_TEXT_LENGTH): string => {
  const raw = cleanText(value)
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '')
    .replace(/\+?\d[\d\s().-]{7,}\d/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!raw) return '';

  const blockedSentencePattern =
    /\b(executor directory|trusted[-\s]?network|request introduction|linkedin|website|email|phone|contact details?|follow[-\s]?through)\b/i;
  const safeSentences = raw
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(sentence => sentence && !blockedSentencePattern.test(sentence));
  const redacted = (safeSentences.length > 0 ? safeSentences.join(' ') : raw).trim();

  if (redacted.length <= maxLength) return redacted;
  return `${redacted.slice(0, maxLength - 1).trim()}…`;
};

const publicNote =
  'Public preview only. Executor directory, source follow-through, and introduction actions are private.';

const normalizeTimeframe = (value: string | null): string => {
  const normalized = cleanText(value).toUpperCase();
  if (normalized === 'ALL' || normalized === 'LIVE' || normalized === '24H' || normalized === '7D' || normalized === '30D') {
    return normalized;
  }
  return 'LIVE';
};

function centralRows(payload: unknown): RecordLike[] {
  if (!isRecord(payload)) return [];

  const seen = new Set<string>();
  const rows: RecordLike[] = [];

  COMMAND_CENTRE_ARRAY_KEYS.forEach(key => {
    const sourceRows = Array.isArray(payload[key]) ? payload[key] : [];
    sourceRows.forEach((sourceRow, index) => {
      if (!isRecord(sourceRow)) return;
      const row = sanitizeCommandCentreOpportunityDisplaySource(sourceRow);
      if (isCrownVaultRow(row)) return;
      const id = rowIdentity(row, index, key);
      if (!id || seen.has(id)) return;
      seen.add(id);
      rows.push(row);
    });
  });

  return rows;
}

function publicOpportunityFromCentral(row: RecordLike, index: number): PublicOpportunity | null {
  const latitude = asFiniteNumber(row.latitude);
  const longitude = asFiniteNumber(row.longitude);
  if (latitude === null || longitude === null) return null;

  const title = firstText(row.title, row.name, row.brief_title, row.source_title, 'Command Centre opportunity');
  const city = firstText(row.city, row.location, row.country, title);
  const country = firstText(row.country, 'Global');
  const analysis = redactPublicText(
    firstText(
      row.command_centre_display_summary,
      row.summary,
      row.description,
      row.analysis,
      row.public_mirror_excerpt,
      row.card_summary,
      row.hbyte_summary,
    ),
  ) || 'Public-safe Command Centre preview. Private executor follow-through is withheld.';
  const sourceDevelopmentId = firstText(row.source_development_id);
  const sourceBriefId = firstText(row.dev_id, row.devid, row.castle_brief_id, row.mongo_article_id);
  const citationIds = Array.from(new Set([
    sourceBriefId,
    sourceDevelopmentId,
  ].filter(Boolean)));

  return {
    id: `public-command-centre-${rowIdentity(row, index, 'central')}`,
    title,
    name: city,
    location: firstText(row.location, `${city}, ${country}`),
    city,
    state: firstText(row.state) || undefined,
    country,
    latitude,
    longitude,
    value: firstText(row.brief_raw_value, row.value_original, row.value, row.minimum_investment_display, row.value_native) || undefined,
    risk: firstText(row.risk, row.verdict, row.projection_status, 'Preview') || undefined,
    summary: analysis,
    description: analysis,
    analysis,
    command_centre_display_summary: analysis,
    category: firstText(row.category, row.industry, row.product, 'Command Centre'),
    industry: firstText(row.industry) || undefined,
    product: firstText(row.product) || undefined,
    source: firstText(row.source, 'Public Command Centre Preview'),
    source_surface: 'public_command_centre_preview_v1',
    public_preview: true,
    follow_through_blocked: true,
    public_access_note: publicNote,
    public_preview_source: firstText(row.public_preview_source, 'central_command_centre_redacted'),
    source_development_id: sourceDevelopmentId || undefined,
    dev_id: sourceBriefId || sourceDevelopmentId || undefined,
    castle_brief_id: sourceBriefId.startsWith('castle_') ? sourceBriefId : undefined,
    citation_ids: citationIds,
    generated_at: firstText(row.generated_at, row.updated_at, row.created_at) || new Date().toISOString(),
  };
}

async function fetchCentralPublicRows(
  limit: number,
  timeframe: string,
  includeStaleMap: boolean,
): Promise<PublicOpportunity[]> {
  const params = new URLSearchParams({
    timeframe,
    include_stale_map: includeStaleMap ? 'true' : 'false',
    limit: String(limit),
  });

  const response = await fetch(`${API_BASE_URL}/api/command-centre/opportunities/public?${params.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) {
    logger.warn('Public Command Centre central fetch failed', { status: response.status });
    return [];
  }

  const payload: unknown = await response.json();
  return centralRows(payload)
    .map((row, index) => publicOpportunityFromCentral(row, index))
    .filter((row): row is PublicOpportunity => Boolean(row))
    .slice(0, limit);
}

export async function GET(request: NextRequest) {
  const limit = boundedLimit(request);
  const timeframe = normalizeTimeframe(request.nextUrl.searchParams.get('timeframe'));
  const includeStaleMap = request.nextUrl.searchParams.get('include_stale_map') === 'true';

  try {
    const opportunities = await fetchCentralPublicRows(limit, timeframe, includeStaleMap);

    const payload = {
      success: true,
      status: opportunities.length > 0 ? 'ok' : 'empty',
      source: 'central_command_centre_redacted',
      source_surface: 'public_command_centre_preview_v1',
      follow_through_blocked: true,
      public_access_note: publicNote,
      opportunities,
      hnwi_opportunities: opportunities,
      prive_opportunities: [],
      crown_vault_opportunities: [],
      count: opportunities.length,
      total_count: opportunities.length,
      metadata: {
        limit,
        central_count: opportunities.length,
        timeframe,
        include_stale_map: includeStaleMap,
        executor_directory: 'blocked_public_surface',
        source_follow_through: 'blocked_public_surface',
        contact_fields: 'omitted',
        empty_reason: opportunities.length === 0 ? 'central_command_centre_public_rows_empty' : null,
      },
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
        'X-HNWI-Public-Surface': 'command-centre-preview-v1',
        'X-HNWI-Follow-Through': 'blocked',
      },
    });
  } catch (error) {
    logger.error('Public Command Centre preview failed', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({
      success: false,
      status: 'error',
      source_surface: 'public_command_centre_preview_v1',
      follow_through_blocked: true,
      opportunities: [],
      hnwi_opportunities: [],
      prive_opportunities: [],
      crown_vault_opportunities: [],
      count: 0,
      total_count: 0,
      message: 'Public Command Centre preview unavailable',
    }, { status: 500 });
  }
}
