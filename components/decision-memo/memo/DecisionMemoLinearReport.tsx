'use client';

import { useRef, type CSSProperties, type ReactNode } from 'react';
import { Check, Share2 } from 'lucide-react';
import { SectionReveal } from '@/components/ui/section-reveal';
import { computeMemoProps } from '@/lib/decision-memo/compute-memo-props';
import { resolveDecisionMemoDisplayReference } from '@/lib/decision-memo/memo-id-aliases';
import { resolveIntelligenceBasisCounts } from '@/lib/decision-memo/resolve-intelligence-basis-counts';
import type { PdfMemoData } from '@/lib/pdf/pdf-types';
import { DecisionMemoRenderProvider } from './decision-memo-render-context';
import { MemoCoverPage } from './MemoCoverPage';
import { PrintPaginationOptimizer } from './PrintPaginationOptimizer';
import HouseGradeMemoSection from './HouseGradeMemoSection';
import { MemoLastPage } from './MemoLastPage';
import { ReleaseReadinessInquiryForm } from './ReleaseReadinessInquiryForm';

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
  const canonicalReference = resolveDecisionMemoDisplayReference(intakeId);
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

  const resolvedDevelopmentsCount = intelligenceBasisCounts.developmentsCount ?? 0;
  const resolvedCorridorSignalsCount = intelligenceBasisCounts.corridorSignalsCount ?? 0;

  const {
    latestGeneratedAt,
    routeEvidenceBasisNote,
    routeHeadlineMetric,
    coverHeadlineMetric,
    viaNegativaContext,
  } = computeMemoProps(memoData);

  const canonicalGeneratedAt = latestGeneratedAt || memoData.generated_at;
  const houseGradeMemo =
    memoData.preview_data.house_grade_memo ||
    resolvedArtifact.house_grade_memo ||
    resolvedArtifact.artifact?.house_grade_memo;
  const legalReferences = memoData.preview_data.legal_references;

  const reportBody = (
    <>
      {includeFramingPages && (
        <ReportSection
          mode={mode}
          reveal={{ direction: 'scale', duration: 1.0 }}
          printClassName="print-framing-page"
          printStyle={{ padding: 0 }}
          motionEnabled={motionEnabled}
        >
          <MemoCoverPage
            intakeId={intakeId}
            sourceJurisdiction={memoData.preview_data.source_jurisdiction}
            destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
            generatedAt={canonicalGeneratedAt}
            exposureClass={memoData.preview_data.exposure_class}
            totalSavings={coverHeadlineMetric?.value || routeHeadlineMetric?.value}
            headlineMetricLabel={coverHeadlineMetric?.label || routeHeadlineMetric?.label}
            viaNegativa={viaNegativaContext}
          />
        </ReportSection>
      )}

      <ReportSection
        mode={mode}
        reveal={{ delay: 0.06, direction: 'up' }}
        screenClassName="mx-auto w-full max-w-[1720px] px-4 sm:px-8 lg:px-12 2xl:px-16"
        motionEnabled={motionEnabled}
      >
        <HouseGradeMemoSection
          data={houseGradeMemo}
          previewData={memoData.preview_data as Record<string, any>}
          references={legalReferences}
          developmentsCount={resolvedDevelopmentsCount}
          precedentCount={resolvedCorridorSignalsCount}
          routeEvidenceBasisNote={routeEvidenceBasisNote}
          sourceJurisdiction={memoData.preview_data.source_jurisdiction}
          destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
          onCitationClick={onCitationClick}
          citationMap={citationMap}
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
