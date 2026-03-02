/**
 * GRADIENT ACCENT BAR
 * 4px accent bar with verdict-colored gradient
 */

import React from 'react';
import {
  Svg,
  Rect,
  Defs,
  LinearGradient,
  Stop,
} from '@react-pdf/renderer';
import { VerdictTheme, getVerdictTheme } from '../../pdf-verdict-theme';

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
