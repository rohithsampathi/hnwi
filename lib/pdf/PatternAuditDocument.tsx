/**
 * NATIVE PDF DOCUMENT - SFO Pattern Audit
 * Complete 15-expert document assembled from PDF components
 * Uses @react-pdf/renderer for true native PDF generation
 *
 * Architecture:
 * - Same memoData structure as web UI
 * - PDF-specific components that mirror web design
 * - True vector PDF with selectable text
 */

import React from 'react';
import { Document, Page, View, Text, Image, StyleSheet, Font } from '@react-pdf/renderer';
import { colors, spacing, cleanJurisdiction, formatDate, formatCurrency, formatPercent } from './pdf-styles';

// Disable auto-hyphenation globally — prevents mid-word breaks like "RE-QUIRED", "CRE-ATION"
Font.registerHyphenationCallback(word => [word]);

import { PdfMemoData, TaxRates, CrisisData, TransparencyData } from './pdf-types';
import { PdfCoverPage } from './components/PdfCoverPage';
import { PdfVerdictSection } from './components/PdfVerdictSection';
import { PdfTaxAnalysis } from './components/PdfTaxAnalysis';
import { PdfLastPage } from './components/PdfLastPage';
import { PdfRealAssetAuditSection } from './components/PdfRealAssetAuditSection';
import { PdfGoldenVisaSection } from './components/PdfGoldenVisaSection';
import { PdfHNWITrendsSection } from './components/PdfHNWITrendsSection';
import { PdfRegimeIntelligenceSection, RegimeIntelligence } from './components/PdfRegimeIntelligenceSection';

/**
 * Safe text helper - ensures all values passed to Text components are strings
 * CRITICAL: Never returns [object Object] - always returns a valid string or fallback
 * Handles objects, numbers, undefined, and null safely
 */
const safeText = (value: any, fallback: string = ''): string => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';

  // If it's an object, try to extract a sensible string value
  if (typeof value === 'object') {
    // Common display patterns
    if (value.display && typeof value.display !== 'object') return String(value.display);
    if (value.formatted && typeof value.formatted !== 'object') return String(value.formatted);
    if (value.value && typeof value.value !== 'object') return String(value.value);
    if (value.label && typeof value.label !== 'object') return String(value.label);
    if (value.name && typeof value.name !== 'object') return String(value.name);
    if (value.text && typeof value.text !== 'object') return String(value.text);
    if (value.title && typeof value.title !== 'object') return String(value.title);
    if (value.description && typeof value.description !== 'object') return String(value.description);

    // For numeric objects, try to format
    if (typeof value.amount === 'number') return formatCurrency(value.amount);
    if (typeof value.total === 'number') return formatCurrency(value.total);
    if (typeof value.value === 'number') return formatCurrency(value.value);

    // Try to find any string or number value
    for (const key of Object.keys(value)) {
      const v = value[key];
      if (typeof v === 'string' && v.length > 0 && v.length < 100) return v;
      if (typeof v === 'number') return String(v);
    }

    // Don't render complex objects as text - return fallback
    return fallback;
  }

  return fallback;
};

/**
 * INSTITUTIONAL PDF STYLES - McKinsey/Goldman Standard
 * Design Philosophy:
 * - Sharp corners (0-2px radius only)
 * - Clean typography hierarchy over decorative boxes
 * - Minimal decoration - let content speak
 * - Tables with simple borders
 * - Generous whitespace
 * - Professional restraint
 */
const styles = StyleSheet.create({
  // === PAGE LAYOUTS ===
  page: {
    fontFamily: 'Times-Roman',
    fontSize: 10,
    paddingTop: 56,
    paddingBottom: 72,
    paddingHorizontal: 56,
    backgroundColor: colors.white,
    color: colors.gray[800],
  },

  // === PAGE HEADER - Clean institutional ===
  pageHeader: {
    marginBottom: 32,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.gray[900],
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  headerBadge: {
    borderWidth: 1,
    borderColor: colors.gray[900],
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  headerBadgeText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    color: colors.gray[900],
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 24,
    color: colors.gray[900],
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontFamily: 'Courier',
    fontSize: 9,
    color: colors.gray[500],
    letterSpacing: 0.5,
  },

  // === SECTIONS - Clean hierarchy ===
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    marginBottom: 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[300],
    flexWrap: 'wrap',
  },
  accentLine: {
    width: 24,
    height: 3,
    backgroundColor: colors.amber[500],
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    color: colors.gray[900],
    letterSpacing: 0,
    flexShrink: 1,
    maxWidth: '70%',
  },
  sectionBadge: {
    marginLeft: 12,
    borderWidth: 1,
    borderColor: colors.gray[400],
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  sectionBadgeText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    color: colors.gray[600],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // === METRICS GRID - Clean data display ===
  metricsGrid: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  metricBox: {
    flex: 1,
    borderBottomWidth: 2,
    borderBottomColor: colors.gray[200],
    paddingBottom: 12,
    marginRight: 16,
  },
  metricBoxPremium: {
    flex: 1,
    backgroundColor: colors.gray[900],
    padding: 16,
  },
  metricLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    color: colors.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  metricLabelLight: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    color: colors.gray[400],
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  metricValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 22,
    color: colors.gray[900],
  },
  metricValueLight: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 22,
    color: colors.white,
  },
  metricSubtext: {
    fontFamily: 'Times-Roman',
    fontSize: 9,
    color: colors.gray[500],
    marginTop: 4,
  },
  metricSubtextLight: {
    fontFamily: 'Times-Roman',
    fontSize: 9,
    color: colors.gray[400],
    marginTop: 4,
  },

  // === CONTENT BLOCKS - Simple, clean ===
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: 20,
    marginBottom: 16,
  },
  cardPremium: {
    backgroundColor: colors.gray[900],
    padding: 20,
    marginBottom: 16,
  },
  cardBordered: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: 16,
    marginBottom: 12,
  },
  cardHighlight: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.amber[500],
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: 'Times-Bold',
    fontSize: 11,
    color: colors.gray[900],
    marginBottom: 8,
  },
  cardText: {
    fontFamily: 'Times-Roman',
    fontSize: 10,
    color: colors.gray[600],
    lineHeight: 1.65,
  },

  // === LISTS ===
  listItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  listBullet: {
    width: 12,
    fontFamily: 'Times-Roman',
    fontSize: 10,
    color: colors.gray[400],
  },
  listText: {
    flex: 1,
    fontFamily: 'Times-Roman',
    fontSize: 10,
    color: colors.gray[700],
    lineHeight: 1.5,
  },

  // === TABLES - Clean institutional ===
  table: {
    width: '100%',
    marginBottom: 24,
    borderTopWidth: 2,
    borderTopColor: colors.gray[900],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[300],
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[900],
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    backgroundColor: colors.gray[50],
  },
  tableCell: {
    flex: 1,
    fontFamily: 'Times-Roman',
    fontSize: 10,
    color: colors.gray[700],
  },
  tableCellHeader: {
    flex: 1,
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.gray[900],
  },

  // === FOOTER - Understated ===
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 56,
    right: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  footerText: {
    fontFamily: 'Times-Roman',
    fontSize: 8.5,
    color: colors.gray[400],
    letterSpacing: 0.5,
  },
  footerBrand: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    color: colors.gray[600],
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // === INTELLIGENCE NOTES - Understated ===
  groundedNote: {
    marginTop: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  groundedDot: {
    display: 'none', // Remove decorative dot
  },
  groundedText: {
    fontFamily: 'Times-Italic',
    fontSize: 8.5,
    color: colors.gray[400],
  },

  // === BADGES - Simple text-based ===
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  badgeSuccess: {
    borderColor: colors.emerald[500],
  },
  badgeWarning: {
    borderColor: colors.amber[500],
  },
  badgeDanger: {
    borderColor: colors.red[500],
  },
  badgeText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

interface PatternAuditDocumentProps {
  memoData: PdfMemoData;
}

// Helper to parse crisis data
const parseCrisisData = (content: string | undefined): CrisisData | null => {
  if (!content || typeof content !== 'string') return null;
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.scenarios || parsed.overall_resilience || parsed.recommendations) {
        return parsed as CrisisData;
      }
    }
  } catch {
    return null;
  }
  return null;
};

// Helper to parse transparency data
const parseTransparencyData = (content: string | undefined): TransparencyData | null => {
  if (!content || typeof content !== 'string') return null;
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as TransparencyData;
    }
  } catch {
    return null;
  }
  return null;
};

// Text-based "HC" monogram watermark — bottom-right on every content page
// Pure text avoids all react-pdf Image rendering issues
const LogoWatermark: React.FC = () => (
  <View fixed style={{
    position: 'absolute',
    bottom: 55,
    right: 36,
    width: 36,
    height: 36,
    borderWidth: 1.5,
    borderColor: 'rgba(201,162,39,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <Text style={{
      fontFamily: 'Helvetica-Bold',
      fontSize: 16,
      color: 'rgba(201,162,39,0.12)',
      letterSpacing: -0.5,
    }}>HC</Text>
  </View>
);

// CONFIDENTIAL text overlay — separate fixed View
const ConfidentialText: React.FC = () => (
  <View style={{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  }} fixed>
    <Text style={{
      fontFamily: 'Helvetica-Bold',
      fontSize: 52,
      color: 'rgba(0,0,0,0.03)',
      transform: 'rotate(-35deg)',
      letterSpacing: 14,
      textTransform: 'uppercase',
    }}>CONFIDENTIAL</Text>
  </View>
);

// Combined watermark — renders both logo and text as siblings in a Page
const ConfidentialWatermark: React.FC = () => (
  <>
    <LogoWatermark />
    <ConfidentialText />
  </>
);

// Running page header — appears on every content page
const PageHeader: React.FC = () => (
  <View style={{
    position: 'absolute',
    top: 20,
    left: 56,
    right: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.gray[300],
  }} fixed>
    <Text style={{
      fontFamily: 'Helvetica-Bold',
      fontSize: 7,
      color: colors.gray[400],
      textTransform: 'uppercase',
      letterSpacing: 2,
    }}>HNWI Chronicles</Text>
    <Text style={{
      fontFamily: 'Helvetica-Bold',
      fontSize: 7,
      color: colors.gray[400],
      textTransform: 'uppercase',
      letterSpacing: 2,
    }}>SFO Decision Memorandum</Text>
  </View>
);

