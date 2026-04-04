import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import fs from 'fs';
import { PatternAuditDocument } from '../lib/pdf/PatternAuditDocument';
import type { PdfMemoData } from '../lib/pdf/pdf-types';

const memoData = {
  success: true,
  intake_id: 'audit_whqsoutohm9_test1234',
  generated_at: '2026-03-02T12:00:00Z',
  preview_data: {
    verdict: 'CONDITIONAL',
    verdict_rationale: 'Risk level assessed as CRITICAL. Proceed with structured monitoring and targeted due diligence as outlined in this assessment.',
    source_jurisdiction: 'United States - New York',
    destination_jurisdiction: 'United Arab Emirates - Dubai',
    exposure_class: 'Cross-Border Real Estate Acquirer',
    value_creation: {
      total_formatted: '$1.1M',
      annual: { rental: 260000, rental_formatted: '$260K', appreciation: 875000, appreciation_formatted: '$875K', total: 1135000, total_formatted: '$1.1M' },
    },
    risk_level: 'CRITICAL',
    opportunity_count: 10,
    risk_factor_count: 1,
    data_quality: 'Strong',
    precedent_count: 487,
    risk_radar_scores: {
      scores: [
        { label: 'ANTIFRAGILITY', shortLabel: 'ANTI', score: 7, maxScore: 10 },
        { label: 'LIQUIDITY', shortLabel: 'LIQ', score: 7, maxScore: 10 },
        { label: 'REGULATORY', shortLabel: 'REG', score: 7, maxScore: 10 },
        { label: 'ASSET QUALITY', shortLabel: 'AST', score: 10, maxScore: 10 },
        { label: 'OPERATOR', shortLabel: 'OPR', score: 7, maxScore: 10 },
        { label: 'VALUATION', shortLabel: 'VAL', score: 7, maxScore: 10 },
      ],
      antifragilityAssessment: 'BALANCED',
      failureModeCount: 2,
      totalRiskFlags: 3,
    },
    tax_differential: {
      source: { income_tax: 47.9, capital_gains: 34.7, estate_tax: 0, wealth_tax: 0 },
      destination: { income_tax: 0, capital_gains: 0, estate_tax: 0, wealth_tax: 0 },
      cumulative_tax_differential_pct: 82.6,
      annual_savings_estimate: 120000,
    },
    risk_factors: [
      { title: 'Currency Risk', description: 'AED peg to USD may shift', severity: 'high', category: 'Market' },
    ],
    optimal_structure: { name: 'Direct Individual Purchase (Freehold Zone)', type: 'direct', net_benefit_10yr: 11900000 },
    thesis_summary: 'This audit evaluates the strategic and financial implications of cross-border real estate acquisition in the Dubai freehold market for a New York-based HNWI.',
  },
  memo_data: {
    kgv3_intelligence_used: {},
    source_jurisdiction: { city: 'New York', country: 'United States' },
    destination_jurisdiction: { city: 'Dubai', country: 'United Arab Emirates' },
  },
};

async function main() {
  console.log('Rendering PDF...');
  const documentElement = React.createElement(PatternAuditDocument, {
    memoData: memoData as PdfMemoData,
  }) as unknown as React.ReactElement;
  const buffer = await renderToBuffer(documentElement);
  fs.writeFileSync('/tmp/pdf-audit-v2.pdf', buffer);
  console.log(`PDF generated: ${buffer.length} bytes (${Math.round(buffer.length/1024)}KB)`);
}

main().catch(err => { console.error(err.message); process.exit(1); });
