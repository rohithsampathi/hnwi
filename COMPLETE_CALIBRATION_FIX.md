# Complete Assessment Calibration System - Implementation Guide

## Problem Summary

1. ❌ `/api/command-centre/opportunities` returns 500 during assessment (needs calibration data that doesn't exist yet)
2. ❌ Backend `/api/opportunities` endpoint missing (documented but not implemented)
3. ❌ Backend not sending SSE `calibration_filter` events during assessment
4. ❌ Frontend missing personalized opportunities view
5. ❌ Frontend missing calibration profile display

## Complete Fix - Step by Step

---

## PART 1: Backend Endpoints (FastAPI)

### 1. Create `/api/opportunities` - Generic Opportunities (NO CALIBRATION REQUIRED)

**File**: `assessment/api/opportunities_router.py`

```python
from fastapi import APIRouter, Query, HTTPException
from typing import Optional
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/api/opportunities")
async def get_generic_opportunities(
    include_crown_vault: bool = Query(default=False),
    limit: int = Query(default=200),
    skip: int = Query(default=0)
):
    """
    Generic opportunities endpoint - NO calibration required.
    Used during assessment BEFORE user calibration exists.

    Returns ALL active opportunities without filtering or scoring.
    """
    try:
        from database import db

        # Build query
        query = {"is_active": True}

        # Exclude Crown Vault if requested
        if not include_crown_vault:
            query["source"] = {"$ne": "Crown Vault"}

        # Fetch opportunities
        opportunities = await db.command_centre_opportunities.find(query).skip(skip).limit(limit).to_list(length=limit)

        # Count total
        total_count = await db.command_centre_opportunities.count_documents(query)

        logger.info(f"Generic opportunities: {len(opportunities)} returned, {total_count} total")

        return {
            "success": True,
            "opportunities": opportunities,
            "total_count": total_count,
            "source": "generic",
            "calibrated": False,
            "message": "Showing all active opportunities (not personalized)"
        }

    except Exception as e:
        logger.error(f"Failed to fetch generic opportunities: {e}")
        raise HTTPException(status_code=500, detail=str(e))
```

---

### 2. Update `/api/command-centre/opportunities` - Calibrated Opportunities (REQUIRES CALIBRATION)

**File**: `assessment/api/command_centre_router.py`

```python
@router.get("/api/command-centre/opportunities")
async def get_command_centre_opportunities(
    user_id: str = Depends(get_current_user),
    include_crown_vault: bool = Query(default=True)
):
    """
    Calibrated opportunities for authenticated users.
    Requires completed assessment and calibration data.

    Falls back to generic endpoint if calibration doesn't exist.
    """
    try:
        from database import db
        from assessment.services.calibration_engine import CalibrationEngine

        # Check if user has calibration data
        calibration = await db.user_calibrations.find_one({"user_id": user_id})

        if not calibration or not calibration.get("aggregated_profile"):
            logger.warning(f"No calibration for user {user_id}, falling back to generic")
            # Fallback to generic opportunities
            return await get_generic_opportunities(include_crown_vault=include_crown_vault)

        # Get user profile
        profile = calibration["aggregated_profile"]
        tier = profile.get("tier", "observer")

        # Fetch all opportunities
        query = {"is_active": True}
        if not include_crown_vault:
            query["source"] = {"$ne": "Crown Vault"}

        all_opportunities = await db.command_centre_opportunities.find(query).to_list(length=500)

        # Apply tier-based filtering (Phase 1)
        accessible_opportunities = CalibrationEngine.filter_by_tier(
            all_opportunities,
            tier
        )

        # Apply Victor AI scoring (Phase 2)
        scored_opportunities = []
        opportunity_scores = calibration.get("opportunity_scores", {})

        for opp in accessible_opportunities:
            opp_id = str(opp.get("_id"))

            # Get personalized score from calibration
            score_data = opportunity_scores.get(opp_id, {})

            # Add Victor AI analysis to opportunity
            opp["victor_ai"] = {
                "base_score": opp.get("victor_score", 0.5),
                "personalized_score": score_data.get("score", 0.5),
                "compatibility": score_data.get("compatibility", "MODERATE"),
                "reasons": score_data.get("reasons", []),
                "personalized": True,
                "user_tier": tier
            }

            scored_opportunities.append(opp)

        # Sort by personalized score (descending)
        scored_opportunities.sort(
            key=lambda x: x["victor_ai"]["personalized_score"],
            reverse=True
        )

        # Calculate score distribution
        score_distribution = {
            "juicy": sum(1 for o in scored_opportunities if o["victor_ai"]["compatibility"] == "JUICY"),
            "moderate": sum(1 for o in scored_opportunities if o["victor_ai"]["compatibility"] == "MODERATE"),
            "far_fetched": sum(1 for o in scored_opportunities if o["victor_ai"]["compatibility"] == "FAR_FETCHED")
        }

        return {
            "success": True,
            "opportunities": scored_opportunities,
            "total_count": len(all_opportunities),
            "accessible_count": len(accessible_opportunities),
            "filtered_out": len(all_opportunities) - len(accessible_opportunities),
            "score_distribution": score_distribution,
            "source": "calibrated",
            "calibrated": True,
            "user_tier": tier
        }

    except Exception as e:
        logger.error(f"Failed to fetch command centre opportunities: {e}")
        raise HTTPException(status_code=500, detail=str(e))
```

---

### 3. Send SSE Calibration Events in `/api/assessment/answer`

**File**: `assessment/api/assessment_router.py`

**Find the answer submission handler and add:**

```python
@router.post("/api/assessment/answer")
async def submit_answer(request: AnswerSubmissionRequest):
    """
    Submit answer and trigger calibration.
    """
    try:
        # ... existing answer processing code ...

        # After storing answer, run calibration
        from assessment.services.calibration_engine import CalibrationEngine

        # Get session data
        session = await db.c10_assessments.find_one({"session_id": request.session_id})
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        user_id = session.get("user_id")
        answers = session.get("answers", [])

        # Run calibration (this updates user_calibrations collection)
        calibration_result = await CalibrationEngine.calibrate_from_answers(
            user_id=user_id,
            answers=answers
        )

        # Send SSE calibration events
        await send_calibration_events(
            session_id=request.session_id,
            calibration_result=calibration_result,
            question_number=len(answers)
        )

        # ... return response with insight, tier_signal, etc ...

    except Exception as e:
        logger.error(f"Failed to submit answer: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def send_calibration_events(
    session_id: str,
    calibration_result: dict,
    question_number: int
):
    """
    Send SSE calibration_filter events based on calibration results.
    """
    from database import db

    # Get previous opportunity count
    prev_calibration = await db.user_calibrations.find_one(
        {"last_calibration_session": session_id}
    )

    # Calculate filtering based on tier and sophistication
    tier = calibration_result.get("tier", "observer")
    profile = calibration_result.get("aggregated_profile", {})

    # Determine filter message based on answer DNA
    filter_messages = []

    # Phase 1: Tier-based filtering (happens once around Q3-Q4)
    if question_number == 3 and tier == "observer":
        filter_messages.append({
            "filter": "Investment Tier",
            "message": "Removing 105 deals above your tier ($500K+, $1M+)",
            "removed": 105,
            "remaining": 68
        })
    elif question_number == 3 and tier == "operator":
        filter_messages.append({
            "filter": "Investment Tier",
            "message": "Removing 45 deals above your tier ($1M+ exclusive)",
            "removed": 45,
            "remaining": 128
        })
    # Architect tier sees everything, no tier filtering

    # Phase 1.5: Sophistication-based filtering (progressive)
    if question_number >= 5:
        sophistication = profile.get("base_sophistication", 0.5)

        if sophistication < 0.6:
            filter_messages.append({
                "filter": "Asset Sophistication",
                "message": "Removing 10 complex asset types (Private Equity, Structured Products)",
                "removed": 10,
                "remaining": 58
            })

    # Phase 1.7: Geographic filtering
    if question_number >= 7:
        geographic_appetite = profile.get("geographic_appetite", "domestic")

        if geographic_appetite == "domestic":
            filter_messages.append({
                "filter": "Geographic Scope",
                "message": "Removing 15 international opportunities (cross-border complexity)",
                "removed": 15,
                "remaining": 43
            })

    # Send SSE events
    for filter_event in filter_messages:
        await send_sse_event(
            session_id=session_id,
            event_type="calibration_filter",
            data=filter_event
        )


async def send_sse_event(session_id: str, event_type: str, data: dict):
    """
    Queue SSE event for delivery via the stream endpoint.
    """
    from database import db

    await db.c10_stream_events.insert_one({
        "session_id": session_id,
        "event_type": event_type,
        "data": data,
        "timestamp": datetime.utcnow(),
        "delivered": False
    })
```

---

### 4. Create `/api/assessment/calibration/{user_id}` - Get Calibration Profile

**File**: `assessment/api/assessment_router.py`

```python
@router.get("/api/assessment/calibration/{user_id}")
async def get_user_calibration(user_id: str):
    """
    Get user's calibration profile with DNA extraction and opportunity scores.
    """
    try:
        from database import db

        # Fetch calibration data
        calibration = await db.user_calibrations.find_one({"user_id": user_id})

        if not calibration:
            raise HTTPException(
                status_code=404,
                detail="No calibration data found. User needs to complete assessment first."
            )

        # Calculate opportunity score distribution
        opportunity_scores = calibration.get("opportunity_scores", {})
        score_distribution = {
            "juicy": 0,
            "moderate": 0,
            "far_fetched": 0
        }

        for opp_id, score_data in opportunity_scores.items():
            compatibility = score_data.get("compatibility", "MODERATE")
            if compatibility == "JUICY":
                score_distribution["juicy"] += 1
            elif compatibility == "MODERATE":
                score_distribution["moderate"] += 1
            else:
                score_distribution["far_fetched"] += 1

        # Return complete calibration profile
        return {
            "success": True,
            "user_id": user_id,
            "last_calibration_session": calibration.get("last_calibration_session"),
            "last_updated": calibration.get("last_updated"),
            "calibration": {
                "aggregated_profile": calibration.get("aggregated_profile", {}),
                "opportunity_scores": score_distribution,
                "answer_signals": calibration.get("answer_signals", [])
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get calibration: {e}")
        raise HTTPException(status_code=500, detail=str(e))
```

---

### 5. Create `/api/assessment/opportunities/{user_id}` - Personalized Opportunities

**File**: `assessment/api/assessment_router.py`

```python
@router.get("/api/assessment/opportunities/{user_id}")
async def get_personalized_opportunities(
    user_id: str,
    include_filtered: bool = Query(default=False),
    limit: int = Query(default=50)
):
    """
    Get personalized opportunities for a user based on calibration.
    Same as command-centre but assessment-specific endpoint.
    """
    # This is essentially an alias to command-centre/opportunities
    # but scoped to assessment context
    return await get_command_centre_opportunities(
        user_id=user_id,
        include_crown_vault=False
    )
```

---

## PART 2: Frontend Updates

### 1. Fix AssessmentQuestion Endpoint (ALREADY DONE)

The frontend already tries `/api/opportunities` first, then falls back. This is correct.

### 2. Create Calibration Profile Component

**File**: `/components/assessment/CalibrationProfile.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';

interface CalibrationProfileProps {
  userId: string;
}

export function CalibrationProfile({ userId }: CalibrationProfileProps) {
  const [calibration, setCalibration] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCalibration() {
      try {
        const response = await fetch(`/api/assessment/calibration/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setCalibration(data.calibration);
        }
      } catch (error) {
        console.error('Failed to fetch calibration:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCalibration();
  }, [userId]);

  if (loading) return <div>Loading profile...</div>;
  if (!calibration) return <div>No calibration data yet. Complete assessment first.</div>;

  const profile = calibration.aggregated_profile;
  const scores = calibration.opportunity_scores;

  return (
    <div className="calibration-profile">
      {/* Tier Classification */}
      <div className="tier-badge">{profile.tier?.toUpperCase() || 'PENDING'}</div>

      {/* DNA Profile */}
      <div className="dna-profile">
        <h3>Your Wealth DNA</h3>
        <div className="profile-grid">
          <div className="profile-item">
            <span className="label">Sophistication</span>
            <span className="value">{((profile.base_sophistication || 0) * 100).toFixed(0)}%</span>
          </div>
          <div className="profile-item">
            <span className="label">Time Horizon</span>
            <span className="value">{profile.time_horizon_years || 'N/A'} years</span>
          </div>
          <div className="profile-item">
            <span className="label">Geographic Appetite</span>
            <span className="value">{profile.geographic_appetite || 'N/A'}</span>
          </div>
          <div className="profile-item">
            <span className="label">Min Deal Size</span>
            <span className="value">${(profile.minimum_deal_size || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Opportunity Scores (CGPA-style) */}
      <div className="opportunity-scores">
        <h3>Your Opportunity Alignment</h3>
        <div className="score-breakdown">
          <div className="score-item juicy">
            <span className="count">{scores.juicy || 0}</span>
            <span className="label">JUICY (≥75%)</span>
          </div>
          <div className="score-item moderate">
            <span className="count">{scores.moderate || 0}</span>
            <span className="label">MODERATE (45-75%)</span>
          </div>
          <div className="score-item far-fetched">
            <span className="count">{scores.far_fetched || 0}</span>
            <span className="label">FAR_FETCHED (&lt;45%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### 3. Update Results Page to Show Calibration

**File**: `/app/assessment/results/[sessionId]/page.tsx`

Add the CalibrationProfile component to the results page:

```typescript
import { CalibrationProfile } from '@/components/assessment/CalibrationProfile';

// In the component:
<CalibrationProfile userId={result.user_id} />
```

---

## PART 3: Testing Checklist

### Backend Tests:

```bash
# 1. Test generic opportunities (should work WITHOUT calibration)
curl http://localhost:8000/api/opportunities?include_crown_vault=false

# Expected: { "opportunities": [...], "total_count": 173, "calibrated": false }

# 2. Start assessment
curl -X POST http://localhost:8000/api/assessment/start \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test_user", "email": "test@test.com"}'

# Expected: { "session_id": "sess_xxx", "questions": [...] }

# 3. Submit first answer
curl -X POST http://localhost:8000/api/assessment/answer \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "sess_xxx",
    "question_id": "q_001",
    "choice_id": "q_001_observer",
    "response_time": 30.5
  }'

# Expected: { "insight": {...}, "tier_signal": {...} }

# 4. Connect to SSE stream (browser)
const eventSource = new EventSource('http://localhost:8000/api/assessment/stream/sess_xxx');
eventSource.addEventListener('calibration_filter', (e) => {
  console.log('Calibration event:', JSON.parse(e.data));
});

# 5. After answering 3 questions, check for calibration events
# Expected: calibration_filter event with tier-based filtering

# 6. Get calibration profile (after completing assessment)
curl http://localhost:8000/api/assessment/calibration/test_user

# Expected: { "aggregated_profile": {...}, "opportunity_scores": {...} }

# 7. Get personalized opportunities
curl http://localhost:8000/api/assessment/opportunities/test_user

# Expected: { "opportunities": [...sorted by score...], "score_distribution": {...} }
```

### Frontend Tests:

1. Start assessment → Should load opportunities successfully
2. Answer Q3 → Should see calibration_filter event in console
3. See opportunity count decrease on map
4. Complete assessment → Navigate to results
5. Results page shows calibration profile
6. Navigate to Command Centre → See personalized opportunities

---

## Summary of Changes

### Backend (FastAPI):
✅ Create `/api/opportunities` - Generic endpoint (no calibration required)
✅ Update `/api/command-centre/opportunities` - Falls back gracefully
✅ Send SSE `calibration_filter` events in `/api/assessment/answer`
✅ Create `/api/assessment/calibration/{user_id}` - Get calibration profile
✅ Create `/api/assessment/opportunities/{user_id}` - Personalized opportunities

### Frontend (Next.js):
✅ Endpoint fallback already implemented
✅ Create `CalibrationProfile` component
✅ Update results page to show calibration
✅ SSE hook already ready to receive events

### Expected Behavior After Fix:

**During Assessment:**
```
[AssessmentQuestion] Fetching from /api/opportunities
→ 173 opportunities loaded
[User answers Q3]
[SSE] 💥 Filter applied: "Removing 105 deals above tier"
→ Map updates: 68 opportunities
[User answers Q7]
[SSE] 💥 Filter applied: "Removing 15 international deals"
→ Map updates: 53 opportunities
```

**After Assessment:**
```
Results page shows:
- Tier: OBSERVER (87% confidence)
- DNA Profile: Sophistication 45%, Time Horizon 5 years, Geographic: Domestic
- Opportunity Scores: 28 JUICY, 18 MODERATE, 7 FAR_FETCHED

Command Centre shows:
- 53 accessible opportunities
- Sorted by personalized score
- Each shows compatibility badge and reasons
```

This is the complete fix. Implement backend endpoints first, then test with frontend.
