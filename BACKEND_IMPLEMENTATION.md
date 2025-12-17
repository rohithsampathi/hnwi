# Backend Tooltip Implementation Guide

## ✅ Frontend Status: COMPLETE & READY

Frontend is waiting for backend to send terms in the question API response.

---

## Schema Definition

### 1. TermDefinition Model (Pydantic)

```python
# backend/models/assessment.py

from pydantic import BaseModel
from typing import Literal, List

class TermDefinition(BaseModel):
    """Term definition for tooltips in assessment questions"""
    term: str  # e.g., "SLAT", "GRAT", "QSBS"
    full_name: str  # e.g., "Spousal Lifetime Access Trust"
    definition: str  # Full explanation text
    category: Literal['tax', 'legal', 'financial', 'trust', 'regulatory', 'investment']

    class Config:
        schema_extra = {
            "example": {
                "term": "SLAT",
                "full_name": "Spousal Lifetime Access Trust",
                "definition": "An irrevocable trust created by one spouse for the benefit of the other spouse, allowing indirect access to assets while removing them from the estate for tax purposes.",
                "category": "trust"
            }
        }
```

### 2. Update Question Model

```python
# backend/models/assessment.py

class Question(BaseModel):
    id: str
    question_number: int
    title: str
    scenario: str
    question_text: str
    choices: List[Choice]
    weight: float
    terms: List[TermDefinition] = []  # ← ADD THIS FIELD
```

---

## Step-by-Step Implementation

### STEP 1: Create Term Definitions Repository

**Option A: Static Python Dictionary** (Recommended for now - 100+ terms are stable)

```python
# backend/data/term_definitions.py

TERM_DEFINITIONS = {
    # Estate Planning Terms
    "SLAT": {
        "term": "SLAT",
        "full_name": "Spousal Lifetime Access Trust",
        "definition": "An irrevocable trust created by one spouse for the benefit of the other spouse, allowing indirect access to assets while removing them from the estate for tax purposes.",
        "category": "trust"
    },
    "GRAT": {
        "term": "GRAT",
        "full_name": "Grantor Retained Annuity Trust",
        "definition": "An estate planning tool that allows the grantor to freeze the value of assets and transfer future appreciation to beneficiaries at a reduced gift tax cost.",
        "category": "trust"
    },
    "ILIT": {
        "term": "ILIT",
        "full_name": "Irrevocable Life Insurance Trust",
        "definition": "A trust designed to own and be the beneficiary of life insurance policies, keeping death benefits out of the taxable estate.",
        "category": "trust"
    },

    # Tax Terms
    "QSBS": {
        "term": "QSBS",
        "full_name": "Qualified Small Business Stock",
        "definition": "IRS Section 1202 provision allowing up to $10M+ in tax-free capital gains when selling stock in a C-corp held for 5+ years.",
        "category": "tax"
    },
    "1031 EXCHANGE": {
        "term": "1031 Exchange",
        "full_name": "1031 Exchange",
        "definition": "Tax-deferred exchange allowing real estate investors to defer capital gains taxes by reinvesting proceeds from a property sale into a like-kind property.",
        "category": "tax"
    },

    # Offshore Terms
    "BVI": {
        "term": "BVI",
        "full_name": "British Virgin Islands",
        "definition": "Popular offshore jurisdiction for establishing holding companies and investment structures. Known for strong privacy laws, zero corporate tax on foreign income, and business-friendly regulations.",
        "category": "legal"
    },

    # ... ADD ALL 100+ TERMS FROM FRONTEND
    # Copy from: /Users/skyg/Desktop/Code/hnwi-chronicles/lib/assessment-term-definitions.ts
}
```

**Option B: MongoDB Collection** (If you want dynamic updates)

```javascript
// MongoDB collection: term_definitions
{
  "_id": ObjectId("..."),
  "term": "SLAT",
  "full_name": "Spousal Lifetime Access Trust",
  "definition": "An irrevocable trust created by one spouse...",
  "category": "trust",
  "created_at": ISODate("2025-01-01"),
  "updated_at": ISODate("2025-01-01")
}
```

---

### STEP 2: Create Question → Terms Mapping

Map which terms appear in which questions:

```python
# backend/data/question_terms.py

QUESTION_TERMS = {
    # Estate Planning Questions
    "SA_Q1_estate_planning_urgency": ["SLAT", "GRAT", "ILIT", "ESTATE TAX", "GIFT TAX"],
    "SA_Q2_estate_strategy": ["CLAWBACK", "EXEMPTION", "TRUST", "GRANTOR"],

    # Tax Questions
    "SA_Q5_business_structure": ["QSBS", "C-CORP", "LLC", "S-CORP", "PASS-THROUGH"],
    "SA_Q8_tax_optimization": ["1031 EXCHANGE", "OZ", "STEP-UP", "CAPITAL GAINS"],

    # Offshore Questions
    "SA_Q15_offshore_strategy": ["BVI", "OFFSHORE", "PROPERTY RIGHTS", "POLITICAL NEUTRALITY"],

    # Real Estate Questions
    "SA_Q20_real_estate_strategy": ["DISTRESSED DEBT", "DIP FINANCING", "CREDIT BIDDING", "CHAPTER 11"],

    # ... MAP ALL 100 QUESTIONS
}
```

**How to figure out which terms go with which question:**
1. Read the question text, scenario, and choices
2. Identify any technical terms that need explanation
3. Add those term keys to the mapping
4. Prioritize terms that appear in multiple places in the question

