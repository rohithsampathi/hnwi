/**
 * VERDICT STAMP
 * Large verdict with colored ring -- the centerpiece of the verdict page
 */

import React from 'react';
import {
  Svg,
  Circle,
  Text as SvgText,
} from '@react-pdf/renderer';
import { darkTheme } from '../../pdf-styles';
import { VerdictTheme, getVerdictTheme } from '../../pdf-verdict-theme';

interface VerdictStampProps {
  verdict: string;
  score?: number;
  size?: number;
  theme?: VerdictTheme;
}

export const VerdictStamp: React.FC<VerdictStampProps> = ({
  verdict,
  score,
  size = 140,
  theme,
}) => {
  const t = theme || getVerdictTheme(verdict);
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 4;
  const innerR = outerR - 6;

  const upperVerdict = verdict.toUpperCase();
  const hasScore = score !== undefined;

  // Split long multi-word verdicts into two lines
  const shouldSplit = upperVerdict.includes(' ') && upperVerdict.length > 10;
  let lines: string[];
  if (shouldSplit) {
    // Split at the space closest to the middle for balanced lines
    const mid = Math.floor(upperVerdict.length / 2);
    const spaces = [...upperVerdict.matchAll(/ /g)].map((m) => m.index!);
    const splitIdx = spaces.reduce((best, idx) =>
      Math.abs(idx - mid) < Math.abs(best - mid) ? idx : best
    , spaces[0]);
    lines = [upperVerdict.slice(0, splitIdx), upperVerdict.slice(splitIdx + 1)];
  } else {
    lines = [upperVerdict];
  }

  // Determine font size based on text length and whether we split
  const longestLine = Math.max(...lines.map((l) => l.length));
  const fontSize = shouldSplit
    ? size * 0.085
    : longestLine > 12
      ? size * 0.1
      : longestLine > 8
        ? size * 0.12
        : size * 0.15;

  const lineHeight = fontSize * 1.25;

  // Calculate vertical positions so text block is centered in the circle
  // Text block consists of: verdict lines + optional score
  const scoreSize = size * 0.2;
  const scoreLineHeight = scoreSize * 1.1;
  const scoreGap = hasScore ? fontSize * 0.4 : 0; // gap between verdict text and score
  const totalTextHeight = lines.length * lineHeight
    + (hasScore ? scoreGap + scoreLineHeight * 0.6 : 0);
  // Start y so the block is vertically centered (offset by ~0.35em for baseline)
  const blockStartY = cy - totalTextHeight / 2 + fontSize * 0.35;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Outer ring */}
      <Circle cx={String(cx)} cy={String(cy)} r={String(outerR)} fill="none" stroke={t.primary} strokeWidth="3" />
      {/* Inner ring */}
      <Circle cx={String(cx)} cy={String(cy)} r={String(innerR)} fill="none" stroke={t.light} strokeWidth="1" />
      {/* Verdict text — one or two lines */}
      {lines.map((line, i) => (
        <SvgText
          key={i}
          x={String(cx)}
          y={String(blockStartY + i * lineHeight)}
          textAnchor="middle"
          style={{ fontSize, fontFamily: 'Inter', fontWeight: 700, fill: t.primary }}
        >
          {line}
        </SvgText>
      ))}
      {/* Optional score */}
      {hasScore && (
        <SvgText
          x={String(cx)}
          y={String(blockStartY + lines.length * lineHeight + scoreGap + scoreLineHeight * 0.3)}
          textAnchor="middle"
          style={{ fontSize: scoreSize, fontFamily: 'Inter', fontWeight: 700, fill: darkTheme.textPrimary }}
        >
          {String(Math.round(score!))}
        </SvgText>
      )}
    </Svg>
  );
};
