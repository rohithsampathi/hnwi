# 🔗 Citation Integration - Complete Implementation

## Overview

The Command Centre map now supports clickable DEVID citations in opportunity popups, matching the legacy version functionality:
- **Desktop**: Opens 3rd panel on the right side
- **Mobile**: Opens popup modal overlay

---

## How It Works

### 1. Citation Parsing

**Location**: `/lib/parse-dev-citations.ts`

Parses patterns like:
- `[Dev ID: abc123]`
- `[DEVID: xyz789]`
- `[Dev ID - abc123]`

Converts to clickable HTML:
```html
<citation data-id="abc123" data-number="1">[1]</citation>
```

### 2. Data Flow

```
Backend API Response (opportunities with analysis text containing [Dev ID: xxx])
    ↓
home-dashboard-elite.tsx - Extract all Dev IDs using extractDevIds()
    ↓
Build citation map with unique IDs and sequential numbers
    ↓
Pass citations to useCitationManager hook
    ↓
Map displays opportunities with hasCitations flag
    ↓
User clicks on map marker → Popup opens with analysis text
    ↓
renderTextWithCitations() converts [Dev ID: xxx] to clickable <citation>
    ↓
User clicks citation → handleCitationClick(citationId) fires
    ↓
openCitation() from useCitationManager updates state
    ↓
EliteCitationPanel opens (3rd panel desktop / modal mobile)
```

---

## Key Files Modified

### `/components/interactive-world-map.tsx`

**Changes**:
1. Added `devIds` and `hasCitations` to `City` interface
2. Added `onCitationClick` prop to component
3. Added `renderTextWithCitations()` function:
   - Parses citations using `parseDevCitations()`
   - Returns HTML with click handlers
   - Detects clicks on `<citation>` tags
   - Calls `onCitationClick(citationId)`
4. Updated popup to conditionally render citations
5. Added CSS styling for clickable citations

**Citation Styles**:
```css
citation {
  color: gold (dark) / blue (light);
  font-weight: 600;
  cursor: pointer;
  border-bottom: 1px dashed;
  transition: all 0.2s ease;
}
citation:hover {
  background-color: semi-transparent highlight;
  border-bottom-style: solid;
}
```

### `/components/home-dashboard-elite.tsx`

**Changes**:
1. Imported `useCitationManager` hook
2. Imported `EliteCitationPanel` component
3. Imported `extractDevIds` from parse-dev-citations
4. Added citation extraction during opportunity transformation:
   ```typescript
   const analysisText = opp.analysis || opp.elite_pulse_analysis || ''
   const devIds = extractDevIds(analysisText)
   ```
5. Collected all unique citations across all opportunities
6. Added `handleCitationClick` callback
7. Passed `onCitationClick={handleCitationClick}` to map
8. Added desktop and mobile citation panels:
   - Desktop: Hidden on mobile, fixed panel
   - Mobile: Modal overlay with backdrop

---

## Usage Example

### Backend Response
```json
{
  "opportunities": [
    {
      "title": "Dubai Real Estate",
      "analysis": "Premium opportunity based on [Dev ID: 67890abc] showing regional growth patterns [Dev ID: 12345xyz].",
      "elite_pulse_analysis": "Market analysis references [Dev ID: abcdef123]."
    }
  ]
}
```

### Frontend Processing
```typescript
// 1. Extract citations
const devIds = extractDevIds(opp.analysis)
// Result: ['67890abc', '12345xyz']

// 2. Build citation map
allCitations = [
  { id: '67890abc', number: 1, originalText: '[Dev ID: 67890abc]' },
  { id: '12345xyz', number: 2, originalText: '[Dev ID: 12345xyz]' },
  { id: 'abcdef123', number: 3, originalText: '[Dev ID: abcdef123]' }
]

// 3. Render with citations
renderTextWithCitations(opp.analysis)
// Output: "Premium opportunity based on <citation data-id="67890abc">[1]</citation>
//          showing regional growth patterns <citation data-id="12345xyz">[2]</citation>."
```

### User Interaction
1. User clicks map marker
2. Popup shows opportunity details
3. Analysis text has clickable `[1]`, `[2]`, `[3]` citations (gold/blue colored)
4. User clicks citation `[1]`
5. Desktop: EliteCitationPanel slides in from right
6. Mobile: Modal popup appears with citation details
7. Panel shows Dev ID: 67890abc with full development details

---

## Visual Design

### Desktop Layout
```
┌─────────────────────┬──────────────────────┐
│                     │                      │
│   Map with markers  │  Citation Panel      │
│                     │  ┌────────────────┐  │
│   📍 Opportunity    │  │ Dev ID Details │  │
│   └─ [1] [2] [3]    │  │                │  │
│                     │  │ • Title        │  │
│                     │  │ • Summary      │  │
│                     │  │ • Full text    │  │
│                     │  └────────────────┘  │
└─────────────────────┴──────────────────────┘
```

### Mobile Layout
```
┌──────────────────────────┐
│  Map with markers        │
│  📍 Opportunity          │
│  └─ Click [1] →          │
│                          │
│  ┌────────────────────┐  │
│  │ Modal Overlay      │  │
│  │ Dev ID: abc123     │  │
│  │ ────────────────── │  │
│  │ • Development info │  │
│  │ • Summary          │  │
│  │ [Close]            │  │
│  └────────────────────┘  │
└──────────────────────────┘
```

---

## Testing Checklist

- [ ] Backend returns opportunities with `[Dev ID: xxx]` patterns
- [ ] Frontend extracts all Dev IDs correctly
- [ ] Map markers show with citation-enabled content
- [ ] Clicking marker shows popup with analysis
- [ ] Citations appear as clickable `[1]`, `[2]`, `[3]` links
- [ ] Citations are styled (gold in dark mode, blue in light mode)
- [ ] Hover effect shows on citations
- [ ] Clicking citation opens panel (desktop) or modal (mobile)
- [ ] Panel displays correct Dev ID details
- [ ] Close button works
- [ ] Multiple citations on same opportunity work
- [ ] Works in both dark and light themes

---

## Benefits

1. **Contextual Intelligence**: Users see which developments support each opportunity
2. **Transparency**: Direct link between opportunities and source intelligence
3. **Deep Research**: Click through to full HNWI World development details
4. **Pattern Recognition**: See how multiple developments connect to opportunities
5. **Trust Building**: Verifiable sourcing for all recommendations

---

## Next Enhancements (Future)

1. **Citation Preview**: Hover tooltip showing dev summary before clicking
2. **Citation Badges**: Color-code by development type (regulatory, market, trend)
3. **Multi-Citation View**: Show all developments for opportunity in grid
4. **Citation Analytics**: Track which developments drive most engagement
5. **Export Citations**: Download opportunity with all source developments
6. **Citation Search**: Find all opportunities citing specific development

---

## Summary

The citation integration creates a seamless connection between:
- **Command Centre Map** (opportunities visualization)
- **HNWI World** (development intelligence database)
- **User Experience** (click-through research flow)

This completes the intelligence loop: opportunities backed by real developments, all accessible with a single click.
