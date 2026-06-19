'use client';

import Link from 'next/link';
import { useMemo, useState, type ReactNode } from 'react';
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
import { CrossBorderTaxAudit } from '@/components/decision-memo/memo/CrossBorderTaxAudit';
import { DecisionMemoRenderProvider } from '@/components/decision-memo/memo/decision-memo-render-context';
import { ReleaseReadinessInquiryForm } from '@/components/decision-memo/memo/ReleaseReadinessInquiryForm';
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
}

function pct(value: number): string {
  if (!Number.isFinite(value)) return '0.00%';
  return `${value.toFixed(2)}%`;
}

function routeDisplayText(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/\bRelease Differently\b/gi, 'Gated negotiation only')
    .replace(/\bProceed Modified\b/gi, 'Proceed under signed gates')
    .replace(/\bNative Route Drivers\b/gi, 'Route Drivers From Source Review')
    .replace(/\bSIX-BOOK OPENING\b/gi, 'Decision Opening')
    .replace(/\bSix-book opening\b/gi, 'Decision opening')
    .replace(/\bPressure Variants Tested\b/gi, 'Release Readiness Routes Reviewed')
    .replace(/\bPressure Test\b/gi, 'Release Readiness Review')
    .replace(/\bpressure-test(?:ed|ing)?\b/gi, 'release-readiness reviewed')
    .replace(/\bpressure\b/gi, 'readiness')
    .replace(/\s+/g, ' ')
    .trim();
}

function releaseTone(route: RouteIntelligenceOptionV2): string {
  if (route.releaseRule === 'Release Differently') {
    return 'border-emerald-500/25 bg-emerald-500/[0.04] text-emerald-500';
  }
  if (route.releaseRule === 'Hold') {
    return 'border-amber-500/25 bg-amber-500/[0.04] text-amber-500';
  }
  return 'border-red-500/25 bg-red-500/[0.04] text-red-500';
}

function releaseRuleDisplay(rule: RouteIntelligenceOptionV2['releaseRule'] | string): string {
  if (rule === 'Release Differently') return 'Gated negotiation only';
  if (rule === 'Hold') return 'Hold';
  if (rule === 'Stop') return 'Stop';
  return String(rule || '');
}

function isOutcomeOnlyRoute(route: RouteIntelligenceOptionV2): boolean {
  const routeName = route.routeName.toLowerCase();
  const routeType = route.routeType.toLowerCase();
  return (
    route.id === 'hold_rent_first' ||
    route.id === 'stop_route' ||
    routeName.startsWith('hold ') ||
    routeName.startsWith('stop ') ||
    routeType.includes('optionality-preservation') ||
    routeType.includes('capital-protection')
  );
}

