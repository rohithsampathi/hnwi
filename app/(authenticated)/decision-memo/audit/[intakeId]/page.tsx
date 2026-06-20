// =============================================================================
// DECISION MEMO PUBLIC AUDIT SURFACE
// Route: /decision-memo/audit/[intakeId]
// =============================================================================

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import DecisionMemoAuditClientPage from '@/components/decision-memo/audit/DecisionMemoAuditClientPage';
import {
  DecisionMemoBackendUnavailableError,
  DecisionMemoMissingError,
  fetchDecisionMemoSurfaceData,
} from '@/lib/decision-memo/fetch-decision-memo-surface-data';
import {
  buildReleaseReadinessSharePayload,
  buildReleaseReadinessShareSurfaceData,
  type ReleaseReadinessSharePayload,
  type ReleaseReadinessShareReportSection,
} from '@/lib/decision-memo/build-release-readiness-share-surface';
import type { ResolvedDecisionMemoSurfaceData } from '@/lib/decision-memo/resolve-decision-memo-surface-data';
import { resolvePublicDecisionMemoId } from '@/lib/decision-memo/memo-id-aliases';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 300;

interface DecisionMemoAuditPageProps {
  params: Promise<{ intakeId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function buildQuery(searchParams: Record<string, string | string[] | undefined> | undefined): string {
  const params = new URLSearchParams();

  Object.entries(searchParams ?? {}).forEach(([key, value]) => {
    if (value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, entry));
      return;
    }
    params.set(key, value);
  });

  return params.toString();
}

function readableSurfaceError(error: unknown): string {
  if (error instanceof DecisionMemoBackendUnavailableError) {
    return 'Release readiness service temporarily unavailable. The memo may exist, but the backend did not return it.';
  }

  if (error instanceof DecisionMemoMissingError) {
    return error.message;
  }

  return error instanceof Error ? error.message : 'Release readiness output is not available.';
}

type RecordLike = Record<string, any>;

function requestedViewMode(searchParams: Record<string, string | string[] | undefined> | undefined): string {
  const value = searchParams?.view;
  return Array.isArray(value) ? String(value[0] ?? '') : String(value ?? '');
}

function buildPrincipalOnlySurfaceData(
  reference: string,
  data: ResolvedDecisionMemoSurfaceData,
): ResolvedDecisionMemoSurfaceData {
  const backendPayload = isRecord(data.backendData)
    ? (data.backendData as RecordLike).release_readiness_share_payload
    : null;
  const previewDataSource = isRecord((data.memoData as RecordLike | undefined)?.preview_data)
    ? ((data.memoData as RecordLike).preview_data as RecordLike)
    : {};
  const payload = isRecord(backendPayload)
    ? (backendPayload as ReturnType<typeof buildReleaseReadinessSharePayload>)
    : isRecord(previewDataSource.release_readiness_share_payload)
      ? (previewDataSource.release_readiness_share_payload as ReturnType<typeof buildReleaseReadinessSharePayload>)
      : buildReleaseReadinessSharePayload(reference, data);
  const previewData = {
    release_readiness_share_payload: payload,
    route_intelligence_v2: {
      title: payload.title,
      corridor: payload.corridor,
      move: payload.move,
      routeOptions: payload.routeOptions,
    },
    risk_assessment: {
      verdict: payload.decision,
      recommendation: payload.releaseRule,
      risk_level: payload.riskLevel,
      mitigation_timeline: payload.mitigation,
      total_exposure: payload.selectedRoute.metrics.totalAcquisitionCostUsd,
    },
  };

  return {
    memoData: {
      intake_id: reference,
      preview_data: previewData,
    } as any,
    backendData: {
      surface_contract: payload.surfaceContract,
      intake_id: reference,
      preview_data: previewData,
      release_readiness_share_payload: payload,
    },
    fullArtifact: null,
    developmentsCount: data.developmentsCount,
  };
}

