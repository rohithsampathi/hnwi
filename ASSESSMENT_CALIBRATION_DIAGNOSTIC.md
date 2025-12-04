# Assessment Opportunity Calibration - Diagnostic Report

## Current System Architecture

### 1. Data Flow

**Initial Opportunity Load:**
```
Frontend → /api/command-centre/opportunities → 127-139 opportunities
         → Displayed on map (fetched ONCE on mount)
```

**SSE Stream Connection:**
```
Frontend → /api/assessment/stream/{sessionId} (Next.js proxy)
         → http://localhost:8000/api/assessment/stream/{sessionId} (FastAPI backend)
```

**Expected Calibration Flow:**
```
User answers question
    ↓
Backend receives answer via POST /api/assessment/answer
    ↓
Backend analyzes answer + DNA signals
    ↓
Backend emits SSE event: calibration_filter
    ↓
Frontend receives event
    ↓
Frontend filters opportunities based on criteria
    ↓
Map updates with reduced count
```

### 2. SSE Event Structure

The backend should emit events like this after each answer:

```json
{
  "event": "calibration_filter",
  "data": {
    "filter": "deal_size_filter",
    "message": "Removing deals < $500K based on risk tolerance",
    "removed": 15,
    "remaining": 112
  }
}
```

### 3. Frontend Filter Logic

The frontend intelligently filters based on message content:

**Supported Filters:**
- `< $500K` or `less than` → Removes deals below threshold
- `> $10M` or `greater than` → Removes deals above threshold
- `high risk` or `risky` → Removes high-risk opportunities
- `low risk` → Removes low-risk opportunities
- `real estate` → Removes CRE opportunities
- `equity` or `stock` → Removes equity opportunities

**Smart Parsing:**
- Extracts dollar amounts: `$500K` → 500000, `$2.5M` → 2500000
- Matches opportunities by category, risk level, or value
- Removes exact count specified by backend
- Updates map in real-time

### 4. Current Status

✅ **Working:**
- Opportunity fetch from `/api/command-centre/opportunities`
- SSE connection established successfully
- Frontend filtering logic ready
- Map rendering and updates

❌ **Not Working:**
- Backend NOT sending `calibration_filter` events
- Map shows same count throughout assessment
- No visual feedback of calibration happening

## Diagnostic Steps

### Step 1: Check SSE Connection
Open browser console during assessment and look for:
```
[SSE] Connecting to: http://localhost:3000/api/assessment/stream/sess_xxx
[SSE] Connected: {"session_id":"sess_xxx","timestamp":"..."}
```

### Step 2: Monitor Answer Submission
After clicking "Lock Position", check for:
```
[Assessment] Answer response: {...}
```

### Step 3: Check for Calibration Events
Look for these logs (currently will be MISSING):
```
[SSE] 💥 Filter applied: {...}
[SSE] 💥 Parsed filter data: {...}
[SSE] 💥 Filter message: "Removing deals < $500K"
[SSE] 💥 Removed: 15 Remaining: 112
```

### Step 4: Verify Filtering
If events ARE received, check:
```
[AssessmentQuestion] Calibration event: "message" Current: 127, Target: 112
[AssessmentQuestion] Smart filter: Removed 15 matching opportunities
```

## Backend Implementation Required

The FastAPI backend needs to:

1. **After receiving answer** (`POST /api/assessment/answer`):
   ```python
   # Analyze user's choice to determine filtering criteria
   if user_shows_risk_aversion:
       filter_criteria = "high risk"
       message = "Removing high-risk opportunities (>15% volatility)"

   if user_shows_small_deal_preference:
       filter_criteria = "< $500K"
       message = "Removing deals < $500K based on deal size preference"
   ```

2. **Emit SSE event** via `/api/assessment/stream/{sessionId}`:
   ```python
   from sse_starlette import EventSourceResponse

   # Calculate how many to remove (2-3 per question over 10 questions = 20-30 total)
   current_count = 127  # Initial
   target_remaining = current_count - random.randint(2, 3)
   removed_count = current_count - target_remaining

   # Send calibration event
   await send_event("calibration_filter", {
       "filter": filter_criteria,
       "message": message,
       "removed": removed_count,
       "remaining": target_remaining
   })
   ```

3. **Example Event Sequence** (10 questions):
   ```
   Q1: 127 opportunities → Remove 3 → 124 remaining
   Q2: 124 opportunities → Remove 2 → 122 remaining
   Q3: 122 opportunities → Remove 3 → 119 remaining
   ...
   Q10: 100 opportunities → Remove 2 → 98 remaining
   ```

## Testing the System

Once backend implements calibration events:

1. Start assessment
2. Open browser console
3. Answer first question
4. Watch for:
   - SSE event log: `[SSE] 💥 Filter applied`
   - Calibration log: `[AssessmentQuestion] Calibration event`
   - Map counter updates from 127 → 124
   - Red notification appears with filter message

## File Locations

**Frontend:**
- SSE Hook: `/lib/hooks/useAssessmentSSE.ts`
- Question Component: `/components/assessment/AssessmentQuestion.tsx`
- Page Component: `/app/(authenticated)/assessment/page.tsx`

**API Proxy:**
- SSE Proxy: `/app/api/assessment/stream/[sessionId]/route.ts`
- Answer Endpoint: `/app/api/assessment/answer/route.ts`

**Backend (FastAPI):**
- SSE Stream: `http://localhost:8000/api/assessment/stream/{sessionId}`
- Answer Processing: `http://localhost:8000/api/assessment/answer`
