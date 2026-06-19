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
    .replace(/\bson-use\b/gi, "named family-user")
    .replace(/\bdaughter\/fairness\b/gi, "family-fairness")
    .replace(/\bspouse veto if relevant\b/gi, "family-home veto position where recorded")
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

  return {
    surfaceContract: SHARE_SURFACE_CONTRACT,
    reference,
    title: sanitizeShareText(route.surfaceTitle ?? "Release Readiness Review"),
    corridor: sanitizeShareText(route.corridor),
    move: sanitizeShareText(route.move),
    decision: "Gated negotiation only",
    releaseRule: "Release differently",
    purpose: "London family use and continuity. Not approved as yield, prestige, wrapper planning, or residence planning.",
    capitalRule:
      "No bid without closed comps and walk-away price. No exchange or deposit release without signed title, SDLT, source, bank rail, family authority, and bid discipline.",
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
