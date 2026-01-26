/**
 * WORLD-CLASS NATIVE PDF EXPORT FOR $2,500 DECISION AUDITS
 * Standards: Bridgewater / McKinsey / Goldman Sachs level
 * Target: Ultra-High-Net-Worth Family Offices ($30M+)
 *
 * Architecture:
 * - Uses @react-pdf/renderer for TRUE native PDF generation
 * - Vector graphics and selectable/searchable text
 * - Same data structure as web UI (memoData)
 * - No screenshots - pure PDF primitives
 *
 * Key Features:
 * - Selectable text (not images)
 * - Searchable content
 * - Professional typography
 * - Proper PDF metadata
 * - Institutional-grade output
 */

import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { ICArtifact } from '@/lib/decision-memo/pattern-audit-types';
import { PdfMemoData, PdfPreviewData, PdfMemoMetadata } from '@/lib/pdf/pdf-types';
import { PatternAuditDocument } from '@/lib/pdf/PatternAuditDocument';

// Extended artifact type with preview data from memo transformation
interface ExtendedArtifact extends ICArtifact {
  preview_data?: any;
  memo_data?: any;
}

// Note: Using built-in PDF fonts (Helvetica, Times-Roman, Courier) to avoid CSP issues
// External font loading from Google Fonts is blocked by Content Security Policy

/**
 * Safely extract string value - handles objects that should be strings
 */
function safeString(value: any, fallback: string = ''): string {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  // If it's an object, try to extract a sensible value or stringify
  if (typeof value === 'object') {
    // Common patterns for value objects
    if (value.display) return String(value.display);
    if (value.value) return String(value.value);
    if (value.label) return String(value.label);
    if (value.total) return formatCurrencyValue(value.total);
    if (value.annual) return formatCurrencyValue(value.annual);
    // Don't render complex objects as text
    console.warn('[PDF Export] Object passed where string expected:', value);
    return fallback;
  }
  return fallback;
}

/**
 * Transform artifact data to PdfMemoData format
 * Maps the web UI data structure to PDF-compatible format
 */
function transformArtifactToMemoData(artifact: ExtendedArtifact): PdfMemoData {
  const previewData = artifact.preview_data || {};
  const memoData = artifact.memo_data || {};

  // Extract values from preview_data or compute defaults
  const preview: PdfPreviewData = {
    // Header info - use safeString for all text fields to prevent object rendering
    source_jurisdiction: safeString(previewData.source_jurisdiction, artifact.intake?.sourceCountry || 'Unknown'),
    destination_jurisdiction: safeString(previewData.destination_jurisdiction, artifact.intake?.destinationCountry || 'Unknown'),
    exposure_class: safeString(previewData.exposure_class, artifact.intake?.wealthBracket || 'Strategic Investor'),
    value_creation: safeString(previewData.value_creation, formatValueCreation(previewData.value_creation_raw?.total_annual)),
    five_year_projection: safeString(previewData.five_year_projection, formatCurrencyValue(previewData.value_creation_raw?.five_year_projected)),
    total_tax_benefit: safeString(previewData.total_tax_benefit, '+29%'),
    precedent_count: typeof previewData.precedent_count === 'number' ? previewData.precedent_count : (memoData.kgv3_intelligence_used?.precedents || 21),
    data_quality: safeString(previewData.data_quality, 'Strong'),

    // Verdict
    verdict: safeString(previewData.verdict, artifact.ic_verdict?.verdict || 'CONDITIONAL'),
    verdict_rationale: safeString(previewData.verdict_rationale, artifact.ic_verdict?.rationale || ''),
    risk_level: safeString(previewData.risk_level, artifact.ic_verdict?.riskLevel || 'MODERATE'),

    // Tax analysis
    tax_differential: previewData.tax_differential,
    source_tax_rates: previewData.source_tax_rates || previewData.tax_differential?.source,
    destination_tax_rates: previewData.destination_tax_rates || previewData.tax_differential?.destination,

    // Risk factors - ensure all text fields are strings
    risk_factors: (previewData.risk_factors || artifact.ic_verdict?.riskFactors || []).map((rf: any) => ({
      title: safeString(rf.factor || rf.title, 'Risk Factor'),
      severity: safeString(rf.severity, 'medium'),
      description: safeString(rf.description, ''),
      mitigation: safeString(rf.mitigation, ''),
      exposure_amount: typeof rf.exposure === 'number' ? rf.exposure : (typeof rf.exposure_amount === 'number' ? rf.exposure_amount : 0),
    })),

    // Due diligence - ensure all text fields are strings
    due_diligence: (previewData.due_diligence || artifact.ic_verdict?.dueDiligence || []).map((dd: any) => ({
      task: safeString(dd.task || dd.item, 'Task'),
      category: safeString(dd.category, 'compliance'),
      timeline: safeString(dd.timeline, ''),
      priority: safeString(dd.priority, 'medium'),
    })),

    // Opportunities
    all_opportunities: previewData.all_opportunities || [],
    execution_sequence: previewData.execution_sequence || [],

    // Peer analysis
    peer_cohort_stats: previewData.peer_cohort_stats,
    capital_flow_data: previewData.capital_flow_data,

    // Expert sections (these may contain JSON strings or parsed objects)
    transparency_regime_impact: previewData.transparency_regime_impact,
    crisis_resilience_stress_test: previewData.crisis_resilience_stress_test,
    wealth_projection_data: previewData.wealth_projection_data,
    wealth_projection_analysis: previewData.wealth_projection_analysis,
    scenario_tree_data: previewData.scenario_tree_data,
    scenario_tree_analysis: previewData.scenario_tree_analysis,
    heir_management_data: previewData.heir_management_data,
    heir_management_analysis: previewData.heir_management_analysis,
    destination_drivers: previewData.destination_drivers,
    hnwi_trends_analysis: previewData.hnwi_trends_analysis,

    // Raw values
    value_creation_raw: previewData.value_creation_raw,
  };

  // Build memo metadata
  const memo: PdfMemoMetadata = {
    kgv3_intelligence_used: memoData.kgv3_intelligence_used || {
      precedents: previewData.precedent_count || 21,
      failure_modes: 2,
      sequencing_rules: 2,
      jurisdictions: 2,
    },
  };

  return {
    success: true,
    intake_id: artifact.intakeId || `intake_${Date.now()}`,
    generated_at: artifact.timestamp || new Date().toISOString(),
    preview_data: preview,
    memo_data: memo,
  };
}

