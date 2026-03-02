// components/ask-rohith-jarvis/visualizations/RiskHeatmapViz.tsx
// Risk heatmap showing jurisdiction risks

'use client';

import { motion } from 'framer-motion';
import { X, Maximize2, AlertTriangle } from 'lucide-react';
import { CornerBrackets } from '@/components/decision-memo/personal/HolographicEffects';

interface RiskHeatmapVizProps {
  data: {
    jurisdictions: Record<string, number>;
    highest_risk: number;
  };
  onClose?: () => void;
  onExpand?: () => void;
  interactive?: boolean;
}

const getRiskColor = (score: number) => {
  if (score >= 70) return '#EF4444'; // High risk - Red
  if (score >= 40) return '#F59E0B'; // Medium risk - Orange
  return '#22C55E'; // Low risk - Green
};

const getRiskLabel = (score: number) => {
  if (score >= 70) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
};

export default function RiskHeatmapViz({
  data,
  onClose,
  onExpand,
  interactive = true
}: RiskHeatmapVizProps) {
  const entries = Object.entries(data.jurisdictions).sort((a, b) => b[1] - a[1]);

  return (
    <div className="relative bg-surface/95 backdrop-blur-sm border border-border rounded-lg overflow-hidden">
      <CornerBrackets size={12} thickness={2} color="#D4A843" />

      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-gold" />
          <h3 className="text-sm font-semibold text-foreground">Risk Assessment</h3>
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

      <div className="p-4 space-y-2">
        {entries.map(([jurisdiction, score], index) => (
          <motion.div
            key={jurisdiction}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="p-2 rounded border border-border hover:border-gold/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-foreground">{jurisdiction}</span>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded"
                style={{
                  backgroundColor: `${getRiskColor(score)}20`,
                  color: getRiskColor(score)
                }}
              >
                {getRiskLabel(score)}
              </span>
            </div>
            <div className="w-full h-2 bg-surface-hover rounded-full overflow-hidden">
              <motion.div
                className="h-full"
                style={{ backgroundColor: getRiskColor(score) }}
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
