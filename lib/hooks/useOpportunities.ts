// lib/hooks/useOpportunities.ts
// Centralized hook for fetching opportunities for assessment, Home Dashboard,
// and War Room maps.

import { useState, useEffect, useCallback } from 'react';
import { secureApi } from '@/lib/secure-api';
import type { City } from '@/components/interactive-world-map';
import { extractDevIds } from '@/lib/parse-dev-citations';
import type { Citation } from '@/lib/parse-dev-citations';
import { isRecentlyAddedOpportunity } from '@/lib/opportunity-recency';
import { resolveOpportunityCoordinates } from '@/lib/map-coordinate-resolver';
import {
  appendOpportunityCitationText,
  resolveOpportunityAnalysisText,
  resolveOpportunitySummaryText,
  resolveOpportunityTitle,
  resolveOpportunityValue,
  sanitizeCommandCentreOpportunityDisplaySource,
  structuredOpportunitySummaryText,
} from '@/lib/opportunity-display-fields';

interface Opportunity {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
  tier?: string;
  location?: string;
  latitude?: number | string;
  longitude?: number | string;
  country?: string;
  city?: string;
  state?: string;
  region?: string;
  address?: string;
  value?: string;
  risk?: string;
  analysis?: string;
  summary?: string;
  description?: string;
  hbyte_summary?: string;
  card_summary?: string;
  short_summary?: string;
  full_analysis?: string;
  full_text?: string;
  full_castle_brief?: string;
  castle_brief?: string;
  castle_brief_enriched?: string;
  brief_source_text?: string;
  public_mirror_excerpt?: string;
  source_summary?: string;
  castle_source_summary?: string;
  source_summary_structured?: unknown;
  castle_source_summary_structured?: unknown;
  command_centre_analysis_contract?: string;
  command_centre_reuse_contract?: string;
  command_centre_display_summary?: string;
  command_centre_analysis_structured?: unknown;
  source_fidelity_status?: string;
  source_fidelity_warnings?: string[];
  analysis_reuse_targets?: string[];
  granthika_reuse_native?: boolean;
  granthika_native?: boolean;
  product_aquarium_native?: boolean;
  product_aquarium_privacy?: string;
  product_aquarium_packet?: unknown;
  product_aquarium_vector_text?: string;
  product_aquarium_writeback_status?: string;
  product_aquarium_repair_outcome_atom?: string;
  product_aquarium_graph_edge_shape?: string[];
  shodhana_product_aquarium_repair_packet?: unknown;
  shodhana_latest_outcome_atom?: string;
  aquarium_learning_atoms?: unknown[];
  source_lineage?: unknown;
  granthika_graph_edges?: unknown[];
  granthika_authority_packet?: unknown;
  principal_decision_read?: string;
  decision_memo_trigger?: string;
  pressure_test_prompt?: string;
  reusable_product_insight?: string;
  validation_gaps?: unknown[];
  outcome_atom?: string;
  aquarium_writeback_status?: string;
  kg_readback_status?: string;
  kgv3_relation?: unknown;
  brief_title?: string;
  source_title?: string;
  source_url?: string;
  url?: string;
  source?: string;
  source_surface?: string;
  public_preview?: boolean;
  follow_through_blocked?: boolean;
  public_access_note?: string;
  dev_id?: string;
  devid?: string;
  mongo_article_id?: string;
  castle_brief_id?: string;
  source_development_id?: string;
  value_usd?: number | string;
  value_native?: number | string;
  value_original?: string;
  value_currency?: string;
  minimum_investment_display?: string;
  minimum_investment_usd?: number | string;
  victor_score?: string;
  elite_pulse_analysis?: string;
  category?: string;
  industry?: string;
  product?: string;
  start_date?: string;
  end_date?: string;
  source_article_date?: string;
  source_published_at?: string;
  published_at?: string;
  article_date?: string;
  activity_at?: string;
  last_activity_at?: string;
  updated_at?: string;
  created_at?: string;
  generated_at?: string;
  projection_status?: string;
  quarantine_status?: string;
  is_stale_projection?: boolean;
  map_visibility?: string;
  is_new?: boolean;
  executors?: Array<{
    name: string;
    email?: string;
    phone?: string;
    role?: string;
    strategic_trusted_partner?: boolean;
    website?: string;
    linkedin?: string;
  }>;
  cost_per_unit?: number;
  unit_count?: number;
  current_price?: number;
  entry_price?: number;
  appreciation?: {
    percentage: number;
    absolute: number;
    annualized: number;
    time_held_days: number;
  };
  price_history?: Array<{
    timestamp: string;
    price: number;
    source: 'manual' | 'katherine_analysis' | 'system';
    confidence_score?: number;
    notes?: string;
  }>;
  last_price_update?: string;
  katherine_analysis?: string;
  elite_pulse_impact?: {
    katherine_analysis?: string;
    katherine_ai_analysis?: {
      strategic_assessment?: string;
    };
  };
}

