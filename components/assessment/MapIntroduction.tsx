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
    loading: () => (
      <div className="h-full flex items-center justify-center">
        <CrownLoader size="lg" text="Loading HNWI World" />
      </div>
    )
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
        console.error('[MapIntro] Failed to fetch opportunities:', error);
        setLoadingMap(false);
      }
    }

    async function fetchGenericOpportunities() {
      try {
        // Use the same endpoint as Command Centre to get ALL opportunities (no tier filtering)
        const response = await fetch('/api/command-centre/opportunities?include_crown_vault=false&include_executors=false');

        if (!response.ok) {
          console.error('[MapIntro] Command Centre endpoint failed');
          setLoadingMap(false);
          return;
        }

        const data = await response.json();
        const opportunities = data?.opportunities || (Array.isArray(data) ? data : []);
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
        console.error('[MapIntro] Failed to fetch opportunities:', error);
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
          <div className="h-full flex items-center justify-center">
            <CrownLoader size="lg" text="Loading HNWI World Reality" />
          </div>
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
      <div className="absolute inset-0 bg-black/40 z-10" />

      {/* Content Layer - Above Map */}
      <div className="relative z-20 min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-4xl w-full">

          {/* Message Card - Clean Premium */}
          <div className="bg-card/95 backdrop-blur-2xl border border-primary/30 rounded-3xl p-8 sm:p-10 md:p-14">
            {/* Icon Header */}
            <div className="flex items-center justify-center gap-3 mb-10 sm:mb-12">
              <div className="p-5 bg-card/80 backdrop-blur-md rounded-full border border-primary/40">
                <Globe className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
              </div>
            </div>

            {/* Progressive Messages */}
            <div className="space-y-6">
              {showMessage1 && (
                <ProgressiveReveal delay={0.1}>
                  <div className="text-center">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 sm:mb-8 leading-tight tracking-tight">
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
                  <div className="bg-card/60 backdrop-blur-xl border border-primary/30 rounded-2xl p-6 sm:p-7 md:p-8">
                    <div className="flex items-start gap-4 sm:gap-5">
                      <div className="flex-shrink-0 mt-1">
                        <div className="p-2.5 bg-primary/10 rounded-lg border border-primary/30">
                          <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        </div>
                      </div>
                      <p className="text-base sm:text-lg md:text-xl text-foreground leading-relaxed font-light">
                        <TypewriterText
                          text={`Each dot on this map represents a real peer HNWI buying or selling an alternative asset. These are ${filteredCities.length.toLocaleString()} live opportunities across the globe.`}
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
                  <div className="bg-card/60 backdrop-blur-xl border border-primary/30 rounded-2xl p-6 sm:p-7 md:p-8">
                    <div className="flex items-start gap-4 sm:gap-5">
                      <div className="flex-shrink-0 mt-1">
                        <div className="p-2.5 bg-primary/10 rounded-lg border border-primary/30">
                          <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        </div>
                      </div>
                      <p className="text-base sm:text-lg md:text-xl text-foreground leading-relaxed font-light">
                        <TypewriterText
                          text="This is the reality of HNWI World. Your assessment will reveal which opportunities match your strategic DNA."
                          speed={15}
                          onComplete={() => setTimeout(() => setShowButton(true), 300)}
                        />
                      </p>
                    </div>
                  </div>
                </ProgressiveReveal>
              )}
            </div>

            {/* Continue Button - Clean CTA */}
            {showButton && (
              <ProgressiveReveal delay={0.3}>
                <div className="mt-10 sm:mt-12 text-center">
                  <motion.button
                    onClick={onContinue}
                    className="group inline-flex items-center justify-center gap-3 px-10 sm:px-12 md:px-14 py-5 sm:py-6 bg-primary text-primary-foreground font-bold text-lg sm:text-xl rounded-2xl transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Begin Your Assessment</span>
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                  <p className="text-sm sm:text-base text-muted-foreground/70 font-light mt-5 sm:mt-6">
                    Discover which opportunities are calibrated to your strategy
                  </p>
                </div>
              </ProgressiveReveal>
            )}
          </div>
        </div>
      </div>

      {/* Stats Overlay - Top Left - Clean Badge */}
      {!loadingMap && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="absolute top-6 left-6 bg-card/95 backdrop-blur-2xl border border-primary/30 rounded-2xl px-6 py-5 z-30"
        >
          <div className="text-xs sm:text-sm text-muted-foreground/70 font-medium uppercase tracking-wider mb-2">Live Opportunities</div>
          <div className="text-4xl sm:text-5xl font-bold text-primary mb-1">{filteredCities.length}</div>
          <div className="text-xs sm:text-sm text-muted-foreground/60 font-light">across {new Set(filteredCities.map(c => c.country)).size} countries</div>
        </motion.div>
      )}
    </div>
  );
};
