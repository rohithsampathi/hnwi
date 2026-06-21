import { assembleCrossBorderAudit } from '@/lib/decision-memo/assemble-cross-border-audit';
import type { ICArtifact } from '@/lib/decision-memo/pattern-audit-types';
import { transformICArtifactToMemoData } from '@/lib/decision-memo/sfo-to-memo-transformer';
import type { PdfMemoData } from '@/lib/pdf/pdf-types';

type RecordLike = Record<string, any>;

interface ResolveDecisionMemoSurfaceDataInput {
  intakeId: string;
  backendData?: RecordLike | null;
  fullArtifact?: RecordLike | ICArtifact | null;
}

const PRINCIPAL_SURFACE_CONTRACT = 'hnwi_principal_surface_v1';
const INTERNAL_METHOD_COUNT_KEYS = new Set([
  'collections_queried',
  'observation_count',
  'pattern_rows_reviewed',
  'rows_reviewed',
  'source_rows_reviewed',
]);
const INTERNAL_OBJECT_KEYS = new Set([
  'dm64_kernel',
  'dm64_manual_repair',
  'native_contradiction_register',
  'native_moat_packet',
  'pattern_learning_overlay',
  'runtime_packet',
  'writeback_packet',
]);
const RAW_MEMO_TEXT_KEYS = new Set([
  'memo_text',
  'memo_markdown',
  'markdown',
  'full_markdown',
  'full_memo_markdown',
  'document_markdown',
  'raw_markdown',
  'raw_memo',
  'raw_text',
]);

function textOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function releaseReadinessReviewUrl(intakeId: string): string {
  return `/release-readiness/review/${encodeURIComponent(intakeId)}`;
}

function sanitizePrincipalSurfaceText(value: string): string {
  return value
    .replace(/\bRelease Differently\b/gi, 'Gated negotiation only')
    .replace(/\brelease differently\b/gi, 'gated negotiation only')
    .replace(/\bProceed Modified\b/gi, 'Proceed under signed gates')
    .replace(/\bproceed modified\b/gi, 'proceed under signed gates')
    .replace(/\bPROCEED MODIFIED\b/g, 'PROCEED UNDER SIGNED GATES')
    .replace(/\bHigh until release gates clear\b/gi, 'Evidence pending; no capital release')
    .replace(/\bRisk level\b/gi, 'Release status')
    .replace(/\bData quality\b/gi, 'Evidence status')
    .replace(/\brelease-read sprint\b/gi, 'release-readiness sprint')
    .replace(/\bFull Decision Memo\b/gi, 'Release Readiness Review')
    .replace(/\bDecision Memo\b/gi, 'Release Readiness Review')
    .replace(/\bPressure Variants Tested\b/gi, 'Release Readiness Routes Reviewed')
    .replace(/\bpressure variants?\b/gi, 'release-readiness routes')
    .replace(/\bPressure Test\b/gi, 'Release Readiness Review')
    .replace(/\bpressure-test(?:ed|ing)?\b/gi, 'release-readiness reviewed')
    .replace(/\bpressure read\b/gi, 'release read')
    .replace(/\bseller pressure\b/gi, 'seller timing')
    .replace(/\bbank pressure\b/gi, 'bank readiness')
    .replace(/\babsence pressure\b/gi, 'absence readiness')
    .replace(/\bpressure\b/gi, 'readiness')
    .replace(
      /\b2222 route-pattern rows reviewed; 8 driver families selected; 21 route witnesses carried into the memo\./gi,
      'Route-pattern source records were reviewed; 8 driver families and 21 route witnesses were carried into the memo as methodology, not release proof.',
    )
    .replace(
      /\b2222 route-pattern rows, 21 named route witnesses, and 8 selected driver families inform the memo's route sequencing\./gi,
      'Route-pattern source records, 21 named route witnesses, and 8 selected driver families inform route sequencing as methodology, not legal, bank, title, or family-authority proof.',
    )
    .replace(
      /\b2222 route-pattern rows, 110 route weights, 1464 pattern weights, 19 similarity clusters, 21 route witnesses, 8 selected driver families, and 31 source anchors are carried into this Mayfair memo\./gi,
      'Route-pattern source records, route weights, similarity clusters, 21 route witnesses, 8 selected driver families, and 31 source anchors are carried into this Mayfair memo as methodology, not legal, bank, title, or family-authority proof.',
    )
    .replace(/\bNative Route Drivers\b/g, 'Route Drivers From Source Review')
    .replace(/\bHNWI Chronicles pattern-library ledger\b/gi, 'HNWI Chronicles source-review register')
    .replace(/\bpattern-library\b/gi, 'source-review')
    .replace(/\bpattern library\b/gi, 'source-review register')
    .replace(/\bsource rows\b/gi, 'source records')
    .replace(/\broute-pattern rows\b/gi, 'route-pattern source records')
    .replace(/\bcastle briefs?\b/gi, 'source briefs')
    .replace(/\bCastle Briefs?\b/g, 'Source Briefs')
    .replace(/\bKGv3\b/g, 'source register')
    .replace(/\bkgv3\b/g, 'source_register')
    .replace(/\bDM64\b/g, 'release-readiness compiler')
    .replace(/\bGranthika\b/g, 'source library')
    .replace(/\bAquarium\b/g, 'source-review memory')
    .replace(/\bnative_library_route_compiler\b/gi, 'source_review_route_compiler')
    .replace(
      /\bas a London family base,\s*education\/continuity node,\s*and capital-preservation asset\b/gi,
      'as a proposed London family-use acquisition with education, residence, succession, and capital-preservation claims treated as separate gates',
    )
    .replace(
      /\bLondon family base,\s*education\/continuity node,\s*and capital-preservation asset\b/gi,
      'proposed London family-use acquisition with education, residence, succession, and capital-preservation claims treated as separate gates',
    )
    .replace(
      /\bLondon family base,\s*education\/continuity node,\s*and capital-preservation reserve\b/gi,
      'London family-use, continuity, and capital-preservation claims treated as separate release gates',
    )
    .replace(/\bg1[_-]g2[_-]g3\b/gi, 'generation_to_generation')
    .replace(/\bG1\s*\/\s*G2\s*\/\s*G3\b/gi, 'principal authority, family-use boundary, fairness owner, and next-generation decision record')
    .replace(/\bG1\s*->\s*G2\s*->\s*G3\b/gi, 'generation-to-generation')
    .replace(/\bG1\s*→\s*G2\s*→\s*G3\b/gi, 'generation-to-generation')
    .replace(/\bG1 principal\b/gi, 'principal')
    .replace(/\bG1 founder\s*\/\s*principal\b/gi, 'principal')
    .replace(/\bG1\b/gi, 'principal')
    .replace(/(^|[_-])g1(?=$|[_-])/gi, '$1principal')
    .replace(/\bG2 son\b/gi, 'named family user')
    .replace(/\bG2 daughter\s*\/\s*fairness owner\b/gi, 'named family-fairness owner')
    .replace(/\bG2 fairness owner\b/gi, 'family-fairness owner')
    .replace(/\bG2\b/gi, 'named family user')
    .replace(/(^|[_-])g2(?=$|[_-])/gi, '$1named_family_user')
    .replace(/\bG3\/grandchild\b/gi, 'next-generation continuity')
    .replace(/\bG3 grandson\b/gi, 'next-generation record')
    .replace(/\bG3 memory rules\b/gi, 'next-generation decision record rules')
    .replace(/\bG3 decision memory\b/gi, 'next-generation decision record')
    .replace(/\bG3 memory\b/gi, 'next-generation decision record')
    .replace(/\bG3\b/gi, 'next-generation record')
    .replace(/(^|[_-])g3(?=$|[_-])/gi, '$1next_generation_record')
    .replace(/\bdaughter\s*\/\s*fairness owner\b/gi, 'named family-fairness owner')
    .replace(/\bdaughter\/fairness\b/gi, 'family-fairness')
    .replace(/\bdaughter fairness\b/gi, 'family-fairness')
    .replace(/\bson-use\b/gi, 'named family-user')
    .replace(/\bson use\b/gi, 'named family-user')
    .replace(/\bson\b/gi, 'named family user')
    .replace(/\bdaughter\b/gi, 'named family-fairness owner')
    .replace(/\bfuture-grandchild\b/gi, 'next-generation')
    .replace(/\bgrandson\b/gi, 'next-generation record')
    .replace(/\bspouse veto if relevant\b/gi, 'family-use veto position where recorded')
    .replace(/\bspouse if relevant\b/gi, 'family-use veto holder where recorded')
    .replace(/\bspouse veto\b/gi, 'family-use veto position')
    .replace(/\bfamily-home veto position\b/gi, 'family-use veto position')
    .replace(/\bfamily-home veto holder\b/gi, 'family-use veto holder')
    .replace(/\bFounder authority\b/gi, 'Principal authority')
    .replace(/\bfounder authority\b/gi, 'principal authority')
    .replace(/\bFounder\b/g, 'Principal')
    .replace(/\bfounder\b/g, 'principal')
    .replace(/\bnext-generation decision memory\b/gi, 'next-generation decision record')
    .replace(/\bThe route must be retrievable six years later\b/gi, 'The route must be retrievable years later')
    .replace(/\bsix years later\b/gi, 'later')
    .replace(
      /\bLooks like prime London capital preservation even though the economics are control\/use-led after duty drag\.?/gi,
      'Appears like a capital-preservation purchase, but economics are family-use and control-led after duty drag.',
    )
    .replace(
      /\bCapital should not move while the transfer path is only narrated\.?/gi,
      'Capital remains blocked until the transfer path is bank-accepted in writing.',
    )
    .replace(
      /\bThe asset cannot become a silent family promise or future conflict point\.?/gi,
      'Use rights, carry, and veto must be written so the property does not become an implied future entitlement.',
    )
    .replace(
      /\bThe purchase must remain legible (?:six years )?later without relying on (?:founder|principal) memory\.?/gi,
      'The purchase must remain explainable later without relying on memory or informal understandings.',
    )
    .replace(/\b2,222\b/g, 'methodology-bounded')
    .replace(/\b2222\b/g, 'methodology-bounded')
    .replace(/\s+/g, ' ')
    .trim();
}

