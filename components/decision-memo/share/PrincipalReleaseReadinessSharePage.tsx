"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpRight, ClipboardCheck } from "lucide-react";
import { EliteCitationPanel } from "@/components/elite/elite-citation-panel";
import { useCitationManager } from "@/hooks/use-citation-manager";
import { formatUsdCompact } from "@/lib/decision-memo/route-intelligence-v2";
import type {
  ReleaseReadinessMethodDriver,
  ReleaseReadinessMethodSource,
  ReleaseReadinessShareGateRow,
  ReleaseReadinessSharePayload,
  ReleaseReadinessShareRouteOption,
  ReleaseReadinessShareSource,
  ReleaseReadinessPrivateEvidence,
  ReleaseReadinessShareReportSection,
  ReleaseReadinessShareCard,
  ReleaseReadinessShareChartSeries,
} from "@/lib/decision-memo/build-release-readiness-share-surface";

type ViewMode = "principal" | "linear" | "evidence" | "methodology";

interface PrincipalReleaseReadinessSharePageProps {
  reference: string;
  payload: ReleaseReadinessSharePayload | null;
  initialSurfaceError: string | null;
}

const VIEW_LABELS: Array<{ id: ViewMode; label: string; description: string }> = [
  { id: "principal", label: "Principal Route View", description: "Decision, capital rule, gates, and stop conditions." },
  { id: "linear", label: "Linear Brief", description: "Readable memo path without workroom machinery." },
  { id: "evidence", label: "Evidence Vault", description: "Public source register and private evidence index." },
  { id: "methodology", label: "Methodology", description: "Controlled method receipt, not raw process output." },
];

function numberValue(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function money(value: unknown, fallback = "Release-gated"): string {
  const numeric = numberValue(value);
  return numeric > 0 ? formatUsdCompact(numeric) : fallback;
}

function cleanDisplayText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/\bRelease Differently\b/gi, "Gated negotiation only")
    .replace(/\bproceed[-\s]modified\b/gi, "Proceed under signed gates")
    .replace(/\bPreferred modified route only if\b/gi, "Preferred direct route only if")
    .replace(/\bPreferred modified route\b/gi, "Preferred direct route under signed gates")
    .replace(/\bremains Proceed under signed gates\b/gi, "remains gated")
    .replace(/\bShould the family release the purchase route now,\s*Gated negotiation only,\s*hold,\s*or stop\?/gi, "Should the family advance under signed gates, hold, or stop?")
    .replace(/\bHouse Signal Rail\b/gi, "Route Control Summary")
    .replace(/\bDecision EV\b/gi, "Internal model output - not release authority")
    .replace(/\bRoute Source Records\b/gi, "Methodology records - not legal proof")
    .replace(/\bOPEN GATES\b/gi, "Release Gate Status")
    .replace(/\bOpen Release Gates\b/gi, "Release Gate Status")
    .replace(/\b0\s+to\s+close\b/gi, "Evidence pending")
    .replace(/\bAll listed release gates have assigned owners\b/gi, "Gate ownership assigned; release evidence pending")
    .replace(/\bDOCUMENTED\b/g, "Indexed for review")
    .replace(/\bDocumented\b/g, "Indexed for review")
    .replace(/\bFull Decision Memo\b/gi, "Release Readiness Review")
    .replace(/\bDecision Memo\b/gi, "Release Readiness Review")
    .replace(/\bPressure Test\b/gi, "Release Readiness Review")
    .replace(/\bPressure Variants Tested\b/gi, "Release Readiness Routes Reviewed")
    .replace(/\bpressure-test(?:ed|ing)?\b/gi, "release-readiness reviewed")
    .replace(/\bpressure\b/gi, "readiness")
    .replace(/\bNative Route Drivers\b/gi, "Route Drivers From Source Review")
    .replace(/\bG1\s*\/\s*G2\s*\/\s*G3\b/g, "founder / named family user / next-generation record")
    .replace(/\bG1\s*->\s*G2\s*->\s*G3\b/g, "generation-to-generation")
    .replace(/\bG1 principal\b/gi, "principal")
    .replace(/\bG2 son\b/gi, "named family user")
    .replace(/\bG2 daughter\s*\/\s*fairness owner\b/gi, "named family-fairness owner")
    .replace(/\bdaughter\s*\/\s*fairness owner\b/gi, "named family-fairness owner")
    .replace(/\bdaughter\/fairness\b/gi, "family-fairness")
    .replace(/\bG3 grandson\b/gi, "next-generation record")
    .replace(/\bfuture-grandchild\b/gi, "next-generation")
    .replace(/\bgrandson\b/gi, "next-generation record")
    .replace(/\bson-use\b/gi, "named family-user")
    .replace(/\bson use\b/gi, "named family-user")
    .replace(/\bnamed family user-use\b/gi, "named family-user use")
    .replace(/\bspouse veto if relevant\b/gi, "family-home veto position where recorded")
    .replace(/\bspouse if relevant\b/gi, "family-home veto holder where recorded")
    .replace(/\bspouse veto\b/gi, "family-home veto position")
    .replace(/\bSIX-BOOK OPENING\b/gi, "Decision Opening")
    .replace(/\bSix-book opening\b/gi, "Decision opening")
    .replace(/\bDM64\b/g, "release-readiness compiler")
    .replace(/\bGranthika\b/g, "source library")
    .replace(/\bAquarium\b/g, "source-review memory")
    .replace(/\bCastle Briefs?\b/g, "Source records")
    .replace(/\bcastle briefs?\b/gi, "source records")
    .replace(/\s+/g, " ")
    .trim();
}

