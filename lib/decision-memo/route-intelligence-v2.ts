import type { ResolvedDecisionMemoSurfaceData } from '@/lib/decision-memo/resolve-decision-memo-surface-data';

type RecordLike = Record<string, any>;

export const ROUTE_INTELLIGENCE_V2_CONTRACT = 'hnwi_route_intelligence_surface_v2';

export type RouteReleaseRule = 'Release Differently' | 'Hold' | 'Stop';

export interface RouteEvidenceGate {
  gate: string;
  owner: string;
  evidenceRequired: string;
  releaseStatus: string;
  consequenceIfMissing: string;
}

export interface RouteStressSignal {
  label: string;
  value: string;
  read: string;
}

export interface RouteScenarioPoint {
  scenario: 'Base case' | 'Stress case' | 'Opportunity case';
  year10ValueUsd: number;
  netOutcomeUsd: number;
  read: string;
  trajectory?: Array<{
    year: number;
    valueUsd: number;
    netOutcomeUsd: number;
  }>;
}

export interface BuyerProfileMatrixRow {
  profile: string;
  firstResidential: string;
  secondResidential: string;
  thirdAndSubsequent: string;
  releaseRead: string;
  evidenceRequired: string;
}

export interface BuyerProfileRemissionMatrix {
  title: string;
  sourceRead: string;
  dubaiRead: string;
  ftaRead: string;
  counselQuestion: string;
  matrix: BuyerProfileMatrixRow[];
}

export interface PrincipalValueGate {
  status: string;
  test: string;
  answer: string;
  nonRedundantEdges: string[];
  advisorNonRedundancyTest: Array<{
    adviserLane: string;
    dm64Difference: string;
  }>;
  replaceabilityRejectionRegister: Array<{
    replaceableOutput: string;
    whyRejected: string;
  }>;
  releaseStatus: string;
}

export interface RouteDriverSourceRecord {
  id?: string;
  title?: string;
  summary?: string;
  url?: string;
  source_url?: string;
  date?: string;
  source_date?: string | { $date?: string };
  industry?: string;
  decision_posture?: string;
  quality_score?: number;
  [key: string]: unknown;
}

export interface RouteDriverRegisterItem {
  id: string;
  title: string;
  driver: string;
  releaseRead?: string;
  evidenceBasis?: string;
  familyAction?: string;
  testApplied?: string;
  testResult?: string;
  principalInstruction?: string;
  capitalConsequence?: string;
  sourceIds: string[];
  sources: RouteDriverSourceRecord[];
}

export interface RouteIntelligenceOptionV2 {
  id: string;
  rank: number;
  routeName: string;
  routeType: string;
  verdict: string;
  releaseRule: RouteReleaseRule;
  bestUse: string;
  economicRead: string;
  failureMode: string;
  releaseEffect: string;
  taxAudit: RecordLike;
  metrics: {
    propertyValueUsd: number;
    bsdUsd: number;
    absdUsd: number;
    totalDutiesUsd: number;
    totalAcquisitionCostUsd: number;
    incrementalDutyVsRecommendedUsd: number;
    dutyDragPct: number;
    annualCarryingCostUsd: number;
    dataQuality: string;
    mitigationTimeline: string;
  };
  jurisdictionValues: Array<{
    jurisdiction: string;
    value: string;
    releaseRead: string;
  }>;
  evidenceGates: RouteEvidenceGate[];
  responsibilityTransfer: Array<{
    action: string;
    primaryOwner: string;
    fallbackOwner: string;
    releaseCondition: string;
  }>;
  recordMismatchMap: Array<{
    record: string;
    currentRead: string;
    targetRead: string;
    releaseStatus: string;
  }>;
  counselQuestionPack: Array<{
    desk: string;
    question: string;
  }>;
  stressSignals: RouteStressSignal[];
  scenarios: RouteScenarioPoint[];
}

export interface RouteIntelligenceV2 {
  surfaceContract: typeof ROUTE_INTELLIGENCE_V2_CONTRACT;
  surfaceEyebrow?: string;
  surfaceTitle?: string;
  nativeRouteDrivers?: string[];
  nativeRouteDriverTitle?: string;
  nativeRouteDriverSubtitle?: string;
  nativeRouteDriverNote?: string;
  routeDriverRegister?: {
    items: RouteDriverRegisterItem[];
  };
  selectorLabel?: string;
  selectorCopy?: string;
  comparisonLabel?: string;
  comparisonTitle?: string;
  selectedRouteLabel?: string;
  memoReference: string;
  generatedAt?: string;
  corridor: string;
  move: string;
  recommendedRouteId: string;
  selectedLiveOption?: RouteIntelligenceOptionV2;
  proposedRoute?: RouteIntelligenceOptionV2;
  pressureVariants?: RouteIntelligenceOptionV2[];
  routeOptions: RouteIntelligenceOptionV2[];
  buyerProfileMatrix: BuyerProfileRemissionMatrix;
  principalValueGate?: PrincipalValueGate;
  routeMemoSpine?: RecordLike;
  sourceRead: string;
}

function isRecord(value: unknown): value is RecordLike {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function asRecord(value: unknown): RecordLike {
  return isRecord(value) ? value : {};
}

function asArray(value: unknown): RecordLike[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item || '').trim()).filter(Boolean) : [];
}

function hasKeys(value: unknown): value is RecordLike {
  return isRecord(value) && Object.keys(value).length > 0;
}

function isBlankPreviewValue(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (isRecord(value)) return Object.keys(value).length === 0;
  return false;
}

function buildRouteMemoSpine(preview: RecordLike): RecordLike {
  const operational = asRecord(preview.operational_chain_readiness);
  const gating = asRecord(preview.gating_conditions);
  const mechanical = asRecord(preview.mechanical_control_test);
  const recordMismatch = asRecord(preview.record_mismatch_map);
  const authority = asRecord(preview.authority_and_veto_matrix);
  const decisionMemory = asRecord(preview.decision_memory_packet);
  const assumptionLedger = asRecord(preview.assumption_ledger);
  const taxReporting = asRecord(preview.tax_residency_reporting);
  const transparency = asRecord(preview.transparency_data);

  const spine = {
    operationalChain: {
      readiness: operational,
      informationFlow: asArray(
        preview.information_flow_dashboard ??
          operational.information_flow_dashboard,
      ),
      responsibilityTransfer: asArray(
        preview.responsibility_transfer_matrix ??
          operational.responsibility_transfer,
      ),
      recordMismatch: asArray(recordMismatch.matrix ?? recordMismatch.documents),
      decisionMemory,
    },
    trustBoundary: {
      transparency,
      sourceRegister: asArray(preview.governing_source_register ?? preview.source_register).slice(0, 12),
      taxReporting,
    },
    gateStandards: {
      gating,
      criticalGates: asStringArray(gating.critical_gates),
      abortTriggers: asStringArray(gating.abort_triggers),
      executionSequence: asArray(preview.execution_sequence).slice(0, 12),
      executionTimeline: asArray(preview.execution_timeline).slice(0, 18),
    },
    capitalFlow: asRecord(preview.capital_flow_data),
    mechanicalControl: mechanical,
    dueDiligenceChecklist: asArray(preview.programmatic_dd_checklist).slice(0, 32),
    familyReadiness: {
      authorityAndVeto: authority,
      consequences: asStringArray(preview.family_consequence_register).slice(0, 12),
      sourceContinuity: asArray(preview.source_jurisdiction_continuity_control),
    },
    assumptionsAndFailures: {
      assumptionLedger,
      failureModes: asArray(preview.failure_modes).slice(0, 12),
    },
    crisisAndContinuity: {
      crisisResilienceStressTest: asArray(preview.crisis_resilience_stress_test).slice(0, 12),
      antifragileResilienceTest: asArray(preview.antifragile_resilience_test).slice(0, 12),
      generationalView: preview.generational_view,
      heirManagementData: preview.heir_management_data,
    },
  };

  return Object.fromEntries(
    Object.entries(spine).filter(([, value]) => !isBlankPreviewValue(value)),
  );
}

const ROUTE_REVIEW_PREVIEW_KEYS = [
  'zero_trust_move_intake',
  'responsibility_transfer_matrix',
  'record_mismatch_map',
  'counsel_operator_question_pack',
  'programmatic_dd_checklist',
  'crisis_resilience_stress_test',
  'antifragile_resilience_test',
  'bank_compliance_escalation_simulation',
  'heir_management_data',
  'heir_management_analysis',
  'generational_view',
  'wealth_projection_analysis',
  'scenario_tree_analysis',
  'crisis_data',
  'carrying_cost_model',
  'cross_border_audit_summary',
  'structure_optimization',
  'wealth_projection_data',
  'route_intelligence_v2',
  'release_decision_packet',
  'release_rule',
  'evidence_status',
  'contradiction_register',
  'execution_timeline',
  'real_asset_route_readiness',
  'tax_jurisdiction_notes',
] as const;

function candidatePreviewRecords(record: unknown): RecordLike[] {
  const root = asRecord(record);
  const artifact = asRecord(root.artifact);
  const fullArtifact = asRecord(root.fullArtifact ?? root.full_artifact);
  return [
    asRecord(root.preview_data),
    asRecord(artifact.preview_data),
    asRecord(fullArtifact.preview_data),
    artifact,
    fullArtifact,
    root,
  ].filter(hasKeys);
}

function mergedPreviewData(primary: unknown, records: unknown[]): RecordLike {
  const merged: RecordLike = {};
  const candidates = [
    ...records.flatMap(candidatePreviewRecords),
    asRecord(primary),
  ];

  for (const candidate of candidates) {
    for (const [key, value] of Object.entries(candidate)) {
      if (isBlankPreviewValue(merged[key]) && !isBlankPreviewValue(value)) {
        merged[key] = value;
      }
    }
  }

  const primaryRecord = asRecord(primary);
  for (const [key, value] of Object.entries(primaryRecord)) {
    if (!isBlankPreviewValue(value)) {
      merged[key] = value;
    }
  }

  for (const key of ROUTE_REVIEW_PREVIEW_KEYS) {
    if (!isBlankPreviewValue(merged[key])) continue;
    for (const candidate of candidates) {
      if (!isBlankPreviewValue(candidate[key])) {
        merged[key] = candidate[key];
        break;
      }
    }
  }

  return merged;
}

function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function textList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => text(item))
    .filter(Boolean);
}

type JurisdictionContext = {
  sourceLabel: string;
  destinationLabel: string;
  destinationShort: string;
  sourceBankLabel: string;
  receivingBankLabel: string;
  propertyCounselLabel: string;
  taxCounselLabel: string;
  primaryFeeLabel: string;
  secondaryFeeLabel: string;
  earlyExitFeeLabel: string;
  isUk: boolean;
  isSingapore: boolean;
};

type RouteNumericBasis = {
  propertyValueUsd: number;
  bsdUsd: number;
  directAbsdUsd: number;
  directDutiesUsd: number;
  directAllInUsd: number;
  entityDutiesUsd: number;
  entityIncrementalUsd: number;
  annualCarryingCostUsd: number;
};

function firstTextFromRecords(records: RecordLike[], keys: string[], fallback = ''): string {
  for (const record of records) {
    for (const key of keys) {
      const value = text(record[key]);
      if (value) return value;
    }
  }
  return fallback;
}

function jurisdictionContextFromRecords(records: RecordLike[]): JurisdictionContext {
  const sourceLabel = firstTextFromRecords(records, [
    'source_jurisdiction',
    'sourceJurisdiction',
    'source_country',
    'sourceCountry',
    'source_city',
    'sourceCity',
  ], 'Source jurisdiction');
  const destinationLabel = firstTextFromRecords(records, [
    'destination_jurisdiction',
    'destinationJurisdiction',
    'destination_country',
    'destinationCountry',
    'destination_city',
    'destinationCity',
  ], 'Destination jurisdiction');
  const destinationLower = destinationLabel.toLowerCase();
  const sourceLower = sourceLabel.toLowerCase();
  const isUk = /united kingdom|\buk\b|london|england|mayfair/.test(destinationLower);
  const isSingapore = /singapore/.test(destinationLower);
  const sourceBankLabel = /dubai|uae|united arab emirates/.test(sourceLower)
    ? 'UAE source bank'
    : 'source bank';
  const destinationShort = isUk ? 'UK' : isSingapore ? 'Singapore' : destinationLabel;
  return {
    sourceLabel,
    destinationLabel,
    destinationShort,
    sourceBankLabel,
    receivingBankLabel: `${destinationShort} receiving bank`,
    propertyCounselLabel: `${destinationShort} property counsel`,
    taxCounselLabel: `${destinationShort} tax counsel`,
    primaryFeeLabel: isUk ? 'Base SDLT' : isSingapore ? 'BSD' : 'Primary transfer duty',
    secondaryFeeLabel: isUk
      ? 'Non-resident and additional-dwelling surcharge'
      : isSingapore
        ? 'ABSD'
        : 'Additional buyer or transfer surcharge',
    earlyExitFeeLabel: isUk ? 'post-acquisition tax/reporting' : isSingapore ? 'SSD' : 'early-exit duty',
    isUk,
    isSingapore,
  };
}

function recordArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value.filter(isRecord) as T[]) : [];
}

function routeEvidenceGates(route: RouteIntelligenceOptionV2): RouteEvidenceGate[] {
  return recordArray<RouteEvidenceGate>((route as { evidenceGates?: unknown }).evidenceGates);
}

function routeResponsibilityTransfer(route: RouteIntelligenceOptionV2): RouteIntelligenceOptionV2['responsibilityTransfer'] {
  return recordArray<RouteIntelligenceOptionV2['responsibilityTransfer'][number]>(
    (route as { responsibilityTransfer?: unknown }).responsibilityTransfer,
  );
}

function routeRecordMismatchMap(route: RouteIntelligenceOptionV2): RouteIntelligenceOptionV2['recordMismatchMap'] {
  return recordArray<RouteIntelligenceOptionV2['recordMismatchMap'][number]>(
    (route as { recordMismatchMap?: unknown }).recordMismatchMap,
  );
}

function routeScenarios(route: RouteIntelligenceOptionV2): RouteScenarioPoint[] {
  return recordArray<RouteScenarioPoint>((route as { scenarios?: unknown }).scenarios);
}

function normalizeKey(value: unknown, fallback: string): string {
  const raw = text(value, fallback);
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || fallback;
}

