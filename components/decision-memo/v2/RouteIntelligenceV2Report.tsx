'use client';

import Link from 'next/link';
import React, { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Banknote,
  Calculator,
  CheckCircle2,
  FileCheck2,
  GitCompare,
  Landmark,
  Route,
  ShieldCheck,
  TimerReset,
  Users,
} from 'lucide-react';
import { DecisionMemoRenderProvider } from '@/components/decision-memo/memo/decision-memo-render-context';
import { ReleaseReadinessInquiryForm } from '@/components/decision-memo/memo/ReleaseReadinessInquiryForm';
import {
  type ReleaseReadinessShareCard,
  type ReleaseReadinessSharePayload,
  type ReleaseReadinessShareReportSection,
} from '@/lib/decision-memo/build-release-readiness-share-surface';
import {
  type BuyerProfileRemissionMatrix,
  formatUsdCompact,
  type PrincipalValueGate,
  type RouteDriverRegisterItem,
  type RouteIntelligenceOptionV2,
  type RouteScenarioPoint,
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
    .replace(/\bRelease Differently\b/gi, 'Gated negotiation only')
    .replace(/\bproceed[-\s]modified\b/gi, 'Proceed under signed gates')
    .replace(/\bPreferred modified route only if\b/gi, 'Preferred direct route only if')
    .replace(/\bPreferred modified route\b/gi, 'Preferred direct route under signed gates')
    .replace(/\bremains Proceed under signed gates\b/gi, 'remains gated')
    .replace(/\bShould the family release the purchase route now,\s*Gated negotiation only,\s*hold,\s*or stop\?/gi, 'Should the family advance under signed gates, hold, or stop?')
    .replace(/\bNative Route Drivers\b/gi, 'Route Drivers From Source Review')
    .replace(/\bDecision EV\b/gi, 'Scenario discipline output - not release authority')
    .replace(/\bExpected value creation\b/gi, 'Scenario discipline output')
    .replace(/\bExpected Net Worth\b/gi, 'Scenario net position')
    .replace(/\bNet Benefit\b/gi, 'Route discipline read')
    .replace(/\bScore\s+\d+\s*\/\s*100\.?/gi, 'Readiness score evidence-gated.')
    .replace(/\b\d+\s*\/\s*100\b/g, 'readiness score evidence-gated')
    .replace(/\b50\s*\/\s*30\s*\/\s*20 probability scenarios\b/gi, 'base, stress, and opportunity scenario discipline; not a forecast')
    .replace(/\b50\s*\/\s*30\s*\/\s*20 probabilities\b/gi, 'base / stress / opportunity scenario weights; not a forecast')
    .replace(/\bSIX-BOOK OPENING\b/gi, 'Decision Opening')
    .replace(/\bSix-book opening\b/gi, 'Decision opening')
    .replace(/\bOPEN GATES\b/gi, 'Release Gate Status')
    .replace(/\bOpen Gates\b/gi, 'Release Gate Status')
    .replace(/\b0\s+to\s+close\b/gi, 'Evidence pending')
    .replace(/\bDOCUMENTED\b/g, 'Indexed for review')
    .replace(/\bDocumented\b/g, 'Indexed for review')
    .replace(/\breleased differently\b/gi, 'advanced under signed gates')
    .replace(/\brelease differently\b/gi, 'advance under signed gates')
    .replace(/\bPressure Variants Tested\b/gi, 'Release Readiness Routes Reviewed')
    .replace(/\bPressure Test\b/gi, 'Release Readiness Review')
    .replace(/\bpressure-test(?:ed|ing)?\b/gi, 'release-readiness reviewed')
    .replace(/\bpressure\b/gi, 'readiness')
    .replace(/\bG1 principal\b/gi, 'principal')
    .replace(/\bG2 son\b/gi, 'named family user')
    .replace(/\bG2 daughter\s*\/\s*fairness owner\b/gi, 'named family-fairness owner')
    .replace(/\bdaughter\s*\/\s*fairness owner\b/gi, 'named family-fairness owner')
    .replace(/\bdaughter\/fairness\b/gi, 'family-fairness')
    .replace(/\bG3 grandson\b/gi, 'next-generation record')
    .replace(/\bfuture-grandchild\b/gi, 'next-generation')
    .replace(/\bgrandson\b/gi, 'next-generation record')
    .replace(/\bson-use\b/gi, 'named family-user')
    .replace(/\bson use\b/gi, 'named family-user')
    .replace(/\bnamed family user-use\b/gi, 'named family-user use')
    .replace(/\bspouse veto if relevant\b/gi, 'family-home veto position where recorded')
    .replace(/\bspouse if relevant\b/gi, 'family-home veto holder where recorded')
    .replace(/\bspouse veto\b/gi, 'family-home veto position')
    .replace(/\ba undocumented family expectation\b/gi, 'an undocumented family expectation')
    .replace(/\bDestination tax counsel\b/gi, 'UK tax counsel')
    .replace(/\bDestination property counsel\b/gi, 'UK property counsel')
    .replace(/\badvisor embarrassment\b/gi, 'adviser coordination failure')
    .replace(/\badviser embarrassment\b/gi, 'adviser coordination failure')
    .replace(/\bAI Bubble\s*\/\s*Technology Wealth Repricing Shock\b/gi, 'Conditional technology-wealth exposure check')
    .replace(/\bJob Market Crash\s*\/\s*Labor-Income Shock\b/gi, 'Conditional operating-income exposure check')
    .replace(/\bDigital Settlement\s*\/\s*Stablecoin Rail Stress\b/gi, 'Conditional digital-settlement rail exposure check')
    .replace(/\bTechnology-wealth exposure check\b/gi, 'Conditional technology-wealth exposure check')
    .replace(/\bOperating-income exposure check\b/gi, 'Conditional operating-income exposure check')
    .replace(/\bDigital-settlement exposure check\b/gi, 'Conditional digital-settlement rail exposure check')
    .replace(/\bAI\/technology wealth repricing\b/gi, 'conditional technology-wealth exposure')
    .replace(/\bAI asset repricing(?:\s*\/\s*technology wealth repricing)?\b/gi, 'conditional technology-wealth exposure')
    .replace(/\bwar\s*\/\s*sanctions\b/gi, 'conditional geopolitical and sanctions exposure')
    .replace(/\bGulf conflict,\s*sanctions\b/gi, 'conditional geopolitical and sanctions exposure')
    .replace(/\bstablecoin rail stress\b/gi, 'conditional digital-settlement rail exposure')
    .replace(/\bBSA\/sanctions\b/gi, 'sanctions and bank-compliance controls')
    .replace(/\bBSA\b/g, 'bank-compliance controls')
    .replace(/\bshadow facilitators\b/gi, 'unverified intermediaries')
    .replace(/\s+/g, ' ')
    .trim();
}

