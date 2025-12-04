// lib/email/email-templates.ts
// Additional email templates for user notifications

import { sendEmail } from './email-service';

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

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
  if (!data.user_email || data.user_email.includes('example.com')) {
    console.log('[Email] Skipping welcome email - invalid email');
    return false;
  }

  const subject = 'Welcome to HNWI Chronicles';
  const html = generateWelcomeEmailHTML(data);

  return await sendEmail({
    to: data.user_email,
    subject,
    html,
  });
}

/**
 * Send email verification link
 */
export async function sendEmailVerification(data: EmailVerificationData): Promise<boolean> {
  if (!data.user_email || data.user_email.includes('example.com')) {
    console.log('[Email] Skipping verification email - invalid email');
    return false;
  }

  const subject = 'Verify Your Email Address';
  const html = generateEmailVerificationHTML(data);

  return await sendEmail({
    to: data.user_email,
    subject,
    html,
  });
}

/**
 * Send refund notification
 */
export async function sendRefundNotification(data: RefundNotificationData): Promise<boolean> {
  if (!data.user_email || data.user_email.includes('example.com')) {
    console.log('[Email] Skipping refund notification - invalid email');
    return false;
  }

  const subject = 'Refund Processed - HNWI Chronicles';
  const html = generateRefundNotificationHTML(data);

  return await sendEmail({
    to: data.user_email,
    subject,
    html,
  });
}

/**
 * Generate welcome email HTML
 */
