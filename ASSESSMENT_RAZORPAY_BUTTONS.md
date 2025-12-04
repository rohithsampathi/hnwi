# Assessment Payment Buttons - Razorpay Setup

## Quick Setup (Same as Subscription Buttons)

The assessment payment system uses the same Razorpay setup as your subscription modal.

### Payment Button IDs to Create

In your Razorpay dashboard, create these payment buttons:

#### 1. Operator Tier - Assessment
```
Button ID: pl_assessment_operator_599
Amount: $599 USD
Type: One-time payment
Description: HNWI Chronicles - Operator Tier (Assessment)
```

#### 2. Observer Tier - Assessment
```
Button ID: pl_assessment_observer_199
Amount: $199 USD
Type: One-time payment
Description: HNWI Chronicles - Observer Tier (Assessment)
```

### Where to Create

1. Go to: https://dashboard.razorpay.com/app/payment-buttons
2. Click **"Create Payment Button"**
3. Enter the details above
4. **Copy the generated Button ID**
5. Update the ID in: `components/assessment/TierPricingComparison.tsx`

### Update Button IDs

Edit `components/assessment/TierPricingComparison.tsx`:

```typescript
const PAYMENT_BUTTON_IDS = {
  operator: 'pl_YOUR_ACTUAL_OPERATOR_BUTTON_ID',  // Replace this
  observer: 'pl_YOUR_ACTUAL_OBSERVER_BUTTON_ID'   // Replace this
};
```

### Test Flow

1. Complete C10 Assessment
2. View results page
3. Click **"See My Options"**
4. Click payment button for Operator or Observer tier
5. Razorpay checkout should open
6. Complete test payment
7. Should redirect to dashboard on success

### Notes

- ✅ Uses same RazorpayButton component as subscriptions
- ✅ No additional environment variables needed
- ✅ Button IDs hardcoded in component (same as subscription modal)
- ✅ Architect tier uses contact form (no payment)

### Current Button IDs (Placeholders)

```typescript
operator: 'pl_assessment_operator_599'  // ← Update with real ID
observer: 'pl_assessment_observer_199'  // ← Update with real ID
```

Once you create the actual payment buttons in Razorpay dashboard, just replace these placeholder IDs with the real ones!