function sanitizeRouteDriverTitle(value: unknown): string {
  const title = text(value, 'Route Drivers From Source Review');
  return /native\s+route\s+drivers/i.test(title)
    ? 'Route Drivers From Source Review'
    : title;
}

function sanitizeRouteDriverNote(value: unknown): string {
  const note = text(
    value,
    'Route-pattern source records explain why a release gate matters; public law, market, bank, title, and family-document evidence still govern final release.',
  );
  return note
    .replace(/\bPattern intelligence\b/gi, 'Route-pattern source records')
    .replace(/\bnative\b/gi, 'stored')
    .trim();
}

function routeDriverSourceId(driverId: string, source: RouteDriverSourceRecord, sourceIndex: number): string {
  return text(
    source.id ?? source.source_development_id ?? source.dev_id ?? source.devid,
    `route_driver_${driverId}_${sourceIndex + 1}`,
  );
}

function normalizeRouteDriverSource(source: unknown): RouteDriverSourceRecord {
  const record = asRecord(source);
  const sourceDate = record.source_date;
  const normalizedDate =
    typeof sourceDate === 'string'
      ? sourceDate
      : isRecord(sourceDate)
        ? text(sourceDate.$date)
        : text(record.date);

  return {
    ...record,
    id: text(record.id ?? record.source_development_id ?? record.dev_id ?? record.devid),
    title: text(record.title ?? record.source_title ?? record.name, 'Source record'),
    summary: text(record.summary ?? record.reference ?? record.claim_supported ?? record.description),
    url: text(record.url ?? record.source_url),
    source_url: text(record.source_url ?? record.url),
    date: normalizedDate || undefined,
    source_date: normalizedDate || undefined,
    industry: text(record.industry ?? record.category, 'Route Evidence'),
    decision_posture: text(record.decision_posture),
    quality_score: typeof record.quality_score === 'number' ? record.quality_score : undefined,
  };
}

function normalizeRouteDriverRegister(value: unknown): { items: RouteDriverRegisterItem[] } | undefined {
  const record = asRecord(value);
  const rawItems = Array.isArray(record.items)
    ? record.items
    : Array.isArray(value)
      ? value
      : [];

  const items = rawItems
    .filter(isRecord)
    .map((item, index) => {
      const id = normalizeKey(item.id ?? item.title, `driver_${index + 1}`);
      const sources = (Array.isArray(item.sources) ? item.sources : [])
        .map(normalizeRouteDriverSource)
        .filter((source) => Boolean(source.title || source.summary || source.url));
      const sourceIds = sources.map((source, sourceIndex) => routeDriverSourceId(id, source, sourceIndex));

      return {
        id,
        title: text(item.title, `Route driver ${index + 1}`),
        driver: text(item.driver ?? item.text ?? item.summary),
        releaseRead: text(item.releaseRead ?? item.release_read),
        evidenceBasis: text(item.evidenceBasis ?? item.evidence_basis),
        familyAction: text(item.familyAction ?? item.family_action),
        testApplied: text(item.testApplied ?? item.test_applied),
        testResult: text(item.testResult ?? item.test_result),
        principalInstruction: text(item.principalInstruction ?? item.principal_instruction),
        capitalConsequence: text(item.capitalConsequence ?? item.capital_consequence),
        sourceIds,
        sources: sources.map((source, sourceIndex) => ({
          ...source,
          id: sourceIds[sourceIndex],
        })),
      };
    })
    .filter((item) => Boolean(item.driver || item.title));

  return items.length ? { items } : undefined;
}

function numberOr(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const multiplier = /\bbn?\b/i.test(value)
      ? 1_000_000_000
      : /\bm\b/i.test(value)
        ? 1_000_000
        : /\bk\b/i.test(value)
          ? 1_000
          : 1;
    const parsed = Number(value.replace(/[^0-9.-]/g, ''));
    if (Number.isFinite(parsed)) {
      return parsed * multiplier;
    }
  }
  return fallback;
}

function roundCurrency(value: number): number {
  return Number.isFinite(value) ? Math.round(value) : 0;
}

export function formatUsdCompact(value: number): string {
  if (!Number.isFinite(value)) {
    return 'US$0';
  }
  const sign = value < 0 ? '-' : '';
  const absolute = Math.abs(value);
  if (absolute >= 1_000_000) {
    return `${sign}US$${(absolute / 1_000_000).toFixed(1)}M`;
  }
  if (absolute >= 1_000) {
    return `${sign}US$${Math.round(absolute / 1_000).toLocaleString('en-US')}K`;
  }
  return `${sign}US$${Math.round(absolute).toLocaleString('en-US')}`;
}

function cloneRecord<T extends RecordLike>(value: T): T {
  return JSON.parse(JSON.stringify(value || {})) as T;
}

function slugRouteId(routeName: string, rank: number): string {
  const lower = routeName.toLowerCase();
  if (lower.includes('direct') && (lower.includes('foreign') || lower.includes('individual'))) {
    return 'direct_foreign_individual';
  }
  if (
    lower.includes('entity') ||
    lower.includes('trustee') ||
    lower.includes('company') ||
    lower.includes('corporate') ||
    lower.includes('ownership structure') ||
    lower.includes('non-natural') ||
    lower.includes('non natural')
  ) {
    return 'entity_trustee';
  }
  if (lower.includes('status') || lower.includes('remission') || lower.includes('residence')) {
    return 'status_remission';
  }
  if (lower.includes('hold') || lower.includes('rent')) {
    return 'hold_rent_first';
  }
  if (lower.includes('stop')) {
    return 'stop_route';
  }
  const slug = routeName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return slug || `route_${rank}`;
}

function routeKind(routeName: string): 'direct' | 'entity' | 'status' | 'hold' | 'stop' | 'other' {
  const lower = routeName.toLowerCase();
  if (lower.includes('direct') && (lower.includes('foreign') || lower.includes('individual'))) return 'direct';
  if (
    lower.includes('entity') ||
    lower.includes('trustee') ||
    lower.includes('company') ||
    lower.includes('corporate') ||
    lower.includes('ownership structure') ||
    lower.includes('non-natural') ||
    lower.includes('non natural')
  ) return 'entity';
  if (lower.includes('status') || lower.includes('remission') || lower.includes('residence')) return 'status';
  if (lower.includes('hold') || lower.includes('rent')) return 'hold';
  if (lower.includes('stop')) return 'stop';
  return 'other';
}

function surfaceStatus(value: unknown): string {
  const raw = text(value);
  if (!raw) return '';
  if (/^release-gated$/i.test(raw)) return 'Signed gate controls release';
  if (/^evidence gated$/i.test(raw)) return 'Evidence mapped; signed gate controls release';
  return raw;
}

function zeroTrustIntake(preview?: RecordLike): RecordLike {
  return asRecord(preview?.zero_trust_move_intake ?? preview?.zeroTrustMoveIntake);
}

function hasReviewedEvidenceBundle(preview?: RecordLike): boolean {
  const counts = asRecord(zeroTrustIntake(preview).declared_counts);
  return (
    numberOr(counts.confirmed) > 0 &&
    numberOr(counts.missing) === 0 &&
    numberOr(counts.contradicted) === 0
  );
}

function reviewedGateStatus(preview?: RecordLike): string {
  return hasReviewedEvidenceBundle(preview)
    ? 'Gate mapped for release-readiness review; signed gate controls capital release'
    : 'Evidence mapped; signed gate controls capital release';
}

function reviewedRecordStatus(preview?: RecordLike): string {
  return hasReviewedEvidenceBundle(preview)
    ? 'Gate mapped; keep synchronized before bid, exchange, and completion'
    : 'Evidence mapped; signed gate controls capital release';
}

function mapEvidenceOwner(record: RecordLike): string {
  return text(
    record.owner ??
      record.responsible ??
      record.responsible_party ??
      record.desk ??
      record.adviser ??
      record.role,
    'Family office operator / CFO',
  );
}

function memoEvidenceGates(preview?: RecordLike): RouteEvidenceGate[] {
  const intake = zeroTrustIntake(preview);
  const rawRecords = [
    ...asArray(intake.records),
    ...asArray(intake.evidence_records),
    ...asArray(intake.document_bundle),
    ...asArray(intake.adviser_confirmations),
    ...asArray(preview?.programmatic_dd_checklist),
    ...asArray(asRecord(preview?.programmatic_dd_checklist).items),
    ...asArray(asRecord(preview?.programmatic_dd_checklist).checklist),
    ...asArray(asRecord(preview?.dd_checklist).items),
    ...asArray(asRecord(preview?.dd_checklist).checklist),
  ];
  const status = reviewedGateStatus(preview);
  const mapped = rawRecords
    .map((record, index): RouteEvidenceGate => {
      const gate = text(
        record.gate ??
          record.category ??
          record.label ??
          record.record ??
          record.document_class ??
          record.documentClass ??
          record.evidence_class ??
          record.evidenceClass ??
          record.name,
        'Input evidence record',
      );
      const evidenceRequired = text(
        record.detail ??
          record.evidence ??
          record.evidence_required ??
          record.evidenceRequired ??
          record.item ??
          record.description ??
          record.requirement ??
          record.requirements ??
          record.summary,
        'Evidence reviewed in the zero-trust bundle; signed gate controls capital release.',
      );
      const releaseEffect = text(
        record.release_effect ??
          record.releaseEffect ??
          record.consequence_if_missing ??
          record.consequenceIfMissing ??
          record.why_it_matters ??
          record.whyItMatters ??
          record.blocker ??
          record.status,
        'Capital remains blocked until this evidence class is signed or indexed for the release room.',
      );
      return {
        gate,
        owner: mapEvidenceOwner(record),
        evidenceRequired,
        releaseStatus: status,
        consequenceIfMissing: releaseEffect,
      };
    })
    .filter((gate) => Boolean(gate.gate && gate.evidenceRequired));

  return mapped.filter((gate, index, list) => (
    list.findIndex((candidate) => candidate.gate.toLowerCase() === gate.gate.toLowerCase()) === index
  ));
}

function memoResponsibilityTransfer(preview?: RecordLike): RouteIntelligenceOptionV2['responsibilityTransfer'] {
  const rows = asArray(preview?.responsibility_transfer_matrix ?? preview?.responsibilityTransferMatrix);
  return rows
    .map((row): RouteIntelligenceOptionV2['responsibilityTransfer'][number] => {
      const party = text(row.party ?? row.role ?? row.owner, 'Release owner');
      const releaseStatus = surfaceStatus(row.release_status ?? row.releaseStatus);
      return {
        action: party,
        primaryOwner: party,
        fallbackOwner: text(row.fallback_owner ?? row.fallbackOwner, 'Family office operator / CFO'),
        releaseCondition: [
          `See: ${text(row.can_see ?? row.canSee, 'by permission')}`,
          `Stop: ${text(row.can_stop ?? row.canStop, 'as recorded')}`,
          `Sign: ${text(row.can_sign ?? row.canSign, 'as recorded')}`,
          `Move: ${text(row.can_move ?? row.canMove, 'as recorded')}`,
          `Retrieve: ${text(row.can_retrieve ?? row.canRetrieve, 'as recorded')}`,
          `Explain: ${text(row.can_explain ?? row.canExplain, 'as recorded')}`,
          releaseStatus || reviewedGateStatus(preview),
        ].join('; '),
      };
    })
    .filter((row) => Boolean(row.action));
}

function memoRecordMismatchMap(preview?: RecordLike): RouteIntelligenceOptionV2['recordMismatchMap'] {
  const mismatch = asRecord(preview?.record_mismatch_map ?? preview?.recordMismatchMap);
  const rows = asArray(mismatch.matrix ?? mismatch.records ?? mismatch.items);
  const pendingCurrentRead = (row: RecordLike): string => {
    const record = text(row.record ?? row.name ?? row.label, 'record');
    return `To be evidenced before release: ${record} must be reconciled across counsel, bank, tax, title, source, and family-authority records.`;
  };
  return rows
    .map((row): RouteIntelligenceOptionV2['recordMismatchMap'][number] => ({
      record: text(row.record ?? row.name ?? row.label, 'Record'),
      currentRead: pendingCurrentRead(row),
      targetRead: text(
        row.target_record ?? row.targetRecord ?? row.target_read ?? row.targetRead,
        'One route story across source funds, buyer route, title, tax, bank file, authority minute, and decision memory.',
      ),
      releaseStatus: reviewedRecordStatus(preview),
    }))
    .filter((row) => Boolean(row.record));
}

function memoCounselQuestionPack(preview?: RecordLike): RouteIntelligenceOptionV2['counselQuestionPack'] {
  const rows = asArray(preview?.counsel_operator_question_pack ?? preview?.counselOperatorQuestionPack);
  return rows
    .map((row): RouteIntelligenceOptionV2['counselQuestionPack'][number] => ({
      desk: text(row.domain ?? row.desk ?? row.adviser ?? row.owner, 'Adviser desk'),
      question: text(row.question ?? row.ask ?? row.prompt),
    }))
    .filter((row) => Boolean(row.question));
}

