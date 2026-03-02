// components/ask-rohith-jarvis/visualizations/JurisdictionScorecardViz.tsx
// Jurisdiction scorecard with radar chart overlay

'use client';

import { motion } from 'framer-motion';
import { X, Maximize2, Target } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from 'recharts';

interface JurisdictionScore {
  name: string; // Jurisdiction name
  tax_efficiency: number;
  regulatory_stability: number;
  privacy: number;
  accessibility: number;
  verdict: 'proceed' | 'restructure' | 'abort';
  summary?: string;
}

interface JurisdictionScorecardVizProps {
  data: {
    jurisdictions?: JurisdictionScore[];
  };
  onClose?: () => void;
  onExpand?: () => void;
  interactive?: boolean;
}

const RADAR_COLORS = ['#D4A843', '#3B82F6', '#22C55E', '#F59E0B'];
const VERDICT_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  proceed: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
  restructure: { bg: 'bg-gold/10', text: 'text-gold', border: 'border-gold/30' },
  abort: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
};

export default function JurisdictionScorecardViz({
  data,
  onClose,
  onExpand,
  interactive = true
}: JurisdictionScorecardVizProps) {
  const jurisdictions = data?.jurisdictions || [];

  // Build radar chart data from jurisdiction scores
  const radarData = [
    { axis: 'Tax Efficiency', ...Object.fromEntries(jurisdictions.map(j => [j.name, j.tax_efficiency])) },
    { axis: 'Reg. Stability', ...Object.fromEntries(jurisdictions.map(j => [j.name, j.regulatory_stability])) },
    { axis: 'Privacy', ...Object.fromEntries(jurisdictions.map(j => [j.name, j.privacy])) },
    { axis: 'Accessibility', ...Object.fromEntries(jurisdictions.map(j => [j.name, j.accessibility])) },
  ];

  return (
    <div className="relative bg-surface/95 backdrop-blur-sm border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-gold" />
          <h3 className="text-sm font-semibold text-foreground">Jurisdiction Scorecard</h3>
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
        {jurisdictions.length > 0 ? (
          <>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#262626" />
                  <PolarAngleAxis dataKey="axis" tick={{ fill: '#A3A3A3', fontSize: 10 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  {jurisdictions.map((j, i) => (
                    <Radar
                      key={j.name}
                      name={j.name}
                      dataKey={j.name}
                      stroke={RADAR_COLORS[i % RADAR_COLORS.length]}
                      fill={RADAR_COLORS[i % RADAR_COLORS.length]}
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  ))}
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Verdict cards */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              {jurisdictions.map((j, i) => {
                const style = VERDICT_STYLES[j.verdict] || VERDICT_STYLES.restructure;
                return (
                  <motion.div
                    key={j.name}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className={`${style.bg} border ${style.border} rounded-md p-2`}
                  >
                    <p className="text-xs font-medium text-foreground">{j.name}</p>
                    <p className={`text-[10px] font-semibold uppercase tracking-wider ${style.text}`}>
                      {j.verdict}
                    </p>
                    {j.summary && <p className="text-[10px] text-muted-foreground mt-0.5">{j.summary}</p>}
                  </motion.div>
                );
              })}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No jurisdiction data available</p>
        )}
      </div>
    </div>
  );
}
