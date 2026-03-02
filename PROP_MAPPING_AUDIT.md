# Personal Mode Prop Mapping Audit

Systematically checking each section's props against backend `preview_data` structure.

## Backend Data Structure (from pdf-types.ts)

```typescript
interface PdfPreviewData {
  // Core fields
  source_jurisdiction, destination_jurisdiction, exposure_class
  verdict, verdict_rationale, risk_level
  total_savings, precedent_count

  // Tax
  tax_differential, source_tax_rates, destination_tax_rates

  // Risk
  risk_factors, all_mistakes, risk_assessment

  // Peer
  peer_cohort_stats, capital_flow_data, peer_intelligence_data

  // Experts 7-15
  transparency_data, crisis_data, regime_intelligence
  wealth_projection_data, scenario_tree_data, heir_management_data
  real_asset_audit, golden_visa_intelligence
  hnwi_trends, hnwi_trends_analysis

  // Structure
  structure_optimization, deal_overview

  // Cross-border
  cross_border_audit
}
```

---

## Section-by-Section Prop Audit

### ✅ 1. memo-header (MemoHeader)

**Component expects**:
- intakeId, memoData, generatedAt
- exposureClass, totalSavings, precedentCount
- sourceTaxRates, destinationTaxRates, taxDifferential
- valueCreation, verdict, optimalStructure
- crossBorderTaxSavingsPct, crossBorderComplianceFlags, showTaxSavings

**Prop mapper provides**: ✅ ALL CORRECT
```typescript
exposureClass: memoData.preview_data.exposure_class
totalSavings: memoData.preview_data.total_savings
verdict: memoData.preview_data.structure_optimization?.verdict
```

---

### ✅ 2. audit-verdict (Page2AuditVerdict)

**Component expects**:
- verdict, verdictRationale, riskLevel
- riskFactors, allMistakes, dueDiligence
- mitigationTimeline, riskAssessment

**Prop mapper provides**: ✅ ALL CORRECT
```typescript
verdict: memoData.preview_data.verdict
riskFactors: memoData.preview_data.risk_factors || []
mitigationTimeline: computedProps.mitigationTimeline
```

---

### ✅ 3. risk-radar (RiskRadarChart)

**Component expects**:
- riskScores: { operational, market, regulatory, structural, execution, currency }

**Prop mapper provides**: ✅ COMPUTED
```typescript
riskScores: computeRiskRadarScores(memoData)
```

---

### ✅ 4. tax-dashboard-analysis (Page1TaxDashboard)

**Component expects**:
- sections: ['tax']
- + all tax-related fields

**Prop mapper provides**: ✅ ALL CORRECT
```typescript
sourceTaxRates: memoData.preview_data.source_tax_rates
destinationTaxRates: memoData.preview_data.destination_tax_rates
taxDifferential: memoData.preview_data.tax_differential
```

---

### ⚠️ 5. cross-border-audit (CrossBorderTaxAudit)

**Component expects**:
- crossBorderAudit object

**Prop mapper provides**:
```typescript
crossBorderAudit: memoData.preview_data.cross_border_audit
```

**ISSUE**: Backend field is `cross_border_audit` but not always present.

**Fix needed**: Add null check in component or hide section if missing.

---

### ✅ 6. regime-intelligence (RegimeIntelligenceSection)

**Component expects**:
- regimes, programs, thresholds

**Prop mapper provides**: ✅ ALL CORRECT
```typescript
regimes: computedProps.regimeIntelligence?.regimes || []
```

---

### ✅ 7. wealth-projection (WealthProjectionSection)

**Component expects**:
- wealthProjectionData

**Prop mapper provides**: ✅ CORRECT
```typescript
wealthProjectionData: memoData.preview_data.wealth_projection_data
```

---

### ⚠️ 8-11. peer-* sections (Page3PeerIntelligence)

**Component expects**:
- sections: ['drivers' | 'peer' | 'corridor' | 'geographic']
- peerCohortStats, capitalFlowData

**Prop mapper provides**:
```typescript
peerCohortStats: memoData.preview_data.peer_cohort_stats
capitalFlowData: memoData.preview_data.capital_flow_data
```

**POTENTIAL ISSUE**: `peer_cohort_stats` might have missing fields:
- `total_hnwis` vs `total_peers`
- `avg_net_worth` formatting

**Fix**: Check component for field name variations.

---

### ✅ 12. hnwi-trends (HNWITrendsSection)

**Component expects**:
- trends, confidence, dataQuality, citations

**Prop mapper provides**: ✅ ALL CORRECT
```typescript
trends: memoData.preview_data.hnwi_trends
confidence: memoData.preview_data.hnwi_trends_confidence
```

---

