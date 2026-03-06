/**
 * PDF Data Transformer — Extracts and normalizes all data from PdfMemoData
 * Replaces the 280-line inline data extraction in PatternAuditDocument
 * Commandment V: zero `as any` — all access through type guards
 */

import type {
  PdfMemoData,
  PdfPreviewData,
  RiskAssessment,
  CrisisData,
  TransparencyData,
  HnwiTrendsData,
  RegimeIntelligence,
  RiskFactor,
  Mistake,
  StructureOptimization,
  DoctrineMetadata,
  PatternIntelligence,
  CrossBorderAuditSummary,
  LegalReferences,
  RegulatoryCitation,
} from '../pdf-types';
import { computeRiskRadarScores } from '@/lib/decision-memo/compute-risk-radar-scores';
import { formatCurrency } from '../pdf-styles';
import { getVerdictTheme, VerdictTheme } from '../pdf-verdict-theme';
import { safeText } from './pdf-utils';
import {
  getRiskAssessment,
  getAllMistakes,
  getShowTaxSavings,
  getStructureVerdict,
  getViaNegativa,
  getCrisisData,
  getTransparencyData,
  getGoldenVisaIntelligence,
  getRegimeIntelligence,
  getHnwiTrendsData,
} from './pdf-type-guards';

// ─── Parsers ──────────────────────────────────────────────────────────────────

function parseCrisisData(content: string | undefined): CrisisData | null {
  if (!content || typeof content !== 'string') return null;
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.scenarios || parsed.overall_resilience || parsed.recommendations) return parsed as CrisisData;
    }
  } catch { /* invalid JSON */ }
  return null;
}

function parseTransparencyData(content: string | undefined): TransparencyData | null {
  if (!content || typeof content !== 'string') return null;
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]) as TransparencyData;
  } catch { /* invalid JSON */ }
  return null;
}

/** Parse dollar amounts from strings like "$2.7M", "$450K", "60% = $2,700,000" */
export function parseDollarAmount(costString: string): number {
  if (!costString || typeof costString !== 'string') return 0;

  const afterEquals = costString.split('=').pop()?.trim();
  if (afterEquals) {
    const suffixMatch = afterEquals.match(/\$([\d.]+)([MK])/i);
    if (suffixMatch) {
      let val = parseFloat(suffixMatch[1]);
      if (suffixMatch[2].toUpperCase() === 'M') val *= 1_000_000;
      if (suffixMatch[2].toUpperCase() === 'K') val *= 1_000;
      return val;
    }
    const commaMatch = afterEquals.match(/\$([\d,]+)/);
    if (commaMatch) return parseFloat(commaMatch[1].replace(/,/g, ''));
  }

  const mMatch = costString.match(/\$([\d.]+)M/i);
  if (mMatch) return parseFloat(mMatch[1]) * 1_000_000;
  const kMatch = costString.match(/\$([\d.]+)K/i);
  if (kMatch) return parseFloat(kMatch[1]) * 1_000;
  const anyCommaMatch = costString.match(/\$([\d,]+)/);
  if (anyCommaMatch) return parseFloat(anyCommaMatch[1].replace(/,/g, ''));

  const mNoSign = costString.match(/\b([\d.]+)M\b/i);
  if (mNoSign) return parseFloat(mNoSign[1]) * 1_000_000;
  const kNoSign = costString.match(/\b([\d.]+)K\b/i);
  if (kNoSign) return parseFloat(kNoSign[1]) * 1_000;

  if (!costString.includes('%') && !/[MK]\b/i.test(costString)) {
    const simple = costString.match(/\$?([\d.]+)/);
    if (simple) return parseFloat(simple[1]);
  }
  return 0;
}

