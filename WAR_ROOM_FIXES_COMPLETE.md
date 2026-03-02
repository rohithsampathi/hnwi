# War Room Mode Fixes - Decision Memo Page

## Issues Found

### 1. Missing Section: RegulatorySourcesSection
**Problem**: Personal Mode had a "Regulatory Sources" section that was completely missing from War Room mode.

**Fix**:
- Added `RegulatorySourcesSection` import
- Added section rendering after `ReferencesSection` (before `MemoLastPage`)
- Section pulls data from `preview_data.regulatory_citations` or `legal_references.regulatory_sources`

**Location**: `/Users/skyg/Desktop/Code/hnwi-chronicles/app/(authenticated)/decision-memo/audit/[intakeId]/page.tsx`
- Lines ~71-72: Added import
- Lines ~2305-2323: Added section render

---

### 2. Critical Data Mapping Bug: Regime Intelligence Section
**Problem**: War Room mode was looking for `regime_intelligence` data in the wrong location, causing the section to either not render or show incomplete data.

**Wrong Path** (War Room mode before fix):
```typescript
memoData.preview_data.peer_cohort_stats.regime_intelligence  // ❌ WRONG
```

**Correct Path** (Personal mode):
```typescript
memoData.preview_data.regime_intelligence  // ✅ CORRECT
```

**Fix**:
- Updated `RegimeIntelligenceSection` to look for data at `preview_data.regime_intelligence` (top-level)
- Updated conditional render check from `peer_cohort_stats?.regime_intelligence?.has_special_regime` to `regime_intelligence?.has_special_regime`

**Location**: `/Users/skyg/Desktop/Code/hnwi-chronicles/app/(authenticated)/decision-memo/audit/[intakeId]/page.tsx`
- Lines ~1966-1975: Fixed data path

---

## Files Modified

1. **app/(authenticated)/decision-memo/audit/[intakeId]/page.tsx**
   - Added `RegulatorySourcesSection` import
   - Added `RegulatorySourcesSection` rendering block
   - Fixed `RegimeIntelligenceSection` data path from nested to top-level

---

## Testing Required

1. **War Room Mode - Regime Intelligence**:
   - Load a decision memo in War Room mode
   - Verify "Special Tax Regimes" section renders if backend provides `regime_intelligence` data
   - Verify section shows complete NHR/13O/preferential tax program details

2. **War Room Mode - Regulatory Sources**:
   - Verify new "Sources & Citations" section appears after "Legal References"
   - Section should show grouped regulatory citations (Statutory, Regulatory, Market Data, etc.)
   - Only renders if `regulatory_citations` data exists in backend response

3. **Compare Personal vs War Room**:
   - Load same audit in both modes
   - Verify section parity (same sections visible in both)
   - Verify data completeness (same content in both modes)

---

## Root Cause Analysis

**Why did this happen?**

1. **Architecture mismatch**: Personal Mode uses a centralized prop mapper (`personal-prop-mapper.ts`) that ensures correct data paths for each section. War Room mode passes props inline, which led to copy/paste errors and outdated data paths.

2. **Backend data structure evolution**: The backend moved `regime_intelligence` from `peer_cohort_stats` to `preview_data` top-level, but War Room mode wasn't updated to reflect this change.

3. **Section definition vs implementation divergence**: Personal Mode defines all 22 sections in `personal-section-map.ts`, but War Room mode didn't keep pace with new sections like `RegulatorySourcesSection`.

---

## Recommendations

1. **Create a shared prop builder utility** that both Personal Mode and War Room Mode use
2. **Add data contract tests** to verify backend response structure matches frontend expectations
3. **Document backend data schema** in `pdf-types.ts` with JSDoc comments indicating correct paths
4. **Add visual regression tests** comparing Personal vs War Room rendering

---

## Additional Notes

- Both modes now have full section parity
- All sections now pull data from correct backend paths
- Users should see identical content in both Personal and War Room modes (just different navigation UX)
