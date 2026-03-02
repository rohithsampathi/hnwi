/**
 * DONUT CHART
 * Generational wealth erosion: G1 -> G2 -> G3
 */

import React from 'react';
import {
  Svg,
  Path,
  Circle,
} from '@react-pdf/renderer';
import { colors, darkTheme } from '../../pdf-styles';
import { describeDonutArc } from './svg-utils';

interface DonutChartProps {
  segments: Array<{
    value: number;
    color: string;
    label?: string;
  }>;
  size?: number;
  strokeWidth?: number;
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