/** Extract value creation from deeply nested object */
function extractValueCreation(vc: PdfPreviewData['value_creation']): string {
  if (!vc) return '—';
  if (typeof vc === 'string') return vc;
  if (typeof vc === 'number') return formatCurrency(vc);
  if (typeof vc === 'object') {
    const obj = vc as Record<string, unknown>;
    if (obj.total_formatted) return String(obj.total_formatted);
    if (obj.formatted) return String(obj.formatted);
    if (typeof obj.total === 'number') return formatCurrency(obj.total as number);
    if (typeof obj.amount === 'number') return formatCurrency(obj.amount as number);
    // Check annual.total_formatted
    const annual = obj.annual as Record<string, unknown> | undefined;
    if (annual?.total_formatted) return String(annual.total_formatted);
    if (typeof annual?.total === 'number') return formatCurrency(annual.total as number);
  }
  return '—';
}

/** Map Mistake[] → RiskFactor[] for PDF severity display */
function mapMistakesToRiskFactors(mistakes: Mistake[]): RiskFactor[] {
  return mistakes.map((m) => {
    let exposureAmount = 0;
    if (m.cost && typeof m.cost === 'string') exposureAmount = parseDollarAmount(m.cost);
    if (exposureAmount === 0 && m.cost_numeric && m.cost_numeric > 1000) exposureAmount = m.cost_numeric;

    let severity: 'critical' | 'high' | 'medium' | 'low' = 'medium';
    const urgency = (m.urgency || '').toUpperCase();
    if (urgency.includes('CRITICAL')) severity = 'critical';
    else if (urgency.includes('HIGH')) severity = 'high';
    else if (urgency.includes('MEDIUM')) severity = 'medium';
    else if (urgency.includes('LOW')) severity = 'low';

    return {
      title: m.title || 'Unspecified Risk',
      description: m.fix,
      severity,
      exposure_amount: exposureAmount,
      cost_display: m.cost,
      mitigation: m.fix,
    };
  });
}

// ─── Via Negativa computation ─────────────────────────────────────────────────

export interface PdfViaNegativa {
  isActive: boolean;
  badgeLabel: string;
  dayOneLoss: number;
  dayOneLossAmount: number;
  taxEfficiencyPassed: boolean;
  liquidityPassed: boolean;
  structurePassed: boolean;
  verdictHeader: string;
  verdictBadgeLabel: string;
  stampText: string;
  stampSubtext: string;
  ctaBody: string;
}

// ─── Main transformer ────────────────────────────────────────────────────────

export interface MemoVariables {
  // Identity
  intakeId: string;
  generatedAt: string;
  sourceJurisdiction: string;
  destJurisdiction: string;

  // Verdict
  verdict: string;
  riskLevel: string;
  riskAssessment: RiskAssessment | undefined;
  verdictTheme: VerdictTheme;

  // Tax
  showTaxSavings: boolean;
  totalTaxBenefit: string;
  valueCreation: string;
  sourceTaxRates: Record<string, unknown>;
  destTaxRates: Record<string, unknown>;
  taxDifferential: PdfPreviewData['tax_differential'];

  // Risk
  riskFactors: RiskFactor[];
  mistakesAsRiskFactors: RiskFactor[];
  allMistakes: Mistake[];
  identifiedRisksAsFactors: RiskFactor[];
  totalExposure: number;
  riskFactorCount: number;

  // Opportunities
  opportunities: PdfPreviewData['all_opportunities'];
  opportunityCount: number;
  dueDiligence: PdfPreviewData['due_diligence'];
  executionSequence: PdfPreviewData['execution_sequence'];

  // Intelligence
  precedentCount: number;
  dataQuality: string;
  exposureClass: string;
  peerStats: PdfPreviewData['peer_cohort_stats'];
  capitalFlow: PdfPreviewData['capital_flow_data'];
  evidenceAnchors: Array<Record<string, unknown>>;

