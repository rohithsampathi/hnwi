# Backend Requirements for Assessment Calibration System

## Critical Missing Endpoints

### 1. `/api/opportunities` - Generic Opportunities Endpoint ⚠️ PRIORITY 1

**Purpose**: Return ALL opportunities WITHOUT requiring user calibration. Used during assessment.

**Endpoint**: `GET /api/opportunities`

**Query Parameters**:
- `include_crown_vault` (boolean, default: false)
- `limit` (int, default: 200)
- `skip` (int, default: 0)

**Expected Response**:
```json
{
  "success": true,
  "opportunities": [
    {
      "_id": "...",
      "title": "Dubai Off-Plan Premium Residential",
      "tier": "$1M Tier",
      "location": "Dubai",
      "latitude": 25.2048,
      "longitude": 55.2708,
      "value": "$1.2M",
      "category": "Real Estate",
      "risk": "moderate",
      "is_active": true,
      "source": "MOEv4"
    }
    // ... more opportunities
  ],
  "total_count": 173,
  "source": "generic",
  "calibrated": false,
  "message": "Showing all active opportunities (not personalized)"
}
```

**Implementation**:
```python
@router.get("/api/opportunities")
async def get_generic_opportunities(
    include_crown_vault: bool = Query(default=False),
    limit: int = Query(default=200),
    skip: int = Query(default=0)
):
    from database import db

    query = {"is_active": True}
    if not include_crown_vault:
        query["source"] = {"$ne": "Crown Vault"}

    opportunities = await db.command_centre_opportunities.find(query).skip(skip).limit(limit).to_list(length=limit)
    total_count = await db.command_centre_opportunities.count_documents(query)

    return {
        "success": True,
        "opportunities": opportunities,
        "total_count": total_count,
        "source": "generic",
        "calibrated": False
    }
```

---

### 2. Update `/api/command-centre/opportunities` - Graceful Fallback ⚠️ PRIORITY 1

**Current Issue**: Returns 500 error when user has no calibration

**Required Change**: Fall back to generic opportunities if calibration doesn't exist

**Updated Implementation**:
```python
@router.get("/api/command-centre/opportunities")
async def get_command_centre_opportunities(
    user_id: str = Depends(get_current_user)
):
    from database import db

    # Check for calibration
    calibration = await db.user_calibrations.find_one({"user_id": user_id})

    if not calibration:
        logger.warning(f"No calibration for {user_id}, using generic opportunities")
        return await get_generic_opportunities()

    # ... rest of calibrated logic
```

---

### 3. SSE Calibration Events in `/api/assessment/answer` ⚠️ PRIORITY 1

**Current Issue**: No `calibration_filter` events being sent during assessment

**Required Change**: After each answer, send SSE events based on calibration results

**Where to Add**: In `/api/assessment/answer` endpoint after processing answer

**Implementation**:
```python
@router.post("/api/assessment/answer")
async def submit_answer(request: AnswerSubmissionRequest):
    # ... existing code for storing answer ...

    # Get current answer count
    session = await db.c10_assessments.find_one({"session_id": request.session_id})
    answers_count = len(session.get("answers", []))

    # Determine if we should send calibration event
    # Question 3: Tier-based filtering
    if answers_count == 3:
        user_calibration = await db.user_calibrations.find_one({"user_id": session["user_id"]})
        tier = user_calibration.get("aggregated_profile", {}).get("tier", "observer")

        if tier == "observer":
            await send_sse_calibration_event(request.session_id, {
                "filter": "Investment Tier",
                "message": "Removing 105 deals above your tier ($500K+, $1M+)",
                "removed": 105,
                "remaining": 68
            })
        elif tier == "operator":
            await send_sse_calibration_event(request.session_id, {
                "filter": "Investment Tier",
                "message": "Removing 45 deals above your tier ($1M+ exclusive)",
                "removed": 45,
                "remaining": 128
            })
        # Architect sees all - no filtering

    # Question 5: Sophistication filtering
    if answers_count == 5:
        sophistication = user_calibration.get("aggregated_profile", {}).get("base_sophistication", 0.5)
        if sophistication < 0.6:
            await send_sse_calibration_event(request.session_id, {
                "filter": "Asset Sophistication",
                "message": "Removing 10 complex asset types (Private Equity, Structured Products)",
                "removed": 10,
                "remaining": 58
            })

    # Question 7: Geographic filtering
    if answers_count == 7:
        geo_appetite = user_calibration.get("aggregated_profile", {}).get("geographic_appetite", "domestic")
        if geo_appetite == "domestic":
            await send_sse_calibration_event(request.session_id, {
                "filter": "Geographic Scope",
                "message": "Removing 15 international opportunities",
                "removed": 15,
                "remaining": 43
            })

    # ... return existing response ...


async def send_sse_calibration_event(session_id: str, data: dict):
    """Queue calibration_filter event for SSE delivery"""
    await db.c10_stream_events.insert_one({
        "session_id": session_id,
        "event_type": "calibration_filter",
        "data": data,
        "timestamp": datetime.utcnow(),
        "delivered": False
    })
```