function isRecord(value: unknown): value is RecordLike {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function asArray(value: unknown): RecordLike[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function cleanTranscriptText(value: string): string {
  return value
    .replace(/\bRelease Differently\b/gi, 'Gated negotiation only')
    .replace(/\bGated negotiation only only\b/gi, 'Gated negotiation only')
    .replace(/\brelease differently\b/gi, 'gated negotiation only')
    .replace(/\bProceed Modified\b/gi, 'Proceed under signed gates')
    .replace(/\bproceed modified\b/gi, 'proceed under signed gates')
    .replace(/\bHigh until release gates clear\b/gi, 'Evidence pending; no capital release')
    .replace(/\bRisk level\b/gi, 'Release status')
    .replace(/\bData quality\b/gi, 'Evidence status')
    .replace(/\brelease-read sprint\b/gi, 'release-readiness review')
    .replace(/\binsurance\/security file\b/gi, 'insurance quote and security plan')
    .replace(/\bseller conditions\b/gi, 'seller identity, seller authority, exclusivity terms, deposit condition, and completion timetable')
    .replace(/\bdeposit rail\b/gi, 'deposit account, conveyancer client-account details, transfer path, and release condition')
    .replace(
      /\bas a London family base,\s*education\/continuity node,\s*and capital-preservation asset\b/gi,
      'as a proposed London family-use acquisition with education, residence, succession, and capital-preservation claims not treated as release authority',
    )
    .replace(/\bLondon family base,\s*education\/continuity node,\s*and capital-preservation asset\b/gi, 'proposed London family-use acquisition with education, residence, succession, and capital-preservation claims not treated as release authority')
    .replace(/\bLondon family base,\s*education\/continuity node,\s*and capital-preservation reserve\b/gi, 'London family-use, continuity, and capital-preservation claims held as separate evidence gates')
    .replace(/\bG1\s*\/\s*G2\s*\/\s*G3\b/g, 'principal / named family user / next-generation record')
    .replace(/\bG1\s*->\s*G2\s*->\s*G3\b/g, 'generation-to-generation')
    .replace(/\bG1 principal\b/gi, 'principal')
    .replace(/\bG2 son\b/gi, 'named family user')
    .replace(/\bG2 daughter\s*\/\s*fairness owner\b/gi, 'named family-fairness owner')
    .replace(/\bdaughter\s*\/\s*fairness owner\b/gi, 'named family-fairness owner')
    .replace(/\bdaughter\/fairness\b/gi, 'family-fairness')
    .replace(/\bG3 grandson\b/gi, 'next-generation record')
    .replace(/\bG3 memory rules\b/gi, 'next-generation decision record rules')
    .replace(/\bG3 memory\b/gi, 'next-generation decision record')
    .replace(/\bG3 decision memory\b/gi, 'next-generation decision record')
    .replace(/\bG3\b/g, 'next-generation record')
    .replace(/\bG2 fairness owner\b/gi, 'family-fairness owner')
    .replace(/\bG2\b/g, 'named family user')
    .replace(/\bFounder authority\b/gi, 'Principal authority')
    .replace(/\bfounder authority\b/gi, 'principal authority')
    .replace(/\bFounder\b/g, 'Principal')
    .replace(/\bfounder\b/g, 'principal')
    .replace(/\bPrincipal\s*\/\s*principal\b/gi, 'Principal')
    .replace(/\bprincipal\s*\/\s*principal\b/gi, 'Principal')
    .replace(
      /\bnamed family user\s*\/\s*named family user\s+named family-fairness owner\b/gi,
      'Named family user / named family-fairness owner',
    )
    .replace(/\bfamily-use veto position where recorded\b/gi, 'family-home rights position recorded before bid release or exchange')
    .replace(/\bfamily-home veto position\b/gi, 'family-home rights position')
    .replace(/\bfamily-home veto holder\b/gi, 'family-home rights holder')
    .replace(/\bspouse veto if relevant\b/gi, 'family-home rights position recorded before bid release or exchange')
    .replace(/\bspouse if relevant\b/gi, 'family-home rights holder where recorded')
    .replace(/\bspouse veto\b/gi, 'family-home rights position')
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
      /\bThe purchase must remain legible later without relying on principal memory\.?/gi,
      'The purchase must remain explainable later without relying on memory or informal understandings.',
    )
    .replace(
      /\bThe purchase must remain legible six years later without relying on founder memory\.?/gi,
      'The purchase must remain explainable later without relying on memory or informal understandings.',
    )
    .replace(/\s+/g, ' ')
    .trim();
}

function asString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return cleanTranscriptText(value);
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return cleanTranscriptText(fallback);
}

function textList(value: unknown, limit = 8): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => asString(item).trim())
    .filter(Boolean)
    .slice(0, limit);
}

function money(value: unknown): string {
  if (typeof value === 'string' && value.trim()) return value;
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `US$${Math.round(value).toLocaleString('en-US')}`;
  }
  return '-';
}

function pickSection(data: ResolvedDecisionMemoSurfaceData | null, key: string): unknown {
  const memoData: RecordLike = isRecord(data?.memoData) ? (data.memoData as RecordLike) : {};
  const backendData: RecordLike = isRecord(data?.backendData) ? (data.backendData as RecordLike) : {};
  const fullArtifact: RecordLike = isRecord(data?.fullArtifact) ? (data.fullArtifact as RecordLike) : {};
  const previewData = isRecord(memoData.preview_data)
    ? memoData.preview_data
    : isRecord(backendData.preview_data)
      ? backendData.preview_data
      : {};

  return fullArtifact[key] ?? memoData[key] ?? previewData[key] ?? backendData[key] ?? null;
}

