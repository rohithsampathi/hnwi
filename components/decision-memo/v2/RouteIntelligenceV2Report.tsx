'use client';

import Link from 'next/link';
import React, { useMemo, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowLeft,
  Banknote,
  BarChart3,
  BookOpen,
  Building2,
  Calculator,
  CheckCircle2,
  FileCheck2,
  GitCompare,
  GitBranch,
  Home,
  Landmark,
  OctagonX,
  PauseCircle,
  Route,
  ShieldCheck,
  TimerReset,
  Users,
} from 'lucide-react';
import { DecisionMemoRenderProvider } from '@/components/decision-memo/memo/decision-memo-render-context';
import {
  type ReleaseReadinessShareCard,
  type ReleaseReadinessMethodDriver,
  type ReleaseReadinessMethodSource,
  type ReleaseReadinessSharePayload,
  type ReleaseReadinessShareReportSection,
} from '@/lib/decision-memo/build-release-readiness-share-surface';
import {
  type BuyerProfileRemissionMatrix,
  formatUsdCompact,
  type PrincipalValueGate,
  type RouteEvidenceGate,
  type RouteDriverRegisterItem,
  type RouteIntelligenceOptionV2,
  type RouteScenarioPoint,
  type RouteStressSignal,
  type RouteIntelligenceV2,
} from '@/lib/decision-memo/route-intelligence-v2';

type FullMemoRenderer = ReactNode | ((route: RouteIntelligenceOptionV2) => ReactNode);

interface RouteIntelligenceV2ReportProps {
  intelligence: RouteIntelligenceV2;
  publicMemoId: string;
  v1Href: string;
  fullMemo?: FullMemoRenderer;
  zeroTrustMoveIntake?: Record<string, unknown> | null;
  embedded?: boolean;
  onCitationClick?: (citationId: string) => void;
  citationMap?: Map<string, number>;
  sharePayload?: ReleaseReadinessSharePayload | null;
}

function pct(value: number): string {
  if (!Number.isFinite(value)) return '0.0%';
  return `${value.toFixed(1)}%`;
}

function compactExactUsdForRouteText(value: string): string {
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

function routeDisplayText(value: unknown): string {
  if (typeof value !== 'string') return '';
  return compactExactUsdForRouteText(value)
    .replace(/\bRequired evidence\b/gi, 'Release gate')
    .replace(
      /\bSoW file ties wealth to[^.]+\. No unexplained cash leg remains in the reviewed pack\./gi,
      'Required evidence: SoW / SoF pack must tie wealth to bank statements, source records, tax support, audited accounts where relevant, and beneficial-owner chart before release.',
    )
    .replace(
      /\bFunds for price, direct-route SDLT, FX spread, and initial carry are held in a ring-fenced liquidity pool with[^.]+\./gi,
      'Required evidence: funds for price, direct-route SDLT, FX spread, and initial carry must be evidenced through source statements, transfer authority, tax support, and buyer-matched bank instructions before release.',
    )
    .replace(
      /\bSource funding rail and primary UK receiving rail provide written conditional acceptance[^.]+\./gi,
      'Required evidence: source funding rail, primary UK receiving rail, and fallback rail must provide written conditional acceptance before release.',
    )
    .replace(
      /\bFallback UK rail is pre-cleared for receipt if the primary rail delays,\s*with identical SoW\/SoF index,\s*escalation owner,\s*and cut-off timing\.\s*It cannot change buyer route or source narrative\.?/gi,
      'Required evidence: fallback UK rail must provide written conditional acceptance before release; same SoW / SoF index, escalation owner, and cut-off timing must match the buyer route and source narrative.',
    )
    .replace(/\bfallback rail is pre-cleared\b/gi, 'fallback rail must be evidenced before release')
    .replace(/\bpre-cleared fallback rail\b/gi, 'fallback rail with bank acceptance evidence')
    .replace(/\bReviewed for release readiness;\s*signed gate required before capital release\b/gi, 'Gate mapped for release-readiness review; signed gate controls capital release')
    .replace(/\bReviewed for release readiness\b/gi, 'Gate mapped for release-readiness review')
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
    .replace(/\bRelease Differently\b/gi, 'Approved to negotiate under signed gates; no capital release')
    .replace(/\bGated negotiation only only\b/gi, 'Approved to negotiate under signed gates; no capital release')
    .replace(/\bGated negotiation only\b/gi, 'Approved to negotiate under signed gates; no capital release')
    .replace(/\bproceed[-\s]modified\b/gi, 'Proceed under signed gates')
    .replace(/\bHold Until Release Evidence Clears\b/gi, 'Hold under signed-gate control')
    .replace(/\bEntity\/trustee duty spread\b/gi, 'Structure-route duty spread')
    .replace(/\bas a London family base,\s*education\/continuity node,\s*and capital-preservation asset\b/gi, 'as a proposed London family-use acquisition, with education, residence, succession, and capital-preservation claims treated as separate gates')
    .replace(/\bcurrent the corridor read\b/gi, 'current corridor read')
    .replace(/\bcurrent the corridor\b/gi, 'current corridor')
    .replace(/\bPreferred modified route only if\b/gi, 'Preferred direct route only if')
    .replace(/\bPreferred modified route\b/gi, 'Preferred direct route under signed gates')
    .replace(/\bremains Proceed under signed gates\b/gi, 'remains gated')
    .replace(/\bShould the family release the purchase route now,\s*Gated negotiation only,\s*hold,\s*or stop\?/gi, 'Should the family advance under signed gates, hold, or stop?')
    .replace(/\bNative Route Drivers\b/gi, 'Route Drivers From Source Review')
    .replace(/\bDecision EV\b/gi, 'Scenario discipline output - not release authority')
    .replace(/\bModel\s+output\b/gi, 'Scenario route read')
    .replace(/\bExpected value creation\b/gi, 'Scenario discipline output')
    .replace(/\bExpected Net Worth\b/gi, 'Scenario net position')
    .replace(/\bNet Benefit\b/gi, 'Route discipline read')
    .replace(/\bcompiler internals\b/gi, 'private build details')
    .replace(/\bScore\s+\d+\s*\/\s*100\.?/gi, 'Readiness score evidence-gated.')
    .replace(/\b\d+\s*\/\s*100\b/g, 'readiness score evidence-gated')
    .replace(/\b50\s*\/\s*30\s*\/\s*20 probability scenarios\b/gi, 'base, stress, and opportunity scenario discipline; not a forecast')
    .replace(/\b50\s*\/\s*30\s*\/\s*20 probabilities\b/gi, 'base / stress / opportunity scenario weights; not a forecast')
    .replace(/\bSIX-BOOK OPENING\b/gi, 'Decision Opening')
    .replace(/\bSix-book opening\b/gi, 'Decision opening')
    .replace(/\bOPEN GATES\b/gi, 'Release Gate Status')
    .replace(/\bOpen Gates\b/gi, 'Release Gate Status')
    .replace(/\bRelease-gated\b/gi, 'Signed gate controls release')
    .replace(/\b0\s+to\s+close\b/gi, 'Evidence mapped')
    .replace(/\bDOCUMENTED\b/g, 'Indexed for review')
    .replace(/\bDocumented\b/g, 'Indexed for review')
    .replace(/\breleased differently\b/gi, 'advanced under signed gates')
    .replace(/\brelease differently\b/gi, 'advance under signed gates')
    .replace(/\bPressure Variants Tested\b/gi, 'Release Readiness Routes Reviewed')
    .replace(/\bPressure Test\b/gi, 'Release Readiness Review')
    .replace(/\bpressure-test(?:ed|ing)?\b/gi, 'release-readiness reviewed')
    .replace(/\bpressure\b/gi, 'readiness')
    .replace(/\bG1 principal\b/gi, 'G1 principal')
    .replace(/\bfallback signer\b/gi, 'alternate signer')
    .replace(/\bfallback rails\b/gi, 'alternate rails')
    .replace(/\bfallback rail\b/gi, 'alternate rail')
    .replace(/\bfallback\b/gi, 'alternate')
    .replace(/\bG2 son\b/gi, 'G2 named family user')
    .replace(/\bG2 daughter\s*\/\s*fairness owner\b/gi, 'G2 fairness owner')
    .replace(/\bdaughter\s*\/\s*fairness owner\b/gi, 'G2 fairness owner')
    .replace(/\bdaughter\/fairness\b/gi, 'G2 fairness')
    .replace(/\bG3 grandson\b/gi, 'G3 next-generation record')
    .replace(/\bfuture-grandchild\b/gi, 'next-generation')
    .replace(/\bgrandson\b/gi, 'G3 next-generation record')
    .replace(/\bson-use\b/gi, 'G2 use')
    .replace(/\bson use\b/gi, 'G2 use')
    .replace(/\bspouse veto if relevant\b/gi, 'family-home veto position where recorded')
    .replace(/\bspouse if relevant\b/gi, 'family-home veto holder where recorded')
    .replace(/\bspouse veto\b/gi, 'family-home veto position')
    .replace(/\ba undocumented family expectation\b/gi, 'an undocumented family expectation')
    .replace(/\bDestination tax counsel\b/gi, 'UK tax counsel')
    .replace(/\bDestination property counsel\b/gi, 'UK property counsel')
    .replace(/\badvisor embarrassment\b/gi, 'adviser coordination failure')
    .replace(/\badviser embarrassment\b/gi, 'adviser coordination failure')
    .replace(/\bAI Bubble\s*\/\s*Technology Wealth Repricing Shock\b/gi, 'Source-wealth concentration check')
    .replace(/\bJob Market Crash\s*\/\s*Labor-Income Shock\b/gi, 'Conditional operating-income exposure check')
    .replace(/\bDigital Settlement\s*\/\s*Stablecoin Rail Stress\b/gi, 'Conditional digital-settlement rail exposure check')
    .replace(/\bTechnology-wealth exposure check\b/gi, 'Source-wealth concentration check')
    .replace(/\bsource-wealth concentration\/technology exposure\b/gi, 'documented source-wealth concentration exposure')
    .replace(/\bsource-wealth concentration\/technology wealth repricing or platform dependency\b/gi, 'source-wealth concentration or liquidity repricing before source liquidity is proven')
    .replace(/\btechnology wealth repricing or platform dependency\b/gi, 'source-wealth concentration or liquidity repricing')
    .replace(/\btechnology wealth repricing\b/gi, 'source-wealth concentration repricing')
    .replace(/\btechnology exposure\b/gi, 'source-concentration exposure')
    .replace(/\bplatform dependency\b/gi, 'source-concentration dependency')
    .replace(/\bOperating-income exposure check\b/gi, 'Conditional operating-income exposure check')
    .replace(/\bDigital-settlement exposure check\b/gi, 'Conditional digital-settlement rail exposure check')
    .replace(/\bAI\/technology wealth repricing\b/gi, 'source-wealth concentration exposure')
    .replace(/\bAI asset repricing(?:\s*\/\s*technology wealth repricing)?\b/gi, 'source-wealth concentration exposure')
    .replace(/\bAI or technology exposed\b/gi, 'exposed to a documented source-wealth concentration')
    .replace(/\bAI platform dependency\b/gi, 'documented platform concentration')
    .replace(/\bAI\b/g, 'source-wealth concentration')
    .replace(/\bwar\s*\/\s*sanctions\b/gi, 'conditional geopolitical and sanctions exposure')
    .replace(/\bGulf conflict,\s*sanctions\b/gi, 'conditional geopolitical and sanctions exposure')
    .replace(/\bstablecoin rail stress\b/gi, 'conditional digital-settlement rail exposure')
    .replace(/\bBSA\/sanctions\b/gi, 'sanctions and bank-compliance controls')
    .replace(/\bBSA\b/g, 'bank-compliance controls')
    .replace(/\bshadow facilitators\b/gi, 'unverified intermediaries')
    .replace(/\bConditional\s+Conditional\b/gi, 'Conditional')
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
    .replace(/\s+/g, ' ')
    .trim();
}

function releaseTone(route: RouteIntelligenceOptionV2): string {
  const rule = routeDisplayText(route.releaseRule).toLowerCase();
  const verdict = routeDisplayText(route.verdict).toLowerCase();
  if (
    route.releaseRule === 'Release Differently' ||
    rule.includes('gated negotiation') ||
    rule.includes('approved to negotiate') ||
    rule.includes('release differently') ||
    verdict.includes('preferred direct') ||
    verdict.includes('proceed under signed gates')
  ) {
    return 'border-emerald-500/25 bg-emerald-500/[0.04] text-emerald-500';
  }
  if (route.releaseRule === 'Hold' || rule.includes('hold')) {
    return 'border-amber-500/25 bg-amber-500/[0.04] text-amber-500';
  }
  return 'border-red-500/25 bg-red-500/[0.04] text-red-500';
}

function releaseRuleDisplay(rule: RouteIntelligenceOptionV2['releaseRule'] | string): string {
  if (rule === 'Release Differently') return 'Approved to negotiate';
  if (routeDisplayText(rule).toLowerCase().includes('gated negotiation')) return 'Approved to negotiate';
  if (routeDisplayText(rule).toLowerCase().includes('approved to negotiate')) return 'Approved to negotiate';
  if (rule === 'Hold') return 'Hold';
  if (routeDisplayText(rule).toLowerCase().includes('hold')) return 'Hold';
  if (rule === 'Stop') return 'Stop';
  if (routeDisplayText(rule).toLowerCase().includes('stop')) return 'Stop';
  return String(rule || '');
}

function isOutcomeOnlyRoute(route: RouteIntelligenceOptionV2): boolean {
  const routeName = String(route.routeName || '').toLowerCase();
  const routeType = String(route.routeType || '').toLowerCase();
  return (
    route.id === 'hold_rent_first' ||
    route.id === 'stop_route' ||
    routeName.startsWith('hold ') ||
    routeName.startsWith('stop ') ||
    routeType.includes('optionality-preservation') ||
    routeType.includes('capital-protection')
  );
}

type ShareRouteOption = NonNullable<ReleaseReadinessSharePayload['routeOptions']>[number];

function routeMatchKey(value: unknown): string {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function finiteNumber(value: unknown): number | null {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function hydrateRouteWithShareMetrics(
  route: RouteIntelligenceOptionV2,
  shareRoutes: ShareRouteOption[],
): RouteIntelligenceOptionV2 {
  const shareRoute = shareRoutes.find((option) => (
    routeMatchKey(option.id) === routeMatchKey(route.id) ||
    routeMatchKey(option.routeName) === routeMatchKey(route.routeName)
  ));

  if (!shareRoute) return route;

  const metrics = shareRoute.metrics;
  const numberOrZero = (value: unknown) => finiteNumber(value) ?? 0;

  return {
    ...route,
    routeType: shareRoute.routeType || route.routeType,
    verdict: shareRoute.verdict || route.verdict,
    releaseRule: shareRoute.releaseRule as RouteIntelligenceOptionV2['releaseRule'],
    metrics: {
      ...route.metrics,
      propertyValueUsd: numberOrZero(metrics.propertyValueUsd),
      bsdUsd: numberOrZero(metrics.baseSdltUsd),
      absdUsd: numberOrZero(metrics.nrAndAdditionalDwellingSurchargeUsd),
      totalDutiesUsd: numberOrZero(metrics.totalDutiesUsd),
      totalAcquisitionCostUsd: numberOrZero(metrics.totalAcquisitionCostUsd),
      incrementalDutyVsRecommendedUsd: numberOrZero(metrics.incrementalDutyVsRecommendedUsd),
      dutyDragPct: numberOrZero(metrics.dutyDragPct),
      annualCarryingCostUsd: numberOrZero(metrics.annualCarryingCostUsd),
      dataQuality: metrics.dataQuality || route.metrics.dataQuality,
      mitigationTimeline: metrics.mitigationTimeline || route.metrics.mitigationTimeline,
    },
  };
}

class RouteFullMemoErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg border border-amber-500/25 bg-amber-500/[0.04] p-5 text-sm leading-relaxed text-muted-foreground">
          The route read is available. The linear route memo is still warming; switch back to Principal View for the canonical decision surface.
        </div>
      );
    }

    return this.props.children;
  }
}

