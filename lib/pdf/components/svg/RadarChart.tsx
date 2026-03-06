/**
 * RadarChart — 6-axis spider chart SVG for @react-pdf/renderer
 * Maps to web's RiskRadarChart (components/decision-memo/memo/RiskRadarChart.tsx)
 * Uses react-pdf Svg primitives only (no DOM SVG)
 */

import React from 'react';
import { Svg, G, Path, Circle, Text as SvgText, Line } from '@react-pdf/renderer';
import { polarToCartesian } from './svg-utils';
import { colors, darkTheme } from '../../pdf-styles';

interface RadarScore {
  label: string;
  shortLabel: string;
  score: number;
  maxScore: number;
}

interface RadarChartProps {
  scores: RadarScore[];
  size?: number;
  isVetoed?: boolean;
}

function getScoreColor(score: number): string {
  if (score <= 3) return colors.red[700];
  if (score <= 5) return colors.amber[600];
  if (score <= 7) return colors.amber[500];
  return colors.amber[400];
}

function getAvgFill(avg: number, isVetoed?: boolean): { fill: string; stroke: string } {
  if (isVetoed) return { fill: colors.tints.redDeepSubtle, stroke: colors.red[700] };
  if (avg <= 3) return { fill: colors.tints.redDeepSubtle, stroke: colors.red[700] };
  if (avg <= 5) return { fill: colors.tints.goldMutedSubtle, stroke: colors.amber[600] };
  return { fill: colors.tints.goldSubtle, stroke: colors.amber[500] };
}

/**
 * Get (x, y) for a radar axis point.
 * index 0 starts at top (12 o'clock), goes clockwise.
 */
function radarPoint(cx: number, cy: number, maxR: number, index: number, total: number, value: number, maxVal: number): { x: number; y: number } {
  const angleDeg = (360 / total) * index - 90; // -90 so index 0 = top
  const r = (value / maxVal) * maxR;
  return polarToCartesian(cx, cy, r, angleDeg);
}

function buildPolygonPath(cx: number, cy: number, maxR: number, scores: RadarScore[]): string {
  const n = scores.length;
  return scores.map((s, i) => {
    const { x, y } = radarPoint(cx, cy, maxR, i, n, s.score, 10);
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ') + ' Z';
}

function buildGridPath(cx: number, cy: number, maxR: number, n: number, level: number): string {
  return Array.from({ length: n }, (_, i) => {
    const { x, y } = radarPoint(cx, cy, maxR, i, n, level, 10);
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ') + ' Z';
}

export const RadarChart: React.FC<RadarChartProps> = ({ scores, size = 200, isVetoed }) => {
  if (!scores || scores.length < 3) return null;

  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.35;
  const pad = Math.round(size * 0.4); // viewBox padding for long label overflow (e.g. ANTIFRAGILE)
  const n = scores.length;
  if (n === 0) return null;
  const avgScore = scores.reduce((s, d) => s + d.score, 0) / n;
  const { fill, stroke } = getAvgFill(avgScore, isVetoed);
  const gridLevels = [2, 4, 6, 8, 10];

  return (
    <Svg width={size} height={size} viewBox={`${-pad} ${-pad} ${size + pad * 2} ${size + pad * 2}`}>
      {/* Grid hexagons */}
      {gridLevels.map((level, i) => (
        <Path
          key={`grid-${i}`}
          d={buildGridPath(cx, cy, maxR, n, level)}
          fill="none"
          stroke={darkTheme.border}
          strokeWidth={i === gridLevels.length - 1 ? 1 : 0.5}
          strokeDasharray={i < gridLevels.length - 1 ? '3,3' : undefined}
        />
      ))}

      {/* Axis lines from center */}
      {scores.map((_, i) => {
        const { x, y } = radarPoint(cx, cy, maxR, i, n, 10, 10);
        return (
          <Line
            key={`axis-${i}`}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke={darkTheme.border}
            strokeWidth={0.5}
          />
        );
      })}

      {/* Data polygon */}
      <Path
        d={buildPolygonPath(cx, cy, maxR, scores)}
        fill={fill}
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />

      {/* Data points */}
      {scores.map((s, i) => {
        const { x, y } = radarPoint(cx, cy, maxR, i, n, s.score, 10);
        const color = getScoreColor(s.score);
        return (
          <G key={`pt-${i}`}>
            <Circle cx={x} cy={y} r={3} fill={color} />
            <Circle cx={x} cy={y} r={4.5} fill="none" stroke={color} strokeWidth={0.5} opacity={0.4} />
          </G>
        );
      })}

      {/* Axis labels */}
      {scores.map((s, i) => {
        const labelR = maxR + 28;
        const { x, y } = radarPoint(cx, cy, labelR, i, n, 10, 10);
        const textAnchor = x < cx - 5 ? 'end' : x > cx + 5 ? 'start' : 'middle';
        const scoreColor = getScoreColor(s.score);
        // Cap label to 6 chars to prevent SVG overflow (e.g. ANTIFRAGILE → ANTI)
        const rawLabel = s.shortLabel.toUpperCase();
        const displayLabel = rawLabel.length > 6 ? rawLabel.slice(0, 4) : rawLabel;

        return (
          <G key={`lbl-${i}`}>
            <SvgText
              x={x}
              y={y - 5}
              fill={darkTheme.textMuted}
              fontSize={10}
              fontFamily="Inter"
              fontWeight={600}
              textAnchor={textAnchor as 'start' | 'middle' | 'end'}
            >
              {displayLabel}
            </SvgText>
            <SvgText
              x={x}
              y={y + 8}
              fill={scoreColor}
              fontSize={9}
              fontFamily="Inter"
              fontWeight={700}
              textAnchor={textAnchor as 'start' | 'middle' | 'end'}
            >
              {`${s.score}/10`}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
};
