# Backend Requirements: Results Map Display

## Issue

The frontend results page needs to display the accumulated opportunities on a map, but the backend is not returning this data.

## Current Backend Response

`GET /api/assessment/result/{session_id}` currently returns:

```json
{
  "session_id": "sess_xxx",
  "user_id": null,
  "tier": "architect",
  "confidence": 0.95,
  "simulation": {...},
  "gap_analysis": "...",
  "forensic_validation": {...},
  "pdf_url": "...",
  "completed_at": "2025-12-03T...",
  "answers_count": 10,
  "briefs_cited": ["dev_xxx", ...]
}
```

## Required Addition

The backend needs to include the accumulated opportunities from all 10 assessment answers:

```json
{
  "session_id": "sess_xxx",
  "user_id": null,
  "tier": "architect",
  "confidence": 0.95,
  "simulation": {...},
  "gap_analysis": "...",
  "forensic_validation": {...},
  "pdf_url": "...",
  "completed_at": "2025-12-03T...",
  "answers_count": 10,
  "briefs_cited": ["dev_xxx", ...],
  "personalized_opportunities": [
    {
      "title": "Opportunity Title",
      "location": {
        "country": "Singapore",
        "latitude": 1.3521,
        "longitude": 103.8198
      },
      "category": "Real Estate",
      "min_investment": "500000",
      "expected_return": "15-20%",
      "risk_level": "Medium",
      "description": "...",
      "why_matched": "..."
    }
  ]
}
```

## Implementation

The backend should:

1. **During Answer Submission** (`POST /api/assessment/answer`):
   - Already returns opportunities for each answer
   - Store these opportunities in the session/database

2. **During Results Retrieval** (`GET /api/assessment/result/{session_id}`):
   - Aggregate all opportunities from the 10 answers
   - Include them in the response as `personalized_opportunities` array

## Alternative

If opportunities can't be stored, the backend could:
- Return the full `answers` array with opportunities embedded
- Frontend will extract opportunities from answers

Example with answers:
```json
{
  "answers": [
    {
      "question_id": "q1",
      "choice_id": "c1",
      "opportunities": [...]
    }
  ]
}
```
