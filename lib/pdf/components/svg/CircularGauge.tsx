/**
 * CIRCULAR GAUGE
 * Arc gauge for scores (0-100), inspired by premium dashboards
 */

import React from 'react';
import {
  Svg,
  Path,
  Circle,
  Text as SvgText,
} from '@react-pdf/renderer';
import { darkTheme } from '../../pdf-styles';
import { VerdictTheme, getVerdictTheme } from '../../pdf-verdict-theme';
import { describeArc, polarToCartesian } from './svg-utils';

interface CircularGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  theme?: VerdictTheme;
  label?: string;
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
        style={{ fontSize: size * 0.28, fontFamily: 'Inter', fontWeight: 700, fill: darkTheme.textPrimary }}
      >
        {String(Math.round(clampedScore))}
      </SvgText>
      {/* Label below score */}
      {label && (
        <SvgText
          x={String(cx)}
          y={String(cy + size * 0.18)}
          textAnchor="middle"
          style={{ fontSize: size * 0.1, fontFamily: 'Inter', fontWeight: 700, fill: darkTheme.textMuted }}
        >
          {label}
        </SvgText>
      )}
    </Svg>
  );
};
