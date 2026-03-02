/**
 * SPARKLINE CHART
 * Simple line chart for wealth projections
 */

import React from 'react';
import {
  Svg,
  Path,
  Circle,
} from '@react-pdf/renderer';
import { VerdictTheme, getVerdictTheme } from '../../pdf-verdict-theme';

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
