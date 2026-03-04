/**
 * PUPPETEER PRINT PAGE — Decision Memo PDF Rendering
 * Route: /decision-memo-print/[intakeId]
 *
 * This page is rendered by Puppeteer headless Chrome to generate PDFs.
 * It reuses the SAME web components as the audit page (no duplicate tree).
 * All animations are killed via CSS. No interactive elements are rendered.
 *
 * Data flow:
 *   Puppeteer API route → navigates here with cookies forwarded
 *   → print page fetches from /api/decision-memo/{intakeId} (unified endpoint)
 *   → renders all sections → Puppeteer calls page.pdf()
 */

"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// PUPPETEER FIX: Mock IntersectionObserver BEFORE any component mounts
//
// Problem: Headless Puppeteer never scrolls → IntersectionObserver never fires
//   → framer-motion useInView hooks stay false → elements stuck at opacity:0
//   → 21 memo components render as blank → massive blank pages in PDF
//
// Fix: Replace IntersectionObserver with a mock that immediately reports all
// observed elements as intersecting. This runs at module-load time (before
// React hydration), so all useInView hooks see true on their first effect cycle.
// ═══════════════════════════════════════════════════════════════════════════════
if (typeof window !== "undefined") {
  window.IntersectionObserver = class MockIntersectionObserver implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin: string = "0px";
    readonly thresholds: ReadonlyArray<number> = [0];
    private _cb: IntersectionObserverCallback;

    constructor(cb: IntersectionObserverCallback) {
      this._cb = cb;
    }

    observe(target: Element): void {
      // Fire callback immediately so useInView returns true
      queueMicrotask(() => {
        this._cb(
          [
            {
              target,
              isIntersecting: true,
              intersectionRatio: 1,
              boundingClientRect: target.getBoundingClientRect(),
              intersectionRect: target.getBoundingClientRect(),
              rootBounds: null,
              time: performance.now(),
            } as IntersectionObserverEntry,
          ],
          this
        );
      });
    }

    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  };
}

import React, { useState, useEffect, Component, type ReactNode, type ErrorInfo } from "react";
import '@/styles/pdf-print.css';

// Memo section components (same as audit page LEGACY VIEW)
import { MemoCoverPage } from "@/components/decision-memo/memo/MemoCoverPage";
import { AuditOverviewSection } from "@/components/decision-memo/memo/AuditOverviewSection";
import { MemoHeader } from "@/components/decision-memo/memo/MemoHeader";
import { RiskRadarChart } from "@/components/decision-memo/memo/RiskRadarChart";
import { Page2AuditVerdict } from "@/components/decision-memo/memo/Page2AuditVerdict";
import { LiquidityTrapFlowchart } from "@/components/decision-memo/memo/LiquidityTrapFlowchart";
import { CrossBorderTaxAudit } from "@/components/decision-memo/memo/CrossBorderTaxAudit";
import { PeerBenchmarkTicker } from "@/components/decision-memo/memo/PeerBenchmarkTicker";
import { StructureComparisonMatrix } from "@/components/decision-memo/memo/StructureComparisonMatrix";
import { Page1TaxDashboard } from "@/components/decision-memo/memo/Page1TaxDashboard";
import { RegimeIntelligenceSection } from "@/components/decision-memo/memo/RegimeIntelligenceSection";
import { WealthProjectionSection } from "@/components/decision-memo/memo/WealthProjectionSection";
import { Page3PeerIntelligence } from "@/components/decision-memo/memo/Page3PeerIntelligence";
import { HNWITrendsSection } from "@/components/decision-memo/memo/HNWITrendsSection";
import { TransparencyRegimeSection } from "@/components/decision-memo/memo/TransparencyRegimeSection";
import { RealAssetAuditSection } from "@/components/decision-memo/memo/RealAssetAuditSection";
import { CrisisResilienceSection } from "@/components/decision-memo/memo/CrisisResilienceSection";
import { GoldenVisaIntelligenceSection } from "@/components/decision-memo/memo/GoldenVisaIntelligenceSection";
import { GoldenVisaSection } from "@/components/decision-memo/memo/GoldenVisaSection";
import { ScenarioTreeSection } from "@/components/decision-memo/memo/ScenarioTreeSection";
import { HeirManagementSection } from "@/components/decision-memo/memo/HeirManagementSection";
import { Page1TaxDashboard as ImplementationRoadmap } from "@/components/decision-memo/memo/Page1TaxDashboard";
import { ReferencesSection } from "@/components/decision-memo/memo/ReferencesSection";
import { RegulatorySourcesSection } from "@/components/decision-memo/memo/RegulatorySourcesSection";
import { MemoLastPage } from "@/components/decision-memo/memo/MemoLastPage";

// Data assembly helpers (same as audit page)
import { assembleCrossBorderAudit } from "@/lib/decision-memo/assemble-cross-border-audit";
import type { ViaNegativaContext } from "@/lib/decision-memo/memo-types";

// ═══════════════════════════════════════════════════════════════════════════════
// ERROR BOUNDARY — catches rendering crashes so Puppeteer gets diagnostic info
// ═══════════════════════════════════════════════════════════════════════════════