function shouldDropPrincipalSurfaceField(key: string, value: unknown): boolean {
  const normalizedKey = key.trim().toLowerCase();
  if (INTERNAL_OBJECT_KEYS.has(normalizedKey) || RAW_MEMO_TEXT_KEYS.has(normalizedKey)) {
    return true;
  }

  if (
    (INTERNAL_METHOD_COUNT_KEYS.has(normalizedKey) || normalizedKey === 'count') &&
    ((typeof value === 'number' && value === 2222) ||
      (typeof value === 'string' && value.trim().replace(/,/g, '') === '2222'))
  ) {
    return true;
  }

  return false;
}

function publicPrincipalSurfaceKey(key: string): string {
  const normalizedKey = key.trim().toLowerCase();
  if (normalizedKey === 'dm64_release_rule') {
    return 'release_rule';
  }

  if (normalizedKey.startsWith('dm64_')) {
    return key.replace(/^dm64_/i, 'release_readiness_');
  }

  if (normalizedKey.startsWith('dm64')) {
    return key.replace(/^dm64/i, 'releaseReadiness');
  }

  return key;
}

function sanitizePrincipalSurfacePayload<T>(value: T, key = ''): T {
  if (typeof value === 'string') {
    return sanitizePrincipalSurfaceText(value) as T;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizePrincipalSurfacePayload(item, key))
      .filter((item) => item !== undefined) as T;
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const output: RecordLike = {};
  Object.entries(value as RecordLike).forEach(([entryKey, entryValue]) => {
    if (shouldDropPrincipalSurfaceField(entryKey, entryValue)) {
      return;
    }

    const sanitized = sanitizePrincipalSurfacePayload(entryValue, entryKey);
    if (sanitized !== undefined) {
      output[publicPrincipalSurfaceKey(entryKey)] = sanitized;
    }
  });

  return output as T;
}

