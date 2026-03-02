// components/decision-memo/memo/RiskRadarChart.tsx
// SFO Capital Allocation Risk Profile — SVG Spider Chart
// Shows the "broken shape" that instantly communicates why the deal failed
// Awwwards-level choreographed animation with adaptive color system

"use client";

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { EASE_OUT_EXPO, staggerContainer, staggerItem } from '@/lib/animations/motion-variants';

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

// Color helpers for adaptive radar
function getScoreColor(score: number): string {
  if (score <= 2) return '#ef4444';   // red-500
  if (score <= 4) return '#f97316';   // orange-500
  if (score <= 6) return '#eab308';   // yellow-500
  return '#10b981';                    // emerald-500
}

function getAvgScoreGradient(avg: number): { center: string; edge: string; stroke: string } {
  if (avg <= 3) return { center: 'rgba(239,68,68,0.35)', edge: 'rgba(239,68,68,0.05)', stroke: '#ef4444' };
  if (avg <= 5) return { center: 'rgba(249,115,22,0.3)', edge: 'rgba(249,115,22,0.05)', stroke: '#f97316' };
  if (avg <= 7) return { center: 'rgba(234,179,8,0.25)', edge: 'rgba(234,179,8,0.05)', stroke: '#eab308' };
  return { center: 'rgba(16,185,129,0.3)', edge: 'rgba(16,185,129,0.05)', stroke: '#10b981' };
}

