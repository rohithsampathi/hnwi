// components/report/HighProfilePeerOpportunities.tsx
// High Profile Peer Opportunities - Validated opportunities from successful peer execution
// Evidence-based FOMO: Shows what high-performing peers captured that you didn't

"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Target, AlertTriangle, Zap, Building2, FileText, ChevronDown, ChevronUp } from 'lucide-react';

// Real backend data structure from analytics service (Goldman Sachs quality)
export interface CelebrityOpportunity {
  rank: number;
  devid: string;
  title: string;
  industry: string;
  location: string;
  performance_percentage: number;
  has_outperformance: boolean;
  benchmark: string | null;

  // Match Scores (0-10 scale) - Goldman Sachs Quality
  match_score: number; // Overall match (0-10)
  dna_match_score: number; // DNA/preference match (0-10) - USE THIS FOR DISPLAY
  relevance_score: number; // Internal (0-1)
  salience_score: number; // Internal (0-1)

  // Signal Quality (0-1 scale)
  signal_type: string; // "buy" | "sell" | "hold"
  signal_strength: number; // 0-1 scale
  celebrity_score: number; // Market significance (0-1)

  summary: string;
  narrative: string;
  companies: string[];
  persons: string[];
  why_celebrity: string;
  hnwi_world_link: string;
}

export interface CelebrityOpportunitiesData {
  celebrity_opportunities: CelebrityOpportunity[];
  total_missed: number;
  avg_match_score: number;
  total_performance_captured: number;
  estimated_opportunity_cost_usd: number;
  strategic_positioning_gaps?: any[];
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
}

