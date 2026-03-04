/**
 * SVG PRIMITIVES FOR INSTITUTIONAL PDF
 * Reusable SVG components using @react-pdf/renderer's full SVG capabilities.
 * Elevates PDFs from "tables-only" to institutional-grade visual design.
 *
 * All components accept optional verdictTheme for dynamic verdict-based coloring.
 */

import React from 'react';
import {
  Svg,
  Path,
  Rect,
  Circle,
  Line,
  Defs,
  LinearGradient,
  Stop,
  G,
  Text as SvgText,
} from '@react-pdf/renderer';
import { colors, darkTheme } from './pdf-styles';
import { VerdictTheme, getVerdictTheme } from './pdf-verdict-theme';

// =============================================================================
// GRADIENT DIVIDER
// Fade-from-edges line replacing flat gray borders
// =============================================================================
interface GradientDividerProps {
  width?: number;
  height?: number;
  color?: string;
}

export const GradientDivider: React.FC<GradientDividerProps> = ({
  width = 480,
  height = 1,
  color = darkTheme.gold,
}) => (
  <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
    <Defs>
      <LinearGradient id="gdiv" x1="0" y1="0" x2={String(width)} y2="0">
        <Stop offset="0%" stopColor={color} stopOpacity="0" />
        <Stop offset="20%" stopColor={color} stopOpacity="1" />
        <Stop offset="80%" stopColor={color} stopOpacity="1" />
        <Stop offset="100%" stopColor={color} stopOpacity="0" />
      </LinearGradient>
    </Defs>
    <Rect x="0" y="0" width={String(width)} height={String(height)} fill="url(#gdiv)" />
  </Svg>
);

// =============================================================================
// GRADIENT ACCENT BAR
// 4px accent bar with verdict-colored gradient
// =============================================================================
interface GradientAccentBarProps {
  width?: number;
  height?: number;
  theme?: VerdictTheme;
}

export const GradientAccentBar: React.FC<GradientAccentBarProps> = ({
  width = 480,
  height = 4,
  theme,
}) => {
  const t = theme || getVerdictTheme();
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        <LinearGradient id="gbar" x1="0" y1="0" x2={String(width)} y2="0">
          <Stop offset="0%" stopColor={t.gradient[0]} />
          <Stop offset="100%" stopColor={t.gradient[1]} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width={String(width)} height={String(height)} fill="url(#gbar)" />
    </Svg>
  );
};

// =============================================================================
// CIRCULAR GAUGE
// Arc gauge for scores (0-100), inspired by premium dashboards
// =============================================================================
interface CircularGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  theme?: VerdictTheme;
  label?: string;
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

export const CircularGauge: React.FC<CircularGaugeProps> = ({
  score,
  size = 100,
  strokeWidth = 8,
  theme,
  label,
}) => {
  const t = theme || getVerdictTheme();
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - strokeWidth * 2) / 2;
  const clampedScore = Math.max(0, Math.min(100, score));
  // Arc from 0 → score (max 359.9 to avoid full-circle collapse)
  const endAngle = Math.min((clampedScore / 100) * 360, 359.9);

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Track */}
      <Circle
        cx={String(cx)}
        cy={String(cy)}
        r={String(r)}
        fill="none"
        stroke={darkTheme.border}
        strokeWidth={String(strokeWidth)}
      />
      {/* Filled arc */}
      {clampedScore > 0 && (
        <Path
          d={describeArc(cx, cy, r, 0, endAngle)}
          fill="none"
          stroke={t.primary}
          strokeWidth={String(strokeWidth)}
          strokeLinecap="round"
        />
      )}
      {/* Score text */}
      <SvgText
        x={String(cx)}
        y={String(cy + 2)}
        textAnchor="middle"
        fontSize={size * 0.28}
        fontFamily="Inter" fontWeight={700}
        fill={darkTheme.textPrimary}
      >
        {String(Math.round(clampedScore))}
      </SvgText>
      {/* Label below score */}
      {label && (
        <SvgText
          x={String(cx)}
          y={String(cy + size * 0.18)}
          textAnchor="middle"
          fontSize={size * 0.1}
          fontFamily="Inter" fontWeight={700}
          fill={darkTheme.textMuted}
        >
          {label}
        </SvgText>
      )}
    </Svg>
  );
};

