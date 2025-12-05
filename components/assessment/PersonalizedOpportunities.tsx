// components/assessment/PersonalizedOpportunities.tsx
// Display personalized opportunities with Victor AI scoring

"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, DollarSign, TrendingUp, Target, Sparkles } from 'lucide-react';

interface PersonalizedOpportunitiesProps {
  userId: string;
  limit?: number;
}

interface VictorAI {
  base_score: number;
  personalized_score: number;
  compatibility: 'JUICY' | 'MODERATE' | 'FAR_FETCHED';
  reasons: string[];
  personalized: boolean;
  user_tier: string;
}

interface Opportunity {
  _id: string;
  title: string;
  tier: string;
  location: string;
  value: string;
  category: string;
  risk?: string;
  victor_ai: VictorAI;
}

export function PersonalizedOpportunities({ userId, limit = 50 }: PersonalizedOpportunitiesProps) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [scoreDistribution, setScoreDistribution] = useState<any>(null);
  const [userTier, setUserTier] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'JUICY' | 'MODERATE' | 'FAR_FETCHED' | null>(null);

  useEffect(() => {
    async function fetchPersonalizedOpportunities() {
      try {
        const response = await fetch(`/api/assessment/opportunities/${userId}?limit=${limit}`);

        if (!response.ok) {
          setError('Failed to load personalized opportunities');
          setLoading(false);
          return;
        }

        const data = await response.json();

        setOpportunities(data.opportunities || []);
        setScoreDistribution(data.score_distribution);
        setUserTier(data.user_tier);
      } catch (err) {
        setError('Failed to load opportunities');
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchPersonalizedOpportunities();
    }
  }, [userId, limit]);

  const filteredOpportunities = filter === null
    ? []
    : opportunities.filter(opp => opp.victor_ai.compatibility === filter);

  const getCompatibilityColor = (compatibility: string) => {
    switch (compatibility) {
      case 'JUICY':
        return {
          bg: 'bg-green-500/10',
          border: 'border-green-500/30',
          text: 'text-green-400',
          icon: '🟢'
        };
      case 'MODERATE':
        return {
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/30',
          text: 'text-yellow-400',
          icon: '🟡'
        };
      case 'FAR_FETCHED':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          text: 'text-red-400',
          icon: '🔴'
        };
      default:
        return {
          bg: 'bg-gray-500/10',
          border: 'border-gray-500/30',
          text: 'text-gray-400',
          icon: '⚪'
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !opportunities.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">{error || 'No personalized opportunities available yet'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Score Distribution */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white dark:text-foreground">Your Personalized Opportunities</h2>
            <p className="text-sm text-white dark:text-muted-foreground mt-1">
              Calibrated for {userTier.toUpperCase()} tier • {opportunities.length} opportunities
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-white dark:text-muted-foreground">Victor AI Powered</span>
          </div>
        </div>

        {/* Score Distribution Summary */}
        {scoreDistribution && (
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setFilter(filter === 'JUICY' ? null : 'JUICY')}
              className={`p-4 rounded-lg border transition-all ${
                filter === 'JUICY'
                  ? 'bg-green-500/20 border-green-500/50'
                  : 'bg-green-500/10 border-green-500/30 hover:bg-green-500/15'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{scoreDistribution.juicy || 0}</div>
                <div className="text-xs text-white dark:text-muted-foreground mt-1">JUICY</div>
              </div>
            </button>

            <button
              onClick={() => setFilter(filter === 'MODERATE' ? null : 'MODERATE')}
              className={`p-4 rounded-lg border transition-all ${
                filter === 'MODERATE'
                  ? 'bg-yellow-500/20 border-yellow-500/50'
                  : 'bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/15'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{scoreDistribution.moderate || 0}</div>
                <div className="text-xs text-white dark:text-muted-foreground mt-1">MODERATE</div>
              </div>
            </button>

            <button
              onClick={() => setFilter(filter === 'FAR_FETCHED' ? null : 'FAR_FETCHED')}
              className={`p-4 rounded-lg border transition-all ${
                filter === 'FAR_FETCHED'
                  ? 'bg-red-500/20 border-red-500/50'
                  : 'bg-red-500/10 border-red-500/30 hover:bg-red-500/15'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{scoreDistribution.far_fetched || 0}</div>
                <div className="text-xs text-white dark:text-muted-foreground mt-1">FAR_FETCHED</div>
              </div>
            </button>
          </div>
        )}

        {filter !== null && (
          <div className="mt-4 text-sm text-muted-foreground text-center">
            Showing {filteredOpportunities.length} {filter} opportunities •{' '}
            <button onClick={() => setFilter(null)} className="text-primary hover:underline">
              Clear filter
            </button>
          </div>
        )}
      </div>

      {/* Opportunity List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredOpportunities.map((opp, index) => {
            const colors = getCompatibilityColor(opp.victor_ai.compatibility);

            return (
              <motion.div
                key={opp._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`bg-card border ${colors.border} rounded-xl p-6 hover:shadow-lg transition-shadow`}
              >
                {/* Compatibility Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`px-3 py-1 rounded-full ${colors.bg} border ${colors.border} flex items-center gap-2`}>
                    <span className="text-sm">{colors.icon}</span>
                    <span className={`text-sm font-bold ${colors.text}`}>
                      {opp.victor_ai.compatibility}
                    </span>
                    <span className="text-xs text-white dark:text-muted-foreground">
                      {(opp.victor_ai.personalized_score * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-white dark:text-muted-foreground">Victor AI Score</div>
                    <div className="text-sm font-medium text-white dark:text-foreground">
                      {(opp.victor_ai.personalized_score * 100).toFixed(0)}% match
                    </div>
                  </div>
                </div>

                {/* Opportunity Details */}
                <h3 className="text-xl font-bold text-white dark:text-foreground mb-2">{opp.title}</h3>

                <div className="flex flex-wrap gap-4 mb-4 text-sm text-white dark:text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-white dark:text-inherit">{opp.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    <span className="text-white dark:text-inherit">{opp.tier}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-white dark:text-inherit">{opp.value}</span>
                  </div>
                  {opp.risk && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      <span className="capitalize text-white dark:text-inherit">{opp.risk} risk</span>
                    </div>
                  )}
                </div>

                {/* Personalization Reasons */}
                <div className="space-y-2 mb-4">
                  <div className="text-xs font-medium text-white dark:text-muted-foreground">Why this matches you:</div>
                  {opp.victor_ai.reasons.map((reason, i) => (
                    <div key={i} className="text-sm text-white dark:text-foreground flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>

                {/* Score Comparison */}
                <div className="space-y-2 pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white dark:text-muted-foreground">Base Victor Score</span>
                    <span className="font-medium text-white dark:text-foreground">
                      {(opp.victor_ai.base_score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-500 rounded-full"
                      style={{ width: `${opp.victor_ai.base_score * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs mt-2">
                    <span className="text-white dark:text-muted-foreground">Your Personalized Score</span>
                    <span className={`font-bold ${colors.text}`}>
                      {(opp.victor_ai.personalized_score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        opp.victor_ai.compatibility === 'JUICY'
                          ? 'bg-green-500'
                          : opp.victor_ai.compatibility === 'MODERATE'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${opp.victor_ai.personalized_score * 100}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredOpportunities.length === 0 && filter === null && (
        <div className="text-center py-12">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Select a compatibility level above to view opportunities</p>
        </div>
      )}

      {filteredOpportunities.length === 0 && filter !== null && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No {filter} opportunities found</p>
          <button onClick={() => setFilter(null)} className="mt-4 text-primary hover:underline">
            Clear filter
          </button>
        </div>
      )}
    </div>
  );
}