function MetricCard({ icon, label, value, subtext }: MetricCardProps) {
  return (
    <div className="bg-muted/30 border border-border rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-4 h-4 text-primary">{icon}</div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-xl font-bold text-foreground">{value}</p>
      {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
    </div>
  );
}

interface OpportunityCardProps {
  opportunity: CelebrityOpportunity;
  onCitationClick?: (citationId: string) => void;
}

function OpportunityCard({ opportunity, onCitationClick }: OpportunityCardProps) {
  // Goldman Sachs Quality Metrics
  const dnaMatch = opportunity.dna_match_score || opportunity.match_score; // Use dna_match_score (0-10)
  const celebrityScore = opportunity.celebrity_score || 0;

  // Clean why_celebrity text - remove any "Demonstrated X% performance" lines and market significance text
  const cleanedWhyCelebrity = opportunity.why_celebrity
    ? opportunity.why_celebrity
        .replace(/Demonstrated\s+\d+\.?\d*%\s+performance\s*/gi, '')
        .replace(/,?\s*(High|Med|Low)\s+market\s+significance\s*/gi, '')
        .trim()
    : '';

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: opportunity.rank * 0.05 }}
      onClick={() => onCitationClick?.(opportunity.devid)}
      className="group relative bg-card rounded-lg border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-200 p-4 text-left w-full"
    >
      {/* Rank Badge */}
      <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg border-2 border-background">
        <span className="text-xs font-bold text-primary-foreground">{opportunity.rank}</span>
      </div>

      {/* Content */}
      <div className="pl-3 space-y-3">
        {/* Title + Location */}
        <div>
          <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
            {opportunity.title}
          </h4>
          <p className="text-xs text-muted-foreground">
            {opportunity.location.split(',')[0].trim()}
          </p>
        </div>

        {/* Performance Text Line */}
        {opportunity.has_outperformance && (
          <p className="text-xs text-muted-foreground whitespace-nowrap">
            Peers demonstrated <span className="font-bold">{opportunity.performance_percentage.toFixed(1)}%</span> performance
          </p>
        )}

        {/* Why Peers Moved (FOMO Trigger) */}
        {cleanedWhyCelebrity && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {cleanedWhyCelebrity}
          </p>
        )}

        {/* DNA Match Score */}
        <div className="flex items-center gap-1.5 bg-primary/5 px-2 py-1.5 rounded-md w-fit">
          <Zap className="w-3 h-3 text-primary fill-primary/20 flex-shrink-0" />
          <div>
            <div className="text-xs font-bold text-primary">{dnaMatch.toFixed(1)}</div>
            <div className="text-[10px] text-muted-foreground">DNA match</div>
          </div>
        </div>

        {/* Intelligence Backing */}
        <div className="space-y-1.5">
          {/* Market Significance (Celebrity Score) */}
          {celebrityScore > 0 && (
            <div className="flex items-center gap-1.5">
              <Target className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              <div className="flex items-center gap-1 whitespace-nowrap">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 h-1 rounded-full ${
                      i < Math.round(celebrityScore * 5)
                        ? 'bg-primary'
                        : 'bg-muted-foreground/20'
                    }`}
                  />
                ))}
                <span className="text-[10px] text-muted-foreground ml-1">
                  {celebrityScore >= 0.6 ? 'High' : celebrityScore >= 0.3 ? 'Med' : 'Low'} market significance
                </span>
              </div>
            </div>
          )}

          {/* Companies (Social Proof) */}
          {opportunity.companies && opportunity.companies.length > 0 && (
            <div className="flex items-start gap-1.5">
              <Building2 className="w-3 h-3 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground line-clamp-1">
                {opportunity.companies.slice(0, 2).join(', ')}
                {opportunity.companies.length > 2 && ` +${opportunity.companies.length - 2}`}
              </p>
            </div>
          )}

          {/* Click to Read More */}
          <div className="flex items-center gap-1.5">
            <FileText className="w-3 h-3 text-primary flex-shrink-0" />
            <p className="text-[11px] text-primary font-medium">
              Click to Read More
            </p>
          </div>
        </div>
      </div>

      {/* Hover indicator */}
      <div className="absolute inset-0 rounded-lg bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.button>
  );
}

interface CelebrityOpportunitiesProps {
  data: CelebrityOpportunitiesData;
  onCitationClick?: (citationId: string) => void;
}

export function HighProfilePeerOpportunities({ data, onCitationClick }: CelebrityOpportunitiesProps) {
  const [showAll, setShowAll] = useState(false);
  const displayedOpportunities = showAll ? data.celebrity_opportunities : data.celebrity_opportunities.slice(0, 9);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            High Profile Peer Opportunities
          </h2>
          <p className="text-muted-foreground">
            Validated opportunities from successful peer execution, backed by{' '}
            <span className="font-semibold text-primary">
              1,860
            </span>{' '}
            HNWI World developments
          </p>
        </div>

        {/* Peer Advantage Captured */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30 rounded-lg p-4">
          <div className="flex items-center gap-2 text-foreground mb-1">
            <Users className="w-5 h-5 text-primary" />
            <span className="text-3xl font-bold text-primary">
              ${(data.estimated_opportunity_cost_usd / 1000000).toFixed(1)}M
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Peer advantage captured (24-month window)
          </p>
        </div>
      </div>

      {/* Compact Opportunity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedOpportunities.map((opp) => (
          <OpportunityCard
            key={opp.rank}
            opportunity={opp}
            onCitationClick={onCitationClick}
          />
        ))}
      </div>

      {/* Show More/Less Button */}
      {data.celebrity_opportunities.length > 9 && (
        <div className="text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg transition-all text-sm font-medium text-foreground"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show {data.celebrity_opportunities.length - 9} More Opportunities
              </>
            )}
          </button>
        </div>
      )}

      {/* Summary Footer */}
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4">
        <p className="text-sm text-muted-foreground text-center">
          <span className="font-semibold text-primary">{data.total_missed} opportunities</span> where peers in your tier executed while you evaluated • Average match score:{' '}
          <span className="font-semibold text-foreground">{data.avg_match_score.toFixed(1)}/10</span>
        </p>
      </div>
    </section>
  );
}

// Export with original name for backward compatibility
export const CelebrityOpportunities = HighProfilePeerOpportunities;
