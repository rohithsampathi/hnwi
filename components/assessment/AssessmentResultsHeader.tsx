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
      tagline: 'Systems Builder · Strategic intelligence for long-term wealth architecture'
    },
    operator: {
      icon: TrendingUp,
      iconColor: 'text-foreground',
      tagline: 'Tactical Executor · Intelligence optimized for rapid deployment'
    },
    observer: {
      icon: AlertTriangle,
      iconColor: 'text-foreground',
      tagline: 'Defensive Posture · Intelligence focused on wealth preservation'
    }
  };

  const config = tierConfig[tier];
  const Icon = config.icon;

  return (
    <div className="sticky top-0 z-30 bg-card border-b border-border shadow-lg">
      <div className="bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-4 md:py-6">
          {/* Mobile: Stack vertically, Desktop: Side by side */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6">
            {/* Left: Tier Classification */}
            <div className="flex items-start gap-3 md:gap-4 flex-1 min-w-0">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6, delay: 0.2 }}
                className="p-2 md:p-3 bg-card border border-border rounded-lg shadow-sm flex-shrink-0"
              >
                <Icon className={`w-8 h-8 md:w-10 md:h-10 ${config.iconColor}`} strokeWidth={1.5} />
              </motion.div>

              <div className="flex-1 min-w-0">
                <motion.h1
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-xl md:text-3xl font-bold mb-1 leading-tight"
                >
                  {tierTitle}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-xs md:text-sm text-muted-foreground"
                >
                  {config.tagline}
                </motion.p>
              </div>
            </div>

            {/* Right: Score - Mobile: Right aligned in same row on desktop, Below on mobile */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center md:items-end gap-4 md:flex-col md:text-right flex-shrink-0"
            >
              <div className="flex items-center gap-2 md:justify-end">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Comprehensive Score</span>
              </div>
              <div className="text-3xl md:text-4xl font-bold leading-none">
                {comprehensiveScore.toFixed(1)}
                <span className="text-base md:text-lg text-muted-foreground">/10</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
