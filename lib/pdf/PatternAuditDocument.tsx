/**
 * NATIVE PDF DOCUMENT - SFO Pattern Audit
 * Orchestrator: assembles up to 24 pages from PDF components (full web parity)
 * Uses extractMemoVariables() for all data extraction
 *
 * Page order (matches UI Linear View flow):
 *  HEADER:  1. Cover → 2. AuditOverview → 3. MemoHeader
 *  TAX:     4. TaxAnalysis → 5. CrossBorderTax* → 6. LiquidityTrap*
 *  VERDICT: 7. Verdict → 8. RiskRadar* → 9. RiskFactors → 10. StressTest*
 *           11. StructureComparison* → 12. DecisionTimeline*
 *  INTEL:   13. PeerBenchmark* → 14. PatternIntelligence* → 15. HNWITrends*
 *  EXTRA:   16. HeirManagement* → 17. GoldenVisa* → 18. TransparencyRegime*
 *           19. RealAssetAudit* → 20. RegimeIntelligence*
 *  REFS:    21. RegulatorySources* → 22. References*
 *  CLOSE:   23. Summary → 24. LastPage
 * (* = conditional)
 */

import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import './pdf-fonts';
import { colors, darkTheme, cleanJurisdiction, formatCurrency } from './pdf-styles';
import { PdfMemoData } from './pdf-types';
import { extractMemoVariables } from './helpers/pdf-data-transformer';
import { PdfCoverPage } from './components/PdfCoverPage';
import { PdfVerdictSection } from './components/PdfVerdictSection';
import { PdfTaxAnalysis } from './components/PdfTaxAnalysis';
import { PdfRiskFactorsPage } from './components/PdfRiskFactorsPage';
import { PdfPatternIntelligencePage } from './components/PdfPatternIntelligencePage';
import { PdfStressTestPage } from './components/PdfStressTestPage';
import { PdfDecisionTimelinePage } from './components/PdfDecisionTimelinePage';
import { PdfLastPage } from './components/PdfLastPage';
import { PdfRealAssetAuditSection } from './components/PdfRealAssetAuditSection';
import { PdfGoldenVisaSection } from './components/PdfGoldenVisaSection';
import { PdfHNWITrendsSection } from './components/PdfHNWITrendsSection';
import { PdfRegimeIntelligenceSection } from './components/PdfRegimeIntelligenceSection';
import { PdfHeirManagementPage } from './components/PdfHeirManagementPage';
import { PdfTransparencyRegimePage } from './components/PdfTransparencyRegimePage';
import PdfSummaryPage from './components/PdfSummaryPage';
import { PdfAuditOverviewPage } from './components/PdfAuditOverviewPage';
import { PdfMemoHeaderPage } from './components/PdfMemoHeaderPage';
import { PdfRiskRadarPage } from './components/PdfRiskRadarPage';
import { PdfLiquidityTrapPage } from './components/PdfLiquidityTrapPage';
import { PdfCrossBorderTaxAudit } from './components/PdfCrossBorderTaxAudit';
import { PdfStructureComparisonPage } from './components/PdfStructureComparisonPage';
import { PdfPeerBenchmarkPage } from './components/PdfPeerBenchmarkPage';
import { PdfReferencesPage } from './components/PdfReferencesPage';
import { PdfRegulatorySourcesPage } from './components/PdfRegulatorySourcesPage';

function buildDocStyles() {
  return StyleSheet.create({
    page: { fontFamily: 'Inter', fontSize: 11, paddingTop: 52, paddingBottom: 68, paddingHorizontal: 52, backgroundColor: darkTheme.pageBg, color: darkTheme.textSecondary },
    footer: { position: 'absolute', bottom: 24, left: 52, right: 52, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: darkTheme.border },
    footerText: { fontFamily: 'Inter', fontSize: 9, color: darkTheme.textFaint, letterSpacing: 0.5 },
    footerBrand: { fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: colors.amber[500], letterSpacing: 1.5, textTransform: 'uppercase' },
  });
}

