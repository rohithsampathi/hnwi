# Debugging: Only 10 Opportunities Showing on Results Page

## Problem Statement

User reports that only 10 opportunities are showing on the results page map, even though more were discovered during the assessment.

- **Assessment URL**: `http://localhost:3000/assessment`
- **Results URL**: `http://localhost:3000/assessment/results/sess_bf4547f471fc4f6a89dc862c005f1eb2`
- **Issue 1**: Results page only shows 10 opportunities (should show more)
- **Issue 2**: During assessment, calibration footer always shows "+10 opportunities" instead of dynamic count

## Root Cause Analysis

Both issues are **backend-driven**. The frontend code is correctly:

1. **During Assessment**: Using `response.opportunities.length` dynamically (line 250 in `app/(authenticated)/assessment/page.tsx`)
2. **Calibration Display**: Showing `event.removed` which contains the dynamic count (line 446 in `components/assessment/AssessmentQuestion.tsx`)
3. **Results Page**: Fetching from `personalized_opportunities` field or flattening from `answers` array

## Diagnostic Logs Added

### 1. During Assessment (`app/(authenticated)/assessment/page.tsx` lines 238-258)

```typescript
console.log('[Assessment] Backend response opportunities:', {
  count: response.opportunities.length,
  total_command_centre: response.total_command_centre,
  question: currentQuestionIndex + 1
});

console.log('[Assessment] Calibration event:', {
  increment,
  previousCount,
  cumulativeCount,
  message: ...
});
```

**What to look for:**
- Check if backend is sending exactly 10 opportunities per answer
- Or if count varies (5, 8, 12, etc.) but total is capped at 10

### 2. Results Page (`app/(authenticated)/assessment/results/[sessionId]/page.tsx` lines 140-163)

```typescript
console.log('[Results] ===== FULL RESULTS DATA =====');
console.log('[Results] Session ID:', sessionId);
console.log('[Results] Data keys:', Object.keys(data));
console.log('[Results] Personalized opportunities count:', data.personalized_opportunities?.length || 0);
console.log('[Results] Answers count:', data.answers?.length || 0);
console.log('[Results] First answer structure:', {
  keys: Object.keys(data.answers[0]),
  hasOpportunities: !!data.answers[0].opportunities,
  opportunitiesCount: data.answers[0].opportunities?.length || 0
});
console.log('[Results] Total opportunities across all answers:', totalFromAnswers);
```

**What to look for:**
- Does `personalized_opportunities` exist and have only 10 items?
- Does `answers` array exist?
- Do individual answers have `opportunities` field?
- What's the total count when flattening all answers?

### 3. Shared Results Page (similar logging added)

Same comprehensive logging as authenticated results page.

## How to Debug

### Step 1: Open Browser Console

1. Open browser DevTools (F12 or Cmd+Option+I)
2. Go to Console tab
3. Clear console

### Step 2: Take the Assessment

1. Navigate to `/assessment`
2. Complete all 10 questions
3. Watch console for `[Assessment]` logs after each answer

**Expected Output:**
```
[Assessment] Backend response opportunities: {
  count: 8,  // Should vary, not always 10
  total_command_centre: 250,
  question: 1
}

[Assessment] Calibration event: {
  increment: 8,  // Should match count above
  previousCount: 0,
  cumulativeCount: 8,
  message: "+8 opportunities discovered matching your DNA"
}
```

### Step 3: View Results Page

1. After assessment completes, go to results page
2. Check console for `[Results]` logs

**Expected Output:**
```
[Results] ===== FULL RESULTS DATA =====
[Results] Session ID: sess_xxx
[Results] Data keys: ["session_id", "tier", "personalized_opportunities", "answers", ...]
[Results] Personalized opportunities count: 10  // ← Problem: should be higher
[Results] Answers count: 10
[Results] First answer structure: {
  keys: ["question_id", "choice_id", "opportunities", ...],
  hasOpportunities: true,
  opportunitiesCount: 8  // ← Individual answer has opportunities
}
[Results] Total opportunities across all answers: 72  // ← Sum of all answers
```

## Expected Findings

### Scenario A: Backend sends 10 per answer
- Each answer response has exactly 10 opportunities
- Total should be ~100 (10 questions × 10 opps)
- But `personalized_opportunities` only has 10
- **Fix**: Backend aggregation logic is wrong - should deduplicate and save ALL opportunities

### Scenario B: Backend sends varied counts
- Each answer has different count (5, 8, 12, etc.)
- Total across all answers is correct
- But `personalized_opportunities` is capped at 10
- **Fix**: Backend is limiting to 10 in final aggregation

### Scenario C: answers array missing opportunities
- `personalized_opportunities` has 10
- `answers` array doesn't have `opportunities` field
- Can't fallback to flattening
- **Fix**: Backend needs to include opportunities in answers OR properly aggregate to personalized_opportunities

## Frontend Code Status

✅ **Assessment Page**: Correctly using dynamic `response.opportunities.length`
✅ **Calibration Display**: Correctly showing `event.removed`
✅ **Results Extraction**: Correctly tries `personalized_opportunities` then falls back to flattening `answers`
✅ **Map Display**: Correctly passes all opportunities to InteractiveWorldMap

**No frontend changes needed** - this is a Python backend issue.

## Backend Endpoints to Check

1. **`POST /api/assessment/answer`**
   - Should return `opportunities` array with variable count
   - Currently might be hardcoding 10

2. **`POST /api/assessment/complete`**
   - Should aggregate ALL opportunities from all answers
   - Should save to `personalized_opportunities` field
   - Currently might be capping at 10

3. **`GET /api/assessment/result/{session_id}`**
   - Should return either:
     - Full `personalized_opportunities` array (deduplicated)
     - OR `answers` array with embedded `opportunities`

## Next Steps

1. Run the assessment with browser console open
2. Share the console logs here
3. Backend team can identify where the 10-item cap is happening
4. Backend team should remove the cap and properly aggregate all opportunities
