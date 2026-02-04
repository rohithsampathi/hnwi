// app/(authenticated)/decision-memo/memo/[intakeId]/page.tsx
// Decision Memo - Full Report Display ($10,000 SFO Investment Audit)

"use client";

import { useState, useEffect } from 'react';
import type { DecisionMemoData, ViaNegativaContext } from '@/lib/decision-memo/memo-types';
import { CrownLoader } from '@/components/ui/crown-loader';
import { usePageTitle } from '@/hooks/use-page-title';
import { ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';
import { useCitationManager } from '@/hooks/use-citation-manager';
import { EliteCitationPanel } from '@/components/elite/elite-citation-panel';
import type { Citation } from '@/lib/parse-dev-citations';
import { motion, AnimatePresence } from 'framer-motion';

// Import memo page components
import { MemoHeader } from '@/components/decision-memo/memo/MemoHeader';
import { Page1TaxDashboard } from '@/components/decision-memo/memo/Page1TaxDashboard';
import { Page2AuditVerdict } from '@/components/decision-memo/memo/Page2AuditVerdict';
import { Page3PeerIntelligence } from '@/components/decision-memo/memo/Page3PeerIntelligence';
import { RegulatorySourcesSection } from '@/components/decision-memo/memo/RegulatorySourcesSection';

interface PageProps {
  params: {
    intakeId: string;
  };
}

export default function DecisionMemoPage({ params }: PageProps) {
  const { intakeId } = params;
  const [data, setData] = useState<DecisionMemoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [screenSize, setScreenSize] = useState<'mobile' | 'desktop'>('desktop');

  // Citation management (using same hook as simulation results)
  const {
    citations,
    setCitations,
    citationMap,
    selectedCitationId,
    setSelectedCitationId,
    isPanelOpen,
    openCitation,
    closePanel
  } = useCitationManager();

  usePageTitle(
    'Investment Decision Memorandum',
    'Confidential Wealth Strategy Analysis'
  );

  // Screen size detection for mobile/desktop (matching simulation results)
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isLandscapeMobile = isTouchDevice && height < 500;
      const isMobile = width < 1024 || isLandscapeMobile;
      setScreenSize(isMobile ? 'mobile' : 'desktop');
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Fetch decision memo data from backend
  useEffect(() => {
    async function fetchMemo() {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/decision-memo/download/${intakeId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch decision memo');
        }

        const memoData = await response.json();
        setData(memoData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchMemo();
  }, [intakeId]);

  // Extract all DEVIDs from opportunities and create citations with unique numbers
  useEffect(() => {
    if (!data?.preview_data?.all_opportunities) return;

    const allDevIds = new Set<string>();
    const seenIds = new Map<string, boolean>();

    // Extract DEVIDs from all opportunities
    data.preview_data.all_opportunities.forEach((opp: any) => {
      if (opp.dev_id) {
        const normalized = String(opp.dev_id).trim().toLowerCase();
        if (normalized && !seenIds.has(normalized)) {
          allDevIds.add(String(opp.dev_id).trim());
          seenIds.set(normalized, true);
        }
      }
    });

    // Also extract from mistakes if they have dev_ids
    if (data.preview_data.all_mistakes) {
      data.preview_data.all_mistakes.forEach((mistake: any) => {
        if (mistake.dev_id) {
          const normalized = String(mistake.dev_id).trim().toLowerCase();
          if (normalized && !seenIds.has(normalized)) {
            allDevIds.add(String(mistake.dev_id).trim());
            seenIds.set(normalized, true);
          }
        }
      });
    }

    // Convert to Citation format with sequential numbering
    if (allDevIds.size > 0) {
      const uniqueIds = Array.from(allDevIds);

      // Final deduplication pass
      const finalUniqueIds = uniqueIds.filter((id, index, self) =>
        self.findIndex(i => i.toLowerCase().trim() === id.toLowerCase().trim()) === index
      );

      const citationList: Citation[] = finalUniqueIds.map((devId, index) => ({
        id: devId,
        number: index + 1,
        originalText: `[DEVID: ${devId}]`
      }));

      setCitations(citationList);
    }
  }, [data, setCitations]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <CrownLoader
          size="lg"
          text="Loading Decision Memo"
          subtext="Retrieving your investment analysis..."
        />
      </div>
    );
  }

  // Error state
  if (error || !data || !data.success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-4 text-foreground">
            Memo Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            {error instanceof Error ? error.message : 'The decision memo could not be loaded.'}
          </p>
          <Link
            href="/decision-memo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Assessment
          </Link>
        </div>
      </div>
    );
  }

  const { preview_data, memo_data, full_memo_url, generated_at } = data;

  // ══════════════════════════════════════════════════════════════════════════
  // VIA NEGATIVA: Construct context when structure verdict is DO_NOT_PROCEED
  // Same pattern as audit page — backend-driven labels with frontend fallbacks
  // ══════════════════════════════════════════════════════════════════════════
  const structureVerdict = preview_data.structure_optimization?.verdict;
  const isViaNegativa = structureVerdict === 'DO_NOT_PROCEED';

  let viaNegativaContext: ViaNegativaContext | undefined;
  if (isViaNegativa) {
    const backendVN = preview_data?.via_negativa;

    const dayOneLossPct = backendVN?.day_one_loss_pct || 0;
    const dayOneLossAmount = backendVN?.day_one_loss_amount || 0;
    const totalConfiscationExposure = backendVN?.total_regulatory_exposure ?? 0;

    const taxEfficiencyPassed = backendVN?.tax_efficiency_passed ?? (preview_data.show_tax_savings !== false);
    const liquidityPassed = backendVN?.liquidity_passed ?? dayOneLossPct < 10;
    const structurePassed = backendVN?.structure_passed ?? false;

    const hdr = backendVN?.header;
    const sc = backendVN?.scenario_section;
    const tx = backendVN?.tax_section;
    const vs = backendVN?.verdict_section;
    const cta = backendVN?.cta;
    const metrics = backendVN?.metrics;
    const precedents = memo_data?.kgv3_intelligence_used?.precedents ?? 0;

    viaNegativaContext = {
      isActive: true,
      dayOneLoss: dayOneLossPct,
      dayOneLossAmount,
      totalConfiscationExposure,
      taxEfficiencyPassed,
      liquidityPassed,
      structurePassed,

      analysisPosture: backendVN?.analysis_posture || 'Via Negativa: Strengths acknowledged. Weaknesses stated without qualification.',
      badgeLabel: hdr?.badge_label || 'ELEVATED RISK',
      titlePrefix: hdr?.title_prefix || 'Capital At',
      titleHighlight: hdr?.title_highlight || 'Risk',
      noticeTitle: hdr?.notice_title || 'Elevated Risk Advisory',
      noticeBody: (hdr?.notice_body || 'Analysis of {precedentCount}+ precedents identified {dayOneLoss}% Day-One capital exposure in this corridor. The destination market may carry long-term merit, but the current ownership structure imposes acquisition costs that require careful evaluation before deployment.')
        .replace('{dayOneLoss}', dayOneLossPct.toFixed(1))
        .replace('{precedentCount}', precedents.toLocaleString()),

      metricLabels: {
        capitalExposure: metrics?.[0]?.label || 'Day-One Capital Exposure',
        structureVerdict: metrics?.[1]?.label || 'Structure Verdict',
        structureVerdictValue: metrics?.[1]?.value || 'Not Recommended',
        structureVerdictDesc: metrics?.[1]?.description || 'Negative NPV across analyzed structures',
        regulatoryExposure: metrics?.[2]?.label || 'Regulatory Exposure',
        regulatoryExposureDesc: metrics?.[2]?.description || 'FBAR + compliance penalties',
      },

      scenarioHeader: sc?.header || 'Projection Audit',
      expectationLabel: sc?.expectation_label || 'Your Projection',
      actualLabel: sc?.actual_label || 'Market Data',
      commentaryTitle: sc?.commentary_title || 'Reality Gap Analysis',
      commentaryBody: sc?.commentary_body || 'Your projected returns deviate from verified market data in key areas.',

      taxBadgeLabel: tx?.badge_label || 'Regulatory Exposure Analysis',
      taxTitleLine1: tx?.title_line1 || 'Regulatory',
      taxTitleLine2: tx?.title_line2 || 'Exposure',
      compliancePrefix: tx?.compliance_prefix ?? '',
      warningPrefix: tx?.warning_prefix || 'Regulatory Flag',

      verdictHeader: vs?.header || 'Structural Review',
      verdictBadgeLabel: vs?.badge_label || 'Capital Allocation Review',
      stampText: vs?.stamp_text || 'Allocation Not Recommended',
      stampSubtext: vs?.stamp_subtext || 'Key viability thresholds not met in this structure — review alternative corridors and strategies below',

      ctaHeadline: cta?.headline || 'DOES YOUR CURRENT DEAL SURVIVE THIS FILTER?',
      ctaBody: (cta?.body_template || 'This Pattern Audit identified {dayOneLoss}% Day-One capital exposure.')
        .replace('{dayOneLoss}', dayOneLossPct.toFixed(1)),
      ctaScarcity: cta?.scarcity_text || '5 Slots Remaining — February Cycle',
      ctaButtonText: cta?.button_text || 'INITIATE YOUR PATTERN AUDIT — $5,000',
      ctaButtonUrl: cta?.button_url || 'https://app.hnwichronicles.com/decision-memo',
      ctaContextNote: cta?.context_note || 'The same Pattern Recognition Engine applies to 50+ corridors.',
    };
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-card/95 border-b border-border/50 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-0.5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2 sm:py-3 gap-2">
            {/* Left: Branding */}
            <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-primary-foreground font-bold text-[8px] sm:text-xs">HC</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-foreground font-semibold text-sm">HNWI CHRONICLES</p>
                <p className="text-muted-foreground text-[10px] tracking-wider uppercase">Pattern Intelligence Division</p>
              </div>
            </div>

            {/* Right: Download - temporarily disabled */}
            {/* <button
              onClick={async () => {
                const { generateDecisionMemoPDF } = await import('@/lib/decision-memo/pdf-generator');
                await generateDecisionMemoPDF(data, intakeId);
              }}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-5 py-1.5 sm:py-2.5 bg-primary text-primary-foreground text-[10px] sm:text-sm font-semibold tracking-wider rounded-md sm:rounded-lg hover:bg-primary/90 flex-shrink-0"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">DOWNLOAD </span><span>PDF</span>
            </button> */}
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-[1400px] mx-auto px-0.5 sm:px-6 lg:px-8 py-3 sm:py-6 lg:py-8">
        {/* Document Header */}
        <MemoHeader
          intakeId={intakeId}
          generatedAt={generated_at}
          exposureClass={preview_data.exposure_class}
          totalSavings={preview_data.total_savings}
          precedentCount={memo_data?.kgv3_intelligence_used?.precedents}
          sourceJurisdiction={preview_data.source_jurisdiction}
          destinationJurisdiction={preview_data.destination_jurisdiction}
          sourceTaxRates={preview_data.source_tax_rates as any}
          destinationTaxRates={preview_data.destination_tax_rates as any}
          taxDifferential={preview_data.tax_differential as any}
          valueCreation={preview_data.value_creation as any}
          showTaxSavings={preview_data.show_tax_savings}
          optimalStructure={preview_data.structure_optimization?.optimal_structure}
          viaNegativa={viaNegativaContext}
        />

        {/* Elegant Section Divider */}
        <div className="my-8 sm:my-12 flex items-center">
          <div className="flex-1 h-px bg-border opacity-50" />
          <div className="mx-4 sm:mx-6 w-2 h-2 bg-primary rounded-full" />
          <div className="flex-1 h-px bg-border opacity-50" />
        </div>

        {/* Section 1: Tax Jurisdiction Analysis */}
        <section className="mb-10 sm:mb-16">
          <Page1TaxDashboard
            totalSavings={preview_data.total_savings}
            exposureClass={preview_data.exposure_class}
            sourceJurisdiction={preview_data.source_jurisdiction}
            destinationJurisdiction={preview_data.destination_jurisdiction}
            sourceCity={preview_data.source_city}
            destinationCity={preview_data.destination_city}
            sourceTaxRates={preview_data.source_tax_rates as any}
            destinationTaxRates={preview_data.destination_tax_rates as any}
            taxDifferential={preview_data.tax_differential as any}
            valueCreation={preview_data.value_creation as any}
            executionSequence={preview_data.execution_sequence}
          />
        </section>

        {/* Elegant Section Divider */}
        <div className="my-8 sm:my-12 flex items-center">
          <div className="flex-1 h-px bg-border opacity-30" />
        </div>

        {/* Section 2: Risk Assessment */}
        <section className="mb-10 sm:mb-16">
          <Page2AuditVerdict
            mistakes={preview_data.all_mistakes}
            opportunitiesCount={preview_data.opportunities_count}
            precedentCount={memo_data?.kgv3_intelligence_used?.precedents}
            sourceJurisdiction={preview_data.source_jurisdiction}
            destinationJurisdiction={preview_data.destination_jurisdiction}
            ddChecklist={memo_data?.dd_checklist}
            dataQuality={preview_data.data_quality}
            dataQualityNote={preview_data.data_quality_note}
            mitigationTimeline={preview_data.risk_assessment?.mitigation_timeline}
            riskAssessment={{
              risk_level: preview_data.risk_assessment?.risk_level,
              total_exposure_formatted: preview_data.risk_assessment?.total_exposure,
              critical_items: preview_data.risk_assessment?.critical_items,
              high_priority: preview_data.risk_assessment?.high_priority,
              verdict: preview_data.risk_assessment?.verdict,
              recommendation: preview_data.risk_assessment?.recommendation,
              verdict_note: preview_data.risk_assessment?.verdict_note,
              structure_verdict: memo_data?.mcp_decision?.recommended_branch || preview_data.structure_optimization?.verdict
            }}
            scenarioTreeData={{
              recommended_branch: memo_data?.mcp_decision?.recommended_branch,
              recommendation_strength: memo_data?.mcp_decision?.branches?.find(
                (b: any) => b.name === memo_data?.mcp_decision?.recommended_branch
              )?.recommendation_strength
            }}
            viaNegativa={viaNegativaContext}
          />
        </section>

        {/* Elegant Section Divider */}
        <div className="my-12 flex items-center">
          <div className="flex-1 h-px bg-border opacity-30" />
        </div>

        {/* Section 3: Market Intelligence */}
        <section className="mb-10 sm:mb-16">
          <Page3PeerIntelligence
            opportunities={preview_data.all_opportunities}
            peerCount={memo_data?.kgv3_intelligence_used?.precedents || preview_data.opportunities_count || 0}
            onCitationClick={openCitation}
            citationMap={citationMap as any}
            sourceJurisdiction={preview_data.source_jurisdiction}
            destinationJurisdiction={preview_data.destination_jurisdiction}
            sourceCountry={preview_data.source_country}
            destinationCountry={preview_data.destination_country}
            peerCohortStats={preview_data.peer_cohort_stats as any}
            capitalFlowData={preview_data.capital_flow_data}
            isRelocating={preview_data.peer_cohort_stats?.is_relocating ?? preview_data.is_relocating ?? false}
          />
        </section>

        {/* Section 4: Regulatory Citations */}
        {preview_data.regulatory_citations && preview_data.regulatory_citations.length > 0 && (
          <>
            <div className="my-12 flex items-center">
              <div className="flex-1 h-px bg-border opacity-30" />
            </div>
            <section className="mb-10 sm:mb-16">
              <RegulatorySourcesSection citations={preview_data.regulatory_citations} />
            </section>
          </>
        )}

        {/* Premium Footer Section */}
        <motion.div
          className="mt-12 sm:mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="relative bg-gradient-to-br from-card via-card to-muted/20 border border-primary/20 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.02]">
              <div className="absolute top-0 right-0 w-48 sm:w-96 h-48 sm:h-96 bg-gradient-to-bl from-primary to-transparent rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 sm:w-64 h-32 sm:h-64 bg-gradient-to-tr from-primary to-transparent rounded-full blur-2xl" />
            </div>

            {/* Animated Top Border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

            {/* Content */}
            <div className="relative z-10 p-6 sm:p-8 lg:p-12 text-center">
              {/* Seal/Badge */}
              <motion.div
                className="inline-flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 mb-4 sm:mb-6 bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 rounded-full"
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
                viewport={{ once: true }}
              >
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </motion.div>

              <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground mb-3 sm:mb-4">
                Analysis Complete
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 text-sm sm:text-base lg:text-lg px-2">
                This confidential pattern intelligence report contains actionable strategies
                for wealth preservation and tax optimization.
              </p>

              {/* Stats Summary */}
              <div className="grid grid-cols-3 gap-3 sm:gap-8 max-w-lg mx-auto mb-6 sm:mb-10">
                <div className="text-center">
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary">{preview_data.opportunities_count}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">Opportunities</p>
                </div>
                <div className="text-center border-x border-border">
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{preview_data.total_savings}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">Potential Savings</p>
                </div>
                <div className="text-center">
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{preview_data.exposure_class}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">Risk Class</p>
                </div>
              </div>

              {/* PDF download temporarily disabled */}
              {/* <button
                onClick={async () => {
                  const { generateDecisionMemoPDF } = await import('@/lib/decision-memo/pdf-generator');
                  await generateDecisionMemoPDF(data, intakeId);
                }}
                className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-10 py-3 sm:py-4 bg-primary text-primary-foreground text-sm sm:text-base font-semibold tracking-wider rounded-xl hover:bg-primary/90"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">DOWNLOAD FULL PDF REPORT</span>
                <span className="sm:hidden">DOWNLOAD PDF</span>
              </button>

              <p className="mt-4 sm:mt-6 text-[10px] sm:text-xs text-muted-foreground px-2">
                PDF contains all sections including risk analysis, peer intelligence, and implementation roadmap
              </p> */}
            </div>
          </div>
        </motion.div>

        {/* Confidentiality Footer */}
        <div className="mt-12 text-center pb-8">
          <p className="text-xs text-muted-foreground tracking-wider">
            CONFIDENTIAL | HNWI CHRONICLES | PATTERN INTELLIGENCE AUDIT
          </p>
          <p className="text-xs text-muted-foreground/60 mt-2">
            © {new Date().getFullYear()} All Rights Reserved | Distribution Restricted
          </p>
        </div>
      </div>

      {/* Citation Panel - Desktop Only (matching simulation results) */}
      {isPanelOpen && screenSize === 'desktop' && (
        <div className="hidden lg:block">
          <EliteCitationPanel
            citations={citations}
            selectedCitationId={selectedCitationId}
            onClose={closePanel}
            onCitationSelect={setSelectedCitationId}
            citationMap={citationMap}
          />
        </div>
      )}

      {/* Mobile Citation Panel - Full screen with AnimatePresence */}
      {isPanelOpen && screenSize === 'mobile' && (
        <AnimatePresence>
          <EliteCitationPanel
            citations={citations}
            selectedCitationId={selectedCitationId}
            onClose={closePanel}
            onCitationSelect={setSelectedCitationId}
            citationMap={citationMap}
          />
        </AnimatePresence>
      )}
    </div>
  );
}