const PageHeader: React.FC = () => (
  <View style={{ position: 'absolute', top: 18, left: 52, right: 52, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottomWidth: 0.5, borderBottomColor: darkTheme.border }} fixed>
    <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8, color: darkTheme.textMuted, textTransform: 'uppercase', letterSpacing: 2.5 }}>HNWI Chronicles</Text>
    <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8, color: darkTheme.textMuted, textTransform: 'uppercase', letterSpacing: 2.5 }}>SFO Decision Memorandum</Text>
  </View>
);

const PageFooter: React.FC<{ intakeId: string }> = ({ intakeId }) => {
  const ds = buildDocStyles();
  return (
    <View style={ds.footer} fixed>
      <Text style={{ ...ds.footerText, color: darkTheme.textMuted }}>Ref: {intakeId.slice(10, 22).toUpperCase()}</Text>
      <Text style={{ ...ds.footerBrand, color: colors.amber[500] }}>HNWI CHRONICLES</Text>
      <Text style={{ ...ds.footerText, color: darkTheme.textMuted }} render={({ pageNumber, totalPages }) => `CONFIDENTIAL | Page ${pageNumber} of ${totalPages}`} />
    </View>
  );
};

const ConfidentialWatermark: React.FC = () => (
  <>
    <View fixed style={{ position: 'absolute', bottom: 52, right: 32, width: 36, height: 36, borderWidth: 1.5, borderColor: darkTheme.borderSubtle, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 16, color: darkTheme.borderSubtle, letterSpacing: -0.5 }}>HC</Text>
    </View>
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }} fixed>
      <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 48, color: 'rgba(46, 46, 46, 0.08)', transform: 'rotate(-35deg)', letterSpacing: 16, textTransform: 'uppercase' }}>CONFIDENTIAL</Text>
    </View>
  </>
);

interface PatternAuditDocumentProps { memoData: PdfMemoData }