function normalizeRouteOptionForSurface(
  route: RouteIntelligenceOptionV2,
  context: JurisdictionContext,
  preview?: RecordLike,
  baseTaxAudit?: RecordLike,
  values?: RouteNumericBasis,
): RouteIntelligenceOptionV2 {
  const rank = numberOr((route as RecordLike).rank, 1);
  const routeName = text(
    (route as RecordLike).routeName,
    text((route as RecordLike).route, `Route ${rank}`),
  );
  const routeRecord = {
    route: routeName,
    best_use: (route as RecordLike).bestUse,
    economic_read: (route as RecordLike).economicRead,
    failure_mode: (route as RecordLike).failureMode,
    release_effect: (route as RecordLike).releaseEffect,
    verdict: (route as RecordLike).verdict,
  };
  const derived = preview && baseTaxAudit && values
    ? deriveRouteOption(routeRecord, Math.max(0, rank - 1), preview, baseTaxAudit, context, values)
    : route;
  const sourceRoute = {
    ...derived,
    ...route,
    metrics: derived.metrics,
    rank,
    routeName,
  };
  const fallbackRoute = {
    ...derived,
    routeName,
  };
  const routeCounselQuestions = recordArray<RouteIntelligenceOptionV2['counselQuestionPack'][number]>(
    (sourceRoute as RecordLike).counselQuestionPack ??
      (sourceRoute as RecordLike).counselQuestions ??
      (sourceRoute as RecordLike).counsel_question_pack,
  );
  const routeEvidence = recordArray<RouteEvidenceGate>((sourceRoute as RecordLike).evidenceGates);
  const routeResponsibility = recordArray<RouteIntelligenceOptionV2['responsibilityTransfer'][number]>(
    (sourceRoute as RecordLike).responsibilityTransfer,
  );
  const routeMismatches = recordArray<RouteIntelligenceOptionV2['recordMismatchMap'][number]>(
    (sourceRoute as RecordLike).recordMismatchMap,
  );
  const routeJurisdictionValues = recordArray<RouteIntelligenceOptionV2['jurisdictionValues'][number]>(
    (sourceRoute as RecordLike).jurisdictionValues,
  );
  const routeStress = recordArray<RouteStressSignal>((sourceRoute as RecordLike).stressSignals);
  const routeScenarios = recordArray<RouteScenarioPoint>((sourceRoute as RecordLike).scenarios);
  const hasMaterialScenarioData = routeScenarios.some((scenario) => (
    Number.isFinite(scenario.year10ValueUsd) &&
    Math.abs(scenario.year10ValueUsd) > 1 &&
    Number.isFinite(scenario.netOutcomeUsd)
  ));
  const memoEvidence = memoEvidenceGates(preview);
  const memoResponsibility = memoResponsibilityTransfer(preview);
  const memoMismatches = memoRecordMismatchMap(preview);
  const memoCounselQuestions = memoCounselQuestionPack(preview);
  const preferReviewedEvidence = hasReviewedEvidenceBundle(preview);
  const normalizedEvidence =
    preferReviewedEvidence && memoEvidence.length >= 6
      ? memoEvidence
      : routeEvidence.length >= 6
        ? routeEvidence
        : memoEvidence.length >= 6
        ? memoEvidence
        : fallbackRoute.evidenceGates || [];
  const normalizedResponsibility =
    preferReviewedEvidence && memoResponsibility.length >= 6
      ? memoResponsibility
      : routeResponsibility.length >= 6
        ? routeResponsibility
        : memoResponsibility.length >= 6
        ? memoResponsibility
        : fallbackRoute.responsibilityTransfer || [];
  const normalizedMismatches =
    preferReviewedEvidence && memoMismatches.length >= 5
      ? memoMismatches
      : routeMismatches.length >= 5
        ? routeMismatches
        : memoMismatches.length >= 5
        ? memoMismatches
        : fallbackRoute.recordMismatchMap || [];
  const normalizedCounselQuestions =
    preferReviewedEvidence && memoCounselQuestions.length >= 8
      ? memoCounselQuestions
      : routeCounselQuestions.length >= 8
        ? routeCounselQuestions
        : memoCounselQuestions.length >= 8
        ? memoCounselQuestions
        : fallbackRoute.counselQuestionPack || [];

  const taxAudit = cloneRecord(sourceRoute.taxAudit);
  const acquisitionAudit = asRecord(taxAudit.acquisition_audit);
  taxAudit.acquisition_audit = {
    ...acquisitionAudit,
    primary_fee_label: text(acquisitionAudit.primary_fee_label, context.primaryFeeLabel),
    secondary_fee_label: text(acquisitionAudit.secondary_fee_label, context.secondaryFeeLabel),
  };
  const mergedMetrics = {
    ...fallbackRoute.metrics,
    ...sourceRoute.metrics,
    dataQuality: surfaceStatus(sourceRoute.metrics?.dataQuality) || 'Signed route gates control release',
  };
  const normalizedStressSignals = stressSignalsFromMergedMetrics(
    { routeName, metrics: mergedMetrics },
    (routeStress.length ? routeStress : fallbackRoute.stressSignals || []).map((signal) => ({
      ...signal,
      value: surfaceStatus(signal.value) || signal.value,
    })),
  );

  return {
    ...sourceRoute,
    taxAudit,
    metrics: mergedMetrics,
    jurisdictionValues: (routeJurisdictionValues.length ? routeJurisdictionValues : fallbackRoute.jurisdictionValues) || [],
    stressSignals: normalizedStressSignals,
    scenarios: hasMaterialScenarioData ? routeScenarios : fallbackRoute.scenarios || [],
    responsibilityTransfer: normalizedResponsibility,
    counselQuestionPack: normalizedCounselQuestions,
    recordMismatchMap: normalizedMismatches.map((row) => ({
      ...row,
      releaseStatus: surfaceStatus(row.releaseStatus) || reviewedRecordStatus(preview),
    })),
    evidenceGates: normalizedEvidence.map((gate) => ({
      ...gate,
      releaseStatus: surfaceStatus(gate.releaseStatus) || reviewedGateStatus(preview),
    })),
  };
}

function routeRecordsFromStructures(structures: RecordLike[]): RecordLike[] {
  return structures.map((structure, index) => {
    const warnings = Array.isArray(structure.warnings) ? structure.warnings : [];
    return {
      rank: numberOr(structure.rank, index + 1),
      route: text(structure.route, text(structure.name, `Route ${index + 1}`)),
      best_use: text(structure.best_use, text(structure.type, 'Route under review.')),
      economic_read: text(
        structure.economic_read,
        text(
          structure.net_benefit_display,
          text(structure.net_benefit_label, 'Route economics must be read through duty drag and release evidence.'),
        ),
      ),
      failure_mode: text(
        structure.failure_mode,
        text(warnings[0], 'The route fails if evidence and authority do not match the commitment path.'),
      ),
      release_effect: text(
        structure.release_effect,
        text(warnings[1], 'Release only with signed evidence, owner, blocker, and decision memory.'),
      ),
      verdict: structure.verdict,
    };
  });
}

function defaultBuyerProfileMatrix(context: JurisdictionContext): BuyerProfileRemissionMatrix {
  if (context.isUk) {
    return {
      title: 'UK buyer-profile and SDLT surcharge review',
      sourceRead: 'UK residential acquisition release-readiness turns on SDLT profile, residence status, property count, buyer type, and counsel-signed relief exclusions.',
      dubaiRead:
        `${context.sourceLabel} residence does not itself reduce UK SDLT. The room must prove buyer residence, existing-property count, main-residence replacement status, title route, and bank acceptance before bid authority changes.`,
      ftaRead:
        'No reduced-duty treaty or nationality benefit is credited in the control case. Any relief, replacement-residence, or wrapper position must be signed by UK tax counsel before release.',
      counselQuestion:
        'Confirm buyer identity class, UK residence/day-count, property count, replacement-main-residence position, surcharge treatment, filing responsibility, and whether any wrapper or relief claim is counsel-approved before bid release.',
      matrix: [
        {
          profile: 'Direct non-UK resident individual',
          firstResidential: 'Base SDLT + non-resident surcharge',
          secondResidential: 'Base SDLT + non-resident + additional-dwelling surcharge',
          thirdAndSubsequent: 'Same surcharge posture unless counsel signs a different residence/property-count fact.',
          releaseRead: 'Property count, residence status, and main-residence replacement facts change the duty route; none is credited without signed evidence.',
          evidenceRequired: 'Passport/residence file, day-count, worldwide property count, source file, and UK tax counsel computation.',
        },
        {
          profile: 'UK resident or replacement-main-residence route',
          firstResidential: 'Lower only if residence and main-residence facts are true at transaction date.',
          secondResidential: 'Additional-dwelling exposure remains unless replacement/disposal conditions are signed.',
          thirdAndSubsequent: 'No benefit without signed replacement-main-residence and disposal evidence.',
          releaseRead: 'Eligibility must exist before the transaction trigger; future intention is not bid authority.',
          evidenceRequired: 'UK day-count, residence file, prior main-residence disposal/replacement evidence, and counsel computation.',
        },
        {
          profile: 'Company / non-natural-person wrapper',
          firstResidential: 'Higher-cost route unless a non-tax control purpose is signed.',
          secondResidential: 'Higher-cost route with disclosure, ATED, bank, and beneficial-owner friction.',
          thirdAndSubsequent: 'No scaling benefit; structure must be justified outside tax saving.',
          releaseRead: 'Wrapper route is not a shortcut to lower duty; it only survives for governance, security, succession, or operating purpose.',
          evidenceRequired: 'Non-tax purpose memo, beneficial-owner file, ATED/register analysis, bank acceptance, and counsel sign-off.',
        },
      ],
    };
  }

  if (!context.isSingapore) {
    return {
      title: `${context.destinationShort} buyer-profile and transfer-duty review`,
      sourceRead: `${context.destinationLabel} buyer route must be reviewed against local transfer duty, residence, title, bank acceptance, and reporting rules.`,
      dubaiRead:
        `${context.sourceLabel} residence is not treated as a release benefit unless destination counsel signs an applicable rule before the transaction trigger.`,
      ftaRead:
        'No treaty, residence, citizenship, or structure benefit is credited unless counsel signs the route and evidence before release.',
      counselQuestion:
        `Confirm buyer identity class, residence status, property count, title eligibility, transfer-duty treatment, filing responsibility, and bank acceptance for ${context.destinationLabel}.`,
      matrix: [
        {
          profile: 'Direct individual buyer',
          firstResidential: 'Destination transfer-duty route must be computed by counsel.',
          secondResidential: 'Additional-property or non-resident surcharges require counsel review.',
          thirdAndSubsequent: 'Later-property treatment must be signed before release.',
          releaseRead: 'The route cannot rely on generic corridor assumptions; buyer profile and destination rules must match.',
          evidenceRequired: 'Buyer profile, residence file, property count, title route, and counsel computation.',
        },
        {
          profile: 'Entity / trustee route',
          firstResidential: 'Structure route requires non-tax purpose and bank acceptance.',
          secondResidential: 'Structure friction can exceed any perceived control benefit.',
          thirdAndSubsequent: 'No benefit credited without signed structure purpose.',
          releaseRead: 'Use only if governance, succession, security, or operating purpose survives counsel review.',
          evidenceRequired: 'Structure memo, beneficial-owner file, bank acceptance, and counsel sign-off.',
        },
      ],
    };
  }

  return {
    title: 'Singapore buyer-profile and ABSD remission review',
    sourceRead: 'IRAS ABSD buyer-profile table and IRAS FTA remission rules.',
    dubaiRead:
      'Dubai / UAE residence or UAE nationality is not listed as an ABSD remission category. Treat the buyer as a foreign individual unless Singapore citizenship, Singapore PR, qualifying treaty status, spouse remission, or trust remission is proven before the purchase trigger.',
    ftaRead:
      'FTA remission can give Singapore Citizen stamp-duty treatment to nationals and permanent residents of Iceland, Liechtenstein, Norway, or Switzerland, and to nationals of the United States. US permanent residence alone is not the same as US nationality.',
    counselQuestion:
      'Confirm the buyer passport, Singapore citizenship or PR status, Singapore residential property count, spouse profile, trust beneficiary profile, and any FTA remission proof as at the option acceptance or purchase date.',
    matrix: [
      {
        profile: 'Singapore Citizen',
        firstResidential: '0% ABSD',
        secondResidential: '20% ABSD',
        thirdAndSubsequent: '30% ABSD',
        releaseRead: 'Property count matters. First property can be ABSD-free; later purchases carry rising drag.',
        evidenceRequired: 'ICA status and Singapore residential property count at purchase date.',
      },
      {
        profile: 'Singapore Permanent Resident',
        firstResidential: '5% ABSD',
        secondResidential: '30% ABSD',
        thirdAndSubsequent: '35% ABSD',
        releaseRead: 'Lower than foreigner only if PR status is already granted at purchase date.',
        evidenceRequired: 'ICA PR proof and property count at purchase date.',
      },
      {
        profile: 'Foreign individual',
        firstResidential: '60% ABSD',
        secondResidential: '60% ABSD',
        thirdAndSubsequent: '60% ABSD',
        releaseRead: 'First, second, and third-property count does not reduce the foreign individual ABSD rate.',
        evidenceRequired: 'Passport, buyer profile, title route, and written tax computation.',
      },
      {
        profile: 'FTA-eligible foreign individual',
        firstResidential: 'SC treatment: 0%',
        secondResidential: 'SC treatment: 20%',
        thirdAndSubsequent: 'SC treatment: 30%',
        releaseRead: 'Only listed treaty profiles receive Singapore Citizen stamp-duty treatment.',
        evidenceRequired: 'Qualifying passport or PR proof for the listed FTA jurisdictions and remission certificate process.',
      },
      {
        profile: 'Entity or trustee',
        firstResidential: '65% ABSD',
        secondResidential: '65% ABSD',
        thirdAndSubsequent: '65% ABSD',
        releaseRead: 'Entity/trustee ownership is a higher-duty route unless a separate remission condition applies.',
        evidenceRequired: 'Beneficial-owner, trust, corporate, and remission analysis before signing.',
      },
    ],
  };
}

function coerceBuyerProfileMatrix(value: unknown, context: JurisdictionContext): BuyerProfileRemissionMatrix {
  const fallback = defaultBuyerProfileMatrix(context);
  const record = asRecord(value);
  const matrix = asArray(record.matrix);
  if (matrix.length === 0) {
    return fallback;
  }
  return {
    title: text(record.title, fallback.title),
    sourceRead: text(record.sourceRead ?? record.source_read, fallback.sourceRead),
    dubaiRead: text(record.dubaiRead ?? record.dubai_read, fallback.dubaiRead),
    ftaRead: text(record.ftaRead ?? record.fta_read, fallback.ftaRead),
    counselQuestion: text(record.counselQuestion ?? record.counsel_question, fallback.counselQuestion),
    matrix: matrix.map((row, index) => ({
      profile: text(row.profile, fallback.matrix[index]?.profile ?? `Profile ${index + 1}`),
      firstResidential: text(row.firstResidential ?? row.first_residential, fallback.matrix[index]?.firstResidential ?? ''),
      secondResidential: text(row.secondResidential ?? row.second_residential, fallback.matrix[index]?.secondResidential ?? ''),
      thirdAndSubsequent: text(row.thirdAndSubsequent ?? row.third_and_subsequent, fallback.matrix[index]?.thirdAndSubsequent ?? ''),
      releaseRead: text(row.releaseRead ?? row.release_read, fallback.matrix[index]?.releaseRead ?? ''),
      evidenceRequired: text(row.evidenceRequired ?? row.evidence_required, fallback.matrix[index]?.evidenceRequired ?? ''),
    })),
  };
}

