# Assessment Diagnostic Guide

## Issues Reported
1. **400 Bad Request on /api/assessment/complete**
2. **Questions are repeating**
3. **Map opportunities not changing with each response**

## Diagnostic Logging Added

### 1. Complete Endpoint (400 Error)
**File**: `app/api/assessment/complete/route.ts`

**Logs to Check**:
```
[Complete API] Received request: { session_id: "..." }
[Complete API] Proxying to backend: http://localhost:8000/api/assessment/complete
[Complete API] Backend response status: XXX
[Complete API] Backend error response: "..."
```

**What to Look For**:
- Is `session_id` being received correctly?
- What is the backend response status? (400, 500, etc.)
- What error message is the backend returning?

**Common Causes**:
- Backend expects different field name (`sessionId` vs `session_id`)
- Backend session not found in database
- Backend validation error (missing required fields)

### 2. Repeating Questions
**File**: `app/(authenticated)/assessment/page.tsx`

**Logs to Check**:
```
[Assessment] Total questions received: 10
[Assessment] ✅ All questions are unique
[Assessment] Question IDs: ["SA_Q1_...", "SA_Q2_...", ...]
```

**OR**:
```
[Assessment] ⚠️ DUPLICATE QUESTIONS DETECTED!
[Assessment] Total questions: 10
[Assessment] Unique questions: 8
[Assessment] Duplicate IDs: ["SA_Q3_...", "SA_Q5_..."]
```

**After each answer**:
```
[Assessment] Current question index: 0
[Assessment] Next question index: 1
[Assessment] Current question ID: SA_Q1_...
[Assessment] ➡️ Moving to next question: SA_Q2_...
[Assessment] Next question title: "PE Waterfall Negotiation"
```

**What to Look For**:
- Are questions unique when first loaded?
- Is the question index advancing properly? (0 → 1 → 2...)
- Are the question IDs changing with each answer?

**Common Causes**:
- Backend returning duplicate questions in initial set
- Question index not advancing (stuck at same index)
- State not updating correctly (React state issue)

### 3. Map Opportunities Not Changing
**File**: `lib/hooks/useAssessmentSSE.ts`

**Logs to Check**:
```
[SSE] 💥 ======= CALIBRATION FILTER EVENT =======
[SSE] 💥 Filter: "tier_mismatch"
[SSE] 💥 Message: "Filtered out Observer-tier opportunities"
[SSE] 💥 Removed: 34
[SSE] 💥 Remaining: 93
[SSE] 💥 Total calibration events now: 1
```

**After each answer, you should see**:
```
[SSE] 💥 ======= CALIBRATION FILTER EVENT =======
```

**What to Look For**:
- Are calibration_filter events being received from SSE?
- How many calibration events have been received?
- Are the "remaining" counts changing?

**Common Causes**:
- Backend not sending SSE calibration_filter events
- SSE connection not established
- Events being sent but not parsed correctly

## Step-by-Step Debugging

### Step 1: Start Assessment
Look for:
```
[Assessment] Start response: { session_id: "...", questions: [...] }
[Assessment] ✅ All questions are unique
[Assessment] Question IDs: [...]
```

**✅ Good**: All questions unique, 10 total
**❌ Bad**: Duplicate questions detected

### Step 2: Answer First Question
Look for:
```
[Assessment] Current question index: 0
[Assessment] ➡️ Moving to next question: SA_Q2_...
[SSE] 💥 ======= CALIBRATION FILTER EVENT =======
[SSE] 💥 Remaining: 93
[AssessmentQuestion] Adding 10 opportunities
```

**✅ Good**: Question index advances, calibration event received, opportunities added
**❌ Bad**: No calibration event, opportunities not changing

### Step 3: Answer Second Question
Look for:
```
[Assessment] Current question index: 1
[Assessment] ➡️ Moving to next question: SA_Q3_...
[SSE] 💥 Total calibration events now: 2
[AssessmentQuestion] Adding 8 opportunities
```

**✅ Good**: Index is 1 (not 0), new calibration event, more opportunities
**❌ Bad**: Index stuck at 0, no new events, same opportunities

### Step 4: Complete Assessment (After Question 10)
Look for:
```
[Assessment] ✅ All questions answered, completing...
[Complete API] Received request: { session_id: "..." }
[Complete API] Backend response status: 200
```

**✅ Good**: Status 200
**❌ Bad**: Status 400 with error message

## Backend Requirements (If Issues Found)

### If No Calibration Events:
Backend must send SSE event on each answer:
```python
event: calibration_filter
data: {
  "filter": "tier_mismatch",
  "message": "Filtered out Observer-tier opportunities",
  "removed": 34,
  "remaining": 93
}
```

### If 400 on Complete:
Backend `/api/assessment/complete` must accept:
```json
{
  "session_id": "the-session-id"
}
```

And return 200 with:
```json
{
  "status": "completed",
  "session_id": "the-session-id"
}
```

### If Duplicate Questions:
Backend `/api/assessment/start` must return unique questions:
```python
# Check for uniqueness
question_ids = [q["_id"] for q in selected_questions]
assert len(question_ids) == len(set(question_ids)), "Duplicate questions!"
```

## Quick Fix Checklist

- [ ] Check browser console for all `[Assessment]` logs
- [ ] Verify question IDs are unique on start
- [ ] Verify question index advances after each answer
- [ ] Check for `[SSE] 💥` calibration events after each answer
- [ ] Verify opportunities count changes in map overlay
- [ ] Check `[Complete API]` logs for backend error response
- [ ] Verify backend endpoint `/api/assessment/complete` exists and returns 200
