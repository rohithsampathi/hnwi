# Backend JARVIS API Contract Documentation

## Overview
This document describes the exact response format from the backend V5 Rohith endpoints.

## Endpoints
- `POST /api/v5/rohith/start` - Start new conversation
- `POST /api/v5/rohith/message/{conversation_id}` - Send message to existing conversation

## Response Format

### JARVIS Mode (Complex Queries)
When `mcp_context` is available (complex queries requiring intelligence), backend returns:

```json
{
  "conversation_id": "uuid-string",
  "mode": "jarvis",
  "response": {
    "narration": {
      "text": "The full response text from Rohith",
      "delivery": "word_by_word",
      "speed_ms": 50,
      "voice_style": "professional"
    },
    "visualizations": [
      {
        "id": "viz_1",
        "type": "asset_grid" | "concentration_donut" | "concentration_chart",
        "data": {
          // Visualization-specific data
        }
      }
    ],
    "citations": [
      // Development sources (from HNWI World)
      {
        "type": "development",
        "dev_id": "mongodb_objectid_24_chars",
        "title": "Development Title",
        "jurisdiction": "Singapore",
        "date": "2026-02-15",
        "confidence": 0.85
      },
      // KG Intelligence sources
      {
        "type": "kg_intelligence",
        "category": "tax_rates" | "jurisdiction_drivers" | "corridor" | "migration" | "succession" | "cost_of_inaction" | "regulatory_calendar" | "teci_cascades" | "peer_intelligence" | "multi_hop_chains",
        "jurisdiction": "UAE",
        "label": "UAE Tax Rates (KGv3 verified)"
      }
    ],
    "predictive_prompts": [
      "Show me my biggest concentration risk",
      "Compare my allocation vs peer benchmark",
      "What are alternative jurisdictions to Singapore?"
    ],
    "metadata": {
      "tier": "instant" | "fast" | "deep",
      "processing_time_ms": 1234,
      "kg_developments_count": 5,
      "confidence_score": 0.85,
      "intelligence_sources": ["ultra_fast_query", "hnwi_world"],
      "context_summary": "Multi-jurisdiction query: UAE, Singapore",
      "relationship_stage": "established",
      "visualization_count": 2
    }
  }
}
```

### Classic Mode (Simple Queries)
When `mcp_context` is `None` (instant responses like "hi", "what's your name"), backend returns:

```json
{
  "conversation_id": "uuid-string",
  "mode": "classic",
  "response": {
    "content": "Good to see you. What would you like to know about wealth movements today?",
    "timestamp": "2026-02-28T16:00:00.000Z",
    "tier": "instant",
    "tools_used": ["instant_lookup"],
    "kg_developments_count": 0,
    "processing_time_ms": 50,
    "confidence_score": 1.0,
    "intelligence_sources": [],
    "context_summary": "instant response",
    "relationship_stage": "n/a",
    "mcp_extraction_time_ms": 0
  }
}
```

## When Each Mode is Triggered

### INSTANT Tier (Classic Mode)
Queries that match these patterns return classic mode:
- Greetings: "hi", "hello", "hey"
- Identity questions: "who are you", "what are you", "what's your name"
- Onboarding: "tell me about yourself", "who created you"

### FAST/DEEP Tier (JARVIS Mode)
Queries that include:
- Jurisdictions mentioned (Dubai, Singapore, NYC, etc.)
- Multi-jurisdiction comparisons
- Industry keywords (real estate, tax, succession, etc.)
- Complex intelligence requests

## Field Name Mapping

**IMPORTANT:** The backend uses `citations` field name, but this contains the data that should be mapped to `source_documents` on the frontend.

Backend field → Frontend field:
- `response.citations` → `source_documents`
- `response.predictive_prompts` → `predictive_prompts`
- `response.visualizations` → `visualizations`
- `response.narration` → `narration`
- `mode` → `mode`

## Source Documents Structure

The `citations` array contains two types of sources:

1. **Development Citations** (queryable by dev_id):
   - Have `type: "development"`
   - Include `dev_id` (24-character MongoDB ObjectId)
   - From HNWI World developments database
   - Clickable to show full development details

2. **KG Intelligence Sources** (display-only):
   - Have `type: "kg_intelligence"`
   - No `dev_id` (synthetic IDs generated frontend-side)
   - From Knowledge Graph v3 (tax rates, corridors, migration stats, etc.)
   - Show in simpler panel with category/jurisdiction/label

## Visualization Types

Currently supported visualization types:
- `asset_grid` - Grid display of Crown Vault assets
- `concentration_donut` - Donut chart showing asset concentration
- `concentration_chart` - Alternative concentration visualization

## Example Real Queries

### Query: "What are the regulations for a $5M real estate purchase from NYC to Dubai?"
Expected response:
- `mode`: "jarvis"
- `tier`: "deep" (multi-jurisdiction)
- `visualizations`: Likely empty (no Crown Vault data)
- `citations`: Developments about UAE real estate regulations, US tax implications
- `predictive_prompts`: ["Compare tax efficiency across these jurisdictions", "Show me migration corridors between these jurisdictions"]

### Query: "hi"
Expected response:
- `mode`: "classic"
- `tier`: "instant"
- `content`: "Good to see you. What would you like to know about wealth movements today?"
- No visualizations, citations, or predictive prompts

## Notes

- The backend returns `citations` but frontend should rename to `source_documents` for consistency
- JARVIS mode requires `mcp_context` to be non-None (happens during intelligence extraction)
- Instant responses intentionally skip MCP context extraction for speed (<50ms)
- Message ID is returned separately for feedback submission
