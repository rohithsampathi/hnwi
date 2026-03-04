/**
 * PdfGroundedNote — Shared PDF intelligence source note primitive
 * Replaces duplicated "Source: ..." footer patterns across PDF components
 *
 * Uses: darkTheme, typography, spacing, colors from pdf-styles (no local StyleSheet)
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { darkTheme, typography, spacing, colors } from '../../pdf-styles';

interface PdfGroundedNoteProps {
  source: string;
}

export const PdfGroundedNote: React.FC<PdfGroundedNoteProps> = ({ source }) => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.lg,
      padding: spacing.md,
      backgroundColor: darkTheme.cardBg,
      borderRadius: 0.01,
      borderWidth: 1,
      borderColor: darkTheme.border,
    }}
  >
    <View
      style={{
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.amber[500],
        marginRight: spacing.sm,
      }}
    />
    <Text
      style={{
        ...typography.micro,
        color: darkTheme.textMuted,
        fontSize: 9,
      }}
    >
      Source: {source}
    </Text>
  </View>
);
