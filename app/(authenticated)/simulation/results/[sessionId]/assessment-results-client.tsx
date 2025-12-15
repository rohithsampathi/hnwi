// app/(authenticated)/assessment/results/[sessionId]/assessment-results-client.tsx
// Client component for C10 Simulation results with Digital Twin simulation

"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Share2, Check, ArrowRight, Download } from 'lucide-react';
import { useAssessmentAPI } from '@/lib/hooks/useAssessmentAPI';
import { AssessmentResults } from '@/lib/hooks/useAssessmentState';
import { downloadPDF as generateAndDownloadPDF } from '@/lib/pdf-generator';
import type { EnhancedReportData } from '@/types/assessment-report';
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
import {
  ExecutiveSummary,
  SpiderGraphComparison,
  CelebrityOpportunities,
  StrategicPositioningGaps,
  StrategicInsightsInfographic
} from '@/components/report';

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

export default function AssessmentResultsClient() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingEnhancedReport, setLoadingEnhancedReport] = useState(false);
  const retryCountRef = useRef(0);
  const hasLoadedRef = useRef(false);
  const [screenSize, setScreenSize] = useState<'mobile' | 'desktop'>('desktop');

  // Map filter toggles (no Crown Assets for simulation results)
  const [showPriveOpportunities, setShowPriveOpportunities] = useState(true);
  const [showHNWIPatterns, setShowHNWIPatterns] = useState(true);

  // Pricing modal state
  const [pricingModalOpen, setPricingModalOpen] = useState(false);

  // Share state
  const [copied, setCopied] = useState(false);

  // Authentication state
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

  // HNWI World count
  const [hnwiWorldCount, setHnwiWorldCount] = useState<number>(1860); // Default fallback

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

  // Convert briefs_cited + celebrity_opportunities + personalized_opportunities analysis to Citation format (ZERO DUPLICATES GUARANTEED)
  useEffect(() => {
    if (!results) return;

    // Collect all unique DEVIDs with aggressive deduplication
    const allDevIds = new Set<string>();
    const seenIds = new Map<string, boolean>(); // Extra layer of duplicate prevention

    // 1. Add intelligence briefs (briefs_cited)
    if (results.briefs_cited && results.briefs_cited.length > 0) {
      results.briefs_cited.forEach((briefId: string) => {
        // Normalize: trim whitespace and convert to lowercase for comparison
        const normalized = String(briefId).trim().toLowerCase();
        if (normalized && !seenIds.has(normalized)) {
          allDevIds.add(briefId.trim()); // Add original (trimmed) to Set
          seenIds.set(normalized, true);
        }
      });
    }

    // 2. Add HNWI peer opportunities (celebrity_opportunities)
    if (results.enhanced_report?.celebrity_opportunities?.celebrity_opportunities) {
      results.enhanced_report.celebrity_opportunities.celebrity_opportunities.forEach((opp: any) => {
        if (opp.devid) {
          // Normalize: trim whitespace and convert to lowercase for comparison
          const normalized = String(opp.devid).trim().toLowerCase();
          if (normalized && !seenIds.has(normalized)) {
            allDevIds.add(String(opp.devid).trim()); // Add original (trimmed) to Set
            seenIds.set(normalized, true);
          }
        }
      });
    }

    // 3. CRITICAL FIX: Extract DEVIDs from personalized opportunities' analysis and elite_pulse_analysis
    const opportunities = results.personalized_opportunities ||
      (results.answers?.flatMap((answer: any) => answer.opportunities || []) || []);

    if (opportunities && opportunities.length > 0) {
      opportunities.forEach((opp: any) => {
        // Extract from analysis field
        if (opp.analysis) {
          const analysisMatches = opp.analysis.matchAll(/\[(?:Dev\s*ID|DEVID)\s*[:\-–—]\s*([^\]\r\n]+)\]/gi);
          for (const match of analysisMatches) {
            const devId = match[1]?.trim();
            if (devId) {
              const normalized = devId.toLowerCase();
              if (!seenIds.has(normalized)) {
                allDevIds.add(devId);
                seenIds.set(normalized, true);
              }
            }
          }
        }
        // Extract from elite_pulse_analysis field
        if (opp.elite_pulse_analysis) {
          const pulseMatches = opp.elite_pulse_analysis.matchAll(/\[(?:Dev\s*ID|DEVID)\s*[:\-–—]\s*([^\]\r\n]+)\]/gi);
          for (const match of pulseMatches) {
            const devId = match[1]?.trim();
            if (devId) {
              const normalized = devId.toLowerCase();
              if (!seenIds.has(normalized)) {
                allDevIds.add(devId);
                seenIds.set(normalized, true);
              }
            }
          }
        }
        // Extract from katherine_analysis field (Crown Vault)
        if ((opp as any).katherine_analysis) {
          const katherineMatches = (opp as any).katherine_analysis.matchAll(/\[(?:Dev\s*ID|DEVID)\s*[:\-–—]\s*([^\]\r\n]+)\]/gi);
          for (const match of katherineMatches) {
            const devId = match[1]?.trim();
            if (devId) {
              const normalized = devId.toLowerCase();
              if (!seenIds.has(normalized)) {
                allDevIds.add(devId);
                seenIds.set(normalized, true);
              }
            }
          }
        }
      });
    }

    // Convert to Citation format - Final deduplication pass
    if (allDevIds.size > 0) {
      const uniqueIds = Array.from(allDevIds);

      // Triple-check: Remove any duplicates that somehow made it through
      const finalUniqueIds = uniqueIds.filter((id, index, self) =>
        self.findIndex(i => i.toLowerCase().trim() === id.toLowerCase().trim()) === index
      );

      const citationList: Citation[] = finalUniqueIds.map((briefId, index) => ({
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

  // Fetch HNWI World development count
  useEffect(() => {
    async function fetchHNWICount() {
      try {
        const response = await fetch('/api/developments/counts');
        if (response.ok) {
          const data = await response.json();
          // Try different possible field names
          const count = data.developments?.total_count || data.total || data.count || data.total_count || data.briefs;
          if (count && typeof count === 'number') {
            setHnwiWorldCount(count);
          }
        }
      } catch (error) {
        // Keep default fallback value
      }
    }

    fetchHNWICount();
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

  // Poll for enhanced report if not available initially
  useEffect(() => {
    if (!results) return;

    // If enhanced report already exists, no need to poll
    if (results.enhanced_report?.full_analytics?.strategic_positioning) {
      return;
    }

    // Set loading state for enhanced report
    setLoadingEnhancedReport(true);

    let pollCount = 0;
    const maxPolls = 10; // Poll for up to 30 seconds (10 polls × 3 seconds)

    const pollForEnhancedReport = async () => {
      try {
        const data = await getResults(sessionId);

        // Check if enhanced report is now available
        if (data.enhanced_report?.full_analytics?.strategic_positioning) {
          setResults(data);
          setLoadingEnhancedReport(false);
          return true; // Stop polling
        }

        return false; // Continue polling
      } catch (err) {
        return false;
      }
    };

    const pollInterval = setInterval(async () => {
      pollCount++;

      const shouldStop = await pollForEnhancedReport();

      if (shouldStop || pollCount >= maxPolls) {
        clearInterval(pollInterval);
        if (pollCount >= maxPolls) {
          setLoadingEnhancedReport(false); // Stop showing loading state after max polls
        }
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [results, sessionId, getResults]);

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
      // Build enhanced report data structure for PDF
      const spider = results.enhanced_report?.full_analytics?.strategic_positioning?.spider_graph;

      // Transform celebrity opportunities to match expected format
      const celebrityOpps = (results.enhanced_report?.celebrity_opportunities?.celebrity_opportunities || []).map((opp: any) => ({
        opportunity: {
          id: opp.devid || opp.id || '',
          title: opp.title || '',
          category: opp.category || 'alternative_assets',
          location: opp.location || '',
          value: opp.value || ''
        },
        top_performer_stats: {
          adopter_count: opp.peer_count || 0,
          avg_performance_percentile: 0,
          success_stories: []
        },
        financial_metrics: {
          avg_roi: opp.performance_data?.avg_roi || 0,
          median_investment: 0,
          time_horizon: '24 months'
        },
        alignment_score: opp.match_score || 0,
        why_valuable: []
      }));

      // Transform improvement areas
      const improvementAreas = spider ? (spider.improvement_areas || []).map((dimName: string) => {
        const dim = spider.dimensions.find((d: any) => d.name === dimName);
        if (!dim) return null;

        const gap = dim.top_0_1_percentile - dim.user_score;
        return {
          dimension: dimName,
          current_score: dim.user_score / 10,
          target_score: dim.top_0_1_percentile / 10,
          gap: gap / 10,
          improvement_potential: (gap / dim.top_0_1_percentile) * 100,
          actionable_steps: []
        };
      }).filter((a: any) => a !== null) : [];

      const enhancedReportData: EnhancedReportData = {
        session_id: sessionId,
        user_id: results.user_id || '',
        generated_at: new Date().toISOString(),
        executive_summary: {
          tier: results.tier,
          percentile: results.enhanced_report?.full_analytics?.strategic_positioning?.peer_rank_percentile || 68,
          net_worth_estimate: '$5-10M',
          peer_group_size: hnwiWorldCount,
          opportunities_accessible: opportunities?.length || 0,
          opportunities_missed: results.enhanced_report?.celebrity_opportunities?.total_missed || 0,
          optimization_potential: spider ? (spider.dimensions.reduce((acc: number, dim: any) => {
            return acc + ((dim.top_0_1_percentile - dim.user_score) / dim.top_0_1_percentile);
          }, 0) / spider.dimensions.length) : 0.17,
          confidence_score: results.confidence || 8.0,
          mental_models_applied: null,
          sophistication_score: null
        },
        spider_graphs: {
          peer_comparison: {
            dimensions: spider ? spider.dimensions.map((d: any) => d.name) : [],
            user_scores: spider ? spider.dimensions.map((d: any) => d.user_score / 10) : [],
            peer_average: spider ? spider.dimensions.map((d: any) => d.peer_average / 10) : [],
            top_performers: spider ? spider.dimensions.map((d: any) => d.top_0_1_percentile / 10) : [],
            improvement_areas: improvementAreas,
            hnwi_world_count: hnwiWorldCount
          },
          opportunity_alignment: {
            dimensions: [],
            user_scores: [],
            peer_average: [],
            top_performers: [],
            improvement_areas: []
          }
        },
        missed_opportunities: {
          top_missed: [],
          total_missed_value: 0,
          missed_by_category: {},
          total_opportunities_analyzed: 0
        },
        celebrity_opportunities: celebrityOpps,
        peer_analysis: {
          cohort_definition: {
            size: hnwiWorldCount,
            tier: results.tier,
            net_worth_range: '$5-10M',
            age_range: '35-55',
            geographic_region: 'Global'
          },
          your_percentile: results.enhanced_report?.full_analytics?.strategic_positioning?.peer_rank_percentile || 68,
          performance_metrics: {},
          behavioral_insights: {
            decision_speed: {
              metric_name: 'Decision Speed',
              your_value: 0,
              peer_median: 0,
              peer_top_quartile: 0,
              peer_top_decile: 0,
              percentile: 0,
              trend: 'at' as const
            },
            risk_appetite: {
              metric_name: 'Risk Appetite',
              your_value: 0,
              peer_median: 0,
              peer_top_quartile: 0,
              peer_top_decile: 0,
              percentile: 0,
              trend: 'at' as const
            },
            diversification_index: {
              metric_name: 'Diversification Index',
              your_value: 0,
              peer_median: 0,
              peer_top_quartile: 0,
              peer_top_decile: 0,
              percentile: 0,
              trend: 'at' as const
            },
            network_leverage: {
              metric_name: 'Network Leverage',
              your_value: 0,
              peer_median: 0,
              peer_top_quartile: 0,
              peer_top_decile: 0,
              percentile: 0,
              trend: 'at' as const
            }
          }
        },
        visualizations: {
          performance_timeline: [],
          geographic_heatmap: {
            regions: {},
            recommended_regions: [],
            underexplored_regions: []
          }
        },
        strategic_insights: []
      };

      await generateAndDownloadPDF(enhancedReportData, sessionId);
    } catch (err) {
      console.error('PDF generation error:', err);
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
          subtext="Taking you to the simulation..."
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
        <div className={`${results.enhanced_report ? 'max-w-6xl' : 'max-w-5xl'} mx-auto px-8 py-8 space-y-8 relative z-10`}>
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
                    <span className="font-bold text-primary">{results.tier.toUpperCase()}</span> tier positioning identifies <span className="font-bold text-foreground">{opportunities.length} validated opportunities</span> across {new Set(opportunities.map((o: any) => o.country)).size} countries where peers in your cohort have executed successfully.
                  </p>
                  <div className="flex items-start gap-2 mt-2 text-sm text-muted-foreground">
                    <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                    <span>
                      <span className="font-medium text-foreground">Click any location</span> to view peer execution data, intelligence sources, and performance metrics for each opportunity.
                    </span>
                  </div>
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

          {/* Enhanced Report Loading State */}
          {loadingEnhancedReport && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative z-10"
            >
              <div className="bg-card/60 backdrop-blur-xl border border-primary/30 rounded-2xl p-8 text-center">
                <CrownLoader
                  size="md"
                  text="Generating Extended Report"
                  subtext="Analyzing peer benchmarks and strategic positioning..."
                />
                <p className="text-sm text-muted-foreground mt-4">
                  This may take up to 30 seconds. Your complete analysis will appear automatically.
                </p>
              </div>
            </motion.section>
          )}

          {/* Enhanced Report Components - Only show if backend data exists and not loading */}
          {!loadingEnhancedReport && results.enhanced_report?.full_analytics?.strategic_positioning && (
            <>
              {/* Executive Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <ExecutiveSummary data={{
                  tier: results.tier,
                  percentile: results.enhanced_report.full_analytics.strategic_positioning.peer_rank_percentile,
                  opportunities_accessible: opportunities?.length || 0,
                  opportunities_missed: results.enhanced_report.celebrity_opportunities?.total_missed || 0,
                  peer_group_size: hnwiWorldCount, // Real: 1,860 HNWI World developments
                  optimization_potential: results.enhanced_report.full_analytics.strategic_positioning.spider_graph?.dimensions
                    ? (results.enhanced_report.full_analytics.strategic_positioning.spider_graph.dimensions.reduce((acc: number, dim: any) => {
                        return acc + ((dim.top_0_1_percentile - dim.user_score) / dim.top_0_1_percentile);
                      }, 0) / results.enhanced_report.full_analytics.strategic_positioning.spider_graph.dimensions.length)
                    : 0.23,
                  net_worth_estimate: "$5-10M",
                  confidence_score: results.confidence,
                  mental_models_applied: results.simulation?.reasoning_trace?.match(/\d+ out of \d+ mental models/)?.[0] || null,
                  sophistication_score: (() => {
                    const levels = results.forensic_validation?.evidence?.sophistication_levels;
                    if (!levels || !Array.isArray(levels) || levels.length === 0) return null;

                    const validLevels = levels.filter((l: any) => typeof l === 'number' && !isNaN(l));
                    if (validLevels.length === 0) return null;

                    const avg = validLevels.reduce((a: number, b: number) => a + b, 0) / validLevels.length;
                    return isNaN(avg) ? null : avg.toFixed(2);
                  })()
                }} />
              </motion.div>

              {/* Spider Graph - Peer Comparison */}
              {results.enhanced_report.full_analytics.strategic_positioning.spider_graph && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <SpiderGraphComparison data={(() => {
                    const spider = results.enhanced_report.full_analytics.strategic_positioning.spider_graph;

                    // Transform improvement_areas from backend (array of dimension names)
                    // to frontend structure (array of objects with details)
                    const improvementAreas = (spider.improvement_areas || []).map((dimName: string) => {
                      const dim = spider.dimensions.find((d: any) => d.name === dimName);
                      if (!dim) return null;

                      const gap = dim.top_0_1_percentile - dim.user_score;
                      return {
                        dimension: dimName,
                        current_score: dim.user_score / 10,  // Convert 0-10 to 0-1 scale
                        target_score: dim.top_0_1_percentile / 10,  // Convert 0-10 to 0-1 scale
                        gap: gap / 10,  // Convert gap to 0-1 scale
                        improvement_potential: (gap / dim.top_0_1_percentile) * 100,
                        actionable_steps: []
                      };
                    }).filter((a: any) => a !== null);

                    return {
                      dimensions: spider.dimensions.map((d: any) => d.name),
                      user_scores: spider.dimensions.map((d: any) => d.user_score / 10), // Convert 0-10 to 0-1 scale
                      peer_average: spider.dimensions.map((d: any) => d.peer_average / 10), // Convert 0-10 to 0-1 scale
                      top_performers: spider.dimensions.map((d: any) => d.top_0_1_percentile / 10), // Convert 0-10 to 0-1 scale
                      hnwi_world_count: spider.hnwi_world_count || hnwiWorldCount,
                      improvement_areas: improvementAreas
                    };
                  })()} />
                </motion.div>
              )}

              {/* Celebrity Opportunities - High-Adoption Opportunities */}
              {results.enhanced_report?.celebrity_opportunities && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <CelebrityOpportunities
                    data={results.enhanced_report.celebrity_opportunities}
                    onCitationClick={openCitation}
                  />
                </motion.div>
              )}

              {/* Strategic Positioning Gaps - Dollar-Impact Opportunity Costs */}
              {results.enhanced_report?.strategic_positioning_gaps?.gaps &&
               results.enhanced_report.strategic_positioning_gaps.gaps.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <StrategicPositioningGaps data={results.enhanced_report.strategic_positioning_gaps} />
                </motion.div>
              )}
            </>
          )}

          {/* Strategic Insights Infographic - Always show (uses simulation data) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <StrategicInsightsInfographic
              outcome={outcome as 'SURVIVED' | 'DAMAGED' | 'DESTROYED'}
              tier={results.tier}
              briefsCited={results.briefs_cited || []}
              onCitationClick={openCitation}
            />
          </motion.div>

          {/* Intelligence Platform Access */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center py-12"
          >
            <button
              onClick={() => setPricingModalOpen(true)}
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary hover:opacity-90 text-primary-foreground font-bold transition-all rounded-lg text-lg shadow-lg"
            >
              Access Intelligence Platform
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-xs text-muted-foreground mt-4">
              Full access to {hnwiWorldCount.toLocaleString()} HNWI World developments and ongoing peer intelligence
            </p>
          </motion.div>

          {/* Share & Download Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
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
                      Get your complete simulation as a PDF document
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
