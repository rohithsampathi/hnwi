// app/(authenticated)/assessment/results/[sessionId]/page.tsx
// C10 Assessment results with Digital Twin simulation - HNWI Standard

"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Share2, Check, ArrowRight, Download } from 'lucide-react';
import { useAssessmentAPI } from '@/lib/hooks/useAssessmentAPI';
import { AssessmentResults } from '@/lib/hooks/useAssessmentState';
import { downloadPDF as generateAndDownloadPDF } from '@/lib/pdf-generator';
import type { Citation } from '@/lib/parse-dev-citations';
import dynamic from 'next/dynamic';
import { useCitationManager } from '@/hooks/use-citation-manager';
import { EliteCitationPanel } from '@/components/elite/elite-citation-panel';
import { AssessmentResultsHeader } from '@/components/assessment/AssessmentResultsHeader';
import { DigitalTwinSimulation } from '@/components/assessment/DigitalTwinSimulation';
import { GapAnalysisSection } from '@/components/assessment/GapAnalysisSection';
import { TierPricingModal } from '@/components/assessment/TierPricingModal';
import { getCurrentUser, isAuthenticated } from '@/lib/auth-manager';
import { secureApi } from '@/lib/secure-api';
import { CrownLoader } from '@/components/ui/crown-loader';

// Dynamic import for InteractiveWorldMap to avoid SSR issues with Leaflet
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