function sanitizeResolvedDecisionMemoSurfaceData(
  resolved: ResolvedDecisionMemoSurfaceData,
): ResolvedDecisionMemoSurfaceData {
  const memoData = sanitizePrincipalSurfacePayload(resolved.memoData);
  const fullArtifact = resolved.fullArtifact
    ? sanitizePrincipalSurfacePayload(resolved.fullArtifact)
    : resolved.fullArtifact;

  return {
    ...resolved,
    memoData: {
      ...memoData,
      full_artifact: fullArtifact ?? memoData.full_artifact,
    },
    backendData: sanitizePrincipalSurfacePayload({
      ...resolved.backendData,
      preview_data: memoData.preview_data,
      memo_data: memoData.memo_data,
      fullArtifact: fullArtifact ?? resolved.backendData.fullArtifact,
      full_artifact: fullArtifact ?? resolved.backendData.full_artifact,
    }),
    fullArtifact,
  };
}

export interface ResolvedDecisionMemoSurfaceData {
  memoData: PdfMemoData;
  backendData: RecordLike;
  fullArtifact: RecordLike | null;
  developmentsCount: number | null;
}

function hasKeys(value: unknown): value is RecordLike {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value) && Object.keys(value as RecordLike).length > 0;
}

function isPrincipalSurfacePayload(value?: RecordLike | null): boolean {
  return Boolean(
    value &&
      value.surface_contract === PRINCIPAL_SURFACE_CONTRACT &&
      hasKeys(value.preview_data) &&
      hasKeys(value.memo_data) &&
      hasKeys(value.full_artifact),
  );
}

function extractPrincipalSurfacePayload(
  backendData?: RecordLike | null,
  fullArtifact?: RecordLike | ICArtifact | null,
): RecordLike | null {
  const data = backendData as RecordLike | null | undefined;
  if (isPrincipalSurfacePayload(data)) {
    return data as RecordLike;
  }

  const nestedSurface = data?.decision_memo_surface;
  if (isPrincipalSurfacePayload(nestedSurface)) {
    return nestedSurface as RecordLike;
  }

  const nestedMemoData = data?.memoData;
  if (isPrincipalSurfacePayload(nestedMemoData)) {
    return nestedMemoData as RecordLike;
  }

  if (isPrincipalSurfacePayload(fullArtifact as RecordLike | null)) {
    return fullArtifact as RecordLike;
  }

  return null;
}

function numericOrNull(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, '').trim());
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return null;
}

function numberOrNull(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    const multiplier = /bn?\b/i.test(trimmed)
      ? 1_000_000_000
      : /m\b/i.test(trimmed)
        ? 1_000_000
        : /k\b/i.test(trimmed)
          ? 1_000
          : 1;
    const parsed = Number(trimmed.replace(/[^0-9.-]/g, ''));
    if (Number.isFinite(parsed)) {
      return parsed * multiplier;
    }
  }

  return null;
}

function formatUsd(value: unknown, options: Intl.NumberFormatOptions = {}): string | undefined {
  const amount = numberOrNull(value);
  if (amount === null) {
    return undefined;
  }

  return `US$${Math.round(amount).toLocaleString('en-US', options)}`;
}

function normalizeProbability(value: unknown, fallback: number): number {
  const parsed = numberOrNull(value);
  if (parsed === null || parsed <= 0) {
    return fallback;
  }

  return parsed > 1 ? parsed / 100 : parsed;
}

function projectValueAtYear(startValue: number, finalValue: number, year: number): number {
  if (year === 0) {
    return startValue;
  }

  if (startValue > 0 && finalValue >= 0) {
    return startValue * Math.pow(finalValue / startValue, year / 10);
  }

  return startValue + ((finalValue - startValue) * year) / 10;
}

function projectScenarioPathValue(startValue: number, finalValue: number, year: number, scenarioKey: string): number {
  const ratePaths: Record<string, number[]> = {
    base: [0.012, 0.021, 0.028, 0.018, 0.042, 0.031, 0.036, 0.027, 0.034, 0.031],
    stress: [-0.045, -0.065, -0.02, 0.018, 0.031, 0.014, 0.034, 0.025, 0.03, 0.026],
    opportunity: [0.025, 0.041, 0.063, 0.047, 0.072, 0.058, 0.066, 0.052, 0.061, 0.055],
  };
  const rates = ratePaths[scenarioKey] ?? ratePaths.base;
  const raw = [startValue];
  let value = startValue;
  rates.forEach((rate) => {
    value *= 1 + rate;
    raw.push(value);
  });

  const rawDelta = raw[10] - startValue;
  const targetDelta = finalValue - startValue;
  if (Math.abs(rawDelta) > 1 && rawDelta * targetDelta >= 0) {
    return startValue + ((raw[year] - startValue) * targetDelta) / rawDelta;
  }

  const fallbackShape: Record<string, number[]> = {
    base: [0, -0.006, -0.003, 0.004, 0.001, 0.011, 0.008, 0.015, 0.012, 0.017, 0],
    stress: [0, -0.035, -0.082, -0.076, -0.052, -0.04, -0.025, -0.018, -0.012, -0.006, 0],
    opportunity: [0, 0.006, 0.014, 0.03, 0.036, 0.052, 0.062, 0.078, 0.087, 0.096, 0],
  };
  const shape = fallbackShape[scenarioKey] ?? fallbackShape.base;
  return projectValueAtYear(startValue, finalValue, year) + startValue * shape[year];
}

