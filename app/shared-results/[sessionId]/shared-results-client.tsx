// app/shared-results/[sessionId]/shared-results-client.tsx
// Client component for public shareable assessment results

"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Share2, ArrowRight, ChevronDown } from 'lucide-react';
import { useAssessmentAPI } from '@/lib/hooks/useAssessmentAPI';
import { AssessmentResults } from '@/lib/hooks/useAssessmentState';
import type { Citation } from '@/lib/parse-dev-citations';
import dynamic from 'next/dynamic';
import { useCitationManager } from '@/hooks/use-citation-manager';
import { EliteCitationPanel } from '@/components/elite/elite-citation-panel';
import { AssessmentResultsHeader } from '@/components/assessment/AssessmentResultsHeader';
import { CrownLoader } from '@/components/ui/crown-loader';
import {
  ExecutiveSummary,
  SpiderGraphComparison,
  CelebrityOpportunities,
  StrategicPositioningGaps,
  StrategicInsightsInfographic
} from '@/components/report';

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

export default function SharedResultsClient() {
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

  // HNWI World count
  const [hnwiWorldCount, setHnwiWorldCount] = useState<number>(1860); // Default fallback

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

  // Scroll to analysis section below map
  const scrollToAnalysis = () => {
    const analysisElement = document.getElementById('analysis-section');
    if (analysisElement) {
      analysisElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
        <div className={`${results.enhanced_report ? 'max-w-6xl' : 'max-w-5xl'} mx-auto px-4 sm:px-8 py-8 space-y-8 relative z-10`}>
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

              <div className="bg-card border border-border overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/30">
                  <p className="text-sm text-muted-foreground">
                    {(() => {
                      // Calculate filtered count for display
                      const filteredCount = opportunities.filter((city: any) => {
                        if (!city.latitude || !city.longitude) return false;

                        const isPriveOpportunity = city.victor_score !== undefined ||
                                                  city.source?.toLowerCase().includes('privé') ||
                                                  city.source?.toLowerCase().includes('prive');

                        const isHNWIPattern = city.source === 'MOEv4' ||
                                             city.source?.toLowerCase().includes('live hnwi data') ||
                                             city.source?.toLowerCase().includes('pattern') ||
                                             !isPriveOpportunity;

                        if (isPriveOpportunity && showPriveOpportunities) return true;
                        if (isHNWIPattern && showHNWIPatterns) return true;
                        return false;
                      }).length;

                      const filteredCountries = new Set(opportunities.filter((city: any) => {
                        if (!city.latitude || !city.longitude) return false;

                        const isPriveOpportunity = city.victor_score !== undefined ||
                                                  city.source?.toLowerCase().includes('privé') ||
                                                  city.source?.toLowerCase().includes('prive');

                        const isHNWIPattern = city.source === 'MOEv4' ||
                                             city.source?.toLowerCase().includes('live hnwi data') ||
                                             city.source?.toLowerCase().includes('pattern') ||
                                             !isPriveOpportunity;

                        if (isPriveOpportunity && showPriveOpportunities) return true;
                        if (isHNWIPattern && showHNWIPatterns) return true;
                        return false;
                      }).map((o: any) => o.country)).size;

                      return (
                        <>
                          This <span className="font-bold text-primary">{results.tier.toUpperCase()}</span> profile identified <span className="font-bold text-foreground">{filteredCount} tracked signals</span> across {filteredCountries} countries matched to this strategic posture. Each includes sources + case notes.
                        </>
                      );
                    })()}
                  </p>
                  <div className="flex items-start gap-2 mt-2 text-sm text-muted-foreground">
                    <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                    <span>
                      <span className="font-medium text-foreground">Click any location</span> to view intelligence sources, case notes, and performance metrics for each signal.
                    </span>
                  </div>
                </div>

                <div className="h-[600px] relative">
                  {(() => {
                    // Filter and transform opportunities with correct type field
                    const filteredOpportunities = opportunities
                      .filter((city: any) => {
                        // Must have valid coordinates
                        if (!city.latitude || !city.longitude) return false;

                        // Apply category filters
                        const isPriveOpportunity = city.victor_score !== undefined ||
                                                  city.source?.toLowerCase().includes('privé') ||
                                                  city.source?.toLowerCase().includes('prive');

                        const isHNWIPattern = city.source === 'MOEv4' ||
                                             city.source?.toLowerCase().includes('live hnwi data') ||
                                             city.source?.toLowerCase().includes('pattern') ||
                                             !isPriveOpportunity;

                        if (isPriveOpportunity && showPriveOpportunities) return true;
                        if (isHNWIPattern && showHNWIPatterns) return true;

                        return false;
                      })
                      .map((city: any) => {
                        // Determine if this is a Privé opportunity (for diamond icons)
                        const isPriveOpportunity = city.victor_score !== undefined ||
                                                  city.source?.toLowerCase().includes('privé') ||
                                                  city.source?.toLowerCase().includes('prive');

                        // CRITICAL FIX: map-markers.tsx uses victor_score to show diamond icons, not type field
                        // If this is a Privé opportunity but doesn't have victor_score, add it
                        const enhancedCity = {
                          ...city,
                          type: city.source === "MOEv4" ? "finance" : "luxury"
                        };

                        if (isPriveOpportunity && !enhancedCity.victor_score) {
                          enhancedCity.victor_score = "prive"; // Add any truthy value to trigger diamond icon
                        }

                        return enhancedCity;
                      });

                    // Always show the map, pass empty array if no opportunities match
                    return (
                      <InteractiveWorldMap
                        cities={filteredOpportunities}
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
                    );
                  })()}

                  {/* Down Arrow - Scroll to Analysis */}
                  <motion.button
                    onClick={scrollToAnalysis}
                    whileHover={{ scale: 1.1, y: 2 }}
                    whileTap={{ scale: 0.9 }}
                    animate={{
                      y: [0, 4, 0],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      y: {
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      },
                      opacity: {
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }
                    }}
                    className="absolute top-1/2 -translate-y-1/2 right-4 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-primary/20 hover:bg-primary/40 backdrop-blur-xl border border-primary/40 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-[9999]"
                    title="View analysis"
                  >
                    <ChevronDown className="text-primary w-6 h-6 sm:w-7 sm:h-7" />
                  </motion.button>
                </div>
              </div>
            </motion.section>
          )}

          {/* Enhanced Report Components - Only show if backend data exists */}
          {results.enhanced_report?.full_analytics?.strategic_positioning && (
            <>
              {/* Executive Summary */}
              <motion.div
                id="analysis-section"
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
            id={results.enhanced_report?.full_analytics?.strategic_positioning ? undefined : "analysis-section"}
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

          {/* Take Assessment CTA - Prominent */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
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
              Free access to {hnwiWorldCount.toLocaleString()} HNWI World developments
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
