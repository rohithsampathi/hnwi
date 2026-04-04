/**
 * RISK HEAT BAR
 * Multi-segment bar showing distribution of critical/high/medium/low
 */

import React from 'react';
import {
  Svg,
  Rect,
  G,
  Text as SvgText,
} from '@react-pdf/renderer';
import { colors, darkTheme } from '../../pdf-styles';

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
    <Svg width={width} height={height + 16} viewBox={`0 0 ${width} ${height + 16}`}>
      {segments.map((seg, i) => {
        const w = (seg.count / total) * width;
        const rx = x;
        x += w;
        // Only show label if segment is wide enough to fit it (~6px per char)
        const labelText = `${seg.count} ${seg.label}`;
        const showLabel = w > labelText.length * 5;
        const shortLabel = showLabel ? labelText : `${seg.count}`;
        return (
          <G key={i}>
            <Rect x={String(rx)} y="0" width={String(w)} height={String(height)} fill={seg.color} />
            <SvgText
              x={String(rx + w / 2)}
              y={String(height + 12)}
              textAnchor="middle"
              style={{ fontSize: 9, fontFamily: 'Inter', fontWeight: 700, fill: seg.color }}
            >
              {shortLabel}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
};