// =============================================================================
// HORIZONTAL BAR
// Tax rate comparison bar (red=current vs green=optimized)
// =============================================================================
interface HorizontalBarProps {
  currentRate: number;
  optimizedRate: number;
  width?: number;
  height?: number;
  label?: string;
}

export const HorizontalBar: React.FC<HorizontalBarProps> = ({
  currentRate,
  optimizedRate,
  width = 200,
  height = 24,
  label,
}) => {
  const maxRate = Math.max(currentRate, optimizedRate, 50); // minimum 50% scale
  const currentW = (currentRate / maxRate) * width;
  const optimizedW = (optimizedRate / maxRate) * width;
  const barH = 8;
  const gap = 2;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* Current rate bar (red) */}
      <Rect x="0" y="0" width={String(width)} height={String(barH)} rx="2" fill={darkTheme.surfaceBg} />
      <Rect x="0" y="0" width={String(Math.max(currentW, 2))} height={String(barH)} rx="2" fill={colors.amber[500]} />
      {/* Optimized rate bar */}
      <Rect x="0" y={String(barH + gap)} width={String(width)} height={String(barH)} rx="2" fill={darkTheme.surfaceBg} />
      <Rect x="0" y={String(barH + gap)} width={String(Math.max(optimizedW, 2))} height={String(barH)} rx="2" fill={darkTheme.textFaint} />
      {/* Labels */}
      <SvgText x={String(width + 4)} y={String(barH - 1)} fontSize="7" fontFamily="Inter" fontWeight={700} fill={colors.amber[500]}>
        {`${currentRate}%`}
      </SvgText>
      <SvgText x={String(width + 4)} y={String(barH + gap + barH - 1)} fontSize="7" fontFamily="Inter" fontWeight={700} fill={darkTheme.textFaint}>
        {`${optimizedRate}%`}
      </SvgText>
    </Svg>
  );
};

// =============================================================================
// SPARKLINE CHART
// Simple line chart for wealth projections
// =============================================================================
interface SparklineChartProps {
  data: number[];
  width?: number;
  height?: number;
  theme?: VerdictTheme;
  showDots?: boolean;
}

export const SparklineChart: React.FC<SparklineChartProps> = ({
  data,
  width = 200,
  height = 60,
  theme,
  showDots = true,
}) => {
  const t = theme || getVerdictTheme();
  if (!data || data.length < 2) return null;

  const padding = 4;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => ({
    x: padding + (i / (data.length - 1)) * chartW,
    y: padding + chartH - ((val - min) / range) * chartH,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* Line */}
      <Path d={pathD} fill="none" stroke={t.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Data points */}
      {showDots &&
        points.map((p, i) => (
          <Circle key={i} cx={String(p.x)} cy={String(p.y)} r="3" fill={t.primary} />
        ))}
    </Svg>
  );
};

// =============================================================================
// CORNER ACCENT
// Refined SVG corner marks for premium framing
// =============================================================================
interface CornerAccentProps {
  position: 'tl' | 'tr' | 'bl' | 'br';
  size?: number;
  color?: string;
}

export const CornerAccent: React.FC<CornerAccentProps> = ({
  position,
  size = 20,
  color = darkTheme.gold,
}) => {
  const paths: Record<string, string> = {
    tl: `M 0 ${size} L 0 0 L ${size} 0`,
    tr: `M ${size - size} 0 L ${size} 0 L ${size} ${size}`,
    bl: `M 0 0 L 0 ${size} L ${size} ${size}`,
    br: `M 0 ${size} L ${size} ${size} L ${size} 0`,
  };

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Path d={paths[position]} fill="none" stroke={color} strokeWidth="1" />
    </Svg>
  );
};

// =============================================================================
// VERDICT STAMP
// Large verdict with colored ring — the centerpiece of the verdict page
// =============================================================================
interface VerdictStampProps {
  verdict: string;
  score?: number;
  size?: number;
  theme?: VerdictTheme;
}

