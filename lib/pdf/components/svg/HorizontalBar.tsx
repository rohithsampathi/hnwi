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
  const labelWidth = 44; // space for percentage labels
  const totalWidth = width + labelWidth;

  return (
    <Svg width={totalWidth} height={height} viewBox={`0 0 ${totalWidth} ${height}`}>
      {/* Source rate bar (gold) */}
      <Rect x="0" y="0" width={String(width)} height={String(barH)} rx="2" fill={darkTheme.surfaceBg} />
      <Rect x="0" y="0" width={String(Math.max(currentW, 2))} height={String(barH)} rx="2" fill={colors.amber[500]} />
      {/* Destination rate bar (muted) */}
      <Rect x="0" y={String(barH + gap)} width={String(width)} height={String(barH)} rx="2" fill={darkTheme.surfaceBg} />
      <Rect x="0" y={String(barH + gap)} width={String(Math.max(optimizedW, 2))} height={String(barH)} rx="2" fill={darkTheme.textFaint} />
      {/* Labels */}
      <SvgText x={String(width + 6)} y={String(barH - 1)} style={{ fontSize: 9, fontFamily: 'Inter', fontWeight: 700, fill: colors.amber[500] }}>
        {`${currentRate}%`}
      </SvgText>
      <SvgText x={String(width + 6)} y={String(barH + gap + barH - 1)} style={{ fontSize: 9, fontFamily: 'Inter', fontWeight: 700, fill: darkTheme.textFaint }}>
        {`${optimizedRate}%`}
      </SvgText>
    </Svg>
  );
};
