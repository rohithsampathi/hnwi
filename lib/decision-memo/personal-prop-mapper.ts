import { PdfMemoData } from '@/lib/pdf/pdf-types';
import { computeRiskRadarScores } from './compute-risk-radar-scores';
import { resolveIntelligenceBasisCounts } from './resolve-intelligence-basis-counts';

/**
 * Maps section IDs to their specific component props
 * This ensures each component gets exactly what it needs
 */
export function getComponentProps(
  sectionId: string,
  memoData: PdfMemoData,
  backendData: any,
  intakeId: string,
  computedProps: any,
  onCitationClick?: (citationId: string) => void,
  citationMap?: Map<string, number> | Record<string, any>
): Record<string, any> {
  const resolvedCitationMap = citationMap || new Map<string, number>();
  const formatPct = (value: unknown): string | undefined => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return `${value.toFixed(2)}%`;
    }
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value.replace(/[%,$,]/g, '').trim());
      return Number.isFinite(parsed) ? `${parsed.toFixed(2)}%` : undefined;
    }
    return undefined;
  };

  const formatUsdCompact = (value: unknown): string | undefined => {
    const numeric =
      typeof value === 'number'
        ? value
        : typeof value === 'string'
          ? Number(value.replace(/[$,]/g, '').trim())
          : NaN;
    if (!Number.isFinite(numeric)) {
      return undefined;
    }
    if (Math.abs(numeric) >= 1_000_000) {
      return `~$${(numeric / 1_000_000).toFixed(2)}M`;
    }
    if (Math.abs(numeric) >= 1_000) {
      return `$${Math.round(numeric / 1_000)}K`;
    }
    return `$${Math.round(numeric).toLocaleString()}`;
  };

  const toNumberOrUndefined = (value: unknown): number | undefined => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim()) {
      const cleaned = value.trim();
      const multiplier = /m\b/i.test(cleaned) ? 1_000_000 : /k\b/i.test(cleaned) ? 1_000 : 1;
      const parsed = Number(cleaned.replace(/[^0-9.-]/g, ''));
      return Number.isFinite(parsed) ? parsed * multiplier : undefined;
    }
    return undefined;
  };

  const intelligenceBasisCounts = resolveIntelligenceBasisCounts({
    memoData,
    backendData,
    fullArtifact: backendData?.fullArtifact || backendData?.full_artifact,
  });

  const executiveSummary = memoData.preview_data.executive_summary || {};
  const startingPosition = memoData.preview_data.wealth_projection_data?.starting_position || {};
  const scenarioTreeData = memoData.preview_data.scenario_tree_data || {};
  const generatedAt =
    memoData.preview_data.assumption_ledger?.fix_date ||
    (memoData.preview_data as any).dm64_manual_repair?.repaired_at ||
    memoData.generated_at;
  const routeEvidenceCount =
    intelligenceBasisCounts.corridorSignalsCount ||
    memoData.preview_data.precedent_count ||
    memoData.preview_data.peer_cohort_stats?.direct_route_precedent_count ||
    0;

  const formattedAnnualRentalIncome =
    formatPct(startingPosition.rental_yield_pct) ||
    memoData.preview_data.annual_rental_income_formatted ||
    memoData.preview_data.rental_income ||
    (typeof memoData.preview_data.annual_rental_income === 'number'
      ? `$${memoData.preview_data.annual_rental_income.toLocaleString()}`
      : undefined);

  const formattedAnnualAppreciation =
    formatPct(startingPosition.appreciation_rate_pct) ||
    memoData.preview_data.annual_appreciation_formatted ||
    memoData.preview_data.appreciation ||
    (typeof memoData.preview_data.annual_appreciation === 'number'
      ? `$${memoData.preview_data.annual_appreciation.toLocaleString()}`
      : undefined);

  const formattedTaxSavings =
    executiveSummary.underwriting_snapshot
      ? '$0'
      : memoData.preview_data.tax_savings ||
        memoData.preview_data.tax_differential?.savings ||
        memoData.preview_data.total_savings;

  const buildAnnualReturnHeadlineMetric = () => {
    const transactionValue =
      toNumberOrUndefined(startingPosition.transaction_value) ||
      toNumberOrUndefined((memoData.preview_data as any)?.transaction_value);
    const netYieldPct = toNumberOrUndefined(startingPosition.net_rental_yield_pct);
    const appreciationRatePct = toNumberOrUndefined(startingPosition.appreciation_rate_pct);
    const annualNetIncome =
      toNumberOrUndefined(
        memoData.preview_data.wealth_projection_data?.starting_position?.cross_border_audit_summary?.net_yield_audit?.annual_net_income
      );

    const computedAnnualNetIncome =
      annualNetIncome
      ?? (transactionValue !== undefined && netYieldPct !== undefined
        ? transactionValue * (netYieldPct / 100)
        : undefined);
    const computedAnnualAppreciation =
      transactionValue !== undefined && appreciationRatePct !== undefined
        ? transactionValue * (appreciationRatePct / 100)
        : undefined;

    if (
      computedAnnualNetIncome === undefined
      && computedAnnualAppreciation === undefined
    ) {
      return undefined;
    }

    const annualReturnTotal =
      (computedAnnualNetIncome ?? 0)
      + (computedAnnualAppreciation ?? 0);
    const formatted = formatUsdCompact(annualReturnTotal);
    if (!formatted) {
      return undefined;
    }

    const netIncomeFormatted = formatUsdCompact(computedAnnualNetIncome);
    const appreciationFormatted = formatUsdCompact(computedAnnualAppreciation);
    const description =
      netIncomeFormatted && appreciationFormatted
        ? `${netIncomeFormatted} net income + ${appreciationFormatted} appreciation basis`
        : 'Net annual income plus appreciation basis on the validated route';

    return {
      label: 'Underwritten Annual Return',
      value: formatted,
      description,
    };
  };

  const totalExposure =
    memoData.preview_data.total_exposure ||
    memoData.preview_data.risk_assessment?.total_exposure_formatted ||
    '$0';

  const routeDataQualityNote =
    executiveSummary.evidence_basis_note ||
    memoData.preview_data.data_quality_note ||
    memoData.preview_data.peer_cohort_stats?.data_quality_note;

  const computedLiquidityAnalysis = (() => {
    const nativeLiquidity =
      memoData.preview_data.liquidity_analysis ||
      memoData.preview_data.liquidity_trap_analysis;
    if (nativeLiquidity && typeof nativeLiquidity === 'object') {
      return nativeLiquidity;
    }

    const acqAudit = computedProps.crossBorderAudit?.acquisition_audit;
    if (!acqAudit) {
      return undefined;
    }

    const propertyValue = acqAudit.property_value || 0;
    const totalCost = acqAudit.total_acquisition_cost || 0;
    const totalStampDuties = acqAudit.total_stamp_duties || 0;
    const transferRate =
      acqAudit.transfer_tax_schedule_rate_pct ||
      acqAudit.applied_transfer_tax_rate_pct ||
      0;
    const barrierCost = totalStampDuties || Math.max(0, totalCost - propertyValue);
    const barrierLabel =
      transferRate > 0
        ? `DLD Registration Fee (${transferRate.toFixed(1)}%)`
        : 'Stamp Duties';

    return {
      capitalDeployed: formatUsdCompact(totalCost) || '$0',
      barrierCosts: formatUsdCompact(barrierCost) || '$0',
      capitalDestroyed: formatUsdCompact(barrierCost) || '$0',
      recoverableCapital: formatUsdCompact(propertyValue) || '$0',
      trappedPercentage: `${(acqAudit.day_one_loss_pct || transferRate || 0).toFixed(2)}%`,
      description: `${memoData.preview_data.destination_jurisdiction || 'Destination'} Residential Property`,
      barrierLabel,
    };
  })();

  const rawRouteRiskFactors =
    backendData?.all_mistakes ||
    memoData.preview_data.all_mistakes ||
    [];

  const routeRiskFactors = rawRouteRiskFactors.map((risk: any, index: number) => ({
    id: risk.id || `risk-${index + 1}`,
    severity:
      typeof risk.severity === 'string'
        ? `${risk.severity.charAt(0)}${risk.severity.slice(1).toLowerCase()}`
        : typeof risk.urgency === 'string'
          ? `${risk.urgency.charAt(0)}${risk.urgency.slice(1).toLowerCase()}`
          : 'High',
    title: risk.title || risk.fix || 'Route risk',
    description: risk.description || risk.cost || risk.notes || 'Route correction required.',
    category: risk.category || risk.urgency || risk.status,
  }));

  const rawRouteDueDiligence = Array.isArray(memoData.preview_data.dd_checklist)
    ? memoData.preview_data.dd_checklist
    : memoData.preview_data.dd_checklist?.items ||
      memoData.preview_data.programmatic_dd_checklist ||
      [];

  const routeDueDiligence = rawRouteDueDiligence.map((item: any, index: number) => ({
    id: item.id || `dd-${index + 1}`,
    priority:
      typeof item.priority === 'string'
        ? `${item.priority.charAt(0)}${item.priority.slice(1).toLowerCase()}`
        : 'High',
    timeline:
      item.timeline ||
      (typeof item.deadline_days === 'number' ? `${item.deadline_days} days` : undefined) ||
      item.status ||
      'Required before close',
    advisor:
      item.owner_label ||
      item.responsible_label ||
      item.advisor ||
      item.owner ||
      item.responsible ||
      'Assigned lead',
    task: item.task || item.item || 'Execution gate',
    category: item.category || 'GENERAL',
    status: item.status || 'required_before_close',
  }));

  const annualReturnHeadlineMetric = buildAnnualReturnHeadlineMetric();
  const headlineMetric =
    (executiveSummary.headline_metric?.label === 'Probability-Weighted Route Value'
      ? annualReturnHeadlineMetric
      : executiveSummary.headline_metric) ||
    annualReturnHeadlineMetric ||
    (() => {
      const formatted = formatUsdCompact(scenarioTreeData.expected_value_usd);
      return formatted
        ? {
            label: 'Probability-Weighted Route Value',
            value: formatted,
            description: 'Expected value of the validated route',
          }
        : undefined;
    })();

  const underwritingSnapshot =
    executiveSummary.underwriting_snapshot ||
    [
      { label: 'Gross Yield', value: formattedAnnualRentalIncome },
      { label: 'Net Yield', value: formatPct(startingPosition.net_rental_yield_pct) },
      { label: 'Appreciation Basis', value: formattedAnnualAppreciation },
      { label: 'Tax Arbitrage', value: '$0', note: 'No relocation-linked credit taken' },
    ].filter((item) => item.value);

  const baseProps = {
    intakeId,
    memoData,
    generatedAt,
    sourceJurisdiction: memoData.preview_data?.source_jurisdiction,
    destinationJurisdiction: memoData.preview_data?.destination_jurisdiction,
  };

  const houseGradeBaseProps = {
    data:
      memoData.preview_data.house_grade_memo ||
      backendData?.fullArtifact?.house_grade_memo ||
      backendData?.fullArtifact?.artifact?.house_grade_memo ||
      backendData?.artifact?.house_grade_memo,
    previewData: memoData.preview_data as Record<string, any>,
    references: memoData.preview_data.legal_references,
    developmentsCount: intelligenceBasisCounts.developmentsCount,
    precedentCount: routeEvidenceCount,
    routeEvidenceBasisNote: routeDataQualityNote,
    sourceJurisdiction: memoData.preview_data.source_jurisdiction,
    destinationJurisdiction: memoData.preview_data.destination_jurisdiction,
    onCitationClick,
    citationMap: resolvedCitationMap,
  };

  // Section-specific prop mappings
  const propMappings: Record<string, Record<string, any>> = {
    'house-signal': {
      ...houseGradeBaseProps,
      chapterId: 'hero',
    },
    'house-governing-correction': {
      ...houseGradeBaseProps,
      chapterId: 'governing-correction',
    },
    'house-read': {
      ...houseGradeBaseProps,
      chapterId: 'house-read',
    },
    'house-validated-route': {
      ...houseGradeBaseProps,
      chapterId: 'validated-route',
    },
    'house-live-market-crisis': {
      ...houseGradeBaseProps,
      chapterId: 'live-market-crisis',
    },
    'house-continuity-office-carry': {
      ...houseGradeBaseProps,
      chapterId: 'continuity-office-carry',
    },
    'house-evidence-ledger': {
      ...houseGradeBaseProps,
      chapterId: 'evidence',
    },

    'audit-overview': {
      developmentsCount: intelligenceBasisCounts.developmentsCount,
      precedentCount: routeEvidenceCount,
      intelligenceBasisNote: routeDataQualityNote,
      sourceJurisdiction: memoData.preview_data.source_jurisdiction,
      destinationJurisdiction: memoData.preview_data.destination_jurisdiction,
      sourceCity: memoData.preview_data.source_city,
      destinationCity: memoData.preview_data.destination_city,
      // Primary field: preview_data.thesis_summary (backend standard)
      thesisSummary: memoData.preview_data.thesis_summary ||
                      backendData?.fullArtifact?.thesisSummary ||
                      memoData.preview_data.decision_thesis ||
                      memoData.preview_data.investment_thesis,
      exposureClass: memoData.preview_data.exposure_class,
      totalSavings: memoData.preview_data.total_savings,
      optimalStructure: memoData.preview_data.structure_optimization?.optimal_structure,
      verdict: memoData.preview_data.structure_optimization?.verdict,
      thesisArtifact:
        backendData?.fullArtifact?.artifact ||
        backendData?.fullArtifact ||
        backendData?.artifact,
      inputSnapshot:
        memoData.preview_data.input_snapshot ||
        backendData?.fullArtifact?.input_snapshot ||
        backendData?.fullArtifact?.artifact?.input_snapshot ||
        backendData?.artifact?.input_snapshot,
      // Try multiple possible thesis field locations
      fullThesis: backendData?.thesis ||
                  backendData?.investment_thesis ||
                  backendData?.fullArtifact?.investment_thesis ||
                  backendData?.fullArtifact?.thesis ||
                  memoData.preview_data.investment_thesis ||
                  memoData.preview_data.thesis ||
                  memoData.preview_data.decision_context ||
                  memoData.preview_data.user_input,
      // New fields from backend (rails, constraints)
      rails: backendData?.rails,
      constraints: backendData?.constraints,
      showMap: true, // Personal mode - show full page map visualization
    },

    'overview': {
      verdict:
        backendData?.risk_assessment?.structure_verdict ||
        memoData.preview_data.risk_assessment?.structure_verdict ||
        memoData.preview_data.structure_optimization?.verdict,
      generatedAt,
      intakeId,
      totalValueCreation: headlineMetric?.value || memoData.preview_data.total_savings,
      headlineMetric,
      strategyLabel: executiveSummary.strategy_label || memoData.preview_data.exposure_class,
      optimalStructure: memoData.preview_data.structure_optimization?.optimal_structure,
      intelligenceDepth: routeEvidenceCount,
      intelligenceSummaryNote: routeDataQualityNote,
      underwritingSnapshot,
      returnsAnalysis: {
        rentalIncome: formattedAnnualRentalIncome,
        appreciation: formattedAnnualAppreciation,
        taxSavings: formattedTaxSavings,
        taxSavingsNote: memoData.preview_data.tax_savings_note,
      },
      sourceJurisdiction: memoData.preview_data.source_jurisdiction,
      destinationJurisdiction: memoData.preview_data.destination_jurisdiction,
    },

    'investment-committee': {
      verdict:
        backendData?.risk_assessment?.structure_verdict ||
        memoData.preview_data.risk_assessment?.structure_verdict ||
        memoData.preview_data.structure_optimization?.verdict,
      riskLevel: backendData?.risk_assessment?.risk_level || 'CRITICAL',
      criticalItemsCount:
        backendData?.risk_assessment?.critical_items ||
        routeRiskFactors.filter((m: any) => m.severity === 'Critical').length ||
        0,
      opportunitiesCount: memoData.preview_data.opportunities_count || 0,
      riskFactorsCount:
        backendData?.risk_assessment?.risk_factors_count ||
        routeRiskFactors.length ||
        0,
      dataQuality: memoData.preview_data.peer_cohort_stats?.data_quality || 'strong',
      intelligenceDepth: routeEvidenceCount,
      dataQualityNote: routeDataQualityNote,
      totalExposure,
      highPriorityCount:
        backendData?.risk_assessment?.high_items ||
        backendData?.risk_assessment?.high_priority ||
        routeRiskFactors.filter((m: any) => m.severity === 'High').length ||
        0,
      priorityRiskCount:
        backendData?.risk_assessment?.priority_risks_total ||
        routeRiskFactors.filter((m: any) => m.severity === 'High' || m.severity === 'Critical').length ||
        0,
      mitigationTimeline: backendData?.mitigationTimeline || backendData?.risk_assessment?.mitigation_timeline || '14 days',
      sourceJurisdiction: memoData.preview_data.source_jurisdiction,
      destinationJurisdiction: memoData.preview_data.destination_jurisdiction,
      riskFactors: routeRiskFactors,
      dueDiligence: {
        total_items: routeDueDiligence.length,
        items: routeDueDiligence,
      },
      liquidityAnalysis: computedLiquidityAnalysis,
    },

    'memo-header': {
      ...baseProps,
      exposureClass: memoData.preview_data.exposure_class,
      totalSavings: memoData.preview_data.total_savings,
      precedentCount: routeEvidenceCount,
      sourceTaxRates: memoData.preview_data.source_tax_rates || memoData.preview_data.tax_differential?.source,
      destinationTaxRates: memoData.preview_data.destination_tax_rates || memoData.preview_data.tax_differential?.destination,
      taxDifferential: memoData.preview_data.tax_differential,
      valueCreation: computedProps.valueCreation,
      headlineMetric: computedProps.routeHeadlineMetric || headlineMetric,
      evidenceBasisNote: computedProps.routeEvidenceBasisNote || routeDataQualityNote,
      underwritingSnapshot: computedProps.routeUnderwritingSnapshot || underwritingSnapshot,
      crossBorderTaxSavingsPct: computedProps.crossBorderMetrics.displayTaxSavingsPct,
      crossBorderComplianceFlags: computedProps.crossBorderAudit?.compliance_flags,
      showTaxSavings: computedProps.showTheoreticalTaxSavings,
      optimalStructure: memoData.preview_data.structure_optimization?.optimal_structure,
      verdict:
        backendData?.risk_assessment?.structure_verdict ||
        memoData.preview_data.risk_assessment?.structure_verdict ||
        memoData.preview_data.structure_optimization?.verdict,
      viaNegativa: computedProps.viaNegativaContext,
    },

    'audit-verdict': {
      mistakes: backendData?.all_mistakes || memoData.preview_data.all_mistakes || [],
      opportunitiesCount: memoData.preview_data.opportunities_count,
      precedentCount: routeEvidenceCount,
      ddChecklist: {
        total_items: routeDueDiligence.length,
        items: routeDueDiligence,
      },
      sourceJurisdiction: memoData.preview_data.source_jurisdiction,
      destinationJurisdiction: memoData.preview_data.destination_jurisdiction,
      dataQuality: memoData.preview_data.data_quality || memoData.preview_data.peer_cohort_stats?.data_quality,
      dataQualityNote: routeDataQualityNote,
      mitigationTimeline: backendData?.mitigationTimeline || backendData?.risk_assessment?.mitigation_timeline,
      riskAssessment: {
        ...(backendData?.risk_assessment || memoData.preview_data.risk_assessment || {}),
        high_items:
          backendData?.risk_assessment?.high_items ||
          backendData?.risk_assessment?.high_priority ||
          routeRiskFactors.filter((m: any) => m.severity === 'High').length ||
          0,
        priority_risks_total:
          backendData?.risk_assessment?.priority_risks_total ||
          routeRiskFactors.filter((m: any) => m.severity === 'High' || m.severity === 'Critical').length ||
          0,
      },
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
      onCitationClick,
      citationMap: resolvedCitationMap,
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
      onCitationClick,
      citationMap: resolvedCitationMap,
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
      onCitationClick,
      citationMap: resolvedCitationMap,
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
      onCitationClick,
      citationMap: resolvedCitationMap,
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
        precedentCount: intelligenceBasisCounts.corridorSignalsCount || 0,
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
      transactionValue:
        toNumberOrUndefined(memoData.preview_data.wealth_projection_data?.starting_position?.transaction_value)
        ?? toNumberOrUndefined((memoData.preview_data as any)?.transaction_value)
        ?? toNumberOrUndefined((memoData.preview_data as any)?.deal_overview?.transaction_value)
        ?? toNumberOrUndefined((memoData.preview_data as any)?.deal_overview?.target_size)
        ?? 0,
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
      developmentsCount: intelligenceBasisCounts.developmentsCount,
      precedentCount: intelligenceBasisCounts.corridorSignalsCount || 0,
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