export const PatternAuditDocument: React.FC<PatternAuditDocumentProps> = ({ memoData }) => {
  const s = buildDocStyles();
  const v = extractMemoVariables(memoData);
  const memoHeaderValueCreation = (() => {
    const { value_creation } = memoData.preview_data;
    return typeof value_creation === 'object' && value_creation !== null && !Array.isArray(value_creation)
      ? (value_creation as Parameters<typeof PdfMemoHeaderPage>[0]['valueCreation'])
      : undefined;
  })();
  // Use identified_risks (20 items) > all_mistakes (2 items) > risk_factors as fallback
  const riskFactorsForPdf = v.identifiedRisksAsFactors.length > 0
    ? v.identifiedRisksAsFactors
    : (v.allMistakes.length > 0 ? v.mistakesAsRiskFactors : v.riskFactors);

  return (
    <Document title={`HNWI Decision Audit - ${v.intakeId.slice(10, 22)}`} author="HNWI Chronicles - Private Intelligence Division" subject="SFO Pattern Audit" keywords="HNWI, Family Office, Decision Audit, Tax Optimization">
      <PdfCoverPage intakeId={v.intakeId} sourceJurisdiction={v.sourceJurisdiction} destinationJurisdiction={v.destJurisdiction} generatedAt={v.generatedAt} exposureClass={v.exposureClass} valueCreation={v.valueCreation} verdict={v.verdict} precedentCount={v.precedentCount} viaNegativa={v.pdfViaNegativa} />

      {/* ═══ SECTION 1: HEADER ═══ */}

      {/* Audit Overview — Decision Thesis */}
      <Page size="A4" style={s.page}>
        <PageHeader />
        <PdfAuditOverviewPage sourceJurisdiction={v.sourceJurisdiction} destinationJurisdiction={v.destJurisdiction} sourceCity={v.sourceCity} destinationCity={v.destinationCity} developmentsCount={v.developmentsCount} precedentCount={v.precedentCount} thesisSummary={v.thesisSummary} fullThesis={v.fullThesis} exposureClass={v.exposureClass} verdict={v.verdict} cleanJurisdiction={cleanJurisdiction} />
        <PageFooter intakeId={v.intakeId} />
        <ConfidentialWatermark />
      </Page>

      {/* Memo Header — Executive Summary */}
      <Page size="A4" style={s.page}>
        <PageHeader />
        <PdfMemoHeaderPage intakeId={v.intakeId} generatedAt={v.generatedAt} exposureClass={v.exposureClass} totalSavings={v.valueCreation} precedentCount={v.precedentCount} verdict={v.memoVerdict} optimalStructure={v.optimalStructure} valueCreation={memoHeaderValueCreation} viaNegativa={v.pdfViaNegativa} />
        <PageFooter intakeId={v.intakeId} />
        <ConfidentialWatermark />
      </Page>

      {/* ═══ SECTION 2: TAX ANALYSIS (matches UI Page1TaxDashboard) ═══ */}

      <Page size="A4" style={s.page}>
        <PageHeader />
        <PdfTaxAnalysis sourceJurisdiction={v.sourceJurisdiction} destinationJurisdiction={v.destJurisdiction} sourceTaxRates={v.sourceTaxRates} destinationTaxRates={v.destTaxRates} totalTaxBenefit={v.totalTaxBenefit} taxDifferential={v.taxDifferential} showTaxSavings={v.showTaxSavings} />
        <PageFooter intakeId={v.intakeId} />
        <ConfidentialWatermark />
      </Page>

      {/* Cross-Border Tax Audit (conditional) */}
      {v.crossBorderAudit && (
        <Page size="A4" style={s.page}>
          <PageHeader />
          <PdfCrossBorderTaxAudit audit={v.crossBorderAudit} sourceJurisdiction={v.sourceJurisdiction} destinationJurisdiction={v.destJurisdiction} />
          <PageFooter intakeId={v.intakeId} />
          <ConfidentialWatermark />
        </Page>
      )}

      {/* Liquidity Trap (conditional — acquisition stamp duty analysis) */}
      {v.crossBorderAudit?.acquisition_audit && (
        <Page size="A4" style={s.page}>
          <PageHeader />
          <PdfLiquidityTrapPage capitalIn={v.crossBorderAudit.acquisition_audit.total_acquisition_cost || v.crossBorderAudit.acquisition_audit.property_value || 0} capitalOut={v.crossBorderAudit.acquisition_audit.property_value || 0} primaryBarrier="ABSD (Foreign Buyer)" primaryBarrierCost={v.crossBorderAudit.acquisition_audit.absd_additional_stamp_duty || 0} secondaryBarrier="BSD Stamp Duty" secondaryBarrierCost={v.crossBorderAudit.acquisition_audit.bsd_stamp_duty || 0} dayOneLossPct={v.crossBorderAudit.acquisition_audit.day_one_loss_pct || 0} />
          <PageFooter intakeId={v.intakeId} />
          <ConfidentialWatermark />
        </Page>
      )}

      {/* ═══ SECTION 3: VERDICT & RISK (matches UI Page2AuditVerdict) ═══ */}

      <Page size="A4" style={s.page}>
        <PageHeader />
        <PdfVerdictSection verdict={v.verdict} verdictRationale={v.memoData.preview_data.verdict_rationale} riskLevel={v.riskLevel} opportunityCount={v.opportunityCount} riskFactorCount={v.riskFactorCount} dataQuality={v.dataQuality} precedentCount={v.precedentCount} sourceJurisdiction={cleanJurisdiction(v.sourceJurisdiction)} destinationJurisdiction={cleanJurisdiction(v.destJurisdiction)} totalExposure={v.totalExposure} totalExposureFormatted={v.riskAssessment?.total_exposure_formatted} mitigationTimeline={v.riskAssessment?.mitigation_timeline} criticalItems={v.riskAssessment?.critical_items} highPriority={v.riskAssessment?.high_priority} riskFactors={riskFactorsForPdf} dueDiligence={v.dueDiligence} viaNegativa={v.pdfViaNegativa} />
        <PageFooter intakeId={v.intakeId} />
        <ConfidentialWatermark />
      </Page>

      {/* Risk Radar (conditional) */}
      {v.riskRadarScores && v.riskRadarScores.scores.length > 0 && (
        <Page size="A4" style={s.page}>
          <PageHeader />
          <PdfRiskRadarPage scores={v.riskRadarScores.scores} antifragilityAssessment={v.riskRadarScores.antifragilityAssessment} failureModeCount={v.riskRadarScores.failureModeCount} totalRiskFlags={v.riskRadarScores.totalRiskFlags} isVetoed={v.isViaNegativa} />
          <PageFooter intakeId={v.intakeId} />
          <ConfidentialWatermark />
        </Page>
      )}

      {/* Risk Factors */}
      <Page size="A4" style={s.page}>
        <PageHeader />
        <PdfRiskFactorsPage riskFactors={riskFactorsForPdf} dueDiligence={v.dueDiligence || []} totalExposureFormatted={v.riskAssessment?.total_exposure_formatted || formatCurrency(v.totalExposure)} verdict={v.verdict} />
        <PageFooter intakeId={v.intakeId} />
        <ConfidentialWatermark />
      </Page>

      {/* Stress Test & Wealth Projection (conditional) */}
      {(v.crisisData || v.wealthProjection || v.startingValue > 0) && (
        <Page size="A4" style={s.page}>
          <PageHeader />
          <PdfStressTestPage crisisData={v.crisisData ?? undefined} wealthProjection={v.wealthProjection} heirManagement={v.heirManagement} startingValue={v.startingValue} baseYear10={v.baseYear10} stressYear10={v.stressYear10} opportunityYear10={v.opportunityYear10} baseProbability={v.baseProbability} stressProbability={v.stressProbability} opportunityProbability={v.opportunityProbability} verdict={v.verdict} />
          <PageFooter intakeId={v.intakeId} />
          <ConfidentialWatermark />
        </Page>
      )}

      {/* Structure Comparison (conditional) */}
      {v.structureOptimization
        && Array.isArray((v.structureOptimization as { structures_analyzed?: unknown[] }).structures_analyzed)
        && ((v.structureOptimization as { structures_analyzed?: unknown[] }).structures_analyzed?.length ?? 0) > 0 && (
        <Page size="A4" style={s.page}>
          <PageHeader />
          <PdfStructureComparisonPage structureOptimization={v.structureOptimization as Parameters<typeof PdfStructureComparisonPage>[0]['structureOptimization']} sourceJurisdiction={v.sourceJurisdiction} destinationJurisdiction={v.destJurisdiction} />
          <PageFooter intakeId={v.intakeId} />
          <ConfidentialWatermark />
        </Page>
      )}

      {/* Decision Timeline & Scenario Tree (conditional) */}
      {(v.costOfInaction || (v.executionSequence && v.executionSequence.length > 0) || v.scenarioTree) && (
        <Page size="A4" style={s.page}>
          <PageHeader />
          <PdfDecisionTimelinePage costOfInaction={v.costOfInaction} executionSequence={v.executionSequence} decisionGates={v.scenarioTree?.decision_gates || []} verdict={v.verdict} branches={v.scenarioTree?.branches ? Object.entries(v.scenarioTree.branches).filter(([, b]) => b).map(([key, b]) => ({ branch: key, probability: b!.probability || 0, expected_value: b!.expected_value, conditions: b!.conditions?.map(c => ({ condition: c.condition, status: c.status })), verdict_text: b!.recommended_if })) : undefined} marketValidation={(() => { const evr = v.scenarioTree?.expected_vs_reality; if (!evr?.comparisons?.length) return undefined; const a = evr.comparisons.find(c => /appreciation/i.test(c.metric)); const r = evr.comparisons.find(c => /rental|yield/i.test(c.metric)); if (!a && !r) return undefined; return { appreciation: { expected: Number(a?.expected || 0), actual: Number(a?.actual || 0), deviation_pct: parseFloat(String(a?.deviation || '0')) }, rental_yield: { expected: Number(r?.expected || 0), actual: Number(r?.actual || 0), deviation_pct: parseFloat(String(r?.deviation || '0')) } }; })()} validityDays={v.scenarioTree?.validity_period ? parseInt(v.scenarioTree.validity_period) || undefined : undefined} reassessTriggers={v.scenarioTree?.reassess_conditions} />
          <PageFooter intakeId={v.intakeId} />
          <ConfidentialWatermark />
        </Page>
      )}

      {/* ═══ SECTION 4: INTELLIGENCE (matches UI Page3PeerIntelligence) ═══ */}

      {/* Peer Benchmark (conditional) */}
      {((v.doctrineMetadata?.failure_modes && v.doctrineMetadata.failure_modes.length > 0) || v.patternIntelligence?.found) && (
        <Page size="A4" style={s.page}>
          <PageHeader />
          <PdfPeerBenchmarkPage precedentCount={v.precedentCount} failurePatterns={(v.doctrineMetadata?.failure_modes || []).map(fm => ({ mode: fm.mode || '', severity: fm.severity || 'LOW', description: fm.description || '', nightmareName: fm.nightmare_name }))} failureModeCount={v.doctrineMetadata?.failure_mode_count || v.doctrineMetadata?.failure_modes?.length || 0} totalRiskFlags={v.doctrineMetadata?.risk_flags_total || 0} sourceJurisdiction={v.sourceJurisdiction} destinationJurisdiction={v.destJurisdiction} patternIntelligence={v.patternIntelligence as Parameters<typeof PdfPeerBenchmarkPage>[0]['patternIntelligence']} />
          <PageFooter intakeId={v.intakeId} />
          <ConfidentialWatermark />
        </Page>
      )}

      {/* Pattern Intelligence & Peer Analysis (conditional) */}
      {(v.peerStats || v.capitalFlow || (v.evidenceAnchors && v.evidenceAnchors.length > 0)) && (
        <Page size="A4" style={s.page}>
          <PageHeader />
          <PdfPatternIntelligencePage sourceJurisdiction={v.sourceJurisdiction} destinationJurisdiction={v.destJurisdiction} precedentCount={v.precedentCount} developmentsCount={v.developmentsCount} peerStats={v.peerStats} capitalFlow={v.capitalFlow} evidenceAnchors={v.evidenceAnchors} verdict={v.verdict} />
          <PageFooter intakeId={v.intakeId} />
          <ConfidentialWatermark />
        </Page>
      )}

      {/* HNWI Trends (conditional) */}
      {v.hnwiTrendsData?.insights && v.hnwiTrendsData.insights.length > 0 && (
        <Page size="A4" style={s.page}>
          <PageHeader />
          <PdfHNWITrendsSection trendsData={v.hnwiTrendsData} sourceJurisdiction={v.sourceJurisdiction} destinationJurisdiction={v.destJurisdiction} />
          <PageFooter intakeId={v.intakeId} />
          <ConfidentialWatermark />
        </Page>
      )}

      {/* ═══ SECTION 5: SUPPLEMENTARY ═══ */}

      {/* Heir Management (conditional) */}
      {v.heirManagement && ((v.heirManagement.heir_allocations?.length ?? 0) > 0 || v.heirManagement.third_generation_risk || v.heirManagement.with_structure || v.heirManagement.g1_position) && (
        <Page size="A4" style={s.page}>
          <PageHeader />
          <PdfHeirManagementPage heirManagement={v.heirManagement} intakeId={v.intakeId} />
          <PageFooter intakeId={v.intakeId} />
          <ConfidentialWatermark />
        </Page>
      )}

      {/* Golden Visa / Investment Migration (conditional) */}
      {((v.destinationDrivers?.visa_programs && v.destinationDrivers.visa_programs.length > 0) || v.goldenVisaIntelligence) && (
        <Page size="A4" style={s.page}>
          <PageHeader />
          <PdfGoldenVisaSection destinationDrivers={v.destinationDrivers} destinationJurisdiction={v.destJurisdiction} goldenVisaIntelligence={v.goldenVisaIntelligence} />
          <PageFooter intakeId={v.intakeId} />
          <ConfidentialWatermark />
        </Page>
      )}

      {/* Transparency Regime (conditional) */}
      {v.transparencyData && (
        <Page size="A4" style={s.page}>
          <PageHeader />
          <PdfTransparencyRegimePage transparencyData={v.transparencyData} sourceJurisdiction={v.sourceJurisdiction} destinationJurisdiction={v.destJurisdiction} />
          <PageFooter intakeId={v.intakeId} />
          <ConfidentialWatermark />
        </Page>
      )}

      {/* Real Asset Audit (conditional) */}
      {v.realAssetAudit && Object.keys(v.realAssetAudit).length > 0 && (
        <PdfRealAssetAuditSection data={v.realAssetAudit} sourceJurisdiction={v.sourceJurisdiction} destinationJurisdiction={v.destJurisdiction} transactionValue={v.startingValue} intakeId={v.intakeId} />
      )}

      {v.regimeIntelligence?.has_special_regime && (
        <PdfRegimeIntelligenceSection regimeIntelligence={v.regimeIntelligence} sourceJurisdiction={v.sourceJurisdiction} destinationJurisdiction={v.destJurisdiction} intakeId={v.intakeId} />
      )}

      {/* ═══ SECTION 6: REFERENCES (matches UI RegulatorySourcesSection + ReferencesSection) ═══ */}

      {/* Regulatory Sources (conditional) */}
      {v.regulatoryCitations && v.regulatoryCitations.length > 0 && (
        <Page size="A4" style={s.page}>
          <PageHeader />
          <PdfRegulatorySourcesPage citations={v.regulatoryCitations} />
          <PageFooter intakeId={v.intakeId} />
          <ConfidentialWatermark />
        </Page>
      )}

      {/* Legal References (conditional) */}
      {v.legalReferences && ((v.legalReferences.total_count || 0) > 0 || v.legalReferences.tax_statutes?.length || v.legalReferences.regulations?.length) && (
        <Page size="A4" style={s.page}>
          <PageHeader />
          <PdfReferencesPage references={v.legalReferences} developmentsCount={v.legalCitationCount} precedentCount={v.precedentCount} />
          <PageFooter intakeId={v.intakeId} />
          <ConfidentialWatermark />
        </Page>
      )}

      {/* ═══ SECTION 7: CLOSING ═══ */}

      <Page size="A4" style={s.page}>
        <PageHeader />
        <PdfSummaryPage verdict={v.verdict} verdictTheme={v.verdictTheme} sourceJurisdiction={v.sourceJurisdiction} destinationJurisdiction={v.destJurisdiction} totalTaxBenefit={v.totalTaxBenefit} showTaxSavings={v.showTaxSavings} totalExposure={v.totalExposure} totalExposureFormatted={v.riskAssessment?.total_exposure_formatted} precedentCount={v.precedentCount} riskFactorCount={v.riskFactorCount} failureModes={typeof v.kgIntelligence?.failure_modes === 'number' ? v.kgIntelligence.failure_modes : 2} sequencingRules={typeof v.kgIntelligence?.sequencing_rules === 'number' ? v.kgIntelligence.sequencing_rules : 2} intakeId={v.intakeId} />
        <PageFooter intakeId={v.intakeId} />
        <ConfidentialWatermark />
      </Page>

      <PdfLastPage intakeId={v.intakeId} precedentCount={v.precedentCount} generatedAt={v.generatedAt} verdict={v.verdict} viaNegativa={v.pdfViaNegativa} />
    </Document>
  );
};

export default PatternAuditDocument;
