# Enhanced Assessment Report UI Implementation

## Visual Design Philosophy
Transform dense data into **scannable, actionable intelligence** using:
- Spider/radar charts for multi-dimensional comparisons
- Heat maps for geographic opportunities
- Sankey diagrams for opportunity flow
- Timeline projections
- Interactive peer benchmarking

---

## Component Architecture

```
app/assessment/report/[sessionId]/
├── page.tsx                              # Main report page
├── components/
│   ├── ExecutiveSummary.tsx             # Hero section with key metrics
│   ├── SpiderGraphComparison.tsx        # Multi-dimensional radar chart
│   ├── MissedOpportunities.tsx          # "What You Missed" section
│   ├── CelebrityOpportunities.tsx       # What top performers are doing
│   ├── PeerBenchmarking.tsx             # Detailed peer comparison
│   ├── PerformanceTimeline.tsx          # 10-year projection
│   ├── GeographicHeatMap.tsx            # Regional opportunity map
│   ├── OpportunityFlow.tsx              # Sankey diagram
│   └── ActionableInsights.tsx           # KGv2 intelligence
└── lib/
    └── charts.ts                         # Chart configuration utilities
```

---

## 1. Executive Summary Component

### Visual Design
```typescript
// components/report/ExecutiveSummary.tsx
'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Users, Target, Award } from 'lucide-react';

interface ExecutiveSummaryProps {
  tier: string;
  percentile: number;
  opportunitiesAccessible: number;
  opportunitiesMissed: number;
  peerGroupSize: number;
  optimizationPotential: number;
}

export function ExecutiveSummary({
  tier,
  percentile,
  opportunitiesAccessible,
  opportunitiesMissed,
  peerGroupSize,
  optimizationPotential
}: ExecutiveSummaryProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 mb-8">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10">
        {/* Tier Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"
        >
          <Award className="w-6 h-6 text-white" />
          <span className="text-white font-bold text-xl">{tier} TIER</span>
        </motion.div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Percentile */}
          <MetricCard
            icon={<TrendingUp className="w-8 h-8 text-emerald-400" />}
            label="Peer Percentile"
            value={`${percentile}th`}
            subtitle={`Top ${100 - percentile}% of ${peerGroupSize.toLocaleString()} peers`}
            color="emerald"
          />

          {/* Opportunities */}
          <MetricCard
            icon={<Target className="w-8 h-8 text-blue-400" />}
            label="Opportunities"
            value={opportunitiesAccessible.toString()}
            subtitle={`${opportunitiesMissed} missed opportunities identified`}
            color="blue"
          />

          {/* Peer Group */}
          <MetricCard
            icon={<Users className="w-8 h-8 text-purple-400" />}
            label="Peer Cohort"
            value={peerGroupSize.toLocaleString()}
            subtitle="Similar HNWIs analyzed"
            color="purple"
          />

          {/* Optimization */}
          <MetricCard
            icon={<TrendingUp className="w-8 h-8 text-orange-400" />}
            label="Growth Potential"
            value={`+${(optimizationPotential * 100).toFixed(0)}%`}
            subtitle="Opportunity for improvement"
            color="orange"
          />
        </div>
      </div>
    </section>
  );
}

function MetricCard({ icon, label, value, subtitle, color }) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`
        bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6
        border border-${color}-500/20 hover:border-${color}-500/50
        transition-all duration-300 cursor-pointer
        hover:transform hover:scale-105
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 bg-${color}-500/10 rounded-xl`}>
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-gray-400 text-sm font-medium">{label}</p>
        <p className="text-white text-3xl font-bold">{value}</p>
        <p className="text-gray-500 text-xs">{subtitle}</p>
      </div>
    </motion.div>
  );
}
```

---

## 2. Spider Graph Comparison