---

### STEP 3: Update Question Endpoint

```python
# backend/api/assessment.py

from backend.data.term_definitions import TERM_DEFINITIONS
from backend.data.question_terms import QUESTION_TERMS
from backend.models.assessment import TermDefinition

@router.get("/api/assessment/question")
async def get_next_question(session_id: str):
    # Get question from your existing logic
    question = await get_question_logic(session_id)

    # Get term keys for this question
    question_id = question["id"]  # e.g., "SA_Q1_estate_planning_urgency"
    term_keys = QUESTION_TERMS.get(question_id, [])

    # Build terms array
    terms = []
    for key in term_keys:
        if key in TERM_DEFINITIONS:
            term_data = TERM_DEFINITIONS[key]
            terms.append(TermDefinition(**term_data))

    # Add terms to question response
    question["terms"] = [term.dict() for term in terms]

    return question
```

---

### STEP 4: Migration Script

Use this script to copy definitions from frontend to backend:

```python
# scripts/migrate_terms_to_backend.py

import json
import re

# Read frontend term definitions
frontend_file = "/Users/skyg/Desktop/Code/hnwi-chronicles/lib/assessment-term-definitions.ts"

with open(frontend_file, 'r') as f:
    content = f.read()

# Extract TERM_DEFINITIONS object (this is a simplified parser)
# You might need to manually copy-paste the definitions

# Convert to Python format
backend_terms = {}

# Example manual conversion (repeat for all terms):
backend_terms["SLAT"] = {
    "term": "SLAT",
    "full_name": "Spousal Lifetime Access Trust",
    "definition": "An irrevocable trust created by one spouse for the benefit of the other spouse, allowing indirect access to assets while removing them from the estate for tax purposes.",
    "category": "trust"
}

# Save to backend file
output_file = "backend/data/term_definitions.py"

with open(output_file, 'w') as f:
    f.write("# Auto-generated from frontend term definitions\n\n")
    f.write("TERM_DEFINITIONS = {\n")
    for key, value in backend_terms.items():
        f.write(f'    "{key}": {{\n')
        f.write(f'        "term": "{value["term"]}",\n')
        f.write(f'        "full_name": "{value["full_name"]}",\n')
        f.write(f'        "definition": """{value["definition"]}""",\n')
        f.write(f'        "category": "{value["category"]}"\n')
        f.write(f'    }},\n')
    f.write("}\n")

print(f"✅ Migrated {len(backend_terms)} terms to {output_file}")
```

---

## Example API Response

### Before (Current):
```json
{
  "id": "SA_Q1_estate_planning_urgency",
  "question_number": 1,
  "title": "Estate Planning Urgency",
  "scenario": "You have $5M to transfer before exemption drops...",
  "question_text": "Should you use a SLAT or GRAT?",
  "choices": [...]
}
```

### After (With Terms):
```json
{
  "id": "SA_Q1_estate_planning_urgency",
  "question_number": 1,
  "title": "Estate Planning Urgency",
  "scenario": "You have $5M to transfer before exemption drops...",
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

---

## Testing

### 1. Test Without Terms (Graceful Degradation)
```json
{
  "id": "Q1",
  "title": "Test Question",
  "terms": []  // ← Empty array = no tooltips, just plain text
}
```
**Expected:** Frontend shows plain text, no crash ✅

### 2. Test With Terms
```json
{
  "id": "Q1",
  "title": "Test Question",
  "terms": [{"term": "SLAT", "full_name": "...", "definition": "...", "category": "trust"}]
}
```
**Expected:** Frontend shows tooltip on hover ✅

---

## Migration Checklist

- [ ] Create `backend/models/assessment.py` with TermDefinition model
- [ ] Create `backend/data/term_definitions.py` with all 100+ definitions
- [ ] Create `backend/data/question_terms.py` mapping questions to terms
- [ ] Update question endpoint to include terms array
- [ ] Test with 1-2 questions manually
- [ ] Deploy to staging
- [ ] Roll out to all 100 questions

---

## Source Data Location

All 100+ term definitions are in:
**`/Users/skyg/Desktop/Code/hnwi-chronicles/lib/assessment-term-definitions.ts`** (lines 11-881)

Copy this to backend `term_definitions.py`

---

## Performance Note

- Terms array adds ~500-2000 bytes per question (5-10 terms × 200 bytes each)
- Negligible impact on API response time
- Frontend handles missing/empty terms gracefully

---

## Future Enhancements (Optional)

### Analytics Tracking
```python
@router.post("/api/assessment/analytics/tooltip-view")
async def track_tooltip_view(session_id: str, question_id: str, term: str):
    """Track which terms users hover over - shows what confuses them"""
    await analytics.insert_one({
        "session_id": session_id,
        "question_id": question_id,
        "term": term,
        "timestamp": datetime.utcnow()
    })
```

### Context-Aware Definitions
```python
# Different definition for same term based on question context
if question.scenario.includes("startup"):
    terms["QSBS"]["definition"] = "Critical for your tech exit - can save $10M+ in taxes"
else:
    terms["QSBS"]["definition"] = "Allows $10M tax-free gains from qualified small business stock"
```

---

## Questions?

Contact frontend team if you need:
- Help mapping terms to questions
- Clarification on term categories
- Testing assistance

**Frontend is ready and waiting!** 🎉
