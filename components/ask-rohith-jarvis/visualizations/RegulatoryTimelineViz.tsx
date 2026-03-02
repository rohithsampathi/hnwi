// components/ask-rohith-jarvis/visualizations/RegulatoryTimelineViz.tsx
// Regulatory timeline with urgency-colored nodes

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface TimelineEvent {
  date: string;
  title: string;
  description?: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  jurisdiction?: string;
}

interface RegulatoryTimelineVizProps {
  data: {
    events?: TimelineEvent[];
    title?: string;
  };
  onClose?: () => void;
  onExpand?: () => void;
  interactive?: boolean;
}

const URGENCY_COLORS: Record<string, string> = {
  critical: '#EF4444',
  high: '#F59E0B',
  medium: '#D4A843',
  low: '#22C55E',
};

export default function RegulatoryTimelineViz({
  data,
  onClose,
  onExpand,
  interactive = true
}: RegulatoryTimelineVizProps) {
  const events = data?.events || [];
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className="relative bg-surface/95 backdrop-blur-sm border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gold" />
          <h3 className="text-sm font-semibold text-foreground">{data?.title || 'Regulatory Timeline'}</h3>
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

      <div className="p-4 max-h-72 overflow-y-auto">
        {events.length > 0 ? (
          <div className="relative pl-6">
            {/* Vertical line */}
            <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />

            {events.map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="relative mb-4 last:mb-0"
              >
                {/* Node dot */}
                <div
                  className="absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2"
                  style={{
                    borderColor: URGENCY_COLORS[event.urgency] || URGENCY_COLORS.medium,
                    backgroundColor: `${URGENCY_COLORS[event.urgency] || URGENCY_COLORS.medium}33`,
                  }}
                />

                <div
                  className="cursor-pointer hover:bg-surface-hover/50 rounded-md p-2 -mx-2 transition-colors"
                  onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs text-muted-foreground font-mono">{event.date}</span>
                    {event.jurisdiction && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gold/10 text-gold">{event.jurisdiction}</span>
                    )}
                    <span
                      className="text-xs px-1.5 py-0.5 rounded font-medium"
                      style={{
                        color: URGENCY_COLORS[event.urgency],
                        backgroundColor: `${URGENCY_COLORS[event.urgency]}15`,
                      }}
                    >
                      {event.urgency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-foreground font-medium">{event.title}</p>
                    {event.description && (
                      expandedIndex === i
                        ? <ChevronUp className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        : <ChevronDown className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>

                  <AnimatePresence>
                    {expandedIndex === i && event.description && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="text-xs text-muted-foreground mt-1 overflow-hidden"
                      >
                        {event.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No timeline events available</p>
        )}
      </div>
    </div>
  );
}
