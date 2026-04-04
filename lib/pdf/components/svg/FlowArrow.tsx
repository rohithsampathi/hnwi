/**
 * FLOW ARROW
 * Migration corridor arrow with labels (Source -> Destination)
 */

import React from 'react';
import {
  Svg,
  Path,
  Line,
  Text as SvgText,
} from '@react-pdf/renderer';
import { darkTheme } from '../../pdf-styles';
import { VerdictTheme, getVerdictTheme } from '../../pdf-verdict-theme';

interface FlowArrowProps {
  from: string;
  to: string;
  width?: number;
  height?: number;
  theme?: VerdictTheme;
}

export const FlowArrow: React.FC<FlowArrowProps> = ({
  from = '',
  to = '',
  width = 210,
  height = 36,
  theme,
}) => {
  const t = theme || getVerdictTheme();
  const arrowY = height / 2;
  const arrowHeadSize = 6;

  // Estimate text widths: ~5.5px per char at 10pt Inter bold, plus small padding
  const CHAR_WIDTH = 5.5;
  const fromLabel = from || 'Source';
  const toLabel = to || 'Destination';
  const fromTextWidth = Math.ceil(fromLabel.length * CHAR_WIDTH);
  const toTextWidth = Math.ceil(toLabel.length * CHAR_WIDTH);
  const labelGap = 10; // gap between label and arrow
  const minArrowLen = 24; // minimum arrow length to remain visible

  const arrowStartX = 4 + fromTextWidth + labelGap;
  // Ensure the "to" label fits within the SVG: arrow ends at width - toTextWidth - labelGap
  const arrowEndX = width - toTextWidth - labelGap;

  // If there isn't enough room for the arrow, compress proportionally
  const arrowLen = arrowEndX - arrowStartX;
  const effectiveStartX = arrowLen >= minArrowLen ? arrowStartX : arrowStartX;
  const effectiveEndX = arrowLen >= minArrowLen ? arrowEndX : arrowStartX + minArrowLen;
  const toLabelX = effectiveEndX + labelGap - 2;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* From label */}
      <SvgText x="4" y={String(arrowY + 4)} style={{ fontSize: 10, fontFamily: 'Inter', fontWeight: 700, fill: darkTheme.textPrimary }}>
        {fromLabel}
      </SvgText>
      {/* Arrow line */}
      <Line
        x1={String(effectiveStartX)}
        y1={String(arrowY)}
        x2={String(effectiveEndX - arrowHeadSize)}
        y2={String(arrowY)}
        stroke={t.primary}
        strokeWidth="2"
      />
      {/* Arrow head */}
      <Path
        d={`M ${effectiveEndX - arrowHeadSize} ${arrowY - arrowHeadSize} L ${effectiveEndX} ${arrowY} L ${effectiveEndX - arrowHeadSize} ${arrowY + arrowHeadSize}`}
        fill="none"
        stroke={t.primary}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* To label */}
      <SvgText
        x={String(toLabelX)}
        y={String(arrowY + 4)}
        style={{ fontSize: 10, fontFamily: 'Inter', fontWeight: 700, fill: darkTheme.textPrimary }}
      >
        {toLabel}
      </SvgText>
    </Svg>
  );
};
