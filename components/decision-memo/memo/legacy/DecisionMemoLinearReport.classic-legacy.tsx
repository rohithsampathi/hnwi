'use client';

import { useRef, type CSSProperties, type ReactNode } from 'react';
import { Check, Share2 } from 'lucide-react';
import { SectionReveal } from '@/components/ui/section-reveal';
import { computeMemoProps } from '@/lib/decision-memo/compute-memo-props';
import { computeRiskRadarScores } from '@/lib/decision-memo/compute-risk-radar-scores';
import { resolveDecisionMemoDisplayReference } from '@/lib/decision-memo/memo-id-aliases';
import { resolveIntelligenceBasisCounts } from '@/lib/decision-memo/resolve-intelligence-basis-counts';
import type { PdfMemoData } from '@/lib/pdf/pdf-types';
import { DecisionMemoRenderProvider } from '../decision-memo-render-context';
import { MemoCoverPage } from './MemoCoverPage.classic-legacy';
import { AuditOverviewSection } from '../AuditOverviewSection';
import { MemoHeader } from '../MemoHeader';
import { PrintPaginationOptimizer } from '../PrintPaginationOptimizer';
import { RiskRadarChart } from '../RiskRadarChart';
import { Page2AuditVerdict } from '../Page2AuditVerdict';
import { ZeroTrustMoveIntakeSection } from '../ZeroTrustMoveIntakeSection';
import { LiquidityTrapFlowchart } from '../LiquidityTrapFlowchart';
import { CrossBorderTaxAudit } from '../CrossBorderTaxAudit';
import { PeerBenchmarkTicker } from '../PeerBenchmarkTicker';
import { StructureComparisonMatrix } from '../StructureComparisonMatrix';
import { Page1TaxDashboard } from '../Page1TaxDashboard';
import { RegimeIntelligenceSection } from '../RegimeIntelligenceSection';
import WealthProjectionSection from '../WealthProjectionSection';
import { Page3PeerIntelligence } from '../Page3PeerIntelligence';
import HNWITrendsSection from '../HNWITrendsSection';
import { TransparencyRegimeSection } from '../TransparencyRegimeSection';
import RealAssetAuditSection from '../RealAssetAuditSection';
import { CrisisResilienceSection } from '../CrisisResilienceSection';
import GoldenVisaIntelligenceSection from '../GoldenVisaIntelligenceSection';
import GoldenVisaSection from '../GoldenVisaSection';
import ScenarioTreeSection from '../ScenarioTreeSection';
import HeirManagementSection from '../HeirManagementSection';
import ReferencesSection from '../ReferencesSection';
import { RegulatorySourcesSection } from '../RegulatorySourcesSection';
import { MemoLastPage } from '../MemoLastPage';
import { ReleaseReadinessInquiryForm } from '../ReleaseReadinessInquiryForm';

type RenderMode = 'screen' | 'print';

interface DecisionMemoLinearReportProps {
  memoData: PdfMemoData;
  intakeId: string;
  backendData?: Record<string, any> | null;
  hnwiWorldCount?: number;
  fullArtifact?: Record<string, any> | null;
  mode?: RenderMode;
  onCitationClick?: (citationId: string) => void;
  citationMap?: Map<string, number>;
  onShare?: () => void;
  linkCopied?: boolean;
  includeFramingPages?: boolean;
  showPrintChrome?: boolean;
  motionEnabled?: boolean;
}

interface RevealConfig {
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
  delay?: number;
  duration?: number;
}

interface ReportSectionProps {
  mode: RenderMode;
  children: ReactNode;
  reveal?: RevealConfig;
  screenClassName?: string;
  printClassName?: string;
  printStyle?: CSSProperties;
  pageBreakBefore?: boolean;
  motionEnabled?: boolean;
}

function ReportSection({
  mode,
  children,
  reveal,
  screenClassName,
  printClassName,
  printStyle,
  pageBreakBefore = false,
  motionEnabled = false,
}: ReportSectionProps) {
  if (mode === 'print') {
    return (
      <section
        className={['print-section', pageBreakBefore ? 'print-section--page-break' : null, printClassName].filter(Boolean).join(' ')}
        style={printStyle}
      >
        {children}
      </section>
    );
  }

  const content = screenClassName ? <div className={screenClassName}>{children}</div> : <>{children}</>;

  return motionEnabled && reveal ? <SectionReveal {...reveal}>{content}</SectionReveal> : <>{content}</>;
}

