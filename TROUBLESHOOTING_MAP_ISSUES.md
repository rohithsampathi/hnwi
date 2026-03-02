# Troubleshooting Guide - Map & Text Formatting Issues

## Issue 1: Text Formatting Missing

### Symptoms
- Response text appears as single paragraph
- No line breaks between bullet points
- Lists appear on one line

### Root Cause
Backend is not sending `\n` (line break) characters in the response text.

### Fix

**Backend must format text with line breaks:**

```python
# ❌ WRONG - No line breaks
text = "Dubai is the #1 destination. Key drivers: 0% tax, golden visa, lifestyle."

# ✅ CORRECT - With line breaks
text = """Dubai is the #1 destination.

Key drivers:
• 0% tax
• Golden visa
• Lifestyle infrastructure"""
```

**Or using explicit `\n`:**

```python
text = "Dubai is the #1 destination.\n\nKey drivers:\n• 0% tax\n• Golden visa\n• Lifestyle infrastructure"
```

### Verification

**Check browser console:**
```javascript
// Should see newlines in text
console.log(message.text)
// Output should show:
// "Dubai is the #1 destination.\n\nKey drivers:\n• 0% tax..."
```

**Frontend renders with `whitespace-pre-wrap`:**
- Single `\n` = line break
- Double `\n\n` = paragraph break
- Bullet points `•` are preserved

---

## Issue 2: Map Not Showing

### Symptoms
- No map visualization in Ask Rohith response
- Only text appears, no interactive map

### Debug Steps

#### Step 1: Check Backend Response

**Open browser DevTools → Network tab**

Look for: `/api/v5/rohith/message/{id}` or `/api/v5/rohith/start`

**Check response JSON:**

```json
{
  "text": "...",
  "visualizations": [
    {
      "type": "world_map",  // ← Must be present
      "data": {
        "auto_fetch_opportunities": true  // ← Must be true
      }
    }
  ]
}
```

**Common Issues:**

❌ **visualizations array is empty**
```json
{
  "text": "...",
  "visualizations": []  // No map!
}
```

❌ **Wrong visualization type**
```json
{
  "type": "geographic_map",  // Typo! Should be "world_map"
  "data": {...}
}
```

❌ **Missing data object**
```json
{
  "type": "world_map"
  // Missing "data" object!
}
```

#### Step 2: Check Console Logs

**Open browser DevTools → Console**

**Look for WorldMapViz logs:**

```
[WorldMapViz] Auto-fetching command centre opportunities...
[WorldMapViz] Fetched opportunities: { prive: 12, crown: 5 }
[WorldMapViz] Total cities before migration hubs: 17
[WorldMapViz] Added migration hubs: 6
[WorldMapViz] Migration hub cities: ['Dubai', 'Singapore', ...]
[WorldMapViz] Generating migration flows from cities: 23
[WorldMapViz] Generated migration flows: 10
[WorldMapViz] Final cities count: 23
```

**If you see NO logs at all:**
- Map component is not rendering
- Backend not sending `world_map` visualization
- Check Network tab for backend response

**If you see errors:**
```
Failed to fetch map data: TypeError: Cannot read property...
```
- Check API endpoint is reachable
- Check user is authenticated
- Check CORS settings

#### Step 3: Test with Hardcoded Data

**Temporarily modify WorldMapViz for testing:**

```typescript
// In WorldMapViz.tsx, useEffect:
useEffect(() => {
  const fetchMapData = async () => {
    try {
      // TEMPORARY: Force render migration hubs for testing
      const testCities = getMigrationHubs();
      setCities(testCities);

      const testFlows = generateMigrationFlows(testCities);
      setMigrationFlows(testFlows);

      setLoading(false);
      return; // Skip API fetch for now

      // ... rest of code
    }
  }
});
```

**If map appears now:**
- Problem is with data fetching, not rendering
- Check command centre API
- Check authentication

**If map still doesn't appear:**
- Check browser console for JavaScript errors
- Check if Leaflet CSS is loading
- Check if dynamic import is working

---

## Issue 3: No Command Centre Opportunities

### Symptoms
- Map appears
- Migration hubs visible (6 cities)
- Migration arrows visible (10 arrows)
- **BUT** no opportunity markers (green/gold dots)

### Debug Steps

#### Step 1: Check Console

**Look for:**
```
[WorldMapViz] Fetched opportunities: { prive: 0, crown: 0 }
```

**If prive = 0 and crown = 0:**
- Command centre API returned empty data
- User has no opportunities
- API endpoint might be failing silently

#### Step 2: Test Command Centre API Directly

**Open new browser tab:**
```
http://localhost:3000/api/command-centre/opportunities?include_crown_vault=true&view=all&timeframe=LIVE
```

**Should return:**
```json
{
  "prive_opportunities": [...],  // Array of opportunities
  "crown_vault_opportunities": [...]  // Array of assets
}
```

**If empty arrays:**
- User has no opportunities in database
- Backend not generating test data
- Need to seed database with opportunities

#### Step 3: Check Backend Logs

**Backend should log:**
```
[Command Centre] Fetching opportunities for user: 123
[Command Centre] Found 12 Privé opportunities
[Command Centre] Found 5 Crown Vault assets
```

**If backend returns 0 opportunities:**
- Database query might be filtering too aggressively
- User ID not matching
- Opportunities not assigned to user

---

## Issue 4: No Migration Arrows

