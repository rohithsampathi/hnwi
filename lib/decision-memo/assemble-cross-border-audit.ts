// lib/decision-memo/assemble-cross-border-audit.ts
// Frontend normalization layer: constructs CrossBorderAuditSummary from scattered backend data
// when the backend returns cross_border_audit_summary: null.
//
// All raw tax data exists in the backend response across source_tax_rates, destination_tax_rates,
// selected_structure, and real_asset_audit — this function assembles them into the shape
// that CrossBorderTaxAudit.tsx expects.

import type { CrossBorderAuditSummary } from './sfo-expert-types';

// ---------------------------------------------------------------------------
// Input types — loosely typed to handle varying backend shapes
// ---------------------------------------------------------------------------

interface TaxRates {
  income_tax?: number;
  cgt?: number;
  wealth_tax?: number;
  estate_tax?: number;
}

interface SelectedStructure {
  structure_name?: string;
  net_rental_rate_pct?: number;
  net_cgt_rate_pct?: number;
  net_estate_rate_pct?: number;
  stamp_duty_rate_pct?: number;
}

interface StampDutyRate {
  rate_pct?: number;
  description?: string;
  band?: string;
}

interface RealAssetEntry {
  stamp_duty?: {
    residential_rates?: StampDutyRate[];
    foreign_buyer_surcharge?: { rate_pct?: number; description?: string };
    total_effective_rate_pct?: number;
  };
  [key: string]: unknown;
}

interface StartingPositionInput {
  transaction_value?: number;
  transaction_amount?: number;
  rental_yield_pct?: number;
  net_rental_yield_pct?: number;
  annual_rental?: number;
  selected_structure?: SelectedStructure;
  current_tax_rate?: number;
  target_tax_rate?: number;
  [key: string]: unknown;
}

interface TaxDifferentialInput {
  source?: TaxRates;
  destination?: TaxRates;
  income_tax_differential_pct?: number;
  cgt_differential_pct?: number;
  estate_tax_differential_pct?: number;
  cumulative_tax_differential_pct?: number;
  weighted_tax_differential_pct?: number;
  [key: string]: unknown;
}

