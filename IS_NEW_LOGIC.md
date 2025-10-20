# is_new Logic - Blinking Only for Latest Opportunities

## The Problem

The test code was forcing the **first opportunity in the array** (`index === 0`) to blink, which could be:
- An old Privé opportunity
- A random opportunity (depending on backend sort order)
- Not actually a new opportunity

## The Solution

**File:** `components/home-dashboard-elite.tsx:254-259`

```typescript
is_new: opp.is_new || (opp.start_date && (() => {
  const oppDate = new Date(opp.start_date);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return oppDate >= sevenDaysAgo;
})()),
```

### Logic Flow:

1. **First Priority:** Use `opp.is_new` from backend if available
   - Backend explicitly marks opportunities as new

2. **Fallback:** Calculate based on `start_date`
   - If opportunity was published **within last 7 days** → mark as new
   - Uses current date minus 7 days as threshold

### Examples:

**Today is October 18, 2025:**

| Opportunity | start_date | Age | Blinks? |
|------------|-----------|-----|---------|
| New Villa | Oct 17, 2025 | 1 day | ✅ YES |
| Luxury Watch | Oct 12, 2025 | 6 days | ✅ YES |
| Old Privé | Sep 1, 2025 | 47 days | ❌ NO |
| Real Estate | Oct 11, 2025 | 7 days | ❌ NO (exactly 7 days) |

### Visual Behavior:

**NEW Opportunities (≤ 7 days old):**
```
Map: ◉⬤◉ ← Pulsing marker
Popup: [●] NEW badge
```

**OLD Opportunities (> 7 days):**
```
Map: ⬤ ← Normal marker
Popup: No badge
```

## Backend Integration

### Preferred Method:
Backend should send `is_new: true` for new opportunities:

```json
{
  "title": "New Investment",
  "start_date": "2025-10-17",
  "is_new": true,  ← Backend explicitly marks as new
  ...
}
```

### Fallback Method:
If backend doesn't send `is_new`, frontend calculates based on `start_date`:

```json
{
  "title": "Recent Opportunity",
  "start_date": "2025-10-15",  ← Frontend sees this is < 7 days ago
  ...
}
```

## Customizing the Timeframe

To change from 7 days to a different period, modify line 257:

```typescript
// 7 days (current)
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

// 14 days
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 14);

// 30 days
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 30);

// 24 hours
const oneDayAgo = new Date();
oneDayAgo.setHours(oneDayAgo.getHours() - 24);
return oppDate >= oneDayAgo;
```

## Why 7 Days?

- **Too Short (1-2 days):** Users might miss new opportunities
- **Too Long (30+ days):** Too many markers blinking, loses impact
- **7 days (sweet spot):** Recent enough to be relevant, not overwhelming

## Edge Cases Handled:

1. **No start_date:** Opportunity won't blink (backend should send is_new)
2. **Invalid date:** Won't blink, fails gracefully
3. **Backend sends is_new: false:** Respects backend (doesn't override)
4. **Backend sends is_new: true:** Always blinks (backend has priority)

## Testing:

Check opportunities with these dates:
- Today → Should blink
- 3 days ago → Should blink
- 7 days ago → Should NOT blink
- 1 month ago → Should NOT blink

## Remove Fallback Later:

Once backend reliably sends `is_new: true`, you can simplify to:

```typescript
is_new: opp.is_new,
```

This removes the date calculation fallback.
