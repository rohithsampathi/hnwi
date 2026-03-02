/**
 * PDF Page Chrome - Header and Footer for every page
 * Consistent institutional branding across all PDF pages
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { darkTheme } from '../pdf-styles';

function getStyles() {
  return {
    header: {
      position: 'absolute' as const,
      top: 24,
      left: 48,
      right: 48,
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
    },
    headerText: {
      fontFamily: 'Courier',
      fontSize: 8,
      color: darkTheme.textMuted,
      letterSpacing: 0.5,
    },
    footer: {
      position: 'absolute' as const,
      bottom: 24,
      left: 48,
      right: 48,
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      paddingTop: 6,
      borderTopWidth: 0.5,
      borderTopColor: darkTheme.border,
    },
    footerText: {
      fontFamily: 'Courier',
      fontSize: 8,
      color: darkTheme.textMuted,
    },
  };
}

interface PageHeaderProps {
  referenceId?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ referenceId }) => {
  const styles = getStyles();
  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>
        {referenceId ? `REF: ${referenceId}` : 'HNWI CHRONICLES'}
      </Text>
      <Text style={styles.headerText}>CONFIDENTIAL</Text>
    </View>
  );
};

interface PageFooterProps {
  date?: string;
}

export const PageFooter: React.FC<PageFooterProps> = ({ date }) => {
  const styles = getStyles();
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>HNWI Chronicles — Private Intelligence Division</Text>
      <Text style={styles.footerText}>{date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
    </View>
  );
};
