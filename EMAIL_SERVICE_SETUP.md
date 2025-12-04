# Email Service Setup Guide

This guide will help you configure and test the email service for HNWI Chronicles.

## Overview

The platform uses a transactional email service to send:
- **Payment confirmations** - After successful Razorpay payments
- **Welcome emails** - When new users sign up
- **Email verification** - To verify user email addresses
- **Refund notifications** - When refunds are processed

## Supported Email Providers

1. **Resend** (Recommended) - Modern, developer-friendly
2. **SendGrid** - Enterprise-grade email delivery
3. **SMTP** - Custom mail server (requires additional setup)

---

## Option 1: Resend Setup (Recommended)

### Why Resend?
- Simple API and great documentation
- Free tier: 100 emails/day, 3,000 emails/month
- Excellent deliverability
- Built for developers

### Setup Steps

#### 1. Create Resend Account
1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

#### 2. Add Your Domain (Optional but Recommended)
1. Go to **Domains** in the Resend dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `hnwichronicles.com`)
4. Add the DNS records provided by Resend:
   - TXT record for domain verification
   - MX records for email receiving (optional)
   - DKIM records for authentication

**Note**: For development/testing, you can skip domain setup and use Resend's sandbox domain, but emails will only be sent to your verified email address.

#### 3. Create API Key
1. Go to **API Keys** in the Resend dashboard
2. Click **Create API Key**
3. Name it (e.g., "HNWI Chronicles Production")
4. Copy the API key (starts with `re_`)

#### 4. Configure Environment Variables

Add to your `.env.local`:

```bash
# Email Provider
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_actual_api_key_here

# Email Sender Configuration
EMAIL_FROM=noreply@hnwichronicles.com
EMAIL_FROM_NAME=HNWI Chronicles
EMAIL_REPLY_TO=hnwi@montaigne.co
SUPPORT_EMAIL=hnwi@montaigne.co
```

**Important**: If you haven't added your domain, use your verified email for testing:
```bash
EMAIL_FROM=your-verified-email@example.com
```

#### 5. Test Email Delivery

Run this test in your browser console after logging in:

```javascript
// Test payment confirmation email
fetch('/api/payment/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    payment_id: 'test_payment_123',
    order_id: 'test_order_456',
    signature: 'test_signature',
    tier: 'operator',
    session_id: 'sess_test',
    user_email: 'your-email@example.com' // Use your verified email
  })
});
```

Check your inbox for the payment confirmation email.

---

## Option 2: SendGrid Setup

### Why SendGrid?
- Enterprise-grade reliability
- Free tier: 100 emails/day forever
- Advanced analytics and tracking
- Battle-tested at scale

### Setup Steps

