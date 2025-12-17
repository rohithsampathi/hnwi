// components/report/ExecutiveSummary.tsx
// Executive Summary component for enhanced assessment reports
// Uses centralized theme colors only

'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Users, Target, Award } from 'lucide-react';
import type { ExecutiveSummary as ExecutiveSummaryData } from '@/types/assessment-report';

interface ExecutiveSummaryProps {
  data: ExecutiveSummaryData;
}

export function ExecutiveSummary({ data }: ExecutiveSummaryProps) {
  const {
    tier,
    percentile,
    opportunities_accessible,
    opportunities_missed,
    peer_group_size,
    optimization_potential,
    mental_models_applied,
    sophistication_score
  } = data;

  return (
    <section className="relative overflow-hidden bg-card rounded-lg p-8 mb-8 border border-border">
      {/* Tier Badge with Real Intelligence */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
      >
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary/10 rounded-full border border-primary/20">
          <Award className="w-6 h-6 text-primary" />
          <span className="text-foreground font-bold text-xl tracking-wide">
            {tier.toUpperCase()} TIER
          </span>
        </div>

        {/* Real Intelligence Metrics */}
        {(mental_models_applied || sophistication_score) && (
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {mental_models_applied && (
              <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg border border-border">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">{mental_models_applied}</span>
              </div>
            )}
            {sophistication_score && (
              <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg border border-border">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Sophistication: {sophistication_score}</span>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Percentile - Opportunity Qualification */}
        <MetricCard
          icon={<TrendingUp className="w-8 h-8 text-primary" />}
          label="Opportunity Access"
          value={`${percentile}th`}
          subtitle={`Qualified for top ${100 - percentile}% most sophisticated opportunities`}
          delay={0.1}
        />

        {/* Opportunities */}
        <MetricCard
          icon={<Target className="w-8 h-8 text-primary" />}
          label="Validated Opportunities"
          value={opportunities_accessible.toString()}
          subtitle={`${opportunities_missed} peer-executed opportunities missed`}
          delay={0.2}
        />

        {/* Intelligence Sources */}
        <MetricCard
          icon={<Users className="w-8 h-8 text-primary" />}
          label="Intelligence Sources"
          value={peer_group_size.toLocaleString()}
          subtitle="HNWI World developments analyzed"
          delay={0.3}
        />

        {/* Optimization */}
        <MetricCard
          icon={<TrendingUp className="w-8 h-8 text-primary" />}
          label="Gap Analysis"
          value={`+${(optimization_potential * 100).toFixed(0)}%`}
          subtitle="Performance gap vs top 0.1%"
          delay={0.4}
        />
      </div>
    </section>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle: string;
  delay: number;
}

function MetricCard({ icon, label, value, subtitle, delay }: MetricCardProps) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay }}
      className="bg-muted/30 backdrop-blur-sm rounded-lg p-6 border border-border hover:border-primary/30 transition-all duration-300 cursor-pointer hover:transform hover:scale-105"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-muted-foreground text-sm font-medium">{label}</p>
        <p className="text-3xl font-bold text-primary">{value}</p>
        <p className="text-muted-foreground text-xs">{subtitle}</p>
      </div>
    </motion.div>
  );
}
