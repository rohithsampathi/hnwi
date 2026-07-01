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
    baseSdltUsd: number | null;
    nrAndAdditionalDwellingSurchargeUsd: number | null;
    totalSdltUsd: number | null;
    totalDutiesUsd: number | null;
    totalAcquisitionCostUsd: number | null;
    incrementalDutyVsRecommendedUsd: number | null;
    dutyDragPct: number | null;
    annualCarryingCostUsd: number | null;
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

export interface ReleaseReadinessSourceMap {
  source?: string;
  builder?: string;
  omits?: string[];
  authority: string;
  storageRail: string;
  graphEdgeShape: string;
  centralSourceBriefs: {
    linkedSourceBriefs: number;
    sourceBriefRows: number;
    missingSourceBriefRows: number;
  };
  evidenceRows: {
    publicSourceRows: number;
    privateEvidenceClasses: number;
    evidenceMethodologyRows: number;
    routeJudgmentRows: number;
  };
  readback: {
    status: string;
    dueStates: string[];
  };
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
  summary?: string;
  castleBrief?: string;
  decisionPosture?: string;
  industry?: string;
}

export interface ReleaseReadinessMethodDriver {
  id: string;
  title: string;
  driver: string;
  releaseRead: string;
  familyAction?: string;
  testApplied?: string;
  testResult?: string;
  principalInstruction?: string;
  capitalConsequence?: string;
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

export interface ReleaseReadinessEvidenceMethodologyRecord {
  id: string;
  title: string;
  category: string;
  claim: string;
  owner?: string;
  status?: string;
  date?: string;
  institution?: string;
  url?: string;
  citationId?: string;
}

export interface ReleaseReadinessEvidenceMethodologySection {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  records: ReleaseReadinessEvidenceMethodologyRecord[];
}

export interface ReleaseReadinessPrincipalTable {
  columns: string[];
  rows: string[][];
}

export interface ReleaseReadinessPrincipalActionTest {
  label: string;
  familyAction: string;
  testApplied: string;
  testResult: string;
  principalInstruction: string;
  capitalConsequence: string;
}

export interface ReleaseReadinessPrincipalRouteSummary {
  routeName: string;
  currentDecision: string;
  useCase: string;
  capitalConsequence: string;
  releaseConsequence: string;
}

export interface ReleaseReadinessPrincipalView {
  decisionMinute: ReleaseReadinessPrincipalTable;
  familyActionAnswer: ReleaseReadinessPrincipalTable;
  capitalTruth: ReleaseReadinessPrincipalTable;
  purposeBoundary: ReleaseReadinessPrincipalTable;
  releaseRule: ReleaseReadinessPrincipalTable;
  signedGateMap: ReleaseReadinessPrincipalTable;
  whatChanged: ReleaseReadinessPrincipalTable;
  whatCaught: ReleaseReadinessPrincipalTable;
  routeAlternatives: ReleaseReadinessPrincipalRouteSummary[];
  familyActionTests: ReleaseReadinessPrincipalActionTest[];
  sevenDayInstruction: ReleaseReadinessPrincipalTable;
  evidenceBoundary: ReleaseReadinessPrincipalTable;
  finalInstruction: ReleaseReadinessPrincipalTable;
}

export interface ReleaseReadinessSharePayload {
  surfaceContract: typeof SHARE_SURFACE_CONTRACT;
  reference: string;
  title: string;
  corridor: string;
  move: string;
  user_inputs: RecordLike;
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
  evidenceSections?: ReleaseReadinessEvidenceMethodologySection[];
  principalView?: ReleaseReadinessPrincipalView;
  routeIntelligenceV2: RouteIntelligenceV2;
  route_intelligence_v2?: RouteIntelligenceV2;
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

function compactExactUsdText(value: string): string {
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

function sanitizeShareText(value: unknown): string {
  return compactExactUsdText(text(value))
    .replace(/\bRequired evidence\b/gi, "Release gate")
    .replace(/\bRelease Differently\b/gi, "Approved to negotiate under signed gates; no capital release")
    .replace(/\bGated negotiation only only\b/gi, "Approved to negotiate under signed gates; no capital release")
    .replace(/\bGated negotiation only\b/gi, "Approved to negotiate under signed gates; no capital release")
    .replace(/\bproceed[-\s]modified\b/gi, "Proceed under signed gates")
    .replace(/\bHold Until Release Evidence Clears\b/gi, "Hold under signed-gate control")
    .replace(/\bEntity\/trustee duty spread\b/gi, "Structure-route duty spread")
    .replace(/\bReviewed for release readiness;\s*signed gate required before capital release\b/gi, "Gate mapped for release-readiness review; signed gate controls capital release")
    .replace(/\bReviewed for release readiness\b/gi, "Gate mapped for release-readiness review")
    .replace(
      /\bFallback UK rail is pre-cleared for receipt if the primary rail delays,\s*with identical SoW\/SoF index,\s*escalation owner,\s*and cut-off timing\.\s*It cannot change buyer route or source narrative\.?/gi,
      "Required evidence: fallback UK rail must provide written conditional acceptance before release; same SoW / SoF index, escalation owner, and cut-off timing must match the buyer route and source narrative.",
    )
    .replace(/\bfallback rail is pre-cleared\b/gi, "fallback rail must provide written conditional acceptance before release")
    .replace(/\bpre-cleared fallback rail\b/gi, "fallback rail with bank acceptance evidence")
    .replace(
      /\bCounsel confirms the control case:\s*direct non-UK resident additional-dwelling individual treatment;\s*no first-time-buyer relief;\s*no main-residence replacement claim;\s*company\/trust route not preferred unless a later non-tax purpose justifies register\/ATED\/SDLT and bank burden\.?/gi,
      "Required evidence: UK tax counsel must sign the control-case buyer treatment before release.",
    )
    .replace(
      /\bTitle pack confirms a freehold residential townhouse in Mayfair \/ Westminster with no foreign-buyer ownership prohibition identified by counsel;\s*private title reference,\s*seller identity,\s*and searches remain private but were indexed in the data room\.?/gi,
      "Required evidence: UK property counsel must confirm title class, tenure, seller identity, seller authority, searches, restrictions, and any foreign-buyer/title constraints before bid, deposit, exchange, or transfer authority.",
    )
    .replace(
      /\bSeller asks for 10 business-day exclusivity,\s*exchange only after bank\/counsel release,\s*10% deposit at exchange,\s*and 40 business-day completion\.\s*Deposit cannot be sent before source and receiving bank acceptance\.?/gi,
      "Required evidence: seller timetable, exclusivity terms, deposit amount, deposit conditions, exchange sequence, completion timetable, and release conditions must be verified by property counsel before any seller-facing commitment.",
    )
    .replace(
      /\bCounsel confirms property ownership does not decide residence;\s*UK day-count,\s*FIG,\s*IHT long-term-residence,\s*remittance,\s*wills,\s*and trust interaction remain monitored separately,\s*with no UK-residence benefit assumed in the purchase model\.?/gi,
      "Required evidence: UK residence/tax counsel must confirm that ownership, day count, FIG, IHT, remittance, will/trust interaction, and residence assumptions are separately reviewed before the property is treated as a continuity anchor.",
    )
    .replace(
      /\bImmigration adviser confirms ownership gives no right to reside;\s*child\/parent\/student\/visitor routes and school admission remain separate\.\s*Education adviser confirms the current school timetable can run without forcing exchange\.?/gi,
      "Required evidence: immigration and education advisers must confirm whether ownership, child/parent routes, school timing, guardian model, term dates, and accommodation plan create any residence or exchange-timing pressure.",
    )
    .replace(
      /\bOperating pack includes council-tax anchor,\s*service-charge\/estate-management range,\s*insurance\/security quotes,\s*maintenance reserve,\s*legal\/admin budget,\s*FX spread policy,\s*and opportunity-cost sensitivity\.\s*(?:G1|principal) liquidity account funds first 24 months of carry\.?/gi,
      "Required evidence: operating pack must confirm council-tax/local charges, service or management costs, insurance/security, maintenance reserve, legal/admin budget, FX spread policy, opportunity-cost sensitivity, liquidity source, and carry owner before completion.",
    )
    .replace(
      /\bPrimary and fallback rail written conditional acceptances,\s*KYC\/SoW\/SoF index,\s*sanctions\/adverse-media clearance state,\s*signer mandate,\s*FX authority,\s*transfer limits,\s*timetable,\s*and escalation contacts\.?/gi,
      "Required evidence: primary and fallback rails must provide written conditional acceptance of KYC, SoW/SoF, sanctions/adverse-media, signer mandate, FX authority, transfer limits, timetable, and escalation contacts before exchange.",
    )
    .replace(
      /\bAudited accounts,\s*distribution minutes,\s*sale-completion evidence,\s*tax-residency support,\s*bank statements,\s*beneficial-owner chart,\s*and liquidity schedule\.?/gi,
      "Required evidence: SoW/SoF pack must evidence audited accounts where relevant, distribution minutes, sale-completion evidence, tax-residency support, bank statements, beneficial-owner chart, and liquidity schedule before exchange.",
    )
    .replace(
      /\bProperty,\s*tax\/private-client,\s*immigration,\s*education,\s*source-tax,\s*bank,\s*insurance\/security,\s*and operator confirmations reconciled into a single contradiction log\.?/gi,
      "Required evidence: adviser confirmations across property, tax/private-client, immigration, education, source-tax, bank, insurance/security, and operator desks must be reconciled into a contradiction log before release.",
    )
    .replace(/\bBank acceptance is conditional but documented before exchange\.?/gi, "Required evidence: bank acceptance must be conditionally documented before exchange.")
    .replace(/\bFamily continuity is documented without hardening inheritance ambiguity\.?/gi, "Required evidence: family continuity must be documented without hardening inheritance ambiguity.")
    .replace(/\bring-fenced liquidity schedule\b/gi, "liquidity schedule")
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
    .replace(/\bScore\s+\d+\s*\/\s*100\.?/gi, "Readiness score evidence-gated.")
    .replace(/\b\d+\s*\/\s*100\b/g, "readiness score evidence-gated")
    .replace(/\b50\s*\/\s*30\s*\/\s*20 probability scenarios\b/gi, "base, stress, and opportunity scenario discipline; not a forecast")
    .replace(/\b50\s*\/\s*30\s*\/\s*20 probabilities\b/gi, "base / stress / opportunity scenario weights; not a forecast")
    .replace(/\bRoute Source Records\b/gi, "Methodology records - not legal proof")
    .replace(/\bOPEN GATES\b/gi, "Release Gate Status")
    .replace(/\bOpen Release Gates\b/gi, "Release Gate Status")
    .replace(/\b0\s+to\s+close\b/gi, "Evidence mapped")
    .replace(/\bAll listed release gates have assigned owners\b/gi, "Gate ownership assigned; release evidence mapped")
    .replace(/\bDOCUMENTED\b/g, "Indexed for review")
    .replace(/\bDocumented\b/g, "Indexed for review")
    .replace(/\brelease-gated\b/gi, "signed-gate controlled")
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
    .replace(/\bcompiler internals\b/gi, "private build details")
    .replace(/\bAI banking crisis simulation\b/gi, "Bank compliance escalation simulation")
    .replace(/\badvisor embarrassment\b/gi, "adviser coordination failure")
    .replace(/\badviser embarrassment\b/gi, "adviser coordination failure")
    .replace(/\bAI Bubble\s*\/\s*Technology Wealth Repricing Shock\b/gi, "Source-wealth concentration check")
    .replace(/\bJob Market Crash\s*\/\s*Labor-Income Shock\b/gi, "Conditional operating-income exposure check")
    .replace(/\bDigital Settlement\s*\/\s*Stablecoin Rail Stress\b/gi, "Conditional digital-settlement rail exposure check")
    .replace(/\bTechnology-wealth exposure check\b/gi, "Source-wealth concentration check")
    .replace(/\bsource-wealth concentration\/technology exposure\b/gi, "documented source-wealth concentration exposure")
    .replace(/\bsource-wealth concentration\/technology wealth repricing or platform dependency\b/gi, "source-wealth concentration or liquidity repricing before source liquidity is proven")
    .replace(/\btechnology wealth repricing or platform dependency\b/gi, "source-wealth concentration or liquidity repricing")
    .replace(/\btechnology wealth repricing\b/gi, "source-wealth concentration repricing")
    .replace(/\btechnology exposure\b/gi, "source-concentration exposure")
    .replace(/\bplatform dependency\b/gi, "source-concentration dependency")
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
    .replace(/\bg1[_-]g2[_-]g3\b/gi, "generation_to_generation")
    .replace(/\bG1\s*\/\s*G2\s*\/\s*G3\b/gi, "G1 / G2 / G3 continuity chain")
    .replace(/\bG1\s*->\s*G2\s*->\s*G3\b/gi, "G1 -> G2 -> G3 continuity chain")
    .replace(/\bG1\s*→\s*G2\s*→\s*G3\b/gi, "G1 -> G2 -> G3 continuity chain")
    .replace(/\bG1\s*->\s*G2 operating transfer\b/gi, "G1 -> G2 operating transfer")
    .replace(/\bG1 founder\s*\/\s*principal\b/gi, "G1 principal")
    .replace(/\bG2 son\b/gi, "G2 named family user")
    .replace(/\bG2 daughter\s*\/\s*fairness owner\b/gi, "G2 fairness owner")
    .replace(/\bG2 fairness owner\b/gi, "G2 fairness owner")
    .replace(/\bdaughter\s*\/\s*fairness owner\b/gi, "G2 fairness owner")
    .replace(/\bdaughter fairness\b/gi, "G2 fairness")
    .replace(/\bG3\/grandchild\b/gi, "G3 next-generation continuity")
    .replace(/\bG3 grandson\b/gi, "G3 next-generation continuity")
    .replace(/\bG3 memory rules\b/gi, "G3 decision-record rules")
    .replace(/\bG3 decision memory\b/gi, "G3 decision record")
    .replace(/\bG3 memory\b/gi, "G3 decision record")
    .replace(/\bfuture-grandchild\b/gi, "next-generation")
    .replace(/\bgrandson\b/gi, "G3 next-generation record")
    .replace(/\bson-use\b/gi, "G2 use")
    .replace(/\bson use\b/gi, "G2 use")
    .replace(/\bdaughter\/fairness\b/gi, "G2 fairness")
    .replace(/\bspouse veto if relevant\b/gi, "family-home rights position gate mapped before bid release or exchange")
    .replace(/\bspouse if relevant\b/gi, "family-home rights holder where recorded")
    .replace(/\bspouse veto\b/gi, "family-home rights position")
    .replace(/\bfamily-use veto position where recorded\b/gi, "family-home rights position gate mapped before bid release or exchange")
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
      "The Mayfair purchase is tested as London family use, not yield. Release depends on written G1 purpose, G2 use boundary, G2 fairness owner, and G3 decision record."
    )
    .replace(
      /\bPrincipal\s*\/\s*named family user\s*\/\s*next-generation record\b/gi,
      "G1 authority, G2 use boundary, G2 fairness owner, and G3 decision record"
    )
    .replace(/\bsocial or family promise\b/gi, "undocumented family expectation")
    .replace(/\bnext-generation decision memory\b/gi, "G3 decision record")
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
    .replace(/\bfallback signer\b/gi, "alternate signer")
    .replace(/\bfallback rails\b/gi, "alternate rails")
    .replace(/\bfallback rail\b/gi, "alternate rail")
    .replace(/\bfallback\b/gi, "alternate")
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
    return "A Dubai/GCC family is reviewing a GBP 49.5M Mayfair townhouse at Balfour Place, London W1K. Approved route: approved direct-buyer negotiation under signed gates. No capital release. Education, residence, succession, and capital-preservation claims are not release authority; they remain separate evidence gates.";
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

function methodSourceDate(value: unknown): string {
  if (typeof value === "string") return value;
  if (isRecord(value)) return text(value.$date);
  return "";
}

function methodSourceBrief(source: RouteDriverSourceRecord | RecordLike): string {
  const record = asRecord(source);
  const candidates = [
    record.full_castle_brief,
    record.castle_brief_enriched,
    record.castle_brief,
    record.full_text,
    record.summary,
    record.reference,
    record.claim_supported,
    record.description,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return sanitizeShareText(candidate);
    }
    if (isRecord(candidate)) {
      const structured = [
        text(candidate.title),
        text(candidate.summary),
        text(candidate.brief),
        text(candidate.body),
        text(candidate.analysis),
        text(candidate.decision_read),
      ].filter(Boolean).join(" ");
      if (structured.trim()) return sanitizeShareText(structured);
    }
  }

  return "";
}

function sourceLookupKey(value: unknown): string {
  return text(value)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function sourceLookupKeys(source: RouteDriverSourceRecord | RecordLike): string[] {
  const record = asRecord(source);
  return [
    sourceCitationId(record),
    record.id,
    record.source_development_id,
    record.dev_id,
    record.devid,
    record.brief_id,
    record.source_brief_id,
    record.title,
    record.source_title,
    record.name,
  ]
    .map(sourceLookupKey)
    .filter(Boolean);
}

function buildCastleBriefSourceLookup(resolved: ResolvedDecisionMemoSurfaceData): Map<string, RecordLike> {
  const preview = evidencePreviewRecord(resolved);
  const rows = [
    ...asArray(preview.pattern_evidence_records),
    ...asArray(preview.route_pattern_evidence_records),
    ...asArray(preview.route_source_records),
    ...asArray(preview.source_register),
    ...asArray(preview.governing_source_register),
  ];
  const lookup = new Map<string, RecordLike>();
  rows.forEach((row) => {
    sourceLookupKeys(row).forEach((key) => {
      if (!lookup.has(key)) lookup.set(key, row);
    });
  });
  return lookup;
}

function hydrateMethodSource(
  source: RouteDriverSourceRecord | RecordLike,
  sourceLookup: Map<string, RecordLike>,
): RecordLike {
  const matched = sourceLookupKeys(source)
    .map((key) => sourceLookup.get(key))
    .find((record): record is RecordLike => Boolean(record));
  return {
    ...(matched ?? {}),
    ...asRecord(source),
  };
}

function sanitizeRouteOption(option: RouteIntelligenceOptionV2): RouteIntelligenceOptionV2 {
  return sanitizeObject({
    id: text(option.id),
    rank: numberOr(option.rank, 1),
    routeName: sanitizeShareText(option.routeName),
    routeType: sanitizeShareText(option.routeType),
    verdict: sanitizeShareText(option.verdict),
    releaseRule: sanitizeShareText(option.releaseRule),
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
    zeroTrustMoveIntake: sanitizeObject(option.zeroTrustMoveIntake ?? option.releaseEvidencePack),
    releaseEvidencePack: sanitizeObject(option.releaseEvidencePack ?? option.zeroTrustMoveIntake),
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
          items: route.routeDriverRegister.items.map((driver) => {
            const driverRecord = driver as unknown as RecordLike;
            return {
              id: text(driver.id),
              title: sanitizeShareText(driver.title),
              driver: sanitizeShareText(driver.driver),
              releaseRead: sanitizeShareText(driver.releaseRead ?? driverRecord.release_read),
              evidenceBasis: sanitizeShareText(driver.evidenceBasis ?? driverRecord.evidence_basis),
              familyAction: sanitizeShareText(driver.familyAction ?? driverRecord.family_action),
              testApplied: sanitizeShareText(driver.testApplied ?? driverRecord.test_applied),
              testResult: sanitizeShareText(driver.testResult ?? driverRecord.test_result),
              principalInstruction: sanitizeShareText(driver.principalInstruction ?? driverRecord.principal_instruction),
              capitalConsequence: sanitizeShareText(driver.capitalConsequence ?? driverRecord.capital_consequence),
              sourceIds: driver.sources.map(sourceCitationId).filter(Boolean),
              sources: [],
            };
          }),
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
    routeMemoSpine: route.routeMemoSpine ? sanitizeObject(route.routeMemoSpine) : undefined,
    sourceRead:
      "This release-readiness surface shows the decision packet, evidence boundary, route gates, and source citations without exposing private records.",
  };
}

function buildDefaultPrivateEvidence() {
  const gateMappedStatus = "Gate mapped; release remains blocked until signed evidence is received and indexed.";
  return [
    ["Buyer profile", gateMappedStatus, "Principal / FO operator", "Identity class, residence posture, property count, and buyer capacity."],
    ["Title pack", gateMappedStatus, "UK property counsel", "Title, searches, survey, restrictions, seller authority, insurance quote and security plan, and exchange mechanics."],
    ["SDLT computation", gateMappedStatus, "UK tax counsel", "Signed SDLT treatment, surcharges, relief exclusions, and filing responsibility."],
    ["SoW / SoF file", gateMappedStatus, "Source bank", "Corroborated source narrative, account path, adverse-media checks, and transfer authority."],
    ["Receiving and alternate rails", gateMappedStatus, "Receiving bank", "Primary rail, alternate rail, KYC acceptance, FX authority, limits, and timetable."],
    ["Family authority minute", gateMappedStatus, "Family office / principal", "Use boundary, family-home rights position, title authority, carry owner, sale/refinance limits, and decision memory."],
    ["Family fairness minute", gateMappedStatus, "Family fairness owner", "Notice, fairness protection, beneficiary treatment, and next-generation record."],
    ["Operating file", gateMappedStatus, "FO operator", "Insurance quote, security plan, service contracts, initial carry budget, and reporting cadence."],
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
      "Approved to negotiate under signed gates; no capital release. The house is approved for London family use only after title, SDLT, source, bank, authority, family-use, fairness, and decision-memory gates are signed.",
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
        gate: "Title and seller authority",
        state: "Gate mapped for bid or exchange gate",
        evidence: "Title class, seller identity, seller authority, searches, restrictions, deposit terms, exclusivity terms, and completion timetable.",
        why_it_matters: "No bid, deposit, exchange, or transfer signal before property counsel signs the route.",
      },
      {
        gate: "SDLT and tax treatment",
        state: "Gate mapped for bid-release gate",
        evidence: "Buyer profile, non-resident status, additional-dwelling treatment, relief exclusions, ATED and structure position, and counsel computation.",
        why_it_matters: "The route cannot rely on relief, refund, wrapper, or residence benefit unless counsel signs the facts at trigger date.",
      },
      {
        gate: "Source wealth and source funds",
        state: "Gate mapped for exchange gate",
        evidence: "Source wealth, source funds, liquidity source, beneficial-owner chart, funds trail, and selected buyer-route narrative.",
        why_it_matters: "Capital that exists is not treated as movable until the source file matches the selected buyer route.",
      },
      {
        gate: "Primary and alternate bank rail",
        state: "Gate mapped for exchange gate",
        evidence: "Source bank, UK receiving bank, alternate rail, KYC, SoW/SoF, sanctions/adverse-media clearance, signer condition, and timetable.",
        why_it_matters: "No exchange if one bank lead or one account is the only route to completion.",
      },
      {
        gate: "FX and transfer authority",
        state: "Gate mapped for exchange gate",
        evidence: "Signer mandate, FX quote protocol, transfer limits, rate-refresh rule, sanctions/KYC state, settlement timetable, and escalation owner.",
        why_it_matters: "No transfer authority before signer, FX, timing, and receiving-route conditions align.",
      },
      {
        gate: "Family authority minute",
        state: "Gate mapped for bid or exchange gate",
        evidence: "Who can see, stop, sign, move, retrieve, and explain the route.",
        why_it_matters: "No family-office execution if authority lives only in oral instruction.",
      },
      {
        gate: "Family-use and fairness record",
        state: "Gate mapped for bid or exchange gate",
        evidence: "Named family-user boundary, family-home rights position, family-fairness owner, carry owner, stop rights, and next-generation explanation.",
        why_it_matters: "Use rights, carry, and veto must be written so the property does not become an implied future entitlement.",
      },
      {
        gate: "Decision record packet",
        state: "Gate mapped for bid or exchange gate",
        evidence: "Verdict, rejected route options, accepted duty drag, evidence index, stop triggers, adviser gate records, and retrieval owner.",
        why_it_matters: "No release if the room cannot later explain why capital moved.",
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

function principalTable(columns: string[], rows: string[][]): ReleaseReadinessPrincipalTable {
  return {
    columns: columns.map(sanitizeShareText),
    rows: cleanRows(rows),
  };
}

function buildPrincipalRouteSummary(option: ReleaseReadinessShareRouteOption): ReleaseReadinessPrincipalRouteSummary {
  const hasPurchaseDuties = numberOr(option.metrics.totalDutiesUsd) > 0;
  const totalExposure = moneyText(option.metrics.totalAcquisitionCostUsd, "No capital deployed");
  const dutyRead = hasPurchaseDuties
    ? `${moneyText(option.metrics.totalDutiesUsd)} day-one duty drag`
    : "No purchase duty while capital remains blocked";
  return {
    routeName: sanitizeShareText(option.routeName),
    currentDecision: sanitizeShareText(option.releaseRule || option.verdict),
    useCase: sanitizeShareText(option.bestUse),
    capitalConsequence: sanitizeShareText(hasPurchaseDuties ? `${totalExposure}; ${dutyRead}.` : dutyRead),
    releaseConsequence: sanitizeShareText(option.releaseEffect || option.failureMode),
  };
}

function buildPrincipalActionTests(methodDrivers: ReleaseReadinessMethodDriver[]): ReleaseReadinessPrincipalActionTest[] {
  return methodDrivers.slice(0, 8).map((driver, index) => ({
    label: `Family action test ${index + 1}`,
    familyAction: sanitizeShareText(driver.familyAction || driver.title),
    testApplied: sanitizeShareText(driver.testApplied || driver.driver),
    testResult: sanitizeShareText(driver.testResult || driver.releaseRead),
    principalInstruction: sanitizeShareText(driver.principalInstruction || "Principal instruction remains controlled by the signed release gates."),
    capitalConsequence: sanitizeShareText(driver.capitalConsequence || "Capital remains blocked until this action is written into the selected route."),
  }));
}

function buildPrincipalView(payload: {
  reference: string;
  corridor: string;
  move: string;
  decision: string;
  releaseRule: string;
  purpose: string;
  capitalRule: string;
  rationale: string;
  mitigation: string;
  selectedRoute: ReleaseReadinessShareRouteOption;
  routeOptions: ReleaseReadinessShareRouteOption[];
  gateRows: ReleaseReadinessShareGateRow[];
  methodDrivers: ReleaseReadinessMethodDriver[];
  publicSourceCount: number;
  privateEvidenceCount: number;
  methodDriverCount: number;
  citationCount: number;
}): ReleaseReadinessPrincipalView {
  const metrics = payload.selectedRoute.metrics;
  const allIn = moneyText(metrics.totalAcquisitionCostUsd);
  const dutyDrag = moneyText(metrics.totalDutiesUsd);
  const dutyPct = percentText(metrics.dutyDragPct);
  const annualCarry = moneyText(metrics.annualCarryingCostUsd);
  const transactionValue = moneyText(metrics.propertyValueUsd);
  const baseSdlt = moneyText(metrics.baseSdltUsd);
  const surcharge = moneyText(metrics.nrAndAdditionalDwellingSurchargeUsd);

  return {
    decisionMinute: principalTable(
      ["Control point", "Principal answer", "Decision consequence"],
      [
        [
          "Decision",
          payload.decision,
          "Negotiation may continue only while bid, deposit, exchange, transfer, and ownership-route authority remain blocked.",
        ],
        [
          "Selected route",
          payload.selectedRoute.routeName,
          "One operating track is allowed for adviser work; parallel wrapper, residence, and relief stories are not release authority.",
        ],
        [
          "Capital rule",
          payload.capitalRule,
          "The family can keep the opportunity alive without letting seller timing harden into capital commitment.",
        ],
        [
          "Release rule",
          payload.releaseRule,
          "The decision changes only when the signed evidence says the same thing across title, tax, source, bank, authority, purpose, fairness, and decision memory.",
        ],
      ],
    ),
    familyActionAnswer: principalTable(
      ["Family action", "Answer", "Principal consequence"],
      [
        [
          "Proposed action",
          payload.move,
          "This is tested as a family-use, continuity, and control move; not as yield, prestige, wrapper planning, or future residence planning.",
        ],
        [
          "What can proceed now",
          "Counsel-led negotiation, title/tax/bank/source retrieval, bid discipline, and family authority drafting.",
          "The family office has an operating path for the next week without releasing capital.",
        ],
        [
          "What cannot proceed now",
          "No bid hardening, deposit, exchange, funds movement, title transfer, or structure change.",
          "A seller-facing commitment before signed gates would override the memo's capital control.",
        ],
      ],
    ),
    capitalTruth: principalTable(
      ["Metric", "Principal read", "Decision consequence"],
      [
        ["Guide-price basis", transactionValue, "This is the starting price, not the capital approval."],
        ["Base SDLT", baseSdlt, "Tax cost is part of the purchase decision, not a background line item."],
        [
          "Non-resident plus additional-dwelling surcharge",
          surcharge,
          "No relief, refund, residence, or replacement-home benefit is credited unless counsel signs eligibility.",
        ],
        [
          "Day-one duty drag",
          `${dutyDrag} / ${dutyPct}`,
          "The asset is coherent only if the family signs that this is a control and continuity cost, not a yield-led acquisition.",
        ],
        [
          "All-in before operating costs",
          allIn,
          "The family is not deciding on guide price alone; release is blocked against total exposure.",
        ],
        [
          "Annual carry before opportunity cost",
          annualCarry,
          "Carry must have a named owner, liquidity source, reporting cadence, and family-use policy before completion.",
        ],
      ],
    ),
    purposeBoundary: principalTable(
      ["Boundary", "Allowed read", "Blocked read"],
      [
        [
          "Family purpose",
          payload.purpose,
          "Not approved as prestige, yield, wrapper planning, future residence planning, or informal family entitlement.",
        ],
        [
          "London presence",
          "Use, education, residence, succession, and capital-preservation claims remain separate gates.",
          "Property ownership does not itself solve school timing, residence status, tax treatment, or future use.",
        ],
        [
          "Capital preservation",
          "Mayfair can be discussed as a control asset only after the duty drag is consciously accepted.",
          "Capital preservation cannot be used to hide acquisition duty, annual carry, bank friction, or family ambiguity.",
        ],
      ],
    ),
    releaseRule: principalTable(
      ["Release lock", "What must be signed", "Capital consequence"],
      [
        ["Bid release", "Closed comps, failed-sale history, seller motivation, capex adjustment, first-offer range, and walk-away price.", "No bid authority."],
        ["Exchange/deposit release", "Title, seller authority, searches, SDLT, source, bank, FX, family authority, and deposit mechanics.", "No exchange or deposit."],
        ["Structure release", "Counsel-signed non-tax governance, security, succession, operating, reporting, and bank purpose.", "No wrapper or ownership-route change."],
        ["Purpose release", "Family-use boundary, fairness position, carry owner, stop rights, and decision record location.", "No family-use approval."],
      ],
    ),
    signedGateMap: principalTable(
      ["Signed gate", "Owner evidence", "Decision consequence"],
      payload.gateRows.map((gate) => [gate.gate, gate.condition, gate.consequence]),
    ),
    whatChanged: principalTable(
      ["Before this review", "After this review", "Family consequence"],
      [
        [
          "Property interest",
          "One capital-release decision with a selected direct-buyer route.",
          "The family can like the asset without approving capital movement.",
        ],
        [
          "Guide price",
          "Bid authority is separated from market attractiveness.",
          "Negotiation cannot harden without closed comps and a walk-away price.",
        ],
        [
          "Family-use claim",
          "Use, fairness, carry, veto, and future explanation are written gates.",
          "The property cannot become an undocumented entitlement.",
        ],
        [
          "Bank/source narrative",
          "Money movement must match source, signer, KYC, sanctions, FX, receiving rail, and alternate rail.",
          "Capital that exists is not treated as movable until banks accept the route.",
        ],
        [
          "Adviser lanes",
          "Counsel, bank, broker, tax, operator, and family-office inputs convert into one release rule.",
          "No adviser lane can accidentally approve what another lane has not cleared.",
        ],
      ],
    ),
    whatCaught: principalTable(
      ["Issue caught", "Why it matters", "Release response"],
      [
        [
          "Guide price is not bid authority",
          "A prime address can convert desire into overpayment if seller timing outruns bid discipline.",
          "Buying agent must produce comps, failed-sale history, seller motivation, capex adjustment, first-offer range, and walk-away price.",
        ],
        [
          "Duty drag changes the asset purpose",
          "A material day-one duty drag means this cannot be defended as a yield-led purchase.",
          "The family must minute the control, continuity, carry, and future-explanation thesis before capital moves.",
        ],
        [
          "Residence and education claims do not release the purchase",
          "Ownership can harden while school, guardian, day-count, visitor, student, or parent routes remain unresolved.",
          "Specialist reviews clear each purpose claim separately before bid, exchange, or completion authority.",
        ],
        [
          "Structure is not a shortcut",
          "Company, trust, or wrapper routing can add SDLT, ATED, disclosure, bank scrutiny, and beneficial-owner burden.",
          "Use structure only if counsel signs a non-tax governance, security, succession, or operating reason.",
        ],
        [
          "Bank rails are execution risk",
          "Source funds can exist and still fail because signer, KYC, SoW/SoF, sanctions, FX, timing, or receiving rail does not clear.",
          "No exchange until source bank, receiving bank, alternate rail, signer authority, and FX route are accepted.",
        ],
        [
          "Family use can become entitlement",
          "Repeated use without a written boundary can create fairness, veto, or next-generation ambiguity.",
          "Named family-user boundary, family-fairness position, carry owner, stop rights, and decision memory must be signed.",
        ],
      ],
    ),
    routeAlternatives: payload.routeOptions.map(buildPrincipalRouteSummary),
    familyActionTests: buildPrincipalActionTests(payload.methodDrivers),
    sevenDayInstruction: principalTable(
      ["Window", "Family-office action", "Owner"],
      [
        ["Day 0-1", "Confirm no bid, no deposit, no seller commitment, and no ownership-route change without signed gates.", "Principal + family-office operator"],
        ["Day 1-2", "Produce closed comparables, failed-sale history, seller motivation, capex adjustment, first-offer range, and walk-away price.", "Buying agent"],
        ["Day 1-3", "Sign buyer profile, SDLT treatment, non-resident/additional-dwelling position, relief exclusions, and residence boundary.", "UK tax counsel"],
        ["Day 2-4", "Confirm title, searches, restrictions, seller authority, deposit mechanics, and completion conditions.", "UK property counsel"],
        ["Day 2-5", "Confirm SoW/SoF acceptance, signer authority, FX controls, primary rail, alternate rail, sanctions/KYC state, and timetable.", "Source bank + receiving bank"],
        ["Day 4-7", "Sign family-use boundary, fairness position, carry owner, stop rights, circulation rule, and decision-record location.", "Family office + succession counsel"],
      ],
    ),
    evidenceBoundary: principalTable(
      ["Evidence class", "What it supports", "What it does not prove"],
      [
        [
          `${payload.publicSourceCount} public source rows`,
          "Public legal, tax, market, property, FX, and authority claims.",
          "Not title, seller authority, bank acceptance, valuation, family authority, or private fact proof.",
        ],
        [
          `${payload.privateEvidenceCount} private evidence classes`,
          "The family-side records that must be signed, accepted, or indexed before release.",
          "Indexing alone does not replace counsel, bank, operator, or principal sign-off.",
        ],
        [
          `${payload.methodDriverCount} method drivers`,
          "Why the family action can fail and which gate protects the route.",
          "Not legal status, tax treatment, bank acceptance, valuation, title, or family-authority proof.",
        ],
        [
          `${payload.citationCount} citation handles`,
          "Reader navigation to supported source material where available.",
          "No citation handle is bid authority or private release authority.",
        ],
      ],
    ),
    finalInstruction: principalTable(
      ["Instruction", "Principal standard", "Decision if not satisfied"],
      [
        [
          "Proceed",
          "Proceed only with controlled negotiation under the selected direct-buyer route while signed gates converge.",
          "Capital remains blocked.",
        ],
        [
          "Hold",
          "Hold if any title, SDLT, source, bank, authority, fairness, bid, or decision-memory gate does not align.",
          "No bid, deposit, exchange, funds movement, transfer, or structure change.",
        ],
        [
          "Stop",
          "Stop the current route if the purchase remains prestige-led, yield-led, wrapper-led, or undocumented after gate review.",
          "Preserve the family objective; do not preserve a weak transaction path.",
        ],
      ],
    ),
  };
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

function sourceClaimFallback(source: RecordLike): string {
  const id = text(source.id).toLowerCase();
  const institution = text(source.institution);
  const title = text(source.title);
  const haystack = `${id} ${institution} ${title}`.toLowerCase();

  if (/rightmove|ob private|balfour place|walton place|property for sale/.test(haystack)) {
    return "Supports listing facts only: advertised price context, property type, beds/baths/area/tenure, listing date, and advertisement context. It is not valuation, title, seller authority, survey, legal particulars, or bid authority.";
  }
  if (/savills|knight frank|coutts|prime residential|forecast|market index|piri/.test(haystack)) {
    return "Supports prime-market context only. It is not a Balfour valuation, bid authority, legal diligence, title evidence, seller authority, survey proof, or seller-timing proof.";
  }
  if (/residential property rates|sdlt_residential|stamp duty land tax.*residential/.test(haystack)) {
    return "Supports the residential SDLT rate bands used for the control-case duty model.";
  }
  if (/non_resident|non-uk residents|non-resident/.test(haystack)) {
    return "Supports the non-UK resident SDLT surcharge boundary applied to the buyer profile.";
  }
  if (/corporate|company|non-natural/.test(haystack)) {
    return "Supports the company/non-natural-person SDLT route boundary and why wrapper use remains separately gated.";
  }
  if (/ated|annual tax on enveloped dwellings/.test(haystack)) {
    return "Supports the ATED exposure boundary for company or enveloped ownership routes.";
  }
  if (/foreign income|gains|\bfig\b/.test(haystack)) {
    return "Supports the post-2025 FIG/residence planning boundary; it is not purchase-release authority.";
  }
  if (/iht|inheritance|long-term resident/.test(haystack)) {
    return "Supports the long-term UK residence and IHT review boundary for continuity planning.";
  }
  if (/wise|gbp|usd|exchange|currency/.test(haystack)) {
    return "Supports the GBP/USD model-rate context; execution pricing remains bank-gated.";
  }
  if (/child student visa/.test(haystack)) {
    return "Supports the Child Student route boundary; property ownership is not residence permission.";
  }
  if (/parent of a child student/.test(haystack)) {
    return "Supports the parent-route boundary for education-linked family presence.";
  }
  if (/private school fees|vat/.test(haystack)) {
    return "Supports the education-fee tax-cost boundary for education-linked family-use budgeting.";
  }
  if (/school applications|foreign national children|overseas children/.test(haystack)) {
    return "Supports the school-admissions timing boundary for children resident outside England.";
  }
  if (/overseas entity|beneficial owners|companies house/.test(haystack)) {
    return "Supports the overseas-entity and beneficial-owner register boundary for structure routes.";
  }
  if (/effectively managed and controlled|uae|corporate tax/.test(haystack)) {
    return "Supports the UAE management-control and source-side tax-continuity boundary.";
  }
  if (/central management and control|intm120060/.test(haystack)) {
    return "Supports the UK central-management-and-control risk boundary for company routes.";
  }
  if (/irs|u\.s\.-situs|estate tax|nonresidents/.test(haystack)) {
    return "Supports the U.S.-situs estate-exposure inventory boundary for global custody.";
  }
  if (/westminster|council tax/.test(haystack)) {
    return "Supports the local council-tax and operating-cost boundary for the Mayfair property.";
  }
  return "Supports the named public claim only; private execution evidence remains separately gated.";
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
    claim: sanitizeShareText(source.claim_supported ?? source.claim ?? sourceClaimFallback(source)),
    boundary: sourceDecisionBoundary(source),
    url: text(source.url),
    };
  }) satisfies ReleaseReadinessShareSource[];
}

function buildSafeRisk(data: ResolvedDecisionMemoSurfaceData, route: RouteIntelligenceV2) {
  const risk = asRecord(pickSection(data, "risk_assessment"));
  const selected = route.selectedLiveOption ?? route.routeOptions[0];

  return sanitizeObject({
    risk_level: risk.risk_level ?? "Evidence mapped; no capital release until signed approval gates",
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

function firstShareText(...values: unknown[]): string {
  for (const value of values) {
    const resolved = sanitizeShareText(value);
    if (resolved) return resolved;
  }
  return "";
}

function shareStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(sanitizeShareText).filter(Boolean);
  const resolved = sanitizeShareText(value);
  return resolved ? [resolved] : [];
}

function buildStandaloneUserInputs(
  data: ResolvedDecisionMemoSurfaceData,
  selectedRoute: ReleaseReadinessShareRouteOption,
  options: {
    move: string;
    purpose: string;
    capitalRule: string;
  },
): RecordLike {
  const { move, purpose, capitalRule } = options;
  const existing = asRecord(pickSection(data, "user_inputs") ?? pickSection(data, "userInputs"));
  const room = asRecord(pickSection(data, "room_state_summary"));
  const capitalFlow = asRecord(pickSection(data, "capital_flow_data"));
  const zeroTrust = asRecord(pickSection(data, "zero_trust_move_intake"));
  const releaseDecision = asRecord(pickSection(data, "release_decision_packet"));
  const familyExpectation = firstShareText(
    existing.family_expectation,
    existing.familyExpectation,
    room.family_expectation,
    room.live_move,
    `${purpose} The expected benefit is family continuity and control; it is not capital-release authority until signed gates clear.`,
  );

  const userInputs: RecordLike = {
    live_decision: firstShareText(existing.live_decision, existing.liveDecision, room.live_move, move),
    family_expectation: familyExpectation,
    family_purpose: firstShareText(existing.family_purpose, existing.familyPurpose, purpose),
    mandate_at_risk: firstShareText(existing.mandate_at_risk, existing.mandateAtRisk, room.route_context, room.market_pattern_read),
    substitute_story: firstShareText(existing.substitute_story, existing.substituteStory),
    present_room_burden: shareStringArray(existing.present_room_burden ?? existing.presentRoomBurden),
    expected_route: firstShareText(existing.expected_route, existing.expectedRoute, selectedRoute.routeName),
    capital_rule: firstShareText(existing.capital_rule, existing.capitalRule, capitalRule),
    family_success_condition: firstShareText(
      existing.family_success_condition,
      existing.familySuccessCondition,
      "The move succeeds only if purpose, source, bank, title, tax, family authority, fairness, carry ownership, and decision memory are written before seller timing hardens.",
    ),
    source_jurisdiction: firstShareText(existing.source_jurisdiction, existing.sourceJurisdiction, capitalFlow.source),
    destination_jurisdiction: firstShareText(existing.destination_jurisdiction, existing.destinationJurisdiction, capitalFlow.destination),
    capital_at_risk: firstShareText(existing.capital_at_risk, existing.capitalAtRisk, capitalFlow.capital_at_risk),
    selected_route_release_effect: firstShareText(selectedRoute.releaseEffect),
    evidence_record_count: numberOr(
      existing.evidence_record_count ?? existing.evidenceRecordCount ?? zeroTrust.declared_record_count,
      Array.isArray(zeroTrust.evidence_records) ? zeroTrust.evidence_records.length : 0,
    ),
    adviser_asks: shareStringArray(existing.adviser_asks ?? existing.adviserAsks ?? zeroTrust.adviser_asks),
    not_expectation: shareStringArray(existing.not_expectation ?? existing.notExpectation),
    release_boundary: firstShareText(existing.release_boundary, existing.releaseBoundary, zeroTrust.release_boundary, releaseDecision.release_boundary),
  };

  return Object.fromEntries(
    Object.entries(userInputs).filter(([, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== "" && value !== null && value !== undefined;
    }),
  );
}

function moneyText(value: unknown, fallback = "Signed gate controls release"): string {
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

function percentText(value: unknown, fallback = "Signed gate controls release"): string {
  const numeric = numberOr(value, Number.NaN);
  if (!Number.isFinite(numeric)) return fallback;
  return `${numeric.toFixed(1)}%`;
}

function safeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(sanitizeShareText).filter(Boolean);
}

function cleanRows(rows: string[][]): string[][] {
  return rows
    .map((row) => row.map((cell) => sanitizeShareText(cell || "Signed gate controls release")))
    .filter((row) => row.some((cell) => cell && cell !== "Signed gate controls release"));
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
        value: "Approved direct-buyer negotiation under signed gates",
        body:
          "Final decision: approved to negotiate under signed gates; no capital release, bid authority, exchange authority, deposit authority, or structure approval until release gates are signed.",
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
  const strategyRows = strategies.length
    ? strategies.map((strategy) => [
        text(strategy.name),
        text(strategy.mechanism),
        text(strategy.tax_savings_potential),
        safeStringArray(strategy.requirements).join("; "),
      ])
    : [
        [
          "Direct non-UK resident individual route",
          "Base residential SDLT plus non-resident and additional-dwelling surcharge posture.",
          `${moneyText(acquisition.total_stamp_duties_usd ?? model.direct_total_duties_usd)} duty drag accepted only for signed family-use and control purpose.`,
          "UK tax counsel signs buyer profile, residence status, property-count position, relief exclusions, and filing responsibility.",
        ],
        [
          "Main-residence or replacement route",
          "Lower-duty route only if residence and disposal/replacement facts are true at the transaction date.",
          "Not credited in the control case.",
          "Signed day-count, previous main-residence disposal evidence, replacement timing, and counsel computation control any bid-authority change.",
        ],
        [
          "Company / non-natural-person wrapper",
          "Higher-duty and higher-disclosure route unless a non-tax governance, security, succession, or operating purpose survives counsel and bank review.",
          `${moneyText(model.entity_total_duties_usd)} modeled duty plus ATED/disclosure/bank-friction review.`,
          "Do not use as tax shortcut; use only if counsel signs non-tax purpose and bank/beneficial-owner files match.",
        ],
        [
          "Hold or rent-first presence",
          "No purchase duty until the family proves education, residence, use, and carry facts.",
          "No capital deployed into SDLT while evidence remains incomplete.",
          "Use if title, bank, tax, residence, family-use, or seller timing gates are not ready.",
        ],
      ];

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
        value: moneyText(
          numberOr(model.entity_incremental_duty_vs_direct_usd) ||
          (numberOr(model.entity_total_duties_usd) && numberOr(model.direct_total_duties_usd)
            ? Math.abs(numberOr(model.entity_total_duties_usd) - numberOr(model.direct_total_duties_usd))
            : undefined),
        ),
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
      rows: strategyRows,
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
    eyebrow: "Market discipline and bid authority",
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
  const annual = asRecord(pickSection(resolved, "annual_wealth_engine"));
  const carryModel = asRecord(annual.carrying_cost_model);
  const annualCarry =
    numberOr(annual.annual_carrying_cost_before_opportunity_usd) ||
    numberOr(carryModel.annual_carrying_cost_before_opportunity_usd) ||
    numberOr(asRecord(wealth.starting_position).carrying_cost_usd);
  const scenarioEntries = ["base", "stress", "opportunity"]
    .map((key) => [key, asRecord(scenarios[key])] as const)
    .filter(([, scenario]) => Object.keys(scenario).length);
  const scenarioRows = scenarioEntries.map(([, scenario]) => {
    const probability = numberOr(scenario.probability);
    const year10Value = numberOr(scenario.year_10_value ?? asRecord(scenario.ten_year_outcome).final_value);
    const preCarryNet = numberOr(asRecord(scenario.ten_year_outcome).net_value_creation);
    const carryAdjustedNet = preCarryNet - (annualCarry * 10);
    return {
      scenario,
      probability,
      year10Value,
      preCarryNet,
      carryAdjustedNet,
    };
  });
  const carryAdjustedWeighted = scenarioRows.reduce(
    (sum, row) => sum + (row.carryAdjustedNet * row.probability),
    0,
  );
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
      "The projection is a route-governance model. It shows property-value movement against all-in acquisition cost, then separately shows the ten-year annual-carry effect before principal review.",
    cards: [
      {
        label: "Capital deployed",
        value: moneyText(wealth.capital_deployed),
        body: sanitizeShareText(asRecord(wealth.cost_of_inaction).primary_driver),
      },
      {
        label: "Scenario discipline before carry",
        value: moneyText(asRecord(wealth.probability_weighted).expected_value_creation),
        body: "Probability-weighted read across base, stress, and opportunity paths before annual carry and before opportunity cost. This is not a forecast.",
      },
      {
        label: "Carry-adjusted discipline output",
        value: moneyText(carryAdjustedWeighted),
        body: `${moneyText(annualCarry)} annual carry is deducted for ten years. Opportunity cost remains separate.`,
      },
      {
        label: "Cost of hardening too early",
        value: moneyText(asRecord(wealth.cost_of_inaction).estimated_day_one_drag_usd),
        body: sanitizeShareText(asRecord(wealth.cost_of_inaction).secondary_driver),
      },
    ],
    table: {
      columns: ["Scenario", "Scenario weight", "Year 10 value", "Net vs all-in before carry", "Net after 10-year carry", "Memo read"],
      rows: scenarioRows.map((row) => [
        text(row.scenario.name),
        percentText(row.probability * 100),
        moneyText(row.year10Value),
        moneyText(row.preCarryNet),
        moneyText(row.carryAdjustedNet),
        text(row.scenario.verdict),
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
    .filter((risk) => !/AI|technology/i.test(`${text(risk.label)} ${text(risk.detail)} ${safeStringArray(risk.impact_channels).join(" ")}`))
    .filter((risk) =>
      /bank|job|labor|war|geopolitical|sanction|digital|stablecoin|rates|insurance|security|travel/i.test(
        text(risk.label),
      ),
    )
    .slice(0, 8);
  const bankSimulation = asArray(crisis.bank_compliance_escalation_simulation)
    .filter((row) => !/AI|technology/i.test(`${text(row.scenario)} ${text(row.breakpoint)} ${text(row.required_response)}`))
    .slice(0, 5);

  return reportSection({
    id: "crisis-resilience",
    eyebrow: "Crisis resilience and anti-fragility read",
    title: "Crisis Resilience And Anti-Fragility Read",
    intro: sanitizeShareText(
      overall.summary ??
        "The route cannot release until bank, source, sanctions, insurance, security, travel, geopolitical, labor-income, and absence-readiness controls are evidenced.",
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
          "Labor-income, conflict, sanctions, and digital-settlement scenarios affect release only where this family's source wealth, bank rail, counterparties, payment route, insurance, travel, or operating income touches the exposure.",
      },
      {
        label: "Worst-case loss boundary",
        value: text(overall.worst_case_loss, "Duty drag plus deposit, FX, and adviser slippage"),
        body: sanitizeShareText(overall.recovery_time),
      },
      ...selectedRisks.map((risk) => ({
        label: text(risk.status, "Signed gate controls release"),
        title: text(risk.label),
        body: text(risk.detail),
        status: `${text(risk.decision_window_days, "7")} day window`,
        releaseCondition:
          safeStringArray(risk.impact_channels).join(", ") ||
          "Applies only if the source wealth, settlement rail, bank, counterparty, payment route, insurance, travel, or operating income touches this exposure.",
      })),
    ],
    table: {
      columns: ["Bank compliance escalation", "Breakpoint", "Release response"],
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
    "Primary and alternate banking rail": {
      body:
        "Prevents a single receiving bank, relationship lead, or conveyancer client account from becoming the only completion path.",
      releaseCondition: "Primary rail, alternate rail, signers, FX authority, and escalation contacts are accepted before exchange.",
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
      releaseCondition: "Residence and annual review owner are gate mapped before the house becomes a continuity anchor.",
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

function buildGenerationSection(resolved: ResolvedDecisionMemoSurfaceData): ReleaseReadinessShareReportSection {
  const market = asRecord(pickSection(resolved, "current_market_data"));
  const model = asRecord(market.acquisition_duty_model);
  const audit = asRecord(pickSection(resolved, "cross_border_audit_summary"));
  const acquisition = asRecord(audit.acquisition_audit);
  const propertyValue =
    numberOr(acquisition.property_value_usd) ||
    numberOr(model.price_usd);
  const dutyDrag =
    numberOr(acquisition.total_stamp_duties_usd) ||
    numberOr(model.direct_total_duties_usd);
  const retainedAfterDuty = propertyValue > 0 ? Math.max(propertyValue - dutyDrag, 0) : 0;
  const allIn =
    numberOr(acquisition.total_acquisition_cost_usd) ||
    numberOr(model.direct_total_outlay_usd);

  return {
    id: "g1-g2-g3-continuity",
    eyebrow: "G1 / G2 / G3 continuity chain",
    title: "The house should transfer responsibility before it transfers symbolism",
    intro: sanitizeShareText(
      "The route view keeps the full generation-to-generation read. G1 control, G2 use, fairness treatment, G3 decision memory, carry, veto, sale/refinance, and future explanation must be written before the asset becomes a family expectation.",
    ),
    cards: [
      {
        label: "G1 route control",
        value: "Signed gate controls release",
        title: "Control before commitment",
        body: sanitizeShareText(
          "Principal authority, stop rights, and office retrieval must be written before seller timing turns intent into commitment.",
        ),
        releaseCondition: sanitizeShareText(
          "Release only when approval, stop, signing, reporting, and retrieval rights are written and retrievable.",
        ),
      },
      {
        label: "G1 -> G2 retained value",
        value: retainedAfterDuty ? moneyText(retainedAfterDuty) : "Evidence-gated",
        title: "Retained value after duty drag",
        body: sanitizeShareText(
          `Control-case value after ${moneyText(dutyDrag)} duty drag, before annual carry and any family-use entitlement is allowed to harden.`,
        ),
        releaseCondition: sanitizeShareText(
          "Use rights and carry owner are gate mapped before bid release or exchange.",
        ),
      },
      {
        label: "G2 -> G3 without governance lock",
        value: "Uncontrolled continuity",
        title: "Implied entitlement risk",
        body: sanitizeShareText(
          "Repeated use can become a family promise without matching title, tax, carry, guest, security, sale/refinance, veto, or fairness rules.",
        ),
        releaseCondition: sanitizeShareText(
          "This path stays hold until the family-fairness owner and next-generation decision record are signed.",
        ),
      },
      {
        label: "G2 -> G3 with governance lock",
        value: allIn ? `${moneyText(allIn)} explained` : "Decision record controlled",
        title: "Governed continuity",
        body: sanitizeShareText(
          "The family can explain later why the house accepted duty drag, annual carry, restricted liquidity, and family-use boundaries.",
        ),
        releaseCondition: sanitizeShareText(
          "Decision record location, retrieval owner, source anchors, blockers, route alternatives, and explanation packet are indexed.",
        ),
      },
    ],
    table: {
      columns: ["Generation layer", "Capital / governance read", "Loss if unresolved", "Recorded release file"],
      rows: [
        [
          "G1 capital authority",
          "Approves route, capital release, stop rights, adviser instruction, and retrieval owner.",
          "Seller timing or adviser momentum can become commitment before stop authority is retrievable.",
          "Authority minute naming approver, stop owner, signer, alternate signer, retrieval owner, and adviser-instruction owner.",
        ],
        [
          "G2 use boundary",
          "Use is not title, beneficial ownership, signing authority, sale right, refinance right, or carry entitlement.",
          "Repeated occupation can become implied entitlement, carry ambiguity, or later sale/refinance conflict.",
          "Family-use schedule covering occupants, guests, security access, costs, maintenance, sale/refinance permissions, and escalation.",
        ],
        [
          "G2 fairness treatment",
          "Non-user treatment, notice, veto position, and future-beneficiary explanation must be explicit.",
          "One family-use asset can create later equivalence, notice, veto, or future-beneficiary conflict.",
          "Family-fairness minute naming fairness owner, treatment of non-users, veto position, and next-generation explanation.",
        ],
        [
          "G3 decision memory",
          "Later readers must retrieve why the route advanced, held, or stopped without relying on memory.",
          "A later office cannot explain why the house accepted duty drag, annual carry, and restricted liquidity.",
          "Decision packet with source anchors, signed gates, capital basis, route alternatives, blockers, annual review owner, and retrieval location.",
        ],
      ],
    },
  };
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
        value: "Gate mapped before exchange",
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
  const currentForRecord = (record: string): string => {
    return `To be evidenced before release: ${record} must be reconciled across counsel, bank, tax, title, source, and family-authority records before this route can move.`;
  };
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
      return "Source bank, receiving bank, alternate rail, FX authority, signer mandate, and reporting account match one movement path.";
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
        currentForRecord(text(row.record)),
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
  const proofRows = [
    "Source bank, receiving bank, and alternate rail must clear the same signed acceptance gate.",
    "SoW / SoF pack tying source wealth to bank statements, sale or distribution records, tax support, audited accounts where relevant, and beneficial-owner chart.",
    "Signer mandate, FX authority, transfer limits, receiving account, and alternate-rail escalation owner.",
  ];

  return reportSection({
    id: "banking-sow-sof",
    eyebrow: "Banking rails and SoW/SoF acceptance",
    title: "The movement rail has to accept the source file before the seller clock governs",
    intro:
      "The bank and source file are recorded in the input pack and remain signed-gate controlled before bid, deposit, exchange, transfer, or seller commitment hardens.",
    cards: [
      {
        label: "Release status",
        value: "Gate mapped for irrevocable-commitment gate",
        body: "Gate mapped: source rail, receiving rail, alternate rail, KYC, SoW/SoF, sanctions, beneficial-owner chart, signer mandate, FX authority, transfer limits, and completion timetable must clear the same signed acceptance gate.",
      },
      {
        label: "Source standard",
        value: "Corroborated, not narrated",
        body: "Gate mapped: source wealth and source funds must be corroborated in the format the source and receiving banks will accept.",
      },
    ],
    table: {
      columns: ["Rail or proof class", "Requirement"],
      rows: [
        ...proofRows.map((proof) => ["Gate mapped", proof]),
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
      columns: ["Gate", "Answer", "Decision consequence", "Evidence mapped", "Owner"],
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
    eyebrow: "Controlled implementation order",
    title: "Evidence order before bid, deposit, exchange, or transfer authority",
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
  const isOutcomeOnly =
    /(?:hold|rent-first|stop|rebuild|optionality-preservation|capital-protection)/i.test(`${safe.routeName} ${safe.routeType}`);
  const activeValue = (value: unknown): number | null => {
    if (isOutcomeOnly) return null;
    const numeric = numberOr(value);
    return numeric > 0 ? numeric : null;
  };
  const activePct = (value: unknown): number | null => {
    if (isOutcomeOnly) return null;
    const numeric = numberOr(value);
    return numeric > 0 ? numeric : null;
  };
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
      baseSdltUsd: activeValue(safe.metrics?.bsdUsd),
      nrAndAdditionalDwellingSurchargeUsd: activeValue(safe.metrics?.absdUsd),
      totalSdltUsd: activeValue(safe.metrics?.totalDutiesUsd),
      totalDutiesUsd: activeValue(safe.metrics?.totalDutiesUsd),
      totalAcquisitionCostUsd: activeValue(safe.metrics?.totalAcquisitionCostUsd),
      incrementalDutyVsRecommendedUsd: isOutcomeOnly
        ? numberOr(safe.metrics?.incrementalDutyVsRecommendedUsd) || null
        : numberOr(safe.metrics?.incrementalDutyVsRecommendedUsd) || null,
      dutyDragPct: activePct(safe.metrics?.dutyDragPct),
      annualCarryingCostUsd: activeValue(safe.metrics?.annualCarryingCostUsd),
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

function evidencePreviewRecord(resolved: ResolvedDecisionMemoSurfaceData): RecordLike {
  const memoData = asRecord(resolved.memoData);
  const backendData = asRecord(resolved.backendData);
  const fullArtifact = asRecord((resolved as unknown as RecordLike).fullArtifact);
  const candidates = [
    memoData.preview_data,
    backendData.preview_data,
    asRecord(backendData.memoData).preview_data,
    asRecord(fullArtifact.memo_data).preview_data,
    fullArtifact.preview_data,
    memoData,
    backendData,
    fullArtifact,
  ];

  for (const candidate of candidates) {
    if (isRecord(candidate) && Object.keys(candidate).length > 0) return candidate;
  }

  return {};
}

function evidenceText(record: RecordLike, fields: string[], fallback = ""): string {
  for (const field of fields) {
    const value = record[field];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
    if (Array.isArray(value)) {
      const joined = value
        .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        .slice(0, 2)
        .join(" ");
      if (joined.trim()) return joined.trim();
    }
  }
  return fallback;
}

function evidenceSafeText(value: unknown, fallback = ""): string {
  const cleaned = sanitizeShareText(value ?? fallback)
    .replace(/\bIndexed in input pack;?.*?(?=\.?$)/gi, "Gate mapped; release remains blocked until signed evidence is received and indexed")
    .replace(/\bcounsel-confirmed\b/gi, "counsel gate mapped")
    .replace(/\bpre-cleared\b/gi, "independently cleared")
    .replace(/\bwritten conditional bank acceptance reviewed\b/gi, "bank acceptance gate mapped")
    .replace(/\bNo unexplained cash leg remains\b/gi, "Source wealth, source funds, liquidity, primary rail, alternate rail, tax treatment, and transfer authority remain gate mapped")
    .replace(/\bring-fenced liquidity pool\b/gi, "liquidity source gate")
    .replace(/\bCounsel confirms\b/gi, "Counsel gate maps")
    .replace(/\bHold Until Release Evidence Clears\b/gi, "Hold until signed gates clear")
    .trim();
  return cleaned || fallback;
}

function sourceRegisterClaimFallback(record: RecordLike, title: string): string {
  const haystack = `${title} ${evidenceText(record, ["institution", "publisher", "source"])} ${evidenceText(record, ["category"])}`.toLowerCase();
  if (/rightmove|ob private|balfour place|walton place|property for sale/.test(haystack)) {
    return "Supports listing facts and market context only; it is not valuation, title, seller authority, survey, legal particulars, or bid authority.";
  }
  if (/hmrc|gov\.uk|sdlt|stamp duty|ated|iht|fig|tax/.test(haystack)) {
    return "Supports public legal or tax rule boundaries only; buyer facts and counsel computation control release.";
  }
  if (/bank|source of wealth|source of funds|aml|sanctions|kyc/.test(haystack)) {
    return "Supports banking, AML, SoW, SoF, or transfer-control context only; bank acceptance controls release.";
  }
  return "Supports public rule, market, or source context; private evidence and adviser sign-off control release.";
}

function evidenceRecordKey(record: ReleaseReadinessEvidenceMethodologyRecord): string {
  return `${record.id || record.title}:${record.claim}`.toLowerCase();
}

function addEvidenceRecord(
  records: ReleaseReadinessEvidenceMethodologyRecord[],
  seen: Set<string>,
  record: ReleaseReadinessEvidenceMethodologyRecord,
) {
  const normalizedRecord: ReleaseReadinessEvidenceMethodologyRecord = {
    ...record,
    title: evidenceSafeText(record.title),
    category: evidenceSafeText(record.category),
    claim: evidenceSafeText(record.claim),
    owner: record.owner ? evidenceSafeText(record.owner) : undefined,
    status: record.status ? evidenceSafeText(record.status) : undefined,
    institution: record.institution ? evidenceSafeText(record.institution) : undefined,
    date: record.date ? evidenceSafeText(record.date) : undefined,
    url: record.url ? sanitizeShareText(record.url) : undefined,
  };
  const key = evidenceRecordKey(normalizedRecord);
  if (!normalizedRecord.title || !normalizedRecord.claim || seen.has(key)) return;
  seen.add(key);
  records.push(normalizedRecord);
}

function makeSourceEvidenceRecord(record: RecordLike, fallbackId: string): ReleaseReadinessEvidenceMethodologyRecord {
  const title = evidenceText(record, ["title", "source_title", "name"], "Source register entry");
  return {
    id: evidenceText(record, ["id", "_id", "brief_id", "dev_id", "devid"], fallbackId),
    title,
    category: evidenceText(record, ["category"], "Source Register"),
    claim: evidenceText(record, ["claim_supported", "supports", "reference", "summary", "description"], sourceRegisterClaimFallback(record, title)),
    date: evidenceText(record, ["date", "source_date", "published_at"]),
    institution: evidenceText(record, ["institution", "publisher", "source"]),
    url: evidenceText(record, ["url", "source_url"]),
    citationId: sourceCitationId(record),
  };
}

function makeReleaseEvidenceRecord(record: RecordLike, fallbackId: string): ReleaseReadinessEvidenceMethodologyRecord {
  return {
    id: evidenceText(record, ["id", "_id"], fallbackId),
    title: evidenceText(record, ["title", "category", "domain"], "Release evidence"),
    category: evidenceText(record, ["category", "domain"], "Release Evidence"),
    claim: evidenceText(record, ["evidence", "item", "question", "why_it_matters", "release_condition"], "Evidence item gate mapped for release review."),
    owner: evidenceText(record, ["owner", "advisor"]),
    status: evidenceText(record, ["release_status", "status", "timeline"]),
  };
}

function makeAdviserEvidenceRecord(record: RecordLike, fallbackId: string): ReleaseReadinessEvidenceMethodologyRecord {
  return {
    id: evidenceText(record, ["id", "_id"], fallbackId),
    title: evidenceText(record, ["domain"], "Adviser question"),
    category: "Adviser Question Pack",
    claim: evidenceText(record, ["question"], "Question to settle before release."),
    owner: evidenceText(record, ["owner", "advisor"]),
    status: evidenceText(record, ["status"], "Gate mapped for adviser answer"),
  };
}

function makePrivateEvidenceRecord(record: RecordLike, fallbackId: string): ReleaseReadinessEvidenceMethodologyRecord {
  return {
    id: evidenceText(record, ["id", "_id"], fallbackId),
    title: evidenceText(record, ["label", "detail", "type"], "Private evidence class"),
    category: evidenceText(record, ["type"], "Private Evidence Class"),
    claim: evidenceText(record, ["release_effect", "source_ref", "detail"], "Private evidence class used to settle release readiness without exposing family identity."),
    owner: evidenceText(record, ["owner"]),
    status: evidenceText(record, ["state", "status"]),
  };
}

function buildEvidenceSectionsForPayload(
  resolved: ResolvedDecisionMemoSurfaceData,
  methodDrivers: ReleaseReadinessMethodDriver[],
): ReleaseReadinessEvidenceMethodologySection[] {
  const preview = evidencePreviewRecord(resolved);
  const legalReferences = asRecord(preview.legal_references);
  const zeroTrust = asRecord(preview.zero_trust_move_intake);
  const ddChecklist = asRecord(preview.dd_checklist);
  const legalTaxRecords: ReleaseReadinessEvidenceMethodologyRecord[] = [];
  const propertyMarketRecords: ReleaseReadinessEvidenceMethodologyRecord[] = [];
  const structuresRecords: ReleaseReadinessEvidenceMethodologyRecord[] = [];
  const familyGovernanceRecords: ReleaseReadinessEvidenceMethodologyRecord[] = [];
  const bankingRecords: ReleaseReadinessEvidenceMethodologyRecord[] = [];
  const releaseRecords: ReleaseReadinessEvidenceMethodologyRecord[] = [];
  const adviserRecords: ReleaseReadinessEvidenceMethodologyRecord[] = [];
  const routeSourceRecords: ReleaseReadinessEvidenceMethodologyRecord[] = [];
  const seen = new Map<string, Set<string>>();
  const seenFor = (key: string) => {
    if (!seen.has(key)) seen.set(key, new Set<string>());
    return seen.get(key)!;
  };

  [
    ...asArray(preview.governing_source_register),
    ...asArray(preview.source_register),
    ...asArray(preview.regulatory_citations),
    ...asArray(legalReferences.sources),
  ].forEach((row, index) => {
    const record = makeSourceEvidenceRecord(row, `source_register_${index + 1}`);
    const haystack = `${record.category} ${record.title} ${record.claim} ${record.institution}`.toLowerCase();
    if (/legal|tax|sdlt|hmrc|gov\.uk|iht|ated|fig|residence|reporting/.test(haystack)) {
      addEvidenceRecord(legalTaxRecords, seenFor("legal_tax"), record);
    } else if (/structure|company|trust|overseas|beneficial|owner|register/.test(haystack)) {
      addEvidenceRecord(structuresRecords, seenFor("structures"), record);
    } else if (/governance|family|succession|fairness|veto|authority/.test(haystack)) {
      addEvidenceRecord(familyGovernanceRecords, seenFor("family"), record);
    } else {
      addEvidenceRecord(propertyMarketRecords, seenFor("property_market"), record);
    }
  });

  [
    ...asArray(ddChecklist.items),
    ...asArray(preview.programmatic_dd_checklist),
    ...asArray(preview.governing_evidence),
  ].forEach((row, index) => {
    const record = makeReleaseEvidenceRecord(row, `release_evidence_${index + 1}`);
    const haystack = `${record.category} ${record.title} ${record.claim} ${record.owner}`.toLowerCase();
    if (/bank|sow|sof|source of wealth|source-of-funds|source evidence|alternate rail|funding rail|fx|transfer/.test(haystack)) {
      addEvidenceRecord(bankingRecords, seenFor("banking"), record);
    } else if (/family|succession|generation|g1|g2|g3|authority|fairness|veto|use-right/.test(haystack)) {
      addEvidenceRecord(familyGovernanceRecords, seenFor("family"), record);
    } else if (/tax|sdlt|residence|reporting|iht|ated|fig/.test(haystack)) {
      addEvidenceRecord(legalTaxRecords, seenFor("legal_tax"), record);
    } else if (/title|property|seller|insurance|carry|market|listing|survey/.test(haystack)) {
      addEvidenceRecord(propertyMarketRecords, seenFor("property_market"), record);
    } else if (/structure|owner|beneficial|entity|company|trust/.test(haystack)) {
      addEvidenceRecord(structuresRecords, seenFor("structures"), record);
    } else {
      addEvidenceRecord(releaseRecords, seenFor("release"), record);
    }
  });

  asArray(preview.counsel_operator_question_pack).forEach((row, index) => {
    addEvidenceRecord(adviserRecords, seenFor("adviser"), makeAdviserEvidenceRecord(row, `adviser_question_${index + 1}`));
  });

  [
    ...asArray(zeroTrust.evidence_records),
    ...asArray(zeroTrust.adviser_confirmations),
    ...asArray(zeroTrust.adviser_asks),
    ...asArray(zeroTrust.records),
  ].forEach((row, index) => {
    const record = makePrivateEvidenceRecord(row, `private_evidence_${index + 1}`);
    const haystack = `${record.category} ${record.title} ${record.claim} ${record.owner}`.toLowerCase();
    if (/bank|rail|fund|source/.test(haystack)) {
      addEvidenceRecord(bankingRecords, seenFor("banking"), record);
    } else if (/tax|sdlt/.test(haystack)) {
      addEvidenceRecord(legalTaxRecords, seenFor("legal_tax"), record);
    } else if (/family|succession|authority|fairness|veto/.test(haystack)) {
      addEvidenceRecord(familyGovernanceRecords, seenFor("family"), record);
    } else {
      addEvidenceRecord(releaseRecords, seenFor("release"), record);
    }
  });

  methodDrivers.forEach((driver, driverIndex) => {
    driver.sources.forEach((source, sourceIndex) => {
      addEvidenceRecord(routeSourceRecords, seenFor("route_sources"), {
        id: source.id || `${driver.id}_source_${sourceIndex + 1}`,
        citationId: source.id,
        title: source.title || `Route source ${driverIndex + 1}.${sourceIndex + 1}`,
        category: "Route Source Review",
        claim: driver.releaseRead || driver.driver || "Source record supports route sequencing and release-gate relevance.",
        date: source.date,
        institution: source.title,
        url: source.url,
      });
    });
  });

  return [
    {
      id: "legal_tax",
      eyebrow: "Legal & Tax Evidence",
      title: "SDLT, residence, IHT, ATED, and reporting sources",
      description: "Official and adviser-facing evidence used to model the direct-buyer control case, surcharge exposure, structure constraints, and tax-reporting boundary.",
      records: legalTaxRecords,
    },
    {
      id: "structures",
      eyebrow: "Structures & Ownership",
      title: "Entity, trustee, beneficial-owner, and register evidence",
      description: "Sources and release records that decide whether a wrapper solves a real non-tax need or adds cost, reporting, bank, and succession drag.",
      records: structuresRecords,
    },
    {
      id: "property_market",
      eyebrow: "Property, Market & Carry",
      title: "Listing, comparable, council-tax, carry, and bid-discipline evidence",
      description: "Evidence used to keep guide price, seller timing, all-in exposure, operating cost, and walk-away logic separate from release authority.",
      records: propertyMarketRecords,
    },
    {
      id: "banking",
      eyebrow: "Banking / SoW / SoF",
      title: "Source-bank, receiving-bank, alternate-rail, FX, and transfer evidence",
      description: "Evidence that proves the move can fund, transfer, clear KYC/SoW/SoF, and survive banking escalation before exchange.",
      records: bankingRecords,
    },
    {
      id: "family_governance",
      eyebrow: "Family Governance & Succession",
      title: "Authority, veto, use-rights, fairness, and generation-continuity evidence",
      description: "Family-side evidence that determines who can see, stop, sign, move, retrieve, and explain the decision after the asset hardens.",
      records: familyGovernanceRecords,
    },
    {
      id: "release_adviser",
      eyebrow: "Adviser & Operator Gates",
      title: "Questions and confirmations gate mapped for release review",
      description: "The counsel/operator question pack that turns the memo into a release rule for property, tax, bank, succession, insurance, and operating desks.",
      records: [...adviserRecords, ...releaseRecords],
    },
    {
      id: "route_sources",
      eyebrow: "Route Source Review",
      title: "Source-review records behind route drivers and failure modes",
      description: "Route-source records explain route sequencing and failure-mode relevance; they are methodology, not legal, tax, title, bank, valuation, or family-authority proof.",
      records: routeSourceRecords,
    },
  ].filter((section) => section.records.length > 0);
}

function buildMethodDriversForPayload(
  route: RouteIntelligenceV2,
  resolved: ResolvedDecisionMemoSurfaceData,
): ReleaseReadinessMethodDriver[] {
  const sourceLookup = buildCastleBriefSourceLookup(resolved);
  return (route.routeDriverRegister?.items ?? []).map((driver, driverIndex) => {
    const driverId = text(driver.id, `method_driver_${driverIndex + 1}`);
    return {
    id: driverId,
    title: sanitizeShareText(driver.title),
    driver: sanitizeShareText(driver.driver),
    releaseRead: sanitizeShareText(driver.releaseRead),
    familyAction: sanitizeShareText(driver.familyAction),
    testApplied: sanitizeShareText(driver.testApplied),
    testResult: sanitizeShareText(driver.testResult),
    principalInstruction: sanitizeShareText(driver.principalInstruction),
    capitalConsequence: sanitizeShareText(driver.capitalConsequence),
    sources: (driver.sources ?? [])
      .slice(0, 4)
      .map((source, sourceIndex) => {
        const hydratedSource = hydrateMethodSource(source, sourceLookup);
        return {
          id: sourceCitationId(hydratedSource) || `${driverId}_source_${sourceIndex + 1}`,
          title: sanitizeShareText(hydratedSource.title ?? hydratedSource.summary ?? `Method source ${sourceIndex + 1}`),
          date: sanitizeShareText(methodSourceDate(hydratedSource.date ?? hydratedSource.source_date)),
          url: sanitizeShareText(hydratedSource.url ?? hydratedSource.source_url),
          summary: sanitizeShareText(hydratedSource.summary),
          castleBrief: methodSourceBrief(hydratedSource),
          decisionPosture: sanitizeShareText(hydratedSource.decision_posture),
          industry: sanitizeShareText(hydratedSource.industry ?? hydratedSource.category),
        };
      })
      .filter((source) => source.id || source.title || source.url),
    };
  });
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
    const isStableCitationId = isRemoteCitationId(id) || /^[a-z0-9][a-z0-9_-]*$/i.test(id);
    if (!isStableCitationId || seen.has(normalized)) return;
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
  const methodDrivers = buildMethodDriversForPayload(route, resolved);
  const citations = collectPayloadCitations(methodDrivers, publicSources);
  const evidenceSections = buildEvidenceSectionsForPayload(resolved, methodDrivers);
  const routeIntelligenceV2 = buildSafeRouteIntelligence(route, reference) as RouteIntelligenceV2;
  const decision = "Approved to negotiate under signed gates; no capital release";
  const releaseRule =
    "Capital remains blocked until title, SDLT, source, bank, authority, family-use, fairness, and decision-memory gates are signed";
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
  const gateRows = gateRowsFromSafeGates(buildSafeGates());
  const privateEvidence = buildPrivateEvidenceForPayload();
  const principalView = buildPrincipalView({
    reference,
    corridor,
    move,
    decision,
    releaseRule,
    purpose,
    capitalRule,
    rationale:
      "Approved to negotiate under signed gates; no capital release. The house is approved for London family use only after title, SDLT, source, bank, authority, family-use, fairness, and decision-memory gates are signed.",
    mitigation: normalizeMitigationTimeline(risk.mitigation_timeline),
    selectedRoute: selectedShareRoute,
    routeOptions,
    gateRows,
    methodDrivers,
    publicSourceCount: publicSources.length,
    privateEvidenceCount: privateEvidence.length,
    methodDriverCount: methodDrivers.length,
    citationCount: citations.length,
  });

  return {
    surfaceContract: SHARE_SURFACE_CONTRACT,
    reference,
    title: sanitizeShareText(route.surfaceTitle ?? "Release Readiness Review"),
    corridor,
    move,
    user_inputs: buildStandaloneUserInputs(resolved, selectedShareRoute, {
      move,
      purpose,
      capitalRule,
    }),
    decision,
    releaseRule,
    purpose,
    capitalRule,
    rationale:
      "Approved to negotiate under signed gates; no capital release. The house is approved for London family use only after title, SDLT, source, bank, authority, family-use, fairness, and decision-memory gates are signed.",
    riskLevel: sanitizeShareText(risk.risk_level),
    mitigation: normalizeMitigationTimeline(risk.mitigation_timeline),
    selectedRoute: selectedShareRoute,
    routeOptions,
    gateRows,
    advanceConditions: releasePacketList(releasePacket.advance_conditions, []),
    holdConditions: releasePacketList(releasePacket.hold_conditions, []),
    stopConditions: releasePacketList(releasePacket.stop_conditions, []),
    publicSources,
    privateEvidence,
    methodDrivers,
    citations,
    reportSections,
    evidenceSections,
    principalView,
    routeIntelligenceV2,
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