### ⚠️ 13. peer-benchmark-ticker (PeerBenchmarkTicker)

**Component expects**:
- precedentCount, failurePatterns, failureModeCount
- totalRiskFlags, patternIntelligence

**Prop mapper provides** (JUST FIXED):
```typescript
precedentCount: memoData.memo_data?.kgv3_intelligence_used?.precedents || 0
failurePatterns: memoData.preview_data.failure_modes || []
```

**POTENTIAL ISSUE**: Backend might not have `failure_modes` field.

**Backend field check needed**: Is it `failure_modes` or `all_mistakes`?

---

### ✅ 14. liquidity-trap (LiquidityTrapFlowchart)

**Component expects**:
- capitalIn, capitalOut
- primaryBarrier, secondaryBarrier + costs
- dayOneLossPct, assetLabel

**Prop mapper provides**: ✅ COMPUTED from real_asset_audit
```typescript
capitalIn: totalCost (from acquisition_analysis)
primaryBarrier: BSD/ABSD labels
```

---

### ✅ 15. transparency-regime (TransparencyRegimeSection)

**Component expects**:
- transparencyData, content

**Prop mapper provides**: ✅ CORRECT
```typescript
transparencyData: memoData.preview_data.transparency_data
content: memoData.preview_data.transparency_regime_impact
```

---

### ✅ 16. real-asset-audit (RealAssetAuditSection)

**Component expects**:
- data (RealAssetAuditData)

**Prop mapper provides**: ✅ CORRECT
```typescript
data: memoData.preview_data.real_asset_audit
```

---

### ✅ 17. crisis-resilience (CrisisResilienceSection)

**Component expects**:
- crisisData, content

**Prop mapper provides**: ✅ CORRECT
```typescript
crisisData: memoData.preview_data.crisis_data
content: memoData.preview_data.crisis_resilience_stress_test
```

---

### ✅ 18-19. golden-visa (GoldenVisaIntelligenceSection / GoldenVisaSection)

**Component expects**:
- intelligence (for KGv3 version)
- destinationDrivers (for basic version)

**Prop mapper provides**: ✅ CORRECT
```typescript
intelligence: memoData.preview_data.golden_visa_intelligence
destinationDrivers: memoData.preview_data.destination_drivers
```

---

### ✅ 20. structure-comparison (StructureComparisonMatrix)

**Component expects**:
- structureOptimization

**Prop mapper provides**: ✅ CORRECT
```typescript
structureOptimization: memoData.preview_data.structure_optimization
```

---

### ✅ 21. heir-management (HeirManagementSection)

**Component expects**:
- heirManagementData

**Prop mapper provides**: ✅ CORRECT
```typescript
heirManagementData: memoData.preview_data.heir_management_data
```

---

### ✅ 22. scenario-tree (ScenarioTreeSection)

**Component expects**:
- scenarioTreeData

**Prop mapper provides**: ✅ CORRECT
```typescript
scenarioTreeData: memoData.preview_data.scenario_tree_data
```

---

### ✅ 23. tax-implementation (Page1TaxDashboard)

**Component expects**:
- sections: ['implementation']
- implementationRoadmapData

**Prop mapper provides**: ✅ CORRECT
```typescript
sections: ['implementation'] (from componentProps)
implementationRoadmapData: memoData.preview_data.implementation_roadmap_data
```

---

### ⚠️ 24-25. references/regulatory-sources

**Component expects**:
- citations, sources

**Prop mapper provides**:
```typescript
citations: computedProps.allCitations || []
```

**POTENTIAL ISSUE**: `computedProps.allCitations` might be empty if citations aren't extracted.

---

## Critical Issues Found

### 🔴 ISSUE 1: Field Name Variations

**Problem**: Backend uses different field names in different contexts:
- `total_hnwis` vs `total_peers`
- `capital_gains` vs `cgt`
- `program_name` vs `name`

**Fix**: Components must handle both variations.

**Action**: Add fallback accessors in components:
```typescript
const totalHnwis = data.total_hnwis || data.total_peers || 0;
```

---

### 🔴 ISSUE 2: Missing Optional Fields

**Problem**: Not all audits have all expert outputs.

**Current handling**: `shouldRender` checks in section-map.ts

**Missing checks**:
- `cross_border_audit` - should check if exists before showing
- `failure_modes` - might not exist, causing PeerBenchmarkTicker crash
- `golden_visa_intelligence` - already has check ✅

**Action**: Add existence checks for optional sections.

---

### 🔴 ISSUE 3: Empty Arrays vs Undefined

**Problem**: Backend might return `[]` or `undefined` for missing data.

**Current handling**: Using `|| []` fallbacks

**Issue**: Empty array still renders component with "no data" instead of hiding.

