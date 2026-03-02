# Debugging Summary - Map & Text Formatting

## Current Status

✅ **Frontend Implementation:** Complete
- Migration arrows visualization ✅
- Command centre auto-fetch ✅
- Text formatting support ✅
- Debug logging added ✅

🔄 **Issue Reported:** Map and text formatting missing

---

## Quick Diagnosis

Based on your report "Text formatting in the output and Map showing all command centre opportunities and migration movement is missing", here are the two issues:

### Issue 1: Text Formatting Missing

**Problem:** Response text appears as single paragraph without line breaks

**Root Cause:** Backend not sending `\n` characters in response text

**Fix Location:** Backend `jarvis_formatter.py` or response builder

**Solution:**
```python
# ❌ Current (probably):
text = "Dubai is #1. Key drivers: 0% tax, golden visa."

# ✅ Should be:
text = "Dubai is #1.\n\nKey drivers:\n• 0% tax\n• Golden visa"
```

**Frontend Support:** Already working - uses `whitespace-pre-wrap` to preserve line breaks

---

### Issue 2: Map Not Showing

**Problem:** Map visualization not appearing in Ask Rohith responses

**Root Cause:** Backend not sending `world_map` visualization type

**Fix Location:** Backend visualization detector or response builder

**Solution:**
```python
# Add this to backend response:
response["visualizations"].append({
    "type": "world_map",  # Exact string match required
    "data": {
        "auto_fetch_opportunities": True,
        "show_hnwi_patterns": True
    }
})
```

---

## Testing Procedure

### Step 1: Check Backend Response (CRITICAL)

**Open Browser DevTools:**
1. Go to http://localhost:3001/ask-rohith
2. Open DevTools (F12)
3. Go to Network tab
4. Send query: "Show me HNWI migration patterns"
5. Find request: `/api/v5/rohith/message/{id}`
6. Check Response tab

**Expected Response:**
```json
{
  "text": "Dubai has emerged as the #1 HNWI destination.\n\nKey drivers:\n• 0% tax\n• Golden visa",
  "visualizations": [
    {
      "id": "viz_map_123",
      "type": "world_map",
      "data": {
        "auto_fetch_opportunities": true,
        "show_hnwi_patterns": true
      }
    }
  ]
}
```

**If visualizations array is empty or missing:**
→ Backend issue - not sending map visualization

**If text has no `\n` characters:**
→ Backend issue - not formatting text with line breaks

---

### Step 2: Check Console Logs

**Open Browser Console tab**

**Expected Logs:**
```
[WorldMapViz] Auto-fetching command centre opportunities...
[WorldMapViz] Fetched opportunities: { prive: 12, crown: 5 }
[WorldMapViz] Total cities before migration hubs: 17
[WorldMapViz] Added migration hubs: 6
[WorldMapViz] Migration hub cities: ['Dubai', 'Singapore', 'London', 'New York', 'Hong Kong', 'Monaco']
[WorldMapViz] Generating migration flows from cities: 23
[WorldMapViz] City names: ['Dubai', 'Singapore', 'London', ...]
[WorldMapViz] Generated migration flows: 10
[WorldMapViz] Final cities count: 23
```

**If NO logs appear:**
- Map component is not rendering
- Backend not sending `world_map` visualization type
- Check Network tab (Step 1)

**If logs show errors:**
- Check specific error message
- Check TROUBLESHOOTING_MAP_ISSUES.md

---

### Step 3: Test Command Centre API

**Open new browser tab:**
```
http://localhost:3001/api/command-centre/opportunities?include_crown_vault=true&view=all&timeframe=LIVE
```

**Expected:**
```json
{
  "prive_opportunities": [
    {
      "title": "Opportunity 1",
      "jurisdiction": "Dubai",
      "tier": "$100K",
      ...
    }
  ],
  "crown_vault_opportunities": [...]
}
```

**If empty arrays:**
- User has no opportunities in database
- Need to seed test data

---

## Backend Integration (Required)

### File to Modify

**Primary:** `services/rohith_v5/jarvis_formatter.py`
**OR:** `services/rohith_v5/visualization_detector.py`

### What to Add

```python
def detect_visualizations(query: str, context: dict) -> list:
    """Detect which visualizations to include in response."""
    visualizations = []

    # Add world map for geography/migration queries
    geography_keywords = ['map', 'geography', 'location', 'where', 'migration', 'moving', 'flows']
    if any(kw in query.lower() for kw in geography_keywords):
        visualizations.append({
            "id": f"viz_map_{uuid.uuid4().hex[:8]}",
            "type": "world_map",
            "position": "center",
            "size": "large",
            "animation": "materialize",
            "duration_ms": 500,
            "priority": 1,
            "interactive": True,
            "data": {
                "title": "Global HNWI Migration Patterns",
                "auto_fetch_opportunities": True,
                "show_crown_assets": True,
                "show_prive_opportunities": True,
                "show_hnwi_patterns": True
            }
        })

    return visualizations
```

