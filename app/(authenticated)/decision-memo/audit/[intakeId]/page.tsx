// =============================================================================
// SFO PATTERN AUDIT - SHAREABLE PREVIEW PAGE
// For SFO internal approval before payment
// Route: /decision-memo/audit/[intakeId]
// =============================================================================

"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FileText,
  Clock,
  Lock,
  CheckCircle,
  Share2,
  Download,
  ArrowRight,
  ArrowLeft,
  Shield,
  Copy,
  Check,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { CrownLoader } from '@/components/ui/crown-loader';
import { PreviewArtifactDisplay } from '@/components/decision-memo/pattern-audit/PreviewArtifactDisplay';
import { ArtifactDisplay } from '@/components/decision-memo/pattern-audit/ArtifactDisplay';
import { PatternAuditWaitingInteractive } from '@/components/decision-memo/PatternAuditWaitingInteractive';
import { usePatternAudit, ReportAuthRequiredError } from '@/lib/hooks/usePatternAudit';
import { useDecisionMemoSSE } from '@/lib/hooks/useDecisionMemoSSE';
import { ReportAuthPopup } from '@/components/report-auth-popup';
import {
  AuditSession,
  PreviewArtifact,
  ICArtifact
} from '@/lib/decision-memo/pattern-audit-types';
import Link from 'next/link';

// Simulation template components (premium UI)
import { MemoHeader } from '@/components/decision-memo/memo/MemoHeader';
import { Page1TaxDashboard } from '@/components/decision-memo/memo/Page1TaxDashboard';
import { Page2AuditVerdict } from '@/components/decision-memo/memo/Page2AuditVerdict';
import { Page3PeerIntelligence } from '@/components/decision-memo/memo/Page3PeerIntelligence';
import { TransparencyRegimeSection } from '@/components/decision-memo/memo/TransparencyRegimeSection';
import { CrisisResilienceSection } from '@/components/decision-memo/memo/CrisisResilienceSection';
import { RegimeIntelligenceSection } from '@/components/decision-memo/memo/RegimeIntelligenceSection';
// SFO-Grade Expert Sections (Experts 13-15)
import { WealthProjectionSection } from '@/components/decision-memo/memo/WealthProjectionSection';
import { ScenarioTreeSection } from '@/components/decision-memo/memo/ScenarioTreeSection';
import { HeirManagementSection } from '@/components/decision-memo/memo/HeirManagementSection';
// Golden Visa / Investment Migration Section
import { GoldenVisaSection } from '@/components/decision-memo/memo/GoldenVisaSection';
// Enhanced Golden Visa Intelligence (from KGv3)
import { GoldenVisaIntelligenceSection } from '@/components/decision-memo/memo/GoldenVisaIntelligenceSection';
// HNWI Migration Trends Section
import { HNWITrendsSection } from '@/components/decision-memo/memo/HNWITrendsSection';
// Real Asset Audit Intelligence Section (KGv3-verified)
import { RealAssetAuditSection } from '@/components/decision-memo/memo/RealAssetAuditSection';
// Cross-Border Tax Audit (US Worldwide Taxation Analysis)
import { CrossBorderTaxAudit } from '@/components/decision-memo/memo/CrossBorderTaxAudit';
// Structure Comparison Matrix (MCP CORE OUTPUT)
import { StructureComparisonMatrix } from '@/components/decision-memo/memo/StructureComparisonMatrix';
// PDF Cover and Last Pages
import { MemoCoverPage } from '@/components/decision-memo/memo/MemoCoverPage';
import { MemoLastPage } from '@/components/decision-memo/memo/MemoLastPage';
// Awe Visual Elements — Risk Radar, Liquidity Trap, Peer Benchmarking
import { RiskRadarChart } from '@/components/decision-memo/memo/RiskRadarChart';
import { LiquidityTrapFlowchart } from '@/components/decision-memo/memo/LiquidityTrapFlowchart';
import { PeerBenchmarkTicker } from '@/components/decision-memo/memo/PeerBenchmarkTicker';
import { transformICArtifactToMemoData } from '@/lib/decision-memo/sfo-to-memo-transformer';
import { assembleCrossBorderAudit } from '@/lib/decision-memo/assemble-cross-border-audit';
import { Opportunity, ViaNegativaContext } from '@/lib/decision-memo/memo-types';
import { useCitationPanel } from '@/contexts/elite-citation-panel-context';
import { parseDevCitations, CitationMap } from '@/lib/parse-dev-citations';

interface PageProps {
  params: {
    intakeId: string;
  };
}

type AuditTier = 'single' | 'annual';

const TIER_CONFIG = {
  single: {
    name: 'Single Audit',
    price: 5000,
    priceDisplay: '$5,000',
    description: 'One-time decision posture audit',
    features: [
      'Full IC-ready artifact',
      'PDF export',
      'Pattern matching against 1,875 developments',
      '48-hour SLA'
    ]
  },
  annual: {
    name: 'Annual Architect',
    price: 25000,
    priceDisplay: '$25,000',
    description: '10 audits + HNWI Chronicles Architect Tier',
    features: [
      '10 Decision Posture Audits',
      'HNWI Chronicles Architect Tier access',
      'Priority 12-hour SLA',
      'Dedicated intelligence analyst',
      'Quarterly strategy calls'
    ],
    savings: 'Save $12,500 vs single audits + Architect access'
  }
};

// Helper to format countdown
function formatCountdown(ms: number): { hours: number; minutes: number; seconds: number } {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds };
}

