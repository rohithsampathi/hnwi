/**
 * PDF FONT REGISTRATION — Inter Font Family
 * Matches the web UI's Inter font system for visual parity
 *
 * IMPORTANT: This file must be imported BEFORE any PDF component renders.
 * Import it at the top of PatternAuditDocument.tsx.
 *
 * Built-in fallbacks kept for mono: Courier / Courier-Bold
 */

import { Font } from '@react-pdf/renderer';

// ─── Register Inter from local public/fonts/ ─────────────────────────────────
// Files served by Next.js from the public directory
Font.register({
  family: 'Inter',
  fonts: [
    { src: '/fonts/Inter-Regular.ttf', fontWeight: 400, fontStyle: 'normal' },
    { src: '/fonts/Inter-Medium.ttf', fontWeight: 500, fontStyle: 'normal' },
    { src: '/fonts/Inter-SemiBold.ttf', fontWeight: 600, fontStyle: 'normal' },
    { src: '/fonts/Inter-Bold.ttf', fontWeight: 700, fontStyle: 'normal' },
  ],
});

// ─── Disable auto-hyphenation ─────────────────────────────────────────────────
// Prevents mid-word breaks like "RE-QUIRED", "CRE-ATION"
Font.registerHyphenationCallback(word => [word]);
