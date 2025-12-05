// components/assessment/AssessmentQuestion.tsx
// Live intelligence scenario display with opportunity map

"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Clock, Map as MapIcon, Target, TrendingUp } from 'lucide-react';
import { Question, Progress } from '@/lib/hooks/useAssessmentState';
import { ChoiceCard } from './ChoiceCard';
import { CrownLoader } from '@/components/ui/crown-loader';
import { TextWithTooltips } from './TextWithTooltips';
import { TypewriterText } from './TypewriterText';
import { ProgressiveReveal } from './ProgressiveReveal';
import { BrainThinkingLoader } from './BrainThinkingLoader';
import { TooltipProvider, useTooltip } from './TooltipContext';
import type { City } from '@/components/interactive-world-map';

// Dynamically import the map component with SSR disabled (same as home dashboard)
const InteractiveWorldMap = dynamic(
  () => import("@/components/interactive-world-map").then(mod => mod.InteractiveWorldMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center">
        <CrownLoader size="lg" text="Loading Command Centre" />
      </div>
    )
  }
);

interface AssessmentQuestionProps {
  question: Question;
  progress: Progress;
  onAnswer: (choiceId: string, responseTime: number) => void;
  loading: boolean;
  calibrationEvents?: Array<{
    filter: string;
    message: string;
    removed: number;
    remaining: number;
    opportunities?: any[]; // Backend-selected opportunities for this event
  }>;
  isCalibrating?: boolean;
}

