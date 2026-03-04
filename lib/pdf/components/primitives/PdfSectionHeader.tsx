/**
 * PdfSectionHeader — Section header primitive
 *
 * Design: Section headers are the FIRST thing scanned on each page.
 * They must command attention with:
 * - 32px gold accent bar (wider = more authority)
 * - 16pt bold title (visible at mobile zoom levels)
 * - Clear bottom border for section closure
 * - Generous margin below for breathing room
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
      marginBottom: 24,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: darkTheme.border,
    }}
    minPresenceAhead={150}
  >
    <View
      style={{
        width: 32,
        height: 3,
        backgroundColor: accentColor,
        marginBottom: 10,
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
            marginLeft: 14,
            borderWidth: 1,
            borderColor: darkTheme.border,
            paddingHorizontal: 10,
            paddingVertical: 4,
          }}
        >
          <Text
            style={{
              ...typography.micro,
              color: darkTheme.textMuted,
              letterSpacing: 1.2,
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
          marginTop: 6,
        }}
      >
        {subtitle}
      </Text>
    )}
  </View>
);
