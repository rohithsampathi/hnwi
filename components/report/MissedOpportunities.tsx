// components/report/MissedOpportunities.tsx
// "What You Missed" section showing opportunities successful peers captured
// Uses centralized theme colors only

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingUp, Users, DollarSign, X, ExternalLink } from 'lucide-react';
import type { MissedOpportunity, MissedOpportunitiesData } from '@/types/assessment-report';

interface MissedOpportunitiesProps {
  data: MissedOpportunitiesData;
}

export function MissedOpportunities({ data }: MissedOpportunitiesProps) {
  const { top_missed, total_missed_value } = data;
  const [selectedOpp, setSelectedOpp] = useState<MissedOpportunity | null>(null);

  return (
    <section className="bg-card rounded-lg p-8 mb-8 border border-border">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-7 h-7 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">
              What You Missed
            </h2>
          </div>
          <p className="text-muted-foreground">
            High-value opportunities that successful peers captured but you didn't
          </p>
        </div>

        {/* Total Missed Value */}
        <div className="text-left md:text-right">
          <p className="text-sm text-muted-foreground mb-1">Estimated Missed Value</p>
          <p className="text-3xl font-bold text-primary">
            ${(total_missed_value / 1000000).toFixed(1)}M
          </p>
        </div>
      </div>

      {/* Opportunity Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {top_missed.map((opp, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setSelectedOpp(opp)}
            className="group relative overflow-hidden bg-muted/50 hover:bg-muted/70 border border-border hover:border-primary/50 rounded-lg p-6 cursor-pointer transition-all duration-300"
          >
            {/* Rank Badge */}
            <div className="absolute top-4 right-4">
              <div className="px-3 py-1 bg-primary/10 border border-primary/30 rounded-full">
                <span className="text-primary font-bold text-sm">#{i + 1}</span>
              </div>
            </div>

            {/* Opportunity Info */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-foreground mb-2 pr-16">
                {opp.opportunity.title}
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="px-2 py-1 bg-card rounded border border-border">{opp.opportunity.category}</span>
                <span>•</span>
                <span>{opp.opportunity.location}</span>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <Metric
                icon={<TrendingUp className="w-4 h-4" />}
                label="ROI"
                value={`${(opp.peer_performance.avg_roi * 100).toFixed(1)}%`}
              />
              <Metric
                icon={<Users className="w-4 h-4" />}
                label="Adoption"
                value={`${opp.peer_performance.adoption_rate.toFixed(0)}%`}
              />
              <Metric
                icon={<DollarSign className="w-4 h-4" />}
                label="Missed"
                value={`$${(opp.financial_impact.missed_value / 1000).toFixed(0)}K`}
              />
            </div>

            {/* Choice Comparison */}
            <div className="pt-4 border-t border-border">
              <div className="text-xs text-muted-foreground mb-2">{opp.question_context.question_title}</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-destructive/10 border border-destructive/30 rounded">
                  <p className="text-xs text-destructive mb-1">Your Choice</p>
                  <p className="text-xs text-foreground">{opp.question_context.your_choice}</p>
                </div>
                <div className="p-2 bg-primary/10 border border-primary/30 rounded">
                  <p className="text-xs text-primary mb-1">Winning Choice</p>
                  <p className="text-xs text-foreground">{opp.question_context.winning_choice}</p>
                </div>
              </div>
            </div>

            {/* Hover Arrow */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-primary">→</span>
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

interface MetricProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function Metric({ icon, label, value }: MetricProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1 text-primary mb-1">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm font-bold text-primary">{value}</span>
    </div>
  );
}

interface OpportunityDetailModalProps {
  opportunity: MissedOpportunity;
  onClose: () => void;
}

function OpportunityDetailModal({ opportunity, onClose }: OpportunityDetailModalProps) {
  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-lg p-8 z-50"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 pr-4">
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {opportunity.opportunity.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="px-2 py-1 bg-muted rounded border border-border">{opportunity.opportunity.category}</span>
              <span>•</span>
              <span>{opportunity.opportunity.location}</span>
              <span>•</span>
              <span>{opportunity.opportunity.tier} Tier</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Financial Impact */}
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-bold text-primary mb-4">Financial Impact</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Missed Value</p>
              <p className="text-xl font-bold text-foreground">
                ${(opportunity.financial_impact.missed_value / 1000).toFixed(0)}K
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Potential ROI</p>
              <p className="text-xl font-bold text-primary">
                {(opportunity.financial_impact.potential_roi * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Time to ROI</p>
              <p className="text-xl font-bold text-primary">
                {opportunity.financial_impact.time_to_roi}
              </p>
            </div>
          </div>
        </div>

        {/* Peer Performance */}
        <div className="bg-muted rounded-lg p-6 mb-6 border border-border">
          <h4 className="text-lg font-bold text-foreground mb-4">Peer Performance</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Adoption Count</span>
              <span className="text-foreground font-bold">{opportunity.peer_performance.adoption_count} peers</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Adoption Rate</span>
              <span className="text-foreground font-bold">{opportunity.peer_performance.adoption_rate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Average ROI</span>
              <span className="text-primary font-bold">{(opportunity.peer_performance.avg_roi * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Success Rate</span>
              <span className="text-primary font-bold">{(opportunity.peer_performance.success_rate * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Why Missed */}
        <div className="bg-muted rounded-lg p-6 mb-6 border border-border">
          <h4 className="text-lg font-bold text-foreground mb-3">Why You Missed This</h4>
          <p className="text-foreground leading-relaxed">{opportunity.why_missed}</p>
        </div>

        {/* Action Required */}
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-6">
          <h4 className="text-lg font-bold text-primary mb-3">Action Required</h4>
          <p className="text-foreground leading-relaxed mb-4">{opportunity.action_required}</p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground font-medium rounded-lg transition-opacity">
            Learn More
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </>
  );
}