function commandCentreOpportunityRows(payload: any): Opportunity[] {
  if (Array.isArray(payload)) return payload;

  const rows = [
    ...(Array.isArray(payload?.opportunities) ? payload.opportunities : []),
    ...(Array.isArray(payload?.hnwi_opportunities) ? payload.hnwi_opportunities : []),
    ...(Array.isArray(payload?.prive_opportunities) ? payload.prive_opportunities : []),
    ...(Array.isArray(payload?.crown_vault_opportunities) ? payload.crown_vault_opportunities : []),
  ];
  const seen = new Set<string>();

  return rows.filter((row: any, index) => {
    const id = String(row?.id || row?._id || row?.opportunity_id || row?.source_development_id || row?.dev_id || index);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

interface UseOpportunitiesConfig {
  // Mode configuration
  isPublic?: boolean; // true for assessment (public), false for dashboard (authenticated)

  // Dashboard-specific options (ignored in public mode)
  timeframe?: string;
  isPersonalMode?: boolean;
  hasCompletedAssessment?: boolean;
  userId?: string | null;
  includeCrownVault?: boolean;
  includeStaleMap?: boolean;

  // Public mode specific options
  publicEndpoint?: string; // Allow custom public endpoint

  // Filtering options (applied after fetch)
  filterCrownVault?: boolean; // Always true for assessment
  cleanCategories?: boolean; // Clean category names
}

interface UseOpportunitiesResult {
  cities: City[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  availableCategories: string[];
  refetch: () => Promise<void>;
}

interface CachedOpportunitiesPayload {
  cities: City[];
  totalCount: number;
  availableCategories: string[];
  fetchedAt: number;
}

const OPPORTUNITIES_CACHE_TTL_MS = 60000
const opportunitiesCache = new Map<string, CachedOpportunitiesPayload>()
const inflightOpportunitiesRequests = new Map<string, Promise<CachedOpportunitiesPayload>>()

function buildOpportunitiesCacheKey(config: {
  isPublic: boolean
  timeframe: string
  shouldUsePersonalizedView: boolean
  userId: string
  includeCrownVault: boolean
  includeStaleMap: boolean
  publicEndpoint: string
  filterCrownVault: boolean
  cleanCategories: boolean
}): string {
  return JSON.stringify(config)
}

function getCachedOpportunities(cacheKey: string, ttlMs: number = OPPORTUNITIES_CACHE_TTL_MS): CachedOpportunitiesPayload | null {
  const cached = opportunitiesCache.get(cacheKey)
  if (!cached) return null

  if (Date.now() - cached.fetchedAt > ttlMs) {
    opportunitiesCache.delete(cacheKey)
    return null
  }

  return cached
}

// Helper function to clean category names (shared logic)
const cleanCategoryName = (category: string): string => {
  if (!category) return category;

  const cleanedCategory = category
    .replace(/\s*\([^)]*\)/g, '') // Remove parentheses content
    .replace(/\s*\[[^\]]*\]/g, '') // Remove bracket content
    .replace(/\s*-\s*(completed|under construction|ongoing|in progress|pending|active|inactive|sold|available)/gi, '')
    .replace(/\s+(completed|under construction|ongoing|in progress|pending|active|inactive|sold|available)/gi, '')
    .trim();

  return cleanedCategory;
};

const getOpportunityDate = (opp: Opportunity): string | undefined =>
  opp.activity_at || opp.last_activity_at || opp.updated_at || opp.created_at || opp.source_article_date || opp.generated_at || opp.start_date;

const isStaleProjection = (opp: Opportunity): boolean => {
  const projectionStatus = (opp.projection_status || '').toLowerCase();
  const quarantineStatus = (opp.quarantine_status || '').toLowerCase();

  return projectionStatus.includes('stale') ||
    projectionStatus.includes('quarantine') ||
    quarantineStatus.length > 0;
};

const normalizeDevelopmentCitationId = (value: string | undefined): string | null => {
  const raw = String(value || '').trim();
  if (!raw) return null;

  // Public source packets resolve on the outward development id. Some
  // Command Centre rows carry the internal source-brief id with the same hash.
  if (raw.startsWith('castle_')) {
    return `dev_${raw.slice('castle_'.length)}`;
  }

  return raw;
};

const normalizeDevelopmentCitationIds = (values: Array<string | undefined>): string[] => {
  const seen = new Set<string>();
  const normalized: string[] = [];

  values.forEach(value => {
    const id = normalizeDevelopmentCitationId(value);
    if (!id || seen.has(id)) return;
    seen.add(id);
    normalized.push(id);
  });

  return normalized;
};

// Transform opportunity to City format (shared logic)
const transformOpportunityToCity = (
  opp: Opportunity,
  cleanCategories: boolean = false
): City | null => {
  const displayOpp = sanitizeCommandCentreOpportunityDisplaySource(opp);
  const resolvedCoordinate = resolveOpportunityCoordinates(displayOpp);
  if (!resolvedCoordinate) {
    return null;
  }

  const lat = resolvedCoordinate.latitude;
  const lng = resolvedCoordinate.longitude;
  const displayName =
    resolvedCoordinate.source === 'resolved'
      ? resolvedCoordinate.label
      : displayOpp.location || displayOpp.country || displayOpp.title || 'Opportunity';
  const opportunityTitle = resolveOpportunityTitle(displayOpp, displayName);
  const opportunityAnalysis = resolveOpportunityAnalysisText(displayOpp);
  const opportunitySummary = resolveOpportunitySummaryText(displayOpp, opportunityAnalysis);
  const opportunityValue = resolveOpportunityValue(displayOpp);
  const sourceLower = (displayOpp.source || '').toLowerCase();
  const opportunityType =
    sourceLower.includes('crown vault') || sourceLower === 'crown vault'
      ? 'crown'
      : (sourceLower.includes('privé') || sourceLower.includes('prive'))
        ? 'prive'
        : 'hnwi';
  const followThroughBlocked = Boolean(displayOpp.follow_through_blocked || displayOpp.public_preview);

  // Extract citations from both analysis fields
  const devIdsFromAnalysis = extractDevIds(opportunityAnalysis || '');
  const devIdsFromElitePulse = extractDevIds(opp.elite_pulse_analysis || '');
  const katherineAnalysisText =
    (opp.katherine_analysis && opp.katherine_analysis.trim()) ||
    (opp.elite_pulse_impact?.katherine_analysis && opp.elite_pulse_impact.katherine_analysis.trim()) ||
    (opp.elite_pulse_impact?.katherine_ai_analysis?.strategic_assessment &&
     opp.elite_pulse_impact.katherine_ai_analysis.strategic_assessment.trim()) ||
    '';
  const devIdsFromSourceText = extractDevIds([
    structuredOpportunitySummaryText(opp.command_centre_analysis_structured),
    opp.principal_decision_read,
    opp.reusable_product_insight,
    opp.decision_memo_trigger,
    opp.pressure_test_prompt,
    opp.outcome_atom,
    structuredOpportunitySummaryText(opp.product_aquarium_packet),
    structuredOpportunitySummaryText(opp.shodhana_product_aquarium_repair_packet),
    opp.product_aquarium_vector_text,
    opp.summary,
    opp.description,
    opp.hbyte_summary,
    opp.card_summary,
    opp.short_summary,
    opp.full_analysis,
    opp.brief_source_text,
    opp.public_mirror_excerpt,
    opp.source_summary,
    structuredOpportunitySummaryText(opp.source_summary_structured),
    opportunitySummary,
    opportunityAnalysis,
    katherineAnalysisText,
  ].filter(Boolean).join('\n'));
  const structuredCitationIds = normalizeDevelopmentCitationIds([
    displayOpp.source_development_id,
    displayOpp.dev_id,
    displayOpp.devid,
    displayOpp.mongo_article_id,
    displayOpp.castle_brief_id,
  ]);
  const devIds = normalizeDevelopmentCitationIds([
    ...devIdsFromAnalysis,
    ...devIdsFromElitePulse,
    ...devIdsFromSourceText,
    ...structuredCitationIds,
  ]);
  const displayCitationIds = structuredCitationIds.length > 0 ? structuredCitationIds : devIds;
  const opportunityAnalysisWithCitation = appendOpportunityCitationText(opportunityAnalysis, displayCitationIds);
  const opportunitySummaryWithCitation = appendOpportunityCitationText(opportunitySummary, displayCitationIds);

  // Smart category correction (for misclassified opportunities)
  let correctedCategory = opp.category ?
    (cleanCategories ? cleanCategoryName(opp.category) : opp.category) :
    opp.category;

  const titleLower = (opportunityTitle || '').toLowerCase();
  const analysisLower = (opportunityAnalysis || '').toLowerCase();
  const combined = titleLower + ' ' + analysisLower;
  const categoryLower = (correctedCategory || '').toLowerCase();

  // Fix miscategorized automotive/vehicle items that are actually real estate
  if (categoryLower.includes('automotive') ||
      categoryLower.includes('vehicle') ||
      categoryLower === 'luxury vehicles' ||
      categoryLower === 'luxury vehicle') {
    const isRealEstate = combined.includes('residential') ||
      combined.includes('building') ||
      combined.includes('architecture') ||
      combined.includes('apartment') ||
      combined.includes('condo') ||
      combined.includes('real estate') ||
      combined.includes('property investment') ||
      combined.includes('branded residence') ||
      (titleLower.includes('investment') && (
        combined.includes('miami') ||
        combined.includes('tower') ||
        combined.includes('residence')
      ));

    if (isRealEstate) {
      correctedCategory = 'Real Estate';
    }
  }

  return {
    name: displayName,
    country: displayOpp.country || 'Unknown',
    latitude: lat,
    longitude: lng,
    population: opportunityValue,
    type: opportunityType,
    _id: displayOpp._id,
    id: displayOpp.id,
    title: opportunityTitle,
    tier: displayOpp.tier,
    value: opportunityValue,
    risk: displayOpp.risk,
    analysis: opportunityAnalysisWithCitation,
    summary: opportunitySummaryWithCitation,
    description: opportunitySummaryWithCitation || displayOpp.description,
    hbyte_summary: displayOpp.hbyte_summary,
    card_summary: displayOpp.card_summary,
    short_summary: displayOpp.short_summary,
    full_analysis: displayOpp.full_analysis,
    full_castle_brief: displayOpp.full_castle_brief,
    castle_brief: displayOpp.castle_brief,
    castle_brief_enriched: displayOpp.castle_brief_enriched,
    brief_source_text: displayOpp.brief_source_text,
    public_mirror_excerpt: displayOpp.public_mirror_excerpt,
    command_centre_analysis_contract: displayOpp.command_centre_analysis_contract,
    command_centre_reuse_contract: displayOpp.command_centre_reuse_contract,
    command_centre_display_summary: displayOpp.command_centre_display_summary,
    command_centre_analysis_structured: displayOpp.command_centre_analysis_structured,
    source_fidelity_status: displayOpp.source_fidelity_status,
    source_fidelity_warnings: displayOpp.source_fidelity_warnings,
    analysis_reuse_targets: displayOpp.analysis_reuse_targets,
    granthika_reuse_native: displayOpp.granthika_reuse_native,
    granthika_native: displayOpp.granthika_native,
    product_aquarium_native: displayOpp.product_aquarium_native,
    product_aquarium_privacy: displayOpp.product_aquarium_privacy,
    product_aquarium_packet: displayOpp.product_aquarium_packet,
    product_aquarium_vector_text: displayOpp.product_aquarium_vector_text,
    product_aquarium_writeback_status: displayOpp.product_aquarium_writeback_status,
    product_aquarium_repair_outcome_atom: displayOpp.product_aquarium_repair_outcome_atom,
    product_aquarium_graph_edge_shape: displayOpp.product_aquarium_graph_edge_shape,
    shodhana_product_aquarium_repair_packet: displayOpp.shodhana_product_aquarium_repair_packet,
    shodhana_latest_outcome_atom: displayOpp.shodhana_latest_outcome_atom,
    aquarium_learning_atoms: displayOpp.aquarium_learning_atoms,
    source_lineage: displayOpp.source_lineage,
    granthika_graph_edges: displayOpp.granthika_graph_edges,
    granthika_authority_packet: displayOpp.granthika_authority_packet,
    principal_decision_read: displayOpp.principal_decision_read,
    decision_memo_trigger: displayOpp.decision_memo_trigger,
    pressure_test_prompt: displayOpp.pressure_test_prompt,
    reusable_product_insight: displayOpp.reusable_product_insight,
    validation_gaps: displayOpp.validation_gaps,
    outcome_atom: displayOpp.outcome_atom,
    aquarium_writeback_status: displayOpp.aquarium_writeback_status,
    kg_readback_status: displayOpp.kg_readback_status,
    kgv3_relation: displayOpp.kgv3_relation,
    brief_title: displayOpp.brief_title,
    source_title: displayOpp.source_title,
    source_url: followThroughBlocked ? undefined : displayOpp.source_url,
    url: followThroughBlocked ? undefined : displayOpp.url,
    source: displayOpp.source,
    source_surface: displayOpp.source_surface,
    public_preview: displayOpp.public_preview,
    follow_through_blocked: followThroughBlocked,
    public_access_note: displayOpp.public_access_note,
    source_development_id: displayOpp.source_development_id,
    dev_id: displayOpp.dev_id,
    devid: displayOpp.devid,
    mongo_article_id: displayOpp.mongo_article_id,
    castle_brief_id: displayOpp.castle_brief_id,
    victor_score: displayOpp.victor_score,
    elite_pulse_analysis: displayOpp.elite_pulse_analysis,
    category: correctedCategory,
    industry: displayOpp.industry,
    product: displayOpp.product,
    start_date: displayOpp.start_date,
    source_article_date: displayOpp.source_article_date,
    source_published_at: displayOpp.source_published_at,
    published_at: displayOpp.published_at,
    article_date: displayOpp.article_date,
    activity_at: displayOpp.activity_at,
    last_activity_at: displayOpp.last_activity_at,
    updated_at: displayOpp.updated_at,
    created_at: displayOpp.created_at,
    generated_at: displayOpp.generated_at,
    projection_status: displayOpp.projection_status,
    is_stale_projection: displayOpp.is_stale_projection || displayOpp.map_visibility === 'stale_historical',
    map_visibility: displayOpp.map_visibility,
    is_new: displayOpp.is_new,
    devIds: devIds,
    hasCitations: devIds.length > 0,
    executors: followThroughBlocked ? [] : opp.executors,
    cost_per_unit: opp.cost_per_unit,
    unit_count: opp.unit_count,
    current_price: opp.current_price,
    entry_price: opp.entry_price,
    appreciation: opp.appreciation,
    price_history: opp.price_history,
    last_price_update: opp.last_price_update,
    katherine_analysis: katherineAnalysisText || null
  } as City;
};

export function useOpportunities(config: UseOpportunitiesConfig = {}): UseOpportunitiesResult {
  const {
    isPublic = false,
    timeframe = 'live',
    isPersonalMode = false,
    hasCompletedAssessment = false,
    userId = null,
    includeCrownVault = false,
    includeStaleMap = false,
    publicEndpoint = '/api/public/assessment/preview-opportunities',
    filterCrownVault = false,
    cleanCategories = true
  } = config;


  // CRITICAL FIX: Check URL parameter to trigger cache busting on mount
  // This solves the timing issue where events are dispatched before component mounts
  const initialBustCache = typeof window !== 'undefined' &&
    (window.location.search.includes('refresh=') || window.location.search.includes('bust_cache=true'));

  const [bustCache, setBustCache] = useState(initialBustCache);
  const shouldUsePersonalizedView = isPersonalMode && hasCompletedAssessment;
  const normalizedUserId = String(userId || '').trim();
  const cacheKey = buildOpportunitiesCacheKey({
    isPublic,
    timeframe,
    shouldUsePersonalizedView,
    userId: normalizedUserId,
    includeCrownVault,
    includeStaleMap,
    publicEndpoint,
    filterCrownVault,
    cleanCategories,
  })
  const initialCachedPayload = !initialBustCache ? getCachedOpportunities(cacheKey) : null

  const [cities, setCities] = useState<City[]>(() => initialCachedPayload?.cities ?? []);
  const [loading, setLoading] = useState(() => !initialCachedPayload);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(() => initialCachedPayload?.totalCount ?? 0);
  const [availableCategories, setAvailableCategories] = useState<string[]>(() => initialCachedPayload?.availableCategories ?? []);

  const fetchOpportunities = useCallback(async (force: boolean = false) => {
    const cachedPayload = !force && !bustCache ? getCachedOpportunities(cacheKey) : null
    if (cachedPayload) {
      setCities(cachedPayload.cities)
      setTotalCount(cachedPayload.totalCount)
      setAvailableCategories(cachedPayload.availableCategories)
      setError(null)
      setLoading(false)
      return
    }

    if (!force && !bustCache) {
      const inflight = inflightOpportunitiesRequests.get(cacheKey)
      if (inflight) {
        const payload = await inflight
        setCities(payload.cities)
        setTotalCount(payload.totalCount)
        setAvailableCategories(payload.availableCategories)
        setError(null)
        setLoading(false)
        return
      }
    }

    setLoading(true);
    setError(null);

    try {
      const request = (async (): Promise<CachedOpportunitiesPayload> => {
      let response: any;
      let opportunities: Opportunity[] = [];
      let responseTotal = 0

      if (isPublic) {
        // PUBLIC MODE (Assessment)
        // Use public endpoint with its own filtering logic
        const res = await fetch(publicEndpoint);

        if (!res.ok) {
          throw new Error(`Failed to fetch opportunities: ${res.status}`);
        }

        const data = await res.json();

        // Handle both wrapped and direct array responses
        opportunities = commandCentreOpportunityRows(data?.data || data);

        responseTotal = data?.total_count || opportunities.length
      } else {
        // AUTHENTICATED MODE (Home Dashboard)
        // Build API URL with all parameters
        const timeframeParam = timeframe === 'live' ? 'LIVE' : timeframe === 'all' ? 'ALL' : timeframe;
        const viewParam = shouldUsePersonalizedView ? 'personalized' : 'all';

        // Authenticated users should still see Crown Vault rows in all-mode when requested.
        const shouldIncludeCrownVault = includeCrownVault;

        const limitParam = timeframeParam === 'ALL' || timeframeParam === 'LIVE' ? 500 : 250;
        const userScopeParam = normalizedUserId ? `&user_id=${encodeURIComponent(normalizedUserId)}` : '';
        const apiUrl = `/api/command-centre/opportunities?view=${viewParam}&timeframe=${timeframeParam}&include_crown_vault=${shouldIncludeCrownVault}&include_stale_map=${includeStaleMap}&limit=${limitParam}${userScopeParam}`;

        // Use secureApi for authenticated requests with cache busting when needed
        response = await secureApi.get(apiUrl, true, bustCache);

        // Handle wrapped response from backend
        opportunities = commandCentreOpportunityRows(response);

        // Fallback: if personalized returned empty, retry with view=all
        if (opportunities.length === 0 && viewParam === 'personalized') {
          const fallbackUrl = `/api/command-centre/opportunities?view=all&timeframe=${timeframeParam}&include_crown_vault=${shouldIncludeCrownVault}&include_stale_map=${includeStaleMap}&limit=${limitParam}${userScopeParam}`;
          const fallbackResponse = await secureApi.get(fallbackUrl, true, bustCache);
          opportunities = commandCentreOpportunityRows(fallbackResponse);
        }

        responseTotal = opportunities.length

        // Backend owns timeframe semantics. Frontend only removes explicitly stale/quarantined rows.
        opportunities = opportunities.filter(opp => {
          if (!includeStaleMap && isStaleProjection(opp)) {
            return false;
          }

          return true;
        });

        responseTotal = opportunities.length
      }

      // Transform opportunities to City format
      const transformedCities: City[] = opportunities
        .map(opp => {
          // Apply Crown Vault filtering for public mode (assessment)
          if (isPublic && filterCrownVault) {
            const isCrownAsset = opp.source?.toLowerCase().includes('crown vault') ||
                                 opp.source?.toLowerCase() === 'crown vault';
            if (isCrownAsset) {
              return null;
            }
          }

          return transformOpportunityToCity(opp, cleanCategories);
        })
        .filter((city): city is City => city !== null);

      // Deduplicate by ID
      const seenIds = new Set<string>();
      const deduplicatedCities = transformedCities.filter(city => {
        const uniqueId = city._id || city.id;
        if (!uniqueId) return true;

        if (seenIds.has(uniqueId)) {
          return false;
        }

        seenIds.add(uniqueId);
        return true;
      });

      // Normalize recency once so every map can use the same "new in the last 30 days" rule.
      deduplicatedCities.forEach(city => {
        city.is_new = isRecentlyAddedOpportunity(city);
      });

      // Extract available categories
      const categoriesSet = new Set<string>();
      deduplicatedCities.forEach(city => {
        if (city.category) {
          const cleanedCategory = cleanCategories ?
            cleanCategoryName(city.category) :
            city.category;
          if (cleanedCategory) {
            categoriesSet.add(cleanedCategory);
          }
        }
      });

      const sortedCategories = Array.from(categoriesSet).sort();
      return {
        cities: deduplicatedCities,
        totalCount: responseTotal,
        availableCategories: sortedCategories,
        fetchedAt: Date.now(),
      }
      })()

      if (!force && !bustCache) {
        inflightOpportunitiesRequests.set(cacheKey, request)
      }

      const payload = await request
      if (payload.cities.length > 0 || isPublic) {
        opportunitiesCache.set(cacheKey, payload)
      } else {
        opportunitiesCache.delete(cacheKey)
      }
      setAvailableCategories(payload.availableCategories);
      setTotalCount(payload.totalCount);
      setCities(payload.cities);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch opportunities';
      setError(errorMessage);
    } finally {
      inflightOpportunitiesRequests.delete(cacheKey)
      setLoading(false);
      // Reset bust cache flag after fetching
      if (bustCache) {
        setBustCache(false);

        // Clean up URL parameter to prevent continuous cache busting
        if (typeof window !== 'undefined' && window.location.search.includes('refresh=')) {
          const url = new URL(window.location.href);
          url.searchParams.delete('refresh');
          // Use replaceState to avoid adding to browser history
          window.history.replaceState({}, '', url.toString());
        }
      }
    }
  }, [
    cacheKey,
    isPublic,
    timeframe,
    shouldUsePersonalizedView,
    normalizedUserId,
    includeCrownVault,
    includeStaleMap,
    publicEndpoint,
    filterCrownVault,
    cleanCategories,
    bustCache
  ]);

  // Fetch opportunities on mount and when config changes
  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  // Listen for cache clearing events and force refetch with cache busting
  useEffect(() => {
    const handleClearCache = () => {
      setBustCache(true) // This will trigger fetchOpportunities via dependency
    }

    window.addEventListener('dashboard:clear-cache', handleClearCache)
    window.addEventListener('app-data:clear-intelligence', handleClearCache)

    return () => {
      window.removeEventListener('dashboard:clear-cache', handleClearCache)
      window.removeEventListener('app-data:clear-intelligence', handleClearCache)
    }
  }, [])

  return {
    cities,
    loading,
    error,
    totalCount,
    availableCategories,
    refetch: () => fetchOpportunities(true)
  };
}
