"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpRight, ClipboardCheck } from "lucide-react";
import { EliteCitationPanel } from "@/components/elite/elite-citation-panel";
import { useCitationManager } from "@/hooks/use-citation-manager";
import { formatUsdCompact } from "@/lib/decision-memo/route-intelligence-v2";
import type { Citation } from "@/lib/parse-dev-citations";
import type { CitationSourceDevelopment } from "@/lib/development-citation";
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

type ViewMode = "principal" | "route" | "evidence" | "methodology";

interface PrincipalReleaseReadinessSharePageProps {
  reference: string;
  payload: ReleaseReadinessSharePayload | null;
  initialSurfaceError: string | null;
}

const VIEW_LABELS: Array<{ id: ViewMode; label: string; description: string }> = [
  { id: "principal", label: "Principal View", description: "Family decision, capital rule, gates, and consequences." },
  { id: "route", label: "Route View", description: "Full route memo with scenario, crisis, succession, and execution depth." },
  { id: "evidence", label: "Evidence Vault", description: "Public source register and private evidence index." },
  { id: "methodology", label: "Methodology", description: "Controlled method receipt, not raw process output." },
];

function normalizeViewMode(value: string | null): ViewMode {
  if (value === "route") return "route";
  if (value === "evidence") return "evidence";
  if (value === "methodology") return "methodology";
  return "principal";
}

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
    .replace(/\bGated negotiation only only\b/gi, "Gated negotiation only")
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
    .replace(/\binsurance\/security file\b/gi, "insurance quote and security plan")
    .replace(/\bseller conditions\b/gi, "seller identity, seller authority, exclusivity terms, deposit condition, and completion timetable")
    .replace(/\bdeposit rail\b/gi, "deposit account, conveyancer client-account details, transfer path, and release condition")
    .replace(/\bDOCUMENTED\b/g, "Indexed for review")
    .replace(/\bDocumented\b/g, "Indexed for review")
    .replace(/\bRisk level\b/gi, "Release status")
    .replace(/\bHigh until release gates clear\b/gi, "Evidence pending; no capital release")
    .replace(/\bData quality\b/gi, "Evidence status")
    .replace(/\bRelease-gated\b/gi, "Public claims source-backed; private claims gate-controlled")
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
    .replace(/\bG1\s*\/\s*G2\s*\/\s*G3\b/gi, "Principal / named family user / next-generation record")
    .replace(/\bG1\s*->\s*G2\s*->\s*G3\b/gi, "generation-to-generation")
    .replace(/\bG1\s*→\s*G2\s*→\s*G3\b/gi, "generation-to-generation")
    .replace(/\bG1 route control\b/gi, "current-owner route control")
    .replace(/\bG1\s*->\s*G2 operating transfer\b/gi, "operating transfer to named family user")
    .replace(/\bG2\s*->\s*G3 without governance lock\b/gi, "next-generation record without governance lock")
    .replace(/\bG2\s*->\s*G3 with governance lock\b/gi, "next-generation record with governance lock")
    .replace(/\bG1 principal\b/gi, "principal")
    .replace(/\bG1 founder\s*\/\s*principal\b/gi, "principal")
    .replace(/\bG1\b/gi, "principal")
    .replace(/(^|[_-])g1(?=$|[_-])/gi, "$1principal")
    .replace(/\bFounder authority\b/gi, "Principal authority")
    .replace(/\bfounder authority\b/gi, "principal authority")
    .replace(/\bFounder\b/g, "Principal")
    .replace(/\bfounder\b/g, "principal")
    .replace(/\bPrincipal\s*\/\s*principal\b/gi, "Principal")
    .replace(/\bprincipal\s*\/\s*principal\b/gi, "Principal")
    .replace(/\bG2 fairness owner\b/gi, "family-fairness owner")
    .replace(/\bG3 memory\b/gi, "next-generation decision record")
    .replace(/\bsix years later\b/gi, "later")
    .replace(/\bG2 son\b/gi, "named family user")
    .replace(/\bG2 daughter\s*\/\s*fairness owner\b/gi, "named family-fairness owner")
    .replace(/\bG2\b/gi, "named family user")
    .replace(/(^|[_-])g2(?=$|[_-])/gi, "$1named_family_user")
    .replace(/\bdaughter\s*\/\s*fairness owner\b/gi, "named family-fairness owner")
    .replace(/\bdaughter\/fairness\b/gi, "family-fairness")
    .replace(
      /\bnamed family user\s*\/\s*named family user\s+named family-fairness owner\b/gi,
      "Named family user / named family-fairness owner",
    )
    .replace(/\bG3 grandson\b/gi, "next-generation record")
    .replace(/\bfuture-grandchild\b/gi, "next-generation")
    .replace(/\bgrandson\b/gi, "next-generation record")
    .replace(/\bson-use\b/gi, "named family-user")
    .replace(/\bson use\b/gi, "named family-user")
    .replace(/\bnamed family user-use\b/gi, "named family-user use")
    .replace(/\bspouse veto if relevant\b/gi, "family-use veto position where recorded")
    .replace(/\bspouse if relevant\b/gi, "family-use veto holder where recorded")
    .replace(/\bspouse veto\b/gi, "family-use veto position")
    .replace(/\bfamily-use veto position where recorded\b/gi, "family-home rights position recorded before bid release or exchange")
    .replace(/\bfamily-home veto position\b/gi, "family-home rights position")
    .replace(/\bfamily-home veto holder\b/gi, "family-home rights holder")
    .replace(/\bG3 decision memory\b/gi, "next-generation decision record")
    .replace(/\bnext-generation decision memory\b/gi, "next-generation decision record")
    .replace(/\bG3\b/gi, "next-generation record")
    .replace(/(^|[_-])g3(?=$|[_-])/gi, "$1next_generation_record")
    .replace(/\brelease-read sprint\b/gi, "release-readiness sprint")
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