function coercePrincipalValueGate(value: unknown): PrincipalValueGate | undefined {
  const record = asRecord(value);
  const nonRedundantEdges = Array.isArray(record.non_redundant_edges)
    ? record.non_redundant_edges.map((item) => text(item)).filter(Boolean)
    : [];
  const advisorRows = asArray(record.advisor_non_redundancy_test).map((row) => ({
    adviserLane: text(row.adviser_lane ?? row.adviserLane, 'Adviser lane'),
    dm64Difference: text(row.dm64_difference ?? row.dm64Difference, 'Converted into release-rule consequence.'),
  }));
  const rejectionRows = asArray(record.replaceability_rejection_register).map((row) => ({
    replaceableOutput: text(row.replaceable_output ?? row.replaceableOutput, 'Replaceable output'),
    whyRejected: text(row.why_rejected ?? row.whyRejected, 'Does not produce a release-rule decision object.'),
  }));

  if (nonRedundantEdges.length === 0 && advisorRows.length === 0 && rejectionRows.length === 0) {
    return undefined;
  }

  return {
    status: text(record.status, 'evidence-gated'),
    test: text(
      record.test,
      'Would the adviser stack be able to produce the same signed release-readiness packet from existing notes, evidence gates, and owner consequences?',
    ),
    answer: text(
      record.answer,
      'No, if the packet joins live-room facts, adviser evidence, bank/title/tax rails, contradictions, release consequence, and decision memory.',
    ),
    nonRedundantEdges,
    advisorNonRedundancyTest: advisorRows,
    replaceabilityRejectionRegister: rejectionRows,
    releaseStatus: text(
      record.release_status ?? record.releaseStatus,
      'Principal-shareable only when this remains a release-rule object, not a corridor report or checklist.',
    ),
  };
}

function principalValueGateFromResolved(resolvedSurfaceData: ResolvedDecisionMemoSurfaceData): PrincipalValueGate | undefined {
  const memoDataRecord = asRecord(resolvedSurfaceData.memoData);
  const backendRecord = asRecord(resolvedSurfaceData.backendData);
  const candidates = [
    memoDataRecord.preview_data,
    resolvedSurfaceData.fullArtifact,
    memoDataRecord.full_artifact,
    memoDataRecord.fullArtifact,
    memoDataRecord.artifact,
    backendRecord.fullArtifact,
    backendRecord.full_artifact,
    backendRecord.artifact,
  ];

  for (const candidate of candidates) {
    const record = asRecord(candidate);
    const directGate = coercePrincipalValueGate(record.principal_value_gate ?? record.principalValueGate);
    if (directGate) {
      return directGate;
    }

    const routeIntelligence = asRecord(record.route_intelligence_v2);
    const routeGate = coercePrincipalValueGate(
      routeIntelligence.principal_value_gate ?? routeIntelligence.principalValueGate,
    );
    if (routeGate) {
      return routeGate;
    }

    const sections = asRecord(record.principal_sections);
    const sectionGate = coercePrincipalValueGate(sections.principal_value_gate ?? sections.principalValueGate);
    if (sectionGate) {
      return sectionGate;
    }
  }

  return undefined;
}

function getBaseTaxAudit(preview: RecordLike): RecordLike {
  return cloneRecord(
    asRecord(preview.cross_border_audit_summary).acquisition_audit
      ? asRecord(preview.cross_border_audit_summary)
      : asRecord(
          asRecord(asRecord(preview.wealth_projection_data).starting_position)
            .cross_border_audit_summary,
        ),
  );
}

function buildAcquisitionAudit(
  baseTaxAudit: RecordLike,
  routeName: string,
  values: {
    propertyValueUsd: number;
    bsdUsd: number;
    absdUsd: number;
    totalDutiesUsd: number;
    totalAcquisitionCostUsd: number;
    dutyDragPct: number;
    buyerCategory: string;
    primaryFeeLabel: string;
    secondaryFeeLabel: string;
  },
): RecordLike {
  const taxAudit = cloneRecord(baseTaxAudit);
  const sourceCurrency = text(asRecord(asRecord(baseTaxAudit).acquisition_audit).source_currency, '');
  const sourceBasisPhrase = sourceCurrency ? `${sourceCurrency} source-basis values` : 'source-value basis';
  const sourceBasisVerb = sourceCurrency ? 'remain' : 'remains';
  taxAudit.executive_summary = `${routeName}: ${values.buyerCategory}. The route read is in USD; ${sourceBasisPhrase} ${sourceBasisVerb} in the evidence file.`;
  taxAudit.total_tax_savings_pct = numberOr(taxAudit.total_tax_savings_pct, 0);
  taxAudit.ongoing_tax_savings_pct = numberOr(taxAudit.ongoing_tax_savings_pct, 0);
  taxAudit.ongoing_tax_savings_note =
    text(taxAudit.ongoing_tax_savings_note) ||
    'No recurring tax saving is assumed until residence, use, ownership, and counsel evidence are signed.';
  taxAudit.acquisition_audit = {
    ...asRecord(taxAudit.acquisition_audit),
    display_currency: 'USD',
    property_value: roundCurrency(values.propertyValueUsd),
    property_value_usd: roundCurrency(values.propertyValueUsd),
    bsd_stamp_duty: roundCurrency(values.bsdUsd),
    bsd_stamp_duty_usd: roundCurrency(values.bsdUsd),
    absd_additional_stamp_duty: roundCurrency(values.absdUsd),
    absd_additional_stamp_duty_usd: roundCurrency(values.absdUsd),
    total_stamp_duties: roundCurrency(values.totalDutiesUsd),
    total_stamp_duties_usd: roundCurrency(values.totalDutiesUsd),
    total_acquisition_cost: roundCurrency(values.totalAcquisitionCostUsd),
    total_acquisition_cost_usd: roundCurrency(values.totalAcquisitionCostUsd),
    day_one_loss_pct: values.dutyDragPct,
    duty_drag_pct: values.dutyDragPct,
    buyer_category: values.buyerCategory,
    primary_fee_label: values.primaryFeeLabel,
    secondary_fee_label: values.secondaryFeeLabel,
  };
  taxAudit.compliance_flags = Array.from(new Set([
    ...((Array.isArray(taxAudit.compliance_flags) ? taxAudit.compliance_flags : []) as string[]),
    'route_specific_release_required',
  ]));
  taxAudit.warnings = Array.from(new Set([
    ...((Array.isArray(taxAudit.warnings) ? taxAudit.warnings : []) as string[]),
    `${routeName} must not release until buyer identity, title path, bank acceptance, SoW/SoF, authority, and succession records describe the same route.`,
  ]));
  return taxAudit;
}

function routeVerdictCode(route: RouteIntelligenceOptionV2): 'PROCEED_MODIFIED' | 'HOLD' | 'DO_NOT_PROCEED' {
  const rule = text(route.releaseRule).toLowerCase();
  if (
    route.releaseRule === 'Release Differently' ||
    rule.includes('gated negotiation') ||
    rule.includes('release differently') ||
    rule.includes('approved to negotiate')
  ) return 'PROCEED_MODIFIED';
  if (route.releaseRule === 'Hold' || rule.includes('hold')) return 'HOLD';
  return 'DO_NOT_PROCEED';
}

function routeRiskLevel(route: RouteIntelligenceOptionV2): 'MODERATE-HIGH' | 'HIGH' | 'CRITICAL' {
  const rule = text(route.releaseRule).toLowerCase();
  if (route.releaseRule === 'Stop' || rule.includes('stop')) return 'CRITICAL';
  if (route.releaseRule === 'Hold' || rule.includes('hold')) return 'HIGH';
  return 'MODERATE-HIGH';
}

function isReleaseRoute(route: RouteIntelligenceOptionV2): boolean {
  const rule = text(route.releaseRule).toLowerCase();
  const verdict = text(route.verdict).toLowerCase();
  return (
    route.releaseRule === 'Release Differently' ||
    rule.includes('gated negotiation') ||
    rule.includes('release differently') ||
    rule.includes('approved to negotiate') ||
    verdict.includes('preferred direct') ||
    verdict.includes('proceed under signed gates')
  );
}

function routeStructure(route: RouteIntelligenceOptionV2, selectedRouteId: string): RecordLike {
  const gates = routeEvidenceGates(route);
  const selected = route.id === selectedRouteId;
  const isExecutable = route.metrics.totalAcquisitionCostUsd > 0;
  const incrementalDuty = Math.abs(route.metrics.incrementalDutyVsRecommendedUsd);
  return {
    name: route.routeName,
    type: route.routeType,
    verdict: routeVerdictCode(route),
    viable: isReleaseRoute(route),
    net_benefit_10yr: isReleaseRoute(route) ? undefined : -incrementalDuty,
    net_benefit_display: selected
      ? formatUsdCompact(route.metrics.totalAcquisitionCostUsd)
      : incrementalDuty
        ? `-${formatUsdCompact(incrementalDuty)}`
        : isExecutable
          ? formatUsdCompact(route.metrics.totalAcquisitionCostUsd)
          : 'No capital deployed',
    net_benefit_label: selected
      ? 'Selected route all-in outlay'
      : 'Duty delta vs recommended route',
    tax_savings_pct: undefined,
    setup_cost: isExecutable ? route.metrics.totalDutiesUsd : undefined,
    annual_cost: isExecutable ? route.metrics.annualCarryingCostUsd : undefined,
    warnings: gates.map((gate) => `${text(gate.gate, 'Release gate')}: ${text(gate.consequenceIfMissing, 'Evidence mapped')}`),
  };
}

function buildRouteChecklist(route: RouteIntelligenceOptionV2): RecordLike {
  const gates = routeEvidenceGates(route);
  const criticalStatus = /stop|hold|missing|blocked|unless|required before commitment/i;
  return {
    total_items: gates.length,
    items: gates.map((gate) => ({
      category: text(gate.gate, 'Release gate'),
      item: text(gate.evidenceRequired, 'Evidence mapped; sign-off controls release'),
      status: text(gate.releaseStatus, 'Signed gate controls release'),
      priority: criticalStatus.test(gate.releaseStatus) ? 'critical' : 'high',
      timeline: route.metrics.mitigationTimeline,
      owner: text(gate.owner, 'Family office'),
      owner_label: text(gate.owner, 'Family office'),
      responsible: text(gate.owner, 'Family office'),
      responsible_label: text(gate.owner, 'Family office'),
    })),
  };
}

function buildRouteExecutionSequence(route: RouteIntelligenceOptionV2): RecordLike[] {
  return routeResponsibilityTransfer(route).map((step, index) => ({
    step: index + 1,
    phase: text(step.action, 'Release gate'),
    action: text(step.releaseCondition, 'Evidence signed-gate control applies before release.'),
    owner: text(step.primaryOwner, 'Family office'),
    responsible: text(step.primaryOwner, 'Family office'),
    fallback_owner: text(step.fallbackOwner, 'Principal'),
    timeline: index === 0 ? '72 hours' : '7 days',
    status: 'Signed gate controls release',
  }));
}

function buildRouteScenarioTree(route: RouteIntelligenceOptionV2): RecordLike {
  const gates = routeEvidenceGates(route);
  const mismatches = routeRecordMismatchMap(route);
  const scenarios = routeScenarios(route);
  const verdictCode = routeVerdictCode(route);
  const releaseRoute = isReleaseRoute(route);
  const holdRoute = text(route.releaseRule).toLowerCase().includes('hold');
  const weightedNetOutcome = scenarios.reduce((sum, scenario, index) => {
    const weight = index === 0 ? 0.6 : index === 1 ? 0.25 : 0.15;
    return sum + (scenario.netOutcomeUsd * weight);
  }, 0);
  const scenarioOutcomes = scenarios.map((scenario, index) => ({
    scenario: scenario.scenario,
    probability: index === 0 ? 0.6 : index === 1 ? 0.25 : 0.15,
    net_outcome: roundCurrency(scenario.netOutcomeUsd),
    description: scenario.read,
    stress_calibration: scenario.read,
  }));
  const releaseConditions = gates.slice(0, 6).map((gate) => ({
    condition: text(gate.evidenceRequired, text(gate.gate, 'Release gate')),
    status: 'CONDITIONAL',
  }));
  const forceNowOutcomes = scenarioOutcomes.map((outcome) => ({
    ...outcome,
    description: `If the route hardens before signed gates: ${outcome.description}`,
  }));
  return {
    recommended_branch: verdictCode,
    recommendation_strength: releaseRoute ? 78 : holdRoute ? 68 : 84,
    decision_ev_usd: roundCurrency(weightedNetOutcome),
    expected_value_usd: roundCurrency(weightedNetOutcome),
    value_basis_label: 'Scenario discipline output',
    value_basis_note: 'Scenario values discipline the release route. They are not a forecast and do not replace signed title, tax, bank, source, authority, family-use, and decision-memory gates.',
    decision_ev_label: releaseRoute
      ? 'Scenario discipline for the selected route'
      : 'Route consequence if forced',
    decision_ev_note: releaseRoute
      ? 'Weighted route outcome after signed gates clear; not release authority by itself.'
      : 'Route consequence if the family forces or blocks the route.',
    recommended_route: route.routeName,
    route_read: route.releaseEffect,
    critical_gates: gates.map((gate) => text(gate.gate, 'Release gate')),
    branches: [
      {
        name: 'PROCEED_MODIFIED',
        recommendation_strength: releaseRoute ? 0.78 : 0.62,
        conditions: releaseConditions,
        outcomes: scenarioOutcomes,
        expected_value: roundCurrency(weightedNetOutcome),
        expected_value_note: 'Weighted across base, stress, and opportunity route cases after signed gates clear.',
        verdict: route.releaseEffect,
        verdict_conditions: [
          'No bid without closed comparables and walk-away price.',
          'No exchange or deposit without signed title, SDLT, source, bank rail, family authority, and bid discipline.',
        ],
      },
      {
        name: 'PROCEED_NOW',
        recommendation_strength: 0.28,
        conditions: [
          { condition: 'Family accepts unmodified route risk before evidence gates clear.', status: 'BLOCKED' },
        ],
        outcomes: forceNowOutcomes,
        expected_value: roundCurrency(scenarios[1]?.netOutcomeUsd ?? weightedNetOutcome),
        expected_value_note: 'Unmodified route case under live seller, bank, tax, and family-authority stress.',
        verdict: 'Do not force the purchase before signed gates clear.',
        verdict_conditions: ['Fails if bank, title, SDLT, source, authority, or family-use records diverge.'],
      },
      {
        name: 'DO_NOT_PROCEED',
        recommendation_strength: holdRoute ? 0.68 : 0.42,
        conditions: [
          { condition: 'Capital remains blocked until the release route is rebuilt or abandoned.', status: 'CONDITIONAL' },
        ],
        outcomes: [
          {
            scenario: 'Capital preservation case',
            probability: 1,
            net_outcome: 0,
            description: 'No purchase duty is incurred while the family keeps optionality and repairs evidence, authority, bank rails, title, tax, and decision memory.',
          },
        ],
        expected_value: 0,
        expected_value_note: 'Capital preserved; no purchase duty while the route remains held or stopped.',
        verdict: 'Hold or stop if any critical release gate remains unsigned.',
        verdict_conditions: ['Use when evidence, authority, or banking cannot clear inside the decision window.'],
      },
    ],
    decision_gates: gates.slice(0, 8).map((gate) => ({
      gate: text(gate.gate, 'Release gate'),
      owner: text(gate.owner, 'Family office operator / CFO'),
      status: text(gate.releaseStatus, 'Signed gate controls release'),
      release_condition: text(gate.evidenceRequired, 'Evidence mapped; signed gate controls release.'),
    })),
    decision_matrix: [
      {
        branch: 'Proceed under signed gates',
        modeled_route_outcome: roundCurrency(weightedNetOutcome),
        risk_level: releaseRoute ? 'Medium' : 'High',
        recommended_if: 'All critical gates clear inside the live decision window.',
      },
      {
        branch: 'Proceed now',
        modeled_route_outcome: roundCurrency(scenarios[1]?.netOutcomeUsd ?? weightedNetOutcome),
        risk_level: 'High',
        recommended_if: 'Not recommended; only if the principal knowingly accepts unmodified route risk.',
      },
      {
        branch: 'Hold or stop',
        modeled_route_outcome: 'Capital preserved',
        risk_level: 'Low capital leakage / high opportunity discipline',
        recommended_if: 'Any abort trigger survives remediation.',
      },
    ],
    expiry: {
      days: 30,
      reassess_triggers: ['Market shift above 10%', 'New tax or reporting rule', 'Counterparty change', 'Bank acceptance change', 'Family authority change'],
    },
    doctrine_metadata: {
      failure_mode_count: gates.length,
      risk_flags_total: gates.length + mismatches.length,
      antifragility_assessment: releaseRoute
        ? 'Conditional resilience: route can strengthen the family system only if authority, banking, source, and succession records match before release.'
        : 'Fragile route state: the selected route converts uncertainty into capital drag unless the blocking evidence changes.',
      failure_modes: gates.map((gate) => ({
        mode: text(gate.gate, 'Release gate'),
        doctrine_book: 'Decision Release Rule',
        severity: criticalStatusFromGate(gate.releaseStatus),
        description: text(gate.consequenceIfMissing, 'Evidence mapped; sign-off controls release.'),
      })),
    },
  };
}