### Multi-Dimensional Radar Chart
```typescript
// components/report/SpiderGraphComparison.tsx
'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface SpiderGraphProps {
  dimensions: string[];
  userScores: number[];
  peerAverage: number[];
  topPerformers: number[];
}

export function SpiderGraphComparison({
  dimensions,
  userScores,
  peerAverage,
  topPerformers
}: SpiderGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous render
    d3.select(svgRef.current).selectAll('*').remove();

    const width = 600;
    const height = 600;
    const radius = Math.min(width, height) / 2 - 80;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Create scales
    const angleScale = d3.scaleLinear()
      .domain([0, dimensions.length])
      .range([0, 2 * Math.PI]);

    const radiusScale = d3.scaleLinear()
      .domain([0, 1])
      .range([0, radius]);

    // Draw circular grid
    const levels = 5;
    for (let i = 1; i <= levels; i++) {
      svg.append('circle')
        .attr('r', (radius / levels) * i)
        .attr('fill', 'none')
        .attr('stroke', '#374151')
        .attr('stroke-width', 1)
        .attr('opacity', 0.3);
    }

    // Draw axes
    dimensions.forEach((dim, i) => {
      const angle = angleScale(i) - Math.PI / 2;
      const lineEnd = radiusScale(1);

      svg.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', Math.cos(angle) * lineEnd)
        .attr('y2', Math.sin(angle) * lineEnd)
        .attr('stroke', '#374151')
        .attr('stroke-width', 1)
        .attr('opacity', 0.5);

      // Add labels
      const labelRadius = radius + 40;
      svg.append('text')
        .attr('x', Math.cos(angle) * labelRadius)
        .attr('y', Math.sin(angle) * labelRadius)
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('fill', '#9CA3AF')
        .attr('font-size', '12px')
        .attr('font-weight', '600')
        .text(dim);
    });

    // Function to create path data
    const createPathData = (scores: number[]) => {
      return d3.line()
        .x((d, i) => {
          const angle = angleScale(i) - Math.PI / 2;
          return Math.cos(angle) * radiusScale(scores[i]);
        })
        .y((d, i) => {
          const angle = angleScale(i) - Math.PI / 2;
          return Math.sin(angle) * radiusScale(scores[i]);
        })
        .curve(d3.curveLinearClosed);
    };

    // Draw top performers area (background)
    svg.append('path')
      .datum(topPerformers)
      .attr('d', createPathData(topPerformers))
      .attr('fill', '#10B981')
      .attr('fill-opacity', 0.1)
      .attr('stroke', '#10B981')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr('stroke-opacity', 0.5);

    // Draw peer average area
    svg.append('path')
      .datum(peerAverage)
      .attr('d', createPathData(peerAverage))
      .attr('fill', '#6366F1')
      .attr('fill-opacity', 0.1)
      .attr('stroke', '#6366F1')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.8);

    // Draw user scores (foreground)
    svg.append('path')
      .datum(userScores)
      .attr('d', createPathData(userScores))
      .attr('fill', '#F59E0B')
      .attr('fill-opacity', 0.3)
      .attr('stroke', '#F59E0B')
      .attr('stroke-width', 3);

    // Add data points for user scores
    userScores.forEach((score, i) => {
      const angle = angleScale(i) - Math.PI / 2;
      const r = radiusScale(score);

      svg.append('circle')
        .attr('cx', Math.cos(angle) * r)
        .attr('cy', Math.sin(angle) * r)
        .attr('r', 6)
        .attr('fill', '#F59E0B')
        .attr('stroke', '#1F2937')
        .attr('stroke-width', 2);
    });

  }, [dimensions, userScores, peerAverage, topPerformers]);

  return (
    <div className="bg-slate-900 rounded-2xl p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Multi-Dimensional Performance Analysis
        </h2>
        <p className="text-gray-400">
          Compare your profile across {dimensions.length} key dimensions against peers and top performers
        </p>
      </div>

      <div className="flex justify-center mb-6">
        <svg ref={svgRef} className="max-w-full h-auto" />
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-8">
        <LegendItem color="bg-amber-500" label="Your Profile" />
        <LegendItem color="bg-indigo-500" label="Peer Average" />
        <LegendItem color="bg-emerald-500" label="Top 10% Performers" border="dashed" />
      </div>

      {/* Improvement Areas */}
      <div className="mt-8 p-6 bg-slate-800/50 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-4">
          🎯 Top 3 Improvement Opportunities
        </h3>
        <div className="space-y-3">
          {getTopImprovementAreas(dimensions, userScores, topPerformers).map((area, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <span className="text-gray-300">{area.dimension}</span>
              <span className="text-amber-400 font-semibold">
                +{area.improvementPotential}% potential
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label, border = 'solid' }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-4 h-4 ${color} rounded ${border === 'dashed' ? 'border-2 border-dashed' : ''}`} />
      <span className="text-gray-400 text-sm">{label}</span>
    </div>
  );
}