export default function PatternAuditPreviewPage({ params }: PageProps) {
  const { intakeId } = params;
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<AuditSession | null>(null);
  const [previewArtifact, setPreviewArtifact] = useState<PreviewArtifact | null>(null);
  const [fullArtifact, setFullArtifact] = useState<ICArtifact | null>(null);
  const [backendData, setBackendData] = useState<any>(null);  // Raw backend response with preview_data
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [selectedTier, setSelectedTier] = useState<AuditTier>('single');
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isUnlockReady, setIsUnlockReady] = useState(false);
  const [isWaitingForPreview, setIsWaitingForPreview] = useState(false);
  const isFetchingPreviewRef = useRef(false); // Track if we're already fetching to prevent duplicates
  const [hnwiWorldCount, setHnwiWorldCount] = useState<number>(1875); // HNWI World developments count

  // Report-scoped authentication
  // MFA bypass for specific demo/testing intake IDs
  const MFA_BYPASS_INTAKE_IDS = ['fo_audit_AijuqwJovDu_'];
  const isMfaBypassed = MFA_BYPASS_INTAKE_IDS.includes(intakeId);

  const [showReportAuth, setShowReportAuth] = useState(false);
  const [reportToken, setReportToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    // Bypass MFA for specific intake IDs (demo/testing)
    if (MFA_BYPASS_INTAKE_IDS.includes(intakeId)) {
      return 'mfa_bypass_token';
    }
    // Check localStorage first (remembered device), then sessionStorage
    const remembered = localStorage.getItem(`report_token_${intakeId}`);
    if (remembered) {
      const expiresAt = localStorage.getItem(`report_token_exp_${intakeId}`);
      if (expiresAt && Date.now() > parseInt(expiresAt, 10)) {
        localStorage.removeItem(`report_token_${intakeId}`);
        localStorage.removeItem(`report_token_exp_${intakeId}`);
        return null;
      }
      return remembered;
    }
    return sessionStorage.getItem(`report_token_${intakeId}`);
  });

  const {
    getSession,
    getPreviewArtifact,
    getFullArtifact,
    initiatePayment,
    checkPaymentStatus,
    exportPDF,
    shareArtifact
  } = usePatternAudit();

  // SSE connection for real-time updates
  const {
    isConnected: sseConnected,
    previewReady: ssePreviewReady
  } = useDecisionMemoSSE(isWaitingForPreview ? intakeId : null);

  // Citation panel for expanding citations when clicked
  const { openPanel: openCitationPanel } = useCitationPanel();

  // Fetch session and artifact data (with report auth token)
  const fetchData = useCallback(async (token?: string | null) => {
    const authToken = token || reportToken;
    try {
      setIsLoading(true);
      setError(null);

      // Get session status (now returns full_artifact when unlocked)
      const sessionData = await getSession(intakeId, authToken) as any;

      // Check if session includes full artifact (unlocked state)
      if (sessionData.fullArtifact) {
        setSession({ ...sessionData, status: 'PAID' });
        setFullArtifact(sessionData.fullArtifact);

        // Also store preview_data if session includes it (for peer_cohort_stats, capital_flow_data)
        // CRITICAL: Include mitigationTimeline and risk_assessment at top level for Page2AuditVerdict
        if (sessionData.preview_data) {
          setBackendData({
            preview_data: sessionData.preview_data,
            memo_data: sessionData.memo_data,
            // MCP fields from preview_data OR computed from risk counts
            mitigationTimeline: sessionData.mitigationTimeline || sessionData.preview_data?.risk_assessment?.mitigation_timeline,
            risk_assessment: sessionData.risk_assessment || sessionData.preview_data?.risk_assessment,
            all_mistakes: sessionData.all_mistakes || sessionData.preview_data?.all_mistakes
          });
        }
        setIsWaitingForPreview(false);
        return;
      }

      // Check if paid/unlocked
      const isPaid = sessionData.status === 'PAID' || sessionData.status === 'FULL_READY' || sessionData.isUnlocked;

      if (isPaid) {
        setSession({ ...sessionData, status: 'PAID' });

        // Fetch from unified endpoint - returns preview_data + MCP fields (mitigationTimeline, risk_assessment)
        try {
          const headers: Record<string, string> = {};
          if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
          const response = await fetch(`/api/decision-memo/${intakeId}`, { headers });
          if (response.status === 401) throw new ReportAuthRequiredError();
          if (response.ok) {
            const data = await response.json();
            setBackendData(data);  // Store raw response with preview_data + mitigationTimeline
            const full = await getFullArtifact(intakeId, authToken);
            setFullArtifact(full);
          } else {
            throw new Error('Artifact fetch failed');
          }
        } catch (artifactErr) {
          if (artifactErr instanceof ReportAuthRequiredError) throw artifactErr;
          console.error('Failed to fetch full artifact:', artifactErr);
          setError('Payment confirmed but artifact not available. Please contact support.');
        }
        setIsWaitingForPreview(false);
      } else if (sessionData.status === 'PREVIEW_READY') {
        // Preview is ready - fetch it
        setSession(sessionData);
        try {
          const preview = await getPreviewArtifact(intakeId, authToken);
          setPreviewArtifact(preview);
          setIsWaitingForPreview(false);
        } catch (previewErr) {
          if (previewErr instanceof ReportAuthRequiredError) throw previewErr;
          // Preview fetch failed despite status being PREVIEW_READY
          console.error('Preview fetch failed:', previewErr);
          setError('Failed to load preview. Please refresh the page.');
          setIsWaitingForPreview(false);
        }
      } else if (sessionData.status === 'PAID' || sessionData.status === 'FULL_READY') {
        setSession(sessionData);
        const full = await getFullArtifact(intakeId, authToken);
        setFullArtifact(full);
        setIsWaitingForPreview(false);
      } else {
        // Status is PROCESSING, SUBMITTED, or IN_REVIEW - wait for SSE
        setSession(sessionData);
        setIsWaitingForPreview(true);
      }
    } catch (err) {
      if (err instanceof ReportAuthRequiredError) {
        // Report requires authentication — show the login popup (unless bypassed)
        if (!MFA_BYPASS_INTAKE_IDS.includes(intakeId)) {
          setShowReportAuth(true);
          setIsLoading(false);
          return;
        }
        // For bypassed intakes, continue without auth
      }
      console.error('Error fetching audit data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load audit');
    } finally {
      setIsLoading(false);
    }
  }, [intakeId, reportToken, getSession, getPreviewArtifact, getFullArtifact]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch HNWI World developments count
  useEffect(() => {
    fetch('/api/developments/counts')
      .then(res => res.json())
      .then(data => {
        const count = data.developments?.total_count || data.total || data.count || 1875;
        setHnwiWorldCount(count);
      })
      .catch(() => {}); // Silently fail, use default
  }, []);

  // When SSE signals preview is ready, fetch from backend
  // Always fetch to ensure proper snake_case → camelCase transformation
  // IMPORTANT: Only set isWaitingForPreview(false) AFTER preview is fetched successfully
  useEffect(() => {
    if (ssePreviewReady && isWaitingForPreview && !isFetchingPreviewRef.current) {
      isFetchingPreviewRef.current = true; // Prevent duplicate fetches

      getPreviewArtifact(intakeId, reportToken)
        .then((preview) => {
          setPreviewArtifact(preview);
          setSession(prev => prev ? { ...prev, status: 'PREVIEW_READY' } : null);
          setIsWaitingForPreview(false); // Only set after successful fetch
        })
        .catch((err) => {
          if (err instanceof ReportAuthRequiredError && !MFA_BYPASS_INTAKE_IDS.includes(intakeId)) {
            setShowReportAuth(true);
            return;
          }
          console.error('Failed to fetch preview after SSE signal:', err);
          setError('Failed to load preview');
          setIsWaitingForPreview(false); // Also set on error to show error state
        })
        .finally(() => {
          isFetchingPreviewRef.current = false;
        });
    }
  }, [ssePreviewReady, isWaitingForPreview, intakeId, getPreviewArtifact]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Countdown timer for 48-hour SLA
  // Uses backend-provided unlockAt and isUnlocked - no fallbacks
  useEffect(() => {
    // If backend says already unlocked, skip countdown
    if (session?.isUnlocked) {
      setTimeRemaining(0);
      setIsUnlockReady(true);
      return;
    }

    // Must have unlockAt from backend
    if (!session?.unlockAt) {
      return; // No unlock time from backend yet
    }

    const unlockTime = new Date(session.unlockAt).getTime();

    const updateCountdown = () => {
      const now = Date.now();
      const remaining = unlockTime - now;

      if (remaining <= 0) {
        setTimeRemaining(0);
        setIsUnlockReady(true);
      } else {
        setTimeRemaining(remaining);
        setIsUnlockReady(false);
      }
    };

    // Initial update
    updateCountdown();

    // Update every second
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [session?.unlockAt, session?.isUnlocked]);

  // Handle payment
  const handlePayment = useCallback(async () => {
    setIsProcessingPayment(true);

    try {
      // Pass selected tier to payment initiation
      const data = await initiatePayment(intakeId, {
        tier: selectedTier,
        amount: TIER_CONFIG[selectedTier].price
      }) as any;

      // Handle already paid case - fetch full artifact directly
      if (data.already_paid) {
        try {
          const artifact = await getFullArtifact(intakeId);
          setFullArtifact(artifact);
          setSession(prev => prev ? { ...prev, status: 'PAID' } : null);
          setIsProcessingPayment(false);
        } catch (artifactErr) {
          console.error('Failed to fetch full artifact:', artifactErr);
          // Fallback to reload
          window.location.reload();
        }
        return;
      }

      const { order_id, amount, currency, key } = data;

      if (!key) {
        throw new Error(`Missing Razorpay key in response. Got: ${JSON.stringify(data)}`);
      }

      const tierName = selectedTier === 'annual' ? 'Annual Architect Package' : 'Single Audit';
      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: 'HNWI Chronicles',
        description: `SFO Pattern Audit - ${tierName}`,
        order_id: order_id,
        handler: async function (response: any) {
          // Verify payment
          const verifyResponse = await fetch('/api/decision-memo/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              intake_id: intakeId,
              product: 'sfo_pattern_audit',
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
              signature: response.razorpay_signature
            }),
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            // Refresh to show full artifact
            window.location.reload();
          } else {
            alert('Payment verification failed. Please contact support.');
            setIsProcessingPayment(false);
          }
        },
        theme: {
          color: '#000000'
        },
        modal: {
          ondismiss: function() {
            setIsProcessingPayment(false);
          }
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ [Payment] Failed:', errorMessage, error);
      alert(`Payment error: ${errorMessage}`);
      setIsProcessingPayment(false);
    }
  }, [intakeId, initiatePayment, selectedTier]);

  // Copy share link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // Fallback for browsers/contexts where clipboard API is unavailable
      const textarea = document.createElement('textarea');
      textarea.value = window.location.href;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // Export PDF - Uses native PDF generation via @react-pdf/renderer
  // Uses the EXACT same memoData building logic as the web UI (lines 834-900)
  const handleExportPDF = async () => {
    if (!fullArtifact) return;

    try {
      setIsExportingPDF(true);

      // Build COMPLETE memoData exactly like the web UI does (same as lines 834-900)
      // This ensures PDF shows the same data as web UI
      let pdfMemoData;

      if (backendData?.preview_data) {
        // Merge expert analysis sections from memo_data into preview_data if not already present
        const previewData = { ...backendData.preview_data };

        // Check root level of backendData for expert sections
        if (!previewData.transparency_regime_impact) {
          previewData.transparency_regime_impact = backendData.memo_data?.transparency_regime_impact ||
                                                    (backendData as any).transparency_regime_impact;
        }
        if (!previewData.crisis_resilience_stress_test) {
          previewData.crisis_resilience_stress_test = backendData.memo_data?.crisis_resilience_stress_test ||
                                                       (backendData as any).crisis_resilience_stress_test;
        }

        // SFO-Grade Expert Data (Experts 13-15)
        if (!previewData.heir_management_data || Object.keys(previewData.heir_management_data || {}).length === 0) {
          previewData.heir_management_data = backendData.memo_data?.heir_management_data ||
                                              backendData.full_artifact?.heir_management_data ||
                                              (backendData as any).heir_management_data;
          previewData.heir_management_analysis = backendData.memo_data?.heir_management_analysis ||
                                                  backendData.full_artifact?.heir_management_analysis ||
                                                  (backendData as any).heir_management_analysis;
        }
        if (!previewData.wealth_projection_data || Object.keys(previewData.wealth_projection_data || {}).length === 0) {
          previewData.wealth_projection_data = backendData.memo_data?.wealth_projection_data ||
                                                backendData.full_artifact?.wealth_projection_data ||
                                                (backendData as any).wealth_projection_data;
          previewData.wealth_projection_analysis = backendData.memo_data?.wealth_projection_analysis ||
                                                    backendData.full_artifact?.wealth_projection_analysis ||
                                                    (backendData as any).wealth_projection_analysis;
        }
        if (!previewData.scenario_tree_data || Object.keys(previewData.scenario_tree_data || {}).length === 0) {
          previewData.scenario_tree_data = backendData.memo_data?.scenario_tree_data ||
                                            backendData.full_artifact?.scenario_tree_data ||
                                            (backendData as any).scenario_tree_data;
          previewData.scenario_tree_analysis = backendData.memo_data?.scenario_tree_analysis ||
                                                backendData.full_artifact?.scenario_tree_analysis ||
                                                (backendData as any).scenario_tree_analysis;
        }

        // Golden Visa / Destination Drivers (from KGv3)
        if (!previewData.destination_drivers || !previewData.destination_drivers?.visa_programs) {
          previewData.destination_drivers = backendData.memo_data?.destination_drivers ||
                                             backendData.full_artifact?.destination_drivers ||
                                             (backendData as any).destination_drivers;
        }

        // HNWI Trends Analysis
        if (!previewData.hnwi_trends_analysis) {
          previewData.hnwi_trends_analysis = backendData.memo_data?.hnwi_trends_analysis ||
                                              backendData.full_artifact?.hnwi_trends_analysis ||
                                              (backendData as any).hnwi_trends_analysis;
        }

        // Create memo_data if it doesn't exist
        const memoDataObj = backendData.memo_data || {
          kgv3_intelligence_used: {
            precedents: fullArtifact.intelligenceSources?.developmentsMatched || 0,
            failure_modes: fullArtifact.intelligenceSources?.failurePatternsMatched || 0,
            sequencing_rules: fullArtifact.intelligenceSources?.sequencingRulesApplied || 0,
            jurisdictions: 2
          }
        };

        pdfMemoData = {
          success: true,
          intake_id: intakeId,
          generated_at: backendData.generated_at || fullArtifact.generatedAt,
          preview_data: previewData,
          memo_data: memoDataObj,
          full_memo_url: backendData.full_memo_url || ''
        };
      } else {
        // Fallback to transformation if no backend data
        pdfMemoData = transformICArtifactToMemoData(fullArtifact, intakeId);
      }

      // Call the exportPDF hook with complete memoData
      await exportPDF(pdfMemoData as any);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Share
  const handleShare = async () => {
    await handleCopyLink();
  };

  // Memoized callback for preview ready - MUST be before conditional returns (React hooks rule)
  const handlePreviewReady = useCallback(() => {
    // Check if already fetching to prevent duplicates
    if (isFetchingPreviewRef.current) {
      return;
    }

    isFetchingPreviewRef.current = true;

    // Fetch the preview when ready
    getPreviewArtifact(intakeId)
      .then((preview) => {
        setPreviewArtifact(preview);
        setSession(prev => prev ? { ...prev, status: 'PREVIEW_READY' } : null);
        setIsWaitingForPreview(false);
      })
      .catch((err) => {
        console.error('Failed to fetch preview:', err);
        setError('Failed to load preview');
        setIsWaitingForPreview(false);
      })
      .finally(() => {
        isFetchingPreviewRef.current = false;
      });
  }, [intakeId, getPreviewArtifact]);

  // Report authentication popup (encrypted document access)
  const handleReportAuthSuccess = useCallback((token: string, rememberDevice: boolean) => {
    setReportToken(token);
    if (typeof window !== 'undefined') {
      if (rememberDevice) {
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
        localStorage.setItem(`report_token_${intakeId}`, token);
        localStorage.setItem(`report_token_exp_${intakeId}`, String(Date.now() + sevenDaysMs));
        sessionStorage.removeItem(`report_token_${intakeId}`);
      } else {
        sessionStorage.setItem(`report_token_${intakeId}`, token);
        localStorage.removeItem(`report_token_${intakeId}`);
        localStorage.removeItem(`report_token_exp_${intakeId}`);
      }
    }
    setShowReportAuth(false);
    // Retry fetch with the new token
    fetchData(token);
  }, [intakeId, fetchData]);

  // Show auth popup if needed (render before all other states)
  if (showReportAuth && !isLoading) {
    return (
      <>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-foreground">Encrypted Document</h1>
            <p className="text-muted-foreground mb-6">This document is protected. Login to continue.</p>
          </div>
        </div>
        <ReportAuthPopup
          isOpen={showReportAuth}
          onClose={() => setShowReportAuth(false)}
          onSuccess={handleReportAuthSuccess}
          intakeId={intakeId}
        />
      </>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <CrownLoader
          size="lg"
          text="Loading Audit"
          subtext="Fetching your decision posture analysis..."
        />
      </div>
    );
  }

  // Waiting for preview - show interactive loader with SSE connection
  if (isWaitingForPreview) {
    return (
      <PatternAuditWaitingInteractive
        intakeId={intakeId}
        onPreviewReady={handlePreviewReady}
        sseConnected={sseConnected}
        ssePreviewReady={ssePreviewReady}
      />
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-4 text-foreground">Audit Not Found</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link
            href="/decision-memo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Start New Audit
          </Link>
        </div>
      </div>
    );
  }

  // Processing state (SUBMITTED, IN_REVIEW, or PROCESSING)
  if (session?.status === 'SUBMITTED' || session?.status === 'IN_REVIEW' || session?.status === 'PROCESSING') {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-xl border-b border-border">
          <div className="max-w-4xl mx-auto px-1 sm:px-6">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">HC</span>
                </div>
                <div>
                  <p className="text-foreground font-semibold">Pattern Audit</p>
                  <p className="text-muted-foreground text-xs">In Progress</p>
                </div>
              </div>
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted flex items-center gap-2"
              >
                {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {linkCopied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>

        {/* Processing Content */}
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <Clock className="absolute inset-0 m-auto w-10 h-10 text-primary" />
            </div>

            <h1 className="text-3xl font-bold text-foreground mb-4">
              Decision Posture Audit in Progress
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Our intelligence systems are analyzing your decision thesis against 1,875 wealth developments and failure patterns.
            </p>

            <div className="bg-card border border-border rounded-2xl p-6 mb-8">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-left">
                  <p className="text-muted-foreground">Status</p>
                  <p className="text-foreground font-medium flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    {session.status === 'IN_REVIEW' ? 'Under Expert Review' : 'Processing'}
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-muted-foreground">Submitted</p>
                  <p className="text-foreground font-medium">
                    {new Date(session.submittedAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-muted-foreground">Expected Completion</p>
                  <p className="text-foreground font-medium">Within 48 hours</p>
                </div>
                <div className="text-left">
                  <p className="text-muted-foreground">Price</p>
                  <p className="text-foreground font-medium">${session.price?.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <p className="text-sm text-foreground mb-2">
                <span className="font-semibold">Share this link for internal approval</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Forward to your family office or advisors. They'll see the preview once generated.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Preview Ready state
  if (session?.status === 'PREVIEW_READY' && previewArtifact) {
    return (
      <div className="min-h-screen bg-background">
        {/* Processing Payment Overlay */}
        {isProcessingPayment && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <CrownLoader
              size="lg"
              text="Processing Payment"
              subtext="Please complete the payment..."
            />
          </div>
        )}

        {/* Header */}
        <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-xl border-b border-border">
          <div className="max-w-5xl mx-auto px-1 sm:px-6">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">HC</span>
                </div>
                <div>
                  <p className="text-foreground font-semibold">Pattern Audit</p>
                  <p className="text-muted-foreground text-xs">Preview Ready</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Preview Mode
                </span>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted flex items-center gap-2"
                >
                  {linkCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Content */}
        <div className="max-w-4xl mx-auto px-1 sm:px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Preview Artifact Display */}
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
              <PreviewArtifactDisplay preview={previewArtifact} />
            </div>

            {/* Payment CTA with Tier Selection */}
            <div className="mt-8 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 rounded-2xl p-6 sm:p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Unlock Full IC Artifact
                </h3>
                <p className="text-muted-foreground">
                  Select your tier to unlock complete sequence details, failure mechanisms, and pattern analysis
                </p>
              </div>

              {/* Tier Selection */}
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {/* Single Audit Tier */}
                <button
                  onClick={() => setSelectedTier('single')}
                  className={`
                    relative p-5 rounded-xl border-2 text-left transition-all
                    ${selectedTier === 'single'
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:border-primary/50'
                    }
                  `}
                >
                  {selectedTier === 'single' && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <p className="font-semibold text-foreground mb-1">{TIER_CONFIG.single.name}</p>
                  <p className="text-2xl font-bold text-foreground mb-2">{TIER_CONFIG.single.priceDisplay}</p>
                  <p className="text-xs text-muted-foreground mb-3">{TIER_CONFIG.single.description}</p>
                  <div className="space-y-1.5">
                    {TIER_CONFIG.single.features.slice(0, 3).map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </button>

                {/* Annual Architect Tier */}
                <button
                  onClick={() => setSelectedTier('annual')}
                  className={`
                    relative p-5 rounded-xl border-2 text-left transition-all
                    ${selectedTier === 'annual'
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:border-primary/50'
                    }
                  `}
                >
                  {selectedTier === 'annual' && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <div className="absolute -top-2 left-4">
                    <span className="px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider rounded">
                      Best Value
                    </span>
                  </div>
                  <p className="font-semibold text-foreground mb-1">{TIER_CONFIG.annual.name}</p>
                  <p className="text-2xl font-bold text-foreground mb-2">{TIER_CONFIG.annual.priceDisplay}</p>
                  <p className="text-xs text-muted-foreground mb-3">{TIER_CONFIG.annual.description}</p>
                  <div className="space-y-1.5">
                    {TIER_CONFIG.annual.features.slice(0, 3).map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                  {TIER_CONFIG.annual.savings && (
                    <p className="mt-3 text-[10px] text-primary font-medium">{TIER_CONFIG.annual.savings}</p>
                  )}
                </button>
              </div>

              {/* What's Included */}
              <div className="bg-card/50 rounded-lg p-4 mb-6">
                <p className="text-xs font-medium text-foreground mb-3">Full artifact includes:</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {[
                    'Executive verdict with rationale',
                    'Execution sequence with owners',
                    'Failure mode mechanisms',
                    'Pattern anchors with confidence',
                    'Concrete next steps (7-21 days)',
                    'Exportable PDF for IC'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Countdown Timer or Unlock Button */}
              {!isUnlockReady ? (
                <div className="text-center">
                  {/* Countdown Display */}
                  <div className="bg-muted/50 rounded-xl p-6 mb-4">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Clock className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium text-foreground">Full Artifact Available In</span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      {(() => {
                        const { hours, minutes, seconds } = formatCountdown(timeRemaining);
                        return (
                          <>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-foreground tabular-nums">
                                {String(hours).padStart(2, '0')}
                              </div>
                              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Hours</div>
                            </div>
                            <div className="text-2xl font-bold text-muted-foreground">:</div>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-foreground tabular-nums">
                                {String(minutes).padStart(2, '0')}
                              </div>
                              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Min</div>
                            </div>
                            <div className="text-2xl font-bold text-muted-foreground">:</div>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-foreground tabular-nums">
                                {String(seconds).padStart(2, '0')}
                              </div>
                              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Sec</div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                      Our intelligence systems are analyzing your decision thesis against 1,875 wealth developments.
                    </p>
                  </div>

                  {/* Disabled Button */}
                  <button
                    disabled
                    className="w-full py-4 px-6 bg-muted text-muted-foreground
                               font-bold text-lg rounded-xl flex items-center justify-center gap-2
                               cursor-not-allowed"
                  >
                    <Lock className="w-5 h-5" />
                    Unlock Available After Analysis
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={handlePayment}
                    disabled={isProcessingPayment}
                    className="w-full py-4 px-6 bg-primary hover:bg-primary/90 text-primary-foreground
                               font-bold text-lg rounded-xl flex items-center justify-center gap-2
                               shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
                  >
                    Unlock Full Memo • {TIER_CONFIG[selectedTier].priceDisplay}
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4" />
                    Secure payment via Razorpay
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Full Artifact state (PAID or FULL_READY) - Uses simulation template UI
  if ((session?.status === 'PAID' || session?.status === 'FULL_READY') && fullArtifact) {
    // Use backend preview_data directly if available (has real command_centre opportunities)
    // Fall back to transformation only if backendData not available
    let memoData;
    // Check if we have preview_data (memo_data may not exist, that's okay)
    if (backendData?.preview_data) {
      // Merge expert analysis sections from memo_data into preview_data if not already present
      const previewData = { ...backendData.preview_data };

      // ══════════════════════════════════════════════════════════════════════════
      // MERGE EXPERT DATA FROM BACKEND (Experts 7-15)
      // Backend may store in preview_data, memo_data, or at root level
      // ══════════════════════════════════════════════════════════════════════════

      // Expert 7: Transparency Regime
      if (!previewData.transparency_regime_impact) {
        previewData.transparency_regime_impact = backendData.memo_data?.transparency_regime_impact ||
                                                  backendData.transparency_regime_impact;
      }
      if (!previewData.transparency_data) {
        previewData.transparency_data = backendData.memo_data?.transparency_data ||
                                         backendData.transparency_data;
      }

      // Expert 8: Crisis Resilience
      if (!previewData.crisis_resilience_stress_test) {
        previewData.crisis_resilience_stress_test = backendData.memo_data?.crisis_resilience_stress_test ||
                                                     backendData.crisis_resilience_stress_test;
      }
      if (!previewData.crisis_data) {
        previewData.crisis_data = backendData.memo_data?.crisis_data ||
                                   backendData.crisis_data;
      }

      // Expert 9: Peer Intelligence
      if (!previewData.peer_intelligence_analysis) {
        previewData.peer_intelligence_analysis = backendData.memo_data?.peer_intelligence_analysis ||
                                                  backendData.peer_intelligence_analysis;
      }
      if (!previewData.peer_intelligence_data) {
        previewData.peer_intelligence_data = backendData.memo_data?.peer_intelligence_data ||
                                              backendData.peer_intelligence_data;
      }

      // Expert 10: Market Dynamics
      if (!previewData.market_dynamics_analysis) {
        previewData.market_dynamics_analysis = backendData.memo_data?.market_dynamics_analysis ||
                                                backendData.market_dynamics_analysis;
      }
      if (!previewData.market_dynamics_data) {
        previewData.market_dynamics_data = backendData.memo_data?.market_dynamics_data ||
                                            backendData.market_dynamics_data;
      }

      // Expert 11: Implementation Roadmap
      if (!previewData.implementation_roadmap_data) {
        previewData.implementation_roadmap_data = backendData.memo_data?.implementation_roadmap_data ||
                                                   backendData.implementation_roadmap_data;
      }

      // Expert 12: Due Diligence
      if (!previewData.due_diligence_data) {
        previewData.due_diligence_data = backendData.memo_data?.due_diligence_data ||
                                          backendData.due_diligence_data;
      }

      // HNWI Trends
      if (!previewData.hnwi_trends_analysis) {
        previewData.hnwi_trends_analysis = backendData.memo_data?.hnwi_trends_analysis ||
                                            backendData.hnwi_trends_analysis;
      }

      // Risk Assessment (MCP fields from unified endpoint)
      if (!previewData.risk_assessment && backendData.risk_assessment) {
        previewData.risk_assessment = backendData.risk_assessment;
      }

      // All Mistakes (with cost_numeric from unified endpoint)
      if (backendData.all_mistakes && backendData.all_mistakes.length > 0) {
        previewData.all_mistakes = backendData.all_mistakes;
      }

      // SFO-Grade Expert Data (Experts 13-15)
      // Merge from memo_data, full_artifact, or root level if not in preview_data
      // Backend may store in different locations depending on response format
      if (!previewData.heir_management_data || Object.keys(previewData.heir_management_data).length === 0) {
        previewData.heir_management_data = backendData.memo_data?.heir_management_data ||
                                            backendData.full_artifact?.heir_management_data ||
                                            backendData.heir_management_data;
        previewData.heir_management_analysis = backendData.memo_data?.heir_management_analysis ||
                                                backendData.full_artifact?.heir_management_analysis ||
                                                backendData.heir_management_analysis;
      }
      if (!previewData.wealth_projection_data || Object.keys(previewData.wealth_projection_data).length === 0) {
        previewData.wealth_projection_data = backendData.memo_data?.wealth_projection_data ||
                                              backendData.full_artifact?.wealth_projection_data ||
                                              backendData.wealth_projection_data;
        previewData.wealth_projection_analysis = backendData.memo_data?.wealth_projection_analysis ||
                                                  backendData.full_artifact?.wealth_projection_analysis ||
                                                  backendData.wealth_projection_analysis;
      }
      if (!previewData.scenario_tree_data || Object.keys(previewData.scenario_tree_data).length === 0) {
        previewData.scenario_tree_data = backendData.memo_data?.scenario_tree_data ||
                                          backendData.full_artifact?.scenario_tree_data ||
                                          backendData.scenario_tree_data;
        previewData.scenario_tree_analysis = backendData.memo_data?.scenario_tree_analysis ||
                                              backendData.full_artifact?.scenario_tree_analysis ||
                                              backendData.scenario_tree_analysis;
      }

      // Golden Visa / Destination Drivers (from KGv3)
      if (!previewData.destination_drivers || !previewData.destination_drivers.visa_programs) {
        previewData.destination_drivers = backendData.memo_data?.destination_drivers ||
                                           backendData.full_artifact?.destination_drivers ||
                                           backendData.destination_drivers;
      }

      // Create memo_data if it doesn't exist
      const memoDataObj = backendData.memo_data || {
        kgv3_intelligence_used: {
          precedents: fullArtifact.intelligenceSources?.developmentsMatched || 0,
          failure_modes: fullArtifact.intelligenceSources?.failurePatternsMatched || 0,
          sequencing_rules: fullArtifact.intelligenceSources?.sequencingRulesApplied || 0,
          jurisdictions: 2
        }
      };

      memoData = {
        success: true,
        intake_id: intakeId,
        generated_at: backendData.generated_at || fullArtifact.generatedAt,
        preview_data: previewData,
        memo_data: memoDataObj,
        full_memo_url: backendData.full_memo_url || ''
      };
    } else {
      memoData = transformICArtifactToMemoData(fullArtifact, intakeId);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // CROSS-BORDER TAX AUDIT: Assemble from scattered data if backend returns null
    // The backend may return cross_border_audit_summary: null while all raw tax data
    // exists in source_tax_rates, destination_tax_rates, selected_structure, real_asset_audit.
    // This normalization ensures every corridor renders the full CrossBorderTaxAudit UI.
    // ══════════════════════════════════════════════════════════════════════════
    if (
      memoData.preview_data?.wealth_projection_data?.starting_position &&
      !memoData.preview_data.wealth_projection_data.starting_position.cross_border_audit_summary
    ) {
      const assembled = assembleCrossBorderAudit(
        memoData.preview_data,
        memoData.preview_data.wealth_projection_data.starting_position,
        memoData.preview_data.real_asset_audit,
      );
      if (assembled) {
        memoData.preview_data.wealth_projection_data.starting_position.cross_border_audit_summary = assembled;
      }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // CROSS-BORDER TAX AUDIT: Determine if theoretical tax savings are valid
    // When US worldwide taxation applies, tax savings are 0% - don't show misleading comparisons
    // Jan 2026 MCP CORE: Use backend's show_tax_savings flag (driven by structure_optimization)
    // ══════════════════════════════════════════════════════════════════════════
    const crossBorderAudit = memoData.preview_data.wealth_projection_data?.starting_position?.cross_border_audit_summary;
    const hasCrossBorderAudit = !!crossBorderAudit;
    const hasUSWorldwideTax = crossBorderAudit?.compliance_flags?.includes('US_WORLDWIDE_TAXATION');

    // CRITICAL: Use backend's show_tax_savings flag as primary source of truth
    // This is set by Structure Optimization Engine when structure is not viable
    const showTheoreticalTaxSavings = memoData.preview_data.show_tax_savings !== false && !hasUSWorldwideTax;

    // ══════════════════════════════════════════════════════════════════════════
    // VIA NEGATIVA: "Crime Scene Investigation" overlay for DO_NOT_PROCEED deals
    // Same backend data, dramatically different presentation framing
    // ══════════════════════════════════════════════════════════════════════════
    const structureVerdict = memoData.preview_data.structure_optimization?.verdict;
    const isViaNegativa = structureVerdict === 'DO_NOT_PROCEED';

    let viaNegativaContext: ViaNegativaContext | undefined;
    if (isViaNegativa) {
      // Backend-driven via_negativa object (Jan 2026)
      // Contains all labels, computed values, and tone-shifted copy.
      // If absent, fall back to frontend-computed values.
      const backendVN = memoData.preview_data?.via_negativa || (memoData as any).via_negativa;

      const acquisitionAudit = crossBorderAudit?.acquisition_audit;
      const propertyValue = acquisitionAudit?.property_value || 0;
      const totalAcquisitionCost = acquisitionAudit?.total_acquisition_cost || 0;

      // Prefer backend computed values, fall back to frontend computation.
      // Use || (not ??) so that backend value of 0 falls through to local computation.
      const dayOneLossPct = backendVN?.day_one_loss_pct || acquisitionAudit?.day_one_loss_pct || 0;
      const dayOneLossAmount = backendVN?.day_one_loss_amount || (totalAcquisitionCost - propertyValue);

      let totalConfiscationExposure = backendVN?.total_regulatory_exposure ?? 0;
      if (!totalConfiscationExposure) {
        // Fallback: parse from warnings
        const warnings = crossBorderAudit?.warnings || [];
        warnings.forEach((w: string) => {
          const match = w.match(/\$[\d,]+(?:\.\d+)?/g);
          if (match) {
            match.forEach((m: string) => {
              const val = parseFloat(m.replace(/[$,]/g, ''));
              if (!isNaN(val) && val > totalConfiscationExposure) {
                totalConfiscationExposure = val;
              }
            });
          }
        });
      }

      const taxEfficiencyPassed = backendVN?.tax_efficiency_passed ?? (showTheoreticalTaxSavings && (crossBorderAudit?.total_tax_savings_pct || 0) > 0);
      const liquidityPassed = backendVN?.liquidity_passed ?? dayOneLossPct < 10;
      const structurePassed = backendVN?.structure_passed ?? false;

      // Read labels from backend, fall back to pessimistic-but-fair defaults
      const hdr = backendVN?.header;
      const sc = backendVN?.scenario_section;
      const tx = backendVN?.tax_section;
      const vs = backendVN?.verdict_section;
      const cta = backendVN?.cta;
      const metrics = backendVN?.metrics;

      viaNegativaContext = {
        isActive: true,

        // Computed values
        dayOneLoss: dayOneLossPct,
        dayOneLossAmount,
        totalConfiscationExposure,
        taxEfficiencyPassed,
        liquidityPassed,
        structurePassed,

        // Labels — backend → fallback defaults (pessimistic but fair)
        analysisPosture: backendVN?.analysis_posture || 'Via Negativa: Strengths acknowledged. Weaknesses stated without qualification.',
        badgeLabel: hdr?.badge_label || 'ELEVATED RISK',
        titlePrefix: hdr?.title_prefix || 'Capital At',
        titleHighlight: hdr?.title_highlight || 'Risk',
        noticeTitle: hdr?.notice_title || 'Elevated Risk Advisory',
        noticeBody: (hdr?.notice_body || 'Analysis of {precedentCount}+ precedents identified {dayOneLoss}% Day-One capital exposure in this corridor. The destination market may carry long-term merit, but the current ownership structure imposes acquisition costs that require careful evaluation before deployment.')
          .replace('{dayOneLoss}', dayOneLossPct.toFixed(1))
          .replace('{precedentCount}', (backendVN?.precedent_count ?? memoData.memo_data?.kgv3_intelligence_used?.precedents ?? 0).toLocaleString()),

        metricLabels: {
          capitalExposure: metrics?.[0]?.label || 'Day-One Capital Exposure',
          structureVerdict: metrics?.[1]?.label || 'Structure Verdict',
          structureVerdictValue: metrics?.[1]?.value || 'Not Recommended',
          structureVerdictDesc: metrics?.[1]?.description || 'Negative NPV across analyzed structures',
          regulatoryExposure: metrics?.[2]?.label || 'Regulatory Exposure',
          regulatoryExposureDesc: metrics?.[2]?.description || 'FBAR + compliance penalties',
        },

        scenarioHeader: sc?.header || 'Projection Audit',
        expectationLabel: sc?.expectation_label || 'Your Projection',
        actualLabel: sc?.actual_label || 'Market Data',
        commentaryTitle: sc?.commentary_title || 'Reality Gap Analysis',
        commentaryBody: sc?.commentary_body || 'Your projected returns deviate from verified market data in key areas. Where fundamentals support the thesis, they are noted above. Where projections exceed market benchmarks, the gap is flagged as a risk factor.',

        taxBadgeLabel: tx?.badge_label || 'Regulatory Exposure Analysis',
        taxTitleLine1: tx?.title_line1 || 'Regulatory',
        taxTitleLine2: tx?.title_line2 || 'Exposure',
        compliancePrefix: tx?.compliance_prefix ?? '',
        warningPrefix: tx?.warning_prefix || 'Regulatory Flag',

        verdictHeader: vs?.header || 'Structural Review',
        verdictBadgeLabel: vs?.badge_label || 'Capital Allocation Review',
        stampText: vs?.stamp_text || 'Allocation Not Recommended',
        stampSubtext: vs?.stamp_subtext || 'Key viability thresholds not met in this structure — review alternative corridors and strategies below',

        ctaHeadline: cta?.headline || 'DOES YOUR CURRENT DEAL SURVIVE THIS FILTER?',
        ctaBody: (cta?.body_template || 'This Pattern Audit identified {dayOneLoss}% Day-One capital exposure. The same engine analyzes any cross-border acquisition across 50+ jurisdictions.')
          .replace('{dayOneLoss}', dayOneLossPct.toFixed(1)),
        ctaScarcity: cta?.scarcity_text || '5 Slots Remaining — February Cycle',
        ctaButtonText: cta?.button_text || 'INITIATE RED TEAM AUDIT ($5,000)',
        ctaButtonUrl: cta?.button_url || 'https://app.hnwichronicles.com/decision-memo',
        ctaContextNote: cta?.context_note || 'For Indian Family Offices: This sample analyzes a US → Singapore corridor. The same Pattern Recognition Engine applies to India → Dubai, India → Singapore, India → Portugal, and 50+ other corridors.',
      };
    }

    // Build citation map from opportunities
    const citationMap: CitationMap = {};
    (memoData.preview_data.all_opportunities || []).forEach((opp: Opportunity) => {
      if (opp.dev_id) {
        citationMap[opp.dev_id] = {
          dev_id: opp.dev_id,
          title: opp.title,
          summary: opp.expected_return,
          source: 'Pattern Intelligence',
          date: memoData.generated_at
        };
      }
    });

    // Handle citation clicks - opens the citation panel
    const handleCitationClick = (citationId: string) => {
      // Look up citation details from citationMap
      const citationDetails = citationMap[citationId];

      openCitationPanel(
        [citationId],
        {
          title: citationDetails?.title || `Development ${citationId}`,
          description: citationDetails?.summary || 'Intelligence from HNWI World knowledge graph',
          source: 'Pattern Intelligence Analysis'
        }
      );
    };

    return (
      <div className="min-h-screen bg-background">
        {/* PDF Export Loading Overlay */}
        {isExportingPDF && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <CrownLoader
              size="lg"
              text="Generating PDF"
              subtext="Creating institutional-grade document..."
            />
          </div>
        )}

        {/* Premium Sticky Header - Hidden in PDF export */}
        <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-xl border-b border-border print:hidden">
          <div className="max-w-6xl mx-auto px-1 sm:px-6">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-primary-foreground font-bold text-sm">HC</span>
                </div>
                <div>
                  <p className="text-foreground font-semibold">HNWI Chronicles</p>
                  <p className="text-muted-foreground text-xs">
                    Ref: {intakeId.slice(7, 19).toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className={`px-3 py-1.5 text-sm border rounded-lg flex items-center gap-2 transition-colors ${
                    linkCopied
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  {linkCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  {linkCopied ? 'Copied!' : 'Share'}
                </button>
                {/* PDF export temporarily disabled */}
                {/* <button
                  onClick={handleExportPDF}
                  disabled={isExportingPDF}
                  className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50"
                >
                  {isExportingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {isExportingPDF ? 'Exporting...' : 'Export PDF'}
                </button> */}
              </div>
            </div>
          </div>
        </div>

        {/* Premium Simulation Template Content */}
        <div id="artifact-content" className="max-w-6xl mx-auto px-1 sm:px-6 py-8 sm:py-12 print:max-w-[210mm] print:px-0 print:py-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="space-y-12 sm:space-y-20"
          >
            {/* ═══════════════════════════════════════════════════════════════════════ */}
            {/* HARVARD WEALTH MANAGEMENT PSYCHOLOGY FLOW                               */}
            {/* Hook → Value → Social Proof → Risk → Opportunity → Projection → Legacy → Action */}
            {/* ═══════════════════════════════════════════════════════════════════════ */}

            {/* ══════════════════════════════════════════════════════════════════════════════ */}
            {/* PDF COVER PAGE - HNWI Chronicles Branding                                       */}
            {/* ══════════════════════════════════════════════════════════════════════════════ */}
            <MemoCoverPage
              intakeId={intakeId}
              sourceJurisdiction={memoData.preview_data.source_jurisdiction}
              destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
              generatedAt={memoData.generated_at}
              exposureClass={memoData.preview_data.exposure_class}
              totalSavings={memoData.preview_data.total_savings}
              viaNegativa={viaNegativaContext}
            />

            {/* MEMO PRELUDE - Hero opener setting the intelligence foundation */}
            <div className="mb-8">
              {/* Intelligence Basis - The Hero Opener */}
              <p className="text-base sm:text-lg text-foreground leading-relaxed mb-4">
                This audit draws on <span className="font-semibold text-primary">{hnwiWorldCount.toLocaleString()}</span> validated developments from 3 years of HNWI wealth pattern tracking, cross-referenced against <span className="font-semibold text-primary">{(memoData.memo_data?.kgv3_intelligence_used?.precedents || 754).toLocaleString()}</span> precedents specific to the {memoData.preview_data.source_jurisdiction || 'Source'}→{memoData.preview_data.destination_jurisdiction || 'Destination'} corridor. All findings are citation-backed.
              </p>

              {/* Decision Under Review - Smaller, after the prelude */}
              {fullArtifact?.thesisSummary && (
                <p className="text-sm text-muted-foreground leading-relaxed pl-4 border-l-2 border-primary/30">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground/70 block mb-1">Decision Under Audit</span>
                  {fullArtifact.thesisSummary}
                </p>
              )}
            </div>

            {/* ══════════════════════════════════════════════════════════════════════════════ */}
            {/* PHASE 1: EXECUTIVE SUMMARY (Stanford BLUF - Bottom Line Up Front)              */}
            {/* ══════════════════════════════════════════════════════════════════════════════ */}

            {/* 1. MemoHeader - Premium Header with Key Metrics (The Hook) */}
            <MemoHeader
              intakeId={intakeId}
              generatedAt={memoData.generated_at}
              exposureClass={memoData.preview_data.exposure_class}
              totalSavings={memoData.preview_data.total_savings}
              precedentCount={memoData.memo_data?.kgv3_intelligence_used?.precedents || 0}
              sourceJurisdiction={memoData.preview_data.source_jurisdiction}
              destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
              sourceTaxRates={memoData.preview_data.source_tax_rates || memoData.preview_data.tax_differential?.source}
              destinationTaxRates={memoData.preview_data.destination_tax_rates || memoData.preview_data.tax_differential?.destination}
              taxDifferential={memoData.preview_data.tax_differential}
              valueCreation={memoData.preview_data.value_creation}
              crossBorderTaxSavingsPct={crossBorderAudit?.total_tax_savings_pct}
              crossBorderComplianceFlags={crossBorderAudit?.compliance_flags}
              showTaxSavings={showTheoreticalTaxSavings}
              optimalStructure={memoData.preview_data.structure_optimization?.optimal_structure}
              verdict={memoData.preview_data.structure_optimization?.verdict}
              viaNegativa={viaNegativaContext}
            />

            {/* ══════════════════════════════════════════════════════════════════════════════ */}
            {/* AWE ELEMENT 1: SFO Capital Allocation Risk Profile (Spider Chart)                   */}
            {/* Shows the "broken shape" — asset is fine, structure is broken                     */}
            {/* ══════════════════════════════════════════════════════════════════════════════ */}
            {(() => {
              const doctrineMetadata = memoData.preview_data.scenario_tree_data?.doctrine_metadata;
              if (!doctrineMetadata) return null;

              // Build 6-axis scores from doctrine metadata + failure modes.
              // Scores are DERIVED from real backend failure_modes data.
              // Each failure mode is mapped to the dimension(s) it affects.
              const failureModes = doctrineMetadata.failure_modes || [];
              const totalFailures = failureModes.length;
              const assessment = doctrineMetadata.antifragility_assessment || '';

              // Baseline: for vetoed deals (RUIN_EXPOSED / FRAGILE) start lower.
              // For passing deals start at 7. This ensures the shape looks broken for vetoed deals.
              const isRuinExposed = assessment === 'RUIN_EXPOSED';
              const isFrag = assessment === 'FRAGILE';
              const baseline = isViaNegativa ? (isRuinExposed ? 3 : isFrag ? 4 : 5) : 7;

              // Score calculation: start at baseline, deduct for matching failure modes,
              // but also boost slightly for non-matching (max +1) to create the "jagged" shape
              function calcScore(keywords: string[]): number {
                let score = baseline;
                let matched = false;
                failureModes.forEach((f: any) => {
                  const mode = (f.mode || '').toUpperCase();
                  const desc = (f.description || '').toUpperCase();
                  const book = (f.doctrine_book || '').toUpperCase();
                  const sev = (f.severity || '').toUpperCase();
                  const allText = `${mode} ${desc} ${book}`;
                  if (keywords.some(k => allText.includes(k))) {
                    matched = true;
                    score -= sev === 'CRITICAL' ? 4 : sev === 'HIGH' ? 3 : sev === 'MEDIUM' ? 2 : 1;
                  }
                });
                // Unmatched dimensions get a slight bump to create contrast
                if (!matched && isViaNegativa) score += 1;
                return Math.max(0, Math.min(10, score));
              }

              // Antifragility: use backend score if available, else derive
              const antifragilityScore = doctrineMetadata.antifragility_score != null
                ? Math.round(doctrineMetadata.antifragility_score / 10)
                : calcScore(['ANTIFRAGIL', 'FRAGIL', 'RUIN', 'STRESS', 'CRISIS', 'RESILIEN', 'SHOCK']);

              // Liquidity: ABSD, stamp duty, exit barriers, lock-in
              const liquidityScore = calcScore(['LIQUID', 'PRISON', 'TRAP', 'LOCK', 'EXIT', 'ABSD', 'STAMP', 'BARRIER', 'FROZEN', 'ILLIQUID', 'FOREIGN_OWNER', 'ACQUISITION']);

              // Regulatory: compliance, FBAR, FATCA, PFIC, tax drag, penalties
              const regulatoryScore = calcScore(['REGULAT', 'COMPLIANCE', 'FBAR', 'FATCA', 'PFIC', 'TAX_DRAG', 'PENALTY', 'REPORT', 'FILING', 'SANCTION', 'WORLDWIDE', 'DRAGNET']);

              // Asset quality: only deduct if the asset itself is problematic
              // If no asset-specific failures, score stays HIGH — "the asset is fine"
              const assetKeywords = ['ASSET_QUALITY', 'OVERVAL', 'BUBBLE', 'DEPRECIAT', 'DEFECT', 'TITLE'];
              const assetRaw = calcScore(assetKeywords);
              const hasAssetFailures = failureModes.some((f: any) =>
                assetKeywords.some(k => ((f.mode || '') + ' ' + (f.description || '')).toUpperCase().includes(k))
              );
              const finalAssetScore = hasAssetFailures ? assetRaw : Math.min(10, Math.max(8, baseline + 3));

              // Operator alignment: behavioral bias, decision quality, hallucination
              const operatorScore = calcScore(['OPERATOR', 'BEHAVIO', 'DECISION', 'BIAS', 'KAHNEMAN', 'HALLUCIN', 'DELUSION', 'EXPECT', 'PROJEC', 'OVERCONFID']);

              // Valuation reality: NPV, cost destruction, day-one loss, pricing
              const valuationScore = calcScore(['VALUATION', 'PRICE', 'COST', 'NPV', 'NEGATIVE', 'OVERVAL', 'DAY_ONE', 'CAPITAL_DESTROY', 'LOSS', 'PREMIUM', 'SURCHARGE', 'OVERPAY']);

              const scores = [
                { label: 'Antifragility', shortLabel: 'Antifragile', score: antifragilityScore, maxScore: 10 },
                { label: 'Liquidity', shortLabel: 'Liquidity', score: liquidityScore, maxScore: 10 },
                { label: 'Regulatory', shortLabel: 'Regulatory', score: regulatoryScore, maxScore: 10 },
                { label: 'Asset Quality', shortLabel: 'Asset', score: finalAssetScore, maxScore: 10 },
                { label: 'Operator', shortLabel: 'Operator', score: operatorScore, maxScore: 10 },
                { label: 'Valuation', shortLabel: 'Valuation', score: valuationScore, maxScore: 10 },
              ];

              return (
                <section>
                  <RiskRadarChart
                    scores={scores}
                    antifragilityAssessment={doctrineMetadata.antifragility_assessment}
                    failureModeCount={doctrineMetadata.failure_mode_count}
                    totalRiskFlags={doctrineMetadata.risk_flags_total}
                    isVetoed={isViaNegativa}
                  />
                </section>
              );
            })()}

            {/* ══════════════════════════════════════════════════════════════════════════════ */}
            {/* PHASE 1B: RISK ASSESSMENT (Position 2 — always shown)                           */}
            {/* ══════════════════════════════════════════════════════════════════════════════ */}

            {/* 2. Risk Assessment & Verdict - Executive Summary (BLUF) */}
            <section>
              <Page2AuditVerdict
                mistakes={backendData?.all_mistakes || memoData.preview_data.all_mistakes}
                opportunitiesCount={memoData.preview_data.opportunities_count}
                precedentCount={memoData.memo_data?.kgv3_intelligence_used?.precedents || 0}
                ddChecklist={memoData.preview_data.dd_checklist}
                sourceJurisdiction={memoData.preview_data.source_jurisdiction}
                destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
                dataQuality={memoData.preview_data.peer_cohort_stats?.data_quality}
                dataQualityNote={memoData.preview_data.peer_cohort_stats?.data_quality_note}
                mitigationTimeline={backendData?.mitigationTimeline || backendData?.risk_assessment?.mitigation_timeline}
                riskAssessment={backendData?.risk_assessment || memoData.preview_data.risk_assessment}
                viaNegativa={isViaNegativa ? viaNegativaContext : undefined}
              />
            </section>

            {/* ══════════════════════════════════════════════════════════════════════════════ */}
            {/* AWE ELEMENT 2: Liquidity Trap Flowchart (The Prison Diagram)                     */}
            {/* Visualizes capital being destroyed by acquisition barriers                       */}
            {/* ══════════════════════════════════════════════════════════════════════════════ */}
            {(() => {
              const acqAudit = crossBorderAudit?.acquisition_audit;
              if (!acqAudit) return null;

              const propertyValue = acqAudit.property_value || 0;
              const totalCost = acqAudit.total_acquisition_cost || 0;
              const absd = acqAudit.absd_additional_stamp_duty || 0;
              const bsd = acqAudit.bsd_stamp_duty || 0;
              const otherCosts = totalCost - propertyValue - absd - bsd;

              // Primary barrier: ABSD if present, else total stamp duties
              const hasMajorABSD = absd > 0;
              const primaryBarrierLabel = hasMajorABSD
                ? `ABSD (${((absd / propertyValue) * 100).toFixed(0)}%)`
                : `Stamp Duties`;
              const primaryBarrierCost = hasMajorABSD ? absd : (absd + bsd);

              // Secondary: US tax drag / BSD / other
              const secondaryLabel = hasMajorABSD
                ? (bsd > 0 ? `BSD + Transfer Taxes` : (hasUSWorldwideTax ? 'US Worldwide Tax Drag' : undefined))
                : (hasUSWorldwideTax ? 'US Worldwide Tax Drag' : undefined);
              const secondaryCost = hasMajorABSD
                ? (bsd > 0 ? bsd + Math.max(0, otherCosts) : 0)
                : 0;

              const capitalOut = propertyValue; // recoverable = property value only

              return (
                <section>
                  <LiquidityTrapFlowchart
                    capitalIn={totalCost}
                    capitalOut={capitalOut}
                    primaryBarrier={primaryBarrierLabel}
                    primaryBarrierCost={primaryBarrierCost}
                    secondaryBarrier={secondaryLabel}
                    secondaryBarrierCost={secondaryCost}
                    dayOneLossPct={acqAudit.day_one_loss_pct || viaNegativaContext?.dayOneLoss || 0}
                    assetLabel={`${memoData.preview_data.destination_jurisdiction || 'Destination'} Residential Property`}
                  />
                </section>
              );
            })()}

            {/* ══════════════════════════════════════════════════════════════════════════════ */}
            {/* PHASE 2: CROSS-BORDER TAX ANALYSIS                                              */}
            {/* ══════════════════════════════════════════════════════════════════════════════ */}

            {/* 3. Cross-Border Tax Audit / Confiscation Exposure (renders in both modes) */}
            {hasCrossBorderAudit && (
              <section>
                <CrossBorderTaxAudit
                  audit={crossBorderAudit}
                  sourceJurisdiction={memoData.preview_data.source_jurisdiction}
                  destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
                  viaNegativa={viaNegativaContext}
                />
              </section>
            )}

            {/* ══════════════════════════════════════════════════════════════════════════════ */}
            {/* AWE ELEMENT 3: Peer Benchmarking Ticker (The FOMO Killer)                        */}
            {/* Weaponizes precedent data to invoke "God View" of the market                     */}
            {/* ══════════════════════════════════════════════════════════════════════════════ */}
            {(() => {
              const doctrineMetadata = memoData.preview_data.scenario_tree_data?.doctrine_metadata;
              const precedentCount = memoData.memo_data?.kgv3_intelligence_used?.precedents || 0;
              if (!doctrineMetadata || !doctrineMetadata.failure_modes?.length || precedentCount === 0) return null;

              const failurePatterns = (doctrineMetadata.failure_modes || []).map((f: any) => ({
                mode: f.mode || '',
                doctrinBook: f.doctrine_book || '',
                severity: f.severity || 'MEDIUM',
                description: f.description || '',
                nightmareName: f.nightmare_name,
              }));

              return (
                <section>
                  <PeerBenchmarkTicker
                    precedentCount={precedentCount}
                    failurePatterns={failurePatterns}
                    failureModeCount={doctrineMetadata.failure_mode_count || failurePatterns.length}
                    totalRiskFlags={doctrineMetadata.risk_flags_total || 0}
                    sourceJurisdiction={memoData.preview_data.source_jurisdiction}
                    destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
                    antifragilityAssessment={doctrineMetadata.antifragility_assessment}
                    // FIX #24: Pass REAL pattern intelligence from KGv3
                    patternIntelligence={memoData.preview_data.pattern_intelligence}
                  />
                </section>
              );
            })()}

            {/* 3.5 Structure Comparison Matrix - MCP CORE OUTPUT */}
            {/* Shows all ownership structures analyzed with net benefit comparison */}
            {memoData.preview_data.structure_optimization && (
              <section>
                <StructureComparisonMatrix
                  structureOptimization={memoData.preview_data.structure_optimization}
                  sourceJurisdiction={memoData.preview_data.source_jurisdiction}
                  destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
                />
              </section>
            )}

            {/* 4. Tax Jurisdiction Analysis - Only show theoretical comparison if savings are real */}
            {showTheoreticalTaxSavings && (
              <section>
                <Page1TaxDashboard
                  totalSavings={memoData.preview_data.total_savings}
                  exposureClass={memoData.preview_data.exposure_class}
                  sourceJurisdiction={memoData.preview_data.source_jurisdiction}
                  destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
                  sourceCity={memoData.preview_data.source_city}
                  destinationCity={memoData.preview_data.destination_city}
                  executionSequence={memoData.preview_data.execution_sequence}
                  sourceTaxRates={memoData.preview_data.source_tax_rates || memoData.preview_data.tax_differential?.source}
                  destinationTaxRates={memoData.preview_data.destination_tax_rates || memoData.preview_data.tax_differential?.destination}
                  taxDifferential={memoData.preview_data.tax_differential}
                  sections={['tax']}
                />
              </section>
            )}

            {/* 5. Regime Intelligence (NHR, 13O, Special Tax Regimes) - Part of Tax Analysis */}
            {memoData.preview_data.peer_cohort_stats?.regime_intelligence?.has_special_regime && (
              <section>
                <RegimeIntelligenceSection
                  regimeIntelligence={memoData.preview_data.peer_cohort_stats.regime_intelligence}
                  sourceJurisdiction={memoData.preview_data.source_jurisdiction}
                  destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
                />
              </section>
            )}

            {/* 4. 10-Year Wealth Projection - Part of Tax/Value Analysis */}
            {(memoData.preview_data.wealth_projection_analysis ||
              (memoData.preview_data.wealth_projection_data &&
               Object.keys(memoData.preview_data.wealth_projection_data).length > 0)) && (
              <section>
                <WealthProjectionSection
                  data={memoData.preview_data.wealth_projection_data || {}}
                  rawAnalysis={memoData.preview_data.wealth_projection_analysis}
                  structures={memoData.preview_data.structure_optimization?.structures_analyzed || []}
                  structureProjections={memoData.preview_data.structure_projections || {}}
                  optimalStructureName={memoData.preview_data.structure_optimization?.optimal_structure?.name}
                />
              </section>
            )}

            {/* ══════════════════════════════════════════════════════════════════════════════ */}
            {/* PHASE 3: SOCIAL PROOF (Interest - "Others Like You Are Moving")                */}
            {/* ══════════════════════════════════════════════════════════════════════════════ */}

            {/* 6. Peer Intelligence - Drivers, Peer Analysis & Corridor (Social Proof) */}
            <section>
              <Page3PeerIntelligence
                opportunities={memoData.preview_data.all_opportunities}
                peerCount={memoData.preview_data.peer_cohort_stats?.total_peers || 0}
                onCitationClick={handleCitationClick}
                citationMap={citationMap}
                sourceJurisdiction={memoData.preview_data.source_jurisdiction}
                destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
                sourceCountry={memoData.preview_data.source_country}
                destinationCountry={memoData.preview_data.destination_country}
                sourceCity={memoData.preview_data.source_city}
                destinationCity={memoData.preview_data.destination_city}
                peerCohortStats={memoData.preview_data.peer_cohort_stats}
                capitalFlowData={memoData.preview_data.capital_flow_data}
                sections={['drivers', 'peer', 'corridor']}
                isRelocating={memoData.preview_data.peer_cohort_stats?.is_relocating ?? memoData.preview_data.is_relocating ?? false}
              />
            </section>

            {/* 7. HNWI Migration Trends - More Social Proof */}
            {memoData.preview_data.hnwi_trends && memoData.preview_data.hnwi_trends.length > 0 && (
              <section>
                <HNWITrendsSection
                  trends={memoData.preview_data.hnwi_trends}
                  confidence={memoData.preview_data.hnwi_trends_confidence}
                  dataQuality={memoData.preview_data.hnwi_trends_data_quality}
                  citations={memoData.preview_data.hnwi_trends_citations}
                  sourceJurisdiction={memoData.preview_data.source_jurisdiction}
                  destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
                  sourceCountry={memoData.preview_data.source_country}
                  destinationCountry={memoData.preview_data.destination_country}
                />
              </section>
            )}

            {/* 8. Geographic Opportunity Distribution - Tied to Migration Trends */}
            <section>
              <Page3PeerIntelligence
                opportunities={memoData.preview_data.all_opportunities}
                peerCount={memoData.preview_data.peer_cohort_stats?.total_peers || 0}
                onCitationClick={handleCitationClick}
                citationMap={citationMap}
                sourceJurisdiction={memoData.preview_data.source_jurisdiction}
                destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
                sourceCountry={memoData.preview_data.source_country}
                destinationCountry={memoData.preview_data.destination_country}
                sourceCity={memoData.preview_data.source_city}
                destinationCity={memoData.preview_data.destination_city}
                peerCohortStats={memoData.preview_data.peer_cohort_stats}
                capitalFlowData={memoData.preview_data.capital_flow_data}
                sections={['geographic']}
                isRelocating={memoData.preview_data.peer_cohort_stats?.is_relocating ?? memoData.preview_data.is_relocating ?? false}
              />
            </section>

            {/* ══════════════════════════════════════════════════════════════════════════════ */}
            {/* PHASE 4: RISK DETAILS (Detailed Risk Analysis)                                 */}
            {/* ══════════════════════════════════════════════════════════════════════════════ */}

            {/* 9. Transparency Regime Impact - Specific Risk */}
            {(memoData.preview_data.transparency_data || memoData.preview_data.transparency_regime_impact) && (
              <section>
                <TransparencyRegimeSection
                  transparencyData={memoData.preview_data.transparency_data}
                  content={memoData.preview_data.transparency_regime_impact}
                  sourceJurisdiction={memoData.preview_data.source_jurisdiction}
                  destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
                />
              </section>
            )}

            {/* 9.5 Real Asset Audit Intelligence - KGv3 Verified */}
            {memoData.preview_data.real_asset_audit && (
              <section>
                <RealAssetAuditSection
                  data={memoData.preview_data.real_asset_audit}
                  sourceJurisdiction={memoData.preview_data.source_jurisdiction}
                  destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
                  transactionValue={memoData.preview_data.deal_overview?.target_size
                    ? parseFloat(memoData.preview_data.deal_overview.target_size.replace(/[^0-9.]/g, '')) * 1000000
                    : 0}
                />
              </section>
            )}

            {/* 10. Crisis Resilience Stress Test - Antifragile Framework */}
            {(memoData.preview_data.crisis_data || memoData.preview_data.crisis_resilience_stress_test) && (
              <section>
                <CrisisResilienceSection
                  crisisData={memoData.preview_data.crisis_data}
                  content={memoData.preview_data.crisis_resilience_stress_test}
                  sourceJurisdiction={memoData.preview_data.source_jurisdiction}
                  destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
                />
              </section>
            )}

            {/* ══════════════════════════════════════════════════════════════════════════════ */}
            {/* PHASE 5: OPPORTUNITY (Desire - After Risk is Addressed)                        */}
            {/* ══════════════════════════════════════════════════════════════════════════════ */}

            {/* 11. Golden Visa / Investment Migration (Single Unified Section) */}
            {/* Prioritize KGv3 intelligence if available, otherwise show basic visa programs */}
            {memoData.preview_data.golden_visa_intelligence ? (
              <section>
                <GoldenVisaIntelligenceSection
                  intelligence={memoData.preview_data.golden_visa_intelligence}
                  sourceJurisdiction={memoData.preview_data.source_jurisdiction}
                  destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
                />
              </section>
            ) : (memoData.preview_data.destination_drivers?.visa_programs &&
                 memoData.preview_data.destination_drivers.visa_programs.length > 0 && (
              <section>
                <GoldenVisaSection
                  destinationDrivers={memoData.preview_data.destination_drivers}
                  destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
                />
              </section>
            ))}

            {/* ══════════════════════════════════════════════════════════════════════════════ */}
            {/* PHASE 6: DECISION ANALYSIS (Strategic Decision Support)                        */}
            {/* ══════════════════════════════════════════════════════════════════════════════ */}

            {/* 12. Decision Scenario Tree (Expert 15) */}
            {(memoData.preview_data.scenario_tree_analysis ||
              (memoData.preview_data.scenario_tree_data &&
               Object.keys(memoData.preview_data.scenario_tree_data).length > 0)) && (
              <section>
                <ScenarioTreeSection
                  data={memoData.preview_data.scenario_tree_data || {}}
                  rawAnalysis={memoData.preview_data.scenario_tree_analysis}
                />
              </section>
            )}

            {/* ══════════════════════════════════════════════════════════════════════════════ */}
            {/* PHASE 7: LEGACY (Emotional Connection - Family & Succession)                   */}
            {/* ══════════════════════════════════════════════════════════════════════════════ */}

            {/* 13. Heir Management & Succession (Expert 13 - Hughes Framework) */}
            {(memoData.preview_data.heir_management_analysis ||
              (memoData.preview_data.heir_management_data &&
               Object.keys(memoData.preview_data.heir_management_data).length > 0)) && (
              <section>
                <HeirManagementSection
                  data={memoData.preview_data.heir_management_data || {}}
                  rawAnalysis={memoData.preview_data.heir_management_analysis}
                />
              </section>
            )}

            {/* ══════════════════════════════════════════════════════════════════════════════ */}
            {/* PHASE 8: ACTION (Call to Action - Implementation Roadmap at End)               */}
            {/* ══════════════════════════════════════════════════════════════════════════════ */}

            {/* 14. Implementation Roadmap - Action Items */}
            <section>
              <Page1TaxDashboard
                totalSavings={memoData.preview_data.total_savings}
                exposureClass={memoData.preview_data.exposure_class}
                sourceJurisdiction={memoData.preview_data.source_jurisdiction}
                destinationJurisdiction={memoData.preview_data.destination_jurisdiction}
                sourceCity={memoData.preview_data.source_city}
                destinationCity={memoData.preview_data.destination_city}
                executionSequence={memoData.preview_data.execution_sequence}
                sourceTaxRates={memoData.preview_data.source_tax_rates || memoData.preview_data.tax_differential?.source}
                destinationTaxRates={memoData.preview_data.destination_tax_rates || memoData.preview_data.tax_differential?.destination}
                taxDifferential={memoData.preview_data.tax_differential}
                sections={['implementation']}
              />
            </section>

            {/* Premium Footer */}
            <motion.div
              className="relative overflow-hidden bg-gradient-to-br from-card via-card to-muted/20 border border-border rounded-2xl sm:rounded-3xl p-6 sm:p-10"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                    Pattern Intelligence Complete
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xl">
                    This audit analyzed{' '}
                    <span className="text-foreground font-medium">
                      {fullArtifact.intelligenceSources.developmentsMatched.toLocaleString()} developments
                    </span>
                    , matched{' '}
                    <span className="text-foreground font-medium">
                      {fullArtifact.intelligenceSources.failurePatternsMatched} failure patterns
                    </span>
                    , and applied{' '}
                    <span className="text-foreground font-medium">
                      {fullArtifact.intelligenceSources.sequencingRulesApplied} sequencing rules
                    </span>
                    .
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Reference</p>
                    <p className="text-sm font-mono font-medium text-primary">
                      {intakeId.slice(0, 20).toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground text-center max-w-3xl mx-auto">
                  Pattern & Market Intelligence Report based on {(memoData.memo_data?.kgv3_intelligence_used?.precedents || 0).toLocaleString()}+ analyzed precedents.
                  This report provides strategic intelligence and pattern analysis for informed decision-making.
                  For execution and implementation, consult your legal, tax, and financial advisory teams.
                </p>
              </div>
            </motion.div>

            {/* ══════════════════════════════════════════════════════════════════════════════ */}
            {/* SHARE + NEXT AUDIT CTA (Web Only — hidden in print)                             */}
            {/* ══════════════════════════════════════════════════════════════════════════════ */}
            <motion.div
              className="print:hidden space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {/* Share Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleShare}
                  className={`inline-flex items-center gap-2.5 px-8 py-3 border-2 rounded-xl text-sm font-medium transition-colors ${
                    linkCopied
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-foreground hover:bg-muted'
                  }`}
                >
                  {linkCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Link Copied!
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      Share This Audit
                    </>
                  )}
                </button>
              </div>

              {/* Next Audit CTA */}
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-card to-primary/10 p-8 sm:p-12">
                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />

                <div className="relative z-10 text-center max-w-2xl mx-auto">
                  <p className="text-xs sm:text-sm font-bold text-primary uppercase tracking-widest mb-4">
                    Pattern Recognition Engine
                  </p>

                  <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground tracking-tight mb-4">
                    DOES YOUR NEXT DEAL SURVIVE THE RED TEAM?
                  </h3>

                  <p className="text-sm text-muted-foreground mb-4 max-w-lg mx-auto leading-relaxed">
                    The same system that produced this analysis stress-tests high-value Alternative Asset acquisitions (Art, Real Estate, Collectibles) across 50+ jurisdictions.
                  </p>

                  <p className="text-sm text-foreground font-medium mb-2">Result: Certainty.</p>
                  <p className="text-sm text-foreground font-medium mb-8">Turnaround: 48 Hours.</p>

                  {/* Allocation line — current month */}
                  <p className="text-xs font-semibold text-primary/80 uppercase tracking-wider mb-6">
                    {(() => {
                      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                      return `${monthNames[new Date().getMonth()]} Allocation: Accepting Mandates`;
                    })()}
                  </p>

                  {/* Single CTA Button */}
                  <div className="flex justify-center">
                    <a
                      href="/decision-memo"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-10 py-4 bg-primary text-primary-foreground font-bold rounded-xl text-sm tracking-wide hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                    >
                      INITIATE RED TEAM AUDIT ($5,000)
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ══════════════════════════════════════════════════════════════════════════════ */}
            {/* PDF LAST PAGE - HNWI Chronicles Branding & Legal                                */}
            {/* ══════════════════════════════════════════════════════════════════════════════ */}
            <MemoLastPage
              intakeId={intakeId}
              precedentCount={memoData.memo_data?.kgv3_intelligence_used?.precedents || 0}
              generatedAt={memoData.generated_at}
              viaNegativa={viaNegativaContext}
            />
          </motion.div>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <CrownLoader size="lg" text="Loading..." />
    </div>
  );
}
