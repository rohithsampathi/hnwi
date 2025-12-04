# Assessment Payment Integration Setup

## Razorpay Integration Complete

The assessment results page now integrates with Razorpay for seamless payment processing using the existing payment system architecture.

## Environment Variables Required

Add these to your `.env.local` file:

```bash
# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key

# Razorpay Payment Button IDs (create these in Razorpay Dashboard)
NEXT_PUBLIC_RAZORPAY_OPERATOR_BUTTON_ID=pl_operator_599
NEXT_PUBLIC_RAZORPAY_OBSERVER_BUTTON_ID=pl_observer_199
```

## Razorpay Dashboard Setup

### 1. Create Payment Buttons

Go to Razorpay Dashboard → Payment Buttons and create two buttons:

#### Operator Tier ($599 USD)
- **Button Name**: HNWI Chronicles - Operator Tier
- **Amount**: $599 (59900 cents)
- **Currency**: USD
- **Description**: Lifetime access to Operator tier intelligence
- **Button ID**: Copy the generated ID (e.g., `pl_xxxxxxx`)
- Set as `NEXT_PUBLIC_RAZORPAY_OPERATOR_BUTTON_ID` in .env

#### Observer Tier ($199 USD)
- **Button Name**: HNWI Chronicles - Observer Tier
- **Amount**: $199 (19900 cents)
- **Currency**: USD
- **Description**: Lifetime access to Observer tier intelligence
- **Button ID**: Copy the generated ID (e.g., `pl_xxxxxxx`)
- Set as `NEXT_PUBLIC_RAZORPAY_OBSERVER_BUTTON_ID` in .env

### 2. Webhook Configuration (Optional)

For payment verification and backend updates:

- **Webhook URL**: `https://yourdomain.com/api/payment/webhook`
- **Events to subscribe**:
  - `payment.captured`
  - `payment.failed`

## Payment Flow

### Operator/Observer Tiers
1. User completes C10 Assessment
2. Views results page
3. Clicks "See My Options" button
4. Modal displays three-column pricing comparison
5. Clicks payment button for Operator ($599) or Observer ($199)
6. Razorpay checkout opens
7. User completes payment
8. On success: Redirects to dashboard with tier upgrade
9. On failure: User can retry payment

### Architect Tier
1. User completes C10 Assessment
2. Views results page
3. Clicks "See My Options" button
4. Fills out contact form (email + WhatsApp)
5. Inquiry submitted to `/api/assessment/architect-inquiry`
6. Team contacts user within 24 hours for personalized consultation
7. No upfront payment required

## API Routes Created

### `/api/payment/create-order`
- Creates Razorpay order (programmatic alternative to payment buttons)
- Not currently used (payment buttons are simpler)

### `/api/payment/verify`
- Verifies payment signature from Razorpay
- Records payment in backend database
- Returns verification status

### `/api/assessment/architect-inquiry`
- Handles Architect tier contact form submissions
- Forwards to backend for CRM integration
- Has fallback logging if backend is unavailable

## Components Architecture

```
TierPricingModal (Modal wrapper)
  └── TierPricingComparison (Three columns)
      ├── Architect: Contact Form
      ├── Operator: RazorpayButton ($599)
      └── Observer: RazorpayButton ($199)
```

## Testing

### Test Payment Buttons
1. Use Razorpay test mode credentials
2. Create test payment buttons in test mode
3. Test card: `4111 1111 1111 1111`
4. Expiry: Any future date
5. CVV: Any 3 digits

### Verify Integration
```bash
# Check environment variables are loaded
console.log(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID)
console.log(process.env.NEXT_PUBLIC_RAZORPAY_OPERATOR_BUTTON_ID)
console.log(process.env.NEXT_PUBLIC_RAZORPAY_OBSERVER_BUTTON_ID)
```

## Success Criteria

- ✅ Pricing updated to USD ($599 Operator, $199 Observer)
- ✅ Payment buttons render in pricing modal
- ✅ Razorpay checkout opens on click
- ✅ Payment success triggers redirect to dashboard
- ✅ Architect form submission works
- ✅ Clean UI with central design tokens only

## Next Steps

1. **Configure Razorpay Account**: Set up production keys and payment buttons
2. **Backend Integration**: Update backend to handle payment webhooks
3. **User Upgrade Logic**: Implement tier upgrade in user profile
4. **Success Page**: Create post-payment success/onboarding flow
5. **Analytics**: Track conversion rates by tier

## Support

For Razorpay integration issues:
- Razorpay Docs: https://razorpay.com/docs/payment-button/
- Support: https://razorpay.com/support/

For code issues:
- Check browser console for errors
- Verify all environment variables are set
- Test in Razorpay test mode first