// SVG Radar chart — no external library needed
function RadarSVG({ scores, isVetoed }: { scores: DoctrineScore[]; isVetoed?: boolean }) {
  const size = 380;
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = 120;
  const levels = 5; // 0, 2, 4, 6, 8, 10
  const n = scores.length;
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const avgScore = scores.reduce((s, d) => s + d.score, 0) / scores.length;
  const gradient = isVetoed
    ? { center: 'rgba(239,68,68,0.35)', edge: 'rgba(239,68,68,0.05)', stroke: '#ef4444' }
    : getAvgScoreGradient(avgScore);

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

  // Compute polygon perimeter for stroke animation
  const polygonPerimeter = scores.reduce((sum, s, i) => {
    const [x1, y1] = getPoint(i, s.score);
    const [x2, y2] = getPoint((i + 1) % n, scores[(i + 1) % n].score);
    return sum + Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }, 0);

  // Grid circles
  const gridLevels = Array.from({ length: levels }, (_, i) => ((i + 1) / levels) * 10);

  return (
    <svg ref={ref} viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[220px] sm:max-w-[280px] md:max-w-[360px] mx-auto" overflow="visible">
      <defs>
        {/* Adaptive gradient based on average score */}
        <radialGradient id="radar-fill-adaptive" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={gradient.center} />
          <stop offset="100%" stopColor={gradient.edge} />
        </radialGradient>
        {/* Glow filter for stroke */}
        <filter id="radar-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Pulsing glow for critical data points */}
        <filter id="point-glow-red">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feFlood floodColor="#ef4444" floodOpacity="0.6" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Grid rings — staggered fade-in */}
      {gridLevels.map((level, i) => {
        const r = (level / 10) * maxRadius;
        return (
          <motion.circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={i === levels - 1 ? "1.2" : "0.8"}
            strokeDasharray={i < levels - 1 ? "4,4" : "none"}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={isInView ? { opacity: i < levels - 1 ? 0.25 : 0.45, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: i * 0.06, ease: EASE_OUT_EXPO }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
        );
      })}

      {/* Axis lines — draw from center outward */}
      {scores.map((_, i) => {
        const [x, y] = getPoint(i, 10);
        return (
          <motion.line
            key={`axis-${i}`}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="0.8"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={isInView ? { pathLength: 1, opacity: 0.3 } : {}}
            transition={{ duration: 0.6, delay: 0.3 + i * 0.04, ease: EASE_OUT_EXPO }}
          />
        );
      })}

      {/* The data polygon — stroke draws first, then fill fades in */}
      <motion.path
        d={buildPath(scores.map(s => s.score))}
        fill="url(#radar-fill-adaptive)"
        stroke={gradient.stroke}
        strokeWidth="2.5"
        strokeLinejoin="round"
        filter="url(#radar-glow)"
        initial={{ fillOpacity: 0, strokeDasharray: polygonPerimeter, strokeDashoffset: polygonPerimeter }}
        animate={isInView ? { fillOpacity: 1, strokeDashoffset: 0 } : {}}
        transition={{ duration: 1.4, ease: EASE_OUT_EXPO, delay: 0.5 }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />

      {/* Data points — cascade after polygon draws */}
      {scores.map((s, i) => {
        const [x, y] = getPoint(i, s.score);
        const isCritical = s.score <= 3;
        const pointColor = getScoreColor(s.score);
        return (
          <g key={`point-${i}`}>
            {/* Pulse ring on critical scores */}
            {isCritical && (
              <motion.circle
                cx={x}
                cy={y}
                r="4"
                fill="none"
                stroke="#ef4444"
                strokeWidth="1.5"
                initial={{ opacity: 0 }}
                animate={isInView ? {
                  opacity: [0, 0.6, 0],
                  r: [4, 12, 4],
                } : {}}
                transition={{
                  delay: 1.6 + i * 0.1,
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
            <motion.circle
              cx={x}
              cy={y}
              r={isCritical ? "5" : "4"}
              fill={pointColor}
              stroke="hsl(var(--background))"
              strokeWidth="2"
              filter={isCritical ? "url(#point-glow-red)" : undefined}
              initial={{ opacity: 0, scale: 0 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 1.4 + i * 0.1, duration: 0.4, ease: EASE_OUT_EXPO }}
              style={{ transformOrigin: `${x}px ${y}px` }}
            />
          </g>
        );
      })}

      {/* Axis labels — appear after points */}
      {scores.map((s, i) => {
        const [x, y] = getPoint(i, 12.5);
        const isTop = y < cy - maxRadius * 0.5;
        const isBottom = y > cy + maxRadius * 0.5;
        const textAnchor = x < cx - 10 ? 'end' : x > cx + 10 ? 'start' : 'middle';
        const dy = isTop ? '-0.3em' : isBottom ? '1em' : '0.35em';

        return (
          <motion.g
            key={`label-${i}`}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 1.8 + i * 0.06, duration: 0.4 }}
          >
            <text
              x={x}
              y={y}
              textAnchor={textAnchor}
              dy={dy}
              className="fill-muted-foreground"
              style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em' }}
            >
              {s.shortLabel.toUpperCase()}
            </text>
            <text
              x={x}
              y={y}
              textAnchor={textAnchor}
              dy={isTop ? '0.9em' : isBottom ? '2.2em' : '1.6em'}
              fill={getScoreColor(s.score)}
              style={{ fontSize: '12px', fontWeight: 700 }}
            >
              {s.score}/10
            </text>
          </motion.g>
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
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-60px" });

  // Calculate overall "shape health"
  const avgScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
  const maxScore = Math.max(...scores.map(s => s.score));
  const minScore = Math.min(...scores.map(s => s.score));
  const imbalance = maxScore - minScore;
  const criticalCount = scores.filter(s => s.score <= 3).length;

  return (
    <motion.div
      ref={sectionRef}
      className="relative rounded-2xl border border-border/30 overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-gold/[0.03] to-transparent pointer-events-none" />

      {/* Gold hairline gradient */}
      <motion.div
        className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.15, ease: EASE_OUT_EXPO }}
        style={{ transformOrigin: 'left' }}
      />

      {/* Header */}
      <div className="px-5 sm:px-8 md:px-12 py-10 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2, ease: EASE_OUT_EXPO }}
        >
          <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-3">
            Multi-Dimensional Structural Integrity
          </p>
          <h3 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
            Capital Allocation Risk Profile
          </h3>
        </motion.div>
      </div>

      {/* Radar SVG */}
      <div className="px-5 sm:px-8 md:px-12 pb-10 md:pb-12">
        <RadarSVG scores={scores} isVetoed={isVetoed} />
      </div>

      {/* Hairline divider */}
      <div className="h-px bg-gradient-to-r from-border/30 via-border/10 to-transparent" />

      {/* Score Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="px-5 sm:px-8 md:px-12 py-10 md:py-12"
      >
        {/* Row 1: scores 0-2 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
          {scores.slice(0, 3).map((s, i) => {
            const color = getScoreColor(s.score);
            const isCritical = s.score <= 3;
            return (
              <motion.div
                key={i}
                variants={staggerItem}
                className="relative rounded-xl border border-border/20 bg-card/50 px-4 sm:px-5 py-4 sm:py-5 cursor-default"
                whileHover={{ backgroundColor: 'hsl(var(--muted) / 0.15)' }}
                transition={{ duration: 0.2 }}
              >
                {isCritical && (
                  <motion.div
                    className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-500"
                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3 truncate hover:whitespace-normal hover:overflow-visible cursor-default" title={s.label}>
                  {s.label}
                </p>
                <p className="text-xl md:text-2xl font-bold" style={{ color }}>
                  {s.score}<span className="text-xs text-muted-foreground/60 font-normal">/10</span>
                </p>
                <div className="w-full h-1 bg-muted/50 rounded-sm mt-3 overflow-hidden">
                  <motion.div
                    className="h-full rounded-sm"
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${(s.score / 10) * 100}%` } : {}}
                    transition={{ duration: 0.8, delay: 2.0 + i * 0.08, ease: EASE_OUT_EXPO }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Row 2: scores 3-5 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
          {scores.slice(3, 6).map((s, i) => {
            const color = getScoreColor(s.score);
            const isCritical = s.score <= 3;
            const globalIndex = i + 3;
            return (
              <motion.div
                key={globalIndex}
                variants={staggerItem}
                className="relative rounded-xl border border-border/20 bg-card/50 px-4 sm:px-5 py-4 sm:py-5 cursor-default"
                whileHover={{ backgroundColor: 'hsl(var(--muted) / 0.15)' }}
                transition={{ duration: 0.2 }}
              >
                {isCritical && (
                  <motion.div
                    className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-500"
                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3 truncate hover:whitespace-normal hover:overflow-visible cursor-default" title={s.label}>
                  {s.label}
                </p>
                <p className="text-xl md:text-2xl font-bold" style={{ color }}>
                  {s.score}<span className="text-xs text-muted-foreground/60 font-normal">/10</span>
                </p>
                <div className="w-full h-1 bg-muted/50 rounded-sm mt-3 overflow-hidden">
                  <motion.div
                    className="h-full rounded-sm"
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${(s.score / 10) * 100}%` } : {}}
                    transition={{ duration: 0.8, delay: 2.0 + globalIndex * 0.08, ease: EASE_OUT_EXPO }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Hairline divider */}
      <div className="h-px bg-gradient-to-r from-border/30 via-border/10 to-transparent" />

      {/* Structural Diagnosis Footer */}
      <motion.div
        className="px-5 sm:px-8 md:px-12 py-8 md:py-10"
        initial={{ opacity: 0, y: 12 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 2.4, duration: 0.7, ease: EASE_OUT_EXPO }}
      >
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground/60 font-medium">
            Structural Diagnosis
          </span>
          <div className="flex items-center gap-3">
            {criticalCount > 0 && (
              <span className="text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border border-red-500/20 text-red-500/80">
                {criticalCount} Critical
              </span>
            )}
            {antifragilityAssessment && (
              <span className={`text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border ${
                antifragilityAssessment === 'ANTIFRAGILE' ? 'border-emerald-500/20 text-emerald-500/80' :
                antifragilityAssessment === 'FRAGILE' ? 'border-orange-500/20 text-orange-500/80' :
                'border-red-500/20 text-red-500/80'
              }`}>
                {antifragilityAssessment.replace(/_/g, ' ')}
              </span>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground/60 leading-relaxed">
          {imbalance >= 6 ? (
            <>
              <span className="text-foreground/60 font-medium">Critical Imbalance Detected.</span>{' '}
              The asset quality ({maxScore}/10) is sound, but structural dimensions
              ({minScore}/10 minimum) expose the deal to systemic risk. The shape reveals
              a fundamentally broken structure around a viable asset.
            </>
          ) : imbalance >= 4 ? (
            <>
              <span className="text-foreground/60 font-medium">Moderate Asymmetry.</span>{' '}
              Select dimensions score well, but gaps in key areas create vulnerability.
              {failureModeCount ? ` ${failureModeCount} failure modes detected.` : ''}
            </>
          ) : avgScore < 5 ? (
            <>
              <span className="text-foreground/60 font-medium">Uniformly Weak Profile.</span>{' '}
              No dimension scores above average. The deal lacks structural merit across all assessed criteria.
            </>
          ) : (
            <>
              <span className="text-foreground/60 font-medium">Balanced Structure.</span>{' '}
              Scores are within acceptable ranges across all dimensions.
              {totalRiskFlags ? ` ${totalRiskFlags} risk flags noted for monitoring.` : ''}
            </>
          )}
        </p>
      </motion.div>
    </motion.div>
  );
}

export default RiskRadarChart;
