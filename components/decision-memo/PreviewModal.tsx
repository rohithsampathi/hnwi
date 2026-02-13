// components/decision-memo/PreviewModal.tsx
// Premium Preview Modal - Goldman/McKinsey Design Language
// Payment-at-result model with theme-consistent styling

"use client";

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Diamond, AlertTriangle, TrendingUp, Check, Shield, Lock, ArrowRight, Zap, Target, Crown } from 'lucide-react';
import type { Opportunity, Mistake, IntelligenceMatch, PreviewData } from '@/lib/hooks/useDecisionMemoSSE';

// Pricing configuration
const PRICING = {
  single: {
    price: 5000,
    currency: 'USD',
    memos: 1,
    architectAccess: false,
    features: [
      '1 Decision Memo',
      '6 Expert MoE Analysis',
      'All matched opportunities',
      'Evidence-anchored recommendations',
      '90-day action plan',
      'PDF export'
    ]
  },
  premium: {
    price: 25000,
    currency: 'USD',
    period: 'year',
    memos: 10,
    architectAccess: true,
    architectValue: 17988, // $1,499/mo × 12
    memosValue: 50000, // $5,000 × 10
    totalValue: 67988,
    savings: 42988,
    features: [
      '10 Decision Memos',
      'Architect Tier Access ($1,499/mo value)',
      'HNWI World Intelligence',
      'Privé Exchange Access',
      'Ask Rohith AI Advisor',
      'Crown Vault Asset Management',
      'Priority support',
      'Quarterly strategy calls'
    ]
  }
};

interface PreviewModalProps {
  isOpen: boolean;
  previewData: PreviewData | null;
  opportunities: Opportunity[];
  mistakes: Mistake[];
  intelligenceMatches: IntelligenceMatch[];
  onPay: (tier: 'single' | 'premium') => void;
  onClose: () => void;
}

