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
    .replace(/\bGated negotiation only only\b/gi, "Gated negotiation only")
    .replace(/\bproceed[-\s]modified\b/gi, "Proceed under signed gates")
    .replace(/\bPreferred modified route only if\b/gi, "Preferred direct route only if")
    .replace(/\bPreferred modified route\b/gi, "Preferred direct route under signed gates")
    .replace(/\bremains Proceed under signed gates\b/gi, "remains gated")
    .replace(/\bShould the family release the purchase route now,\s*Gated negotiation only,\s*hold,\s*or stop\?/gi, "Should the family advance under signed gates, hold, or stop?")
    .replace(/\bHouse Signal Rail\b/gi, "Route Control Summary")
    .replace(/\bDecision EV\b/gi, "Scenario discipline output - not release authority")
    .replace(/\bExpected value creation\b/gi, "Scenario discipline output")
    .replace(/\bExpected Net Worth\b/gi, "Scenario net position")
    .replace(/\bNet Benefit\b/gi, "Route discipline read")
    .replace(/\bScore\s+\d+\s*\/\s*100\.?/gi, "Readiness score evidence-gated.")
    .replace(/\b50\s*\/\s*30\s*\/\s*20 probability scenarios\b/gi, "base, stress, and opportunity scenario discipline; not a forecast")
    .replace(/\b50\s*\/\s*30\s*\/\s*20 probabilities\b/gi, "base / stress / opportunity scenario weights; not a forecast")
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
    .replace(/\binsurance\/security file\b/gi, "insurance quote and security plan")
    .replace(/\bseller conditions\b/gi, "seller identity, seller authority, exclusivity terms, deposit condition, and completion timetable")
    .replace(/\bdeposit rail\b/gi, "deposit account, conveyancer client-account details, transfer path, and release condition")
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
    .replace(/\bDM64\b/g, "release-readiness review")
    .replace(/\bGranthika\b/g, "source register")
    .replace(/\bAquarium\b/g, "source register")
    .replace(/\bAI banking crisis simulation\b/gi, "Bank compliance escalation simulation")
    .replace(/\badvisor embarrassment\b/gi, "adviser coordination failure")
    .replace(/\badviser embarrassment\b/gi, "adviser coordination failure")
    .replace(/\bAI Bubble\s*\/\s*Technology Wealth Repricing Shock\b/gi, "Technology-wealth exposure check")
    .replace(/\bJob Market Crash\s*\/\s*Labor-Income Shock\b/gi, "Operating-income exposure check")
    .replace(/\bDigital Settlement\s*\/\s*Stablecoin Rail Stress\b/gi, "Digital-settlement exposure check")
    .replace(/\bAI asset repricing(?:\s*\/\s*technology wealth repricing)?\b/gi, "technology-wealth exposure")
    .replace(/\bwar\s*\/\s*sanctions\b/gi, "geopolitical and sanctions exposure")
    .replace(/\bstablecoin rail stress\b/gi, "digital-settlement rail exposure")
    .replace(/\bBSA\/sanctions\b/gi, "sanctions and bank-compliance controls")
    .replace(/\bBSA\b/g, "bank-compliance controls")
    .replace(/\bshadow facilitators\b/gi, "unverified intermediaries")
    .replace(/\bg1[_-]g2[_-]g3\b/gi, "generation_to_generation")
    .replace(/\bG1\s*\/\s*G2\s*\/\s*G3\b/gi, "generation-to-generation")
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
    .replace(/\bG2 son\b/gi, "named family user")
    .replace(/\bG2 daughter\s*\/\s*fairness owner\b/gi, "named family-fairness owner")
    .replace(/\bG2 fairness owner\b/gi, "family-fairness owner")
    .replace(/\bG2\b/gi, "named family user")
    .replace(/(^|[_-])g2(?=$|[_-])/gi, "$1named_family_user")
    .replace(/\bdaughter\s*\/\s*fairness owner\b/gi, "named family-fairness owner")
    .replace(/\bdaughter fairness\b/gi, "family-fairness")
    .replace(/\bG3\/grandchild\b/gi, "next-generation continuity")
    .replace(/\bG3 grandson\b/gi, "next-generation continuity")
    .replace(/\bG3 memory rules\b/gi, "next-generation decision record rules")
    .replace(/\bG3 decision memory\b/gi, "next-generation decision record")
    .replace(/\bG3 memory\b/gi, "next-generation decision record")
    .replace(/\bG3\b/gi, "next-generation record")
    .replace(/(^|[_-])g3(?=$|[_-])/gi, "$1next_generation_record")
    .replace(/\bfuture-grandchild\b/gi, "next-generation")
    .replace(/\bgrandson\b/gi, "next-generation record")
    .replace(/\bson\b/gi, "named family user")
    .replace(/\bdaughter\b/gi, "named family-fairness owner")
    .replace(/\bson-use\b/gi, "named family-user")
    .replace(/\bson use\b/gi, "named family-user")
    .replace(/\bnamed family user-use\b/gi, "named family-user use")
    .replace(/\bdaughter\/fairness\b/gi, "family-fairness")
    .replace(/\bspouse veto if relevant\b/gi, "family-home rights position recorded before bid release or exchange")
    .replace(/\bspouse if relevant\b/gi, "family-home rights holder where recorded")
    .replace(/\bspouse veto\b/gi, "family-home rights position")
    .replace(/\bfamily-use veto position where recorded\b/gi, "family-home rights position recorded before bid release or exchange")
    .replace(/\bFamily-home veto position\b/gi, "Family-home rights position")
    .replace(/\bfamily-home veto position\b/gi, "family-home rights position")
    .replace(/\bFamily-home veto holder\b/gi, "Family-home rights holder")
    .replace(/\bfamily-home veto holder\b/gi, "family-home rights holder")
    .replace(/\bFounder authority\b/gi, "Principal authority")
    .replace(/\bfounder authority\b/gi, "principal authority")
    .replace(/\bFounder\b/g, "Principal")
    .replace(/\bfounder\b/g, "principal")
    .replace(/\bPrincipal\s*\/\s*principal\b/gi, "Principal")
    .replace(/\bprincipal\s*\/\s*principal\b/gi, "Principal")
    .replace(
      /\bnamed family user\s*\/\s*named family user\s+named family-fairness owner\b/gi,
      "Named family user / named family-fairness owner",
    )
    .replace(/\bsix years later\b/gi, "later")
    .replace(/\bmemo source file\b/gi, "source register")
    .replace(/\brelease-readiness reviewing\b/gi, "release-readiness review")
    .replace(
      /\bas a London family base,\s*education\/continuity node,\s*and capital-preservation asset\b/gi,
      "as a proposed London family-use acquisition with education, residence, succession, and capital-preservation claims not treated as release authority"
    )
    .replace(
      /\bLondon family base,\s*education\/continuity node,\s*and capital-preservation reserve\b/gi,
      "London family-use, continuity, and capital-preservation claims held as separate evidence gates"
    )
    .replace(
      /\bThe Mayfair purchase is a family-base and continuity move, not a yield trade; release depends on written purpose, use boundaries, and who the asset is meant to serve across principal \/ named family user \/ next-generation record\.?/gi,
      "The Mayfair purchase is tested as London family use, not yield. Release depends on written use boundaries, named family user, named fairness owner, and decision record."
    )
    .replace(
      /\bPrincipal\s*\/\s*named family user\s*\/\s*next-generation record\b/gi,
      "principal authority, family-use boundary, fairness owner, and next-generation decision record"
    )
    .replace(/\bsocial or family promise\b/gi, "undocumented family expectation")
    .replace(/\bnext-generation decision memory\b/gi, "next-generation decision record")
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
    .replace(/\s+/g, " ")
    .trim();
}