function criticalStatusFromGate(status: string): 'CRITICAL' | 'HIGH' {
  return /stop|hold|unless|missing|blocked/i.test(status) ? 'CRITICAL' : 'HIGH';
}

function buildRouteWealthProjection(route: RouteIntelligenceOptionV2): RecordLike {
  const propertyValue = route.metrics.propertyValueUsd || route.metrics.totalAcquisitionCostUsd;
  const capitalDeployed = route.metrics.totalAcquisitionCostUsd || propertyValue;
  const annualCarry = route.metrics.annualCarryingCostUsd;
  const probabilities = [0.6, 0.25, 0.15];
  const scenarioNames = ['BASE_CASE', 'STRESS_CASE', 'OPPORTUNITY_CASE'];
  const routeScenarioRows = routeScenarios(route);
  const scenarios = routeScenarioRows.map((scenario, index) => {
    const year10Value = scenario.year10ValueUsd || capitalDeployed;
    const yearByYear = [0, 1, 5, 10].map((year) => {
      const value = capitalDeployed + ((year10Value - capitalDeployed) * (year / 10));
      const property = propertyValue + ((year10Value - propertyValue) * (year / 10));
      return {
        year,
        net_worth: roundCurrency(value),
        total_value: roundCurrency(value),
        property_value: roundCurrency(property),
        income: roundCurrency(Math.max(0, annualCarry * 0.55 * year)),
        rental_income: roundCurrency(Math.max(0, annualCarry * 0.55 * year)),
      };
    });
    const totalValueCreation = roundCurrency(year10Value - capitalDeployed);
    return {
      name: scenarioNames[index] ?? scenario.scenario.toUpperCase().replace(/\s+/g, '_'),
      probability: probabilities[index] ?? 0.1,
      assumptions: [scenario.read, route.economicRead],
      year_by_year: yearByYear,
      ten_year_outcome: {
        total_value_creation: totalValueCreation,
        net_value_creation: roundCurrency(scenario.netOutcomeUsd),
        final_value: roundCurrency(year10Value),
        final_total_value: roundCurrency(year10Value),
        percentage_gain: capitalDeployed ? (totalValueCreation / capitalDeployed) * 100 : 0,
        true_roi_pct: capitalDeployed ? (scenario.netOutcomeUsd / capitalDeployed) * 100 : 0,
      },
    };
  });
  const weightedNetOutcome = scenarios.reduce((sum, scenario) => (
    sum + (numberOr(scenario.ten_year_outcome?.net_value_creation) * numberOr(scenario.probability))
  ), 0);
  const weightedFinalValue = scenarios.reduce((sum, scenario) => (
    sum + (numberOr(scenario.ten_year_outcome?.final_total_value) * numberOr(scenario.probability))
  ), 0);

  return {
    starting_position: {
      transaction_value: roundCurrency(propertyValue),
      transaction_amount: roundCurrency(propertyValue),
      purchase_price_usd: roundCurrency(propertyValue),
      property_value_usd: roundCurrency(propertyValue),
      total_acquisition_cost: roundCurrency(capitalDeployed),
      stamp_duties_paid: roundCurrency(route.metrics.totalDutiesUsd),
      carrying_cost_usd: roundCurrency(annualCarry),
      route_name: route.routeName,
      route_type: route.routeType,
    },
    scenarios,
    cost_of_inaction: {
      year_1: roundCurrency(Math.abs(route.metrics.incrementalDutyVsRecommendedUsd) * 0.1),
      year_5: roundCurrency(Math.abs(route.metrics.incrementalDutyVsRecommendedUsd) * 0.5),
      year_10: roundCurrency(Math.abs(route.metrics.incrementalDutyVsRecommendedUsd)),
    },
    probability_weighted_outcome: {
      expected_value_creation: roundCurrency(weightedNetOutcome),
      expected_net_worth: roundCurrency(weightedFinalValue),
      net_benefit_of_move: roundCurrency(weightedNetOutcome),
      true_roi_pct: capitalDeployed ? (weightedNetOutcome / capitalDeployed) * 100 : 0,
    },
  };
}

function buildRouteRiskAssessment(route: RouteIntelligenceOptionV2): RecordLike {
  const gates = routeEvidenceGates(route);
  const mismatches = routeRecordMismatchMap(route);
  const criticalItems = gates.filter((gate) => criticalStatusFromGate(gate.releaseStatus) === 'CRITICAL').length;
  const highItems = Math.max(0, gates.length - criticalItems);
  return {
    risk_level: routeRiskLevel(route),
    total_exposure_formatted: formatUsdCompact(
      route.metrics.totalDutiesUsd || Math.abs(route.metrics.incrementalDutyVsRecommendedUsd),
    ),
    critical_items: criticalItems,
    high_items: highItems,
    high_priority: highItems,
    priority_risks_total: gates.length,
    risk_factors_count: gates.length + mismatches.length,
    verdict: route.verdict,
    recommendation: route.releaseEffect,
    verdict_note: route.failureMode,
    structure_verdict: routeVerdictCode(route),
    mitigation_timeline: route.metrics.mitigationTimeline,
  };
}

export function buildRouteScopedDecisionMemoSurface({
  memoData,
  backendData,
  fullArtifact,
  route,
  routes,
}: {
  memoData: RecordLike;
  backendData?: RecordLike | null;
  fullArtifact?: RecordLike | null;
  route: RouteIntelligenceOptionV2;
  routes?: RouteIntelligenceOptionV2[];
}): {
  memoData: RecordLike;
  backendData: RecordLike;
  fullArtifact: RecordLike;
} {
  const scopedMemoData = cloneRecord(memoData);
  const scopedBackendData = cloneRecord(backendData ?? {});
  const scopedFullArtifact = cloneRecord(fullArtifact ?? {});
  const preview = mergedPreviewData(scopedMemoData.preview_data, [
    scopedMemoData,
    scopedBackendData,
    scopedFullArtifact,
  ]);
  scopedMemoData.preview_data = preview;
  const jurisdictionContext = jurisdictionContextFromRecords([
    preview,
    scopedMemoData,
    scopedBackendData,
    scopedFullArtifact,
    asRecord(scopedMemoData.artifact),
    asRecord(scopedBackendData.artifact),
  ]);

  const routeTaxAudit = buildAcquisitionAudit(asRecord(route.taxAudit), route.routeName, {
    propertyValueUsd: route.metrics.propertyValueUsd,
    bsdUsd: route.metrics.bsdUsd,
    absdUsd: route.metrics.absdUsd,
    totalDutiesUsd: route.metrics.totalDutiesUsd,
    totalAcquisitionCostUsd: route.metrics.totalAcquisitionCostUsd,
    dutyDragPct: route.metrics.dutyDragPct,
    buyerCategory: route.routeName,
    primaryFeeLabel: text(asRecord(asRecord(route.taxAudit).acquisition_audit).primary_fee_label, jurisdictionContext.primaryFeeLabel),
    secondaryFeeLabel: text(asRecord(asRecord(route.taxAudit).acquisition_audit).secondary_fee_label, jurisdictionContext.secondaryFeeLabel),
  });
  const routeRiskAssessment = buildRouteRiskAssessment(route);
  const routeChecklist = buildRouteChecklist(route);
  const routeExecutionSequence = buildRouteExecutionSequence(route);
  const routeWealthProjection = buildRouteWealthProjection(route);
  routeWealthProjection.starting_position = {
    ...asRecord(routeWealthProjection.starting_position),
    cross_border_audit_summary: routeTaxAudit,
  };
  const routeScenarioTree = buildRouteScenarioTree(route);
  const executableRoutes = (routes?.length ? routes : [route]).filter((option) => option.metrics?.totalAcquisitionCostUsd > 0);
  const selectedStructure = routeStructure(route, route.id);
  const structuresAnalyzed = executableRoutes.length
    ? executableRoutes.map((option) => routeStructure(option, route.id))
    : [selectedStructure];
  const structureOptimization = {
    ...asRecord(preview.structure_optimization),
    verdict: routeVerdictCode(route),
    verdict_reason: route.releaseEffect,
    recommended_structure: route.routeName,
    selected_route_id: route.id,
    selected_route_name: route.routeName,
    optimal_structure: selectedStructure,
    structures_analyzed: structuresAnalyzed,
  };

  preview.selected_route_v2 = route;
  preview.route_context = {
    id: route.id,
    rank: route.rank,
    route_name: route.routeName,
    route_type: route.routeType,
    release_rule: route.releaseRule,
    verdict: route.verdict,
    best_use: route.bestUse,
  };
  preview.executive_summary = {
    ...asRecord(preview.executive_summary),
    headline_metric: {
      label: isReleaseRoute(route) ? 'Route all-in outlay' : 'Route exposure under review',
      value: formatUsdCompact(route.metrics.totalAcquisitionCostUsd || Math.abs(route.metrics.incrementalDutyVsRecommendedUsd)),
      description: route.economicRead,
    },
  };
  preview.total_savings = formatUsdCompact(route.metrics.totalAcquisitionCostUsd || Math.abs(route.metrics.incrementalDutyVsRecommendedUsd));
  preview.exposure_class = route.routeType;
  preview.verdict = route.verdict;
  preview.data_quality = route.metrics.dataQuality;
  preview.data_quality_note = route.metrics.dataQuality;
  preview.thesis_summary = `${route.routeName}: ${route.releaseEffect}`;
  preview.decision_thesis = route.economicRead;
  preview.thesis = `${route.economicRead} ${route.failureMode}`;
  preview.decision_context = route.bestUse;
  preview.risk_assessment = routeRiskAssessment;
  preview.cross_border_audit_summary = routeTaxAudit;
  preview.cross_border_audit = routeTaxAudit;
  preview.tax_audit = routeTaxAudit;
  preview.route_tax_audit = routeTaxAudit;
  preview.structure_optimization = structureOptimization;
  preview.dd_checklist = routeChecklist;
  preview.execution_sequence = routeExecutionSequence;
  preview.wealth_projection_data = routeWealthProjection;
  preview.scenario_tree_data = {
    ...asRecord(preview.scenario_tree_data),
    ...routeScenarioTree,
  };
  preview.crisis_data =
    asRecord(preview.crisis_data).scenarios || asRecord(preview.crisis_data).overall_resilience
      ? preview.crisis_data
      : asRecord(asRecord(scopedFullArtifact.preview_data).crisis_data);
  preview.crisis_resilience_stress_test =
    preview.crisis_resilience_stress_test ??
    asRecord(scopedFullArtifact.preview_data).crisis_resilience_stress_test;
  preview.antifragile_resilience_test =
    preview.antifragile_resilience_test ??
    asRecord(scopedFullArtifact.preview_data).antifragile_resilience_test;
  preview.heir_management_data =
    preview.heir_management_data ??
    asRecord(scopedFullArtifact.preview_data).heir_management_data;
  preview.heir_management_analysis =
    preview.heir_management_analysis ??
    asRecord(scopedFullArtifact.preview_data).heir_management_analysis;
  preview.generational_view =
    preview.generational_view ??
    asRecord(scopedFullArtifact.preview_data).generational_view;
  preview.wealth_projection_analysis =
    preview.wealth_projection_analysis ??
    asRecord(scopedFullArtifact.preview_data).wealth_projection_analysis;
  preview.scenario_tree_analysis =
    preview.scenario_tree_analysis ??
    asRecord(scopedFullArtifact.preview_data).scenario_tree_analysis;
  preview.all_mistakes = routeEvidenceGates(route).map((gate, index) => ({
    id: `${route.id}-gate-${index + 1}`,
    title: text(gate.gate, 'Release gate'),
    mistake: text(gate.evidenceRequired, 'Evidence mapped; sign-off controls release'),
    cost: text(gate.consequenceIfMissing, 'Evidence mapped; sign-off controls release.'),
    cost_numeric: route.metrics.totalDutiesUsd || Math.abs(route.metrics.incrementalDutyVsRecommendedUsd),
    urgency: criticalStatusFromGate(gate.releaseStatus),
    mitigation: text(gate.releaseStatus, 'Signed gate controls release'),
    owner: text(gate.owner, 'Family office'),
  }));
  scopedBackendData.risk_assessment = routeRiskAssessment;
  scopedBackendData.cross_border_audit_summary = routeTaxAudit;
  scopedBackendData.cross_border_audit = routeTaxAudit;
  scopedBackendData.tax_audit = routeTaxAudit;
  scopedBackendData.mitigationTimeline = route.metrics.mitigationTimeline;
  scopedBackendData.mitigation_timeline = route.metrics.mitigationTimeline;
  scopedBackendData.all_mistakes = preview.all_mistakes;
  scopedBackendData.preview_data = preview;
  scopedBackendData.fullArtifact = {
    ...asRecord(scopedBackendData.fullArtifact),
    preview_data: preview,
    thesis: preview.thesis,
    thesisSummary: preview.thesis_summary,
  };
  scopedBackendData.full_artifact = {
    ...asRecord(scopedBackendData.full_artifact),
    preview_data: preview,
    thesis: preview.thesis,
    thesisSummary: preview.thesis_summary,
  };
  scopedFullArtifact.risk_assessment = routeRiskAssessment;
  scopedFullArtifact.cross_border_audit_summary = routeTaxAudit;
  scopedFullArtifact.cross_border_audit = routeTaxAudit;
  scopedFullArtifact.tax_audit = routeTaxAudit;
  scopedFullArtifact.data_quality = preview.data_quality;
  scopedFullArtifact.data_quality_note = preview.data_quality_note;
  scopedFullArtifact.thesis = preview.thesis;
  scopedFullArtifact.thesisSummary = preview.thesis_summary;
  scopedFullArtifact.selected_route_v2 = route;
  scopedFullArtifact.preview_data = preview;

  return {
    memoData: scopedMemoData,
    backendData: scopedBackendData,
    fullArtifact: scopedFullArtifact,
  };
}