export const VerdictStamp: React.FC<VerdictStampProps> = ({
  verdict,
  score,
  size = 140,
  theme,
}) => {
  const t = theme || getVerdictTheme(verdict);
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 4;
  const innerR = outerR - 6;

  // Determine font size based on verdict text length
  const fontSize = verdict.length > 12 ? size * 0.1 : verdict.length > 8 ? size * 0.12 : size * 0.15;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Outer ring */}
      <Circle cx={String(cx)} cy={String(cy)} r={String(outerR)} fill="none" stroke={t.primary} strokeWidth="3" />
      {/* Inner ring */}
      <Circle cx={String(cx)} cy={String(cy)} r={String(innerR)} fill="none" stroke={t.light} strokeWidth="1" />
      {/* Verdict text */}
      <SvgText
        x={String(cx)}
        y={score !== undefined ? String(cy - 4) : String(cy + 4)}
        textAnchor="middle"
        fontSize={fontSize}
        fontFamily="Inter" fontWeight={700}
        fill={t.primary}
      >
        {verdict.toUpperCase()}
      </SvgText>
      {/* Optional score */}
      {score !== undefined && (
        <SvgText
          x={String(cx)}
          y={String(cy + size * 0.16)}
          textAnchor="middle"
          fontSize={size * 0.2}
          fontFamily="Inter" fontWeight={700}
          fill={darkTheme.textPrimary}
        >
          {String(Math.round(score))}
        </SvgText>
      )}
    </Svg>
  );
};

// =============================================================================
// RISK HEAT BAR
// Multi-segment bar showing distribution of critical/high/medium/low
// =============================================================================
interface RiskHeatBarProps {
  critical: number;
  high: number;
  medium: number;
  low?: number;
  width?: number;
  height?: number;
}

