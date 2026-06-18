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

function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function textList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => text(item))
    .filter(Boolean);
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
    return `${sign}US$${(absolute / 1_000_000).toFixed(2)}M`;
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
    lower.includes('non-natural') ||
    lower.includes('non natural')
  ) return 'entity';
  if (lower.includes('status') || lower.includes('remission') || lower.includes('residence')) return 'status';
  if (lower.includes('hold') || lower.includes('rent')) return 'hold';
  if (lower.includes('stop')) return 'stop';
  return 'other';
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

function defaultBuyerProfileMatrix(): BuyerProfileRemissionMatrix {
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

function coerceBuyerProfileMatrix(value: unknown): BuyerProfileRemissionMatrix {
  const fallback = defaultBuyerProfileMatrix();
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
      'Would the family or adviser stack be able to produce this decision-control object from existing notes?',
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
    bsd: roundCurrency(values.bsdUsd),
    absd: roundCurrency(values.absdUsd),
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
  if (route.releaseRule === 'Release Differently') return 'PROCEED_MODIFIED';
  if (route.releaseRule === 'Hold') return 'HOLD';
  return 'DO_NOT_PROCEED';
}

function routeRiskLevel(route: RouteIntelligenceOptionV2): 'MODERATE-HIGH' | 'HIGH' | 'CRITICAL' {
  if (route.releaseRule === 'Stop') return 'CRITICAL';
  if (route.releaseRule === 'Hold') return 'HIGH';
  return 'MODERATE-HIGH';
}

function routeStructure(route: RouteIntelligenceOptionV2, selectedRouteId: string): RecordLike {
  const selected = route.id === selectedRouteId;
  const isExecutable = route.metrics.totalAcquisitionCostUsd > 0;
  const incrementalDuty = Math.abs(route.metrics.incrementalDutyVsRecommendedUsd);
  return {
    name: route.routeName,
    type: route.routeType,
    verdict: routeVerdictCode(route),
    viable: route.releaseRule === 'Release Differently',
    net_benefit_10yr: route.releaseRule === 'Release Differently' ? 0 : -incrementalDuty,
    net_benefit_display: selected
      ? formatUsdCompact(route.metrics.totalAcquisitionCostUsd)
      : incrementalDuty
        ? `-${formatUsdCompact(incrementalDuty)}`
        : formatUsdCompact(route.metrics.totalAcquisitionCostUsd),
    net_benefit_label: selected
      ? 'Selected route all-in outlay'
      : 'Duty delta vs recommended route',
    tax_savings_pct: 0,
    setup_cost: isExecutable ? route.metrics.totalDutiesUsd : undefined,
    annual_cost: isExecutable ? route.metrics.annualCarryingCostUsd : undefined,
    warnings: route.evidenceGates.map((gate) => `${gate.gate}: ${gate.consequenceIfMissing}`),
  };
}

function buildRouteChecklist(route: RouteIntelligenceOptionV2): RecordLike {
  const criticalStatus = /stop|hold|missing|blocked|unless|required before commitment/i;
  return {
    total_items: route.evidenceGates.length,
    items: route.evidenceGates.map((gate) => ({
      category: gate.gate,
      item: gate.evidenceRequired,
      status: gate.releaseStatus,
      priority: criticalStatus.test(gate.releaseStatus) ? 'critical' : 'high',
      timeline: route.metrics.mitigationTimeline,
      owner: gate.owner,
      owner_label: gate.owner,
      responsible: gate.owner,
      responsible_label: gate.owner,
    })),
  };
}

function buildRouteExecutionSequence(route: RouteIntelligenceOptionV2): RecordLike[] {
  return route.responsibilityTransfer.map((step, index) => ({
    step: index + 1,
    phase: step.action,
    action: step.releaseCondition,
    owner: step.primaryOwner,
    responsible: step.primaryOwner,
    fallback_owner: step.fallbackOwner,
    timeline: index === 0 ? '72 hours' : '7 days',
    status: 'release-gated',
  }));
}

function buildRouteScenarioTree(route: RouteIntelligenceOptionV2): RecordLike {
  const verdictCode = routeVerdictCode(route);
  const weightedNetOutcome = route.scenarios.reduce((sum, scenario, index) => {
    const weight = index === 0 ? 0.6 : index === 1 ? 0.25 : 0.15;
    return sum + (scenario.netOutcomeUsd * weight);
  }, 0);
  return {
    recommended_branch: verdictCode,
    recommendation_strength: route.releaseRule === 'Release Differently' ? 78 : route.releaseRule === 'Hold' ? 68 : 84,
    decision_ev_usd: roundCurrency(weightedNetOutcome),
    expected_value_usd: roundCurrency(weightedNetOutcome),
    decision_ev_label: route.releaseRule === 'Release Differently'
      ? 'Weighted route outcome after release conditions'
      : 'Weighted consequence if this route is forced',
    recommended_route: route.routeName,
    route_read: route.releaseEffect,
    critical_gates: route.evidenceGates.map((gate) => gate.gate),
    doctrine_metadata: {
      failure_mode_count: route.evidenceGates.length,
      risk_flags_total: route.evidenceGates.length + route.recordMismatchMap.length,
      antifragility_assessment: route.releaseRule === 'Release Differently'
        ? 'Conditional resilience: route can strengthen the family system only if authority, banking, source, and succession records match before release.'
        : 'Fragile route state: the selected route converts uncertainty into capital drag unless the blocking evidence changes.',
      failure_modes: route.evidenceGates.map((gate) => ({
        mode: gate.gate,
        doctrine_book: 'Decision Release Rule',
        severity: criticalStatusFromGate(gate.releaseStatus),
        description: gate.consequenceIfMissing,
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
  const scenarios = route.scenarios.map((scenario, index) => {
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
  const criticalItems = route.evidenceGates.filter((gate) => criticalStatusFromGate(gate.releaseStatus) === 'CRITICAL').length;
  const highItems = Math.max(0, route.evidenceGates.length - criticalItems);
  return {
    risk_level: routeRiskLevel(route),
    total_exposure_formatted: formatUsdCompact(
      route.metrics.totalDutiesUsd || Math.abs(route.metrics.incrementalDutyVsRecommendedUsd),
    ),
    critical_items: criticalItems,
    high_items: highItems,
    high_priority: highItems,
    priority_risks_total: route.evidenceGates.length,
    risk_factors_count: route.evidenceGates.length + route.recordMismatchMap.length,
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
  const preview = asRecord(scopedMemoData.preview_data);
  scopedMemoData.preview_data = preview;

  const routeTaxAudit = buildAcquisitionAudit(asRecord(route.taxAudit), route.routeName, {
    propertyValueUsd: route.metrics.propertyValueUsd,
    bsdUsd: route.metrics.bsdUsd,
    absdUsd: route.metrics.absdUsd,
    totalDutiesUsd: route.metrics.totalDutiesUsd,
    totalAcquisitionCostUsd: route.metrics.totalAcquisitionCostUsd,
    dutyDragPct: route.metrics.dutyDragPct,
    buyerCategory: route.routeName,
    primaryFeeLabel: text(asRecord(asRecord(route.taxAudit).acquisition_audit).primary_fee_label, 'BSD'),
    secondaryFeeLabel: text(asRecord(asRecord(route.taxAudit).acquisition_audit).secondary_fee_label, 'ABSD'),
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
  const executableRoutes = (routes?.length ? routes : [route]).filter((option) => option.metrics.totalAcquisitionCostUsd > 0);
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
      label: route.releaseRule === 'Release Differently' ? 'Route all-in outlay' : 'Route exposure under review',
      value: formatUsdCompact(route.metrics.totalAcquisitionCostUsd || Math.abs(route.metrics.incrementalDutyVsRecommendedUsd)),
      description: route.economicRead,
    },
  };
  preview.total_savings = formatUsdCompact(route.metrics.totalAcquisitionCostUsd || Math.abs(route.metrics.incrementalDutyVsRecommendedUsd));
  preview.exposure_class = route.routeType;
  preview.verdict = route.verdict;
  preview.data_quality = 'limited';
  preview.data_quality_note = route.metrics.dataQuality;
  preview.thesis_summary = `${route.routeName}: ${route.releaseEffect}`;
  preview.decision_thesis = route.economicRead;
  preview.thesis = `${route.economicRead} ${route.failureMode}`;
  preview.decision_context = route.bestUse;
  preview.risk_assessment = routeRiskAssessment;
  preview.cross_border_audit_summary = routeTaxAudit;
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
  preview.all_mistakes = route.evidenceGates.map((gate, index) => ({
    id: `${route.id}-gate-${index + 1}`,
    title: gate.gate,
    mistake: gate.evidenceRequired,
    cost: gate.consequenceIfMissing,
    cost_numeric: route.metrics.totalDutiesUsd || Math.abs(route.metrics.incrementalDutyVsRecommendedUsd),
    urgency: criticalStatusFromGate(gate.releaseStatus),
    mitigation: gate.releaseStatus,
    owner: gate.owner,
  }));
  scopedBackendData.risk_assessment = routeRiskAssessment;
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

function evidenceGates(kind: ReturnType<typeof routeKind>): RouteEvidenceGate[] {
  const common: RouteEvidenceGate[] = [
    {
      gate: 'Buyer capacity and title route',
      owner: 'Singapore property counsel',
      evidenceRequired: 'Exact buyer name, title class, OTP/deposit mechanics, completion timing, and whether approval is required.',
      releaseStatus: 'Required before commitment',
      consequenceIfMissing: 'The family may sign a route that cannot carry the intended authority, use, or exit path.',
    },
    {
      gate: 'BSD / ABSD / SSD calculation',
      owner: 'Singapore tax counsel',
      evidenceRequired: 'Written duty computation for the buyer profile, basis value, due date, and SSD early-exit exposure.',
      releaseStatus: 'Required before payment',
      consequenceIfMissing: 'Non-recoverable duty drag can be accepted without the room understanding the real all-in cost.',
    },
    {
      gate: 'SoW / SoF corroboration',
      owner: 'UAE source bank + family office operator / CFO',
      evidenceRequired: 'Source-of-wealth and source-of-funds file with bank statements, sale/dividend records, tax support, and transfer narrative.',
      releaseStatus: 'Required before receiving-bank reliance',
      consequenceIfMissing: 'Bank compliance escalation can stop the move after seller timing has started.',
    },
    {
      gate: 'Primary and fallback banking rails',
      owner: 'Singapore receiving bank + UAE source bank',
      evidenceRequired: 'Named sending and receiving rails, accepted signers, FX authority, emergency fallback path, and reporting cadence.',
      releaseStatus: 'Required before irrevocable release',
      consequenceIfMissing: 'The asset can become hostage to one rail, one banker, or one unresolved KYC question.',
    },
    {
      gate: 'Family authority and veto',
      owner: 'Founder, G2 son, daughter/fairness owner, and family office operator / CFO',
      evidenceRequired: 'Who can approve, stop, sign, move funds, retrieve records, and explain the purchase without the founder.',
      releaseStatus: 'Required before visibility',
      consequenceIfMissing: 'Late spouse/G2/fairness veto can convert a property decision into a family-governance event.',
    },
    {
      gate: 'Succession and decision memory',
      owner: 'Succession counsel + family office operator / CFO',
      evidenceRequired: 'Where the route decision, evidence file, title documents, bank approvals, and future reporting pack will live.',
      releaseStatus: 'Required before completion',
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

function responsibilityTransfer(kind: ReturnType<typeof routeKind>) {
  const releaseCondition = kind === 'hold' || kind === 'stop'
    ? 'No one releases funds; owners preserve evidence and review trigger.'
    : 'Named owner can act without waiting for informal founder interpretation.';
  return [
    { action: 'See the full record', primaryOwner: 'Family office operator / CFO', fallbackOwner: 'G2 son', releaseCondition },
    { action: 'Stop the move', primaryOwner: 'Founder', fallbackOwner: 'Daughter/fairness owner + counsel', releaseCondition: 'Stop authority is written before seller timing starts.' },
    { action: 'Sign and release funds', primaryOwner: 'Founder or appointed signer', fallbackOwner: 'Bank-approved alternate signer', releaseCondition: kind === 'hold' || kind === 'stop' ? 'Not released under this route.' : 'Bank mandates, FX authority, and signer limits match the route.' },
    { action: 'Move funds across rails', primaryOwner: 'UAE source bank lead', fallbackOwner: 'Fallback bank rail owner', releaseCondition: kind === 'hold' || kind === 'stop' ? 'Rail review only; no settlement transfer.' : 'Primary and fallback rails have accepted SoW/SoF.' },
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
    { record: 'Cash and FX path', currentRead: 'Dubai-origin funds must be corroborated and transferable.', targetRead: `${routeRead}; bank rails accept source file and FX authority.`, releaseStatus: 'Release-gated' },
    { record: 'Title and beneficial ownership', currentRead: 'Buyer and use purpose must not be assumed from family intent.', targetRead: `${routeRead}; title record and beneficial-owner record say the same thing.`, releaseStatus: 'Release-gated' },
    { record: 'Tax and duty position', currentRead: 'Duty drag changes by route and buyer category.', targetRead: `${routeRead}; written acquisition-duty computation is attached.`, releaseStatus: 'Release-gated' },
    { record: 'Family authority', currentRead: 'Founder, son, daughter/fairness owner, and operator roles are not interchangeable.', targetRead: `${routeRead}; approval, veto, signer, and fallback roles are signed.`, releaseStatus: 'Release-gated' },
    { record: 'Succession memory', currentRead: 'Decision cannot live only in one adviser thread.', targetRead: `${routeRead}; decision memory is indexed for G2/G3 retrieval.`, releaseStatus: 'Release-gated' },
  ];
}

function counselQuestions(kind: ReturnType<typeof routeKind>) {
  const base = [
    { desk: 'Singapore property counsel', question: 'Does this exact title class allow the proposed buyer, use, completion timing, and future family-control purpose without additional approval?' },
    { desk: 'Singapore tax counsel', question: 'Confirm BSD, ABSD, SSD, owner-occupation, property-tax, and filing/payment timing for this buyer profile in writing.' },
    { desk: 'Singapore receiving bank', question: 'What SoW/SoF documents, signer mandates, FX notes, and fallback transfer path must be accepted before seller timing begins?' },
    { desk: 'UAE source bank', question: 'Can the source account, transfer purpose, FX authority, and documentary trail be corroborated in the format the receiving bank will accept?' },
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

function routeJurisdictionValues(kind: ReturnType<typeof routeKind>, routeName: string) {
  return [
    {
      jurisdiction: 'Dubai / UAE',
      value: 'Source-of-funds and transfer authority',
      releaseRead: 'The Dubai side must prove origin, signer power, FX authority, and availability of records before Singapore can rely on the incoming capital.',
    },
    {
      jurisdiction: 'Singapore',
      value: 'Title, duty, bank acceptance, and property-use consequence',
      releaseRead: `${routeName} releases only if title eligibility, BSD/ABSD/SSD, receiving-bank acceptance, and family-use evidence align before commitment.`,
    },
    {
      jurisdiction: 'Family system',
      value: 'G1/G2/G3 authority and decision memory',
      releaseRead: kind === 'hold' || kind === 'stop'
        ? 'The family keeps optionality until authority, veto, succession, and record retrieval can survive release conditions.'
        : 'The family must make the purchase explainable to son, daughter/fairness owner, and future grandson memory, not only to the founder.',
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
      { label: 'Benefit assumed', value: '0 until proven', read: 'No reduced duty path exists until qualifying status is effective before purchase.' },
      { label: 'Timing risk', value: 'High', read: 'Future status cannot be used to justify present commitment.' },
      { label: 'Fallback', value: 'Direct or hold', read: 'If eligibility fails, the room returns to direct release-differently or hold.' },
    ];
  }
  return [
    { label: 'Duty drag', value: formatUsdCompact(directDutiesUsd), read: 'Accepted only if control, family-use, and continuity value are consciously signed.' },
    { label: 'Annual carry', value: formatUsdCompact(annualCarryingCostUsd), read: 'Carrying cost must be owned as control cost, not hidden inside property optimism.' },
    { label: 'Bank readiness', value: 'Release-gated', read: 'Primary and fallback rails must clear before seller commitment hardens.' },
  ];
}

function deriveRouteOption(
  route: RecordLike,
  index: number,
  preview: RecordLike,
  baseTaxAudit: RecordLike,
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
        primaryFeeLabel: 'BSD',
        secondaryFeeLabel: 'ABSD (entity/trustee)',
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
        primaryFeeLabel: 'BSD deferred',
        secondaryFeeLabel: 'ABSD deferred',
      };
    }
    return {
      bsdUsd: values.bsdUsd,
      absdUsd: values.directAbsdUsd,
      totalDutiesUsd: directDuties,
      totalAcquisitionCostUsd: directAllIn,
      incrementalDutyVsRecommendedUsd: 0,
      dutyDragPct: values.propertyValueUsd ? (directDuties / values.propertyValueUsd) * 100 : 0,
      buyerCategory: kind === 'status' ? 'Eligibility-dependent buyer route' : 'Foreign individual control case',
      primaryFeeLabel: 'BSD',
      secondaryFeeLabel: kind === 'status' ? 'ABSD unless eligibility is proven before purchase' : 'ABSD (foreign individual)',
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
        ? 'Proceed Modified: Release Differently'
        : kind === 'hold'
          ? 'Hold Until Release Evidence Clears'
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
      dataQuality: 'Release-gated',
      mitigationTimeline:
        kind === 'hold' || kind === 'stop'
          ? 'Reopen only after the missing evidence gate clears.'
          : '72-hour bank/title/source drill, then 7-day counsel and family-authority close path.',
    },
    jurisdictionValues: routeJurisdictionValues(kind, routeName),
    evidenceGates: evidenceGates(kind),
    responsibilityTransfer: responsibilityTransfer(kind),
    recordMismatchMap: recordMismatchMap(kind),
    counselQuestionPack: counselQuestions(kind),
    stressSignals: routeStressSignals(kind, directDuties, values.entityIncrementalUsd, values.annualCarryingCostUsd),
    scenarios,
  };
}

export function buildRouteIntelligenceV2(
  resolvedSurfaceData: ResolvedDecisionMemoSurfaceData,
): RouteIntelligenceV2 {
  const memoData = resolvedSurfaceData.memoData;
  const preview = asRecord(memoData.preview_data);
  const peerStats = asRecord(preview.peer_cohort_stats);
  const nativeRouteIntelligence = asRecord(preview.route_intelligence_v2);
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
    const routes = nativeRouteOptions as RouteIntelligenceOptionV2[];
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
        text(memoData.intake_id, 'Release Readiness Memo'),
      ),
      generatedAt: typeof memoData.generated_at === 'string' ? memoData.generated_at : undefined,
      corridor: text(nativeRouteIntelligence.corridor, 'Source -> Destination'),
      move: text(nativeRouteIntelligence.move, 'Selected private-wealth move under release-readiness review'),
      recommendedRouteId,
      selectedLiveOption: Object.keys(selectedLiveOptionRecord).length > 0
        ? selectedLiveOptionRecord as RouteIntelligenceOptionV2
        : selectedRoute,
      proposedRoute: Object.keys(proposedRouteRecord).length > 0
        ? proposedRouteRecord as RouteIntelligenceOptionV2
        : selectedRoute,
      pressureVariants: (nativePressureVariants.length > 0 ? nativePressureVariants : routes) as RouteIntelligenceOptionV2[],
      routeOptions: routes,
      buyerProfileMatrix: coerceBuyerProfileMatrix(
        nativeRouteIntelligence.buyerProfileMatrix ?? nativeRouteIntelligence.buyer_profile_matrix,
      ),
      principalValueGate: coercePrincipalValueGate(
        nativeRouteIntelligence.principalValueGate ?? nativeRouteIntelligence.principal_value_gate,
      ) ?? principalValueGateFromResolved(resolvedSurfaceData),
      sourceRead: text(
        nativeRouteIntelligence.sourceRead ?? nativeRouteIntelligence.source_read,
        'This surface reads the stored decision memo and reviews the proposed move through release variants; it is not a client-side intake or advisory option picker.',
      ),
    };
  }
  const baseTaxAudit = getBaseTaxAudit(preview);
  const acquisitionAudit = asRecord(baseTaxAudit.acquisition_audit);
  const structureOptimization = asRecord(preview.structure_optimization);
  const comparisonBasis = asRecord(structureOptimization.comparison_basis);
  const carryingCost = asRecord(preview.carrying_cost_model);
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
    numberOr(carryingCost.annual_carrying_cost_before_opportunity_usd) ||
    Math.round(propertyValueUsd * 0.018);

  const routeOptions =
    asArray(preview.route_options).length > 0
      ? asArray(preview.route_options)
      : asArray(structureOptimization.route_options).length > 0
        ? asArray(structureOptimization.route_options)
        : routeRecordsFromStructures(asArray(structureOptimization.structures_analyzed));
  const routes = (routeOptions.length > 0
    ? routeOptions
    : [{ route: 'Direct foreign individual acquisition', verdict: 'Preferred modified route' }]
  ).map((route, index) => deriveRouteOption(route, index, preview, baseTaxAudit, {
    propertyValueUsd,
    bsdUsd,
    directAbsdUsd,
    directDutiesUsd,
    directAllInUsd,
    entityDutiesUsd,
    entityIncrementalUsd,
    annualCarryingCostUsd,
  }));

  const recommendedRoute =
    routes.find((route) => route.id === 'direct_foreign_individual') ??
    routes.find((route) => route.releaseRule === 'Release Differently') ??
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
    memoReference: text(memoData.intake_id, text(resolvedSurfaceData.backendData?.intake_id, 'Release Readiness Memo')),
    generatedAt: typeof memoData.generated_at === 'string' ? memoData.generated_at : undefined,
    corridor: text(preview.corridor, 'Dubai -> Singapore'),
    move: text(preview.live_decision, 'Dubai family purchasing a Singapore penthouse'),
    recommendedRouteId: recommendedRoute?.id ?? 'direct_foreign_individual',
    selectedLiveOption: recommendedRoute,
    proposedRoute: recommendedRoute,
    pressureVariants: routes,
    routeOptions: routes,
    buyerProfileMatrix: defaultBuyerProfileMatrix(),
    principalValueGate: principalValueGateFromResolved(resolvedSurfaceData),
    sourceRead: 'The route intelligence surface reads the stored decision memo and re-slices tax, jurisdiction, projection, owner, and evidence sections by selected route.',
  };
}
