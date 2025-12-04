# Payment Confirmation Emails & Webhook Setup Guide

## Overview

This guide covers the complete setup for:
1. **Payment Confirmation Emails** - Automatic emails sent after successful payment
2. **Razorpay Webhooks** - Real-time payment event notifications from Razorpay

---

## 1. Email Service Configuration

### Environment Variables

Add these to your `.env.local` (development) and `.env.production` (production):

```bash
# Email Configuration
EMAIL_PROVIDER=resend              # Options: 'resend', 'sendgrid', 'smtp'
EMAIL_FROM=noreply@hnwichronicles.com
EMAIL_FROM_NAME=HNWI Chronicles
EMAIL_REPLY_TO=support@hnwichronicles.com

# Resend API Key (if using Resend - recommended)
RESEND_API_KEY=re_your_resend_api_key_here

# OR SendGrid API Key (if using SendGrid)
# SENDGRID_API_KEY=SG.your_sendgrid_api_key_here
```

### Email Provider Setup

#### Option 1: Resend (Recommended)

1. Sign up at https://resend.com
2. Verify your domain or use their free domain for testing
3. Get your API key from Dashboard → API Keys
4. Add to `.env.local`:
   ```bash
   EMAIL_PROVIDER=resend
   RESEND_API_KEY=re_abc123...
   ```

**Free Tier**: 100 emails/day, 3,000 emails/month

#### Option 2: SendGrid

1. Sign up at https://sendgrid.com
2. Verify sender identity
3. Create API key with "Mail Send" permissions
4. Add to `.env.local`:
   ```bash
   EMAIL_PROVIDER=sendgrid
   SENDGRID_API_KEY=SG.abc123...
   ```

**Free Tier**: 100 emails/day forever

### Email Flow

```
User Completes Payment
  ↓
Razorpay Processes Payment
  ↓
Frontend Verifies Signature
  ↓
Next.js API Records Payment in Backend
  ↓
Email Service Sends Confirmation
  ↓
User Receives Beautiful HTML Email ✅
```

### Email Features

