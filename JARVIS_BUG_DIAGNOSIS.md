# JARVIS Mode Bug Diagnosis & Fix

## THE PROBLEM

Ask Rohith shows plain text responses instead of JARVIS visualizations, even for complex queries that should trigger JARVIS mode.

## ROOT CAUSE

**Field Mapping Mismatch** between backend and frontend:

### Backend Returns (from `/api/v5/rohith/start` and `/api/v5/rohith/message/{id}`):
```json
{
  "mode": "jarvis",
  "conversation_id": "...",
  "response": {
    "narration": { "text": "...", "delivery": "word_by_word" },
    "visualizations": [...],
    "citations": [...],  // ← This contains BOTH dev_id citations AND KG intelligence
    "predictive_prompts": [...],
    "metadata": {...}
  }
}
```

### Frontend Expects (in `lib/rohith-api.ts` lines 460-461):
```javascript
{
  citations: response.response?.citations || [],  // Legacy field
  source_documents: response.response?.source_documents || [],  // ← This field doesn't exist!
}
```

### The Issue:
The frontend looks for `source_documents` field that **doesn't exist in the backend response**. The backend returns `citations` which IS the source documents array, but the frontend component (`PremiumRohithInterface.tsx`) uses `source_documents` to build the citation list.

## SECONDARY ISSUE

The `RohithContext` (lines 345-356 and 404-416) only updates JARVIS-specific state when `mode === "jarvis"`. If the backend returns `mode: "classic"` for any reason, visualizations won't render.

## THE FIX

### Option 1: Fix Frontend to Map Citations → Source Documents (RECOMMENDED)

Update `lib/rohith-api.ts` to map the backend's `citations` field to `source_documents`:

```javascript
// In sendMessageJarvis method (line 452-468):
return {
  mode: response.mode || "jarvis",
  narration: response.response?.narration || {
    text: response.response?.content || "I'm sorry, I couldn't process that request.",
    delivery: "word_by_word"
  },
  visualizations: response.response?.visualizations || [],
  predictive_prompts: response.response?.predictive_prompts || [],
  // Map citations to source_documents (backend uses 'citations' field name)
  source_documents: response.response?.citations || response.response?.source_documents || [],
  conversationId,
  message_id: response.message_id,
  tier: response.response?.tier || response.response?.metadata?.tier || "fast",
  processing_time_ms: response.response?.processing_time_ms || response.response?.metadata?.processing_time_ms || responseTime,
  confidence_score: response.response?.confidence_score || response.response?.metadata?.confidence_score || 0.85,
  intelligence_sources: response.response?.intelligence_sources || response.response?.metadata?.intelligence_sources || []
}
```

### Option 2: Fix Backend to Return source_documents (NOT RECOMMENDED)

Change backend `jarvis_formatter.py` to return `source_documents` instead of `citations`:

```python
# Line 72-76 in jarvis_formatter.py
return {
    "narration": narration,
    "visualizations": visualizations,
    "source_documents": citations,  # ← Rename field
    "predictive_prompts": predictive_prompts,
    "metadata": {...}
}
```

**We should do Option 1** because changing the backend field name would break any other consumers.

## VERIFICATION STEPS

After applying the fix:

1. **Test with greeting**: `"hi"` → Should show classic mode (plain text) ✓
2. **Test with complex query**: `"What are the tax implications of moving $5M from Dubai to Singapore?"` → Should show:
   - JARVIS mode activated
   - Visualizations (if Crown Vault has data)
   - Predictive prompts (3 suggested questions)
   - Source citations clickable

3. **Check browser console** for:
   ```
   [Rohith API] Response mode: jarvis
   ```

4. **Inspect Context state**:
   - `currentMode`: "jarvis"
   - `visualizations`: array (may be empty if no Crown Vault data)
   - `predictive_prompts`: array with 3 prompts
   - `narration`: object with text/delivery

## WHY JARVIS ISN'T RENDERING NOW

1. Backend returns `citations` array
2. Frontend expects `source_documents` array
3. Frontend gets empty `source_documents` because field doesn't exist
4. `PremiumRohithInterface` (line 493-494) checks if `source_documents.length > 0`
5. Condition fails, so sources section doesn't render
6. Similarly, visualizations/predictive prompts may be empty arrays even when backend returns them

## THE ACTUAL FLOW

### Current (Broken):
```
Backend → { citations: [...] }
Frontend → source_documents = response.response?.source_documents || [] → []
UI → No sources rendered
```

### Fixed:
```
Backend → { citations: [...] }
Frontend → source_documents = response.response?.citations || [] → [...]
UI → Sources rendered with clickable citations
```

## ADDITIONAL METADATA MAPPING ISSUE

Looking at line 464-467 in `rohith-api.ts`, the frontend extracts metadata from top-level response:

```javascript
tier: response.response?.tier || "fast",
processing_time_ms: response.response?.processing_time_ms || responseTime,
```

But the backend puts these in `response.response.metadata`:

```json
{
  "response": {
    "metadata": {
      "tier": "fast",
      "processing_time_ms": 1234,
      ...
    }
  }
}
```

So we need to check BOTH locations (top-level AND metadata).

## COMPLETE FIX (All Issues)

```javascript
// In sendMessageJarvis and createConversationJarvis:
return {
  mode: response.mode || "jarvis",
  narration: response.response?.narration || {
    text: response.response?.content || "I'm sorry, I couldn't process that request.",
    delivery: "word_by_word"
  },
  visualizations: response.response?.visualizations || [],
  predictive_prompts: response.response?.predictive_prompts || [],
  // Fix 1: Map citations to source_documents
  source_documents: response.response?.citations || response.response?.source_documents || [],
  conversationId,
  message_id: response.message_id,
  // Fix 2: Check both top-level and metadata locations
  tier: response.response?.tier || response.response?.metadata?.tier || "fast",
  processing_time_ms: response.response?.processing_time_ms || response.response?.metadata?.processing_time_ms || responseTime,
  confidence_score: response.response?.confidence_score || response.response?.metadata?.confidence_score || 0.85,
  intelligence_sources: response.response?.intelligence_sources || response.response?.metadata?.intelligence_sources || []
}
```

This ensures the frontend correctly maps all backend fields regardless of where they appear in the response structure.