  // Expert sections
  crisisData: CrisisData | null;
  transparencyData: TransparencyData | null;
  wealthProjection: PdfPreviewData['wealth_projection_data'];
  scenarioTree: PdfPreviewData['scenario_tree_data'];
  heirManagement: PdfPreviewData['heir_management_data'];
  realAssetAudit: PdfPreviewData['real_asset_audit'];
  destinationDrivers: PdfPreviewData['destination_drivers'];
  goldenVisaIntelligence: PdfPreviewData['golden_visa_intelligence'];
  hnwiTrendsData: HnwiTrendsData | undefined;
  regimeIntelligence: RegimeIntelligence | undefined;

  // Wealth projections
  startingValue: number;
  baseYear10: number;
  stressYear10: number;
  opportunityYear10: number;
  baseProbability: number;
  stressProbability: number;
  opportunityProbability: number;
  costOfInaction: PdfPreviewData['wealth_projection_data'] extends { cost_of_inaction?: infer C } ? C : unknown;

  // Via Negativa
  isViaNegativa: boolean;
  pdfViaNegativa: PdfViaNegativa | undefined;

  // ═══ NEW PARITY FIELDS ═══

  // Structure Optimization (MCP Core Output)
  structureOptimization: StructureOptimization | undefined;
  optimalStructure: { name?: string; type?: string; net_benefit_10yr?: number } | undefined;

  // Cross-Border Tax Audit
  crossBorderAudit: CrossBorderAuditSummary | null;

  // Doctrine / Risk Radar
  doctrineMetadata: DoctrineMetadata | undefined;
  riskRadarScores: ReturnType<typeof computeRiskRadarScores>;

  // Pattern Intelligence
  patternIntelligence: PatternIntelligence | undefined;

  // Decision Thesis
  thesisSummary: string | undefined;
  fullThesis: string | undefined;
  sourceCity: string | undefined;
  destinationCity: string | undefined;
  developmentsCount: number;
  // Verdict for MemoHeader (structure_optimization.verdict = PROCEED/PROCEED_MODIFIED/etc.)
  memoVerdict: string;

  // Legal References & Citations
  legalReferences: LegalReferences | undefined;
  legalCitationCount: number;
  regulatoryCitations: RegulatoryCitation[];

  // Memo metadata
  memoData: PdfMemoData;
  kgIntelligence: PdfMemoData['memo_data']['kgv3_intelligence_used'];
}

