// components/assessment/TierProgressIndicator.tsx
// Real-time tier classification confidence meter

"use client";

import { motion } from 'framer-motion';
import { ProgressiveSignal } from '@/lib/hooks/useAssessmentState';

interface TierProgressIndicatorProps {
  progressiveSignals: ProgressiveSignal[];
  currentQuestion: number;
}

const TIER_CONFIG = {
  architect: {
    label: 'ARCHITECT',
    icon: '🏛️',
    color: '#D4AF37',
  },
  operator: {
    label: 'OPERATOR',
    icon: '⚡',
    color: '#4A90E2',
  },
  observer: {
    label: 'OBSERVER',
    icon: '👁️',
    color: '#888888',
  },
};

export const TierProgressIndicator: React.FC<TierProgressIndicatorProps> = ({
  progressiveSignals,
  currentQuestion
}) => {
  if (progressiveSignals.length === 0) return null;

  const latestSignal = progressiveSignals[progressiveSignals.length - 1];

  // Safety check: ensure tier_leaning is valid
  const tierKey = (latestSignal.tier_leaning || 'observer').toLowerCase();
  const config = TIER_CONFIG[tierKey as keyof typeof TIER_CONFIG] || TIER_CONFIG.observer;

  const confidencePercentage = Math.round(latestSignal.confidence * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-4 z-40 mx-4 md:mx-8 mb-6"
    >
      <div className="max-w-5xl mx-auto bg-black/90 backdrop-blur-sm border border-yellow-500/30 rounded-lg p-4 shadow-lg">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Current Classification */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">{config.icon}</span>
            <div>
              <div className="text-xs font-mono text-gray-500">CURRENT CLASSIFICATION</div>
              <div className="font-bold text-white">
                {config.label}
              </div>
            </div>
          </div>

          {/* Confidence Bar */}
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono text-gray-500">CONFIDENCE</span>
              <span className="text-xs font-mono text-white">{confidencePercentage}%</span>
            </div>
            <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ backgroundColor: config.color }}
                initial={{ width: 0 }}
                animate={{ width: `${confidencePercentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Progression Chart (Desktop only) */}
          <div className="hidden md:flex items-center gap-1">
            {progressiveSignals.slice(-10).map((signal, index) => {
              const signalTierKey = (signal.tier_leaning || 'observer').toLowerCase();
              const signalConfig = TIER_CONFIG[signalTierKey as keyof typeof TIER_CONFIG] || TIER_CONFIG.observer;
              return (
                <motion.div
                  key={index}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.3 + (signal.confidence * 0.7) }}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: signalConfig.color }}
                  title={`Q${progressiveSignals.indexOf(signal) + 1}: ${signal.tier_leaning} (${Math.round(signal.confidence * 100)}%)`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
