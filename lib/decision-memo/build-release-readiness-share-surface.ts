import type { PdfMemoData } from "@/lib/pdf/pdf-types";
import type { ResolvedDecisionMemoSurfaceData } from "@/lib/decision-memo/resolve-decision-memo-surface-data";
import {
  buildRouteIntelligenceV2,
  type RouteDriverSourceRecord,
  type RouteIntelligenceOptionV2,
  type RouteIntelligenceV2,
} from "@/lib/decision-memo/route-intelligence-v2";

type RecordLike = Record<string, any>;

const SHARE_SURFACE_CONTRACT = "hnwi_release_readiness_principal_share_v2";

export interface ReleaseReadinessShareRouteOption {
  id: string;
  rank: number;
  routeName: string;
  routeType: string;
  verdict: string;
  releaseRule: string;
  bestUse: string;
  economicRead: string;
  failureMode: string;
  releaseEffect: string;
  metrics: {
    propertyValueUsd: number;
    bsdUsd: number;
    absdUsd: number;
    totalDutiesUsd: number;
    totalAcquisitionCostUsd: number;
    incrementalDutyVsRecommendedUsd: number;
    dutyDragPct: number;
    annualCarryingCostUsd: number;
    dataQuality: string;
    mitigationTimeline: string;
  };
}

export interface ReleaseReadinessShareGateRow {
  gate: string;
  state: string;
  condition: string;
  consequence: string;
}

export interface ReleaseReadinessShareSource {
  id: string;
  category: string;
  institution: string;
  title: string;
  date: string;
  claim: string;
  boundary: string;
  url: string;
}

export interface ReleaseReadinessPrivateEvidence {
  label: string;
  status: string;
  owner: string;
  decisionUse: string;
}

export interface ReleaseReadinessMethodSource {
  id: string;
  title: string;
  date: string;
  url: string;
}

export interface ReleaseReadinessMethodDriver {
  id: string;
  title: string;
  driver: string;
  releaseRead: string;
  sources: ReleaseReadinessMethodSource[];
}

export interface ReleaseReadinessShareCitation {
  id: string;
  number: number;
  originalText: string;
}

export interface ReleaseReadinessShareCard {
  label: string;
  value?: string;
  title?: string;
  body?: string;
  owner?: string;
  status?: string;
  releaseCondition?: string;
}

export interface ReleaseReadinessShareTable {
  columns: string[];
  rows: string[][];
}

export interface ReleaseReadinessShareChartPoint {
  year: number;
  value: number;
}

export interface ReleaseReadinessShareChartSeries {
  name: string;
  verdict: string;
  points: ReleaseReadinessShareChartPoint[];
}

export interface ReleaseReadinessShareReportSection {
  id: string;
  eyebrow: string;
  title: string;
  intro?: string;
  cards?: ReleaseReadinessShareCard[];
  table?: ReleaseReadinessShareTable;
  bullets?: string[];
  chart?: ReleaseReadinessShareChartSeries[];
}

export interface ReleaseReadinessSharePayload {
  surfaceContract: typeof SHARE_SURFACE_CONTRACT;
  reference: string;
  title: string;
  corridor: string;
  move: string;
  decision: string;
  releaseRule: string;
  purpose: string;
  capitalRule: string;
  rationale: string;
  riskLevel: string;
  mitigation: string;
  selectedRoute: ReleaseReadinessShareRouteOption;
  routeOptions: ReleaseReadinessShareRouteOption[];
  gateRows: ReleaseReadinessShareGateRow[];
  advanceConditions: string[];
  holdConditions: string[];
  stopConditions: string[];
  publicSources: ReleaseReadinessShareSource[];
  privateEvidence: ReleaseReadinessPrivateEvidence[];
  methodDrivers: ReleaseReadinessMethodDriver[];
  citations: ReleaseReadinessShareCitation[];
  reportSections: ReleaseReadinessShareReportSection[];
}

