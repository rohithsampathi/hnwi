# Backend Tooltip Migration Guide

## Overview
We're moving term definitions from frontend parsing to backend-provided data. This gives us:
- ✅ Context-aware definitions per question
- ✅ Single source of truth
- ✅ Analytics on which terms users need
- ✅ No frontend parsing fragility

## Frontend Changes (✅ COMPLETE)

1. **Question interface** - Added `terms?: TermDefinition[]` field
2. **TextWithTooltips** - Now accepts terms from backend instead of parsing
3. **TypewriterText** - Passes terms through to TextWithTooltips
4. **ChoiceCard** - Passes terms through to TextWithTooltips
5. **AssessmentQuestion** - Passes question.terms to all components

## Backend Changes (🔴 TODO)

### 1. Create TermDefinition Model

```python
# backend/models/assessment.py

from pydantic import BaseModel
from typing import Literal

class TermDefinition(BaseModel):
    term: str  # e.g., "SLAT"
    full_name: str  # e.g., "Spousal Lifetime Access Trust"
    definition: str  # Full explanation
    category: Literal['tax', 'legal', 'financial', 'trust', 'regulatory', 'investment']

class Question(BaseModel):
    id: str
    question_number: int
    title: str
    scenario: str
    question_text: str
    choices: List[Choice]
    weight: float
    terms: List[TermDefinition] = []  # ← ADD THIS
```

### 2. Create Term Definitions Table/Collection

**Option A: MongoDB Collection**
```javascript
// terms_collection
{
  "_id": ObjectId("..."),
  "term": "SLAT",
  "full_name": "Spousal Lifetime Access Trust",
  "definition": "An irrevocable trust created by one spouse...",
  "category": "trust"
}
```

**Option B: Python Dictionary** (if terms are static)
```python
# backend/data/term_definitions.py

TERM_DEFINITIONS = {
    "SLAT": {
        "term": "SLAT",
        "full_name": "Spousal Lifetime Access Trust",
        "definition": "An irrevocable trust created by one spouse for the benefit of the other spouse...",
        "category": "trust"
    },
    "GRAT": {
        "term": "GRAT",
        "full_name": "Grantor Retained Annuity Trust",
        "definition": "An estate planning tool that allows the grantor to freeze the value of assets...",
        "category": "trust"
    },
    # ... copy all 100+ terms from frontend assessment-term-definitions.ts
}
```

### 3. Create Question → Terms Mapping

```python
# backend/data/question_terms.py

QUESTION_TERMS = {
    "Q1_estate_planning": ["SLAT", "GRAT", "ILIT", "QPR"],
    "Q2_tax_strategy": ["QSBS", "1031 EXCHANGE", "OECD PILLAR TWO"],
    "Q3_offshore": ["BVI", "OFFSHORE", "PROPERTY RIGHTS"],
    # ... map all 100 questions to relevant terms
}
```

### 4. Update Question Endpoint

```python
# backend/api/assessment.py

from backend.data.term_definitions import TERM_DEFINITIONS
from backend.data.question_terms import QUESTION_TERMS

@router.get("/api/assessment/question/{question_id}")
async def get_question(question_id: str):
    # Get question from DB
    question = await questions_collection.find_one({"id": question_id})

    # Get terms for this question
    term_keys = QUESTION_TERMS.get(question_id, [])
    terms = [
        TERM_DEFINITIONS[key]
        for key in term_keys
        if key in TERM_DEFINITIONS
    ]

    # Add terms to response
    question["terms"] = terms

    return question
```

### 5. Migrate Term Definitions

Copy all definitions from `/Users/skyg/Desktop/Code/hnwi-chronicles/components/assessment/TextWithTooltips.old.tsx` (line 11-881) to backend.

**Quick migration script:**
```python
# scripts/migrate_terms.py

import json

# Source: assessment-term-definitions.ts
frontend_terms = {
    'LRS': {
        'term': 'LRS',
        'fullName': 'Liberalised Remittance Scheme',
        'definition': 'A scheme by the Reserve Bank of India...',
        'category': 'regulatory'
    },
    # ... all 100+ terms
}

# Convert to backend format
backend_terms = {}
for key, value in frontend_terms.items():
    backend_terms[key] = {
        "term": value['term'],
        "full_name": value['fullName'],
        "definition": value['definition'],
        "category": value['category']
    }

# Save to backend
with open('backend/data/term_definitions.json', 'w') as f:
    json.dump(backend_terms, f, indent=2)
```

## Testing Plan

1. **Test without backend terms** - Frontend should show plain text (no crash)
2. **Test with backend terms** - Tooltips should appear on hover
3. **Test term exclusion** - Terms in scenario shouldn't repeat in choices
4. **Test analytics** - Track which terms users hover over

## Analytics Integration (Future)

```python
# Track tooltip views
@router.post("/api/assessment/analytics/tooltip-view")
async def track_tooltip_view(
    session_id: str,
    question_id: str,
    term: str
):
    await analytics_collection.insert_one({
        "session_id": session_id,
        "question_id": question_id,
        "term": term,
        "timestamp": datetime.utcnow()
    })
```

## Migration Checklist

- [ ] Create TermDefinition model
- [ ] Copy 100+ term definitions from frontend to backend
- [ ] Create question → terms mapping for all 100 questions
- [ ] Update question endpoint to include terms
- [ ] Test with real questions
- [ ] Remove old frontend assessment-term-definitions.ts
- [ ] Add analytics tracking (optional)

## Example API Response

**Before:**
```json
{
  "id": "Q1",
  "title": "Estate Planning Strategy",
  "scenario": "You have $5M to transfer...",
  "question_text": "Should you use a SLAT or GRAT?",
  "choices": [...]
}
```

**After:**
```json
{
  "id": "Q1",
  "title": "Estate Planning Strategy",
  "scenario": "You have $5M to transfer...",
  "question_text": "Should you use a SLAT or GRAT?",
  "choices": [...],
  "terms": [
    {
      "term": "SLAT",
      "full_name": "Spousal Lifetime Access Trust",
      "definition": "An irrevocable trust created by one spouse for the benefit of the other spouse, allowing indirect access to assets while removing them from the estate for tax purposes.",
      "category": "trust"
    },
    {
      "term": "GRAT",
      "full_name": "Grantor Retained Annuity Trust",
      "definition": "An estate planning tool that allows the grantor to freeze the value of assets and transfer future appreciation to beneficiaries at a reduced gift tax cost.",
      "category": "trust"
    }
  ]
}
```

## Benefits

1. **Context-Aware**: Different definitions for different questions
2. **Single Source**: Update once, applies everywhere
3. **Analytics**: Track which terms confuse users
4. **Personalization**: Can customize based on user knowledge
5. **No Parsing**: Frontend just renders, no fragile regex

## Next Steps

Backend team needs to:
1. Implement TermDefinition model
2. Migrate all 100+ term definitions
3. Map terms to each of 100 questions
4. Update question endpoint

Frontend is ready and waiting! 🎉
