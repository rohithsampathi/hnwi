/**
 * PdfSectionHeader — Shared PDF section header primitive
 * Replaces duplicated header patterns across 14 PDF components
 *
 * Uses: darkTheme, typography, colors from pdf-styles (no local StyleSheet)
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { darkTheme, colors, typography } from '../../pdf-styles';

interface PdfSectionHeaderProps {
  title: string;
  badge?: string;
  subtitle?: string;
  accentColor?: string;
}

export const PdfSectionHeader: React.FC<PdfSectionHeaderProps> = ({
  title,
  badge,
  subtitle,
  accentColor = colors.amber[500],
}) => (
  <View
    style={{
      marginBottom: 20,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: darkTheme.border,
    }}
    minPresenceAhead={150}
  >
    <View
      style={{
        width: 24,
        height: 3,
        backgroundColor: accentColor,
        marginBottom: 8,
      }}
    />
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <Text
        style={{
          ...typography.h2,
          color: darkTheme.textPrimary,
          flexShrink: 1,
          maxWidth: '70%',
        }}
      >
        {title}
      </Text>
      {badge && (
        <View
          style={{
            marginLeft: 12,
            borderWidth: 1,
            borderColor: darkTheme.textFaint,
            paddingHorizontal: 8,
            paddingVertical: 3,
          }}
        >
          <Text
            style={{
              ...typography.micro,
              color: darkTheme.textMuted,
              fontSize: 8.5,
              letterSpacing: 1,
            }}
          >
            {badge}
          </Text>
        </View>
      )}
    </View>
    {subtitle && (
      <Text
        style={{
          ...typography.small,
          color: darkTheme.textMuted,
          marginTop: 4,
        }}
      >
        {subtitle}
      </Text>
    )}
  </View>
);