function resolveReleaseReadinessPayload(
  reference: string,
  data: ResolvedDecisionMemoSurfaceData,
): ReleaseReadinessSharePayload | null {
  const backendPayload = isRecord(data.backendData)
    ? (data.backendData as RecordLike).release_readiness_share_payload
    : null;
  const memoData = isRecord(data.memoData) ? (data.memoData as RecordLike) : {};
  const previewData = isRecord(memoData.preview_data) ? memoData.preview_data : {};
  const previewPayload = isRecord(previewData.release_readiness_share_payload)
    ? previewData.release_readiness_share_payload
    : null;

  if (isRecord(backendPayload)) return backendPayload as ReleaseReadinessSharePayload;
  if (isRecord(previewPayload)) return previewPayload as ReleaseReadinessSharePayload;

  try {
    return buildReleaseReadinessSharePayload(reference, data);
  } catch {
    return null;
  }
}

function findReportSection(
  payload: ReleaseReadinessSharePayload | null,
  ...ids: string[]
): ReleaseReadinessShareReportSection | null {
  if (!payload?.reportSections?.length) return null;
  return payload.reportSections.find((section) => ids.includes(section.id)) ?? null;
}

function reportCards(section: ReleaseReadinessShareReportSection | null): RecordLike[] {
  return Array.isArray(section?.cards) ? section.cards.filter(isRecord) : [];
}

function reportRows(section: ReleaseReadinessShareReportSection | null): RecordLike[] {
  const columns = Array.isArray(section?.table?.columns) ? section.table.columns : [];
  const rows = Array.isArray(section?.table?.rows) ? section.table.rows : [];
  return rows.map((row) => {
    const record: RecordLike = {};
    columns.forEach((column, index) => {
      record[column] = Array.isArray(row) ? row[index] : '';
    });
    return record;
  });
}

