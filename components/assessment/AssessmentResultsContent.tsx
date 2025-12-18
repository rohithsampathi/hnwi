// components/assessment/AssessmentResultsContent.tsx
// Main content area for assessment results (map, analysis, pricing)

"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { TierPricingComparison } from './TierPricingComparison';
import { Download, ChevronDown } from 'lucide-react';
import type { City } from '@/components/interactive-world-map';

// Dynamic import to prevent SSR issues with map libraries (react-globe.gl, leaflet)
const InteractiveWorldMap = dynamic(
  () => import('@/components/interactive-world-map').then(mod => mod.InteractiveWorldMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] flex items-center justify-center bg-muted/30 rounded-lg">
        <div className="text-sm text-muted-foreground">Loading map...</div>
      </div>
    )
  }
);

interface AssessmentResultsContentProps {
  tier: 'architect' | 'operator' | 'observer';
  sessionId: string;
  opportunities: City[];
  onCitationClick: (citationId: string) => void;
  citationMap: Map<string, number>;
  onDownloadPDF: () => void;
  forensicVerdict: string;
  onArchitectSubmit: (email: string, whatsapp: string) => Promise<void>;
  onPayment: (tier: 'operator' | 'observer') => void;
  isUserAuthenticated?: boolean;
}

export function AssessmentResultsContent({
  tier,
  sessionId,
  opportunities,
  onCitationClick,
  citationMap,
  onDownloadPDF,
  forensicVerdict,
  onArchitectSubmit,
  onPayment,
  isUserAuthenticated = false
}: AssessmentResultsContentProps) {
  const [showPriveOpportunities, setShowPriveOpportunities] = useState(true);
  const [showHNWIPatterns, setShowHNWIPatterns] = useState(true);

  // Scroll to analysis section below map
  const scrollToAnalysis = () => {
    const analysisElement = document.getElementById('analysis-section');
    if (analysisElement) {
      analysisElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Filter and transform opportunities (matching home dashboard logic)
  const filteredOpportunities = opportunities
    .filter(city => {
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
    })
    .map(city => {
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

  return (
    <div className="max-w-5xl mx-auto px-8 py-8 space-y-12">
      {/* Personalized Intelligence Map */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4"
        >
          <h2 className="text-2xl font-bold mb-2">Your Intelligence Landscape</h2>
          <p className="text-sm text-muted-foreground">
            {filteredOpportunities.length} personalized opportunities mapped based on your C10 Strategic DNA
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative h-[600px]"
        >
          <InteractiveWorldMap
            cities={filteredOpportunities}
            onCitationClick={onCitationClick}
            citationMap={citationMap}
            useAbsolutePositioning={true}
            hideCrownAssetsToggle={true}
            showPriveOpportunities={showPriveOpportunities}
            showHNWIPatterns={showHNWIPatterns}
            onTogglePriveOpportunities={() => setShowPriveOpportunities(!showPriveOpportunities)}
            onToggleHNWIPatterns={() => setShowHNWIPatterns(!showHNWIPatterns)}
          />

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
        </motion.div>
      </section>

      {/* Download PDF Section */}
      <motion.section
        id="analysis-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="bg-card p-6 border border-border text-center rounded-lg">
          <button
            onClick={onDownloadPDF}
            className="inline-flex items-center gap-3 px-6 py-3 bg-primary hover:opacity-90 text-primary-foreground font-bold transition-all rounded-lg"
          >
            <Download size={20} />
            Download Full Report (PDF)
          </button>
          <p className="text-xs text-muted-foreground mt-3">
            Cryptographically signed • {forensicVerdict}
          </p>
        </div>
      </motion.section>

      {/* Tier Pricing Comparison */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <TierPricingComparison
          currentTier={tier}
          sessionId={sessionId}
          onArchitectSubmit={onArchitectSubmit}
          onPayment={onPayment}
        />
      </motion.section>

      {/* Return to Dashboard Link - Only for authenticated users */}
      {isUserAuthenticated && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.8 }}
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
  );
}
