import { PdfMemoData } from '@/lib/pdf/pdf-types';
import { computeRiskRadarScores } from './compute-risk-radar-scores';

/**
 * Maps section IDs to their specific component props
 * This ensures each component gets exactly what it needs
 */
export function getComponentProps(
  sectionId: string,
  memoData: PdfMemoData,
  backendData: any,
  intakeId: string,
  computedProps: any
): Record<string, any> {
  const baseProps = {
    intakeId,
    memoData,
    generatedAt: memoData.generated_at,
    sourceJurisdiction: memoData.preview_data?.source_jurisdiction,
    destinationJurisdiction: memoData.preview_data?.destination_jurisdiction,
  };

  // Section-specific prop mappings
  const propMappings: Record<string, Record<string, any>> = {
    'audit-overview': {
      developmentsCount: backendData?.hnwiWorldCount || 1966,
      precedentCount: memoData.memo_data?.kgv3_intelligence_used?.precedents || 0,
      sourceJurisdiction: memoData.preview_data.source_jurisdiction,
      destinationJurisdiction: memoData.preview_data.destination_jurisdiction,
      sourceCity: memoData.preview_data.source_city,
      destinationCity: memoData.preview_data.destination_city,
      // Primary field: preview_data.thesis_summary (backend standard)
      thesisSummary: memoData.preview_data.thesis_summary ||
                      backendData?.fullArtifact?.thesisSummary ||
                      memoData.preview_data.decision_thesis,
      exposureClass: memoData.preview_data.exposure_class,
      totalSavings: memoData.preview_data.total_savings,
      optimalStructure: memoData.preview_data.structure_optimization?.optimal_structure,
      verdict: memoData.preview_data.structure_optimization?.verdict,
      // Try multiple possible thesis field locations
      fullThesis: backendData?.thesis ||
                  backendData?.fullArtifact?.thesis ||
                  memoData.preview_data.thesis ||
                  memoData.preview_data.decision_context ||
                  memoData.preview_data.user_input,
      // New fields from backend (rails, constraints)
      rails: backendData?.rails,
      constraints: backendData?.constraints,
      showMap: true, // Personal mode - show full page map visualization
    },

    'overview': {
      verdict: memoData.preview_data.structure_optimization?.verdict,
      generatedAt: memoData.generated_at,
      intakeId,
      totalValueCreation: memoData.preview_data.total_savings,
      optimalStructure: memoData.preview_data.structure_optimization?.optimal_structure,
      intelligenceDepth: memoData.memo_data?.kgv3_intelligence_used?.precedents || 0,
      returnsAnalysis: {
        rentalIncome: memoData.preview_data.rental_income,
        appreciation: memoData.preview_data.appreciation,
        taxSavings: memoData.preview_data.tax_savings,
        taxSavingsNote: memoData.preview_data.tax_savings_note,
      },
      sourceJurisdiction: memoData.preview_data.source_jurisdiction,
      destinationJurisdiction: memoData.preview_data.destination_jurisdiction,
    },

    'investment-committee': {
      verdict: memoData.preview_data.structure_optimization?.verdict,
      riskLevel: backendData?.risk_assessment?.risk_level || 'CRITICAL',
      criticalItemsCount: backendData?.all_mistakes?.filter((m: any) => m.severity === 'Critical').length || 0,
      opportunitiesCount: memoData.preview_data.opportunities_count || 0,
      riskFactorsCount: backendData?.all_mistakes?.length || 0,
      dataQuality: memoData.preview_data.peer_cohort_stats?.data_quality || 'strong',
      intelligenceDepth: memoData.memo_data?.kgv3_intelligence_used?.precedents || 0,
      totalExposure: memoData.preview_data.total_exposure || '$0',
      highPriorityCount: backendData?.all_mistakes?.filter((m: any) => m.severity === 'High').length || 0,
      mitigationTimeline: backendData?.mitigationTimeline || backendData?.risk_assessment?.mitigation_timeline || '14 days',
      sourceJurisdiction: memoData.preview_data.source_jurisdiction,
      destinationJurisdiction: memoData.preview_data.destination_jurisdiction,
      riskFactors: backendData?.all_mistakes || [],
      dueDiligence: memoData.preview_data.dd_checklist || [],
      liquidityAnalysis: memoData.preview_data.liquidity_analysis || undefined,
    },

    'memo-header': {
      ...baseProps,
      exposureClass: memoData.preview_data.exposure_class,
      totalSavings: memoData.preview_data.total_savings,
      precedentCount: memoData.memo_data?.kgv3_intelligence_used?.precedents || 0,
      sourceTaxRates: memoData.preview_data.source_tax_rates || memoData.preview_data.tax_differential?.source,
      destinationTaxRates: memoData.preview_data.destination_tax_rates || memoData.preview_data.tax_differential?.destination,
      taxDifferential: memoData.preview_data.tax_differential,
      valueCreation: computedProps.valueCreation,
      crossBorderTaxSavingsPct: computedProps.crossBorderAudit?.total_tax_savings_pct,
      crossBorderComplianceFlags: computedProps.crossBorderAudit?.compliance_flags,
      showTaxSavings: computedProps.showTheoreticalTaxSavings,
      optimalStructure: memoData.preview_data.structure_optimization?.optimal_structure,
      verdict: memoData.preview_data.structure_optimization?.verdict,
      viaNegativa: computedProps.viaNegativaContext,
    },

    'audit-verdict': {
      mistakes: backendData?.all_mistakes || memoData.preview_data.all_mistakes || [],
      opportunitiesCount: memoData.preview_data.opportunities_count,
      precedentCount: memoData.memo_data?.kgv3_intelligence_used?.precedents || 0,
      ddChecklist: memoData.preview_data.dd_checklist,
      sourceJurisdiction: memoData.preview_data.source_jurisdiction,
      destinationJurisdiction: memoData.preview_data.destination_jurisdiction,
      dataQuality: memoData.preview_data.peer_cohort_stats?.data_quality,
      dataQualityNote: memoData.preview_data.peer_cohort_stats?.data_quality_note,
      mitigationTimeline: backendData?.mitigationTimeline || backendData?.risk_assessment?.mitigation_timeline,
      riskAssessment: backendData?.risk_assessment || memoData.preview_data.risk_assessment,
      viaNegativa: computedProps.isViaNegativa ? computedProps.viaNegativaContext : undefined,
      scenarioTreeData: memoData.preview_data.scenario_tree_data,
    },

    'risk-radar': {
      ...computeRiskRadarScores(memoData, computedProps.isViaNegativa),
      isVetoed: computedProps.isViaNegativa,
    },

    'tax-dashboard-analysis': {
      totalSavings: memoData.preview_data.total_savings,
      exposureClass: memoData.preview_data.exposure_class,
      sourceJurisdiction: memoData.preview_data.source_jurisdiction,
      destinationJurisdiction: memoData.preview_data.destination_jurisdiction,
      sourceCity: memoData.preview_data.source_city,
      destinationCity: memoData.preview_data.destination_city,
      sourceTaxRates: memoData.preview_data.source_tax_rates || memoData.preview_data.tax_differential?.source,
      destinationTaxRates: memoData.preview_data.destination_tax_rates || memoData.preview_data.tax_differential?.destination,
      taxDifferential: memoData.preview_data.tax_differential,
      valueCreation: computedProps.valueCreation,
      sections: ['tax'],
    },

    'cross-border-audit': {
      audit: computedProps.crossBorderAudit,
      sourceJurisdiction: memoData.preview_data.source_jurisdiction,
      destinationJurisdiction: memoData.preview_data.destination_jurisdiction,
      viaNegativa: computedProps.viaNegativaContext,
    },

    'regime-intelligence': {
      regimeIntelligence: memoData.preview_data.regime_intelligence,  // Top-level field, NOT in peer_cohort_stats
      sourceJurisdiction: memoData.preview_data.source_jurisdiction,
      destinationJurisdiction: memoData.preview_data.destination_jurisdiction,
    },

    'wealth-projection': {
      data: memoData.preview_data.wealth_projection_data || {},
      rawAnalysis: memoData.preview_data.wealth_projection_analysis,
      structures: memoData.preview_data.structure_optimization?.structures_analyzed || [],
      structureProjections: memoData.preview_data.structure_projections || {},
      optimalStructureName: memoData.preview_data.structure_optimization?.optimal_structure?.name,
    },

    'peer-drivers': {
      opportunities: memoData.preview_data.all_opportunities || [],
      peerCount: memoData.preview_data.peer_cohort_stats?.total_peers || 0,
      onCitationClick: () => {},  // No-op in Personal mode
      citationMap: new Map<string, number>(),
      sourceJurisdiction: memoData.preview_data.source_jurisdiction,
      destinationJurisdiction: memoData.preview_data.destination_jurisdiction,
      sourceCountry: memoData.preview_data.source_country,
      destinationCountry: memoData.preview_data.destination_country,
      sourceCity: memoData.preview_data.source_city,
      destinationCity: memoData.preview_data.destination_city,
      peerCohortStats: memoData.preview_data.peer_cohort_stats,
      capitalFlowData: memoData.preview_data.capital_flow_data,
      sections: ['drivers'],
      isRelocating: memoData.preview_data.peer_cohort_stats?.is_relocating ?? memoData.preview_data.is_relocating ?? false,
    },

    'peer-cohort': {
      opportunities: memoData.preview_data.all_opportunities || [],
      peerCount: memoData.preview_data.peer_cohort_stats?.total_peers || 0,
      onCitationClick: () => {},
      citationMap: new Map<string, number>(),
      sourceJurisdiction: memoData.preview_data.source_jurisdiction,
      destinationJurisdiction: memoData.preview_data.destination_jurisdiction,
      sourceCountry: memoData.preview_data.source_country,
      destinationCountry: memoData.preview_data.destination_country,
      sourceCity: memoData.preview_data.source_city,
      destinationCity: memoData.preview_data.destination_city,
      peerCohortStats: memoData.preview_data.peer_cohort_stats,
      capitalFlowData: memoData.preview_data.capital_flow_data,
      sections: ['peer'],
      isRelocating: memoData.preview_data.peer_cohort_stats?.is_relocating ?? memoData.preview_data.is_relocating ?? false,
    },

    'capital-corridors': {
      opportunities: memoData.preview_data.all_opportunities || [],
      peerCount: memoData.preview_data.peer_cohort_stats?.total_peers || 0,
      onCitationClick: () => {},
      citationMap: new Map<string, number>(),
      sourceJurisdiction: memoData.preview_data.source_jurisdiction,
      destinationJurisdiction: memoData.preview_data.destination_jurisdiction,
      sourceCountry: memoData.preview_data.source_country,
      destinationCountry: memoData.preview_data.destination_country,
      sourceCity: memoData.preview_data.source_city,
      destinationCity: memoData.preview_data.destination_city,
      peerCohortStats: memoData.preview_data.peer_cohort_stats,
      capitalFlowData: memoData.preview_data.capital_flow_data,
      sections: ['corridor'],
      isRelocating: memoData.preview_data.peer_cohort_stats?.is_relocating ?? memoData.preview_data.is_relocating ?? false,
    },

    'geographic-distribution': {
      opportunities: memoData.preview_data.all_opportunities || [],
      peerCount: memoData.preview_data.peer_cohort_stats?.total_peers || 0,
      onCitationClick: () => {},
      citationMap: new Map<string, number>(),
      sourceJurisdiction: memoData.preview_data.source_jurisdiction,
      destinationJurisdiction: memoData.preview_data.destination_jurisdiction,
      sourceCountry: memoData.preview_data.source_country,
      destinationCountry: memoData.preview_data.destination_country,
      sourceCity: memoData.preview_data.source_city,
      destinationCity: memoData.preview_data.destination_city,
      peerCohortStats: memoData.preview_data.peer_cohort_stats,
      capitalFlowData: memoData.preview_data.capital_flow_data,
      sections: ['geographic'],
      isRelocating: memoData.preview_data.peer_cohort_stats?.is_relocating ?? memoData.preview_data.is_relocating ?? false,
    },

    'hnwi-trends': {
      trends: memoData.preview_data.hnwi_trends,
      confidence: memoData.preview_data.hnwi_trends_confidence,
      dataQuality: memoData.preview_data.hnwi_trends_data_quality,
      citations: memoData.preview_data.hnwi_trends_citations,
      sourceJurisdiction: memoData.preview_data.source_jurisdiction,
      destinationJurisdiction: memoData.preview_data.destination_jurisdiction,
      sourceCountry: memoData.preview_data.source_country,
      destinationCountry: memoData.preview_data.destination_country,
    },

    'peer-benchmark-ticker': (() => {
      // CRITICAL FIX: failure_modes are nested in scenario_tree_data.doctrine_metadata
      const doctrineMetadata = memoData.preview_data.scenario_tree_data?.doctrine_metadata;
      const failurePatterns = (doctrineMetadata?.failure_modes || []).map((f: any) => ({
        mode: f.mode || '',
        doctrinBook: f.doctrine_book || '',
        severity: f.severity || 'MEDIUM',
        description: f.description || '',
        nightmareName: f.nightmare_name,
      }));

      return {
        precedentCount: memoData.memo_data?.kgv3_intelligence_used?.precedents || 0,
        failurePatterns,
        failureModeCount: doctrineMetadata?.failure_mode_count || failurePatterns.length,
        totalRiskFlags: doctrineMetadata?.risk_flags_total || 0,
        sourceJurisdiction: memoData.preview_data.source_jurisdiction,
        destinationJurisdiction: memoData.preview_data.destination_jurisdiction,
        antifragilityAssessment: doctrineMetadata?.antifragility_assessment,
        patternIntelligence: memoData.preview_data.pattern_intelligence,
      };
    })(),

    'liquidity-trap': (() => {
      // CRITICAL FIX: Use acquisition_audit from crossBorderAudit (not real_asset_audit)
      // acquisition_audit is nested: wealth_projection_data.starting_position.cross_border_audit_summary.acquisition_audit
      const acqAudit = computedProps.crossBorderAudit?.acquisition_audit;
      if (!acqAudit) {
        return {
          capitalIn: 0,
          capitalOut: 0,
          primaryBarrier: '',
          primaryBarrierCost: 0,
          secondaryBarrier: '',
          secondaryBarrierCost: 0,
          dayOneLossPct: 0,
          dayOneLossNote: '',
          assetLabel: `${memoData.preview_data.destination_jurisdiction || 'Destination'} Residential Property`,
        };
      }

      const propertyValue = acqAudit.property_value || 0;
      const totalCost = acqAudit.total_acquisition_cost || 0;
      const absd = acqAudit.absd_additional_stamp_duty || 0;
      const bsd = acqAudit.bsd_stamp_duty || 0;
      const otherCosts = totalCost - propertyValue - absd - bsd;

      const hasMajorABSD = absd > 0;
      const primaryBarrierLabel = hasMajorABSD
        ? `ABSD (${((absd / propertyValue) * 100).toFixed(0)}%)`
        : `Stamp Duties`;
      const primaryBarrierCost = hasMajorABSD ? absd : (absd + bsd);

      const secondaryLabel = hasMajorABSD
        ? (bsd > 0 ? `BSD + Transfer Taxes` : (computedProps.hasUSWorldwideTax ? 'US Worldwide Tax Drag' : undefined))
        : (computedProps.hasUSWorldwideTax ? 'US Worldwide Tax Drag' : undefined);
      const secondaryCost = hasMajorABSD
        ? (bsd > 0 ? bsd + Math.max(0, otherCosts) : 0)
        : 0;

      const capitalOut = propertyValue;

      return {
        capitalIn: totalCost,
        capitalOut,
        primaryBarrier: primaryBarrierLabel,
        primaryBarrierCost,
        secondaryBarrier: secondaryLabel,
        secondaryBarrierCost: secondaryCost,
        dayOneLossPct: acqAudit.day_one_loss_pct || computedProps.viaNegativaContext?.dayOneLoss || 0,
        dayOneLossNote: computedProps.crossBorderAudit?.bsd_note || (acqAudit as any)?.day_one_loss_label,
        assetLabel: `${memoData.preview_data.destination_jurisdiction || 'Destination'} Residential Property`,
      };
    })(),

    'transparency-regime': {
      transparencyData: memoData.preview_data.transparency_data,
      content: memoData.preview_data.transparency_regime_impact,
      sourceJurisdiction: memoData.preview_data.source_jurisdiction,
      destinationJurisdiction: memoData.preview_data.destination_jurisdiction,
    },

    'real-asset-audit': {
      data: memoData.preview_data.real_asset_audit,
      sourceJurisdiction: memoData.preview_data.source_jurisdiction,
      destinationJurisdiction: memoData.preview_data.destination_jurisdiction,
      transactionValue: memoData.preview_data.deal_overview?.target_size
        ? parseFloat(memoData.preview_data.deal_overview.target_size.replace(/[^0-9.]/g, '')) * 1000000
        : 0,
    },

    'crisis-resilience': {
      crisisData: memoData.preview_data.crisis_data,
      content: memoData.preview_data.crisis_resilience_stress_test,
      sourceJurisdiction: memoData.preview_data.source_jurisdiction,
      destinationJurisdiction: memoData.preview_data.destination_jurisdiction,
    },

    'golden-visa-intelligence': {
      intelligence: memoData.preview_data.golden_visa_intelligence,
      sourceJurisdiction: memoData.preview_data.source_jurisdiction,
      destinationJurisdiction: memoData.preview_data.destination_jurisdiction,
    },

    'golden-visa-basic': {
      destinationDrivers: memoData.preview_data.destination_drivers,
      destinationJurisdiction: memoData.preview_data.destination_jurisdiction,
    },

    'structure-comparison': {
      structureOptimization: memoData.preview_data.structure_optimization,
      sourceJurisdiction: memoData.preview_data.source_jurisdiction,
      destinationJurisdiction: memoData.preview_data.destination_jurisdiction,
    },

    'heir-management': {
      data: memoData.preview_data.heir_management_data || {},
      rawAnalysis: memoData.preview_data.heir_management_analysis,
    },

    'scenario-tree': {
      data: memoData.preview_data.scenario_tree_data || {},
      rawAnalysis: memoData.preview_data.scenario_tree_analysis,
      viaNegativa: computedProps.isViaNegativa ? computedProps.viaNegativaContext : undefined,
    },

    'tax-implementation': {
      totalSavings: memoData.preview_data.total_savings,
      exposureClass: memoData.preview_data.exposure_class,
      sourceJurisdiction: memoData.preview_data.source_jurisdiction,
      destinationJurisdiction: memoData.preview_data.destination_jurisdiction,
      sourceCity: memoData.preview_data.source_city,
      destinationCity: memoData.preview_data.destination_city,
      executionSequence: memoData.preview_data.execution_sequence,
      sections: ['implementation'],
    },

    'references': {
      references: memoData.preview_data.legal_references,
      developmentsCount: 1875, // HNWI World developments count
      precedentCount: memoData.memo_data?.kgv3_intelligence_used?.precedents || 0,
    },

    'regulatory-sources': {
      // CRITICAL FIX: Check both regulatory_citations and legal_references.regulatory_sources
      citations: memoData.preview_data.regulatory_citations ||
                 memoData.preview_data.legal_references?.regulatory_sources ||
                 [],
    },
  };

  return propMappings[sectionId] || baseProps;
}