---

### 4. `/api/assessment/calibration/{user_id}` - Get Calibration Profile ⚠️ PRIORITY 2

**Purpose**: Return user's extracted DNA profile and opportunity scores

**Endpoint**: `GET /api/assessment/calibration/{user_id}`

**Expected Response**:
```json
{
  "success": true,
  "user_id": "59363d04-eb97-4224-94cf-16ca0d4f746e",
  "last_calibration_session": "sess_d7f3df1aea69",
  "last_updated": "2025-12-01T10:35:00Z",
  "calibration": {
    "aggregated_profile": {
      "tier": "architect",
      "tier_confidence": 0.87,
      "base_sophistication": 0.9,
      "time_horizon_years": 10,
      "geographic_appetite": "global",
      "minimum_deal_size": 500000,
      "liquidity_preference": "flexible",
      "leverage_comfort": "high"
    },
    "opportunity_scores": {
      "juicy": 46,
      "moderate": 107,
      "far_fetched": 20
    },
    "answer_signals": [
      {
        "question_number": 1,
        "dna_signal": "Temporal arbitrage",
        "dominant_tier": "architect"
      }
    ]
  }
}
```

**Implementation**:
```python
@router.get("/api/assessment/calibration/{user_id}")
async def get_user_calibration(user_id: str):
    calibration = await db.user_calibrations.find_one({"user_id": user_id})

    if not calibration:
        raise HTTPException(status_code=404, detail="No calibration found")

    # Calculate score distribution
    opportunity_scores = calibration.get("opportunity_scores", {})
    score_distribution = {
        "juicy": sum(1 for s in opportunity_scores.values() if s.get("compatibility") == "JUICY"),
        "moderate": sum(1 for s in opportunity_scores.values() if s.get("compatibility") == "MODERATE"),
        "far_fetched": sum(1 for s in opportunity_scores.values() if s.get("compatibility") == "FAR_FETCHED")
    }

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
```

---

### 5. `/api/assessment/opportunities/{user_id}` - Personalized Opportunities ⚠️ PRIORITY 2

**Purpose**: Return opportunities personalized for user (filtered + scored)

**Endpoint**: `GET /api/assessment/opportunities/{user_id}`

**Query Parameters**:
- `limit` (int, default: 50)

**Expected Response**:
```json
{
  "success": true,
  "user_id": "59363d04-eb97-4224-94cf-16ca0d4f746e",
  "user_tier": "architect",
  "opportunities": [
    {
      // Standard opportunity fields
      "title": "Dubai Off-Plan Premium Residential",
      "tier": "$1M Tier",

      // Victor AI personalized scoring
      "victor_ai": {
        "base_score": 0.75,
        "personalized_score": 0.92,
        "compatibility": "JUICY",
        "reasons": [
          "✅ Matches your $1M+ tier perfectly",
          "✅ Fits your global investment appetite",
          "✅ Aligns with real estate development preference"
        ],
        "personalized": true,
        "user_tier": "architect"
      }
    }
  ],
  "total_count": 173,
  "accessible_count": 173,
  "score_distribution": {
    "juicy": 46,
    "moderate": 107,
    "far_fetched": 20
  }
}
```

**Implementation**: Same as `/api/command-centre/opportunities` with personalized Victor AI scores

---

## Testing Commands

```bash
# 1. Test generic opportunities (should work immediately)
curl http://localhost:8000/api/opportunities?include_crown_vault=false

# 2. Test command-centre fallback (should not 500)
curl http://localhost:8000/api/command-centre/opportunities

# 3. Start assessment and monitor SSE
curl -X POST http://localhost:8000/api/assessment/start \
  -d '{"user_id": "test", "email": "test@test.com"}'

# Connect to SSE stream
# Should see calibration_filter events after Q3, Q5, Q7

# 4. Get calibration profile (after assessment)
curl http://localhost:8000/api/assessment/calibration/test

# 5. Get personalized opportunities
curl http://localhost:8000/api/assessment/opportunities/test
```

---

## Priority Summary

**Priority 1 (Blocking Frontend)**:
1. ✅ Create `/api/opportunities` endpoint
2. ✅ Update `/api/command-centre/opportunities` fallback
3. ✅ Send SSE `calibration_filter` events

**Priority 2 (Enhanced Features)**:
4. ✅ Create `/api/assessment/calibration/{user_id}`
5. ✅ Create `/api/assessment/opportunities/{user_id}`

Once Priority 1 is implemented, frontend will work. Priority 2 enables full calibration profile display.
