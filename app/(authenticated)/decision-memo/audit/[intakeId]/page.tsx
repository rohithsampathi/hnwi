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
import { buildReleaseReadinessSharePayload } from '@/lib/decision-memo/build-release-readiness-share-surface';
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
  const payload = buildReleaseReadinessSharePayload(reference, data);
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
    .replace(/\brelease-read sprint\b/gi, 'release-readiness sprint')
    .replace(
      /\bas a London family base,\s*education\/continuity node,\s*and capital-preservation asset\b/gi,
      'as a proposed London family-use acquisition with education, residence, succession, and capital-preservation claims treated as separate gates',
    )
    .replace(/\bLondon family base,\s*education\/continuity node,\s*and capital-preservation asset\b/gi, 'proposed London family-use acquisition with education, residence, succession, and capital-preservation claims treated as separate gates')
    .replace(/\bLondon family base,\s*education\/continuity node,\s*and capital-preservation reserve\b/gi, 'London family-use, continuity, and capital-preservation claims treated as separate release gates')
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
    .replace(/\bfamily-home veto position\b/gi, 'family-use veto position')
    .replace(/\bfamily-home veto holder\b/gi, 'family-use veto holder')
    .replace(/\bspouse veto if relevant\b/gi, 'family-use veto position where recorded')
    .replace(/\bspouse if relevant\b/gi, 'family-use veto holder where recorded')
    .replace(/\bspouse veto\b/gi, 'family-use veto position')
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
          <div><dt>Release status</dt><dd>{asString(risk.risk_level, 'High until release gates clear')}</dd></div>
          <div><dt>Critical items</dt><dd>{asString(risk.critical_items, '-')}</dd></div>
          <div><dt>High items</dt><dd>{asString(risk.high_items, '-')}</dd></div>
          <div><dt>Mitigation timeline</dt><dd>{asString(risk.mitigation_timeline || pickSection(data, 'mitigationTimeline'), '0-7 days release-read sprint; 30-day counsel/bank/title/authority close; 90-day carry rhythm.')}</dd></div>
          <div><dt>Total exposure</dt><dd>{asString(risk.total_exposure || risk.total_exposure_formatted) || money(acquisition.total_acquisition_cost_usd || quantified.direct_total_outlay_usd)}</dd></div>
          <div><dt>Duty drag</dt><dd>{money(acquisition.total_stamp_duties_usd || quantified.direct_total_duties_usd)}{asString(acquisition.duty_drag_pct || quantified.direct_duty_drag_pct_of_price) ? ` (${asString(acquisition.duty_drag_pct || quantified.direct_duty_drag_pct_of_price)}% of price)` : ''}</dd></div>
        </dl>
      </section>

      <section>
        <h2>Modeled Economics And Duty Drag</h2>
        <p>{asString(quantified.basis) || 'Modeled from official property, tax, bank, and market sources; final treatment requires counsel confirmation.'}</p>
        <dl>
          <div><dt>Guide price</dt><dd>{money(quantified.price_usd || acquisition.property_value_usd)}{quantified.price_gbp ? ` / GBP ${Number(quantified.price_gbp).toLocaleString('en-US')}` : ''}</dd></div>
          <div><dt>Base SDLT</dt><dd>{money(quantified.primary_fee_usd || acquisition.bsd_stamp_duty_usd)}</dd></div>
          <div><dt>Non-resident and additional-dwelling surcharge</dt><dd>{money(quantified.secondary_fee_usd || acquisition.absd_additional_stamp_duty_usd)}</dd></div>
          <div><dt>Direct route all-in outlay</dt><dd>{money(quantified.direct_total_outlay_usd || acquisition.total_acquisition_cost_usd)}</dd></div>
          <div><dt>Entity/trustee incremental duty versus direct</dt><dd>{money(quantified.entity_incremental_duty_vs_direct_usd)}</dd></div>
          <div><dt>Annual carry before opportunity cost</dt><dd>{money(quantified.annual_carrying_cost_before_opportunity_usd || carrying.annual_carrying_cost_before_opportunity_usd)}</dd></div>
          <div><dt>Opportunity cost per 100 bps</dt><dd>{money(quantified.opportunity_cost_per_100bps_usd || carrying.opportunity_cost_sensitivity?.per_100bps_on_purchase_price_usd)}</dd></div>
        </dl>
      </section>

      <EvidenceList
        title="Release Readiness Routes Reviewed"
        items={routeOptions.length ? routeOptions : pressureVariants}
        getPrimary={(item, index) => `${asString(item.rank, String(index + 1))}. ${asString(item.route || item.name || item.title)} - ${asString(item.verdict || item.releaseRule || item.release_rule)}`}
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
        <ul>
          {textList(familyAuthority.family_roles, 10).map((line, index) => <li key={`family-role-${index}`}>{line}</li>)}
          {textList(familyAuthority.successor_roles, 10).map((line, index) => <li key={`successor-role-${index}`}>{line}</li>)}
          {textList(familyAuthority.veto_holders, 10).map((line, index) => <li key={`veto-holder-${index}`}>Veto holder: {line}</li>)}
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
        <p>{asString(bankReadiness.standard)}</p>
        <p><strong>Release status:</strong> {asString(bankReadiness.release_status, 'Required before irrevocable commitment')}</p>
        <ul>{textList(bankReadiness.evidence, 20).map((line, index) => <li key={`bank-readiness-${index}`}>{line}</li>)}</ul>
      </section>

      <EvidenceList
        title="Bank Compliance Escalation Simulation"
        items={bankSimulation}
        getPrimary={(item, index) => asString(item.scenario, `Simulation ${index + 1}`)}
        getSecondary={(item) => [
          asString(item.breakpoint) ? `Breakpoint: ${asString(item.breakpoint)}` : '',
          asString(item.required_response) ? `Required response: ${asString(item.required_response)}` : '',
        ]}
      />

      <EvidenceList
        title="Antifragile Resilience Review"
        items={antifragile}
        getPrimary={(item, index) => asString(item.control, `Control ${index + 1}`)}
        getSecondary={(item) => [
          asString(item.stress_event) ? `Stress event: ${asString(item.stress_event)}` : '',
          asString(item.release_test) ? `Release review: ${asString(item.release_test)}` : '',
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
        <p>{asString(decisionMemory.why_recorded)}</p>
        <ul>{textList(decisionMemory.retrieval_keys, 12).map((line, index) => <li key={`decision-memory-${index}`}>{line}</li>)}</ul>
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
  const clientInitialSurfaceData =
    initialSurfaceData && (!requestedView || requestedView === 'principal')
      ? buildPrincipalOnlySurfaceData(publicId, initialSurfaceData)
      : initialSurfaceData;

  return (
    <>
      <DecisionMemoServerAuditText
        data={initialSurfaceData}
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
