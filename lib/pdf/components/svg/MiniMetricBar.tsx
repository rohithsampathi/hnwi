/**
 * MINI METRIC BAR
 * Simple single-color progress bar for inline metrics
 */

import React from 'react';
import {
  Svg,
  Rect,
} from '@react-pdf/renderer';
import { colors, darkTheme } from '../../pdf-styles';

interface MiniMetricBarProps {
  value: number; // 0-100
  width?: number;
  height?: number;
  color?: string;
}

export const MiniMetricBar: React.FC<MiniMetricBarProps> = ({
  value,
  width = 80,
  height = 6,
  color = colors.amber[500],
}) => {
  const clamped = Math.max(0, Math.min(100, value));
  const fillW = (clamped / 100) * width;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Rect x="0" y="0" width={String(width)} height={String(height)} rx="3" fill={darkTheme.border} />
      <Rect x="0" y="0" width={String(Math.max(fillW, 2))} height={String(height)} rx="3" fill={color} />
    </Svg>
  );
};