### Text Formatting

```python
def format_response_text(data: dict) -> str:
    """Format response with proper line breaks."""
    # Use \n for line breaks
    # Use \n\n for paragraph breaks
    # Use • for bullet points

    text = f"{data['main_point']}\n\n"
    text += "Key drivers:\n"
    for driver in data['drivers']:
        text += f"• {driver}\n"

    return text
```

---

## Frontend Debug Mode (Already Added)

I've added comprehensive debug logging to `WorldMapViz.tsx`:

**Logs show:**
1. When opportunities fetch starts
2. How many opportunities fetched
3. How many cities extracted
4. When migration hubs added
5. Migration hub city names
6. When migration flows generated
7. How many flows created
8. Any city matching failures

**To view logs:**
- Open browser console
- Send query with "map" or "migration"
- Look for `[WorldMapViz]` prefix

---

## What Frontend Already Handles

✅ **Auto-fetching command centre data**
- Fetches `/api/command-centre/opportunities`
- Extracts locations from opportunities
- Creates markers for Privé Exchange
- Creates markers for Crown Vault assets

✅ **Migration hubs (6 cities)**
- Dubai, Singapore, London, NYC, Hong Kong, Monaco
- Population data, net flows, drivers

✅ **Migration arrows (10 corridors)**
- Color-coded (green/red)
- Animated flowing dashes
- Dynamic thickness
- Interactive hover/click

✅ **Text formatting**
- Preserves `\n` line breaks
- Supports bullet points `•`
- Uses `whitespace-pre-wrap`

---

## Next Steps

### For You (Right Now)

1. **Test with this query:** "Show me HNWI migration patterns"

2. **Open DevTools and check:**
   - Network tab → Backend response has `visualizations` array?
   - Console tab → `[WorldMapViz]` logs appear?
   - Network tab → `/api/command-centre/opportunities` returns data?

3. **Share results:**
   - Screenshot of Network tab response
   - Screenshot of Console logs
   - Describe what you see vs. what's missing

### For Backend Team

1. **Add world_map visualization to responses**
   - See BACKEND_MAP_INTEGRATION_GUIDE.md
   - Add to queries containing: map, geography, migration, location

2. **Format text with line breaks**
   - Use `\n` for line breaks
   - Use `\n\n` for paragraph breaks
   - Use `•` for bullet points

3. **Test endpoint:**
   - Send query with "migration" keyword
   - Verify response includes `visualizations` array
   - Verify text has `\n` characters

---

## Documentation Created

1. **BACKEND_MAP_INTEGRATION_GUIDE.md** - Complete backend integration
2. **TROUBLESHOOTING_MAP_ISSUES.md** - Detailed debugging steps
3. **DEBUGGING_SUMMARY.md** - This file (quick reference)
4. **MIGRATION_ARROWS_COMPLETE.md** - Technical implementation details
5. **ASK_ROHITH_JARVIS_FINAL_STATUS.md** - Full project summary

---

## Quick Reference

### Backend Must Send

```python
{
    "text": "Response with\n\nline breaks",
    "visualizations": [{
        "type": "world_map",
        "data": {"auto_fetch_opportunities": True}
    }]
}
```

### Frontend Console Logs

```
[WorldMapViz] Fetched opportunities: { prive: X, crown: Y }
[WorldMapViz] Generated migration flows: 10
```

### Test URL

```
http://localhost:3001/ask-rohith
Query: "Show me HNWI migration patterns"
```

---

## Expected Result

When working correctly:

1. **Text:** Appears with proper line breaks and bullet points
2. **Map:** Interactive Leaflet map appears below text
3. **Markers:** Green/gold dots for opportunities
4. **Hubs:** 6 blue bubbles for migration cities
5. **Arrows:** 10 animated flowing arrows between cities
6. **Interactions:** Click markers = popup, hover arrows = glow

---

## Need Help?

1. Run the test query: "Show me HNWI migration patterns"
2. Open DevTools (F12)
3. Share:
   - Network tab → `/api/v5/rohith/message/{id}` response
   - Console tab → All `[WorldMapViz]` logs
   - Screenshot of what you see

This will help pinpoint the exact issue!
