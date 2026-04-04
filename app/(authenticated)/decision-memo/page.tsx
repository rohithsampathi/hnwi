// =============================================================================
// DECISION MEMO PAGE
// For logged-in users: Shows War Room map dashboard with all audits
// For non-logged-in users: Vault Entry → Landing (with "Sign In" option)
// Sign-in flow: Login form → MFA → War Room
// Intake form lives at /decision-memo/intake (separate route for refresh safety)
// =============================================================================

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DecisionMemoLanding } from '@/components/decision-memo/DecisionMemoLanding';
import { VaultEntrySequence } from '@/components/assessment/VaultEntrySequence';
import { getCurrentUser } from '@/lib/auth-manager';
import { unifiedAuthManager } from '@/lib/unified-auth-manager';
import { setAuthState, ensureClientCsrfToken } from '@/lib/secure-api';
import { SessionState, setSessionState } from '@/lib/auth-utils';
import { pwaStorage } from '@/lib/storage/pwa-storage';
import { usePageTitle } from '@/hooks/use-page-title';
import { CrownLoader } from '@/components/ui/crown-loader';
import { MfaCodeInput } from '@/components/mfa-code-input';
import { Shield, Eye, EyeOff, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCastleBriefCount } from '@/lib/hooks/useCastleBriefCount';

type FlowStage = 'vault' | 'landing' | 'login';

// Module-level flag to prevent vault from showing multiple times in session
let vaultShownThisSession = false;