function RouteFullMemoAnchor({
  route,
  fullMemo,
}: {
  route: RouteIntelligenceOptionV2;
  fullMemo: FullMemoRenderer;
}) {
  return <>{typeof fullMemo === 'function' ? fullMemo(route) : fullMemo}</>;
}

function safeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function safeRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function recordEntries(value: unknown): Array<[string, unknown]> {
  return Object.entries(safeRecord(value)).filter(([, entryValue]) => {
    if (entryValue === null || entryValue === undefined) return false;
    if (typeof entryValue === 'string') return entryValue.trim().length > 0;
    if (Array.isArray(entryValue)) return entryValue.length > 0;
    if (typeof entryValue === 'object') return Object.keys(entryValue as Record<string, unknown>).length > 0;
    return true;
  });
}

function labelFromKey(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function metricLabel(route: RouteIntelligenceOptionV2): string {
  const releaseRule = releaseRuleDisplay(route.releaseRule);
  if (isOutcomeOnlyRoute(route) && releaseRule === 'Stop') return 'Capital Protected';
  if (isOutcomeOnlyRoute(route) && releaseRule === 'Hold') return 'Duty Exposure Preserved';
  return 'All-In Outlay';
}

function metricValue(route: RouteIntelligenceOptionV2): string {
  if (isOutcomeOnlyRoute(route)) {
    return releaseRuleDisplay(route.releaseRule) === 'Stop' ? 'Capital blocked' : 'Purchase held';
  }
  return formatUsdCompact(route.metrics.totalAcquisitionCostUsd);
}

function routeDutiesValue(route: RouteIntelligenceOptionV2): string {
  if (isOutcomeOnlyRoute(route)) return 'No purchase duty';
  if (route.metrics.totalDutiesUsd > 0) return formatUsdCompact(route.metrics.totalDutiesUsd);
  return 'Counsel computation recorded';
}

function routeDutyDragValue(route: RouteIntelligenceOptionV2): string {
  if (isOutcomeOnlyRoute(route)) return 'No purchase';
  if (route.metrics.dutyDragPct > 0) return pct(route.metrics.dutyDragPct);
  return 'Counsel computation recorded';
}

function routeSelectorIcon(route: RouteIntelligenceOptionV2) {
  const key = `${route.id} ${route.routeName} ${route.routeType}`.toLowerCase();
  if (key.includes('stop')) return OctagonX;
  if (key.includes('hold') || key.includes('rent')) return PauseCircle;
  if (key.includes('structure') || key.includes('trust') || key.includes('entity') || key.includes('ownership')) return Building2;
  if (key.includes('residence') || key.includes('replacement')) return Home;
  return Route;
}

function routeBaseDutyValue(route: RouteIntelligenceOptionV2, fallbackValue: unknown): string {
  if (isOutcomeOnlyRoute(route)) return 'No purchase duty';
  const value = route.metrics.bsdUsd || Number(fallbackValue) || 0;
  return value > 0 ? formatUsdCompact(value) : 'Counsel computation recorded';
}

function routeSurchargeValue(route: RouteIntelligenceOptionV2, fallbackValue: unknown): string {
  if (isOutcomeOnlyRoute(route)) return 'No surcharge while held';
  const value = route.metrics.absdUsd || Number(fallbackValue) || 0;
  return value > 0 ? formatUsdCompact(value) : 'Counsel computation recorded';
}

function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-5">
      <p className="text-xs uppercase tracking-[0.22em] text-gold/70">{routeDisplayText(label)}</p>
      <h2 className="mt-2 text-xl sm:text-2xl font-semibold tracking-tight text-foreground break-words">{routeDisplayText(title)}</h2>
      <div className="mt-4 h-px bg-border/70" />
    </div>
  );
}

function zeroTrustRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function zeroTrustRecords(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object' && !Array.isArray(item)))
    : [];
}

function zeroTrustList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === 'string') return item.trim();
      if (item && typeof item === 'object') {
        const record = item as Record<string, unknown>;
        return String(record.domain || record.record || record.label || record.title || record.evidence || record.detail || '').trim();
      }
      return '';
    })
    .filter(Boolean);
}

function zeroTrustText(value: unknown): string {
  return typeof value === 'string' && value.trim() ? routeDisplayText(value.trim()) : '';
}

function isPlaceholderZeroTrustText(value: unknown): boolean {
  const normalized = zeroTrustText(value).toLowerCase().replace(/\s+/g, ' ').trim();
  return (
    !normalized ||
    normalized === 'evidence gated' ||
    normalized === 'gate mapped' ||
    normalized === 'adviser' ||
    normalized === 'advisor' ||
    /^advisers?\s+\d+$/i.test(normalized) ||
    /^advisors?\s+\d+$/i.test(normalized)
  );
}

function firstZeroTrustText(...values: unknown[]): string {
  for (const value of values) {
    const resolved = zeroTrustText(value);
    if (!isPlaceholderZeroTrustText(resolved)) return resolved;
  }
  return '';
}

function zeroTrustAdviserTitle(record: Record<string, unknown>): string {
  return firstZeroTrustText(record.desk, record.domain, record.label, record.title, record.owner, record.advisor);
}

function zeroTrustAdviserDetail(record: Record<string, unknown>): string {
  return firstZeroTrustText(record.required_answer, record.release_effect, record.detail, record.source_ref, record.question, record.evidence);
}

function renderableZeroTrustAdviserInputs(...groups: Array<Array<Record<string, unknown>>>): Array<Record<string, unknown>> {
  for (const group of groups) {
    const usable = group.filter((record) => zeroTrustAdviserTitle(record) && zeroTrustAdviserDetail(record));
    if (usable.length) return usable;
  }
  return [];
}