const AssessmentQuestionInner: React.FC<AssessmentQuestionProps> = ({
  question,
  progress,
  onAnswer,
  loading,
  calibrationEvents = [],
  isCalibrating = false
}) => {
  const { resetShownTerms } = useTooltip();
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showMap, setShowMap] = useState(true);
  const [allCities, setAllCities] = useState<City[]>([]); // All available opportunities
  const [cities, setCities] = useState<City[]>([]); // Currently visible opportunities (start at 0)
  const [loadingMap, setLoadingMap] = useState(true);
  const [initialCount, setInitialCount] = useState(0);
  const [scenarioTerms, setScenarioTerms] = useState<Set<string>>(new Set());

  // Gamification: Progressive reveal states
  const [showTitle, setShowTitle] = useState(false);
  const [showScenario, setShowScenario] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [showChoices, setShowChoices] = useState(false);

  // Opportunity filter toggles (assessment only has Privé and HNWI Patterns, no Crown Assets)
  const [showPriveOpportunities, setShowPriveOpportunities] = useState(true);
  const [showHNWIPatterns, setShowHNWIPatterns] = useState(true);

  // Fetch Command Centre opportunities - show ALL opportunities from the start
  // This gives us the full opportunity set to display on the map
  useEffect(() => {
    async function fetchOpportunities() {
      setLoadingMap(true);
      try {
        // Use assessment preview endpoint for consistent counts
        const response = await fetch('/api/public/assessment/preview-opportunities');

        if (!response.ok) {
          setLoadingMap(false);
          return;
        }

        const data = await response.json();
        processGenericOpportunityData(data);
      } catch (error) {
        setLoadingMap(false);
      }
    }

    function processGenericOpportunityData(data: any) {
      // Handle both wrapped and direct array responses
      const opportunities = data?.opportunities || (Array.isArray(data) ? data : data?.data || []);
      // Use total_count from response, or fall back to the length of opportunities returned
      const totalCount = data?.total_count || opportunities.length;

      const { cities: processedCities, totalCount: finalCount } = processOpportunitiesToCities(opportunities, totalCount);

      // Store all available cities but don't display any yet (start at 0)
      // Progressive reveal happens through calibration events
      setAllCities(processedCities);
      setInitialCount(finalCount);
      setCities([]); // Start with 0 visible - progressive reveal via calibration
      setLoadingMap(false);
    }

    function processOpportunitiesToCities(opportunities: any[], totalCount: number): { cities: City[], totalCount: number } {
      if (!opportunities || opportunities.length === 0) {
        return { cities: [], totalCount };
      }

      // Transform opportunities to city format
      const cityData: City[] = opportunities
        .map((opp: any) => {
          const lat = opp.latitude;
          const lng = opp.longitude;
          const displayName = opp.location || opp.country || opp.title || 'Opportunity';

          // Validate coordinates
          if (!lat || !lng || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
            return null;
          }

          // Skip (0, 0) coordinates
          if (lat === 0 && lng === 0) {
            return null;
          }

          // Filter out Crown Vault opportunities
          const isCrownAsset = opp.source?.toLowerCase().includes('crown vault') ||
                               opp.source?.toLowerCase() === 'crown vault';
          if (isCrownAsset) {
            return null;
          }

          // Strip citations from analysis for assessment display
          const cleanAnalysis = opp.analysis
            ? opp.analysis
                .replace(/\[(?:Dev\s*ID|DEVID)\s*[:\-–—]\s*[^\]]+\]/gi, '') // Remove DEVID citations
                .replace(/\]\([^\)]+\)/g, '') // Remove markdown links
                .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold markdown
                .trim()
            : undefined;

          return {
            name: displayName,
            country: opp.country || 'Unknown',
            latitude: lat,
            longitude: lng,
            population: opp.value,
            type: opp.source === "MOEv4" ? "finance" : "luxury",
            _id: opp._id,
            id: opp.id,
            title: opp.title,
            tier: opp.tier,
            value: opp.value,
            risk: opp.risk,
            analysis: cleanAnalysis,
            source: opp.source,
            category: opp.category,
          } as City;
        })
        .filter((city): city is City => city !== null);

      // Deduplicate by ID
      const seenIds = new Set<string>();
      const deduplicatedCities = cityData.filter(city => {
        const uniqueId = city._id || city.id;
        if (!uniqueId) return true;

        if (seenIds.has(uniqueId)) {
          return false;
        }

        seenIds.add(uniqueId);
        return true;
      });

      return { cities: deduplicatedCities, totalCount };
    }

    fetchOpportunities();
  }, []);

  // Handle calibration events - progressively ADD backend-selected opportunities
  useEffect(() => {
    if (calibrationEvents.length === 0) return;

    const latestEvent = calibrationEvents[calibrationEvents.length - 1];
    const backendOpportunities = latestEvent.opportunities || [];

    // If backend sent specific opportunities, use those (deduplicating by ID)
    if (backendOpportunities.length > 0) {
      setCities(prevVisible => {
        // Get IDs of currently visible opportunities
        const visibleIds = new Set(prevVisible.map(c => c._id || c.id));

        let duplicateCount = 0;
        let invalidCoordCount = 0;
        let crownVaultCount = 0;

        // Transform backend opportunities to City format and filter out duplicates
        const newCities = backendOpportunities
          .map((opp: any) => {
            const lat = opp.latitude;
            const lng = opp.longitude;
            const displayName = opp.location || opp.country || opp.title || 'Opportunity';
            const uniqueId = opp._id || opp.id;

            // Skip if already visible
            if (visibleIds.has(uniqueId)) {
              duplicateCount++;
              return null;
            }

            // Validate coordinates
            if (!lat || !lng || Math.abs(lat) > 90 || Math.abs(lng) > 180 || (lat === 0 && lng === 0)) {
              invalidCoordCount++;
              return null;
            }

            // Filter out Crown Vault
            if (opp.source?.toLowerCase().includes('crown vault')) {
              crownVaultCount++;
              return null;
            }

            // Strip citations from analysis for assessment display
            const cleanAnalysis = opp.analysis
              ? opp.analysis
                  .replace(/\[(?:Dev\s*ID|DEVID)\s*[:\-–—]\s*[^\]]+\]/gi, '') // Remove DEVID citations
                  .replace(/\]\([^\)]+\)/g, '') // Remove markdown links
                  .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold markdown
                  .trim()
              : undefined;

            return {
              name: displayName,
              country: opp.country || 'Unknown',
              latitude: lat,
              longitude: lng,
              population: opp.value,
              type: opp.source === "MOEv4" ? "finance" : "luxury",
              _id: opp._id,
              id: opp.id,
              title: opp.title,
              tier: opp.tier,
              value: opp.value,
              risk: opp.risk,
              analysis: cleanAnalysis,
              source: opp.source,
              category: opp.category,
            } as City;
          })
          .filter((city): city is City => city !== null);

        const addedCount = newCities.length;
        const newTotal = prevVisible.length + addedCount;

        if (duplicateCount > 0 || invalidCoordCount > 0 || crownVaultCount > 0) {
        }

        return [...prevVisible, ...newCities];
      });
    }
  }, [calibrationEvents]);

  // Reset selection, scenario terms, and shown tooltips when question changes
  useEffect(() => {
    setSelectedChoice(null);
    setScenarioTerms(new Set());
    resetShownTerms();

    // Gamification: Reset and trigger progressive reveals
    setShowTitle(false);
    setShowScenario(false);
    setShowQuestion(false);
    setShowChoices(false);

    // Start the reveal sequence
    setTimeout(() => setShowTitle(true), 100);
  }, [question.id, resetShownTerms]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const handleSubmit = () => {
    if (!selectedChoice || loading) return;

    const responseTime = (Date.now() - startTime) / 1000;
    onAnswer(selectedChoice, responseTime);
  };

  const progressPercentage = (progress.current / progress.total) * 100;

  // Filter cities based on opportunity type toggles (assessment only: Privé + HNWI Patterns)
  const filteredCities = cities.filter(city => {
    // Privé Opportunities: Victor-scored opportunities
    const isPriveOpportunity = city.victor_score !== undefined ||
                               city.source?.toLowerCase().includes('privé') ||
                               city.source?.toLowerCase().includes('prive');

    // HNWI Pattern Opportunities: MOEv4 and other patterns (default category)
    const isHNWIPattern = city.source === 'MOEv4' ||
                          city.source?.toLowerCase().includes('live hnwi data') ||
                          city.source?.toLowerCase().includes('pattern') ||
                          !isPriveOpportunity; // Default to HNWI Pattern if not Privé

    // Show city if its category toggle is enabled
    if (isPriveOpportunity && showPriveOpportunities) return true;
    if (isHNWIPattern && showHNWIPatterns) return true;

    return false;
  });

  return (
    <>
      {/* Progress bar - Premium Header */}
      <div className="sticky top-0 z-40 bg-background/98 backdrop-blur-xl border-b border-primary/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-xs sm:text-sm font-semibold text-foreground">
                Question {progress.current} of {progress.total}
              </div>
              <button
                onClick={() => setShowMap(!showMap)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-card/80 backdrop-blur-md border border-primary/30 rounded-lg text-xs font-medium text-primary hover:bg-primary/10 transition-all shadow-sm"
              >
                <MapIcon size={14} />
                {showMap ? 'Hide' : 'Show'} Map
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground/70 font-light">
              <Clock size={14} />
              <span className="font-mono">{Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>

          {/* Progress bar - Premium */}
          <div className="relative h-2 bg-card/50 backdrop-blur-sm border border-primary/20 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80 rounded-full shadow-lg shadow-primary/20"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-200px)]">
        {/* Opportunity Map - Right Side (or Top on Mobile) */}
        {showMap && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="lg:w-1/2 bg-background lg:sticky lg:top-16 relative overflow-hidden"
          >
            <div className="w-full h-[520px] lg:h-[754px] lg:pt-8">
              {loadingMap ? (
                <div className="h-full flex items-center justify-center">
                  <CrownLoader size="lg" text="Loading Command Centre" />
                </div>
              ) : (
                <>
                  <InteractiveWorldMap
                    width="100%"
                    height="100%"
                    showControls={true}
                    cities={filteredCities}
                    onCitationClick={() => {}} // Disable citation clicks in assessment
                    citationMap={new Map()} // Empty citation map to strip citations
                    showCrownAssets={false} // No Crown Assets during assessment
                    showPriveOpportunities={showPriveOpportunities}
                    showHNWIPatterns={showHNWIPatterns}
                    onToggleCrownAssets={() => {}} // Dummy handler - Crown Assets always disabled during assessment
                    onTogglePriveOpportunities={() => setShowPriveOpportunities(!showPriveOpportunities)}
                    onToggleHNWIPatterns={() => setShowHNWIPatterns(!showHNWIPatterns)}
                    hideCrownAssetsToggle={true} // Hide Crown Assets toggle in assessment
                    useAbsolutePositioning={true} // Position controls inside map frame for assessment
                  />

                {/* Calibration Status Overlay */}
                {isCalibrating && (
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-[500] px-3 py-2 sm:px-6 sm:py-3 bg-card/95 backdrop-blur-2xl border border-primary/30 rounded-lg sm:rounded-2xl max-w-[90%]">
                    <span className="flex items-center gap-1.5 sm:gap-2 text-black dark:text-primary text-xs sm:text-sm font-semibold whitespace-nowrap">
                      <Target size={14} className="animate-pulse flex-shrink-0" />
                      <span className="truncate">Calibrating DNA...</span>
                    </span>
                  </div>
                )}

                {/* Opportunity Counter - Real-time updates (shows filtered count) */}
                <motion.div
                  key={filteredCities.length} // Re-animate when count changes
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-2 left-2 sm:top-4 sm:left-4 z-[500] bg-card/95 backdrop-blur-2xl border border-primary/30 rounded-lg sm:rounded-2xl px-2 py-2 sm:px-4 sm:py-3 max-w-[140px] sm:max-w-none"
                >
                  <div className="text-[10px] sm:text-xs text-black dark:text-muted-foreground mb-0.5 sm:mb-1 truncate font-medium uppercase tracking-wider">Command Centre</div>
                  <div className="text-xl sm:text-3xl font-bold text-black dark:text-primary leading-tight">{filteredCities.length}</div>
                  <div className="text-[10px] sm:text-xs text-black dark:text-muted-foreground truncate font-light">of {initialCount} opps</div>
                  {filteredCities.length > 0 && filteredCities.length < initialCount && (
                    <div className="text-[10px] sm:text-xs text-black dark:text-green-400 mt-0.5 sm:mt-1 truncate font-semibold">
                      +{filteredCities.length} found
                    </div>
                  )}
                </motion.div>

                {/* Latest Calibration Event */}
                {calibrationEvents.length > 0 && (
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-[500] w-auto max-w-[90%] sm:max-w-md">
                    {calibrationEvents.slice(-1).map((event, index) => (
                      <motion.div
                        key={`${event.filter}-${event.remaining}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card/95 border border-border rounded-lg sm:rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 backdrop-blur-xl"
                      >
                        <div className="flex items-center justify-center gap-2 sm:gap-3">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <TrendingUp size={12} className="text-black dark:text-green-400 flex-shrink-0" />
                            <span className="text-[11px] sm:text-xs text-black dark:text-foreground font-semibold whitespace-nowrap">{event.message}</span>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                            <span className="text-[11px] sm:text-xs font-bold text-black dark:text-green-400">+{event.removed}</span>
                            <span className="text-[10px] sm:text-[11px] text-black dark:text-muted-foreground whitespace-nowrap">{event.remaining} total</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
            </div>
          </motion.div>
        )}

        {/* Question Content - Left Side (or Bottom on Mobile) */}
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className={`${showMap ? 'lg:w-1/2' : 'w-full max-w-5xl mx-auto'} flex flex-col`}
        >
          {loading ? (
            <div className="p-4 sm:p-6 md:p-8">
              <BrainThinkingLoader isVisible={loading} />
            </div>
          ) : (
            <>
              {/* Fixed Scenario Section - Clean Card */}
              <div className="p-4 sm:p-6 md:p-8 lg:pt-8">
                <div className="bg-card/60 backdrop-blur-xl border border-primary/30 rounded-2xl p-6 sm:p-8 md:p-10">
                  <div className="mb-6 sm:mb-8">
                    <ProgressiveReveal delay={0.1}>
                      <div className="inline-block px-4 py-2 bg-card/80 backdrop-blur-md border border-primary/40 rounded-full text-xs sm:text-sm font-bold text-primary uppercase tracking-wider mb-4 sm:mb-5">
                        Scenario {progress.current}
                      </div>
                    </ProgressiveReveal>

                    {showTitle && (
                      <ProgressiveReveal delay={0.3}>
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-4 sm:mb-5 leading-tight tracking-tight">
                          <TypewriterText
                            text={question.title}
                            speed={30}
                            onComplete={() => setShowScenario(true)}
                          />
                        </h2>
                      </ProgressiveReveal>
                    )}
                  </div>

                  {showScenario && question.scenario && (
                    <ProgressiveReveal delay={0.2}>
                      <div className="mb-6 p-4 sm:p-5 bg-card/50 backdrop-blur-sm border border-primary/20 rounded-xl">
                        <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed font-light">
                          <TypewriterText
                            text={question.scenario}
                            speed={15}
                            showTooltips={true}
                            onTermsFound={(terms) => setScenarioTerms(prev => new Set([...prev, ...terms]))}
                            onComplete={() => setShowQuestion(true)}
                          />
                        </p>
                      </div>
                    </ProgressiveReveal>
                  )}

                  {/* If no scenario, trigger question immediately after title */}
                  {showTitle && !question.scenario && !showQuestion && (
                    <>
                      {setTimeout(() => setShowQuestion(true), 100) && null}
                    </>
                  )}

                  {showQuestion && (
                    <ProgressiveReveal delay={0.2}>
                      <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
                        <p className="text-base sm:text-lg md:text-xl text-foreground leading-relaxed font-medium">
                          <TypewriterText
                            text={question.question_text}
                            speed={20}
                            onComplete={() => setShowChoices(true)}
                          />
                        </p>
                      </div>
                    </ProgressiveReveal>
                  )}
                </div>
              </div>

              {/* Scrollable Options Section - Matches map height */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 lg:h-[754px]">
                {/* Choices - Mobile optimized with progressive reveal */}
                {showChoices && (
                  <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                    <ProgressiveReveal delay={0.1}>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 sm:mb-3 px-1">
                        Select your strategic position:
                      </p>
                    </ProgressiveReveal>

                    {question.choices.map((choice, index) => (
                      <ProgressiveReveal key={choice.id} delay={0.3 + (index * 0.2)}>
                        <ChoiceCard
                          choice={choice}
                          label={String.fromCharCode(65 + index)} // A, B, C, D
                          isSelected={selectedChoice === choice.id}
                          onSelect={() => setSelectedChoice(choice.id)}
                          disabled={loading}
                          excludeTerms={scenarioTerms}
                        />
                      </ProgressiveReveal>
                    ))}
                  </div>
                )}

                {/* Submit button - Premium mobile (only show after choices) */}
                {showChoices && (
                  <ProgressiveReveal delay={0.5 + (question.choices.length * 0.2)}>
                    <div className="flex flex-col items-center gap-3 pb-8">
                      <motion.button
                        onClick={handleSubmit}
                        disabled={!selectedChoice || loading}
                        className={`
                          w-full sm:w-auto px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300
                          ${!selectedChoice || loading
                            ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                            : 'bg-primary text-primary-foreground'
                          }
                        `}
                        whileHover={selectedChoice && !loading ? { scale: 1.02 } : {}}
                        whileTap={selectedChoice && !loading ? { scale: 0.98 } : {}}
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="inline-block w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            <span>Analyzing Response...</span>
                          </span>
                        ) : (
                          'Lock Position'
                        )}
                      </motion.button>

                      {selectedChoice && !loading && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs text-muted-foreground"
                        >
                          Response time: {elapsedTime}s
                        </motion.p>
                      )}
                    </div>
                  </ProgressiveReveal>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </>
  );
};

// Wrapper component that provides tooltip context
export const AssessmentQuestion: React.FC<AssessmentQuestionProps> = (props) => {
  return (
    <TooltipProvider>
      <AssessmentQuestionInner {...props} />
    </TooltipProvider>
  );
};
