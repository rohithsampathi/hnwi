/**
 * CONFIDENCE METER
 * 5-bar data quality indicator
 */

import React from 'react';
import {
  Svg,
  Rect,
} from '@react-pdf/renderer';
import { colors, darkTheme } from '../../pdf-styles';
import { VerdictTheme, getVerdictTheme } from '../../pdf-verdict-theme';

interface ConfidenceMeterProps {
  level: number; // 1-5
  size?: number;
  theme?: VerdictTheme;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  level,
  size = 60,
  theme,
}) => {
  const t = theme || getVerdictTheme();
  const barCount = 5;
  const barWidth = (size - (barCount - 1) * 2) / barCount;
  const maxH = 20;
  const clampedLevel = Math.max(0, Math.min(barCount, Math.round(level)));

  return (
    <Svg width={size} height={maxH + 2} viewBox={`0 0 ${size} ${maxH + 2}`}>
      {Array.from({ length: barCount }).map((_, i) => {
        const h = maxH * ((i + 1) / barCount);
        const x = i * (barWidth + 2);
        const y = maxH - h;
        const filled = i < clampedLevel;
        return (
          <Rect
            key={i}
            x={String(x)}
            y={String(y + 1)}
            width={String(barWidth)}
            height={String(h)}
            rx="1"
            fill={filled ? t.primary : darkTheme.border}
          />
        );
      })}
    </Svg>
  );
};