#### 1. Create SendGrid Account
1. Go to [sendgrid.com](https://sendgrid.com)
2. Sign up for a free account
3. Verify your email address

#### 2. Create API Key
1. Go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Choose **Restricted Access**
4. Enable **Mail Send** permission
5. Name it (e.g., "HNWI Chronicles")
6. Copy the API key (starts with `SG.`)

#### 3. Verify Sender Identity
1. Go to **Settings** → **Sender Authentication**
2. Choose **Single Sender Verification** (for quick setup)
3. Fill in:
   - From Name: `HNWI Chronicles`
   - From Email: `noreply@hnwichronicles.com` (or your domain)
   - Reply To: `hnwi@montaigne.co`
4. Check your email and verify the sender

**Note**: For production, set up **Domain Authentication** instead for better deliverability.

#### 4. Configure Environment Variables

Add to your `.env.local`:

```bash
# Email Provider
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your_actual_api_key_here

# Email Sender Configuration
EMAIL_FROM=noreply@hnwichronicles.com
EMAIL_FROM_NAME=HNWI Chronicles
EMAIL_REPLY_TO=hnwi@montaigne.co
SUPPORT_EMAIL=hnwi@montaigne.co
```

#### 5. Test Email Delivery

Same test as Resend above - use the verified sender email.

---

## Option 3: Custom SMTP (Advanced)

### Setup Steps

#### 1. Get SMTP Credentials
From your email provider (Gmail, Office 365, custom mail server):
- SMTP host (e.g., `smtp.gmail.com`)
- SMTP port (usually `587` for TLS)
- Username (usually your email)
- Password or app-specific password

#### 2. Configure Environment Variables

Add to your `.env.local`:

```bash
# Email Provider
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password

# Email Sender Configuration
EMAIL_FROM=noreply@hnwichronicles.com
EMAIL_FROM_NAME=HNWI Chronicles
EMAIL_REPLY_TO=hnwi@montaigne.co
SUPPORT_EMAIL=hnwi@montaigne.co
```

**Note**: SMTP implementation requires additional code. Currently, only Resend and SendGrid are fully supported.

---

## Testing All Email Templates

### 1. Payment Confirmation Email

Triggered after successful Razorpay payment:

```bash
# Complete a test payment through the UI
# Or use the test script above
```

### 2. Welcome Email

Send manually via API:

```javascript
fetch('/api/auth/send-welcome', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_name: 'John Doe',
    user_email: 'your-email@example.com'
  })
});
```

### 3. Email Verification

Triggered during user registration:

```javascript
fetch('/api/auth/send-verification', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: 'user_123',
    user_email: 'your-email@example.com',
    user_name: 'John Doe'
  })
});
```

### 4. Refund Notification

Send manually via API:

```javascript
fetch('/api/payment/send-refund-notification', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_email: 'your-email@example.com',
    refund_amount: 999,
    currency: 'USD',
    payment_id: 'pay_test123',
    refund_id: 'rfnd_test456',
    reason: 'Requested by customer'
  })
});
```

---

## Webhook Email Testing

### Setup Razorpay Webhook

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/app/webhooks)
2. Click **Add New Webhook**
3. Enter webhook URL:
   - Development: Use [ngrok](https://ngrok.com) to expose localhost
   - Production: `https://app.hnwichronicles.com/api/webhooks/razorpay`
4. Select events to track:
   - `payment.captured`
   - `payment.failed`
   - `refund.created`
5. Copy the webhook secret
6. Add to `.env.local`:

```bash
RAZORPAY_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Test Webhook Email Flow

1. Make a test payment through your app
2. Razorpay will call your webhook
3. Webhook handler sends confirmation email
4. Check your inbox

---

## Troubleshooting

### Emails Not Sending

**1. Check API Key**
```bash
# Verify your API key is set correctly
echo $RESEND_API_KEY  # or $SENDGRID_API_KEY
```

**2. Check Sender Email**
- Resend: Make sure sender email is from verified domain
- SendGrid: Make sure sender email is verified in SendGrid

**3. Check Server Logs**
```bash
# Look for email service errors
npm run dev
# Watch for "[Email]" log messages
```

### Emails Go to Spam

**1. Set Up Domain Authentication**
- Add SPF, DKIM, and DMARC records
- Verify domain in email provider dashboard

**2. Use Professional From Address**
- Avoid free email domains (gmail.com, yahoo.com)
- Use your own domain (hnwichronicles.com)

**3. Keep Content Professional**
- Avoid spam trigger words
- Include unsubscribe link (for marketing emails)
- Use proper HTML structure

### Rate Limiting

**Free Tier Limits:**
- Resend: 100/day, 3,000/month
- SendGrid: 100/day forever

**Solutions:**
1. Upgrade to paid tier if needed
2. Implement email queuing for bulk sends
3. Use separate accounts for dev/prod

---

## Production Checklist

Before going live:

- [ ] Domain verified with email provider
- [ ] SPF, DKIM, DMARC records configured
- [ ] Environment variables set in production
- [ ] Sender email using custom domain
- [ ] Webhook URL configured in Razorpay
- [ ] Test all email templates
- [ ] Monitor email delivery in provider dashboard
- [ ] Set up alerts for failed emails

---

## Email Templates Overview

### Payment Confirmation
**When**: After successful payment verification
**To**: Customer who made the payment
**Contains**: Payment details, tier purchased, order ID, transaction date

### Welcome Email
**When**: New user registration
**To**: New user
**Contains**: Welcome message, feature overview, getting started links

### Email Verification
**When**: User registration or email change
**To**: User's new email address
**Contains**: Verification link (expires in 24 hours)

### Refund Notification
**When**: Refund is processed
**To**: Customer receiving refund
**Contains**: Refund amount, reason, original payment details

---

## Support

For email delivery issues:
- **Resend Support**: [resend.com/support](https://resend.com/support)
- **SendGrid Support**: [support.sendgrid.com](https://support.sendgrid.com)
- **HNWI Chronicles**: hnwi@montaigne.co

---

## Next Steps

1. Choose your email provider (Resend recommended)
2. Create account and get API key
3. Configure environment variables
4. Test payment confirmation flow
5. Set up Razorpay webhook for production
6. Monitor email delivery and adjust as needed

Your email service should now be fully configured and ready to send transactional emails!