const NEXT_RELEASE_WINDOW =
  "72-hour bank/title/source retrieval check; 7-day counsel/bank/family-authority close path if seller timing starts.";

function normalizeMitigationTimeline(value: unknown): string {
  const normalized = sanitizeShareText(value);
  if (!normalized || /30-day|90-day|release-readiness sprint|release-read sprint/i.test(normalized)) {
    return NEXT_RELEASE_WINDOW;
  }
  return normalized;
}

function normalizeMoveStatement(value: unknown): string {
  const normalized = sanitizeShareText(value);
  if (/Balfour Place/i.test(normalized) && /Mayfair/i.test(normalized)) {
    return "A Dubai/GCC family is reviewing a GBP 49.5M Mayfair townhouse at Balfour Place, London W1K. Approved route: gated direct-buyer negotiation only. No capital release. Education, residence, succession, and capital-preservation claims are not release authority; they remain separate evidence gates.";
  }
  return normalized;
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
      mitigationTimeline: normalizeMitigationTimeline(option.metrics?.mitigationTimeline),
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
            sources: [],
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
    move: normalizeMoveStatement(route.move),
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
    ["Buyer profile", "Required before bid", "Principal / FO operator", "Identity class, residence posture, property count, and buyer capacity."],
    ["Title pack", "Indexed if available; counsel sign-off required before exchange", "UK property counsel", "Title, searches, survey, restrictions, seller authority, insurance quote and security plan, and exchange mechanics."],
    ["SDLT computation", "Required before bid / counsel-confirmed", "UK tax counsel", "Signed SDLT treatment, surcharges, relief exclusions, and filing responsibility."],
    ["SoW / SoF file", "Required before exchange", "Source bank", "Corroborated source narrative, account path, adverse-media checks, and transfer authority."],
    ["Receiving and fallback rails", "Required before exchange", "Receiving bank", "Primary rail, fallback rail, KYC acceptance, FX authority, limits, and timetable."],
    ["Family authority minute", "Indexed if available; signed authority minute required before bid release or exchange", "Family office / principal", "Use boundary, family-home rights position, title authority, carry owner, sale/refinance limits, and decision memory."],
    ["Family fairness minute", "Required before bid release or exchange", "Family fairness owner", "Notice, fairness protection, beneficiary treatment, and next-generation record."],
    ["Operating file", "Required before completion", "FO operator", "Insurance quote, security plan, service contracts, initial carry budget, and reporting cadence."],
  ].map(([label, status, owner, detail]) => ({
    label,
    status,
    owner,
    release_effect: detail,
  }));
}

