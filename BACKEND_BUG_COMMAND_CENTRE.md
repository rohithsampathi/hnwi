# CRITICAL: Command Centre View Parameters Return Wrong Counts

## Problem Summary

The Command Centre API endpoint `/api/command-centre/opportunities` is returning incorrect opportunity counts:
- When frontend requests `view=all`, backend returns **4 opportunities** (expected: 155)
- When frontend requests `view=personalized`, backend returns **155 opportunities** (expected: 60)

## Evidence from Console Logs

### All Mode Request (Should return 155 opportunities)
```
[Dashboard] API URL: /api/command-centre/opportunities?view=all&timeframe=LIVE&include_crown_vault=true
[Dashboard] View Mode: all (isPersonalMode: false)
[Dashboard] Backend returned: 4 opportunities
[Dashboard] Source breakdown: {crownAssets: 0, priveOpportunities: 4, hnwiPatterns: 0, other: 0}
```
**Expected**: 155 opportunities
**Actual**: 4 opportunities (personalized data)

### Personal Mode Request (Should return 60 opportunities)
```
[Dashboard] API URL: /api/command-centre/opportunities?view=personalized&timeframe=LIVE&include_crown_vault=true
[Dashboard] View Mode: personalized (isPersonalMode: true)
[Dashboard] Backend returned: 155 opportunities
[Dashboard] Source breakdown: {crownAssets: 17, priveOpportunities: 4, hnwiPatterns: 132, other: 0}
```
**Expected**: 60 personalized opportunities
**Actual**: 155 opportunities (all data)

## Root Cause

The backend endpoint `/api/command-centre/opportunities` may be checking user authentication and overriding the `view` parameter logic:

**Suspected Backend Logic:**
```python
def get_opportunities(view, user_id=None):
    # If user is authenticated
    if user_id:
        # Backend may be interpreting view parameter differently when user is authenticated
        if view == 'all':
            # Might be returning user-specific subset instead of all opportunities
            # Possibly: opportunities user has already interacted with?
            return limited_set  # Returns 4 Privé opportunities
        elif view == 'personalized':
            # Might be returning all opportunities for the user to browse/filter
            # Instead of pre-filtered personalized set
            return all_opportunities  # Returns 155 opportunities
    else:
        # Without authentication, parameters work as expected
        if view == 'all':
            return get_all_opportunities()  # 155 opportunities
        else:
            return get_personalized_opportunities(user_id)  # 60 opportunities
```

**Why backend team's tests showed correct results:**
- Backend team likely tested without authentication OR with different user credentials
- Frontend always includes authentication cookies automatically (`credentials: 'include'`)
- This causes backend to use different logic path than direct API tests

## Frontend Fixes Applied

**1. Category Filter Reset** (lines 276-281 in `components/home-dashboard-elite.tsx`):
```typescript
// Reset category filter when mode changes
useEffect(() => {
  setSelectedCategories([])
  console.log('[Dashboard] Mode changed - resetting category filters')
}, [isPersonalMode])
```

This fixes the issue where switching modes kept old category filters, causing opportunities to be hidden.

**2. Correct API Call** (line 319):
```typescript
// Fixed: Was passing object to boolean parameter
const response = await secureApi.get(apiUrl, true, false)
```

**No backend workaround applied** - the issue must be fixed at the backend level.

## Backend Fix Required

**File to fix**: Python backend endpoint handler for `/api/command-centre/opportunities`

**Expected Behavior**:
1. **`view=all`** → Should return **ALL opportunities** (~155 total)
   - All Privé opportunities from the marketplace
   - All HNWI pattern opportunities from MOEv4 intelligence
   - Does NOT include user-specific Crown Vault assets

2. **`view=personalized`** → Should return **personalized opportunities** (~60 total)
   - User's personal Crown Vault assets (from their portfolio)
   - Privé opportunities (all users should see these in Personal Mode)
   - DNA-matched HNWI opportunities based on their C10 Assessment results

**Changes needed**:
1. Fix the logic that's currently returning 4 opportunities for `view=all`
2. Fix the logic that's currently returning 155 opportunities for `view=personalized`
3. Ensure Personal Mode includes:
   - ✅ User's Crown Vault assets
   - ✅ Privé opportunities (for all users)
   - ✅ DNA-matched opportunities (filtered based on assessment)
4. Verify with test cases:
   - `GET /api/command-centre/opportunities?view=all` → Should return **155 opportunities**
   - `GET /api/command-centre/opportunities?view=personalized&user_id={id}` → Should return **60 personalized opportunities** (Crown Vault + Privé + DNA-matched)

## Testing Checklist

**To identify the issue:**
- [ ] Test `/api/command-centre/opportunities?view=all` WITH authentication headers/cookies
  - Should return 155 opportunities
  - Currently returns 4 opportunities
- [ ] Test `/api/command-centre/opportunities?view=personalized` WITH authentication headers/cookies
  - Should return 60 personalized opportunities
  - Currently returns 155 opportunities
- [ ] Test same endpoints WITHOUT authentication
  - Check if they return expected counts (155 for all, 0 or error for personalized)
- [ ] Check if backend code has conditional logic based on `user_id` presence
- [ ] Check if backend code interprets view parameters differently for authenticated users

**After backend fix:**
- [ ] `view=all` with auth returns 155 opportunities
- [ ] `view=personalized` with auth returns 60 personalized opportunities (for test user)
- [ ] Test that Personal Mode toggle shows correct counts (60 opportunities)
- [ ] Test that All Mode shows correct counts (155 opportunities)
- [ ] Verify source breakdown matches expected categories

## Timeline

- **Issue Discovered**: 2025-12-05
- **Frontend Fixes Applied**: 2025-12-05
  - Category filter reset when switching modes
  - Corrected API call parameters
- **Backend Fix Required**: ASAP (root cause is backend returning wrong counts)

## Contact

Frontend logs available in browser console with detailed breakdown of:
- API requests made
- Backend response counts
- Filtering logic results
- Source categorization

Check console for `[Dashboard]` prefix logs to see live data flow.
