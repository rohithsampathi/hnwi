'use client';

import { useRef, type CSSProperties, type ReactNode } from 'react';
import { ArrowRight, Check, Share2 } from 'lucide-react';
import { SectionReveal } from '@/components/ui/section-reveal';
import { computeMemoProps } from '@/lib/decision-memo/compute-memo-props';
import { resolveIntelligenceBasisCounts } from '@/lib/decision-memo/resolve-intelligence-basis-counts';
import type { PdfMemoData } from '@/lib/pdf/pdf-types';
import { DecisionMemoRenderProvider } from './decision-memo-render-context';
import { MemoCoverPage } from './MemoCoverPage';
import { PrintPaginationOptimizer } from './PrintPaginationOptimizer';
import HouseGradeMemoSection from './HouseGradeMemoSection';
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
  onShare,
  linkCopied = false,
  includeFramingPages = false,
  showPrintChrome = false,
  motionEnabled = false,
}: DecisionMemoLinearReportProps) {
  const printContainerRef = useRef<HTMLDivElement>(null);
  const resolvedBackendData = backendData ?? {};
  const resolvedArtifact =
    fullArtifact ??
    resolvedBackendData.fullArtifact ??
    resolvedBackendData.full_artifact ??
    (memoData as any).full_artifact ??
    {};
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
    viaNegativaContext,
    latestGeneratedAt,
    routeEvidenceBasisNote,
    routeHeadlineMetric,
  } = computeMemoProps(memoData);
  const canonicalGeneratedAt = latestGeneratedAt || memoData.generated_at;

  const legalReferences = memoData.preview_data.legal_references;
  const houseGradeMemo =
    memoData.preview_data.house_grade_memo ||
    resolvedArtifact.house_grade_memo ||
    resolvedArtifact.artifact?.house_grade_memo;

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
            generatedAt={canonicalGeneratedAt}
            exposureClass={memoData.preview_data.exposure_class}
            totalSavings={routeHeadlineMetric?.value || memoData.preview_data.total_savings}
            headlineMetricLabel={routeHeadlineMetric?.label}
            reportTitle="House-Governed Decision Memo"
            viaNegativa={viaNegativaContext}
          />
        </ReportSection>
      )}

      <ReportSection
        mode={mode}
        reveal={{ delay: 0.08, direction: 'up' }}
        screenClassName="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-12"
        motionEnabled={motionEnabled}
      >
        <HouseGradeMemoSection
          data={houseGradeMemo}
          crossBorderAudit={crossBorderAudit}
          transparencyData={memoData.preview_data.transparency_data}
          crisisData={memoData.preview_data.crisis_data}
          scenarioTreeData={memoData.preview_data.scenario_tree_data}
          heirData={memoData.preview_data.heir_management_data}
          hnwiTrends={memoData.preview_data.hnwi_trends}
          peerStats={memoData.preview_data.peer_cohort_stats}
          references={legalReferences}
          developmentsCount={resolvedDevelopmentsCount ?? 0}
          precedentCount={resolvedCorridorSignalsCount}
          routeEvidenceBasisNote={routeEvidenceBasisNote}
          sourceJurisdiction={memoData.preview_data.source_jurisdiction}
          destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
        />
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