function metricLabel(route: RouteIntelligenceOptionV2): string {
  if (isOutcomeOnlyRoute(route) && route.releaseRule === 'Stop') return 'Capital Protected';
  if (isOutcomeOnlyRoute(route) && route.releaseRule === 'Hold') return 'Duty Exposure Preserved';
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
  const releaseDomainRead = recordNames.join(' / ') || 'Evidence domains are assigned in the release file';
  const openGateRead = openGateNames.slice(0, 2).join(' / ') || 'Owner assignment complete; release remains open until signed evidence is received.';

  const metrics = [
    { label: 'Release Domains', value: String(records.length), read: releaseDomainRead },
    { label: 'Release Gate Status', value: openGateCount ? `${openGateCount} Open` : 'Evidence Pending', read: openGateRead },
    { label: 'Adviser Confirmations', value: String(adviserInputs.length), read: 'Property, tax, bank, succession, insurance, and operator desks' },
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
            {intelligence.nativeRouteDriverSubtitle || 'What the route-pattern witnesses actually change in this move.'}
          </h2>
          {intelligence.nativeRouteDriverNote ? (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {intelligence.nativeRouteDriverNote}
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
                {driver.title}
              </h3>
              <p className="mt-3 text-sm font-medium leading-relaxed text-foreground">
                {driver.driver}
              </p>
              {driver.releaseRead || driver.evidenceBasis ? (
                <div className="mt-3 space-y-2 border-t border-border/20 pt-3 text-xs leading-relaxed text-muted-foreground">
                  {driver.releaseRead ? <p><span className="font-semibold text-foreground/80">Release read:</span> {driver.releaseRead}</p> : null}
                  {driver.evidenceBasis ? <p><span className="font-semibold text-foreground/80">Evidence boundary:</span> {driver.evidenceBasis}</p> : null}
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
  const metrics = [
    { icon: Calculator, label: metricLabel(route), value: metricValue(route), read: route.metrics.mitigationTimeline },
    { icon: Banknote, label: 'Total Duties', value: formatUsdCompact(route.metrics.totalDutiesUsd), read: `${primaryFeeLabel} + ${secondaryFeeLabel} impact for the selected buyer route.` },
    { icon: AlertTriangle, label: 'Duty Drag', value: pct(route.metrics.dutyDragPct), read: 'Non-recoverable duty as percentage of property value.' },
    {
      icon: TimerReset,
      label: 'Mitigation Timeline',
      value: route.releaseRule === 'Release Differently' ? '72h / 7d' : isOutcomeOnlyRoute(route) ? releaseRuleDisplay(route.releaseRule) : 'Evidence gate',
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

function RouteRead({ route }: { route: RouteIntelligenceOptionV2 }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-lg border border-border/25 bg-card/40 p-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-gold/70" />
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">Verdict</p>
        </div>
        <p className="mt-3 text-lg font-semibold text-foreground">{route.verdict}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{route.releaseEffect}</p>
      </div>
      <div className="rounded-lg border border-border/25 bg-card/40 p-5">
        <div className="flex items-center gap-2">
          <GitCompare className="h-4 w-4 text-gold/70" />
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">Economic Read</p>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-foreground">{route.economicRead}</p>
      </div>
      <div className="rounded-lg border border-border/25 bg-card/40 p-5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-gold/70" />
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">Failure Mode</p>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-foreground">{route.failureMode}</p>
      </div>
    </div>
  );
}

function BuyerProfileMatrix({ matrix }: { matrix: BuyerProfileRemissionMatrix }) {
  return (
    <div className="rounded-lg border border-border/25 bg-card/40 p-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">{matrix.sourceRead}</p>
          <h3 className="mt-3 text-lg font-semibold text-foreground">{matrix.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{matrix.dubaiRead}</p>
          <p className="mt-3 text-sm leading-relaxed text-gold/80">{matrix.ftaRead}</p>
        </div>
        <div className="rounded-md border border-border/20 bg-background/35 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground/70">Counsel Release Question</p>
          <p className="mt-3 text-sm leading-relaxed text-foreground">{matrix.counselQuestion}</p>
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
              <div className="col-span-2 font-medium text-foreground">{row.profile}</div>
              <div className="col-span-1 text-foreground">{row.firstResidential}</div>
              <div className="col-span-1 text-foreground">{row.secondResidential}</div>
              <div className="col-span-1 text-foreground">{row.thirdAndSubsequent}</div>
              <div className="col-span-4 leading-relaxed text-muted-foreground">{row.releaseRead}</div>
              <div className="col-span-3 leading-relaxed text-muted-foreground">{row.evidenceRequired}</div>
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
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{gate.test}</p>
          <p className="mt-3 text-sm leading-relaxed text-foreground">{gate.answer}</p>
          <p className="mt-4 rounded-md border border-emerald-500/15 bg-background/30 p-3 text-sm leading-relaxed text-emerald-500/90">
            {gate.releaseStatus}
          </p>
        </div>
        <div className="space-y-3">
          {gate.nonRedundantEdges.slice(0, 4).map((edge) => (
            <div key={edge} className="rounded-md border border-border/20 bg-background/35 p-3">
              <p className="text-sm leading-relaxed text-foreground">{edge}</p>
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
                <p className="text-sm font-medium text-foreground">{row.adviserLane}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{row.dm64Difference}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-border/20 bg-background/35 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground/70">Rejected As Insufficient</p>
          <div className="mt-4 space-y-3">
            {gate.replaceabilityRejectionRegister.slice(0, 4).map((row) => (
              <div key={row.replaceableOutput} className="border-b border-border/10 pb-3 last:border-b-0 last:pb-0">
                <p className="text-sm font-medium text-foreground">{row.replaceableOutput}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{row.whyRejected}</p>
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
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground/70">{signal.label}</p>
          <p className="mt-2 text-xl font-semibold text-foreground">{signal.value}</p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{signal.read}</p>
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
                Year 10 value: {formatUsdCompact(scenario.year10ValueUsd)}. {scenario.read}
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
          <p className="mt-3 text-sm font-medium text-foreground">{item.value}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.releaseRead}</p>
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
          <div className="col-span-12 font-medium text-foreground md:col-span-3">{gate.gate}</div>
          <div className="col-span-12 text-muted-foreground md:col-span-2">{gate.owner}</div>
          <div className="col-span-12 text-muted-foreground md:col-span-3">{gate.evidenceRequired}</div>
          <div className="col-span-12 text-amber-500 md:col-span-2">{gate.releaseStatus}</div>
          <div className="col-span-12 text-muted-foreground md:col-span-2">{gate.consequenceIfMissing}</div>
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
              <p className="text-sm font-medium text-foreground">{item.action}</p>
              <p className="mt-1 text-xs text-muted-foreground">Primary: {item.primaryOwner}</p>
              <p className="mt-1 text-xs text-muted-foreground">Fallback: {item.fallbackOwner}</p>
              <p className="mt-2 text-xs leading-relaxed text-gold/80">{item.releaseCondition}</p>
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
                <p className="text-sm font-medium text-foreground">{item.record}</p>
                <span className="rounded-full border border-amber-500/20 bg-amber-500/[0.04] px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-amber-500">
                  {item.releaseStatus}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Current: {item.currentRead}</p>
              <p className="mt-1 text-xs leading-relaxed text-gold/80">Target: {item.targetRead}</p>
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
          <p className="text-xs uppercase tracking-[0.18em] text-gold/70">{item.desk}</p>
          <p className="mt-3 text-sm leading-relaxed text-foreground">{item.question}</p>
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
  const isStop = route.releaseRule === 'Stop';
  const outcomeCopy = isStop
    ? 'This option records why the proposed purchase should not be released. It is not an execution memo because no acquisition route should harden under this track.'
    : 'This option records why the room should wait. It is not a full execution memo until the reopen evidence is complete and an executable route is selected.';
  const evidenceTitle = isStop
    ? 'Proof required to support the stop decision and protect capital.'
    : 'Evidence required before this route can reopen.';
  const counselTitle = isStop
    ? 'Questions before reversing the stop decision.'
    : 'Questions before moving from hold to release.';

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
              {route.releaseEffect}
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
            <p className="mt-3 text-sm leading-relaxed text-foreground">{route.economicRead}</p>
          </div>
          <div className="rounded-lg border border-border/25 bg-card/40 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">Failure Mode Avoided</p>
            <p className="mt-3 text-sm leading-relaxed text-foreground">{route.failureMode}</p>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader label={isStop ? 'Stop Evidence' : 'Reopen Evidence'} title={evidenceTitle} />
        <EvidencePack route={route} />
      </section>

      <section>
        <SectionHeader label="Counsel Pack" title={counselTitle} />
        <CounselQuestions route={route} />
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
}: RouteIntelligenceV2ReportProps) {
  const routes = useMemo(
    () => (intelligence.pressureVariants?.length ? intelligence.pressureVariants : intelligence.routeOptions) ?? [],
    [intelligence.pressureVariants, intelligence.routeOptions],
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
  const selectedFullMemo = useMemo(() => {
    if (!selectedRoute || !fullMemo) return null;
    return typeof fullMemo === 'function' ? fullMemo(selectedRoute) : fullMemo;
  }, [fullMemo, selectedRoute]);
  const [sourceJurisdiction, destinationJurisdiction] = useMemo(() => {
    const parts = intelligence.corridor.split(/\s*(?:->|→)\s*/);
    return [parts[0] || 'Source', parts[1] || 'Destination'];
  }, [intelligence.corridor]);

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

        {!isOutcomeOnlyTrack ? (
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

            <section>
              <SectionHeader label="Stress Signals" title="What changes when this route is selected." />
              <StressSignals route={selectedRoute} />
            </section>

            <section>
              <SectionHeader label="Tax Audit" title="Cross-border tax and duty read for the selected route." />
              <CrossBorderTaxAudit
                audit={selectedRoute.taxAudit as any}
                sourceJurisdiction={sourceJurisdiction}
                destinationJurisdiction={destinationJurisdiction}
              />
            </section>

            <section>
              <SectionHeader label="Jurisdiction Intelligence" title={`Route-specific readiness across ${sourceJurisdiction}, ${destinationJurisdiction}, and the family system.`} />
              <JurisdictionGrid route={selectedRoute} />
            </section>

            <section>
              <SectionHeader label="Projection" title="Base, stress, and opportunity outcomes for the selected route." />
              <ScenarioGraph route={selectedRoute} />
            </section>

            <section>
              <SectionHeader label="Release Evidence" title="Evidence pack required before this route can move." />
              <EvidencePack route={selectedRoute} />
            </section>

            <section>
              <SectionHeader label="Operator Control" title="Responsibility transfer and record mismatch release-readiness review." />
              <ResponsibilityAndRecords route={selectedRoute} />
            </section>

            <section>
              <SectionHeader label="Counsel Pack" title="Questions that make existing advisors useful instead of bypassed." />
              <CounselQuestions route={selectedRoute} />
            </section>
          </>
        ) : (
          <DecisionOutcomeTrack
            route={selectedRoute}
            recommendedRoute={recommendedRoute}
            onSelectRecommended={() => setSelectedRouteId(recommendedRoute?.id || intelligence.recommendedRouteId || routes[0]?.id || selectedRoute.id)}
          />
        )}

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

        {selectedFullMemo && !isOutcomeOnlyTrack ? (
          <section id="full-decision-memo" className="border-t border-border/40 pt-10">
            <SectionHeader
              label={`Full Release Readiness Memo · Route ${selectedRoute.rank}`}
              title={`${selectedRoute.routeName} release-readiness memo.`}
            />
            <div className="rounded-lg border border-border/25 bg-background/40 px-0 py-6 sm:px-2">
              {selectedFullMemo}
            </div>
          </section>
        ) : null}

        {selectedFullMemo && !isOutcomeOnlyTrack ? null : (
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
