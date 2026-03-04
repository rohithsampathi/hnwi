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
import path from 'path';

// ─── Register Inter from local public/fonts/ ─────────────────────────────────
// Absolute filesystem paths required for server-side rendering in API routes
const fontsDir = path.join(process.cwd(), 'public', 'fonts');

Font.register({
  family: 'Inter',
  fonts: [
    { src: path.join(fontsDir, 'Inter-Regular.ttf'), fontWeight: 400, fontStyle: 'normal' },
    { src: path.join(fontsDir, 'Inter-Medium.ttf'), fontWeight: 500, fontStyle: 'normal' },
    { src: path.join(fontsDir, 'Inter-SemiBold.ttf'), fontWeight: 600, fontStyle: 'normal' },
    { src: path.join(fontsDir, 'Inter-Bold.ttf'), fontWeight: 700, fontStyle: 'normal' },
  ],
});

// ─── Disable auto-hyphenation ─────────────────────────────────────────────────
// Prevents mid-word breaks like "RE-QUIRED", "CRE-ATION"
Font.registerHyphenationCallback(word => [word]);
