/**
 * CORNER ACCENT
 * Refined SVG corner marks for premium framing
 */

import React from 'react';
import {
  Svg,
  Path,
} from '@react-pdf/renderer';
import { darkTheme } from '../../pdf-styles';

interface CornerAccentProps {
  position: 'tl' | 'tr' | 'bl' | 'br';
  size?: number;
  color?: string;
}

export const CornerAccent: React.FC<CornerAccentProps> = ({
  position,
  size = 20,
  color = darkTheme.gold,
}) => {
  const paths: Record<string, string> = {
    tl: `M 0 ${size} L 0 0 L ${size} 0`,
    tr: `M ${size - size} 0 L ${size} 0 L ${size} ${size}`,
    bl: `M 0 0 L 0 ${size} L ${size} ${size}`,
    br: `M 0 ${size} L ${size} ${size} L ${size} 0`,
  };

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Path d={paths[position]} fill="none" stroke={color} strokeWidth="1" />
    </Svg>
  );
};
