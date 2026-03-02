/**
 * GRADIENT DIVIDER
 * Fade-from-edges line replacing flat gray borders
 */

import React from 'react';
import {
  Svg,
  Rect,
  Defs,
  LinearGradient,
  Stop,
} from '@react-pdf/renderer';
import { darkTheme } from '../../pdf-styles';

interface GradientDividerProps {
  width?: number;
  height?: number;
  color?: string;
}

export const GradientDivider: React.FC<GradientDividerProps> = ({
  width = 480,
  height = 1,
  color = darkTheme.gold,
}) => (
  <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
    <Defs>
      <LinearGradient id="gdiv" x1="0" y1="0" x2={String(width)} y2="0">
        <Stop offset="0%" stopColor={color} stopOpacity="0" />
        <Stop offset="20%" stopColor={color} stopOpacity="1" />
        <Stop offset="80%" stopColor={color} stopOpacity="1" />
        <Stop offset="100%" stopColor={color} stopOpacity="0" />
      </LinearGradient>
    </Defs>
    <Rect x="0" y="0" width={String(width)} height={String(height)} fill="url(#gdiv)" />
  </Svg>
);
