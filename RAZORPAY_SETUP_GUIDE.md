# Complete Razorpay Setup Guide

## Step 1: Create Razorpay Account

1. Go to [https://dashboard.razorpay.com/signup](https://dashboard.razorpay.com/signup)
2. Sign up with your business email
3. Complete KYC verification (required for live payments)
4. Activate your account

## Step 2: Get API Keys

### Test Mode (Development)
1. Go to **Settings** → **API Keys**
2. Switch to **Test Mode** (toggle at top)
3. Click **Generate Test Key**
4. Copy both:
   - **Key ID** (starts with `rzp_test_`)
   - **Key Secret** (keep this secure!)

### Live Mode (Production)
1. After KYC approval, switch to **Live Mode**
2. Click **Generate Live Key**
3. Copy both:
   - **Key ID** (starts with `rzp_live_`)
   - **Key Secret** (never share this!)

## Step 3: Create Payment Buttons

### Create Operator Tier Button ($599 USD)

1. Go to **Payment Pages** → **Payment Buttons**
2. Click **Create Payment Button**
3. Fill in details:
   ```
   Button Title: HNWI Chronicles - Operator Tier
   Description: Lifetime access to Operator tier intelligence
   Amount: 599
   Currency: USD
   Payment Type: One-time
   ```
4. Click **Create**
5. Copy the **Button ID** (starts with `pl_`)
6. Save as: `NEXT_PUBLIC_RAZORPAY_OPERATOR_BUTTON_ID`

### Create Observer Tier Button ($199 USD)

1. Click **Create Payment Button** again
2. Fill in details:
   ```
   Button Title: HNWI Chronicles - Observer Tier
   Description: Lifetime access to Observer tier intelligence
   Amount: 199
   Currency: USD
   Payment Type: One-time
   ```
3. Click **Create**
4. Copy the **Button ID**
5. Save as: `NEXT_PUBLIC_RAZORPAY_OBSERVER_BUTTON_ID`

## Step 4: Update Environment Variables

### Edit `.env.local`

```bash
# Razorpay API Keys (use test keys for development)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_actual_secret_key

# Payment Button IDs
NEXT_PUBLIC_RAZORPAY_OPERATOR_BUTTON_ID=pl_xxxxxxxxx
NEXT_PUBLIC_RAZORPAY_OBSERVER_BUTTON_ID=pl_xxxxxxxxx
```

### Important Notes:
- ✅ Use **Test Keys** in development
- ✅ Use **Live Keys** in production only
- ⚠️ **Never commit** `.env.local` to git
- ⚠️ Secret keys are **never** prefixed with `NEXT_PUBLIC_`

## Step 5: Configure Webhooks (Optional but Recommended)

### Why Webhooks?
- Verify payments server-side
- Update user tier automatically
- Handle payment failures gracefully

### Setup:
1. Go to **Settings** → **Webhooks**
2. Click **Add New Webhook**
3. Enter webhook URL:
   ```
   https://yourdomain.com/api/payment/webhook
   ```
4. Select events:
   - ✅ `payment.captured`
   - ✅ `payment.failed`
   - ✅ `payment.authorized`
5. Copy the **Webhook Secret**
6. Add to `.env.local`:
   ```bash
   RAZORPAY_WEBHOOK_SECRET=whsec_xxxxx
   ```

## Step 6: Test the Integration

### Using Test Mode

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Navigate to assessment results page
3. Click **"See My Options"**
4. Click payment button for any tier

### Test Cards

| Card Number | Description | Result |
|-------------|-------------|---------|
| 4111 1111 1111 1111 | Basic success | ✅ Payment succeeds |
| 4000 0000 0000 0002 | Declined card | ❌ Payment fails |
| 4000 0000 0000 0077 | Insufficient funds | ❌ Payment fails |

**Test CVV**: Any 3 digits
**Test Expiry**: Any future date
**Test Name**: Any name

### Expected Flow:

1. ✅ Payment button loads in modal
2. ✅ Clicking opens Razorpay checkout
3. ✅ Enter test card details
4. ✅ Payment succeeds
5. ✅ Redirects to dashboard
6. ✅ User tier upgraded

## Step 7: Go Live

### Pre-Launch Checklist

- [ ] KYC verification complete
- [ ] Live API keys generated
- [ ] Payment buttons created in live mode
- [ ] `.env.local` updated with live keys
- [ ] Webhooks configured for production URL
- [ ] Test payments verified in live mode
- [ ] Customer support email configured

### Update Environment

```bash
# Switch to Live Keys
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_live_secret_key

# Live Payment Button IDs
NEXT_PUBLIC_RAZORPAY_OPERATOR_BUTTON_ID=pl_live_operator_id
NEXT_PUBLIC_RAZORPAY_OBSERVER_BUTTON_ID=pl_live_observer_id
```

### Deploy

```bash
# Build production
npm run build

# Deploy to your hosting
# (Vercel, DigitalOcean, AWS, etc.)
```

## Troubleshooting

### Error: "Payment button not found"
- ✅ Check button ID is correct in `.env.local`
- ✅ Ensure you're in correct mode (test/live)
- ✅ Verify button exists in Razorpay dashboard

### Error: "Invalid key"
- ✅ Check `NEXT_PUBLIC_RAZORPAY_KEY_ID` matches mode
- ✅ Restart dev server after changing .env
- ✅ Verify no extra spaces in environment variables

### Payment button not loading
- ✅ Check browser console for errors
- ✅ Verify Razorpay script loads (network tab)
- ✅ Check button ID format (should start with `pl_`)

### Demo mode showing instead of payment
- ✅ Environment variables not set correctly
- ✅ Payment button IDs contain placeholder values
- ✅ Restart server to load new env variables

## Viewing Logs

```bash
# Browser Console (F12)
# Look for:
[RazorpayButton] Loading payment button: pl_xxxxx
[RazorpayButton] Script loaded successfully

# If you see:
[RazorpayButton] Invalid or placeholder payment button ID
# → Your .env is not configured correctly
```

## Payment Flow Diagram

```
User completes assessment
        ↓
Views results page
        ↓
Clicks "See My Options"
        ↓
Modal shows 3 tiers
        ↓
Clicks payment button (Operator/Observer)
        ↓
Razorpay checkout opens
        ↓
Enters card details
        ↓
Payment processed
        ↓
[SUCCESS] → Redirect to dashboard
        ↓
[FAILURE] → Show error, retry
```

## Security Best Practices

### DO:
✅ Use environment variables for all keys
✅ Keep secret keys server-side only
✅ Use HTTPS in production
✅ Verify payments server-side via webhooks
✅ Log all payment events

### DON'T:
❌ Commit `.env.local` to git
❌ Share secret keys
❌ Use live keys in development
❌ Skip webhook verification
❌ Trust client-side payment confirmation only

## Support

### Razorpay Support:
- Docs: https://razorpay.com/docs/
- Dashboard: https://dashboard.razorpay.com/
- Support: https://razorpay.com/support/

### Common Issues:
- Payment button errors → Check IDs in dashboard
- Webhook failures → Verify URL is publicly accessible
- Currency issues → Ensure USD is enabled in your account

## Next Steps

1. ✅ Complete Steps 1-4 above
2. ✅ Test in test mode
3. ✅ Configure webhooks
4. ✅ Complete KYC
5. ✅ Switch to live keys
6. ✅ Test with real cards (small amounts)
7. ✅ Deploy to production
8. ✅ Monitor dashboard for transactions

---

**Need Help?** Check console logs first, then:
1. Review this guide
2. Check Razorpay dashboard for errors
3. Verify all environment variables
4. Contact Razorpay support if payment processing issues