function adjustedScenarios(
  preview: RecordLike,
  propertyValueUsd: number,
  capitalDeployedUsd: number,
  adjustmentUsd: number,
  kind: ReturnType<typeof routeKind>,
): RouteScenarioPoint[] {
  const rawScenarios = asRecord(asRecord(preview.wealth_projection_data).scenarios);
  const base = asRecord(rawScenarios.base);
  const stress = asRecord(rawScenarios.stress);
  const opportunity = asRecord(rawScenarios.opportunity);

  const buildTrajectory = (scenario: RecordLike, finalValue: number) => {
    const rawPath = Array.isArray(scenario.year_by_year) ? scenario.year_by_year : [];
    const noAcquisitionRoute = kind === 'hold' || kind === 'stop';
    if (noAcquisitionRoute) {
      return Array.from({ length: 11 }, (_, year) => ({ year, valueUsd: 0, netOutcomeUsd: 0 }));
    }

    if (rawPath.length > 0) {
      return rawPath
        .map((point) => {
          const row = asRecord(point);
          const year = numberOr(row.year, -1);
          if (year < 0 || year > 10) return null;
          const value = roundCurrency(numberOr(row.total_value, numberOr(row.net_worth, numberOr(row.property_value, finalValue))) - adjustmentUsd);
          return {
            year,
            valueUsd: value,
            netOutcomeUsd: roundCurrency(value - capitalDeployedUsd),
          };
        })
        .filter((point): point is { year: number; valueUsd: number; netOutcomeUsd: number } => Boolean(point));
    }

    return Array.from({ length: 11 }, (_, year) => {
      const shape = scenario === stress
        ? [0, -0.045, -0.09, -0.075, -0.052, -0.038, -0.024, -0.015, -0.009, -0.004, 0][year]
        : scenario === opportunity
          ? [0, 0.006, 0.014, 0.03, 0.036, 0.052, 0.062, 0.078, 0.087, 0.096, 0][year]
          : [0, -0.006, -0.003, 0.004, 0.001, 0.011, 0.008, 0.015, 0.012, 0.017, 0][year];
      const baseValue = propertyValueUsd + ((finalValue - propertyValueUsd) * year) / 10;
      const value = roundCurrency(baseValue + propertyValueUsd * shape - adjustmentUsd);
      return {
        year,
        valueUsd: value,
        netOutcomeUsd: roundCurrency(value - capitalDeployedUsd),
      };
    });
  };

  const rows = [
    {
      scenario: 'Base case' as const,
      year10ValueUsd: numberOr(base.year_10_value, capitalDeployedUsd),
      read: text(base.verdict, 'Asset value grows only if the family-control purpose is true.'),
    },
    {
      scenario: 'Stress case' as const,
      year10ValueUsd: numberOr(stress.year_10_value, capitalDeployedUsd),
      read: text(stress.verdict, 'Early-exit review shows whether the route was purpose-led or price-led.'),
    },
    {
      scenario: 'Opportunity case' as const,
      year10ValueUsd: numberOr(opportunity.year_10_value, capitalDeployedUsd),
      read: text(opportunity.verdict, 'Upside is credible only with clean title, bank, and family-control evidence.'),
    },
  ];

  return rows.map((row) => {
    const noAcquisitionRoute = kind === 'hold' || kind === 'stop';
    const adjustedValue = noAcquisitionRoute ? 0 : roundCurrency(row.year10ValueUsd - adjustmentUsd);
    const sourceScenario = row.scenario === 'Stress case' ? stress : row.scenario === 'Opportunity case' ? opportunity : base;
    return {
      ...row,
      year10ValueUsd: adjustedValue,
      netOutcomeUsd: noAcquisitionRoute ? 0 : roundCurrency(adjustedValue - capitalDeployedUsd),
      trajectory: buildTrajectory(sourceScenario, row.year10ValueUsd),
    };
  });
}

function evidenceGates(kind: ReturnType<typeof routeKind>, context: JurisdictionContext): RouteEvidenceGate[] {
  const common: RouteEvidenceGate[] = [
    {
      gate: 'Buyer capacity and title route',
      owner: context.propertyCounselLabel,
      evidenceRequired: 'Exact buyer name, title class, OTP/deposit mechanics, completion timing, and whether approval applies.',
      releaseStatus: 'Gate mapped for commitment gate',
      consequenceIfMissing: 'The family may sign a route that cannot carry the intended authority, use, or exit path.',
    },
    {
      gate: context.isUk
        ? 'SDLT and surcharge calculation'
        : context.isSingapore
          ? 'BSD / ABSD / SSD calculation'
          : 'Transfer-duty and surcharge calculation',
      owner: context.taxCounselLabel,
      evidenceRequired: context.isUk
        ? 'Written SDLT computation for buyer profile, residence status, property count, surcharge posture, due date, and filing responsibility.'
        : `Written duty computation for buyer profile, basis value, due date, and ${context.earlyExitFeeLabel} exposure.`,
      releaseStatus: 'Gate mapped for payment gate',
      consequenceIfMissing: 'Non-recoverable duty drag can be accepted without the room understanding the real all-in cost.',
    },
    {
      gate: 'SoW / SoF corroboration',
      owner: `${context.sourceBankLabel} + family office operator / CFO`,
      evidenceRequired: 'Source-of-wealth and source-of-funds file with bank statements, sale/dividend records, tax support, and transfer narrative.',
      releaseStatus: 'Gate mapped for receiving-bank reliance gate',
      consequenceIfMissing: 'Bank compliance escalation can stop the move after seller timing has started.',
    },
    {
      gate: 'Primary and fallback banking rails',
      owner: `${context.receivingBankLabel} + ${context.sourceBankLabel}`,
      evidenceRequired: 'Named sending and receiving rails, accepted signers, FX authority, emergency fallback path, and reporting cadence.',
      releaseStatus: 'Gate mapped for irrevocable-release gate',
      consequenceIfMissing: 'The asset can become hostage to one rail, one banker, or one unresolved KYC question.',
    },
    {
      gate: 'Family authority and veto',
      owner: 'Founder, named family user, named family-fairness owner, and family office operator / CFO',
      evidenceRequired: 'Who can approve, stop, sign, move funds, retrieve records, and explain the purchase without the founder.',
      releaseStatus: 'Gate mapped for visibility gate',
      consequenceIfMissing: 'Late family-home, next-generation, or fairness veto can convert a property decision into a family-governance event.',
    },
    {
      gate: 'Succession and decision memory',
      owner: 'Succession counsel + family office operator / CFO',
      evidenceRequired: 'Where the route decision, evidence file, title documents, bank approvals, and future reporting pack will live.',
      releaseStatus: 'Gate mapped for completion gate',
      consequenceIfMissing: 'The purchase may be explainable only by the founder, which is not a durable family-office decision.',
    },
  ];

  if (kind === 'entity') {
    return [
      {
        gate: 'Lawful non-tax purpose for structure',
        owner: 'Tax counsel + trustee / corporate services provider',
        evidenceRequired: 'Written explanation of why the entity or trustee route exists despite higher duty drag and bank complexity.',
        releaseStatus: 'Stop unless proven',
        consequenceIfMissing: 'The room pays more and adds beneficial-owner friction without solving family control.',
      },
      ...common,
    ];
  }
  if (kind === 'status') {
    return [
      {
        gate: 'Eligibility effective before purchase',
        owner: 'Immigration / residence counsel + tax counsel',
        evidenceRequired: 'Evidence that qualifying status or remission condition is effective before the purchase trigger, not expected later.',
        releaseStatus: 'Hold unless proven',
        consequenceIfMissing: 'The family may price a benefit that does not legally exist at completion.',
      },
      ...common,
    ];
  }
  if (kind === 'hold' || kind === 'stop') {
    return [
      {
        gate: 'Seller timing discipline',
        owner: 'Founder + family office operator / CFO',
        evidenceRequired: 'Written hold/stop instruction, deposit boundary, and next review trigger.',
        releaseStatus: kind === 'stop' ? 'Stop route' : 'Hold route',
        consequenceIfMissing: 'The room can drift back into seller timing without resolving the blocker.',
      },
      ...common,
    ];
  }
  return common;
}

function responsibilityTransfer(kind: ReturnType<typeof routeKind>, context: JurisdictionContext) {
  const releaseCondition = kind === 'hold' || kind === 'stop'
    ? 'No one releases funds; owners preserve evidence and review trigger.'
    : 'Named owner can act without waiting for informal founder interpretation.';
  return [
    { action: 'See the full record', primaryOwner: 'Family office operator / CFO', fallbackOwner: 'Named family user', releaseCondition },
    { action: 'Stop the move', primaryOwner: 'Founder', fallbackOwner: 'Named family-fairness owner + counsel', releaseCondition: 'Stop authority is written before seller timing starts.' },
    { action: 'Sign and release funds', primaryOwner: 'Founder or appointed signer', fallbackOwner: 'Bank-approved alternate signer', releaseCondition: kind === 'hold' || kind === 'stop' ? 'Not released under this route.' : 'Bank mandates, FX authority, and signer limits match the route.' },
    { action: 'Move funds across rails', primaryOwner: `${context.sourceBankLabel} lead`, fallbackOwner: 'Fallback bank rail owner', releaseCondition: kind === 'hold' || kind === 'stop' ? 'Rail review only; no settlement transfer.' : 'Primary and fallback rails have accepted SoW/SoF.' },
    { action: 'Retrieve and explain the decision', primaryOwner: 'Family office operator / CFO', fallbackOwner: 'Succession counsel', releaseCondition: 'Decision memory packet is retrievable within 72 hours.' },
  ];
}

function recordMismatchMap(kind: ReturnType<typeof routeKind>) {
  const routeRead = kind === 'hold' || kind === 'stop'
    ? 'No acquisition route released'
    : kind === 'entity'
      ? 'Entity/trustee buyer route'
      : kind === 'status'
        ? 'Eligibility-dependent buyer route'
        : 'Direct foreign individual buyer route';
  return [
    { record: 'Cash and FX path', currentRead: 'Gate mapped: source funds must stay corroborated and transferable.', targetRead: `${routeRead}; bank rails accept source file and FX authority.`, releaseStatus: 'Signed gate controls release' },
    { record: 'Title and beneficial ownership', currentRead: 'Gate mapped: buyer and use purpose must not be assumed from family intent.', targetRead: `${routeRead}; title record and beneficial-owner record say the same thing.`, releaseStatus: 'Signed gate controls release' },
    { record: 'Tax and duty position', currentRead: 'Gate mapped: duty drag changes by route and buyer category.', targetRead: `${routeRead}; written acquisition-duty computation is attached.`, releaseStatus: 'Signed gate controls release' },
    { record: 'Family authority', currentRead: 'Gate mapped: founder, named family user, named family-fairness owner, and operator roles are not interchangeable.', targetRead: `${routeRead}; approval, veto, signer, and fallback roles are signed.`, releaseStatus: 'Signed gate controls release' },
    { record: 'Succession memory', currentRead: 'Gate mapped: decision cannot live only in one adviser thread.', targetRead: `${routeRead}; decision memory is indexed for G2/G3 retrieval.`, releaseStatus: 'Signed gate controls release' },
  ];
}

function counselQuestions(kind: ReturnType<typeof routeKind>, context: JurisdictionContext) {
  const base = [
    { desk: context.propertyCounselLabel, question: `Does this exact title route allow the proposed buyer, use, completion timing, and future family-control purpose in ${context.destinationLabel}?` },
    {
      desk: context.taxCounselLabel,
      question: context.isUk
        ? 'Confirm SDLT, non-resident surcharge, additional-dwelling posture, residence/day-count, property-count, relief exclusions, and filing/payment timing for this buyer profile in writing.'
        : context.isSingapore
          ? 'Confirm BSD, ABSD, SSD, owner-occupation, property-tax, and filing/payment timing for this buyer profile in writing.'
          : 'Confirm transfer duty, additional buyer surcharge, residence/property-count treatment, relief exclusions, and filing/payment timing for this buyer profile in writing.',
    },
    { desk: context.receivingBankLabel, question: 'What SoW/SoF documents, signer mandates, FX notes, and fallback transfer path must be accepted before seller timing begins?' },
    { desk: context.sourceBankLabel, question: 'Can the source account, transfer purpose, FX authority, and documentary trail be corroborated in the format the receiving bank will accept?' },
    { desk: 'Succession counsel', question: 'If the founder is unavailable for 72 hours, who can retrieve, explain, stop, or carry this decision without family conflict?' },
  ];
  if (kind === 'entity') {
    return [
      { desk: 'Tax counsel', question: 'What lawful non-tax purpose justifies paying higher entity/trustee duty drag and adding beneficial-owner bank friction?' },
      ...base,
    ];
  }
  if (kind === 'status') {
    return [
      { desk: 'Immigration / residence counsel', question: 'Is the qualifying status or remission condition effective before the purchase trigger, and what proof can be shown to tax and bank reviewers?' },
      ...base,
    ];
  }
  if (kind === 'hold' || kind === 'stop') {
    return [
      { desk: 'Founder and family office operator / CFO', question: 'What exact evidence changes the route from hold/stop to release, and who is allowed to reopen the decision?' },
      ...base,
    ];
  }
  return base;
}