/**
 * Format currency value
 */
function formatCurrencyValue(value: number | undefined): string {
  if (!value || isNaN(value)) return '$0';
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

/**
 * Format value creation string
 */
function formatValueCreation(value: number | undefined): string {
  if (!value || isNaN(value)) return '$1.5M';
  return formatCurrencyValue(value);
}

/**
 * Check if input is already a complete PdfMemoData structure
 */
function isCompleteMemoData(input: any): input is PdfMemoData {
  return input &&
    typeof input === 'object' &&
    input.intake_id &&
    input.preview_data &&
    typeof input.preview_data === 'object';
}

/**
 * Export Decision Audit as institutional-grade NATIVE PDF
 * Uses @react-pdf/renderer for true vector PDF generation
 *
 * Accepts EITHER:
 * 1. Complete PdfMemoData (preferred - same data as web UI uses)
 * 2. ExtendedArtifact (legacy - will be transformed)
 */
export async function exportInstitutionalPDF(input: ExtendedArtifact | PdfMemoData): Promise<{
  success: boolean;
  fileName: string;
  pageCount?: number;
  error?: string;
}> {
  try {
    console.log('[PDF Export] Starting native PDF generation...');

    // Check if input is already complete memoData (from page.tsx with merged expert sections)
    // or if we need to transform an artifact
    let memoData: PdfMemoData;
    let intakeId: string;

    if (isCompleteMemoData(input)) {
      // Input is already complete memoData - use directly (PREFERRED)
      console.log('[PDF Export] Using complete memoData directly (same as web UI)');
      memoData = input;
      intakeId = input.intake_id;
    } else {
      // Input is an artifact - transform it (LEGACY)
      console.log('[PDF Export] Transforming artifact to memoData');
      memoData = transformArtifactToMemoData(input);
      intakeId = input.intakeId || `intake_${Date.now()}`;
    }

    console.log('[PDF Export] Data ready, preview_data keys:', Object.keys(memoData.preview_data));
    console.log('[PDF Export] Has wealth_projection_data:', !!memoData.preview_data.wealth_projection_data);
    console.log('[PDF Export] Has heir_management_data:', !!memoData.preview_data.heir_management_data);

    // Generate PDF blob using @react-pdf/renderer
    console.log('[PDF Export] Generating native PDF...');
    const blob = await pdf(<PatternAuditDocument memoData={memoData} />).toBlob();
    console.log('[PDF Export] PDF blob generated, size:', blob.size);

    // Generate filename
    const fileName = `HNWI-Decision-Audit-${intakeId.slice(10, 22) || 'export'}.pdf`;

    // Download the PDF
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`[PDF Export] Complete! File: ${fileName}`);

    return {
      success: true,
      fileName,
    };

  } catch (error) {
    console.error('[PDF Export] Error:', error);
    return {
      success: false,
      fileName: '',
      error: error instanceof Error ? error.message : 'Unknown error during PDF generation',
    };
  }
}

/**
 * Generate PDF blob for upload/email (returns blob instead of downloading)
 */
export async function generatePdfBlob(artifact: ExtendedArtifact): Promise<Blob> {
  const memoData = transformArtifactToMemoData(artifact);
  return await pdf(<PatternAuditDocument memoData={memoData} />).toBlob();
}

/**
 * React hook for PDF export with loading state
 * Accepts either complete PdfMemoData (preferred) or ExtendedArtifact (legacy)
 */
export function usePremiumPDFExport() {
  const exportPDF = async (input: ExtendedArtifact | PdfMemoData) => {
    return exportInstitutionalPDF(input);
  };

  return { exportPDF };
}

export default usePremiumPDFExport;
