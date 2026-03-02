'use client';

import { motion } from 'framer-motion';
import { PersonalRecommendation } from '@/lib/decision-memo/personal-ai-intelligence';
import { ArrowRight, AlertTriangle, TrendingUp, Info } from 'lucide-react';

interface AIRecommendationsProps {
  recommendation: PersonalRecommendation;
  onSectionClick: (sectionId: string) => void;
}

export default function AIRecommendations({
  recommendation,
  onSectionClick
}: AIRecommendationsProps) {
  const getPriorityIcon = () => {
    switch (recommendation.priority) {
      case 'CRITICAL':
        return <AlertTriangle className="w-4 h-4" />;
      case 'HIGH':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getPriorityColor = () => {
    switch (recommendation.priority) {
      case 'CRITICAL':
        return '#EF4444';
      case 'HIGH':
        return '#F59E0B';
      case 'RECOMMENDED':
        return '#D4A843'; // Gold
      default:
        return '#6B7280';
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-1.5 h-8 rounded-full"
            style={{ backgroundColor: getPriorityColor() }}
          />
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Suggested Next
            </div>
            <div className="text-xs font-semibold" style={{ color: getPriorityColor() }}>
              {recommendation.priority}
            </div>
          </div>
        </div>
        <div
          className="p-1.5 rounded-lg"
          style={{ backgroundColor: `${getPriorityColor()}20` }}
        >
          <div style={{ color: getPriorityColor() }}>
            {getPriorityIcon()}
          </div>
        </div>
      </div>

      {/* Message */}
      <div className="p-4 rounded-lg bg-surface-hover border border-border">
        <p className="text-sm text-foreground leading-relaxed">
          {recommendation.aiMessage}
        </p>
      </div>

      {/* Action Button */}
      <button
        onClick={() => onSectionClick(recommendation.sectionId)}
        className="w-full px-4 py-3 rounded-lg border border-gold bg-gold/5 hover:bg-gold/10 transition-colors group"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gold">
            {recommendation.sectionTitle}
          </span>
          <ArrowRight className="w-4 h-4 text-gold group-hover:translate-x-1 transition-transform" />
        </div>
      </button>
    </div>
  );
}