function routeJurisdictionValues(kind: ReturnType<typeof routeKind>, routeName: string, context: JurisdictionContext) {
  return [
    {
      jurisdiction: context.sourceLabel,
      value: 'Source-of-funds and transfer authority',
      releaseRead: `The source side must prove origin, signer power, FX authority, and availability of records before ${context.destinationLabel} can rely on the incoming capital.`,
    },
    {
      jurisdiction: context.destinationLabel,
      value: 'Title, duty, bank acceptance, and property-use consequence',
      releaseRead: `${routeName} releases only if title eligibility, ${context.primaryFeeLabel}/${context.secondaryFeeLabel}, receiving-bank acceptance, and family-use evidence align before commitment.`,
    },
    {
      jurisdiction: 'Family system',
      value: 'G1/G2/G3 authority and decision memory',
      releaseRead: kind === 'hold' || kind === 'stop'
        ? 'The family keeps optionality until authority, veto, succession, and record retrieval can survive release conditions.'
        : 'The family must make the purchase explainable to the named family user, named family-fairness owner, and next-generation record, not only to the founder.',
    },
  ];
}

function routeStressSignals(
  kind: ReturnType<typeof routeKind>,
  directDutiesUsd: number,
  entityIncrementalUsd: number,
  annualCarryingCostUsd: number,
): RouteStressSignal[] {
  if (kind === 'entity') {
    return [
      { label: 'Incremental duty drag', value: formatUsdCompact(entityIncrementalUsd), read: 'Extra duty must have a real control purpose; otherwise the structure weakens the decision.' },
      { label: 'Bank friction', value: 'Higher', read: 'Beneficial-owner and trustee/entity review can slow acceptance against seller timing.' },
      { label: 'Annual carry', value: formatUsdCompact(annualCarryingCostUsd), read: 'Carry is still present after a higher day-one duty route.' },
    ];
  }
  if (kind === 'hold' || kind === 'stop') {
    return [
      { label: 'Immediate duty preserved', value: formatUsdCompact(directDutiesUsd), read: 'Capital is not converted into non-recoverable duty while evidence is incomplete.' },
      { label: 'Seller timing', value: kind === 'hold' ? 'Managed' : 'Rejected', read: 'The room must treat seller timing as a constraint, not as decision authority.' },
      { label: 'Reopen trigger', value: 'Evidence-led', read: 'Only signed bank, title, authority, and succession evidence reopens the route.' },
    ];
  }
  if (kind === 'status') {
    return [
      { label: 'Benefit assumed', value: 'None credited', read: 'No reduced duty path exists until qualifying status is effective before purchase.' },
      { label: 'Timing risk', value: 'High', read: 'Future status cannot be used to justify present commitment.' },
      { label: 'Fallback', value: 'Direct or hold', read: 'If eligibility fails, the room returns to direct release-differently or hold.' },
    ];
  }
  return [
    { label: 'Duty drag', value: formatUsdCompact(directDutiesUsd), read: 'Accepted only if control, family-use, and continuity value are consciously signed.' },
    { label: 'Annual carry', value: formatUsdCompact(annualCarryingCostUsd), read: 'Carrying cost must be owned as control cost, not hidden inside property optimism.' },
    { label: 'Bank readiness', value: 'Sign-off controlled', read: 'Primary and fallback rails must clear before seller commitment hardens.' },
  ];
}

function isZeroUsdDisplay(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  return /^-?\s*US\$0(?:\.0+)?(?:[KMB])?$/i.test(value.trim());
}

function shouldRepairStressSignalValue(signal: RouteStressSignal): boolean {
  return !signal.value || isZeroUsdDisplay(signal.value);
}

function stressSignalsFromMergedMetrics(
  route: Pick<RouteIntelligenceOptionV2, 'routeName' | 'metrics'>,
  signals: RouteStressSignal[],
): RouteStressSignal[] {
  const kind = routeKind(route.routeName);
  const metrics = route.metrics;
  return signals.map((signal) => {
    if (!shouldRepairStressSignalValue(signal)) return signal;
    const label = signal.label.toLowerCase();

    if (label.includes('annual carry') && metrics.annualCarryingCostUsd > 0) {
      return { ...signal, value: formatUsdCompact(metrics.annualCarryingCostUsd) };
    }

    if (label.includes('immediate duty preserved') && metrics.incrementalDutyVsRecommendedUsd < 0) {
      return { ...signal, value: formatUsdCompact(Math.abs(metrics.incrementalDutyVsRecommendedUsd)) };
    }

    if (label.includes('incremental duty') && metrics.incrementalDutyVsRecommendedUsd > 0) {
      return { ...signal, value: formatUsdCompact(metrics.incrementalDutyVsRecommendedUsd) };
    }

    if (label.includes('duty') && kind !== 'hold' && kind !== 'stop' && metrics.totalDutiesUsd > 0) {
      return { ...signal, value: formatUsdCompact(metrics.totalDutiesUsd) };
    }

    return signal;
  });
}

function deriveRouteOption(
  route: RecordLike,
  index: number,
  preview: RecordLike,
  baseTaxAudit: RecordLike,
  context: JurisdictionContext,
  values: {
    propertyValueUsd: number;
    bsdUsd: number;
    directAbsdUsd: number;
    directDutiesUsd: number;
    directAllInUsd: number;
    entityDutiesUsd: number;
    entityIncrementalUsd: number;
    annualCarryingCostUsd: number;
  },
): RouteIntelligenceOptionV2 {
  const routeName = text(route.route, `Route ${index + 1}`);
  const kind = routeKind(routeName);
  const routeId = slugRouteId(routeName, index + 1);
  const directDuties = values.directDutiesUsd;
  const directAllIn = values.directAllInUsd || values.propertyValueUsd + directDuties;
  const entityDuties = values.entityDutiesUsd || directDuties + values.entityIncrementalUsd;
  const entityAbsd = Math.max(0, values.directAbsdUsd + values.entityIncrementalUsd);
  const entityAllIn = values.propertyValueUsd + entityDuties;
  const marketModel = asRecord(
    asRecord(asRecord(preview.current_market_data).acquisition_duty_model).price_usd
      ? asRecord(asRecord(preview.current_market_data).acquisition_duty_model)
      : asRecord(preview.acquisition_duty_model),
  );
  const statusDuties = numberOr(marketModel.main_residence_total_duties_usd) || directDuties;
  const statusAllIn = values.propertyValueUsd + statusDuties;

  const routeNumbers = (() => {
    if (kind === 'entity') {
      return {
        bsdUsd: values.bsdUsd,
        absdUsd: entityAbsd,
        totalDutiesUsd: entityDuties,
        totalAcquisitionCostUsd: entityAllIn,
        incrementalDutyVsRecommendedUsd: values.entityIncrementalUsd,
        dutyDragPct: values.propertyValueUsd ? (entityDuties / values.propertyValueUsd) * 100 : 0,
        buyerCategory: 'Entity or trustee buyer route',
        primaryFeeLabel: context.primaryFeeLabel,
        secondaryFeeLabel: context.isUk ? 'Higher-rate and non-natural-person surcharge posture' : `${context.secondaryFeeLabel} (entity/trustee)`,
      };
    }
    if (kind === 'hold' || kind === 'stop') {
      return {
        bsdUsd: 0,
        absdUsd: 0,
        totalDutiesUsd: 0,
        totalAcquisitionCostUsd: 0,
        incrementalDutyVsRecommendedUsd: -directDuties,
        dutyDragPct: 0,
        buyerCategory: kind === 'hold' ? 'No acquisition released yet' : 'Acquisition stopped',
        primaryFeeLabel: `${context.primaryFeeLabel} deferred`,
        secondaryFeeLabel: `${context.secondaryFeeLabel} deferred`,
      };
    }
    if (kind === 'status') {
      return {
        bsdUsd: Math.min(values.bsdUsd || statusDuties, statusDuties),
        absdUsd: Math.max(0, statusDuties - Math.min(values.bsdUsd || statusDuties, statusDuties)),
        totalDutiesUsd: statusDuties,
        totalAcquisitionCostUsd: statusAllIn,
        incrementalDutyVsRecommendedUsd: statusDuties - directDuties,
        dutyDragPct: values.propertyValueUsd ? (statusDuties / values.propertyValueUsd) * 100 : 0,
        buyerCategory: 'Eligibility-dependent buyer route',
        primaryFeeLabel: context.primaryFeeLabel,
        secondaryFeeLabel: `${context.secondaryFeeLabel} only if eligibility is proven before purchase`,
      };
    }
    return {
      bsdUsd: values.bsdUsd,
      absdUsd: values.directAbsdUsd,
      totalDutiesUsd: directDuties,
      totalAcquisitionCostUsd: directAllIn,
      incrementalDutyVsRecommendedUsd: 0,
      dutyDragPct: values.propertyValueUsd ? (directDuties / values.propertyValueUsd) * 100 : 0,
      buyerCategory: 'Foreign individual control case',
      primaryFeeLabel: context.primaryFeeLabel,
      secondaryFeeLabel: `${context.secondaryFeeLabel} (foreign individual)`,
    };
  })();

  const releaseRule: RouteReleaseRule =
    kind === 'stop' || kind === 'entity'
      ? 'Stop'
      : kind === 'hold' || kind === 'status'
        ? 'Hold'
        : 'Release Differently';

  const taxAudit = buildAcquisitionAudit(baseTaxAudit, routeName, {
    propertyValueUsd: values.propertyValueUsd,
    ...routeNumbers,
  });

  const scenarioAdjustment = kind === 'entity' ? values.entityIncrementalUsd : 0;
  const scenarios = adjustedScenarios(
    preview,
    values.propertyValueUsd,
    routeNumbers.totalAcquisitionCostUsd || directAllIn,
    scenarioAdjustment,
    kind,
  );

  return {
    id: routeId,
    rank: index + 1,
    routeName,
    routeType:
      kind === 'direct' ? 'Direct buyer release route'
        : kind === 'entity' ? 'Structure-heavy route'
          : kind === 'status' ? 'Eligibility-dependent route'
            : kind === 'hold' ? 'Optionality-preservation route'
              : kind === 'stop' ? 'Capital-protection route'
                : 'Route under release-readiness review',
    verdict:
      kind === 'direct'
        ? 'Approved to negotiate under signed gates; no capital release'
        : kind === 'hold'
          ? 'Hold under signed-gate control'
          : kind === 'stop' || kind === 'entity'
            ? 'Do Not Release'
            : 'Hold Unless Eligibility Is Proven',
    releaseRule,
    bestUse: text(route.best_use, 'Route under review.'),
    economicRead: text(route.economic_read, 'Route economics must be read through duty drag, bank acceptance, and family authority.'),
    failureMode: text(route.failure_mode, 'The route fails if evidence and authority do not match the commitment path.'),
    releaseEffect: text(route.release_effect, 'Release only with signed evidence, owner, blocker, and decision memory.'),
    taxAudit,
    metrics: {
      propertyValueUsd: roundCurrency(values.propertyValueUsd),
      bsdUsd: roundCurrency(routeNumbers.bsdUsd),
      absdUsd: roundCurrency(routeNumbers.absdUsd),
      totalDutiesUsd: roundCurrency(routeNumbers.totalDutiesUsd),
      totalAcquisitionCostUsd: roundCurrency(routeNumbers.totalAcquisitionCostUsd),
      incrementalDutyVsRecommendedUsd: roundCurrency(routeNumbers.incrementalDutyVsRecommendedUsd),
      dutyDragPct: routeNumbers.dutyDragPct,
      annualCarryingCostUsd: kind === 'hold' || kind === 'stop' ? 0 : roundCurrency(values.annualCarryingCostUsd),
      dataQuality: 'Signed route gates control release',
      mitigationTimeline:
        kind === 'hold' || kind === 'stop'
          ? 'Reopen only after the signed route gate clears.'
          : '72-hour bank/title/source drill, then 7-day counsel and family-authority close path.',
    },
    jurisdictionValues: routeJurisdictionValues(kind, routeName, context),
    evidenceGates: evidenceGates(kind, context),
    responsibilityTransfer: responsibilityTransfer(kind, context),
    recordMismatchMap: recordMismatchMap(kind),
    counselQuestionPack: counselQuestions(kind, context),
    stressSignals: routeStressSignals(kind, directDuties, values.entityIncrementalUsd, values.annualCarryingCostUsd),
    scenarios,
  };
}

