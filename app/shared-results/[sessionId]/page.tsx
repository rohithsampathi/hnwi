// app/shared-results/[sessionId]/page.tsx
// Public shareable assessment results - no authentication required

"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Share2, ArrowRight } from 'lucide-react';
import { useAssessmentAPI } from '@/lib/hooks/useAssessmentAPI';
import { AssessmentResults } from '@/lib/hooks/useAssessmentState';
import type { Citation } from '@/lib/parse-dev-citations';
import dynamic from 'next/dynamic';
import { useCitationManager } from '@/hooks/use-citation-manager';
import { EliteCitationPanel } from '@/components/elite/elite-citation-panel';
import { AssessmentResultsHeader } from '@/components/assessment/AssessmentResultsHeader';
import { DigitalTwinSimulation } from '@/components/assessment/DigitalTwinSimulation';
import { GapAnalysisSection } from '@/components/assessment/GapAnalysisSection';
import { CrownLoader } from '@/components/ui/crown-loader';

// Dynamic import for InteractiveWorldMap
const InteractiveWorldMap = dynamic(
  () => import('@/components/interactive-world-map').then(mod => ({ default: mod.InteractiveWorldMap })),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    )
  }
);

export default function SharedResultsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [loading, setLoading] = useState(true);
  const retryCountRef = useRef(0);
  const hasLoadedRef = useRef(false);
  const [screenSize, setScreenSize] = useState<'mobile' | 'desktop'>('desktop');

  // Map filter toggles
  const [showPriveOpportunities, setShowPriveOpportunities] = useState(true);
  const [showHNWIPatterns, setShowHNWIPatterns] = useState(true);

  // Citation management
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

  const { getResults } = useAssessmentAPI();

  // Convert briefs_cited to Citation format
  useEffect(() => {
    if (results?.briefs_cited && results.briefs_cited.length > 0) {
      const citationList: Citation[] = results.briefs_cited.map((briefId, index) => ({
        id: briefId,
        number: index + 1,
        originalText: `[DEVID-${briefId}]`
      }));
      setCitations(citationList);
    }
  }, [results, setCitations]);

  // Screen size detection
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

  useEffect(() => {
    if (hasLoadedRef.current) {
      return;
    }

    const maxRetries = 10;
    let timeoutId: NodeJS.Timeout;

    const fetchResults = async () => {
      if (hasLoadedRef.current) {
        return;
      }

      try {
        const data = await getResults(sessionId);

        hasLoadedRef.current = true;
        setResults(data);
        setLoading(false);
      } catch (err) {
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          timeoutId = setTimeout(fetchResults, 3000);
        } else {
          hasLoadedRef.current = true;
          setLoading(false);
          alert('Results not found. This assessment may no longer be available.');
          router.push('/assessment');
        }
      }
    };

    fetchResults();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [sessionId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <CrownLoader
          size="lg"
          text="Loading Shared Results"
          subtext="Retrieving strategic DNA profile..."
        />
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h2 className="text-2xl font-bold mb-4">Results Not Found</h2>
          <p className="text-muted-foreground mb-6">
            This assessment may no longer be available or the link may be invalid.
          </p>
          <button
            onClick={() => router.push('/assessment')}
            className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-all"
          >
            Take Your Own Assessment
          </button>
        </div>
      </div>
    );
  }

  const outcome = results.simulation?.outcome || 'DAMAGED';
  const comprehensiveScore = results.confidence ? results.confidence * 10 : 0;

  // Extract opportunities
  const opportunities = results.personalized_opportunities ||
    (results.answers?.flatMap((answer: any) => answer.opportunities || []) || []);

  // Tier display
  const tierTitle = results.tier.charAt(0).toUpperCase() + results.tier.slice(1) + ' Classification';

  return (
    <>
      <div className="bg-background text-foreground">
        {/* Shared Badge */}
        <div className="bg-primary/10 border-b border-primary/20 py-3 px-4">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <Share2 className="w-5 h-5 text-primary" />
            <p className="text-sm text-foreground">
              <span className="font-semibold">Shared Assessment Results</span>
              <span className="text-muted-foreground ml-2">— Want to discover your own DNA?</span>
            </p>
          </div>
        </div>

        {/* Sticky Header - Tier Classification */}
        <AssessmentResultsHeader
          tier={results.tier}
          tierTitle={tierTitle}
          forensicVerdict=""
          comprehensiveScore={comprehensiveScore}
        />

        {/* Content Area */}
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8 relative z-10">
          {/* Personalized Opportunities Map */}
          {opportunities && opportunities.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative z-10"
            >
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
                <Globe className="w-6 h-6 text-primary" strokeWidth={2} />
                <h2 className="text-xl font-bold">Personalized Opportunities</h2>
              </div>

              <div className="bg-card border border-border overflow-hidden rounded-lg">
                <div className="p-4 border-b border-border bg-muted/30">
                  <p className="text-sm text-muted-foreground">
                    This <span className="font-bold text-primary">{results.tier.toUpperCase()}</span> profile identified <span className="font-bold text-foreground">{opportunities.length} opportunities</span> aligned with their strategic DNA.
                  </p>
                </div>

                <div className="h-[600px] relative">
                  {opportunities.filter((opp: any) => opp.latitude && opp.longitude).length > 0 ? (
                    <InteractiveWorldMap
                      cities={opportunities}
                      showControls={true}
                      showCrownAssets={false}
                      showPriveOpportunities={showPriveOpportunities}
                      showHNWIPatterns={showHNWIPatterns}
                      onToggleCrownAssets={() => {}}
                      onTogglePriveOpportunities={() => setShowPriveOpportunities(!showPriveOpportunities)}
                      onToggleHNWIPatterns={() => setShowHNWIPatterns(!showHNWIPatterns)}
                      hideCrownAssetsToggle={true}
                      useAbsolutePositioning={true}
                      onCitationClick={openCitation}
                      citationMap={citationMap}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
                      <p className="text-muted-foreground text-sm">
                        Opportunities data is being processed.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.section>
          )}

          {/* Digital Twin Simulation */}
          <DigitalTwinSimulation
            outcome={outcome as 'SURVIVED' | 'DAMAGED' | 'DESTROYED'}
            narrative={results.simulation?.simulation_narrative || ''}
            onCitationClick={openCitation}
          />

          {/* Gap Analysis & Intelligence Sources */}
          <GapAnalysisSection
            gapAnalysis={results.gap_analysis || ''}
            briefsCited={results.briefs_cited}
            onCitationClick={openCitation}
          />

          {/* Take Assessment CTA - Prominent */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center py-12 bg-gradient-to-b from-primary/5 to-transparent rounded-2xl border border-primary/20"
          >
            <h3 className="text-2xl font-bold mb-3">Discover Your Strategic DNA</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Take the assessment to unlock your personalized HNWI intelligence report and opportunity map.
            </p>
            <button
              onClick={() => router.push('/assessment')}
              className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-primary hover:opacity-90 text-primary-foreground font-bold transition-all rounded-2xl text-lg"
            >
              Take the Assessment
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-xs text-muted-foreground mt-4">
              Free • 10 questions • 8 minutes
            </p>
          </motion.div>
        </div>
      </div>

      {/* Citation Panel - Desktop Only */}
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

      {/* Mobile Citation Panel */}
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
    </>
  );
}
