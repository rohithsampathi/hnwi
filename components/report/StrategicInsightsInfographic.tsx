// components/report/StrategicInsightsInfographic.tsx
// Visual infographic replacing text-heavy analysis sections
// Uses centralized theme colors only

'use client';

import { useState } from 'react';
import { Shield, AlertTriangle, Zap, TrendingUp, Target, BookOpen, Lightbulb } from 'lucide-react';

interface StrategicInsightsInfographicProps {
  outcome: 'SURVIVED' | 'DAMAGED' | 'DESTROYED';
  tier: string;
  briefsCited: string[];
  onCitationClick: (citationId: string) => void;
}

export function StrategicInsightsInfographic({
  outcome,
  tier,
  briefsCited,
  onCitationClick
}: StrategicInsightsInfographicProps) {
  const [showAllSources, setShowAllSources] = useState(false);
  const outcomeConfig = {
    SURVIVED: {
      icon: Shield,
      title: 'Resilient Portfolio',
      description: 'Your strategic positioning shows strong crisis resilience'
    },
    DAMAGED: {
      icon: AlertTriangle,
      title: 'Moderate Vulnerability',
      description: 'Identified areas for strategic improvement'
    },
    DESTROYED: {
      icon: Zap,
      title: 'High Risk Exposure',
      description: 'Critical gaps requiring immediate attention'
    }
  };

  const config = outcomeConfig[outcome];
  const OutcomeIcon = config.icon;

  return (
    <section className="bg-card rounded-lg p-8 mb-8 border border-border">
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="p-4 bg-primary/10 rounded-lg">
          <OutcomeIcon className="w-8 h-8 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {config.title}
          </h2>
          <p className="text-muted-foreground">
            {config.description}
          </p>
        </div>
      </div>

      {/* Key Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Strategic Strength */}
        <InsightCard
          icon={<Target className="w-6 h-6" />}
          title="Strategic Strengths"
          items={[
            `${tier.charAt(0).toUpperCase() + tier.slice(1)} tier positioning`,
            'Diversified opportunity access',
            'Strong peer benchmarking'
          ]}
        />

        {/* Growth Opportunities */}
        <InsightCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Growth Opportunities"
          items={[
            'Geographic expansion potential',
            'Alternative asset allocation',
            'Network leverage improvement'
          ]}
        />

        {/* Risk Management */}
        <InsightCard
          icon={<Shield className="w-6 h-6" />}
          title="Risk Management"
          items={[
            'Portfolio diversification review',
            'Liquidity optimization',
            'Jurisdiction risk assessment'
          ]}
        />

        {/* Action Items */}
        <InsightCard
          icon={<Lightbulb className="w-6 h-6" />}
          title="Next Steps"
          items={[
            'Review high-profile peer opportunities below',
            'Analyze strategic positioning gaps',
            'Access full HNWI World intelligence'
          ]}
        />
      </div>

      {/* Intelligence Sources */}
      {briefsCited && briefsCited.length > 0 && (
        <div className="mt-8 p-6 bg-muted rounded-lg border border-border">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              Intelligence Sources
            </h3>
            <span className="text-sm text-muted-foreground">
              {briefsCited.length} development{briefsCited.length !== 1 ? 's' : ''} analyzed
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(showAllSources ? briefsCited : briefsCited.slice(0, 10)).map((briefId, index) => (
              <button
                key={index}
                onClick={() => onCitationClick(briefId)}
                className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg text-sm font-mono text-primary transition-colors"
              >
                [{index + 1}]
              </button>
            ))}
            {briefsCited.length > 10 && !showAllSources && (
              <button
                onClick={() => setShowAllSources(true)}
                className="px-3 py-1.5 bg-muted hover:bg-muted/80 border border-border rounded-lg text-sm text-foreground transition-colors"
              >
                +{briefsCited.length - 10} more
              </button>
            )}
            {showAllSources && briefsCited.length > 10 && (
              <button
                onClick={() => setShowAllSources(false)}
                className="px-3 py-1.5 bg-muted hover:bg-muted/80 border border-border rounded-lg text-sm text-foreground transition-colors"
              >
                Show less
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

interface InsightCardProps {
  icon: React.ReactNode;
  title: string;
  items: string[];
}

function InsightCard({ icon, title, items }: InsightCardProps) {
  return (
    <div className="bg-muted/50 backdrop-blur-sm rounded-lg p-6 border border-border hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <div className="text-primary">{icon}</div>
        </div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-foreground">
            <span className="text-primary mt-1">•</span>
            <span className="flex-1">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