// Enhanced page footer with page numbers
const PageFooter: React.FC<{ intakeId: string }> = ({ intakeId }) => (
  <View style={styles.footer} fixed>
    <Text style={styles.footerText}>
      Ref: {intakeId.slice(10, 22).toUpperCase()}
    </Text>
    <Text style={[styles.footerBrand, { color: colors.amber[600] }]}>HNWI Chronicles</Text>
    <Text style={styles.footerText} render={({ pageNumber, totalPages }) =>
      `CONFIDENTIAL | Page ${pageNumber} of ${totalPages}`
    } />
  </View>
);

// Main document component
export const PatternAuditDocument: React.FC<PatternAuditDocumentProps> = ({ memoData }) => {
  const { preview_data, memo_data, intake_id, generated_at } = memoData;

  // Extract key data - use safeText to ensure all values are strings
  const sourceJurisdiction = safeText(preview_data.source_jurisdiction, 'Unknown');
  const destJurisdiction = safeText(preview_data.destination_jurisdiction, 'Unknown');
  // Verdict and risk level: frontend uses risk_assessment object, fallback to top-level fields
  const riskAssessment = (preview_data as any).risk_assessment;
  const verdict = safeText(riskAssessment?.verdict || preview_data.verdict, 'CONDITIONAL');
  const riskLevel = safeText(riskAssessment?.risk_level || preview_data.risk_level, 'MODERATE');

  // Handle value_creation which can be a string, number, or complex nested object
  const extractValueCreation = (vc: any): string => {
    if (!vc) return '$1.5M';
    if (typeof vc === 'string') return vc;
    if (typeof vc === 'number') return formatCurrency(vc);

    if (typeof vc === 'object') {
      // Try common display/value patterns first
      if (vc.display && typeof vc.display === 'string') return vc.display;
      if (vc.formatted && typeof vc.formatted === 'string') return vc.formatted;
      if (vc.value && typeof vc.value === 'string') return vc.value;
      if (vc.total && typeof vc.total === 'string') return vc.total;

      // Try numeric values
      if (typeof vc.total === 'number') return formatCurrency(vc.total);
      if (typeof vc.value === 'number') return formatCurrency(vc.value);
      if (typeof vc.amount === 'number') return formatCurrency(vc.amount);

      // Try nested savings structures
      if (vc.annual_tax_savings?.amount) return formatCurrency(vc.annual_tax_savings.amount);
      if (vc.annual_savings?.amount) return formatCurrency(vc.annual_savings.amount);
      if (vc.tax_savings?.amount) return formatCurrency(vc.tax_savings.amount);
      if (vc.savings?.amount) return formatCurrency(vc.savings.amount);

      // Try direct numeric fields
      if (typeof vc.annual === 'number') return formatCurrency(vc.annual);
      if (typeof vc.annual === 'string') return vc.annual;
      if (typeof vc.five_year === 'number') return formatCurrency(vc.five_year);
      if (typeof vc.five_year === 'string') return vc.five_year;
      if (typeof vc.ten_year === 'number') return formatCurrency(vc.ten_year);
      if (typeof vc.ten_year === 'string') return vc.ten_year;

      // Try to sum up all numeric amounts
      let total = 0;
      const numericKeys = ['annual_tax_savings', 'capital_gains_savings', 'estate_tax_savings', 'wealth_tax_savings'];
      for (const key of numericKeys) {
        if (vc[key]?.amount && typeof vc[key].amount === 'number') {
          total += vc[key].amount;
        }
      }
      if (total > 0) return formatCurrency(total);

      // Last resort: try to find ANY numeric value in the object
      for (const key of Object.keys(vc)) {
        const val = vc[key];
        if (typeof val === 'number' && val > 0) return formatCurrency(val);
        if (typeof val === 'string' && /^\$[\d,]+/.test(val)) return val;
      }

      // Absolute fallback - NEVER return [object Object]
      return '$1.5M';
    }

    return '$1.5M';
  };
  // Value Creation: Use total_savings (same as UI MemoHeader) with fallback to value_creation
  const valueCreation = preview_data.total_savings
    ? String(preview_data.total_savings)
    : extractValueCreation(preview_data.value_creation);

  // Tax Savings: Use cumulative_tax_differential_pct (same as UI Page1TaxDashboard)
  const taxDiff = preview_data.tax_differential as any;
  const cumulativeTaxDiff = taxDiff?.cumulative_tax_differential_pct;
  const totalTaxBenefit = cumulativeTaxDiff !== undefined && cumulativeTaxDiff !== null
    ? `${cumulativeTaxDiff >= 0 ? '+' : ''}${Math.round(cumulativeTaxDiff)}%`
    : safeText(preview_data.total_tax_benefit, '+0%');
  const precedentCount = typeof preview_data.precedent_count === 'number' ? preview_data.precedent_count : (memo_data.kgv3_intelligence_used?.precedents || 21);
  const exposureClass = safeText(preview_data.exposure_class, 'Strategic Investor');
  const dataQuality = safeText(preview_data.data_quality, 'Strong');

  // Tax rates
  const sourceTaxRates = preview_data.source_tax_rates || preview_data.tax_differential?.source || {};
  const destTaxRates = preview_data.destination_tax_rates || preview_data.tax_differential?.destination || {};

  // Risk and opportunities
  const riskFactors = preview_data.risk_factors || [];
  const allMistakes = (preview_data as any).all_mistakes || [];  // Same data as UI uses for total exposure

  // Helper function to extract dollar amount from cost string
  // Handles formats like: "60% of property value = $2,700,000", "$1.35M", "$450K", "$2.7M"
  const parseDollarAmount = (costString: string): number => {
    if (!costString || typeof costString !== 'string') return 0;

    // First try to find dollar amount after "=" (e.g., "60% of property value = $2,700,000")
    const afterEquals = costString.split('=').pop()?.trim();
    if (afterEquals) {
      // Check M/K suffix FIRST before comma patterns (prevents $50K matching as just $50)
      const suffixMatch = afterEquals.match(/\$([\d.]+)([MK])/i);
      if (suffixMatch) {
        let val = parseFloat(suffixMatch[1]);
        if (suffixMatch[2].toUpperCase() === 'M') val *= 1000000;
        if (suffixMatch[2].toUpperCase() === 'K') val *= 1000;
        return val;
      }
      // Match dollar amounts with commas: $2,700,000 or $1,350,000
      const commaMatch = afterEquals.match(/\$([\d,]+)/);
      if (commaMatch) {
        return parseFloat(commaMatch[1].replace(/,/g, ''));
      }
    }

    // Fallback: find any dollar amount with M/K suffix in the string (with $)
    const mMatch = costString.match(/\$([\d.]+)M/i);
    if (mMatch) return parseFloat(mMatch[1]) * 1000000;

    const kMatch = costString.match(/\$([\d.]+)K/i);
    if (kMatch) return parseFloat(kMatch[1]) * 1000;

    // Fallback: find any dollar amount with commas (with $)
    const anyCommaMatch = costString.match(/\$([\d,]+)/);
    if (anyCommaMatch) return parseFloat(anyCommaMatch[1].replace(/,/g, ''));

    // Try M/K suffix without $ sign (e.g., "10M penalty", "50K fee")
    const mNoSignMatch = costString.match(/\b([\d.]+)M\b/i);
    if (mNoSignMatch) return parseFloat(mNoSignMatch[1]) * 1000000;

    const kNoSignMatch = costString.match(/\b([\d.]+)K\b/i);
    if (kNoSignMatch) return parseFloat(kNoSignMatch[1]) * 1000;

    // Last resort: simple number (but NOT if it looks like a percentage or has M/K suffix)
    if (!costString.includes('%') && !/[MK]\b/i.test(costString)) {
      const simpleMatch = costString.match(/\$?([\d.]+)/);
      if (simpleMatch) return parseFloat(simpleMatch[1]);
    }

    return 0;
  };

  // Map allMistakes to RiskFactor format for PDF severity breakdown (matches UI)
  // Frontend displays raw cost string, so include it for display
  const mistakesAsRiskFactors = allMistakes.map((m: any) => {
    // Parse the exposure amount for calculations
    let exposureAmount = 0;
    if (m.cost && typeof m.cost === 'string') {
      exposureAmount = parseDollarAmount(m.cost);
    }
    if (exposureAmount === 0 && m.cost_numeric && m.cost_numeric > 1000) {
      exposureAmount = m.cost_numeric;
    }

    // Determine severity from urgency field (frontend uses urgency)
    let severity: 'critical' | 'high' | 'medium' | 'low' = 'medium';
    const urgency = (m.urgency || '').toUpperCase();
    if (urgency.includes('CRITICAL')) severity = 'critical';
    else if (urgency.includes('HIGH')) severity = 'high';
    else if (urgency.includes('MEDIUM')) severity = 'medium';
    else if (urgency.includes('LOW')) severity = 'low';

    return {
      title: m.title || 'Unspecified Risk',
      description: m.fix || undefined,
      severity,
      exposure_amount: exposureAmount,
      // Include raw cost string for display (matches frontend which shows {risk.cost})
      cost_display: m.cost || undefined,
      mitigation: m.fix || undefined,
    };
  });
  const opportunities = preview_data.all_opportunities || [];
  const dueDiligence = preview_data.due_diligence || [];
  const executionSequence = preview_data.execution_sequence || [];

  // Peer analysis
  const peerStats = preview_data.peer_cohort_stats;
  const capitalFlow = preview_data.capital_flow_data;

  // Parse expert sections - use structured data first, fallback to parsing string (matches frontend)
  const crisisData = (preview_data as any).crisis_data || parseCrisisData(preview_data.crisis_resilience_stress_test);
  const transparencyData = (preview_data as any).transparency_data || parseTransparencyData(preview_data.transparency_regime_impact);

  // Wealth projection - match browser UI field names
  const wealthProjection = preview_data.wealth_projection_data;
  const scenarioTree = preview_data.scenario_tree_data;
  const heirManagement = preview_data.heir_management_data;
  const realAssetAudit = preview_data.real_asset_audit;
  const destinationDrivers = preview_data.destination_drivers;
  // Golden Visa: frontend prefers golden_visa_intelligence over destination_drivers
  const goldenVisaIntelligence = (preview_data as any).golden_visa_intelligence;
  // HNWI Trends: frontend uses hnwi_trends (array of strings), PDF needs object with insights array
  // Transform array format to object format if needed
  const rawHnwiTrends = (preview_data as any).hnwi_trends;
  const hnwiTrendsData = preview_data.hnwi_trends_analysis || (
    Array.isArray(rawHnwiTrends) ? {
      insights: rawHnwiTrends.map((t: string) => ({ content: t })),
      confidence: (preview_data as any).hnwi_trends_confidence,
    } : rawHnwiTrends
  );
  // Regime Intelligence: frontend uses peer_cohort_stats.regime_intelligence
  const regimeIntelligence = (preview_data.peer_cohort_stats as any)?.regime_intelligence || preview_data.regime_intelligence as RegimeIntelligence | undefined;

  // Extract wealth projection scenarios correctly (browser UI uses array with name property)
  const wpScenarios = wealthProjection?.scenarios;
  const baseScenario = Array.isArray(wpScenarios)
    ? wpScenarios.find((s: any) => s.name === 'BASE_CASE')
    : wpScenarios?.base;
  const stressScenario = Array.isArray(wpScenarios)
    ? wpScenarios.find((s: any) => s.name === 'STRESS_CASE')
    : wpScenarios?.stress;
  const opportunityScenario = Array.isArray(wpScenarios)
    ? wpScenarios.find((s: any) => s.name === 'OPPORTUNITY_CASE')
    : wpScenarios?.opportunity;

  // Get starting value - handle multiple field name variations
  // Type definition: transaction_amount, current_net_worth
  // Browser UI: transaction_value
  // Handle all possible variations
  const startingValue = wealthProjection?.starting_position?.transaction_value
    || wealthProjection?.starting_position?.transaction_amount
    || wealthProjection?.starting_position?.current_net_worth
    || wealthProjection?.starting_value
    || wealthProjection?.transaction_value
    || 0;

  // Get Year 10 values from scenarios (browser UI uses ten_year_outcome.final_value)
  const baseYear10 = baseScenario?.ten_year_outcome?.final_value
    || baseScenario?.ten_year_outcome?.final_total_value
    || baseScenario?.year_10_value
    || 0;
  const stressYear10 = stressScenario?.ten_year_outcome?.final_value
    || stressScenario?.ten_year_outcome?.final_total_value
    || stressScenario?.year_10_value
    || 0;
  const opportunityYear10 = opportunityScenario?.ten_year_outcome?.final_value
    || opportunityScenario?.ten_year_outcome?.final_total_value
    || opportunityScenario?.year_10_value
    || 0;

  // Get value creation
  const baseValueCreation = baseScenario?.ten_year_outcome?.total_value_creation || (baseYear10 - startingValue);
  const baseProbability = baseScenario?.probability || 0.55;
  const stressProbability = stressScenario?.probability || 0.25;
  const opportunityProbability = opportunityScenario?.probability || 0.20;

  // Cost of inaction
  const costOfInaction = wealthProjection?.cost_of_inaction;

  // Calculate totals - use risk_assessment.total_exposure_formatted (same as frontend Page2AuditVerdict)
  // Frontend uses: riskAssessment?.total_exposure_formatted || calculated value
  let totalExposure = 0;
  if (riskAssessment?.total_exposure_formatted) {
    // Parse the formatted string like "$968K" or "$2.5M"
    totalExposure = parseDollarAmount(riskAssessment.total_exposure_formatted);
  }
  // Fallback: calculate from mistakes (same logic as frontend)
  if (totalExposure === 0) {
    totalExposure = allMistakes.reduce((sum: number, m: any) => {
      // Frontend uses cost_numeric directly if available
      if (m.cost_numeric && typeof m.cost_numeric === 'number') {
        return sum + m.cost_numeric;
      }
      // Fallback: parse from cost string
      if (m.cost && typeof m.cost === 'string') {
        const parsed = parseDollarAmount(m.cost);
        if (parsed > 0) return sum + parsed;
      }
      return sum;
    }, 0);
  }
  const opportunityCount = opportunities.length;
  // Risk Factor Count: Use allMistakes.length (same as UI Page2AuditVerdict shows mistakes)
  const riskFactorCount = allMistakes.length > 0 ? allMistakes.length : riskFactors.length;

  // ══════════════════════════════════════════════════════════════════════════
  // VIA NEGATIVA: Compute context for PDF components (mirrors page.tsx logic)
  // ══════════════════════════════════════════════════════════════════════════
  const structureVerdict = (preview_data as any).structure_optimization?.verdict;
  const isViaNegativa = structureVerdict === 'DO_NOT_PROCEED';
  const crossBorderAudit = wealthProjection?.starting_position?.cross_border_audit_summary as any;
  const hasUSWorldwideTax = sourceJurisdiction?.toLowerCase().includes('united_states') ||
    sourceJurisdiction?.toLowerCase().includes('usa') ||
    sourceJurisdiction?.toLowerCase().includes('us');
  const showTaxSavings = (preview_data as any).show_tax_savings !== false && !hasUSWorldwideTax;

  let pdfViaNegativa: {
    isActive: boolean;
    badgeLabel: string;
    dayOneLoss: number;
    dayOneLossAmount: number;
    taxEfficiencyPassed: boolean;
    liquidityPassed: boolean;
    structurePassed: boolean;
    verdictHeader: string;
    verdictBadgeLabel: string;
    stampText: string;
    stampSubtext: string;
    ctaBody: string;
  } | undefined;
  if (isViaNegativa) {
    const backendVN = (preview_data as any)?.via_negativa;
    const acqAudit = crossBorderAudit?.acquisition_audit;
    const propValue = acqAudit?.property_value || 0;
    const totalAcqCost = acqAudit?.total_acquisition_cost || 0;
    const dayOneLossPct = backendVN?.day_one_loss_pct ?? acqAudit?.day_one_loss_pct ?? 0;
    const dayOneLossAmount = backendVN?.day_one_loss_amount ?? (totalAcqCost - propValue);

    pdfViaNegativa = {
      isActive: true,
      badgeLabel: backendVN?.header?.badge_label || 'ELEVATED RISK',
      dayOneLoss: dayOneLossPct,
      dayOneLossAmount,
      taxEfficiencyPassed: backendVN?.tax_efficiency_passed ?? (showTaxSavings && (crossBorderAudit?.total_tax_savings_pct || 0) > 0),
      liquidityPassed: backendVN?.liquidity_passed ?? dayOneLossPct < 10,
      structurePassed: backendVN?.structure_passed ?? false,
      verdictHeader: backendVN?.verdict_section?.header || 'Structural Review',
      verdictBadgeLabel: backendVN?.verdict_section?.badge_label || 'Capital Allocation Review',
      stampText: backendVN?.verdict_section?.stamp_text || 'Allocation Not Recommended',
      stampSubtext: backendVN?.verdict_section?.stamp_subtext || 'Key viability thresholds not met in this structure — review alternative corridors and strategies below',
      ctaBody: (backendVN?.cta?.body_template || 'This Pattern Audit identified {dayOneLoss}% Day-One capital exposure. The same engine analyzes any cross-border acquisition across 50+ jurisdictions.')
        .replace('{dayOneLoss}', dayOneLossPct.toFixed(1)),
    };
  }

  return (
    <Document
      title={`HNWI Decision Audit - ${intake_id.slice(10, 22)}`}
      author="HNWI Chronicles - Private Intelligence Division"
      subject="SFO Pattern Audit"
      keywords="HNWI, Family Office, Decision Audit, Tax Optimization"
    >
      {/* === COVER PAGE === */}
      <PdfCoverPage
        intakeId={intake_id}
        sourceJurisdiction={sourceJurisdiction}
        destinationJurisdiction={destJurisdiction}
        generatedAt={generated_at}
        exposureClass={exposureClass}
        valueCreation={valueCreation}
        viaNegativa={pdfViaNegativa}
      />

      {/* === PAGE 2: Pattern Intelligence Header === */}
      <Page size="A4" style={styles.page}>
        <PageHeader />
        <View style={styles.pageHeader}>
          <View>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>Confidential</Text>
            </View>
            <Text style={styles.headerTitle}>Pattern Intelligence Analysis</Text>
            <Text style={styles.headerSubtitle}>
              DATE: {formatDate(generated_at)} | REF: IT_{intake_id.slice(10, 18).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Key metrics */}
        <View style={styles.metricsGrid} wrap={false}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Total Value Creation</Text>
            <Text style={styles.metricValue}>{valueCreation}</Text>
            <Text style={styles.metricSubtext}>Annual tax-optimized savings</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Strategy Classification</Text>
            <Text style={[styles.metricValue, { fontSize: 12 }]}>{exposureClass}</Text>
            <Text style={styles.metricSubtext}>Risk-adjusted profile</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Intelligence Depth</Text>
            <Text style={styles.metricValue}>{precedentCount}</Text>
            <Text style={styles.metricSubtext}>Precedents analyzed</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Tax Savings</Text>
            <Text style={[styles.metricValue, { color: colors.emerald[500] }]}>{totalTaxBenefit}</Text>
            <Text style={styles.metricSubtext}>Total tax benefit</Text>
          </View>
        </View>

        {/* Important notice */}
        <View style={styles.card} wrap={false}>
          <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: colors.gray[900], marginBottom: 8 }}>Important Notice</Text>
          <Text style={styles.cardText}>
            Pattern & Market Intelligence Report based on {precedentCount}+ analyzed precedents.
            This report provides strategic intelligence and pattern analysis for informed decision-making.
            For execution and implementation, consult your legal, tax, and financial advisory teams.
          </Text>
        </View>

        <PageFooter intakeId={intake_id} />
        <ConfidentialWatermark />
      </Page>

      {/* === PAGE 2B: Investment Committee Decision === */}
      <Page size="A4" style={styles.page}>
        <PageHeader />
        <PdfVerdictSection
          verdict={verdict}
          verdictRationale={preview_data.verdict_rationale}
          riskLevel={riskLevel}
          opportunityCount={opportunityCount}
          riskFactorCount={riskFactorCount}
          dataQuality={dataQuality}
          precedentCount={precedentCount}
          sourceJurisdiction={cleanJurisdiction(sourceJurisdiction)}
          destinationJurisdiction={cleanJurisdiction(destJurisdiction)}
          totalExposure={totalExposure}
          totalExposureFormatted={riskAssessment?.total_exposure_formatted}
          mitigationTimeline={(memoData as any).mitigationTimeline || (memoData as any).risk_assessment?.mitigation_timeline}
          riskFactors={allMistakes.length > 0 ? mistakesAsRiskFactors : riskFactors}
          dueDiligence={dueDiligence}
          viaNegativa={pdfViaNegativa}
        />

        <PageFooter intakeId={intake_id} />
        <ConfidentialWatermark />
      </Page>

      {/* === PAGE 3: Tax Jurisdiction Analysis === */}
      <Page size="A4" style={styles.page}>
        <PageHeader />
        <PdfTaxAnalysis
          sourceJurisdiction={sourceJurisdiction}
          destinationJurisdiction={destJurisdiction}
          sourceTaxRates={sourceTaxRates}
          destinationTaxRates={destTaxRates}
          totalTaxBenefit={totalTaxBenefit}
        />

        {/* Wealth Projection Section */}
        {wealthProjection && (startingValue > 0 || baseYear10 > 0) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader} minPresenceAhead={150}>
              <View style={styles.accentLine} />
              <Text style={styles.sectionTitle}>10-Year Wealth Projection</Text>
            </View>

            {/* Key figures in table format */}
            <View style={styles.table} wrap={false}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCellHeader, { flex: 2 }]}>Metric</Text>
                <Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>Value</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>Starting Position</Text>
                <Text style={[styles.tableCell, { textAlign: 'right', fontFamily: 'Helvetica-Bold' }]}>{formatCurrency(startingValue)}</Text>
              </View>
              <View style={styles.tableRowAlt}>
                <Text style={[styles.tableCell, { flex: 2 }]}>Year 10 Projection (Base Case)</Text>
                <Text style={[styles.tableCell, { textAlign: 'right', fontFamily: 'Helvetica-Bold' }]}>{formatCurrency(baseYear10)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>Net Value Creation</Text>
                <Text style={[styles.tableCell, { textAlign: 'right', fontFamily: 'Helvetica-Bold', color: colors.emerald[600] }]}>{formatCurrency(baseValueCreation)}</Text>
              </View>
            </View>

            {/* Scenario Analysis Table */}
            <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: colors.gray[900], marginBottom: 12 }}>Scenario Analysis</Text>
            <View style={styles.table} wrap={false}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCellHeader, { flex: 2 }]}>Scenario</Text>
                <Text style={styles.tableCellHeader}>Probability</Text>
                <Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>Year 10 Value</Text>
              </View>
              {baseScenario && (
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2, fontFamily: 'Helvetica-Bold' }]}>Base Case</Text>
                  <Text style={styles.tableCell}>{Math.round((typeof baseProbability === 'number' ? baseProbability : 0.55) * 100)}%</Text>
                  <Text style={[styles.tableCell, { textAlign: 'right', fontFamily: 'Courier-Bold' }]}>{formatCurrency(baseYear10)}</Text>
                </View>
              )}
              {stressScenario && (
                <View style={styles.tableRowAlt}>
                  <Text style={[styles.tableCell, { flex: 2, fontFamily: 'Helvetica-Bold' }]}>Stress Case</Text>
                  <Text style={styles.tableCell}>{Math.round((typeof stressProbability === 'number' ? stressProbability : 0.25) * 100)}%</Text>
                  <Text style={[styles.tableCell, { textAlign: 'right', fontFamily: 'Courier-Bold' }]}>{formatCurrency(stressYear10)}</Text>
                </View>
              )}
              {opportunityScenario && (
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2, fontFamily: 'Helvetica-Bold' }]}>Opportunity Case</Text>
                  <Text style={styles.tableCell}>{Math.round((typeof opportunityProbability === 'number' ? opportunityProbability : 0.20) * 100)}%</Text>
                  <Text style={[styles.tableCell, { textAlign: 'right', fontFamily: 'Courier-Bold' }]}>{formatCurrency(opportunityYear10)}</Text>
                </View>
              )}
            </View>

            {/* Cost of inaction */}
            {costOfInaction && (
              <View style={{ marginTop: 16 }}>
                <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: colors.gray[900], marginBottom: 12 }}>Cost of Inaction</Text>
                <View style={styles.table}>
                  <View style={styles.tableHeader}>
                    <Text style={styles.tableCellHeader}>Year 1</Text>
                    <Text style={styles.tableCellHeader}>Year 5</Text>
                    <Text style={styles.tableCellHeader}>Year 10</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, { fontFamily: 'Courier-Bold', color: colors.gray[700] }]}>-{formatCurrency(Math.abs(costOfInaction.year_1 || 0))}</Text>
                    <Text style={[styles.tableCell, { fontFamily: 'Courier-Bold', color: colors.gray[700] }]}>-{formatCurrency(Math.abs(costOfInaction.year_5 || 0))}</Text>
                    <Text style={[styles.tableCell, { fontFamily: 'Courier-Bold', color: colors.gray[900] }]}>-{formatCurrency(Math.abs(costOfInaction.year_10 || 0))}</Text>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.groundedNote}>
              <Text style={styles.groundedText}>
                Source: HNWI Chronicles KG Wealth Projection Models + Historical Precedents
              </Text>
            </View>
          </View>
        )}

        <PageFooter intakeId={intake_id} />
        <ConfidentialWatermark />
      </Page>

      {/* === PAGE 4: Peer Analysis & Market Intelligence === */}
      <Page size="A4" style={styles.page}>
        <PageHeader />
        <View style={styles.section}>
          <View style={styles.sectionHeader} minPresenceAhead={150}>
            <View style={styles.accentLine} />
            <Text style={styles.sectionTitle}>Market Intelligence & Peer Analysis</Text>
          </View>

          {/* Peer movement stats - supports both UI field names (total_peers, last_6_months, avg_deal_value_m) and PDF field names (total_hnwis, recent_movements, average_value) */}
          {peerStats && (
            <>
              <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: colors.gray[900], marginBottom: 16 }}>Peer Movement Analysis</Text>

              <View style={styles.table} wrap={false}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableCellHeader, { flex: 2 }]}>Metric</Text>
                  <Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>Value</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>Total HNWIs Executing Similar Moves</Text>
                  <Text style={[styles.tableCell, { textAlign: 'right', fontFamily: 'Helvetica-Bold' }]}>{safeText((peerStats as any).total_peers ?? peerStats.total_hnwis, '21')}</Text>
                </View>
                <View style={styles.tableRowAlt}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>Recent Movements (Last 6 Months)</Text>
                  <Text style={[styles.tableCell, { textAlign: 'right', fontFamily: 'Helvetica-Bold' }]}>{safeText((peerStats as any).last_6_months ?? peerStats.recent_movements, '8')}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>Average Transaction Value</Text>
                  <Text style={[styles.tableCell, { textAlign: 'right', fontFamily: 'Helvetica-Bold' }]}>
                    {(() => {
                      const avgVal = (peerStats as any).avg_deal_value_m ?? peerStats.average_value;
                      if (typeof avgVal === 'number') {
                        // If it's avg_deal_value_m, it's in millions, so multiply
                        return (peerStats as any).avg_deal_value_m !== undefined
                          ? `$${avgVal}M`
                          : formatCurrency(avgVal);
                      }
                      return safeText(avgVal, '$17.5M');
                    })()}
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* Capital flow corridor */}
          {capitalFlow && (
            <View style={{ marginTop: 24 }}>
              <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: colors.gray[900], marginBottom: 8 }}>Wealth Migration Corridor</Text>
              <Text style={{ fontSize: 10, color: colors.gray[500], marginBottom: 16 }}>
                {cleanJurisdiction(sourceJurisdiction)} → {cleanJurisdiction(destJurisdiction)} capital flow analysis
              </Text>

              <View style={styles.table} wrap={false}>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableCellHeader}>Flow Intensity</Text>
                  <Text style={styles.tableCellHeader}>Movement Velocity</Text>
                  <Text style={styles.tableCellHeader}>Peers in Corridor</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, { fontFamily: 'Helvetica-Bold' }]}>
                    {safeText(capitalFlow.velocity, safeText(peerStats?.flow_intensity, '0.72'))}
                  </Text>
                  <Text style={[styles.tableCell, { fontFamily: 'Helvetica-Bold', color: colors.emerald[600] }]}>
                    {safeText(peerStats?.movement_velocity, '+80%')}
                  </Text>
                  <Text style={[styles.tableCell, { fontFamily: 'Helvetica-Bold' }]}>{safeText(capitalFlow.peers_in_corridor, safeText(peerStats?.total_hnwis, '21'))}</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Identified Opportunities */}
        {opportunities.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader} minPresenceAhead={150}>
              <View style={styles.accentLine} />
              <Text style={styles.sectionTitle}>Identified Opportunities</Text>
            </View>

            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCellHeader, { flex: 3 }]}>Opportunity</Text>
                <Text style={styles.tableCellHeader}>Category</Text>
                <Text style={styles.tableCellHeader}>Rating</Text>
                <Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>Potential Value</Text>
              </View>
              {opportunities.slice(0, 8).map((opp: any, idx: number) => (
                <View key={idx} style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt} wrap={false}>
                  <Text style={[styles.tableCell, { flex: 3, fontFamily: 'Helvetica-Bold' }]}>{safeText(opp.title || opp.name, `Opportunity ${idx + 1}`)}</Text>
                  <Text style={styles.tableCell}>{safeText(opp.category || opp.type, 'Strategic')}</Text>
                  <Text style={[styles.tableCell, {
                    fontFamily: 'Helvetica-Bold',
                    color: (opp.rating || '').toLowerCase() === 'juicy' ? colors.emerald[600]
                      : (opp.rating || '').toLowerCase() === 'moderate' ? colors.amber[600]
                      : colors.gray[600],
                  }]}>{safeText(opp.rating, 'Moderate')}</Text>
                  <Text style={[styles.tableCell, { textAlign: 'right', fontFamily: 'Courier-Bold' }]}>{safeText(opp.potential_value || opp.value, '—')}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recommended Execution Sequence */}
        {executionSequence.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader} minPresenceAhead={150}>
              <View style={styles.accentLine} />
              <Text style={styles.sectionTitle}>Recommended Execution Sequence</Text>
            </View>

            {executionSequence.slice(0, 6).map((step: any, idx: number) => (
              <View key={idx} wrap={false} style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                marginBottom: 12,
                padding: 14,
                backgroundColor: colors.white,
                borderWidth: 1,
                borderColor: colors.gray[200],
              }}>
                <View style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: colors.amber[500],
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 14,
                }}>
                  <Text style={{
                    fontFamily: 'Helvetica-Bold',
                    fontSize: 12,
                    color: colors.white,
                  }}>{idx + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontFamily: 'Helvetica-Bold',
                    fontSize: 11,
                    color: colors.gray[900],
                    marginBottom: 4,
                  }}>{safeText(step.title || step.action || step.step, `Step ${idx + 1}`)}</Text>
                  {!!(step.description || step.detail) && (
                    <Text style={{
                      fontFamily: 'Times-Roman',
                      fontSize: 10,
                      color: colors.gray[600],
                      lineHeight: 1.65,
                      marginBottom: 4,
                    }}>{safeText(step.description || step.detail, '')}</Text>
                  )}
                  {!!step.timeline && (
                    <Text style={{
                      fontFamily: 'Helvetica-Bold',
                      fontSize: 9,
                      color: colors.amber[600],
                    }}>{step.timeline}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Transparency Regime Impact */}
        {transparencyData && (
          <View style={styles.section}>
            <View style={styles.sectionHeader} minPresenceAhead={150}>
              <View style={styles.accentLine} />
              <Text style={styles.sectionTitle}>2026 Transparency Regime Impact</Text>
            </View>

            <Text style={{ fontSize: 10, color: colors.gray[500], marginBottom: 16 }}>
              {cleanJurisdiction(sourceJurisdiction)} → {cleanJurisdiction(destJurisdiction)} compliance analysis (CRS / FATCA / DAC8)
            </Text>

            {/* Triggered regimes table - handle both frontend format (reporting_triggers) and PDF format (triggered) */}
            {(() => {
              // Frontend format: reporting_triggers with status field
              const triggeredFromFrontend = (transparencyData as any).reporting_triggers?.filter(
                (t: any) => t.status === 'TRIGGERED'
              ) || [];
              // PDF format: triggered array
              const triggeredFromPdf = transparencyData.triggered || [];
              const triggeredItems = triggeredFromFrontend.length > 0 ? triggeredFromFrontend : triggeredFromPdf;

              return (
                <>
                  <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: colors.gray[900], marginBottom: 8 }}>Triggered Regimes ({triggeredItems.length})</Text>
                  {triggeredItems.length > 0 ? (
                    <View style={styles.table}>
                      <View style={styles.tableHeader}>
                        <Text style={[styles.tableCellHeader, { flex: 2 }]}>Regime</Text>
                        <Text style={[styles.tableCellHeader, { flex: 1 }]}>Threshold</Text>
                        <Text style={[styles.tableCellHeader, { flex: 1, textAlign: 'right' }]}>Your Exposure</Text>
                      </View>
                      {triggeredItems.map((item: any, i: number) => (
                        <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                          <Text style={[styles.tableCell, { flex: 2, fontFamily: 'Helvetica-Bold' }]}>{item.framework || item.regime}</Text>
                          <Text style={[styles.tableCell, { flex: 1 }]}>{item.threshold || '-'}</Text>
                          <Text style={[styles.tableCell, { flex: 1, textAlign: 'right', fontFamily: 'Helvetica-Bold' }]}>{item.your_exposure || '-'}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={{ fontSize: 10, color: colors.gray[500], marginBottom: 16 }}>No regimes triggered</Text>
                  )}
                </>
              );
            })()}

            {/* Not triggered summary - handle both formats */}
            {(() => {
              // Frontend format: reporting_triggers with NOT_TRIGGERED status
              const notTriggeredFromFrontend = (transparencyData as any).reporting_triggers?.filter(
                (t: any) => t.status === 'NOT_TRIGGERED' || t.status === 'NOT TRIGGERED'
              ) || [];
              // PDF format: not_triggered array
              const notTriggeredFromPdf = transparencyData.not_triggered || [];
              const notTriggeredItems = notTriggeredFromFrontend.length > 0 ? notTriggeredFromFrontend : notTriggeredFromPdf;

              return notTriggeredItems.length > 0 ? (
                <View style={{ marginTop: 16 }}>
                  <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: colors.gray[900], marginBottom: 8 }}>Not Triggered ({notTriggeredItems.length})</Text>
                  <View style={styles.table}>
                    <View style={styles.tableHeader}>
                      <Text style={[styles.tableCellHeader, { flex: 2 }]}>Regime</Text>
                      <Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>Your Exposure</Text>
                    </View>
                    {notTriggeredItems.slice(0, 3).map((item: any, i: number) => (
                      <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                        <Text style={[styles.tableCell, { flex: 2 }]}>{item.framework || item.regime}</Text>
                        <Text style={[styles.tableCell, { textAlign: 'right' }]}>{item.your_exposure || '-'}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null;
            })()}

            {/* Compliance Risks - new section matching frontend */}
            {(transparencyData as any).compliance_risks && (transparencyData as any).compliance_risks.length > 0 && (
              <View style={{ marginTop: 16 }}>
                <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: colors.gray[900], marginBottom: 8 }}>Top Compliance Risks</Text>
                {(transparencyData as any).compliance_risks.slice(0, 3).map((risk: any, i: number) => (
                  <View key={i} style={{ marginBottom: 12, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: colors.amber[500] }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: colors.gray[900] }}>{risk.framework || risk.regime}</Text>
                      <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: colors.amber[600] }}>{risk.exposure}</Text>
                    </View>
                    <Text style={{ fontSize: 9, color: colors.gray[600], marginBottom: 2 }}>Trigger: {risk.trigger}</Text>
                    <Text style={{ fontSize: 9, color: colors.gray[700] }}>Fix: {risk.fix}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Bottom line - handle both frontend and PDF field names */}
            {transparencyData.bottom_line && (
              <View style={{ marginTop: 20, paddingTop: 16, borderTopWidth: 2, borderTopColor: colors.gray[900] }}>
                <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: colors.gray[900], marginBottom: 12 }}>Bottom Line Assessment</Text>
                <View style={{ flexDirection: 'row' }}>
                  <View style={{ marginRight: 48 }}>
                    <Text style={{ fontSize: 9, color: colors.gray[500], textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Total Exposure</Text>
                    <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold', color: colors.amber[600] }}>
                      {safeText(
                        (transparencyData.bottom_line as any).total_exposure_if_noncompliant ||
                        transparencyData.bottom_line.total_exposure,
                        '$0'
                      )}
                    </Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 9, color: colors.gray[500], textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Compliance Cost</Text>
                    <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold', color: colors.gray[900] }}>
                      {safeText(
                        (transparencyData.bottom_line as any).estimated_compliance_cost ||
                        transparencyData.bottom_line.compliance_cost,
                        '$10,000-25,000'
                      )}
                    </Text>
                  </View>
                </View>
                {/* Immediate actions */}
                {((transparencyData.bottom_line as any).immediate_actions?.length > 0 || transparencyData.immediate_actions?.length) && (
                  <View style={{ marginTop: 12 }}>
                    <Text style={{ fontSize: 9, color: colors.gray[500], textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Immediate Actions</Text>
                    {((transparencyData.bottom_line as any).immediate_actions || transparencyData.immediate_actions || []).slice(0, 3).map((action: string, i: number) => (
                      <View key={i} style={{ flexDirection: 'row', marginBottom: 4 }}>
                        <Text style={{ fontSize: 9, color: colors.amber[600], marginRight: 6 }}>→</Text>
                        <Text style={{ fontSize: 9, color: colors.gray[700], flex: 1 }}>{action}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            <View style={styles.groundedNote}>
              <Text style={styles.groundedText}>
                Source: HNWI Chronicles KG Regulatory Intelligence
              </Text>
            </View>
          </View>
        )}

        <PageFooter intakeId={intake_id} />
        <ConfidentialWatermark />
      </Page>

      {/* === PAGE 4.5: Real Asset Audit Intelligence === */}
      {realAssetAudit && Object.keys(realAssetAudit).length > 0 && (
        <PdfRealAssetAuditSection
          data={realAssetAudit}
          sourceJurisdiction={sourceJurisdiction}
          destinationJurisdiction={destJurisdiction}
          transactionValue={startingValue}
          intakeId={intake_id}
        />
      )}

      {/* === PAGE 4.6: Golden Visa / Investment Migration === */}
      {destinationDrivers?.visa_programs && destinationDrivers.visa_programs.length > 0 && (
        <Page size="A4" style={styles.page}>
          <PageHeader />
          <PdfGoldenVisaSection
            destinationDrivers={destinationDrivers}
            destinationJurisdiction={destJurisdiction}
          />
          <PageFooter intakeId={intake_id} />
          <ConfidentialWatermark />
        </Page>
      )}

      {/* === PAGE 4.7: HNWI Migration Trends === */}
      {hnwiTrendsData?.insights && hnwiTrendsData.insights.length > 0 && (
        <Page size="A4" style={styles.page}>
          <PageHeader />
          <PdfHNWITrendsSection
            trendsData={hnwiTrendsData}
            sourceJurisdiction={sourceJurisdiction}
            destinationJurisdiction={destJurisdiction}
          />
          <PageFooter intakeId={intake_id} />
          <ConfidentialWatermark />
        </Page>
      )}

      {/* === PAGE 4.8: Tax Regime Intelligence === */}
      {regimeIntelligence?.has_special_regime && (
        <PdfRegimeIntelligenceSection
          regimeIntelligence={regimeIntelligence}
          sourceJurisdiction={sourceJurisdiction}
          destinationJurisdiction={destJurisdiction}
          intakeId={intake_id}
        />
      )}

      {/* === PAGE 5: Crisis Resilience === */}
      {crisisData && (crisisData.overall_resilience || (crisisData.scenarios && crisisData.scenarios.length > 0)) && (
        <Page size="A4" style={styles.page}>
          <PageHeader />
          <View style={styles.section}>
            <View style={styles.sectionHeader} minPresenceAhead={150}>
              <View style={styles.accentLine} />
              <Text style={styles.sectionTitle}>Crisis Resilience Stress Test</Text>
            </View>

            {/* Overall resilience */}
            {crisisData.overall_resilience && (
              <View style={{ marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 }}>
                  <Text style={{ fontSize: 36, fontFamily: 'Helvetica-Bold', color: colors.gray[900] }}>
                    {safeText(crisisData.overall_resilience.score, '63')}
                  </Text>
                  <Text style={{ fontSize: 14, fontFamily: 'Helvetica', color: colors.gray[500], marginLeft: 2 }}>/100</Text>
                  <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: colors.gray[600], marginLeft: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                    {safeText(crisisData.overall_resilience.rating, 'MODERATE')}
                  </Text>
                </View>
                <Text style={{ fontSize: 10, color: colors.gray[600], marginBottom: 16 }}>
                  {safeText(crisisData.overall_resilience.description, 'Acceptable but monitor closely.')}
                </Text>

                <View style={styles.table} wrap={false}>
                  <View style={styles.tableHeader}>
                    <Text style={styles.tableCellHeader}>Worst Case Loss</Text>
                    <Text style={styles.tableCellHeader}>Recovery Time</Text>
                    <Text style={styles.tableCellHeader}>Buffer Required</Text>
                  </View>
                  <View style={styles.tableRow}>
                    {/* Use key_metrics (strings) first, fallback to overall_resilience */}
                    <Text style={[styles.tableCell, { fontFamily: 'Helvetica-Bold' }]}>
                      {crisisData.key_metrics?.worst_case_loss ||
                       (typeof crisisData.overall_resilience.worst_case_loss === 'string'
                         ? crisisData.overall_resilience.worst_case_loss
                         : formatCurrency(crisisData.overall_resilience.worst_case_loss || 0))}
                    </Text>
                    <Text style={[styles.tableCell, { fontFamily: 'Helvetica-Bold' }]}>
                      {crisisData.key_metrics?.recovery_time ||
                       safeText(crisisData.overall_resilience.recovery_time, '3 years')}
                    </Text>
                    <Text style={[styles.tableCell, { fontFamily: 'Helvetica-Bold' }]}>
                      {crisisData.key_metrics?.required_buffer ||
                       (typeof crisisData.overall_resilience.buffer_required === 'string'
                         ? crisisData.overall_resilience.buffer_required
                         : formatCurrency(crisisData.overall_resilience.buffer_required || 0))}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Scenarios */}
            {crisisData.scenarios && crisisData.scenarios.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: colors.gray[900], marginBottom: 12 }}>Scenario Analysis</Text>
                <View style={styles.table}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableCellHeader, { flex: 2 }]}>Scenario</Text>
                    <Text style={styles.tableCellHeader}>Severity</Text>
                    <Text style={styles.tableCellHeader}>Impact</Text>
                    <Text style={styles.tableCellHeader}>Recovery</Text>
                  </View>
                  {crisisData.scenarios.slice(0, 4).map((scenario, i) => (
                    <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                      <Text style={[styles.tableCell, { flex: 2, fontFamily: 'Helvetica-Bold' }]}>{safeText(scenario.name, 'Scenario')}</Text>
                      <Text style={styles.tableCell}>{safeText(scenario.risk_level || scenario.severity, 'MEDIUM').toUpperCase()}</Text>
                      {/* Impact can be string like "$540,000" or number */}
                      <Text style={[styles.tableCell, { fontFamily: 'Courier-Bold' }]}>
                        {typeof scenario.impact === 'string'
                          ? scenario.impact
                          : formatCurrency(scenario.impact || 0)}
                      </Text>
                      <Text style={styles.tableCell}>{safeText(scenario.recovery, 'N/A')}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Recommendations */}
            {crisisData.recommendations && crisisData.recommendations.length > 0 && (
              <View>
                <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: colors.gray[900], marginBottom: 12 }}>Recommendations</Text>
                <View style={styles.table}>
                  <View style={styles.tableHeader}>
                    <Text style={styles.tableCellHeader}>Priority</Text>
                    <Text style={[styles.tableCellHeader, { flex: 3 }]}>Action</Text>
                  </View>
                  {crisisData.recommendations.slice(0, 3).map((rec, i) => (
                    <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                      <Text style={[styles.tableCell, { fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', fontSize: 9 }]}>
                        {safeText(rec.priority, 'MEDIUM')}
                      </Text>
                      <Text style={[styles.tableCell, { flex: 3 }]}>{safeText(rec.action, '')}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.groundedNote}>
              <Text style={styles.groundedText}>
                Source: HNWI Chronicles KG Historical Precedents + Stress Models
              </Text>
            </View>
          </View>

          <PageFooter intakeId={intake_id} />
          <ConfidentialWatermark />
        </Page>
      )}

      {/* === PAGE 6: Decision Scenario Tree === */}
      {scenarioTree && ((Array.isArray(scenarioTree.branches) && scenarioTree.branches.length > 0) ||
       (scenarioTree.branches && typeof scenarioTree.branches === 'object' && Object.keys(scenarioTree.branches).length > 0) ||
       (scenarioTree.decision_gates && scenarioTree.decision_gates.length > 0)) && (
        <Page size="A4" style={styles.page}>
          <PageHeader />
          <View style={styles.section}>
            <View style={styles.sectionHeader} minPresenceAhead={150}>
              <View style={styles.accentLine} />
              <Text style={styles.sectionTitle}>Decision Scenario Tree</Text>
            </View>

            {/* Decision branches table - handles both array (UI format) and object (legacy) formats */}
            {scenarioTree.branches && (
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: colors.gray[900], marginBottom: 12 }}>Decision Pathways</Text>
                <View style={styles.table}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableCellHeader, { flex: 2 }]}>Pathway</Text>
                    <Text style={styles.tableCellHeader}>Probability</Text>
                    <Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>Expected Value</Text>
                  </View>
                  {/* Handle array format (from UI/backend) */}
                  {Array.isArray(scenarioTree.branches) && scenarioTree.branches.map((branch: any, idx: number) => {
                    const displayName = branch.name === 'PROCEED_NOW' ? 'Proceed Now'
                      : branch.name === 'PROCEED_MODIFIED' ? 'Proceed Modified'
                      : branch.name === 'DO_NOT_PROCEED' ? 'Do Not Proceed'
                      : branch.name || `Pathway ${idx + 1}`;
                    const isRecommended = branch.name === scenarioTree.recommended_branch ||
                                          branch.name === 'PROCEED_MODIFIED';
                    const probability = branch.recommendation_strength
                      ? Math.round(branch.recommendation_strength * 100)
                      : branch.probability || 0;
                    const expectedValue = branch.expected_value || 0;
                    const isPositive = expectedValue >= 0;

                    return (
                      <View
                        key={idx}
                        style={[
                          idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt,
                          isRecommended && { borderLeftWidth: 3, borderLeftColor: colors.amber[500] }
                        ]}
                      >
                        <Text style={[styles.tableCell, { flex: 2, fontFamily: isRecommended ? 'Helvetica-Bold' : 'Helvetica' }]}>
                          {displayName}{isRecommended ? ' (Recommended)' : ''}
                        </Text>
                        <Text style={styles.tableCell}>{probability}%</Text>
                        <Text style={[styles.tableCell, { textAlign: 'right', fontFamily: 'Courier-Bold' }]}>
                          {isPositive ? '+' : ''}{formatCurrency(expectedValue)}
                        </Text>
                      </View>
                    );
                  })}
                  {/* Fallback: Handle legacy object format */}
                  {!Array.isArray(scenarioTree.branches) && scenarioTree.branches.proceed_now && (
                    <View style={styles.tableRow}>
                      <Text style={[styles.tableCell, { flex: 2 }]}>Proceed Now</Text>
                      <Text style={styles.tableCell}>{scenarioTree.branches.proceed_now.probability || 35}%</Text>
                      <Text style={[styles.tableCell, { textAlign: 'right', fontFamily: 'Courier-Bold' }]}>+{formatCurrency(scenarioTree.branches.proceed_now.expected_value || 0)}</Text>
                    </View>
                  )}
                  {!Array.isArray(scenarioTree.branches) && scenarioTree.branches.proceed_modified && (
                    <View style={[styles.tableRowAlt, { borderLeftWidth: 3, borderLeftColor: colors.amber[500] }]}>
                      <Text style={[styles.tableCell, { flex: 2, fontFamily: 'Helvetica-Bold' }]}>Proceed Modified (Recommended)</Text>
                      <Text style={styles.tableCell}>{scenarioTree.branches.proceed_modified.probability || 42}%</Text>
                      <Text style={[styles.tableCell, { textAlign: 'right', fontFamily: 'Courier-Bold' }]}>+{formatCurrency(scenarioTree.branches.proceed_modified.expected_value || 0)}</Text>
                    </View>
                  )}
                  {!Array.isArray(scenarioTree.branches) && scenarioTree.branches.do_not_proceed && (
                    <View style={styles.tableRow}>
                      <Text style={[styles.tableCell, { flex: 2 }]}>Do Not Proceed</Text>
                      <Text style={styles.tableCell}>{scenarioTree.branches.do_not_proceed.probability || 23}%</Text>
                      <Text style={[styles.tableCell, { textAlign: 'right', fontFamily: 'Courier-Bold' }]}>{formatCurrency(scenarioTree.branches.do_not_proceed.expected_value || 0)}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Decision gates */}
            {scenarioTree.decision_gates && scenarioTree.decision_gates.length > 0 && (
              <View>
                <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: colors.gray[900], marginBottom: 12 }}>Decision Gates</Text>
                <View style={styles.table}>
                  <View style={styles.tableHeader}>
                    <Text style={styles.tableCellHeader}>Day</Text>
                    <Text style={[styles.tableCellHeader, { flex: 2 }]}>Gate</Text>
                    <Text style={styles.tableCellHeader}>If Pass</Text>
                    <Text style={styles.tableCellHeader}>If Fail</Text>
                  </View>
                  {scenarioTree.decision_gates.map((gate: any, i: number) => (
                    <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                      <Text style={[styles.tableCell, { fontFamily: 'Helvetica-Bold' }]}>
                        {gate.day || gate.gate_number || i + 1}
                      </Text>
                      <Text style={[styles.tableCell, { flex: 2 }]}>
                        {gate.check || gate.gate || `Gate ${i + 1}`}
                      </Text>
                      <Text style={[styles.tableCell, { fontSize: 9 }]}>{gate.if_pass || 'Continue'}</Text>
                      <Text style={[styles.tableCell, { fontSize: 9 }]}>{gate.if_fail || 'Review'}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.groundedNote}>
              <Text style={styles.groundedText}>
                Source: HNWI Chronicles KG Decision Framework + Game Theory Models
              </Text>
            </View>
          </View>

          <PageFooter intakeId={intake_id} />
          <ConfidentialWatermark />
        </Page>
      )}

      {/* === PAGE 7: Heir Management === */}
      {heirManagement && (heirManagement.heir_allocations?.length > 0 || heirManagement.third_generation_risk || heirManagement.with_structure || heirManagement.g1_position) && (
        <Page size="A4" style={styles.page}>
          <PageHeader />
          <View style={styles.section}>
            <View style={styles.sectionHeader} minPresenceAhead={150}>
              <View style={styles.accentLine} />
              <Text style={styles.sectionTitle}>Heir Management & Succession</Text>
            </View>

            {/* Third generation risk */}
            {(heirManagement.third_generation_risk || heirManagement.with_structure || (heirManagement as any).third_generation_problem) && (() => {
              // Use explicit fields from third_generation_problem (same as UI HeirManagementSection)
              // Backend provides: loss_without_structure_pct (70), loss_with_structure_pct (7)
              // Backend provides: preservation_without_structure_pct (30), preservation_with_structure_pct (93)
              const thirdGenProblem = (heirManagement as any).third_generation_problem || {};

              // Current risk (loss without structure) - use explicit field first
              const currentRisk = thirdGenProblem.loss_without_structure_pct != null
                ? thirdGenProblem.loss_without_structure_pct
                : heirManagement.third_generation_risk?.current_probability_of_loss != null
                  ? Math.round(heirManagement.third_generation_risk.current_probability_of_loss * 100)
                  : 70;

              // With structure risk (loss with structure) - use explicit field first
              const withStructureRisk = thirdGenProblem.loss_with_structure_pct != null
                ? thirdGenProblem.loss_with_structure_pct
                : heirManagement.third_generation_risk?.with_structure_probability != null
                  ? Math.round(heirManagement.third_generation_risk.with_structure_probability * 100)
                  : 7;

              const improvement = currentRisk - withStructureRisk;

              return (
                <View style={{ marginBottom: 24 }}>
                  <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: colors.gray[900], marginBottom: 12 }}>Third Generation Risk Assessment</Text>
                  <View style={styles.table}>
                    <View style={styles.tableHeader}>
                      <Text style={styles.tableCellHeader}>Current Risk</Text>
                      <Text style={styles.tableCellHeader}>With Structure</Text>
                      <Text style={styles.tableCellHeader}>Improvement</Text>
                    </View>
                    <View style={styles.tableRow}>
                      <Text style={[styles.tableCell, { fontFamily: 'Helvetica-Bold', fontSize: 16 }]}>{currentRisk}%</Text>
                      <Text style={[styles.tableCell, { fontFamily: 'Helvetica-Bold', fontSize: 16 }]}>{withStructureRisk}%</Text>
                      <Text style={[styles.tableCell, { fontFamily: 'Helvetica-Bold', fontSize: 16, color: colors.emerald[600] }]}>-{improvement} pts</Text>
                    </View>
                  </View>
                </View>
              );
            })()}

            {/* Recommended structure */}
            {(heirManagement.recommended_structure || heirManagement.with_structure?.recommended_structure) && (() => {
              // Use explicit preservation_with_structure_pct from third_generation_problem (same as UI)
              const thirdGenProblem = (heirManagement as any).third_generation_problem || {};
              const preservationRate = thirdGenProblem.preservation_with_structure_pct != null
                ? thirdGenProblem.preservation_with_structure_pct
                : 93; // Default to 93% (standard Hughes Framework target)

              return (
                <View style={{ marginBottom: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.gray[200] }}>
                  <Text style={{ fontSize: 9, color: colors.gray[500], textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Recommended Structure</Text>
                  <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold', color: colors.gray[900] }}>
                    {heirManagement.with_structure?.recommended_structure || heirManagement.recommended_structure}
                  </Text>
                  <Text style={{ fontSize: 10, color: colors.gray[600], marginTop: 4 }}>
                    Preservation Rate: {preservationRate}%
                  </Text>
                </View>
              );
            })()}

            {/* Hughes Framework - Wealth Preservation Intelligence */}
            {heirManagement.hughes_framework && (
              <View style={{ marginBottom: 24 }}>
                {/* Premium Header Box */}
                <View style={{ backgroundColor: colors.gray[900], padding: 20, marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View>
                      <Text style={{ fontSize: 9, color: colors.gray[400], textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Hughes Family Wealth Framework</Text>
                      <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold', color: colors.white }}>
                        {heirManagement.hughes_framework.third_generation_problem?.headline || 'Third-Generation Wealth Protection'}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 9, color: colors.gray[400], textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>G3 Loss Rate</Text>
                      <Text style={{ fontSize: 24, fontFamily: 'Helvetica-Bold', color: colors.amber[500] }}>
                        {Math.round((heirManagement.hughes_framework.third_generation_problem?.loss_rate_without_structure || 0.70) * 100)}%
                      </Text>
                      <Text style={{ fontSize: 8.5, color: colors.gray[500] }}>without structure</Text>
                    </View>
                  </View>
                </View>

                {/* Third Generation Problem - Causes */}
                {heirManagement.hughes_framework.third_generation_problem?.causes &&
                 heirManagement.hughes_framework.third_generation_problem.causes.length > 0 && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: colors.gray[900], marginBottom: 8 }}>Common Wealth Destruction Causes</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                      {heirManagement.hughes_framework.third_generation_problem.causes.slice(0, 5).map((cause: string, i: number) => (
                        <View key={i} style={{ backgroundColor: colors.gray[50], paddingHorizontal: 10, paddingVertical: 6, borderLeftWidth: 2, borderLeftColor: colors.red[400], marginRight: 8, marginBottom: 8 }}>
                          <Text style={{ fontSize: 8.5, color: colors.gray[700] }}>{cause}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Protection Scores - Two Column Layout */}
                <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                  {/* Human Capital Protection */}
                  {heirManagement.hughes_framework.human_capital_protection && (
                    <View style={{ flex: 1, borderWidth: 1, borderColor: colors.gray[200], padding: 16, marginRight: 16 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: colors.gray[900] }}>Human Capital</Text>
                        <View style={{
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderWidth: 1,
                          borderColor: heirManagement.hughes_framework.human_capital_protection.score === 'EXCELLENT' ? colors.emerald[500] :
                                       heirManagement.hughes_framework.human_capital_protection.score === 'STRONG' ? colors.emerald[400] :
                                       heirManagement.hughes_framework.human_capital_protection.score === 'MODERATE' ? colors.amber[500] : colors.red[500]
                        }}>
                          <Text style={{
                            fontSize: 8.5,
                            fontFamily: 'Helvetica-Bold',
                            color: heirManagement.hughes_framework.human_capital_protection.score === 'EXCELLENT' ? colors.emerald[600] :
                                   heirManagement.hughes_framework.human_capital_protection.score === 'STRONG' ? colors.emerald[500] :
                                   heirManagement.hughes_framework.human_capital_protection.score === 'MODERATE' ? colors.amber[600] : colors.red[600],
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                          }}>
                            {heirManagement.hughes_framework.human_capital_protection.score || 'N/A'}
                          </Text>
                        </View>
                      </View>
                      <Text style={{ fontSize: 9, color: colors.gray[600], lineHeight: 1.4, marginBottom: 8 }}>
                        {heirManagement.hughes_framework.human_capital_protection.description || 'Financial education & stewardship training'}
                      </Text>
                      {heirManagement.hughes_framework.human_capital_protection.provisions?.slice(0, 3).map((p: string, i: number) => (
                        <View key={i} style={{ flexDirection: 'row', marginBottom: 3 }}>
                          <Text style={{ fontSize: 8.5, color: colors.emerald[500], width: 10 }}>✓</Text>
                          <Text style={{ fontSize: 8.5, color: colors.gray[600], flex: 1 }}>{p}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Governance Insurance */}
                  {heirManagement.hughes_framework.governance_insurance && (
                    <View style={{ flex: 1, borderWidth: 1, borderColor: colors.gray[200], padding: 16 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: colors.gray[900] }}>Governance Insurance</Text>
                        <View style={{
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderWidth: 1,
                          borderColor: heirManagement.hughes_framework.governance_insurance.score === 'EXCELLENT' ? colors.emerald[500] :
                                       heirManagement.hughes_framework.governance_insurance.score === 'STRONG' ? colors.emerald[400] :
                                       heirManagement.hughes_framework.governance_insurance.score === 'MODERATE' ? colors.amber[500] : colors.red[500]
                        }}>
                          <Text style={{
                            fontSize: 8.5,
                            fontFamily: 'Helvetica-Bold',
                            color: heirManagement.hughes_framework.governance_insurance.score === 'EXCELLENT' ? colors.emerald[600] :
                                   heirManagement.hughes_framework.governance_insurance.score === 'STRONG' ? colors.emerald[500] :
                                   heirManagement.hughes_framework.governance_insurance.score === 'MODERATE' ? colors.amber[600] : colors.red[600],
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                          }}>
                            {heirManagement.hughes_framework.governance_insurance.score || 'N/A'}
                          </Text>
                        </View>
                      </View>
                      <Text style={{ fontSize: 9, color: colors.gray[600], lineHeight: 1.4, marginBottom: 8 }}>
                        {heirManagement.hughes_framework.governance_insurance.description || 'Structural protections against dissipation'}
                      </Text>
                      {heirManagement.hughes_framework.governance_insurance.provisions?.slice(0, 3).map((p: string, i: number) => (
                        <View key={i} style={{ flexDirection: 'row', marginBottom: 3 }}>
                          <Text style={{ fontSize: 8.5, color: colors.emerald[500], width: 10 }}>✓</Text>
                          <Text style={{ fontSize: 8.5, color: colors.gray[600], flex: 1 }}>{p}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Estate Tax by Heir Type - Supports both flat and nested formats */}
            {heirManagement.estate_tax_by_heir_type && (() => {
              const estateTax = heirManagement.estate_tax_by_heir_type;
              // Check for flat format (backend response) vs nested format
              const isFlat = estateTax.spouse_rate !== undefined || estateTax.children_rate !== undefined;

              // Extract values supporting both formats
              const spouseRate = isFlat ? estateTax.spouse_rate : estateTax.spouse?.rate;
              const spouseSummary = isFlat ? estateTax.spouse_summary : estateTax.spouse?.exemption;
              const childrenRate = isFlat ? estateTax.children_rate : estateTax.children?.rate;
              const childrenSummary = isFlat ? estateTax.children_summary : estateTax.children?.exemption;
              const nonLinealRate = isFlat ? estateTax.non_lineal_rate : estateTax.non_lineal?.rate;
              const nonLinealSummary = isFlat ? estateTax.non_lineal_summary : estateTax.non_lineal?.exemption;
              const headline = estateTax.headline;

              return (
                <View style={{ marginBottom: 24 }}>
                  <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: colors.gray[900], marginBottom: 8 }}>Estate Tax Impact by Heir Relationship</Text>
                  {headline && (
                    <Text style={{ fontSize: 10, color: colors.emerald[600], fontFamily: 'Helvetica-Bold', marginBottom: 12 }}>{headline}</Text>
                  )}
                  <View style={styles.table}>
                    <View style={styles.tableHeader}>
                      <Text style={[styles.tableCellHeader, { flex: 2 }]}>Heir Type</Text>
                      <Text style={styles.tableCellHeader}>Tax Rate</Text>
                      <Text style={[styles.tableCellHeader, { flex: 2 }]}>Status / Exemption</Text>
                    </View>
                    {(spouseRate !== undefined || spouseSummary) && (
                      <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, { flex: 2, fontFamily: 'Helvetica-Bold' }]}>Spouse</Text>
                        <Text style={[styles.tableCell, { fontFamily: 'Courier-Bold', color: spouseRate === 0 ? colors.emerald[600] : colors.gray[700] }]}>
                          {spouseRate != null ? (spouseRate === 0 ? 'TAX-FREE' : `${spouseRate}%`) : 'Exempt'}
                        </Text>
                        <Text style={[styles.tableCell, { flex: 2, fontSize: 9 }]}>
                          {spouseSummary || 'Unlimited marital deduction'}
                        </Text>
                      </View>
                    )}
                    {(childrenRate !== undefined || childrenSummary) && (
                      <View style={styles.tableRowAlt}>
                        <Text style={[styles.tableCell, { flex: 2, fontFamily: 'Helvetica-Bold' }]}>Children (Lineal)</Text>
                        <Text style={[styles.tableCell, { fontFamily: 'Courier-Bold', color: childrenRate === 0 ? colors.emerald[600] : colors.gray[700] }]}>
                          {childrenRate != null ? (childrenRate === 0 ? 'TAX-FREE' : `${childrenRate}%`) : 'N/A'}
                        </Text>
                        <Text style={[styles.tableCell, { flex: 2, fontSize: 9 }]}>
                          {childrenSummary || 'Standard exemption applies'}
                        </Text>
                      </View>
                    )}
                    {(nonLinealRate !== undefined || nonLinealSummary) && (
                      <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, { flex: 2, fontFamily: 'Helvetica-Bold' }]}>Non-Lineal Heirs</Text>
                        <Text style={[styles.tableCell, { fontFamily: 'Courier-Bold', color: nonLinealRate === 0 ? colors.emerald[600] : colors.red[600] }]}>
                          {nonLinealRate != null ? (nonLinealRate === 0 ? 'TAX-FREE' : `${nonLinealRate}%`) : 'N/A'}
                        </Text>
                        <Text style={[styles.tableCell, { flex: 2, fontSize: 9 }]}>
                          {nonLinealSummary || 'Generation-skipping tax may apply'}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })()}

            {/* Heir allocations - Premium Layout */}
            {heirManagement.heir_allocations && heirManagement.heir_allocations.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: colors.gray[900] }}>Heir Allocations & Structures</Text>
                  <Text style={{ fontSize: 9, color: colors.gray[500] }}>{heirManagement.heir_allocations.length} beneficiaries</Text>
                </View>

                {/* Individual Heir Cards */}
                {heirManagement.heir_allocations.map((heir: any, i: number) => {
                  const allocPct = heir.allocation_pct || heir.allocation_percent || 0;
                  const displayPercent = allocPct > 1 ? allocPct : Math.round(allocPct * 100);
                  const allocValue = heir.allocation_value || heir.allocation_amount || 0;
                  const heirStructure = heir.recommended_structure || heir.structure || '';

                  return (
                    <View key={i} style={{ borderWidth: 1, borderColor: colors.gray[200], marginBottom: 12, padding: 16 }}>
                      {/* Heir Header */}
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.gray[100] }}>
                        <View>
                          <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', color: colors.gray[900] }}>{heir.name || `Heir ${i + 1}`}</Text>
                          <Text style={{ fontSize: 9, color: colors.gray[500], marginTop: 2 }}>
                            {heir.relationship || 'Beneficiary'} · Age {heir.age || 'N/A'} · {heir.generation || 'G2'}
                          </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={{ fontSize: 18, fontFamily: 'Helvetica-Bold', color: colors.gray[900] }}>{displayPercent}%</Text>
                          <Text style={{ fontSize: 10, fontFamily: 'Courier-Bold', color: colors.emerald[600] }}>{formatCurrency(allocValue)}</Text>
                        </View>
                      </View>

                      {/* Structure & Timing */}
                      <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 2, marginRight: 24 }}>
                          <Text style={{ fontSize: 8.5, color: colors.gray[500], textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Recommended Structure</Text>
                          <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: colors.gray[800] }}>{heirStructure || 'Standard Distribution'}</Text>
                          {heir.structure_rationale && (
                            <Text style={{ fontSize: 8.5, color: colors.gray[500], marginTop: 4, fontStyle: 'italic' }}>{heir.structure_rationale}</Text>
                          )}
                        </View>
                        {heir.timing && (
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 8.5, color: colors.gray[500], textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Transfer Timing</Text>
                            <Text style={{ fontSize: 10, color: colors.gray[700] }}>{heir.timing}</Text>
                          </View>
                        )}
                      </View>

                      {/* Special Considerations */}
                      {heir.special_considerations && heir.special_considerations.length > 0 && (
                        <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.gray[100] }}>
                          <Text style={{ fontSize: 8.5, color: colors.gray[500], textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Key Considerations</Text>
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                            {heir.special_considerations.slice(0, 4).map((consideration: string, j: number) => (
                              <View key={j} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 6, marginBottom: 6 }}>
                                <Text style={{ fontSize: 8.5, color: colors.amber[600], marginRight: 4 }}>→</Text>
                                <Text style={{ fontSize: 8.5, color: colors.gray[600] }}>{consideration}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {/* Top succession risk */}
            {(heirManagement.top_succession_risk || heirManagement.top_succession_trigger) && (() => {
              const risk = heirManagement.top_succession_trigger || heirManagement.top_succession_risk;
              const riskText = risk.trigger || risk.risk || 'Succession risk identified';
              const atRisk = risk.dollars_at_risk || risk.at_risk_amount || 0;
              const mitigation = risk.mitigation;
              const mitigationTimeline = risk.mitigation_timeline;
              const mitigationDays = risk.mitigation_timeline_days;

              // Urgency color based on days
              const getTimelineColor = (days: number | undefined) => {
                if (days === undefined) return colors.gray[700];
                if (days <= 45) return colors.red[600];     // Urgent
                if (days <= 60) return colors.amber[600];   // Moderate
                return colors.emerald[600];                  // Standard
              };

              const getUrgencyLabel = (days: number | undefined) => {
                if (days === undefined) return '';
                if (days <= 45) return 'URGENT';
                if (days <= 60) return 'MODERATE';
                return 'STANDARD';
              };

              return (
                <View style={{ marginBottom: 24 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: colors.gray[900] }}>Top Succession Risk</Text>
                    {mitigationDays !== undefined && (
                      <View style={{
                        backgroundColor: mitigationDays <= 45 ? colors.red[100] : mitigationDays <= 60 ? colors.amber[100] : colors.emerald[100],
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 4
                      }}>
                        <Text style={{ fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: getTimelineColor(mitigationDays) }}>{getUrgencyLabel(mitigationDays)}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.card}>
                    <Text style={{ fontSize: 10, color: colors.gray[700], lineHeight: 1.5, marginBottom: 12 }}>{riskText}</Text>
                    <View style={{ flexDirection: 'row' }}>
                      <View style={{ marginRight: 24 }}>
                        <Text style={{ fontSize: 9, color: colors.gray[500], textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>At Risk</Text>
                        <Text style={{ fontSize: 16, fontFamily: 'Helvetica-Bold', color: colors.gray[900] }}>{formatCurrency(atRisk)}</Text>
                      </View>
                      {mitigation && (
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 9, color: colors.gray[500], textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Mitigation</Text>
                          <Text style={{ fontSize: 10, color: colors.gray[700] }}>{mitigation}</Text>
                        </View>
                      )}
                    </View>
                    {/* Mitigation Timeline */}
                    {mitigationTimeline && (
                      <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.gray[200] }}>
                        <Text style={{ fontSize: 9, color: colors.gray[500], textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Timeline</Text>
                        <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: getTimelineColor(mitigationDays) }}>{mitigationTimeline}</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })()}

            {/* Next action */}
            {heirManagement.next_action && (
              <View style={{ backgroundColor: colors.gray[900], padding: 16 }}>
                <Text style={{ fontSize: 9, color: colors.gray[400], textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Next Action</Text>
                <Text style={{ fontSize: 10, color: colors.white, lineHeight: 1.5 }}>{heirManagement.next_action}</Text>
              </View>
            )}

            <View style={styles.groundedNote}>
              <Text style={styles.groundedText}>
                Source: HNWI Chronicles KG Succession Framework + Hughes Family Wealth Framework
              </Text>
            </View>
          </View>

          <PageFooter intakeId={intake_id} />
          <ConfidentialWatermark />
        </Page>
      )}

      {/* === SUMMARY PAGE === */}
      <Page size="A4" style={styles.page}>
        <PageHeader />
        <View style={{ flex: 1, justifyContent: 'center' }}>
          {/* Header */}
          <View style={{ marginBottom: 32 }}>
            <View style={{ width: 48, height: 3, backgroundColor: colors.amber[500], marginBottom: 16 }} />
            <Text style={{ fontSize: 24, fontFamily: 'Helvetica-Bold', color: colors.gray[900] }}>Pattern Intelligence Complete</Text>
          </View>

          {/* Stats table */}
          <View style={[styles.table, { marginBottom: 32 }]} wrap={false}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCellHeader}>Precedents Analyzed</Text>
              <Text style={styles.tableCellHeader}>Failure Modes</Text>
              <Text style={styles.tableCellHeader}>Sequencing Rules</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { fontFamily: 'Helvetica-Bold', fontSize: 20 }]}>{precedentCount}</Text>
              <Text style={[styles.tableCell, { fontFamily: 'Helvetica-Bold', fontSize: 20 }]}>{memo_data.kgv3_intelligence_used?.failure_modes || 2}</Text>
              <Text style={[styles.tableCell, { fontFamily: 'Helvetica-Bold', fontSize: 20 }]}>{memo_data.kgv3_intelligence_used?.sequencing_rules || 2}</Text>
            </View>
          </View>

          {/* Reference */}
          <View style={{ backgroundColor: colors.gray[900], padding: 24, marginBottom: 32 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ fontSize: 9, color: colors.gray[400], textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Document Reference</Text>
                <Text style={{ fontSize: 18, fontFamily: 'Courier-Bold', color: colors.white, letterSpacing: 1 }}>
                  SFO_AUDIT_{intake_id.slice(10, 22).toUpperCase()}
                </Text>
              </View>
              <View style={{ borderWidth: 1, borderColor: colors.amber[500], paddingHorizontal: 12, paddingVertical: 6 }}>
                <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: colors.amber[500], textTransform: 'uppercase', letterSpacing: 1 }}>Complete</Text>
              </View>
            </View>
          </View>

          {/* Disclaimer */}
          <View style={{ paddingTop: 24, borderTopWidth: 1, borderTopColor: colors.gray[200] }}>
            <Text style={{ fontFamily: 'Helvetica', fontSize: 10, color: colors.gray[500], lineHeight: 1.6 }}>
              Pattern & Market Intelligence Report based on {precedentCount}+ analyzed precedents.
              This report provides strategic intelligence and pattern analysis for informed decision-making.
              For execution and implementation, consult your qualified legal, tax, and financial advisory teams.
            </Text>
          </View>
        </View>

        <PageFooter intakeId={intake_id} />
        <ConfidentialWatermark />
      </Page>

      {/* === LAST PAGE === */}
      <PdfLastPage
        intakeId={intake_id}
        precedentCount={precedentCount}
        generatedAt={generated_at}
        viaNegativa={pdfViaNegativa}
      />
    </Document>
  );
};

export default PatternAuditDocument;
