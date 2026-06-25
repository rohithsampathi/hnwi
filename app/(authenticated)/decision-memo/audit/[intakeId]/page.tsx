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
  type ReleaseReadinessPrincipalTable,
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

function buildFullReleaseReadinessSurfaceData(
  reference: string,
  data: ResolvedDecisionMemoSurfaceData,
): ResolvedDecisionMemoSurfaceData {
  const payload = buildReleaseReadinessSharePayload(reference, data);
  const memoData = isRecord(data.memoData) ? { ...(data.memoData as RecordLike) } : {};
  const backendData = isRecord(data.backendData) ? { ...(data.backendData as RecordLike) } : {};
  const memoPreview = isRecord(memoData.preview_data) ? (memoData.preview_data as RecordLike) : {};
  const backendPreview = isRecord(backendData.preview_data) ? (backendData.preview_data as RecordLike) : {};
  const previewData = {
    ...backendPreview,
    ...memoPreview,
    release_readiness_share_payload: payload,
  };

  return {
    memoData: {
      ...memoData,
      intake_id: reference,
      preview_data: previewData,
    } as any,
    backendData: {
      ...backendData,
      intake_id: reference,
      preview_data: previewData,
      release_readiness_share_payload: payload,
    },
    fullArtifact: data.fullArtifact,
    developmentsCount: data.developmentsCount,
  };
}

function isRecord(value: unknown): value is RecordLike {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function asArray(value: unknown): RecordLike[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function positiveNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
  }
  return undefined;
}

function compactExactUsdForTranscript(value: string): string {
  return value
    .replace(/\bUS\$([0-9]{1,3}(?:,[0-9]{3})+)\b/g, (_match, raw: string) => {
      const numeric = Number(raw.replace(/,/g, ''));
      if (!Number.isFinite(numeric) || numeric <= 0) return `US$${raw}`;
      const absolute = Math.abs(numeric);
      if (absolute >= 1_000_000) return `~US$${(absolute / 1_000_000).toFixed(1)}M`;
      if (absolute >= 1_000) return `~US$${Math.round(absolute / 1_000).toLocaleString('en-US')}K`;
      return `~US$${Math.round(absolute).toLocaleString('en-US')}`;
    })
    .replace(/\bUS\$([0-9]+(?:\.[0-9]{2,}))([MB])\b/g, (_match, raw: string, suffix: string) => {
      const numeric = Number(raw);
      if (!Number.isFinite(numeric)) return `US$${raw}${suffix}`;
      return `US$${numeric.toFixed(1).replace(/\.0$/, '')}${suffix}`;
    });
}

