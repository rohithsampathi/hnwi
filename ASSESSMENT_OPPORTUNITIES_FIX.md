# Assessment Opportunity Map - 500 Error Fix

## Problem

During assessment, the map shows "0 of 0 opportunities" because:
```
GET /api/command-centre/opportunities?include_crown_vault=false&include_executors=false 500
```

The backend endpoint is returning 500 errors during assessment.

## Root Cause

The backend `/api/command-centre/opportunities` endpoint now requires:
- User authentication
- User calibration data (from completed assessment)

But during assessment:
- User hasn't completed assessment yet
- No calibration data exists
- Calibration is being built in real-time

This creates a chicken-and-egg problem.

## Solution: Two-Tier Opportunity System

### For Assessment Flow (BEFORE calibration exists):

**Frontend Change (DONE):**
- Changed from `/api/command-centre/opportunities`
- To `/api/opportunities?include_crown_vault=false&limit=200`
- Falls back to command-centre if needed

**Backend Implementation Required:**

Create `/api/opportunities` endpoint that returns ALL opportunities without calibration:

```python
@app.get("/api/opportunities")
async def get_all_opportunities(
    include_crown_vault: bool = Query(default=True),
    limit: int = Query(default=200)
):
    """
    Generic opportunities endpoint for non-calibrated users.
    Used during assessment before calibration exists.
    """
    try:
        query = {}

        # Filter out Crown Vault if requested
        if not include_crown_vault:
            query["source"] = {"$ne": "Crown Vault"}

        # Filter active opportunities
        query["is_active"] = True

        opportunities = await opportunities_collection.find(query).limit(limit).to_list()

        return {
            "opportunities": opportunities,
            "total": len(opportunities),
            "source": "generic",
            "calibrated": False
        }

    except Exception as e:
        logger.error(f"Failed to fetch opportunities: {e}")
        raise HTTPException(status_code=500, detail=str(e))
```

### For Post-Assessment Flow (AFTER calibration exists):

**Keep existing `/api/command-centre/opportunities`** for authenticated, calibrated users:

```python
@app.get("/api/command-centre/opportunities")
async def get_calibrated_opportunities(
    user_id: str = Depends(get_current_user),
    include_crown_vault: bool = Query(default=True)
):
    """
    Calibrated opportunities for authenticated users.
    Filters by tier and scores by personal alignment.
    """
    # Get user's calibration data
    calibration = await get_user_calibration(user_id)

    if not calibration:
        # No calibration yet - redirect to generic endpoint
        return await get_all_opportunities(include_crown_vault)

    # Apply tier-based filtering
    accessible_opportunities = filter_by_tier(
        opportunities,
        calibration.tier
    )

    # Apply personal scoring
    scored_opportunities = score_opportunities(
        accessible_opportunities,
        calibration.opportunity_scores
    )

    return {
        "opportunities": scored_opportunities,
        "total": len(scored_opportunities),
        "source": "calibrated",
        "calibrated": True,
        "tier": calibration.tier
    }
```

## Backend Endpoints Architecture

```
/api/opportunities
├─ Used by: Assessment flow, non-authenticated users
├─ Returns: ALL active opportunities (unfiltered, unscored)
├─ Purpose: Show full opportunity set during assessment
└─ Calibration: None required

/api/command-centre/opportunities
├─ Used by: Post-assessment, authenticated users
├─ Returns: Filtered + scored opportunities
├─ Purpose: Personalized opportunity set based on calibration
└─ Calibration: Required (falls back to /api/opportunities if missing)
```

## Testing

1. **During Assessment:**
   ```
   GET /api/opportunities?include_crown_vault=false&limit=200
   → Should return 150-200 opportunities
   → Map shows full set (will be filtered via SSE calibration events)
   ```

2. **After Assessment (Authenticated):**
   ```
   GET /api/command-centre/opportunities
   → Uses user's calibration data
   → Returns only tier-accessible opportunities
   → Sorted by JUICY/MODERATE/FAR_FETCHED scores
   ```

3. **SSE Calibration:**
   ```
   During assessment, as user answers:
   Q1: 173 opportunities (no filtering yet)
   Q2: SSE event → "Removing deals > $1M" → 165 remaining
   Q3: SSE event → "Removing high risk" → 158 remaining
   ...
   Q10: Final set of ~100-120 opportunities
   ```

## Current Frontend Status

✅ **Fixed:**
- Assessment now tries `/api/opportunities` first
- Falls back to command-centre if needed
- Better error handling and logging

❌ **Still Needed (Backend):**
- Create `/api/opportunities` endpoint
- Make `/api/command-centre/opportunities` handle missing calibration gracefully
- Ensure SSE calibration events are sent during assessment

## Expected Behavior After Fix

**Assessment Start:**
```
[AssessmentQuestion] Fetching from /api/opportunities
[AssessmentQuestion] Raw opportunities: 173
[AssessmentQuestion] After filtering: 165
[AssessmentQuestion] After deduplication: 165
Command Centre: 165 of 165 opportunities
```

**After Q1 Answer:**
```
[SSE] 💥 Filter applied: {"message": "Removing deals > $1M", "removed": 8, "remaining": 157}
[AssessmentQuestion] Calibration event: Current: 165, Target: 157
Command Centre: 157 of 165 opportunities
```

**After Q10 Answer:**
```
[SSE] 💥 Filter applied: {"message": "Removing complex assets", "removed": 12, "remaining": 98}
Command Centre: 98 of 165 opportunities (final calibrated set)
```
