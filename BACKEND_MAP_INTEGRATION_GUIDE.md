# Backend Integration Guide - Migration Map Visualization

## Quick Start

When a user asks about geography, migration, or maps, the backend should include a `world_map` visualization in the response.

### Minimal Example

```python
# In jarvis_formatter.py or visualization_builder.py

response = {
    "text": "Here's the global HNWI migration landscape...",
    "visualizations": [
        {
            "id": "viz_map_1",
            "type": "world_map",  # or "geographic_intelligence" or "map"
            "position": "center",
            "size": "large",
            "animation": "materialize",
            "duration_ms": 500,
            "priority": 1,
            "interactive": True,
            "data": {
                "title": "Global HNWI Migration Patterns",
                "auto_fetch_opportunities": True,  # Frontend will auto-fetch everything
                "show_crown_assets": True,
                "show_prive_opportunities": True,
                "show_hnwi_patterns": True  # Shows migration hubs + arrows
            }
        }
    ]
}
```

**That's it!** The frontend will automatically:
- ✅ Fetch all Privé Exchange opportunities from command centre
- ✅ Fetch all Crown Vault assets
- ✅ Show 6 major migration hubs with population data
- ✅ Render 10 animated migration arrows between cities
- ✅ Display everything on an interactive map

---

## What Gets Displayed

### 1. Command Centre Opportunities (Auto-fetched)

**Endpoint Called:** `/api/command-centre/opportunities?include_crown_vault=true&view=all&timeframe=LIVE`

**Data Extracted:**
- Privé Exchange opportunities (green markers)
- Crown Vault assets (gold markers)
- Each marker shows: title, tier, value, risk level, analysis

**Example Markers:**
- "Dubai Marina Penthouse" at (25.0808, 55.1406)
- "Singapore VC Fund" at (1.3521, 103.8198)
- "London Art Collection" at (51.5074, -0.1278)

### 2. Migration Hubs (Auto-generated)

**6 Major Hubs:**
1. **Dubai:** 72,500 HNWIs (2025), +6,700 net inflow
2. **Singapore:** 244,800 HNWIs (2025), +3,400 net inflow
3. **London:** 258,000 HNWIs (2025), -1,500 net outflow
4. **New York:** 349,500 HNWIs (2025), stable
5. **Hong Kong:** 125,100 HNWIs (2025), -2,800 net outflow
6. **Monaco:** 12,400 HNWIs (2025), +300 net inflow

**Each hub displays:**
- Population bubble
- Net flow statistics
- Migration drivers
- Top source/destination countries

### 3. Migration Arrows (Auto-generated)

**10 Major Corridors:**

**Dubai Inflows (Green Arrows):**
- Mumbai → Dubai: +2,200 HNWIs
- London → Dubai: +1,800 HNWIs
- Hong Kong → Dubai: +1,200 HNWIs

**Singapore Inflows (Green Arrows):**
- Hong Kong → Singapore: +1,500 HNWIs
- Mumbai → Singapore: +1,000 HNWIs

**London Outflows (Red Arrows):**
- London → Monaco: -500 HNWIs
- London → Dubai: -1,800 HNWIs

**Hong Kong Outflows (Red Arrows):**
- Hong Kong → Singapore: -1,500 HNWIs
- Hong Kong → London: -800 HNWIs

**Other:**
- New York → Dubai: -400 HNWIs (red)

**Arrow Features:**
- Animated dashed lines (flowing effect)
- Color-coded: Green (inflow), Red (outflow)
- Dynamic thickness based on volume
- Interactive hover and click

---

## Trigger Queries

### Geography Queries
```python
if any(keyword in query.lower() for keyword in ['map', 'geography', 'location', 'where']):
    include_world_map_visualization()
```

**Examples:**
- "Show me opportunities on the map"
- "Where are HNWIs migrating to?"
- "Map global wealth movement"

### Migration Queries
```python
if any(keyword in query.lower() for keyword in ['migration', 'moving', 'relocating', 'flows']):
    include_world_map_visualization()
```

**Examples:**
- "HNWI migration from London to Dubai"
- "Where are London HNWIs relocating?"
- "Show me migration patterns"