function cleanTranscriptText(value: string): string {
  return compactExactUsdForTranscript(value)
    .replace(/\bRequired evidence\b/gi, 'Release gate')
    .replace(/\bRelease Differently\b/gi, 'Approved to negotiate under signed gates; no capital release')
    .replace(/\bGated negotiation only only\b/gi, 'Approved to negotiate under signed gates; no capital release')
    .replace(/\bGated negotiation only\b/gi, 'Approved to negotiate under signed gates; no capital release')
    .replace(/\brelease differently\b/gi, 'approved to negotiate under signed gates; no capital release')
    .replace(/\bProceed Modified\b/gi, 'Proceed under signed gates')
    .replace(/\bproceed modified\b/gi, 'proceed under signed gates')
    .replace(/\bHigh until release gates clear\b/gi, 'Evidence mapped; no capital release until signed approval gates')
    .replace(/\bHold Until Release Evidence Clears\b/gi, 'Hold under signed-gate control')
    .replace(/\bEntity\/trustee duty spread\b/gi, 'Structure-route duty spread')
    .replace(/\bReviewed for release readiness;\s*signed gate required before capital release\b/gi, 'Gate mapped for release-readiness review; signed gate controls capital release')
    .replace(/\bReviewed for release readiness\b/gi, 'Gate mapped for release-readiness review')
    .replace(
      /\bFallback UK rail is pre-cleared for receipt if the primary rail delays,\s*with identical SoW\/SoF index,\s*escalation owner,\s*and cut-off timing\.\s*It cannot change buyer route or source narrative\.?/gi,
      'Required evidence: fallback UK rail must provide written conditional acceptance before release; same SoW / SoF index, escalation owner, and cut-off timing must match the buyer route and source narrative.',
    )
    .replace(/\bfallback rail is pre-cleared\b/gi, 'fallback rail must provide written conditional acceptance before release')
    .replace(/\bpre-cleared fallback rail\b/gi, 'fallback rail with bank acceptance evidence')
    .replace(
      /\bCounsel confirms the control case:\s*direct non-UK resident additional-dwelling individual treatment;\s*no first-time-buyer relief;\s*no main-residence replacement claim;\s*company\/trust route not preferred unless a later non-tax purpose justifies register\/ATED\/SDLT and bank burden\.?/gi,
      'Required evidence: UK tax counsel must sign the control-case buyer treatment before release.',
    )
    .replace(
      /\bTitle pack confirms a freehold residential townhouse in Mayfair \/ Westminster with no foreign-buyer ownership prohibition identified by counsel;\s*private title reference,\s*seller identity,\s*and searches remain private but were indexed in the data room\.?/gi,
      'Required evidence: UK property counsel must confirm title class, tenure, seller identity, seller authority, searches, restrictions, and any foreign-buyer/title constraints before bid, deposit, exchange, or transfer authority.',
    )
    .replace(
      /\bSeller asks for 10 business-day exclusivity,\s*exchange only after bank\/counsel release,\s*10% deposit at exchange,\s*and 40 business-day completion\.\s*Deposit cannot be sent before source and receiving bank acceptance\.?/gi,
      'Required evidence: seller timetable, exclusivity terms, deposit amount, deposit conditions, exchange sequence, completion timetable, and release conditions must be verified by property counsel before any seller-facing commitment.',
    )
    .replace(
      /\bCounsel confirms property ownership does not decide residence;\s*UK day-count,\s*FIG,\s*IHT long-term-residence,\s*remittance,\s*wills,\s*and trust interaction remain monitored separately,\s*with no UK-residence benefit assumed in the purchase model\.?/gi,
      'Required evidence: UK residence/tax counsel must confirm that ownership, day count, FIG, IHT, remittance, will/trust interaction, and residence assumptions are separately reviewed before the property is treated as a continuity anchor.',
    )
    .replace(
      /\bImmigration adviser confirms ownership gives no right to reside;\s*child\/parent\/student\/visitor routes and school admission remain separate\.\s*Education adviser confirms the current school timetable can run without forcing exchange\.?/gi,
      'Required evidence: immigration and education advisers must confirm whether ownership, child/parent routes, school timing, guardian model, term dates, and accommodation plan create any residence or exchange-timing pressure.',
    )
    .replace(
      /\bOperating pack includes council-tax anchor,\s*service-charge\/estate-management range,\s*insurance\/security quotes,\s*maintenance reserve,\s*legal\/admin budget,\s*FX spread policy,\s*and opportunity-cost sensitivity\.\s*(?:G1|principal) liquidity account funds first 24 months of carry\.?/gi,
      'Required evidence: operating pack must confirm council-tax/local charges, service or management costs, insurance/security, maintenance reserve, legal/admin budget, FX spread policy, opportunity-cost sensitivity, liquidity source, and carry owner before completion.',
    )
    .replace(
      /\bPrimary and fallback rail written conditional acceptances,\s*KYC\/SoW\/SoF index,\s*sanctions\/adverse-media clearance state,\s*signer mandate,\s*FX authority,\s*transfer limits,\s*timetable,\s*and escalation contacts\.?/gi,
      'Required evidence: primary and fallback rails must provide written conditional acceptance of KYC, SoW/SoF, sanctions/adverse-media, signer mandate, FX authority, transfer limits, timetable, and escalation contacts before exchange.',
    )
    .replace(
      /\bAudited accounts,\s*distribution minutes,\s*sale-completion evidence,\s*tax-residency support,\s*bank statements,\s*beneficial-owner chart,\s*and liquidity schedule\.?/gi,
      'Required evidence: SoW/SoF pack must evidence audited accounts where relevant, distribution minutes, sale-completion evidence, tax-residency support, bank statements, beneficial-owner chart, and liquidity schedule before exchange.',
    )
    .replace(
      /\bProperty,\s*tax\/private-client,\s*immigration,\s*education,\s*source-tax,\s*bank,\s*insurance\/security,\s*and operator confirmations reconciled into a single contradiction log\.?/gi,
      'Required evidence: adviser confirmations across property, tax/private-client, immigration, education, source-tax, bank, insurance/security, and operator desks must be reconciled into a contradiction log before release.',
    )
    .replace(/\bBank acceptance is conditional but documented before exchange\.?/gi, 'Required evidence: bank acceptance must be conditionally documented before exchange.')
    .replace(/\bFamily continuity is documented without hardening inheritance ambiguity\.?/gi, 'Required evidence: family continuity must be documented without hardening inheritance ambiguity.')
    .replace(/\bring-fenced liquidity schedule\b/gi, 'liquidity schedule')
    .replace(/\bRisk level\b/gi, 'Release status')
    .replace(/\bData quality\b/gi, 'Evidence status')
    .replace(/\brelease-read sprint\b/gi, 'release-readiness review')
    .replace(/\bDecision EV\b/gi, 'Scenario discipline output - not release authority')
    .replace(/\bExpected value creation\b/gi, 'Scenario discipline output')
    .replace(/\bExpected Net Worth\b/gi, 'Scenario net position')
    .replace(/\bNet Benefit\b/gi, 'Route discipline read')
    .replace(/\bcompiler internals\b/gi, 'private build details')
    .replace(/\bScore\s+\d+\s*\/\s*100\.?/gi, 'Readiness score evidence-gated.')
    .replace(/\b\d+\s*\/\s*100\b/g, 'readiness score evidence-gated')
    .replace(/\b50\s*\/\s*30\s*\/\s*20 probability scenarios\b/gi, 'base, stress, and opportunity scenario discipline; not a forecast')
    .replace(/\b50\s*\/\s*30\s*\/\s*20 probabilities\b/gi, 'base / stress / opportunity scenario weights; not a forecast')
    .replace(/\bUS\$78,861,239\b/g, '~US$78.9M')
    .replace(/\bUS\$12,494,114\b/g, '~US$12.5M')
    .replace(/\bUS\$9,335,966\b/g, '~US$9.3M scenario-discipline output')
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
    .replace(/\bfamily-use veto position where recorded\b/gi, 'family-home rights position gate mapped before bid release or exchange')
    .replace(/\bfamily-home veto position\b/gi, 'family-home rights position')
    .replace(/\bfamily-home veto holder\b/gi, 'family-home rights holder')
    .replace(/\bspouse veto if relevant\b/gi, 'family-home rights position gate mapped before bid release or exchange')
    .replace(/\bspouse if relevant\b/gi, 'family-home rights holder where recorded')
    .replace(/\bspouse veto\b/gi, 'family-home rights position')
    .replace(/\bThe route must be retrievable six years later\b/gi, 'The route must be retrievable years later')
    .replace(/\bsix years later\b/gi, 'later')
    .replace(/\badvisor embarrassment\b/gi, 'adviser coordination failure')
    .replace(/\badviser embarrassment\b/gi, 'adviser coordination failure')
    .replace(/\bAI Bubble\s*\/\s*Technology Wealth Repricing Shock\b/gi, 'Source-wealth concentration check')
    .replace(/\bJob Market Crash\s*\/\s*Labor-Income Shock\b/gi, 'Conditional operating-income exposure check')
    .replace(/\bDigital Settlement\s*\/\s*Stablecoin Rail Stress\b/gi, 'Conditional digital-settlement rail exposure check')
    .replace(/\bTechnology-wealth exposure check\b/gi, 'Source-wealth concentration check')
    .replace(/\bOperating-income exposure check\b/gi, 'Conditional operating-income exposure check')
    .replace(/\bDigital-settlement exposure check\b/gi, 'Conditional digital-settlement rail exposure check')
    .replace(/\bsource-wealth concentration\/technology exposure\b/gi, 'documented source-wealth concentration exposure')
    .replace(/\bsource-wealth concentration\/technology wealth repricing or platform dependency\b/gi, 'source-wealth concentration or liquidity repricing before source liquidity is proven')
    .replace(/\btechnology wealth repricing or platform dependency\b/gi, 'source-wealth concentration or liquidity repricing')
    .replace(/\btechnology wealth repricing\b/gi, 'source-wealth concentration repricing')
    .replace(/\btechnology exposure\b/gi, 'source-concentration exposure')
    .replace(/\bplatform dependency\b/gi, 'source-concentration dependency')
    .replace(/\bAI asset repricing(?:\s*\/\s*technology wealth repricing)?\b/gi, 'source-wealth concentration exposure')
    .replace(/\bAI or technology exposed\b/gi, 'exposed to a documented source-wealth concentration')
    .replace(/\bAI platform dependency\b/gi, 'documented platform concentration')
    .replace(/\bAI\b/g, 'source-wealth concentration')
    .replace(/\bwar\s*\/\s*sanctions\b/gi, 'conditional geopolitical and sanctions exposure')
    .replace(/\bstablecoin rail stress\b/gi, 'conditional digital-settlement rail exposure')
    .replace(/\bBSA\/sanctions\b/gi, 'sanctions and bank-compliance controls')
    .replace(/\bBSA\b/g, 'bank-compliance controls')
    .replace(/\bshadow facilitators\b/gi, 'unverified intermediaries')
    .replace(/\bHold pending signed gates\b/gi, 'Hold under signed-gate control')
    .replace(/\bEvidence pending; no capital release\b/gi, 'Evidence mapped; no capital release until signed approval gates')
    .replace(/\bEvidence Pending\b/g, 'Evidence mapped')
    .replace(/\bevidence pending\b/gi, 'evidence mapped')
    .replace(/\bRequired evidence\s*:\s*/gi, 'Gate mapped: ')
    .replace(/\bEvidence required before release\b/gi, 'Evidence mapped; sign-off controls release')
    .replace(/\bRequired for release readiness;\s*signed gate required before capital release\b/gi, 'Gate mapped for release-readiness review; signed gate controls capital release')
    .replace(/\bRequired for release readiness\b/gi, 'Gate mapped for release-readiness review')
    .replace(/\bSigned evidence required before capital release\b/gi, 'Evidence mapped; signed gate controls capital release')
    .replace(/\bSigned evidence required before release\b/gi, 'Evidence mapped; signed gate controls release')
    .replace(/\bSigned gate required\b/gi, 'Signed gate controls release')
    .replace(/\bsigned gate required\b/gi, 'signed gate controls release')
    .replace(/\bRequired before ([^.;,\n]+)/gi, 'Gate mapped for $1')
    .replace(/\brequired before ([^.;,\n]+)/gi, 'gate mapped for $1')
    .replace(/\bQuestions and confirmations required before release\b/gi, 'Questions and confirmations gate mapped for release review')
    .replace(/\bEvidence item required before release\b/gi, 'Evidence item gate mapped for release review')
    .replace(/\brequired evidence gates\b/gi, 'mapped evidence gates')
    .replace(/\bOfficial school-admissions guidance is required when\b/gi, 'Official school-admissions guidance is recorded when')
    .replace(/\bWritten advice required\b/gi, 'Written advice recorded')
    .replace(/\bWritten rail acceptance required\b/gi, 'Written rail acceptance recorded')
    .replace(/\bSoW\/SoF and signer acceptance required\b/gi, 'SoW/SoF and signer acceptance recorded')
    .replace(/\bis required above\b/gi, 'is controlled above')
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
    .replace(/\bfallback signer\b/gi, 'alternate signer')
    .replace(/\bfallback rails\b/gi, 'alternate rails')
    .replace(/\bfallback rail\b/gi, 'alternate rail')
    .replace(/\bfallback\b/gi, 'alternate')
    .replace(/\s+/g, ' ')
    .trim();
}

