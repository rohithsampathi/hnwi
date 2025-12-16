// components/assessment/AssessmentQuestion.tsx
// Live intelligence scenario display with opportunity map

"use client";

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Clock, Map as MapIcon, Target, TrendingUp, Zap } from 'lucide-react';
import { Question, Progress } from '@/lib/hooks/useAssessmentState';
import { ChoiceCard } from './ChoiceCard';
import { CrownLoader } from '@/components/ui/crown-loader';
import { TextWithTooltips } from './TextWithTooltips';
import { TypewriterText } from './TypewriterText';
import { ProgressiveReveal } from './ProgressiveReveal';
import { BrainThinkingLoader } from './BrainThinkingLoader';
import { TooltipProvider, useTooltip } from './TooltipContext';
import type { City } from '@/components/interactive-world-map';
import { extractDevIds } from '@/lib/parse-dev-citations';
import type { Citation } from '@/lib/parse-dev-citations';
import { useCitationManager } from '@/hooks/use-citation-manager';
import { EliteCitationPanel } from '@/components/elite/elite-citation-panel';
import { AnimatePresence } from 'framer-motion';
import { useOpportunities } from '@/lib/hooks/useOpportunities';

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
  const [cities, setCities] = useState<City[]>([]); // Currently visible opportunities (start at 0)
  const [scenarioTerms, setScenarioTerms] = useState<Set<string>>(new Set());

  // Fetch opportunities using centralized hook (assessment mode)
  const {
    cities: allCities,
    loading: loadingMap,
    totalCount: initialCount
  } = useOpportunities({
    isPublic: true, // Use public endpoint for assessment
    publicEndpoint: '/api/public/assessment/preview-opportunities',
    filterCrownVault: true, // Always filter out Crown Vault in assessment
    cleanCategories: false // Keep raw category names for assessment
  });

  // Gamification: Progressive reveal states
  const [showTitle, setShowTitle] = useState(false);
  const [showScenario, setShowScenario] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [showChoices, setShowChoices] = useState(false);

  // Opportunity filter toggles (assessment only has Privé and HNWI Patterns, no Crown Assets)
  const [showPriveOpportunities, setShowPriveOpportunities] = useState(true);
  const [showHNWIPatterns, setShowHNWIPatterns] = useState(true);

  // Citation management (same as home dashboard)
  const {
    citations: managedCitations,
    setCitations: setManagedCitations,
    citationMap,
    selectedCitationId,
    setSelectedCitationId,
    isPanelOpen,
    openCitation,
    closePanel
  } = useCitationManager();

  // Screen size detection for citation panel
  const [screenSize, setScreenSize] = useState<'mobile' | 'desktop'>('desktop');

  // Screen size detection (matching home dashboard)
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

  // Handle citation click from map popup
  const handleCitationClick = useCallback((citationId: string) => {
    openCitation(citationId);
  }, [openCitation]);

  // Track previous city count for calculating increment
  const [previousCityCount, setPreviousCityCount] = useState(0);

  // Banner state for showing new opportunities notification
  const [showOpportunityBanner, setShowOpportunityBanner] = useState(false);
  const [opportunityIncrement, setOpportunityIncrement] = useState(0);

  // Scroll to map function
  const scrollToMap = () => {
    const mapElement = document.getElementById('assessment-map-container');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Scroll to question function
  const scrollToQuestion = () => {
    const questionElement = document.getElementById('assessment-question-container');
    if (questionElement) {
      questionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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

            // Extract citations from analysis (keeping them for map display)
            const devIds = extractDevIds(opp.analysis || '');

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
              analysis: opp.analysis, // Keep full analysis with citations
              source: opp.source,
              category: opp.category,
              // Citation data
              devIds: devIds,
              hasCitations: devIds.length > 0,
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

  // Extract all citations from filtered cities (matching home dashboard)
  useEffect(() => {
    const allCitations: Citation[] = [];
    const seenIds = new Set<string>();
    let citationNumber = 1;

    filteredCities.forEach(city => {
      if (city.devIds && city.devIds.length > 0) {
        city.devIds.forEach(devId => {
          if (!seenIds.has(devId)) {
            seenIds.add(devId);
            allCitations.push({
              id: devId,
              number: citationNumber++,
              originalText: `[Dev ID: ${devId}]`
            });
          }
        });
      }
    });

    setManagedCitations(allCitations);
  }, [filteredCities.length, showPriveOpportunities, showHNWIPatterns]); // Only depend on the length and filter states

  // Track when filtered cities count changes to update previous count and show banner
  useEffect(() => {
    // Only update previousCityCount when we get new opportunities
    // This happens after calibration events are processed
    if (filteredCities.length > previousCityCount && calibrationEvents.length > 0) {
      const increment = filteredCities.length - previousCityCount;

      // Show the banner above the question
      setOpportunityIncrement(increment);
      setShowOpportunityBanner(true);

      // Hide banner after 10 seconds
      const bannerTimer = setTimeout(() => {
        setShowOpportunityBanner(false);
      }, 10000);

      // Delay update to show the increment notification first
      const countTimer = setTimeout(() => {
        setPreviousCityCount(filteredCities.length);
      }, 3000);

      return () => {
        clearTimeout(bannerTimer);
        clearTimeout(countTimer);
      };
    }
  }, [filteredCities.length, calibrationEvents.length, previousCityCount]);

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

      {/* Premium Intelligence Banner - New Opportunities Added */}
      <AnimatePresence>
        {showOpportunityBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="z-30 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-3"
          >
            <motion.button
              onClick={scrollToMap}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.995 }}
              className="w-full px-5 sm:px-6 py-3.5 sm:py-4 bg-card/80 hover:bg-card/90 backdrop-blur-xl border border-primary/30 hover:border-primary/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group relative overflow-hidden"
            >
              {/* Subtle premium shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent group-hover:via-primary/10 transition-all duration-500" />

              <div className="relative flex items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm sm:text-base font-semibold text-foreground leading-tight">
                      {opportunityIncrement} New {opportunityIncrement === 1 ? 'Opportunity' : 'Opportunities'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {filteredCities.length} total on Command Centre
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-primary font-medium">
                  <span className="hidden sm:inline">View Map</span>
                  <span className="group-hover:translate-y-0.5 transition-transform">↓</span>
                </div>
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content - Split Layout - Questions first on mobile, map on desktop right */}
      <div className="flex flex-col-reverse lg:flex-row">
        {/* Question Content - Primary focus (Left on desktop, Bottom on mobile) */}
        <motion.div
          id="assessment-question-container"
          key={question.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className={`${showMap ? 'lg:w-1/2' : 'w-full max-w-5xl mx-auto'}`}
        >
          {loading ? (
            <div className="p-4 sm:p-6 md:p-8">
              <BrainThinkingLoader isVisible={loading} />
            </div>
          ) : (
            <>
              {/* Fixed Scenario Section - Clean Card */}
              <div className="p-4 sm:p-6 md:p-8 lg:pt-8">
                <div className="bg-card/60 backdrop-blur-xl border border-primary/30 rounded-2xl p-4 sm:p-6 md:p-8">
                  <div className="mb-4 sm:mb-6">
                    <ProgressiveReveal delay={0.1}>
                      <div className="inline-block px-3 py-1.5 bg-card/80 backdrop-blur-md border border-primary/40 rounded-full text-xs sm:text-sm font-bold text-primary uppercase tracking-wider mb-3 sm:mb-4">
                        Scenario {progress.current}
                      </div>
                    </ProgressiveReveal>

                    {showTitle && (
                      <ProgressiveReveal delay={0.3}>
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-3 sm:mb-4 leading-tight tracking-tight">
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
                      <div className="mb-4 p-3 sm:p-4 bg-card/50 backdrop-blur-sm border border-primary/20 rounded-xl">
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-light">
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

              {/* Scrollable Options Section */}
              <div className="px-4 sm:px-6 md:px-8 pb-8">
                {/* Choices - Mobile optimized with progressive reveal */}
                {showChoices && (
                  <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                    <ProgressiveReveal delay={0.1}>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 px-1">
                        Select your strategic position:
                      </p>
                    </ProgressiveReveal>

                    {question.choices.map((choice, index) => (
                      <ProgressiveReveal key={choice.id} delay={0.3 + (index * 0.15)}>
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
                  <ProgressiveReveal delay={0.5 + (question.choices.length * 0.15)}>
                    <div className="flex flex-col items-center gap-3">
                      <motion.button
                        onClick={handleSubmit}
                        disabled={!selectedChoice || loading}
                        className={`
                          w-full sm:w-auto px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-xl font-bold text-sm sm:text-base transition-all duration-300
                          ${!selectedChoice || loading
                            ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                            : 'bg-primary text-primary-foreground shadow-lg hover:shadow-primary/30'
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

        {/* Opportunity Map - Secondary (Right on desktop, Top on mobile) */}
        {showMap && (
          <motion.div
            id="assessment-map-container"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="lg:w-1/2 bg-background lg:sticky lg:top-16 relative overflow-hidden order-first lg:order-last"
          >
            <div className="w-full h-[300px] sm:h-[400px] lg:h-[calc(100vh-120px)] lg:pt-8 relative">
              {loadingMap ? (
                <div className="h-full flex items-center justify-center">
                  <CrownLoader size="lg" text="Loading Command Centre" />
                </div>
              ) : (
                <>
                  {/* Map container - fills parent completely */}
                  <InteractiveWorldMap
                    width="100%"
                    height="100%"
                    showControls={true}
                    cities={filteredCities}
                    onCitationClick={handleCitationClick} // Enable citation clicks
                    citationMap={citationMap} // Pass citation map for proper numbering
                    showCrownAssets={false} // No Crown Assets during assessment
                    showPriveOpportunities={showPriveOpportunities}
                    showHNWIPatterns={showHNWIPatterns}
                    onToggleCrownAssets={() => {}} // Dummy handler - Crown Assets always disabled during assessment
                    onTogglePriveOpportunities={() => setShowPriveOpportunities(!showPriveOpportunities)}
                    onToggleHNWIPatterns={() => setShowHNWIPatterns(!showHNWIPatterns)}
                    hideCrownAssetsToggle={true} // Hide Crown Assets toggle in assessment
                    useAbsolutePositioning={true} // Keep controls inside map bounds
                  />

                  {/* Overlays positioned absolutely */}
                  {/* Up Arrow to Simulation */}
                  <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-[400]">
                    <motion.button
                      onClick={scrollToQuestion}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      animate={{
                        y: [0, -4, 0],
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
                      className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-primary/20 hover:bg-primary/40 backdrop-blur-xl border border-primary/40 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                      title="Back to simulation"
                    >
                      <span className="text-primary text-xl sm:text-2xl font-bold">↑</span>
                    </motion.button>
                  </div>

                  {/* Calibration Status Overlay */}
                  {isCalibrating && (
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-[400] pointer-events-none">
                      <div className="px-3 py-2 sm:px-6 sm:py-3 bg-card/95 backdrop-blur-2xl border border-primary/30 rounded-lg sm:rounded-2xl max-w-[90%]">
                        <span className="flex items-center gap-1.5 sm:gap-2 text-black dark:text-primary text-xs sm:text-sm font-semibold whitespace-nowrap">
                          <Target size={14} className="animate-pulse flex-shrink-0" />
                          <span className="truncate">Calibrating...</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Opportunity Counter - Real-time updates (shows filtered count) */}
                  <motion.div
                    key={filteredCities.length} // Re-animate when count changes
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="absolute top-2 left-2 sm:top-4 sm:left-4 z-[400] bg-card/95 backdrop-blur-2xl border border-primary/30 rounded-lg sm:rounded-2xl px-2 py-2 sm:px-4 sm:py-3 max-w-[140px] sm:max-w-none pointer-events-none"
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

                  {/* Latest Calibration Event - Show accurate counts using actual filtered cities data */}
                  {(() => {
                    const increment = Math.max(0, filteredCities.length - previousCityCount);
                    const hasNewOpportunities = calibrationEvents.length > 0 && filteredCities.length > 0 && increment > 0;

                    if (!hasNewOpportunities) return null;

                    return (
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-[400] w-auto max-w-[90%] sm:max-w-md pointer-events-none">
                        <motion.div
                          key={`calibration-${filteredCities.length}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-card/95 border border-border rounded-lg sm:rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 backdrop-blur-xl"
                        >
                          <div className="flex items-center justify-center gap-2 sm:gap-3">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <TrendingUp size={12} className="text-black dark:text-green-400 flex-shrink-0" />
                              <span className="text-[11px] sm:text-xs text-black dark:text-foreground font-semibold whitespace-nowrap">
                                +{increment} opportunities discovered matching your DNA
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                              <span className="text-[11px] sm:text-xs font-bold text-black dark:text-green-400">
                                +{increment}
                              </span>
                              <span className="text-[10px] sm:text-[11px] text-black dark:text-muted-foreground whitespace-nowrap">{filteredCities.length} total</span>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Citation Panel - Desktop Only (matching home dashboard) */}
      {isPanelOpen && screenSize === 'desktop' && (
        <div className="hidden lg:block">
          <EliteCitationPanel
            citations={managedCitations}
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
            citations={managedCitations}
            selectedCitationId={selectedCitationId}
            onClose={closePanel}
            onCitationSelect={setSelectedCitationId}
            citationMap={citationMap}
          />
        </AnimatePresence>
      )}
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
