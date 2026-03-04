/**
 * DONUT CHART
 * Generational wealth erosion: G1 -> G2 -> G3
 */

import React from 'react';
import {
  Svg,
  Path,
  Circle,
  Text as SvgText,
} from '@react-pdf/renderer';
import { colors, darkTheme } from '../../pdf-styles';
import { describeDonutArc } from './svg-utils';
import { polarToCartesian } from './svg-utils';

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
  // Pre-calculate midpoints for labels
  const labelData = segments.map((seg) => {
    const startPct = accumulated / total;
    accumulated += seg.value;
    const endPct = accumulated / total;
    const midPct = (startPct + endPct) / 2;
    const midAngle = midPct * 360 - 90; // -90 to start at top
    return { startPct, endPct, midAngle };
  });
  accumulated = 0; // Reset for rendering

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Track */}
      <Circle cx={String(cx)} cy={String(cy)} r={String(r)} fill="none" stroke={darkTheme.border} strokeWidth={String(strokeWidth)} />
      {/* Segments + labels */}
      {segments.map((seg, i) => {
        const startPct = accumulated / total;
        accumulated += seg.value;
        const endPct = accumulated / total;
        const { midAngle } = labelData[i];
        const labelPos = polarToCartesian(cx, cy, r, midAngle);
        return (
          <React.Fragment key={i}>
            <Path
              d={describeDonutArc(cx, cy, r, startPct, endPct)}
              fill="none"
              stroke={seg.color}
              strokeWidth={String(strokeWidth)}
              strokeLinecap="butt"
            />
            {seg.label && (
              <SvgText
                x={String(labelPos.x)}
                y={String(labelPos.y + 3)}
                textAnchor="middle"
                fontSize={10}
                fontFamily="Inter"
                fontWeight={700}
                fill={darkTheme.textPrimary}
              >
                {seg.label}
              </SvgText>
            )}
          </React.Fragment>
        );
      })}
    </Svg>
  );
};
