// components/decision-memo/LiveIntelligenceStream.tsx
// Premium Real-time Discovery Stream - Single View with Map
// Shows opportunities as markers on the map during intake

"use client";

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Diamond } from 'lucide-react';
import type { City } from '@/components/interactive-world-map';

// Dynamically import the map component
const InteractiveWorldMap = dynamic(
  () => import("@/components/interactive-world-map").then(mod => mod.InteractiveWorldMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full bg-gradient-to-br from-muted/20 to-muted/10 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          <p className="text-xs text-muted-foreground">Loading global intelligence...</p>
        </div>
      </div>
    )
  }
);

// Opportunity type from SSE
interface Opportunity {
  title: string;
  location: string;
  latitude?: number;
  longitude?: number;
  tier?: string;
  expected_return?: string;
  alignment_score?: number;
  reason?: string;
}

interface LiveIntelligenceStreamProps {
  opportunities?: Opportunity[];
}

export function LiveIntelligenceStream({
  opportunities = []
}: LiveIntelligenceStreamProps) {
  const [developmentCount, setDevelopmentCount] = React.useState<number>(1875);
  const [showPriveOpportunities, setShowPriveOpportunities] = React.useState(true);
  const [showHNWIPatterns, setShowHNWIPatterns] = React.useState(true);

  // Convert opportunities to City format for map markers
  const opportunityCities = useMemo((): City[] => {
    return opportunities
      .filter(opp => opp.latitude && opp.longitude)
      .map((opp, index) => ({
        name: opp.title || `Opportunity ${index + 1}`,
        country: opp.location || 'Unknown',
        latitude: opp.latitude!,
        longitude: opp.longitude!,
        title: opp.title,
        tier: opp.tier,
        expected_return: opp.expected_return,
        type: 'opportunity'
      }));
  }, [opportunities]);

  // Fetch actual development count
  React.useEffect(() => {
    async function fetchCount() {
      try {
        const response = await fetch('/api/developments/counts');
        if (response.ok) {
          const data = await response.json();
          const count = data.developments?.total_count || data.total_count || data.count || 1875;
          setDevelopmentCount(count);
        }
      } catch {
        // Keep default fallback
      }
    }
    fetchCount();
  }, []);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Premium Header with opportunity count */}
      <div className="bg-card/80 backdrop-blur-xl border-b border-primary/20 p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs sm:text-sm font-medium text-foreground">
              Live Intelligence
            </span>
          </div>
          <div className="flex items-center gap-4">
            {/* Opportunity counter */}
            {opportunities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 border border-primary/30 rounded-full"
              >
                <Diamond className="w-3 h-3 text-primary" />
                <span className="text-xs font-semibold text-primary">
                  {opportunities.length} found
                </span>
              </motion.div>
            )}
            <div className="text-xs text-muted-foreground">
              {developmentCount.toLocaleString()} tracked
            </div>
          </div>
        </div>
      </div>

      {/* Map View */}
      <div className="flex-1 overflow-hidden relative">
        <InteractiveWorldMap
          width="100%"
          height="100%"
          showControls={false}
          cities={opportunityCities}
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

        {/* Latest opportunity toast */}
        <AnimatePresence>
          {opportunities.length > 0 && (
            <motion.div
              key={opportunities[opportunities.length - 1]?.title}
              initial={{ opacity: 0, y: 20, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: -20, x: '-50%' }}
              className="absolute bottom-4 left-1/2 max-w-[280px] sm:max-w-sm bg-card/95 backdrop-blur-xl border border-primary/30 rounded-xl p-3 shadow-xl"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Diamond className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {opportunities[opportunities.length - 1]?.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {opportunities[opportunities.length - 1]?.location}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
