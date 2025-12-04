// components/assessment/GamifiedUpgrade.tsx
// <98% confidence - Gamified conversion flow

"use client";

import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, Target, Zap, Crown } from 'lucide-react';
import { useState } from 'react';

interface GamifiedUpgradeProps {
  tier: 'ARCHITECT' | 'OPERATOR' | 'OBSERVER';
  confidence: number;
  onUpgrade: (selectedTier: 'architect' | 'operator' | 'observer') => void;
  onDownloadOnly: () => void;
  loading?: boolean;
}

const TIER_CONFIG = {
  ARCHITECT: {
    emoji: '🏛️',
    color: 'yellow-500',
    monthlyPrice: 1499,
    yearlyPrice: 14990,
  },
  OPERATOR: {
    emoji: '⚡',
    color: 'blue-500',
    monthlyPrice: 599,
    yearlyPrice: 5990,
  },
  OBSERVER: {
    emoji: '👁️',
    color: 'purple-500',
    monthlyPrice: 199,
    yearlyPrice: 1990,
  },
};

export const GamifiedUpgrade: React.FC<GamifiedUpgradeProps> = ({
  tier,
  confidence,
  onUpgrade,
  onDownloadOnly,
  loading
}) => {
  const [selectedTier, setSelectedTier] = useState<'architect' | 'operator' | 'observer'>(
    tier.toLowerCase() as 'architect' | 'operator' | 'observer'
  );
  const config = TIER_CONFIG[tier];
  const confidenceGap = 98 - Math.round(confidence * 100);

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-block px-4 py-1 bg-yellow-500/20 border border-yellow-500/40 rounded-full text-sm font-mono text-yellow-500 mb-6">
            STRONG STRATEGIC THINKING
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            You're <span className={`text-${config.color}`}>{tier}</span>-Leaning
          </h1>

          <p className="text-xl text-gray-400 mb-6">
            Confidence Score: <span className={`text-${config.color} font-bold`}>{Math.round(confidence * 100)}%</span>
          </p>

          <p className="text-gray-500 max-w-2xl mx-auto">
            You demonstrated solid strategic thinking. You're just {confidenceGap} percentage points away from qualifying for complimentary access.
          </p>
        </motion.div>

        {/* Gap Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6 mb-12"
        >
          {/* What you got */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="text-green-500" size={20} />
              </div>
              <h3 className="text-xl font-bold text-white">What You Demonstrated</h3>
            </div>

            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5" />
                <span>Strategic pattern recognition in {Math.round(confidence * 40)} of 40 scenarios</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5" />
                <span>Clear {tier.toLowerCase()} tendencies with tactical thinking</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5" />
                <span>Solid understanding of wealth structures</span>
              </li>
            </ul>
          </div>

          {/* What's missing */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Target className="text-yellow-500" size={20} />
              </div>
              <h3 className="text-xl font-bold text-white">Intelligence Gap</h3>
            </div>

            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5" />
                <span>Missed pattern recognition in {40 - Math.round(confidence * 40)} scenarios</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5" />
                <span>Limited exposure to 1,562 HNWI World intelligence briefs</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5" />
                <span>Missing real-time market intelligence and opportunity matching</span>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Value Proposition */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-yellow-500/20 via-yellow-500/10 to-transparent border border-yellow-500/30 rounded-xl p-8 mb-12"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="text-yellow-500" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Here's What Full Access Gets You
              </h3>
              <p className="text-gray-400">
                The intelligence that creates the {confidenceGap}% gap
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-black/40 rounded-lg p-4">
              <div className="text-yellow-500 font-bold mb-2">1,562+ Intelligence Briefs</div>
              <div className="text-sm text-gray-400">
                Since February 2023. Pattern recognition that's impossible without historical context.
              </div>
              <div className="text-xs text-yellow-500/60 mt-2">Worth: $833/brief</div>
            </div>

            <div className="bg-black/40 rounded-lg p-4">
              <div className="text-yellow-500 font-bold mb-2">Real-Time HNWI World</div>
              <div className="text-sm text-gray-400">
                140,000+ tracked wealth movements. See patterns 3-7 days before markets.
              </div>
              <div className="text-xs text-yellow-500/60 mt-2">Worth: $500K+/year</div>
            </div>

            <div className="bg-black/40 rounded-lg p-4">
              <div className="text-yellow-500 font-bold mb-2">Ask Rohith Intelligence</div>
              <div className="text-sm text-gray-400">
                24/7 AI ally trained on 50+ years of HNWI patterns. On-demand analysis.
              </div>
              <div className="text-xs text-yellow-500/60 mt-2">Worth: $200K+/year</div>
            </div>
          </div>
        </motion.div>

        {/* Tier Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <h3 className="text-2xl font-bold text-center mb-6">
            Choose Your Intelligence Level
          </h3>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Observer */}
            <button
              onClick={() => setSelectedTier('observer')}
              className={`
                relative p-6 rounded-xl border-2 transition-all duration-300 text-left
                ${selectedTier === 'observer'
                  ? 'bg-purple-500/20 border-purple-500'
                  : 'bg-black/40 border-gray-700 hover:border-purple-500/50'
                }
              `}
            >
              {selectedTier === 'observer' && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
              <div className="text-3xl mb-3">👁️</div>
              <div className="text-xl font-bold text-white mb-2">OBSERVER</div>
              <div className="text-2xl font-bold text-purple-500 mb-3">$199<span className="text-sm text-gray-400">/mo</span></div>
              <ul className="space-y-2 text-xs text-gray-400">
                <li>• HNWI World tracking</li>
                <li>• Daily intelligence briefs</li>
                <li>• 30-day archive</li>
              </ul>
            </button>

            {/* Operator */}
            <button
              onClick={() => setSelectedTier('operator')}
              className={`
                relative p-6 rounded-xl border-2 transition-all duration-300 text-left
                ${selectedTier === 'operator'
                  ? 'bg-blue-500/20 border-blue-500'
                  : 'bg-black/40 border-gray-700 hover:border-blue-500/50'
                }
              `}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 text-black text-xs font-bold rounded-full">
                RECOMMENDED
              </div>
              {selectedTier === 'operator' && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
              <div className="text-3xl mb-3">⚡</div>
              <div className="text-xl font-bold text-white mb-2">OPERATOR</div>
              <div className="text-2xl font-bold text-blue-500 mb-3">$599<span className="text-sm text-gray-400">/mo</span></div>
              <ul className="space-y-2 text-xs text-gray-400">
                <li>• Everything in Observer</li>
                <li>• Privé Exchange access</li>
                <li>• Crown Vault (10 assets)</li>
                <li>• Ask Rohith unlimited</li>
              </ul>
            </button>

            {/* Architect */}
            <button
              onClick={() => setSelectedTier('architect')}
              className={`
                relative p-6 rounded-xl border-2 transition-all duration-300 text-left
                ${selectedTier === 'architect'
                  ? 'bg-yellow-500/20 border-yellow-500'
                  : 'bg-black/40 border-gray-700 hover:border-yellow-500/50'
                }
              `}
            >
              {selectedTier === 'architect' && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center">
                  <div className="w-2 h-2 bg-black rounded-full" />
                </div>
              )}
              <div className="text-3xl mb-3">🏛️</div>
              <div className="text-xl font-bold text-white mb-2">ARCHITECT</div>
              <div className="text-2xl font-bold text-yellow-500 mb-3">$1,499<span className="text-sm text-gray-400">/mo</span></div>
              <ul className="space-y-2 text-xs text-gray-400">
                <li>• Everything in Operator</li>
                <li>• Unlimited Crown Vault</li>
                <li>• Social Hub elite networking</li>
                <li>• Full historical archive</li>
                <li>• Direct analyst access</li>
              </ul>
            </button>
          </div>

          {/* CTA */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => onUpgrade(selectedTier)}
              disabled={loading}
              className={`
                px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300
                ${loading
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-yellow-500 hover:bg-yellow-600 text-black hover:scale-105'
                }
              `}
            >
              {loading ? 'Processing...' : `Unlock ${selectedTier.toUpperCase()} Access →`}
            </button>

            <button
              onClick={onDownloadOnly}
              className="px-8 py-4 rounded-xl font-bold text-lg border-2 border-gray-700 hover:border-gray-600 text-gray-400 hover:text-gray-300 transition-all"
            >
              Just Download PDF
            </button>
          </div>

          <p className="text-center text-xs text-gray-600 mt-4">
            30-day money-back guarantee • Cancel anytime
          </p>
        </motion.div>
      </div>
    </div>
  );
};
