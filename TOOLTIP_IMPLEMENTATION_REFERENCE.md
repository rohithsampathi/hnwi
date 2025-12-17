# Assessment Tooltip Implementation - Frontend Reference for Backend

This document contains the complete frontend tooltip implementation that was used before removal. Backend team can use this as reference for understanding the tooltip behavior and data structure.

---

## Data Structure (TypeScript Interface)

```typescript
// From: /lib/hooks/useAssessmentState.ts
export interface TermDefinition {
  term: string;              // e.g., "SLAT", "GRAT", "QSBS"
  full_name: string;         // e.g., "Spousal Lifetime Access Trust"
  definition: string;        // Full explanation text
  category: 'tax' | 'legal' | 'financial' | 'trust' | 'regulatory' | 'investment';
}

export interface Question {
  id: string;
  question_number: number;
  title: string;
  scenario: string;
  question_text: string;
  choices: Array<{...}>;
  weight: number;
  terms?: TermDefinition[];  // Terms provided by backend
}
```

---

## Component Architecture

### 1. TooltipContext.tsx - Global State Management
**Purpose**: Ensures only one tooltip open at a time and tracks which terms have been shown

```typescript
interface TooltipContextType {
  openTooltipId: string | null;          // Currently open tooltip ID
  setOpenTooltipId: (id: string | null) => void;
  shownTerms: Set<string>;               // Terms already shown (to prevent duplicates)
  addShownTerm: (term: string) => void;
  resetShownTerms: () => void;           // Reset on new question
}
```

**Key Logic**:
- Maintains global state of which tooltip is currently open
- Tracks all terms that have been shown in the current question
- Scenario text ALWAYS shows tooltips (ignored shownTerms)
- Choice text skips terms already shown in scenario (uses excludeTerms)

---

### 2. TextWithTooltips.tsx - Text Parsing & Rendering
**Purpose**: Scans text for terms, renders tooltips for matched terms

**Algorithm**:
1. Receive text and terms array from backend
2. Sort terms by length (longest first) to match correctly
3. Scan text character by character
4. When term found, check if should show tooltip:
   - NOT in excludeTerms (scenario terms)
   - NOT already shown globally (unless this IS scenario text)
   - NOT already shown in this specific text
5. If should show: render TermTooltip component
6. If shouldn't show: render plain text

**Key Props**:
```typescript
interface TextWithTooltipsProps {
  text: string;
  className?: string;
  terms?: TermDefinition[];          // From backend
  excludeTerms?: Set<string>;        // Terms to skip (already shown in scenario)
  onTermsFound?: (terms: Set<string>) => void; // Callback to report found terms
}
```

**Tooltip Display Logic**:
```typescript
// Show tooltip only if:
const shouldShow =
  !excludeTermsSet.has(termKey) &&                    // Not excluded from scenario
  (isScenarioText || !shownTerms.has(termKey)) &&     // Not shown before (unless scenario)
  !shownInThisText.has(termKey);                      // Not already shown in THIS text
```

**How it works**:
- Scenario: excludeTerms is empty → isScenarioText = true → always show tooltips
- Choices: excludeTerms has scenario terms → skip those → show only new terms

---

### 3. TermTooltip.tsx - Individual Tooltip Display
**Purpose**: Renders clickable/hoverable term with popup definition

**Visual Design**:
- Term displayed with primary color background, info icon
- Click or hover to open tooltip
- Tooltip shows: term, full name, category badge, definition
- Category colors:
  - Tax: Red
  - Legal: Blue
  - Financial: Green
  - Trust: Purple
  - Regulatory: Yellow
  - Investment: Cyan

**Interaction**:
- Hover: Opens tooltip, closes on mouse leave
- Click: Opens tooltip, stays open (sticky), closes on click outside
- Only one tooltip open at a time (global state)
- Smart positioning: avoids viewport overflow

---

## Usage in Assessment Components

### TypewriterText.tsx
```typescript
<TypewriterText
  text={question.scenario}
  terms={question.terms}           // From backend
  showTooltips={true}
  onTermsFound={(terms) => setScenarioTerms(terms)}  // Track scenario terms
/>
```

### ChoiceCard.tsx
```typescript
<TextWithTooltips
  text={choice.text}
  terms={question.terms}           // Same terms from backend
  excludeTerms={scenarioTerms}     // Skip terms shown in scenario
/>
```

---

## Backend Data Flow

1. **Backend sends** question with terms array:
```json
{
  "id": "SA_Q1_estate_planning_urgency",
  "title": "Estate Planning Strategy",
  "scenario": "You have $5M in a SLAT and need to optimize...",
  "question_text": "Should you use a GRAT?",
  "choices": [...],
  "terms": [
    {
      "term": "SLAT",
      "full_name": "Spousal Lifetime Access Trust",
      "definition": "An irrevocable trust created by one spouse...",
      "category": "trust"
    },
    {
      "term": "GRAT",
      "full_name": "Grantor Retained Annuity Trust",
      "definition": "An estate planning tool...",
      "category": "trust"
    }
  ]
}
```

2. **Frontend renders**:
   - Scenario shows "SLAT" with tooltip ✅
   - Question shows "GRAT" with tooltip ✅
   - Choices skip "SLAT" (already shown), show other new terms ✅

---

## Key Features Implemented

1. **Graceful Degradation**: If backend doesn't send terms, shows plain text (no crash)
2. **Smart Deduplication**: Terms shown in scenario don't repeat in choices
3. **Case-Insensitive Matching**: "SLAT", "Slat", "slat" all match
4. **Word Boundary Matching**: Only matches whole words (prevents "SLATHE" matching "SLAT")
5. **Longest Match First**: Prevents "ESTATE TAX" being matched as "ESTATE" + "TAX"
6. **Mobile Responsive**: Tooltips position intelligently on mobile screens
7. **Accessibility**: Keyboard navigation support (Enter/Space to open)

---

## Why This Implementation Was Removed

The tooltip rendering caused infinite loops in React due to:
1. State updates during render (useEffect dependencies on Set objects)
2. New object references triggering re-renders even with same values
3. Complex interaction with rc-slider component on the map

**Solution**: Backend should send pre-formatted text with terms already highlighted or removed entirely.

---

## Recommendations for Backend

**Option 1: Remove Tooltips Entirely**
- Simplify questions to not require tooltips
- Include definitions in question text when needed

**Option 2: Pre-format Text (Recommended if keeping tooltips)**
- Backend sends text with terms already marked:
```json
{
  "scenario_html": "You have $5M in <term data-term='SLAT' data-def='...'>SLAT</term>..."
}
```
- Frontend just renders HTML (no parsing needed)
- Much simpler, no state management needed

**Option 3: Keep Current Architecture with Fixes**
- Continue sending terms array
- Frontend will need significant refactoring to avoid infinite loops
- Not recommended due to complexity

---

## Files Removed

1. `/components/assessment/TextWithTooltips.tsx` - Text parsing and rendering
2. `/components/assessment/TermTooltip.tsx` - Individual tooltip component
3. `/components/assessment/TooltipContext.tsx` - Global state management

---

## Backend Implementation Stats (Already Completed)

- ✅ 144 term definitions migrated
- ✅ 105 questions mapped
- ✅ 75 questions have terms (71.4% coverage)
- ✅ 224 term instances across all questions

**This reference document preserves the complete tooltip implementation for future reference.**