function buildSafeReleasePacket(data: ResolvedDecisionMemoSurfaceData) {
  const releasePacket = asRecord(pickSection(data, "release_decision_packet"));

  return sanitizeObject({
    rationale:
      "Proceed to gated negotiation only. The house is approved for London family use only after title, SDLT, source, bank, authority, family-use, fairness, and decision-memory evidence clears.",
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
        evidence: "Title, searches, survey, restrictions, insurance quote and security plan, seller identity, seller authority, exclusivity terms, deposit condition, deposit account, conveyancer client-account details, transfer path, release condition, and completion timetable.",
        why_it_matters: "Seller timing cannot outrun title readiness or convert a review into a capital commitment.",
      },
      {
        gate: "SoW / SoF and bank rails",
        state: "Required before exchange",
        evidence: "Source bank, receiving bank, fallback bank rail, KYC, sanctions/adverse-media clearance, FX authority, transfer limits, and timetable.",
        why_it_matters: "Capital remains blocked until the transfer path is bank-accepted in writing.",
      },
      {
        gate: "Authority and veto map",
        state: "Required before bid or exchange",
        evidence: "Principal authority, named family-user boundary, family-home rights position recorded before bid release or exchange, sale/refinance rights, and carry owner.",
        why_it_matters: "Use rights, carry, and veto must be written so the property does not become an implied future entitlement.",
      },
      {
        gate: "Family fairness and next-generation record",
        state: "Required before bid or exchange",
        evidence: "Named family-fairness owner, notice minute, beneficiary treatment, and decision record location.",
        why_it_matters: "The purchase must remain explainable later without relying on memory or informal understandings.",
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

const CORE_PUBLIC_SOURCE_IDS = new Set([
  "src_rightmove_mayfair_balfour",
  "src_gov_sdlt_residential",
  "src_gov_sdlt_non_resident",
  "src_gov_sdlt_corporate",
  "src_gov_ated",
  "src_gov_overseas_entity_register",
  "src_gov_fig",
  "src_gov_iht_ltr",
  "src_coutts_pcl_q1_2026",
  "src_wise_gbp_usd",
]);

function isMethodologySource(source: RecordLike): boolean {
  const category = text(source.category);
  const institution = text(source.institution);
  const id = text(source.id);
  return (
    /patterns?\s*&\s*methodology/i.test(category) ||
    /HNWI Chronicles/i.test(institution) ||
    /^src_hc_/i.test(id)
  );
}

function sourceDecisionBoundary(source: RecordLike): string {
  const id = text(source.id).toLowerCase();
  const institution = text(source.institution);
  const title = text(source.title);
  const haystack = `${id} ${institution} ${title}`;

  if (/rightmove|balfour/.test(haystack)) {
    return "Public advertisement only; not valuation, title, seller authority, survey, or legal particulars.";
  }
  if (/coutts/.test(haystack)) {
    return "Prime Central London discount context only; not Balfour valuation, offer authority, or bid price.";
  }
  if (/wise|fx|gbp.*usd|exchange/i.test(haystack)) {
    return "Model FX input only; not an executable FX quote, bank spread, transfer limit, or settlement instruction.";
  }
  if (/sdlt|stamp duty|hmrc|gov_/.test(haystack)) {
    return "Legal rate and public-rule source only; final treatment depends on buyer facts and counsel computation.";
  }
  if (/ated/.test(haystack)) {
    return "ATED public-rule source only; actual exposure depends on ownership route, relief position, and counsel filing advice.";
  }
  if (/overseas entity|companies house|beneficial/.test(haystack)) {
    return "Disclosure framework source only; actual filing requirement depends on ownership facts and counsel advice.";
  }
  if (/iht|inheritance|long-term resident|foreign income|gains/i.test(haystack)) {
    return "UK tax-rule context only; family tax treatment remains counsel and fact-pattern gated.";
  }
  if (/westminster|council|property tax|business rates|council tax/i.test(haystack)) {
    return "Local public-charge context only; final operating budget depends on title, use, and property file.";
  }
  if (/knight frank|savills|agent|market/i.test(haystack)) {
    return "Market context only; not a valuation, offer authority, legal due diligence, or seller-timing proof.";
  }

  return sanitizeShareText(
    source.decision_boundary ??
      source.limit ??
      "Supports the named public claim only; private execution evidence remains separately gated.",
  );
}

function buildSafePublicSources(data: ResolvedDecisionMemoSurfaceData) {
  const sources = asArray(pickSection(data, "governing_source_register") ?? pickSection(data, "source_register"));
  return sources.filter((source) => !isMethodologySource(source)).map((source, index) => {
    const id = text(source.id, `R${index + 1}`);
    return {
    id: text(source.id, `R${index + 1}`),
    category: CORE_PUBLIC_SOURCE_IDS.has(id) ? sanitizeShareText(source.category ?? "Source Register") : "Supplementary sources",
    institution: sanitizeShareText(source.institution ?? "Source"),
    title: sanitizeShareText(source.title ?? "Source record"),
    date: sanitizeShareText(source.date ?? source.checked_at ?? "Checked in source register"),
    claim: sanitizeShareText(source.claim_supported ?? source.claim ?? "Supports the stated source-register claim."),
    boundary: sourceDecisionBoundary(source),
    url: text(source.url),
    };
  }) satisfies ReleaseReadinessShareSource[];
}

function buildSafeRisk(data: ResolvedDecisionMemoSurfaceData, route: RouteIntelligenceV2) {
  const risk = asRecord(pickSection(data, "risk_assessment"));
  const selected = route.selectedLiveOption ?? route.routeOptions[0];

  return sanitizeObject({
    risk_level: risk.risk_level ?? "Evidence pending; no capital release",
    mitigation_timeline: normalizeMitigationTimeline(
      risk.mitigation_timeline ??
      selected?.metrics?.mitigationTimeline ??
      NEXT_RELEASE_WINDOW,
    ),
  });
}

function releasePacketList(value: unknown, fallback: string[]): string[] {
  return (Array.isArray(value) && value.length ? value : fallback).map(sanitizeShareText).filter(Boolean);
}

function moneyText(value: unknown, fallback = "Release-gated"): string {
  const numeric = numberOr(value);
  if (!numeric) return fallback;
  const sign = numeric < 0 ? "-" : "";
  const absolute = Math.abs(numeric);
  if (absolute >= 1_000_000) {
    return `${sign}~US$${(absolute / 1_000_000).toFixed(1)}M`;
  }
  if (absolute >= 1_000) {
    return `${sign}~US$${Math.round(absolute / 1_000).toLocaleString("en-US")}K`;
  }
  return `${sign}~US$${Math.round(absolute).toLocaleString("en-US")}`;
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
  return {
    id: section.id,
    eyebrow: sanitizeShareText(section.eyebrow),
    title: sanitizeShareText(section.title),
    intro: section.intro ? sanitizeShareText(section.intro) : undefined,
    cards: section.cards
      ?.filter((card) => Boolean(card.label || card.title || card.value || card.body))
      .map((card) => ({
        label: sanitizeShareText(card.label),
        value: card.value ? sanitizeShareText(card.value) : undefined,
        title: card.title ? sanitizeShareText(card.title) : undefined,
        body: card.body ? sanitizeShareText(card.body) : undefined,
        owner: card.owner ? sanitizeShareText(card.owner) : undefined,
        status: card.status ? sanitizeShareText(card.status) : undefined,
        releaseCondition: card.releaseCondition ? sanitizeShareText(card.releaseCondition) : undefined,
      })),
    table: section.table
      ? {
          columns: section.table.columns.map(sanitizeShareText),
          rows: cleanRows(section.table.rows),
        }
      : undefined,
    bullets: section.bullets?.map(sanitizeShareText).filter(Boolean),
    chart: section.chart?.map((series) => ({
      name: sanitizeShareText(series.name),
      verdict: sanitizeShareText(series.verdict),
      points: series.points.map((point) => ({ year: point.year, value: point.value })),
    })),
  };
}

function routeSanitizedParty(value: unknown): string {
  return sanitizeShareText(value)
    .replace(/\bSpouse if family-home use or veto rights are relevant\b/gi, "Family-home rights holder where recorded")
    .replace(/\bSpouse if family-home use is intended\b/gi, "Family-home rights holder where recorded")
    .replace(/\bSpouse\b/g, "Family-home rights holder")
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
        value: "Gated direct-buyer negotiation",
        body:
          "Negotiation authority only. This is not bid authority, exchange authority, deposit authority, or structure approval.",
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
  publicSourceCount: number,
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
        value: `${publicSourceCount}`,
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
        label: "Scenario discipline output",
        value: moneyText(asRecord(wealth.probability_weighted).expected_value_creation),
        body: "Scenario-discipline read across base, stress, and opportunity paths. This is not a forecast.",
      },
      {
        label: "Cost of hardening too early",
        value: moneyText(asRecord(wealth.cost_of_inaction).estimated_day_one_drag_usd),
        body: sanitizeShareText(asRecord(wealth.cost_of_inaction).secondary_driver),
      },
    ],
    table: {
      columns: ["Scenario", "Scenario weight", "Year 10 range", "Net result vs capital", "Memo read"],
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
    eyebrow: "Crisis resilience and anti-fragility read",
    title: "Crisis Resilience And Anti-Fragility Read",
    intro: sanitizeShareText(
      overall.summary ??
        "The route cannot release until bank, source, sanctions, insurance, security, travel, AI asset repricing, war / sanctions, labor-income, and absence-readiness controls are evidenced.",
    ),
    cards: [
      {
        label: "Overall resilience",
        value: text(overall.rating, "Release-critical"),
        body:
          sanitizeShareText(overall.buffer_required) ||
          "Conditional crisis relevance must be tied to source wealth, bank rail, counterparties, settlement route, or operating income before it affects release.",
      },
      {
        label: "Conditional relevance rule",
        value: "Route-specific only",
        body:
          "AI, labor-income, conflict, sanctions, and digital-settlement scenarios affect release only where this family's source wealth, bank rail, counterparties, payment route, insurance, travel, or operating income touches the exposure.",
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
        releaseCondition:
          safeStringArray(risk.impact_channels).join(", ") ||
          "Applies only if the source wealth, settlement rail, bank, counterparty, payment route, insurance, travel, or operating income touches this exposure.",
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
  const antiCardCopy: Record<string, { body: string; releaseCondition: string }> = {
    "72-hour absence drill": {
      body:
        "Confirms alternate signer, document retrieval, adviser contact tree, and stop authority work when the principal or a key adviser is unavailable.",
      releaseCondition: "Alternate authority and evidence retrieval must work inside 72 hours.",
    },
    "Primary and fallback banking rail": {
      body:
        "Prevents a single receiving bank, relationship lead, or conveyancer client account from becoming the only completion path.",
      releaseCondition: "Primary rail, fallback rail, signers, FX authority, and escalation contacts are accepted before exchange.",
    },
    "Decision-memory index": {
      body:
        "Locks why the route advanced, held, or stopped into a retrievable file before seller timing or family memory rewrites the decision.",
      releaseCondition: "Release rule, evidence register, source anchors, blockers, and annual review owner are indexed.",
    },
    "Counsel question pack": {
      body:
        "Turns adviser disagreement into exact questions, owners, and release conditions instead of letting opinions sit in separate lanes.",
      releaseCondition: "Open counsel questions have named owners and written answers before bid release or exchange.",
    },
    "Record mismatch map": {
      body:
        "Forces cash, title, buyer, tax, bank, and family authority records to describe the same route before transfer instruction.",
      releaseCondition: "Unresolved mismatch holds release even if commercial terms look attractive.",
    },
    "Annual UK residence/tax review": {
      body:
        "Stops residence, FIG, IHT, school-use, and family-presence assumptions from becoming hidden tax or reporting positions.",
      releaseCondition: "Residence and annual review owner are recorded before the house becomes a continuity anchor.",
    },
    "Security/privacy protocol": {
      body:
        "Separates legitimate family security and privacy controls from wrapper, prestige, or tax-shortcut narratives.",
      releaseCondition: "Security/privacy purpose is written without changing the selected buyer route unless counsel signs it.",
    },
  };

  return reportSection({
    id: "anti-fragility",
    eyebrow: "Anti-fragility review",
    title: "The route must get stronger when challenged, not merely documented",
    intro:
      "A Mayfair route is not resilient because advisers agree. It is resilient only if the room can stop, explain, retrieve, and reroute when bank, seller, family, or counsel conditions move against it.",
    cards: anti.map((row) => {
      const label = text(row.control);
      const copy = antiCardCopy[label];
      return {
        label,
        body: copy?.body ?? text(row.stress_event),
        releaseCondition: copy?.releaseCondition ?? text(row.release_test),
      };
    }),
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

function buildGenerationSection(_resolved: ResolvedDecisionMemoSurfaceData): ReleaseReadinessShareReportSection {
  return reportSection({
    id: "g1-g2-g3-continuity",
    eyebrow: "Responsibility transfer",
    title: "The house should transfer responsibility before it transfers symbolism",
    intro:
      "The house should transfer responsibility, not just symbolism. Use, carry, veto, fairness, sale/refinance, and future explanation must be written before the asset becomes a family expectation.",
    cards: [
      {
        label: "Current authority",
        title: "Control before commitment",
        body:
          "Principal authority, stop rights, and office retrieval must be written before seller timing turns intent into commitment.",
        releaseCondition:
          "Release only when approval, stop, signing, reporting, and retrieval rights are documented.",
      },
      {
        label: "Family use",
        title: "Use is not ownership",
        body:
          "The named family user can use the house only under written use, carry, security, guest, sale/refinance, and escalation rules.",
        releaseCondition: "Use rights and carry owner are recorded before bid release or exchange.",
      },
      {
        label: "Fairness",
        title: "No implied future entitlement",
        body:
          "Fairness, veto, and future-beneficiary treatment must be recorded before the asset becomes a family signal.",
        releaseCondition: "Family-fairness owner and next-generation decision record are signed.",
      },
      {
        label: "Decision memory",
        title: "The file must explain the decision later",
        body:
          "The family should be able to retrieve why the route advanced, held, or stopped without relying on memory or adviser fragments.",
        releaseCondition: "Decision record location, retrieval owner, and explanation packet are indexed.",
      },
    ],
    table: {
      columns: ["Continuity layer", "Risk if unwritten", "Owner", "Release clearance"],
      rows: [
        [
          "Principal authority",
          "Seller timing or adviser momentum can become commitment before the principal's stop right is retrievable.",
          "Principal + family-office operator",
          "Approval, stop, signing, reporting, and retrieval rights are written.",
        ],
        [
          "Named family-use boundary",
          "Repeated use can become implied entitlement, carry ambiguity, or later sale/refinance conflict.",
          "Family office + property operator",
          "Use, carry, security, guest, sale/refinance, and escalation rules are written.",
        ],
        [
          "Family-fairness record",
          "The house can become a visible benefit without a recorded fairness owner or future-beneficiary treatment.",
          "Family-fairness owner + succession counsel",
          "Fairness owner, veto position, and future-beneficiary treatment are recorded.",
        ],
        [
          "Next-generation decision record",
          "A later reader cannot explain why the route advanced, held, or stopped without relying on memory.",
          "Family-office operator / CFO",
          "Decision record, source anchors, blockers, retrieval owner, and explanation packet are indexed.",
        ],
      ],
    },
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
  const targetForRecord = (record: string, fallback: unknown): string => {
    const normalized = record.toLowerCase();
    if (/cash/.test(normalized)) {
      return "Source statements, distribution records, tax support, beneficial-owner chart, buyer route, and bank file match.";
    }
    if (/title/.test(normalized)) {
      return "Title holder, buyer capacity, exchange documents, and seller authority match the selected direct-buyer route.";
    }
    if (/beneficial/.test(normalized)) {
      return "Family minute, counsel memo, bank file, and buyer profile name the same controlling party and authority path.";
    }
    if (/tax/.test(normalized)) {
      return "SDLT, non-resident, additional-dwelling, residence, and relief exclusions match the signed tax memo.";
    }
    if (/custody|account|bank/.test(normalized)) {
      return "Source bank, receiving bank, fallback rail, FX authority, signer mandate, and reporting account match one movement path.";
    }
    if (/family/.test(normalized)) {
      return "Family-use, carry, fairness, veto, sale/refinance, and next-generation decision record match the title and tax route.";
    }
    return text(fallback);
  };

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
        targetForRecord(text(row.record), row.target_record),
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
    title: "The route must be retrievable years later",
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
  publicSourceCount: number,
): ReleaseReadinessShareReportSection[] {
  return [
    buildInputFrameSection(payloadSeed),
    buildCapitalSection(resolved),
    buildTaxSection(resolved),
    buildMarketSection(resolved, methodDrivers, publicSourceCount),
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
      mitigationTimeline: normalizeMitigationTimeline(safe.metrics?.mitigationTimeline),
    },
  };
}

function buildPrivateEvidenceForPayload(): ReleaseReadinessPrivateEvidence[] {
  return buildDefaultPrivateEvidence().map((item) => ({
    label: sanitizeShareText(item.label),
    status: sanitizeShareText(item.status ?? "Private indexed"),
    owner: sanitizeShareText(item.owner),
    decisionUse: sanitizeShareText(item.release_effect),
  }));
}

function buildMethodDriversForPayload(route: RouteIntelligenceV2): ReleaseReadinessMethodDriver[] {
  const abstractSourceTitle = (driverTitle: string, index: number): string => {
    const haystack = driverTitle.toLowerCase();
    if (/bank|rail|source|kyc|sow|sof/.test(haystack)) return `Bank-rail failure-pattern source record ${index + 1}`;
    if (/price|market|mayfair|property|trophy|bid/.test(haystack)) return `Trophy-pricing source record ${index + 1}`;
    if (/residence|mobility|migration|relocation|education|succession/.test(haystack)) return `Mobility-pattern source record ${index + 1}`;
    if (/family|fairness|authority|generation/.test(haystack)) return `Family-governance source record ${index + 1}`;
    return `Release-gate method source record ${index + 1}`;
  };

  return (route.routeDriverRegister?.items ?? []).map((driver) => ({
    id: text(driver.id),
    title: sanitizeShareText(driver.title),
    driver: sanitizeShareText(driver.driver),
    releaseRead: sanitizeShareText(driver.releaseRead),
    sources: driver.sources
      .map(sanitizeDriverSource)
      .filter((source) => Boolean(source.id))
      .map((source, index) => ({
        id: text(source.id),
        title: abstractSourceTitle(text(driver.title), index),
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
  const move = normalizeMoveStatement(route.move);
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
    publicSources.length,
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
    rationale:
      "Proceed to gated negotiation only. The house is approved for London family use only after title, SDLT, source, bank, authority, family-use, fairness, and decision-memory evidence clears.",
    riskLevel: sanitizeShareText(risk.risk_level),
    mitigation: normalizeMitigationTimeline(risk.mitigation_timeline),
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
  const sharePayload = buildReleaseReadinessSharePayload(reference, resolved);
  const route = buildRouteIntelligenceV2(resolved);
  const safeRouteIntelligence = buildSafeRouteIntelligence(route, reference);
  const safePreview = sanitizeObject({
    release_readiness_share_payload: sharePayload,
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
      release_readiness_share_payload: sharePayload,
    },
    fullArtifact: null,
    developmentsCount: resolved.developmentsCount,
  };
}
