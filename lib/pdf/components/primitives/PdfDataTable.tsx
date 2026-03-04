/**
 * PdfDataTable — Shared PDF data table primitive
 * Replaces duplicated table patterns across 14 PDF components
 *
 * Uses: darkTheme, typography, spacing from pdf-styles (no local StyleSheet)
 * Table style: surfaceBg header, alternating pageBg/cardBg rows, border separators
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { darkTheme, typography, spacing, colors } from '../../pdf-styles';

type CellValue =
  | string
  | { text: string; bold?: boolean; color?: string; flex?: number };

interface PdfDataTableProps {
  headers: string[];
  rows: CellValue[][];
  columnWidths?: number[];
  accentColor?: string;
}

const getCellText = (cell: CellValue): string =>
  typeof cell === 'string' ? cell : cell.text;

const getCellFlex = (cell: CellValue, fallback: number): number =>
  typeof cell === 'object' && cell.flex ? cell.flex : fallback;

export const PdfDataTable: React.FC<PdfDataTableProps> = ({
  headers,
  rows,
  columnWidths,
  accentColor = colors.amber[500],
}) => {
  const defaultFlex = 1;

  return (
    <View
      style={{
        width: '100%',
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: darkTheme.border,
        borderRadius: 0.01,
        overflow: 'hidden',
      }}
    >
      {/* Header row with accent top border */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: darkTheme.surfaceBg,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          borderTopWidth: 3,
          borderTopColor: accentColor,
        }}
      >
        {headers.map((header, idx) => (
          <Text
            key={idx}
            style={{
              flex: columnWidths ? columnWidths[idx] : defaultFlex,
              ...typography.micro,
              color: darkTheme.textPrimary,
            }}
          >
            {header}
          </Text>
        ))}
      </View>

      {/* Data rows — alternating backgrounds */}
      {rows.map((row, rowIdx) => (
        <View
          key={rowIdx}
          style={{
            flexDirection: 'row',
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            borderBottomWidth: rowIdx < rows.length - 1 ? 1 : 0,
            borderBottomColor: darkTheme.borderSubtle,
            backgroundColor:
              rowIdx % 2 === 0 ? darkTheme.pageBg : darkTheme.cardBg,
          }}
        >
          {row.map((cell, cellIdx) => {
            const isBold =
              typeof cell === 'object' && cell.bold;
            const cellColor =
              typeof cell === 'object' && cell.color
                ? cell.color
                : darkTheme.textSecondary;
            const flex = columnWidths
              ? columnWidths[cellIdx]
              : getCellFlex(cell, defaultFlex);

            return (
              <Text
                key={cellIdx}
                style={{
                  flex,
                  ...typography.small,
                  color: cellColor,
                  fontWeight: isBold ? 700 : 400,
                  fontFamily: 'Inter',
                }}
              >
                {getCellText(cell)}
              </Text>
            );
          })}
        </View>
      ))}
    </View>
  );
};
