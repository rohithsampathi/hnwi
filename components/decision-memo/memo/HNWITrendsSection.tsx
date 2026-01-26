// components/decision-memo/memo/HNWITrendsSection.tsx
// HNWI Migration Trends Section - Premium intelligence visualization

"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  TrendingUp,
  Globe,
  Users,
  ArrowRight,
  Database,
  CheckCircle,
  ExternalLink,
  BarChart3
} from 'lucide-react';
import { HNWITrendsData, HNWITrendsCitation, HNWITrendsDataQuality } from '@/lib/decision-memo/memo-types';

interface HNWITrendsSectionProps {
  trends?: string[];
  confidence?: number;
  dataQuality?: HNWITrendsDataQuality;
  citations?: HNWITrendsCitation[];
  sourceJurisdiction?: string;
  destinationJurisdiction?: string;
}

// Confidence indicator component
function ConfidenceIndicator({ confidence }: { confidence: number }) {
  const percentage = Math.round(confidence * 100);
  const bars = Math.round(confidence * 5);

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className={`w-1.5 h-4 rounded-sm ${i <= bars ? 'bg-primary' : 'bg-muted'}`}
          />
        ))}
      </div>
      <span className={`text-xs font-bold ${
        percentage >= 80 ? 'text-primary' :
        percentage >= 60 ? 'text-foreground' :
        'text-muted-foreground'
      }`}>
        {percentage}%
      </span>
    </div>
  );
}

// Data quality badge
function DataQualityBadge({ quality }: { quality: HNWITrendsDataQuality }) {
  const grounding = quality.scientific_grounding;

  const config: Record<string, { bg: string; text: string; label: string }> = {
    kgv3_primary: { bg: 'bg-primary/20 border-primary/30', text: 'text-primary', label: 'KGv3 Primary' },
    kgv3_fallback: { bg: 'bg-amber-500/20 border-amber-500/30', text: 'text-amber-600 dark:text-amber-400', label: 'KGv3 Fallback' },
    no_data: { bg: 'bg-muted border-border', text: 'text-muted-foreground', label: 'No Data' },
    error: { bg: 'bg-red-500/20 border-red-500/30', text: 'text-red-500', label: 'Error' }
  };

  const { bg, text, label } = config[grounding] || config.no_data;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border ${bg}`}>
      <Database className={`w-3 h-3 ${text}`} />
      <span className={`text-[10px] font-bold uppercase tracking-wider ${text}`}>
        {label}
      </span>
    </span>
  );
}

// Single trend item
function TrendItem({ trend, index }: { trend: string; index: number }) {
  // Detect if this is a corridor trend (contains arrow pattern)
  const isCorridorTrend = trend.includes('→') || trend.toLowerCase().includes('corridor');
  const isOutflowTrend = trend.toLowerCase().includes('outflow') || trend.toLowerCase().includes('departures');
  const isInflowTrend = trend.toLowerCase().includes('inflow') || trend.toLowerCase().includes('attracted');

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={`flex items-start gap-4 p-4 rounded-lg border ${
        isCorridorTrend
          ? 'bg-primary/5 border-primary/30'
          : isOutflowTrend
          ? 'bg-amber-500/5 border-amber-500/30'
          : isInflowTrend
          ? 'bg-primary/5 border-primary/20'
          : 'bg-card border-border'
      }`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
        isCorridorTrend
          ? 'bg-primary/20'
          : isOutflowTrend
          ? 'bg-amber-500/20'
          : isInflowTrend
          ? 'bg-primary/20'
          : 'bg-muted'
      }`}>
        {isCorridorTrend ? (
          <ArrowRight className="w-4 h-4 text-primary" />
        ) : isOutflowTrend ? (
          <TrendingUp className="w-4 h-4 text-amber-500 rotate-45" />
        ) : isInflowTrend ? (
          <TrendingUp className="w-4 h-4 text-primary" />
        ) : (
          <Globe className="w-4 h-4 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1">
        <p className="text-sm text-foreground leading-relaxed">{trend}</p>
      </div>
    </motion.div>
  );
}

// Citation item
function CitationItem({ citation, index }: { citation: HNWITrendsCitation; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
      className="flex items-center gap-2 text-xs"
    >
      <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
      <span className="text-muted-foreground">
        {citation.source}
        {citation.date && <span className="text-muted-foreground/70"> ({citation.date})</span>}
        {citation.confidence && <span className="text-primary ml-1">• {citation.confidence}</span>}
        {citation.count && <span className="text-muted-foreground/70 ml-1">({citation.count} entries)</span>}
      </span>
    </motion.div>
  );
}

export function HNWITrendsSection({
  trends,
  confidence = 0,
  dataQuality,
  citations,
  sourceJurisdiction,
  destinationJurisdiction
}: HNWITrendsSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) setIsVisible(true);
  }, [isInView]);

  // Only render if we have trends
  if (!trends || trends.length === 0) {
    return null;
  }

  const corridorLabel = sourceJurisdiction && destinationJurisdiction
    ? `${sourceJurisdiction} → ${destinationJurisdiction}`
    : 'Cross-Border';

  return (
    <div ref={sectionRef}>
      {/* Premium Section Header */}
      <motion.div
        className="mb-8 sm:mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3 mb-2 sm:mb-3">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground tracking-wide">
            HNWI TRENDS
          </h2>
          <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
            {corridorLabel}
          </span>
        </div>
        <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-primary to-primary/30" />
        <p className="text-sm text-muted-foreground mt-3">
          High-net-worth wealth patterns and capital flow intelligence
        </p>
      </motion.div>

      <div className="space-y-6">
        {/* Confidence & Data Quality Header */}
        <motion.div
          className="flex flex-wrap items-center justify-between gap-4 p-4 bg-muted/30 border border-border rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center gap-6">
            {/* Confidence Score */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Confidence</p>
              <ConfidenceIndicator confidence={confidence} />
            </div>

            {/* Trend Count */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Trends</p>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-foreground">{trends.length}</span>
              </div>
            </div>

            {/* Collections Queried */}
            {dataQuality && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Sources</p>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-foreground">{dataQuality.collections_queried}</span>
                </div>
              </div>
            )}
          </div>

          {/* Data Quality Badge */}
          {dataQuality && <DataQualityBadge quality={dataQuality} />}
        </motion.div>

        {/* Trends List */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          {trends.map((trend, index) => (
            <TrendItem key={index} trend={trend} index={index} />
          ))}
        </motion.div>

        {/* Data Sources Section */}
        {dataQuality?.data_sources && dataQuality.data_sources.length > 0 && (
          <motion.div
            className="bg-card border border-border rounded-xl p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-4 h-4 text-primary" />
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                KGv3 Collections Queried
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {dataQuality.data_sources.map((source, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-muted rounded-lg text-[10px] text-muted-foreground font-medium"
                >
                  {source}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Citations Section */}
        {citations && citations.length > 0 && (
          <motion.div
            className="bg-muted/30 border border-border rounded-xl p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <ExternalLink className="w-4 h-4 text-primary" />
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Source Citations
              </h4>
            </div>
            <div className="space-y-2">
              {citations.map((citation, index) => (
                <CitationItem key={index} citation={citation} index={index} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Intelligence Source Footer */}
        <motion.div
          className="flex items-center justify-center gap-2 pt-4"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <p className="text-[10px] text-muted-foreground">
            Powered by HNWI Chronicles KG Migration Intelligence + Henley Private Wealth Data
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default HNWITrendsSection;
