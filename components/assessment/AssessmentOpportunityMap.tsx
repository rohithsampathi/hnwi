// components/assessment/AssessmentOpportunityMap.tsx
// Visual map showing REAL Command Centre opportunities disappearing in real-time

"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Opportunity {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  category: string;
  dealSize: number;
  location: string;
  removed: boolean;
}

interface AssessmentOpportunityMapProps {
  calibrationEvents: Array<{
    filter: string;
    message: string;
    removed: number;
    remaining: number;
  }>;
  isCalibrating: boolean;
}

// Fetch real Command Centre opportunities (excluding Crown Vault)
const fetchCommandCentreOpportunities = async (): Promise<Opportunity[]> => {
  try {
    // Use Command Centre endpoint with all view and include Crown Vault assets
    const response = await fetch('/api/command-centre/opportunities?view=all&timeframe=LIVE&include_crown_vault=true');

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    // Handle wrapped response structure from backend
    // Backend returns: { success: true, view: "all", opportunities: [...], metadata: {...} }
    const opportunities = data?.opportunities || (Array.isArray(data) ? data : []);


    // Filter and map to our format
    return opportunities
      .filter((opp: any) => {
        // Ensure we have valid coordinates
        return opp.latitude && opp.longitude &&
               opp.latitude !== 0 && opp.longitude !== 0 &&
               Math.abs(opp.latitude) <= 90 && Math.abs(opp.longitude) <= 180;
      })
      .map((opp: any) => ({
        id: opp._id || opp.id || opp.opportunity_id,
        latitude: opp.latitude || 0,
        longitude: opp.longitude || 0,
        title: opp.title || 'Untitled Opportunity',
        category: opp.category || opp.asset_category || 'Unknown',
        dealSize: parseFloat(opp.value?.replace(/[^0-9.]/g, '') || '0') || opp.minimum_investment_usd || 0,
        location: opp.location || opp.country || 'Unknown Location',
        removed: false,
      }));
  } catch (error) {
    return [];
  }
};