export function extractMemoVariables(memoData: PdfMemoData): MemoVariables {
  const { preview_data, memo_data, intake_id, generated_at } = memoData;

  const sourceJurisdiction = safeText(preview_data.source_jurisdiction, '—');
  const destJurisdiction = safeText(preview_data.destination_jurisdiction, '—');

  // Verdict — check root-level risk_assessment first (matches web: backendData?.risk_assessment || preview_data.risk_assessment)
  const riskAssessment = (memoData as Record<string, unknown>).risk_assessment as RiskAssessment | undefined
    || getRiskAssessment(preview_data);
  const verdict = safeText(riskAssessment?.verdict || preview_data.verdict, '—');
  const riskLevel = safeText(riskAssessment?.risk_level || preview_data.risk_level, '—');

  // Value creation
  const valueCreation = preview_data.total_savings
    ? String(preview_data.total_savings)
    : extractValueCreation(preview_data.value_creation);

  // Tax
  const hasUSWorldwideTax = sourceJurisdiction?.toLowerCase().includes('united_states') ||
    sourceJurisdiction?.toLowerCase().includes('usa') ||
    sourceJurisdiction?.toLowerCase().includes('us');
  const showTaxSavings = getShowTaxSavings(preview_data) && !hasUSWorldwideTax;

  const taxDiff = preview_data.tax_differential;
  const cumulativeTaxDiff = (taxDiff as Record<string, unknown> | undefined)?.cumulative_tax_differential_pct as number | undefined;
  const totalTaxBenefit = !showTaxSavings
    ? '0%'
    : (cumulativeTaxDiff !== undefined && cumulativeTaxDiff !== null
      ? `${cumulativeTaxDiff >= 0 ? '+' : ''}${Math.round(cumulativeTaxDiff)}%`
      : safeText(preview_data.total_tax_benefit, '0%'));

  const precedentCount = typeof preview_data.precedent_count === 'number'
    ? preview_data.precedent_count
    : (memo_data.kgv3_intelligence_used?.precedents || 0);
  const exposureClass = safeText(preview_data.exposure_class, '—');
  const dataQuality = safeText(preview_data.data_quality, '—');

  const sourceTaxRates = preview_data.source_tax_rates || preview_data.tax_differential?.source || {};
  const destTaxRates = preview_data.destination_tax_rates || preview_data.tax_differential?.destination || {};

  // Risks — check root-level data first (matches web: backendData?.all_mistakes || preview_data.all_mistakes)
  const riskFactors = preview_data.risk_factors || [];
  const rootMistakes = (memoData as Record<string, unknown>).all_mistakes as Mistake[] | undefined;
  const allMistakes = (rootMistakes && rootMistakes.length > 0) ? rootMistakes : getAllMistakes(preview_data);
  const mistakesAsRiskFactors = mapMistakesToRiskFactors(allMistakes);

  // identified_risks lives at memoData root (from MongoDB document root), NOT inside preview_data
  const identifiedRisks = (memoData.identified_risks as Array<Record<string, unknown>> | undefined)
    || (preview_data as Record<string, unknown>).identified_risks as Array<Record<string, unknown>> | undefined;

  const identifiedRisksAsFactors: RiskFactor[] = (identifiedRisks || []).map((r) => {
    // Map severity: check string fields first, then numeric urgency_level (1-10 scale)
    const severityStr = ((r.severity as string) || (r.urgency as string) || '').toLowerCase();
    let sev: 'critical' | 'high' | 'medium' | 'low' = 'medium';
    if (severityStr.includes('critical')) sev = 'critical';
    else if (severityStr.includes('high')) sev = 'high';
    else if (severityStr.includes('low')) sev = 'low';
    else if (severityStr.includes('medium')) sev = 'medium';
    else if (typeof r.urgency_level === 'number') {
      // Numeric urgency_level: 9-10=critical, 7-8=high, 5-6=medium, 1-4=low
      const ul = r.urgency_level as number;
      if (ul >= 9) sev = 'critical';
      else if (ul >= 7) sev = 'high';
      else if (ul >= 5) sev = 'medium';
      else sev = 'low';
    }

    return {
      title: (r.title as string) || (r.risk as string) || 'Unspecified Risk',
      description: (r.description as string) || (r.fix as string) || (r.mitigation as string) || (r.action_required as string) || (r.impact as string) || '',
      severity: sev,
      exposure_amount: (r.cost_numeric as number) || (r.exposure_value as number) || parseDollarAmount((r.cost as string) || '') || 0,
      cost_display: (r.cost as string) || undefined,
      mitigation: (r.mitigation as string) || (r.fix as string) || (r.action_required as string) || '',
    };
  });

  // Total exposure
  let totalExposure = 0;
  if (riskAssessment?.total_exposure_formatted) {
    totalExposure = parseDollarAmount(riskAssessment.total_exposure_formatted);
  }
  if (totalExposure === 0) {
    totalExposure = allMistakes.reduce((sum, m) => {
      if (m.cost_numeric && typeof m.cost_numeric === 'number') return sum + m.cost_numeric;
      if (m.cost && typeof m.cost === 'string') {
        const parsed = parseDollarAmount(m.cost);
        if (parsed > 0) return sum + parsed;
      }
      return sum;
    }, 0);
  }

  const opportunities = preview_data.all_opportunities || [];
  const opportunityCount = opportunities.length;
  const riskFactorCount = identifiedRisksAsFactors.length > 0
    ? identifiedRisksAsFactors.length
    : (allMistakes.length > 0 ? allMistakes.length : riskFactors.length);

  // Expert sections
  const crisisData = getCrisisData(preview_data) || parseCrisisData(preview_data.crisis_resilience_stress_test);
  const transparencyData = getTransparencyData(preview_data) || parseTransparencyData(preview_data.transparency_regime_impact);

  const wealthProjection = preview_data.wealth_projection_data;
  const scenarioTree = preview_data.scenario_tree_data;
  const heirManagement = preview_data.heir_management_data;
  const realAssetAudit = preview_data.real_asset_audit;
  const destinationDrivers = preview_data.destination_drivers;
  const goldenVisaIntelligence = getGoldenVisaIntelligence(preview_data);
  const hnwiTrendsData = getHnwiTrendsData(preview_data);
  const regimeIntelligence = getRegimeIntelligence(preview_data);

  // Wealth projection scenarios
  const wpScenarios = wealthProjection?.scenarios;
  const findScenario = (name: string, fallbackKey: 'base' | 'stress' | 'opportunity') => {
    if (Array.isArray(wpScenarios)) {
      return wpScenarios.find((s: Record<string, unknown>) => s.name === name);
    }
    return (wpScenarios as Record<string, unknown> | undefined)?.[fallbackKey] as Record<string, unknown> | undefined;
  };
  const baseScenario = findScenario('BASE_CASE', 'base') as Record<string, unknown> | undefined;
  const stressScenario = findScenario('STRESS_CASE', 'stress') as Record<string, unknown> | undefined;
  const opportunityScenario = findScenario('OPPORTUNITY_CASE', 'opportunity') as Record<string, unknown> | undefined;

  const getStartPos = (key: string) => (wealthProjection?.starting_position as Record<string, unknown> | undefined)?.[key] as number | undefined;
  const startingValue = (getStartPos('transaction_value')
    || getStartPos('transaction_amount')
    || getStartPos('current_net_worth')
    || wealthProjection?.starting_value
    || (wealthProjection as Record<string, unknown> | undefined)?.transaction_value as number) ?? 0;

  const getYear10 = (scenario: Record<string, unknown> | undefined) => {
    const tyo = scenario?.ten_year_outcome as Record<string, unknown> | undefined;
    return (tyo?.final_value ?? tyo?.final_total_value ?? scenario?.year_10_value ?? 0) as number;
  };
  const baseYear10 = getYear10(baseScenario);
  const stressYear10 = getYear10(stressScenario);
  const opportunityYear10 = getYear10(opportunityScenario);
  const baseProbability = (baseScenario?.probability as number) || 0.55;
  const stressProbability = (stressScenario?.probability as number) || 0.25;
  const opportunityProbability = (opportunityScenario?.probability as number) || 0.20;
  const costOfInaction = wealthProjection?.cost_of_inaction;

  // Via Negativa
  const structureVerdict = getStructureVerdict(preview_data);
  const isViaNegativa = structureVerdict === 'DO_NOT_PROCEED';
  const verdictTheme = getVerdictTheme(isViaNegativa ? 'ABORT' : verdict);

  let pdfViaNegativa: PdfViaNegativa | undefined;
  if (isViaNegativa) {
    const backendVN = getViaNegativa(preview_data);
    const crossBorderAudit = wealthProjection?.starting_position?.cross_border_audit_summary as Record<string, unknown> | undefined;
    const acqAudit = crossBorderAudit?.acquisition_audit as Record<string, unknown> | undefined;
    const propValue = (acqAudit?.property_value as number) || 0;
    const totalAcqCost = (acqAudit?.total_acquisition_cost as number) || 0;
    const dayOneLossPct = backendVN?.day_one_loss_pct ?? (acqAudit?.day_one_loss_pct as number) ?? 0;
    const dayOneLossAmount = backendVN?.day_one_loss_amount ?? (totalAcqCost - propValue);

    pdfViaNegativa = {
      isActive: true,
      badgeLabel: backendVN?.header?.badge_label || 'ELEVATED RISK',
      dayOneLoss: dayOneLossPct,
      dayOneLossAmount,
      taxEfficiencyPassed: backendVN?.tax_efficiency_passed ?? (showTaxSavings && ((crossBorderAudit?.total_tax_savings_pct as number) || 0) > 0),
      liquidityPassed: backendVN?.liquidity_passed ?? dayOneLossPct < 10,
      structurePassed: backendVN?.structure_passed ?? false,
      verdictHeader: backendVN?.verdict_section?.header || 'Structural Review',
      verdictBadgeLabel: backendVN?.verdict_section?.badge_label || 'Capital Allocation Review',
      stampText: backendVN?.verdict_section?.stamp_text || 'Allocation Not Recommended',
      stampSubtext: backendVN?.verdict_section?.stamp_subtext || 'Key viability thresholds not met in this structure — review alternative corridors and strategies below',
      ctaBody: (backendVN?.cta?.body_template || 'This Pattern Audit identified {dayOneLoss}% Day-One capital exposure. The same engine analyzes any cross-border acquisition across 50+ jurisdictions.')
        .replace('{dayOneLoss}', dayOneLossPct.toFixed(1)),
    };
  }

  // ═══ NEW PARITY EXTRACTIONS ═══

  // Structure Optimization
  const structureOptimization = preview_data.structure_optimization as StructureOptimization | undefined;
  const optimalStructure = structureOptimization?.optimal_structure
    ? { name: structureOptimization.optimal_structure.name, type: structureOptimization.optimal_structure.type, net_benefit_10yr: structureOptimization.optimal_structure.net_benefit_10yr }
    : undefined;

  // Cross-Border Tax Audit (nested in wealth projection)
  const crossBorderAudit = (wealthProjection?.starting_position?.cross_border_audit_summary as CrossBorderAuditSummary | undefined)
    || (preview_data.cross_border_audit as CrossBorderAuditSummary | undefined)
    || null;

  // Doctrine Metadata (from scenario tree data)
  const doctrineMetadata = (preview_data as Record<string, unknown>).doctrine_metadata as DoctrineMetadata | undefined
    || (preview_data.scenario_tree_data as Record<string, unknown> | undefined)?.doctrine_metadata as DoctrineMetadata | undefined;

  // Risk Radar Scores
  const riskRadarScores = computeRiskRadarScores(memoData, isViaNegativa);

  // Pattern Intelligence
  const patternIntelligence = preview_data.pattern_intelligence as PatternIntelligence | undefined;

  // Decision Thesis — check all known field paths
  // Priority: full_artifact.thesis_summary > root thesis object (move_description+expected_outcome) > preview_data fields
  const thesisSummary = safeText(
    preview_data.thesis_summary || preview_data.decision_thesis || preview_data.decision_context,
    undefined
  ) || undefined;

  // Resolve fullThesis: handle thesis as object { move_description, expected_outcome } or string
  const rootThesisRaw = (memoData as Record<string, unknown>).thesis;
  const fullArtifactRaw = (memoData as Record<string, unknown>).full_artifact as Record<string, unknown> | undefined;
  let fullThesis: string | undefined;
  // 1. full_artifact.thesis_summary is the cleanest combined text
  if (fullArtifactRaw?.thesis_summary && typeof fullArtifactRaw.thesis_summary === 'string') {
    fullThesis = fullArtifactRaw.thesis_summary;
  } else if (rootThesisRaw && typeof rootThesisRaw === 'object') {
    // 2. Root thesis object — combine move_description + expected_outcome
    const t = rootThesisRaw as Record<string, unknown>;
    const parts = [t.move_description, t.expected_outcome].filter(v => v && typeof v === 'string').map(String);
    if (parts.length > 0) fullThesis = parts.join('\n\n');
  } else if (typeof rootThesisRaw === 'string' && rootThesisRaw.trim()) {
    // 3. Root thesis as string (e.g. from Python backend response)
    fullThesis = rootThesisRaw;
  }
  // 4. Fallback to preview_data fields
  if (!fullThesis) {
    fullThesis = safeText(
      (preview_data as Record<string, unknown>).thesis as string ||
      (preview_data as Record<string, unknown>).user_input as string ||
      (memo_data as Record<string, unknown>).thesis as string ||
      preview_data.decision_context ||
      thesisSummary,
      undefined
    ) || undefined;
  }

  // Verdict for MemoHeader display (web uses structure_optimization.verdict = "PROCEED"/"PROCEED_MODIFIED"/etc.)
  // distinct from risk_assessment.verdict ("APPROVED") which is for the cover badge
  const structureOptVerdict = (preview_data.structure_optimization as Record<string, unknown> | undefined)?.verdict as string | undefined;
  const memoVerdict = safeText(structureOptVerdict || verdict, '—');
  const sourceCity = safeText(preview_data.source_city, undefined) || undefined;
  const destinationCity = safeText(preview_data.destination_city, undefined) || undefined;
  // developmentsCount: HNWI World global DB count — web uses backendData?.hnwiWorldCount || 1966
  // Not per-audit; use memo_data field if present, else 1966 as platform default
  const developmentsCount = (preview_data as Record<string, unknown>).developments_count as number
    || (memo_data as Record<string, unknown>).hnwi_world_count as number
    || 1966;

  // Legal References & Regulatory Citations
  const legalReferences = preview_data.legal_references as LegalReferences | undefined;
  const legalCitationCount = legalReferences?.total_count || 0;
  const regulatoryCitations: RegulatoryCitation[] = (preview_data.regulatory_citations as RegulatoryCitation[] | undefined)
    || legalReferences?.regulatory_sources
    || [];

  return {
    intakeId: intake_id,
    generatedAt: generated_at,
    sourceJurisdiction,
    destJurisdiction,
    verdict,
    riskLevel,
    riskAssessment,
    verdictTheme,
    showTaxSavings,
    totalTaxBenefit,
    valueCreation,
    sourceTaxRates,
    destTaxRates,
    taxDifferential: preview_data.tax_differential,
    riskFactors,
    mistakesAsRiskFactors,
    allMistakes,
    identifiedRisksAsFactors,
    totalExposure,
    riskFactorCount,
    opportunities,
    opportunityCount,
    dueDiligence: preview_data.due_diligence || [],
    executionSequence: preview_data.execution_sequence || [],
    precedentCount,
    dataQuality,
    exposureClass,
    peerStats: preview_data.peer_cohort_stats,
    capitalFlow: preview_data.capital_flow_data,
    evidenceAnchors: memo_data.evidence_anchors || [],
    crisisData: crisisData ?? null,
    transparencyData: transparencyData ?? null,
    wealthProjection,
    scenarioTree,
    heirManagement,
    realAssetAudit,
    destinationDrivers,
    goldenVisaIntelligence,
    hnwiTrendsData,
    regimeIntelligence,
    startingValue,
    baseYear10,
    stressYear10,
    opportunityYear10,
    baseProbability,
    stressProbability,
    opportunityProbability,
    costOfInaction,
    isViaNegativa,
    pdfViaNegativa,
    // ═══ NEW PARITY FIELDS ═══
    structureOptimization,
    optimalStructure,
    crossBorderAudit,
    doctrineMetadata,
    riskRadarScores,
    patternIntelligence,
    thesisSummary,
    fullThesis,
    memoVerdict,
    sourceCity,
    destinationCity,
    developmentsCount,
    legalReferences,
    legalCitationCount,
    regulatoryCitations,

    memoData,
    kgIntelligence: memo_data.kgv3_intelligence_used,
  };
}
