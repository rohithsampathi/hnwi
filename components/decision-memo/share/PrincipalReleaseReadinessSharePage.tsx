"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight, ClipboardCheck, Crown, Route as RouteIcon, ScrollText } from "lucide-react";
import { EliteCitationPanel } from "@/components/elite/elite-citation-panel";
import { useCitationManager } from "@/hooks/use-citation-manager";
import HouseDecisionMemoLinearReport from "@/components/decision-memo/memo/DecisionMemoLinearReport";
import RouteIntelligenceV2Report from "@/components/decision-memo/v2/RouteIntelligenceV2Report";
import { buildPublicRouteScopedMemoSurface } from "@/lib/decision-memo/build-release-readiness-public-linear-memo";
import { formatUsdCompact, type RouteIntelligenceV2 } from "@/lib/decision-memo/route-intelligence-v2";
import type { Citation } from "@/lib/parse-dev-citations";
import type { CitationSourceDevelopment } from "@/lib/development-citation";
import type {
  ReleaseReadinessEvidenceMethodologySection,
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

type ViewMode = "principal" | "route" | "evidence";

interface PrincipalReleaseReadinessSharePageProps {
  reference: string;
  payload: ReleaseReadinessSharePayload | null;
  initialSurfaceError: string | null;
}

const VIEW_LABELS: Array<{ id: ViewMode; label: string; description: string }> = [
  { id: "principal", label: "Principal View", description: "Family decision, capital rule, gates, and consequences." },
  { id: "route", label: "Route View", description: "Full route memo with scenario, crisis, succession, and execution depth." },
  { id: "evidence", label: "Evidence & Methodology", description: "Source register, evidence boundary, and method receipt." },
];

function ViewModeIcon({ view }: { view: ViewMode }) {
  const Icon = view === "route" ? RouteIcon : view === "evidence" ? ScrollText : Crown;
  return <Icon className="h-5 w-5" />;
}

function normalizeViewMode(value: string | null): ViewMode {
  if (value === "route") return "route";
  if (value === "evidence") return "evidence";
  if (value === "methodology") return "evidence";
  return "principal";
}

function completedRouteIntelligence(payload: ReleaseReadinessSharePayload): RouteIntelligenceV2 {
  return payload.routeIntelligenceV2;
}

function numberValue(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function money(value: unknown, fallback = "Signed gate controls release"): string {
  const numeric = numberValue(value);
  if (numeric <= 0) return fallback;
  const absolute = Math.abs(numeric);
  const sign = numeric < 0 ? "-" : "";
  if (absolute >= 1_000_000) return `${sign}~US$${(absolute / 1_000_000).toFixed(1)}M`;
  if (absolute >= 1_000) return `${sign}~US$${Math.round(absolute / 1_000).toLocaleString("en-US")}K`;
  return `${sign}~US$${Math.round(absolute).toLocaleString("en-US")}`;
}

function compactExactUsdInText(value: string): string {
  return value
    .replace(/\bUS\$([0-9]{1,3}(?:,[0-9]{3})+)\b/g, (_match, raw: string) => {
      const numeric = Number(raw.replace(/,/g, ""));
      if (!Number.isFinite(numeric) || numeric <= 0) return `US$${raw}`;
      const absolute = Math.abs(numeric);
      if (absolute >= 1_000_000) return `~US$${(absolute / 1_000_000).toFixed(1)}M`;
      if (absolute >= 1_000) return `~US$${Math.round(absolute / 1_000).toLocaleString("en-US")}K`;
      return `~US$${Math.round(absolute).toLocaleString("en-US")}`;
    })
    .replace(/\bUS\$([0-9]+(?:\.[0-9]{2,}))([MB])\b/g, (_match, raw: string, suffix: string) => {
      const numeric = Number(raw);
      if (!Number.isFinite(numeric)) return `US$${raw}${suffix}`;
      return `US$${numeric.toFixed(1).replace(/\.0$/, "")}${suffix}`;
    });
}

function cleanDisplayText(value: unknown): string {
  if (typeof value !== "string") return "";
  return compactExactUsdInText(value)
    .replace(/\bRelease Differently\b/gi, "Approved to negotiate under signed gates; no capital release")
    .replace(/\bGated negotiation only only\b/gi, "Approved to negotiate under signed gates; no capital release")
    .replace(/\bGated negotiation only\b/gi, "Approved to negotiate under signed gates; no capital release")
    .replace(/\bproceed[-\s]modified\b/gi, "Proceed under signed gates")
    .replace(/\bas a London family base,\s*education\/continuity node,\s*and capital-preservation asset\b/gi, "as a proposed London family-use acquisition, with education, residence, succession, and capital-preservation claims treated as separate gates")
    .replace(/\bcurrent the corridor read\b/gi, "current corridor read")
    .replace(/\bcurrent the corridor\b/gi, "current corridor")
    .replace(/\bPreferred modified route only if\b/gi, "Preferred direct route only if")
    .replace(/\bPreferred modified route\b/gi, "Preferred direct route under signed gates")
    .replace(/\bremains Proceed under signed gates\b/gi, "remains gated")
    .replace(/\bShould the family release the purchase route now,\s*Gated negotiation only,\s*hold,\s*or stop\?/gi, "Should the family advance under signed gates, hold, or stop?")
    .replace(/\bHouse Signal Rail\b/gi, "Route Control Summary")
    .replace(/\bDecision EV\b/gi, "Scenario discipline output - not release authority")
    .replace(/\bExpected value creation\b/gi, "Scenario discipline output")
    .replace(/\bExpected Net Worth\b/gi, "Scenario net position")
    .replace(/\bNet Benefit\b/gi, "Route discipline read")
    .replace(/\bcompiler internals\b/gi, "private build details")
    .replace(/\bScore\s+\d+\s*\/\s*100\.?/gi, "Readiness score evidence-gated.")
    .replace(/\b\d+\s*\/\s*100\b/g, "readiness score evidence-gated")
    .replace(/\b50\s*\/\s*30\s*\/\s*20 probability scenarios\b/gi, "base, stress, and opportunity scenario discipline; not a forecast")
    .replace(/\b50\s*\/\s*30\s*\/\s*20 probabilities\b/gi, "base / stress / opportunity scenario weights; not a forecast")
    .replace(/\bRoute Source Records\b/gi, "Methodology records - not legal proof")
    .replace(/\bOPEN GATES\b/gi, "Release Gate Status")
    .replace(/\bOpen Release Gates\b/gi, "Release Gate Status")
    .replace(/\b0\s+to\s+close\b/gi, "Evidence mapped")
    .replace(/\bAll listed release gates have assigned owners\b/gi, "Gate ownership assigned; release evidence mapped")
    .replace(/\binsurance\/security file\b/gi, "insurance quote and security plan")
    .replace(/\bseller conditions\b/gi, "seller identity, seller authority, exclusivity terms, deposit condition, and completion timetable")
    .replace(/\bdeposit rail\b/gi, "deposit account, conveyancer client-account details, transfer path, and release condition")
    .replace(/\bDOCUMENTED\b/g, "Indexed for review")
    .replace(/\bDocumented\b/g, "Indexed for review")
    .replace(/\bRisk level\b/gi, "Release status")
    .replace(/\bHigh until release gates clear\b/gi, "Evidence mapped; no capital release until signed approval gates")
    .replace(/\bData quality\b/gi, "Evidence status")
    .replace(/\bRelease-gated\b/gi, "Public claims source-backed; private claims gate-controlled")
    .replace(/\bfallback signer\b/gi, "alternate signer")
    .replace(/\bfallback rails\b/gi, "alternate rails")
    .replace(/\bfallback rail\b/gi, "alternate rail")
    .replace(/\bfallback\b/gi, "alternate")
    .replace(
      /\bLooks like prime London capital preservation even though the economics are control\/use-led after duty drag\.?/gi,
      "Appears like a capital-preservation purchase, but economics are family-use and control-led after duty drag."
    )
    .replace(
      /\bCapital should not move while the transfer path is only narrated\.?/gi,
      "Capital remains blocked until the transfer path is bank-accepted in writing."
    )
    .replace(/\ba undocumented family expectation\b/gi, "an undocumented family expectation")
    .replace(/\bDestination tax counsel\b/gi, "UK tax counsel")
    .replace(/\bDestination property counsel\b/gi, "UK property counsel")
    .replace(
      /\bThe asset cannot become a silent family promise or future conflict point\.?/gi,
      "Use rights, carry, and veto must be written so the property does not become an implied future entitlement."
    )
    .replace(
      /\bThe purchase must remain legible six years later without relying on founder memory\.?/gi,
      "The purchase must remain explainable later without relying on memory or informal understandings."
    )
    .replace(/\bFull Decision Memo\b/gi, "Release Readiness Review")
    .replace(/\bDecision Memo\b/gi, "Release Readiness Review")
    .replace(/\bPressure Test\b/gi, "Release Readiness Review")
    .replace(/\bPressure Variants Tested\b/gi, "Release Readiness Routes Reviewed")
    .replace(/\bpressure-test(?:ed|ing)?\b/gi, "release-readiness reviewed")
    .replace(/\bpressure\b/gi, "readiness")
    .replace(/\bNative Route Drivers\b/gi, "Route Drivers From Source Review")
    .replace(/\bg1[_-]g2[_-]g3\b/gi, "generation_to_generation")
    .replace(/\bG1\s*\/\s*G2\s*\/\s*G3\b/gi, "G1 / G2 / G3 continuity chain")
    .replace(/\bG1\s*->\s*G2\s*->\s*G3\b/gi, "G1 -> G2 -> G3 continuity chain")
    .replace(/\bG1\s*→\s*G2\s*→\s*G3\b/gi, "G1 -> G2 -> G3 continuity chain")
    .replace(/\bG1\s*->\s*G2 operating transfer\b/gi, "G1 -> G2 operating transfer")
    .replace(/\bG1 founder\s*\/\s*principal\b/gi, "G1 principal")
    .replace(/\bFounder authority\b/gi, "Principal authority")
    .replace(/\bfounder authority\b/gi, "principal authority")
    .replace(/\bFounder\b/g, "Principal")
    .replace(/\bfounder\b/g, "principal")
    .replace(/\bPrincipal\s*\/\s*principal\b/gi, "Principal")
    .replace(/\bprincipal\s*\/\s*principal\b/gi, "Principal")
    .replace(/\bG2 fairness owner\b/gi, "G2 fairness owner")
    .replace(/\bG3 memory\b/gi, "G3 decision record")
    .replace(/\bsix years later\b/gi, "later")
    .replace(/\bG2 son\b/gi, "G2 named family user")
    .replace(/\bG2 daughter\s*\/\s*fairness owner\b/gi, "G2 fairness owner")
    .replace(/\bdaughter\s*\/\s*fairness owner\b/gi, "G2 fairness owner")
    .replace(/\bdaughter\/fairness\b/gi, "G2 fairness")
    .replace(
      /\bnamed family user\s*\/\s*named family user\s+named family-fairness owner\b/gi,
      "Named family user / named family-fairness owner",
    )
    .replace(/\bG3 grandson\b/gi, "G3 next-generation record")
    .replace(/\bfuture-grandchild\b/gi, "next-generation")
    .replace(/\bgrandson\b/gi, "G3 next-generation record")
    .replace(/\bson-use\b/gi, "G2 use")
    .replace(/\bson use\b/gi, "G2 use")
    .replace(/\bspouse veto if relevant\b/gi, "family-use veto position where recorded")
    .replace(/\bspouse if relevant\b/gi, "family-use veto holder where recorded")
    .replace(/\bspouse veto\b/gi, "family-use veto position")
    .replace(/\bfamily-use veto position where recorded\b/gi, "family-home rights position gate mapped before bid release or exchange")
    .replace(/\bfamily-home veto position\b/gi, "family-home rights position")
    .replace(/\bfamily-home veto holder\b/gi, "family-home rights holder")
    .replace(/\bG3 decision memory\b/gi, "G3 decision record")
    .replace(/\bnext-generation decision memory\b/gi, "G3 decision record")
    .replace(/\brelease-read sprint\b/gi, "release-readiness sprint")
    .replace(/\bSIX-BOOK OPENING\b/gi, "Decision Opening")
    .replace(/\bSix-book opening\b/gi, "Decision opening")
    .replace(/\bDM64\b/g, "release-readiness review")
    .replace(/\bGranthika\b/g, "source register")
    .replace(/\bAquarium\b/g, "source register")
    .replace(/\bCastle Briefs?\b/g, "Source records")
    .replace(/\bcastle briefs?\b/gi, "source records")
    .replace(/\badvisor embarrassment\b/gi, "adviser coordination failure")
    .replace(/\badviser embarrassment\b/gi, "adviser coordination failure")
    .replace(/\bAI Bubble\s*\/\s*Technology Wealth Repricing Shock\b/gi, "Source-wealth concentration check")
    .replace(/\bJob Market Crash\s*\/\s*Labor-Income Shock\b/gi, "Conditional operating-income exposure check")
    .replace(/\bDigital Settlement\s*\/\s*Stablecoin Rail Stress\b/gi, "Conditional digital-settlement rail exposure check")
    .replace(/\bTechnology-wealth exposure check\b/gi, "Source-wealth concentration check")
    .replace(/\bOperating-income exposure check\b/gi, "Conditional operating-income exposure check")
    .replace(/\bDigital-settlement exposure check\b/gi, "Conditional digital-settlement rail exposure check")
    .replace(/\bAI asset repricing(?:\s*\/\s*technology wealth repricing)?\b/gi, "source-wealth concentration exposure")
    .replace(/\bAI or technology exposed\b/gi, "exposed to a documented source-wealth concentration")
    .replace(/\bAI platform dependency\b/gi, "documented platform concentration")
    .replace(/\bAI\b/g, "source-wealth concentration")
    .replace(/\bwar\s*\/\s*sanctions\b/gi, "conditional geopolitical and sanctions exposure")
    .replace(/\bstablecoin rail stress\b/gi, "conditional digital-settlement rail exposure")
    .replace(/\bBSA\/sanctions\b/gi, "sanctions and bank-compliance controls")
    .replace(/\bBSA\b/g, "bank-compliance controls")
    .replace(/\bshadow facilitators\b/gi, "unverified intermediaries")
    .replace(/\bConditional\s+Conditional\b/gi, "Conditional")
    .replace(/\bRequired evidence\b/gi, "Release gate")
    .replace(/\bHold pending signed gates\b/gi, "Hold under signed-gate control")
    .replace(/\bEvidence pending; no capital release\b/gi, "Evidence mapped; no capital release until signed approval gates")
    .replace(/\bEvidence Pending\b/g, "Evidence mapped")
    .replace(/\bevidence pending\b/gi, "evidence mapped")
    .replace(/\bRequired evidence\s*:\s*/gi, "Gate mapped: ")
    .replace(/\bEvidence required before release\b/gi, "Evidence mapped; sign-off controls release")
    .replace(/\bRequired for release readiness;\s*signed gate required before capital release\b/gi, "Gate mapped for release-readiness review; signed gate controls capital release")
    .replace(/\bRequired for release readiness\b/gi, "Gate mapped for release-readiness review")
    .replace(/\bSigned evidence required before capital release\b/gi, "Evidence mapped; signed gate controls capital release")
    .replace(/\bSigned evidence required before release\b/gi, "Evidence mapped; signed gate controls release")
    .replace(/\bSigned gate required\b/gi, "Signed gate controls release")
    .replace(/\bsigned gate required\b/gi, "signed gate controls release")
    .replace(/\bRequired before ([^.;,\n]+)/gi, "Gate mapped for $1")
    .replace(/\brequired before ([^.;,\n]+)/gi, "gate mapped for $1")
    .replace(/\bQuestions and confirmations required before release\b/gi, "Questions and confirmations gate mapped for release review")
    .replace(/\bEvidence item required before release\b/gi, "Evidence item gate mapped for release review")
    .replace(/\brequired evidence gates\b/gi, "mapped evidence gates")
    .replace(/\bOfficial school-admissions guidance is required when\b/gi, "Official school-admissions guidance is recorded when")
    .replace(/\bWritten advice required\b/gi, "Written advice recorded")
    .replace(/\bWritten rail acceptance required\b/gi, "Written rail acceptance recorded")
    .replace(/\bSoW\/SoF and signer acceptance required\b/gi, "SoW/SoF and signer acceptance recorded")
    .replace(/\bis required above\b/gi, "is controlled above")
    .replace(
      /\bPrincipal\s*\/\s*named family user\s*\/\s*next-generation record\b/gi,
      "G1 authority, G2 use boundary, G2 fairness owner, and G3 decision record"
    )
    .replace(/\bfallback signer\b/gi, "alternate signer")
    .replace(/\bfallback rails\b/gi, "alternate rails")
    .replace(/\bfallback rail\b/gi, "alternate rail")
    .replace(/\bfallback\b/gi, "alternate")
    .replace(/\s+/g, " ")
    .trim();
}

function citationNumber(citationMap: Map<string, number>, id: string): number | null {
  return citationMap.get(id) ?? citationMap.get(id.toLowerCase()) ?? null;
}

function uniqueCitationRows(citations: Citation[]): Citation[] {
  const seen = new Set<string>();
  const rows: Citation[] = [];

  citations.forEach((citation) => {
    const id = String(citation.id || "").trim();
    const normalized = id.toLowerCase();
    if (!normalized || seen.has(normalized)) return;

    seen.add(normalized);
    rows.push({
      ...citation,
      id,
      number: rows.length + 1,
      originalText: citation.originalText || `[${rows.length + 1}]`,
    });
  });

  return rows;
}

function releaseReadinessSourceCitations(payload: ReleaseReadinessSharePayload | null): Citation[] {
  if (!payload) return [];

  const seeded = [
    ...(payload.citations ?? []).map((citation) => ({
      id: citation.id,
      number: citation.number,
      originalText: citation.originalText || `[${citation.number}]`,
    })),
    ...(payload.methodDrivers ?? []).flatMap((driver) =>
      (driver.sources ?? []).map((source) => ({
        id: source.id,
        number: 0,
        originalText: `[${source.id}]`,
      })),
    ),
    ...(payload.publicSources ?? []).map((source) => ({
      id: source.id,
      number: 0,
      originalText: `[${source.id}]`,
    })),
  ];

  return uniqueCitationRows(seeded);
}

function releaseReadinessPreloadedSources(
  payload: ReleaseReadinessSharePayload | null,
): Map<string, CitationSourceDevelopment> {
  const sources = new Map<string, CitationSourceDevelopment>();
  const put = (id: string, source: CitationSourceDevelopment) => {
    const cleaned = String(id || "").trim();
    if (!cleaned) return;
    sources.set(cleaned, source);
    sources.set(cleaned.toLowerCase(), source);
  };

  (payload?.methodDrivers ?? []).forEach((driver) => {
    (driver.sources ?? []).forEach((source) => {
      const id = String(source.id || "").trim();
      if (!id) return;
      const summary = [
        source.castleBrief || source.summary,
        source.decisionPosture ? `Decision posture: ${source.decisionPosture}` : "",
        driver.releaseRead ? `Route read: ${driver.releaseRead}` : "",
      ].filter(Boolean).join("\n\n");

      put(id, {
        id,
        title: source.title || "Route source record",
        description:
          source.summary ||
          driver.releaseRead ||
          "Route-source record used to identify route sequencing and release-gate relevance.",
        industry: source.industry || "Route source review",
        product: driver.title || undefined,
        date: source.date || undefined,
        summary:
          summary ||
          "Source record supports route sequencing and release-gate relevance. It does not prove legal, tax, bank, title, valuation, or family authority.",
        summaryLabel: "Source Record",
        url: source.url || undefined,
      });
    });
  });

  (payload?.publicSources ?? []).forEach((source) => {
    const claim = source.claim || "Supports a public claim used in this release-readiness review.";
    const boundary = source.boundary || "Public source anchor; private file clearance remains separate.";
    put(source.id, {
      id: source.id,
      title: source.title || source.institution || "Public source evidence",
      description: claim,
      industry: source.category || "Public source register",
      product: source.institution || undefined,
      date: source.date || undefined,
      summary: [
        `Claim supported: ${claim}`,
        `Decision boundary: ${boundary}`,
        source.url ? `Source URL: ${source.url}` : "",
      ].filter(Boolean).join("\n\n"),
      summaryLabel: "Source Evidence",
      url: source.url || undefined,
    });
  });
  return sources;
}

function reportSection(
  payload: ReleaseReadinessSharePayload,
  ...ids: string[]
): ReleaseReadinessShareReportSection | undefined {
  const wanted = new Set(ids.map((id) => id.toLowerCase()));
  return payload.reportSections.find((section) => wanted.has(String(section.id).toLowerCase()));
}

function reportCard(
  section: ReleaseReadinessShareReportSection | undefined,
  labelNeedle: string,
): ReleaseReadinessShareCard | undefined {
  const needle = labelNeedle.toLowerCase();
  return section?.cards?.find((card) => cleanDisplayText(card.label).toLowerCase().includes(needle));
}

function reportRows(section: ReleaseReadinessShareReportSection | undefined, limit?: number): string[][] {
  const rows = section?.table?.rows ?? [];
  return typeof limit === "number" ? rows.slice(0, limit) : rows;
}

function cardValue(
  section: ReleaseReadinessShareReportSection | undefined,
  labelNeedle: string,
  fallback = "Signed gate controls release",
): string {
  const card = reportCard(section, labelNeedle);
  return cleanDisplayText(card?.value || card?.title || fallback);
}

function cardNote(
  section: ReleaseReadinessShareReportSection | undefined,
  labelNeedle: string,
  fallback = "",
): string {
  const card = reportCard(section, labelNeedle);
  return cleanDisplayText(card?.body || fallback);
}

function uniqueRows(rows: string[][], limit?: number): string[][] {
  const seen = new Set<string>();
  const output: string[][] = [];
  for (const row of rows) {
    const key = row.map((cell) => cleanDisplayText(cell)).join("|");
    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push(row);
    if (limit && output.length >= limit) break;
  }
  return output;
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

function PrincipalInfoCard({
  label,
  title,
  body,
  tone = "default",
}: {
  label: string;
  title: string;
  body: string;
  tone?: "default" | "primary" | "success" | "warning" | "danger";
}) {
  const toneClass =
    tone === "primary"
      ? "border-primary/30 bg-primary/5"
      : tone === "success"
        ? "border-emerald-500/25 bg-emerald-500/5"
        : tone === "warning"
          ? "border-amber-500/25 bg-amber-500/5"
          : tone === "danger"
            ? "border-red-500/25 bg-red-500/5"
            : "border-border bg-card/70";

  return (
    <article className={`min-w-0 rounded-md border p-5 ${toneClass}`}>
      <p className="break-words text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {cleanDisplayText(label)}
      </p>
      <h3 className="mt-3 break-words text-xl font-semibold leading-7 text-foreground">{cleanDisplayText(title)}</h3>
      <p className="mt-3 break-words text-sm leading-6 text-muted-foreground">{cleanDisplayText(body)}</p>
    </article>
  );
}

function PrincipalTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: string[][];
}) {
  if (!rows.length) return null;

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-muted/40 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          <tr>
            {columns.map((column) => (
              <th key={column} className="border-b border-border px-4 py-3 font-semibold">
                {cleanDisplayText(column)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`${row.join("-")}-${rowIndex}`} className="border-b border-border last:border-b-0">
              {row.map((cell, cellIndex) => (
                <td
                  key={`${cell}-${cellIndex}`}
                  className={`min-w-52 px-4 py-4 align-top leading-6 ${
                    cellIndex === 0 ? "font-semibold text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <span className="block max-w-[34rem] break-words">{cleanDisplayText(cell)}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PrincipalConditionGrid({
  advance,
  hold,
  stop,
}: {
  advance: string[];
  hold: string[];
  stop: string[];
}) {
  const columns = [
    { label: "Advance only if", items: advance, tone: "success" as const },
    { label: "Hold if", items: hold, tone: "warning" as const },
    { label: "Stop if", items: stop, tone: "danger" as const },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {columns.map((column) => (
        <article
          key={column.label}
          className={`rounded-md border p-5 ${
            column.tone === "success"
              ? "border-emerald-500/25 bg-emerald-500/5"
              : column.tone === "warning"
                ? "border-amber-500/25 bg-amber-500/5"
                : "border-red-500/25 bg-red-500/5"
          }`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {column.label}
          </p>
          <div className="mt-4 space-y-3">
            {column.items.map((item, index) => (
              <p key={`${column.label}-${index}`} className="text-sm leading-6 text-muted-foreground">
                <span className="mr-2 font-semibold text-foreground">{index + 1}.</span>
                {cleanDisplayText(item)}
              </p>
            ))}
          </div>
        </article>
      ))}
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

function principalTable(columns: string[], rows: string[][]) {
  return {
    columns,
    rows: rows.filter((row) => row.some((cell) => cleanDisplayText(cell))),
  };
}

function fallbackPrincipalView(payload: ReleaseReadinessSharePayload): NonNullable<ReleaseReadinessSharePayload["principalView"]> {
  const selectedRoute = payload.selectedRoute;
  const metrics = selectedRoute.metrics;
  const gateRows = payload.gateRows.slice(0, 8);
  const allIn = money(metrics.totalAcquisitionCostUsd);
  const duties = money(metrics.totalDutiesUsd);
  const annualCarry = money(metrics.annualCarryingCostUsd);
  const propertyValue = money(metrics.propertyValueUsd);
  const dutyPct = numberValue(metrics.dutyDragPct);

  return {
    decisionMinute: principalTable(
      ["Question", "Answer", "Principal consequence"],
      [
        ["Can the move advance?", payload.decision, "Negotiation may advance only under signed gates; capital remains blocked."],
        ["Which route is selected?", selectedRoute.routeName, selectedRoute.releaseRule || selectedRoute.releaseEffect],
        ["What must not happen yet?", "No capital release", payload.capitalRule],
      ],
    ),
    familyActionAnswer: principalTable(
      ["Family action", "Answer", "Why it matters"],
      [
        ["Advance route", payload.releaseRule, payload.rationale],
        ["Use case", payload.purpose, selectedRoute.bestUse],
        ["Failure mode", selectedRoute.failureMode, selectedRoute.releaseEffect],
      ],
    ),
    capitalTruth: principalTable(
      ["Capital item", "Read", "Release consequence"],
      [
        ["Property value", propertyValue, "Guide price is not release authority."],
        ["All-in exposure", allIn, "Price and duties are read together before commitment."],
        ["Duty drag", duties, dutyPct > 0 ? `${dutyPct.toFixed(1)}% of property value in the selected route.` : "Duty drag remains gate-controlled."],
        ["Annual carry", annualCarry, "Carry needs owner, liquidity source, and reporting cadence."],
      ],
    ),
    purposeBoundary: principalTable(
      ["Boundary", "Approved", "Not approved"],
      [
        ["Family purpose", payload.purpose, "Yield, prestige, wrapper planning, or residence assumptions without separate signed gates."],
      ],
    ),
    releaseRule: principalTable(
      ["Rule", "Condition", "Capital effect"],
      [
        ["Release rule", payload.releaseRule, "Capital remains blocked until the condition is signed or formally waived."],
        ["Capital rule", payload.capitalRule, "No bid, deposit, exchange, transfer, or structure change before signed gates."],
      ],
    ),
    signedGateMap: principalTable(
      ["Gate", "State", "Condition", "Consequence"],
      gateRows.map((gate) => [gate.gate, gate.state, gate.condition, gate.consequence]),
    ),
    whatChanged: principalTable(
      ["Before review", "After review", "Decision advantage"],
      [
        ["Property interest", "Release decision", "The family can separate appetite from authority."],
        ["Adviser lanes", "One release packet", "Tax, title, bank, source, family, and memory gates are read together."],
        ["Seller timing", "Signed-gate sequence", "Capital cannot be pulled forward by external pressure."],
      ],
    ),
    whatCaught: principalTable(
      ["Failure mode", "Current read", "Control response"],
      [
        ["Capital release before evidence", payload.riskLevel, payload.mitigation],
        ["Route mismatch", selectedRoute.failureMode, selectedRoute.releaseEffect],
        ["Evidence boundary", `${payload.publicSources.length} public sources`, "Public proof, private evidence, and method logic remain separated."],
      ],
    ),
    routeAlternatives: payload.routeOptions.map((option) => ({
      routeName: cleanDisplayText(option.routeName),
      currentDecision: cleanDisplayText(option.releaseRule || option.verdict),
      useCase: cleanDisplayText(option.bestUse),
      capitalConsequence: cleanDisplayText(
        `${money(option.metrics.totalAcquisitionCostUsd, "No capital deployed")}; ${money(option.metrics.totalDutiesUsd, "No purchase duty released")}.`,
      ),
      releaseConsequence: cleanDisplayText(option.releaseEffect || option.failureMode),
    })),
    familyActionTests: payload.methodDrivers.slice(0, 8).map((driver, index) => ({
      label: `Family action test ${index + 1}`,
      familyAction: cleanDisplayText(driver.familyAction || driver.title),
      testApplied: cleanDisplayText(driver.testApplied || driver.driver),
      testResult: cleanDisplayText(driver.testResult || driver.releaseRead),
      principalInstruction: cleanDisplayText(driver.principalInstruction || "Principal instruction remains controlled by the signed release gates."),
      capitalConsequence: cleanDisplayText(driver.capitalConsequence || "Capital remains blocked until this action is written into the selected route."),
    })),
    sevenDayInstruction: principalTable(
      ["Window", "Instruction", "Owner"],
      [
        ["Day 0-1", "Confirm no bid, deposit, transfer, exchange, or seller commitment without signed gates.", "Principal + family-office operator"],
        ["Day 1-3", "Close title, tax, source, bank, seller, and authority evidence gaps.", "Counsel + banks + buying agent"],
        ["Day 4-7", "Sign family-use boundary, fairness minute, carry owner, stop rights, and decision record.", "Family office + succession counsel"],
      ],
    ),
    evidenceBoundary: principalTable(
      ["Evidence class", "Public surface", "Boundary"],
      [
        ["Public sources", `${payload.publicSources.length} source records`, "Public claims can be cited without exposing private family documents."],
        ["Private evidence", `${payload.privateEvidence.length} private evidence classes`, "Private title, bank, source, seller, and family records remain gate-controlled."],
        ["Method drivers", `${payload.methodDrivers.length} method drivers`, "Pattern logic explains why gates matter; it is not legal, tax, title, bank, or valuation proof."],
      ],
    ),
    finalInstruction: principalTable(
      ["Instruction", "Release condition", "If not cleared"],
      [
        [payload.decision, payload.releaseRule, "Hold under signed-gate control or stop if the release conditions fail."],
      ],
    ),
  };
}

export function PrincipalRouteView({ payload }: { payload: ReleaseReadinessSharePayload }) {
  const metrics = payload.selectedRoute.metrics;
  const principal = payload.principalView ?? fallbackPrincipalView(payload);
  const selectedRoute = payload.selectedRoute;
  const routeSummaryRows = principal.routeAlternatives.map((route) => [
    route.routeName,
    route.currentDecision,
    route.capitalConsequence,
    route.releaseConsequence,
  ]);

  return (
    <>
      <section className="grid gap-6 border-t border-border py-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Principal decision pack</p>
          <h1 className="mt-4 max-w-5xl text-4xl font-semibold tracking-normal text-foreground md:text-6xl">
            {cleanDisplayText(payload.title)}
          </h1>
          <p className="mt-5 max-w-4xl text-lg leading-8 text-muted-foreground">
            {cleanDisplayText(payload.move)}
          </p>
          <p className="mt-5 max-w-4xl text-base leading-8 text-foreground">
            {cleanDisplayText(
              "This is the family action answer: what may advance, what remains blocked, what the purchase really commits, and which signed gates convert interest into release authority.",
            )}
          </p>
        </div>
        <div className="rounded-md border border-border bg-card/90 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Reference</p>
          <p className="mt-2 font-mono text-lg font-semibold text-foreground">{payload.reference}</p>
          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Corridor</p>
          <p className="mt-2 text-lg font-semibold leading-7 text-foreground">{cleanDisplayText(payload.corridor)}</p>
          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Release stance</p>
          <p className="mt-2 text-lg font-semibold text-primary">{cleanDisplayText(payload.decision)}</p>
          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Selected route</p>
          <p className="mt-2 text-base font-semibold leading-7 text-foreground">
            {cleanDisplayText(selectedRoute.routeName)}
          </p>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="All-in exposure"
          value={money(metrics.totalAcquisitionCostUsd)}
          note="Purchase price plus modeled day-one duties before operating costs."
        />
        <MetricCard
          label="Duty drag"
          value={money(metrics.totalDutiesUsd)}
          note={`${metrics.dutyDragPct ? `about ${metrics.dutyDragPct.toFixed(1)}%` : "Gate-controlled"} of property value in the selected control case.`}
        />
        <MetricCard
          label="Annual carry"
          value={money(metrics.annualCarryingCostUsd)}
          note="Carry must have owner, liquidity source, reporting cadence, and use policy."
        />
        <MetricCard
          label="Capital rule"
          value="No release"
          note="No bid, exchange, deposit, transfer, or structure change before signed gates."
        />
      </div>

      <Section eyebrow="Principal decision minute" title="Approved to negotiate under signed gates; no capital release">
        <PrincipalTable
          columns={principal.decisionMinute.columns}
          rows={principal.decisionMinute.rows}
        />
      </Section>

      <Section eyebrow="Family action answer" title="The proposed Mayfair move is answered as an action, not narrated as a process">
        <PrincipalTable columns={principal.familyActionAnswer.columns} rows={principal.familyActionAnswer.rows} />
      </Section>

      {principal.familyActionTests.length ? (
        <Section eyebrow="Family action tests" title="The action is tested against capital, route, and family consequences">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {principal.familyActionTests.map((driver) => (
              <PrincipalInfoCard
                key={driver.label}
                label={driver.label}
                title={driver.familyAction}
                body={[
                  `Test: ${cleanDisplayText(driver.testApplied)}`,
                  `Result: ${cleanDisplayText(driver.testResult)}`,
                  `Principal instruction: ${cleanDisplayText(driver.principalInstruction)}`,
                  `Capital consequence: ${cleanDisplayText(driver.capitalConsequence)}`,
                ].join(" ")}
              />
            ))}
          </div>
        </Section>
      ) : null}

      <Section eyebrow="Capital truth" title="The family is not deciding on guide price alone">
        <PrincipalTable columns={principal.capitalTruth.columns} rows={principal.capitalTruth.rows} />
      </Section>

      <Section eyebrow="Purpose boundary" title="What the family is approving, and what it is not approving">
        <PrincipalTable columns={principal.purposeBoundary.columns} rows={principal.purposeBoundary.rows} />
      </Section>

      <Section eyebrow="Release rule" title="Capital remains blocked until the release locks are signed">
        <PrincipalTable columns={principal.releaseRule.columns} rows={principal.releaseRule.rows} />
      </Section>

      <Section eyebrow="Signed gate map" title="The gates that convert interest into release authority">
        <PrincipalTable columns={principal.signedGateMap.columns} rows={principal.signedGateMap.rows} />
      </Section>

      <Section eyebrow="What changed before capital moves" title="The review changed the permission structure">
        <PrincipalTable columns={principal.whatChanged.columns} rows={principal.whatChanged.rows} />
      </Section>

      <Section eyebrow="What we caught" title="Six failure modes the room should not discover after exchange">
        <PrincipalTable columns={principal.whatCaught.columns} rows={principal.whatCaught.rows} />
      </Section>

      <Section eyebrow="Route alternatives summary" title="The family is choosing a release path, not a property wrapper">
        <PrincipalTable
          columns={["Route", "Current decision", "Capital consequence", "Release consequence"]}
          rows={routeSummaryRows}
        />
      </Section>

      <Section eyebrow="Seven-day principal instruction" title="The family-office order for the next week">
        <PrincipalTable columns={principal.sevenDayInstruction.columns} rows={principal.sevenDayInstruction.rows} />
      </Section>

      <Section eyebrow="Evidence boundary" title="What is source-backed, gate-controlled, and method-only">
        <PrincipalTable columns={principal.evidenceBoundary.columns} rows={principal.evidenceBoundary.rows} />
      </Section>

      <Section eyebrow="Final principal instruction" title="Proceed, hold, or stop is decided by gates, not appetite">
        <PrincipalTable columns={principal.finalInstruction.columns} rows={principal.finalInstruction.rows} />
        <div className="mt-6">
        <PrincipalConditionGrid
          advance={payload.advanceConditions}
          hold={payload.holdConditions}
          stop={payload.stopConditions}
        />
        </div>
      </Section>
    </>
  );
}

function RouteControlPrelude({ payload }: { payload: ReleaseReadinessSharePayload }) {
  const metrics = payload.selectedRoute.metrics;
  const principal = payload.principalView ?? fallbackPrincipalView(payload);
  const adviserConversionRows = [
    ["UK tax counsel", "Signed SDLT route, relief exclusions, surcharge posture, and residence boundary"],
    ["UK property counsel", "Title, seller authority, deposit mechanics, searches, survey, restrictions, and exchange conditions"],
    ["Banks", "SoW / SoF acceptance, signer authority, FX controls, primary rail, and alternate rail"],
    ["Buying agent", "Bid discipline, comparables, seller motivation, first-offer range, and walk-away price"],
    ["Family office and principals", "Authority, use boundary, fairness, stop rights, carry owner, and decision record"],
  ];
  const trustLedgerRows = [
    ["Public source rows", String(payload.publicSources.length), "Public legal, tax, property, market, FX, and authority claims."],
    ["Private evidence classes", String(payload.privateEvidence.length), "Family-side records that control release through signed gates."],
    ["Method drivers", String(payload.methodDrivers.length), "Why a route gate matters; not legal, tax, bank, title, valuation, or family-authority proof."],
    ["Citation handles", String(payload.citations.length), "Reader navigation to supported source material where available."],
  ];

  return (
    <>
      <section className="grid gap-6 border-t border-border py-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Principal release decision</p>
          <h1 className="mt-4 max-w-5xl text-4xl font-semibold tracking-normal text-foreground md:text-6xl">
            Proposed Move Release Readiness Memo
          </h1>
          <p className="mt-5 max-w-4xl text-lg leading-8 text-muted-foreground">{cleanDisplayText(payload.move)}</p>
          <p className="mt-5 max-w-4xl text-base leading-8 text-foreground">
            This route view gives the family the decision answer first, then the full reviewer memo: what may advance
            today, what capital remains blocked, what the purchase really commits, and which signed gates must clear
            before the route can release.
          </p>
        </div>
        <div className="rounded-md border border-border bg-card/90 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Reference</p>
          <p className="mt-2 font-mono text-lg font-semibold text-foreground">{payload.reference}</p>
          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Corridor</p>
          <p className="mt-2 text-lg font-semibold leading-7 text-foreground">{cleanDisplayText(payload.corridor)}</p>
          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Release stance</p>
          <p className="mt-2 text-lg font-semibold text-primary">{cleanDisplayText(payload.decision)}</p>
          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Selected route</p>
          <p className="mt-2 text-base font-semibold leading-7 text-foreground">
            {cleanDisplayText(payload.selectedRoute.routeName)}
          </p>
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
          note={`${metrics.dutyDragPct ? `about ${metrics.dutyDragPct.toFixed(1)}%` : "Gate-controlled"} of property value in the selected control case.`}
        />
        <MetricCard
          label="Capital rule"
          value="No release"
          note="No exchange, deposit, or seller commitment before signed route gates."
        />
        <MetricCard
          label="Next release window"
          value="72h / 7d"
          note="72-hour bank/title/source retrieval check; 7-day counsel/bank/family-authority close path if seller timing starts."
        />
      </div>

      <Section eyebrow="Principal readout" title="Approved to negotiate under signed gates; no capital release">
        <PrincipalTable columns={principal.decisionMinute.columns} rows={principal.decisionMinute.rows} />
      </Section>

      <Section eyebrow="What we caught" title="Six failure modes the room should not discover after exchange">
        <PrincipalTable columns={principal.whatCaught.columns} rows={principal.whatCaught.rows} />
      </Section>

      {principal.familyActionTests.length ? (
        <Section eyebrow="Family action tests" title="The family-provided action is tested against release consequences">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {principal.familyActionTests.map((driver) => (
              <PrincipalInfoCard
                key={driver.label}
                label={driver.label}
                title={driver.familyAction}
                body={[
                  `Test: ${cleanDisplayText(driver.testApplied)}`,
                  `Result: ${cleanDisplayText(driver.testResult)}`,
                  `Principal instruction: ${cleanDisplayText(driver.principalInstruction)}`,
                  `Capital consequence: ${cleanDisplayText(driver.capitalConsequence)}`,
                ].join(" ")}
              />
            ))}
          </div>
        </Section>
      ) : null}

      <Section eyebrow="Why this is not a memo" title="Adviser inputs are converted into one release rule">
        <p className="mb-5 max-w-4xl text-sm leading-6 text-muted-foreground">
          This review does not replace advisers. It converts adviser inputs into one capital-release rule.
        </p>
        <PrincipalTable columns={["Adviser lane", "Converted into"]} rows={adviserConversionRows} />
        <p className="mt-4 text-sm font-semibold text-foreground">
          Output: proceed under signed gates, hold, or stop.
        </p>
      </Section>

      <Section eyebrow="Trust ledger" title="The evidence boundary is explicit">
        <PrincipalTable columns={["Evidence class", "Count", "Route use"]} rows={trustLedgerRows} />
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Public claims are source-backed. Private claims remain gate-controlled until signed or indexed. Method drivers
          explain why a gate matters; they do not prove legal status, bank acceptance, title, tax treatment, valuation,
          or family authority.
        </p>
      </Section>

      <Section eyebrow="Next seven days" title="The controlled order of movement">
        <PrincipalTable columns={principal.sevenDayInstruction.columns} rows={principal.sevenDayInstruction.rows} />
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
  const hasPurchaseDuties = numberValue(option.metrics.totalDutiesUsd) > 0;
  const dutyDragPct = numberValue(option.metrics.dutyDragPct);
  return (
    <div className={`rounded-md border p-4 ${selected ? "border-primary bg-primary/5" : "border-border bg-card/70"}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Route {option.rank}</p>
      <h3 className="mt-3 text-lg font-semibold leading-6 text-foreground">{cleanDisplayText(option.routeName)}</h3>
      <p className="mt-3 text-sm font-semibold text-primary">{cleanDisplayText(option.releaseRule)}</p>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{cleanDisplayText(option.bestUse)}</p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Duties</p>
          <p className="font-semibold text-foreground">{money(option.metrics.totalDutiesUsd, "No purchase released")}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Drag</p>
          <p className="font-semibold text-foreground">{hasPurchaseDuties && dutyDragPct > 0 ? `${dutyDragPct.toFixed(1)}%` : "Not incurred"}</p>
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
  const routeSections = sections.filter((section) => {
    const label = [
      section.id,
      section.eyebrow,
      section.title,
    ].filter(Boolean).join(" ").toLowerCase();

    if (!label) return true;
    if (/\bevidence vault\b|\bevidence boundary\b|\bpublic source\b|\bsource register\b|\bsource-to-claim\b|\bmethodology\b|\bmethod records\b|\bmethod drivers\b|\bcitation map\b|\bproof ledger\b|\bprivate evidence index\b/.test(label)) {
      return false;
    }
    return true;
  });

  if (!routeSections.length) return null;

  return (
    <>
      {routeSections.map((section) => (
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

function EvidenceVaultView({
  publicSources,
  privateEvidence,
}: {
  publicSources: ReleaseReadinessShareSource[];
  privateEvidence: ReleaseReadinessPrivateEvidence[];
}) {
  const coreSources = publicSources.filter((source) => source.category !== "Supplementary sources");
  const supplementarySources = publicSources.filter((source) => source.category === "Supplementary sources");
  const groupedSources = coreSources.reduce<Record<string, ReleaseReadinessShareSource[]>>((groups, source) => {
    const category = source.category || "Source Register";
    groups[category] = groups[category] || [];
    groups[category].push(source);
    return groups;
  }, {});
  const renderSourceCard = (source: ReleaseReadinessShareSource) => (
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
  );

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
                {sources.map(renderSourceCard)}
              </div>
            </div>
          ))}
          {supplementarySources.length ? (
            <details className="rounded-md border border-border bg-card/60 p-5">
              <summary className="cursor-pointer text-lg font-semibold text-foreground">Supplementary sources</summary>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {supplementarySources.map(renderSourceCard)}
              </div>
            </details>
          ) : null}
          <div className="rounded-md border border-border bg-muted/30 p-5 text-sm leading-6 text-muted-foreground">
            Methodology records are available in the Methodology view. They explain why gates matter; they are not public-source evidence.
          </div>
        </div>
      </Section>

      <Section eyebrow="PRIVATE EVIDENCE INDEX" title="Redacted document classes, owners, and release use">
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
}: {
  drivers: ReleaseReadinessMethodDriver[];
}) {
  const methodRows = [
    ["Route classification", "Direct, wrapper, residence/replacement, rent-first, and stop/reset routes.", "Private family records and raw scoring details."],
    ["Gate standard", "Tax, title, bank, source-of-funds, family authority, bid discipline, and decision memory.", "Private document contents and adviser correspondence."],
    ["Evidence standard", "Public source, private document, counsel confirmation, bank acceptance, and family minute.", "Unredacted bank, title, source, and authority files."],
    ["Method records", "Used only to identify failure modes and why a release gate matters. Not legal, tax, title, bank, valuation, or family-authority proof.", "Raw source-review rows and proprietary similarity logic."],
    ["Output rule", "Every insight must become a gate, owner, source, release condition, or stop rule.", "Transformation and weighting internals."],
  ];

  return (
    <>
      <Section eyebrow="Methodology receipt" title="How the route was reviewed">
        <div className="rounded-md border border-border bg-card/70 p-5">
          <p className="text-base leading-8 text-foreground">
            This view shows the gate framework used to review the route. Public authorities and private evidence classes
            sit above method records. Method records are used only to identify failure modes and release-gate relevance;
            they are not legal, tax, title, bank, valuation, or family-authority proof.
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
        <Section eyebrow="Method records" title="Used only to identify failure modes">
          <details className="rounded-md border border-border bg-card/70 p-5">
            <summary className="cursor-pointer text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Show lower-authority method records
            </summary>
            <div className="mt-5 rounded-md border border-border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
              These records explain why a gate matters. They do not prove legal status, tax treatment, title quality,
              bank acceptance, valuation, or family authority.
              <br />
              Source mapping is held in Evidence Vault. Method records are not proof; they explain gate relevance.
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
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
                </article>
              ))}
            </div>
          </details>
        </Section>
      ) : null}
    </>
  );
}

function EvidenceMethodologyShareView({
  publicSources,
  privateEvidence,
  methodDrivers,
  evidenceSections,
}: {
  publicSources: ReleaseReadinessShareSource[];
  privateEvidence: ReleaseReadinessPrivateEvidence[];
  methodDrivers: ReleaseReadinessMethodDriver[];
  evidenceSections?: ReleaseReadinessEvidenceMethodologySection[];
}) {
  const sections = evidenceSections?.length ? evidenceSections : [];
  const totalEvidenceRows = sections.reduce((total, section) => total + section.records.length, 0);
  const legalTaxRows = sections.find((section) => section.id === "legal_tax")?.records.length ?? 0;
  const routeSourceRows = sections.find((section) => section.id === "route_sources")?.records.length ?? methodDrivers.reduce((total, driver) => total + driver.sources.length, 0);
  const authorityStack = [
    {
      layer: "Public authority",
      evidence: `${legalTaxRows} legal / tax rows plus property, market, FX, register, and AML sources`,
      use: "Establishes the public rule boundary for SDLT, residence, IHT, ATED, registers, source-of-wealth standards, FX basis, and market discipline.",
      limit: "Does not prove buyer status, title position, bank acceptance, seller authority, or family authority.",
    },
    {
      layer: "Private release evidence",
      evidence: `${privateEvidence.length} private evidence classes across bank, family authority, adviser, and release files`,
      use: "Shows the family-side file classes that control bid, deposit, exchange, transfer, alternate rail, family-use, fairness, and decision memory.",
      limit: "Private files control release only through signed counsel, bank, operator, and principal gates.",
    },
    {
      layer: "Route-source intelligence",
      evidence: `${routeSourceRows} route-source records`,
      use: "Explains why certain route failures matter commercially: seller timing, bank friction, source narrative, family entitlement, and governance memory.",
      limit: "Source-review records do not prove law, tax treatment, valuation, title, bank acceptance, or family authority.",
    },
  ];
  const sourceClaimMap = [
    ["SDLT, residence, IHT, ATED, and reporting", "Public authority + UK tax/private-client file", "Tax counsel signs buyer profile, surcharge posture, relief exclusions, reporting owner, and filing mechanics."],
    ["Title, seller authority, exchange, and deposit exposure", "Property counsel file + listing/comparable anchors", "Property counsel signs title, searches, seller authority, restrictions, deposit mechanics, survey, and completion conditions."],
    ["SoW / SoF, signer, FX, transfer, alternate rail", "Private bank file + AML/SoW public standards", "Source and receiving banks must clear the SoW/SoF index, signer mandate, FX authority, transfer limits, timetable, and escalation path."],
    ["Family-use, fairness, veto, and generation-continuity record", "Private family governance evidence + succession/adviser file", "Principal and family-office records set use rights, stop rights, carry owner, fairness owner, veto position, and retrieval location."],
    ["Bid discipline and market timing", "Market/listing anchors + buying-agent evidence", "Buying agent converts guide price into closed comparable set, failed-sale history, first-offer range, capex adjustment, and walk-away price."],
  ];
  const proofBoundary = [
    ["Source-backed", "Official/public authority, market, listing, FX, AML, register, and property-source records.", "Public claims, rule boundaries, market discipline, and source citation traceability."],
    ["Evidence-controlled", "Private bank, title, source, counsel, family authority, adviser, and operator files.", "Capital release, seller commitment, exchange, transfer, family-use, fairness, and decision memory."],
    ["Method-only", "Route-source records used to test sequencing and failure modes.", "Why a gate matters and where route failure usually appears; never legal, tax, bank, title, valuation, or family proof."],
  ];

  if (!sections.length) {
    return (
      <>
        <EvidenceVaultView publicSources={publicSources} privateEvidence={privateEvidence} />
        <MethodologyView drivers={methodDrivers} />
      </>
    );
  }

  return (
    <>
      <Section eyebrow="Evidence & Methodology" title="Evidence authority for the release decision">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-base leading-8 text-foreground">
              This page answers which claims are source-backed, which claims are controlled by private evidence, and
              which records only explain why a release gate matters. It is the audit trail behind the Principal View and
              Route View; it is not a substitute for counsel, bank, title, valuation, or family authority.
            </p>
          </div>
          <div className="rounded-md border border-primary/20 bg-primary/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Principal proof answer</p>
            <h2 className="mt-3 text-xl font-semibold leading-7 text-foreground">
              The memo is traceable; capital remains controlled by signed gates.
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Public records support the rule boundary. Private evidence controls release. Route-source records explain
              sequencing risk but never replace counsel, banks, title work, valuation, or family authority.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ["Evidence rows", String(totalEvidenceRows), "Legal, tax, banking, family, property, adviser, and route evidence rows."],
            ["Legal / tax rows", String(legalTaxRows), "Official and adviser-facing rows supporting SDLT, residence, IHT, ATED, and reporting boundaries."],
            ["Private evidence classes", String(privateEvidence.length), "Banking, family authority, adviser, and release evidence classes carried into the packet."],
          ].map(([label, value, body]) => (
            <div key={label} className="rounded-md border border-border bg-background/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Release Authority Stack" title="What each evidence layer can and cannot prove">
        <div className="grid gap-4 lg:grid-cols-3">
          {authorityStack.map((row) => (
            <article key={row.layer} className="rounded-md border border-border bg-card/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{row.layer}</p>
              <p className="mt-3 text-sm font-semibold leading-6 text-foreground">{row.evidence}</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{row.use}</p>
              <p className="mt-3 border-t border-border pt-3 text-xs leading-5 text-muted-foreground">
                <span className="font-semibold text-foreground">Boundary:</span> {row.limit}
              </p>
            </article>
          ))}
        </div>
      </Section>

      <Section eyebrow="Source-To-Claim Map" title="How a principal traces each major claim">
        <div className="overflow-hidden rounded-md border border-border bg-card/70">
          <div className="hidden grid-cols-[1fr_1fr_1.25fr] border-b border-border bg-muted/40 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground md:grid">
            <span>Claim family</span>
            <span>Proof class</span>
            <span>Principal control action</span>
          </div>
          {sourceClaimMap.map(([claim, proof, action]) => (
            <div key={claim} className="grid gap-3 border-b border-border px-4 py-4 text-sm last:border-b-0 md:grid-cols-[1fr_1fr_1.25fr]">
              <p className="font-semibold leading-6 text-foreground">{claim}</p>
              <p className="leading-6 text-muted-foreground">{proof}</p>
              <p className="leading-6 text-muted-foreground">{action}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Proof Boundary" title="The page separates authority from intelligence">
        <div className="grid gap-3 sm:grid-cols-3">
          {proofBoundary.map(([label, source, proves]) => (
            <div key={label} className="rounded-md border border-border bg-card/70 p-4">
              <h3 className="font-semibold text-foreground">{label}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{source}</p>
              <p className="mt-3 border-t border-border pt-3 text-xs leading-5 text-muted-foreground">{proves}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Methodology Boundary" title="How sources become release gates">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["Route sequencing", "Source records identify known failure modes, sequencing gaps, and when a route usually needs to hold or advance under signed gates."],
            ["Market discipline", "Market references sharpen bid discipline, seller timing, carrying cost, and walk-away logic."],
            ["Family governance", "Generational and authority records shape the questions the family file must answer before exchange."],
            ["Release proof", "Release authority comes from signed private evidence, not from source similarity or public market support."],
          ].map(([title, body]) => (
            <div key={title} className="rounded-md border border-border bg-card/70 p-4">
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      {sections.map((section) => (
        <Section key={section.id} eyebrow={section.eyebrow} title={section.title}>
          <p className="mb-5 max-w-4xl text-sm leading-6 text-muted-foreground">{cleanDisplayText(section.description)}</p>
          <div className="grid gap-3 lg:grid-cols-2">
            {section.records.map((record, index) => (
              <article key={`${section.id}_${record.id}_${index}`} className="rounded-md border border-border bg-card/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {cleanDisplayText(record.category)}
                    </p>
                    <h3 className="mt-2 text-base font-semibold leading-6 text-foreground">{cleanDisplayText(record.title)}</h3>
                  </div>
                  {record.url ? (
                    <a
                      href={record.url}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-muted-foreground transition hover:border-primary/50 hover:text-primary"
                    >
                      Open source
                    </a>
                  ) : null}
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{cleanDisplayText(record.claim)}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {record.institution ? <span className="rounded bg-muted/60 px-2 py-1">{cleanDisplayText(record.institution)}</span> : null}
                  {record.owner ? <span className="rounded bg-muted/60 px-2 py-1">{cleanDisplayText(record.owner)}</span> : null}
                  {record.status ? <span className="rounded bg-muted/60 px-2 py-1">{cleanDisplayText(record.status)}</span> : null}
                  {record.date ? <span className="rounded bg-muted/60 px-2 py-1">{cleanDisplayText(record.date)}</span> : null}
                </div>
              </article>
            ))}
          </div>
        </Section>
      ))}
    </>
  );
}

export default function PrincipalReleaseReadinessSharePage({
  reference,
  payload,
  initialSurfaceError,
}: PrincipalReleaseReadinessSharePageProps) {
  const searchParams = useSearchParams();
  const requestedView = searchParams.get("view");
  const normalizedRequestedView = normalizeViewMode(requestedView);
  const [activeView, setActiveView] = useState<ViewMode>(normalizedRequestedView);
  const citationSeeds = useMemo(() => releaseReadinessSourceCitations(payload), [payload]);
  const preloadedSources = useMemo(() => releaseReadinessPreloadedSources(payload), [payload]);
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
    setActiveView(normalizedRequestedView);
  }, [normalizedRequestedView]);

  useEffect(() => {
    const syncViewFromUrl = () => {
      setActiveView(normalizeViewMode(new URLSearchParams(window.location.search).get("view")));
    };

    window.addEventListener("popstate", syncViewFromUrl);
    return () => window.removeEventListener("popstate", syncViewFromUrl);
  }, []);

  const updateUrlView = useCallback((view: ViewMode) => {
    const params = new URLSearchParams(window.location.search);
    if (view === "principal") {
      params.delete("view");
    } else {
      params.set("view", view);
    }

    const query = params.toString();
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    window.history.replaceState(window.history.state, "", nextUrl);
  }, []);

  const changeView = useCallback((view: ViewMode) => {
    if (view === activeView) return;
    setActiveView(view);
    updateUrlView(view);
  }, [activeView, updateUrlView]);

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

        {activeView === "evidence" ? (
          <div className="mt-6 rounded-md border border-primary/30 bg-primary/5 p-4">
            <p className="text-sm leading-6 text-foreground">
              <span className="font-semibold">Evidence boundary:</span> Public claims are source-backed in the Evidence Vault.
              Private bank, title, seller, source-of-funds, and family-authority claims remain release gates until signed or indexed.
              Source-review records explain gate relevance; they do not prove legal status, bank acceptance, title, valuation,
              tax treatment, or family authority.
            </p>
          </div>
        ) : null}

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
                className={`grid min-w-[260px] grid-cols-[42px_1fr] gap-3 rounded-lg border px-4 py-4 text-left transition ${
                  activeView === view.id
                    ? "border-primary bg-primary/10 text-foreground shadow-[0_14px_35px_rgba(0,0,0,0.06)]"
                    : "border-border bg-card text-muted-foreground hover:border-border/80 hover:bg-muted"
                }`}
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-md border ${
                    activeView === view.id
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border/60 bg-background text-muted-foreground"
                  }`}
                >
                  <ViewModeIcon view={view.id} />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{view.label}</span>
                  <span className="mt-1 block max-w-64 text-xs leading-5">{view.description}</span>
                </span>
              </button>
            ))}
          </div>
        </nav>

        {activeView === "principal" ? <PrincipalRouteView payload={payload} /> : null}
        {activeView === "route" ? (
          <RouteIntelligenceV2Report
            intelligence={completedRouteIntelligence(payload)}
            publicMemoId={payload.reference}
            v1Href={`/release-readiness/review/${encodeURIComponent(payload.reference)}`}
            embedded
            onCitationClick={openCitation}
            citationMap={citationMap}
            sharePayload={payload}
            zeroTrustMoveIntake={payload.user_inputs}
            fullMemo={(selectedRoute) => {
              const routeScopedSurface = buildPublicRouteScopedMemoSurface(payload, selectedRoute);
              return (
                <HouseDecisionMemoLinearReport
                  memoData={routeScopedSurface.memoData as any}
                  intakeId={payload.reference}
                  backendData={routeScopedSurface.backendData}
                  fullArtifact={routeScopedSurface.fullArtifact as any}
                  onCitationClick={openCitation}
                  citationMap={citationMap}
                  releaseReadinessSharePayload={payload}
                  hideEvidenceAppendix
                />
              );
            }}
          />
        ) : null}
        {activeView === "evidence" ? (
          <EvidenceMethodologyShareView
            publicSources={payload.publicSources}
            privateEvidence={payload.privateEvidence}
            methodDrivers={payload.methodDrivers}
            evidenceSections={payload.evidenceSections}
          />
        ) : null}
      </div>

      {isPanelOpen ? (
        <EliteCitationPanel
          citations={citations}
          selectedCitationId={selectedCitationId}
          onClose={closePanel}
          onCitationSelect={setSelectedCitationId}
          citationMap={citationMap}
          preloadedSources={preloadedSources}
          shareId={payload.reference}
          disableRemoteFetch
        />
      ) : null}
    </main>
  );
}