function sectionTitle(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function EvidenceList({
  title,
  items,
  getPrimary,
  getSecondary,
}: {
  title: string;
  items: RecordLike[];
  getPrimary: (item: RecordLike, index: number) => string;
  getSecondary?: (item: RecordLike, index: number) => string[];
}) {
  if (!items.length) return null;

  return (
    <section>
      <h2>{title}</h2>
      <ol>
        {items.map((item, index) => {
          const secondary = getSecondary?.(item, index).filter(Boolean) ?? [];
          return (
            <li key={`${title}-${index}`}>
              <strong>{getPrimary(item, index)}</strong>
              {secondary.map((line, lineIndex) => (
                <p key={lineIndex}>{line}</p>
              ))}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function DecisionMemoServerAuditText({
  data,
  error,
  reference,
}: {
  data: ResolvedDecisionMemoSurfaceData | null;
  error: string | null;
  reference: string;
}) {
  if (error && !data) {
    return (
      <section id="release-readiness-server-transcript" className="release-readiness-server-transcript">
        <style>{serverTranscriptCss}</style>
        <h1>Release Readiness Memo Unavailable</h1>
        <p>{error}</p>
      </section>
    );
  }

  if (!data) return null;

  const memoData: RecordLike = isRecord(data.memoData) ? (data.memoData as RecordLike) : {};
  const fullArtifact: RecordLike = isRecord(data.fullArtifact) ? (data.fullArtifact as RecordLike) : {};
  const routeIntelligence = isRecord(pickSection(data, 'route_intelligence_v2'))
    ? (pickSection(data, 'route_intelligence_v2') as RecordLike)
    : {};
  const title =
    asString(routeIntelligence.title) ||
    asString(fullArtifact.documentTitle) ||
    asString(memoData.documentTitle) ||
    asString(memoData.title) ||
    'London Mayfair House Acquisition Release Readiness Memo';
  const move =
    asString(routeIntelligence.move) ||
    asString(memoData.thesis_summary) ||
    asString(memoData.decision_thesis);
  const corridor =
    asString(routeIntelligence.corridor) ||
    `${asString(memoData.source_city || memoData.source_jurisdiction || 'Dubai / United Arab Emirates')} -> ${asString(memoData.destination_city || memoData.destination_jurisdiction || 'London / United Kingdom')}`;
  const verdict = isRecord(pickSection(data, 'rich_verdict'))
    ? (pickSection(data, 'rich_verdict') as RecordLike)
    : {};
  const risk = isRecord(pickSection(data, 'risk_assessment'))
    ? (pickSection(data, 'risk_assessment') as RecordLike)
    : {};
  const quantified = isRecord(pickSection(data, 'quantifiedModel'))
    ? (pickSection(data, 'quantifiedModel') as RecordLike)
    : {};
  const crossBorder = isRecord(pickSection(data, 'cross_border_audit'))
    ? (pickSection(data, 'cross_border_audit') as RecordLike)
    : {};
  const acquisition = isRecord(crossBorder.acquisition_audit) ? crossBorder.acquisition_audit : {};
  const carrying = isRecord(crossBorder.net_yield_audit?.carrying_cost_model)
    ? crossBorder.net_yield_audit.carrying_cost_model
    : isRecord(pickSection(data, 'annual_wealth_engine'))
      ? ((pickSection(data, 'annual_wealth_engine') as RecordLike).carrying_cost_model ?? {})
      : {};
  const principalSections = isRecord(pickSection(data, 'principal_sections'))
    ? (pickSection(data, 'principal_sections') as RecordLike)
    : {};
  const authorityMatrix = asArray(pickSection(data, 'responsibility_transfer_matrix'));
  const recordMismatch = isRecord(pickSection(data, 'record_mismatch_map'))
    ? (pickSection(data, 'record_mismatch_map') as RecordLike)
    : {};
  const sourceRegister = asArray(pickSection(data, 'governing_source_register') ?? pickSection(data, 'source_register'));
  const routeOptions = asArray(pickSection(data, 'route_options'));
  const pressureVariants = asArray(routeIntelligence.pressureVariants);
  const buyerProfiles = asArray(routeIntelligence.buyerProfileMatrix?.matrix);
  const failureModes = asArray(pickSection(data, 'all_mistakes') ?? pickSection(data, 'failure_modes'));
  const counselQuestions = asArray(pickSection(data, 'counsel_operator_question_pack'));
  const releaseEvidence = isRecord(pickSection(data, 'zero_trust_move_intake'))
    ? (pickSection(data, 'zero_trust_move_intake') as RecordLike)
    : {};
  const evidenceRecords = asArray(releaseEvidence.evidence_records ?? releaseEvidence.records);
  const missingGates = asArray(releaseEvidence.missing_gates);
  const bankReadiness = isRecord(pickSection(data, 'sow_sof_bank_acceptance_readiness'))
    ? (pickSection(data, 'sow_sof_bank_acceptance_readiness') as RecordLike)
    : {};
  const decisionMemory = isRecord(pickSection(data, 'decision_memory_packet'))
    ? (pickSection(data, 'decision_memory_packet') as RecordLike)
    : {};
  const antifragile = asArray(principalSections.antifragile_resilience_test ?? pickSection(data, 'antifragile_resilience_test'));
  const bankSimulation = asArray(
    principalSections.bank_compliance_escalation_simulation ??
      principalSections.ai_banking_crisis_simulation ??
      pickSection(data, 'bank_compliance_escalation_simulation') ??
      pickSection(data, 'crisis_resilience_stress_test'),
  );
  const familyAuthority = isRecord(principalSections.authority_and_veto_matrix ?? pickSection(data, 'authority_and_veto_matrix'))
    ? ((principalSections.authority_and_veto_matrix ?? pickSection(data, 'authority_and_veto_matrix')) as RecordLike)
    : {};
  const releasePayload = resolveReleaseReadinessPayload(reference, data);
  const selectedMetrics: Partial<ReleaseReadinessSharePayload['selectedRoute']['metrics']> =
    releasePayload?.selectedRoute?.metrics ?? {};
  const taxSection = findReportSection(releasePayload, 'tax-legal-route-readiness');
  const continuitySection = findReportSection(releasePayload, 'g1-g2-g3-continuity', 'generation_to_generation-continuity');
  const crisisSection = findReportSection(releasePayload, 'crisis-resilience');
  const antiFragilitySection = findReportSection(releasePayload, 'anti-fragility');
  const bankingSection = findReportSection(releasePayload, 'banking-sow-sof');
  const decisionMemorySection = findReportSection(releasePayload, 'information-flow-decision-memory');
  const releaseStatus = asString(releasePayload?.riskLevel || risk.risk_level, 'Evidence pending; no capital release');
  const criticalItems = releasePayload?.stopConditions?.length
    ? `${releasePayload.stopConditions.length} stop conditions`
    : asString(risk.critical_items, 'Signed release gates required');
  const highItems = releasePayload?.holdConditions?.length
    ? `${releasePayload.holdConditions.length} hold conditions`
    : asString(risk.high_items, 'Evidence gates active');
  const dutyDragPct = Number.isFinite(selectedMetrics.dutyDragPct)
    ? Number(selectedMetrics.dutyDragPct).toFixed(2)
    : asString(acquisition.duty_drag_pct || quantified.direct_duty_drag_pct_of_price);
  const entityIncrementalDuty =
    selectedMetrics.incrementalDutyVsRecommendedUsd ??
    quantified.entity_incremental_duty_vs_direct_usd;
  const opportunityCostPer100Bps =
    quantified.opportunity_cost_per_100bps_usd ??
    carrying.opportunity_cost_sensitivity?.per_100bps_on_purchase_price_usd ??
    (Number.isFinite(selectedMetrics.propertyValueUsd) ? Number(selectedMetrics.propertyValueUsd) * 0.01 : undefined);
  const releaseRouteOptions = releasePayload?.routeOptions?.length ? releasePayload.routeOptions : [];
  const continuityCards = reportCards(continuitySection);
  const continuityRows = reportRows(continuitySection);
  const releaseCrisisItems = [...reportCards(crisisSection), ...reportRows(crisisSection)];
  const releaseAntiFragilityItems = [...reportRows(antiFragilitySection), ...reportCards(antiFragilitySection)];
  const bankingRows = reportRows(bankingSection);
  const bankingCards = reportCards(bankingSection);
  const decisionMemoryRows = reportRows(decisionMemorySection);
  const decisionMemoryCards = reportCards(decisionMemorySection);

  return (
    <article
      id="release-readiness-server-transcript"
      className="release-readiness-server-transcript"
      aria-label="Release readiness memo text"
    >
      <style>{serverTranscriptCss}</style>
      <header>
        <p className="eyebrow">HNWI Chronicles / Release Readiness Review</p>
        <h1>{title}</h1>
        <p><strong>Reference:</strong> {reference}</p>
        <p><strong>Corridor:</strong> {corridor}</p>
        {move ? <p><strong>Live move:</strong> {move}</p> : null}
        <p><strong>Verdict:</strong> {asString(verdict.label || risk.verdict || risk.recommendation || 'Proceed Modified: Release Differently')}</p>
        <p><strong>Release rule:</strong> {asString(pickSection(data, 'release_rule') || 'Hold until release evidence clears')}</p>
        {asString(verdict.why) ? <p><strong>Why:</strong> {asString(verdict.why)}</p> : null}
        {asString(verdict.not_a_verdict_for) ? <p><strong>Not a release for:</strong> {asString(verdict.not_a_verdict_for)}</p> : null}
      </header>

      <section>
        <h2>Principal Release Snapshot</h2>
        <dl>
          <div><dt>Release status</dt><dd>{releaseStatus}</dd></div>
          <div><dt>Critical items</dt><dd>{criticalItems}</dd></div>
          <div><dt>High items</dt><dd>{highItems}</dd></div>
          <div><dt>Next release window</dt><dd>{asString(releasePayload?.mitigation || risk.mitigation_timeline || pickSection(data, 'mitigationTimeline'), '72-hour bank/title/source retrieval check; 7-day counsel/bank/family-authority close path if seller timing starts.')}</dd></div>
          <div><dt>Total exposure</dt><dd>{asString(risk.total_exposure || risk.total_exposure_formatted) || money(selectedMetrics.totalAcquisitionCostUsd || acquisition.total_acquisition_cost_usd || quantified.direct_total_outlay_usd)}</dd></div>
          <div><dt>Duty drag</dt><dd>{money(selectedMetrics.totalDutiesUsd || acquisition.total_stamp_duties_usd || quantified.direct_total_duties_usd)}{dutyDragPct ? ` (${dutyDragPct}% of price)` : ''}</dd></div>
        </dl>
      </section>

      <section>
        <h2>Modeled Economics And Duty Drag</h2>
        <p>{asString(quantified.basis) || 'Modeled from official property, tax, bank, and market sources; final treatment requires counsel confirmation.'}</p>
        <dl>
          <div><dt>Guide price</dt><dd>{money(selectedMetrics.propertyValueUsd || quantified.price_usd || acquisition.property_value_usd)}{quantified.price_gbp ? ` / GBP ${Number(quantified.price_gbp).toLocaleString('en-US')}` : ''}</dd></div>
          <div><dt>Base SDLT</dt><dd>{money(selectedMetrics.bsdUsd || quantified.primary_fee_usd || acquisition.bsd_stamp_duty_usd)}</dd></div>
          <div><dt>Non-resident and additional-dwelling surcharge</dt><dd>{money(selectedMetrics.absdUsd || quantified.secondary_fee_usd || acquisition.absd_additional_stamp_duty_usd)}</dd></div>
          <div><dt>Direct route all-in outlay</dt><dd>{money(selectedMetrics.totalAcquisitionCostUsd || quantified.direct_total_outlay_usd || acquisition.total_acquisition_cost_usd)}</dd></div>
          <div><dt>Entity/trustee incremental duty versus direct</dt><dd>{money(entityIncrementalDuty)}</dd></div>
          <div><dt>Annual carry before opportunity cost</dt><dd>{money(selectedMetrics.annualCarryingCostUsd || quantified.annual_carrying_cost_before_opportunity_usd || carrying.annual_carrying_cost_before_opportunity_usd)}</dd></div>
          <div><dt>Opportunity cost per 100 bps</dt><dd>{money(opportunityCostPer100Bps)}</dd></div>
        </dl>
        {taxSection?.table ? (
          <ul>
            {reportRows(taxSection).map((row, index) => (
              <li key={`tax-row-${index}`}>
                <strong>{asString(row['Route reviewed'] || row.Category || row.Treatment || `Tax treatment ${index + 1}`)}</strong>
                {asString(row.Mechanism || row.Route) ? `: ${asString(row.Mechanism || row.Route)}` : ''}
                {asString(row['Model effect']) ? ` Model effect: ${asString(row['Model effect'])}.` : ''}
                {asString(row['Release requirement'] || row['Release condition']) ? ` Release requirement: ${asString(row['Release requirement'] || row['Release condition'])}.` : ''}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <EvidenceList
        title="Release Readiness Routes Reviewed"
        items={routeOptions.length ? routeOptions : releaseRouteOptions.length ? releaseRouteOptions : pressureVariants}
        getPrimary={(item, index) => `${asString(item.rank, String(index + 1))}. ${asString(item.route || item.routeName || item.name || item.title)} - ${asString(item.verdict || item.releaseRule || item.release_rule)}`}
        getSecondary={(item) => [
          asString(item.best_use || item.bestUse) ? `Best use: ${asString(item.best_use || item.bestUse)}` : '',
          asString(item.economic_read || item.economicRead) ? `Economic read: ${asString(item.economic_read || item.economicRead)}` : '',
          asString(item.failure_mode || item.failureMode) ? `Failure mode: ${asString(item.failure_mode || item.failureMode)}` : '',
          asString(item.release_effect || item.releaseEffect) ? `Release effect: ${asString(item.release_effect || item.releaseEffect)}` : '',
        ]}
      />

      <EvidenceList
        title="Buyer Profile And Ownership Route Review"
        items={buyerProfiles}
        getPrimary={(item) => asString(item.profile)}
        getSecondary={(item) => [
          asString(item.firstResidential) ? `First residential: ${asString(item.firstResidential)}` : '',
          asString(item.secondResidential) ? `Second residential: ${asString(item.secondResidential)}` : '',
          asString(item.thirdAndSubsequent) ? `Third and subsequent: ${asString(item.thirdAndSubsequent)}` : '',
          asString(item.releaseRead) ? `Release read: ${asString(item.releaseRead)}` : '',
          asString(item.evidenceRequired) ? `Evidence required: ${asString(item.evidenceRequired)}` : '',
        ]}
      />

      <EvidenceList
        title="Failure Modes And Buyer-Action Gates"
        items={failureModes}
        getPrimary={(item, index) => asString(item.title || item.name, `Failure mode ${index + 1}`)}
        getSecondary={(item) => [
          asString(item.description) ? `Release read: ${asString(item.description)}` : '',
          asString(item.owner) ? `Owner: ${asString(item.owner)}` : '',
          asString(item.release_condition) ? `Release condition: ${asString(item.release_condition)}` : '',
          asString(item.fix || item.mitigation) ? `Correction: ${asString(item.fix || item.mitigation)}` : '',
        ]}
      />

      <EvidenceList
        title="Release Evidence Pack"
        items={evidenceRecords}
        getPrimary={(item) => `${asString(item.label || item.type)} - ${asString(item.state || 'evidence required')}`}
        getSecondary={(item) => [
          asString(item.detail) ? asString(item.detail) : '',
          asString(item.owner) ? `Owner: ${asString(item.owner)}` : '',
          asString(item.release_effect) ? `Release effect: ${asString(item.release_effect)}` : '',
        ]}
      />

      <EvidenceList
        title="Open Release Gates"
        items={missingGates}
        getPrimary={(item, index) => asString(item.label || item.detail, `Gate ${index + 1}`)}
        getSecondary={(item) => [
          asString(item.owner) ? `Owner: ${asString(item.owner)}` : '',
          asString(item.release_effect) ? `Release effect: ${asString(item.release_effect)}` : '',
        ]}
      />

      <EvidenceList
        title="Responsibility Transfer Matrix"
        items={authorityMatrix}
        getPrimary={(item) => `${asString(item.party)} - ${asString(item.release_status)}`}
        getSecondary={(item) => [
          `See: ${asString(item.can_see, '-')} / Stop: ${asString(item.can_stop, '-')} / Sign: ${asString(item.can_sign, '-')} / Move: ${asString(item.can_move, '-')}`,
          `Retrieve: ${asString(item.can_retrieve, '-')} / Explain: ${asString(item.can_explain, '-')}`,
        ]}
      />

      <section>
        <h2>Generation Authority And Family Consequence</h2>
        {continuitySection?.intro ? <p>{asString(continuitySection.intro)}</p> : null}
        <ul>
          {continuityCards.map((card, index) => (
            <li key={`continuity-card-${index}`}>
              <strong>{asString(card.label || card.title)}</strong>
              {asString(card.value) ? `: ${asString(card.value)}` : ''}
              {asString(card.body) ? ` - ${asString(card.body)}` : ''}
            </li>
          ))}
          {continuityRows.map((row, index) => (
            <li key={`continuity-row-${index}`}>
              <strong>{asString(row.Layer || row.Stage || `Continuity gate ${index + 1}`)}</strong>
              {asString(row['Release condition']) ? `: ${asString(row['Release condition'])}` : ''}
              {asString(row.Consequence) ? ` Consequence: ${asString(row.Consequence)}.` : ''}
            </li>
          ))}
          {!continuityCards.length && !continuityRows.length
            ? textList(familyAuthority.family_roles, 10).map((line, index) => <li key={`family-role-${index}`}>{line}</li>)
            : null}
          {!continuityCards.length && !continuityRows.length
            ? textList(familyAuthority.successor_roles, 10).map((line, index) => <li key={`successor-role-${index}`}>{line}</li>)
            : null}
          {!continuityCards.length && !continuityRows.length
            ? textList(familyAuthority.veto_holders, 10).map((line, index) => <li key={`veto-holder-${index}`}>Veto holder: {line}</li>)
            : null}
        </ul>
      </section>

      <EvidenceList
        title="Record Mismatch Map"
        items={asArray(recordMismatch.matrix)}
        getPrimary={(item) => `${asString(item.record)} - ${asString(item.release_status)}`}
        getSecondary={(item) => [
          asString(item.current_record) ? `Current record: ${asString(item.current_record)}` : '',
          asString(item.target_record) ? `Target record: ${asString(item.target_record)}` : '',
          asString(item.mismatch_risk) ? `Mismatch risk: ${asString(item.mismatch_risk)}` : '',
          asString(item.owner) ? `Owner: ${asString(item.owner)}` : '',
        ]}
      />

      <section>
        <h2>SoW / SoF And Bank Acceptance Readiness</h2>
        <p>{asString(bankingSection?.intro || bankReadiness.standard)}</p>
        <p><strong>Release status:</strong> {asString(bankReadiness.release_status, 'Required before irrevocable commitment')}</p>
        <ul>
          {bankingCards.map((card, index) => (
            <li key={`bank-card-${index}`}>
              <strong>{asString(card.label || card.title)}</strong>
              {asString(card.body || card.value) ? `: ${asString(card.body || card.value)}` : ''}
            </li>
          ))}
          {bankingRows.map((row, index) => (
            <li key={`bank-row-${index}`}>
              <strong>{asString(row.Gate || row.Domain || `Banking gate ${index + 1}`)}</strong>
              {asString(row.Condition) ? `: ${asString(row.Condition)}` : ''}
              {asString(row.Owner) ? ` Owner: ${asString(row.Owner)}.` : ''}
            </li>
          ))}
          {!bankingCards.length && !bankingRows.length
            ? textList(bankReadiness.evidence, 20).map((line, index) => <li key={`bank-readiness-${index}`}>{line}</li>)
            : null}
        </ul>
      </section>

      <EvidenceList
        title="Bank Compliance Escalation Simulation"
        items={bankSimulation.length ? bankSimulation : releaseCrisisItems}
        getPrimary={(item, index) => asString(item.scenario || item.label || item.Event || item.Scenario, `Simulation ${index + 1}`)}
        getSecondary={(item) => [
          asString(item.breakpoint) ? `Breakpoint: ${asString(item.breakpoint)}` : '',
          asString(item.body) ? asString(item.body) : '',
          asString(item['Route failure mode']) ? `Failure mode: ${asString(item['Route failure mode'])}` : '',
          asString(item['Release response']) ? `Release response: ${asString(item['Release response'])}` : '',
          asString(item.required_response) ? `Required response: ${asString(item.required_response)}` : '',
        ]}
      />

      <EvidenceList
        title="Antifragile Resilience Review"
        items={antifragile.length ? antifragile : releaseAntiFragilityItems}
        getPrimary={(item, index) => asString(item.control || item.Control || item.label || item.Gate, `Control ${index + 1}`)}
        getSecondary={(item) => [
          asString(item.stress_event) ? `Stress event: ${asString(item.stress_event)}` : '',
          asString(item.release_test) ? `Release review: ${asString(item.release_test)}` : '',
          asString(item.body) ? asString(item.body) : '',
          asString(item['What gets stronger']) ? `What gets stronger: ${asString(item['What gets stronger'])}` : '',
          asString(item['Failure if missing']) ? `Failure if missing: ${asString(item['Failure if missing'])}` : '',
        ]}
      />

      <EvidenceList
        title="Counsel And Operator Question Pack"
        items={counselQuestions}
        getPrimary={(item, index) => asString(item.desk || item.owner || item.role, `Question ${index + 1}`)}
        getSecondary={(item) => [asString(item.question), asString(item.release_effect)]}
      />

      <section>
        <h2>Decision Memory Packet</h2>
        <p><strong>Owner:</strong> {asString(decisionMemory.owner, 'Family office operator / CFO')}</p>
        <p>{asString(decisionMemorySection?.intro || decisionMemory.why_recorded)}</p>
        <ul>
          {decisionMemoryCards.map((card, index) => (
            <li key={`decision-memory-card-${index}`}>
              <strong>{asString(card.label || card.title)}</strong>
              {asString(card.body || card.value) ? `: ${asString(card.body || card.value)}` : ''}
            </li>
          ))}
          {decisionMemoryRows.map((row, index) => (
            <li key={`decision-memory-row-${index}`}>
              <strong>{asString(row.Record || row.Gate || `Decision memory ${index + 1}`)}</strong>
              {asString(row.Condition) ? `: ${asString(row.Condition)}` : ''}
            </li>
          ))}
          {!decisionMemoryCards.length && !decisionMemoryRows.length
            ? textList(decisionMemory.retrieval_keys, 12).map((line, index) => <li key={`decision-memory-${index}`}>{line}</li>)
            : null}
        </ul>
      </section>

      <EvidenceList
        title="Governing Source Register"
        items={sourceRegister}
        getPrimary={(item, index) => `${index + 1}. ${asString(item.institution)} - ${asString(item.title)}`}
        getSecondary={(item) => [
          asString(item.date) ? `Date: ${asString(item.date)}` : '',
          asString(item.claim_supported) ? `Claim supported: ${asString(item.claim_supported)}` : '',
          asString(item.url) ? `URL: ${asString(item.url)}` : '',
        ]}
      />
    </article>
  );
}

const serverTranscriptCss = `
  html[data-decision-memo-hydrated="true"] #release-readiness-server-transcript {
    display: none;
  }
  .release-readiness-server-transcript {
    max-width: 980px;
    margin: 0 auto;
    padding: 32px 20px 56px;
    color: #111;
    background: #fff;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    line-height: 1.6;
  }
  .release-readiness-server-transcript header,
  .release-readiness-server-transcript section {
    border-bottom: 1px solid #e7e2d7;
    padding: 24px 0;
  }
  .release-readiness-server-transcript h1 {
    margin: 8px 0 16px;
    font-size: clamp(32px, 7vw, 56px);
    line-height: 1.04;
    letter-spacing: 0;
  }
  .release-readiness-server-transcript h2 {
    margin: 0 0 14px;
    font-size: 22px;
    line-height: 1.25;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #6f5514;
  }
  .release-readiness-server-transcript .eyebrow {
    margin: 0;
    font-size: 12px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #826a2a;
  }
  .release-readiness-server-transcript p {
    margin: 8px 0;
  }
  .release-readiness-server-transcript ol,
  .release-readiness-server-transcript ul {
    margin: 0;
    padding-left: 22px;
  }
  .release-readiness-server-transcript li {
    margin: 12px 0;
  }
  .release-readiness-server-transcript dl {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
    gap: 12px;
    margin: 0;
  }
  .release-readiness-server-transcript dl div {
    border: 1px solid #e7e2d7;
    border-radius: 8px;
    padding: 12px;
    background: #faf9f5;
  }
  .release-readiness-server-transcript dt {
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #6f6b60;
  }
  .release-readiness-server-transcript dd {
    margin: 4px 0 0;
    font-weight: 700;
  }
`;

export default async function DecisionMemoAuditPage({
  params,
  searchParams,
}: DecisionMemoAuditPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const query = buildQuery(resolvedSearchParams);
  const publicId = resolvePublicDecisionMemoId(resolvedParams.intakeId);

  if (publicId !== resolvedParams.intakeId) {
    redirect(`/decision-memo/audit/${encodeURIComponent(publicId)}${query ? `?${query}` : ''}`);
  }

  let initialSurfaceData: ResolvedDecisionMemoSurfaceData | null = null;
  let initialSurfaceError: string | null = null;

  try {
    initialSurfaceData = await fetchDecisionMemoSurfaceData(
      resolvedParams.intakeId,
      await headers(),
    );
  } catch (error) {
    initialSurfaceError = readableSurfaceError(error);
  }

  const requestedView = requestedViewMode(resolvedSearchParams);
  const releaseSurfaceData = initialSurfaceData
    ? buildReleaseReadinessShareSurfaceData(publicId, initialSurfaceData)
    : null;
  const clientInitialSurfaceData =
    releaseSurfaceData && (!requestedView || requestedView === 'principal')
      ? buildPrincipalOnlySurfaceData(publicId, releaseSurfaceData)
      : releaseSurfaceData;

  return (
    <>
      <DecisionMemoServerAuditText
        data={releaseSurfaceData}
        error={initialSurfaceError}
        reference={publicId}
      />
      <Suspense fallback={null}>
        <DecisionMemoAuditClientPage
          initialIntakeId={resolvedParams.intakeId}
          initialSearchParamsString={query}
          initialSurfaceData={clientInitialSurfaceData}
          initialSurfaceError={initialSurfaceError}
        />
      </Suspense>
    </>
  );
}
