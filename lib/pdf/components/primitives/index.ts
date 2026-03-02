/**
 * PDF Primitives — Barrel export
 * Shared @react-pdf/renderer components replacing duplicated patterns
 * across 14 PDF section files.
 *
 * All primitives use darkTheme/typography/spacing/colors from pdf-styles
 * with inline styles only (no local StyleSheet.create calls).
 */

export { PdfSectionHeader } from './PdfSectionHeader';
export { PdfMetricGrid } from './PdfMetricGrid';
export { PdfDataTable } from './PdfDataTable';
export { PdfCard } from './PdfCard';
export { PdfBadge } from './PdfBadge';
export { PdfGroundedNote } from './PdfGroundedNote';
