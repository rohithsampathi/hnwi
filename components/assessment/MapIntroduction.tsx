// components/assessment/MapIntroduction.tsx
// Immersive map introduction showing HNWI World reality before assessment

"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Globe, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { CrownLoader } from '@/components/ui/crown-loader';
import { TypewriterText } from './TypewriterText';
import { ProgressiveReveal } from './ProgressiveReveal';
import type { City } from '@/components/interactive-world-map';

// Dynamically import the map component
const InteractiveWorldMap = dynamic(
  () => import("@/components/interactive-world-map").then(mod => mod.InteractiveWorldMap),
  {
    ssr: false,
    loading: () => <div className="h-full" />
  }
);

interface MapIntroductionProps {
  onContinue: () => void;
}

export const MapIntroduction: React.FC<MapIntroductionProps> = ({ onContinue }) => {
  const [cities, setCities] = useState<City[]>([]);
  const [loadingMap, setLoadingMap] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [showMessage1, setShowMessage1] = useState(false);
  const [showMessage2, setShowMessage2] = useState(false);
  const [showMessage3, setShowMessage3] = useState(false);
  const [showButton, setShowButton] = useState(false);

  // Show all opportunities for introduction (no filters)
  const [showPriveOpportunities, setShowPriveOpportunities] = useState(true);
  const [showHNWIPatterns, setShowHNWIPatterns] = useState(true);

  // Fetch opportunities for the map (show ALL opportunities in introduction, no tier filtering)
  useEffect(() => {
    async function fetchOpportunities() {
      setLoadingMap(true);
      try {
        // For MapIntroduction, use generic endpoint to show ALL opportunities
        // Don't use filtered endpoint as it applies tier-based filtering
        fetchGenericOpportunities();
      } catch (error) {
        setLoadingMap(false);
      }
    }

    async function fetchGenericOpportunities() {
      try {
        // MapIntroduction background map needs ALL opportunities for visual effect
        const response = await fetch('/api/public/assessment/preview-opportunities?show_all=true');

        if (!response.ok) {
          setLoadingMap(false);
          return;
        }

        const data = await response.json();
        // Handle different response formats
        const opportunities = data?.opportunities || (Array.isArray(data) ? data : data?.data || []);
        const total = data?.total_count || opportunities.length;

        // Transform to cities
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

            // Strip citations from analysis
            const cleanAnalysis = opp.analysis
              ? opp.analysis
                  .replace(/\[(?:Dev\s*ID|DEVID)\s*[:\-–—]\s*[^\]]+\]/gi, '')
                  .replace(/\]\([^\)]+\)/g, '')
                  .replace(/\*\*([^*]+)\*\*/g, '$1')
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

        setCities(deduplicatedCities);
        setTotalCount(total);
        setLoadingMap(false);

        // Start the message sequence after map loads
        setTimeout(() => setShowMessage1(true), 500);
      } catch (error) {
        setLoadingMap(false);
      }
    }

    fetchOpportunities();
  }, []);

  // Show all opportunities for the introduction (no filters applied)
  const filteredCities = cities;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Map Background Layer */}
      <div className="absolute inset-0 z-0">
        {loadingMap ? (
          <div className="h-full" />
        ) : (
          <InteractiveWorldMap
            width="100%"
            height="100%"
            showControls={false}
            cities={filteredCities}
            onCitationClick={() => {}}
            citationMap={new Map()}
            showCrownAssets={false}
            showPriveOpportunities={showPriveOpportunities}
            showHNWIPatterns={showHNWIPatterns}
            onToggleCrownAssets={() => {}}
            onTogglePriveOpportunities={() => setShowPriveOpportunities(!showPriveOpportunities)}
            onToggleHNWIPatterns={() => setShowHNWIPatterns(!showHNWIPatterns)}
            hideCrownAssetsToggle={true}
            useAbsolutePositioning={true}
          />
        )}
      </div>

      {/* Dark Overlay for Better Text Contrast */}
      <div className="absolute inset-0 bg-black/30 z-10" />

      {/* Content Layer - Above Map */}
      <div className={`relative z-20 min-h-screen flex justify-center p-4 sm:p-6 pb-20 sm:pb-6 ${loadingMap ? 'items-center' : 'items-end sm:items-center'}`}>
        <div className="max-w-4xl w-full">

          {/* Message Card - Clean Premium */}
          <div className="bg-card/20 sm:bg-card/30 backdrop-blur-sm border border-primary/10 rounded-3xl p-6 sm:p-8 md:p-10">
            {/* Icon Header */}
            <div className="flex flex-col items-center justify-center gap-3 mb-4 sm:mb-5 md:mb-6">
              <div className="p-3 sm:p-4 bg-card/60 backdrop-blur-sm rounded-full border border-primary/40">
                <Globe className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary" />
              </div>
              {loadingMap && (
                <div className="text-sm sm:text-base text-muted-foreground font-medium flex items-center gap-1">
                  <span>Loading HNWI World</span>
                  <span className="inline-flex">
                    <span className="animate-[bounce_1s_ease-in-out_0s_infinite]">.</span>
                    <span className="animate-[bounce_1s_ease-in-out_0.2s_infinite]">.</span>
                    <span className="animate-[bounce_1s_ease-in-out_0.4s_infinite]">.</span>
                  </span>
                </div>
              )}
            </div>

            {/* Progressive Messages */}
            {!loadingMap && <div className="space-y-4 sm:space-y-5 md:space-y-6">
              {showMessage1 && (
                <ProgressiveReveal delay={0.1}>
                  <div className="text-center bg-card/30 backdrop-blur-sm border border-primary/20 rounded-2xl p-4 sm:p-5 md:p-6">
                    <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-0 leading-tight tracking-tight">
                      <TypewriterText
                        text="Welcome to HNWI World"
                        speed={40}
                        onComplete={() => setTimeout(() => setShowMessage2(true), 500)}
                      />
                    </h2>
                  </div>
                </ProgressiveReveal>
              )}

              {showMessage2 && (
                <ProgressiveReveal delay={0.2}>
                  <div className="bg-card/40 backdrop-blur-md border border-primary/30 rounded-2xl p-4 sm:p-5 md:p-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <div className="p-2 sm:p-2.5 bg-primary/10 rounded-lg border border-primary/30">
                          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary" />
                        </div>
                      </div>
                      <p className="text-sm sm:text-base md:text-lg text-foreground leading-relaxed font-light">
                        <TypewriterText
                          text="Each marker is a live alternative-asset signal we're tracking across jurisdictions."
                          speed={15}
                          onComplete={() => setTimeout(() => setShowMessage3(true), 500)}
                        />
                      </p>
                    </div>
                  </div>
                </ProgressiveReveal>
              )}

              {showMessage3 && (
                <ProgressiveReveal delay={0.2}>
                  <div className="bg-card/40 backdrop-blur-md border border-primary/30 rounded-2xl p-4 sm:p-5 md:p-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <div className="p-2 sm:p-2.5 bg-primary/10 rounded-lg border border-primary/30">
                          <Users className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary" />
                        </div>
                      </div>
                      <p className="text-sm sm:text-base md:text-lg text-foreground leading-relaxed font-light">
                        <TypewriterText
                          text="Run the decision drill to see which signals match your strategic DNA (and which ones you should ignore)."
                          speed={15}
                          onComplete={() => setTimeout(() => setShowButton(true), 300)}
                        />
                      </p>
                    </div>
                  </div>
                </ProgressiveReveal>
              )}
            </div>}

            {/* Continue Button - Clean CTA */}
            {!loadingMap && showButton && (
              <ProgressiveReveal delay={0.3}>
                <div className="mt-5 sm:mt-6 md:mt-7 text-center">
                  <motion.button
                    onClick={onContinue}
                    className="group inline-flex items-center justify-center gap-2 sm:gap-3 px-8 sm:px-12 md:px-14 py-4 sm:py-5 md:py-6 bg-primary text-primary-foreground font-bold text-base sm:text-lg md:text-xl rounded-2xl transition-all w-full sm:w-auto"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Begin the Drill</span>
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                  <p className="text-xs sm:text-sm md:text-base text-muted-foreground/70 font-light mt-3 sm:mt-4 leading-relaxed">
                    See your archetype • See your map • Know your next move
                  </p>
                </div>
              </ProgressiveReveal>
            )}
          </div>
        </div>
      </div>

      {/* Stats Overlay - Top Left Corner - Below header to avoid overlap */}
      {!loadingMap && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="absolute top-5 left-4 sm:top-5 sm:left-6 bg-card/95 backdrop-blur-2xl border border-primary/40 rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 z-30 shadow-2xl"
        >
          <div className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Live Signals</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary leading-tight">{filteredCities.length}</div>
          <div className="text-[10px] sm:text-xs text-muted-foreground/80 font-light">of {totalCount} total</div>
        </motion.div>
      )}
    </div>
  );
};