class PrintErrorBoundary extends Component<
  { children: ReactNode; sectionName?: string; isRoot?: boolean },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: ReactNode; sectionName?: string; isRoot?: boolean }) {
    super(props);
    this.state = { hasError: false, error: "" };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error: Error) {
    // Only the root boundary should signal data-loaded on crash
    // Section boundaries just log — the page keeps rendering other sections
    if (this.props.isRoot) {
      document.body.setAttribute("data-error", `${this.props.sectionName}: ${error.message}`);
      document.body.setAttribute("data-loaded", "true");
    }
    console.error(`[PrintErrorBoundary:${this.props.sectionName}]`, error.message);
  }

  render() {
    if (this.state.hasError) {
      // For section-level boundaries, render nothing (skip broken section)
      // For root boundary, show the error message
      if (!this.props.isRoot) return null;
      return (
        <div style={{ padding: 52, color: "#EF4444", fontSize: 12, borderBottom: "1px solid #262626" }}>
          <p>[Section render error: {this.props.sectionName}]</p>
          <p style={{ fontSize: 10, color: "#666" }}>{this.state.error}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

interface PageProps {
  params: {
    intakeId: string;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATA TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface MemoData {
  success?: boolean;
  preview_data: Record<string, any>;
  memo_data?: Record<string, any>;
  generated_at?: string;
  full_memo_url?: string;
  via_negativa?: any;
  [key: string]: any;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RISK RADAR SCORE BUILDER (same logic as audit page lines 1745-1816)
// ═══════════════════════════════════════════════════════════════════════════════

function buildRiskRadarScores(
  doctrineMetadata: any,
  isViaNegativa: boolean
): { scores: any[]; antifragilityAssessment: string; failureModeCount: number; totalRiskFlags: number } | null {
  if (!doctrineMetadata) return null;

  const failureModes = doctrineMetadata.failure_modes || [];
  const assessment = doctrineMetadata.antifragility_assessment || "";
  const isRuinExposed = assessment === "RUIN_EXPOSED";
  const isFrag = assessment === "FRAGILE";
  const baseline = isViaNegativa ? (isRuinExposed ? 3 : isFrag ? 4 : 5) : 7;

  function calcScore(keywords: string[]): number {
    let score = baseline;
    let matched = false;
    failureModes.forEach((f: any) => {
      const allText = `${(f.mode || "").toUpperCase()} ${(f.description || "").toUpperCase()} ${(f.doctrine_book || "").toUpperCase()}`;
      if (keywords.some((k) => allText.includes(k))) {
        matched = true;
        const sev = (f.severity || "").toUpperCase();
        score -= sev === "CRITICAL" ? 4 : sev === "HIGH" ? 3 : sev === "MEDIUM" ? 2 : 1;
      }
    });
    if (!matched && isViaNegativa) score += 1;
    return Math.max(0, Math.min(10, score));
  }

  const antifragilityScore =
    doctrineMetadata.antifragility_score != null
      ? Math.round(doctrineMetadata.antifragility_score / 10)
      : calcScore(["ANTIFRAGIL", "FRAGIL", "RUIN", "STRESS", "CRISIS", "RESILIEN", "SHOCK"]);

  const liquidityScore = calcScore(["LIQUID", "PRISON", "TRAP", "LOCK", "EXIT", "ABSD", "STAMP", "BARRIER", "FROZEN", "ILLIQUID", "FOREIGN_OWNER", "ACQUISITION"]);
  const regulatoryScore = calcScore(["REGULAT", "COMPLIANCE", "FBAR", "FATCA", "PFIC", "TAX_DRAG", "PENALTY", "REPORT", "FILING", "SANCTION", "WORLDWIDE", "DRAGNET"]);

  const assetKeywords = ["ASSET_QUALITY", "OVERVAL", "BUBBLE", "DEPRECIAT", "DEFECT", "TITLE"];
  const assetRaw = calcScore(assetKeywords);
  const hasAssetFailures = failureModes.some((f: any) =>
    assetKeywords.some((k) => ((f.mode || "") + " " + (f.description || "")).toUpperCase().includes(k))
  );
  const finalAssetScore = hasAssetFailures ? assetRaw : Math.min(10, Math.max(8, baseline + 3));

  const operatorScore = calcScore(["OPERATOR", "BEHAVIO", "DECISION", "BIAS", "KAHNEMAN", "HALLUCIN", "DELUSION", "EXPECT", "PROJEC", "OVERCONFID"]);
  const valuationScore = calcScore(["VALUATION", "PRICE", "COST", "NPV", "NEGATIVE", "OVERVAL", "DAY_ONE", "CAPITAL_DESTROY", "LOSS", "PREMIUM", "SURCHARGE", "OVERPAY"]);

  return {
    scores: [
      { label: "Antifragility", shortLabel: "Antifragile", score: antifragilityScore, maxScore: 10 },
      { label: "Liquidity", shortLabel: "Liquidity", score: liquidityScore, maxScore: 10 },
      { label: "Regulatory", shortLabel: "Regulatory", score: regulatoryScore, maxScore: 10 },
      { label: "Asset Quality", shortLabel: "Asset", score: finalAssetScore, maxScore: 10 },
      { label: "Operator", shortLabel: "Operator", score: operatorScore, maxScore: 10 },
      { label: "Valuation", shortLabel: "Valuation", score: valuationScore, maxScore: 10 },
    ],
    antifragilityAssessment: assessment,
    failureModeCount: doctrineMetadata.failure_mode_count || failureModes.length,
    totalRiskFlags: doctrineMetadata.risk_flags_total || 0,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIA NEGATIVA CONTEXT BUILDER (same logic as audit page lines 1419-1526)
// ═══════════════════════════════════════════════════════════════════════════════

function buildViaNegativaContext(
  memoData: MemoData,
  crossBorderAudit: any,
  showTheoreticalTaxSavings: boolean
): ViaNegativaContext | undefined {
  const structureVerdict = memoData.preview_data.structure_optimization?.verdict;
  if (structureVerdict !== "DO_NOT_PROCEED") return undefined;

  const backendVN = memoData.preview_data?.via_negativa || memoData.via_negativa;
  const acquisitionAudit = crossBorderAudit?.acquisition_audit;
  const propertyValue = acquisitionAudit?.property_value || 0;
  const totalAcquisitionCost = acquisitionAudit?.total_acquisition_cost || 0;

  const dayOneLossPct = backendVN?.day_one_loss_pct || acquisitionAudit?.day_one_loss_pct || 0;
  const dayOneLossAmount = backendVN?.day_one_loss_amount || totalAcquisitionCost - propertyValue;

  let totalConfiscationExposure = backendVN?.total_regulatory_exposure ?? 0;
  if (!totalConfiscationExposure) {
    const warnings = crossBorderAudit?.warnings || [];
    warnings.forEach((w: string) => {
      const match = w.match(/\$[\d,]+(?:\.\d+)?/g);
      if (match) {
        match.forEach((m: string) => {
          const val = parseFloat(m.replace(/[$,]/g, ""));
          if (!isNaN(val) && val > totalConfiscationExposure) totalConfiscationExposure = val;
        });
      }
    });
  }

  const hdr = backendVN?.header;
  const sc = backendVN?.scenario_section;
  const tx = backendVN?.tax_section;
  const vs = backendVN?.verdict_section;
  const cta = backendVN?.cta;
  const metrics = backendVN?.metrics;
  const precedents = memoData.memo_data?.kgv3_intelligence_used?.precedents ?? 0;

  return {
    isActive: true,
    dayOneLoss: dayOneLossPct,
    dayOneLossAmount,
    totalConfiscationExposure,
    taxEfficiencyPassed: backendVN?.tax_efficiency_passed ?? (showTheoreticalTaxSavings && (crossBorderAudit?.total_tax_savings_pct || 0) > 0),
    liquidityPassed: backendVN?.liquidity_passed ?? dayOneLossPct < 10,
    structurePassed: backendVN?.structure_passed ?? false,
    analysisPosture: backendVN?.analysis_posture || "Via Negativa: Strengths acknowledged. Weaknesses stated without qualification.",
    badgeLabel: hdr?.badge_label || "ELEVATED RISK",
    titlePrefix: hdr?.title_prefix || "Capital At",
    titleHighlight: hdr?.title_highlight || "Risk",
    noticeTitle: hdr?.notice_title || "Elevated Risk Advisory",
    noticeBody: (hdr?.notice_body || "Analysis of {precedentCount}+ corridor signals identified {dayOneLoss}% Day-One capital exposure.")
      .replace("{dayOneLoss}", dayOneLossPct.toFixed(2))
      .replace("{precedentCount}", precedents.toLocaleString()),
    metricLabels: {
      capitalExposure: metrics?.[0]?.label || "Day-One Capital Exposure",
      structureVerdict: metrics?.[1]?.label || "Structure Verdict",
      structureVerdictValue: metrics?.[1]?.value || "Not Recommended",
      structureVerdictDesc: metrics?.[1]?.description || "Negative NPV across analyzed structures",
      regulatoryExposure: metrics?.[2]?.label || "Regulatory Exposure",
      regulatoryExposureDesc: metrics?.[2]?.description || "FBAR + compliance penalties",
    },
    scenarioHeader: sc?.header || "Projection Audit",
    expectationLabel: sc?.expectation_label || "Your Projection",
    actualLabel: sc?.actual_label || "Market Data",
    commentaryTitle: sc?.commentary_title || "Reality Gap Analysis",
    commentaryBody: sc?.commentary_body || "Your projected returns deviate from verified market data in key areas.",
    taxBadgeLabel: tx?.badge_label || "Regulatory Exposure Analysis",
    taxTitleLine1: tx?.title_line1 || "Regulatory",
    taxTitleLine2: tx?.title_line2 || "Exposure",
    compliancePrefix: tx?.compliance_prefix ?? "",
    warningPrefix: tx?.warning_prefix || "Regulatory Flag",
    verdictHeader: vs?.header || "Structural Review",
    verdictBadgeLabel: vs?.badge_label || "Capital Allocation Review",
    stampText: vs?.stamp_text || "Allocation Not Recommended",
    stampSubtext: vs?.stamp_subtext || "Key viability thresholds not met in this structure",
    ctaHeadline: cta?.headline || "",
    ctaBody: (cta?.body_template || "").replace("{dayOneLoss}", dayOneLossPct.toFixed(2)),
    ctaScarcity: cta?.scarcity_text || "",
    ctaButtonText: cta?.button_text || "",
    ctaButtonUrl: cta?.button_url || "",
    ctaContextNote: cta?.context_note || "",
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPERT DATA MERGE (same logic as audit page lines 1250-1380)
// Ensures all expert sections are populated from wherever the backend stores them
// ═══════════════════════════════════════════════════════════════════════════════

function mergeExpertData(data: MemoData): MemoData {
  const pd = { ...data.preview_data };
  const md = data.memo_data || {};
  const fa = (data as any).full_artifact || {};

  // Expert 7: Transparency Regime
  if (!pd.transparency_regime_impact) pd.transparency_regime_impact = md.transparency_regime_impact || data.transparency_regime_impact;
  if (!pd.transparency_data) pd.transparency_data = md.transparency_data || data.transparency_data;

  // Expert 8: Crisis Resilience
  if (!pd.crisis_resilience_stress_test) pd.crisis_resilience_stress_test = md.crisis_resilience_stress_test || data.crisis_resilience_stress_test;
  if (!pd.crisis_data) pd.crisis_data = md.crisis_data || data.crisis_data;

  // Expert 9: Peer Intelligence
  if (!pd.peer_intelligence_analysis) pd.peer_intelligence_analysis = md.peer_intelligence_analysis || data.peer_intelligence_analysis;
  if (!pd.peer_intelligence_data) pd.peer_intelligence_data = md.peer_intelligence_data || data.peer_intelligence_data;

  // Expert 10: Market Dynamics
  if (!pd.market_dynamics_analysis) pd.market_dynamics_analysis = md.market_dynamics_analysis || data.market_dynamics_analysis;
  if (!pd.market_dynamics_data) pd.market_dynamics_data = md.market_dynamics_data || data.market_dynamics_data;

  // Expert 11: Implementation Roadmap
  if (!pd.implementation_roadmap_data) pd.implementation_roadmap_data = md.implementation_roadmap_data || data.implementation_roadmap_data;

  // Expert 12: Due Diligence
  if (!pd.due_diligence_data) pd.due_diligence_data = md.due_diligence_data || data.due_diligence_data;

  // HNWI Trends
  if (!pd.hnwi_trends_analysis) pd.hnwi_trends_analysis = md.hnwi_trends_analysis || data.hnwi_trends_analysis;

  // Risk Assessment (MCP fields)
  if (!pd.risk_assessment && data.risk_assessment) pd.risk_assessment = data.risk_assessment;

  // All Mistakes
  if (data.all_mistakes && (data.all_mistakes as any[]).length > 0) pd.all_mistakes = data.all_mistakes;

  // SFO-Grade Expert Data (Experts 13-15)
  if (!pd.heir_management_data || Object.keys(pd.heir_management_data).length === 0) {
    pd.heir_management_data = md.heir_management_data || fa.heir_management_data || data.heir_management_data;
    pd.heir_management_analysis = md.heir_management_analysis || fa.heir_management_analysis || data.heir_management_analysis;
  }
  if (!pd.wealth_projection_data || Object.keys(pd.wealth_projection_data).length === 0) {
    pd.wealth_projection_data = md.wealth_projection_data || fa.wealth_projection_data || data.wealth_projection_data;
    pd.wealth_projection_analysis = md.wealth_projection_analysis || fa.wealth_projection_analysis || data.wealth_projection_analysis;
  }
  if (!pd.scenario_tree_data || Object.keys(pd.scenario_tree_data).length === 0) {
    pd.scenario_tree_data = md.scenario_tree_data || fa.scenario_tree_data || data.scenario_tree_data;
    pd.scenario_tree_analysis = md.scenario_tree_analysis || fa.scenario_tree_analysis || data.scenario_tree_analysis;
  }

  // Golden Visa / Destination Drivers
  if (!pd.destination_drivers || !pd.destination_drivers.visa_programs) {
    pd.destination_drivers = md.destination_drivers || fa.destination_drivers || data.destination_drivers;
  }

  return { ...data, preview_data: pd };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRINT PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function DecisionMemoPrintPage({ params }: PageProps) {
  const { intakeId } = params;
  const [memoData, setMemoData] = useState<MemoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch memo data
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/decision-memo/${intakeId}`);
        if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
        const data = await response.json();
        if (!data.success && !data.preview_data) throw new Error("Invalid data");

        // Merge expert data from all possible locations
        const merged = mergeExpertData(data);

        // Assemble cross-border audit if missing
        if (
          merged.preview_data?.wealth_projection_data?.starting_position &&
          !merged.preview_data.wealth_projection_data.starting_position.cross_border_audit_summary
        ) {
          const assembled = assembleCrossBorderAudit(
            merged.preview_data,
            merged.preview_data.wealth_projection_data.starting_position,
            merged.preview_data.real_asset_audit
          );
          if (assembled) {
            merged.preview_data.wealth_projection_data.starting_position.cross_border_audit_summary = assembled;
          }
        }

        setMemoData(merged);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load data";
        setError(msg);
        // Signal Puppeteer even on error so it doesn't hang
        document.body.setAttribute("data-error", msg);
        document.body.setAttribute("data-loaded", "true");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [intakeId]);

  // Signal Puppeteer that content is loaded
  useEffect(() => {
    if (memoData && !isLoading) {
      // Delay to let React finish rendering all sections
      const timer = setTimeout(() => {
        document.body.setAttribute("data-loaded", "true");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [memoData, isLoading]);

  // Loading / Error states (Puppeteer will wait for data-loaded)
  if (isLoading) {
    return (
      <div className="print-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <p style={{ color: "#A3A3A3", fontSize: 14 }}>Loading audit data...</p>
      </div>
    );
  }

  if (error || !memoData) {
    return (
      <div className="print-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <p style={{ color: "#EF4444", fontSize: 14 }}>Error: {error || "No data"}</p>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // DERIVED STATE (same as audit page)
  // ═══════════════════════════════════════════════════════════════════════

  const crossBorderAudit = memoData.preview_data.wealth_projection_data?.starting_position?.cross_border_audit_summary;
  const hasCrossBorderAudit = !!crossBorderAudit;
  const hasUSWorldwideTax = crossBorderAudit?.compliance_flags?.includes("US_WORLDWIDE_TAXATION");
  const showTheoreticalTaxSavings = memoData.preview_data.show_tax_savings !== false && !hasUSWorldwideTax;
  const isViaNegativa = memoData.preview_data.structure_optimization?.verdict === "DO_NOT_PROCEED";
  const viaNegativaContext = buildViaNegativaContext(memoData, crossBorderAudit, showTheoreticalTaxSavings);

  // Risk Radar scores
  const doctrineMetadata = memoData.preview_data.scenario_tree_data?.doctrine_metadata;
  const riskRadar = buildRiskRadarScores(doctrineMetadata, isViaNegativa);

  // Liquidity trap data
  const acqAudit = crossBorderAudit?.acquisition_audit;
  const hasLiquidityTrap = !!acqAudit;
  const liquidityTrapProps = hasLiquidityTrap
    ? (() => {
        const propertyValue = acqAudit.property_value || 0;
        const totalCost = acqAudit.total_acquisition_cost || 0;
        const absd = acqAudit.absd_additional_stamp_duty || 0;
        const bsd = acqAudit.bsd_stamp_duty || 0;
        const hasMajorABSD = absd > 0;
        return {
          capitalIn: totalCost,
          capitalOut: propertyValue,
          primaryBarrier: hasMajorABSD ? `ABSD (${((absd / propertyValue) * 100).toFixed(0)}%)` : "Stamp Duties",
          primaryBarrierCost: hasMajorABSD ? absd : absd + bsd,
          secondaryBarrier: hasMajorABSD ? (bsd > 0 ? "BSD + Transfer Taxes" : hasUSWorldwideTax ? "US Worldwide Tax Drag" : undefined) : hasUSWorldwideTax ? "US Worldwide Tax Drag" : undefined,
          secondaryBarrierCost: hasMajorABSD ? (bsd > 0 ? bsd + Math.max(0, totalCost - propertyValue - absd - bsd) : 0) : 0,
          dayOneLossPct: acqAudit.day_one_loss_pct || viaNegativaContext?.dayOneLoss || 0,
          assetLabel: `${memoData.preview_data.destination_jurisdiction || "Destination"} Residential Property`,
        };
      })()
    : null;

  // Peer benchmark data
  const peerBenchmarkData = (() => {
    if (!doctrineMetadata?.failure_modes?.length) return null;
    const precedentCount = memoData.memo_data?.kgv3_intelligence_used?.precedents || 0;
    if (precedentCount === 0) return null;
    return {
      precedentCount,
      failurePatterns: (doctrineMetadata.failure_modes || []).map((f: any) => ({
        mode: f.mode || "",
        doctrinBook: f.doctrine_book || "",
        severity: f.severity || "MEDIUM",
        description: f.description || "",
        nightmareName: f.nightmare_name,
      })),
      failureModeCount: doctrineMetadata.failure_mode_count || doctrineMetadata.failure_modes.length,
      totalRiskFlags: doctrineMetadata.risk_flags_total || 0,
    };
  })();

  const legalReferences = memoData.preview_data.legal_references;
  const regulatoryCitations = memoData.preview_data?.regulatory_citations || legalReferences?.regulatory_sources || [];

  // No-op citation handler (citations not interactive in print)
  const noop = () => {};
  const emptyCitationMap = new Map<string, number>();

  return (
    <PrintErrorBoundary sectionName="Root" isRoot>
    <div className="dark print-container bg-background text-foreground">
      {/* CONFIDENTIAL watermark */}
      <div className="print-watermark" aria-hidden="true">CONFIDENTIAL</div>
      <div className="print-hc-badge" aria-hidden="true">HC</div>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 1: COVER PAGE
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="print-section" style={{ padding: 0 }}>
        <PrintErrorBoundary sectionName="CoverPage">
        <MemoCoverPage
          intakeId={intakeId}
          sourceJurisdiction={memoData.preview_data.source_jurisdiction}
          destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
          generatedAt={memoData.generated_at}
          exposureClass={memoData.preview_data.exposure_class}
          totalSavings={memoData.preview_data.total_savings}
          viaNegativa={viaNegativaContext}
        />
        </PrintErrorBoundary>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 2: STRATEGIC OVERVIEW + EXECUTIVE SUMMARY
          Combined into one section so Intelligence Basis + MemoHeader
          share pages instead of each wasting a full page.
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="print-section">
        <div className="print-page-header">
          <span>HNWI Chronicles</span>
          <span>SFO Decision Memorandum</span>
        </div>
<PrintErrorBoundary sectionName="StrategicOverview">
        <AuditOverviewSection
          developmentsCount={memoData.preview_data.hnwi_world_count || 1966}
          precedentCount={memoData.memo_data?.kgv3_intelligence_used?.precedents || 0}
          sourceJurisdiction={memoData.preview_data.source_jurisdiction}
          destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
          sourceCity={memoData.preview_data.source_city}
          destinationCity={memoData.preview_data.destination_city}
          thesisSummary={memoData.preview_data.thesis_summary || memoData.preview_data.decision_thesis}
          exposureClass={memoData.preview_data.exposure_class}
          totalSavings={memoData.preview_data.total_savings}
          optimalStructure={memoData.preview_data.structure_optimization?.optimal_structure}
          verdict={memoData.preview_data.structure_optimization?.verdict}
          fullThesis={memoData.preview_data.thesis || memoData.preview_data.decision_context || memoData.preview_data.user_input}
          showMap={false}
        />
        </PrintErrorBoundary>
<PrintErrorBoundary sectionName="ExecutiveSummary">
        <MemoHeader
          intakeId={intakeId}
          generatedAt={memoData.generated_at}
          exposureClass={memoData.preview_data.exposure_class}
          totalSavings={memoData.preview_data.total_savings}
          precedentCount={memoData.memo_data?.kgv3_intelligence_used?.precedents || 0}
          sourceJurisdiction={memoData.preview_data.source_jurisdiction}
          destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
          sourceTaxRates={memoData.preview_data.source_tax_rates || memoData.preview_data.tax_differential?.source}
          destinationTaxRates={memoData.preview_data.destination_tax_rates || memoData.preview_data.tax_differential?.destination}
          taxDifferential={memoData.preview_data.tax_differential}
          valueCreation={{
            ...memoData.preview_data.value_creation,
            ...(memoData.preview_data.annual_rental_income !== undefined || memoData.preview_data.annual_appreciation !== undefined
              ? {
                  annual: {
                    rental: memoData.preview_data.annual_rental_income,
                    rental_formatted: memoData.preview_data.annual_rental_income_formatted,
                    appreciation: memoData.preview_data.annual_appreciation,
                    appreciation_formatted: memoData.preview_data.annual_appreciation_formatted,
                    total: memoData.preview_data.annual_value,
                    total_formatted: memoData.preview_data.annual_value_formatted,
                  },
                }
              : {}),
          }}
          crossBorderTaxSavingsPct={crossBorderAudit?.total_tax_savings_pct}
          crossBorderComplianceFlags={crossBorderAudit?.compliance_flags}
          showTaxSavings={showTheoreticalTaxSavings}
          optimalStructure={memoData.preview_data.structure_optimization?.optimal_structure}
          verdict={memoData.preview_data.structure_optimization?.verdict}
          viaNegativa={viaNegativaContext}
        />
        </PrintErrorBoundary>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 4: RISK RADAR (conditional)
          ═══════════════════════════════════════════════════════════════════ */}
      {riskRadar && riskRadar.scores.length > 0 && (
        <section className="print-section">
          <div className="print-page-header">
            <span>HNWI Chronicles</span>
            <span>SFO Decision Memorandum</span>
          </div>
  <PrintErrorBoundary sectionName="RiskRadar">
        <RiskRadarChart
            scores={riskRadar.scores}
            antifragilityAssessment={riskRadar.antifragilityAssessment}
            failureModeCount={riskRadar.failureModeCount}
            totalRiskFlags={riskRadar.totalRiskFlags}
            isVetoed={isViaNegativa}
          />
        </PrintErrorBoundary>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 5: RISK ASSESSMENT & VERDICT
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="print-section">
        <div className="print-page-header">
          <span>HNWI Chronicles</span>
          <span>SFO Decision Memorandum</span>
        </div>
<PrintErrorBoundary sectionName="RiskVerdict">
        <Page2AuditVerdict
          mistakes={memoData.preview_data.all_mistakes}
          opportunitiesCount={memoData.preview_data.opportunities_count}
          precedentCount={memoData.memo_data?.kgv3_intelligence_used?.precedents || 0}
          ddChecklist={memoData.preview_data.dd_checklist}
          sourceJurisdiction={memoData.preview_data.source_jurisdiction}
          destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
          dataQuality={memoData.preview_data.peer_cohort_stats?.data_quality}
          dataQualityNote={memoData.preview_data.peer_cohort_stats?.data_quality_note}
          mitigationTimeline={memoData.preview_data.risk_assessment?.mitigation_timeline}
          riskAssessment={memoData.preview_data.risk_assessment}
          viaNegativa={isViaNegativa ? viaNegativaContext : undefined}
        />
        </PrintErrorBoundary>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 6: LIQUIDITY TRAP (conditional)
          ═══════════════════════════════════════════════════════════════════ */}
      {liquidityTrapProps && (
        <section className="print-section">
          <div className="print-page-header">
            <span>HNWI Chronicles</span>
            <span>SFO Decision Memorandum</span>
          </div>
  <PrintErrorBoundary sectionName="LiquidityTrap">
        <LiquidityTrapFlowchart {...liquidityTrapProps} />
        </PrintErrorBoundary>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 7: CROSS-BORDER TAX AUDIT (conditional)
          ═══════════════════════════════════════════════════════════════════ */}
      {hasCrossBorderAudit && (
        <section className="print-section">
          <div className="print-page-header">
            <span>HNWI Chronicles</span>
            <span>SFO Decision Memorandum</span>
          </div>
  <PrintErrorBoundary sectionName="CrossBorderTax">
        <CrossBorderTaxAudit
            audit={crossBorderAudit}
            sourceJurisdiction={memoData.preview_data.source_jurisdiction}
            destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
            viaNegativa={viaNegativaContext}
          />
        </PrintErrorBoundary>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 8: PEER BENCHMARK (conditional)
          ═══════════════════════════════════════════════════════════════════ */}
      {peerBenchmarkData && (
        <section className="print-section">
          <div className="print-page-header">
            <span>HNWI Chronicles</span>
            <span>SFO Decision Memorandum</span>
          </div>
  <PrintErrorBoundary sectionName="PeerBenchmark">
        <PeerBenchmarkTicker
            {...peerBenchmarkData}
            sourceJurisdiction={memoData.preview_data.source_jurisdiction}
            destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
            antifragilityAssessment={doctrineMetadata?.antifragility_assessment}
            patternIntelligence={memoData.preview_data.pattern_intelligence}
          />
        </PrintErrorBoundary>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 9: STRUCTURE COMPARISON (conditional)
          ═══════════════════════════════════════════════════════════════════ */}
      {memoData.preview_data.structure_optimization && (
        <section className="print-section">
          <div className="print-page-header">
            <span>HNWI Chronicles</span>
            <span>SFO Decision Memorandum</span>
          </div>
  <PrintErrorBoundary sectionName="StructureComparison">
        <StructureComparisonMatrix
            structureOptimization={memoData.preview_data.structure_optimization}
            sourceJurisdiction={memoData.preview_data.source_jurisdiction}
            destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
          />
        </PrintErrorBoundary>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 10: TAX JURISDICTION ANALYSIS
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="print-section">
        <div className="print-page-header">
          <span>HNWI Chronicles</span>
          <span>SFO Decision Memorandum</span>
        </div>
<PrintErrorBoundary sectionName="TaxDashboard">
        <Page1TaxDashboard
          totalSavings={memoData.preview_data.total_savings}
          exposureClass={memoData.preview_data.exposure_class}
          sourceJurisdiction={memoData.preview_data.source_jurisdiction}
          destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
          sourceCity={memoData.preview_data.source_city}
          destinationCity={memoData.preview_data.destination_city}
          executionSequence={memoData.preview_data.execution_sequence}
          sourceTaxRates={memoData.preview_data.source_tax_rates || memoData.preview_data.tax_differential?.source}
          destinationTaxRates={memoData.preview_data.destination_tax_rates || memoData.preview_data.tax_differential?.destination}
          taxDifferential={memoData.preview_data.tax_differential}
          sections={["tax"]}
          showTaxSavings={showTheoreticalTaxSavings}
        />
        </PrintErrorBoundary>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 11: REGIME INTELLIGENCE (conditional)
          ═══════════════════════════════════════════════════════════════════ */}
      {memoData.preview_data.regime_intelligence?.has_special_regime && (
        <section className="print-section">
          <div className="print-page-header">
            <span>HNWI Chronicles</span>
            <span>SFO Decision Memorandum</span>
          </div>
  <PrintErrorBoundary sectionName="RegimeIntelligence">
        <RegimeIntelligenceSection
            regimeIntelligence={memoData.preview_data.regime_intelligence}
            sourceJurisdiction={memoData.preview_data.source_jurisdiction}
            destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
          />
        </PrintErrorBoundary>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 12: 10-YEAR WEALTH PROJECTION (conditional)
          ═══════════════════════════════════════════════════════════════════ */}
      {(memoData.preview_data.wealth_projection_analysis ||
        (memoData.preview_data.wealth_projection_data && Object.keys(memoData.preview_data.wealth_projection_data).length > 0)) && (
        <section className="print-section">
          <div className="print-page-header">
            <span>HNWI Chronicles</span>
            <span>SFO Decision Memorandum</span>
          </div>
  <PrintErrorBoundary sectionName="WealthProjection">
        <WealthProjectionSection
            data={memoData.preview_data.wealth_projection_data || {}}
            rawAnalysis={memoData.preview_data.wealth_projection_analysis}
            structures={memoData.preview_data.structure_optimization?.structures_analyzed || []}
            structureProjections={memoData.preview_data.structure_projections || {}}
            optimalStructureName={memoData.preview_data.structure_optimization?.optimal_structure?.name}
          />
        </PrintErrorBoundary>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 13: PEER INTELLIGENCE
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="print-section">
        <div className="print-page-header">
          <span>HNWI Chronicles</span>
          <span>SFO Decision Memorandum</span>
        </div>
<PrintErrorBoundary sectionName="PeerIntelligence">
        <Page3PeerIntelligence
          opportunities={memoData.preview_data.all_opportunities}
          peerCount={memoData.preview_data.peer_cohort_stats?.total_peers || 0}
          onCitationClick={noop}
          citationMap={emptyCitationMap}
          sourceJurisdiction={memoData.preview_data.source_jurisdiction}
          destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
          sourceCountry={memoData.preview_data.source_country}
          destinationCountry={memoData.preview_data.destination_country}
          sourceCity={memoData.preview_data.source_city}
          destinationCity={memoData.preview_data.destination_city}
          peerCohortStats={memoData.preview_data.peer_cohort_stats}
          capitalFlowData={memoData.preview_data.capital_flow_data}
          sections={["drivers", "peer", "corridor"]}
          isRelocating={memoData.preview_data.peer_cohort_stats?.is_relocating ?? memoData.preview_data.is_relocating ?? false}
        />
        </PrintErrorBoundary>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 14: HNWI MIGRATION TRENDS (conditional)
          ═══════════════════════════════════════════════════════════════════ */}
      {memoData.preview_data.hnwi_trends && memoData.preview_data.hnwi_trends.length > 0 && (
        <section className="print-section">
          <div className="print-page-header">
            <span>HNWI Chronicles</span>
            <span>SFO Decision Memorandum</span>
          </div>
  <PrintErrorBoundary sectionName="HNWITrends">
        <HNWITrendsSection
            trends={memoData.preview_data.hnwi_trends}
            confidence={memoData.preview_data.hnwi_trends_confidence}
            dataQuality={memoData.preview_data.hnwi_trends_data_quality}
            citations={memoData.preview_data.hnwi_trends_citations}
            sourceJurisdiction={memoData.preview_data.source_jurisdiction}
            destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
            sourceCountry={memoData.preview_data.source_country}
            destinationCountry={memoData.preview_data.destination_country}
          />
        </PrintErrorBoundary>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 15: GEOGRAPHIC OPPORTUNITIES
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="print-section">
        <div className="print-page-header">
          <span>HNWI Chronicles</span>
          <span>SFO Decision Memorandum</span>
        </div>
<PrintErrorBoundary sectionName="PeerIntelligence">
        <Page3PeerIntelligence
          opportunities={memoData.preview_data.all_opportunities}
          peerCount={memoData.preview_data.peer_cohort_stats?.total_peers || 0}
          onCitationClick={noop}
          citationMap={emptyCitationMap}
          sourceJurisdiction={memoData.preview_data.source_jurisdiction}
          destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
          sourceCountry={memoData.preview_data.source_country}
          destinationCountry={memoData.preview_data.destination_country}
          sourceCity={memoData.preview_data.source_city}
          destinationCity={memoData.preview_data.destination_city}
          peerCohortStats={memoData.preview_data.peer_cohort_stats}
          capitalFlowData={memoData.preview_data.capital_flow_data}
          sections={["geographic"]}
          isRelocating={memoData.preview_data.peer_cohort_stats?.is_relocating ?? memoData.preview_data.is_relocating ?? false}
        />
        </PrintErrorBoundary>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 16: TRANSPARENCY REGIME (conditional)
          Guard mirrors component's internal null check (line 185-191):
          component returns null when no reporting_triggers, no compliance_risks,
          and no meaningful text content. Prevents blank page in PDF.
          ═══════════════════════════════════════════════════════════════════ */}
      {((() => {
        const td = memoData.preview_data.transparency_data;
        const content = memoData.preview_data.transparency_regime_impact;
        const hasStructuredData = (td?.reporting_triggers?.length > 0) || (td?.compliance_risks?.length > 0);
        const hasContent = content && content !== 'N/A' && String(content).length >= 50;
        return hasStructuredData || hasContent;
      })()) && (
        <section className="print-section">
          <div className="print-page-header">
            <span>HNWI Chronicles</span>
            <span>SFO Decision Memorandum</span>
          </div>
  <PrintErrorBoundary sectionName="TransparencyRegime">
        <TransparencyRegimeSection
            transparencyData={memoData.preview_data.transparency_data}
            content={memoData.preview_data.transparency_regime_impact}
            sourceJurisdiction={memoData.preview_data.source_jurisdiction}
            destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
          />
        </PrintErrorBoundary>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 17: REAL ASSET AUDIT (conditional)
          ═══════════════════════════════════════════════════════════════════ */}
      {memoData.preview_data.real_asset_audit && (
        <section className="print-section">
          <div className="print-page-header">
            <span>HNWI Chronicles</span>
            <span>SFO Decision Memorandum</span>
          </div>
  <PrintErrorBoundary sectionName="RealAssetAudit">
        <RealAssetAuditSection
            data={memoData.preview_data.real_asset_audit}
            sourceJurisdiction={memoData.preview_data.source_jurisdiction}
            destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
            transactionValue={
              memoData.preview_data.deal_overview?.target_size
                ? parseFloat(memoData.preview_data.deal_overview.target_size.replace(/[^0-9.]/g, "")) * 1000000
                : 0
            }
          />
        </PrintErrorBoundary>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 18: CRISIS RESILIENCE (conditional)
          ═══════════════════════════════════════════════════════════════════ */}
      {(memoData.preview_data.crisis_data || memoData.preview_data.crisis_resilience_stress_test) && (
        <section className="print-section">
          <div className="print-page-header">
            <span>HNWI Chronicles</span>
            <span>SFO Decision Memorandum</span>
          </div>
  <PrintErrorBoundary sectionName="CrisisResilience">
        <CrisisResilienceSection
            crisisData={memoData.preview_data.crisis_data}
            content={memoData.preview_data.crisis_resilience_stress_test}
            sourceJurisdiction={memoData.preview_data.source_jurisdiction}
            destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
          />
        </PrintErrorBoundary>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 19: GOLDEN VISA (conditional)
          ═══════════════════════════════════════════════════════════════════ */}
      {memoData.preview_data.golden_visa_intelligence ? (
        <section className="print-section">
          <div className="print-page-header">
            <span>HNWI Chronicles</span>
            <span>SFO Decision Memorandum</span>
          </div>
  <PrintErrorBoundary sectionName="GoldenVisaIntel">
        <GoldenVisaIntelligenceSection
            intelligence={memoData.preview_data.golden_visa_intelligence}
            sourceJurisdiction={memoData.preview_data.source_jurisdiction}
            destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
          />
        </PrintErrorBoundary>
        </section>
      ) : memoData.preview_data.destination_drivers?.visa_programs?.length > 0 ? (
        <section className="print-section">
          <div className="print-page-header">
            <span>HNWI Chronicles</span>
            <span>SFO Decision Memorandum</span>
          </div>
  <PrintErrorBoundary sectionName="GoldenVisa">
        <GoldenVisaSection
            destinationDrivers={memoData.preview_data.destination_drivers}
            destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
          />
        </PrintErrorBoundary>
        </section>
      ) : null}

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 20: SCENARIO TREE (conditional)
          ═══════════════════════════════════════════════════════════════════ */}
      {(memoData.preview_data.scenario_tree_analysis ||
        (memoData.preview_data.scenario_tree_data && Object.keys(memoData.preview_data.scenario_tree_data).length > 0)) && (
        <section className="print-section print-scenario-tree">
          <div className="print-page-header">
            <span>HNWI Chronicles</span>
            <span>SFO Decision Memorandum</span>
          </div>
  <PrintErrorBoundary sectionName="ScenarioTree">
        <ScenarioTreeSection
            data={memoData.preview_data.scenario_tree_data || {}}
            rawAnalysis={memoData.preview_data.scenario_tree_analysis}
          />
        </PrintErrorBoundary>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 21: HEIR MANAGEMENT (conditional)
          ═══════════════════════════════════════════════════════════════════ */}
      {(memoData.preview_data.heir_management_analysis ||
        (memoData.preview_data.heir_management_data && Object.keys(memoData.preview_data.heir_management_data).length > 0)) && (
        <section className="print-section">
          <div className="print-page-header">
            <span>HNWI Chronicles</span>
            <span>SFO Decision Memorandum</span>
          </div>
  <PrintErrorBoundary sectionName="HeirManagement">
        <HeirManagementSection
            data={memoData.preview_data.heir_management_data || {}}
            rawAnalysis={memoData.preview_data.heir_management_analysis}
          />
        </PrintErrorBoundary>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 22: IMPLEMENTATION ROADMAP (conditional on execution data)
          Component internally guards with hasExecutionSequence — if no data,
          it renders empty <div>. Guard the section wrapper too so we don't
          create a blank page with just the header.
          ═══════════════════════════════════════════════════════════════════ */}
      {memoData.preview_data.execution_sequence && memoData.preview_data.execution_sequence.length > 0 && (
      <section className="print-section">
        <div className="print-page-header">
          <span>HNWI Chronicles</span>
          <span>SFO Decision Memorandum</span>
        </div>
<PrintErrorBoundary sectionName="Implementation">
        <ImplementationRoadmap
          totalSavings={memoData.preview_data.total_savings}
          exposureClass={memoData.preview_data.exposure_class}
          sourceJurisdiction={memoData.preview_data.source_jurisdiction}
          destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
          sourceCity={memoData.preview_data.source_city}
          destinationCity={memoData.preview_data.destination_city}
          executionSequence={memoData.preview_data.execution_sequence}
          sourceTaxRates={memoData.preview_data.source_tax_rates || memoData.preview_data.tax_differential?.source}
          destinationTaxRates={memoData.preview_data.destination_tax_rates || memoData.preview_data.tax_differential?.destination}
          taxDifferential={memoData.preview_data.tax_differential}
          sections={["implementation"]}
        />
        </PrintErrorBoundary>
      </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 23: LEGAL REFERENCES (conditional)
          ═══════════════════════════════════════════════════════════════════ */}
      {legalReferences && legalReferences.total_count > 0 && (
        <section className="print-section">
          <div className="print-page-header">
            <span>HNWI Chronicles</span>
            <span>SFO Decision Memorandum</span>
          </div>
  <PrintErrorBoundary sectionName="References">
        <ReferencesSection
            references={legalReferences}
            developmentsCount={memoData.preview_data.hnwi_world_count || 1966}
            precedentCount={memoData.memo_data?.kgv3_intelligence_used?.precedents || 0}
          />
        </PrintErrorBoundary>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 24: REGULATORY SOURCES (conditional)
          ═══════════════════════════════════════════════════════════════════ */}
      {regulatoryCitations && Array.isArray(regulatoryCitations) && regulatoryCitations.length > 0 && (
        <section className="print-section">
          <div className="print-page-header">
            <span>HNWI Chronicles</span>
            <span>SFO Decision Memorandum</span>
          </div>
  <PrintErrorBoundary sectionName="RegulatorySources">
        <RegulatorySourcesSection citations={regulatoryCitations as any} />
        </PrintErrorBoundary>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 25: LAST PAGE
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="print-section" style={{ padding: 0 }}>
<PrintErrorBoundary sectionName="LastPage">
        <MemoLastPage
          intakeId={intakeId}
          precedentCount={memoData.memo_data?.kgv3_intelligence_used?.precedents || 0}
          generatedAt={memoData.generated_at}
          viaNegativa={viaNegativaContext}
        />
        </PrintErrorBoundary>
      </section>
    </div>
    </PrintErrorBoundary>
  );
}
