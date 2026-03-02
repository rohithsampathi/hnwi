// components/ask-rohith-jarvis/visualizations/MigrationFlowViz.tsx
// Wealth migration flow visualization

'use client';

import { motion } from 'framer-motion';
import { X, Maximize2, ArrowRightLeft } from 'lucide-react';

interface MigrationFlow {
  from: string;
  to: string;
  volume: number; // 0-100 percentage
  label?: string;
}

interface MigrationStat {
  label: string;
  value: string;
  change?: string;
}

interface MigrationFlowVizProps {
  data: {
    flows?: MigrationFlow[];
    stats?: MigrationStat[];
    title?: string;
  };
  onClose?: () => void;
  onExpand?: () => void;
  interactive?: boolean;
}

export default function MigrationFlowViz({
  data,
  onClose,
  onExpand,
  interactive = true
}: MigrationFlowVizProps) {
  const flows = data?.flows || [];
  const stats = data?.stats || [];

  return (
    <div className="relative bg-surface/95 backdrop-blur-sm border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-gold" />
          <h3 className="text-sm font-semibold text-foreground">{data?.title || 'Migration Flows'}</h3>
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

      <div className="p-4 space-y-4">
        {/* Flow cards */}
        {flows.length > 0 ? (
          <div className="space-y-3">
            {flows.map((flow, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3"
              >
                <span className="text-xs text-foreground font-medium w-20 text-right truncate">{flow.from}</span>
                <div className="flex-1 relative h-5 bg-background rounded-full overflow-hidden border border-border/50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(flow.volume, 100)}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: [0.19, 1.0, 0.22, 1.0] }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold/60 to-gold rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] text-foreground font-mono">{flow.label || `${flow.volume}%`}</span>
                  </div>
                </div>
                <span className="text-xs text-foreground font-medium w-20 truncate">{flow.to}</span>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No migration flow data</p>
        )}

        {/* Stats cards */}
        {stats.length > 0 && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/30">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="bg-background/50 rounded-md p-2 border border-border/30"
              >
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-sm font-semibold text-foreground">{stat.value}</p>
                {stat.change && (
                  <p className={`text-[10px] ${stat.change.startsWith('+') ? 'text-green-400' : stat.change.startsWith('-') ? 'text-red-400' : 'text-muted-foreground'}`}>
                    {stat.change}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
