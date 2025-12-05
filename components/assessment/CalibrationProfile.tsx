// components/assessment/CalibrationProfile.tsx
// Display user's extracted DNA profile and opportunity scores (CGPA-style)

"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Globe, Clock, DollarSign, Target } from 'lucide-react';

interface CalibrationProfileProps {
  userId: string;
  sessionId?: string;
}

interface CalibrationData {
  aggregated_profile: {
    tier: string;
    tier_confidence: number;
    base_sophistication: number;
    time_horizon_years: number;
    geographic_appetite: string;
    minimum_deal_size: number;
    liquidity_preference: string;
    leverage_comfort: string;
    structural_thinking?: boolean;
    ownership_mindset?: boolean;
    patient_capital?: boolean;
  };
  opportunity_scores: {
    juicy: number;
    moderate: number;
    far_fetched: number;
  };
  answer_signals: Array<{
    question_number: number;
    dna_signal: string;
    dominant_tier: string;
  }>;
}

export function CalibrationProfile({ userId, sessionId }: CalibrationProfileProps) {
  const [calibration, setCalibration] = useState<CalibrationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCalibration() {
      try {
        const response = await fetch(`/api/assessment/calibration/${userId}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('No calibration data yet. Complete the assessment first.');
          } else {
            setError('Failed to load calibration profile.');
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setCalibration(data.calibration);
      } catch (err) {
        setError('Failed to load calibration profile.');
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchCalibration();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !calibration) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">{error || 'No calibration data available'}</p>
      </div>
    );
  }

  const profile = calibration.aggregated_profile;
  const scores = calibration.opportunity_scores;
  const totalAccessible = scores.juicy + scores.moderate + scores.far_fetched;

  return (
    <div className="space-y-6">
      {/* Tier Classification */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Your Classification</div>
            <div className="text-4xl font-bold text-primary">{profile.tier?.toUpperCase() || 'PENDING'}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground mb-1">Confidence</div>
            <div className="text-2xl font-bold text-foreground">
              {((profile.tier_confidence || 0) * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </motion.div>

      {/* DNA Profile Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-xl p-6"
      >
        <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          Your Wealth DNA Profile
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Sophistication */}
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Sophistication</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {((profile.base_sophistication || 0) * 100).toFixed(0)}%
            </div>
          </div>

          {/* Time Horizon */}
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Time Horizon</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {profile.time_horizon_years || 'N/A'} <span className="text-sm">years</span>
            </div>
          </div>

          {/* Geographic Appetite */}
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Geographic Appetite</span>
            </div>
            <div className="text-2xl font-bold text-foreground capitalize">
              {profile.geographic_appetite || 'N/A'}
            </div>
          </div>

          {/* Minimum Deal Size */}
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Min Deal Size</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              ${((profile.minimum_deal_size || 0) / 1000).toFixed(0)}K
            </div>
          </div>

          {/* Liquidity Preference */}
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Liquidity Preference</span>
            </div>
            <div className="text-2xl font-bold text-foreground capitalize">
              {profile.liquidity_preference || 'Moderate'}
            </div>
          </div>

          {/* Leverage Comfort */}
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Leverage Comfort</span>
            </div>
            <div className="text-2xl font-bold text-foreground capitalize">
              {profile.leverage_comfort || 'Moderate'}
            </div>
          </div>
        </div>

        {/* Mindset Indicators */}
        {(profile.structural_thinking || profile.ownership_mindset || profile.patient_capital) && (
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Strategic Mindset</h4>
            <div className="flex flex-wrap gap-2">
              {profile.structural_thinking && (
                <div className="px-3 py-1 bg-primary/10 border border-primary/30 rounded-full text-sm text-primary">
                  ✓ Structural Thinking
                </div>
              )}
              {profile.ownership_mindset && (
                <div className="px-3 py-1 bg-primary/10 border border-primary/30 rounded-full text-sm text-primary">
                  ✓ Ownership Mindset
                </div>
              )}
              {profile.patient_capital && (
                <div className="px-3 py-1 bg-primary/10 border border-primary/30 rounded-full text-sm text-primary">
                  ✓ Patient Capital
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Opportunity Alignment (CGPA-Style) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-xl p-6"
      >
        <h3 className="text-xl font-bold text-foreground mb-2">Your Opportunity Alignment</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Of the {totalAccessible} opportunities you can access, here's your compatibility breakdown:
        </p>

        <div className="space-y-4">
          {/* JUICY */}
          <div className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
            <div className="flex-shrink-0 w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
              <span className="text-2xl">🟢</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-lg font-bold text-green-400">JUICY</h4>
                <span className="text-xs px-2 py-0.5 bg-green-500/20 border border-green-500/40 rounded-full text-green-300">
                  ≥75% alignment
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Top priorities - highest compatibility</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-400">{scores.juicy}</div>
              <div className="text-xs text-muted-foreground">
                {totalAccessible > 0 ? ((scores.juicy / totalAccessible) * 100).toFixed(0) : 0}%
              </div>
            </div>
          </div>

          {/* MODERATE */}
          <div className="flex items-center gap-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <div className="flex-shrink-0 w-16 h-16 rounded-full bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center">
              <span className="text-2xl">🟡</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-lg font-bold text-yellow-400">MODERATE</h4>
                <span className="text-xs px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/40 rounded-full text-yellow-300">
                  45-75% alignment
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Worth considering - good fit</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-yellow-400">{scores.moderate}</div>
              <div className="text-xs text-muted-foreground">
                {totalAccessible > 0 ? ((scores.moderate / totalAccessible) * 100).toFixed(0) : 0}%
              </div>
            </div>
          </div>

          {/* FAR_FETCHED */}
          <div className="flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <div className="flex-shrink-0 w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
              <span className="text-2xl">🔴</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-lg font-bold text-red-400">FAR_FETCHED</h4>
                <span className="text-xs px-2 py-0.5 bg-red-500/20 border border-red-500/40 rounded-full text-red-300">
                  &lt;45% alignment
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Lower priority - less aligned</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-red-400">{scores.far_fetched}</div>
              <div className="text-xs text-muted-foreground">
                {totalAccessible > 0 ? ((scores.far_fetched / totalAccessible) * 100).toFixed(0) : 0}%
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* DNA Signals Timeline (Optional) */}
      {calibration.answer_signals && calibration.answer_signals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h3 className="text-xl font-bold text-foreground mb-4">DNA Signal Evolution</h3>
          <div className="space-y-3">
            {calibration.answer_signals.slice(0, 5).map((signal, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">
                  Q{signal.question_number}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">{signal.dna_signal}</div>
                  <div className="text-xs text-muted-foreground">Signal: {signal.dominant_tier}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
