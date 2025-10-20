# Blinking Opportunity Markers - Final Implementation

## What Was Fixed

The user wanted the **opportunity marker dots themselves** to blink when `is_new: true` - a clear opacity fade in/out effect, NOT a halo/glow.

## Implementation

### Map Markers (`lib/map-markers.tsx:80-120`)

When `is_new: true`, the marker dot itself blinks with:
- **Opacity fade** (1.0 → 0.3 → 1.0) - Clear blinking effect
- **Slight scale change** (1.0 → 0.95 → 1.0) - Subtle shrink for emphasis
- **Fast 1s animation** (infinite loop) - Noticeable blink

```typescript
@keyframes blink-marker {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.3;
    transform: scale(0.95);
  }
}
```

### Visual Effect:

**Normal marker (is_new: false):**
```
  ⬤  ← Solid colored dot (always visible)
```

**New marker (is_new: true):**
```
  ⬤  ← Fades in and out (opacity: 1 → 0.3 → 1)
  ↕
Blinks continuously (every 1 second)
```

The marker dot itself fades to 30% opacity and slightly shrinks, then returns to full visibility.

### Popup Badge (`components/map/map-popup-single.tsx:66-74`)

Badge shows `[●] NEW` with blinking dot (using Tailwind `animate-ping`)

### Cluster List (`components/map/map-popup-cluster.tsx:60-68`)

Same NEW badge appears in opportunity lists

## Test Mode

**File:** `components/home-dashboard-elite.tsx:253`

```typescript
is_new: opp.is_new || index === 0, // TEMPORARY: First opportunity shows as new
```

This forces the first opportunity to display as "new" for testing.

## What You'll See:

1. **On the Map:**
   - First opportunity marker **pulses continuously**
   - Glow expands and contracts
   - Slight opacity change creates blinking effect

2. **Click the Marker:**
   - Popup shows **`[●] NEW`** badge
   - Red dot in badge blinks

3. **Cluster View:**
   - NEW badge appears in list

## Animation Technique:

✅ **Uses inline `<style>` with `@keyframes`** in the HTML string
✅ **Works with Leaflet's divIcon innerHTML**
✅ **No external CSS dependencies**
✅ **Hardware-accelerated** (opacity + transform)
✅ **Direct marker blinking** (not halo/glow effect)

## Remove Test Mode:

When backend sends `is_new: true`, change line 253:

```typescript
// From:
is_new: opp.is_new || index === 0,

// To:
is_new: opp.is_new,
```

## Performance:

- CSS animation (hardware-accelerated)
- No JavaScript loops
- Only animates when `is_new: true`
- Smooth 60fps animation
