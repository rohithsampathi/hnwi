// components/assessment/AssessmentResultsHeader.tsx
// Sticky header card showing tier classification and forensic verdict

"use client";

import { motion } from 'framer-motion';
import { Crown, TrendingUp, AlertTriangle, Shield } from 'lucide-react';

interface AssessmentResultsHeaderProps {
  tier: 'architect' | 'operator' | 'observer';
  tierTitle: string;
  forensicVerdict: string;
  comprehensiveScore: number;
}

export function AssessmentResultsHeader({
  tier,
  tierTitle,
  forensicVerdict,
  comprehensiveScore
}: AssessmentResultsHeaderProps) {
  const tierConfig = {
    architect: {
      icon: Crown,
      iconColor: 'text-primary',
      tagline: 'Systems Architect · Top 5% Global HNWI Strategy'
    },
    operator: {
      icon: TrendingUp,
      iconColor: 'text-foreground',
      tagline: 'Tactical Operator · Precision Executor'
    },
    observer: {
      icon: AlertTriangle,
      iconColor: 'text-foreground',
      tagline: 'Passive Observer · Protection Required'
    }
  };

  const config = tierConfig[tier];
  const Icon = config.icon;

  return (
    <div className="sticky top-0 z-30 bg-card border-b border-border shadow-lg">
      <div className="bg-muted/30">
        <div className="max-w-5xl mx-auto px-8 py-6">
          <div className="flex items-start justify-between gap-6">
            {/* Left: Tier Classification */}
            <div className="flex items-start gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6, delay: 0.2 }}
                className="p-3 bg-card border border-border rounded-lg shadow-sm"
              >
                <Icon className={`w-10 h-10 ${config.iconColor}`} strokeWidth={1.5} />
              </motion.div>

              <div>
                <motion.h1
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-3xl font-bold mb-1"
                >
                  {tierTitle}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-sm text-muted-foreground"
                >
                  {config.tagline}
                </motion.p>
              </div>
            </div>

            {/* Right: Score */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-right"
            >
              <div className="flex items-center gap-2 justify-end mb-1">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">Comprehensive Score</span>
              </div>
              <div className="text-4xl font-bold">
                {comprehensiveScore.toFixed(1)}
                <span className="text-lg text-muted-foreground">/10</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
