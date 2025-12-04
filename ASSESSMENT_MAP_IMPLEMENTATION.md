# C10 Assessment - Live Opportunity Map Implementation

## ✅ Complete Implementation

The C10 Assessment now features a **dramatic visual opportunity map** that shows opportunities disappearing in real-time as the user answers questions and the platform calibrates to their DNA signals.

---

## 🎯 Visual Experience

### Split-Screen Layout
- **Desktop**: Map on right (50%), Question on left (50%)
- **Mobile**: Map on top, Question below
- **Toggle**: User can hide/show map with button

### The Map Shows:
1. **Starting State**: 173 blue pulsing dots across a world map
2. **During Calibration**:
   - Opportunities turn red and disappear with expanding ripple effect
   - Counter animates: 173 → 128 → 116 → 94...
   - Latest filter event shows at bottom: "💥 Removing 45 small deals < $500K"
   - Blue scan line sweeps across map during calibration
3. **Real-Time Updates**:
   - Each answer triggers SSE calibration events
   - Map updates instantly showing opportunities vanishing
   - User clearly sees platform personalizing

---

## 🔥 Components Created

### 1. `AssessmentOpportunityMap.tsx`
**Location**: `/components/assessment/AssessmentOpportunityMap.tsx`

**Features**:
- Generates 173 initial opportunities with random global positions
- SVG-based world map with continents outline
- Animated opportunity markers:
  - **Active**: Blue pulsing dots (scale animation)
  - **Removed**: Red fade-out with expanding ripple effect
- Real-time counter showing active vs removed
- Latest 3 calibration events displayed at bottom
- Animated scan line during calibration

**Props**:
```typescript
{
  calibrationEvents: Array<{
    filter: string;
    message: string;
    removed: number;
    remaining: number;
  }>;
  isCalibrating: boolean;
}
```

**Visual States**:
- Header: Shows live count of opportunities (173 → fewer)
- Map: SVG with opportunity dots positioned by lat/long
- Footer: Shows latest filter messages
- Scan line: Blue horizontal line sweeping during calibration

---

### 2. `AssessmentQuestion.tsx` (Updated)
**Location**: `/components/assessment/AssessmentQuestion.tsx`

**New Layout**:
- Sticky header with progress bar
- Split-screen flex layout
- Map on right (or top on mobile)
- Question and choices on left (or bottom on mobile)
- Map toggle button in header

**New Props**:
```typescript
{
  calibrationEvents?: Array<CalibrationEvent>;
  isCalibrating?: boolean;
}
```

---

### 3. Assessment Page Integration
**Location**: `/app/(authenticated)/assessment/page.tsx`

**Changes**:
- Removed separate `CalibrationModal` component
- Passes `calibrationEvents` and `isCalibrating` from SSE hook directly to `AssessmentQuestion`
- Map shows calibration in-context instead of modal overlay

---

## 🎬 User Flow

### Question 1
1. User sees map with 173 blue pulsing opportunities
2. User selects answer and clicks "LOCK STRATEGIC POSITION"
3. **Calibration starts**:
   - Map header shows "🔑 Platform calibrating to your DNA signals..."
   - Blue scan line sweeps across map
   - SSE event 1: "Removing 45 small deals < $500K"
     - 45 random dots turn red and fade out with ripple effect
     - Counter: 173 → 128
   - SSE event 2: "Filtering 12 high-liquidity deals"
     - 12 more dots disappear
     - Counter: 128 → 116
4. Calibration completes
5. Question 2 appears

### Questions 2-10
- Process repeats
- User watches opportunity count steadily decrease
- Each answer triggers new calibration events
- Map provides **constant visual feedback** that platform is personalizing

---

## 🎨 Animation Details

### Opportunity Dots
**Active (Blue)**:
```javascript
- Scale: [1, 1.3, 1] (infinite pulse)
- Opacity: [0.8, 1, 0.8] (breathing effect)
- Duration: 2s
- Color: #3b82f6 (blue-500)
```

**Removed (Red)**:
```javascript
// Main dot
- Scale: 1 → 0
- Opacity: 1 → 0
- Duration: 1s
- Color: #ef4444 (red-500)

// Ripple effect
- Scale: 1 → 4
- Opacity: 1 → 0
- Duration: 1s
- Stroke: #ef4444
```

### Scan Line (During Calibration)
```javascript
- Position: top: 0% → 100%
- Duration: 3s
- Repeat: Infinity
- Color: Blue gradient with blur
```

### Calibration Events (Bottom)
```javascript
- Latest event: Full opacity, red background
- Previous event: 70% opacity, gray background
- Oldest event: 40% opacity, faded gray
- Fade in: opacity 0 → 1, y: 20 → 0
```

---