function generateWelcomeEmailHTML(data: WelcomeEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to HNWI Chronicles</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #DAA520 0%, #B8860B 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">Welcome to HNWI Chronicles</h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 18px; line-height: 1.6;">
                Hello ${data.user_name},
              </p>

              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Welcome to HNWI Chronicles - your exclusive platform for wealth intelligence, strategic insights, and investment opportunities tailored for high-net-worth individuals.
              </p>

              <p style="margin: 0 0 30px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                You now have access to:
              </p>

              <!-- Features List -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 15px; background-color: #f9fafb; border-radius: 6px; margin-bottom: 10px;">
                    <p style="margin: 0; color: #111827; font-size: 16px; font-weight: 600;">📊 HNWI World Intelligence</p>
                    <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Real-time market movements and wealth flow patterns</p>
                  </td>
                </tr>
                <tr><td style="height: 10px;"></td></tr>
                <tr>
                  <td style="padding: 15px; background-color: #f9fafb; border-radius: 6px;">
                    <p style="margin: 0; color: #111827; font-size: 16px; font-weight: 600;">💎 Privé Exchange</p>
                    <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Exclusive investment opportunities ($100K+ minimums)</p>
                  </td>
                </tr>
                <tr><td style="height: 10px;"></td></tr>
                <tr>
                  <td style="padding: 15px; background-color: #f9fafb; border-radius: 6px;">
                    <p style="margin: 0; color: #111827; font-size: 16px; font-weight: 600;">🤖 Ask Rohith</p>
                    <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">AI advisor for strategic wealth guidance</p>
                  </td>
                </tr>
                <tr><td style="height: 10px;"></td></tr>
                <tr>
                  <td style="padding: 15px; background-color: #f9fafb; border-radius: 6px;">
                    <p style="margin: 0; color: #111827; font-size: 16px; font-weight: 600;">👑 Crown Vault</p>
                    <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Secure asset management and estate planning</p>
                  </td>
                </tr>
              </table>

              ${data.verification_url ? `
              <!-- Verification CTA -->
              <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #fef3c7; border-radius: 6px;">
                <p style="margin: 0 0 15px 0; color: #92400e; font-size: 14px; font-weight: 600;">
                  Please verify your email address to get started
                </p>
                <a href="${data.verification_url}" style="display: inline-block; padding: 14px 30px; background-color: #DAA520; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Verify Email Address
                </a>
              </div>
              ` : ''}

              <!-- Get Started CTA -->
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://app.hnwichronicles.com/dashboard" style="display: inline-block; padding: 14px 30px; background-color: #DAA520; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Access Your Dashboard
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 13px; text-align: center;">
                Need help? Contact us at
                <a href="mailto:hnwi@montaigne.co" style="color: #DAA520; text-decoration: none;">hnwi@montaigne.co</a>
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

/**
 * Generate email verification HTML
 */
function generateEmailVerificationHTML(data: EmailVerificationData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <div style="width: 80px; height: 80px; background-color: #DAA520; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <span style="color: #ffffff; font-size: 40px; line-height: 1;">✉️</span>
              </div>
              <h1 style="margin: 0; color: #111827; font-size: 28px; font-weight: bold;">Verify Your Email</h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Hello ${data.user_name},
              </p>

              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Thank you for creating an account with HNWI Chronicles. To complete your registration, please verify your email address by clicking the button below.
              </p>

              <p style="margin: 0 0 30px 0; color: #6b7280; font-size: 14px;">
                This verification link will expire in <strong>${data.expires_in_hours} hours</strong>.
              </p>

              <!-- Verification Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.verification_url}" style="display: inline-block; padding: 16px 40px; background-color: #DAA520; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 18px;">
                  Verify Email Address
                </a>
              </div>

              <!-- Alternative Link -->
              <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin: 10px 0 0 0; padding: 15px; background-color: #f9fafb; border-radius: 6px; word-break: break-all; font-size: 12px; color: #4b5563;">
                ${data.verification_url}
              </p>

              <!-- Security Note -->
              <div style="margin-top: 30px; padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">
                  🔒 Security Note
                </p>
                <p style="margin: 10px 0 0 0; color: #92400e; font-size: 13px;">
                  If you didn't create an account with HNWI Chronicles, please ignore this email or contact us at hnwi@montaigne.co.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 13px; text-align: center;">
                Questions? Contact us at
                <a href="mailto:hnwi@montaigne.co" style="color: #DAA520; text-decoration: none;">hnwi@montaigne.co</a>
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

/**
 * Generate refund notification HTML
 */
function generateRefundNotificationHTML(data: RefundNotificationData): string {
  const formattedAmount = `${data.currency} ${data.refund_amount.toFixed(2)}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Refund Processed</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <div style="width: 60px; height: 60px; background-color: #3b82f6; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <span style="color: #ffffff; font-size: 30px; line-height: 1;">↩️</span>
              </div>
              <h1 style="margin: 0; color: #111827; font-size: 28px; font-weight: bold;">Refund Processed</h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Your refund has been processed successfully. The amount will be credited to your original payment method within 5-10 business days.
              </p>

              <!-- Refund Details -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 6px; padding: 20px; margin: 30px 0;">
                <tr>
                  <td style="padding: 15px 20px; border-bottom: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">Refund Amount</p>
                    <p style="margin: 5px 0 0 0; color: #111827; font-size: 18px; font-weight: 600;">${formattedAmount}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 20px; border-bottom: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">Original Payment ID</p>
                    <p style="margin: 5px 0 0 0; color: #111827; font-size: 14px; font-family: monospace;">${data.payment_id}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 20px;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">Refund ID</p>
                    <p style="margin: 5px 0 0 0; color: #111827; font-size: 14px; font-family: monospace;">${data.refund_id}</p>
                  </td>
                </tr>
                ${data.reason ? `
                <tr>
                  <td style="padding: 15px 20px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">Reason</p>
                    <p style="margin: 5px 0 0 0; color: #111827; font-size: 14px;">${data.reason}</p>
                  </td>
                </tr>
                ` : ''}
              </table>

              <!-- Important Info -->
              <div style="padding: 20px; background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 6px;">
                <p style="margin: 0 0 10px 0; color: #1e40af; font-size: 14px; font-weight: 600;">
                  ℹ️ What Happens Next?
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 14px; line-height: 1.6;">
                  <li>The refund will appear in your account within 5-10 business days</li>
                  <li>You may see it as a credit from "HNWI Chronicles" or "Razorpay"</li>
                  <li>If you don't see it after 10 days, please contact your bank</li>
                </ul>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 13px; text-align: center;">
                Questions about your refund? Contact us at
                <a href="mailto:hnwi@montaigne.co" style="color: #DAA520; text-decoration: none;">hnwi@montaigne.co</a>
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
