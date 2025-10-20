# is_new Blinking Indicator Implementation

## Overview
Successfully implemented blinking visual indicators for opportunities where the backend sends `is_new: true`.

## Files Modified

### 1. Type Definitions
**File: `components/interactive-world-map.tsx:51`**
```typescript
is_new?: boolean
```
Added to City interface.

**File: `components/home-dashboard-elite.tsx:52`**
```typescript
is_new?: boolean     // New opportunity indicator from backend
```
Added to Opportunity interface with documentation.

### 2. Data Pipeline
**File: `components/home-dashboard-elite.tsx:253`**
```typescript
is_new: opp.is_new,
```
Passes the `is_new` field from backend API through the data transformation pipeline.

### 3. Visual Indicators

#### A. Map Popup - Single View
**File: `components/map/map-popup-single.tsx:66-74`**

Displays a "NEW" badge with blinking dot next to the opportunity title:

```tsx
{city.is_new && (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-primary/10 text-primary rounded border border-primary/30">
    <span className="relative flex h-1.5 w-1.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
    </span>
    NEW
  </span>
)}
```

**Visual:** `[●] NEW` badge with animated pulsing dot

#### B. Map Markers
**File: `lib/map-markers.tsx:81-93`**

Adds a pulsing ring animation around the marker pin:

```typescript
const blinkingRing = city.is_new ? `
  <div class="pulse-ring" style="
    position: absolute;
    top: 50%;
    left: 50%;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid ${color};
    opacity: 0;
    pointer-events: none;
  "></div>
` : ''
```

**Visual:** Expanding/fading ring that pulses outward continuously

**File: `lib/map-markers.tsx:134-135`**
Adjusted icon size to accommodate the pulsing ring:
```typescript
const iconSize = city.is_new ? [24, 24] : [16, 16]
const iconAnchor = city.is_new ? [12, 12] : [8, 8]
```

#### C. Cluster Popup List
**File: `components/map/map-popup-cluster.tsx:60-68`**

Same NEW badge in opportunity lists:

```tsx
{city.is_new && (
  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold bg-primary/10 text-primary rounded border border-primary/30 flex-shrink-0 ml-1">
    <span className="relative flex h-1.5 w-1.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
    </span>
    NEW
  </span>
)}
```

### 4. CSS Animations
**File: `components/map/map-styles.tsx:103-125`**

Added global animations:

```css
/* Pulsing ring animation for new opportunities */
@keyframes pulse-ring {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}
.pulse-ring {
  animation: pulse-ring 1.5s ease-out infinite;
}

/* Blinking dot animation for NEW badges */
@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}
.animate-ping {
  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}
```

## How It Works

### Data Flow:
```
Backend API
  ↓ sends: { is_new: true, ... }
/api/command-centre/opportunities
  ↓
Next.js Proxy
  ↓
SecureApi Client
  ↓
HomeDashboardElite
  ↓ transforms to City format, preserves is_new
InteractiveWorldMap
  ↓
Map Components
  ↓ render visual indicators
User sees blinking animations
```

### Visual Behavior:

**When `is_new: true`:**

1. **Map Marker:**
   - Colored dot with expanding pulsing ring
   - Ring fades as it expands (1.5s loop)
   - Larger hitbox (24px vs 16px)

2. **Popup Title:**
   - "NEW" badge appears after title
   - Red blinking dot inside badge
   - Dot pulses with scale animation

3. **Cluster List:**
   - Same NEW badge in list items
   - Consistent styling across all views

**When `is_new: false` or `undefined`:**
- No badge or pulsing ring
- Standard marker display (16px)

## Animation Timing:
- **Pulse Ring:** 1.5s ease-out infinite
- **Blinking Dot:** 1.5s cubic-bezier infinite

Both animations are synchronized to the same duration for visual consistency.

## Testing

### To test the implementation:

1. **Backend Setup:**
   Ensure backend sends opportunities with `is_new: true`:
   ```json
   {
     "title": "Test Opportunity",
     "is_new": true,
     ...
   }
   ```

2. **Visual Verification:**
   - **Map View:** Look for pulsing rings around marker pins
   - **Popup:** Click marker, verify "NEW" badge with blinking dot
   - **Cluster:** Click cluster, verify NEW badges in list

3. **Browser DevTools:**
   - Open React DevTools
   - Inspect City object
   - Verify `is_new: true` is present

### Manual Test (if backend doesn't have is_new yet):

Temporarily modify `home-dashboard-elite.tsx:253`:
```typescript
is_new: opp.is_new || index === 0, // Force first opportunity to be "new"
```

This will make the first opportunity show as new for testing purposes.

## Styling Consistency

The NEW badge uses the same design pattern as other UI elements:
- Primary color theme (`text-primary`, `bg-primary/10`)
- Border styling (`border border-primary/30`)
- Same animation as "Live Data" indicator
- Responsive sizing (`text-[10px]` in popup, `text-[9px]` in cluster)

## Performance Considerations

- CSS animations are hardware-accelerated
- No JavaScript animation loops
- Animations only render when `is_new: true`
- Minimal DOM overhead (one extra div for ring, one span for badge)

## Browser Compatibility

Animations work in all modern browsers:
- Chrome/Edge (Blink engine)
- Firefox
- Safari (WebKit)

CSS uses standard transform/opacity properties with vendor prefixes handled by PostCSS.
