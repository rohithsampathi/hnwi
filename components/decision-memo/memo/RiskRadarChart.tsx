// components/decision-memo/memo/RiskRadarChart.tsx
// SFO Capital Allocation Risk Profile — SVG Spider Chart
// Shows the "broken shape" that instantly communicates why the deal failed

"use client";

import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

interface DoctrineScore {
  label: string;
  shortLabel: string;
  score: number; // 0-10
  maxScore: number;
}

interface RiskRadarChartProps {
  scores: DoctrineScore[];
  antifragilityAssessment?: string;
  failureModeCount?: number;
  totalRiskFlags?: number;
  /** Whether the deal was vetoed (DO_NOT_PROCEED) */
  isVetoed?: boolean;
}

// SVG Radar chart — no external library needed
function RadarSVG({ scores }: { scores: DoctrineScore[] }) {
  const size = 380;
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = 120;
  const levels = 5; // 0, 2, 4, 6, 8, 10
  const n = scores.length;

  // Angle for each axis (starting from top, going clockwise)
  const angleSlice = (Math.PI * 2) / n;

  // Get point coordinates for a given axis index and value (0-10)
  function getPoint(index: number, value: number): [number, number] {
    const angle = angleSlice * index - Math.PI / 2;
    const r = (value / 10) * maxRadius;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  }

  // Build polygon path for given values
  function buildPath(values: number[]): string {
    return values
      .map((v, i) => {
        const [x, y] = getPoint(i, v);
        return `${i === 0 ? 'M' : 'L'}${x},${y}`;
      })
      .join(' ') + ' Z';
  }

  // Grid circles
  const gridLevels = Array.from({ length: levels }, (_, i) => ((i + 1) / levels) * 10);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[280px] sm:max-w-[360px] mx-auto" overflow="visible">
      <defs>
        <radialGradient id="radar-fill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
        </radialGradient>
        <filter id="radar-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Grid rings */}
      {gridLevels.map((level, i) => {
        const r = (level / 10) * maxRadius;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="0.5"
            strokeDasharray={i < levels - 1 ? "3,3" : "none"}
            opacity={i < levels - 1 ? 0.4 : 0.6}
          />
        );
      })}

      {/* Axis lines */}
      {scores.map((_, i) => {
        const [x, y] = getPoint(i, 10);
        return (
          <line
            key={`axis-${i}`}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="hsl(var(--border))"
            strokeWidth="0.5"
            opacity="0.4"
          />
        );
      })}

      {/* The data polygon — the "broken shape" */}
      <motion.path
        d={buildPath(scores.map(s => s.score))}
        fill="url(#radar-fill)"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        filter="url(#radar-glow)"
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />

      {/* Data points */}
      {scores.map((s, i) => {
        const [x, y] = getPoint(i, s.score);
        return (
          <motion.circle
            key={`point-${i}`}
            cx={x}
            cy={y}
            r="4"
            fill="hsl(var(--primary))"
            stroke="hsl(var(--background))"
            strokeWidth="2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.1 }}
          />
        );
      })}

      {/* Axis labels */}
      {scores.map((s, i) => {
        const [x, y] = getPoint(i, 12.5);
        const isTop = y < cy - maxRadius * 0.5;
        const isBottom = y > cy + maxRadius * 0.5;
        const textAnchor = x < cx - 10 ? 'end' : x > cx + 10 ? 'start' : 'middle';
        const dy = isTop ? '-0.3em' : isBottom ? '1em' : '0.35em';

        return (
          <g key={`label-${i}`}>
            <text
              x={x}
              y={y}
              textAnchor={textAnchor}
              dy={dy}
              className="fill-muted-foreground"
              style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em' }}
            >
              {s.shortLabel.toUpperCase()}
            </text>
            <text
              x={x}
              y={y}
              textAnchor={textAnchor}
              dy={isTop ? '0.9em' : isBottom ? '2.2em' : '1.6em'}
              className={s.score <= 3 ? 'fill-destructive' : s.score <= 5 ? 'fill-muted-foreground' : 'fill-primary'}
              style={{ fontSize: '12px', fontWeight: 700 }}
            >
              {s.score}/10
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function RiskRadarChart({
  scores,
  antifragilityAssessment,
  failureModeCount,
  totalRiskFlags,
  isVetoed,
}: RiskRadarChartProps) {
  // Calculate overall "shape health"
  const avgScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
  const maxScore = Math.max(...scores.map(s => s.score));
  const minScore = Math.min(...scores.map(s => s.score));
  const imbalance = maxScore - minScore;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex items-center gap-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
            Capital Allocation Risk Profile
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Multi-Dimensional Structural Integrity Assessment
          </p>
        </div>
      </motion.div>

      {/* Radar Chart */}
      <motion.div
        className="bg-card border border-border rounded-2xl p-6 sm:p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <RadarSVG scores={scores} />

        {/* Score Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mt-6">
          {scores.map((s, i) => (
            <motion.div
              key={i}
              className={`px-2 sm:px-3 py-2 rounded-lg border text-center ${
                s.score <= 2 ? 'bg-destructive/5 border-destructive/20' :
                s.score <= 4 ? 'bg-orange-500/5 border-orange-500/20' :
                s.score <= 6 ? 'bg-muted/30 border-border' :
                'bg-primary/5 border-primary/20'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.08 }}
            >
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">{s.label}</p>
              <p className={`text-lg font-bold ${
                s.score <= 2 ? 'text-destructive' :
                s.score <= 4 ? 'text-orange-500' :
                s.score <= 6 ? 'text-muted-foreground' :
                'text-primary'
              }`}>
                {s.score}<span className="text-xs text-muted-foreground font-normal">/10</span>
              </p>
            </motion.div>
          ))}
        </div>

        {/* Interpretation */}
        <motion.div
          className="mt-6 p-4 rounded-xl bg-muted/30 border border-border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Structural Diagnosis</span>
            {antifragilityAssessment && (
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                antifragilityAssessment === 'ANTIFRAGILE' ? 'bg-primary/10 text-primary' :
                antifragilityAssessment === 'FRAGILE' ? 'bg-orange-500/10 text-orange-500' :
                'bg-destructive/10 text-destructive'
              }`}>
                {antifragilityAssessment.replace(/_/g, ' ')}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {imbalance >= 6 ? (
              <>
                <span className="text-foreground font-semibold">Critical Imbalance Detected.</span>{' '}
                The asset quality ({maxScore}/10) is sound, but structural dimensions
                ({minScore}/10 minimum) expose the deal to systemic risk. The shape reveals
                a fundamentally broken structure around a viable asset.
              </>
            ) : imbalance >= 4 ? (
              <>
                <span className="text-foreground font-semibold">Moderate Asymmetry.</span>{' '}
                Select dimensions score well, but gaps in key areas create vulnerability.
                {failureModeCount ? ` ${failureModeCount} failure modes detected.` : ''}
              </>
            ) : avgScore < 5 ? (
              <>
                <span className="text-foreground font-semibold">Uniformly Weak Profile.</span>{' '}
                No dimension scores above average. The deal lacks structural merit across all assessed criteria.
              </>
            ) : (
              <>
                <span className="text-foreground font-semibold">Balanced Structure.</span>{' '}
                Scores are within acceptable ranges across all dimensions.
                {totalRiskFlags ? ` ${totalRiskFlags} risk flags noted for monitoring.` : ''}
              </>
            )}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default RiskRadarChart;