// Removed TIER_CONFIG and OUTCOME_CONFIG - now handled by modular components

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [loading, setLoading] = useState(true);
  const retryCountRef = useRef(0);
  const hasLoadedRef = useRef(false);
  const [screenSize, setScreenSize] = useState<'mobile' | 'desktop'>('desktop');

  // Map filter toggles (no Crown Assets for assessment results)
  const [showPriveOpportunities, setShowPriveOpportunities] = useState(true);
  const [showHNWIPatterns, setShowHNWIPatterns] = useState(true);

  // Pricing modal state
  const [pricingModalOpen, setPricingModalOpen] = useState(false);

  // Share state
  const [copied, setCopied] = useState(false);

  // Authentication state
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

  // Citation management (using same hook as home dashboard)
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

  // Screen size detection for mobile/desktop (matching home dashboard)
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

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      const user = getCurrentUser();
      const authenticated = isAuthenticated();
      setIsUserAuthenticated(!!user || authenticated);
    };

    checkAuth();

    // Listen for auth changes
    const handleAuthChange = () => checkAuth();
    window.addEventListener('auth:login', handleAuthChange);
    window.addEventListener('auth:logout', handleAuthChange);

    return () => {
      window.removeEventListener('auth:login', handleAuthChange);
      window.removeEventListener('auth:logout', handleAuthChange);
    };
  }, []);

  useEffect(() => {
    if (hasLoadedRef.current) return;

    const fetchResults = async () => {
      if (hasLoadedRef.current) return;

      try {
        const data = await getResults(sessionId);

        hasLoadedRef.current = true;
        setResults(data);
        setLoading(false);
      } catch (err: any) {
        // Retry a few times in case results are still being generated
        if (retryCountRef.current < 3) {
          retryCountRef.current++;
          setTimeout(fetchResults, 2000);
        } else {
          // After retries, redirect to assessment landing page
          hasLoadedRef.current = true;
          router.replace('/assessment');
        }
      }
    };

    fetchResults();
  }, [sessionId, router, getResults]);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/shared-results/${sessionId}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (e) {
        alert('Failed to copy URL. Please copy manually: ' + shareUrl);
      }
      document.body.removeChild(textarea);
    }
  };

  const handleDownloadPDF = async () => {
    if (!results) {
      alert('Results not loaded yet. Please wait.');
      return;
    }

    try {
      // Enrich brief IDs with titles from citationMap
      const enrichedBriefs = (results.briefs_cited || []).map((briefId: string) => {
        const briefData = citationMap.get(briefId);
        return {
          id: briefId,
          title: briefData?.title || `Development Brief ${briefId}`,
          date: briefData?.published_date || briefData?.date
        };
      });

      // Always generate client-side PDF from results data
      const pdfData = {
        report_metadata: {
          session_id: sessionId,
          generated_at: new Date().toISOString(),
          version: '1.0',
          neural_signature: results.forensic_validation?.verdict || 'verified_human'
        },
        tier_classification: {
          tier: results.tier,
          confidence: results.confidence,
          reasoning_trace: results.reasoning_trace || ''
        },
        simulation_results: {
          outcome: results.simulation?.outcome || 'UNKNOWN',
          narrative: results.simulation?.simulation_narrative || '',
          reasoning_trace: results.simulation?.reasoning_trace || ''
        },
        gap_analysis: results.gap_analysis || '',
        forensic_validation: {
          verdict: results.forensic_validation?.verdict || 'unknown',
          confidence: results.forensic_validation?.confidence || 0,
          evidence: {
            avg_response_time: results.forensic_validation?.evidence?.avg_response_time || 0,
            pattern_consistency: results.forensic_validation?.evidence?.pattern_consistency || 'unknown'
          }
        },
        answers: results.answers || [],
        intelligence_briefs: enrichedBriefs
      };

      generateAndDownloadPDF(pdfData, sessionId);
    } catch (err) {
      alert('Failed to generate PDF. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <CrownLoader
          size="lg"
          text="Loading Your Results"
          subtext="Analyzing your strategic DNA profile..."
        />
      </div>
    );
  }

  // If no results after loading, will redirect to assessment (handled in useEffect above)
  if (!results) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <CrownLoader
          size="lg"
          text="Redirecting"
          subtext="Taking you to the assessment..."
        />
      </div>
    );
  }

  const outcome = results.simulation?.outcome || 'DAMAGED';
  const comprehensiveScore = results.confidence ? results.confidence * 10 : 0;

  // Extract opportunities from answers if not in personalized_opportunities
  const opportunities = results.personalized_opportunities ||
    (results.answers?.flatMap((answer: any) => answer.opportunities || []) || []);

  // Tier display formatting
  const tierTitle = results.tier.charAt(0).toUpperCase() + results.tier.slice(1) + ' Classification';

  // Handle payment success for Operator/Observer tiers
  const handlePaymentSuccess = (tier: 'operator' | 'observer') => {

    // Show success message
    alert(`Payment successful! Welcome to ${tier.charAt(0).toUpperCase() + tier.slice(1)} tier. You now have lifetime access to HNWI Chronicles intelligence.`);

    // Redirect to dashboard
    router.push('/dashboard');
  };

  // Handle Architect form submission
  const handleArchitectSubmit = async (email: string, whatsapp: string) => {
    try {
      const response = await fetch('/api/assessment/architect-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          email,
          whatsapp,
          tier: 'architect'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit inquiry');
      }
    } catch (err) {
      throw new Error('Failed to submit. Please try again.');
    }
  };

  return (
    <>
      <div className="bg-background text-foreground -mx-8 -mt-2">
        {/* Sticky Header - Tier Classification */}
        <AssessmentResultsHeader
          tier={results.tier}
          tierTitle={tierTitle}
          forensicVerdict=""
          comprehensiveScore={comprehensiveScore}
        />

        {/* Content Area - Scrolls with page */}
        <div className="max-w-5xl mx-auto px-8 py-8 space-y-8 relative z-10">
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
                <h2 className="text-xl font-bold">Your Personalized Opportunities</h2>
              </div>

              <div className="bg-card border border-border overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/30">
                  <p className="text-sm text-muted-foreground">
                    Based on your <span className="font-bold text-primary">{results.tier.toUpperCase()}</span> classification, we've identified <span className="font-bold text-foreground">{opportunities.length} opportunities</span> aligned with your strategic profile across global markets.
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
                        Opportunities data is being processed. Location data will be available shortly.
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

          {/* See My Options Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center py-12"
          >
            <button
              onClick={() => setPricingModalOpen(true)}
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary hover:opacity-90 text-primary-foreground font-bold transition-all rounded-lg text-lg shadow-lg"
            >
              See My Options
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-xs text-muted-foreground mt-4">
              Unlock exclusive HNWI intelligence and opportunities
            </p>
          </motion.div>

          {/* Share & Download Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="bg-card/60 backdrop-blur-xl border border-primary/30 rounded-2xl p-6"
          >
            <div className="flex flex-col gap-6">
              {/* Share Results Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-primary/10 rounded-lg border border-primary/30 flex-shrink-0">
                    <Share2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold mb-1">Share Your Results</h3>
                    <p className="text-sm text-muted-foreground">
                      Share your strategic DNA profile with colleagues or partners
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleShare}
                  className="group flex items-center justify-center gap-2 px-6 py-3 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg transition-all text-sm font-medium text-foreground whitespace-nowrap"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-primary" />
                      <span>Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="border-t border-primary/20" />

              {/* Download PDF Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-primary/10 rounded-lg border border-primary/30 flex-shrink-0">
                    <Download className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold mb-1">Download Full Report</h3>
                    <p className="text-sm text-muted-foreground">
                      Get your complete assessment as a PDF document
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDownloadPDF}
                  className="group flex items-center justify-center gap-2 px-6 py-3 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg transition-all text-sm font-medium text-foreground whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Return to Dashboard - Only for authenticated users */}
          {isUserAuthenticated && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 1.0 }}
              className="text-center pt-4"
            >
              <a
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Return to Dashboard
              </a>
            </motion.div>
          )}
        </div>
      </div>

      {/* Tier Pricing Modal */}
      <TierPricingModal
        isOpen={pricingModalOpen}
        onClose={() => setPricingModalOpen(false)}
        currentTier={results.tier}
        sessionId={sessionId}
        onArchitectSubmit={handleArchitectSubmit}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Citation Panel - Desktop Only (matching home dashboard) */}
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
    </>
  );
}