export default function DecisionMemoPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [flowStage, setFlowStage] = useState<FlowStage>(() => {
    if (vaultShownThisSession) return 'landing';
    return 'vault';
  });
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const briefCount = useCastleBriefCount();
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMfa, setShowMfa] = useState(false);
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [rateLimitSeconds, setRateLimitSeconds] = useState<number | null>(null);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);

  usePageTitle(
    'Decision Memo',
    'Strategic intelligence for high-stakes allocation decisions'
  );

  // Check if user is logged in
  useEffect(() => {
    const user = getCurrentUser();
    setIsLoggedIn(!!(user && (user.id || user.user_id)));
  }, []);

  // Fetch opportunities for the vault map background
  useEffect(() => {
    async function fetchData() {
      try {
        const oppsRes = await fetch('/api/public/assessment/preview-opportunities?show_all=true');

        if (oppsRes.ok) {
          const data = await oppsRes.json();
          let opps = Array.isArray(data) ? data : (data.opportunities || data.data || []);
          setOpportunities(opps.filter((o: any) => o.latitude && o.longitude));
        }
      } catch {
        // Silent fail - use defaults
      }
    }
    fetchData();
  }, []);

  // Cleanup countdown on unmount
  useEffect(() => {
    return () => {
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
      }
    };
  }, []);

  // Rate limit countdown
  const startCountdown = (seconds: number) => {
    setRateLimitSeconds(seconds);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    countdownInterval.current = setInterval(() => {
      setRateLimitSeconds(prev => {
        if (prev === null || prev <= 1) {
          if (countdownInterval.current) {
            clearInterval(countdownInterval.current);
            countdownInterval.current = null;
          }
          setError(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle vault completion
  const handleVaultComplete = () => {
    vaultShownThisSession = true;
    setFlowStage('landing');
  };

  // Handle start audit — navigate to dedicated intake route
  const handleStartAudit = () => {
    router.push('/decision-memo/intake');
  };

  // Handle login submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      setAuthState(false);
      if (typeof window !== 'undefined') {
        pwaStorage.removeItemSync('userId');
        pwaStorage.removeItemSync('userObject');
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('userObject');
      }

      await ensureClientCsrfToken();
      await new Promise(resolve => setTimeout(resolve, 100));

      const result = await unifiedAuthManager.login(email, password, false);

      if (result.error && result.error.includes('rate limit')) {
        setError('Too many login attempts. Please wait.');
        startCountdown(60);
        return;
      }

      if (result.requiresMFA) {
        setMfaToken(result.mfaToken || '');
        setShowMfa(true);
      } else if (result.success && result.user) {
        sessionStorage.setItem('decision_memo_session', 'true');
        setSessionState(SessionState.AUTHENTICATED);
        // Notify providers (e.g. CrisisIntelligenceProvider) to re-fetch with fresh auth
        window.dispatchEvent(new Event('hnwi-auth-changed'));
        setIsLoggedIn(true);
      } else if (!result.success) {
        setError(result.error || 'Invalid credentials');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      if (msg.includes('Network') || msg.includes('fetch')) {
        setError('Connection error. Please check your internet.');
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle MFA verification
  const handleMfaSubmit = async (code: string) => {
    if (!mfaToken) {
      setError('Invalid session. Please try again.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await unifiedAuthManager.verifyMFA(code, mfaToken, false);

      if (result.error && result.error.includes('rate limit')) {
        setError('Too many verification attempts.');
        startCountdown(60);
        return;
      }

      if (result.success && result.user) {
        sessionStorage.setItem('decision_memo_session', 'true');
        setSessionState(SessionState.AUTHENTICATED);
        // Notify providers (e.g. CrisisIntelligenceProvider) to re-fetch with fresh auth
        window.dispatchEvent(new Event('hnwi-auth-changed'));
        setIsLoggedIn(true);
      } else if (!result.success) {
        setError(result.error || 'Invalid verification code');
      }
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle MFA resend
  const handleMfaResend = async () => {
    if (!mfaToken || isResending) return;
    setIsResending(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/mfa/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sessionToken: mfaToken }),
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || '60';
        setError('Too many resend attempts.');
        startCountdown(parseInt(retryAfter));
        return;
      }

      const data = await response.json();
      if (!data.success) {
        setError(data.error || 'Failed to resend code');
      }
    } catch {
      setError('Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  // ─── LOGGED-IN: Redirect to full War Room ────────────────────────────
  useEffect(() => {
    if (isLoggedIn) {
      router.replace('/war-room');
    }
  }, [isLoggedIn, router]);

  if (isLoggedIn) {
    return (
      <div className="w-full h-screen bg-background">
        <div className="flex items-center justify-center h-full">
          <CrownLoader size="lg" text="Entering War Room" />
        </div>
      </div>
    );
  }

  // ─── NOT LOGGED IN: Vault Entry Sequence ─────────────────────────────
  if (flowStage === 'vault') {
    return (
      <VaultEntrySequence
        onComplete={handleVaultComplete}
        briefCount={briefCount}
        opportunities={opportunities}
      />
    );
  }

  // ─── NOT LOGGED IN: Login Form ───────────────────────────────────────
  if (flowStage === 'login') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-surface border border-border rounded-xl p-8 shadow-2xl">
            {!showMfa ? (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gold/10 border border-gold/20 mb-4">
                    <Shield className="h-7 w-7 text-gold" />
                  </div>
                  <h1 className="text-xl font-bold text-foreground mb-2">
                    War Room Access
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Sign in with your credentials to view your audits
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-background border-border"
                      autoFocus
                    />
                  </div>

                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="w-full pr-10 bg-background border-border"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {error && (
                    <div className="text-sm text-red-400 bg-red-900/20 p-3 rounded-lg">
                      {error}
                      {rateLimitSeconds !== null && (
                        <div className="mt-1 text-xs text-red-500">
                          Try again in {rateLimitSeconds}s
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading || !email || !password}
                    className="w-full bg-gold hover:bg-gold/90 text-black font-semibold h-12 text-base"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        Access War Room
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gold/10 border border-gold/20 mb-4">
                    <Shield className="h-7 w-7 text-gold" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    Security Verification
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Enter the 6-digit code sent to your email
                  </p>
                </div>

                <MfaCodeInput
                  onSubmit={handleMfaSubmit}
                  onResend={handleMfaResend}
                  isLoading={isLoading}
                  isResending={isResending}
                  error={error}
                />

                <div className="mt-4 text-center">
                  <button
                    onClick={() => {
                      setShowMfa(false);
                      setMfaToken(null);
                      setError(null);
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Back to login
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Back to landing */}
          <div className="text-center mt-6">
            <button
              onClick={() => {
                setFlowStage('landing');
                setError(null);
                setShowMfa(false);
                setMfaToken(null);
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── NOT LOGGED IN: Landing Page ─────────────────────────────────────
  return (
    <div className="relative">
      <DecisionMemoLanding onContinue={handleStartAudit} />

      {/* Sign In floating button for users with credentials */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button
          onClick={() => setFlowStage('login')}
          variant="outline"
          className="border-gold/40 text-gold hover:bg-gold/10 hover:border-gold shadow-lg backdrop-blur-sm bg-surface/80"
        >
          <Shield className="h-4 w-4 mr-2" />
          Already have access? Sign in
        </Button>
      </div>
    </div>
  );
}