function normalizeCompactWealthProjection(projection?: RecordLike | null): RecordLike | null {
  if (!hasKeys(projection)) {
    return projection ?? null;
  }

  const normalized: RecordLike = { ...projection };
  const startingPosition: RecordLike = {
    ...(hasKeys(normalized.starting_position) ? normalized.starting_position : {}),
  };
  const acquisitionAudit = startingPosition.cross_border_audit_summary?.acquisition_audit ?? {};

  const startingValue =
    numberOrNull(normalized.starting_value) ??
    numberOrNull(normalized.transaction_value) ??
    numberOrNull(startingPosition.transaction_value) ??
    numberOrNull(startingPosition.transaction_amount) ??
    numberOrNull(startingPosition.purchase_price_sgd) ??
    numberOrNull(acquisitionAudit.property_value) ??
    0;
  const capitalDeployed =
    numberOrNull(startingPosition.total_acquisition_cost) ??
    numberOrNull(startingPosition.all_in_outlay_sgd) ??
    numberOrNull(acquisitionAudit.total_acquisition_cost) ??
    startingValue;
  const stampDutiesPaid =
    numberOrNull(startingPosition.stamp_duties_paid) ??
    numberOrNull(startingPosition.stamp_duty_drag_sgd) ??
    numberOrNull(acquisitionAudit.total_stamp_duties) ??
    0;

  normalized.starting_position = {
    ...startingPosition,
    transaction_value: numberOrNull(startingPosition.transaction_value) ?? startingValue,
    transaction_amount: numberOrNull(startingPosition.transaction_amount) ?? startingValue,
    total_acquisition_cost: capitalDeployed,
    stamp_duties_paid: stampDutiesPaid,
  };
  normalized.starting_value = numberOrNull(normalized.starting_value) ?? startingValue;
  normalized.transaction_value = numberOrNull(normalized.transaction_value) ?? startingValue;

  const probabilityWeighted = hasKeys(normalized.probability_weighted)
    ? normalized.probability_weighted
    : null;
  if (!hasKeys(normalized.probability_weighted_outcome) && probabilityWeighted) {
    normalized.probability_weighted_outcome = {
      expected_net_worth:
        numberOrNull(probabilityWeighted.expected_net_worth) ??
        numberOrNull(probabilityWeighted.expected_total_value) ??
        0,
      expected_value_creation:
        numberOrNull(probabilityWeighted.expected_value_creation) ??
        numberOrNull(probabilityWeighted.value_creation) ??
        0,
      vs_stay_expected:
        numberOrNull(probabilityWeighted.vs_stay_expected) ??
        numberOrNull(probabilityWeighted.if_stay) ??
        0,
      net_benefit_of_move:
        numberOrNull(probabilityWeighted.net_benefit_of_move) ??
        numberOrNull(probabilityWeighted.net_benefit) ??
        0,
    };
  }

  if (hasKeys(normalized.probability_weighted_outcome)) {
    const weightedOutcome = normalized.probability_weighted_outcome;
    weightedOutcome.expected_value_formatted ??=
      formatUsd(weightedOutcome.expected_net_worth ?? weightedOutcome.expected_total_value);
    weightedOutcome.expected_net_worth_formatted ??=
      formatUsd(weightedOutcome.expected_net_worth ?? weightedOutcome.expected_total_value);
    weightedOutcome.expected_value_creation_formatted ??=
      formatUsd(weightedOutcome.expected_value_creation);
    weightedOutcome.net_benefit_of_move_formatted ??=
      formatUsd(weightedOutcome.net_benefit_of_move ?? weightedOutcome.net_benefit);
  }

  if (hasKeys(normalized.cost_of_inaction)) {
    normalized.cost_of_inaction = {
      primary_driver:
        normalized.cost_of_inaction.primary_driver ??
        'Route value lost to duty drag, custody friction, and execution timing.',
      secondary_driver:
        normalized.cost_of_inaction.secondary_driver ??
        'Authority, banking, and succession evidence must clear before release.',
      ...normalized.cost_of_inaction,
    };
  }

  if (Array.isArray(normalized.scenarios)) {
    return normalized;
  }

  if (!hasKeys(normalized.scenarios)) {
    return normalized;
  }

  const compactScenarios = normalized.scenarios;
  const scenarioConfig = [
    { key: 'base', name: 'BASE_CASE', fallbackProbability: 0.6 },
    { key: 'stress', name: 'STRESS_CASE', fallbackProbability: 0.2 },
    { key: 'opportunity', name: 'OPPORTUNITY_CASE', fallbackProbability: 0.2 },
  ];

  normalized.scenarios = scenarioConfig
    .map(({ key, name, fallbackProbability }) => {
      const compact = compactScenarios[key];
      if (!hasKeys(compact)) {
        return null;
      }

      const finalValue =
        numberOrNull(compact.year_10_value) ??
        numberOrNull(compact.final_value) ??
        numberOrNull(compact.expected_net_worth) ??
        startingValue;
      const totalValueCreation = finalValue - startingValue;
      const netValueCreation = finalValue - capitalDeployed;
      const percentageGain = startingValue > 0 ? (totalValueCreation / startingValue) * 100 : 0;
      const trueRoiPct = capitalDeployed > 0 ? (netValueCreation / capitalDeployed) * 100 : percentageGain;
      const compactYearByYear = Array.isArray(compact.year_by_year) ? compact.year_by_year : [];
      const yearByYear = compactYearByYear.length > 0
        ? compactYearByYear
            .map((point: RecordLike) => {
              const year = numberOrNull(point.year);
              if (year === null || year < 0 || year > 10) return null;
              const propertyValue =
                numberOrNull(point.property_value) ??
                numberOrNull(point.asset_value) ??
                numberOrNull(point.total_value) ??
                numberOrNull(point.net_worth) ??
                projectScenarioPathValue(startingValue, finalValue, year, key);
              const totalValue =
                numberOrNull(point.total_value) ??
                numberOrNull(point.net_worth) ??
                propertyValue;
              return {
                year,
                property_value: propertyValue,
                liquid_assets: numberOrNull(point.liquid_assets) ?? 0,
                income: numberOrNull(point.income) ?? numberOrNull(point.rental_income) ?? 0,
                tax_saved: numberOrNull(point.tax_saved) ?? 0,
                net_worth: numberOrNull(point.net_worth) ?? totalValue,
                total_value: totalValue,
                rental_income: numberOrNull(point.rental_income) ?? numberOrNull(point.income) ?? 0,
              };
            })
            .filter(Boolean)
        : [0, 1, 5, 10].map((year) => {
            const value = projectScenarioPathValue(startingValue, finalValue, year, key);
            return {
              year,
              property_value: value,
              liquid_assets: 0,
              income: 0,
              tax_saved: 0,
              net_worth: value,
              total_value: value,
              rental_income: 0,
            };
          });

      return {
        name,
        probability: normalizeProbability(compact.probability, fallbackProbability),
        assumptions: [
          compact.growth_rate ? `Growth basis: ${String(compact.growth_rate)}` : null,
          compact.name ? `Route condition: ${String(compact.name)}` : null,
          compact.verdict ? `Release read: ${String(compact.verdict)}` : null,
        ].filter(Boolean),
        year_by_year: yearByYear,
        ten_year_outcome: {
          property_appreciation: totalValueCreation,
          investment_growth: 0,
          tax_savings_cumulative: 0,
          total_value_creation: totalValueCreation,
          net_value_creation: netValueCreation,
          percentage_gain: percentageGain,
          true_roi_pct: trueRoiPct,
          final_value: finalValue,
          final_total_value: finalValue,
        },
        compact_source: compact,
      };
    })
    .filter(Boolean);

  return normalized;
}