### Multi-Jurisdiction Queries
```python
jurisdictions_mentioned = extract_jurisdictions(query)
if len(jurisdictions_mentioned) >= 2:
    include_world_map_visualization()
```

**Examples:**
- "Compare Dubai and Singapore"
- "Opportunities in UAE, Monaco, and Cayman Islands"

---

## Backend Implementation

### Option 1: Visualization Detector (Recommended)

Add to `services/rohith_v5/visualization_detector.py`:

```python
def _is_geography_query(query: str) -> bool:
    """Detect if query is asking about geography/maps."""
    geography_keywords = ['map', 'geography', 'location', 'where', 'global']
    migration_keywords = ['migration', 'moving', 'relocating', 'flows', 'exodus']

    query_lower = query.lower()

    # Check keywords
    if any(kw in query_lower for kw in geography_keywords + migration_keywords):
        return True

    # Check if multiple jurisdictions mentioned
    jurisdictions = extract_jurisdictions(query)
    if len(jurisdictions) >= 2:
        return True

    return False

# Add to visualization list
WORLD_MAP = {
    "type": "world_map",
    "data": {
        "auto_fetch_opportunities": True,
        "show_hnwi_patterns": True
    }
}

# In detect_visualizations():
if _is_geography_query(query):
    visualizations.append(WORLD_MAP)
```

### Option 2: Manual in Response Builder

```python
# In jarvis_formatter.py or response builder

def build_migration_response(query: str, mcp_data: dict) -> dict:
    """Build response for migration-related queries."""

    response_text = generate_migration_analysis(mcp_data)

    visualizations = [
        {
            "id": f"viz_map_{uuid.uuid4().hex[:8]}",
            "type": "world_map",
            "position": "center",
            "size": "large",
            "data": {
                "title": "Global HNWI Migration Patterns",
                "auto_fetch_opportunities": True,
                "show_hnwi_patterns": True
            }
        }
    ]

    return {
        "text": response_text,
        "visualizations": visualizations
    }
```

---

## Configuration Options

### Basic (Auto-fetch Everything)

```python
"data": {
    "auto_fetch_opportunities": True  # Fetches Privé + Crown Vault
}
```

### Custom Title

```python
"data": {
    "title": "Your Global Portfolio",
    "auto_fetch_opportunities": True
}
```

### Selective Display

```python
"data": {
    "auto_fetch_opportunities": True,
    "show_crown_assets": True,          # Show Crown Vault assets
    "show_prive_opportunities": True,   # Show Privé Exchange
    "show_hnwi_patterns": True          # Show migration hubs + arrows
}
```

### Custom Cities (Advanced)

```python
"data": {
    "title": "Custom Map",
    "cities": [
        {
            "name": "Dubai",
            "latitude": 25.2048,
            "longitude": 55.2708,
            "title": "Custom Opportunity",
            "analysis": "AI analysis text"
        }
    ],
    "auto_fetch_opportunities": False  # Don't fetch command centre
}
```

---

## Response Format

### Full Example

```python
{
    "text": "Dubai has emerged as the #1 HNWI destination in 2025, attracting 6,700 net inflows. Key drivers:\n\n• 0% income tax\n• Golden visa program\n• Luxury lifestyle infrastructure\n\nTop source countries: India (+2,200), UK (+1,800), Hong Kong (+1,200).\n\nMeanwhile, London is experiencing net outflows (-1,500) due to non-dom changes and tax increases.",

    "visualizations": [
        {
            "id": "viz_map_abc123",
            "type": "world_map",
            "position": "center",
            "size": "large",
            "animation": "materialize",
            "duration_ms": 500,
            "priority": 1,
            "interactive": True,
            "data": {
                "title": "Global HNWI Migration Patterns",
                "auto_fetch_opportunities": True,
                "show_crown_assets": True,
                "show_prive_opportunities": True,
                "show_hnwi_patterns": True
            }
        }
    ],

    "intelligence_sources": [
        {
            "type": "kg_intelligence",
            "category": "migration",
            "jurisdiction": "Dubai",
            "label": "Dubai Migration Data",
            "intelligence": "Net inflow: +6,700 HNWIs | Top sources: India, UK, Russia",
            "source": "KGv3 verified"
        }
    ]
}
```

