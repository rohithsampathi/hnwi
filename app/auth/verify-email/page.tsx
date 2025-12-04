'use client';

// app/auth/verify-email/page.tsx
// Email verification landing page

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle, AlertCircle, Mail } from 'lucide-react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'expired' | 'invalid'>('verifying');
  const [message, setMessage] = useState('Verifying your email...');
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      setMessage('No verification token provided. Please check your email for the correct link.');
      return;
    }

    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(verificationToken)}`);
      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Your email has been verified successfully! Redirecting to dashboard...');

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } else {
        // Handle different error cases
        if (response.status === 404) {
          setStatus('invalid');
          setMessage('This verification link is invalid or has already been used.');
        } else if (response.status === 410) {
          setStatus('expired');
          setMessage('This verification link has expired. Please request a new verification email.');
        } else {
          setStatus('error');
          setMessage(data.message || 'Failed to verify email. Please try again.');
        }
      }
    } catch (error) {
      console.error('[Verify Email] Error:', error);
      setStatus('error');
      setMessage('An error occurred while verifying your email. Please try again later.');
    }
  };

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resendEmail || !resendEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setIsResending(true);

    try {
      // This would need to be implemented based on your user lookup logic
      // For now, showing a placeholder
      alert('Resend functionality requires additional backend integration. Please contact support at hnwi@montaigne.co');
    } catch (error) {
      console.error('[Resend Verification] Error:', error);
      alert('Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        {/* Status Icon */}
        <div className="flex justify-center mb-6">
          {status === 'verifying' && (
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
          )}
          {status === 'success' && (
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          )}
          {(status === 'error' || status === 'invalid') && (
            <XCircle className="w-16 h-16 text-red-500" />
          )}
          {status === 'expired' && (
            <AlertCircle className="w-16 h-16 text-amber-500" />
          )}
        </div>

        {/* Status Title */}
        <h1 className="text-2xl font-bold text-center mb-4 text-slate-900">
          {status === 'verifying' && 'Verifying Email'}
          {status === 'success' && 'Email Verified!'}
          {status === 'error' && 'Verification Failed'}
          {status === 'invalid' && 'Invalid Link'}
          {status === 'expired' && 'Link Expired'}
        </h1>

        {/* Status Message */}
        <p className="text-center text-slate-600 mb-6">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          {status === 'success' && (
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-[#DAA520] hover:bg-[#B8860B] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Go to Dashboard
            </button>
          )}

          {(status === 'expired' || status === 'invalid') && (
            <form onSubmit={handleResendVerification} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Enter your email to receive a new verification link:
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    id="email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DAA520] text-slate-900"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isResending}
                className="w-full bg-[#DAA520] hover:bg-[#B8860B] text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending...
                  </span>
                ) : (
                  'Send New Verification Email'
                )}
              </button>
            </form>
          )}

          {status === 'error' && (
            <button
              onClick={() => token && verifyEmail(token)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Try Again
            </button>
          )}

          {/* Back to Home Link */}
          <button
            onClick={() => router.push('/')}
            className="w-full text-slate-600 hover:text-slate-900 font-medium py-2 transition-colors"
          >
            ← Back to Home
          </button>
        </div>

        {/* Support Link */}
        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
          <p className="text-sm text-slate-600">
            Need help?{' '}
            <a
              href="mailto:hnwi@montaigne.co"
              className="text-[#DAA520] hover:text-[#B8860B] font-medium"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
