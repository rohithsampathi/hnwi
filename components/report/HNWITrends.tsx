// components/report/HNWITrends.tsx
// Shows what other HNWIs are doing based on HNWI World developments
// Small scannable cards that expand to open citation panel

'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Users, ExternalLink, ArrowRight } from 'lucide-react';

interface HNWITrend {
  briefId: string;
  headline: string;
  summary: string;
  adoption: {
    count: number;
    percentage: number;
  };
  impact?: {
    metric: string;
    value: string;
  };
  tier?: string[];
}

interface HNWITrendsProps {
  trends: HNWITrend[];
  onTrendClick: (briefId: string) => void;
}

export function HNWITrends({ trends, onTrendClick }: HNWITrendsProps) {
  if (!trends || trends.length === 0) {
    return null;
  }

  return (
    <section className="bg-card rounded-lg p-8 mb-8 border border-border">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-lg">
          <TrendingUp className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            What Other HNWIs Are Doing
          </h2>
          <p className="text-muted-foreground text-sm">
            Real-time intelligence from HNWI World showing peer movements and opportunities
          </p>
        </div>
      </div>

      {/* Trends Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trends.map((trend, index) => (
          <TrendCard
            key={trend.briefId}
            trend={trend}
            index={index}
            onClick={() => onTrendClick(trend.briefId)}
          />
        ))}
      </div>

      {/* Bottom Note */}
      <div className="mt-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
        <p className="text-sm text-foreground text-center">
          Intelligence powered by <span className="text-primary font-bold">1,562+ developments</span> from HNWI World
        </p>
      </div>
    </section>
  );
}

interface TrendCardProps {
  trend: HNWITrend;
  index: number;
  onClick: () => void;
}

function TrendCard({ trend, index, onClick }: TrendCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="group relative bg-muted/50 hover:bg-muted/70 border border-border hover:border-primary/50 rounded-lg p-5 cursor-pointer transition-all duration-300"
    >
      {/* Headline */}
      <h3 className="text-base font-bold text-foreground mb-3 pr-6 leading-tight line-clamp-2">
        {trend.headline}
      </h3>

      {/* Summary */}
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
        {trend.summary}
      </p>

      {/* Metrics Row */}
      <div className="flex items-center gap-4 mb-3">
        {/* Adoption */}
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Adopted by</span>
            <span className="text-sm font-bold text-primary">
              {trend.adoption.count} HNWIs
            </span>
          </div>
        </div>

        {/* Impact */}
        {trend.impact && (
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">{trend.impact.metric}</span>
            <span className="text-sm font-bold text-primary">
              {trend.impact.value}
            </span>
          </div>
        )}
      </div>

      {/* Tier Tags */}
      {trend.tier && trend.tier.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {trend.tier.map((t, i) => (
            <span
              key={i}
              className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded border border-primary/30"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Expand Hint */}
      <div className="flex items-center gap-2 text-primary text-sm font-medium">
        <span>Read full intelligence</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/50 rounded-lg transition-all pointer-events-none" />
    </motion.div>
  );
}