function citationNumber(citationMap: Map<string, number>, id: string): number | null {
  return citationMap.get(id) ?? citationMap.get(id.toLowerCase()) ?? null;
}

function MetricCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-md border border-border bg-card/80 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-normal text-foreground">{value}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{note}</p>
    </div>
  );
}

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border py-10">
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">{eyebrow}</p> : null}
      <h2 className="mt-2 text-2xl font-semibold tracking-normal text-foreground md:text-3xl">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function SourceButton({
  source,
  citationMap,
  onClick,
}: {
  source: ReleaseReadinessMethodSource;
  citationMap: Map<string, number>;
  onClick: (id: string) => void;
}) {
  const number = citationNumber(citationMap, source.id);
  if (!number) return null;

  return (
    <button
      type="button"
      onClick={() => onClick(source.id)}
      className="inline-flex h-7 items-center rounded-full border border-primary/30 px-2.5 text-xs font-semibold text-primary transition hover:bg-primary/10"
    >
      [{number}]
    </button>
  );
}

export function PrincipalRouteView({ payload }: { payload: ReleaseReadinessSharePayload }) {
  const metrics = payload.selectedRoute.metrics;

  return (
    <>
      <section className="grid gap-6 border-t border-border py-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Principal route view</p>
          <h1 className="mt-4 max-w-5xl text-4xl font-semibold tracking-normal text-foreground md:text-6xl">
            {cleanDisplayText(payload.title)}
          </h1>
          <p className="mt-5 max-w-4xl text-lg leading-8 text-muted-foreground">{cleanDisplayText(payload.move)}</p>
        </div>
        <div className="rounded-md border border-border bg-card/90 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Reference</p>
          <p className="mt-2 font-mono text-lg font-semibold text-foreground">{payload.reference}</p>
          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Corridor</p>
          <p className="mt-2 text-lg font-semibold leading-7 text-foreground">{cleanDisplayText(payload.corridor)}</p>
          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Release stance</p>
          <p className="mt-2 text-lg font-semibold text-primary">{cleanDisplayText(payload.decision)}</p>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="All-in exposure"
          value={money(metrics.totalAcquisitionCostUsd)}
          note="Modeled before operating costs; final release remains counsel, bank, title, and family-authority gated."
        />
        <MetricCard
          label="Duty drag"
          value={money(metrics.totalDutiesUsd)}
          note={`${metrics.dutyDragPct ? metrics.dutyDragPct.toFixed(2) : "Release-gated"}% of property value in the selected control case.`}
        />
        <MetricCard
          label="Capital rule"
          value="No release"
          note="No exchange, deposit, or seller commitment before signed route gates."
        />
        <MetricCard label="Mitigation clock" value="72h / 7d" note={cleanDisplayText(payload.mitigation)} />
      </div>

      <Section eyebrow="Decision packet" title="What is approved, blocked, and required">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-md border border-emerald-500/25 bg-emerald-500/5 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Decision</p>
            <h3 className="mt-3 text-2xl font-semibold text-foreground">{cleanDisplayText(payload.decision)}</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{cleanDisplayText(payload.rationale)}</p>
          </div>
          <div className="rounded-md border border-primary/25 bg-primary/5 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Release rule</p>
            <h3 className="mt-3 text-2xl font-semibold text-foreground">{cleanDisplayText(payload.releaseRule)}</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{cleanDisplayText(payload.capitalRule)}</p>
          </div>
          <div className="rounded-md border border-amber-500/25 bg-amber-500/5 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">Purpose boundary</p>
            <h3 className="mt-3 text-2xl font-semibold text-foreground">Family use only</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{cleanDisplayText(payload.purpose)}</p>
          </div>
        </div>
      </Section>

      <ReleaseGateTable gateRows={payload.gateRows} />

      <Section eyebrow="Route options" title="Routes reviewed against the proposed move">
        <div className="grid gap-4 lg:grid-cols-5">
          {payload.routeOptions.map((option) => (
            <RouteOptionCard
              key={option.id}
              option={option}
              selected={option.id === payload.selectedRoute.id}
            />
          ))}
        </div>
      </Section>

      <Section eyebrow="Review handoff" title="Where the full depth now sits">
        <div className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-md border border-border bg-card/70 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Principal View</p>
            <h3 className="mt-3 text-lg font-semibold leading-7 text-foreground">Decision control only</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              This page keeps the buyer-side answer visible: what is approved, what cannot release, which route is under review, and which gates must clear.
            </p>
          </article>
          <article className="rounded-md border border-border bg-card/70 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Route View</p>
            <h3 className="mt-3 text-lg font-semibold leading-7 text-foreground">Reviewer depth and full memo</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Projections, crisis resilience, generation-to-generation succession, route drivers, scenario tree, counsel pack, and full route memo stay in the reviewer layer.
            </p>
            <a
              href={`/release-readiness/review/${encodeURIComponent(payload.reference)}?view=route`}
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Open Route View <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </article>
          <article className="rounded-md border border-border bg-card/70 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Evidence & Methodology</p>
            <h3 className="mt-3 text-lg font-semibold leading-7 text-foreground">Proof ledger and source boundary</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Legal, tax, property, banking, family governance, structures, adviser, and source-review records are kept separate from the principal decision surface.
            </p>
            <a
              href={`/release-readiness/review/${encodeURIComponent(payload.reference)}?view=evidence`}
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Open Evidence <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </article>
        </div>
      </Section>
    </>
  );
}