### Symptoms
- Map appears
- Opportunities visible
- Migration hubs visible
- **BUT** no animated arrows between cities

### Debug Steps

#### Step 1: Check Console

**Look for:**
```
[WorldMapViz] Generated migration flows: 0
```

**If flows = 0:**
```
[WorldMapViz] Could not find cities for corridor: Mumbai → Dubai { sourceFound: false, destFound: false }
```

**This means:**
- City name matching is failing
- Migration hub cities not being added
- City names don't match corridor definitions

#### Step 2: Check Migration Hubs Added

**Look for:**
```
[WorldMapViz] Added migration hubs: 6
[WorldMapViz] Migration hub cities: ['Dubai', 'Singapore', 'London', 'New York', 'Hong Kong', 'Monaco']
```

**If 0 migration hubs:**
- `show_hnwi_patterns` might be false
- `getMigrationHubs()` function not executing

**Check backend response:**
```json
{
  "type": "world_map",
  "data": {
    "show_hnwi_patterns": true  // ← Must be true
  }
}
```

#### Step 3: Check City Name Matching

**Console should show:**
```
[WorldMapViz] City names: ['Dubai', 'Singapore', 'London', ...]
```

**If names don't match corridor definitions:**
- City names might be different (e.g., "Dubai, UAE" vs "Dubai")
- Matching logic might need adjustment

**Check city matching logic in generateMigrationFlows:**
```typescript
const sourceCity = cities.find(city => {
  const cityName = city.name.toLowerCase();
  const corridorSource = corridor.source.toLowerCase();
  // Bidirectional matching
  return cityName === corridorSource ||
         cityName.includes(corridorSource) ||
         corridorSource.includes(cityName);
});
```

---

## Issue 5: Map Renders But Empty

### Symptoms
- Map container appears
- No markers, no hubs, no arrows
- Just blank map tiles

### Debug Steps

#### Step 1: Check Final Cities Count

**Console should show:**
```
[WorldMapViz] Final cities count: 23
```

**If count = 0:**
- No data was loaded
- All API fetches failed
- Check error handling

#### Step 2: Check Error State

**Look for:**
```
Failed to fetch map data: ...
```

**Check network errors:**
- API endpoint down
- CORS issues
- Authentication failed

#### Step 3: Check Loading State

**If map never stops loading:**
- Spinner shows forever
- `setLoading(false)` never called
- Check try/catch/finally blocks

---

## Quick Fix Checklist

### Backend
- [ ] Send `visualizations` array with `type: "world_map"`
- [ ] Include `data.auto_fetch_opportunities: true`
- [ ] Include `data.show_hnwi_patterns: true` for arrows
- [ ] Format text with `\n` for line breaks
- [ ] Use `\n\n` for paragraph breaks

### Frontend
- [ ] Check console for `[WorldMapViz]` logs
- [ ] Verify opportunities fetch succeeds
- [ ] Verify migration hubs are added (count = 6)
- [ ] Verify migration flows generated (count = 10)
- [ ] Check for JavaScript errors

### API Endpoints
- [ ] `/api/command-centre/opportunities` is reachable
- [ ] Returns data for current user
- [ ] User has opportunities in database

### Browser
- [ ] Clear cache and hard reload (Cmd+Shift+R / Ctrl+Shift+R)
- [ ] Check browser console for errors
- [ ] Check Network tab for failed requests
- [ ] Verify Leaflet CSS is loading

---

## Test Queries

### Should Trigger Map
- "Show me opportunities on the map"
- "HNWI migration from London to Dubai"
- "Where are HNWIs moving to?"
- "Map global migration patterns"
- "Compare Dubai and Singapore"

### Backend Response Example
```python
{
    "text": "Dubai has emerged as the #1 HNWI destination.\n\nKey drivers:\n• 0% income tax\n• Golden visa\n• Luxury lifestyle",
    "visualizations": [
        {
            "type": "world_map",
            "data": {
                "title": "Global HNWI Migration Patterns",
                "auto_fetch_opportunities": True,
                "show_hnwi_patterns": True
            }
        }
    ]
}
```

---

## Still Not Working?

### Step 1: Check Basics
```bash
# Restart dev server
npm run dev

# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

### Step 2: Test Individual Components

**Test InteractiveWorldMap directly:**
```typescript
// In a test page
import { InteractiveWorldMap } from '@/components/interactive-world-map';

const testCities = [
  {
    name: 'Dubai',
    latitude: 25.2048,
    longitude: 55.2708,
    title: 'Test Marker'
  }
];

<InteractiveWorldMap cities={testCities} />
```

**Should render map with one marker.**

### Step 3: Enable All Debug Logging

**In WorldMapViz.tsx, temporarily remove `process.env.NODE_ENV` checks:**

```typescript
// Before:
if (process.env.NODE_ENV === 'development') {
  console.log('[WorldMapViz] ...');
}

// After (temporarily):
console.log('[WorldMapViz] ...');
```

**This will log even in production to help debug.**

---

## Summary

**Most Common Issues:**

1. **Backend not sending `world_map` visualization type** (80%)
2. **Text missing line breaks** (10%)
3. **Command centre API returning empty data** (5%)
4. **Migration flows not generating due to city name mismatch** (5%)

**Quick Fixes:**

1. Add world_map visualization to backend response
2. Format text with `\n` characters
3. Ensure user has opportunities in database
4. Check console logs for specific errors

**Still stuck?** Share console logs and Network tab response for detailed debugging.