export const RiskHeatBar: React.FC<RiskHeatBarProps> = ({
  critical,
  high,
  medium,
  low = 0,
  width = 300,
  height = 20,
}) => {
  const total = critical + high + medium + low;
  if (total === 0) return null;

  const segments = [
    { count: critical, color: colors.red[700], label: 'CRITICAL' },
    { count: high, color: colors.amber[600], label: 'HIGH' },
    { count: medium, color: darkTheme.textFaint, label: 'MEDIUM' },
    { count: low, color: darkTheme.surfaceBg, label: 'LOW' },
  ].filter(s => s.count > 0);

  let x = 0;
  return (
    <Svg width={width} height={height + 14} viewBox={`0 0 ${width} ${height + 14}`}>
      {segments.map((seg, i) => {
        const w = (seg.count / total) * width;
        const rx = x;
        x += w;
        return (
          <G key={i}>
            <Rect x={String(rx)} y="0" width={String(w)} height={String(height)} fill={seg.color} />
            <SvgText
              x={String(rx + w / 2)}
              y={String(height + 11)}
              textAnchor="middle"
              fontSize="7"
              fontFamily="Inter" fontWeight={700}
              fill={seg.color}
            >
              {`${seg.count} ${seg.label}`}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
};

// =============================================================================
// FLOW ARROW
// Migration corridor arrow with labels (Source → Destination)
// =============================================================================
interface FlowArrowProps {
  from: string;
  to: string;
  width?: number;
  height?: number;
  theme?: VerdictTheme;
}

export const FlowArrow: React.FC<FlowArrowProps> = ({
  from,
  to,
  width = 280,
  height = 36,
  theme,
}) => {
  const t = theme || getVerdictTheme();
  const arrowY = height / 2;
  const arrowStartX = 80;
  const arrowEndX = width - 80;
  const arrowHeadSize = 6;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* From label */}
      <SvgText x="4" y={String(arrowY + 4)} fontSize="10" fontFamily="Inter" fontWeight={700} fill={darkTheme.textPrimary}>
        {from}
      </SvgText>
      {/* Arrow line */}
      <Line
        x1={String(arrowStartX)}
        y1={String(arrowY)}
        x2={String(arrowEndX - arrowHeadSize)}
        y2={String(arrowY)}
        stroke={t.primary}
        strokeWidth="2"
      />
      {/* Arrow head */}
      <Path
        d={`M ${arrowEndX - arrowHeadSize} ${arrowY - arrowHeadSize} L ${arrowEndX} ${arrowY} L ${arrowEndX - arrowHeadSize} ${arrowY + arrowHeadSize}`}
        fill="none"
        stroke={t.primary}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* To label */}
      <SvgText
        x={String(arrowEndX + 8)}
        y={String(arrowY + 4)}
        fontSize="10"
        fontFamily="Inter" fontWeight={700}
        fill={darkTheme.textPrimary}
      >
        {to}
      </SvgText>
    </Svg>
  );
};

// =============================================================================
// CONFIDENCE METER
// 5-bar data quality indicator
// =============================================================================
interface ConfidenceMeterProps {
  level: number; // 1–5
  size?: number;
  theme?: VerdictTheme;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  level,
  size = 60,
  theme,
}) => {
  const t = theme || getVerdictTheme();
  const barCount = 5;
  const barWidth = (size - (barCount - 1) * 2) / barCount;
  const maxH = 20;
  const clampedLevel = Math.max(0, Math.min(barCount, Math.round(level)));

  return (
    <Svg width={size} height={maxH + 2} viewBox={`0 0 ${size} ${maxH + 2}`}>
      {Array.from({ length: barCount }).map((_, i) => {
        const h = maxH * ((i + 1) / barCount);
        const x = i * (barWidth + 2);
        const y = maxH - h;
        const filled = i < clampedLevel;
        return (
          <Rect
            key={i}
            x={String(x)}
            y={String(y + 1)}
            width={String(barWidth)}
            height={String(h)}
            rx="1"
            fill={filled ? t.primary : darkTheme.border}
          />
        );
      })}
    </Svg>
  );
};

// =============================================================================
// DONUT CHART
// Generational wealth erosion: G1 → G2 → G3
// =============================================================================
interface DonutChartProps {
  segments: Array<{
    value: number;
    color: string;
    label?: string;
  }>;
  size?: number;
  strokeWidth?: number;
}

function describeDonutArc(cx: number, cy: number, r: number, startPct: number, endPct: number): string {
  const startAngle = startPct * 360;
  const endAngle = endPct * 360;
  if (endAngle - startAngle >= 359.9) {
    // Full circle: use two arcs
    const mid = polarToCartesian(cx, cy, r, startAngle + 180);
    const start = polarToCartesian(cx, cy, r, startAngle);
    return `M ${start.x} ${start.y} A ${r} ${r} 0 1 1 ${mid.x} ${mid.y} A ${r} ${r} 0 1 1 ${start.x} ${start.y}`;
  }
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? '1' : '0';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  segments,
  size = 120,
  strokeWidth = 16,
}) => {
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - strokeWidth * 2) / 2;
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) return null;

  let accumulated = 0;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Track */}
      <Circle cx={String(cx)} cy={String(cy)} r={String(r)} fill="none" stroke={darkTheme.border} strokeWidth={String(strokeWidth)} />
      {/* Segments */}
      {segments.map((seg, i) => {
        const startPct = accumulated / total;
        accumulated += seg.value;
        const endPct = accumulated / total;
        return (
          <Path
            key={i}
            d={describeDonutArc(cx, cy, r, startPct, endPct)}
            fill="none"
            stroke={seg.color}
            strokeWidth={String(strokeWidth)}
            strokeLinecap="butt"
          />
        );
      })}
    </Svg>
  );
};

// =============================================================================
// MINI METRIC BAR
// Simple single-color progress bar for inline metrics
// =============================================================================
interface MiniMetricBarProps {
  value: number; // 0-100
  width?: number;
  height?: number;
  color?: string;
}

export const MiniMetricBar: React.FC<MiniMetricBarProps> = ({
  value,
  width = 80,
  height = 6,
  color = colors.amber[500],
}) => {
  const clamped = Math.max(0, Math.min(100, value));
  const fillW = (clamped / 100) * width;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Rect x="0" y="0" width={String(width)} height={String(height)} rx="3" fill={darkTheme.border} />
      <Rect x="0" y="0" width={String(Math.max(fillW, 2))} height={String(height)} rx="3" fill={color} />
    </Svg>
  );
};