---

## Verification Checklist

### Backend Response
- [ ] `visualizations` array includes object with `type: "world_map"`
- [ ] `data.auto_fetch_opportunities` is `True`
- [ ] `data.show_hnwi_patterns` is `True` (for migration arrows)
- [ ] Response text is formatted with line breaks (`\n\n` for paragraphs)

### Frontend Rendering
- [ ] Map appears in the response
- [ ] Opportunity markers are visible (green/gold dots)
- [ ] Migration hub bubbles are visible (6 cities)
- [ ] Migration arrows are animated (10 flowing arrows)
- [ ] Clicking markers opens popups
- [ ] Hovering arrows increases opacity

### Console Logs (Development)
```
[WorldMapViz] Auto-fetching command centre opportunities...
[WorldMapViz] Fetched opportunities: { prive: 12, crown: 5 }
[WorldMapViz] Total cities before migration hubs: 17
[WorldMapViz] Added migration hubs: 6
[WorldMapViz] Migration hub cities: ['Dubai', 'Singapore', 'London', 'New York', 'Hong Kong', 'Monaco']
[WorldMapViz] Generating migration flows from cities: 23
[WorldMapViz] Generated migration flows: 10
[WorldMapViz] Final cities count: 23
```

---

## Common Issues

### Issue 1: Map Not Appearing

**Symptoms:** No map visualization in response

**Causes:**
- Backend not sending `world_map` visualization type
- Visualization type misspelled (must be exact: `world_map`, `geographic_intelligence`, or `map`)
- Missing `data` object

**Fix:**
```python
# Ensure this exact structure
{
    "type": "world_map",  # Exact match required
    "data": {
        "auto_fetch_opportunities": True  # Must be present
    }
}
```

### Issue 2: No Opportunities on Map

**Symptoms:** Map appears but no markers

**Causes:**
- `auto_fetch_opportunities` is `False` or missing
- Command centre API returning empty data
- User has no opportunities

**Fix:**
```python
"data": {
    "auto_fetch_opportunities": True  # Must be True
}
```

Check console:
```
[WorldMapViz] Fetched opportunities: { prive: 0, crown: 0 }
```

### Issue 3: No Migration Arrows

**Symptoms:** Map appears, opportunities visible, but no arrows

**Causes:**
- `show_hnwi_patterns` is `False`
- Migration hub cities not being added
- City name matching failing

**Fix:**
```python
"data": {
    "show_hnwi_patterns": True  # Must be True for arrows
}
```

Check console:
```
[WorldMapViz] Added migration hubs: 6
[WorldMapViz] Generated migration flows: 10
```

If flows = 0:
```
[WorldMapViz] Could not find cities for corridor: Mumbai → Dubai
```

### Issue 4: Text Formatting Missing

**Symptoms:** Response text has no line breaks, appears as single paragraph

**Cause:** Backend not using `\n\n` for paragraph breaks

**Fix:**
```python
# Before:
text = "Dubai has emerged as #1. Key drivers: 0% tax, golden visa."

# After:
text = "Dubai has emerged as #1.\n\nKey drivers:\n• 0% tax\n• Golden visa"
```

---

## Performance Notes

- **Auto-fetch time:** ~500ms (cached 10min)
- **Migration flow generation:** <10ms
- **Total render time:** <1 second
- **Map interactions:** 60 FPS (GPU-accelerated)

---

## Summary

**Minimum Backend Change:**

```python
if is_geography_or_migration_query(query):
    response["visualizations"].append({
        "type": "world_map",
        "data": {"auto_fetch_opportunities": True}
    })
```

**Frontend Handles:**
- ✅ Fetching all opportunities
- ✅ Adding migration hubs
- ✅ Generating migration arrows
- ✅ Rendering interactive map
- ✅ All animations and interactions

**Backend Only Needs:**
- ✅ Send visualization type
- ✅ Format response text with line breaks
- ✅ Include intelligence sources (optional)

**Result:** World-class geographic intelligence with zero backend complexity.