function releaseTone(route: RouteIntelligenceOptionV2): string {
  const rule = routeDisplayText(route.releaseRule).toLowerCase();
  const verdict = routeDisplayText(route.verdict).toLowerCase();
  if (
    route.releaseRule === 'Release Differently' ||
    rule.includes('gated negotiation') ||
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
  if (rule === 'Release Differently') return 'Gated negotiation only';
  if (routeDisplayText(rule).toLowerCase().includes('gated negotiation')) return 'Gated negotiation only';
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
          The route read is available. The embedded full memo anchor is still warming; switch back to Principal View for the canonical full memo.
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

function metricLabel(route: RouteIntelligenceOptionV2): string {
  const releaseRule = releaseRuleDisplay(route.releaseRule);
  if (isOutcomeOnlyRoute(route) && releaseRule === 'Stop') return 'Capital Protected';
  if (isOutcomeOnlyRoute(route) && releaseRule === 'Hold') return 'Duty Exposure Preserved';
  return 'All-In Outlay';
}

function metricValue(route: RouteIntelligenceOptionV2): string {
  if (isOutcomeOnlyRoute(route)) {
    return formatUsdCompact(Math.abs(route.metrics.incrementalDutyVsRecommendedUsd));
  }
  return formatUsdCompact(route.metrics.totalAcquisitionCostUsd);
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

function ZeroTrustRouteSummary({ data }: { data?: Record<string, unknown> | null }) {
  const intake = zeroTrustRecord(data);
  if (!Object.keys(intake).length) return null;

  const evidenceStates = zeroTrustRecord(intake.evidence_states);
  const records = zeroTrustRecords(intake.records).length ? zeroTrustRecords(intake.records) : zeroTrustRecords(intake.evidence_records);
  const adviserInputs = zeroTrustRecords(intake.adviser_inputs).length
    ? zeroTrustRecords(intake.adviser_inputs)
    : zeroTrustRecords(intake.adviser_asks);
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
  const adviserConfirmationCount = adviserInputs.length || 6;
  const releaseDomainRead = recordNames.join(' / ') || 'Evidence domains are assigned in the release file';
  const openGateRead = openGateNames.slice(0, 2).join(' / ') || 'Owner assignment complete; release remains open until signed evidence is received.';

  const metrics = [
    { label: 'Release Domains', value: String(records.length), read: releaseDomainRead },
    { label: 'Release Gate Status', value: openGateCount ? `${openGateCount} Open` : 'Evidence Pending', read: openGateRead },
    { label: 'Adviser Confirmations', value: String(adviserConfirmationCount), read: 'Property, tax, bank, succession, insurance, and operator desks' },
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
            {String(intake.release_test || 'Evidence required before release')}
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

function sourceChipLabel(sourceId: string, citationMap?: Map<string, number>, index = 0): string {
  const citationNumber = citationMap?.get(sourceId);
  return citationNumber ? `[${citationNumber}]` : `[${index + 1}]`;
}

function reportSectionById(
  sharePayload: ReleaseReadinessSharePayload | null | undefined,
  ...ids: string[]
): ReleaseReadinessShareReportSection | undefined {
  if (!sharePayload?.reportSections?.length) return undefined;
  const wanted = new Set(ids.map((id) => id.toLowerCase()));
  return sharePayload.reportSections.find((section) => wanted.has(String(section.id).toLowerCase()));
}

function reportCardBody(section: ReleaseReadinessShareReportSection | undefined, labelNeedle: string, fallback = ''): string {
  const needle = labelNeedle.toLowerCase();
  const card = section?.cards?.find((item) => routeDisplayText(item.label).toLowerCase().includes(needle));
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

  sharePayload.publicSources?.forEach((source) => {
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
  if (!ids.length) return null;
  return (
    <span className="ml-2 inline-flex flex-wrap gap-1 align-baseline">
      {ids.map((sourceId, index) => (
        <button
          key={`${sourceId}-${index}`}
          type="button"
          onClick={() => onCitationClick?.(sourceId)}
          className="inline-flex h-6 items-center rounded-full border border-gold/30 px-2 text-[11px] font-semibold text-gold transition hover:border-gold hover:bg-gold/10"
        >
          {sourceChipLabel(sourceId, citationMap, index)}
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
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-foreground">Route view keeps the full memo attached to the selected executable route.</h2>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Principal View is the decision surface. Route View is the adviser/reviewer layer where route selection changes tax,
          jurisdiction, carry, evidence, scenario, and owner reads. Evidence & Methodology is the proof ledger and source
          boundary, kept separate from the principal decision page.
        </p>
      </div>
    </section>
  );
}

function PrimarySourceAnchor({
  ids,
  onCitationClick,
  citationMap,
}: {
  ids: string[];
  onCitationClick?: (citationId: string) => void;
  citationMap?: Map<string, number>;
}) {
  if (!ids.length) return null;

  return (
    <section className="rounded-lg border border-border/25 bg-card/35 p-4 sm:p-5">
      <p className="text-xs uppercase tracking-[0.22em] text-gold/75">Primary source anchor</p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Target listing and source-register row for the Balfour Place acquisition.
        <InlineCitationButtons ids={ids} onCitationClick={onCitationClick} citationMap={citationMap} />
      </p>
    </section>
  );
}

function NativeRouteDriversPanel({
  intelligence,
  onCitationClick,
  citationMap,
}: {
  intelligence: RouteIntelligenceV2;
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
  const visibleDrivers = (registerItems.length ? registerItems : fallbackItems).slice(0, 8);
  const title = /native\s+route\s+drivers/i.test(intelligence.nativeRouteDriverTitle || '')
    ? 'Route Drivers From Source Review'
    : (intelligence.nativeRouteDriverTitle || 'Route Drivers From Source Review');

  if (!visibleDrivers.length) return null;

  return (
    <section className="rounded-lg border border-border/30 bg-card/40 p-4 sm:p-6">
      <div className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2">
            <Route className="h-4 w-4 text-gold/80" />
            <p className="text-xs uppercase tracking-[0.22em] text-gold/80">
              {title}
            </p>
          </div>
          <h2 className="mt-3 text-xl font-semibold tracking-tight text-foreground">
            {routeDisplayText(intelligence.nativeRouteDriverSubtitle || 'What the route-pattern witnesses actually change in this move.')}
          </h2>
          {intelligence.nativeRouteDriverNote ? (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {routeDisplayText(intelligence.nativeRouteDriverNote)}
            </p>
          ) : null}
        </div>

        <div className="grid min-w-0 gap-3 md:grid-cols-2">
          {visibleDrivers.map((driver, index) => (
            <div key={driver.id || `${index}-${driver.driver}`} className="rounded-md border border-border/25 bg-background/40 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground/70">
                Driver {index + 1}
              </p>
              <h3 className="mt-2 text-sm font-semibold leading-snug text-foreground">
                {routeDisplayText(driver.title)}
              </h3>
              <p className="mt-3 text-sm font-medium leading-relaxed text-foreground">
                {routeDisplayText(driver.driver)}
              </p>
              {driver.releaseRead || driver.evidenceBasis ? (
                <div className="mt-3 space-y-2 border-t border-border/20 pt-3 text-xs leading-relaxed text-muted-foreground">
                  {driver.releaseRead ? <p><span className="font-semibold text-foreground/80">Release read:</span> {routeDisplayText(driver.releaseRead)}</p> : null}
                  {driver.evidenceBasis ? <p><span className="font-semibold text-foreground/80">Evidence boundary:</span> {routeDisplayText(driver.evidenceBasis)}</p> : null}
                </div>
              ) : null}
              {driver.sourceIds.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {driver.sourceIds.slice(0, 3).map((sourceId, sourceIndex) => (
                    <button
                      key={sourceId}
                      type="button"
                      onClick={() => onCitationClick?.(sourceId)}
                      className="rounded-full border border-gold/25 bg-gold/[0.04] px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] text-gold transition hover:border-gold/60 hover:bg-gold/[0.08]"
                    >
                      {sourceChipLabel(sourceId, citationMap, sourceIndex)}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
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
  return (
    <div className="rounded-lg border border-border/30 bg-card/40 p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground/70">{label}</p>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {copy}
          </p>
        </div>
        <select
          value={selectedRouteId}
          onChange={(event) => onSelect(event.target.value)}
          className="min-h-11 w-full rounded-md border border-border/40 bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-gold/70 lg:w-[360px]"
          aria-label="Route being reviewed"
        >
          {routes.map((route) => (
            <option key={route.id} value={route.id}>
              {route.rank}. {routeDisplayText(route.routeName)}
            </option>
          ))}
        </select>
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
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">Route {route.rank}</p>
              <span className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${releaseTone(route)}`}>
                {releaseRuleDisplay(route.releaseRule)}
              </span>
            </div>
            <h3 className="mt-3 text-sm font-medium leading-snug text-foreground">{routeDisplayText(route.routeName)}</h3>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{routeDisplayText(route.routeType)}</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="uppercase tracking-[0.18em] text-muted-foreground/60">Duties</p>
                <p className="mt-1 font-medium text-foreground">{formatUsdCompact(route.metrics.totalDutiesUsd)}</p>
              </div>
              <div>
                <p className="uppercase tracking-[0.18em] text-muted-foreground/60">Drag</p>
                <p className="mt-1 font-medium text-foreground">{pct(route.metrics.dutyDragPct)}</p>
              </div>
            </div>
          </button>
        );
      })}
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
    { icon: Banknote, label: 'Total Duties', value: formatUsdCompact(route.metrics.totalDutiesUsd), read: `${primaryFeeLabel} + ${secondaryFeeLabel} impact for the selected buyer route.` },
    { icon: AlertTriangle, label: 'Duty Drag', value: pct(route.metrics.dutyDragPct), read: 'Non-recoverable duty as percentage of property value.' },
    {
      icon: TimerReset,
      label: 'Mitigation Timeline',
      value: releaseRule === 'Gated negotiation only' ? '72h / 7d' : isOutcomeOnlyRoute(route) ? releaseRule : 'Evidence gate',
      read: route.metrics.dataQuality,
    },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="rounded-lg border border-border/25 bg-card/40 p-4">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-gold/70" />
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground/70">{item.label}</p>
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{item.value}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.read}</p>
          </div>
        );
      })}
    </div>
  );
}

function RouteShareCard({ card }: { card: ReleaseReadinessShareCard }) {
  return (
    <article className="min-w-0 rounded-lg border border-border/25 bg-card/40 p-4">
      <p className="break-words text-xs uppercase tracking-[0.18em] text-muted-foreground/70">
        {routeDisplayText(card.label)}
      </p>
      {card.value ? <p className="mt-3 text-xl font-semibold text-foreground">{routeDisplayText(card.value)}</p> : null}
      {card.title ? <h3 className="mt-3 text-base font-semibold leading-snug text-foreground">{routeDisplayText(card.title)}</h3> : null}
      {card.body ? <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{routeDisplayText(card.body)}</p> : null}
      {card.status ? <p className="mt-3 text-sm font-semibold text-gold">{routeDisplayText(card.status)}</p> : null}
      {card.owner ? <p className="mt-3 text-sm font-semibold text-foreground">{routeDisplayText(card.owner)}</p> : null}
      {card.releaseCondition ? (
        <p className="mt-3 border-t border-border/20 pt-3 text-xs leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">Release condition:</span> {routeDisplayText(card.releaseCondition)}
        </p>
      ) : null}
    </article>
  );
}

function RouteShareTable({ table }: { table: NonNullable<ReleaseReadinessShareReportSection['table']> }) {
  if (!table.rows.length) return null;

  return (
    <div className="overflow-x-auto rounded-lg border border-border/25 bg-card/35">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-muted/35 text-xs uppercase tracking-[0.16em] text-muted-foreground/70">
          <tr>
            {table.columns.map((column) => (
              <th key={column} className="border-b border-border/20 px-4 py-3 font-medium">
                {routeDisplayText(column)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr key={`${row.join('|')}-${rowIndex}`} className="border-b border-border/10 last:border-b-0">
              {row.map((cell, cellIndex) => (
                <td
                  key={`${cell}-${cellIndex}`}
                  className={`min-w-48 px-4 py-4 align-top leading-relaxed ${
                    cellIndex === 0 ? 'font-medium text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {routeDisplayText(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
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
  const cards = cardLimit ? section.cards?.slice(0, cardLimit) : section.cards;

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
        {section.bullets?.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {section.bullets.map((bullet, index) => (
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
  const continuityRows = section?.table?.rows?.length
    ? section.table.rows
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
  const gateNames = route.evidenceGates
    .map((gate) => routeDisplayText(gate.gate))
    .filter((gate) => /authority|family|succession|fairness|decision|carry|use|title|bank|source/i.test(gate))
    .slice(0, 8);

  const releaseChain = [
    {
      label: 'G1 Route Control',
      value: 'Release-gated',
      body:
        'Principal authority remains intact only if approval, stop, signing, reporting, retrieval, and escalation rights are written before bid release.',
    },
    {
      label: 'G1 -> G2 Retained Value',
      value: formatUsdCompact(retainedAfterDutyUsd),
      body:
        `Route value after ${formatUsdCompact(route.metrics.totalDutiesUsd)} duty drag, before annual carry and any family-use entitlement is allowed to harden.`,
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
        'Authority minute naming approver, stop owner, signer, fallback signer, retrieval owner, and adviser-instruction owner.',
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
      legalTax: 'Buyer profile, SDLT posture, stop rights, signer authority, and incapacity fallback must be signed before exchange.',
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
            columns: ['Succession layer', 'Loss if unresolved', 'Release record required'],
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
            The required record is not decorative: purpose, approved route, rejected routes, capital basis, annual carry owner, veto position, family-use boundary, and retrieval location must be signed before close.
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
              columns: section?.table?.columns?.length
                ? section.table.columns
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
  const treatmentRows = taxSection?.table?.rows?.length
    ? taxSection.table.rows
    : [
        [
          routeDisplayText(route.routeName),
          'Base residential SDLT plus non-resident and additional-dwelling surcharge posture for the selected buyer route.',
          `${formatUsdCompact(route.metrics.totalDutiesUsd)} duty drag; ${pct(route.metrics.dutyDragPct)} of transaction value.`,
          'UK tax counsel signs buyer profile, residence status, property count, surcharge posture, relief exclusions, and filing responsibility.',
        ],
        [
          'Main-residence or replacement route',
          'Lower-duty route only if residence and disposal facts are true at the transaction date.',
          'Not credited in the control case.',
          'Signed day-count, prior residence disposal/replacement evidence, and counsel computation required before bid authority changes.',
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
      <SectionHeader label="Tax audit" title="Cross-border tax and duty read for the selected route." />
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
              value: formatUsdCompact(route.metrics.bsdUsd || Number(acquisitionAudit.bsd_stamp_duty_usd) || 0),
              body: 'Base residential SDLT component for the selected control case.',
            }}
          />
          <RouteShareCard
            card={{
              label: 'Surcharge posture',
              value: formatUsdCompact(route.metrics.absdUsd || Number(acquisitionAudit.absd_additional_stamp_duty_usd) || 0),
              body: 'Non-resident and additional-dwelling exposure before any relief or refund is credited.',
            }}
          />
          <RouteShareCard
            card={{
              label: 'Total duty drag',
              value: formatUsdCompact(route.metrics.totalDutiesUsd),
              body: `${pct(route.metrics.dutyDragPct)} of property value in the selected route.`,
            }}
          />
        </div>

        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold/70">Tax treatment by category</p>
          <RouteShareTable
            table={{
              columns: taxSection?.table?.columns?.length
                ? taxSection.table.columns
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

      <div className="mt-5 overflow-x-auto">
        <div className="min-w-[860px]">
          <div className="grid grid-cols-12 border-b border-border/25 px-3 py-3 text-xs uppercase tracking-[0.16em] text-muted-foreground/70">
            <div className="col-span-2">Buyer Profile</div>
            <div className="col-span-1">1st</div>
            <div className="col-span-1">2nd</div>
            <div className="col-span-1">3rd+</div>
            <div className="col-span-4">Release Read</div>
            <div className="col-span-3">Evidence Required</div>
          </div>
          {matrix.matrix.map((row) => (
            <div key={row.profile} className="grid grid-cols-12 gap-3 border-b border-border/10 px-3 py-4 text-sm last:border-b-0">
              <div className="col-span-2 font-medium text-foreground">{routeDisplayText(row.profile)}</div>
              <div className="col-span-1 text-foreground">{row.firstResidential}</div>
              <div className="col-span-1 text-foreground">{row.secondResidential}</div>
              <div className="col-span-1 text-foreground">{thirdResidentialDisplay(row)}</div>
              <div className="col-span-4 leading-relaxed text-muted-foreground">{routeDisplayText(row.releaseRead)}</div>
              <div className="col-span-3 leading-relaxed text-muted-foreground">{routeDisplayText(row.evidenceRequired)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PrincipalValueGatePanel({ gate }: { gate: PrincipalValueGate }) {
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
          {gate.nonRedundantEdges.slice(0, 4).map((edge) => (
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
            {gate.advisorNonRedundancyTest.slice(0, 4).map((row) => (
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
            {gate.replaceabilityRejectionRegister.slice(0, 4).map((row) => (
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
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {route.stressSignals.map((signal) => (
        <div key={signal.label} className="rounded-lg border border-border/25 bg-card/40 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground/70">{routeDisplayText(signal.label)}</p>
          <p className="mt-2 text-xl font-semibold text-foreground">{routeDisplayText(signal.value)}</p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{routeDisplayText(signal.read)}</p>
        </div>
      ))}
    </div>
  );
}

function scenarioStroke(scenario: RouteScenarioPoint['scenario']): string {
  if (scenario === 'Stress case') return '#ef4444';
  if (scenario === 'Opportunity case') return '#10b981';
  return '#d4a843';
}

function ScenarioGraph({ route }: { route: RouteIntelligenceOptionV2 }) {
  const trajectories = route.scenarios.map((scenario) => {
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
  const width = 720;
  const height = 280;
  const margin = { top: 18, right: 18, bottom: 38, left: 74 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const xFor = (year: number) => margin.left + (Math.max(0, Math.min(10, year)) / 10) * plotWidth;
  const yFor = (value: number) => margin.top + ((maxValue - value) / Math.max(1, maxValue - minValue)) * plotHeight;
  const zeroY = yFor(0);

  return (
    <div className="rounded-lg border border-border/25 bg-card/40 p-5">
      <div className="mb-5 flex items-center gap-2">
        <Route className="h-4 w-4 text-gold/70" />
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">Base / Stress / Opportunity Trajectory</p>
      </div>
      <div className="h-[280px] w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full overflow-visible" preserveAspectRatio="none" role="img" aria-label="Base stress opportunity annual trajectory">
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
              <text x={margin.left - 10} y={yFor(value) + 4} textAnchor="end" fontSize="12" fill="hsl(var(--muted-foreground))">
                {formatUsdCompact(value)}
              </text>
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
                <polyline points={pointString} fill="none" stroke={stroke} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                {points.map((point) => (
                  <circle key={`${scenario.scenario}-${point.year}`} cx={xFor(point.year)} cy={yFor(point.netOutcomeUsd)} r={point.year === 0 || point.year === 10 ? 4 : 2.6} fill={stroke} opacity={point.year === 0 || point.year === 10 ? 1 : 0.74} />
                ))}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
        {route.scenarios.map((scenario) => (
          <div key={`legend-${scenario.scenario}`} className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: scenarioStroke(scenario.scenario) }} />
            <span>{scenario.scenario}</span>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        {route.scenarios.map((scenario) => {
          const positive = scenario.netOutcomeUsd >= 0;
          return (
            <div key={scenario.scenario} className="mt-5 border-t border-border/15 pt-4">
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-foreground">{scenario.scenario}</span>
                <span className={positive ? 'text-emerald-500' : 'text-red-500'}>{formatUsdCompact(scenario.netOutcomeUsd)}</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Year 10 value: {formatUsdCompact(scenario.year10ValueUsd)}. {routeDisplayText(scenario.read)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function JurisdictionGrid({ route }: { route: RouteIntelligenceOptionV2 }) {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {route.jurisdictionValues.map((item) => (
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
  return (
    <div className="overflow-hidden rounded-lg border border-border/25 bg-card/40">
      <div className="hidden grid-cols-12 border-b border-border/25 px-4 py-3 text-xs uppercase tracking-[0.18em] text-muted-foreground/70 md:grid">
        <div className="col-span-3">Gate</div>
        <div className="col-span-2">Owner</div>
        <div className="col-span-3">Evidence</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Consequence</div>
      </div>
      {route.evidenceGates.map((gate) => (
        <div key={`${gate.gate}-${gate.owner}`} className="grid grid-cols-12 gap-3 border-b border-border/10 px-4 py-4 text-sm last:border-b-0">
          <div className="col-span-12 font-medium text-foreground md:col-span-3">{routeDisplayText(gate.gate)}</div>
          <div className="col-span-12 text-muted-foreground md:col-span-2">{routeDisplayText(gate.owner)}</div>
          <div className="col-span-12 text-muted-foreground md:col-span-3">{routeDisplayText(gate.evidenceRequired)}</div>
          <div className="col-span-12 text-amber-500 md:col-span-2">{routeDisplayText(gate.releaseStatus)}</div>
          <div className="col-span-12 text-muted-foreground md:col-span-2">{routeDisplayText(gate.consequenceIfMissing)}</div>
        </div>
      ))}
    </div>
  );
}

function ResponsibilityAndRecords({ route }: { route: RouteIntelligenceOptionV2 }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <div className="rounded-lg border border-border/25 bg-card/40 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-gold/70" />
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">Responsibility Transfer</p>
        </div>
        <div className="space-y-4">
          {route.responsibilityTransfer.map((item) => (
            <div key={item.action} className="border-b border-border/10 pb-4 last:border-b-0 last:pb-0">
              <p className="text-sm font-medium text-foreground">{routeDisplayText(item.action)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Primary: {routeDisplayText(item.primaryOwner)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Fallback: {routeDisplayText(item.fallbackOwner)}</p>
              <p className="mt-2 text-xs leading-relaxed text-gold/80">{routeDisplayText(item.releaseCondition)}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-border/25 bg-card/40 p-5">
        <div className="mb-4 flex items-center gap-2">
          <FileCheck2 className="h-4 w-4 text-gold/70" />
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">Record Mismatch Map</p>
        </div>
        <div className="space-y-4">
          {route.recordMismatchMap.map((item) => (
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
    </div>
  );
}

function CounselQuestions({ route }: { route: RouteIntelligenceOptionV2 }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {route.counselQuestionPack.map((item) => (
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
    ? 'This option records why the proposed purchase should not be released. It is not an execution memo because no acquisition route should harden under this track.'
    : 'This option records why the room should wait. It is not a full execution memo until the reopen evidence is complete and an executable route is selected.';
  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-amber-500/25 bg-amber-500/[0.035] p-5">
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-amber-500/80">Decision Outcome</p>
            <h3 className="mt-3 text-xl font-semibold tracking-tight text-foreground">
              {releaseRuleDisplay(route.releaseRule)}: option track, not full execution report.
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{outcomeCopy}</p>
            <p className="mt-4 rounded-md border border-border/20 bg-background/35 p-3 text-sm leading-relaxed text-foreground">
              {routeDisplayText(route.releaseEffect)}
            </p>
          </div>
          <div className="rounded-md border border-border/20 bg-background/35 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground/70">
              Full Memo Anchor
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              The full release-readiness memo stays attached to the executable route. Hold and Stop remain comparison outcomes inside the route selector.
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
      return variants.length ? variants : options;
    },
    [intelligence.pressureVariants, intelligence.routeOptions],
  );
  const [fullMemoReady, setFullMemoReady] = useState(false);
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
  const hasFullMemoAnchor = Boolean(selectedRoute && fullMemo && !isOutcomeOnlyTrack);
  const showFullMemoAnchor = Boolean(fullMemoReady && hasFullMemoAnchor);
  const [sourceJurisdiction, destinationJurisdiction] = useMemo(() => {
    const parts = String(intelligence.corridor || '').split(/\s*(?:->|→)\s*/);
    return [parts[0] || 'Source', parts[1] || 'Destination'];
  }, [intelligence.corridor]);
  const taxSection = reportSectionById(sharePayload, 'tax-legal-route-readiness');
  const continuitySection = reportSectionById(sharePayload, 'g1-g2-g3-continuity', 'generation_to_generation-continuity');
  const crisisSection = reportSectionById(sharePayload, 'crisis-resilience');
  const antiFragilitySection = reportSectionById(sharePayload, 'anti-fragility');
  const specialistSection = reportSectionById(sharePayload, 'specialist-release-reviews');
  const decisionMemorySection = reportSectionById(sharePayload, 'information-flow-decision-memory');
  const taxCitationIds = citationIdsFor(sharePayload, /tax|sdlt|residence|wrapper|company|ated|duty|property/i, 4);
  const continuityCitationIds = citationIdsFor(sharePayload, /family|fairness|authority|generation|succession|continuity|residence|education/i, 4);
  const crisisCitationIds = citationIdsFor(sharePayload, /bank|rail|source|kyc|sof|sow|crisis|war|sanction|technology|ai|insurance/i, 4);
  const marketCitationIds = citationIdsFor(sharePayload, /market|price|bid|mayfair|seller|trophy|property/i, 4);
  const primaryListingCitationIds = citationIdsFor(sharePayload, /rightmove|ob private|balfour place|target listing/i, 1);

  useEffect(() => {
    setFullMemoReady(false);
    const handle =
      typeof window.requestAnimationFrame === 'function'
        ? window.requestAnimationFrame(() => {
            setFullMemoReady(true);
          })
        : window.setTimeout(() => {
            setFullMemoReady(true);
          }, 0);

    return () => {
      if (typeof window.cancelAnimationFrame === 'function') {
        window.cancelAnimationFrame(handle);
      } else {
        window.clearTimeout(handle);
      }
    };
  }, [selectedRoute?.id]);

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

        <ReviewerLayerNotice />

        <ZeroTrustRouteSummary data={zeroTrustMoveIntake} />

        <PrimarySourceAnchor
          ids={primaryListingCitationIds}
          onCitationClick={onCitationClick}
          citationMap={citationMap}
        />

      <NativeRouteDriversPanel
        intelligence={intelligence}
        onCitationClick={onCitationClick}
        citationMap={citationMap}
      />

        <section>
          <SectionHeader
            label={intelligence.comparisonLabel ?? 'Release Readiness Routes'}
            title={intelligence.comparisonTitle ?? 'Routes reviewed against the proposed route, not new advisory options.'}
          />
          <RouteComparison
            routes={routes}
            selectedRouteId={selectedRoute.id}
            onSelect={setSelectedRouteId}
          />
        </section>

        <section>
          <SectionHeader label={intelligence.selectedRouteLabel ?? 'Variant Under Review'} title={selectedRoute.routeName} />
          <MetricStrip route={selectedRoute} />
          <div className="mt-4">
            <RouteRead route={selectedRoute} />
          </div>
        </section>

        {isOutcomeOnlyTrack ? (
          <DecisionOutcomeTrack
            route={selectedRoute}
            recommendedRoute={recommendedRoute}
            onSelectRecommended={() => setSelectedRouteId(recommendedRoute?.id || intelligence.recommendedRouteId || routes[0]?.id || selectedRoute.id)}
          />
        ) : (
          <>
            <section>
              <SectionHeader label="Buyer Profile Test" title={intelligence.buyerProfileMatrix.title} />
              <BuyerProfileMatrix matrix={intelligence.buyerProfileMatrix} />
            </section>

            {intelligence.principalValueGate ? (
              <section>
                <SectionHeader label="Principal Value Gate" title="What this memo does that a checklist or adviser note cannot." />
                <PrincipalValueGatePanel gate={intelligence.principalValueGate} />
              </section>
            ) : null}
          </>
        )}

        <section>
          <SectionHeader label="Stress Signals" title="What changes when this route is selected." />
          <StressSignals route={selectedRoute} />
        </section>

        {!isOutcomeOnlyTrack ? (
          <>
            <TaxDutyPanel
              route={selectedRoute}
              taxSection={taxSection}
              citationIds={taxCitationIds}
              onCitationClick={onCitationClick}
              citationMap={citationMap}
            />

            <section>
              <SectionHeader label="Jurisdiction Intelligence" title={`Route-specific readiness across ${sourceJurisdiction}, ${destinationJurisdiction}, and the family system.`} />
              <JurisdictionGrid route={selectedRoute} />
            </section>

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
              section={antiFragilitySection}
              citationIds={crisisCitationIds}
              onCitationClick={onCitationClick}
              citationMap={citationMap}
              cardLimit={8}
            />

            <section>
              <SectionHeader label="Projection" title="Base, stress, and opportunity outcomes for the selected route." />
              <ScenarioGraph route={selectedRoute} />
            </section>

            <section>
              <SectionHeader label="Release Evidence" title="Evidence pack required before this route can move." />
              <EvidencePack route={selectedRoute} />
            </section>

            <section>
              <SectionHeader label="Responsibility Transfer Matrix" title="Responsibility transfer and record mismatch release-readiness review." />
              <ResponsibilityAndRecords route={selectedRoute} />
            </section>

            <section>
              <SectionHeader label="Counsel And Operator Question Pack" title="Questions that make existing advisers useful instead of bypassed." />
              <CounselQuestions route={selectedRoute} />
            </section>

            <RouteShareSectionPanel
              section={decisionMemorySection}
              citationIds={marketCitationIds}
              onCitationClick={onCitationClick}
              citationMap={citationMap}
              cardLimit={2}
            />
          </>
        ) : null}

        <section className="rounded-lg border border-border/25 bg-card/40 p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
            <div>
              <p className="text-sm font-medium text-foreground">Release boundary</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {intelligence.sourceRead} {!isOutcomeOnlyTrack
                  ? 'The full memo remains available in this release-readiness review while this view isolates route-state consequences for the family office room.'
                  : 'This selected outcome stays inside the route selector; the full release-readiness memo stays anchored to the executable route.'}
              </p>
            </div>
          </div>
        </section>

        {showFullMemoAnchor && selectedRoute && fullMemo ? (
          <section id="full-decision-memo" className="border-t border-border/40 pt-10">
            <SectionHeader
              label={`Full Release Readiness Memo · Route ${selectedRoute.rank}`}
              title={`${selectedRoute.routeName} release-readiness memo.`}
            />
            <div className="rounded-lg border border-border/25 bg-background/40 px-0 py-6 sm:px-2">
              <RouteFullMemoErrorBoundary key={selectedRoute.id}>
                <RouteFullMemoAnchor route={selectedRoute} fullMemo={fullMemo} />
              </RouteFullMemoErrorBoundary>
            </div>
          </section>
        ) : null}

        {hasFullMemoAnchor && !showFullMemoAnchor ? (
          <section className="rounded-lg border border-border/25 bg-card/40 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">Full Memo Anchor</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Preparing the route-scoped full memo anchor. Route intelligence remains available above.
            </p>
          </section>
        ) : showFullMemoAnchor ? null : (
          <section className="relative overflow-hidden rounded-lg border border-primary/25 bg-card/50 p-6 sm:p-8">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            <div className="relative z-10 max-w-4xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Release Readiness Request
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                Have a live wealth move that should not harden yet?
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Share your name, email, phone, and a brief description of the live move. We return with the evidence scope, release gates, and adviser question pack needed before capital, title, authority, or custody moves.
              </p>
              <ReleaseReadinessInquiryForm
                intakeId={publicMemoId}
                reference={publicMemoId}
              />
            </div>
          </section>
        )}
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