interface PreviewDataInput {
  source_tax_rates?: TaxRates;
  destination_tax_rates?: TaxRates;
  tax_differential?: TaxDifferentialInput;
  source_jurisdiction?: string;
  destination_jurisdiction?: string;
  target_locations?: string[];
  show_tax_savings?: boolean;
  wealth_projection_data?: {
    starting_position?: StartingPositionInput;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Check if a TaxRates object has meaningful (non-zero) data */
function hasMeaningfulRates(rates?: TaxRates): boolean {
  if (!rates) return false;
  return (rates.income_tax ?? 0) > 0 || (rates.cgt ?? 0) > 0 ||
         (rates.wealth_tax ?? 0) > 0 || (rates.estate_tax ?? 0) > 0;
}

// ---------------------------------------------------------------------------
// Corridor-specific compliance knowledge
// ---------------------------------------------------------------------------

const CORRIDOR_COMPLIANCE: Record<string, { flags: string[]; warnings: string[] }> = {
  'India→UAE': {
    flags: [
      'RBI_LRS_COMPLIANCE',
      'FEMA_REPORTING',
      'INDIA_WORLDWIDE_TAXATION',
      'INDIA_UAE_DTAA',
    ],
    warnings: [
      'India taxes worldwide income — rental income from Dubai is taxable in India at slab rates',
      'RBI Liberalised Remittance Scheme: $250,000/person/year limit applies to outward remittance',
      'FEMA compliance: All foreign property acquisitions must be reported to RBI',
      'India-UAE DTAA: Foreign Tax Credit available for taxes paid in UAE (currently 0%)',
    ],
  },
  'India→Singapore': {
    flags: [
      'RBI_LRS_COMPLIANCE',
      'FEMA_REPORTING',
      'INDIA_WORLDWIDE_TAXATION',
      'INDIA_SINGAPORE_DTAA',
      'SINGAPORE_ABSD_FOREIGN_BUYER',
    ],
    warnings: [
      'India taxes worldwide income — rental and capital gains from Singapore taxable in India',
      'Singapore ABSD: 60% Additional Buyer\'s Stamp Duty for foreign buyers',
      'RBI LRS: $250,000/person/year outward remittance cap',
    ],
  },
  'US→Singapore': {
    flags: [
      'US_WORLDWIDE_TAXATION',
      'FBAR_REPORTING',
      'FATCA_COMPLIANCE',
      'US_SINGAPORE_FTA',
      'PFIC_RISK',
    ],
    warnings: [
      'US worldwide taxation: All foreign rental income and capital gains reported on Schedule E/D',
      'FBAR: Foreign bank accounts > $10,000 must be reported (FinCEN 114)',
      'FATCA: Form 8938 required for specified foreign financial assets',
      'PFIC risk: Investing through foreign REITs triggers punitive PFIC taxation',
    ],
  },
  'US→UAE': {
    flags: [
      'US_WORLDWIDE_TAXATION',
      'FBAR_REPORTING',
      'FATCA_COMPLIANCE',
    ],
    warnings: [
      'US worldwide taxation: All foreign rental income taxable at ordinary rates',
      'No US-UAE income tax treaty — FTC limited to taxes actually paid in UAE (typically 0%)',
      'FBAR: Foreign bank accounts > $10,000 must be reported',
    ],
  },
};

function getCorridorKey(source?: string, destination?: string): string | null {
  if (!source || !destination) return null;

  const s = source.toLowerCase();
  const d = destination.toLowerCase();

  if ((s.includes('india') || s.includes('hyderabad') || s.includes('mumbai') || s.includes('delhi') || s.includes('bangalore') || s.includes('chennai')) &&
      (d.includes('uae') || d.includes('dubai') || d.includes('abu dhabi'))) {
    return 'India→UAE';
  }
  if ((s.includes('india') || s.includes('hyderabad') || s.includes('mumbai') || s.includes('delhi')) &&
      d.includes('singapore')) {
    return 'India→Singapore';
  }
  if ((s.includes('us') || s.includes('united states') || s.includes('nyc') || s.includes('new york') || s.includes('america')) &&
      d.includes('singapore')) {
    return 'US→Singapore';
  }
  if ((s.includes('us') || s.includes('united states') || s.includes('nyc') || s.includes('new york') || s.includes('america')) &&
      (d.includes('uae') || d.includes('dubai') || d.includes('abu dhabi'))) {
    return 'US→UAE';
  }

  return null;
}

// ---------------------------------------------------------------------------
// Main assembly function
// ---------------------------------------------------------------------------

export function assembleCrossBorderAudit(
  previewData: PreviewDataInput,
  startingPosition: StartingPositionInput,
  realAssetAudit?: Record<string, RealAssetEntry> | null,
): CrossBorderAuditSummary | null {

  // ── Resolve tax rates with fallback chain ──────────────────────────
  // The session API route may overwrite source_tax_rates with an empty object.
  // Fallback: tax_differential.source / tax_differential.destination carry the same data.
  const rawSourceTax = previewData.source_tax_rates;
  const rawDestTax = previewData.destination_tax_rates;
  const tdSource = previewData.tax_differential?.source;
  const tdDest = previewData.tax_differential?.destination;

  // Pick whichever has meaningful (non-zero) values, preferring the direct field
  const sourceTax: TaxRates = hasMeaningfulRates(rawSourceTax) ? rawSourceTax!
    : hasMeaningfulRates(tdSource) ? tdSource!
    : rawSourceTax || tdSource || {};
  const destTax: TaxRates = hasMeaningfulRates(rawDestTax) ? rawDestTax!
    : hasMeaningfulRates(tdDest) ? tdDest!
    : rawDestTax || tdDest || {};

  const transactionValue = startingPosition.transaction_value
    || startingPosition.transaction_amount
    || 0;

  // Minimum data gate: need at least one tax object and a transaction value
  if ((!rawSourceTax && !tdSource && !rawDestTax && !tdDest) || transactionValue <= 0) {
    return null;
  }

  // ── Resolve destination jurisdiction ───────────────────────────────
  const destJurisdiction = previewData.destination_jurisdiction
    || (previewData.target_locations as string[] | undefined)?.[0]
    || '';
  const sourceJurisdiction = previewData.source_jurisdiction || '';
  const destLower = destJurisdiction.toLowerCase();

  // ── Structure-aware rates ──────────────────────────────────────────
  const structure = startingPosition.selected_structure;
  const netRentalRate = structure?.net_rental_rate_pct ?? sourceTax.income_tax ?? 0;
  const netCgtRate = structure?.net_cgt_rate_pct ?? sourceTax.cgt ?? 0;
  const netEstateRate = structure?.net_estate_rate_pct ?? 0;

  // ── Stamp duty extraction from real_asset_audit ────────────────────
  // Use destination jurisdiction to find the correct entry (not just the first match)
  let stampDutyPct = structure?.stamp_duty_rate_pct ?? 0;
  let foreignBuyerSurchargePct = 0;

  if (realAssetAudit) {
    // Priority 1: exact destination match (e.g., "Dubai", "Singapore")
    // Priority 2: first non-metadata, non-source key with stamp_duty
    const destKey = Object.keys(realAssetAudit).find(k => {
      const kLower = k.toLowerCase();
      return kLower !== '_kg_stats' && kLower !== 'metadata' &&
             destLower && kLower.includes(destLower) &&
             realAssetAudit[k]?.stamp_duty;
    }) || Object.keys(realAssetAudit).find(k => {
      const kLower = k.toLowerCase();
      // Exclude source jurisdiction entries and metadata
      const isSource = sourceJurisdiction &&
        (kLower.includes(sourceJurisdiction.toLowerCase()) || sourceJurisdiction.toLowerCase().includes(kLower));
      return kLower !== '_kg_stats' && kLower !== 'metadata' &&
             !kLower.startsWith('_') &&
             !isSource &&
             realAssetAudit[k]?.stamp_duty;
    });

    if (destKey) {
      const sd = realAssetAudit[destKey].stamp_duty;
      if (sd?.residential_rates?.[0]) {
        stampDutyPct = sd.residential_rates[0].rate_pct ?? stampDutyPct;
      }
      if (sd?.foreign_buyer_surcharge) {
        foreignBuyerSurchargePct = sd.foreign_buyer_surcharge.rate_pct ?? 0;
      }
      if (sd?.total_effective_rate_pct !== undefined && sd.total_effective_rate_pct !== null) {
        stampDutyPct = sd.total_effective_rate_pct;
      }
    }
  }

  const totalStampDutyPct = stampDutyPct + foreignBuyerSurchargePct;

  // ── Build Acquisition Audit ────────────────────────────────────────
  const bsdAmount = transactionValue * (stampDutyPct / 100);
  const absdAmount = transactionValue * (foreignBuyerSurchargePct / 100);
  const totalStampDuties = bsdAmount + absdAmount;
  const totalAcquisitionCost = transactionValue + totalStampDuties;
  const dayOneLossPct = totalStampDutyPct;

  const acquisitionAudit = {
    property_value: transactionValue,
    bsd_stamp_duty: bsdAmount,
    absd_additional_stamp_duty: absdAmount,
    total_stamp_duties: totalStampDuties,
    total_acquisition_cost: totalAcquisitionCost,
    day_one_loss_pct: dayOneLossPct,
  };

  // ── Rental Income Audit ────────────────────────────────────────────
  const grossYieldPct = startingPosition.rental_yield_pct ?? 0;
  const sourceIncomeTax = sourceTax.income_tax ?? 0;
  const destIncomeTax = destTax.income_tax ?? 0;

  // FTC: Available when source has worldwide taxation and destination taxes > 0
  const sourceHasWorldwideTax = sourceIncomeTax > 0;
  const rentalFtcAvailable = sourceHasWorldwideTax && destIncomeTax > 0;

  // Net rate: structure rate if available, otherwise higher of source/dest (worldwide)
  const rentalNetRate = structure?.net_rental_rate_pct ?? Math.max(sourceIncomeTax, destIncomeTax);
  const rentalSavingsPct = 0; // Cross-border non-relocation: savings are typically 0

  const rentalIncomeAudit = {
    gross_yield_pct: grossYieldPct,
    destination_tax_rate_pct: destIncomeTax,
    source_tax_rate_pct: sourceIncomeTax,
    ftc_available: rentalFtcAvailable,
    net_tax_rate_pct: rentalNetRate,
    tax_savings_pct: rentalSavingsPct,
    explanation: destIncomeTax === 0 && sourceIncomeTax > 0
      ? `Destination charges 0% income tax. Source jurisdiction taxes worldwide income at ${sourceIncomeTax}%. Net effective rate after structure: ${rentalNetRate}%.`
      : `Destination: ${destIncomeTax}%. Source: ${sourceIncomeTax}%. FTC ${rentalFtcAvailable ? 'available' : 'not available'}. Net: ${rentalNetRate}%.`,
  };

  // ── Capital Gains Audit ────────────────────────────────────────────
  const sourceCgt = sourceTax.cgt ?? 0;
  const destCgt = destTax.cgt ?? 0;
  const cgtFtcAvailable = sourceCgt > 0 && destCgt > 0;
  const cgtNetRate = structure?.net_cgt_rate_pct ?? Math.max(sourceCgt, destCgt);

  const capitalGainsAudit = {
    destination_cgt_pct: destCgt,
    source_cgt_pct: sourceCgt,
    ftc_available: cgtFtcAvailable,
    net_cgt_rate_pct: cgtNetRate,
    tax_savings_pct: 0,
    explanation: destCgt === 0 && sourceCgt > 0
      ? `Destination: 0% CGT. Source: ${sourceCgt}% on worldwide gains. Net effective rate: ${cgtNetRate}%.`
      : `Destination: ${destCgt}%. Source: ${sourceCgt}%. Net: ${cgtNetRate}%.`,
  };

  // ── Estate Tax Audit ───────────────────────────────────────────────
  const sourceEstate = sourceTax.estate_tax ?? 0;
  const destEstate = destTax.estate_tax ?? 0;
  const worldwideApplies = sourceEstate > 0 || sourceIncomeTax > 0;

  const estateTaxAudit = {
    destination_estate_pct: destEstate,
    source_estate_pct: sourceEstate,
    worldwide_applies: worldwideApplies,
    net_estate_rate_pct: netEstateRate || Math.max(sourceEstate, destEstate),
    tax_savings_pct: 0,
    explanation: sourceEstate === 0 && destEstate === 0
      ? 'Neither jurisdiction imposes estate/inheritance tax on this asset class.'
      : `Source: ${sourceEstate}%. Destination: ${destEstate}%. Worldwide taxation ${worldwideApplies ? 'applies' : 'does not apply'}.`,
  };

  // ── Net Yield Audit ────────────────────────────────────────────────
  const netYieldPct = startingPosition.net_rental_yield_pct ?? (grossYieldPct * (1 - rentalNetRate / 100));
  const annualGrossIncome = startingPosition.annual_rental ?? (transactionValue * grossYieldPct / 100);
  const taxRateApplied = rentalNetRate;
  const annualTaxPaid = annualGrossIncome * (taxRateApplied / 100);
  const annualNetIncome = annualGrossIncome - annualTaxPaid;

  const netYieldAudit = {
    gross_yield_pct: grossYieldPct,
    tax_rate_applied_pct: taxRateApplied,
    net_yield_pct: netYieldPct,
    annual_gross_income: annualGrossIncome,
    annual_tax_paid: annualTaxPaid,
    annual_net_income: annualNetIncome,
    explanation: `Gross yield ${grossYieldPct}% on $${(transactionValue / 1e6).toFixed(1)}M → ${taxRateApplied}% effective tax → ${netYieldPct.toFixed(2)}% net yield ($${Math.round(annualNetIncome).toLocaleString()}/yr).`,
  };

  // ── Corridor compliance ────────────────────────────────────────────
  const corridorKey = getCorridorKey(sourceJurisdiction, destJurisdiction);
  const corridor = corridorKey ? CORRIDOR_COMPLIANCE[corridorKey] : null;

  const complianceFlags = corridor?.flags ?? [];
  const warnings = corridor?.warnings ?? [];

  // ── Executive summary ──────────────────────────────────────────────
  const structureName = structure?.structure_name ?? 'Direct Purchase';
  const executiveSummary =
    `Cross-border acquisition: $${(transactionValue / 1e6).toFixed(1)}M ${destJurisdiction || 'destination'} property from ${sourceJurisdiction || 'source'} jurisdiction. ` +
    `Structure: ${structureName}. ` +
    `Day-one stamp duty cost: ${dayOneLossPct.toFixed(1)}% ($${Math.round(totalStampDuties).toLocaleString()}). ` +
    `Net rental yield: ${netYieldPct.toFixed(2)}% after ${taxRateApplied}% effective tax rate. ` +
    (corridorKey ? `Corridor: ${corridorKey} — ${complianceFlags.length} compliance requirements identified.` : '');

  return {
    executive_summary: executiveSummary,
    acquisition_audit: acquisitionAudit,
    rental_income_audit: rentalIncomeAudit,
    capital_gains_audit: capitalGainsAudit,
    estate_tax_audit: estateTaxAudit,
    net_yield_audit: netYieldAudit,
    total_tax_savings_pct: 0, // Cross-border non-relocation: no theoretical savings
    compliance_flags: complianceFlags,
    warnings,
  };
}
