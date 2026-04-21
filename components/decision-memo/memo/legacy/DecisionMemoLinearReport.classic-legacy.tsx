'use client';

import { useRef, type CSSProperties, type ReactNode } from 'react';
import { ArrowRight, Check, Share2 } from 'lucide-react';
import { SectionReveal } from '@/components/ui/section-reveal';
import { computeMemoProps } from '@/lib/decision-memo/compute-memo-props';
import { computeRiskRadarScores } from '@/lib/decision-memo/compute-risk-radar-scores';
import { resolveIntelligenceBasisCounts } from '@/lib/decision-memo/resolve-intelligence-basis-counts';
import type { PdfMemoData } from '@/lib/pdf/pdf-types';
import { DecisionMemoRenderProvider } from './decision-memo-render-context';
import { MemoCoverPage } from './MemoCoverPage';
import { AuditOverviewSection } from './AuditOverviewSection';
import { MemoHeader } from './MemoHeader';
import { PrintPaginationOptimizer } from './PrintPaginationOptimizer';
import { RiskRadarChart } from './RiskRadarChart';
import { Page2AuditVerdict } from './Page2AuditVerdict';
import { LiquidityTrapFlowchart } from './LiquidityTrapFlowchart';
import { CrossBorderTaxAudit } from './CrossBorderTaxAudit';
import { PeerBenchmarkTicker } from './PeerBenchmarkTicker';
import { StructureComparisonMatrix } from './StructureComparisonMatrix';
import { Page1TaxDashboard } from './Page1TaxDashboard';
import { RegimeIntelligenceSection } from './RegimeIntelligenceSection';
import WealthProjectionSection from './WealthProjectionSection';
import { Page3PeerIntelligence } from './Page3PeerIntelligence';
import HNWITrendsSection from './HNWITrendsSection';
import { TransparencyRegimeSection } from './TransparencyRegimeSection';
import RealAssetAuditSection from './RealAssetAuditSection';
import { CrisisResilienceSection } from './CrisisResilienceSection';
import GoldenVisaIntelligenceSection from './GoldenVisaIntelligenceSection';
import GoldenVisaSection from './GoldenVisaSection';
import ScenarioTreeSection from './ScenarioTreeSection';
import HeirManagementSection from './HeirManagementSection';
import ReferencesSection from './ReferencesSection';
import { RegulatorySourcesSection } from './RegulatorySourcesSection';
import { MemoLastPage } from './MemoLastPage';

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
  } = computeMemoProps(memoData);

  const doctrineMetadata = memoData.preview_data.scenario_tree_data?.doctrine_metadata;
  const riskRadar = doctrineMetadata ? computeRiskRadarScores(memoData, isViaNegativa) : null;
  const legalReferences = memoData.preview_data.legal_references;
  const regulatoryCitations =
    memoData.preview_data?.regulatory_citations || legalReferences?.regulatory_sources || [];

  const acqAudit = crossBorderAudit?.acquisition_audit;
  const liquidityTrapProps = acqAudit
    ? (() => {
        const propertyValue = acqAudit.property_value || 0;
        const totalCost = acqAudit.total_acquisition_cost || 0;
        const absd = acqAudit.absd_additional_stamp_duty || 0;
        const bsd = acqAudit.bsd_stamp_duty || 0;
        const otherCosts = totalCost - propertyValue - absd - bsd;
        const hasMajorABSD = absd > 0;

        return {
          capitalIn: totalCost,
          capitalOut: propertyValue,
          primaryBarrier: hasMajorABSD ? `ABSD (${((absd / propertyValue) * 100).toFixed(0)}%)` : 'Stamp Duties',
          primaryBarrierCost: hasMajorABSD ? absd : absd + bsd,
          secondaryBarrier: hasMajorABSD
            ? bsd > 0
              ? 'BSD + Transfer Taxes'
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
    0;
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
            totalSavings={memoData.preview_data.total_savings}
            viaNegativa={viaNegativaContext}
          />
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
          dataQuality={memoData.preview_data.peer_cohort_stats?.data_quality}
          dataQualityNote={memoData.preview_data.peer_cohort_stats?.data_quality_note}
          mitigationTimeline={resolvedBackendData.mitigationTimeline || resolvedBackendData.risk_assessment?.mitigation_timeline}
          riskAssessment={resolvedBackendData.risk_assessment || memoData.preview_data.risk_assessment}
          viaNegativa={isViaNegativa ? viaNegativaContext : undefined}
        />
      </ReportSection>

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

      {hasTransparencySection && (
        <ReportSection mode={mode} motionEnabled={motionEnabled}>
          <TransparencyRegimeSection
            transparencyData={memoData.preview_data.transparency_data}
            content={memoData.preview_data.transparency_regime_impact}
            sourceJurisdiction={memoData.preview_data.source_jurisdiction}
            destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
          />
        </ReportSection>
      )}

      {memoData.preview_data.real_asset_audit && (
        <ReportSection mode={mode} reveal={{ direction: 'left' }} motionEnabled={motionEnabled}>
          <RealAssetAuditSection
            data={memoData.preview_data.real_asset_audit}
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
            crisisData={memoData.preview_data.crisis_data}
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

      {(memoData.preview_data.heir_management_analysis ||
        (memoData.preview_data.heir_management_data &&
          Object.keys(memoData.preview_data.heir_management_data).length > 0)) && (
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
              Pattern Intelligence Complete
              </h3>
              <p className="text-sm text-muted-foreground max-w-xl">
                This audit
                {developmentCount > 0 ? (
                  <>
                    {' '}analyzed{' '}
                    <span className="text-foreground font-medium">
                      {Number(developmentCount).toLocaleString()} validated developments
                    </span>
                    , and
                  </>
                ) : null}
                {' '}matched{' '}
                <span className="text-foreground font-medium">
                  {Number(failurePatternsMatched || 0).toLocaleString()} failure patterns
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
                  {intakeId.slice(0, 20).toUpperCase()}
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

            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-card to-primary/10 p-8 sm:p-12">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />

              <div className="relative z-10 text-center max-w-2xl mx-auto">
                <p className="text-xs sm:text-sm font-bold text-primary uppercase tracking-widest mb-4">
                  Pattern Recognition Engine
                </p>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground tracking-tight mb-4">
                  DOES YOUR NEXT DEAL SURVIVE THE RED TEAM?
                </h3>

                <p className="text-sm text-muted-foreground mb-4 max-w-lg mx-auto leading-relaxed">
                  The same system that produced this analysis stress-tests high-value Alternative Asset acquisitions (Art, Real Estate, Collectibles) across 50+ jurisdictions.
                </p>

                <p className="text-sm text-foreground font-medium mb-2">Result: Certainty.</p>
                <p className="text-sm text-foreground font-medium mb-8">Turnaround: 48 Hours.</p>

                <p className="text-xs font-semibold text-primary/80 uppercase tracking-wider mb-6">
                  {(() => {
                    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                    return `${monthNames[new Date().getMonth()]} Allocation: Accepting Mandates`;
                  })()}
                </p>

                <div className="flex justify-center">
                  <a
                    href="/decision-memo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-10 py-4 bg-primary text-primary-foreground font-bold rounded-xl text-sm tracking-wide hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                  >
                    INITIATE RED TEAM AUDIT ($5,000)
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
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