function releaseReadinessSourceCitations(payload: ReleaseReadinessSharePayload | null): Citation[] {
  return (payload?.publicSources ?? []).map((source, index) => ({
    id: source.id,
    number: index + 1,
    originalText: `[${index + 1}]`,
  }));
}

function releaseReadinessPreloadedSources(
  payload: ReleaseReadinessSharePayload | null,
): Map<string, CitationSourceDevelopment> {
  const sources = new Map<string, CitationSourceDevelopment>();
  (payload?.publicSources ?? []).forEach((source) => {
    const claim = source.claim || "Supports a public claim used in this release-readiness review.";
    const boundary = source.boundary || "Public source anchor; private file clearance remains separate.";
    sources.set(source.id, {
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
  fallback = "Release-gated",
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

export function PrincipalRouteView({ payload }: { payload: ReleaseReadinessSharePayload }) {
  const metrics = payload.selectedRoute.metrics;
  const inputFrame = reportSection(payload, "input-frame");
  const capital = reportSection(payload, "capital-exposure-proof");
  const taxLegal = reportSection(payload, "tax-legal-route-readiness");
  const market = reportSection(payload, "market-intelligence");
  const wealth = reportSection(payload, "wealth-projection");
  const scenario = reportSection(payload, "release-rule-scenario-tree");
  const crisis = reportSection(payload, "crisis-resilience");
  const antiFragility = reportSection(payload, "anti-fragility");
  const continuity = reportSection(payload, "g1-g2-g3-continuity", "generation_to_generation-continuity");
  const authority = reportSection(payload, "authority-veto");
  const responsibility = reportSection(payload, "responsibility-transfer");
  const recordMismatch = reportSection(payload, "record-mismatch");
  const banking = reportSection(payload, "banking-sow-sof");
  const specialist = reportSection(payload, "specialist-release-reviews");
  const decisionMemory = reportSection(payload, "information-flow-decision-memory");
  const roadmap = reportSection(payload, "implementation-roadmap");
  const selectedRoute = payload.selectedRoute;
  const capitalCards = [
    {
      label: "Transaction value",
      value: cardValue(capital, "transaction value", money(metrics.propertyValueUsd)),
      note: cardNote(capital, "transaction value", "Guide-price basis converted to USD for the control case."),
    },
    {
      label: "Duty drag",
      value: cardValue(capital, "total duty drag", money(metrics.totalDutiesUsd)),
      note: cardNote(capital, "total duty drag", "Modeled day-one duty drag before any relief is credited."),
    },
    {
      label: "All-in before operating costs",
      value: cardValue(capital, "all-in", money(metrics.totalAcquisitionCostUsd)),
      note: cardNote(capital, "all-in", "Purchase price plus modeled day-one duty drag before operating costs."),
    },
    {
      label: "Annual carry",
      value: cardValue(capital, "annual carry", money(metrics.annualCarryingCostUsd)),
      note: cardNote(
        capital,
        "annual carry",
        "Annual operating exposure before the family approves carry owner, reporting cadence, and use policy.",
      ),
    },
  ];
  const principalReadoutRows = [
    [
      "Current instruction",
      "No capital release. Proceed under gated negotiation only.",
      "The family can keep negotiation alive without letting bid, deposit, exchange, or seller timing harden before signed gates.",
    ],
    [
      "What changed",
      "The property discussion becomes one release decision.",
      "Seller ask, family purpose, tax posture, title, bank movement, source evidence, and family authority now sit under one release rule.",
    ],
    [
      "Capital blocked",
      "No bid without closed comparables, failed-sale history, first-offer range, and walk-away price.",
      "No exchange or deposit until title, SDLT, source, bank rail, family authority, fairness, and decision record are signed.",
    ],
    [
      "Economic reality",
      `${money(metrics.totalAcquisitionCostUsd)} all-in exposure, ${money(metrics.totalDutiesUsd)} duty drag, and ${money(metrics.annualCarryingCostUsd)} estimated annual carry before final operating files.`,
      "The guide price is subordinate to the real capital commitment and the release gates that control it.",
    ],
    [
      "Evidence posture",
      "Public legal, tax, property, market, and FX claims are source-backed.",
      "Private title, seller, bank, source, and family-authority claims remain gate-controlled until signed or indexed.",
    ],
  ];
  const trustLedgerRows = [
    [
      `${payload.publicSources.length}`,
      `${payload.privateEvidence.length}`,
      `${payload.methodDrivers.length}`,
      `${payload.citations.length}`,
    ],
  ];
  const advisorConversionRows = [
    ["UK tax counsel", "Signed SDLT route, relief exclusions, surcharge posture, and residence boundary"],
    ["UK property counsel", "Title, seller authority, deposit mechanics, searches, survey, restrictions, and exchange conditions"],
    ["Banks", "SoW / SoF acceptance, signer authority, FX controls, primary rail, and fallback rail"],
    ["Buying agent", "Bid discipline, comparables, seller motivation, first-offer range, and walk-away price"],
    ["Family office and principals", "Authority, use boundary, fairness, stop rights, carry owner, and decision record"],
  ];
  const nextSevenDayRows = [
    ["Day 0-1", "Confirm no bid, no deposit, and no seller commitment without signed gates", "Principal + family-office operator"],
    ["Day 1-2", "Produce closed comparables, failed-sale history, seller motivation, first-offer range, and walk-away price", "Buying agent"],
    ["Day 1-3", "Sign buyer profile, SDLT treatment, surcharge position, and relief exclusions", "UK tax counsel"],
    ["Day 2-4", "Confirm title, searches, survey, seller authority, deposit mechanics, and completion conditions", "UK property counsel"],
    ["Day 2-5", "Confirm SoW / SoF acceptance, signer authority, FX controls, primary rail, and fallback rail", "Source bank + receiving bank"],
    ["Day 4-7", "Sign family-use boundary, fairness minute, stop rights, carry owner, and decision record location", "Family office + succession counsel"],
  ];
  const whatChangesRows = [
    [
      "Property interest",
      "Release decision",
      "The family can negotiate, but capital cannot move until signed gates clear.",
    ],
    [
      "Guide price",
      "Bid authority",
      "Guide price is not approval. Closed comps, failed-sale history, capex adjustment, first offer, and walk-away price control the bid.",
    ],
    [
      "Family use claim",
      "Written family-use boundary",
      "Use, guest access, security, carry, sale/refinance rights, veto position, and future explanation are recorded before bid or exchange.",
    ],
    [
      "Source narrative",
      "Bank-accepted source file",
      "Source of wealth and source of funds must be corroborated by records accepted by the source and receiving rails.",
    ],
    [
      "London presence",
      "Separate release gates",
      "Education, residence, tax, succession, and capital-preservation claims are not release authority; each remains a separate evidence gate.",
    ],
  ];
  const caughtRows = [
    [
      "Guide price is not bid authority",
      "Without bid discipline the family can convert an attractive address into an overpaid commitment.",
      "Buying agent must produce comps, failed-sale history, seller motivation, capex adjustment, first-offer range, and walk-away price.",
    ],
    [
      "Duty drag changes the asset purpose",
      "The direct route carries a material day-one duty drag, so the asset must be approved as controlled family use, not a yield trade.",
      "Family purpose and carry owner must be minuted before capital moves.",
    ],
    [
      "Ownership does not solve residence or education",
      "A house can be bought while school, guardian, day-count, and family-presence routes remain unfinished.",
      "Specialist reviews clear each purpose claim separately before release.",
    ],
    [
      "Structure is not a shortcut",
      "A company, trust, or wrapper can add cost, disclosure, ATED, bank friction, and beneficial-owner scrutiny.",
      "Use structure only if counsel signs a non-tax governance, security, succession, or operating purpose.",
    ],
    [
      "Bank rails are execution risk",
      "Capital can exist and still fail to move when source evidence, signer authority, FX limits, receiving rail, or fallback rail is not accepted.",
      "No exchange until source bank, receiving bank, fallback rail, and FX authority are accepted.",
    ],
    [
      "Family use can become entitlement",
      "Repeated use can become implied ownership or fairness conflict if the family file is silent.",
      "Named family-user boundaries, fairness owner, veto position, and next-generation memory must be signed.",
    ],
  ];

  return (
    <>
      <section className="grid gap-6 border-t border-border py-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Principal release decision</p>
          <h1 className="mt-4 max-w-5xl text-4xl font-semibold tracking-normal text-foreground md:text-6xl">
            {cleanDisplayText(payload.title)}
          </h1>
          <p className="mt-5 max-w-4xl text-lg leading-8 text-muted-foreground">
            {cleanDisplayText(payload.move)}
          </p>
          <p className="mt-5 max-w-4xl text-base leading-8 text-foreground">
            {cleanDisplayText(
              "This view gives the family the decision answer: what may advance today, what capital remains blocked, what the purchase really commits, and which signed gates must clear before the route can release.",
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
        <MetricCard label="Next release window" value="72h / 7d" note={cleanDisplayText(payload.mitigation)} />
      </div>

      <Section eyebrow="Principal readout" title="No capital release; gated negotiation only">
        <PrincipalTable
          columns={["Control point", "Principal read", "Decision consequence"]}
          rows={principalReadoutRows}
        />
      </Section>

      <Section eyebrow="What we caught" title="Six failure modes the room should not discover after exchange">
        <PrincipalTable columns={["Issue caught", "Why it matters", "Release response"]} rows={caughtRows} />
      </Section>

      <Section eyebrow="Why this is not a memo" title="Adviser inputs are converted into one release rule">
        <p className="mb-5 max-w-4xl text-base leading-8 text-muted-foreground">
          This review does not replace advisers. It converts adviser inputs into one capital-release rule.
        </p>
        <PrincipalTable columns={["Adviser lane", "Converted into"]} rows={advisorConversionRows} />
        <p className="mt-5 text-base font-semibold text-foreground">Output: proceed under signed gates, hold, or stop.</p>
      </Section>

      <Section eyebrow="Trust ledger" title="The proof boundary is explicit">
        <PrincipalTable
          columns={["Public source rows", "Private evidence classes", "Method drivers", "Citation handles"]}
          rows={trustLedgerRows}
        />
        <p className="mt-5 max-w-4xl text-sm leading-6 text-muted-foreground">
          Public claims are source-backed. Private claims remain gate-controlled until signed or indexed. Method drivers explain why a gate matters; they do not prove legal status, bank acceptance, title, tax treatment, valuation, or family authority.
        </p>
      </Section>

      <Section eyebrow="Next seven days" title="The controlled order of movement">
        <PrincipalTable columns={["Window", "Action", "Owner"]} rows={nextSevenDayRows} />
      </Section>

      <Section eyebrow="Decision answer" title="What is approved, blocked, and required">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-md border border-emerald-500/25 bg-emerald-500/5 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Decision</p>
            <h3 className="mt-3 text-2xl font-semibold text-foreground">{cleanDisplayText(payload.decision)}</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{cleanDisplayText(payload.rationale)}</p>
          </div>
          <div className="rounded-md border border-primary/25 bg-primary/5 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Release rule</p>
            <h3 className="mt-3 text-2xl font-semibold text-foreground">No bid / exchange / deposit</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{cleanDisplayText(payload.capitalRule)}</p>
          </div>
          <div className="rounded-md border border-amber-500/25 bg-amber-500/5 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">Purpose boundary</p>
            <h3 className="mt-3 text-2xl font-semibold text-foreground">Family use only</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{cleanDisplayText(payload.purpose)}</p>
          </div>
        </div>
      </Section>

      <Section eyebrow={inputFrame?.eyebrow} title="The live family decision">
        <div className="grid gap-4 lg:grid-cols-4">
          {(inputFrame?.cards ?? []).slice(0, 4).map((card, index) => (
            <PrincipalInfoCard
              key={`${card.label}-${index}`}
              label={card.label}
              title={card.value || card.title || card.label}
              body={card.body || ""}
              tone={index === 1 ? "success" : index === 3 ? "warning" : "default"}
            />
          ))}
        </div>
      </Section>

      <Section eyebrow="Capital consequence" title="The house is not committing only the guide price">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {capitalCards.map((card) => (
            <MetricCard
              key={card.label}
              label={card.label}
              value={card.value}
              note={card.note}
            />
          ))}
        </div>
        <div className="mt-6">
          <PrincipalTable
            columns={["Carry component", "Annual amount", "Owner", "Release condition"]}
            rows={uniqueRows(reportRows(capital, 5), 5)}
          />
        </div>
      </Section>

      <Section eyebrow="What changes before capital moves" title="The family gets a release rule, not just diligence">
        <PrincipalTable columns={["Before", "After this memo", "Family consequence"]} rows={whatChangesRows} />
      </Section>

      <Section eyebrow={market?.eyebrow} title="Negotiation authority is separate from market attractiveness">
        <div className="grid gap-4 lg:grid-cols-4">
          <MetricCard
            label="Routes compared"
            value={cardValue(market, "routes compared", `${payload.routeOptions.length}`)}
            note="Direct, structure, status, rent-first, and stop/reset routes are reviewed against release conditions."
          />
          <MetricCard
            label="Public source anchors"
            value={cardValue(market, "public source anchors", `${payload.publicSources.length}`)}
            note="Legal, tax, market, FX, property, and public authority anchors support the model."
          />
          <MetricCard
            label="Transaction analogues"
            value={cardValue(market, "transaction analogues", "Release-gated")}
            note="Comparable movement context informs failure modes and route discipline."
          />
          <MetricCard
            label="Bid posture"
            value="Guide price is not authority"
            note="No bid release without closed comps, failed-sale history, seller motivation, capex adjustment, and walk-away price."
          />
        </div>
        <div className="mt-6">
          <PrincipalTable
            columns={market?.table?.columns ?? ["Expectation", "Market read", "Deviation", "Decision consequence"]}
            rows={uniqueRows(reportRows(market), 4)}
          />
        </div>
      </Section>

      <Section eyebrow="Route alternatives" title="The family is choosing a release path, not a property wrapper">
        <div className="grid gap-4 lg:grid-cols-5">
          {payload.routeOptions.map((option) => (
            <RouteOptionCard key={option.id} option={option} selected={option.id === selectedRoute.id} />
          ))}
        </div>
      </Section>

      <ReleaseGateTable gateRows={payload.gateRows} />

      <Section eyebrow="Advance / hold / stop" title="The family should know exactly what changes the decision">
        <PrincipalConditionGrid
          advance={payload.advanceConditions}
          hold={payload.holdConditions}
          stop={payload.stopConditions}
        />
      </Section>

      <Section eyebrow={taxLegal?.eyebrow} title="Tax and legal posture: modeled, not released">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {(taxLegal?.cards ?? []).slice(0, 4).map((card, index) => (
            <PrincipalInfoCard
              key={`${card.label}-${index}`}
              label={card.label}
              title={card.value || card.title || card.label}
              body={card.body || ""}
              tone={index === 0 ? "primary" : "default"}
            />
          ))}
        </div>
        <div className="mt-6">
          <PrincipalTable
            columns={taxLegal?.table?.columns ?? ["Route reviewed", "Mechanism", "Model effect", "Release requirement"]}
            rows={uniqueRows(reportRows(taxLegal), 4)}
          />
        </div>
      </Section>

      <Section eyebrow={banking?.eyebrow} title="Banking and source movement must be accepted, not narrated">
        <div className="grid gap-4 md:grid-cols-2">
          {(banking?.cards ?? []).map((card, index) => (
            <PrincipalInfoCard
              key={`${card.label}-${index}`}
              label={card.label}
              title={card.value || card.title || card.label}
              body={card.body || ""}
              tone={index === 0 ? "warning" : "primary"}
            />
          ))}
        </div>
        <div className="mt-6">
          <PrincipalTable
            columns={banking?.table?.columns ?? ["Rail or proof class", "Requirement"]}
            rows={uniqueRows(reportRows(banking), 7)}
          />
        </div>
      </Section>

      <Section eyebrow={recordMismatch?.eyebrow} title="Records must tell one route story">
        <PrincipalTable
          columns={recordMismatch?.table?.columns ?? ["Record", "Current record", "Mismatch risk", "Target record", "Owner", "Status"]}
          rows={uniqueRows(reportRows(recordMismatch), 6)}
        />
      </Section>

      <Section eyebrow={responsibility?.eyebrow} title="Responsibility must transfer before capital does">
        <PrincipalTable
          columns={responsibility?.table?.columns ?? ["Role", "See", "Stop", "Sign", "Move", "Retrieve", "Explain", "Release status"]}
          rows={uniqueRows(reportRows(responsibility), 9)}
        />
      </Section>

      <Section eyebrow={authority?.eyebrow} title="Authority, veto, and escalation must be written">
        <div className="grid gap-4 md:grid-cols-3">
          {(authority?.cards ?? []).map((card, index) => (
            <PrincipalInfoCard
              key={`${card.label}-${index}`}
              label={card.label}
              title={card.value || card.title || card.label}
              body={card.body || ""}
              tone={index === 2 ? "warning" : "default"}
            />
          ))}
        </div>
        <div className="mt-6">
          <PrincipalTable
            columns={authority?.table?.columns ?? ["Authority group", "Names or roles"]}
            rows={uniqueRows(reportRows(authority), 4)}
          />
        </div>
      </Section>

      <Section eyebrow="Family continuity" title="The house should transfer responsibility, not just symbolism">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {(continuity?.cards ?? []).map((card, index) => (
            <PrincipalInfoCard
              key={`${card.label}-${index}`}
              label={card.label}
              title={card.value || card.title || card.label}
              body={`${card.body || ""} ${card.releaseCondition || ""}`}
              tone={index === 2 ? "warning" : index === 3 ? "success" : "default"}
            />
          ))}
        </div>
        <div className="mt-6">
          <PrincipalTable
            columns={continuity?.table?.columns ?? ["Succession layer", "Compatibility", "Loss if unfixed", "Release lock"]}
            rows={uniqueRows(reportRows(continuity), 3)}
          />
        </div>
      </Section>

      <Section eyebrow={specialist?.eyebrow} title="Specialist desks that can change the release decision">
        <PrincipalTable
          columns={specialist?.table?.columns ?? ["Gate", "Answer", "Decision consequence", "Evidence required", "Owner"]}
          rows={uniqueRows(reportRows(specialist), 4)}
        />
      </Section>

      <Section eyebrow="Crisis resilience" title="The move must survive crisis before it survives presentation">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {(crisis?.cards ?? []).slice(0, 10).map((card, index) => (
            <PrincipalInfoCard
              key={`${card.label}-${index}`}
              label={card.label}
              title={card.value || card.title || card.label}
              body={`${card.body || ""} ${card.releaseCondition ? `Release condition: ${card.releaseCondition}.` : ""}`}
              tone={card.label?.toLowerCase().includes("critical") ? "danger" : index < 2 ? "warning" : "default"}
            />
          ))}
        </div>
        <div className="mt-6">
          <PrincipalTable
            columns={crisis?.table?.columns ?? ["Bank compliance escalation", "Breakpoint", "Required response"]}
            rows={uniqueRows(reportRows(crisis), 5)}
          />
        </div>
      </Section>

      <Section eyebrow={antiFragility?.eyebrow} title="The route should get stronger when challenged">
        <PrincipalTable
          columns={antiFragility?.table?.columns ?? ["Control", "Stress event", "Release test", "Owner", "Window"]}
          rows={uniqueRows(reportRows(antiFragility), 7)}
        />
      </Section>

      <Section eyebrow={wealth?.eyebrow} title="Base, stress, and opportunity cases are release consequences">
        <div className="grid gap-4 md:grid-cols-3">
          {(wealth?.cards ?? []).map((card, index) => (
            <PrincipalInfoCard
              key={`${card.label}-${index}`}
              label={card.label}
              title={card.value || card.title || card.label}
              body={card.body || ""}
              tone={index === 2 ? "warning" : "default"}
            />
          ))}
        </div>
        <div className="mt-6">
          <PrincipalTable
            columns={wealth?.table?.columns ?? ["Scenario", "Probability", "Year 10 value", "Net result vs capital", "Memo read"]}
            rows={uniqueRows(reportRows(wealth), 3)}
          />
        </div>
      </Section>

      <Section eyebrow={scenario?.eyebrow} title="The final decision tree is binary at the gate">
        <PrincipalTable
          columns={scenario?.table?.columns ?? ["Branch", "Condition", "Consequence", "Verdict"]}
          rows={uniqueRows(reportRows(scenario), 3)}
        />
      </Section>

      <Section eyebrow={decisionMemory?.eyebrow} title="The decision must be retrievable years later">
        <div className="grid gap-4 md:grid-cols-2">
          {(decisionMemory?.cards ?? []).map((card, index) => (
            <PrincipalInfoCard
              key={`${card.label}-${index}`}
              label={card.label}
              title={card.value || card.title || card.label}
              body={card.body || ""}
              tone={index === 0 ? "primary" : "default"}
            />
          ))}
        </div>
        <div className="mt-6">
          <PrincipalTable
            columns={decisionMemory?.table?.columns ?? ["Report", "Cadence", "Owner", "Recipients", "Release relevance"]}
            rows={uniqueRows(reportRows(decisionMemory), 3)}
          />
        </div>
      </Section>

      <Section eyebrow={roadmap?.eyebrow} title="Next seven days: the controlled order of movement">
        <PrincipalTable
          columns={roadmap?.table?.columns ?? ["Order", "Step", "Action", "Owner", "Timeline", "Release gate"]}
          rows={uniqueRows(reportRows(roadmap), 9)}
        />
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
          <p className="font-semibold text-foreground">{money(option.metrics.totalDutiesUsd, "US$0 / no purchase")}</p>
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

export default function PrincipalReleaseReadinessSharePage({
  reference,
  payload,
  initialSurfaceError,
}: PrincipalReleaseReadinessSharePageProps) {
  const router = useRouter();
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

        {activeView !== "principal" ? (
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
        {activeView === "route" ? <FullReportSections sections={payload.reportSections} /> : null}
        {activeView === "evidence" ? (
          <EvidenceVaultView publicSources={payload.publicSources} privateEvidence={payload.privateEvidence} />
        ) : null}
        {activeView === "methodology" ? (
          <MethodologyView drivers={payload.methodDrivers} />
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