function applyCanonicalWealthProjectionScenarios(memoData: PdfMemoData) {
  const previewData = memoData.preview_data;
  if (!previewData) {
    return;
  }

  previewData.wealth_projection_data = normalizeCompactWealthProjection(
    previewData.wealth_projection_data,
  ) ?? previewData.wealth_projection_data;

  if (hasKeys(previewData.structure_projections)) {
    previewData.structure_projections = Object.fromEntries(
      Object.entries(previewData.structure_projections).map(([key, value]) => [
        key,
        normalizeCompactWealthProjection(value as RecordLike) ?? value,
      ]),
    );
  }
}

function normalizeFullArtifact(
  backendData?: RecordLike | null,
  fullArtifact?: RecordLike | ICArtifact | null,
): RecordLike | null {
  return (
    (fullArtifact as RecordLike) ??
    backendData?.memoData?.full_artifact ??
    backendData?.memoData?.artifact ??
    backendData?.memoData?.fullArtifact ??
    backendData?.full_artifact_v2 ??
    backendData?.full_artifact ??
    backendData?.fullArtifact ??
    null
  );
}

function resolveKingdomNativePreviewMemo(backendData?: RecordLike | null): RecordLike | null {
  const candidates = [
    backendData?.memo,
    backendData?.full_artifact?.memo,
    backendData?.fullArtifact?.memo,
    backendData?.artifact?.memo,
  ];

  return candidates.find(hasKeys) ?? null;
}

function isKingdomNativePreviewPayload(backendData?: RecordLike | null): boolean {
  if (!backendData) return false;
  return (
    backendData.status === 'kingdom_native_preview' ||
    backendData.full_artifact?.status === 'kingdom_native_preview' ||
    backendData.artifact?.status === 'kingdom_native_preview'
  );
}

function buildKingdomNativePreviewSurface(
  intakeId: string,
  backendData?: RecordLike | null,
): ResolvedDecisionMemoSurfaceData | null {
  if (!isKingdomNativePreviewPayload(backendData)) {
    return null;
  }

  const nativePayload = backendData as RecordLike;
  const nativeMemo = resolveKingdomNativePreviewMemo(backendData);
  const title = String(nativeMemo?.title || 'Kingdom Native Decision Memo Preview');
  const executiveSummary = String(
    nativeMemo?.executiveSummary ||
    nativeMemo?.executive_summary ||
    'The backend returned a native preview shell, but the completed audit payload is not present for this intake id.',
  );
  const libraryAuthority = String(nativeMemo?.libraryAuthority || 'Source library and backend memo store');
  const nextStep = String(nativeMemo?.nextStep || 'Completed audit payload required from backend before full report findings can render.');
  const generatedAt = String(nativePayload.generated_at || nativePayload.generatedAt || new Date().toISOString());

  const previewData: RecordLike = {
    source_jurisdiction: '',
    destination_jurisdiction: '',
    exposure_class: 'Backend incomplete',
    total_savings: 'Pending',
    hnwi_world_count: 0,
    risk_level: 'Pending',
    verdict: 'Backend memo payload incomplete',
    executive_summary: {
      headline_metric: {
        label: 'Backend Status',
        value: 'Awaiting completed memo',
        description: executiveSummary,
      },
      strategy_label: 'Kingdom native preview',
      evidence_basis_note: `${libraryAuthority}. ${nextStep}`,
      underwriting_snapshot: [
        {
          label: 'Intake',
          value: intakeId,
          note: 'No completed audit rows were returned by the backend for this id.',
        },
        {
          label: 'Backend status',
          value: String(nativePayload.status || nativePayload.full_artifact?.status || 'kingdom_native_preview'),
          note: 'This is a degraded native preview shell, not a full audit artifact.',
        },
      ],
    },
    input_snapshot: {
      intake_id: intakeId,
      backend_status: nativePayload.status || nativePayload.full_artifact?.status || 'kingdom_native_preview',
      answer_count: nativePayload.answerCount ?? nativePayload.full_artifact?.answerCount ?? 0,
      backend_incomplete: true,
    },
    all_opportunities: [],
    all_mistakes: [],
    wealth_projection_data: {
      starting_position: {
        cross_border_audit_summary: {
          status: 'backend_incomplete',
          summary: executiveSummary,
          next_step: nextStep,
        },
      },
    },
  };

  const memoData: PdfMemoData = {
    success: true,
    intake_id: intakeId,
    generated_at: generatedAt,
    preview_data: previewData,
    memo_data: {
      title,
      executive_summary: executiveSummary,
      kingdom_native: true,
      backend_incomplete: true,
      library_authority: libraryAuthority,
      next_step: nextStep,
    } as RecordLike,
    full_memo_url: releaseReadinessReviewUrl(intakeId),
    full_artifact: {
      ...nativePayload,
      preview_data: previewData,
    },
  };

  return sanitizeResolvedDecisionMemoSurfaceData({
    memoData,
    backendData: {
      ...nativePayload,
      preview_data: previewData,
      memo_data: memoData.memo_data,
      fullArtifact: memoData.full_artifact,
      full_artifact: memoData.full_artifact,
      resolvedDevelopmentsCount: 0,
    },
    fullArtifact: memoData.full_artifact ?? null,
    developmentsCount: 0,
  });
}

