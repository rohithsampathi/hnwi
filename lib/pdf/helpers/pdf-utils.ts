/**
 * PDF utility functions shared across PDF components
 * Extracted from PatternAuditDocument.tsx
 */

import { formatCurrency } from '../pdf-styles';

/**
 * Safe text helper - ensures all values passed to Text components are strings
 * CRITICAL: Never returns [object Object]
 */
export const safeText = (value: unknown, fallback: string = ''): string => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if (obj.display && typeof obj.display !== 'object') return String(obj.display);
    if (obj.formatted && typeof obj.formatted !== 'object') return String(obj.formatted);
    if (obj.value && typeof obj.value !== 'object') return String(obj.value);
    if (obj.label && typeof obj.label !== 'object') return String(obj.label);
    if (obj.name && typeof obj.name !== 'object') return String(obj.name);
    if (obj.text && typeof obj.text !== 'object') return String(obj.text);
    if (obj.title && typeof obj.title !== 'object') return String(obj.title);
    if (obj.description && typeof obj.description !== 'object') return String(obj.description);

    if (typeof obj.amount === 'number') return formatCurrency(obj.amount);
    if (typeof obj.total === 'number') return formatCurrency(obj.total);
    if (typeof obj.value === 'number') return formatCurrency(obj.value);

    for (const key of Object.keys(obj)) {
      const v = obj[key];
      if (typeof v === 'string' && v.length > 0 && v.length < 100) return v;
      if (typeof v === 'number') return String(v);
    }

    return fallback;
  }

  return fallback;
};

/**
 * Safe array helper - ensures we always have an iterable array
 */
export const safeArray = <T>(value: unknown, fallback: T[] = []): T[] => {
  if (Array.isArray(value)) return value as T[];
  return fallback;
};

/**
 * Parse markdown bold **text** to segments for PDF rendering
 */
export const parseMarkdownBold = (text: string): Array<{ text: string; bold: boolean }> => {
  const segments: Array<{ text: string; bold: boolean }> = [];
  const regex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), bold: false });
    }
    segments.push({ text: match[1], bold: true });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), bold: false });
  }

  return segments.length > 0 ? segments : [{ text, bold: false }];
};

/**
 * Truncate text to max length with ellipsis
 */
export const truncateText = (text: string, maxLength: number = 200): string => {
  if (!text || text.length <= maxLength) return text || '';
  return text.slice(0, maxLength - 3) + '...';
};