function ReleaseGateTable({ gateRows }: { gateRows: ReleaseReadinessShareGateRow[] }) {
  return (
    <Section eyebrow="Release gates" title="A gate is closed only when signed, verified, or formally waived">
      <div className="overflow-hidden rounded-md border border-border">
        <div className="grid grid-cols-1 border-b border-border bg-muted/40 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground md:grid-cols-[0.8fr_0.55fr_1.2fr_1fr]">
          <span>Gate</span>
          <span>State</span>
          <span>Release condition</span>
          <span>Decision consequence</span>
        </div>
        {gateRows.map((row, index) => (
          <div
            key={`${row.gate}-${index}`}
            className="grid grid-cols-1 gap-3 border-b border-border px-4 py-4 last:border-b-0 md:grid-cols-[0.8fr_0.55fr_1.2fr_1fr]"
          >
            <p className="font-semibold text-foreground">{cleanDisplayText(row.gate)}</p>
            <p className="text-sm font-semibold text-primary">{cleanDisplayText(row.state)}</p>
            <p className="text-sm leading-6 text-muted-foreground">{cleanDisplayText(row.condition)}</p>
            <p className="text-sm leading-6 text-muted-foreground">{cleanDisplayText(row.consequence)}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function RouteOptionCard({ option, selected }: { option: ReleaseReadinessShareRouteOption; selected: boolean }) {
  return (
    <div className={`rounded-md border p-4 ${selected ? "border-primary bg-primary/5" : "border-border bg-card/70"}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Route {option.rank}</p>
      <h3 className="mt-3 text-lg font-semibold leading-6 text-foreground">{cleanDisplayText(option.routeName)}</h3>
      <p className="mt-3 text-sm font-semibold text-primary">{cleanDisplayText(option.releaseRule)}</p>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{cleanDisplayText(option.bestUse)}</p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Duties</p>
          <p className="font-semibold text-foreground">{money(option.metrics.totalDutiesUsd, "No purchase")}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Drag</p>
          <p className="font-semibold text-foreground">{option.metrics.dutyDragPct.toFixed(2)}%</p>
        </div>
      </div>
    </div>
  );
}

function ReportCard({ card }: { card: ReleaseReadinessShareCard }) {
  return (
    <article className="rounded-md border border-border bg-card/70 p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {cleanDisplayText(card.label)}
      </p>
      {card.value ? <p className="mt-3 text-2xl font-semibold text-foreground">{cleanDisplayText(card.value)}</p> : null}
      {card.title ? <h3 className="mt-3 text-lg font-semibold leading-7 text-foreground">{cleanDisplayText(card.title)}</h3> : null}
      {card.body ? <p className="mt-3 text-sm leading-6 text-muted-foreground">{cleanDisplayText(card.body)}</p> : null}
      {card.owner ? <p className="mt-3 text-sm font-semibold text-primary">{cleanDisplayText(card.owner)}</p> : null}
      {card.status ? <p className="mt-3 text-sm font-semibold text-foreground">{cleanDisplayText(card.status)}</p> : null}
      {card.releaseCondition ? (
        <p className="mt-3 border-t border-border pt-3 text-sm leading-6 text-muted-foreground">
          <span className="font-semibold text-foreground">Release condition:</span>{" "}
          {cleanDisplayText(card.releaseCondition)}
        </p>
      ) : null}
    </article>
  );
}

function ReportTable({ table }: { table: NonNullable<ReleaseReadinessShareReportSection["table"]> }) {
  if (!table.rows.length) return null;

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-muted/40 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          <tr>
            {table.columns.map((column) => (
              <th key={column} className="border-b border-border px-4 py-3 font-semibold">
                {cleanDisplayText(column)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr key={`${row.join("-")}-${rowIndex}`} className="border-b border-border last:border-b-0">
              {row.map((cell, cellIndex) => (
                <td
                  key={`${cell}-${cellIndex}`}
                  className={`min-w-48 px-4 py-4 align-top leading-6 ${
                    cellIndex === 0 ? "font-semibold text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {cleanDisplayText(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProjectionChart({ series }: { series: ReleaseReadinessShareChartSeries[] }) {
  const active = series.filter((item) => item.points.length);
  if (!active.length) return null;

  const allValues = active.flatMap((item) => item.points.map((point) => point.value)).filter((value) => value > 0);
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const width = 860;
  const height = 260;
  const left = 64;
  const right = 24;
  const top = 22;
  const bottom = 38;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const colors = ["#111827", "#b91c1c", "#8a6a19", "#64748b"];
  const xFor = (year: number) => left + (Math.max(0, Math.min(10, year)) / 10) * chartWidth;
  const yFor = (value: number) => {
    if (max === min) return top + chartHeight / 2;
    return top + chartHeight - ((value - min) / (max - min)) * chartHeight;
  };

  return (
    <div className="rounded-md border border-border bg-card/70 p-5">
      <div className="flex flex-wrap gap-4">
        {active.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
            <span className="font-semibold text-foreground">{cleanDisplayText(item.name)}</span>
            <span>{cleanDisplayText(item.verdict)}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[720px]">
          {[0, 1, 2, 3].map((tick) => {
            const y = top + (tick / 3) * chartHeight;
            const value = max - (tick / 3) * (max - min);
            return (
              <g key={tick}>
                <line x1={left} x2={width - right} y1={y} y2={y} stroke="currentColor" className="text-border" />
                <text x={0} y={y + 4} className="fill-muted-foreground text-[11px]">
                  {formatUsdCompact(value)}
                </text>
              </g>
            );
          })}
          {[0, 2, 4, 6, 8, 10].map((year) => (
            <text key={year} x={xFor(year) - 8} y={height - 8} className="fill-muted-foreground text-[11px]">
              Y{year}
            </text>
          ))}
          {active.map((item, index) => {
            const points = item.points.map((point) => `${xFor(point.year)},${yFor(point.value)}`).join(" ");
            return (
              <polyline
                key={item.name}
                points={points}
                fill="none"
                stroke={colors[index % colors.length]}
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function FullReportSections({ sections }: { sections: ReleaseReadinessShareReportSection[] }) {
  if (!sections.length) return null;

  return (
    <>
      {sections.map((section) => (
        <Section key={section.id} eyebrow={section.eyebrow} title={section.title}>
          <div className="space-y-6">
            {section.intro ? (
              <p className="max-w-5xl text-base leading-8 text-muted-foreground">{cleanDisplayText(section.intro)}</p>
            ) : null}
            {section.cards?.length ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {section.cards.map((card, index) => (
                  <ReportCard key={`${section.id}-card-${index}`} card={card} />
                ))}
              </div>
            ) : null}
            {section.chart?.length ? <ProjectionChart series={section.chart} /> : null}
            {section.table ? <ReportTable table={section.table} /> : null}
            {section.bullets?.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {section.bullets.map((bullet, index) => (
                  <p key={`${section.id}-bullet-${index}`} className="rounded-md border border-border bg-card/70 p-4 text-sm leading-6 text-muted-foreground">
                    {cleanDisplayText(bullet)}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        </Section>
      ))}
    </>
  );
}

function LinearBriefView({ payload }: { payload: ReleaseReadinessSharePayload }) {
  const sections = [
    {
      title: "Recommendation",
      body: `${payload.decision}. The approved purpose is ${payload.purpose.toLowerCase()} ${payload.capitalRule}`,
    },
    {
      title: "Control Case",
      body:
        "Direct individual buyer route. No wrapper, residence-planning, relief, refund, or future-status benefit is credited before counsel signs the facts at the transaction trigger.",
    },
    { title: "Advance Conditions", body: payload.advanceConditions.join(" ") },
    { title: "Hold Conditions", body: payload.holdConditions.join(" ") },
    { title: "Stop Conditions", body: payload.stopConditions.join(" ") },
  ].filter((section) => section.body.trim());

  return (
    <Section eyebrow="Linear brief" title="The shareable memo path">
      <div className="space-y-5">
        {sections.map((section) => (
          <div key={section.title} className="rounded-md border border-border bg-card/70 p-5">
            <h3 className="text-xl font-semibold text-foreground">{section.title}</h3>
            <p className="mt-3 text-base leading-8 text-muted-foreground">{cleanDisplayText(section.body)}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function EvidenceVaultView({
  publicSources,
  privateEvidence,
}: {
  publicSources: ReleaseReadinessShareSource[];
  privateEvidence: ReleaseReadinessPrivateEvidence[];
}) {
  const groupedSources = publicSources.reduce<Record<string, ReleaseReadinessShareSource[]>>((groups, source) => {
    const category = source.category || "Source Register";
    groups[category] = groups[category] || [];
    groups[category].push(source);
    return groups;
  }, {});

  return (
    <>
      <Section eyebrow="Evidence boundary" title="Transparency without mixing evidence authority">
        <div className="rounded-md border border-primary/25 bg-primary/5 p-5">
          <p className="text-base leading-8 text-foreground">
            Public legal, tax, property, market, and FX claims are source-backed below. Private bank, title,
            seller, source-of-funds, and family-authority claims are release gates until signed or indexed in
            the data room. Source-review records explain why a gate matters; they do not prove legal status,
            bank acceptance, title, valuation, tax treatment, or family authority.
          </p>
        </div>
      </Section>

      <Section eyebrow="Public source register" title="Claims, sources, and decision boundaries">
        <div className="space-y-8">
          {Object.entries(groupedSources).map(([category, sources]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold text-foreground">{cleanDisplayText(category)}</h3>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {sources.map((source) => (
                  <article key={source.id} className="rounded-md border border-border bg-card/70 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          {cleanDisplayText(source.institution)}
                        </p>
                        <h4 className="mt-2 text-lg font-semibold leading-7 text-foreground">{cleanDisplayText(source.title)}</h4>
                      </div>
                      {source.url ? (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground hover:bg-muted"
                        >
                          Open <ArrowUpRight className="h-3.5 w-3.5" />
                        </a>
                      ) : null}
                    </div>
                    <p className="mt-3 text-xs font-medium text-primary">{cleanDisplayText(source.date)}</p>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{cleanDisplayText(source.claim)}</p>
                    <p className="mt-3 border-t border-border pt-3 text-sm leading-6 text-muted-foreground">
                      <span className="font-semibold text-foreground">Decision boundary:</span>{" "}
                      {cleanDisplayText(source.boundary)}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Private evidence index" title="Redacted document classes, owners, and release use">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {privateEvidence.map((item, index) => (
            <article key={`${item.label}-${index}`} className="rounded-md border border-border bg-card/70 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {cleanDisplayText(item.status)}
              </p>
              <h3 className="mt-3 text-lg font-semibold leading-7 text-foreground">{cleanDisplayText(item.label)}</h3>
              <p className="mt-3 text-sm font-semibold text-primary">{cleanDisplayText(item.owner)}</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{cleanDisplayText(item.decisionUse)}</p>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}

function MethodologyView({
  drivers,
  citationMap,
  onCitationClick,
}: {
  drivers: ReleaseReadinessMethodDriver[];
  citationMap: Map<string, number>;
  onCitationClick: (id: string) => void;
}) {
  const methodRows = [
    ["Route classification", "Direct, wrapper, residence/replacement, rent-first, and stop/reset routes.", "Private family records and raw scoring details."],
    ["Gate standard", "Tax, title, bank, source-of-funds, family authority, bid discipline, and decision memory.", "Private document contents and adviser correspondence."],
    ["Evidence standard", "Public source, private document, counsel confirmation, bank acceptance, and family minute.", "Unredacted bank, title, source, and authority files."],
    ["Source-review support", "Source records identify failure modes and why a release gate matters.", "Raw source-review rows and proprietary similarity logic."],
    ["Output rule", "Every insight must become a gate, owner, source, release condition, or stop rule.", "Transformation and weighting internals."],
  ];

  return (
    <>
      <Section eyebrow="Methodology receipt" title="How the route was reviewed">
        <div className="rounded-md border border-border bg-card/70 p-5">
          <p className="text-base leading-8 text-foreground">
            This view shows the gate framework used to review the route. It does not expose raw source-review rows,
            proprietary weighting, scoring logic, or private family records. The purpose is to show how the decision was
            controlled, not to publish the workroom.
          </p>
        </div>
        <div className="mt-5 overflow-hidden rounded-md border border-border">
          <div className="grid grid-cols-1 border-b border-border bg-muted/40 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground md:grid-cols-3">
            <span>Method step</span>
            <span>What the reader sees</span>
            <span>What stays protected</span>
          </div>
          {methodRows.map(([step, visible, protectedText]) => (
            <div key={step} className="grid grid-cols-1 gap-3 border-b border-border px-4 py-4 last:border-b-0 md:grid-cols-3">
              <p className="font-semibold text-foreground">{step}</p>
              <p className="text-sm leading-6 text-muted-foreground">{visible}</p>
              <p className="text-sm leading-6 text-muted-foreground">{protectedText}</p>
            </div>
          ))}
        </div>
      </Section>

      {drivers.length ? (
        <Section eyebrow="Source-review drivers" title="Why the gate set exists">
          <div className="grid gap-4 lg:grid-cols-2">
            {drivers.map((driver) => (
              <article key={driver.id} className="rounded-md border border-border bg-card/70 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {cleanDisplayText(driver.title)}
                </p>
                <p className="mt-3 text-base leading-7 text-foreground">{cleanDisplayText(driver.driver)}</p>
                {driver.releaseRead ? (
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    <span className="font-semibold text-foreground">Release read:</span>{" "}
                    {cleanDisplayText(driver.releaseRead)}
                  </p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  {driver.sources.map((source) => (
                    <SourceButton
                      key={source.id}
                      source={source}
                      citationMap={citationMap}
                      onClick={onCitationClick}
                    />
                  ))}
                </div>
              </article>
            ))}
          </div>
        </Section>
      ) : null}
    </>
  );
}

export default function PrincipalReleaseReadinessSharePage({
  reference,
  payload,
  initialSurfaceError,
}: PrincipalReleaseReadinessSharePageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedView = searchParams.get("view") as ViewMode | null;
  const [activeView, setActiveView] = useState<ViewMode>(
    requestedView && VIEW_LABELS.some((view) => view.id === requestedView) ? requestedView : "principal",
  );
  const citationSeeds = useMemo(() => payload?.citations ?? [], [payload]);
  const {
    citations,
    setCitations,
    citationMap,
    selectedCitationId,
    setSelectedCitationId,
    isPanelOpen,
    openCitation,
    closePanel,
  } = useCitationManager(citationSeeds);

  useEffect(() => {
    setCitations(citationSeeds);
  }, [citationSeeds, setCitations]);

  useEffect(() => {
    if (requestedView && VIEW_LABELS.some((view) => view.id === requestedView)) {
      setActiveView(requestedView);
    }
  }, [requestedView]);

  const changeView = (view: ViewMode) => {
    setActiveView(view);
    router.replace(`/release-readiness/review/${encodeURIComponent(reference)}?view=${view}`, { scroll: false });
  };

  if (initialSurfaceError && !payload) {
    return (
      <main className="min-h-screen bg-background px-5 py-12">
        <div className="mx-auto max-w-3xl rounded-md border border-border bg-card p-8">
          <h1 className="text-3xl font-semibold text-foreground">Release Readiness Review Unavailable</h1>
          <p className="mt-4 text-muted-foreground">{initialSurfaceError}</p>
        </div>
      </main>
    );
  }

  if (!payload) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 lg:px-10">
        <header className="flex flex-col gap-5 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="HNWI Chronicles" width={42} height={42} className="h-10 w-10" priority />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">HNWI Chronicles</p>
              <p className="text-sm text-muted-foreground">Release Readiness Review</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(window.location.href)}
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            <ClipboardCheck className="h-4 w-4" />
            Share URL
          </button>
        </header>

        <div className="mt-6 rounded-md border border-primary/30 bg-primary/5 p-4">
          <p className="text-sm leading-6 text-foreground">
            <span className="font-semibold">Evidence boundary:</span> Public claims are source-backed in the Evidence Vault.
            Private bank, title, seller, source-of-funds, and family-authority claims remain release gates until signed or indexed.
            Source-review records explain gate relevance; they do not prove legal status, bank acceptance, title, valuation,
            tax treatment, or family authority.
          </p>
        </div>

        <nav
          className="sticky z-30 mt-6 border-b border-border bg-background/95 py-3 backdrop-blur"
          style={{ top: "var(--app-shell-offset-top, 0px)" }}
        >
          <div className="flex gap-2 overflow-x-auto pb-1">
            {VIEW_LABELS.map((view) => (
              <button
                key={view.id}
                type="button"
                onClick={() => changeView(view.id)}
                className={`min-w-fit rounded-md border px-4 py-3 text-left transition ${
                  activeView === view.id
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                <span className="block text-sm font-semibold">{view.label}</span>
                <span className="mt-1 block max-w-64 text-xs leading-5">{view.description}</span>
              </button>
            ))}
          </div>
        </nav>

        {activeView === "principal" ? <PrincipalRouteView payload={payload} /> : null}
        {activeView === "linear" ? <LinearBriefView payload={payload} /> : null}
        {activeView === "evidence" ? (
          <EvidenceVaultView publicSources={payload.publicSources} privateEvidence={payload.privateEvidence} />
        ) : null}
        {activeView === "methodology" ? (
          <MethodologyView drivers={payload.methodDrivers} citationMap={citationMap} onCitationClick={openCitation} />
        ) : null}
      </div>

      {isPanelOpen ? (
        <EliteCitationPanel
          citations={citations}
          selectedCitationId={selectedCitationId}
          onClose={closePanel}
          onCitationSelect={setSelectedCitationId}
          citationMap={citationMap}
          preferRemoteSources
        />
      ) : null}
    </main>
  );
}