**Action**: Update `shouldRender` to check array length:
```typescript
shouldRender: (data) => {
  const items = data.preview_data.some_array || [];
  return items.length > 0;
}
```

---

## FIXES APPLIED (Feb 2026)

### ✅ Fix 1: PeerCohortStats Interface (CRITICAL)

**Problem**: pdf-types.ts had WRONG field names (total_hnwis, recent_movements, average_value)
**Reality**: Backend uses total_peers, last_6_months, avg_deal_value_m

**File**: `/Users/skyg/Desktop/Code/hnwi-chronicles/lib/pdf/pdf-types.ts`

**Fix Applied**:
```typescript
export interface PeerCohortStats {
  // Core metrics (CORRECT field names from backend)
  total_peers: number;
  last_6_months: number;
  avg_deal_value_m: number;
  // Driver analysis
  drivers: {
    tax_optimization: number;
    asset_protection: number;
    lifestyle: number;
  };
  // Legacy fields kept for backward compatibility
  total_hnwis?: number;
  recent_movements?: number;
  average_value?: number | string;
}
```

**Verification**: Checked backend ic_generation.py - confirmed it uses total_peers, last_6_months, avg_deal_value_m

---

### ✅ Fix 2: CapitalFlowData Interface (CRITICAL)

**Problem**: pdf-types.ts had minimal interface (only source, destination, velocity, peers_in_corridor)
**Reality**: Backend sends full structure with source_flows, destination_flows, flow_intensity_index, velocity_interpretation, pattern_signal, trend_data

**File**: `/Users/skyg/Desktop/Code/hnwi-chronicles/lib/pdf/pdf-types.ts`

**Fix Applied**:
```typescript
export interface CapitalFlowData {
  data_available: boolean;
  pattern_signal?: { title, subtitle, badge, badge_color, narrative };
  source_flows: Array<{ city, volume, percentage }>;
  destination_flows: Array<{ city, volume, percentage, highlight? }>;
  flow_intensity_index: number;
  velocity_change: string;
  velocity_interpretation?: { signal, narrative };
  trend_data: { data_available, q3?, q4?, q1?, ... };
}
```

**Verification**: Checked backend ic_generation.py capital_flow_data structure

---

### ✅ Fix 3: RegulatorySourcesSection Prop Mismatch

**Problem**: Component expects `citations` prop but mapper provided `sources`

**File**: `/Users/skyg/Desktop/Code/hnwi-chronicles/lib/decision-memo/personal-prop-mapper.ts`

**Fix Applied**:
```typescript
'regulatory-sources': {
  citations: memoData.preview_data.regulatory_sources || [],  // Changed from 'sources'
},
```

---

### ✅ Fix 4: PeerBenchmarkTicker Optional Chaining (Already Fixed)

**File**: `components/decision-memo/memo/PeerBenchmarkTicker.tsx`

**Fix Applied**:
```typescript
const primaryPattern = failurePatterns?.[0];  // Added optional chaining
```

---

## Verification Checklist

Run through each section with real audit data:

- [ ] memo-header - Shows verdict, savings, tax rates
- [ ] audit-verdict - Shows risk factors, mistakes, DD items
- [ ] risk-radar - Shows 6-axis scores
- [ ] tax-dashboard-analysis - Shows tax comparison
- [ ] cross-border-audit - Only shows if data exists
- [ ] regime-intelligence - Shows NHR/13O regimes
- [ ] wealth-projection - Shows 10-year projection
- [ ] peer-drivers - Shows attraction factors
- [ ] peer-cohort - Shows demographic stats
- [ ] capital-corridors - Shows flow data
- [ ] geographic-distribution - Shows map
- [ ] hnwi-trends - Shows migration trends
- [ ] peer-benchmark-ticker - Shows precedents (handle missing)
- [ ] liquidity-trap - Shows ABSD/stamp duty
- [ ] transparency-regime - Shows FATCA/CRS
- [ ] real-asset-audit - Shows property analysis
- [ ] crisis-resilience - Shows stress tests
- [ ] golden-visa-intelligence - Shows if KGv3 data exists
- [ ] golden-visa-basic - Shows if no KGv3
- [ ] structure-comparison - Shows trust/LLC/foundation
- [ ] heir-management - Shows succession plan
- [ ] scenario-tree - Shows decision branches
- [ ] tax-implementation - Shows roadmap
- [ ] references - Shows citations
- [ ] regulatory-sources - Shows sources

---

## Next Steps

1. ✅ Add `SectionEmptyState` to all sections that might have missing data
2. ✅ Fix field name variations (use fallbacks)
3. ✅ Test with real audit data to find actual blank sections
4. ✅ Update shouldRender checks to verify array length
5. ✅ Add null checks in components before accessing nested fields