- ✅ Professional HTML template with HNWI Chronicles branding
- ✅ Transaction details (Payment ID, Order ID, Amount, Tier)
- ✅ One-click access to dashboard
- ✅ Responsive design for mobile/desktop
- ✅ Fallback plain text version
- ✅ Non-blocking (doesn't delay response if email fails)

---

## 2. Razorpay Webhook Configuration

### What are Webhooks?

Webhooks allow Razorpay to notify your server about payment events in real-time, even if the user closes the browser. This provides:
- **Redundancy**: Catch payments that frontend verification might miss
- **Real-time updates**: Know immediately when payments succeed/fail
- **Reconciliation**: Match Razorpay events with your database records

### Environment Variables

Add to `.env.local` and `.env.production`:

```bash
# Razorpay Webhook Secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

### Setting Up Razorpay Webhooks

#### Step 1: Get Your Webhook URL

**Development (using ngrok)**:
```bash
# Install ngrok if you haven't
brew install ngrok  # macOS
# OR download from https://ngrok.com/download

# Expose your local server
ngrok http 3000

# Your webhook URL will be:
https://abc123.ngrok.io/api/webhooks/razorpay
```

**Production**:
```
https://app.hnwichronicles.com/api/webhooks/razorpay
```

#### Step 2: Configure in Razorpay Dashboard

1. Login to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Go to **Settings** → **Webhooks**
3. Click **+ Create New Webhook**
4. Enter your webhook URL:
   - Development: `https://your-ngrok-url.ngrok.io/api/webhooks/razorpay`
   - Production: `https://app.hnwichronicles.com/api/webhooks/razorpay`
5. Select events to listen for:
   - ✅ `payment.captured`
   - ✅ `payment.failed`
   - ✅ `order.paid`
6. Copy the **Webhook Secret** shown
7. Add secret to your `.env.local`:
   ```bash
   RAZORPAY_WEBHOOK_SECRET=whsec_abc123xyz...
   ```

#### Step 3: Verify Webhook is Working

1. Make a test payment
2. Check your Next.js logs:
   ```
   [Webhook] Received Razorpay webhook
   [Webhook] Event type: payment.captured
   [Webhook] Payment captured: {payment_id: '...', order_id: '...'}
   [Webhook] Payment capture recorded successfully
   ```
3. Check Razorpay Dashboard → Webhooks → Logs to see delivery status

### Webhook Events Handled

| Event | Description | Action Taken |
|-------|-------------|--------------|
| `payment.captured` | Payment successfully captured | Record in backend, send email |
| `payment.failed` | Payment failed | Log failure, notify support |
| `order.paid` | Order marked as paid | Additional verification |

### Webhook Security

✅ **Signature Verification**: Every webhook is verified using HMAC SHA256
✅ **Secret Key**: Only Razorpay knows the webhook secret
✅ **Replay Protection**: Events are timestamped
✅ **HTTPS Only**: Webhooks must be delivered over HTTPS in production

---

## 3. Backend Endpoints Required

Your Python backend needs these endpoints:

### `/api/payments/record`
Already implemented! Records payment after frontend verification.

### `/api/payments/webhook-capture` (NEW)
Handle payment.captured webhook events:

```python
@router.post("/api/payments/webhook-capture")
async def webhook_payment_captured(
    payment_id: str,
    order_id: str,
    amount: float,
    currency: str,
    status: str,
    method: str,
    email: str,
    contact: str,
    tier: Optional[str],
    session_id: Optional[str],
    captured_at: str
):
    """
    Webhook handler for payment.captured events
    Redundant safety net if frontend verification was missed
    """
    # Same logic as /payments/record
    # Check if already recorded, if not, record it
    pass
```

### `/api/payments/webhook-failed` (NEW)
Handle payment.failed webhook events:

```python
@router.post("/api/payments/webhook-failed")
async def webhook_payment_failed(
    payment_id: str,
    order_id: str,
    status: str,
    tier: Optional[str],
    session_id: Optional[str],
    failed_at: str
):
    """
    Webhook handler for payment.failed events
    Log failed payment attempts for support/reconciliation
    """
    # Log failure
    # Optionally notify support team
    pass
```

---

## 4. Testing

### Test Email Delivery

```bash
# Terminal 1: Start Next.js
cd /Users/skyg/Desktop/Code/hnwi-chronicles
npm run dev

# Terminal 2: Make test API call
curl -X POST http://localhost:3000/api/payment/verify \
  -H "Content-Type: application/json" \
  -d '{
    "payment_id": "pay_test123",
    "order_id": "order_test123",
    "signature": "test_signature",
    "tier": "observer",
    "session_id": "sess_test123",
    "user_email": "your-test-email@example.com"
  }'

# Check logs for:
# [Email] Email sent via Resend: ...
```

### Test Webhook

1. **Start ngrok**:
   ```bash
   ngrok http 3000
   ```

2. **Configure webhook in Razorpay with ngrok URL**

3. **Make test payment** using Razorpay test cards:
   - Success: `4111 1111 1111 1111`
   - Failure: `4000 0000 0000 0002`
   - CVV: Any 3 digits
   - Expiry: Any future date

4. **Check logs**:
   ```
   [Webhook] Received Razorpay webhook
   [Webhook] Event type: payment.captured
   [Webhook] Payment captured: {...}
   ```

---

## 5. Production Deployment Checklist

### Before Going Live:

- [ ] Switch to Razorpay **live mode** keys
- [ ] Update webhook URL to production domain
- [ ] Verify domain for email provider (Resend/SendGrid)
- [ ] Update `EMAIL_FROM` to your verified domain
- [ ] Test email delivery from production
- [ ] Monitor webhook delivery in Razorpay dashboard
- [ ] Set up error alerting (Sentry, email notifications)
- [ ] Document refund process
- [ ] Train support team on payment issues

### Environment Variables Checklist:

```bash
# ✅ Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=whsec_...

# ✅ Email
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@hnwichronicles.com
EMAIL_FROM_NAME=HNWI Chronicles
EMAIL_REPLY_TO=support@hnwichronicles.com

# ✅ Backend
API_BASE_URL=https://your-backend.com
```

---

## 6. Monitoring & Troubleshooting

### Check Email Logs

**Resend Dashboard**: https://resend.com/emails
- View all sent emails
- Check delivery status
- See open/click rates

**SendGrid Dashboard**: https://app.sendgrid.com/email_activity
- Email activity feed
- Delivery statistics

### Check Webhook Logs

**Razorpay Dashboard**:
1. Go to Settings → Webhooks
2. Click on your webhook
3. View "Logs" tab
4. See delivery attempts, responses, errors

### Common Issues

**Email not sending**:
- ✅ Check API key is correct
- ✅ Verify domain is verified (production)
- ✅ Check email address is valid
- ✅ Look for errors in Next.js logs
- ✅ Check spam folder

**Webhook not received**:
- ✅ Verify webhook URL is accessible (not localhost)
- ✅ Check webhook secret matches
- ✅ Ensure HTTPS in production
- ✅ Check firewall/security groups
- ✅ View delivery attempts in Razorpay dashboard

**Signature verification fails**:
- ✅ Verify `RAZORPAY_WEBHOOK_SECRET` is correct
- ✅ Don't modify webhook body before verification
- ✅ Check for extra whitespace/encoding issues

---

## 7. Files Created/Modified

| File | Purpose |
|------|---------|
| `/lib/email/email-service.ts` | Email sending service |
| `/app/api/webhooks/razorpay/route.ts` | Webhook handler |
| `/app/api/payment/verify/route.ts` | Added email sending after payment |
| `/lib/razorpay-checkout.ts` | Pass email to verification |
| `/components/assessment/TierPricingComparison.tsx` | Collect email before payment |

---

## 8. Support

For issues:
- **Email problems**: Check provider dashboard (Resend/SendGrid)
- **Webhook problems**: Check Razorpay webhook logs
- **Payment verification**: Check Next.js server logs
- **Backend recording**: Check Python backend logs

---

## Success! 🎉

You now have:
- ✅ Automatic payment confirmation emails with professional design
- ✅ Razorpay webhooks for reliable payment tracking
- ✅ Redundant payment recording (frontend + webhook)
- ✅ Beautiful HTML email templates
- ✅ Production-ready configuration

Users will receive a branded confirmation email immediately after successful payment, and you'll have reliable webhook notifications for all payment events!
