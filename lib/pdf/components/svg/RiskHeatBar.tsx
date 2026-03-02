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
import { colors } from '../../pdf-styles';

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
    { count: critical, color: colors.red[500], label: 'CRITICAL' },
    { count: high, color: colors.red[300], label: 'HIGH' },
    { count: medium, color: colors.amber[400], label: 'MEDIUM' },
    { count: low, color: colors.emerald[400], label: 'LOW' },
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
