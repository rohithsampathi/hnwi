/**
 * HORIZONTAL BAR
 * Tax rate comparison bar (red=current vs green=optimized)
 */

import React from 'react';
import {
  Svg,
  Rect,
  Text as SvgText,
} from '@react-pdf/renderer';
import { colors, darkTheme } from '../../pdf-styles';

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
      <Rect x="0" y="0" width={String(Math.max(currentW, 2))} height={String(barH)} rx="2" fill={colors.red[400]} />
      {/* Optimized rate bar (green) */}
      <Rect x="0" y={String(barH + gap)} width={String(width)} height={String(barH)} rx="2" fill={darkTheme.surfaceBg} />
      <Rect x="0" y={String(barH + gap)} width={String(Math.max(optimizedW, 2))} height={String(barH)} rx="2" fill={colors.emerald[400]} />
      {/* Labels */}
      <SvgText x={String(width + 4)} y={String(barH - 1)} fontSize="7" fontFamily="Inter" fontWeight={700} fill={colors.red[600]}>
        {`${currentRate}%`}
      </SvgText>
      <SvgText x={String(width + 4)} y={String(barH + gap + barH - 1)} fontSize="7" fontFamily="Inter" fontWeight={700} fill={colors.emerald[600]}>
        {`${optimizedRate}%`}
      </SvgText>
    </Svg>
  );
};