export function PreviewModal({
  isOpen,
  previewData,
  opportunities,
  mistakes,
  intelligenceMatches,
  onPay,
  onClose
}: PreviewModalProps) {
  if (!isOpen || !previewData) return null;

  // Calculate total savings from mistakes
  const { totalSavings, savingsBreakdown } = useMemo(() => {
    let total = 0;
    const breakdown = mistakes.map(mistake => {
      // Extract numeric value from cost string (e.g., "$11.5M" -> 11500000)
      const match = mistake.cost.match(/\$?([\d.]+)([MK]?)/);
      let value = 0;
      if (match) {
        value = parseFloat(match[1]);
        if (match[2] === 'M') value *= 1000000;
        if (match[2] === 'K') value *= 1000;
      }
      total += value;
      return { title: mistake.title, value, urgency: mistake.urgency };
    });
    return { totalSavings: total, savingsBreakdown: breakdown.sort((a, b) => b.value - a.value) };
  }, [mistakes]);

  const savingsInMillions = (totalSavings / 1000000).toFixed(1);
  const roiMultiplier = Math.round(totalSavings / 1000);

  // Top 3 mistakes for preview
  const topMistakes = mistakes.slice(0, 3);

  // Categorize opportunities by tier
  const opportunityTiers = useMemo(() => {
    const tiers: Record<string, number> = {};
    opportunities.forEach(opp => {
      const tier = opp.tier || 'Unknown';
      tiers[tier] = (tiers[tier] || 0) + 1;
    });
    return tiers;
  }, [opportunities]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="bg-background border border-border rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-y-auto relative shadow-2xl my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header with gradient */}
          <div className="relative p-8 md:p-12 border-b border-border bg-gradient-to-br from-primary/5 via-transparent to-primary/5">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-4">
                <Zap className="w-4 h-4" />
                Your Intelligence Preview
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                We Found {mistakes.length} Six-Figure Mistakes
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl">
                Based on your 10 questions, our AI analyzed <span className="text-foreground font-semibold">1,562 HNWI corridor signals</span> and detected critical coordination gaps in your allocation strategy.
              </p>
            </motion.div>
          </div>

          {/* Summary Stats Grid - Theme Consistent */}
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6 p-6 sm:p-8 md:p-12 border-b border-border bg-muted/20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              <div className="relative p-4 sm:p-6 bg-card border border-primary/20 rounded-xl sm:rounded-2xl">
                <Diamond className="w-8 h-8 sm:w-10 sm:h-10 text-primary mb-3 sm:mb-4" />
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-2">{opportunities.length}</div>
                <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide mb-2 sm:mb-3">Matching Opportunities</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">
                  From {Object.keys(opportunityTiers).length} jurisdictions
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              <div className="relative p-4 sm:p-6 bg-card border border-primary/20 rounded-xl sm:rounded-2xl">
                <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-primary mb-3 sm:mb-4" />
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-2">{mistakes.length}</div>
                <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide mb-2 sm:mb-3">Six-Figure Mistakes</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">
                  {mistakes.filter(m => m.urgency === 'Critical' || m.urgency === 'High').length} require immediate action
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              <div className="relative p-4 sm:p-6 bg-card border border-primary/20 rounded-xl sm:rounded-2xl">
                <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-primary mb-3 sm:mb-4" />
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-2">{intelligenceMatches.length}</div>
                <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide mb-2 sm:mb-3">Intelligence Matches</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">
                  Regulatory deadlines tracked
                </div>
              </div>
            </motion.div>
          </div>

          {/* Total Savings Hero Banner - Theme Consistent */}
          {totalSavings > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="mx-4 sm:mx-8 md:mx-12 my-6 sm:my-8 p-6 sm:p-10 md:p-12 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-2xl sm:rounded-3xl text-primary-foreground relative overflow-hidden shadow-2xl"
            >
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-48 sm:w-64 h-48 sm:h-64 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-white rounded-full blur-3xl" />
              </div>

              <div className="relative z-10 text-center">
                <div className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 opacity-90 uppercase tracking-wider">Total Potential Savings Identified</div>
                <div className="text-5xl sm:text-7xl md:text-8xl font-bold mb-3 sm:mb-4 drop-shadow-lg">${savingsInMillions}M</div>
                <div className="text-sm sm:text-lg opacity-90 max-w-2xl mx-auto mb-4 sm:mb-6 px-2">
                  From {mistakes.length} coordination failures detected across your allocation timeline
                </div>

                {/* Savings Breakdown Bars */}
                <div className="mt-6 sm:mt-8 space-y-2 sm:space-y-3 max-w-2xl mx-auto">
                  {savingsBreakdown.slice(0, 3).map((item, index) => {
                    const percentage = (item.value / totalSavings) * 100;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="relative"
                      >
                        <div className="flex items-center justify-between mb-1 sm:mb-1.5 text-xs sm:text-sm">
                          <span className="font-medium truncate max-w-[180px] sm:max-w-xs">{item.title}</span>
                          <span className="font-bold ml-2">${(item.value / 1000000).toFixed(1)}M</span>
                        </div>
                        <div className="h-2 sm:h-3 bg-white/20 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ delay: 0.8 + index * 0.1, duration: 0.8, ease: 'easeOut' }}
                            className="h-full bg-white rounded-full shadow-lg"
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Preview of Top Discoveries */}
          <div className="px-4 sm:px-8 md:px-12 py-6 sm:py-8 space-y-4 sm:space-y-6">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2 sm:gap-3">
              <Target className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              Critical Findings Preview
            </h3>

            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
              {/* Top Mistake - Theme Consistent */}
              {topMistakes[0] && (
                <div className="group relative bg-gradient-to-br from-primary/5 to-primary/0 border border-primary/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                    <div className="px-2 sm:px-3 py-0.5 sm:py-1 bg-primary text-primary-foreground text-[10px] sm:text-xs font-bold rounded-full">
                      #1 CRITICAL
                    </div>
                  </div>

                  <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 border border-primary/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base sm:text-lg font-bold mb-2 text-foreground pr-16 sm:pr-20">{topMistakes[0].title}</h4>
                      <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-primary/10 border border-primary/20 rounded-lg">
                        <span className="text-[10px] sm:text-xs text-muted-foreground">Potential Cost:</span>
                        <span className="text-xs sm:text-sm font-bold text-primary">{topMistakes[0].cost}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">{topMistakes[0].fix.substring(0, 150)}...</p>
                    <div className="flex items-center gap-2 text-[10px] sm:text-xs text-primary font-medium">
                      <Lock className="w-3 h-3" />
                      <span>Full fix strategy in Decision Memo</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Top Opportunity - Theme Consistent */}
              {opportunities[0] && (
                <div className="group relative bg-gradient-to-br from-primary/5 to-primary/0 border border-primary/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                    <div className="px-2 sm:px-3 py-0.5 sm:py-1 bg-primary text-primary-foreground text-[10px] sm:text-xs font-bold rounded-full">
                      {Math.round(opportunities[0].alignment_score * 100)}% MATCH
                    </div>
                  </div>

                  <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 border border-primary/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                      <Diamond className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base sm:text-lg font-bold mb-2 text-foreground pr-16 sm:pr-20">{opportunities[0].title}</h4>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        <span className="px-2 py-0.5 sm:py-1 bg-primary/10 border border-primary/20 rounded text-[10px] sm:text-xs font-medium">{opportunities[0].location}</span>
                        <span className="px-2 py-0.5 sm:py-1 bg-primary/10 border border-primary/20 rounded text-[10px] sm:text-xs font-medium text-primary">{opportunities[0].expected_return}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">{opportunities[0].reason.substring(0, 150)}...</p>
                    <div className="flex items-center gap-2 text-[10px] sm:text-xs text-primary font-medium">
                      <Lock className="w-3 h-3" />
                      <span>Full investment thesis in Decision Memo</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Teaser Grid - What's Locked */}
            <div className="grid md:grid-cols-3 gap-4 mt-8">
              {[
                { icon: Lock, title: `${mistakes.length - 1} More Mistakes`, desc: 'With step-by-step fix strategies' },
                { icon: Lock, title: `${opportunities.length - 1} More Opportunities`, desc: 'With detailed investment analysis' },
                { icon: Lock, title: '90-Day Action Plan', desc: 'Deadline-driven execution roadmap' },
              ].map((item, index) => (
                <div key={index} className="p-5 bg-muted/30 border border-border rounded-xl text-center opacity-60">
                  <item.icon className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                  <div className="font-semibold mb-1">{item.title}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* What's Included Section */}
          <div className="px-8 md:px-12 py-8 bg-muted/30 border-y border-border">
            <h3 className="text-2xl font-bold mb-6">Full Decision Memo Includes:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                `Complete analysis of all ${opportunities.length} opportunities with investment thesis`,
                `Detailed fix strategies for all ${mistakes.length} mistakes with timeline and cost breakdowns`,
                'Full regulatory intelligence report with jurisdiction-specific deadlines',
                '5-year financial projections across multiple jurisdictions',
                'Tax optimization roadmap (Dubai vs Singapore vs alternatives)',
                'Asset structure recommendations (SPVs, trusts, foundations)',
                '90-day execution playbook with week-by-week action items',
                `${intelligenceMatches.length} regulatory intelligence briefs with deadline tracking`,
                'Peer SFO case studies with similar coordination challenges',
                'Timeline sequencing calculator (prevents $200K+ exit tax mistakes)',
                'Advisor coordination framework (reduces 21-28 day lag)',
                'Liquidity forcing event tracker (catches timeline mismatches)',
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-card/50 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ROI Banner - Theme Consistent */}
          {totalSavings > 0 && (
            <div className="px-4 sm:px-8 md:px-12 py-6 sm:py-8 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-y border-primary/20">
              <div className="text-center max-w-4xl mx-auto">
                <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-3 sm:mb-4 uppercase tracking-wide">Your Return on Investment:</div>
                <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 text-base sm:text-xl md:text-3xl font-bold flex-wrap">
                  <span className="text-primary">${savingsInMillions}M prevented</span>
                  <span className="text-muted-foreground">÷</span>
                  <span className="text-foreground">$5,000</span>
                  <span className="text-muted-foreground">=</span>
                  <span className="text-primary text-2xl sm:text-4xl md:text-5xl">{Math.round(totalSavings / 5000).toLocaleString()}x ROI</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4 px-2">
                  This doesn't include upside from {opportunities.length} opportunities matched to your profile
                </p>
              </div>
            </div>
          )}

          {/* Pricing Section - Theme Consistent */}
          <div className="p-4 sm:p-8 md:p-12">
            <div className="text-center mb-8 sm:mb-10">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3">Choose Your Access Level</h3>
              <p className="text-sm sm:text-base text-muted-foreground">Unlock your complete Decision Memo with actionable intelligence</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
              {/* Single Memo Tier */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative bg-card border-2 border-border rounded-xl sm:rounded-2xl p-5 sm:p-8 hover:border-primary/30 transition-all"
              >
                <div className="mb-4 sm:mb-6">
                  <h4 className="text-lg sm:text-xl font-bold text-foreground mb-1 sm:mb-2">Single Decision Memo</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">One-time purchase</p>
                </div>

                <div className="mb-4 sm:mb-6">
                  <span className="text-3xl sm:text-5xl font-bold text-foreground">$5,000</span>
                  <span className="text-muted-foreground ml-2 text-sm">one-time</span>
                </div>

                <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                  {PRICING.single.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onPay('single')}
                  className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  Get Memo
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              </motion.div>

              {/* Premium Annual Tier - Theme Consistent */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative bg-gradient-to-br from-primary/10 via-card to-primary/5 border-2 border-primary/50 rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-xl shadow-primary/10"
              >
                {/* Best Value Badge */}
                <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2">
                  <div className="px-3 sm:px-4 py-1 sm:py-1.5 bg-primary text-primary-foreground text-xs sm:text-sm font-bold rounded-full shadow-lg flex items-center gap-1.5">
                    <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
                    BEST VALUE
                  </div>
                </div>

                <div className="mb-4 sm:mb-6 pt-2">
                  <h4 className="text-lg sm:text-xl font-bold text-foreground mb-1 sm:mb-2">Premium Annual</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">Full platform access</p>
                </div>

                <div className="mb-3 sm:mb-4">
                  <span className="text-3xl sm:text-5xl font-bold text-foreground">$25,000</span>
                  <span className="text-muted-foreground ml-2 text-sm">/year</span>
                </div>

                {/* Value Breakdown */}
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-primary/10 border border-primary/20 rounded-xl">
                  <div className="flex justify-between text-xs sm:text-sm mb-1.5 sm:mb-2">
                    <span className="text-muted-foreground">Architect Tier ($1,499/mo)</span>
                    <span className="text-foreground font-medium">$17,988</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm mb-1.5 sm:mb-2">
                    <span className="text-muted-foreground">10 Decision Memos</span>
                    <span className="text-foreground font-medium">$25,000</span>
                  </div>
                  <div className="border-t border-primary/20 my-1.5 sm:my-2 pt-1.5 sm:pt-2">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">Total Value</span>
                      <span className="text-foreground font-semibold line-through">$42,988</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm mt-1">
                      <span className="text-primary font-semibold">You Save</span>
                      <span className="text-primary font-bold">$17,988 (42%)</span>
                    </div>
                  </div>
                </div>

                <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                  {PRICING.premium.features.slice(0, 5).map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className={`${i < 2 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                  <li className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm">
                    <span className="text-primary font-medium ml-6 sm:ml-8">+ 3 more benefits</span>
                  </li>
                </ul>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onPay('premium')}
                  className="group relative w-full py-3 sm:py-4 px-4 sm:px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/30 overflow-hidden text-sm sm:text-base"
                >
                  {/* Animated shine */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ['-200%', '200%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                  />
                  <span className="relative z-10">Get Premium Access</span>
                  <ArrowRight className="relative z-10 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </motion.div>
            </div>

            {/* Trust Badges */}
            <div className="mt-10 text-center">
              <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground mb-4">
                <Shield className="w-4 h-4" />
                <span>Secure payment via Razorpay • Instant access • Money-back guarantee</span>
              </div>

              <div className="text-xs text-muted-foreground/60 mb-6">
                Payment processed securely. Your data is encrypted and never shared with third parties.
              </div>

              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors underline text-sm"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
