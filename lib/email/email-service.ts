// lib/email/email-service.ts
// Email service for sending transactional emails

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface PaymentConfirmationData {
  tier: 'operator' | 'observer';
  amount: number;
  currency: string;
  payment_id: string;
  order_id: string;
  session_id: string;
  user_email?: string;
  transaction_date: string;
}

interface WelcomeEmailData {
  user_name: string;
  user_email: string;
  verification_url?: string;
}

interface EmailVerificationData {
  user_name: string;
  user_email: string;
  verification_url: string;
  expires_in_hours: number;
}

interface RefundNotificationData {
  user_email: string;
  refund_amount: number;
  currency: string;
  payment_id: string;
  refund_id: string;
  reason?: string;
}

// Email service configuration
const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'noreply@hnwichronicles.com',
  fromName: process.env.EMAIL_FROM_NAME || 'HNWI Chronicles',
  replyTo: process.env.EMAIL_REPLY_TO || 'support@hnwichronicles.com',
  provider: process.env.EMAIL_PROVIDER || 'resend', // 'resend', 'sendgrid', or 'smtp'
};

/**
 * Send email using configured provider
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const provider = EMAIL_CONFIG.provider;

  try {
    switch (provider) {
      case 'resend':
        return await sendWithResend(options);
      case 'sendgrid':
        return await sendWithSendGrid(options);
      case 'smtp':
        return await sendWithSMTP(options);
      default:
        return false;
    }
  } catch (error) {
    return false;
  }
}

/**
 * Send email using Resend API
 */
async function sendWithResend(options: EmailOptions): Promise<boolean> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${EMAIL_CONFIG.fromName} <${EMAIL_CONFIG.from}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || stripHtml(options.html),
        reply_to: EMAIL_CONFIG.replyTo,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return false;
    }

    const data = await response.json();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Send email using SendGrid API
 */
async function sendWithSendGrid(options: EmailOptions): Promise<boolean> {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

  if (!SENDGRID_API_KEY) {
    return false;
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: options.to }],
            subject: options.subject,
          },
        ],
        from: {
          email: EMAIL_CONFIG.from,
          name: EMAIL_CONFIG.fromName,
        },
        reply_to: {
          email: EMAIL_CONFIG.replyTo,
        },
        content: [
          {
            type: 'text/html',
            value: options.html,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Send email using SMTP (NodeMailer would be needed)
 */
async function sendWithSMTP(options: EmailOptions): Promise<boolean> {
  return false;
}

/**
 * Strip HTML tags for plain text version
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

/**
 * Send payment confirmation email
 */
export async function sendPaymentConfirmation(
  data: PaymentConfirmationData
): Promise<boolean> {
  const recipientEmail = data.user_email;

  // Don't send if no valid email
  if (!recipientEmail || !recipientEmail.includes('@') || recipientEmail.includes('example.com')) {
    return false;
  }

  const tierName = data.tier.charAt(0).toUpperCase() + data.tier.slice(1);
  const formattedAmount = `${data.currency} ${data.amount.toFixed(2)}`;

  const subject = `Payment Confirmation - ${tierName} Tier Access`;

  const html = generatePaymentConfirmationHTML({
    tierName,
    amount: formattedAmount,
    paymentId: data.payment_id,
    orderId: data.order_id,
    transactionDate: new Date(data.transaction_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  });

  return await sendEmail({
    to: recipientEmail,
    subject,
    html,
  });
}

/**
 * Generate payment confirmation email HTML
 */
function generatePaymentConfirmationHTML(data: {
  tierName: string;
  amount: string;
  paymentId: string;
  orderId: string;
  transactionDate: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #DAA520 0%, #B8860B 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Payment Confirmed</h1>
            </td>
          </tr>

          <!-- Success Icon -->
          <tr>
            <td align="center" style="padding: 30px 40px 20px 40px;">
              <div style="width: 60px; height: 60px; background-color: #10b981; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                <span style="color: #ffffff; font-size: 30px; line-height: 1;">✓</span>
              </div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Thank you for your payment! Your transaction has been processed successfully.
              </p>

              <p style="margin: 0 0 30px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                You now have lifetime access to the <strong>${data.tierName}</strong> tier features on HNWI Chronicles.
              </p>

              <!-- Transaction Details -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 6px; padding: 20px;">
                <tr>
                  <td style="padding: 15px 20px; border-bottom: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">Tier Purchased</p>
                    <p style="margin: 5px 0 0 0; color: #111827; font-size: 16px; font-weight: 600;">${data.tierName}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 20px; border-bottom: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">Amount Paid</p>
                    <p style="margin: 5px 0 0 0; color: #111827; font-size: 16px; font-weight: 600;">${data.amount}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 20px; border-bottom: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">Transaction Date</p>
                    <p style="margin: 5px 0 0 0; color: #111827; font-size: 16px;">${data.transactionDate}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 20px; border-bottom: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">Payment ID</p>
                    <p style="margin: 5px 0 0 0; color: #111827; font-size: 14px; font-family: monospace;">${data.paymentId}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 20px;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">Order ID</p>
                    <p style="margin: 5px 0 0 0; color: #111827; font-size: 14px; font-family: monospace;">${data.orderId}</p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://app.hnwichronicles.com/dashboard" style="display: inline-block; padding: 14px 30px; background-color: #DAA520; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Access Your Dashboard
                </a>
              </div>
            </td>
          </tr>

          <!-- What's Next Section -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <h2 style="margin: 0 0 15px 0; color: #111827; font-size: 20px; font-weight: 600;">What's Next?</h2>
              <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 15px; line-height: 1.8;">
                <li>Access exclusive intelligence reports and market insights</li>
                <li>View personalized opportunities mapped to your strategic profile</li>
                <li>Connect with our AI advisor, Ask Rohith, for strategic guidance</li>
                <li>Explore the Crown Vault for secure asset management</li>
              </ul>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 13px; text-align: center;">
                If you have any questions, please contact us at
                <a href="mailto:support@hnwichronicles.com" style="color: #DAA520; text-decoration: none;">support@hnwichronicles.com</a>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                © 2025 HNWI Chronicles. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