## 📊 Visual Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│ [HNWI ASSESSMENT PROTOCOL] [Hide Map] [Timer] [1/10]   │
│ ▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░ 10% Progress      │
└─────────────────────────────────────────────────────────┘

┌──────────────────┬─────────────────────────────────────┐
│                  │  OPPORTUNITY MAP                    │
│  QUESTION        │  ┌───────────────────────────────┐  │
│                  │  │ Global: 116  Filtered: 57    │  │
│  [Scenario 01]   │  │ 🔑 Platform calibrating...   │  │
│                  │  └───────────────────────────────┘  │
│  Title Here      │                                     │
│                  │  [World map with blue dots]         │
│  Question text   │  • • • •  •• •  • ••                │
│  ...             │  •  • •• • • • •  •                 │
│                  │   •• •  •  ••  • •                  │
│  [A] Choice 1    │  • •  •• •  • •  ••                 │
│  [B] Choice 2    │                                     │
│  [C] Choice 3    │  ┌───────────────────────────────┐  │
│  [D] Choice 4    │  │ 💥 Removing 12 deals          │  │
│                  │  │    128 → 116 remaining        │  │
│  [LOCK POSITION] │  └───────────────────────────────┘  │
└──────────────────┴─────────────────────────────────────┘
```

---

## 🎯 Why This Works

1. **Immediate Visual Feedback**: User sees opportunities vanishing in real-time
2. **Tangible Value**: Watching 173 → 94 makes "platform personalization" concrete
3. **Engagement**: Interactive map keeps user watching during processing
4. **Drama**: Red fade-out with ripples makes each removal feel significant
5. **Trust**: Transparency in filtering builds confidence

---

## 🚀 Testing

1. Start backend: `python3 main.py` (in `/mu` directory)
2. Start frontend: `npm run dev`
3. Navigate to `http://localhost:3000/assessment`
4. Answer Question 1
5. **Watch the map**:
   - Blue dots should start turning red and fading
   - Counter should decrease
   - Filter messages should appear at bottom
6. Continue through all 10 questions
7. Each answer should trigger new calibration events

---

## 📝 Configuration

### Opportunity Generation
- **Initial Count**: 173 opportunities
- **Distribution**: Random global coordinates (lat/long)
- **Categories**: Real Estate, Private Equity, Art, Carbon Credits, Precious Metals
- **Deal Sizes**: $100K, $250K, $500K, $1M, $2.5M

### Map Projection
- **Type**: Equirectangular (simple lat/long → x/y)
- **ViewBox**: 1000x500 SVG
- **Background**: Grid pattern + continent outlines

### Calibration Response
- **Removal**: Random selection from active opportunities
- **Target**: Match `calibrationEvent.remaining` count
- **Animation**: Triggered on opportunity state change

---

## 🎨 Styling Constants

```typescript
// Colors
const BLUE_ACTIVE = '#3b82f6';      // Active opportunities
const RED_REMOVED = '#ef4444';      // Removed opportunities
const GRAY_BG = '#1f2937';          // Background

// Sizes
const DOT_RADIUS = 4;               // Opportunity marker size
const RIPPLE_MAX = 4;               // Max ripple expansion (4x)

// Timing
const PULSE_DURATION = 2000;        // Active dot pulse
const FADE_DURATION = 1000;         // Removal animation
const SCAN_DURATION = 3000;         // Scan line sweep
```

---

## ✅ Success Criteria Met

- ✅ Map displays all opportunities on load
- ✅ Each answer triggers visible opportunity removal
- ✅ User can clearly see disappearing effect
- ✅ Counter updates in real-time
- ✅ Filter messages show what's being removed
- ✅ Smooth animations (no jank)
- ✅ Responsive layout (mobile + desktop)
- ✅ Toggle to hide map if desired

---

## 🔮 Future Enhancements

1. **Opportunity Details**: Hover over dots to see deal info
2. **Regional Clustering**: Group opportunities by continent
3. **Heat Map Mode**: Show density instead of individual dots
4. **Replay**: Allow user to replay calibration after assessment
5. **Export**: Download map showing their personalized opportunities
6. **3D Globe**: Use WebGL for rotating 3D visualization

---

## 📚 Files Modified

```
✅ Created:
- components/assessment/AssessmentOpportunityMap.tsx

✅ Updated:
- components/assessment/AssessmentQuestion.tsx (split layout + map integration)
- app/(authenticated)/assessment/page.tsx (removed CalibrationModal, added map props)

✅ Dependencies:
- framer-motion (animations)
- lucide-react (icons)
- useAssessmentSSE (real-time events)
```

---

## 🎉 Result

The C10 Assessment now provides a **visceral, visual representation** of platform calibration. Users don't just read "platform is personalizing" - they **watch it happen** in real-time as opportunities disappear from the global map.

This transforms an abstract process into concrete, engaging visual storytelling.