function ZeroTrustRouteSummary({ data }: { data?: Record<string, unknown> | null }) {
  const intake = zeroTrustRecord(data);
  if (!Object.keys(intake).length) return null;

  const evidenceStates = zeroTrustRecord(intake.evidence_states);
  const records = zeroTrustRecords(intake.records).length ? zeroTrustRecords(intake.records) : zeroTrustRecords(intake.evidence_records);
  const adviserInputs = renderableZeroTrustAdviserInputs(
    zeroTrustRecords(intake.adviser_inputs),
    zeroTrustRecords(intake.adviser_confirmations),
    zeroTrustRecords(intake.adviser_asks),
  );
  const missing = zeroTrustList(evidenceStates.missing).length
    ? zeroTrustList(evidenceStates.missing)
    : zeroTrustList(intake.missing_gates);
  const contradicted = zeroTrustList(evidenceStates.contradicted).length
    ? zeroTrustList(evidenceStates.contradicted)
    : zeroTrustList(intake.contradictions);
  const openRecordNames = records
    .filter((record) => {
      const state = String(record.evidence_state || record.state || '').toLowerCase().replace(/\s+/g, '_');
      return ['missing', 'contradicted', 'claimed', 'claimed_unverified', 'assumed'].includes(state);
    })
    .map((record) => String(record.domain || record.record || record.label || record.title || record.detail || '').trim())
    .filter(Boolean);
  const recordNames = records
    .map((record) => String(record.domain || record.record || record.label || record.title || record.detail || '').trim())
    .filter(Boolean)
    .slice(0, 6);
  const openGateNames = [...missing, ...contradicted].length ? [...missing, ...contradicted] : openRecordNames;
  const openGateCount = openGateNames.length;
  const adviserConfirmationCount = adviserInputs.length;
  const canonicalReleaseDomains = [
    'Title',
    'SDLT',
    'Source',
    'Bank',
    'Authority',
    'Family-use',
    'Fairness',
    'Decision memory',
  ];
  const releaseDomains = recordNames.length ? recordNames : canonicalReleaseDomains;
  const releaseDomainRead = releaseDomains.slice(0, 8).join(' / ');
  const openGateRead = openGateNames.slice(0, 2).join(' / ') || 'Owner assignment complete; release remains open until signed evidence is received.';

  const metrics = [
    { label: 'Release Domains', value: String(releaseDomains.length), read: releaseDomainRead },
    { label: 'Release Gate Status', value: openGateCount ? `${openGateCount} Open` : 'Evidence mapped', read: openGateRead },
    ...(adviserConfirmationCount > 0
      ? [
          {
            label: 'Adviser Confirmations',
            value: String(adviserConfirmationCount),
            read: adviserInputs
              .map((record) => zeroTrustAdviserTitle(record))
              .filter(Boolean)
              .slice(0, 4)
              .join(' / '),
          },
        ]
      : []),
  ];

  return (
    <section className="rounded-lg border border-gold/30 bg-gold/[0.035] p-4 sm:p-5">
      <div className="grid gap-5 xl:grid-cols-[1fr_1.15fr]">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-gold/80" />
            <p className="text-xs uppercase tracking-[0.22em] text-gold/80">
              {String(intake.section_label || 'Release Evidence Pack')}
            </p>
          </div>
          <h3 className="mt-3 text-lg font-semibold tracking-tight text-foreground">
            {String(intake.release_test || 'Evidence mapped; sign-off controls release')}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {typeof intake.release_boundary === 'string'
              ? intake.release_boundary
              : 'The route should not release until buyer capacity, title, duty treatment, source-of-funds, bank rails, authority, succession/fairness, adviser sign-offs, and decision memory are evidenced.'}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-md border border-border/25 bg-background/35 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground/70">{metric.label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{metric.value}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{metric.read}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function citationNumberFor(sourceId: string, citationMap?: Map<string, number>): number | null {
  if (!citationMap) return null;
  return citationMap.get(sourceId) ?? citationMap.get(sourceId.toLowerCase()) ?? null;
}

function sourceChipLabel(sourceId: string, citationMap?: Map<string, number>): string | null {
  const citationNumber = citationNumberFor(sourceId, citationMap);
  return citationNumber ? `[${citationNumber}]` : null;
}

function reportSectionById(
  sharePayload: ReleaseReadinessSharePayload | null | undefined,
  ...ids: string[]
): ReleaseReadinessShareReportSection | undefined {
  const sections = safeArray<ReleaseReadinessShareReportSection>(sharePayload?.reportSections);
  if (!sections.length) return undefined;
  const wanted = new Set(ids.map((id) => id.toLowerCase()));
  return sections.find((section) => wanted.has(String(section.id).toLowerCase()));
}

function reportCardBody(section: ReleaseReadinessShareReportSection | undefined, labelNeedle: string, fallback = ''): string {
  const needle = labelNeedle.toLowerCase();
  const card = safeArray<ReleaseReadinessShareCard>(section?.cards)
    .find((item) => routeDisplayText(item.label).toLowerCase().includes(needle));
  return routeDisplayText(card?.body || fallback);
}

function citationIdsFor(
  sharePayload: ReleaseReadinessSharePayload | null | undefined,
  matcher: RegExp,
  limit = 3,
): string[] {
  if (!sharePayload) return [];
  const ids: string[] = [];
  const seen = new Set<string>();
  const push = (id: unknown) => {
    const value = typeof id === 'string' ? id.trim() : '';
    const normalized = value.toLowerCase();
    if (!value || seen.has(normalized)) return;
    seen.add(normalized);
    ids.push(value);
  };

  safeArray<NonNullable<ReleaseReadinessSharePayload['publicSources']>[number]>(sharePayload.publicSources).forEach((source) => {
    matcher.lastIndex = 0;
    const haystack = [
      source.category,
      source.institution,
      source.title,
      source.claim,
      source.boundary,
      source.url,
    ].filter(Boolean).join(' ');
    if (matcher.test(haystack)) {
      push(source.id);
    }
  });

  return ids.slice(0, limit);
}

function InlineCitationButtons({
  ids,
  onCitationClick,
  citationMap,
}: {
  ids: string[];
  onCitationClick?: (citationId: string) => void;
  citationMap?: Map<string, number>;
}) {
  const resolvedIds = ids
    .map((sourceId) => ({
      sourceId,
      label: sourceChipLabel(sourceId, citationMap),
    }))
    .filter((item): item is { sourceId: string; label: string } => Boolean(item.label));

  if (!resolvedIds.length) return null;
  return (
    <span className="ml-2 inline-flex flex-wrap gap-1 align-baseline">
      {resolvedIds.map(({ sourceId, label }) => (
        <button
          key={sourceId}
          type="button"
          onClick={() => onCitationClick?.(sourceId)}
          className="inline-flex h-6 items-center rounded-full border border-gold/30 px-2 text-[11px] font-semibold text-gold transition hover:border-gold hover:bg-gold/10"
        >
          {label}
        </button>
      ))}
    </span>
  );
}

function ReviewerLayerNotice() {
  return (
    <section className="rounded-lg border border-border/30 bg-card/45 p-4 sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-gold/80">Reviewer layer</p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-foreground">Route view shows one selected-route intelligence surface.</h2>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Principal View is the decision surface. Route View is the adviser/reviewer layer where route selection changes tax,
          jurisdiction, carry, scenario, bank readiness, continuity, crisis resilience, and owner reads. It keeps route
          consequences in one visual path without mixing in the separate proof ledger.
        </p>
      </div>
    </section>
  );
}

function RouteDetailsDisclosure({
  label,
  title,
  body,
  children,
}: {
  label: string;
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <details className="group rounded-lg border border-border/30 bg-card/45 p-4 sm:p-5">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
        <span>
          <span className="block text-xs uppercase tracking-[0.22em] text-gold/80">{label}</span>
          <span className="mt-2 block text-lg font-semibold tracking-tight text-foreground">{title}</span>
          <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">{body}</span>
        </span>
        <span className="mt-1 rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground transition group-open:bg-foreground group-open:text-background">
          Details
        </span>
      </summary>
      <div className="mt-6 space-y-8 border-t border-border/30 pt-6">
        {children}
      </div>
    </details>
  );
}

function NativeRouteDriversPanel({
  intelligence,
  methodDrivers,
  onCitationClick,
  citationMap,
}: {
  intelligence: RouteIntelligenceV2;
  methodDrivers?: ReleaseReadinessMethodDriver[];
  onCitationClick?: (citationId: string) => void;
  citationMap?: Map<string, number>;
}) {
  const registerItems = intelligence.routeDriverRegister?.items || [];
  const fallbackItems: RouteDriverRegisterItem[] = (Array.isArray(intelligence.nativeRouteDrivers)
    ? intelligence.nativeRouteDrivers.filter((driver) => Boolean(driver && driver.trim()))
    : []
  ).map((driver, index) => ({
    id: `driver_${index + 1}`,
    title: `Route driver ${index + 1}`,
    driver,
    sourceIds: [],
    sources: [],
  }));
  const shareDriverItems: RouteDriverRegisterItem[] = safeArray<ReleaseReadinessMethodDriver>(methodDrivers).map((driver, index) => ({
    id: driver.id || `share_driver_${index + 1}`,
    title: routeDisplayText(driver.title || `Route driver ${index + 1}`),
    driver: routeDisplayText(driver.driver),
    releaseRead: routeDisplayText(driver.releaseRead),
    familyAction: routeDisplayText(driver.familyAction),
    testApplied: routeDisplayText(driver.testApplied),
    testResult: routeDisplayText(driver.testResult),
    principalInstruction: routeDisplayText(driver.principalInstruction),
    capitalConsequence: routeDisplayText(driver.capitalConsequence),
    sourceIds: safeArray<ReleaseReadinessMethodSource>(driver.sources).map((source) => source.id).filter(Boolean),
    sources: safeArray<ReleaseReadinessMethodSource>(driver.sources).map((source) => ({
      id: source.id,
      title: source.title,
      date: source.date,
      url: source.url,
      source_url: source.url,
      summary: source.summary,
      decision_posture: source.decisionPosture,
      industry: source.industry,
    })),
  }));
  const driverBase = (registerItems.length ? registerItems : fallbackItems.length ? fallbackItems : shareDriverItems).slice(0, 8);
  const visibleDrivers = driverBase.map((driver, index) => {
    const shareDriver = shareDriverItems[index];
    return {
      ...driver,
      sourceIds: driver.sourceIds?.length ? driver.sourceIds : shareDriver?.sourceIds || [],
      sources: driver.sources?.length ? driver.sources : shareDriver?.sources || [],
    };
  });
  const title = 'HNWI Drivers';

  if (!visibleDrivers.length) return null;

  return (
    <section className="border-y border-[#d8d1c4] bg-[#fbfaf6] px-4 py-7 text-[#0c1117] sm:px-6">
      <div className="grid gap-6">
        <div className="max-w-5xl">
          <div className="flex items-center gap-2">
            <Route className="h-4 w-4 text-[#a56f19]" />
            <p className="text-xs uppercase tracking-[0.28em] text-[#a56f19]">
              {title}
            </p>
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#0c1117]">
            {routeDisplayText(intelligence.nativeRouteDriverSubtitle || 'What the HNWI route intelligence changes in this move.')}
          </h2>
          {intelligence.nativeRouteDriverNote ? (
            <p className="mt-3 text-sm leading-relaxed text-[#506070]">
              {routeDisplayText(intelligence.nativeRouteDriverNote)}
            </p>
          ) : null}
        </div>

        <div className="relative">
          <div className="absolute left-[17px] top-4 hidden h-[calc(100%-2rem)] w-px bg-[#c8b68c] md:block" />
          {visibleDrivers.map((driver, index) => (
            <motion.div
              key={driver.id || `${index}-${driver.driver}`}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: Math.min(index * 0.045, 0.28) }}
              className="relative grid gap-4 border-t border-[#e4ded3] py-5 first:border-t-0 md:grid-cols-[48px_1fr_1fr]"
            >
              <div className="relative z-10">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0c1117] text-xs font-semibold text-white shadow-[0_0_0_6px_#fbfaf6]">
                  {index + 1}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#8a6b2d]">Route driver</p>
                <h3 className="mt-1 text-sm font-semibold leading-snug text-[#0c1117]">
                  {routeDisplayText(driver.familyAction || driver.title)}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#506070]">
                  {routeDisplayText(driver.testApplied || driver.driver)}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#8a6b2d]">Memo effect</p>
                <p className="mt-1 text-sm leading-relaxed text-[#506070]">{routeDisplayText(driver.testResult || driver.releaseRead)}</p>
                <p className="mt-2 text-xs font-semibold leading-relaxed text-[#0c1117]">{routeDisplayText(driver.principalInstruction || driver.capitalConsequence)}</p>
                {driver.sourceIds?.length ? (
                  <div className="mt-3">
                    <InlineCitationButtons ids={driver.sourceIds.slice(0, 4)} onCitationClick={onCitationClick} citationMap={citationMap} />
                  </div>
                ) : null}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RouteSourceRegisterPanel({
  methodDrivers,
  onCitationClick,
  citationMap,
}: {
  methodDrivers?: ReleaseReadinessMethodDriver[];
  onCitationClick?: (citationId: string) => void;
  citationMap?: Map<string, number>;
}) {
  const rows = safeArray<ReleaseReadinessMethodDriver>(methodDrivers)
    .flatMap((driver) => safeArray<ReleaseReadinessMethodSource>(driver.sources).map((source) => ({ driver, source })))
    .filter(({ source }) => Boolean(source.id || source.title))
    .slice(0, 12);

  if (!rows.length) return null;

  return (
    <section className="rounded-lg border border-[#d8d1c4] bg-[#fbfaf6] p-5 text-[#0c1117]">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[#a56f19]" />
            <p className="text-xs uppercase tracking-[0.28em] text-[#a56f19]">Source Register</p>
          </div>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-[#0c1117]">
            Route-source records stay attached to the HNWI driver they changed.
          </h3>
        </div>
        <p className="max-w-2xl text-xs leading-relaxed text-[#506070]">
          The third column carries the central citation handle only. Open the citation for source detail; Route View keeps only the driver link, source identity, and decision boundary.
        </p>
      </div>
      <div className="overflow-hidden rounded-md border border-[#d8d1c4] bg-white">
        <div className="grid gap-4 bg-[#0c1117] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white xl:grid-cols-[0.9fr_1fr_1.35fr]">
          <span>Driver</span>
          <span>Source record</span>
          <span>Central citation</span>
        </div>
        {rows.map(({ driver, source }, index) => {
          return (
            <motion.article
              key={`${driver.id}-${source.id || index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: Math.min(index * 0.035, 0.18) }}
              className="grid gap-4 border-t border-[#e4ded3] px-4 py-4 xl:grid-cols-[0.9fr_1fr_1.35fr]"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#0c1117] text-white">
                  <BookOpen className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#8a6b2d]">Driver</p>
                  <p className="mt-1 text-sm font-semibold leading-snug text-[#0c1117]">
                    {routeDisplayText(driver.title || driver.familyAction || driver.driver)}
                  </p>
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#8a6b2d]">Source record</p>
                <p className="mt-2 text-sm leading-relaxed text-[#506070]">{routeDisplayText(source.title || 'Source record')}</p>
                {source.date ? <p className="mt-2 text-xs font-semibold text-[#0c1117]">{routeDisplayText(source.date)}</p> : null}
                {source.industry ? (
                  <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-[#8a6b2d]">{routeDisplayText(source.industry)}</p>
                ) : null}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#8a6b2d]">Central citation</p>
                  <InlineCitationButtons ids={source.id ? [source.id] : []} onCitationClick={onCitationClick} citationMap={citationMap} />
                </div>
                {source.decisionPosture ? (
                  <p className="mt-2 text-xs font-semibold text-[#0c1117]">{routeDisplayText(source.decisionPosture)}</p>
                ) : null}
                <p className="mt-2 text-xs leading-relaxed text-[#506070]">
                  Citation opens the central source record.
                </p>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

function RouteSelector({
  routes,
  selectedRouteId,
  onSelect,
  label,
  copy,
}: {
  routes: RouteIntelligenceOptionV2[];
  selectedRouteId: string;
  onSelect: (routeId: string) => void;
  label: string;
  copy: string;
}) {
  const activeIndex = Math.max(0, routes.findIndex((route) => route.id === selectedRouteId));

  return (
    <div className="border-y border-[#d8d1c4] bg-[#fbfaf6] px-4 py-7 text-[#0c1117] sm:px-6">
      <div className="grid gap-6">
        <div className="grid gap-4 xl:grid-cols-[0.78fr_1.22fr] xl:items-end">
          <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.28em] text-[#a56f19]">Decision Route Selector</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#0c1117]">{label}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#506070]">
            {copy}
          </p>
        </div>
            <div className="rounded-md border border-[#d8d1c4] bg-white p-3 text-xs leading-relaxed text-[#506070]">
              Select a route to change the route intelligence below: metrics, scenario economics, tax/legal read, banking rail, G1/G2/G3 consequence, crisis response, anti-fragility, responsibility transfer, and counsel questions.
            </div>
        </div>
        <div className="relative min-h-[230px] overflow-hidden py-4" role="tablist" aria-label="Decision routes">
          <svg className="pointer-events-none absolute inset-x-4 top-[24px] hidden h-16 w-[calc(100%-2rem)] md:block" viewBox="0 0 1000 80" preserveAspectRatio="none" aria-hidden="true">
            <path d="M20 42 C 220 10, 360 72, 520 42 S 790 10, 980 42" fill="none" stroke="#c8b68c" strokeWidth="2" strokeDasharray="7 9" />
            <motion.path
              d="M20 42 C 220 10, 360 72, 520 42 S 790 10, 980 42"
              fill="none"
              stroke="#0c1117"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: routes.length > 1 ? (activeIndex + 1) / routes.length : 1 }}
              transition={{ duration: 0.55 }}
            />
          </svg>
          <div className="grid gap-3 md:grid-cols-5 md:items-start">
          {routes.map((route) => {
            const active = route.id === selectedRouteId;
            const Icon = routeSelectorIcon(route);
            return (
              <button
                key={route.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onSelect(route.id)}
                className={`group relative grid min-h-[176px] content-start gap-3 rounded-none border-x-0 border-y px-1 py-2 text-left transition md:border-y-0 md:px-2 ${
                  active
                    ? 'border-[#0c1117] text-[#0c1117]'
                    : 'border-[#e4ded3] text-[#506070] hover:text-[#0c1117]'
                }`}
              >
                <div className="flex items-center gap-3 md:block">
                  <span className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border ${
                    active ? 'border-[#0c1117] bg-[#0c1117] text-white shadow-[0_0_0_8px_#fbfaf6]' : 'border-[#d8d1c4] bg-[#f5f1e9] text-[#506070]'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8a6b2d]">
                    R{route.rank}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8a6b2d]">{releaseRuleDisplay(route.releaseRule)}</p>
                  <p className="mt-1 text-sm font-semibold leading-snug text-[#0c1117]">{routeDisplayText(route.routeName)}</p>
                </div>
                <div className="mt-auto grid grid-cols-2 gap-2 border-t border-[#e4ded3] pt-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-[#8a6b2d]">Duty</p>
                    <p className="mt-1 text-sm font-semibold text-[#0c1117]">{routeDutyDragValue(route)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-[#8a6b2d]">Capital</p>
                    <p className="mt-1 text-sm font-semibold text-[#0c1117]">{metricValue(route)}</p>
                  </div>
                </div>
              </button>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
}

function RouteComparison({ routes, selectedRouteId, onSelect }: {
  routes: RouteIntelligenceOptionV2[];
  selectedRouteId: string;
  onSelect: (routeId: string) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      {routes.map((route) => {
        const active = route.id === selectedRouteId;
        return (
          <button
            key={route.id}
            type="button"
            onClick={() => onSelect(route.id)}
            className={`rounded-lg border p-4 text-left transition ${
              active
                ? 'border-gold/60 bg-gold/[0.06]'
                : 'border-border/25 bg-card/35 hover:border-border/60'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                  active ? 'border-gold/60 bg-gold/10 text-gold' : 'border-border/35 bg-background/30 text-muted-foreground'
                }`}>
                  <Route className="h-4 w-4" />
                </span>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">Route {route.rank}</p>
              </div>
              <span className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${releaseTone(route)}`}>
                {releaseRuleDisplay(route.releaseRule)}
              </span>
            </div>
            <h3 className="mt-3 text-sm font-medium leading-snug text-foreground">{routeDisplayText(route.routeName)}</h3>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{routeDisplayText(route.routeType)}</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="uppercase tracking-[0.18em] text-muted-foreground/60">Duties</p>
                <p className="mt-1 font-medium text-foreground">{routeDutiesValue(route)}</p>
              </div>
              <div>
                <p className="uppercase tracking-[0.18em] text-muted-foreground/60">Drag</p>
                <p className="mt-1 font-medium text-foreground">{routeDutyDragValue(route)}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function RouteDecisionGraph({
  routes,
  selectedRouteId,
}: {
  routes: RouteIntelligenceOptionV2[];
  selectedRouteId: string;
}) {
  const rows = routes.map((route) => {
    const allIn = isOutcomeOnlyRoute(route) ? 0 : route.metrics.totalAcquisitionCostUsd;
    const duties = isOutcomeOnlyRoute(route) ? 0 : route.metrics.totalDutiesUsd;
    const carry = isOutcomeOnlyRoute(route) ? 0 : route.metrics.annualCarryingCostUsd;
    return { route, allIn, duties, carry };
  });
  const maxValue = Math.max(1, ...rows.flatMap((row) => [row.allIn, row.duties, row.carry]));
  const colors = {
    allIn: '#b88724',
    duties: '#8f1d32',
    carry: '#334155',
  };
  const metrics = [
    { key: 'allIn', label: 'All-in', color: colors.allIn },
    { key: 'duties', label: 'Duties', color: colors.duties },
    { key: 'carry', label: 'Annual carry', color: colors.carry },
  ] as const;
  const chartWidth = 980;
  const chartHeight = 360;
  const margin = { top: 30, right: 42, bottom: 88, left: 86 };
  const plotWidth = chartWidth - margin.left - margin.right;
  const plotHeight = chartHeight - margin.top - margin.bottom;
  const slot = plotWidth / Math.max(rows.length, 1);
  const barWidth = Math.min(28, Math.max(14, slot * 0.18));
  const yFor = (value: number) => margin.top + plotHeight - (Math.max(0, value) / maxValue) * plotHeight;
  const xFor = (index: number) => margin.left + slot * index + slot / 2;

  if (!rows.length) return null;

  return (
    <div className="border-y border-[#d8d1c4] bg-[#fbfaf6] px-4 py-7 text-[#0c1117] sm:px-6">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[#a56f19]">Decision Routes Graph</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-[#0c1117]">
            Route economics change before the memo text changes.
          </h3>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-[#506070]">
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors.allIn }} /> All-in</span>
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors.duties }} /> Duties</span>
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors.carry }} /> Annual carry</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <motion.svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="min-h-[340px] min-w-[840px] overflow-visible"
          role="img"
          aria-label="Route economics grouped bar graph"
        >
          <rect x="0" y="0" width={chartWidth} height={chartHeight} rx="0" fill="#fbfaf6" />
          {[0, 0.5, 1].map((ratio) => {
            const value = maxValue * ratio;
            const y = yFor(value);
            return (
              <g key={`grid-${ratio}`}>
                <line x1={margin.left} x2={chartWidth - margin.right} y1={y} y2={y} stroke="#d8d1c4" strokeDasharray={ratio === 0 ? '0' : '6 9'} opacity={0.74} />
                <text x={margin.left - 12} y={y + 4} textAnchor="end" fontSize="13" fill="#506070">
                  {ratio === 0 ? '0' : formatUsdCompact(value)}
                </text>
              </g>
            );
          })}
          <line x1={margin.left} x2={chartWidth - margin.right} y1={margin.top + plotHeight} y2={margin.top + plotHeight} stroke="#0c1117" strokeWidth="1.4" />
          {rows.map((row, index) => {
            const centerX = xFor(index);
            const active = row.route.id === selectedRouteId;
            return (
              <g key={row.route.id}>
                {active ? (
                  <motion.line
                    x1={centerX}
                    x2={centerX}
                    y1={margin.top - 8}
                    y2={margin.top + plotHeight + 28}
                    stroke="#b88724"
                    strokeWidth="2"
                    strokeDasharray="7 8"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.9 }}
                    transition={{ duration: 0.45 }}
                  />
                ) : null}
                {metrics.map((metric, metricIndex) => {
                  const value = row[metric.key];
                  const y = yFor(value);
                  const height = margin.top + plotHeight - y;
                  const x = centerX + (metricIndex - 1) * (barWidth + 5) - barWidth / 2;
                  return (
                    <g key={`${row.route.id}-${metric.key}`}>
                      <motion.rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={Math.max(2, height)}
                        rx="4"
                        fill={metric.color}
                        initial={{ opacity: 0, scaleY: 0.05 }}
                        animate={{ opacity: value > 0 ? 1 : 0.35, scaleY: 1 }}
                        transition={{ duration: 0.65, delay: 0.06 + index * 0.05 + metricIndex * 0.04 }}
                        style={{ transformBox: 'fill-box', transformOrigin: 'center bottom' }}
                      />
                      {value > 0 && metric.key === 'allIn' ? (
                        <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" fontSize="12" fontWeight="700" fill="#0c1117">
                          {formatUsdCompact(value)}
                        </text>
                      ) : null}
                    </g>
                  );
                })}
                <text x={centerX} y={chartHeight - 50} textAnchor="middle" fontSize="17" fontWeight="700" fill={active ? '#b88724' : '#0c1117'}>
                  R{row.route.rank}
                </text>
                <text x={centerX} y={chartHeight - 29} textAnchor="middle" fontSize="12" fill="#506070">
                  {isOutcomeOnlyRoute(row.route) ? 'No purchase' : routeDutyDragValue(row.route)}
                </text>
                <text x={centerX} y={chartHeight - 12} textAnchor="middle" fontSize="10" fill="#8a6b2d" letterSpacing="1.4">
                  {releaseRuleDisplay(row.route.releaseRule).toUpperCase()}
                </text>
              </g>
            );
          })}
        </motion.svg>
      </div>
    </div>
  );
}

function MetricStrip({ route }: { route: RouteIntelligenceOptionV2 }) {
  const acquisitionAudit = (route.taxAudit?.acquisition_audit ?? {}) as Record<string, unknown>;
  const primaryFeeLabel = typeof acquisitionAudit.primary_fee_label === 'string' ? acquisitionAudit.primary_fee_label : 'Primary duty';
  const secondaryFeeLabel = typeof acquisitionAudit.secondary_fee_label === 'string' ? acquisitionAudit.secondary_fee_label : 'secondary duty';
  const releaseRule = releaseRuleDisplay(route.releaseRule);
  const metrics = [
    { icon: Calculator, label: metricLabel(route), value: metricValue(route), read: route.metrics.mitigationTimeline },
    {
      icon: Banknote,
      label: 'Total Duties',
      value: routeDutiesValue(route),
      read: isOutcomeOnlyRoute(route)
        ? 'No purchase duty is incurred while capital remains held or stopped.'
        : `${primaryFeeLabel} + ${secondaryFeeLabel} impact for the selected buyer route.`,
    },
    {
      icon: AlertTriangle,
      label: 'Duty Drag',
      value: routeDutyDragValue(route),
      read: isOutcomeOnlyRoute(route)
        ? 'Duty drag is avoided because no purchase route is released.'
        : 'Non-recoverable duty as percentage of property value.',
    },
    {
      icon: TimerReset,
      label: 'Mitigation Timeline',
      value: releaseRule === 'Approved to negotiate' ? '72h / 7d' : isOutcomeOnlyRoute(route) ? releaseRule : 'Sign-off controlled',
      read: route.metrics.dataQuality,
    },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="rounded-lg border border-[#d8d1c4] bg-[#fbfaf6] p-4 text-[#0c1117]">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-[#a56f19]" />
              <p className="text-xs uppercase tracking-[0.2em] text-[#a56f19]">{item.label}</p>
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-[#0c1117]">{routeDisplayText(item.value)}</p>
            <p className="mt-2 text-xs leading-relaxed text-[#506070]">{routeDisplayText(item.read)}</p>
          </div>
        );
      })}
    </div>
  );
}

function RouteShareCard({ card }: { card: ReleaseReadinessShareCard }) {
  return (
    <article className="min-w-0 rounded-lg border border-[#d8d1c4] bg-[#fbfaf6] p-4 text-[#0c1117]">
      <p className="break-words text-xs uppercase tracking-[0.22em] text-[#a56f19]">
        {routeDisplayText(card.label)}
      </p>
      {card.value ? <p className="mt-3 text-xl font-semibold text-[#0c1117]">{routeDisplayText(card.value)}</p> : null}
      {card.title ? <h3 className="mt-3 text-base font-semibold leading-snug text-[#0c1117]">{routeDisplayText(card.title)}</h3> : null}
      {card.body ? <p className="mt-3 text-sm leading-relaxed text-[#506070]">{routeDisplayText(card.body)}</p> : null}
      {card.status ? <p className="mt-3 text-sm font-semibold text-[#a56f19]">{routeDisplayText(card.status)}</p> : null}
      {card.owner ? <p className="mt-3 text-sm font-semibold text-[#0c1117]">{routeDisplayText(card.owner)}</p> : null}
      {card.releaseCondition ? (
        <p className="mt-3 border-t border-[#e4ded3] pt-3 text-xs leading-relaxed text-[#506070]">
          <span className="font-semibold text-[#0c1117]">Release condition:</span> {routeDisplayText(card.releaseCondition)}
        </p>
      ) : null}
    </article>
  );
}

const infographicPalette = [
  { border: 'border-[#d89f18]/35', bg: 'bg-[#d89f18]/[0.055]', text: 'text-[#d89f18]', dot: '#d89f18' },
  { border: 'border-[#047857]/35', bg: 'bg-[#047857]/[0.055]', text: 'text-[#047857]', dot: '#047857' },
  { border: 'border-[#1d4ed8]/35', bg: 'bg-[#1d4ed8]/[0.055]', text: 'text-[#1d4ed8]', dot: '#1d4ed8' },
  { border: 'border-[#be123c]/35', bg: 'bg-[#be123c]/[0.055]', text: 'text-[#be123c]', dot: '#be123c' },
] as const;

function RouteShareTable({ table }: { table: NonNullable<ReleaseReadinessShareReportSection['table']> }) {
  const columns = safeArray<string>(table.columns);
  const rows = safeArray<string[]>(table.rows);
  if (!rows.length) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-[#d8d1c4] bg-white text-[#0c1117]">
      <div
        className="grid gap-4 bg-[#0c1117] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white"
        style={{ gridTemplateColumns: `minmax(150px, 0.85fr) repeat(${Math.min(Math.max(columns.length - 1, 1), 3)}, minmax(150px, 1fr))` }}
      >
        {(columns.length ? columns : ['Item', 'Read', 'Owner', 'Gate']).slice(0, 4).map((column) => (
          <span key={column}>{routeDisplayText(column)}</span>
        ))}
      </div>
      {rows.map((row, rowIndex) => {
        const title = routeDisplayText(row[0] || `Item ${rowIndex + 1}`);
        const detailCells = row.slice(1).map((cell, index) => ({
          label: routeDisplayText(columns[index + 1] || `Point ${index + 1}`),
          value: routeDisplayText(cell),
        })).filter((cell) => cell.value);

        return (
          <motion.div
            key={`${row.join('|')}-${rowIndex}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: Math.min(rowIndex * 0.035, 0.18) }}
            className="grid gap-4 border-t border-[#e4ded3] px-4 py-4"
            style={{ gridTemplateColumns: `minmax(150px, 0.85fr) repeat(${Math.min(Math.max(detailCells.length, 1), 3)}, minmax(150px, 1fr))` }}
          >
            <div className="flex min-w-0 items-start gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#b88724] text-xs font-semibold text-white">
                {rowIndex + 1}
              </span>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#8a6b2d]">
                  {routeDisplayText(columns[0] || 'Decision item')}
                </p>
                <h4 className="mt-1 text-sm font-semibold leading-snug text-[#0c1117]">{title}</h4>
              </div>
            </div>
            {detailCells.slice(0, 3).map((cell, cellIndex) => (
              <div key={`${cell.label}-${cellIndex}`} className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8a6b2d]">
                  {cell.label}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-[#506070]">{cell.value}</p>
              </div>
            ))}
          </motion.div>
        );
      })}
    </div>
  );
}

function RouteShareSectionPanel({
  section,
  citationIds,
  onCitationClick,
  citationMap,
  cardLimit,
}: {
  section?: ReleaseReadinessShareReportSection;
  citationIds: string[];
  onCitationClick?: (citationId: string) => void;
  citationMap?: Map<string, number>;
  cardLimit?: number;
}) {
  if (!section) return null;
  const sectionCards = safeArray<ReleaseReadinessShareCard>(section.cards);
  const cards = cardLimit ? sectionCards.slice(0, cardLimit) : sectionCards;
  const bullets = safeArray<string>(section.bullets);

  return (
    <section>
      <SectionHeader label={section.eyebrow} title={section.title} />
      <div className="space-y-5">
        {section.intro ? (
          <p className="max-w-5xl text-sm leading-relaxed text-muted-foreground">
            {routeDisplayText(section.intro)}
            <InlineCitationButtons ids={citationIds} onCitationClick={onCitationClick} citationMap={citationMap} />
          </p>
        ) : null}
        {cards?.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {cards.map((card, index) => (
              <RouteShareCard key={`${section.id}-card-${index}`} card={card} />
            ))}
          </div>
        ) : null}
        {section.table ? <RouteShareTable table={section.table} /> : null}
        {bullets.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {bullets.map((bullet, index) => (
              <p key={`${section.id}-bullet-${index}`} className="rounded-lg border border-border/20 bg-card/35 p-4 text-sm leading-relaxed text-muted-foreground">
                {routeDisplayText(bullet)}
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function DecisionMemoTreePanel({
  section,
  citationIds,
  onCitationClick,
  citationMap,
}: {
  section?: ReleaseReadinessShareReportSection;
  citationIds: string[];
  onCitationClick?: (citationId: string) => void;
  citationMap?: Map<string, number>;
}) {
  const rows = safeArray<string[]>(section?.table?.rows);
  if (!section || !rows.length) return null;

  const branchIcon = (branch: string) => {
    const value = routeDisplayText(branch).toLowerCase();
    if (/stop/.test(value)) return OctagonX;
    if (/hold/.test(value)) return PauseCircle;
    return CheckCircle2;
  };
  const visibleRows = rows.slice(0, 6);
  const diagramWidth = 960;
  const diagramHeight = 260;
  const root = { x: 112, y: 128 };
  const nodePosition = (index: number) => {
    const count = Math.max(visibleRows.length, 1);
    const x = 310 + index * ((diagramWidth - 380) / Math.max(count - 1, 1));
    const wave = index % 2 === 0 ? -44 : 44;
    return { x, y: root.y + wave };
  };

  return (
    <section className="border-y border-[#d8d1c4] bg-[#fbfaf6] px-4 py-7 text-[#0c1117] sm:px-6">
      <div className="mb-5 grid gap-4 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-[#a56f19]" />
            <p className="text-xs uppercase tracking-[0.28em] text-[#a56f19]">Decision Memo Tree</p>
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#0c1117]">
            {routeDisplayText(section.title)}
          </h2>
        </div>
        {section.intro ? (
          <p className="text-sm leading-relaxed text-[#506070]">
            {routeDisplayText(section.intro)}
            <InlineCitationButtons ids={citationIds} onCitationClick={onCitationClick} citationMap={citationMap} />
          </p>
        ) : null}
      </div>
      <div className="overflow-x-auto">
        <motion.svg
          viewBox={`0 0 ${diagramWidth} ${diagramHeight}`}
          className="min-h-[250px] min-w-[820px] overflow-visible"
          role="img"
          aria-label="Decision memo route tree"
        >
          <rect width={diagramWidth} height={diagramHeight} fill="#fbfaf6" />
          <circle cx={root.x} cy={root.y} r="38" fill="#0c1117" />
          <text x={root.x} y={root.y - 5} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff" letterSpacing="1.6">
            FAMILY
          </text>
          <text x={root.x} y={root.y + 13} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff" letterSpacing="1.6">
            ACTION
          </text>
          {visibleRows.map((row, index) => {
            const position = nodePosition(index);
            const Icon = branchIcon(row[0] || '');
            const branch = routeDisplayText(row[0]);
            return (
              <g key={`${row.join('|')}-${index}`}>
                <motion.path
                  d={`M${root.x + 40} ${root.y} C ${position.x - 150} ${root.y}, ${position.x - 130} ${position.y}, ${position.x - 48} ${position.y}`}
                  fill="none"
                  stroke="#c8b68c"
                  strokeWidth="2"
                  strokeDasharray="7 8"
                  initial={{ pathLength: 0, opacity: 0.2 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.55, delay: index * 0.06 }}
                />
                <motion.circle
                  cx={position.x}
                  cy={position.y}
                  r="28"
                  fill={/stop/i.test(branch) ? '#8f1d32' : /hold/i.test(branch) ? '#b88724' : '#047857'}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.35, delay: 0.12 + index * 0.05 }}
                />
                <foreignObject x={position.x - 12} y={position.y - 12} width="24" height="24">
                  <div className="flex h-6 w-6 items-center justify-center text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </motion.svg>
      </div>
      <div className="mt-5 grid gap-0 border-t border-[#d8d1c4]">
        {visibleRows.map((row, index) => {
          const Icon = branchIcon(row[0] || '');
          return (
            <motion.article
              key={`${row.join('|')}-${index}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="grid gap-3 border-b border-[#e4ded3] py-4 md:grid-cols-[56px_0.8fr_1fr_1fr]"
            >
              <div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0c1117] text-white">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#8a6b2d]">Branch</p>
                <h3 className="mt-1 text-base font-semibold leading-snug text-[#0c1117]">{routeDisplayText(row[0])}</h3>
              </div>
              <p className="text-sm leading-relaxed text-[#506070]"><span className="font-semibold text-[#0c1117]">Condition:</span> {routeDisplayText(row[1])}</p>
              <div className="text-sm leading-relaxed text-[#506070]">
                <p><span className="font-semibold text-[#0c1117]">Consequence:</span> {routeDisplayText(row[2])}</p>
                <p className="mt-2"><span className="font-semibold text-[#0c1117]">Verdict:</span> {routeDisplayText(row[3])}</p>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

function SpineObjectCards({
  title,
  record,
  limit = 6,
}: {
  title: string;
  record: unknown;
  limit?: number;
}) {
  const entries = recordEntries(record)
    .filter(([, value]) => !Array.isArray(value) && typeof value !== 'object')
    .slice(0, limit);
  if (!entries.length) return null;

  return (
    <div>
      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold/70">{routeDisplayText(title)}</p>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {entries.map(([key, value]) => (
          <article key={key} className="rounded-md border border-border/25 bg-background/35 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground/70">{labelFromKey(key)}</p>
            <p className="mt-3 text-sm leading-relaxed text-foreground">{routeDisplayText(String(value))}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function SpineRowTable({
  title,
  rows,
  preferredColumns,
  limit = 8,
}: {
  title: string;
  rows: unknown;
  preferredColumns?: string[];
  limit?: number;
}) {
  const records = safeArray<Record<string, unknown>>(rows).filter((row) => row && typeof row === 'object').slice(0, limit);
  if (!records.length) return null;
  const columns = (preferredColumns?.length ? preferredColumns : Object.keys(records[0] || {}))
    .filter((column) => records.some((row) => row[column] !== undefined && row[column] !== null && String(row[column]).trim() !== ''))
    .slice(0, 5);
  if (!columns.length) return null;

  return (
    <div>
      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold/70">{routeDisplayText(title)}</p>
      <RouteShareTable
        table={{
          columns: columns.map(labelFromKey),
          rows: records.map((row) => columns.map((column) => routeDisplayText(String(row[column] ?? '')))),
        }}
      />
    </div>
  );
}

function SpineBulletGrid({
  title,
  items,
  limit = 8,
}: {
  title: string;
  items: unknown;
  limit?: number;
}) {
  const bullets = safeArray<unknown>(items)
    .map((item) => routeDisplayText(typeof item === 'string' ? item : JSON.stringify(item)))
    .filter(Boolean)
    .slice(0, limit);
  if (!bullets.length) return null;

  return (
    <div>
      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold/70">{routeDisplayText(title)}</p>
      <div className="grid gap-3 md:grid-cols-2">
        {bullets.map((item, index) => (
          <p key={`${title}-${index}`} className="rounded-md border border-border/25 bg-background/35 p-4 text-sm leading-relaxed text-muted-foreground">
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function OperationalChainSummary({ operational }: { operational: Record<string, unknown> }) {
  const informationFlowCount = safeArray<unknown>(operational.informationFlow).length;
  const responsibilityCount = safeArray<unknown>(operational.responsibilityTransfer).length;
  const mismatchCount = safeArray<unknown>(operational.recordMismatch).length;
  const decisionMemory = safeRecord(operational.decisionMemory);
  const cards = [
    {
      label: 'Information flow',
      value: `${informationFlowCount} lanes`,
      read: 'Reports, recipients, cadence, owners, and failure signals are mapped before release.',
    },
    {
      label: 'Responsibility transfer',
      value: `${responsibilityCount} lanes`,
      read: 'See, stop, sign, move, retrieve, and explain rights stay owner-assigned.',
    },
    {
      label: 'Record mismatch',
      value: `${mismatchCount} lanes`,
      read: 'Cash, title, tax, bank, reporting, and authority records must reconcile.',
    },
    {
      label: 'Decision memory',
      value: routeDisplayText(String(decisionMemory.owner || 'Owner mapped')),
      read: routeDisplayText(String(decisionMemory.why_recorded || decisionMemory.whyRecorded || 'The route must remain retrievable after the original decision room changes.')),
    },
  ];

  if (!informationFlowCount && !responsibilityCount && !mismatchCount && !Object.keys(decisionMemory).length) return null;

  return (
    <div>
      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold/70">Operational Chain Readiness</p>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-md border border-border/25 bg-background/35 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground/70">{card.label}</p>
            <p className="mt-3 text-lg font-semibold tracking-tight text-foreground">{card.value}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{card.read}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function RouteMemoSpinePanel({ intelligence }: { intelligence: RouteIntelligenceV2 }) {
  const spine = safeRecord(intelligence.routeMemoSpine);
  if (!Object.keys(spine).length) return null;

  const operational = safeRecord(spine.operationalChain);
  const trust = safeRecord(spine.trustBoundary);
  const gates = safeRecord(spine.gateStandards);
  const family = safeRecord(spine.familyReadiness);
  const assumptions = safeRecord(spine.assumptionsAndFailures);
  const crisis = safeRecord(spine.crisisAndContinuity);

  return (
    <section className="rounded-lg border border-gold/25 bg-card/40 p-4 sm:p-6">
      <div className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-gold/80">Full Linear Route Spine</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
            Operational, evidence, control, family, and execution rails restored inside Route View.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            This is the memo spine behind the selected route: movement proof, gate evidence, information flow, source boundary, capital flow, failure modes, family consequences, and implementation order.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <SpineObjectCards title="Capital flow readiness" record={spine.capitalFlow} limit={4} />
          <SpineObjectCards title="Mechanical control classifier" record={spine.mechanicalControl} limit={4} />
        </div>
      </div>

      <div className="mt-6 space-y-7">
        <OperationalChainSummary operational={operational} />
        <SpineObjectCards title="Operational chain readiness" record={operational.readiness} />
        <SpineRowTable
          title="Information flow and report circulation"
          rows={operational.informationFlow}
          preferredColumns={['report', 'recipients', 'source', 'cadence', 'failure_signal', 'release_relevance', 'owner']}
          limit={8}
        />
        <SpineObjectCards title="Trust boundary and source authority" record={trust.transparency} />
        <SpineRowTable
          title="Gate evidence standards and implementation order"
          rows={gates.executionSequence}
          preferredColumns={['step', 'title', 'action', 'owner', 'timeline', 'release_gate', 'whyThisOrder']}
          limit={9}
        />
        <SpineBulletGrid title="Abort triggers" items={gates.abortTriggers} />
        <SpineRowTable
          title="Due diligence control checklist"
          rows={spine.dueDiligenceChecklist}
          preferredColumns={['evidence', 'owner', 'release_status', 'why_it_matters', 'priority', 'timeline']}
          limit={10}
        />
        <SpineRowTable
          title="Failure mode register"
          rows={assumptions.failureModes}
          preferredColumns={['mode', 'severity', 'consequence', 'mitigation']}
          limit={8}
        />
        <SpineBulletGrid title="Live family consequences" items={family.consequences} />
        <SpineRowTable
          title="Crisis resilience stress test"
          rows={crisis.crisisResilienceStressTest}
          preferredColumns={['stress_event', 'control', 'release_test', 'owner', 'decision_window_days']}
          limit={8}
        />
      </div>
    </section>
  );
}

function RouteContinuityDeepDive({
  route,
  section,
  citationIds,
  onCitationClick,
  citationMap,
}: {
  route: RouteIntelligenceOptionV2;
  section?: ReleaseReadinessShareReportSection;
  citationIds: string[];
  onCitationClick?: (citationId: string) => void;
  citationMap?: Map<string, number>;
}) {
  const retainedAfterDutyUsd = Math.max(route.metrics.propertyValueUsd - route.metrics.totalDutiesUsd, 0);
  const title = section?.title || 'The house should transfer responsibility before it transfers symbolism';
  const intro =
    section?.intro ||
    'Use, carry, veto, fairness, sale/refinance, and future explanation must be written before the asset becomes a family expectation.';
  const sectionRows = safeArray<string[]>(section?.table?.rows);
  const sectionColumns = safeArray<string>(section?.table?.columns);
  const continuityRows = sectionRows.length
    ? sectionRows
    : [
        [
          'Principal authority',
          'Seller timing or adviser momentum can become commitment before the principal stop right is retrievable.',
          'Principal + family-office operator',
          'Approval, stop, signing, reporting, and retrieval rights are written.',
        ],
        [
          'Named family-use boundary',
          'Repeated use can become implied entitlement, carry ambiguity, or later sale/refinance conflict.',
          'Family office + property operator',
          'Use, carry, security, guest, sale/refinance, and escalation rules are written.',
        ],
        [
          'Family-fairness record',
          'The house can become a visible benefit without a recorded fairness owner or future-beneficiary treatment.',
          'Family-fairness owner + succession counsel',
          'Fairness owner, veto position, and future-beneficiary treatment are recorded.',
        ],
        [
          'Next-generation decision record',
          'A later reader cannot explain why the route advanced, held, or stopped without relying on memory.',
          'Family-office operator / CFO',
          'Decision record, source anchors, blockers, retrieval owner, and explanation packet are indexed.',
        ],
      ];
  const gateNames = safeArray<RouteEvidenceGate>((route as { evidenceGates?: unknown }).evidenceGates)
    .map((gate) => routeDisplayText(gate.gate))
    .filter((gate) => /authority|family|succession|fairness|decision|carry|use|title|bank|source/i.test(gate))
    .slice(0, 8);

  const releaseChain = [
    {
      label: 'G1 Route Control',
      value: 'Signed gate controls release',
      body:
        'Principal authority remains intact only if approval, stop, signing, reporting, retrieval, and escalation rights are written before bid release.',
    },
    {
      label: 'G1 -> G2 Retained Value',
      value: formatUsdCompact(retainedAfterDutyUsd),
      body: isOutcomeOnlyRoute(route)
        ? 'Capital remains outside the purchase route while family-use entitlement, carry, authority, and stop rights are reworked.'
        : `Route value after ${routeDutiesValue(route)} duty drag, before annual carry and any family-use entitlement is allowed to harden.`,
    },
    {
      label: 'G2 Use Boundary',
      value: 'Use is not ownership',
      body:
        'The named family user receives use only. Title, beneficial ownership, signing authority, sale right, refinance right, and carry entitlement remain blocked unless written.',
    },
    {
      label: 'G2 -> G3 Decision Memory',
      value: 'Record before close',
      body:
        'The next-generation record must explain purpose, cost, rights, veto, carry, blocked assumptions, and why the route advanced or held.',
    },
  ];

  const successionMap = [
    {
      layer: 'Principal capacity changes before exchange',
      consequence:
        'The purchase can lose stop authority, bank signer clarity, and counsel instruction control while seller timing continues.',
      releaseRecord:
        'Authority minute naming approver, stop owner, signer, alternate signer, retrieval owner, and adviser-instruction owner.',
    },
    {
      layer: 'Use rights become informal',
      consequence:
        'Repeated occupation can become a family promise without matching title, tax, carry, guest, security, or exit rules.',
      releaseRecord:
        'Family-use schedule covering occupants, guests, security access, costs, maintenance, sale/refinance permissions, and escalation.',
    },
    {
      layer: 'Fairness remains implied',
      consequence:
        'One family-use asset can create later equivalence, notice, veto, or future-beneficiary conflict.',
      releaseRecord:
        'Family-fairness minute naming fairness owner, treatment of non-users, veto position, and next-generation explanation.',
    },
    {
      layer: 'Decision memory is not retrievable',
      consequence:
        'A later office cannot explain why the house accepted duty drag, annual carry, and restricted liquidity.',
      releaseRecord:
        'Decision packet with source anchors, signed gates, capital basis, route alternatives, blockers, and retrieval location.',
    },
  ];

  const roleReads = [
    {
      role: 'Principal',
      legalTax: 'Buyer profile, SDLT posture, stop rights, signer authority, and incapacity alternate path must be signed before exchange.',
      governance: 'Controls approval, stop, adviser instruction, reporting cadence, and decision-record owner.',
      educationResidence:
        'Education and residence claims stay separate gates; they do not create purchase authority by themselves.',
    },
    {
      role: 'Named family user',
      legalTax: 'Use does not create title, beneficial ownership, sale right, refinance right, or carry entitlement unless written.',
      governance: 'Receives access under written use, guest, security, carry, escalation, and exit rules.',
      educationResidence:
        'School, guardian, residence, day-count, and immigration facts remain counsel-led evidence gates.',
    },
    {
      role: 'Family-fairness owner',
      legalTax: 'Reviews whether use, notice, funding, and future-beneficiary treatment create later tax or estate friction.',
      governance: 'Owns fairness minute, veto position, non-user treatment, and next-generation explanation.',
      educationResidence:
        'Keeps family-purpose claims separate from entitlement, inheritance, or informal promise language.',
    },
    {
      role: 'Family-office operator / CFO',
      legalTax: 'Maintains title, tax, bank, source, carry, insurance, and decision-memory retrieval file.',
      governance: 'Ensures the office can explain the decision without founder memory or adviser fragments.',
      educationResidence:
        'Indexes residence, education, and use evidence as gates, not as narrative support.',
    },
  ];

  return (
    <section className="rounded-lg border border-gold/25 bg-card/40 p-4 sm:p-6">
      <div className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-gold/80">G1 / G2 / G3 continuity chain</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
            {routeDisplayText(title)}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {routeDisplayText(intro)}
            <InlineCitationButtons ids={citationIds} onCitationClick={onCitationClick} citationMap={citationMap} />
          </p>
          <div className="mt-5 rounded-md border border-border/25 bg-background/35 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground/70">Top succession trigger</p>
            <p className="mt-3 text-sm leading-relaxed text-foreground">
              If the principal, source-bank lead, UK counsel, or family-office operator is unavailable before option, exchange, or completion, the route should not depend on memory, adviser fragments, or informal family consent.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gold/90">
              Release only when authority, use, fairness, veto, carry, and decision-memory records are signed and retrievable.
            </p>
          </div>
        </div>

        <div className="grid min-w-0 gap-3 md:grid-cols-2">
          {releaseChain.map((item) => (
            <article key={item.label} className="rounded-md border border-border/25 bg-background/35 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground/70">{item.label}</p>
              <p className="mt-3 text-xl font-semibold tracking-tight text-foreground">{item.value}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold/70">Succession compatibility and loss map</p>
        <RouteShareTable
          table={{
            columns: ['Succession layer', 'Loss if unresolved', 'Recorded release file'],
            rows: successionMap.map((row) => [row.layer, row.consequence, row.releaseRecord]),
          }}
        />
      </div>

      <div className="mt-6">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold/70">Heir-by-heir legal, tax, governance, and education read</p>
        <div className="grid gap-3 lg:grid-cols-2">
          {roleReads.map((row) => (
            <article key={row.role} className="rounded-md border border-border/25 bg-background/35 p-4">
              <h3 className="text-base font-semibold text-foreground">{row.role}</h3>
              <div className="mt-4 space-y-3 text-sm leading-relaxed">
                <p className="text-muted-foreground"><span className="font-semibold text-foreground/85">Legal / tax:</span> {row.legalTax}</p>
                <p className="text-muted-foreground"><span className="font-semibold text-foreground/85">Governance:</span> {row.governance}</p>
                <p className="text-muted-foreground"><span className="font-semibold text-foreground/85">Education / residence:</span> {row.educationResidence}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.95fr]">
        <div className="rounded-md border border-amber-500/20 bg-amber-500/[0.035] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-amber-500/80">Third generation problem</p>
          <p className="mt-3 text-sm leading-relaxed text-foreground">
            The asset can outlive the people who remember why it was bought. If the route is not written, the next generation inherits duty drag, carry burden, use ambiguity, and fairness questions without the original decision logic.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            The recorded file is not decorative: purpose, approved route, rejected routes, capital basis, annual carry owner, veto position, family-use boundary, and retrieval location must be signed before close.
          </p>
        </div>
        <div className="rounded-md border border-border/25 bg-background/35 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground/70">Release gates tied to continuity</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(gateNames.length
              ? gateNames
              : ['Title and buyer capacity', 'SDLT and residence posture', 'Bank rails and source evidence', 'Authority and family-use minute', 'Decision memory record']
            ).map((gate) => (
              <span key={gate} className="rounded-full border border-border/25 bg-card/45 px-3 py-1.5 text-xs leading-relaxed text-muted-foreground">
                {gate}
              </span>
            ))}
          </div>
        </div>
      </div>

      {continuityRows.length ? (
        <div className="mt-6">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold/70">Release clearances by continuity layer</p>
          <RouteShareTable
            table={{
              columns: sectionColumns.length
                ? sectionColumns
                : ['Continuity layer', 'Risk if unwritten', 'Owner', 'Release clearance'],
              rows: continuityRows,
            }}
          />
        </div>
      ) : null}
    </section>
  );
}

function TaxDutyPanel({
  route,
  taxSection,
  citationIds,
  onCitationClick,
  citationMap,
}: {
  route: RouteIntelligenceOptionV2;
  taxSection?: ReleaseReadinessShareReportSection;
  citationIds: string[];
  onCitationClick?: (citationId: string) => void;
  citationMap?: Map<string, number>;
}) {
  const acquisitionAudit = (route.taxAudit?.acquisition_audit ?? {}) as Record<string, unknown>;
  const taxRows = safeArray<string[]>(taxSection?.table?.rows);
  const taxColumns = safeArray<string>(taxSection?.table?.columns);
  const treatmentRows = taxRows.length
    ? taxRows
    : [
        [
          routeDisplayText(route.routeName),
          'Base residential SDLT plus non-resident and additional-dwelling surcharge posture for the selected buyer route.',
          isOutcomeOnlyRoute(route)
            ? 'No purchase duty while capital remains held or stopped.'
            : `${routeDutiesValue(route)} duty drag; ${routeDutyDragValue(route)} of transaction value.`,
          isOutcomeOnlyRoute(route)
            ? 'Route reopens only after UK tax counsel signs the buyer profile, residence status, property count, surcharge posture, relief exclusions, and filing responsibility.'
            : 'UK tax counsel signs buyer profile, residence status, property count, surcharge posture, relief exclusions, and filing responsibility.',
        ],
        [
          'Main-residence or replacement route',
          'Lower-duty route only if residence and disposal facts are true at the transaction date.',
          'Not credited in the control case.',
          'Signed day-count, prior residence disposal/replacement evidence, and counsel computation control any bid-authority change.',
        ],
        [
          'Company / non-natural-person wrapper',
          'Can add higher SDLT, ATED, beneficial-owner disclosure, bank scrutiny, and reporting friction.',
          'Not a tax-saving route in the control case.',
          'Use only if counsel signs a non-tax governance, security, succession, or operating purpose.',
        ],
      ];

  return (
    <section>
      <SectionHeader
        label="Tax and legal route readiness"
        title="Cross-border tax, SDLT, residence, and duty read for the selected route."
      />
      <div className="space-y-5">
        <p className="max-w-5xl text-sm leading-relaxed text-muted-foreground">
          {routeDisplayText(taxSection?.intro || 'The route is tax-modeled, not tax-released. The selected buyer route must clear SDLT, surcharge, residence, filing, and counsel-signoff gates before capital moves.')}
          <InlineCitationButtons ids={citationIds} onCitationClick={onCitationClick} citationMap={citationMap} />
        </p>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <RouteShareCard
            card={{
              label: 'Transaction value',
              value: formatUsdCompact(route.metrics.propertyValueUsd),
              body: reportCardBody(taxSection, 'buyer category', 'Control case transaction value for the selected route.'),
            }}
          />
          <RouteShareCard
            card={{
              label: 'Base SDLT',
              value: routeBaseDutyValue(route, acquisitionAudit.bsd_stamp_duty_usd),
              body: isOutcomeOnlyRoute(route)
                ? 'Base SDLT is not incurred while the purchase route remains held or stopped.'
                : 'Base residential SDLT component for the selected control case.',
            }}
          />
          <RouteShareCard
            card={{
              label: 'Surcharge posture',
              value: routeSurchargeValue(route, acquisitionAudit.absd_additional_stamp_duty_usd),
              body: isOutcomeOnlyRoute(route)
                ? 'Non-resident and additional-dwelling surcharge exposure is not incurred while no purchase route is released.'
                : 'Non-resident and additional-dwelling exposure before any relief or refund is credited.',
            }}
          />
          <RouteShareCard
            card={{
              label: 'Total duty drag',
              value: routeDutiesValue(route),
              body: isOutcomeOnlyRoute(route)
                ? 'No purchase duty until the route reopens and capital is released.'
                : `${routeDutyDragValue(route)} of property value in the selected route.`,
            }}
          />
        </div>

        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold/70">Tax treatment by category</p>
          <RouteShareTable
            table={{
              columns: taxColumns.length
                ? taxColumns
                : ['Route reviewed', 'Mechanism', 'Model effect', 'Release requirement'],
              rows: treatmentRows,
            }}
          />
        </div>
      </div>
    </section>
  );
}

function RouteRead({ route }: { route: RouteIntelligenceOptionV2 }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-lg border border-border/25 bg-card/40 p-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-gold/70" />
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">Verdict</p>
        </div>
        <p className="mt-3 text-lg font-semibold text-foreground">{routeDisplayText(route.verdict)}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{routeDisplayText(route.releaseEffect)}</p>
      </div>
      <div className="rounded-lg border border-border/25 bg-card/40 p-5">
        <div className="flex items-center gap-2">
          <GitCompare className="h-4 w-4 text-gold/70" />
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">Economic Read</p>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-foreground">{routeDisplayText(route.economicRead)}</p>
      </div>
      <div className="rounded-lg border border-border/25 bg-card/40 p-5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-gold/70" />
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">Failure Mode</p>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-foreground">{routeDisplayText(route.failureMode)}</p>
      </div>
    </div>
  );
}

function BuyerProfileMatrix({ matrix }: { matrix: BuyerProfileRemissionMatrix }) {
  const rows = safeArray<BuyerProfileRemissionMatrix['matrix'][number]>(matrix.matrix);
  const thirdResidentialDisplay = (row: BuyerProfileRemissionMatrix['matrix'][number]) => {
    const second = routeDisplayText(row.secondResidential).trim();
    const third = routeDisplayText(row.thirdAndSubsequent).trim();
    if (
      second &&
      third &&
      second === third &&
      /company|non-natural|entity|wrapper/i.test(row.profile)
    ) {
      return 'Same high-rate exposure; no scaling benefit.';
    }
    return third;
  };

  return (
    <div className="rounded-lg border border-border/25 bg-card/40 p-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">{routeDisplayText(matrix.sourceRead)}</p>
          <h3 className="mt-3 text-lg font-semibold text-foreground">{routeDisplayText(matrix.title)}</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{routeDisplayText(matrix.dubaiRead)}</p>
          <p className="mt-3 text-sm leading-relaxed text-gold/80">{routeDisplayText(matrix.ftaRead)}</p>
        </div>
        <div className="rounded-md border border-border/20 bg-background/35 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground/70">Counsel Release Question</p>
          <p className="mt-3 text-sm leading-relaxed text-foreground">{routeDisplayText(matrix.counselQuestion)}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {rows.map((row, index) => {
          const accent = infographicPalette[index % infographicPalette.length];
          const dutyBands = [
            { label: '1st', value: row.firstResidential },
            { label: '2nd', value: row.secondResidential },
            { label: '3rd+', value: thirdResidentialDisplay(row) },
          ];
          return (
            <motion.article
              key={row.profile}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: index * 0.04 }}
              className={`rounded-lg border ${accent.border} ${accent.bg} p-4`}
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-current/25 bg-background/35" style={{ color: accent.dot }}>
                  <Home className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/65">Buyer profile</p>
                  <h4 className="mt-1 text-base font-semibold leading-snug text-foreground">{routeDisplayText(row.profile)}</h4>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {dutyBands.map((band) => (
                  <div key={band.label} className="rounded-md border border-border/15 bg-background/35 p-3">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/60">{band.label}</p>
                    <p className="mt-1 text-sm font-semibold leading-snug text-foreground">{routeDisplayText(String(band.value))}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-3">
                <div className="rounded-md border border-border/15 bg-background/35 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accent.dot }} />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/65">Release read</p>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{routeDisplayText(row.releaseRead)}</p>
                </div>
                <div className="rounded-md border border-border/15 bg-background/35 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <FileCheck2 className={`h-3.5 w-3.5 ${accent.text}`} />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/65">Evidence recorded</p>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{routeDisplayText(row.evidenceRequired)}</p>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}

function hasPrincipalValueGate(gate: RouteIntelligenceV2['principalValueGate']): gate is PrincipalValueGate {
  if (!gate) return false;
  return Boolean(
    routeDisplayText(gate.test) ||
    routeDisplayText(gate.answer) ||
    safeArray(gate.nonRedundantEdges).length ||
    safeArray(gate.advisorNonRedundancyTest).length ||
    safeArray(gate.replaceabilityRejectionRegister).length,
  );
}

function PrincipalValueGatePanel({ gate }: { gate: PrincipalValueGate }) {
  const nonRedundantEdges = safeArray<string>(gate.nonRedundantEdges);
  const adviserRows = safeArray<PrincipalValueGate['advisorNonRedundancyTest'][number]>(gate.advisorNonRedundancyTest);
  const rejectionRows = safeArray<PrincipalValueGate['replaceabilityRejectionRegister'][number]>(gate.replaceabilityRejectionRegister);

  return (
    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.035] p-5">
      <div className="grid gap-5 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-500/80">Principal Value Gate</p>
          </div>
          <h3 className="mt-3 text-lg font-semibold text-foreground">{gate.status === 'clears' ? 'Clears: release-readiness packet' : 'Evidence-gated release-readiness packet'}</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{routeDisplayText(gate.test)}</p>
          <p className="mt-3 text-sm leading-relaxed text-foreground">{routeDisplayText(gate.answer)}</p>
          <p className="mt-4 rounded-md border border-emerald-500/15 bg-background/30 p-3 text-sm leading-relaxed text-emerald-500/90">
            {routeDisplayText(gate.releaseStatus)}
          </p>
        </div>
        <div className="space-y-3">
          {nonRedundantEdges.slice(0, 4).map((edge) => (
            <div key={edge} className="rounded-md border border-border/20 bg-background/35 p-3">
              <p className="text-sm leading-relaxed text-foreground">{routeDisplayText(edge)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <div className="rounded-md border border-border/20 bg-background/35 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground/70">Not Replacing Advisers</p>
          <div className="mt-4 space-y-3">
            {adviserRows.slice(0, 4).map((row) => (
              <div key={row.adviserLane} className="border-b border-border/10 pb-3 last:border-b-0 last:pb-0">
                <p className="text-sm font-medium text-foreground">{routeDisplayText(row.adviserLane)}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{routeDisplayText(row.dm64Difference)}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-border/20 bg-background/35 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground/70">Rejected As Insufficient</p>
          <div className="mt-4 space-y-3">
            {rejectionRows.slice(0, 4).map((row) => (
              <div key={row.replaceableOutput} className="border-b border-border/10 pb-3 last:border-b-0 last:pb-0">
                <p className="text-sm font-medium text-foreground">{routeDisplayText(row.replaceableOutput)}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{routeDisplayText(row.whyRejected)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StressSignals({ route }: { route: RouteIntelligenceOptionV2 }) {
  const signals = safeArray<RouteStressSignal>((route as { stressSignals?: unknown }).stressSignals);

  if (!signals.length) {
    return null;
  }

  const signalValue = (signal: RouteStressSignal): string => {
    const label = routeDisplayText(signal.label).toLowerCase();
    const rawValue = routeDisplayText(signal.value);
    const rawIsZero = /^-?\s*US\$0(?:\.0+)?(?:[KMB])?$/i.test(rawValue.trim());

    if (label.includes('annual carry') && route.metrics.annualCarryingCostUsd > 0) {
      return formatUsdCompact(route.metrics.annualCarryingCostUsd);
    }

    if (label.includes('incremental duty') && route.metrics.incrementalDutyVsRecommendedUsd > 0) {
      return formatUsdCompact(route.metrics.incrementalDutyVsRecommendedUsd);
    }

    if (label.includes('duty') && !isOutcomeOnlyRoute(route) && route.metrics.totalDutiesUsd > 0) {
      return formatUsdCompact(route.metrics.totalDutiesUsd);
    }

    if (rawIsZero) {
      return isOutcomeOnlyRoute(route) ? 'No capital deployed' : 'Signed gate controls release';
    }

    return rawValue;
  };

  return (
    <div className="space-y-4 border-y border-[#d8d1c4] py-5 text-[#0c1117]">
      {signals.map((signal, index) => {
        const value = signalValue(signal);
        const label = routeDisplayText(signal.label);
        const numericHint = label.toLowerCase().includes('carry')
          ? Math.min(1, Math.max(0.08, route.metrics.annualCarryingCostUsd / Math.max(route.metrics.totalDutiesUsd, route.metrics.annualCarryingCostUsd, 1)))
          : label.toLowerCase().includes('duty')
            ? Math.min(1, Math.max(0.08, route.metrics.totalDutiesUsd / Math.max(route.metrics.totalAcquisitionCostUsd, route.metrics.totalDutiesUsd, 1)))
            : 0.62;
        return (
        <div key={signal.label} className="grid gap-3 md:grid-cols-[190px_1fr_170px] md:items-center">
          <p className="text-xs uppercase tracking-[0.2em] text-[#8a6b2d]">{routeDisplayText(signal.label)}</p>
          <div>
            <div className="h-2 overflow-hidden rounded-full bg-[#e4ded3]">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: index === 0 ? '#b88724' : index === 1 ? '#8f1d32' : '#047857' }}
                initial={{ width: 0 }}
                animate={{ width: `${numericHint * 100}%` }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
              />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[#506070]">{routeDisplayText(signal.read)}</p>
          </div>
          <p className="text-right text-xl font-semibold text-[#0c1117] md:text-2xl">{value}</p>
        </div>
        );
      })}
    </div>
  );
}

function scenarioStroke(scenario: RouteScenarioPoint['scenario']): string {
  if (scenario === 'Stress case') return '#8f1d32';
  if (scenario === 'Opportunity case') return '#047857';
  return '#b88724';
}

function parseCompactUsdValue(value: unknown): number | null {
  const raw = String(value || '').trim();
  if (!raw) return null;
  const negative = /^-/.test(raw);
  const suffix = raw.match(/[KMB]\b/i)?.[0]?.toUpperCase();
  const numeric = Number(raw.replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(numeric)) return null;
  const multiplier = suffix === 'B' ? 1_000_000_000 : suffix === 'M' ? 1_000_000 : suffix === 'K' ? 1_000 : 1;
  return (negative ? -1 : 1) * numeric * multiplier;
}

function scenarioFromShareSection(
  section: ReleaseReadinessShareReportSection | undefined,
  route: RouteIntelligenceOptionV2,
): RouteScenarioPoint[] {
  const chartRows = safeArray<NonNullable<ReleaseReadinessShareReportSection['chart']>[number]>(section?.chart);
  if (!chartRows.length) return [];
  const annualCarry = Number.isFinite(route.metrics.annualCarryingCostUsd) ? route.metrics.annualCarryingCostUsd : 0;
  const tableColumns = safeArray<string>(section?.table?.columns);
  const tableRows = safeArray<string[]>(section?.table?.rows);
  const scenarioIndex = Math.max(0, tableColumns.findIndex((column) => /scenario/i.test(column)));
  const year10Index = tableColumns.findIndex((column) => /year\s*10\s*value/i.test(column));
  const netAfterCarryIndex = tableColumns.findIndex((column) => /net\s+after\s+10-year\s+carry/i.test(column));
  const readIndex = tableColumns.findIndex((column) => /memo\s+read/i.test(column));
  const tableRowFor = (scenarioName: RouteScenarioPoint['scenario']): string[] | undefined => {
    const needle = scenarioName.replace(/\s+case$/i, '').toLowerCase();
    return tableRows.find((row) => String(row[scenarioIndex] || '').toLowerCase().includes(needle));
  };

  return chartRows.map((series): RouteScenarioPoint | null => {
    const points = safeArray<{ year: number; value: number }>(series.points)
      .filter((point) => Number.isFinite(point.year) && Number.isFinite(point.value))
      .sort((a, b) => a.year - b.year);
    const year10 = points.find((point) => point.year === 10) ?? points[points.length - 1];
    if (!year10 || !Number.isFinite(year10.value) || year10.value <= 0) return null;

    const scenarioName = /stress/i.test(series.name)
      ? 'Stress case'
      : /opportunity/i.test(series.name)
        ? 'Opportunity case'
        : 'Base case';
    const tableRow = tableRowFor(scenarioName);
    const tableYear10Value = year10Index >= 0 ? parseCompactUsdValue(tableRow?.[year10Index]) : null;
    const tableNetAfterCarry = netAfterCarryIndex >= 0 ? parseCompactUsdValue(tableRow?.[netAfterCarryIndex]) : null;
    const year10ValueUsd = tableYear10Value ?? year10.value;
    const netOutcomeUsd = tableNetAfterCarry ?? (year10.value - route.metrics.totalAcquisitionCostUsd - (annualCarry * 10));
    return {
      scenario: scenarioName,
      year10ValueUsd,
      netOutcomeUsd,
      read: readIndex >= 0 && tableRow?.[readIndex] ? tableRow[readIndex] : series.verdict,
      trajectory: points.map((point) => ({
        year: point.year,
        valueUsd: point.value,
        netOutcomeUsd: point.year === year10.year
          ? netOutcomeUsd
          : point.value - route.metrics.totalAcquisitionCostUsd - (annualCarry * point.year),
      })),
    };
  }).filter((scenario): scenario is RouteScenarioPoint => Boolean(scenario));
}

function hasMaterialScenarios(scenarios: RouteScenarioPoint[]): boolean {
  return scenarios.some((scenario) => (
    Number.isFinite(scenario.year10ValueUsd) &&
    Math.abs(scenario.year10ValueUsd) > 1 &&
    Number.isFinite(scenario.netOutcomeUsd) &&
    Math.abs(scenario.netOutcomeUsd) > 1
  ));
}

function ScenarioGraph({
  route,
  shareSection,
}: {
  route: RouteIntelligenceOptionV2;
  shareSection?: ReleaseReadinessShareReportSection;
}) {
  const routeScenarios = safeArray<RouteScenarioPoint>((route as { scenarios?: unknown }).scenarios);
  const shareScenarios = scenarioFromShareSection(shareSection, route);
  const scenarios = hasMaterialScenarios(shareScenarios) ? shareScenarios : routeScenarios;

  if (!scenarios.length) {
    return null;
  }

  const trajectories = scenarios.map((scenario) => {
    const points = (scenario.trajectory?.length
      ? scenario.trajectory
      : [
          { year: 0, valueUsd: route.metrics.propertyValueUsd, netOutcomeUsd: route.metrics.propertyValueUsd - route.metrics.totalAcquisitionCostUsd },
          { year: 10, valueUsd: scenario.year10ValueUsd, netOutcomeUsd: scenario.netOutcomeUsd },
        ]
    )
      .filter((point) => Number.isFinite(point.year) && Number.isFinite(point.netOutcomeUsd))
      .sort((a, b) => a.year - b.year);

    return { scenario, points };
  });
  const allValues = trajectories.flatMap((item) => item.points.map((point) => point.netOutcomeUsd));
  const rawMin = Math.min(0, ...allValues);
  const rawMax = Math.max(1, ...allValues);
  const padding = Math.max((rawMax - rawMin) * 0.12, route.metrics.propertyValueUsd * 0.015, 1);
  const minValue = rawMin - padding;
  const maxValue = rawMax + padding;
  const width = 760;
  const height = 240;
  const margin = { top: 20, right: 24, bottom: 34, left: 78 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const xFor = (year: number) => margin.left + (Math.max(0, Math.min(10, year)) / 10) * plotWidth;
  const yFor = (value: number) => margin.top + ((maxValue - value) / Math.max(1, maxValue - minValue)) * plotHeight;
  const zeroY = yFor(0);

  return (
    <div className="rounded-lg border border-border/25 bg-card/40 p-5">
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-gold/70" />
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">Base / Stress / Opportunity After Annual Carry</p>
          </div>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
            The selected route is judged on carry-adjusted outcome, not headline price.
          </h3>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {scenarios.map((scenario) => (
            <div key={`legend-${scenario.scenario}`} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: scenarioStroke(scenario.scenario) }} />
              <span>{scenario.scenario}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-border/15 bg-background/25 p-3">
        <div className="h-[240px] w-full">
        <motion.svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full overflow-visible" preserveAspectRatio="none" role="img" aria-label="Base stress opportunity annual trajectory">
          {[0, 5, 10].map((year) => (
            <g key={`x-${year}`}>
              <line x1={xFor(year)} x2={xFor(year)} y1={margin.top} y2={height - margin.bottom} stroke="hsl(var(--border))" strokeDasharray="4 6" opacity={0.42} />
              <text x={xFor(year)} y={height - 10} textAnchor="middle" fontSize="12" fill="hsl(var(--muted-foreground))">
                Y{year}
              </text>
            </g>
          ))}
          {[minValue, 0, maxValue].map((value) => (
            <g key={`y-${value}`}>
              <line x1={margin.left} x2={width - margin.right} y1={yFor(value)} y2={yFor(value)} stroke="hsl(var(--border))" strokeDasharray={value === 0 ? '0' : '4 6'} opacity={value === 0 ? 0.85 : 0.38} />
              {value !== 0 ? (
                <text x={margin.left - 10} y={yFor(value) + 4} textAnchor="end" fontSize="12" fill="hsl(var(--muted-foreground))">
                  {formatUsdCompact(value)}
                </text>
              ) : null}
            </g>
          ))}
          {zeroY >= margin.top && zeroY <= height - margin.bottom ? (
            <text x={width - margin.right} y={zeroY - 7} textAnchor="end" fontSize="11" fill="hsl(var(--muted-foreground))">
              release break-even
            </text>
          ) : null}
          {trajectories.map(({ scenario, points }) => {
            const stroke = scenarioStroke(scenario.scenario);
            const pointString = points.map((point) => `${xFor(point.year)},${yFor(point.netOutcomeUsd)}`).join(' ');
            return (
              <g key={scenario.scenario}>
                <motion.polyline
                  points={pointString}
                  fill="none"
                  stroke={stroke}
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0.2 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.7 }}
                />
                {points.map((point) => (
                  <motion.circle
                    key={`${scenario.scenario}-${point.year}`}
                    cx={xFor(point.year)}
                    cy={yFor(point.netOutcomeUsd)}
                    r={point.year === 0 || point.year === 10 ? 4 : 2.6}
                    fill={stroke}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: point.year === 0 || point.year === 10 ? 1 : 0.74 }}
                    transition={{ duration: 0.35, delay: 0.2 }}
                  />
                ))}
              </g>
            );
          })}
        </motion.svg>
        </div>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {scenarios.map((scenario) => {
          const positive = scenario.netOutcomeUsd >= 0;
          return (
            <motion.div
              key={scenario.scenario}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-lg border border-border/20 bg-background/25 p-4"
            >
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-foreground">{scenario.scenario}</span>
                <span className={positive ? 'text-emerald-500' : 'text-red-500'}>{formatUsdCompact(scenario.netOutcomeUsd)}</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Year 10 value: {formatUsdCompact(scenario.year10ValueUsd)}. {routeDisplayText(scenario.read)}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function JurisdictionGrid({ route }: { route: RouteIntelligenceOptionV2 }) {
  const values = safeArray<RouteIntelligenceOptionV2['jurisdictionValues'][number]>((route as { jurisdictionValues?: unknown }).jurisdictionValues);

  if (!values.length) {
    return null;
  }

  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {values.map((item) => (
        <div key={item.jurisdiction} className="rounded-lg border border-border/25 bg-card/40 p-5">
          <div className="flex items-center gap-2">
            <Landmark className="h-4 w-4 text-gold/70" />
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">{item.jurisdiction}</p>
          </div>
          <p className="mt-3 text-sm font-medium text-foreground">{routeDisplayText(item.value)}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{routeDisplayText(item.releaseRead)}</p>
        </div>
      ))}
    </div>
  );
}

function EvidencePack({ route }: { route: RouteIntelligenceOptionV2 }) {
  const gates = safeArray<RouteEvidenceGate>((route as { evidenceGates?: unknown }).evidenceGates);

  if (!gates.length) {
    return null;
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {gates.map((gate, index) => {
        const accent = infographicPalette[index % infographicPalette.length];
        return (
          <motion.article
            key={`${gate.gate}-${gate.owner}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: Math.min(index * 0.04, 0.2) }}
            className={`rounded-lg border ${accent.border} ${accent.bg} p-4`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-current/25 bg-background/35" style={{ color: accent.dot }}>
                  <FileCheck2 className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/65">Release gate</p>
                  <h4 className="mt-1 text-base font-semibold leading-snug text-foreground">{routeDisplayText(gate.gate)}</h4>
                </div>
              </div>
              <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] ${accent.border} ${accent.text}`}>
                {routeDisplayText(gate.releaseStatus)}
              </span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-md border border-border/15 bg-background/35 p-3">
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/60">Owner</p>
                <p className="mt-2 text-sm leading-relaxed text-foreground">{routeDisplayText(gate.owner)}</p>
              </div>
              <div className="rounded-md border border-border/15 bg-background/35 p-3">
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/60">Evidence</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{routeDisplayText(gate.evidenceRequired)}</p>
              </div>
            </div>
            <div className="mt-3 rounded-md border border-border/15 bg-background/35 p-3">
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle className={`h-3.5 w-3.5 ${accent.text}`} />
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/65">If unresolved</p>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{routeDisplayText(gate.consequenceIfMissing)}</p>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}

function ResponsibilityAndRecords({ route }: { route: RouteIntelligenceOptionV2 }) {
  const responsibilityRows = safeArray<RouteIntelligenceOptionV2['responsibilityTransfer'][number]>(
    (route as { responsibilityTransfer?: unknown }).responsibilityTransfer,
  );
  const mismatchRows = safeArray<RouteIntelligenceOptionV2['recordMismatchMap'][number]>(
    (route as { recordMismatchMap?: unknown }).recordMismatchMap,
  );

  if (!responsibilityRows.length && !mismatchRows.length) return null;

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {responsibilityRows.length ? (
      <div className="rounded-lg border border-border/25 bg-card/40 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-gold/70" />
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">Responsibility Transfer</p>
        </div>
        <div className="space-y-4">
          {responsibilityRows.map((item) => (
            <div key={item.action} className="border-b border-border/10 pb-4 last:border-b-0 last:pb-0">
              <p className="text-sm font-medium text-foreground">{routeDisplayText(item.action)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Primary: {routeDisplayText(item.primaryOwner)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Alternate: {routeDisplayText(item.fallbackOwner)}</p>
              <p className="mt-2 text-xs leading-relaxed text-gold/80">{routeDisplayText(item.releaseCondition)}</p>
            </div>
          ))}
        </div>
      </div>
      ) : null}
      {mismatchRows.length ? (
      <div className="rounded-lg border border-border/25 bg-card/40 p-5">
        <div className="mb-4 flex items-center gap-2">
          <FileCheck2 className="h-4 w-4 text-gold/70" />
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">Record Mismatch Map</p>
        </div>
        <div className="space-y-4">
          {mismatchRows.map((item) => (
            <div key={item.record} className="border-b border-border/10 pb-4 last:border-b-0 last:pb-0">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium text-foreground">{routeDisplayText(item.record)}</p>
                <span className="rounded-full border border-amber-500/20 bg-amber-500/[0.04] px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-amber-500">
                  {routeDisplayText(item.releaseStatus)}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Current: {routeDisplayText(item.currentRead)}</p>
              <p className="mt-1 text-xs leading-relaxed text-gold/80">Target: {routeDisplayText(item.targetRead)}</p>
            </div>
          ))}
        </div>
      </div>
      ) : null}
    </div>
  );
}

function CounselQuestions({ route }: { route: RouteIntelligenceOptionV2 }) {
  const questions = safeArray<RouteIntelligenceOptionV2['counselQuestionPack'][number]>(
    (route as { counselQuestionPack?: unknown }).counselQuestionPack,
  );

  if (!questions.length) {
    return null;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {questions.map((item) => (
        <div key={`${item.desk}-${item.question}`} className="rounded-lg border border-border/25 bg-card/40 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-gold/70">{routeDisplayText(item.desk)}</p>
          <p className="mt-3 text-sm leading-relaxed text-foreground">{routeDisplayText(item.question)}</p>
        </div>
      ))}
    </div>
  );
}

function DecisionOutcomeTrack({
  route,
  recommendedRoute,
  onSelectRecommended,
}: {
  route: RouteIntelligenceOptionV2;
  recommendedRoute?: RouteIntelligenceOptionV2;
  onSelectRecommended: () => void;
}) {
  const isStop = releaseRuleDisplay(route.releaseRule) === 'Stop';
  const outcomeCopy = isStop
    ? 'This route records why the proposed purchase should stop unless the family rebuilds the buyer, banking, title, authority, and tax release file.'
    : 'This route records why capital should hold while the family preserves optionality, keeps seller pressure from hardening, and clears the signed gates that would reopen a purchase route.';
  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-amber-500/25 bg-amber-500/[0.035] p-5">
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-amber-500/80">Decision Outcome</p>
            <h3 className="mt-3 text-xl font-semibold tracking-tight text-foreground">
              {releaseRuleDisplay(route.releaseRule)}: selected-route consequence.
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{outcomeCopy}</p>
            <p className="mt-4 rounded-md border border-border/20 bg-background/35 p-3 text-sm leading-relaxed text-foreground">
              {routeDisplayText(route.releaseEffect)}
            </p>
          </div>
          <div className="rounded-md border border-border/20 bg-background/35 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground/70">
              Route control
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              The full route spine remains below for this selected route. Use the recommended route button only to compare against the current preferred release path.
            </p>
            {recommendedRoute && recommendedRoute.id !== route.id ? (
              <button
                type="button"
                onClick={onSelectRecommended}
                className="mt-4 min-h-10 rounded-md border border-gold/40 px-4 py-2 text-sm font-medium text-gold transition hover:bg-gold/10"
              >
                Open executable route
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section>
        <SectionHeader
          label={isStop ? 'Stop Register' : 'Hold Register'}
          title={isStop ? 'Why capital should not move.' : 'What must reopen before capital moves.'}
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-border/25 bg-card/40 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">Economic Read</p>
            <p className="mt-3 text-sm leading-relaxed text-foreground">{routeDisplayText(route.economicRead)}</p>
          </div>
          <div className="rounded-lg border border-border/25 bg-card/40 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">Failure Mode Avoided</p>
            <p className="mt-3 text-sm leading-relaxed text-foreground">{routeDisplayText(route.failureMode)}</p>
          </div>
        </div>
      </section>

    </div>
  );
}

export default function RouteIntelligenceV2Report({
  intelligence,
  publicMemoId,
  v1Href,
  fullMemo,
  zeroTrustMoveIntake,
  embedded = false,
  onCitationClick,
  citationMap,
  sharePayload,
}: RouteIntelligenceV2ReportProps) {
  const routes = useMemo(
    () => {
      const variants = Array.isArray(intelligence.pressureVariants) ? intelligence.pressureVariants : [];
      const options = Array.isArray(intelligence.routeOptions) ? intelligence.routeOptions : [];
      const sourceRoutes = variants.length ? variants : options;
      return sourceRoutes.map((route) => hydrateRouteWithShareMetrics(
        route,
        safeArray<ShareRouteOption>(sharePayload?.routeOptions),
      ));
    },
    [intelligence.pressureVariants, intelligence.routeOptions, sharePayload?.routeOptions],
  );
  const [selectedRouteId, setSelectedRouteId] = useState(intelligence.recommendedRouteId || routes[0]?.id || '');
  const selectedRoute = useMemo(
    () => routes.find((route) => route.id === selectedRouteId) ?? routes[0],
    [routes, selectedRouteId],
  );
  const recommendedRoute = useMemo(
    () => routes.find((route) => route.id === intelligence.recommendedRouteId),
    [intelligence.recommendedRouteId, routes],
  );
  const isOutcomeOnlyTrack = selectedRoute ? isOutcomeOnlyRoute(selectedRoute) : false;
  const showFullMemoAnchor = Boolean(fullMemo && selectedRoute && !isOutcomeOnlyTrack);
  const selectedRouteZeroTrustMoveIntake =
    selectedRoute?.zeroTrustMoveIntake ??
    selectedRoute?.releaseEvidencePack ??
    zeroTrustMoveIntake;
  const [sourceJurisdiction, destinationJurisdiction] = useMemo(() => {
    const parts = String(intelligence.corridor || '').split(/\s*(?:->|→)\s*/);
    return [parts[0] || 'Source', parts[1] || 'Destination'];
  }, [intelligence.corridor]);
  const inputFrameSection = reportSectionById(sharePayload, 'input-frame');
  const capitalExposureSection = reportSectionById(sharePayload, 'capital-exposure-proof');
  const taxSection = reportSectionById(sharePayload, 'tax-legal-route-readiness');
  const marketSection = reportSectionById(sharePayload, 'market-intelligence');
  const wealthSection = reportSectionById(sharePayload, 'wealth-projection');
  const scenarioTreeSection = reportSectionById(sharePayload, 'release-rule-scenario-tree');
  const continuitySection = reportSectionById(sharePayload, 'g1-g2-g3-continuity', 'generation_to_generation-continuity');
  const crisisSection = reportSectionById(sharePayload, 'crisis-resilience');
  const antiFragilitySection = reportSectionById(sharePayload, 'anti-fragility');
  const authoritySection = reportSectionById(sharePayload, 'authority-veto');
  const responsibilitySection = reportSectionById(sharePayload, 'responsibility-transfer');
  const recordMismatchSection = reportSectionById(sharePayload, 'record-mismatch');
  const bankingSection = reportSectionById(sharePayload, 'banking-sow-sof');
  const counselSection = reportSectionById(sharePayload, 'counsel-operator-questions');
  const specialistSection = reportSectionById(sharePayload, 'specialist-release-reviews');
  const decisionMemorySection = reportSectionById(sharePayload, 'information-flow-decision-memory');
  const roadmapSection = reportSectionById(sharePayload, 'implementation-roadmap');
  const taxCitationIds = citationIdsFor(sharePayload, /tax|sdlt|residence|wrapper|company|ated|duty|property/i, 4);
  const continuityCitationIds = citationIdsFor(sharePayload, /family|fairness|authority|generation|succession|continuity|residence|education/i, 4);
  const crisisCitationIds = citationIdsFor(sharePayload, /bank|rail|source|kyc|sof|sow|crisis|war|sanction|technology|ai|insurance/i, 4);
  const marketCitationIds = citationIdsFor(sharePayload, /market|price|bid|mayfair|seller|trophy|property/i, 4);
  const bankingCitationIds = citationIdsFor(sharePayload, /bank|rail|source|kyc|sof|sow|fx|signer|fallback/i, 4);

  if (!selectedRoute) {
    return (
      <div className="bg-background px-6 py-12 text-foreground">
        <p>Route intelligence is unavailable for this memo.</p>
      </div>
    );
  }

  const moveSentence = routeDisplayText(intelligence.move).replace(/[.!?]\s*$/, '');

  const reportBody = (
    <div className={embedded ? 'min-w-0 px-0 py-0' : 'mx-auto max-w-7xl min-w-0 px-4 py-6 sm:px-6 lg:px-8'}>
      <div className="mb-8 flex min-w-0 flex-col gap-4 border-b border-border/40 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          {!embedded ? (
            <Link href={v1Href} className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to full memo
            </Link>
          ) : null}
          <p className={`${embedded ? 'mt-0' : 'mt-5'} text-xs uppercase tracking-[0.28em] text-gold/70`}>
            {routeDisplayText(intelligence.surfaceEyebrow ?? 'Proposed Move Release Readiness')}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground md:text-4xl xl:text-5xl">
            {routeDisplayText(intelligence.surfaceTitle ?? 'Proposed Move Release Readiness Memo')}
          </h1>
          <p className="mt-4 max-w-4xl text-sm leading-relaxed text-muted-foreground">
            {moveSentence}. This view reviews the route the room is already considering and shows what must change, hold, or stop before release.
          </p>
        </div>
        <div className="rounded-lg border border-border/30 bg-card/40 p-4 text-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground/70">Reference</p>
          <p className="mt-2 break-all font-medium text-foreground">{publicMemoId}</p>
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground/70">Corridor</p>
          <p className="mt-2 break-words font-medium text-foreground">{routeDisplayText(intelligence.corridor)}</p>
        </div>
      </div>

      <div className="space-y-10">
        <RouteSelector
          routes={routes}
          selectedRouteId={selectedRoute.id}
          onSelect={setSelectedRouteId}
          label={routeDisplayText(intelligence.selectorLabel ?? 'Route Being Released')}
          copy={routeDisplayText(intelligence.selectorCopy ?? 'Review release-readiness routes against the proposed move. The downstream tax audit, jurisdiction readiness, carrying-cost stance, release gates, scenario data, and owner matrix show what changes if the proposed route is modified, held, or stopped.')}
        />

        {showFullMemoAnchor && selectedRoute && fullMemo ? (
          <section id="full-decision-memo" className="border-t border-border/40 pt-8">
            <SectionHeader
              label={`Full Linear Route Memo · Route ${selectedRoute.rank}`}
              title={`${selectedRoute.routeName} full route view.`}
            />
            <RouteFullMemoErrorBoundary key={selectedRoute.id}>
              <RouteFullMemoAnchor route={selectedRoute} fullMemo={fullMemo} />
            </RouteFullMemoErrorBoundary>
          </section>
        ) : null}
        {!showFullMemoAnchor ? (
          <>
            <ReviewerLayerNotice />

            <RouteDetailsDisclosure
              label="Source packet"
              title="Input frame, route drivers, and source register"
              body="Open this when the reviewer needs the source spine behind the selected route. It stays collapsed on first read so the route decision remains readable."
            >
              <ZeroTrustRouteSummary data={selectedRouteZeroTrustMoveIntake} />

              <RouteShareSectionPanel
                section={inputFrameSection}
                citationIds={marketCitationIds}
                onCitationClick={onCitationClick}
                citationMap={citationMap}
              />

              <NativeRouteDriversPanel
                intelligence={intelligence}
                methodDrivers={sharePayload?.methodDrivers}
                onCitationClick={onCitationClick}
                citationMap={citationMap}
              />

              <RouteSourceRegisterPanel
                methodDrivers={sharePayload?.methodDrivers}
                onCitationClick={onCitationClick}
                citationMap={citationMap}
              />
            </RouteDetailsDisclosure>

            <section>
              <SectionHeader
                label="Decision Routes"
                title="Five route decisions compared by release rule, capital exposure, duty drag, and route consequence."
              />
              <RouteDecisionGraph routes={routes} selectedRouteId={selectedRoute.id} />
            </section>

            <section>
              <SectionHeader label={intelligence.selectedRouteLabel ?? 'Variant Under Review'} title={selectedRoute.routeName} />
              <MetricStrip route={selectedRoute} />
              <div className="mt-4">
                <RouteRead route={selectedRoute} />
              </div>
            </section>

            <section>
              <SectionHeader label="Route Graphs" title="Base, stress, opportunity, duty, and carry for the selected route." />
              <ScenarioGraph route={selectedRoute} shareSection={wealthSection} />
            </section>

            <section>
              <SectionHeader label="Release Evidence" title="Evidence pack recorded; signed approval gates control movement." />
              <EvidencePack route={selectedRoute} />
            </section>

            <RouteDetailsDisclosure
              label="Due diligence detail"
              title="Tax, bank, family, crisis, record, counsel, and roadmap detail"
              body="Open this for the full selected-route reviewer pack. First paint keeps the route decision, graph, and release evidence visible without overwhelming the reader."
            >
              <DecisionMemoTreePanel
                section={scenarioTreeSection}
                citationIds={marketCitationIds}
                onCitationClick={onCitationClick}
                citationMap={citationMap}
              />

              <RouteShareSectionPanel
                section={antiFragilitySection}
                citationIds={crisisCitationIds}
                onCitationClick={onCitationClick}
                citationMap={citationMap}
                cardLimit={8}
              />

              <RouteMemoSpinePanel intelligence={intelligence} />

              {recommendedRoute && recommendedRoute.id !== selectedRoute.id ? (
                <DecisionOutcomeTrack
                  route={selectedRoute}
                  recommendedRoute={recommendedRoute}
                  onSelectRecommended={() => setSelectedRouteId(recommendedRoute?.id || intelligence.recommendedRouteId || routes[0]?.id || selectedRoute.id)}
                />
              ) : null}

              {intelligence.buyerProfileMatrix ? (
                <section>
                  <SectionHeader label="Buyer Profile Test" title={intelligence.buyerProfileMatrix.title} />
                  <BuyerProfileMatrix matrix={intelligence.buyerProfileMatrix} />
                </section>
              ) : null}

              {hasPrincipalValueGate(intelligence.principalValueGate) ? (
                <section>
                  <SectionHeader label="Principal Value Gate" title="What this memo does that a checklist or adviser note cannot." />
                  <PrincipalValueGatePanel gate={intelligence.principalValueGate} />
                </section>
              ) : null}

              <section>
                <SectionHeader label="Stress Signals" title="What changes when this route is selected." />
                <StressSignals route={selectedRoute} />
              </section>

              <TaxDutyPanel
                route={selectedRoute}
                taxSection={taxSection}
                citationIds={taxCitationIds}
                onCitationClick={onCitationClick}
                citationMap={citationMap}
              />

              <RouteShareSectionPanel
                section={capitalExposureSection}
                citationIds={taxCitationIds}
                onCitationClick={onCitationClick}
                citationMap={citationMap}
              />

              <section>
                <SectionHeader label="Jurisdiction Intelligence" title={`Route-specific readiness across ${sourceJurisdiction}, ${destinationJurisdiction}, and the family system.`} />
                <JurisdictionGrid route={selectedRoute} />
              </section>

              <RouteShareSectionPanel
                section={marketSection}
                citationIds={marketCitationIds}
                onCitationClick={onCitationClick}
                citationMap={citationMap}
              />

              <RouteShareSectionPanel
                section={bankingSection}
                citationIds={bankingCitationIds}
                onCitationClick={onCitationClick}
                citationMap={citationMap}
              />

              <RouteShareSectionPanel
                section={continuitySection}
                citationIds={continuityCitationIds}
                onCitationClick={onCitationClick}
                citationMap={citationMap}
              />

              <RouteContinuityDeepDive
                route={selectedRoute}
                section={continuitySection}
                citationIds={continuityCitationIds}
                onCitationClick={onCitationClick}
                citationMap={citationMap}
              />

              <RouteShareSectionPanel
                section={authoritySection}
                citationIds={continuityCitationIds}
                onCitationClick={onCitationClick}
                citationMap={citationMap}
              />

              <RouteShareSectionPanel
                section={specialistSection}
                citationIds={continuityCitationIds}
                onCitationClick={onCitationClick}
                citationMap={citationMap}
                cardLimit={4}
              />

              <RouteShareSectionPanel
                section={crisisSection}
                citationIds={crisisCitationIds}
                onCitationClick={onCitationClick}
                citationMap={citationMap}
                cardLimit={10}
              />

              <RouteShareSectionPanel
                section={wealthSection}
                citationIds={marketCitationIds}
                onCitationClick={onCitationClick}
                citationMap={citationMap}
              />

              <RouteShareSectionPanel
                section={responsibilitySection}
                citationIds={continuityCitationIds}
                onCitationClick={onCitationClick}
                citationMap={citationMap}
              />

              <RouteShareSectionPanel
                section={recordMismatchSection}
                citationIds={bankingCitationIds}
                onCitationClick={onCitationClick}
                citationMap={citationMap}
              />

              <section>
                <SectionHeader label="Responsibility Transfer Matrix" title="Responsibility transfer and record mismatch release-readiness review." />
                <ResponsibilityAndRecords route={selectedRoute} />
              </section>

              {counselSection ? (
                <RouteShareSectionPanel
                  section={counselSection}
                  citationIds={continuityCitationIds}
                  onCitationClick={onCitationClick}
                  citationMap={citationMap}
                />
              ) : (
                <section>
                  <SectionHeader label="Counsel And Operator Question Pack" title="Questions that make existing advisers useful instead of bypassed." />
                  <CounselQuestions route={selectedRoute} />
                </section>
              )}

              <RouteShareSectionPanel
                section={decisionMemorySection}
                citationIds={marketCitationIds}
                onCitationClick={onCitationClick}
                citationMap={citationMap}
                cardLimit={2}
              />

              <RouteShareSectionPanel
                section={roadmapSection}
                citationIds={bankingCitationIds}
                onCitationClick={onCitationClick}
                citationMap={citationMap}
              />
            </RouteDetailsDisclosure>

            <section className="rounded-lg border border-border/25 bg-card/40 p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-foreground">Release boundary</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {intelligence.sourceRead} The selected route keeps its consequences, owner gates, tax posture, continuity read, crisis resilience, and release evidence together without adding a second full memo.
                  </p>
                </div>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );

  return (
    <DecisionMemoRenderProvider motionEnabled={false}>
      {embedded ? (
        <div className="bg-background text-foreground">{reportBody}</div>
      ) : (
        <main className="min-h-screen bg-background text-foreground">{reportBody}</main>
      )}
    </DecisionMemoRenderProvider>
  );
}
