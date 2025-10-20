# Data Transformation Analysis: Backend → Frontend

## The Issue

The backend is sending different data than what the frontend is displaying for opportunities in the home dashboard.

## Data Flow Architecture

```
Backend API (localhost:8000)
    ↓
/api/command-centre/opportunities
    ↓
Next.js Proxy (/app/api/[...proxy]/route.ts)
    ↓
SecureApi Client (lib/secure-api.ts)
    ↓
HomeDashboardElite Component
    ↓
Map Popup Display (components/map/map-popup-single.tsx)
    ↓
Utility Transformations (lib/map-utils.ts)
```

## Transformation Functions

### 1. **formatSource()** - Line 113-126 in lib/map-utils.ts

**Transforms:**
- Backend: `"prive exchange"` or `"privé exchange"` → Frontend: `"Market Place"`
- Backend: `"moev4"` or `"moe v4"` → Frontend: `"Live HNWI Data"`

**Code:**
```typescript
export function formatSource(source: string | undefined): string | undefined {
  if (!source) return source
  const lowerSource = source.toLowerCase()

  if (lowerSource === 'moev4' || lowerSource === 'moe v4') {
    return 'Live HNWI Data'
  }

  if (lowerSource === 'prive exchange' || lowerSource === 'privé exchange') {
    return 'Market Place'
  }

  return source
}
```

### 2. **formatLabel()** - Line 33-46 in lib/map-utils.ts

**Transforms:**
- Converts `MEDIUM` → `Medium`
- Converts `FAR_FETCHED` → `Far Fetched`
- Converts `JUICY` → `Juicy`
- Removes underscores and converts to Title Case

**Code:**
```typescript
export function formatLabel(text: string | undefined): string | undefined {
  if (!text) return text

  // Replace underscores with spaces
  let formatted = text.replace(/_/g, ' ')

  // Convert from all caps or mixed case to Title Case
  formatted = formatted.toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return formatted
}
```

### 3. **cleanAnalysisText()** - Line 81-108 in lib/map-utils.ts

**Transforms:**
Removes redundant prefixes from analysis text by finding "Risk Profile:" and parsing everything after " - "

## Specific Example: "Luxury Watch Investment"

### Display Mapping in map-popup-single.tsx:

| Frontend Label | Backend Field | Transformation | Display Value |
|---------------|---------------|----------------|---------------|
| **Entry Investment** | `value` | `formatValue()` | `$15K` |
| **Risk Profile** | `risk` | `formatLabel()` | `Medium` (from `MEDIUM` or `medium`) |
| **Source** | `source` | `formatSource()` | `Market Place` (from `Prive Exchange`) |
| **Opportunity Demand** | `victor_score` | `formatLabel()` | `Far Fetched` (from `FAR_FETCHED`) |
| **Analysis** | `analysis` | `cleanAnalysisText()` | Rolex Submariner text |
| **Elite Pulse** | `elite_pulse_analysis` | `cleanAnalysisText()` | Analysis text |

## The Discrepancy

### What Backend Likely Sends:
```json
{
  "title": "Luxury Watch Investment under USD 15K",
  "location": "United States",
  "value": "15000" or "$15K",
  "risk": "MEDIUM" or "medium",
  "source": "Prive Exchange" or "privé exchange",
  "victor_score": "FAR_FETCHED" or "far_fetched",
  "analysis": "Entry Investment: $15K - Risk Profile: Medium - The Rolex Submariner...",
  "elite_pulse_analysis": "Clarify exact reference..."
}
```

### What Frontend Displays:
```
Entry Investment: $15K        (from value field)
Risk Profile: Medium          (from risk field via formatLabel)
Source: Market Place          (from source field via formatSource)
Opportunity Demand: Far Fetched (from victor_score via formatLabel)
Analysis: The Rolex Submariner... (from analysis via cleanAnalysisText)
Elite Pulse: Clarify exact reference... (from elite_pulse_analysis)
```

## Where Data Gets Transformed

### In home-dashboard-elite.tsx (Lines 204-270):
Data is copied from API response to City format WITHOUT transformation:

```typescript
return {
  name: displayName,
  country: opp.country || 'Unknown',
  latitude: lat,
  longitude: lng,
  title: opp.title,           // ← Direct copy
  value: opp.value,            // ← Direct copy
  risk: opp.risk,              // ← Direct copy
  source: opp.source,          // ← Direct copy
  victor_score: opp.victor_score, // ← Direct copy
  analysis: opp.analysis,      // ← Direct copy
  elite_pulse_analysis: opp.elite_pulse_analysis, // ← Direct copy
}
```

### In map-popup-single.tsx (Lines 80-129):
Data is FORMATTED during display:

```typescript
{city.value && (
  <div className="flex justify-between items-center">
    <span className="text-xs text-muted-foreground">Entry Investment:</span>
    <span className="text-xs font-bold text-primary">{formatValue(city.value)}</span>
  </div>
)}

{city.risk && (
  <div className="flex justify-between items-center">
    <span className="text-xs text-muted-foreground">Risk Profile:</span>
    <span className="text-xs font-medium">{formatLabel(city.risk)}</span>
  </div>
)}

{city.source && (
  <div className="flex justify-between items-center">
    <span className="text-xs text-muted-foreground">Source:</span>
    <span className="text-xs font-medium">{formatSource(city.source)}</span>
  </div>
)}

{city.victor_score && (
  <div className="flex justify-between items-center">
    <span className="text-xs text-muted-foreground">Opportunity Demand:</span>
    <span className="text-xs font-medium">{formatLabel(city.victor_score)}</span>
  </div>
)}
```

## Solution

The discrepancy is **BY DESIGN** - the transformations are intentional to:
1. Make user-facing text more readable (Title Case vs ALL_CAPS)
2. Provide consistent branding ("Market Place" instead of technical "Prive Exchange")
3. Clean up analysis text from redundant metadata

If you need to see the **raw backend data** without transformations, you should:

### Option 1: Check Network Tab
Open DevTools → Network tab → Find the `/api/command-centre/opportunities` request

### Option 2: Add Debug Logging
In `home-dashboard-elite.tsx` after line 200, add:
```typescript
console.log('Raw opportunity from backend:', opp)
```

### Option 3: Disable Transformations Temporarily
Comment out the formatting functions in `map-popup-single.tsx`:
```typescript
{formatLabel(city.risk)}  // ← Remove this
{city.risk}               // ← Show raw data
```

## Recommendation

✅ **Keep the transformations** - They improve UX by making data more readable.

❌ **Don't modify** - These transformations are working as intended and provide a better user experience than showing raw API data (e.g., "FAR_FETCHED" vs "Far Fetched").