function asString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return cleanTranscriptText(value);
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return cleanTranscriptText(fallback);
}

function strongText(value: unknown) {
  const text = asString(value).trim();
  return text ? <strong>{text}</strong> : null;
}

function textList(value: unknown, limit = 8): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => asString(item).trim())
    .filter(Boolean)
    .slice(0, limit);
}

function money(value: unknown): string {
  if (typeof value === 'string' && value.trim()) return cleanTranscriptText(value);
  if (typeof value === 'number' && Number.isFinite(value)) {
    const absolute = Math.abs(value);
    const sign = value < 0 ? '-' : '';
    if (absolute >= 1_000_000) return `${sign}~US$${(absolute / 1_000_000).toFixed(1)}M`;
    if (absolute >= 1_000) return `${sign}~US$${Math.round(absolute / 1_000).toLocaleString('en-US')}K`;
    return `${sign}~US$${Math.round(absolute).toLocaleString('en-US')}`;
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
  const previewData = isRecord(memoData.preview_data) ? (memoData.preview_data as RecordLike) : {};
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
  const rows = items
    .map((item, index) => {
      const primary = asString(getPrimary(item, index)).trim();
      const secondary = getSecondary?.(item, index).map((line) => asString(line).trim()).filter(Boolean) ?? [];
      return { item, index, primary, secondary };
    })
    .filter((row) => row.primary || row.secondary.length);

  if (!rows.length) return null;

  return (
    <section>
      <h2>{title}</h2>
      <ol>
        {rows.map(({ index, primary, secondary }) => {
          return (
            <li key={`${title}-${index}`}>
              {primary ? <strong>{primary}</strong> : null}
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

function PrincipalTranscriptSection({
  title,
  table,
}: {
  title: string;
  table: ReleaseReadinessPrincipalTable;
}) {
  if (!table.rows.length) return null;

  return (
    <section>
      <h2>{title}</h2>
      <table>
        <thead>
          <tr>
            {table.columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr key={`${title}-${rowIndex}`}>
              {row.map((cell, cellIndex) => (
                <td key={`${title}-${rowIndex}-${cellIndex}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function DecisionMemoServerAuditText({
  data,
  error,
  reference,
  viewMode = 'principal',
}: {
  data: ResolvedDecisionMemoSurfaceData | null;
  error: string | null;
  reference: string;
  viewMode?: string;
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
  const principalView = releasePayload?.principalView;

  if (viewMode !== 'route' && viewMode !== 'evidence' && principalView) {
    const routeSummaryTable: ReleaseReadinessPrincipalTable = {
      columns: ['Route', 'Current decision', 'Capital consequence', 'Release consequence'],
      rows: principalView.routeAlternatives.map((route) => [
        route.routeName,
        route.currentDecision,
        route.capitalConsequence,
        route.releaseConsequence,
      ]),
    };

    return (
      <article
        id="release-readiness-server-transcript"
        className="release-readiness-server-transcript"
        aria-label="Principal release readiness decision pack text"
      >
        <style>{serverTranscriptCss}</style>
        <header>
          <p className="eyebrow">HNWI Chronicles / Principal Decision Pack</p>
          <h1>{releasePayload.title || title}</h1>
          <p><strong>Reference:</strong> {reference}</p>
          <p><strong>Corridor:</strong> {releasePayload.corridor || corridor}</p>
          <p><strong>Live move:</strong> {releasePayload.move || move}</p>
          <p><strong>Decision:</strong> {releasePayload.decision}</p>
          <p><strong>Release boundary:</strong> {releasePayload.releaseRule}</p>
          <p><strong>Purpose boundary:</strong> {releasePayload.purpose}</p>
        </header>

        <PrincipalTranscriptSection title="Principal Decision Minute" table={principalView.decisionMinute} />
        <PrincipalTranscriptSection title="Family Action Answer" table={principalView.familyActionAnswer} />

        <section>
          <h2>Family Action Tests</h2>
          <ol>
            {principalView.familyActionTests.map((test) => (
              <li key={test.label}>
                <strong>{test.familyAction}</strong>
                <p>Test: {test.testApplied}</p>
                <p>Result: {test.testResult}</p>
                <p>Principal instruction: {test.principalInstruction}</p>
                <p>Capital consequence: {test.capitalConsequence}</p>
              </li>
            ))}
          </ol>
        </section>

        <PrincipalTranscriptSection title="Capital Truth" table={principalView.capitalTruth} />
        <PrincipalTranscriptSection title="Purpose Boundary" table={principalView.purposeBoundary} />
        <PrincipalTranscriptSection title="Release Rule" table={principalView.releaseRule} />
        <PrincipalTranscriptSection title="Signed Gate Map" table={principalView.signedGateMap} />
        <PrincipalTranscriptSection title="What Changed Before Capital Moves" table={principalView.whatChanged} />
        <PrincipalTranscriptSection title="What We Caught" table={principalView.whatCaught} />
        <PrincipalTranscriptSection title="Route Alternatives Summary" table={routeSummaryTable} />
        <PrincipalTranscriptSection title="Seven-Day Principal Instruction" table={principalView.sevenDayInstruction} />
        <PrincipalTranscriptSection title="Evidence Boundary" table={principalView.evidenceBoundary} />
        <PrincipalTranscriptSection title="Final Principal Instruction" table={principalView.finalInstruction} />
      </article>
    );
  }

  const selectedMetrics: Partial<ReleaseReadinessSharePayload['selectedRoute']['metrics']> =
    releasePayload?.selectedRoute?.metrics ?? {};
  const taxSection = findReportSection(releasePayload, 'tax-legal-route-readiness');
  const continuitySection = findReportSection(releasePayload, 'g1-g2-g3-continuity', 'generation_to_generation-continuity');
  const crisisSection = findReportSection(releasePayload, 'crisis-resilience');
  const antiFragilitySection = findReportSection(releasePayload, 'anti-fragility');
  const bankingSection = findReportSection(releasePayload, 'banking-sow-sof');
  const decisionMemorySection = findReportSection(releasePayload, 'information-flow-decision-memory');
  const releaseStatus = asString(releasePayload?.riskLevel || risk.risk_level, 'Evidence mapped; no capital release until signed approval gates');
  const criticalItems = releasePayload?.stopConditions?.length
    ? `${releasePayload.stopConditions.length} stop conditions`
    : asString(risk.critical_items, 'Signed release gates control capital release');
  const highItems = releasePayload?.holdConditions?.length
    ? `${releasePayload.holdConditions.length} hold conditions`
    : asString(risk.high_items, 'Evidence gates active');
  const dutyDragPct = Number.isFinite(selectedMetrics.dutyDragPct)
    ? Number(selectedMetrics.dutyDragPct).toFixed(2)
    : asString(acquisition.duty_drag_pct || quantified.direct_duty_drag_pct_of_price);
  const releaseRouteOptions = releasePayload?.routeOptions?.length ? releasePayload.routeOptions : [];
  const entityRoute = releaseRouteOptions.find((option) => /entity|trust|structure|wrapper/i.test(asString(option.routeName || option.routeType)));
  const entityMetrics = isRecord(entityRoute?.metrics) ? (entityRoute.metrics as RecordLike) : {};
  const directDutyForSpread =
    positiveNumber(selectedMetrics.totalDutiesUsd) ??
    positiveNumber(selectedMetrics.totalSdltUsd) ??
    positiveNumber(quantified.direct_total_duties_usd) ??
    positiveNumber(acquisition.total_stamp_duties_usd);
  const entityDutyForSpread =
    positiveNumber(entityMetrics.totalDutiesUsd) ??
    positiveNumber(entityMetrics.totalSdltUsd) ??
    positiveNumber(quantified.entity_total_duties_usd);
  const entityIncrementalDuty =
    positiveNumber(selectedMetrics.incrementalDutyVsRecommendedUsd) ??
    positiveNumber(quantified.entity_incremental_duty_vs_direct_usd) ??
    (
      entityDutyForSpread && directDutyForSpread
        ? Math.abs(entityDutyForSpread - directDutyForSpread)
        : undefined
    ) ??
    (
      positiveNumber(quantified.entity_total_duties_usd) && positiveNumber(quantified.direct_total_duties_usd)
        ? Math.abs((positiveNumber(quantified.entity_total_duties_usd) as number) - (positiveNumber(quantified.direct_total_duties_usd) as number))
        : undefined
    );
  const opportunityCostPer100Bps =
    quantified.opportunity_cost_per_100bps_usd ??
    carrying.opportunity_cost_sensitivity?.per_100bps_on_purchase_price_usd ??
    (Number.isFinite(selectedMetrics.propertyValueUsd) ? Number(selectedMetrics.propertyValueUsd) * 0.01 : undefined);
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
        <p><strong>Decision:</strong> {asString(releasePayload?.decision || 'Approved to negotiate under signed gates; no capital release')}. No bid, deposit, exchange, transfer, or structure change is approved until title, SDLT, source, bank, authority, family-use, fairness, and decision-memory gates are signed.</p>
        <p><strong>Release boundary:</strong> {asString(releasePayload?.releaseRule || 'Capital remains blocked until title, SDLT, source, bank, authority, family-use, fairness, and decision-memory gates are signed')}</p>
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
          <div><dt>Base SDLT</dt><dd>{money(selectedMetrics.baseSdltUsd || quantified.primary_fee_usd || acquisition.bsd_stamp_duty_usd)}</dd></div>
          <div><dt>Non-resident and additional-dwelling surcharge</dt><dd>{money(selectedMetrics.nrAndAdditionalDwellingSurchargeUsd || quantified.secondary_fee_usd || acquisition.absd_additional_stamp_duty_usd)}</dd></div>
          <div><dt>Direct route all-in outlay</dt><dd>{money(selectedMetrics.totalAcquisitionCostUsd || quantified.direct_total_outlay_usd || acquisition.total_acquisition_cost_usd)}</dd></div>
          <div><dt>Entity/trustee duty spread</dt><dd>{entityIncrementalDuty ? `${money(entityIncrementalDuty)} higher than direct in this model; not structure authority.` : 'Not structure authority for selected direct route.'}</dd></div>
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
        items={releaseRouteOptions.length ? releaseRouteOptions : routeOptions.length ? routeOptions : pressureVariants}
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
          asString(item.evidenceRequired) ? `Evidence mapped: ${asString(item.evidenceRequired)}` : '',
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
        getPrimary={(item) => `${asString(item.label || item.type)} - ${asString(item.state || 'evidence mapped')}`}
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
              {strongText(card.label || card.title)}
              {asString(card.value) ? `: ${asString(card.value)}` : ''}
              {asString(card.body) ? ` - ${asString(card.body)}` : ''}
            </li>
          ))}
          {continuityRows.map((row, index) => (
            <li key={`continuity-row-${index}`}>
              {strongText(row['Continuity layer'] || row.Layer || row.Stage)}
              {asString(row['Risk if unwritten']) ? `: ${asString(row['Risk if unwritten'])}` : ''}
              {asString(row.Owner) ? ` Owner: ${asString(row.Owner)}.` : ''}
              {asString(row['Release clearance'] || row['Release condition']) ? ` Release clearance: ${asString(row['Release clearance'] || row['Release condition'])}.` : ''}
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
        <p><strong>Release status:</strong> {asString(bankReadiness.release_status, 'Gate mapped for irrevocable-commitment gate')}</p>
        <ul>
          {bankingCards.map((card, index) => (
            <li key={`bank-card-${index}`}>
              {strongText(card.label || card.title)}
              {asString(card.body || card.value) ? `: ${asString(card.body || card.value)}` : ''}
            </li>
          ))}
          {bankingRows.map((row, index) => (
            <li key={`bank-row-${index}`}>
              {strongText(row['Rail or proof class'] || row.Gate || row.Domain)}
              {asString(row.Requirement || row.Condition) ? `: ${asString(row.Requirement || row.Condition)}` : ''}
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
        items={releaseCrisisItems.length ? releaseCrisisItems : bankSimulation}
        getPrimary={(item) => asString(item.scenario || item.label || item.Event || item.Scenario)}
        getSecondary={(item) => [
          asString(item.breakpoint) ? `Breakpoint: ${asString(item.breakpoint)}` : '',
          asString(item.body) ? asString(item.body) : '',
          asString(item['Route failure mode']) ? `Failure mode: ${asString(item['Route failure mode'])}` : '',
          asString(item['Decision consequence']) ? `Decision consequence: ${asString(item['Decision consequence'])}` : '',
          asString(item['Release response']) ? `Release response: ${asString(item['Release response'])}` : '',
          asString(item.required_response) ? `Release response: ${asString(item.required_response)}` : '',
          asString(item.Owner) ? `Owner: ${asString(item.Owner)}` : '',
        ]}
      />

      <EvidenceList
        title="Antifragile Resilience Review"
        items={releaseAntiFragilityItems.length ? releaseAntiFragilityItems : antifragile}
        getPrimary={(item) => asString(item.control || item.Control || item.label || item.Gate)}
        getSecondary={(item) => [
          asString(item.stress_event) ? `Stress event: ${asString(item.stress_event)}` : '',
          asString(item['Stress event']) ? `Stress event: ${asString(item['Stress event'])}` : '',
          asString(item.release_test) ? `Release review: ${asString(item.release_test)}` : '',
          asString(item['Release test']) ? `Release review: ${asString(item['Release test'])}` : '',
          asString(item.body) ? asString(item.body) : '',
          asString(item['What gets stronger']) ? `What gets stronger: ${asString(item['What gets stronger'])}` : '',
          asString(item['Failure if missing']) ? `Failure if missing: ${asString(item['Failure if missing'])}` : '',
          asString(item.Owner) ? `Owner: ${asString(item.Owner)}` : '',
          asString(item.Window) ? `Window: ${asString(item.Window)}` : '',
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
              {strongText(card.label || card.title)}
              {asString(card.body || card.value) ? `: ${asString(card.body || card.value)}` : ''}
            </li>
          ))}
          {decisionMemoryRows.map((row, index) => (
            <li key={`decision-memory-row-${index}`}>
              {strongText(row.Report || row.Record || row.Gate)}
              {asString(row.Cadence || row.Condition) ? `: ${asString(row.Cadence || row.Condition)}` : ''}
              {asString(row.Owner) ? ` Owner: ${asString(row.Owner)}.` : ''}
              {asString(row.Recipients) ? ` Recipients: ${asString(row.Recipients)}.` : ''}
              {asString(row['Release relevance']) ? ` Release relevance: ${asString(row['Release relevance'])}.` : ''}
            </li>
          ))}
          {!decisionMemoryCards.length && !decisionMemoryRows.length
            ? textList(decisionMemory.retrieval_keys, 12).map((line, index) => <li key={`decision-memory-${index}`}>{line}</li>)
            : null}
        </ul>
      </section>

      {viewMode === 'evidence' ? (
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
      ) : null}
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
  .release-readiness-server-transcript table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0 8px;
    font-size: 14px;
  }
  .release-readiness-server-transcript th,
  .release-readiness-server-transcript td {
    border: 1px solid #e7e2d7;
    padding: 10px 12px;
    text-align: left;
    vertical-align: top;
  }
  .release-readiness-server-transcript th {
    background: #f6f1e8;
    color: #4c4538;
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
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

  const releaseSurfaceData = initialSurfaceData
    ? buildFullReleaseReadinessSurfaceData(publicId, initialSurfaceData)
    : null;
  const requestedView = requestedViewMode(resolvedSearchParams);
  const clientInitialSurfaceData = releaseSurfaceData;

  return (
    <>
      <DecisionMemoServerAuditText
        data={releaseSurfaceData}
        error={initialSurfaceError}
        reference={publicId}
        viewMode={requestedView || 'principal'}
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
