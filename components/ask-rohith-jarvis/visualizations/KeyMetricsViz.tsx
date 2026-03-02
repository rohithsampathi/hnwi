// components/ask-rohith-jarvis/visualizations/KeyMetricsViz.tsx
// Animated count-up KPI cards

'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Maximize2, TrendingUp } from 'lucide-react';

interface KeyMetric {
  label: string;
  value: number;
  prefix?: string; // e.g., "$"
  suffix?: string; // e.g., "%", "M"
  format?: 'currency' | 'percentage' | 'number';
  change?: string; // e.g., "+12.5%"
}

interface KeyMetricsVizProps {
  data: {
    metrics?: KeyMetric[];
    title?: string;
  };
  onClose?: () => void;
  onExpand?: () => void;
  interactive?: boolean;
}

function AnimatedNumber({ value, prefix = '', suffix = '', duration = 1.5 }: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      // Ease out quart
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplay(Math.round(value * eased));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  const formatted = display.toLocaleString();
  return <span>{prefix}{formatted}{suffix}</span>;
}

export default function KeyMetricsViz({
  data,
  onClose,
  onExpand,
  interactive = true
}: KeyMetricsVizProps) {
  const metrics = data?.metrics || [];

  return (
    <div className="relative bg-surface/95 backdrop-blur-sm border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-gold" />
          <h3 className="text-sm font-semibold text-foreground">{data?.title || 'Key Metrics'}</h3>
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

      <div className="p-4">
        {metrics.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {metrics.map((metric, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-background/50 border border-border/30 rounded-lg p-3 text-center"
              >
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{metric.label}</p>
                <p className="text-lg font-bold text-foreground font-mono">
                  <AnimatedNumber
                    value={metric.value}
                    prefix={metric.prefix || ''}
                    suffix={metric.suffix || ''}
                  />
                </p>
                {metric.change && (
                  <p className={`text-xs mt-0.5 ${
                    metric.change.startsWith('+') ? 'text-green-400' :
                    metric.change.startsWith('-') ? 'text-red-400' : 'text-muted-foreground'
                  }`}>
                    {metric.change}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No metrics data available</p>
        )}
      </div>
    </div>
  );
}
