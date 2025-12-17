// components/report/PeerBenchmarking.tsx
// Detailed peer comparison with percentile distributions and metric comparisons
// Uses centralized theme colors only

'use client';

import { motion } from 'framer-motion';
import { Users, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { PeerComparisonData, MetricComparison } from '@/types/assessment-report';

interface PeerBenchmarkingProps {
  data: PeerComparisonData;
}

export function PeerBenchmarking({ data }: PeerBenchmarkingProps) {
  const { cohort_definition, your_percentile, performance_metrics } = data;

  return (
    <section className="bg-card rounded-lg p-8 mb-8 border border-border">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Opportunity Qualification Analysis
        </h2>
        <p className="text-muted-foreground">
          Analysis based on {cohort_definition.size.toLocaleString()} HNWIs: {cohort_definition.tier} tier, {cohort_definition.net_worth_range}, {cohort_definition.age_range}, {cohort_definition.geographic_region}
        </p>
      </div>

      {/* Percentile Visualization */}
      <div className="mb-8">
        <PercentileDistribution
          userPercentile={your_percentile}
          cohortSize={cohort_definition.size}
        />
      </div>

      {/* Metric Comparisons */}
      <div className="space-y-6">
        {Object.entries(performance_metrics).map(([key, metric]) => (
          <MetricComparisonBar key={key} metric={metric} />
        ))}
      </div>
    </section>
  );
}

interface PercentileDistributionProps {
  userPercentile: number;
  cohortSize: number;
}

function PercentileDistribution({ userPercentile, cohortSize }: PercentileDistributionProps) {
  return (
    <div className="bg-muted rounded-lg p-6 border border-border">
      <h3 className="text-lg font-bold text-foreground mb-4">Your Opportunity Qualification Level</h3>

      {/* Percentile Number */}
      <div className="text-center mb-6">
        <div className="inline-flex items-baseline gap-2">
          <span className="text-6xl font-bold text-primary">
            {userPercentile}
          </span>
          <span className="text-3xl font-bold text-muted-foreground">th</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Qualified for top {100 - userPercentile}% most sophisticated opportunities
        </p>
      </div>

      {/* Visual Distribution */}
      <div className="relative">
        <div className="w-full h-16 bg-gradient-to-r from-destructive via-primary/50 to-primary rounded-lg overflow-hidden">
          {/* Percentile Marker */}
          <motion.div
            initial={{ left: '0%' }}
            animate={{ left: `${userPercentile}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="absolute top-0 bottom-0 w-1 bg-foreground shadow-lg"
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <div className="bg-foreground text-background px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                YOU
              </div>
            </div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <div className="bg-foreground text-background px-2 py-1 rounded text-xs font-bold">
                {userPercentile}th
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scale Labels */}
        <div className="flex justify-between mt-12 text-xs text-muted-foreground">
          <span>Entry Level</span>
          <span>Mid-Tier Opportunities</span>
          <span>Most Sophisticated</span>
        </div>
      </div>
    </div>
  );
}

interface MetricComparisonBarProps {
  metric: MetricComparison;
}

function MetricComparisonBar({ metric }: MetricComparisonBarProps) {
  const {
    metric_name,
    your_value,
    peer_median,
    peer_top_quartile,
    peer_top_decile,
    percentile,
    trend
  } = metric;

  // Find max value for scaling
  const maxValue = Math.max(your_value, peer_median, peer_top_quartile, peer_top_decile);

  // Icon based on trend
  const TrendIcon = trend === 'above' ? TrendingUp : trend === 'below' ? TrendingDown : Minus;
  const trendColor = trend === 'above' ? 'text-primary' : trend === 'below' ? 'text-destructive' : 'text-muted-foreground';

  return (
    <div className="bg-muted rounded-lg p-6 border border-border">
      {/* Metric Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="text-lg font-semibold text-foreground mb-1">{metric_name}</h4>
          <p className="text-sm text-muted-foreground">
            Qualifies you for top {100 - percentile}% opportunities in this category
          </p>
        </div>
        <div className={`flex items-center gap-1 ${trendColor}`}>
          <TrendIcon className="w-5 h-5" />
          <span className="text-sm font-bold capitalize">{trend}</span>
        </div>
      </div>

      {/* Bars */}
      <div className="space-y-3">
        {/* Your Value */}
        <MetricBar
          label="Your Value"
          value={your_value}
          maxValue={maxValue}
          highlight={true}
        />

        {/* Peer Top Decile */}
        <MetricBar
          label="Top 10%"
          value={peer_top_decile}
          maxValue={maxValue}
        />

        {/* Peer Top Quartile */}
        <MetricBar
          label="Top 25%"
          value={peer_top_quartile}
          maxValue={maxValue}
        />

        {/* Peer Median */}
        <MetricBar
          label="Peer Median"
          value={peer_median}
          maxValue={maxValue}
        />
      </div>
    </div>
  );
}

interface MetricBarProps {
  label: string;
  value: number;
  maxValue: number;
  highlight?: boolean;
}

function MetricBar({ label, value, maxValue, highlight = false }: MetricBarProps) {
  const percentage = (value / maxValue) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-sm ${highlight ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
          {label}
        </span>
        <span className={`text-sm font-bold ${highlight ? 'text-primary' : 'text-foreground'}`}>
          {value.toLocaleString()}
        </span>
      </div>
      <div className="w-full h-3 bg-card rounded-full overflow-hidden border border-border">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full bg-primary ${highlight ? 'shadow-lg' : ''}`}
        />
      </div>
    </div>
  );
}