// Convert lat/long to SVG coordinates (simple equirectangular projection)
const projectToMap = (lat: number, lon: number, width: number, height: number) => {
  const x = ((lon + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return { x, y };
};

export function AssessmentOpportunityMap({ calibrationEvents, isCalibrating }: AssessmentOpportunityMapProps) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialCount, setInitialCount] = useState(0);

  // Fetch real Command Centre opportunities on mount
  useEffect(() => {
    async function loadOpportunities() {
      setLoading(true);
      const commandCentreOpps = await fetchCommandCentreOpportunities();
      setOpportunities(commandCentreOpps);
      setInitialCount(commandCentreOpps.length);
      setLoading(false);
    }

    loadOpportunities();
  }, []);

  // Handle calibration events - remove opportunities
  useEffect(() => {
    if (calibrationEvents.length === 0) return;

    const latestEvent = calibrationEvents[calibrationEvents.length - 1];
    const targetRemaining = latestEvent.remaining;

    setOpportunities(prev => {
      const currentActive = prev.filter(o => !o.removed).length;
      const toRemove = currentActive - targetRemaining;

      if (toRemove <= 0) return prev;

      // Mark random opportunities as removed
      const activeOpportunities = prev.filter(o => !o.removed);
      const toRemoveIndices = new Set<number>();

      while (toRemoveIndices.size < toRemove) {
        toRemoveIndices.add(Math.floor(Math.random() * activeOpportunities.length));
      }

      const idsToRemove = new Set(
        Array.from(toRemoveIndices).map(idx => activeOpportunities[idx].id)
      );

      return prev.map(opp =>
        idsToRemove.has(opp.id) ? { ...opp, removed: true } : opp
      );
    });
  }, [calibrationEvents]);

  const activeCount = opportunities.filter(o => !o.removed).length;
  const removedCount = opportunities.filter(o => o.removed).length;

  if (loading) {
    return (
      <div className="relative w-full h-full bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden border border-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading Command Centre opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden border border-gray-800">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-white dark:text-gray-400 mb-1">Command Centre</div>
            <div className="text-4xl font-bold text-white">
              {activeCount}
            </div>
            <div className="text-xs text-white dark:text-gray-500 mt-1">
              of {initialCount} opportunities
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-white dark:text-red-400 mb-1">Filtered Out</div>
            <div className="text-3xl font-bold text-white dark:text-red-500">
              {removedCount}
            </div>
            <div className="text-xs text-white dark:text-gray-500 mt-1">
              not aligned
            </div>
          </div>
        </div>

        {isCalibrating && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-lg text-center"
          >
            <span className="text-blue-300 text-sm font-semibold">
              🔑 Platform calibrating to your DNA signals...
            </span>
          </motion.div>
        )}

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-white dark:text-gray-400">$1M+ deals</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-white dark:text-gray-400">$500K+ deals</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-white dark:text-gray-400">Under $500K</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="absolute inset-0">
        <svg
          viewBox="0 0 1000 500"
          className="w-full h-full"
          style={{ filter: 'brightness(0.6)' }}
        >
          {/* World Map Background (simplified continents) */}
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="rgba(255,255,255,0.03)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="1000" height="500" fill="url(#grid)" />

          {/* Simplified world continents outline */}
          <path
            d="M 150 100 Q 200 80 250 100 L 280 120 L 300 100 L 320 120 L 340 100 L 360 130 L 340 160 L 320 140 L 300 160 L 280 140 L 250 150 L 200 130 Z"
            fill="rgba(59, 130, 246, 0.1)"
            stroke="rgba(59, 130, 246, 0.3)"
            strokeWidth="1"
          />
          <path
            d="M 400 150 Q 450 130 500 150 L 550 140 L 600 160 L 580 200 L 550 220 L 500 210 L 450 230 L 400 210 Z"
            fill="rgba(59, 130, 246, 0.1)"
            stroke="rgba(59, 130, 246, 0.3)"
            strokeWidth="1"
          />
          <path
            d="M 150 250 Q 180 220 220 250 L 250 280 L 220 320 L 180 300 Z"
            fill="rgba(59, 130, 246, 0.1)"
            stroke="rgba(59, 130, 246, 0.3)"
            strokeWidth="1"
          />
          <path
            d="M 700 180 Q 750 160 800 180 L 850 200 L 880 220 L 900 200 L 920 230 L 900 270 L 850 260 L 800 280 L 750 260 L 700 240 Z"
            fill="rgba(59, 130, 246, 0.1)"
            stroke="rgba(59, 130, 246, 0.3)"
            strokeWidth="1"
          />

          {/* Opportunity Markers - Real Command Centre Data */}
          <AnimatePresence>
            {opportunities.map((opp) => {
              const { x, y } = projectToMap(opp.latitude, opp.longitude, 1000, 500);

              // Color based on deal size
              const dotColor = opp.dealSize >= 1000000 ? '#f59e0b' : // Gold for $1M+
                              opp.dealSize >= 500000 ? '#3b82f6' :  // Blue for $500K+
                              '#10b981'; // Green for smaller

              return (
                <motion.g key={opp.id}>
                  {!opp.removed ? (
                    // Active opportunity - pulsing dot with size based on deal size
                    <>
                      <motion.circle
                        cx={x}
                        cy={y}
                        r={opp.dealSize >= 1000000 ? 5 : 4}
                        fill={dotColor}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.8, 1, 0.8],
                        }}
                        exit={{
                          scale: 0,
                          opacity: 0,
                          transition: { duration: 0.8 }
                        }}
                        transition={{
                          scale: {
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          },
                          opacity: {
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }
                        }}
                        className="drop-shadow-lg cursor-pointer"
                      >
                        <title>{opp.title} - ${(opp.dealSize / 1000).toFixed(0)}K - {opp.location}</title>
                      </motion.circle>
                    </>
                  ) : (
                    // Removed opportunity - dramatic fade with expanding ring
                    <>
                      <motion.circle
                        cx={x}
                        cy={y}
                        r={opp.dealSize >= 1000000 ? 5 : 4}
                        fill="#ef4444"
                        initial={{ scale: 1 }}
                        animate={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 1 }}
                      />
                      <motion.circle
                        cx={x}
                        cy={y}
                        r={opp.dealSize >= 1000000 ? 5 : 4}
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2"
                        initial={{ scale: 1, opacity: 1 }}
                        animate={{ scale: 4, opacity: 0 }}
                        transition={{ duration: 1 }}
                      />
                    </>
                  )}
                </motion.g>
              );
            })}
          </AnimatePresence>
        </svg>
      </div>

      {/* Latest Calibration Event Overlay */}
      {calibrationEvents.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 to-transparent p-6">
          <AnimatePresence mode="wait">
            {calibrationEvents.slice(-3).reverse().map((event, index) => (
              <motion.div
                key={`${event.filter}-${event.remaining}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1 - (index * 0.3), y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className={`mb-2 p-3 rounded-lg border ${
                  index === 0
                    ? 'bg-red-900/30 border-red-500/50'
                    : 'bg-gray-900/30 border-gray-700/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {index === 0 && <span className="text-xl">💥</span>}
                    <span className={`text-sm ${index === 0 ? 'text-white font-semibold' : 'text-white dark:text-gray-500'}`}>
                      {event.message}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${index === 0 ? 'text-white dark:text-red-400' : 'text-white dark:text-gray-600'}`}>
                      -{event.removed}
                    </span>
                    <span className={`text-xs ${index === 0 ? 'text-white dark:text-gray-400' : 'text-white dark:text-gray-700'}`}>
                      {event.remaining} left
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Animated Scan Line Effect */}
      {isCalibrating && (
        <motion.div
          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
          style={{ filter: 'blur(2px)' }}
          animate={{
            top: ['0%', '100%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      )}
    </div>
  );
}