export function buildRouteIntelligenceV2(
  resolvedSurfaceData: ResolvedDecisionMemoSurfaceData,
): RouteIntelligenceV2 {
  const memoData = resolvedSurfaceData.memoData;
  const memoDataRecord = asRecord(memoData);
  const backendRecord = asRecord(resolvedSurfaceData.backendData);
  const fullArtifactRecord = asRecord(resolvedSurfaceData.fullArtifact);
  const preview = mergedPreviewData(memoDataRecord.preview_data, [
    memoDataRecord,
    backendRecord,
    fullArtifactRecord,
  ]);
  const peerStats = asRecord(preview.peer_cohort_stats);
  const nativeRouteIntelligence = asRecord(preview.route_intelligence_v2);
  const jurisdictionContext = jurisdictionContextFromRecords([
    preview,
    memoData,
    backendRecord,
    fullArtifactRecord,
    asRecord(memoDataRecord.artifact),
    asRecord(backendRecord.artifact),
    asRecord(fullArtifactRecord.artifact),
  ]);
  const nativeRouteDrivers = textList(
    nativeRouteIntelligence.nativeRouteDrivers ??
      nativeRouteIntelligence.native_route_drivers ??
      nativeRouteIntelligence.routeDrivers ??
      nativeRouteIntelligence.route_drivers ??
      peerStats.native_driver_bullets,
  );
  const routeDriverRegister = normalizeRouteDriverRegister(
    nativeRouteIntelligence.routeDriverRegister ??
      nativeRouteIntelligence.route_driver_register ??
      preview.route_driver_register,
  );
  const baseTaxAudit = getBaseTaxAudit(preview);
  const acquisitionAudit = asRecord(baseTaxAudit.acquisition_audit);
  const structureOptimization = asRecord(preview.structure_optimization);
  const comparisonBasis = asRecord(structureOptimization.comparison_basis);
  const carryingCost = asRecord(preview.carrying_cost_model);
  const annual = asRecord(preview.annual_wealth_engine);
  const annualCarryModel = asRecord(annual.carrying_cost_model);
  const currentMarketModel = asRecord(asRecord(preview.current_market_data).acquisition_duty_model);
  const annualCarryComponentSum = asArray(annualCarryModel.annual_components).reduce(
    (sum, row) => sum + numberOr(row.amount_usd),
    0,
  );
  const startingPosition = asRecord(asRecord(preview.wealth_projection_data).starting_position);
  const purchasePriceUsd = numberOr(startingPosition.purchase_price_usd);
  const purchasePriceSgd = numberOr(startingPosition.purchase_price_sgd);
  const inferredUsdSgd = purchasePriceUsd > 0 && purchasePriceSgd > purchasePriceUsd
    ? purchasePriceSgd / purchasePriceUsd
    : 0;
  const acquisitionPropertyValue = numberOr(acquisitionAudit.property_value_usd) || numberOr(acquisitionAudit.property_value);
  const acquisitionAuditLooksSgd =
    inferredUsdSgd > 1 &&
    purchasePriceUsd > 0 &&
    acquisitionPropertyValue > purchasePriceUsd * 1.1;
  const normalizeAcquisitionAmount = (value: unknown): number => {
    const amount = numberOr(value);
    if (!amount) return 0;
    return acquisitionAuditLooksSgd ? amount / inferredUsdSgd : amount;
  };

  const propertyValueUsd =
    purchasePriceUsd ||
    normalizeAcquisitionAmount(acquisitionAudit.property_value_usd) ||
    normalizeAcquisitionAmount(acquisitionAudit.property_value);
  const bsdUsd =
    normalizeAcquisitionAmount(acquisitionAudit.bsd_stamp_duty_usd) ||
    normalizeAcquisitionAmount(acquisitionAudit.bsd_stamp_duty) ||
    normalizeAcquisitionAmount(acquisitionAudit.bsd);
  const directAbsdUsd =
    normalizeAcquisitionAmount(acquisitionAudit.absd_additional_stamp_duty_usd) ||
    normalizeAcquisitionAmount(acquisitionAudit.absd_additional_stamp_duty) ||
    normalizeAcquisitionAmount(acquisitionAudit.absd);
  const directDutiesUsd =
    numberOr(comparisonBasis.direct_foreign_individual_duties_usd) ||
    normalizeAcquisitionAmount(acquisitionAudit.total_stamp_duties_usd) ||
    normalizeAcquisitionAmount(acquisitionAudit.total_stamp_duties) ||
    normalizeAcquisitionAmount(startingPosition.stamp_duties_paid) ||
    normalizeAcquisitionAmount(startingPosition.stamp_duty_drag_sgd) ||
    bsdUsd + directAbsdUsd;
  const directAllInUsd =
    numberOr(comparisonBasis.direct_foreign_individual_all_in_usd) ||
    normalizeAcquisitionAmount(acquisitionAudit.total_acquisition_cost_usd) ||
    normalizeAcquisitionAmount(acquisitionAudit.total_acquisition_cost) ||
    normalizeAcquisitionAmount(startingPosition.total_acquisition_cost) ||
    normalizeAcquisitionAmount(startingPosition.all_in_outlay_sgd) ||
    propertyValueUsd + directDutiesUsd;
  const entityIncrementalUsd =
    numberOr(comparisonBasis.entity_or_trustee_incremental_duty_usd) ||
    (propertyValueUsd ? propertyValueUsd * 0.05 : 0);
  const entityDutiesUsd =
    numberOr(comparisonBasis.entity_or_trustee_duties_usd) ||
    directDutiesUsd + entityIncrementalUsd;
  const annualCarryingCostUsd =
    numberOr(currentMarketModel.annual_carrying_cost_before_opportunity_usd) ||
    numberOr(annual.annual_carrying_cost_before_opportunity_usd) ||
    numberOr(annualCarryModel.annual_carrying_cost_before_opportunity_usd) ||
    annualCarryComponentSum ||
    numberOr(carryingCost.annual_carrying_cost_before_opportunity_usd) ||
    Math.round(propertyValueUsd * 0.018);
  const routeNumericBasis: RouteNumericBasis = {
    propertyValueUsd,
    bsdUsd,
    directAbsdUsd,
    directDutiesUsd,
    directAllInUsd,
    entityDutiesUsd,
    entityIncrementalUsd,
    annualCarryingCostUsd,
  };
  const nativePressureVariants = Array.isArray(nativeRouteIntelligence.pressureVariants)
    ? nativeRouteIntelligence.pressureVariants
    : Array.isArray(nativeRouteIntelligence.pressure_variants)
      ? nativeRouteIntelligence.pressure_variants
      : [];
  const nativeRouteOptions = Array.isArray(nativeRouteIntelligence.routeOptions)
    ? nativeRouteIntelligence.routeOptions
    : Array.isArray(nativeRouteIntelligence.route_options)
      ? nativeRouteIntelligence.route_options
      : nativePressureVariants;
  if (nativeRouteOptions.length > 0) {
    const routes = (nativeRouteOptions as RouteIntelligenceOptionV2[]).map((route) =>
      normalizeRouteOptionForSurface(route, jurisdictionContext, preview, baseTaxAudit, routeNumericBasis),
    );
    const normalizedPressureVariants = (nativePressureVariants.length > 0
      ? nativePressureVariants as RouteIntelligenceOptionV2[]
      : routes
    ).map((route) => normalizeRouteOptionForSurface(route, jurisdictionContext, preview, baseTaxAudit, routeNumericBasis));
    const recommendedRouteId = text(
      nativeRouteIntelligence.recommendedRouteId ?? nativeRouteIntelligence.recommended_route_id,
      text(routes[0]?.id, 'direct_foreign_individual'),
    );
    const selectedRoute =
      routes.find((route) => route.id === recommendedRouteId) ??
      routes[0];
    const selectedLiveOptionRecord = asRecord(
      nativeRouteIntelligence.selectedLiveOption ?? nativeRouteIntelligence.selected_live_option,
    );
    const proposedRouteRecord = asRecord(
      nativeRouteIntelligence.proposedRoute ?? nativeRouteIntelligence.proposed_route,
    );
    const selectedLiveOption = Object.keys(selectedLiveOptionRecord).length > 0
      ? normalizeRouteOptionForSurface(selectedLiveOptionRecord as RouteIntelligenceOptionV2, jurisdictionContext, preview, baseTaxAudit, routeNumericBasis)
      : selectedRoute;
    const proposedRoute = Object.keys(proposedRouteRecord).length > 0
      ? normalizeRouteOptionForSurface(proposedRouteRecord as RouteIntelligenceOptionV2, jurisdictionContext, preview, baseTaxAudit, routeNumericBasis)
      : selectedRoute;
    return {
      surfaceContract: ROUTE_INTELLIGENCE_V2_CONTRACT,
      surfaceEyebrow: text(nativeRouteIntelligence.surfaceEyebrow ?? nativeRouteIntelligence.surface_eyebrow, 'Proposed Move Release Readiness'),
      surfaceTitle: text(nativeRouteIntelligence.surfaceTitle ?? nativeRouteIntelligence.surface_title, 'Proposed Move Release Readiness Memo'),
      nativeRouteDrivers,
      nativeRouteDriverTitle: sanitizeRouteDriverTitle(
        nativeRouteIntelligence.nativeRouteDriverTitle ??
          nativeRouteIntelligence.native_route_driver_title,
      ),
      nativeRouteDriverSubtitle: text(
        nativeRouteIntelligence.nativeRouteDriverSubtitle ??
          nativeRouteIntelligence.native_route_driver_subtitle ??
          peerStats.driver_analysis_subtitle,
        'What the route-pattern witnesses actually change in this move.',
      ),
      nativeRouteDriverNote: sanitizeRouteDriverNote(
        nativeRouteIntelligence.nativeRouteDriverNote ??
          nativeRouteIntelligence.native_route_driver_note ??
          peerStats.driver_analysis_note,
      ),
      routeDriverRegister,
      selectorLabel: text(nativeRouteIntelligence.selectorLabel ?? nativeRouteIntelligence.selector_label, 'Route Being Released'),
      selectorCopy: text(
        nativeRouteIntelligence.selectorCopy ?? nativeRouteIntelligence.selector_copy,
        'Review release-readiness routes against the proposed move. The downstream tax audit, jurisdiction readiness, carrying-cost stance, release gates, scenario data, and owner matrix show what changes if the proposed route is modified, held, or stopped.',
      ),
      comparisonLabel: text(nativeRouteIntelligence.comparisonLabel ?? nativeRouteIntelligence.comparison_label, 'Release Readiness Routes'),
      comparisonTitle: text(nativeRouteIntelligence.comparisonTitle ?? nativeRouteIntelligence.comparison_title, 'Routes reviewed against the proposed route, not new advisory options.'),
      selectedRouteLabel: text(nativeRouteIntelligence.selectedRouteLabel ?? nativeRouteIntelligence.selected_route_label, 'Variant Under Review'),
      memoReference: text(
        nativeRouteIntelligence.memoReference ?? nativeRouteIntelligence.memo_reference,
        text(memoDataRecord.intake_id, 'Release Readiness Memo'),
      ),
      generatedAt: typeof memoDataRecord.generated_at === 'string' ? memoDataRecord.generated_at : undefined,
      corridor: text(nativeRouteIntelligence.corridor, `${jurisdictionContext.sourceLabel} -> ${jurisdictionContext.destinationLabel}`),
      move: text(nativeRouteIntelligence.move, text(memoDataRecord.decision_thesis, `Selected private-wealth move into ${jurisdictionContext.destinationLabel}`)),
      recommendedRouteId,
      selectedLiveOption,
      proposedRoute,
      pressureVariants: normalizedPressureVariants,
      routeOptions: routes,
      buyerProfileMatrix: coerceBuyerProfileMatrix(
        nativeRouteIntelligence.buyerProfileMatrix ?? nativeRouteIntelligence.buyer_profile_matrix,
        jurisdictionContext,
      ),
      principalValueGate: coercePrincipalValueGate(
        nativeRouteIntelligence.principalValueGate ?? nativeRouteIntelligence.principal_value_gate,
      ) ?? principalValueGateFromResolved(resolvedSurfaceData),
      routeMemoSpine: buildRouteMemoSpine(preview),
      sourceRead: text(
        nativeRouteIntelligence.sourceRead ?? nativeRouteIntelligence.source_read,
        'This review applies the stored release-readiness evidence to the selected route and shows what must clear before capital, title, or seller commitments harden.',
      ),
    };
  }
  const routeOptions =
    asArray(preview.route_options).length > 0
      ? asArray(preview.route_options)
      : asArray(structureOptimization.route_options).length > 0
        ? asArray(structureOptimization.route_options)
        : routeRecordsFromStructures(asArray(structureOptimization.structures_analyzed));
  const routes = (routeOptions.length > 0
    ? routeOptions
    : [{ route: 'Direct foreign individual acquisition', verdict: 'Preferred modified route' }]
  ).map((route, index) => deriveRouteOption(route, index, preview, baseTaxAudit, jurisdictionContext, {
    ...routeNumericBasis,
  }));

  const recommendedRoute =
    routes.find((route) => route.id === 'direct_foreign_individual') ??
    routes.find((route) => isReleaseRoute(route)) ??
    routes[0];

  return {
    surfaceContract: ROUTE_INTELLIGENCE_V2_CONTRACT,
    surfaceEyebrow: 'Proposed Move Release Readiness',
    surfaceTitle: 'Proposed Move Release Readiness Memo',
    nativeRouteDrivers,
    nativeRouteDriverTitle: 'Route Drivers From Source Review',
    nativeRouteDriverSubtitle: text(peerStats.driver_analysis_subtitle, 'What the route-pattern witnesses actually change in this move.'),
    nativeRouteDriverNote: sanitizeRouteDriverNote(
      peerStats.driver_analysis_note,
    ),
    routeDriverRegister,
    selectorLabel: 'Route Being Released',
    selectorCopy: 'Review release-readiness routes against the proposed move. The downstream tax audit, jurisdiction readiness, carrying-cost stance, release gates, scenario data, and owner matrix show what changes if the proposed route is modified, held, or stopped.',
    comparisonLabel: 'Release Readiness Routes',
    comparisonTitle: 'Routes reviewed against the proposed route, not new advisory options.',
    selectedRouteLabel: 'Variant Under Review',
    memoReference: text(memoDataRecord.intake_id, text(resolvedSurfaceData.backendData?.intake_id, 'Release Readiness Memo')),
    generatedAt: typeof memoDataRecord.generated_at === 'string' ? memoDataRecord.generated_at : undefined,
    corridor: text(preview.corridor, `${jurisdictionContext.sourceLabel} -> ${jurisdictionContext.destinationLabel}`),
    move: text(preview.live_decision, text(memoDataRecord.decision_thesis, `Selected private-wealth move into ${jurisdictionContext.destinationLabel}`)),
    recommendedRouteId: recommendedRoute?.id ?? 'direct_foreign_individual',
    selectedLiveOption: recommendedRoute,
    proposedRoute: recommendedRoute,
    pressureVariants: routes,
    routeOptions: routes,
    buyerProfileMatrix: defaultBuyerProfileMatrix(jurisdictionContext),
    principalValueGate: principalValueGateFromResolved(resolvedSurfaceData),
    routeMemoSpine: buildRouteMemoSpine(preview),
    sourceRead: 'The route intelligence surface reads the stored decision memo and re-slices tax, jurisdiction, projection, owner, and evidence sections by selected route.',
  };
}
