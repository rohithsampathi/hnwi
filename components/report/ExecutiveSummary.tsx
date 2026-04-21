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
    sophistication_score,
  } = data;

  return (
    <section className="relative">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="inline-flex items-center gap-4 rounded-full border border-primary/20 bg-primary/10 px-8 py-4">
          <Award className="h-8 w-8 text-primary" />
          <span className="text-3xl font-bold tracking-wide text-foreground">
            {tier.toUpperCase()} TIER
          </span>
        </div>

        {(mental_models_applied || sophistication_score) && (
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {mental_models_applied && (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">{mental_models_applied}</span>
              </div>
            )}
            {sophistication_score && (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Sophistication: {sophistication_score}</span>
              </div>
            )}
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={<TrendingUp className="h-8 w-8 text-primary" />}
          label="Opportunity Access"
          value={`${percentile}th`}
          subtitle={`Qualified for top ${100 - percentile}% most sophisticated opportunities`}
          delay={0.1}
        />

        <MetricCard
          icon={<Target className="h-8 w-8 text-primary" />}
          label="Validated Signals"
          value={opportunities_accessible.toString()}
          subtitle={`${opportunities_missed} peer signals identified`}
          delay={0.2}
        />

        <MetricCard
          icon={<Users className="h-8 w-8 text-primary" />}
          label="Intelligence Sources"
          value={peer_group_size.toLocaleString()}
          subtitle="HNWI World developments analyzed"
          delay={0.3}
        />

        <MetricCard
          icon={<TrendingUp className="h-8 w-8 text-primary" />}
          label="Gap Analysis"
          value={`+${(optimization_potential * 100).toFixed(0)}%`}
          subtitle="Performance gap vs peer benchmark"
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
      className="cursor-pointer rounded-lg border border-border bg-muted/30 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-primary/30"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="rounded-lg bg-primary/10 p-3">{icon}</div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-3xl font-bold text-foreground">{value}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
      </div>
    </motion.div>
  );
}
