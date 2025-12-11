// components/report/StrategicPositioningGaps.tsx
// Strategic Positioning Gaps - Shows dollar opportunity cost for closing performance gaps
// Replaces generic percentile metrics with actionable dollar-impact intelligence

"use client";

import { motion } from 'framer-motion';
import { AlertCircle, TrendingUp, Clock, Target } from 'lucide-react';

export interface StrategicGap {
  dimension: string;
  current_score: number;
  peer_average: number;
  top_0_1_benchmark: number;
  gap_to_peer: number;
  gap_to_top10: number;

  // THE VALUE DATA
  estimated_annual_opportunity_cost: number;
  expected_improvement_roi: number;
  time_to_close_gap_months: number;
  recommended_actions: string[];

  // Peer Intelligence
  peers_who_improved: number;
  avg_improvement_value: number;
  success_rate: number;
}

export interface StrategicPositioningGapsData {
  gaps: StrategicGap[];
  total_annual_opportunity_cost: number;
  total_gaps_identified: number;
}

interface GapCardProps {
  gap: StrategicGap;
  index: number;
}

function GapCard({ gap, index }: GapCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-card rounded-lg border border-border p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold text-foreground mb-1">
            {gap.dimension}
          </h3>
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Current: <span className="text-foreground font-semibold">{gap.current_score.toFixed(1)}/10</span>
            </span>
            <span className="text-sm text-muted-foreground">→</span>
            <span className="text-sm text-muted-foreground">
              Top 0.1%: <span className="text-primary font-semibold">{gap.top_0_1_benchmark.toFixed(1)}/10</span>
            </span>
          </div>
        </div>

        {/* THE VALUE METRIC */}
        <div className="bg-muted/30 border border-border rounded-lg px-4 py-3 text-center flex-shrink-0">
          <p className="text-xs text-muted-foreground mb-1 whitespace-nowrap">Annual Opportunity Cost</p>
          <p className="text-3xl font-bold text-foreground">
            ${(gap.estimated_annual_opportunity_cost / 1000).toFixed(0)}K
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-3 bg-muted rounded-full relative">
          <div
            className="h-full bg-primary rounded-full"
            style={{ width: `${(gap.current_score / 10) * 100}%` }}
          />
          <div
            className="absolute top-0 h-full w-0.5 bg-foreground"
            style={{ left: `${(gap.top_0_1_benchmark / 10) * 100}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">You</span>
          <span className="text-xs text-foreground">Top 0.1%</span>
        </div>
      </div>

      {/* Expected Impact */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-muted/30 border border-border rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-primary" />
            <p className="text-xs text-muted-foreground">Return Improvement</p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            +{(gap.expected_improvement_roi * 100).toFixed(0)}%
          </p>
        </div>
        <div className="bg-muted/30 border border-border rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-primary" />
            <p className="text-xs text-muted-foreground">Time to Close Gap</p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {gap.time_to_close_gap_months}mo
          </p>
        </div>
        <div className="bg-muted/30 border border-border rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Target className="w-4 h-4 text-primary" />
            <p className="text-xs text-muted-foreground">Success Rate</p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {(gap.success_rate * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">{gap.peers_who_improved} peers succeeded</p>
        </div>
      </div>

      {/* Recommended Actions */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">
          Recommended Actions
        </h4>
        <ul className="space-y-2">
          {gap.recommended_actions.map((action, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-primary font-semibold">{i + 1}</span>
              </div>
              <span className="flex-1">{action}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Peer Success Story */}
      <div className="mt-4 pt-4 border-t border-border bg-muted/20 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-primary">{gap.peers_who_improved} peers</span> improved
          this dimension and gained an average of{' '}
          <span className="font-semibold text-foreground">
            ${(gap.avg_improvement_value / 1000).toFixed(0)}K
          </span>{' '}
          in annual returns
        </p>
      </div>
    </motion.div>
  );
}

interface StrategicPositioningGapsProps {
  data: StrategicPositioningGapsData;
}

export function StrategicPositioningGaps({ data }: StrategicPositioningGapsProps) {
  // Handle case where no gaps exist yet
  if (!data.gaps || data.gaps.length === 0) {
    return (
      <section className="space-y-6">
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <AlertCircle className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            No Critical Gaps Identified
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your strategic positioning shows strong performance across key dimensions. Continue monitoring peer benchmarks for optimization opportunities.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Strategic Positioning Gaps
          </h2>
          <p className="text-muted-foreground">
            High-impact areas where closing gaps can unlock significant returns
          </p>
        </div>

        {/* Total Opportunity Cost - Only show if multiple gaps */}
        {data.total_gaps_identified > 1 && (
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-foreground mb-1">
              <AlertCircle className="w-5 h-5 text-primary" />
              <span className="text-3xl font-bold">
                ${(data.total_annual_opportunity_cost / 1000).toFixed(0)}K
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Total annual opportunity cost
            </p>
          </div>
        )}
      </div>

      {/* Gap Cards */}
      <div className="space-y-6">
        {data.gaps.map((gap, index) => (
          <GapCard key={gap.dimension} gap={gap} index={index} />
        ))}
      </div>

      {/* Summary Footer */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <p className="text-sm text-muted-foreground text-center">
          <span className="font-semibold text-primary">{data.total_gaps_identified} gaps</span> identified
          with actionable steps to improve performance and unlock returns
        </p>
      </div>
    </section>
  );
}
