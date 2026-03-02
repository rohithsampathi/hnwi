// components/ask-rohith-jarvis/visualizations/PortfolioStatsViz.tsx
// Animated portfolio stat card grid

'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Maximize2, BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PortfolioStat {
  label: string;
  value: string;
  numericValue?: number;
  change?: number; // percentage change
  trend?: 'up' | 'down' | 'flat';
  category?: string;
}

interface PortfolioStatsVizProps {
  data: {
    stats?: PortfolioStat[];
    title?: string;
    summary?: string;
  };
  onClose?: () => void;
  onExpand?: () => void;
  interactive?: boolean;
}

function AnimatedValue({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 1200;

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(target * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target]);

  return <span>{display.toLocaleString()}{suffix}</span>;
}

const TrendIcon = ({ trend }: { trend?: string }) => {
  if (trend === 'up') return <TrendingUp className="w-3 h-3 text-green-400" />;
  if (trend === 'down') return <TrendingDown className="w-3 h-3 text-red-400" />;
  return <Minus className="w-3 h-3 text-muted-foreground" />;
};

export default function PortfolioStatsViz({
  data,
  onClose,
  onExpand,
  interactive = true
}: PortfolioStatsVizProps) {
  const stats = data?.stats || [];

  return (
    <div className="relative bg-surface/95 backdrop-blur-sm border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-gold" />
          <h3 className="text-sm font-semibold text-foreground">{data?.title || 'Portfolio Stats'}</h3>
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
        {stats.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08, ease: [0.19, 1.0, 0.22, 1.0] }}
                  className="bg-background/50 border border-border/30 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                    <TrendIcon trend={stat.trend} />
                  </div>
                  <p className="text-base font-bold text-foreground">
                    {stat.numericValue !== undefined ? (
                      <AnimatedValue target={stat.numericValue} />
                    ) : (
                      stat.value
                    )}
                  </p>
                  {stat.change !== undefined && (
                    <p className={`text-[10px] mt-0.5 ${
                      stat.change > 0 ? 'text-green-400' : stat.change < 0 ? 'text-red-400' : 'text-muted-foreground'
                    }`}>
                      {stat.change > 0 ? '+' : ''}{stat.change}%
                    </p>
                  )}
                </motion.div>
              ))}
            </div>

            {data?.summary && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xs text-muted-foreground mt-3 pt-2 border-t border-border/30 italic"
              >
                {data.summary}
              </motion.p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No portfolio stats available</p>
        )}
      </div>
    </div>
  );
}