function buildPrincipalSurface(
  intakeId: string,
  surface: RecordLike,
): ResolvedDecisionMemoSurfaceData {
  const fullArtifact = hasKeys(surface.full_artifact) ? surface.full_artifact : null;
  const publicIntakeId = String(surface.public_intake_id ?? surface.intake_id ?? intakeId);
  const memoData = {
    success: surface.success ?? true,
    intake_id: publicIntakeId,
    generated_at: surface.generated_at ?? surface.generatedAt ?? new Date().toISOString(),
    documentTitle: surface.documentTitle,
    memoReference: surface.memoReference ?? publicIntakeId,
    surface_contract: surface.surface_contract,
    surface_contract_version: surface.surface_contract_version,
    preview_data: surface.preview_data,
    memo_data: surface.memo_data,
    full_memo_url: textOrNull(surface.full_memo_url) ?? releaseReadinessReviewUrl(publicIntakeId),
    full_artifact: fullArtifact ?? undefined,
  } as PdfMemoData;

  applyCanonicalCrossBorderAuditSummary(memoData, surface, fullArtifact);
  applyCanonicalWealthProjectionScenarios(memoData);

  const developmentsCount =
    numericOrNull(memoData.preview_data?.hnwi_world_count) ??
    numericOrNull(surface.preview_data?.hnwi_world_count);

  const publicBackendData: RecordLike = {
    status: surface.status ?? 'completed',
    surface_contract: surface.surface_contract,
    surface_contract_version: surface.surface_contract_version,
    intake_id: publicIntakeId,
    public_intake_id: publicIntakeId,
    memoReference: surface.memoReference ?? publicIntakeId,
    preview_data: memoData.preview_data,
    memo_data: memoData.memo_data,
    data_quality:
      memoData.preview_data?.data_quality ??
      fullArtifact?.data_quality,
    data_quality_note:
      memoData.preview_data?.data_quality_note ??
      fullArtifact?.data_quality_note,
    risk_assessment:
      memoData.preview_data?.risk_assessment ??
      fullArtifact?.risk_assessment,
    mitigationTimeline:
      memoData.preview_data?.risk_assessment?.mitigation_timeline ??
      fullArtifact?.risk_assessment?.mitigation_timeline,
    fullArtifact: fullArtifact ?? undefined,
    full_artifact: fullArtifact ?? undefined,
    resolvedDevelopmentsCount: developmentsCount ?? undefined,
  };

  return sanitizeResolvedDecisionMemoSurfaceData({
    memoData,
    backendData: publicBackendData,
    fullArtifact,
    developmentsCount,
  });
}

function mergePreviewData(basePreviewData: RecordLike, backendData: RecordLike, fullArtifact: RecordLike | null): RecordLike {
  const previewData = { ...basePreviewData };
  const memoData = backendData.memo_data ?? {};
  const artifact = fullArtifact ?? {};
  const memoPreview = memoData.preview_data ?? {};
  const artifactPreview = artifact.preview_data ?? {};
  const backendPreview = backendData.preview_data ?? {};

  previewData.transparency_regime_impact ??=
    memoPreview.transparency_regime_impact ??
    artifactPreview.transparency_regime_impact ??
    memoData.transparency_regime_impact ??
    artifact.transparency_regime_impact ??
    backendData.transparency_regime_impact;
  previewData.transparency_data ??=
    memoPreview.transparency_data ??
    artifactPreview.transparency_data ??
    memoData.transparency_data ??
    artifact.transparency_data ??
    backendData.transparency_data;

  previewData.crisis_resilience_stress_test ??=
    memoPreview.crisis_resilience_stress_test ??
    artifactPreview.crisis_resilience_stress_test ??
    memoData.crisis_resilience_stress_test ??
    artifact.crisis_resilience_stress_test ??
    backendData.crisis_resilience_stress_test;
  previewData.crisis_data ??=
    memoPreview.crisis_data ??
    artifactPreview.crisis_data ??
    memoData.crisis_data ??
    artifact.crisis_data ??
    backendData.crisis_data;

  previewData.peer_intelligence_analysis ??=
    memoData.peer_intelligence_analysis ??
    backendData.peer_intelligence_analysis;
  previewData.peer_intelligence_data ??=
    memoData.peer_intelligence_data ??
    backendData.peer_intelligence_data;

  previewData.market_dynamics_analysis ??=
    memoData.market_dynamics_analysis ??
    backendData.market_dynamics_analysis;
  previewData.market_dynamics_data ??=
    memoData.market_dynamics_data ??
    backendData.market_dynamics_data;

  previewData.implementation_roadmap_data ??=
    memoData.implementation_roadmap_data ??
    backendData.implementation_roadmap_data;

  previewData.due_diligence_data ??=
    memoData.due_diligence_data ??
    backendData.due_diligence_data;

  previewData.hnwi_trends_analysis ??=
    memoData.hnwi_trends_analysis ??
    backendData.hnwi_trends_analysis;

  previewData.risk_assessment ??=
    backendData.risk_assessment;

  if (Array.isArray(backendData.all_mistakes) && backendData.all_mistakes.length > 0) {
    previewData.all_mistakes = backendData.all_mistakes;
  }

  if (!hasKeys(previewData.heir_management_data)) {
    previewData.heir_management_data =
      memoPreview.heir_management_data ??
      artifactPreview.heir_management_data ??
      memoData.heir_management_data ??
      artifact.heir_management_data ??
      backendData.heir_management_data;
    previewData.heir_management_analysis =
      memoPreview.heir_management_analysis ??
      artifactPreview.heir_management_analysis ??
      memoData.heir_management_analysis ??
      artifact.heir_management_analysis ??
      backendData.heir_management_analysis;
  }

  if (!hasKeys(previewData.wealth_projection_data)) {
    previewData.wealth_projection_data =
      memoPreview.wealth_projection_data ??
      artifactPreview.wealth_projection_data ??
      memoData.wealth_projection_data ??
      artifact.wealth_projection_data ??
      backendData.wealth_projection_data;
    previewData.wealth_projection_analysis =
      memoPreview.wealth_projection_analysis ??
      artifactPreview.wealth_projection_analysis ??
      memoData.wealth_projection_analysis ??
      artifact.wealth_projection_analysis ??
      backendData.wealth_projection_analysis;
  }

  if (!hasKeys(previewData.scenario_tree_data)) {
    previewData.scenario_tree_data =
      memoPreview.scenario_tree_data ??
      artifactPreview.scenario_tree_data ??
      memoData.scenario_tree_data ??
      artifact.scenario_tree_data ??
      backendData.scenario_tree_data;
    previewData.scenario_tree_analysis =
      memoPreview.scenario_tree_analysis ??
      artifactPreview.scenario_tree_analysis ??
      memoData.scenario_tree_analysis ??
      artifact.scenario_tree_analysis ??
      backendData.scenario_tree_analysis;
  }

  if (!hasKeys(previewData.destination_drivers) || !Array.isArray(previewData.destination_drivers?.visa_programs)) {
    previewData.destination_drivers =
      memoPreview.destination_drivers ??
      artifactPreview.destination_drivers ??
      memoData.destination_drivers ??
      artifact.destination_drivers ??
      backendData.destination_drivers ??
      backendPreview.destination_drivers;
  }

  return previewData;
}

