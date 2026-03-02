# JARVIS Decision Memo Audit Interface

## Overview
A new AI command center-style interface for Decision Memo audits that transforms the traditional linear scroll into an interactive, navigable intelligence system.

## Key Features

### 🎯 Interactive Navigation
- **Sidebar Categories**: 7 main categories with expandable subsections
- **Progress Tracking**: Visual indicators showing viewed vs unviewed sections
- **Search Functionality**: Quick filter sections by keyword
- **Smart Navigation**: AIDA flow preserved with "Suggested Next Sections"

### ⚡ Performance
- **Conditional Rendering**: Only shows sections with available data
- **URL State Sync**: Shareable direct links to specific sections
- **Smooth Transitions**: 60fps animations with loading states
- **LocalStorage Persistence**: Progress and preferences saved

### 🎨 Design
- **Command Center Aesthetic**: Dark, sophisticated JARVIS-style UI
- **Gold Accent Colors**: Consistent with HNWI Chronicles brand
- **Responsive Layout**: Desktop sidebar, tablet collapsible, mobile drawer
- **Keyboard Shortcuts**: Cmd+B to toggle sidebar

## Files Created

### Core Components
```
components/decision-memo/audit-jarvis/
├── JarvisAuditShell.tsx         # Main orchestrator (state, URL sync, localStorage)
├── JarvisSidebar.tsx            # Navigation with categories and search
├── JarvisMainPanel.tsx          # Content display with transitions
├── JarvisCommandHeader.tsx      # Top nav with progress bar
├── SectionTransition.tsx        # Smooth animations between sections
├── RelatedSections.tsx          # AIDA flow suggested sections
└── index.ts                     # Component exports
```

### Configuration
```
lib/decision-memo/
└── jarvis-section-map.ts        # Section definitions with conditional rendering logic
```

### Modified Files
```
app/(authenticated)/decision-memo/audit/[intakeId]/page.tsx
└── Added view toggle (JARVIS vs Legacy)
```

## How to Use

### Access JARVIS Interface (Default)
Visit any audit page normally:
```
https://app.hnwichronicles.com/decision-memo/audit/[intakeId]
```

### Access Legacy View
Add `?view=legacy` parameter:
```
https://app.hnwichronicles.com/decision-memo/audit/[intakeId]?view=legacy
```

### Toggle Between Views
- **From JARVIS**: Click "Legacy View" button in top-right header
- **From Legacy**: Add `?view=jarvis` or remove `?view=legacy` param

### Direct Section Links
Share specific sections with URL params:
```
?section=tax-dashboard-analysis
?section=golden-visa-intelligence
?section=risk-radar
```

## Section Mapping (24 Sections → 7 Categories)

### 1. **Executive Summary** (3 sections)
- Audit Overview (MemoHeader)
- Detailed Verdict (Page2AuditVerdict)
- Risk Radar Chart

### 2. **Tax Intelligence** (4 sections)
- Tax Jurisdiction Analysis
- Cross-Border Tax Audit (conditional)
- Special Tax Regimes (conditional)
- Wealth Projection Analysis

### 3. **Peer Intelligence** (6 sections)
- Destination Drivers
- Peer Cohort Analysis
- Capital Flow Corridors
- Geographic Distribution
- HNWI Migration Trends
- Precedent Data Ticker

### 4. **Risk Analysis** (4 sections)
- Liquidity Trap Analysis
- Transparency & Compliance
- Real Asset Audit
- Crisis Stress Test

### 5. **Wealth Structuring** (4 sections)
- Golden Visa Intelligence (KGv3)
- Golden Visa Programs (fallback)
- Entity Structure Matrix
- Succession Planning

### 6. **Scenario Planning** (1 section)
- Decision Tree Analysis

### 7. **Implementation & Sources** (3 sections)
- Implementation Roadmap
- Legal References
- Regulatory Sources

## Conditional Rendering Logic

Sections automatically hide when data is unavailable:

```typescript
// Example: Cross-Border Tax Audit only shows if backend provides data
shouldRender: (data) => !!data.preview_data.cross_border_audit

// Example: Golden Visa Intelligence prioritizes KGv3 over basic
shouldRender: (data) => data.preview_data.golden_visa_intelligence?.exists === true
```

## AIDA Flow Preservation

Each section includes `aidaNext` array suggesting next sections:
```typescript
aidaNext: ['tax-dashboard-analysis', 'regime-intelligence', 'wealth-projection']
```

Rendered as "Suggested Next Sections" cards at bottom of main panel.

## Mobile Experience

### Desktop (>1280px)
- Sidebar visible (256px fixed)
- Max-width 5xl content area
- Related sections grid (2 columns)

### Tablet (768px-1280px)
- Sidebar collapsible
- Full-width content
- Related sections grid (2 columns)

### Mobile (<768px)
- Sidebar as slide-in drawer
- Hamburger menu toggle
- Single-column related sections
- 44px minimum touch targets

## Keyboard Shortcuts

- **Cmd+B / Ctrl+B**: Toggle sidebar
- **Browser Back/Forward**: Navigate between sections (URL synced)

## Progress Tracking

### Progress Bar (Top Header)
Shows "X/Y sections" with visual progress bar

### Sidebar Indicators
- ✅ Green checkmark: Viewed
- ⭕ Gray circle: Unviewed

### LocalStorage Keys
```javascript
// Per-audit progress
audit_progress_{intakeId}

// Sidebar state
audit_sidebar_collapsed
```

## Future Enhancements (Not Implemented)

- Voice navigation integration
- AI chat overlay for Q&A
- Section comparison mode
- Custom section ordering
- Collaborative annotations
- Version history

## Technical Details

### State Management
```typescript
interface JarvisAuditState {
  activeSection: string;
  activeCategory: string;
  viewedSections: Set<string>;
  sidebarCollapsed: boolean;
  searchQuery: string;
}
```

### Animation System
Uses `motion-variants.ts` for consistency:
- `EASE_OUT_EXPO` for hero transitions
- `fadeInUp` for section entrances
- `staggerContainer` for list animations

### Performance Optimizations
- 100ms debounce on section switching
- Lazy section loading (not all 24 at once)
- Scroll to top on section change
- CSS transforms for 60fps animations

## Rollback Strategy

If issues arise, use feature flag approach:
1. Default to legacy view: `useJarvisInterface = false`
2. Monitor analytics for user preference
3. A/B test with cohorts

## Build Status

✅ **Build Successful** - No TypeScript errors
✅ **All Components Created** - 6 new files + 1 config
✅ **Integration Complete** - View toggle implemented
✅ **Responsive Design** - Desktop/tablet/mobile tested

## Developer Notes

### Adding New Sections
1. Import component in `jarvis-section-map.ts`
2. Add to `SECTIONS` array with `shouldRender` logic
3. Assign to appropriate category
4. Add `aidaNext` for AIDA flow

### Modifying Categories
Edit `CATEGORIES` array in `jarvis-section-map.ts`:
```typescript
{
  id: 'new-category',
  title: 'New Category',
  icon: '🎯',
  description: 'Category description'
}
```

### Testing Conditional Rendering
Test with audits that have/lack specific data:
- Audit with Golden Visa data
- Audit without Cross-Border data
- Audit with US Worldwide Taxation

---

**Version**: 1.0.0
**Last Updated**: February 27, 2026
**Status**: Production Ready
**Maintainer**: HNWI Chronicles Engineering Team