function getTopImprovementAreas(dimensions, userScores, topScores) {
  return dimensions
    .map((dim, i) => ({
      dimension: dim,
      gap: topScores[i] - userScores[i],
      improvementPotential: ((topScores[i] - userScores[i]) * 100).toFixed(0)
    }))
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 3);
}
```

---

## 3. Missed Opportunities Section

### "What You Missed" Visual Component
```typescript
// components/report/MissedOpportunities.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingUp, Users, DollarSign } from 'lucide-react';

interface MissedOpportunity {
  opportunity: {
    title: string;
    category: string;
    location: string;
  };
  question: string;
  your_choice: string;
  winning_choice: string;
  peer_adoption: number;
  avg_roi: number;
  missed_value: number;
}

interface MissedOpportunitiesProps {
  opportunities: MissedOpportunity[];
  totalMissedValue: number;
}

export function MissedOpportunities({
  opportunities,
  totalMissedValue
}: MissedOpportunitiesProps) {
  const [selectedOpp, setSelectedOpp] = useState<MissedOpportunity | null>(null);

  return (
    <section className="bg-slate-900 rounded-2xl p-8 mb-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-7 h-7 text-amber-500" />
            <h2 className="text-3xl font-bold text-white">
              What You Missed
            </h2>
          </div>
          <p className="text-gray-400">
            High-value opportunities that successful peers captured but you didn't
          </p>
        </div>

        {/* Total Missed Value */}
        <div className="text-right">
          <p className="text-sm text-gray-500 mb-1">Estimated Missed Value</p>
          <p className="text-3xl font-bold text-amber-500">
            ${(totalMissedValue / 1000000).toFixed(1)}M
          </p>
        </div>
      </div>

      {/* Opportunity Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {opportunities.map((opp, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setSelectedOpp(opp)}
            className="
              group relative overflow-hidden
              bg-gradient-to-br from-slate-800 to-slate-800/50
              hover:from-amber-900/20 hover:to-slate-800/50
              border border-slate-700 hover:border-amber-500/50
              rounded-xl p-6 cursor-pointer
              transition-all duration-300
            "
          >
            {/* Rank Badge */}
            <div className="absolute top-4 right-4">
              <div className="px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-full">
                <span className="text-amber-400 font-bold text-sm">#{i + 1}</span>
              </div>
            </div>

            {/* Opportunity Info */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-white mb-2 pr-16">
                {opp.opportunity.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className="px-2 py-1 bg-slate-700 rounded">{opp.opportunity.category}</span>
                <span>•</span>
                <span>{opp.opportunity.location}</span>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <Metric
                icon={<TrendingUp className="w-4 h-4" />}
                label="ROI"
                value={`${(opp.avg_roi * 100).toFixed(1)}%`}
                color="emerald"
              />
              <Metric
                icon={<Users className="w-4 h-4" />}
                label="Peer Adoption"
                value={`${opp.peer_adoption}`}
                color="blue"
              />
              <Metric
                icon={<DollarSign className="w-4 h-4" />}
                label="Missed Value"
                value={`$${(opp.missed_value / 1000).toFixed(0)}K`}
                color="amber"
              />
            </div>

            {/* Choice Comparison */}
            <div className="pt-4 border-t border-slate-700">
              <div className="text-xs text-gray-500 mb-2">{opp.question}</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-red-500/10 border border-red-500/30 rounded">
                  <p className="text-xs text-red-400 mb-1">Your Choice</p>
                  <p className="text-xs text-gray-300">{opp.your_choice}</p>
                </div>
                <div className="p-2 bg-green-500/10 border border-green-500/30 rounded">
                  <p className="text-xs text-green-400 mb-1">Winning Choice</p>
                  <p className="text-xs text-gray-300">{opp.winning_choice}</p>
                </div>
              </div>
            </div>

            {/* Hover Arrow */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-amber-500">→</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal for Selected Opportunity */}
      <AnimatePresence>
        {selectedOpp && (
          <OpportunityDetailModal
            opportunity={selectedOpp}
            onClose={() => setSelectedOpp(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function Metric({ icon, label, value, color }) {
  return (
    <div className="flex flex-col">
      <div className={`flex items-center gap-1 text-${color}-400 mb-1`}>
        {icon}
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <span className={`text-sm font-bold text-${color}-400`}>{value}</span>
    </div>
  );
}
```

---

## 4. Celebrity Opportunities Section

```typescript
// components/report/CelebrityOpportunities.tsx
'use client';

export function CelebrityOpportunities({ opportunities }) {
  return (
    <section className="bg-gradient-to-br from-purple-900/20 to-slate-900 rounded-2xl p-8 mb-8 border border-purple-500/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-500/20 rounded-xl">
          <Award className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">
            What Top Performers Are Doing
          </h2>
          <p className="text-gray-400 text-sm">
            Opportunities that the top 5% of {tier} tier HNWIs are pursuing
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {opportunities.map((opp, i) => (
          <CelebrityOpportunityCard key={i} opportunity={opp} rank={i + 1} />
        ))}
      </div>
    </section>
  );
}
```

---

## 5. Interactive Peer Benchmarking

```typescript
// components/report/PeerBenchmarking.tsx
'use client';

export function PeerBenchmarking({ comparison }) {
  return (
    <section className="bg-slate-900 rounded-2xl p-8 mb-8">
      <h2 className="text-2xl font-bold text-white mb-6">
        How You Compare to {comparison.cohort_size.toLocaleString()} Similar HNWIs
      </h2>

      {/* Percentile Visualization */}
      <div className="mb-8">
        <PercentileDistribution
          userPercentile={comparison.your_percentile}
          cohortSize={comparison.cohort_size}
        />
      </div>

      {/* Metric Comparisons */}
      <div className="space-y-6">
        {Object.entries(comparison.performance_metrics).map(([metric, data]) => (
          <MetricComparison
            key={metric}
            metric={metric}
            yourValue={data.you}
            peerMedian={data.peer_median}
            topQuartile={data.peer_top_quartile}
            topDecile={data.peer_top_decile}
          />
        ))}
      </div>
    </section>
  );
}
```

---

## Key Features Summary

### ✅ **Visual-First Design**
- Spider graphs for multi-dimensional comparison
- Heat maps for geographic opportunities
- Sankey diagrams for opportunity flow
- Interactive timelines for projections

### ✅ **Actionable Intelligence**
- Top 10 missed opportunities with peer adoption rates
- Celebrity opportunities that top performers are taking
- Specific improvement areas with potential gains
- KGv2-powered insights and predictions

### ✅ **Peer Benchmarking**
- Compare against similar HNWIs
- Percentile rankings across multiple dimensions
- Visual performance gaps
- Behavioral comparisons

### ✅ **Mobile Responsive**
- All charts adapt to mobile
- Touch-friendly interactions
- Progressive disclosure of details
- Optimized for tablet viewing

---

This UI implementation provides HNWI/UHNWI clients with:
1. **Scannable visuals** - No dense text walls
2. **Peer intelligence** - How they compare and what others are doing
3. **Missed opportunities** - Clear gaps in their strategy
4. **Actionable insights** - What to do next
5. **Premium aesthetics** - Worthy of their tier