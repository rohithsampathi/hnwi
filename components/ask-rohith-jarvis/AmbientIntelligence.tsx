// components/ask-rohith-jarvis/AmbientIntelligence.tsx
// Ambient Intelligence Bar - Always-on portfolio monitoring

'use client';

import { motion } from 'framer-motion';
import { Activity, AlertTriangle } from 'lucide-react';
import type { UserPortfolioContext, Conversation } from '@/types/rohith';
import type { RohithRecommendation } from '@/lib/rohith-ai-intelligence';

interface AmbientIntelligenceProps {
  userContext: UserPortfolioContext | null;
  conversations: Conversation[];
  activeConversationId: string | null;
  recommendation: RohithRecommendation;
}

/**
 * AMBIENT INTELLIGENCE BAR
 *
 * The always-on monitoring layer that shows:
 * - Portfolio health and value
 * - Active risk alerts
 * - AI status indicator
 * - Live market ticker (placeholder for now)
 *
 * This is NOT just a header. This is your "consciousness" of wealth.
 */
export default function AmbientIntelligence({
  userContext,
  conversations,
  activeConversationId,
  recommendation
}: AmbientIntelligenceProps) {
  // Calculate portfolio metrics from user context
  const portfolioValue = Number(userContext?.portfolio?.totalValue ?? 0);
  const normalizedPortfolioValue = Number.isFinite(portfolioValue) ? portfolioValue : 0;
  const formattedValue = portfolioValue > 0
    ? `$${(normalizedPortfolioValue / 1_000_000).toFixed(1)}M`
    : 'Loading...';

  // Determine risk level based on recommendation priority
  const riskLevel = recommendation.priority === 'CRITICAL' || recommendation.priority === 'HIGH'
    ? 'HIGH'
    : recommendation.priority === 'RECOMMENDED'
    ? 'MEDIUM'
    : 'LOW';

  const riskColor = {
    HIGH: '#EF4444',
    MEDIUM: '#F59E0B',
    LOW: '#22C55E'
  }[riskLevel];

  // Count active alerts (based on recommendation urgency)
  const alertCount = recommendation.urgency >= 7 ? 1 : 0;

  // AI status (always online in JARVIS mode)
  const aiStatus = 'ONLINE';

  return (
    <div className="border-b border-border/50 bg-background">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Portfolio Overview */}
          <div className="flex items-center gap-6">
            {/* Portfolio Value */}
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-gold" />
              <div>
                <div className="text-xs text-muted-foreground">Portfolio</div>
                <div className="text-sm font-semibold text-foreground">{formattedValue}</div>
              </div>
            </div>

            {/* Risk Level */}
            {riskLevel !== 'LOW' && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" style={{ color: riskColor }} />
                <div>
                  <div className="text-xs text-muted-foreground">Risk</div>
                  <div className="text-sm font-medium" style={{ color: riskColor }}>
                    {riskLevel}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Status */}
          <div className="flex items-center gap-4">
            <div className="text-xs text-muted-foreground">
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