function buildFallbackMemoMetadata(fullArtifact: RecordLike | null): RecordLike {
  const intelligenceSources = fullArtifact?.intelligence_sources ?? fullArtifact?.intelligenceSources ?? {};

  return {
    kgv3_intelligence_used: {
      precedents:
        intelligenceSources.precedents_reviewed ??
        intelligenceSources.developmentsMatched ??
        0,
      failure_modes:
        intelligenceSources.failure_modes ??
        intelligenceSources.failurePatternsMatched ??
        0,
      sequencing_rules:
        intelligenceSources.sequence_corrections ??
        intelligenceSources.sequencingRulesApplied ??
        0,
      jurisdictions: 2,
    },
  };
}

function getCrossBorderAuditSummary(container?: RecordLike | null): RecordLike | null {
  if (!container) {
    return null;
  }

  return (
    container?.preview_data?.wealth_projection_data?.starting_position?.cross_border_audit_summary ??
    container?.wealth_projection_data?.starting_position?.cross_border_audit_summary ??
    container?.starting_position?.cross_border_audit_summary ??
    container?.cross_border_audit_summary ??
    null
  );
}

function mergeCrossBorderAuditSummary(base?: RecordLike | null, override?: RecordLike | null): RecordLike | null {
  if (!base && !override) {
    return null;
  }

  if (!base) {
    return override ? { ...override } : null;
  }

  if (!override) {
    return { ...base };
  }

  return {
    ...base,
    ...override,
    acquisition_audit: {
      ...(base.acquisition_audit ?? {}),
      ...(override.acquisition_audit ?? {}),
    },
  };
}

function normalizeCrossBorderAuditSummary(summary?: RecordLike | null): RecordLike | null {
  if (!summary) {
    return null;
  }

  const acquisitionAudit = summary.acquisition_audit ?? {};
  const totalTaxSavingsPct = numericOrNull(summary.total_tax_savings_pct);
  const derivedAcquisitionReliefPct =
    numericOrNull(summary.fta_acquisition_savings_pct) ??
    numericOrNull(acquisitionAudit.fta_acquisition_savings_pct) ??
    (() => {
      const scheduledRatePct = numericOrNull(acquisitionAudit.absd_schedule_rate_pct);
      const appliedRatePct = numericOrNull(acquisitionAudit.absd_applied_rate_pct);

      if (scheduledRatePct === null || appliedRatePct === null) {
        return null;
      }

      return scheduledRatePct - appliedRatePct;
    })();
  const derivedAcquisitionReliefUsd =
    numericOrNull(summary.fta_acquisition_savings_usd) ??
    numericOrNull(acquisitionAudit.fta_acquisition_savings_usd) ??
    (() => {
      const propertyValue = numericOrNull(acquisitionAudit.property_value);
      if (propertyValue === null || derivedAcquisitionReliefPct === null) {
        return null;
      }

      return (propertyValue * derivedAcquisitionReliefPct) / 100;
    })();
  const ongoingTaxSavingsPct =
    numericOrNull(summary.ongoing_tax_savings_pct) ??
    (derivedAcquisitionReliefPct !== null && totalTaxSavingsPct !== null && derivedAcquisitionReliefPct === totalTaxSavingsPct
      ? 0
      : null);
  const propertyValue =
    numberOrNull(acquisitionAudit.property_value_usd) ??
    numberOrNull(acquisitionAudit.property_value);
  const totalAcquisitionCost =
    numberOrNull(acquisitionAudit.total_acquisition_cost_usd) ??
    numberOrNull(acquisitionAudit.total_acquisition_cost);
  const totalStampDuties =
    numberOrNull(acquisitionAudit.total_stamp_duties_usd) ??
    numberOrNull(acquisitionAudit.total_stamp_duties);
  const bsd =
    numberOrNull(acquisitionAudit.bsd_stamp_duty_usd) ??
    numberOrNull(acquisitionAudit.bsd_stamp_duty) ??
    numberOrNull(acquisitionAudit.bsd);
  const absd =
    numberOrNull(acquisitionAudit.absd_additional_stamp_duty_usd) ??
    numberOrNull(acquisitionAudit.absd_additional_stamp_duty) ??
    numberOrNull(acquisitionAudit.absd);

  return {
    ...summary,
    ongoing_tax_savings_pct: ongoingTaxSavingsPct ?? summary.ongoing_tax_savings_pct,
    fta_acquisition_savings_pct: derivedAcquisitionReliefPct ?? summary.fta_acquisition_savings_pct,
    fta_acquisition_savings_usd: derivedAcquisitionReliefUsd ?? summary.fta_acquisition_savings_usd,
    acquisition_audit: {
      ...acquisitionAudit,
      property_value_formatted:
        acquisitionAudit.property_value_formatted ?? formatUsd(propertyValue),
      total_acquisition_cost_formatted:
        acquisitionAudit.total_acquisition_cost_formatted ?? formatUsd(totalAcquisitionCost),
      total_stamp_duties_formatted:
        acquisitionAudit.total_stamp_duties_formatted ?? formatUsd(totalStampDuties),
      day_one_loss_amount:
        acquisitionAudit.day_one_loss_amount ?? totalStampDuties ?? undefined,
      day_one_loss_amount_formatted:
        acquisitionAudit.day_one_loss_amount_formatted ?? formatUsd(totalStampDuties),
      bsd_stamp_duty_formatted:
        acquisitionAudit.bsd_stamp_duty_formatted ?? formatUsd(bsd),
      absd_additional_stamp_duty_formatted:
        acquisitionAudit.absd_additional_stamp_duty_formatted ?? formatUsd(absd),
      fta_acquisition_savings_pct:
        derivedAcquisitionReliefPct ?? acquisitionAudit.fta_acquisition_savings_pct,
      fta_acquisition_savings_usd:
        derivedAcquisitionReliefUsd ?? acquisitionAudit.fta_acquisition_savings_usd,
    },
  };
}