function isRecord(value: unknown): value is RecordLike {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isRemoteCitationId(value: string): boolean {
  const id = value.trim();
  return /^castle_[a-z0-9]+$/i.test(id) || /^[a-f0-9]{24}$/i.test(id) || /^dev_[a-z0-9_-]+$/i.test(id);
}

function asRecord(value: unknown): RecordLike {
  return isRecord(value) ? value : {};
}

function asArray(value: unknown): RecordLike[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function text(value: unknown, fallback = ""): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

function numberOr(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function sanitizeShareText(value: unknown): string {
  return text(value)
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
    .replace(/\breleased differently\b/gi, "advanced under signed gates")
    .replace(/\brelease differently\b/gi, "advance under signed gates")
    .replace(/\bSIX-BOOK OPENING\b/gi, "Decision Opening")
    .replace(/\bSix-book opening\b/gi, "Decision opening")
    .replace(/\bFull Decision Memo\b/gi, "Release Readiness Review")
    .replace(/\bDecision Memo\b/gi, "Release Readiness Review")
    .replace(/\bPressure Variants Tested\b/gi, "Release Readiness Routes Reviewed")
    .replace(/\bpressure variants?\b/gi, "release-readiness routes")
    .replace(/\bPressure Test\b/gi, "Release Readiness Review")
    .replace(/\bpressure-test(?:ed|ing)?\b/gi, "release-readiness reviewed")
    .replace(/\bpressure read\b/gi, "release read")
    .replace(/\bseller pressure\b/gi, "seller timing")
    .replace(/\bbank pressure\b/gi, "bank readiness")
    .replace(/\babsence pressure\b/gi, "absence readiness")
    .replace(/\bpressure\b/gi, "readiness")
    .replace(/\bsubstituted\b/gi, "")
    .replace(/\bNative Route Drivers\b/g, "Route Drivers From Source Review")
    .replace(/\bnative route drivers\b/gi, "route drivers from source review")
    .replace(/\bHNWI Chronicles pattern-library ledger\b/gi, "HNWI Chronicles source-review register")
    .replace(/\bpattern-library\b/gi, "source-review")
    .replace(/\bpattern library\b/gi, "source-review register")
    .replace(/\broute-pattern rows\b/gi, "route-pattern source records")
    .replace(/\bsource rows\b/gi, "source records")
    .replace(/\bcastle briefs?\b/gi, "source records")
    .replace(/\bCastle Briefs?\b/g, "Source records")
    .replace(/\bKGv3\b/g, "source register")
    .replace(/\bDM64\b/g, "release-readiness compiler")
    .replace(/\bGranthika\b/g, "source library")
    .replace(/\bAquarium\b/g, "source-review memory")
    .replace(/\bAI banking crisis simulation\b/gi, "Bank compliance escalation simulation")
    .replace(/\bG1\s*\/\s*G2\s*\/\s*G3\b/g, "generation-to-generation")
    .replace(/\bG1 principal\b/gi, "principal")
    .replace(/\bG2 son\b/gi, "named family user")
    .replace(/\bG2 daughter\s*\/\s*fairness owner\b/gi, "named family-fairness owner")
    .replace(/\bdaughter\s*\/\s*fairness owner\b/gi, "named family-fairness owner")
    .replace(/\bdaughter fairness\b/gi, "family-fairness")
    .replace(/\bG3 grandson\b/gi, "next-generation continuity")
    .replace(/\bfuture-grandchild\b/gi, "next-generation")
    .replace(/\bgrandson\b/gi, "next-generation record")
    .replace(/\bson\b/gi, "named family user")
    .replace(/\bdaughter\b/gi, "named family-fairness owner")
    .replace(/\bson-use\b/gi, "named family-user")
    .replace(/\bson use\b/gi, "named family-user")
    .replace(/\bnamed family user-use\b/gi, "named family-user use")
    .replace(/\bdaughter\/fairness\b/gi, "family-fairness")
    .replace(/\bspouse veto if relevant\b/gi, "family-home veto position where recorded")
    .replace(/\bspouse if relevant\b/gi, "family-home veto holder where recorded")
    .replace(/\bspouse veto\b/gi, "family-home veto position")
    .replace(/\bmemo source file\b/gi, "source register")
    .replace(/\brelease-readiness reviewing\b/gi, "release-readiness review")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeObject<T>(value: T): T {
  if (typeof value === "string") {
    return sanitizeShareText(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeObject(item)) as T;
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const output: RecordLike = {};
  Object.entries(value as RecordLike).forEach(([key, entry]) => {
    if (
      [
        "backendData",
        "fullArtifact",
        "full_artifact",
        "runtime_packet",
        "writeback_packet",
        "dm64_kernel",
        "native_moat_packet",
        "pattern_learning_overlay",
        "full_castle_brief",
        "castle_brief",
        "castle_brief_enriched",
        "full_text",
      ].includes(key)
    ) {
      return;
    }
    output[key] = sanitizeObject(entry);
  });
  return output as T;
}

function pickSection(data: ResolvedDecisionMemoSurfaceData, key: string): unknown {
  const memoData = asRecord(data.memoData);
  const backendData = asRecord(data.backendData);
  const fullArtifact = asRecord(data.fullArtifact);
  const previewData = isRecord(memoData.preview_data)
    ? memoData.preview_data
    : isRecord(backendData.preview_data)
      ? backendData.preview_data
      : {};

  return fullArtifact[key] ?? memoData[key] ?? previewData[key] ?? backendData[key] ?? null;
}

function sourceCitationId(source: RouteDriverSourceRecord | RecordLike): string {
  return text(
    source.source_development_id ??
      source.dev_id ??
      source.devid ??
      source.citation_id ??
      source.id ??
      source.brief_id ??
      source.source_brief_id,
  );
}

function publicSourceDate(source: RecordLike): string {
  const candidate = source.source_date ?? source.date ?? source.published_at ?? source.created_at;
  if (typeof candidate === "string") return candidate;
  if (isRecord(candidate) && typeof candidate.$date === "string") return candidate.$date.slice(0, 10);
  return "";
}

function sanitizeDriverSource(source: RouteDriverSourceRecord): RouteDriverSourceRecord {
  const id = sourceCitationId(source);
  return {
    id,
    source_development_id: id,
    citation_id: id,
    title: sanitizeShareText(source.title ?? "Source record"),
    url: text(source.url ?? source.source_url),
    source_url: text(source.source_url ?? source.url),
    date: publicSourceDate(source),
    source_date: publicSourceDate(source),
    industry: sanitizeShareText(source.industry ?? "Source Review"),
    decision_posture: sanitizeShareText(source.decision_posture),
    quality_score: typeof source.quality_score === "number" ? source.quality_score : undefined,
  };
}

function sanitizeRouteOption(option: RouteIntelligenceOptionV2): RouteIntelligenceOptionV2 {
  return sanitizeObject({
    id: text(option.id),
    rank: numberOr(option.rank, 1),
    routeName: sanitizeShareText(option.routeName),
    routeType: sanitizeShareText(option.routeType),
    verdict: sanitizeShareText(option.verdict),
    releaseRule: option.releaseRule,
    bestUse: sanitizeShareText(option.bestUse),
    economicRead: sanitizeShareText(option.economicRead),
    failureMode: sanitizeShareText(option.failureMode),
    releaseEffect: sanitizeShareText(option.releaseEffect),
    taxAudit: {},
    metrics: {
      propertyValueUsd: numberOr(option.metrics?.propertyValueUsd),
      bsdUsd: numberOr(option.metrics?.bsdUsd),
      absdUsd: numberOr(option.metrics?.absdUsd),
      totalDutiesUsd: numberOr(option.metrics?.totalDutiesUsd),
      totalAcquisitionCostUsd: numberOr(option.metrics?.totalAcquisitionCostUsd),
      incrementalDutyVsRecommendedUsd: numberOr(option.metrics?.incrementalDutyVsRecommendedUsd),
      dutyDragPct: numberOr(option.metrics?.dutyDragPct),
      annualCarryingCostUsd: numberOr(option.metrics?.annualCarryingCostUsd),
      dataQuality: sanitizeShareText(option.metrics?.dataQuality),
      mitigationTimeline: sanitizeShareText(option.metrics?.mitigationTimeline),
    },
    jurisdictionValues: (option.jurisdictionValues ?? []).map((row) => ({
      jurisdiction: sanitizeShareText(row.jurisdiction),
      value: sanitizeShareText(row.value),
      releaseRead: sanitizeShareText(row.releaseRead),
    })),
    evidenceGates: (option.evidenceGates ?? []).map((gate) => sanitizeObject(gate)),
    responsibilityTransfer: (option.responsibilityTransfer ?? []).map((row) => sanitizeObject(row)),
    recordMismatchMap: (option.recordMismatchMap ?? []).map((row) => sanitizeObject(row)),
    counselQuestionPack: (option.counselQuestionPack ?? []).map((row) => sanitizeObject(row)),
    stressSignals: (option.stressSignals ?? []).map((row) => sanitizeObject(row)),
    scenarios: (option.scenarios ?? []).map((row) => sanitizeObject(row)),
  }) as RouteIntelligenceOptionV2;
}

function buildSafeRouteIntelligence(route: RouteIntelligenceV2, reference: string): RecordLike {
  const routeOptions = route.routeOptions.map(sanitizeRouteOption);
  const selectedRoute =
    routeOptions.find((option) => option.id === route.recommendedRouteId) ??
    routeOptions[0];

  return {
    surfaceContract: route.surfaceContract,
    surfaceEyebrow: "Proposed Move Release Readiness",
    surfaceTitle: sanitizeShareText(route.surfaceTitle ?? "Release Readiness Review"),
    nativeRouteDrivers: (route.nativeRouteDrivers ?? []).map(sanitizeShareText),
    nativeRouteDriverTitle: sanitizeShareText(route.nativeRouteDriverTitle ?? "Route Drivers From Source Review"),
    nativeRouteDriverSubtitle: sanitizeShareText(route.nativeRouteDriverSubtitle),
    nativeRouteDriverNote: sanitizeShareText(route.nativeRouteDriverNote),
    routeDriverRegister: route.routeDriverRegister
      ? {
          items: route.routeDriverRegister.items.map((driver) => ({
            id: text(driver.id),
            title: sanitizeShareText(driver.title),
            driver: sanitizeShareText(driver.driver),
            releaseRead: sanitizeShareText(driver.releaseRead),
            evidenceBasis: sanitizeShareText(driver.evidenceBasis),
            sourceIds: driver.sources.map(sourceCitationId).filter(Boolean),
            sources: driver.sources.map(sanitizeDriverSource).filter((source) => Boolean(source.id)),
          })),
        }
      : undefined,
    selectorLabel: "Route Being Released",
    selectorCopy:
      "Review release-readiness routes against the proposed move. The downstream tax audit, jurisdiction readiness, carrying-cost stance, release gates, scenario data, and owner matrix show what changes if the proposed route is modified, held, or stopped.",
    comparisonLabel: "Release Readiness Routes",
    comparisonTitle: "Routes reviewed against the proposed route, not new advisory options.",
    selectedRouteLabel: "Route Under Review",
    memoReference: reference,
    generatedAt: route.generatedAt,
    corridor: sanitizeShareText(route.corridor),
    move: sanitizeShareText(route.move),
    recommendedRouteId: text(route.recommendedRouteId, selectedRoute?.id),
    selectedLiveOption: selectedRoute,
    proposedRoute: selectedRoute,
    routeOptions,
    buyerProfileMatrix: sanitizeObject(route.buyerProfileMatrix),
    principalValueGate: route.principalValueGate ? sanitizeObject(route.principalValueGate) : undefined,
    sourceRead:
      "This share surface reads the stored release-readiness review and shows the decision packet, evidence boundary, route gates, and source citations without exposing private records or compiler internals.",
  };
}

function buildDefaultPrivateEvidence() {
  return [
    ["Buyer profile", "Principal / FO operator", "Identity class, residence posture, property count, and buyer capacity."],
    ["Title pack", "UK property counsel", "Title, searches, survey, restrictions, seller authority, insurance, and exchange mechanics."],
    ["SDLT computation", "UK tax counsel", "Signed SDLT treatment, surcharges, relief exclusions, and filing responsibility."],
    ["SoW / SoF file", "Source bank", "Corroborated source narrative, account path, adverse-media checks, and transfer authority."],
    ["Receiving and fallback rails", "Receiving bank", "Primary rail, fallback rail, KYC acceptance, FX authority, limits, and timetable."],
    ["Family authority minute", "Family office / principal", "Use boundary, veto position, title authority, carry owner, sale/refinance limits, and decision memory."],
    ["Family fairness minute", "Family fairness owner", "Notice, fairness protection, beneficiary treatment, and next-generation record."],
    ["Operating file", "FO operator", "Insurance quote, security plan, service contracts, initial carry budget, and reporting cadence."],
  ].map(([label, owner, detail]) => ({
    label,
    owner,
    release_effect: detail,
  }));
}

function buildSafeReleasePacket(data: ResolvedDecisionMemoSurfaceData) {
  const releasePacket = asRecord(pickSection(data, "release_decision_packet"));

  return sanitizeObject({
    rationale:
      releasePacket.rationale ??
      "The route can advance only if authority, evidence, source, bank, title, tax, and family-use gates clear before seller timing hardens.",
    advance_conditions:
      Array.isArray(releasePacket.advance_conditions) && releasePacket.advance_conditions.length
        ? releasePacket.advance_conditions
        : [
            "Direct-buyer route selected for negotiation only.",
            "No bid release without closed comps, failed-sale history, seller motivation, capex adjustment, first-offer range, and walk-away price.",
            "No exchange or deposit without signed title, SDLT, source-of-funds, bank rail, family authority, and bid discipline.",
          ],
    hold_conditions:
      Array.isArray(releasePacket.hold_conditions) && releasePacket.hold_conditions.length
        ? releasePacket.hold_conditions
        : [
            "Hold if any mismatch remains across buyer route, beneficial owner, title, tax position, source account, signer authority, bank timetable, or family authority.",
          ],
    stop_conditions:
      Array.isArray(releasePacket.stop_conditions) && releasePacket.stop_conditions.length
        ? releasePacket.stop_conditions
        : [
            "Stop if seller timing requires exchange, deposit, or exclusivity before source, title, tax, bank, authority, and bid discipline are signed.",
            "Stop if the route is sold internally as yield, prestige, wrapper planning, or residence planning rather than controlled family use and continuity.",
          ],
  });
}

function buildSafeGates() {
  return {
    critical_gates: [
      {
        gate: "Buyer profile and SDLT treatment",
        state: "Required before bid release",
        evidence: "Signed buyer profile, non-resident status, additional-dwelling treatment, relief exclusions, and counsel computation.",
        why_it_matters: "The route cannot rely on relief, refund, wrapper, or residence benefit unless counsel signs the facts at trigger date.",
      },
      {
        gate: "Title and seller timetable",
        state: "Required before exchange",
        evidence: "Title, searches, survey, restrictions, insurance/security file, seller authority, deposit terms, and completion mechanics.",
        why_it_matters: "Seller timing cannot outrun title readiness or convert a review into a capital commitment.",
      },
      {
        gate: "SoW / SoF and bank rails",
        state: "Required before exchange",
        evidence: "Source bank, receiving bank, fallback bank rail, KYC, sanctions/adverse-media clearance, FX authority, transfer limits, and timetable.",
        why_it_matters: "Capital should not move while the transfer path is only narrated.",
      },
      {
        gate: "Authority and veto map",
        state: "Required before bid or exchange",
        evidence: "Founder authority, named family-user boundary, family-home veto position where recorded, sale/refinance rights, and carry owner.",
        why_it_matters: "The asset cannot become a silent family promise or future conflict point.",
      },
      {
        gate: "Family fairness and next-generation record",
        state: "Required before bid or exchange",
        evidence: "Named family-fairness owner, notice minute, beneficiary treatment, and decision record location.",
        why_it_matters: "The purchase must remain legible six years later without relying on founder memory.",
      },
      {
        gate: "Bid discipline",
        state: "Required before bid release",
        evidence: "Closed comps, failed-sale history, price-cut history, seller motivation, capex adjustment, first-offer range, and walk-away price.",
        why_it_matters: "The guide price is not bid authority.",
      },
    ],
  };
}

function gateRowsFromSafeGates(gates: ReturnType<typeof buildSafeGates>): ReleaseReadinessShareGateRow[] {
  return gates.critical_gates.map((gate) => ({
    gate: sanitizeShareText(gate.gate),
    state: sanitizeShareText(gate.state),
    condition: sanitizeShareText(gate.evidence),
    consequence: sanitizeShareText(gate.why_it_matters),
  }));
}

function buildSafePublicSources(data: ResolvedDecisionMemoSurfaceData) {
  const sources = asArray(pickSection(data, "governing_source_register") ?? pickSection(data, "source_register"));
  return sources.map((source, index) => ({
    id: text(source.id, `R${index + 1}`),
    category: sanitizeShareText(source.category ?? "Source Register"),
    institution: sanitizeShareText(source.institution ?? "Source"),
    title: sanitizeShareText(source.title ?? "Source record"),
    date: sanitizeShareText(source.date ?? source.checked_at ?? "Checked in source register"),
    claim: sanitizeShareText(source.claim_supported ?? source.claim ?? "Supports the stated source-register claim."),
    boundary: sanitizeShareText(
      source.decision_boundary ??
        source.limit ??
        "Supports only the stated claim; private execution evidence remains separately gated.",
    ),
    url: text(source.url),
  })) satisfies ReleaseReadinessShareSource[];
}

function buildSafeRisk(data: ResolvedDecisionMemoSurfaceData, route: RouteIntelligenceV2) {
  const risk = asRecord(pickSection(data, "risk_assessment"));
  const selected = route.selectedLiveOption ?? route.routeOptions[0];

  return sanitizeObject({
    risk_level: risk.risk_level ?? "High until signed gates clear",
    mitigation_timeline:
      risk.mitigation_timeline ??
      selected?.metrics?.mitigationTimeline ??
      "72-hour evidence sprint, then counsel, bank, title, and authority close path.",
  });
}

function releasePacketList(value: unknown, fallback: string[]): string[] {
  return (Array.isArray(value) && value.length ? value : fallback).map(sanitizeShareText).filter(Boolean);
}

function moneyText(value: unknown, fallback = "Release-gated"): string {
  const numeric = numberOr(value);
  if (!numeric) return fallback;
  return `US$${Math.round(numeric).toLocaleString("en-US")}`;
}

function percentText(value: unknown, fallback = "Release-gated"): string {
  const numeric = numberOr(value, Number.NaN);
  if (!Number.isFinite(numeric)) return fallback;
  return `${numeric.toFixed(Math.abs(numeric) < 10 ? 2 : 1)}%`;
}

function safeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(sanitizeShareText).filter(Boolean);
}

function cleanRows(rows: string[][]): string[][] {
  return rows
    .map((row) => row.map((cell) => sanitizeShareText(cell || "Release-gated")))
    .filter((row) => row.some((cell) => cell && cell !== "Release-gated"));
}

function reportSection(section: ReleaseReadinessShareReportSection): ReleaseReadinessShareReportSection {
  return sanitizeObject({
    ...section,
    cards: section.cards?.filter((card) => Boolean(card.label || card.title || card.value || card.body)),
    table: section.table
      ? {
          columns: section.table.columns.map(sanitizeShareText),
          rows: cleanRows(section.table.rows),
        }
      : undefined,
    bullets: section.bullets?.map(sanitizeShareText).filter(Boolean),
  });
}

function routeSanitizedParty(value: unknown): string {
  return sanitizeShareText(value)
    .replace(/\bSpouse if family-home use or veto rights are relevant\b/gi, "Family-home veto holder where recorded")
    .replace(/\bSpouse if family-home use is intended\b/gi, "Family-home veto holder where recorded")
    .replace(/\bSpouse\b/g, "Family-home veto holder")
    .replace(/\bG2 son\b/gi, "Named family user")
    .replace(/\bG2 daughter\s*\/\s*fairness owner\b/gi, "Named family-fairness owner")
    .replace(/\bG3\/grandchild\b/gi, "Next-generation continuity")
    .replace(/\bG3 grandson\b/gi, "Next-generation continuity")
    .replace(/\bfuture-grandchild\b/gi, "next-generation")
    .replace(/\bgrandson\b/gi, "next-generation beneficiary");
}

function buildInputFrameSection(payload: {
  move: string;
  corridor: string;
  decision: string;
  releaseRule: string;
  purpose: string;
  capitalRule: string;
}): ReleaseReadinessShareReportSection {
  return reportSection({
    id: "input-frame",
    eyebrow: "What the principal asked the memo to settle",
    title: "Original input frame",
    intro:
      "The review starts with one live route. It does not approve London, Mayfair, or a buyer structure in the abstract; it asks whether this specific move can release without the route hardening before proof.",
    cards: [
      {
        label: "Live move",
        value: payload.corridor,
        body: payload.move,
      },
      {
        label: "Approved decision posture",
        value: payload.decision,
        body: payload.releaseRule,
      },
      {
        label: "Purpose boundary",
        value: "Family use and continuity",
        body: payload.purpose,
      },
      {
        label: "Capital release rule",
        value: "No capital release",
        body: payload.capitalRule,
      },
    ],
  });
}

function buildCapitalSection(resolved: ResolvedDecisionMemoSurfaceData): ReleaseReadinessShareReportSection {
  const audit = asRecord(pickSection(resolved, "cross_border_audit_summary"));
  const acquisition = asRecord(asRecord(audit.acquisition_audit));
  const market = asRecord(pickSection(resolved, "current_market_data"));
  const model = asRecord(market.acquisition_duty_model);
  const wealth = asRecord(pickSection(resolved, "wealth_projection_data"));
  const costOfInaction = asRecord(wealth.cost_of_inaction);
  const annual = asRecord(pickSection(resolved, "annual_wealth_engine"));
  const carryModel = asRecord(annual.carrying_cost_model);
  const components = asArray(carryModel.annual_components);

  return reportSection({
    id: "capital-exposure-proof",
    eyebrow: "Capital and exposure proof",
    title: "What the house is really committing before operating costs",
    intro:
      "The guide price is not the economic exposure. The room must see purchase price, duty drag, annual carry, FX friction, and opportunity cost before bid release.",
    cards: [
      {
        label: "Transaction value",
        value: moneyText(acquisition.property_value_usd ?? model.price_usd),
        body: "Model transaction value converted to USD from the guide-price basis.",
      },
      {
        label: "Base SDLT",
        value: moneyText(acquisition.bsd_stamp_duty_usd ?? model.primary_fee_usd),
        body: "Base residential SDLT component for the selected control case.",
      },
      {
        label: "Non-resident + additional-dwelling surcharges",
        value: moneyText(acquisition.absd_additional_stamp_duty_usd ?? model.secondary_fee_usd),
        body: "Modeled surcharge exposure before any relief or refund is credited.",
      },
      {
        label: "Total duty drag",
        value: moneyText(acquisition.total_stamp_duties_usd ?? model.direct_total_duties_usd),
        body: `${percentText(acquisition.duty_drag_pct ?? model.direct_duty_drag_pct_of_price)} of transaction value in the control case.`,
      },
      {
        label: "All-in before operating costs",
        value: moneyText(acquisition.total_acquisition_cost_usd ?? model.direct_total_outlay_usd),
        body: "Purchase price plus modeled day-one duty drag; final exposure changes only after counsel signs the route.",
      },
      {
        label: "Annual carry before opportunity cost",
        value: moneyText(annual.annual_carrying_cost_before_opportunity_usd ?? model.annual_carrying_cost_before_opportunity_usd),
        body: sanitizeShareText(carryModel.use_policy_read ?? annual.read),
      },
      {
        label: "FX friction control",
        value: moneyText(model.one_time_fx_spread_control_usd ?? carryModel.one_time_fx_spread_control_usd),
        body: "One-time FX spread control estimate; final execution quote remains bank-gated.",
      },
      {
        label: "Every 100 bps of opportunity cost",
        value: moneyText(model.opportunity_cost_per_100bps_usd ?? asRecord(carryModel.opportunity_cost_sensitivity).per_100bps_on_purchase_price_usd),
        body: sanitizeShareText(asRecord(carryModel.opportunity_cost_sensitivity).read ?? costOfInaction.primary_driver),
      },
    ],
    table: {
      columns: ["Carry component", "Annual amount", "Owner", "Release condition"],
      rows: components.map((component) => [
        text(component.label),
        moneyText(component.amount_usd),
        text(component.owner),
        text(component.release_condition),
      ]),
    },
  });
}

function buildTaxSection(resolved: ResolvedDecisionMemoSurfaceData): ReleaseReadinessShareReportSection {
  const market = asRecord(pickSection(resolved, "current_market_data"));
  const model = asRecord(market.acquisition_duty_model);
  const audit = asRecord(pickSection(resolved, "cross_border_audit_summary"));
  const acquisition = asRecord(audit.acquisition_audit);
  const realAsset = asRecord(pickSection(resolved, "real_asset_audit"));
  const destination = asRecord(realAsset["London / United Kingdom"]);
  const strategies = asArray(destination.loophole_strategies);

  return reportSection({
    id: "tax-legal-route-readiness",
    eyebrow: "Tax and legal route readiness",
    title: "The route is tax-modeled, not tax-released",
    intro: sanitizeShareText(model.basis ?? "The memo uses official tax sources for the model and keeps final treatment counsel-gated."),
    cards: [
      {
        label: "Buyer category",
        value: text(acquisition.buyer_category ?? model.buyer_category),
        body: "Control case used until counsel signs a different buyer profile at the trigger date.",
      },
      {
        label: "Main-residence route",
        value: moneyText(model.main_residence_total_duties_usd),
        body: "Lower-duty case only if residence and disposal facts are signed; no future intention is credited.",
      },
      {
        label: "Company / non-natural-person route",
        value: moneyText(model.entity_total_duties_usd),
        body: "Higher complexity and disclosure route; only valid if a non-tax purpose survives counsel and bank acceptance.",
      },
      {
        label: "Avoided wrapper increment",
        value: moneyText(model.entity_incremental_duty_vs_direct_usd),
        body: "Avoided incremental duty versus entity route; this is not framed as a tax-saving thesis.",
      },
      {
        label: "ATED top-band exposure",
        value: moneyText(model.ated_2026_27_over_20m_usd),
        body: "Annual exposure before relief review if a company/non-natural-person route is used.",
      },
      {
        label: "Source currency basis",
        value: text(model.source_currency, "GBP"),
        body: `USD model rate: ${text(model.source_to_usd_rate ?? acquisition.fx_rate_to_usd)}. Final execution quote remains bank-gated.`,
      },
    ],
    table: {
      columns: ["Route reviewed", "Mechanism", "Model effect", "Release requirement"],
      rows: strategies.map((strategy) => [
        text(strategy.name),
        text(strategy.mechanism),
        text(strategy.tax_savings_potential),
        safeStringArray(strategy.requirements).join("; "),
      ]),
    },
  });
}

function buildMarketSection(
  resolved: ResolvedDecisionMemoSurfaceData,
  methodDrivers: ReleaseReadinessMethodDriver[],
): ReleaseReadinessShareReportSection {
  const market = asRecord(pickSection(resolved, "market_validation"));
  const expected = asRecord(market.expected_vs_reality);
  const peer = asRecord(pickSection(resolved, "peer_cohort_stats"));
  const expectations = Object.values(expected).filter(isRecord);
  const dataSources = safeStringArray(market.data_sources_used);

  return reportSection({
    id: "market-intelligence",
    eyebrow: "Market intelligence and peer read",
    title: "Market attractiveness is not release authority",
    intro: sanitizeShareText(
      market.recommendation ??
        "Market intelligence is used for bid discipline, timing control, and proof of what must be signed before the route can advance.",
    ),
    cards: [
      {
        label: "Confidence",
        value: text(market.overall_confidence, "Moderate"),
        body: sanitizeShareText(market.model_basis),
      },
      {
        label: "Routes compared",
        value: text(market.route_options_compared, "5"),
        body: "Direct, main-residence/replacement, wrapper, hold/rent-first, and stop/reset routes are reviewed against release conditions.",
      },
      {
        label: "Public source anchors",
        value: text(market.source_count, "31"),
        body: "Public legal, tax, property, market, and FX anchors support the model; private files still govern release.",
      },
      {
        label: "Transaction analogues",
        value: text(peer.direct_route_precedent_count, "21"),
        body: sanitizeShareText(peer.data_quality_note),
      },
      ...methodDrivers.slice(0, 4).map((driver) => ({
        label: driver.title,
        value: "Route driver",
        body: `${driver.driver} ${driver.releaseRead}`,
      })),
    ],
    table: {
      columns: ["Expectation", "Market read", "Deviation", "Decision consequence"],
      rows: expectations.map((row) => [
        text(row.your_expectation),
        text(row.market_actual),
        text(row.deviation),
        text(row.warning),
      ]),
    },
    bullets: dataSources,
  });
}

function buildWealthProjectionSection(resolved: ResolvedDecisionMemoSurfaceData): ReleaseReadinessShareReportSection {
  const wealth = asRecord(pickSection(resolved, "wealth_projection_data"));
  const scenarios = asRecord(wealth.scenarios);
  const scenarioEntries = ["base", "stress", "opportunity"]
    .map((key) => [key, asRecord(scenarios[key])] as const)
    .filter(([, scenario]) => Object.keys(scenario).length);
  const chart = scenarioEntries.map(([, scenario]) => ({
    name: sanitizeShareText(scenario.name),
    verdict: sanitizeShareText(scenario.verdict),
    points: asArray(scenario.year_by_year).map((point) => ({
      year: numberOr(point.year),
      value: numberOr(point.total_value ?? point.property_value ?? point.net_worth),
    })),
  }));

  return reportSection({
    id: "wealth-projection",
    eyebrow: "Base / stress / opportunity",
    title: "The curve must survive duty drag before it becomes a wealth story",
    intro:
      "The projection is a route-governance model. It shows whether the route can absorb day-one duty drag, early drawdown, annual carry, and family-control purpose.",
    cards: [
      {
        label: "Capital deployed",
        value: moneyText(wealth.capital_deployed),
        body: sanitizeShareText(asRecord(wealth.cost_of_inaction).primary_driver),
      },
      {
        label: "Expected value creation",
        value: moneyText(asRecord(wealth.probability_weighted).expected_value_creation),
        body: "Probability-weighted model after base, stress, and opportunity paths.",
      },
      {
        label: "Cost of hardening too early",
        value: moneyText(asRecord(wealth.cost_of_inaction).estimated_day_one_drag_usd),
        body: sanitizeShareText(asRecord(wealth.cost_of_inaction).secondary_driver),
      },
    ],
    table: {
      columns: ["Scenario", "Probability", "Year 10 value", "Net result vs capital", "Memo read"],
      rows: scenarioEntries.map(([, scenario]) => [
        text(scenario.name),
        percentText(numberOr(scenario.probability) * 100),
        moneyText(scenario.year_10_value ?? asRecord(scenario.ten_year_outcome).final_value),
        moneyText(asRecord(scenario.ten_year_outcome).net_value_creation),
        text(scenario.verdict),
      ]),
    },
    chart,
  });
}

function buildCrisisSection(resolved: ResolvedDecisionMemoSurfaceData): ReleaseReadinessShareReportSection {
  const crisis = asRecord(pickSection(resolved, "crisis_data"));
  const overall = asRecord(crisis.overall_resilience);
  const risks = asArray(crisis.route_risks);
  const selectedRisks = risks
    .filter((risk) =>
      /bank|AI|technology|job|labor|war|geopolitical|sanction|digital|stablecoin|rates|insurance|security|travel/i.test(
        text(risk.label),
      ),
    )
    .slice(0, 8);
  const bankSimulation = asArray(crisis.bank_compliance_escalation_simulation).slice(0, 5);

  return reportSection({
    id: "crisis-resilience",
    eyebrow: "Crisis resilience",
    title: "The purchase must survive live crisis regimes before exchange",
    intro: sanitizeShareText(
      overall.summary ??
        "The route cannot release until bank, source, sanctions, insurance, security, travel, technology, labor-income, and absence-readiness controls are evidenced.",
    ),
    cards: [
      {
        label: "Overall resilience",
        value: text(overall.rating, "Release-critical"),
        body: `Score ${text(overall.score, "68")}/100. ${sanitizeShareText(overall.buffer_required)}`,
      },
      {
        label: "Worst-case loss boundary",
        value: text(overall.worst_case_loss, "Duty drag plus deposit, FX, and adviser slippage"),
        body: sanitizeShareText(overall.recovery_time),
      },
      ...selectedRisks.map((risk) => ({
        label: text(risk.status, "Release-gated"),
        title: text(risk.label),
        body: text(risk.detail),
        status: `${text(risk.decision_window_days, "7")} day window`,
        releaseCondition: safeStringArray(risk.impact_channels).join(", "),
      })),
    ],
    table: {
      columns: ["Bank compliance escalation", "Breakpoint", "Required response"],
      rows: bankSimulation.map((row) => [
        text(row.scenario),
        text(row.breakpoint),
        text(row.required_response),
      ]),
    },
    bullets: safeStringArray(overall.key_vulnerabilities),
  });
}

function buildAntifragilitySection(resolved: ResolvedDecisionMemoSurfaceData): ReleaseReadinessShareReportSection {
  const stressTests = asArray(pickSection(resolved, "crisis_resilience_stress_test"));
  const anti = asArray(pickSection(resolved, "antifragile_resilience_test"));

  return reportSection({
    id: "anti-fragility",
    eyebrow: "Anti-fragility review",
    title: "The route must get stronger when challenged, not merely documented",
    intro:
      "A Mayfair route is not resilient because advisers agree. It is resilient only if the room can stop, explain, retrieve, and reroute when bank, seller, family, or counsel conditions move against it.",
    cards: anti.map((row) => ({
      label: text(row.control),
      body: text(row.stress_event),
      releaseCondition: text(row.release_test),
    })),
    table: {
      columns: ["Control", "Stress event", "Release test", "Owner", "Window"],
      rows: stressTests.map((row) => [
        text(row.control),
        text(row.stress_event),
        text(row.release_test),
        text(row.owner),
        `${text(row.decision_window_days, "7")} days`,
      ]),
    },
  });
}

function buildGenerationSection(resolved: ResolvedDecisionMemoSurfaceData): ReleaseReadinessShareReportSection {
  const heir = asRecord(pickSection(resolved, "heir_management_data"));
  const g1 = asRecord(heir.g1_position);
  const g12 = asRecord(heir.g1_to_g2_transfer);
  const g23 = asRecord(heir.g2_to_g3_transfer);
  const structured = asRecord(heir.with_structure);
  const third = asRecord(heir.third_generation_problem);
  const layerMap = asArray(heir.succession_layer_map);

  return reportSection({
    id: "g1-g2-g3-continuity",
    eyebrow: "G1 -> G2 -> G3 wealth transfer",
    title: "The house should transfer responsibility before it transfers symbolism",
    intro: sanitizeShareText(
      heir.read ??
        "The property must be legible across generations: who can use it, who can stop it, who pays for it, and who can explain it later.",
    ),
    cards: [
      {
        label: "G1 route control",
        value: text(g1.asset_value_formatted ?? moneyText(g1.asset_value)),
        body: text(g1.read),
        status: `Retention ${text(g1.retention_score, "78")}%`,
        releaseCondition: text(g1.compatibility),
      },
      {
        label: "G1 -> G2 operating transfer",
        value: text(g12.net_to_heirs_formatted ?? moneyText(g12.net_to_heirs)),
        body: text(g12.read),
        status: `Retention ${text(g12.retention_score, "64")}%`,
        releaseCondition: text(g12.compatibility),
      },
      {
        label: "G2 -> G3 without governance lock",
        value: text(g23.without_structure_formatted ?? moneyText(g23.net_to_g3_without_structure)),
        body: text(g23.read),
        status: `Retention ${text(g23.retention_score_without_structure, "35")}%`,
        releaseCondition: text(g23.compatibility),
      },
      {
        label: "With release-readiness governance",
        value: text(structured.with_structure_formatted ?? moneyText(structured.net_to_g3_with_structure)),
        body: text(structured.compatibility),
        status: `Retention ${text(structured.retention_score, "65")}%`,
        releaseCondition: text(structured.loss_point),
      },
    ],
    table: {
      columns: ["Succession layer", "Compatibility", "Loss if unfixed", "Release lock"],
      rows: layerMap.map((row) => [
        text(row.layer),
        text(row.compatibility),
        text(row.loss_if_unfixed),
        text(row.release_lock),
      ]),
    },
    bullets: safeStringArray(third.causes),
  });
}

function buildAuthoritySection(resolved: ResolvedDecisionMemoSurfaceData): ReleaseReadinessShareReportSection {
  const authority = asRecord(pickSection(resolved, "authority_and_veto_matrix"));
  const heir = asRecord(pickSection(resolved, "heir_management_data"));
  const framework = asRecord(heir.governance_framework);

  return reportSection({
    id: "authority-veto",
    eyebrow: "Authority, approvers, and veto rights",
    title: "The route should not depend on one person being present",
    intro:
      "Before bid release or exchange, the room must know who can approve, stop, delay, retrieve, explain, and escalate the route.",
    cards: [
      {
        label: "Decision threshold",
        value: "Signed gates",
        body: text(framework.decision_threshold),
      },
      {
        label: "Review cadence",
        value: text(framework.family_council_frequency),
        body: "Cadence only matters if minutes and gate states are retrievable.",
      },
      {
        label: "Veto power",
        value: "Recorded before exchange",
        body: text(framework.veto_power),
      },
    ],
    table: {
      columns: ["Authority group", "Names or roles"],
      rows: [
        ["Decision makers", safeStringArray(authority.decision_makers).map(routeSanitizedParty).join("; ")],
        ["Family roles", safeStringArray(authority.family_roles).map(routeSanitizedParty).join("; ")],
        ["Veto holders", safeStringArray(authority.veto_holders).map(routeSanitizedParty).join("; ")],
        ["Succession triggers", safeStringArray(framework.succession_triggers).join("; ")],
      ],
    },
  });
}

function buildResponsibilitySection(resolved: ResolvedDecisionMemoSurfaceData): ReleaseReadinessShareReportSection {
  const matrix = asArray(pickSection(resolved, "responsibility_transfer_matrix"));

  return reportSection({
    id: "responsibility-transfer",
    eyebrow: "Responsibility transfer matrix",
    title: "Who can see, stop, sign, move, retrieve, and explain",
    intro:
      "This is the operational-chain test. Wealth is not enough if the right person cannot move, stop, or explain the route under time pressure.",
    table: {
      columns: ["Role", "See", "Stop", "Sign", "Move", "Retrieve", "Explain", "Release status"],
      rows: matrix.map((row) => [
        routeSanitizedParty(row.party),
        text(row.can_see),
        text(row.can_stop),
        text(row.can_sign),
        text(row.can_move),
        text(row.can_retrieve),
        text(row.can_explain),
        text(row.release_status),
      ]),
    },
  });
}

function buildRecordMismatchSection(resolved: ResolvedDecisionMemoSurfaceData): ReleaseReadinessShareReportSection {
  const mismatch = asRecord(pickSection(resolved, "record_mismatch_map"));
  const matrix = asArray(mismatch.matrix);

  return reportSection({
    id: "record-mismatch",
    eyebrow: "Record mismatch map",
    title: "Cash, title, tax, bank, and family authority must tell one story",
    intro:
      "The route holds if the documents describe different buyers, owners, tax positions, signers, accounts, or family authority.",
    table: {
      columns: ["Record", "Current record", "Mismatch risk", "Target record", "Owner", "Status"],
      rows: matrix.map((row) => [
        text(row.record),
        routeSanitizedParty(row.current_record),
        text(row.mismatch_risk),
        text(row.target_record),
        text(row.owner),
        text(row.release_status),
      ]),
    },
    bullets: safeStringArray(mismatch.documents),
  });
}

function buildBankingSection(resolved: ResolvedDecisionMemoSurfaceData): ReleaseReadinessShareReportSection {
  const direct = asRecord(pickSection(resolved, "sow_sof_bank_acceptance_readiness"));
  const operational = asRecord(pickSection(resolved, "operational_chain_readiness"));
  const custody = asRecord(operational.custody_and_banking_rail_proof);

  return reportSection({
    id: "banking-sow-sof",
    eyebrow: "Banking rails and SoW/SoF acceptance",
    title: "The movement rail has to accept the source file before the seller clock governs",
    intro: sanitizeShareText(direct.standard ?? custody.source_standard),
    cards: [
      {
        label: "Release status",
        value: text(direct.release_status, "Required before irrevocable commitment"),
        body: safeStringArray(direct.evidence).join(" "),
      },
      {
        label: "Source standard",
        value: "Corroborated, not narrated",
        body: text(custody.source_standard),
      },
    ],
    table: {
      columns: ["Rail or proof class", "Requirement"],
      rows: [
        ...safeStringArray(custody.rails).map((rail) => ["Bank rail", rail]),
        ...safeStringArray(custody.proof_required).map((proof) => ["Proof required", proof]),
      ],
    },
  });
}

function buildCounselQuestionSection(resolved: ResolvedDecisionMemoSurfaceData): ReleaseReadinessShareReportSection {
  const questions = asArray(pickSection(resolved, "counsel_operator_question_pack"));

  return reportSection({
    id: "counsel-operator-questions",
    eyebrow: "Counsel and operator question pack",
    title: "Exact questions that turn adviser input into release evidence",
    intro:
      "The memo should help the existing adviser stack, not replace it. Each question names the desk that must convert a claim into written release evidence.",
    table: {
      columns: ["Desk", "Question"],
      rows: questions.map((row) => [text(row.domain), routeSanitizedParty(row.question)]),
    },
  });
}

function buildInformationAndMemorySection(resolved: ResolvedDecisionMemoSurfaceData): ReleaseReadinessShareReportSection {
  const flow = asArray(pickSection(resolved, "information_flow_dashboard"));
  const memory = asRecord(pickSection(resolved, "decision_memory_packet"));

  return reportSection({
    id: "information-flow-decision-memory",
    eyebrow: "Information flow and decision memory",
    title: "The route must be retrievable six years later",
    intro: sanitizeShareText(memory.why_recorded),
    cards: [
      {
        label: "Decision memory owner",
        value: text(memory.owner, "Family office operator / CFO"),
        body: safeStringArray(memory.retrieval_keys).join("; "),
      },
      {
        label: "Retrieval rule",
        value: "No founder-memory dependency",
        body: "The room must be able to retrieve the release rule, evidence register, stop triggers, final counsel questions, and annual review owner without asking the founder.",
      },
    ],
    table: {
      columns: ["Report", "Cadence", "Owner", "Recipients", "Release relevance"],
      rows: flow.map((row) => [
        text(row.report),
        text(row.cadence),
        routeSanitizedParty(row.owner),
        routeSanitizedParty(row.recipients),
        text(row.release_relevance),
      ]),
    },
  });
}

function buildSpecialistReleaseSection(resolved: ResolvedDecisionMemoSurfaceData): ReleaseReadinessShareReportSection {
  const groups = [
    ...asArray(pickSection(resolved, "education_school_fee_readiness")),
    ...asArray(pickSection(resolved, "immigration_route_readiness")),
    ...asArray(pickSection(resolved, "post_2025_tax_residence_trust_iht_review")),
    ...asArray(pickSection(resolved, "overseas_entity_register_readiness")),
  ];

  return reportSection({
    id: "specialist-release-reviews",
    eyebrow: "Specialist release reviews",
    title: "Property is only one rail in the family move",
    intro:
      "The purchase can be legally plausible and still fail the residence, education, tax, succession, beneficial-owner, or reporting job it is expected to do.",
    table: {
      columns: ["Gate", "Answer", "Decision consequence", "Evidence required", "Owner"],
      rows: groups.map((row) => [
        text(row.gate),
        text(row.answer),
        text(row.decision_consequence),
        text(row.family_evidence_required),
        text(row.owner),
      ]),
    },
  });
}

function buildImplementationSection(resolved: ResolvedDecisionMemoSurfaceData): ReleaseReadinessShareReportSection {
  const sequence = asArray(pickSection(resolved, "execution_sequence"));

  return reportSection({
    id: "implementation-roadmap",
    eyebrow: "Implementation roadmap",
    title: "A route can advance only in this evidence order",
    intro:
      "The roadmap prevents the room from treating seller timing as permission. Every step has an owner, sequence, and release gate.",
    table: {
      columns: ["Order", "Step", "Action", "Owner", "Timeline", "Release gate"],
      rows: sequence.map((row) => [
        text(row.step ?? row.order),
        text(row.title),
        routeSanitizedParty(row.action),
        routeSanitizedParty(row.owner),
        text(row.timeline),
        text(row.release_gate),
      ]),
    },
  });
}

function buildScenarioTreeSection(resolved: ResolvedDecisionMemoSurfaceData): ReleaseReadinessShareReportSection {
  const tree = asRecord(pickSection(resolved, "scenario_tree_data"));
  const branches = asArray(tree.branches);

  return reportSection({
    id: "release-rule-scenario-tree",
    eyebrow: "Release rule scenario tree",
    title: sanitizeShareText(text(tree.decision_point, "Should the family advance under signed gates, hold, or stop?")),
    intro:
      "The final decision does not turn on whether London is attractive. It turns on whether evidence, authority, banking, title, tax, and family consequence can carry the route.",
    table: {
      columns: ["Branch", "Condition", "Consequence", "Verdict"],
      rows: branches.map((row) => [
        text(row.branch),
        text(row.condition),
        text(row.consequence),
        text(row.verdict),
      ]),
    },
  });
}

function buildFullReportSections(
  resolved: ResolvedDecisionMemoSurfaceData,
  payloadSeed: {
    move: string;
    corridor: string;
    decision: string;
    releaseRule: string;
    purpose: string;
    capitalRule: string;
  },
  methodDrivers: ReleaseReadinessMethodDriver[],
): ReleaseReadinessShareReportSection[] {
  return [
    buildInputFrameSection(payloadSeed),
    buildCapitalSection(resolved),
    buildTaxSection(resolved),
    buildMarketSection(resolved, methodDrivers),
    buildWealthProjectionSection(resolved),
    buildScenarioTreeSection(resolved),
    buildCrisisSection(resolved),
    buildAntifragilitySection(resolved),
    buildGenerationSection(resolved),
    buildAuthoritySection(resolved),
    buildResponsibilitySection(resolved),
    buildRecordMismatchSection(resolved),
    buildBankingSection(resolved),
    buildCounselQuestionSection(resolved),
    buildSpecialistReleaseSection(resolved),
    buildInformationAndMemorySection(resolved),
    buildImplementationSection(resolved),
  ].filter((section) => {
    const hasCards = Boolean(section.cards?.length);
    const hasRows = Boolean(section.table?.rows?.length);
    const hasBullets = Boolean(section.bullets?.length);
    const hasChart = Boolean(section.chart?.some((series) => series.points.length));
    return hasCards || hasRows || hasBullets || hasChart;
  });
}

function toShareRouteOption(option: RouteIntelligenceOptionV2): ReleaseReadinessShareRouteOption {
  const safe = sanitizeRouteOption(option);
  return {
    id: text(safe.id),
    rank: numberOr(safe.rank, 1),
    routeName: sanitizeShareText(safe.routeName),
    routeType: sanitizeShareText(safe.routeType),
    verdict: sanitizeShareText(safe.verdict),
    releaseRule: sanitizeShareText(safe.releaseRule),
    bestUse: sanitizeShareText(safe.bestUse),
    economicRead: sanitizeShareText(safe.economicRead),
    failureMode: sanitizeShareText(safe.failureMode),
    releaseEffect: sanitizeShareText(safe.releaseEffect),
    metrics: {
      propertyValueUsd: numberOr(safe.metrics?.propertyValueUsd),
      bsdUsd: numberOr(safe.metrics?.bsdUsd),
      absdUsd: numberOr(safe.metrics?.absdUsd),
      totalDutiesUsd: numberOr(safe.metrics?.totalDutiesUsd),
      totalAcquisitionCostUsd: numberOr(safe.metrics?.totalAcquisitionCostUsd),
      incrementalDutyVsRecommendedUsd: numberOr(safe.metrics?.incrementalDutyVsRecommendedUsd),
      dutyDragPct: numberOr(safe.metrics?.dutyDragPct),
      annualCarryingCostUsd: numberOr(safe.metrics?.annualCarryingCostUsd),
      dataQuality: sanitizeShareText(safe.metrics?.dataQuality),
      mitigationTimeline: sanitizeShareText(safe.metrics?.mitigationTimeline),
    },
  };
}

function buildPrivateEvidenceForPayload(): ReleaseReadinessPrivateEvidence[] {
  return buildDefaultPrivateEvidence().map((item) => ({
    label: sanitizeShareText(item.label),
    status: "Indexed for release review",
    owner: sanitizeShareText(item.owner),
    decisionUse: sanitizeShareText(item.release_effect),
  }));
}

function buildMethodDriversForPayload(route: RouteIntelligenceV2): ReleaseReadinessMethodDriver[] {
  return (route.routeDriverRegister?.items ?? []).map((driver) => ({
    id: text(driver.id),
    title: sanitizeShareText(driver.title),
    driver: sanitizeShareText(driver.driver),
    releaseRead: sanitizeShareText(driver.releaseRead),
    sources: driver.sources
      .map(sanitizeDriverSource)
      .filter((source) => Boolean(source.id))
      .map((source) => ({
        id: text(source.id),
        title: sanitizeShareText(source.title),
        date: sanitizeShareText(source.date),
        url: text(source.url ?? source.source_url),
      })),
  }));
}

function collectPayloadCitations(
  methodDrivers: ReleaseReadinessMethodDriver[],
  publicSources: ReleaseReadinessShareSource[],
): ReleaseReadinessShareCitation[] {
  const ids: string[] = [];
  const seen = new Set<string>();
  const add = (value: string) => {
    const id = value.trim();
    const normalized = id.toLowerCase();
    if (!isRemoteCitationId(id) || seen.has(normalized)) return;
    seen.add(normalized);
    ids.push(id);
  };

  methodDrivers.forEach((driver) => driver.sources.forEach((source) => add(source.id)));
  publicSources.forEach((source) => add(source.id));

  return ids.map((id, index) => ({
    id,
    number: index + 1,
    originalText: `[${index + 1}]`,
  }));
}

export function buildReleaseReadinessSharePayload(
  reference: string,
  resolved: ResolvedDecisionMemoSurfaceData,
): ReleaseReadinessSharePayload {
  const route = buildRouteIntelligenceV2(resolved);
  const selectedRoute = route.selectedLiveOption ?? route.routeOptions[0];
  const routeOptions = route.routeOptions.map(toShareRouteOption);
  const selectedShareRoute =
    routeOptions.find((option) => option.id === route.recommendedRouteId) ??
    routeOptions[0] ??
    toShareRouteOption(selectedRoute);
  const releasePacket = buildSafeReleasePacket(resolved);
  const risk = buildSafeRisk(resolved, route);
  const publicSources = buildSafePublicSources(resolved);
  const methodDrivers = buildMethodDriversForPayload(route);
  const citations = collectPayloadCitations(methodDrivers, publicSources);
  const decision = "Gated negotiation only";
  const releaseRule = "Gated negotiation only";
  const purpose = "London family use and continuity. Not approved as yield, prestige, wrapper planning, or residence planning.";
  const capitalRule =
    "No bid without closed comps and walk-away price. No exchange or deposit release without signed title, SDLT, source, bank rail, family authority, and bid discipline.";
  const corridor = sanitizeShareText(route.corridor);
  const move = sanitizeShareText(route.move);
  const reportSections = buildFullReportSections(
    resolved,
    {
      move,
      corridor,
      decision,
      releaseRule,
      purpose,
      capitalRule,
    },
    methodDrivers,
  );

  return {
    surfaceContract: SHARE_SURFACE_CONTRACT,
    reference,
    title: sanitizeShareText(route.surfaceTitle ?? "Release Readiness Review"),
    corridor,
    move,
    decision,
    releaseRule,
    purpose,
    capitalRule,
    rationale: sanitizeShareText(
      releasePacket.rationale ??
        "The route can advance only if authority, evidence, source, bank, title, tax, and family-use gates clear before seller timing hardens.",
    ),
    riskLevel: sanitizeShareText(risk.risk_level),
    mitigation: sanitizeShareText(risk.mitigation_timeline),
    selectedRoute: selectedShareRoute,
    routeOptions,
    gateRows: gateRowsFromSafeGates(buildSafeGates()),
    advanceConditions: releasePacketList(releasePacket.advance_conditions, []),
    holdConditions: releasePacketList(releasePacket.hold_conditions, []),
    stopConditions: releasePacketList(releasePacket.stop_conditions, []),
    publicSources,
    privateEvidence: buildPrivateEvidenceForPayload(),
    methodDrivers,
    citations,
    reportSections,
  };
}

export function buildReleaseReadinessShareSurfaceData(
  reference: string,
  resolved: ResolvedDecisionMemoSurfaceData,
): ResolvedDecisionMemoSurfaceData {
  const route = buildRouteIntelligenceV2(resolved);
  const safeRouteIntelligence = buildSafeRouteIntelligence(route, reference);
  const safePreview = sanitizeObject({
    route_intelligence_v2: safeRouteIntelligence,
    release_decision_packet: buildSafeReleasePacket(resolved),
    risk_assessment: buildSafeRisk(resolved, route),
    rich_verdict: {
      why: "Advance only through the signed, evidence-gated route. Do not let seller timing convert an unresolved route into capital commitment.",
    },
    gating_conditions: buildSafeGates(),
    zero_trust_move_intake: {
      evidence_records: buildDefaultPrivateEvidence(),
    },
    governing_source_register: buildSafePublicSources(resolved),
    source_register: buildSafePublicSources(resolved),
  });

  const memoData = sanitizeObject({
    intake_id: reference,
    generated_at: text(asRecord(resolved.memoData).generated_at),
    preview_data: safePreview,
  }) as unknown as PdfMemoData;

  return {
    memoData,
    backendData: {
      surface_contract: SHARE_SURFACE_CONTRACT,
      intake_id: reference,
      preview_data: safePreview,
    },
    fullArtifact: null,
    developmentsCount: resolved.developmentsCount,
  };
}
