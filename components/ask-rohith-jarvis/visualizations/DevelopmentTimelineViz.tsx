// components/ask-rohith-jarvis/visualizations/DevelopmentTimelineViz.tsx
// Timeline of HNWI World developments

'use client';

import { motion } from 'framer-motion';
import { X, Maximize2, Calendar } from 'lucide-react';
import { CornerBrackets } from '@/components/decision-memo/personal/HolographicEffects';

interface DevelopmentTimelineVizProps {
  data: {
    events: Array<{
      dev_id: string;
      title: string;
      jurisdiction: string;
      published_at: string;
      impact: string;
    }>;
    count: number;
  };
  onClose?: () => void;
  onExpand?: () => void;
  interactive?: boolean;
}

const IMPACT_COLORS = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#22C55E'
};

export default function DevelopmentTimelineViz({
  data,
  onClose,
  onExpand,
  interactive = true
}: DevelopmentTimelineVizProps) {
  return (
    <div className="relative bg-surface/95 backdrop-blur-sm border border-border rounded-lg overflow-hidden">
      <CornerBrackets size={12} thickness={2} color="#D4A843" />

      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gold" />
          <h3 className="text-sm font-semibold text-foreground">
            Recent Developments ({data.count})
          </h3>
        </div>
        {interactive && (
          <div className="flex items-center gap-2">
            {onExpand && (
              <button onClick={onExpand} className="p-1 hover:bg-surface-hover rounded">
                <Maximize2 className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
            {onClose && (
              <button onClick={onClose} className="p-1 hover:bg-surface-hover rounded">
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
        {data.events.map((event, index) => (
          <motion.div
            key={event.dev_id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-3 group cursor-pointer hover:bg-surface-hover p-2 rounded transition-colors"
          >
            {/* Timeline dot */}
            <div className="flex-shrink-0 mt-1">
              <div
                className="w-3 h-3 rounded-full border-2"
                style={{
                  borderColor: IMPACT_COLORS[event.impact as keyof typeof IMPACT_COLORS] || IMPACT_COLORS.medium,
                  backgroundColor: `${IMPACT_COLORS[event.impact as keyof typeof IMPACT_COLORS] || IMPACT_COLORS.medium}20`
                }}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-gold transition-colors">
                {event.title}
              </h4>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-muted-foreground">{event.jurisdiction}</span>
                <span className="text-xs text-muted-foreground">
                  {event.published_at ? new Date(event.published_at).toLocaleDateString() : 'Recent'}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
