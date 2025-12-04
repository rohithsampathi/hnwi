// components/assessment/HighConfidenceUnlock.tsx
// ≥98% confidence - FREE tier unlock screen

"use client";

import { motion } from 'framer-motion';
import { Award, Sparkles, Crown, CheckCircle } from 'lucide-react';

interface HighConfidenceUnlockProps {
  tier: 'ARCHITECT' | 'OPERATOR' | 'OBSERVER';
  confidence: number;
  onCreateAccount: () => void;
  loading?: boolean;
}

const TIER_CONFIG = {
  ARCHITECT: {
    icon: Crown,
    emoji: '🏛️',
    color: 'yellow-500',
    bgGradient: 'from-yellow-500/20 via-yellow-500/10 to-transparent',
    title: 'ARCHITECT',
    subtitle: 'Systems Thinker | Structural Arbitrageur',
    description: 'You demonstrated exceptional strategic clarity. Your systematic thinking and pattern recognition place you in the top 8% of assessed HNWIs.',
  },
  OPERATOR: {
    icon: Award,
    emoji: '⚡',
    color: 'blue-500',
    bgGradient: 'from-blue-500/20 via-blue-500/10 to-transparent',
    title: 'OPERATOR',
    subtitle: 'Tactical Executor | Opportunity Maximizer',
    description: 'Your tactical precision and execution mindset demonstrate elite-level strategic thinking. Top 15% of assessed HNWIs.',
  },
  OBSERVER: {
    icon: Sparkles,
    emoji: '👁️',
    color: 'purple-500',
    bgGradient: 'from-purple-500/20 via-purple-500/10 to-transparent',
    title: 'OBSERVER',
    subtitle: 'Delegated Monitor | Strategic Overseer',
    description: 'Your monitoring approach shows sophisticated delegation capabilities. Top 25% of assessed HNWIs.',
  },
};

export const HighConfidenceUnlock: React.FC<HighConfidenceUnlockProps> = ({
  tier,
  confidence,
  onCreateAccount,
  loading
}) => {
  const config = TIER_CONFIG[tier];
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full"
      >
        {/* Celebration particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-2 h-2 bg-${config.color} rounded-full`}
              initial={{
                x: '50%',
                y: '50%',
                opacity: 1,
              }}
              animate={{
                x: `${Math.random() * 100}%`,
                y: `${Math.random() * 100}%`,
                opacity: 0,
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 0.5,
                ease: "easeOut",
              }}
            />
          ))}
        </div>

        {/* Main card */}
        <div className={`relative bg-gradient-to-br ${config.bgGradient} border border-${config.color}/30 rounded-2xl overflow-hidden`}>
          {/* Header glow */}
          <div className={`absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-${config.color} to-transparent`} />

          <div className="p-8 md:p-12">
            {/* Badge */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.3, duration: 0.8 }}
              className="flex justify-center mb-8"
            >
              <div className={`relative inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-${config.color} to-${config.color}/50`}>
                <span className="text-6xl">{config.emoji}</span>
                <motion.div
                  className={`absolute inset-0 rounded-full border-4 border-${config.color}`}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center mb-8"
            >
              <div className="inline-block px-4 py-1 bg-green-500/20 border border-green-500/40 rounded-full text-sm font-mono text-green-500 mb-4">
                EXCEPTIONAL STRATEGIC CLARITY
              </div>

              <h1 className={`text-4xl md:text-5xl font-bold text-${config.color} mb-3`}>
                {config.title}
              </h1>

              <p className="text-xl text-gray-400 mb-6">
                {config.subtitle}
              </p>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <span>Confidence Score:</span>
                <span className={`text-2xl font-bold text-${config.color}`}>
                  {Math.round(confidence * 100)}%
                </span>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mb-8"
            >
              <p className="text-lg text-gray-300 text-center leading-relaxed max-w-2xl mx-auto">
                {config.description}
              </p>
            </motion.div>

            {/* Unlock message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className={`bg-${config.color}/10 border border-${config.color}/30 rounded-xl p-6 mb-8`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-${config.color}/20 flex items-center justify-center`}>
                  <CheckCircle className={`text-${config.color}`} size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">
                    You've Earned Complete Access
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Your strategic clarity score of <span className={`text-${config.color} font-bold`}>{Math.round(confidence * 100)}%</span> qualifies you for complimentary {tier} tier access to the complete HNWI Chronicles intelligence ecosystem.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <div className={`w-1.5 h-1.5 rounded-full bg-${config.color}`} />
                      1,562+ intelligence briefs
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <div className={`w-1.5 h-1.5 rounded-full bg-${config.color}`} />
                      Real-time HNWI World tracking
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <div className={`w-1.5 h-1.5 rounded-full bg-${config.color}`} />
                      Privé Exchange opportunities
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <div className={`w-1.5 h-1.5 rounded-full bg-${config.color}`} />
                      Crown Vault succession planning
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <div className={`w-1.5 h-1.5 rounded-full bg-${config.color}`} />
                      Ask Rohith 24/7 intelligence
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <div className={`w-1.5 h-1.5 rounded-full bg-${config.color}`} />
                      Complete strategic PDF report
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Why free */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="mb-8 text-center"
            >
              <p className="text-sm text-gray-500 mb-2">
                <span className="font-bold text-gray-400">Why complimentary?</span>
              </p>
              <p className="text-xs text-gray-600 max-w-xl mx-auto">
                High-confidence strategic thinkers strengthen our intelligence network. Your pattern recognition and decision quality contribute to the collective intelligence that makes HNWI Chronicles valuable for all members. This is network effects in action.
              </p>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className="text-center"
            >
              <button
                onClick={onCreateAccount}
                disabled={loading}
                className={`
                  px-12 py-4 rounded-xl font-bold text-lg transition-all duration-300
                  ${loading
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : `bg-${config.color} hover:bg-${config.color}/90 text-black hover:scale-105`
                  }
                `}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  <>
                    Create {tier} Account →
                  </>
                )}
              </button>

              <p className="text-xs text-gray-600 mt-4">
                No credit card required • Instant access • Cancel anytime
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