export default function DecisionMemoLinearReport({
  memoData,
  intakeId,
  backendData,
  hnwiWorldCount,
  fullArtifact,
  mode = 'screen',
  onCitationClick,
  citationMap,
  onShare,
  linkCopied = false,
  includeFramingPages = false,
  showPrintChrome = false,
  motionEnabled = false,
}: DecisionMemoLinearReportProps) {
  const printContainerRef = useRef<HTMLDivElement>(null);
  const resolvedCitationMap = citationMap ?? new Map<string, number>();
  const handleCitationClick = onCitationClick ?? (() => {});
  const resolvedBackendData = backendData ?? {};
  const resolvedArtifact =
    fullArtifact ??
    resolvedBackendData.fullArtifact ??
    resolvedBackendData.full_artifact ??
    (memoData as any).full_artifact ??
    {};
  const intelligenceSources = resolvedArtifact.intelligenceSources ?? resolvedArtifact.intelligence_sources ?? {};
  const intelligenceBasisCounts = resolveIntelligenceBasisCounts({
    memoData,
    backendData: resolvedBackendData,
    hnwiWorldCount,
    fullArtifact: resolvedArtifact,
  });
  const resolvedDevelopmentsCount = intelligenceBasisCounts.developmentsCount;
  const resolvedCorridorSignalsCount = intelligenceBasisCounts.corridorSignalsCount ?? 0;

  const {
    crossBorderAudit,
    hasCrossBorderAudit,
    hasUSWorldwideTax,
    showTheoreticalTaxSavings,
    isViaNegativa,
    viaNegativaContext,
    valueCreation,
    coverHeadlineMetric,
  } = computeMemoProps(memoData);

  const doctrineMetadata = memoData.preview_data.scenario_tree_data?.doctrine_metadata;
  const riskRadar = doctrineMetadata ? computeRiskRadarScores(memoData, isViaNegativa) : null;
  const legalReferences = memoData.preview_data.legal_references;
  const resolvedRiskAssessment =
    resolvedBackendData.risk_assessment ||
    memoData.preview_data.risk_assessment ||
    resolvedArtifact.risk_assessment;
  const resolvedDataQuality =
    memoData.preview_data.data_quality ||
    memoData.preview_data.peer_cohort_stats?.data_quality ||
    resolvedArtifact.data_quality;
  const zeroTrustMoveIntake = (memoData.preview_data as Record<string, unknown>).zero_trust_move_intake as
    | Record<string, unknown>
    | undefined;
  const hasZeroTrustMoveIntake = Boolean(zeroTrustMoveIntake && Object.keys(zeroTrustMoveIntake).length > 0);
  const resolvedDataQualityNote =
    memoData.preview_data.data_quality_note ||
    memoData.preview_data.peer_cohort_stats?.data_quality_note ||
    resolvedArtifact.data_quality_note;
  const resolvedMitigationTimeline =
    resolvedBackendData.mitigationTimeline ||
    resolvedBackendData.mitigation_timeline ||
    resolvedRiskAssessment?.mitigation_timeline ||
    memoData.preview_data.risk_assessment?.mitigation_timeline ||
    resolvedArtifact.risk_assessment?.mitigation_timeline;
  const regulatoryCitations =
    memoData.preview_data?.regulatory_citations || legalReferences?.regulatory_sources || [];
  const canonicalReference = resolveDecisionMemoDisplayReference(intakeId);
  const headlineMetric = coverHeadlineMetric?.value ?? memoData.preview_data.executive_summary?.headline_metric?.value ?? '';
  const headlineMetricLabel = coverHeadlineMetric?.label ?? memoData.preview_data.executive_summary?.headline_metric?.label ?? '';
  const verdictLabel =
    memoData.preview_data.risk_assessment?.structure_verdict ??
    memoData.preview_data.structure_optimization?.verdict ??
    memoData.preview_data.risk_assessment?.verdict ??
    memoData.preview_data.verdict ??
    '';
  const normalizedVerdict = (() => {
    const value = String(verdictLabel).replace(/_/g, ' ').toUpperCase();
    return value.includes('PROCEED MODIFIED') ? 'CONDITIONAL' : value;
  })();

  const acqAudit = crossBorderAudit?.acquisition_audit;
  const liquidityTrapProps = acqAudit
    ? (() => {
        const propertyValue = acqAudit.property_value || 0;
        const totalCost = acqAudit.total_acquisition_cost || 0;
        const absd = acqAudit.absd_additional_stamp_duty || 0;
        const bsd = acqAudit.bsd_stamp_duty || 0;
        const otherCosts = totalCost - propertyValue - absd - bsd;
        const hasMajorABSD = absd > 0;
        const feeLabels = acqAudit as typeof acqAudit & { primary_fee_label?: string; secondary_fee_label?: string };
        const primaryFeeLabel = typeof feeLabels.primary_fee_label === 'string' && feeLabels.primary_fee_label.trim()
          ? feeLabels.primary_fee_label.trim()
          : 'Base acquisition duty';
        const secondaryFeeLabel = typeof feeLabels.secondary_fee_label === 'string' && feeLabels.secondary_fee_label.trim()
          ? feeLabels.secondary_fee_label.trim()
          : 'Additional buyer surcharge';

        return {
          capitalIn: totalCost,
          capitalOut: propertyValue,
          primaryBarrier: hasMajorABSD ? `${secondaryFeeLabel} (${propertyValue ? ((absd / propertyValue) * 100).toFixed(0) : '0'}%)` : 'Acquisition duties',
          primaryBarrierCost: hasMajorABSD ? absd : absd + bsd,
          secondaryBarrier: hasMajorABSD
            ? bsd > 0
              ? primaryFeeLabel
              : hasUSWorldwideTax
                ? 'US Worldwide Tax Drag'
                : undefined
            : hasUSWorldwideTax
              ? 'US Worldwide Tax Drag'
              : undefined,
          secondaryBarrierCost: hasMajorABSD ? (bsd > 0 ? bsd + Math.max(0, otherCosts) : 0) : 0,
          dayOneLossPct: acqAudit.day_one_loss_pct || viaNegativaContext?.dayOneLoss || 0,
          dayOneLossNote: crossBorderAudit?.bsd_note || acqAudit.day_one_loss_label,
          assetLabel: `${memoData.preview_data.destination_jurisdiction || 'Destination'} Residential Property`,
        };
      })()
    : null;

  const peerBenchmarkData = (() => {
    if (!doctrineMetadata?.failure_modes?.length) return null;
    const precedentCount = memoData.memo_data?.kgv3_intelligence_used?.precedents || 0;
    if (precedentCount === 0) return null;

    return {
      precedentCount,
      failurePatterns: (doctrineMetadata.failure_modes || []).map((failureMode: any) => ({
        mode: failureMode.mode || '',
        doctrinBook: failureMode.doctrine_book || '',
        severity: failureMode.severity || 'MEDIUM',
        description: failureMode.description || '',
        nightmareName: failureMode.nightmare_name,
      })),
      failureModeCount: doctrineMetadata.failure_mode_count || doctrineMetadata.failure_modes.length,
      totalRiskFlags: doctrineMetadata.risk_flags_total || 0,
    };
  })();

  const hasTransparencySection = (() => {
    const transparencyData = memoData.preview_data.transparency_data;
    const content = memoData.preview_data.transparency_regime_impact;
    const hasStructuredData =
      ((transparencyData?.reporting_triggers?.length ?? 0) > 0) ||
      ((transparencyData?.compliance_risks?.length ?? 0) > 0);
    const hasContent = content && content !== 'N/A' && String(content).length >= 50;
    return hasStructuredData || hasContent;
  })();

  const peerStats = memoData.preview_data.peer_cohort_stats as Record<string, any> | undefined;
  const capitalFlow = memoData.preview_data.capital_flow_data as Record<string, any> | undefined;
  const sourceTaxRates = memoData.preview_data.source_tax_rates as Record<string, any> | undefined;
  const destinationTaxRates = memoData.preview_data.destination_tax_rates as Record<string, any> | undefined;
  const hasNumericTaxRate = (rates?: Record<string, any>) =>
    Boolean(
      rates &&
        ['income_tax', 'capital_gains', 'cgt', 'wealth_tax', 'estate_tax'].some(
          (key) => typeof rates[key] === 'number' && Number.isFinite(rates[key]),
        ),
    );
  const hasTaxJurisdictionDashboard = Boolean(
    memoData.preview_data.tax_differential?.source ||
      memoData.preview_data.tax_differential?.destination ||
      hasNumericTaxRate(sourceTaxRates) ||
      hasNumericTaxRate(destinationTaxRates),
  );
  const hasPeerIntelligenceData = Boolean(
    peerStats?.total_peers ||
      peerStats?.last_6_months ||
      peerStats?.avg_deal_value_m ||
      (Array.isArray(peerStats?.metric_cards) && peerStats.metric_cards.length > 0) ||
      capitalFlow?.flow_intensity ||
      capitalFlow?.flow_intensity_index ||
      capitalFlow?.movement_velocity_pct ||
      capitalFlow?.peers_in_corridor,
  );
  const realAssetAudit = memoData.preview_data.real_asset_audit as Record<string, any> | undefined;
  const hasRenderableRealAssetAudit = Boolean(
    realAssetAudit &&
      Object.entries(realAssetAudit).some(([key, value]) =>
        !key.startsWith('_') &&
        value &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        (
          'stamp_duty' in value ||
          'dynasty_trusts' in value ||
          'loophole_strategies' in value ||
          'property_gate' in value
        ),
      ),
  );
  const heirManagementData = memoData.preview_data.heir_management_data as Record<string, any> | undefined;
  const hasRenderableHeirManagement = Boolean(
    heirManagementData &&
      (
        Array.isArray(heirManagementData.heirs) ||
        Array.isArray(heirManagementData.heir_specific_read) ||
        Array.isArray(heirManagementData.heir_allocations) ||
        heirManagementData.third_generation_risk ||
        heirManagementData.third_generation_problem ||
        heirManagementData.estate_tax_by_heir_type ||
        heirManagementData.heir_education_plan
      ),
  );
  const showImplementation =
    Array.isArray(memoData.preview_data.execution_sequence) &&
    memoData.preview_data.execution_sequence.length > 0;

  const developmentCount =
    resolvedDevelopmentsCount ||
    0;
  const failurePatternsMatched =
    intelligenceBasisCounts.failurePatternsMatched ||
    doctrineMetadata?.failure_mode_count ||
    doctrineMetadata?.failure_modes?.length ||
    (Array.isArray((memoData.preview_data.pattern_intelligence as any)?.patterns)
      ? (memoData.preview_data.pattern_intelligence as any).patterns.length
      : 0) ||
    0;
  const failurePatternEvidenceLabel =
    failurePatternsMatched > 0
      ? `${Number(failurePatternsMatched).toLocaleString()} failure patterns`
      : 'failure-pattern count evidence-gated';
  const sequencingRulesApplied =
    intelligenceBasisCounts.sequencingRulesApplied ||
    memoData.preview_data.execution_sequence?.length ||
    0;

  const reportBody = (
    <>
      {includeFramingPages && (
        <ReportSection
          mode={mode}
          reveal={{ direction: 'scale', duration: 1.0 }}
          printClassName="print-framing-page"
          printStyle={{ padding: 0 }}
          pageBreakBefore={false}
          motionEnabled={motionEnabled}
        >
          <MemoCoverPage
            intakeId={intakeId}
            sourceJurisdiction={memoData.preview_data.source_jurisdiction}
            destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
            generatedAt={memoData.generated_at}
            exposureClass={memoData.preview_data.exposure_class}
            totalSavings={coverHeadlineMetric?.value}
            headlineMetricLabel={coverHeadlineMetric?.label}
            viaNegativa={viaNegativaContext}
          />
        </ReportSection>
      )}

      {mode === 'screen' && (
        <ReportSection
          mode={mode}
          reveal={{ delay: 0.02 }}
          screenClassName="mx-auto w-full max-w-6xl px-4 sm:px-8 lg:px-12"
          motionEnabled={motionEnabled}
        >
          <section className="border border-border bg-card px-5 py-6 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  HNWI Chronicles
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Release Readiness Review
                </p>
                <h1 className="mt-5 text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
                  Full Release Readiness Memo
                </h1>
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  {memoData.preview_data.source_jurisdiction} / {memoData.preview_data.destination_jurisdiction}
                </p>
              </div>
              <div className="grid gap-3 text-left md:text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Confidential
                </p>
                <p className="text-sm font-mono text-foreground">Reference: {canonicalReference}</p>
                <p className="text-sm text-muted-foreground">Principal release-readiness structure</p>
                {headlineMetric && (
                  <div>
                    {headlineMetricLabel && (
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        {headlineMetricLabel}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-foreground">{headlineMetric}</p>
                  </div>
                )}
                <p className="text-sm font-semibold text-gold">{normalizedVerdict}</p>
              </div>
            </div>
          </section>
        </ReportSection>
      )}

      <ReportSection mode={mode} reveal={{ delay: 0.05 }} motionEnabled={motionEnabled}>
        <AuditOverviewSection
          developmentsCount={resolvedDevelopmentsCount ?? undefined}
          precedentCount={resolvedCorridorSignalsCount}
          sourceJurisdiction={memoData.preview_data.source_jurisdiction}
          destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
          sourceCity={memoData.preview_data.source_city}
          destinationCity={memoData.preview_data.destination_city}
          thesisSummary={
            memoData.preview_data.thesis_summary ||
            resolvedBackendData.fullArtifact?.thesisSummary ||
            memoData.preview_data.decision_thesis
          }
          exposureClass={memoData.preview_data.exposure_class}
          totalSavings={memoData.preview_data.total_savings}
          optimalStructure={memoData.preview_data.structure_optimization?.optimal_structure}
          verdict={memoData.preview_data.structure_optimization?.verdict}
          fullThesis={
            resolvedBackendData.thesis ||
            resolvedBackendData.fullArtifact?.thesis ||
            memoData.preview_data.thesis ||
            memoData.preview_data.decision_context ||
            memoData.preview_data.user_input
          }
          rails={resolvedBackendData.rails}
          constraints={resolvedBackendData.constraints}
          showMap={false}
        />
      </ReportSection>

      <ReportSection mode={mode} reveal={{ delay: 0.1 }} motionEnabled={motionEnabled}>
        <MemoHeader
          intakeId={intakeId}
          generatedAt={memoData.generated_at}
          exposureClass={memoData.preview_data.exposure_class ?? ''}
          totalSavings={memoData.preview_data.total_savings ?? ''}
          precedentCount={resolvedCorridorSignalsCount}
          sourceJurisdiction={memoData.preview_data.source_jurisdiction}
          destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
          sourceTaxRates={memoData.preview_data.source_tax_rates || memoData.preview_data.tax_differential?.source}
          destinationTaxRates={memoData.preview_data.destination_tax_rates || memoData.preview_data.tax_differential?.destination}
          taxDifferential={memoData.preview_data.tax_differential}
          valueCreation={valueCreation}
          crossBorderTaxSavingsPct={crossBorderAudit?.total_tax_savings_pct}
          crossBorderComplianceFlags={crossBorderAudit?.compliance_flags}
          showTaxSavings={showTheoreticalTaxSavings}
          optimalStructure={memoData.preview_data.structure_optimization?.optimal_structure}
          verdict={memoData.preview_data.structure_optimization?.verdict}
          viaNegativa={viaNegativaContext}
        />
      </ReportSection>

      {riskRadar && riskRadar.scores.length > 0 && (
        <ReportSection mode={mode} reveal={{ direction: 'scale' }} motionEnabled={motionEnabled}>
          <RiskRadarChart
            scores={riskRadar.scores}
            antifragilityAssessment={riskRadar.antifragilityAssessment}
            failureModeCount={riskRadar.failureModeCount}
            totalRiskFlags={riskRadar.totalRiskFlags}
            isVetoed={isViaNegativa}
          />
        </ReportSection>
      )}

      <ReportSection mode={mode} motionEnabled={motionEnabled}>
        <Page2AuditVerdict
          mistakes={resolvedBackendData.all_mistakes || memoData.preview_data.all_mistakes}
          opportunitiesCount={memoData.preview_data.opportunities_count ?? 0}
          precedentCount={resolvedCorridorSignalsCount}
          ddChecklist={memoData.preview_data.dd_checklist}
          sourceJurisdiction={memoData.preview_data.source_jurisdiction}
          destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
          dataQuality={resolvedDataQuality}
          dataQualityNote={resolvedDataQualityNote}
          mitigationTimeline={resolvedMitigationTimeline}
          riskAssessment={resolvedRiskAssessment}
          viaNegativa={isViaNegativa ? viaNegativaContext : undefined}
        />
      </ReportSection>

      {hasZeroTrustMoveIntake && (
        <ReportSection mode={mode} motionEnabled={motionEnabled}>
          <ZeroTrustMoveIntakeSection data={zeroTrustMoveIntake} />
        </ReportSection>
      )}

      {liquidityTrapProps && (
        <ReportSection mode={mode} reveal={{ direction: 'left' }} motionEnabled={motionEnabled}>
          <LiquidityTrapFlowchart {...liquidityTrapProps} />
        </ReportSection>
      )}

      {hasCrossBorderAudit && (
        <ReportSection mode={mode} motionEnabled={motionEnabled}>
          <CrossBorderTaxAudit
            audit={crossBorderAudit}
            sourceJurisdiction={memoData.preview_data.source_jurisdiction}
            destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
            viaNegativa={viaNegativaContext}
          />
        </ReportSection>
      )}

      {peerBenchmarkData && (
        <ReportSection mode={mode} reveal={{ direction: 'right' }} motionEnabled={motionEnabled}>
          <PeerBenchmarkTicker
            {...peerBenchmarkData}
            sourceJurisdiction={memoData.preview_data.source_jurisdiction}
            destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
            antifragilityAssessment={doctrineMetadata?.antifragility_assessment}
            patternIntelligence={memoData.preview_data.pattern_intelligence}
          />
        </ReportSection>
      )}

      {memoData.preview_data.structure_optimization && (
        <ReportSection mode={mode} motionEnabled={motionEnabled}>
          <StructureComparisonMatrix
            structureOptimization={memoData.preview_data.structure_optimization}
            sourceJurisdiction={memoData.preview_data.source_jurisdiction ?? ''}
            destinationJurisdiction={memoData.preview_data.destination_jurisdiction ?? ''}
          />
        </ReportSection>
      )}

      {hasTaxJurisdictionDashboard && (
        <ReportSection mode={mode} motionEnabled={motionEnabled} pageBreakBefore>
          <Page1TaxDashboard
            totalSavings={memoData.preview_data.total_savings ?? ''}
            exposureClass={memoData.preview_data.exposure_class ?? ''}
            sourceJurisdiction={memoData.preview_data.source_jurisdiction ?? ''}
            destinationJurisdiction={memoData.preview_data.destination_jurisdiction ?? ''}
            sourceCity={memoData.preview_data.source_city}
            destinationCity={memoData.preview_data.destination_city}
            executionSequence={memoData.preview_data.execution_sequence}
            sourceTaxRates={memoData.preview_data.source_tax_rates || memoData.preview_data.tax_differential?.source}
            destinationTaxRates={memoData.preview_data.destination_tax_rates || memoData.preview_data.tax_differential?.destination}
            taxDifferential={memoData.preview_data.tax_differential}
            sections={['tax']}
            showTaxSavings={showTheoreticalTaxSavings}
          />
        </ReportSection>
      )}

      {memoData.preview_data.regime_intelligence?.has_special_regime && (
        <ReportSection mode={mode} reveal={{ direction: 'left' }} motionEnabled={motionEnabled}>
          <RegimeIntelligenceSection
            regimeIntelligence={memoData.preview_data.regime_intelligence}
            sourceJurisdiction={memoData.preview_data.source_jurisdiction}
            destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
          />
        </ReportSection>
      )}

      {(memoData.preview_data.wealth_projection_analysis ||
        (memoData.preview_data.wealth_projection_data &&
          Object.keys(memoData.preview_data.wealth_projection_data).length > 0)) && (
        <ReportSection mode={mode}>
          <WealthProjectionSection
            data={memoData.preview_data.wealth_projection_data || {}}
            rawAnalysis={memoData.preview_data.wealth_projection_analysis}
            structures={memoData.preview_data.structure_optimization?.structures_analyzed || []}
            structureProjections={memoData.preview_data.structure_projections || {}}
            optimalStructureName={memoData.preview_data.structure_optimization?.optimal_structure?.name}
          />
        </ReportSection>
      )}

      {hasPeerIntelligenceData && (
        <ReportSection mode={mode} motionEnabled={motionEnabled}>
          <Page3PeerIntelligence
            opportunities={memoData.preview_data.all_opportunities || []}
            peerCount={memoData.preview_data.peer_cohort_stats?.total_peers || 0}
            onCitationClick={handleCitationClick}
            citationMap={resolvedCitationMap}
            sourceJurisdiction={memoData.preview_data.source_jurisdiction}
            destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
            sourceCountry={memoData.preview_data.source_country}
            destinationCountry={memoData.preview_data.destination_country}
            sourceCity={memoData.preview_data.source_city}
            destinationCity={memoData.preview_data.destination_city}
            peerCohortStats={memoData.preview_data.peer_cohort_stats}
            capitalFlowData={memoData.preview_data.capital_flow_data}
            sections={['drivers', 'peer', 'corridor']}
            renderMode={mode}
            isRelocating={memoData.preview_data.peer_cohort_stats?.is_relocating ?? memoData.preview_data.is_relocating ?? false}
          />
        </ReportSection>
      )}

      {memoData.preview_data.hnwi_trends && memoData.preview_data.hnwi_trends.length > 0 && (
        <ReportSection mode={mode} reveal={{ direction: 'right' }} motionEnabled={motionEnabled} pageBreakBefore>
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
        </ReportSection>
      )}

      {hasPeerIntelligenceData && (
        <ReportSection mode={mode} motionEnabled={motionEnabled}>
          <Page3PeerIntelligence
            opportunities={memoData.preview_data.all_opportunities || []}
            peerCount={memoData.preview_data.peer_cohort_stats?.total_peers || 0}
            onCitationClick={handleCitationClick}
            citationMap={resolvedCitationMap}
            sourceJurisdiction={memoData.preview_data.source_jurisdiction}
            destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
            sourceCountry={memoData.preview_data.source_country}
            destinationCountry={memoData.preview_data.destination_country}
            sourceCity={memoData.preview_data.source_city}
            destinationCity={memoData.preview_data.destination_city}
            peerCohortStats={memoData.preview_data.peer_cohort_stats}
            capitalFlowData={memoData.preview_data.capital_flow_data}
            sections={['geographic']}
            renderMode={mode}
            isRelocating={memoData.preview_data.peer_cohort_stats?.is_relocating ?? memoData.preview_data.is_relocating ?? false}
          />
        </ReportSection>
      )}

      {hasTransparencySection && (
        <ReportSection mode={mode} motionEnabled={motionEnabled}>
          <TransparencyRegimeSection
            transparencyData={memoData.preview_data.transparency_data as any}
            content={memoData.preview_data.transparency_regime_impact}
            sourceJurisdiction={memoData.preview_data.source_jurisdiction}
            destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
          />
        </ReportSection>
      )}

      {hasRenderableRealAssetAudit && (
        <ReportSection mode={mode} reveal={{ direction: 'left' }} motionEnabled={motionEnabled}>
          <RealAssetAuditSection
            data={realAssetAudit!}
            sourceJurisdiction={memoData.preview_data.source_jurisdiction}
            destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
            transactionValue={
              memoData.preview_data.deal_overview?.target_size
                ? parseFloat(memoData.preview_data.deal_overview.target_size.replace(/[^0-9.]/g, '')) * 1000000
                : 0
            }
          />
        </ReportSection>
      )}

      {(memoData.preview_data.crisis_data || memoData.preview_data.crisis_resilience_stress_test) && (
        <ReportSection mode={mode} reveal={{ direction: 'scale' }} motionEnabled={motionEnabled}>
          <CrisisResilienceSection
            crisisData={memoData.preview_data.crisis_data as Record<string, unknown> | undefined}
            content={memoData.preview_data.crisis_resilience_stress_test}
            sourceJurisdiction={memoData.preview_data.source_jurisdiction}
            destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
          />
        </ReportSection>
      )}

      {memoData.preview_data.golden_visa_intelligence ? (
        <ReportSection mode={mode} reveal={{ direction: 'right' }} motionEnabled={motionEnabled}>
          <GoldenVisaIntelligenceSection
            intelligence={memoData.preview_data.golden_visa_intelligence}
            sourceJurisdiction={memoData.preview_data.source_jurisdiction}
            destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
          />
        </ReportSection>
      ) : (memoData.preview_data.destination_drivers?.visa_programs?.length ?? 0) > 0 ? (
        <ReportSection mode={mode} reveal={{ direction: 'right' }} motionEnabled={motionEnabled}>
          <GoldenVisaSection
            destinationDrivers={memoData.preview_data.destination_drivers}
            destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
          />
        </ReportSection>
      ) : null}

      {(memoData.preview_data.scenario_tree_analysis ||
        (memoData.preview_data.scenario_tree_data &&
          Object.keys(memoData.preview_data.scenario_tree_data).length > 0)) && (
        <ReportSection mode={mode} printClassName="print-scenario-tree" motionEnabled={motionEnabled}>
          <ScenarioTreeSection
            data={memoData.preview_data.scenario_tree_data || {}}
            rawAnalysis={memoData.preview_data.scenario_tree_analysis}
          />
        </ReportSection>
      )}

      {hasRenderableHeirManagement && (
        <ReportSection mode={mode} motionEnabled={motionEnabled}>
          <HeirManagementSection
            data={memoData.preview_data.heir_management_data || {}}
            rawAnalysis={memoData.preview_data.heir_management_analysis}
          />
        </ReportSection>
      )}

      {showImplementation && (
        <ReportSection mode={mode} motionEnabled={motionEnabled}>
          <Page1TaxDashboard
            totalSavings={memoData.preview_data.total_savings ?? ''}
            exposureClass={memoData.preview_data.exposure_class ?? ''}
            sourceJurisdiction={memoData.preview_data.source_jurisdiction ?? ''}
            destinationJurisdiction={memoData.preview_data.destination_jurisdiction ?? ''}
            sourceCity={memoData.preview_data.source_city}
            destinationCity={memoData.preview_data.destination_city}
            executionSequence={memoData.preview_data.execution_sequence}
            sourceTaxRates={memoData.preview_data.source_tax_rates || memoData.preview_data.tax_differential?.source}
            destinationTaxRates={memoData.preview_data.destination_tax_rates || memoData.preview_data.tax_differential?.destination}
            taxDifferential={memoData.preview_data.tax_differential}
            sections={['implementation']}
          />
        </ReportSection>
      )}

      <ReportSection mode={mode} motionEnabled={motionEnabled}>
        <div className="relative overflow-hidden bg-gradient-to-br from-card via-card to-muted/20 border border-border rounded-2xl sm:rounded-3xl p-6 sm:p-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
              Route Evidence Review Complete
              </h3>
              <p className="text-sm text-muted-foreground max-w-xl">
                This audit
                {developmentCount > 0 ? (
                  <>
                    {' '}analyzed{' '}
                    <span className="text-foreground font-medium">
                      {Number(developmentCount).toLocaleString()} source records
                    </span>
                    , and
                  </>
                ) : null}
                {' '}matched{' '}
                <span className="text-foreground font-medium">
                  {failurePatternEvidenceLabel}
                </span>
                , and applied{' '}
                <span className="text-foreground font-medium">
                  {Number(sequencingRulesApplied || 0).toLocaleString()} sequencing rules
                </span>
                .
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Reference</p>
                <p className="text-sm font-mono font-medium text-primary">
                  {canonicalReference}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center max-w-3xl mx-auto">
              Pattern &amp; Market Intelligence Report based on{' '}
              {resolvedCorridorSignalsCount.toLocaleString()}+ analyzed corridor signals.
              This report provides strategic intelligence and pattern analysis for informed decision-making.
              For execution and implementation, consult your legal, tax, and financial advisory teams.
            </p>
          </div>
        </div>
      </ReportSection>

      {mode === 'screen' && onShare && (
        <ReportSection mode={mode} motionEnabled={motionEnabled}>
          <div className="print:hidden space-y-6">
            <div className="flex justify-center">
              <button
                onClick={onShare}
                className={`inline-flex items-center gap-2.5 px-8 py-3 border-2 rounded-xl text-sm font-medium transition-colors ${
                  linkCopied
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-foreground hover:bg-muted'
                }`}
              >
                {linkCopied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Link Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    Share This Audit
                  </>
                )}
              </button>
            </div>

            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-primary/25 bg-card p-6 sm:p-10">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

              <div className="relative z-10 mx-auto max-w-4xl">
                <p className="text-xs sm:text-sm font-bold text-primary uppercase tracking-widest mb-4">
                  Release Readiness Request
                </p>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground tracking-tight mb-4">
                  Have a live wealth move that should not harden yet?
                </h3>

                <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                  Share your name, email, phone, and a brief description of the live move. We return with the evidence scope, release gates, and adviser question pack needed before capital, title, authority, or custody moves.
                </p>

                <ReleaseReadinessInquiryForm
                  intakeId={intakeId}
                  reference={canonicalReference}
                />
              </div>
            </div>
          </div>
        </ReportSection>
      )}

      {legalReferences && (legalReferences.total_count ?? 0) > 0 && (
        <ReportSection
          mode={mode}
          screenClassName="mb-10 sm:mb-16 px-4 sm:px-8 lg:px-12"
          motionEnabled={motionEnabled}
        >
          <ReferencesSection
            references={legalReferences}
            developmentsCount={resolvedDevelopmentsCount ?? 0}
            precedentCount={resolvedCorridorSignalsCount}
          />
        </ReportSection>
      )}

      {regulatoryCitations && Array.isArray(regulatoryCitations) && regulatoryCitations.length > 0 && (
        <ReportSection
          mode={mode}
          screenClassName="mb-10 sm:mb-16 px-4 sm:px-8 lg:px-12"
          motionEnabled={motionEnabled}
        >
          <RegulatorySourcesSection citations={regulatoryCitations as any} />
        </ReportSection>
      )}

      {includeFramingPages && (
        <ReportSection
          mode={mode}
          reveal={{ direction: 'scale', duration: 1.0 }}
          printClassName="print-framing-page"
          printStyle={{ padding: 0 }}
          motionEnabled={motionEnabled}
        >
          <MemoLastPage
            intakeId={intakeId}
            precedentCount={resolvedCorridorSignalsCount}
            generatedAt={memoData.generated_at}
            viaNegativa={viaNegativaContext}
          />
        </ReportSection>
      )}
    </>
  );

  if (mode === 'print') {
    return (
      <DecisionMemoRenderProvider motionEnabled={motionEnabled}>
        <div ref={printContainerRef} className="print-container bg-background text-foreground">
          <PrintPaginationOptimizer containerRef={printContainerRef} />
          {showPrintChrome ? <div className="print-watermark" aria-hidden="true">CONFIDENTIAL</div> : null}
          {showPrintChrome ? <div className="print-hc-badge" aria-hidden="true">HC</div> : null}
          {reportBody}
        </div>
      </DecisionMemoRenderProvider>
    );
  }

  return (
    <DecisionMemoRenderProvider motionEnabled={motionEnabled}>
      <div className="space-y-12 sm:space-y-20">{reportBody}</div>
    </DecisionMemoRenderProvider>
  );
}