function applyCanonicalCrossBorderAuditSummary(
  memoData: PdfMemoData,
  backendData?: RecordLike | null,
  fullArtifact?: RecordLike | null,
) {
  const mergedSummary = normalizeCrossBorderAuditSummary(
    mergeCrossBorderAuditSummary(
      mergeCrossBorderAuditSummary(
        getCrossBorderAuditSummary(backendData),
        getCrossBorderAuditSummary(memoData as RecordLike),
      ),
      getCrossBorderAuditSummary(fullArtifact),
    ),
  );

  if (!mergedSummary) {
    return;
  }

  memoData.preview_data = memoData.preview_data ?? {};
  memoData.preview_data.wealth_projection_data = memoData.preview_data.wealth_projection_data ?? {};
  memoData.preview_data.wealth_projection_data.starting_position =
    memoData.preview_data.wealth_projection_data.starting_position ?? {};
  memoData.preview_data.wealth_projection_data.starting_position.cross_border_audit_summary = mergedSummary;
}

export function resolveDecisionMemoSurfaceData({
  intakeId,
  backendData,
  fullArtifact,
}: ResolveDecisionMemoSurfaceDataInput): ResolvedDecisionMemoSurfaceData | null {
  const principalSurface = extractPrincipalSurfacePayload(backendData, fullArtifact);
  if (principalSurface) {
    return buildPrincipalSurface(intakeId, principalSurface);
  }

  const kingdomNativePreviewSurface = buildKingdomNativePreviewSurface(intakeId, backendData);
  if (kingdomNativePreviewSurface) {
    return kingdomNativePreviewSurface;
  }

  const normalizedBackendData = backendData
    ? ({
        ...backendData,
        preview_data: backendData.preview_data_v2 ?? backendData.preview_data,
        memo_data: backendData.memo_data_v2 ?? backendData.memo_data,
        full_artifact:
          backendData.full_artifact_v2 ??
          backendData.full_artifact ??
          backendData.fullArtifact ??
          backendData.memoData?.full_artifact ??
          backendData.memoData?.artifact,
        fullArtifact:
          backendData.full_artifact_v2 ??
          backendData.fullArtifact ??
          backendData.full_artifact ??
          backendData.memoData?.full_artifact ??
          backendData.memoData?.artifact,
        risk_assessment:
          backendData.risk_assessment ??
          backendData.preview_data_v2?.risk_assessment ??
          backendData.preview_data?.risk_assessment,
        all_mistakes:
          backendData.all_mistakes ??
          backendData.preview_data_v2?.all_mistakes ??
          backendData.preview_data?.all_mistakes,
        mitigationTimeline:
          backendData.mitigationTimeline ??
          backendData.preview_data_v2?.risk_assessment?.mitigation_timeline ??
          backendData.preview_data?.risk_assessment?.mitigation_timeline,
      } as RecordLike)
    : null;
  const normalizedFullArtifact = normalizeFullArtifact(normalizedBackendData, fullArtifact);

  if (!normalizedBackendData?.preview_data && !normalizedFullArtifact) {
    return null;
  }

  const memoData = normalizedBackendData?.preview_data
    ? ({
        ...normalizedBackendData,
        success: normalizedBackendData.success ?? true,
        intake_id: normalizedBackendData.intake_id ?? intakeId,
        generated_at:
          normalizedBackendData.generated_at ??
          normalizedFullArtifact?.generatedAt ??
          new Date().toISOString(),
        preview_data: mergePreviewData(
          normalizedBackendData.preview_data,
          normalizedBackendData,
          normalizedFullArtifact,
        ),
        memo_data:
          normalizedBackendData.memo_data ??
          buildFallbackMemoMetadata(normalizedFullArtifact),
        full_memo_url:
          textOrNull(normalizedBackendData.full_memo_url) ??
          releaseReadinessReviewUrl(String(normalizedBackendData.intake_id ?? intakeId)),
        full_artifact:
          normalizedBackendData.full_artifact ??
          normalizedBackendData.fullArtifact ??
          normalizedFullArtifact ??
          undefined,
      } as PdfMemoData)
    : ({
        ...transformICArtifactToMemoData(normalizedFullArtifact as ICArtifact, intakeId),
        full_artifact: normalizedFullArtifact ?? undefined,
      } as PdfMemoData);

  if (
    memoData.preview_data?.wealth_projection_data?.starting_position &&
    !memoData.preview_data.wealth_projection_data.starting_position.cross_border_audit_summary
  ) {
    const assembledAudit = assembleCrossBorderAudit(
      memoData.preview_data,
      memoData.preview_data.wealth_projection_data.starting_position,
      memoData.preview_data.real_asset_audit,
    );

    if (assembledAudit) {
      memoData.preview_data.wealth_projection_data.starting_position.cross_border_audit_summary = assembledAudit;
    }
  }

  applyCanonicalCrossBorderAuditSummary(
    memoData,
    normalizedBackendData,
    normalizedFullArtifact,
  );
  applyCanonicalWealthProjectionScenarios(memoData);

  const developmentsCount =
    numericOrNull(memoData.preview_data?.hnwi_world_count) ??
    numericOrNull(normalizedBackendData?.preview_data?.hnwi_world_count);

  return sanitizeResolvedDecisionMemoSurfaceData({
    memoData,
    backendData: {
      ...(normalizedBackendData ?? {}),
      fullArtifact: normalizedFullArtifact ?? undefined,
      full_artifact: normalizedFullArtifact ?? undefined,
      resolvedDevelopmentsCount: developmentsCount ?? undefined,
    },
    fullArtifact: normalizedFullArtifact,
    developmentsCount,
  });
}
