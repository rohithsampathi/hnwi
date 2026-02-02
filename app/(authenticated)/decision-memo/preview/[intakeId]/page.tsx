// app/(authenticated)/decision-memo/preview/[intakeId]/page.tsx
// Decision Memo Preview - Shows teaser of findings with payment options
// After payment, redirects to full memo at /decision-memo/memo/[intakeId]

"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Diamond,
  AlertTriangle,
  TrendingUp,
  Check,
  Shield,
  Lock,
  ArrowRight,
  Target,
  Crown,
  ArrowLeft,
  MapPin,
  FileText,
  Scale,
  Zap,
  Globe,
  BookOpen,
  ChevronRight,
  DollarSign
} from 'lucide-react';
import { CrownLoader } from '@/components/ui/crown-loader';
import { usePageTitle } from '@/hooks/use-page-title';
import Link from 'next/link';

interface PageProps {
  params: {
    intakeId: string;
  };
}

// Types for preview data
interface OpportunityPreview {
  title: string;
  jurisdiction: string;
  lat: number;
  lng: number;
  savings_potential?: string;
}

interface MistakePreview {
  title: string;
  cost: string;
  severity?: 'high' | 'medium' | 'low';
}

interface EvidencePreview {
  source: string;
  date?: string;
  relevance?: string;
}

// Value creation with transparent calculations
interface ValueCreationItem {
  amount: number;
  formula: string;
  calculation: string;
  inputs?: Record<string, string>;
  source: string;
  note: string;
}

interface PreviewData {
  success: boolean;
  intake_id: string;
  opportunities_count: number;
  mistakes_count: number;
  intelligence_count: number;
  total_savings: number;
  total_savings_display: string;
  executive_verdict_preview: string;
  executive_verdict_locked: string;
  opportunities_preview: OpportunityPreview[];
  mistakes_preview: MistakePreview[];
  sequence_step_1: string;
  sequence_total_steps: number;
  sequence_locked: string;
  evidence_preview: EvidencePreview[];
  evidence_count: number;
  evidence_locked: string;
  kgv3_precedents_used: number;
  kgv3_failure_modes_detected: number;
  risk_synthesis_preview: string;
  risk_synthesis_locked: string;
  exposure_class: string;
  memo_generated: boolean;
  price: string;

  // NEW: Dynamic fields from preview object
  preview?: {
    data_quality?: 'strong' | 'moderate' | 'limited' | 'insufficient';
    data_quality_note?: string;
    precedent_count?: number;
    principal_profile?: string;
    tax_differential?: number;
    value_creation?: {
      annual_tax_savings?: ValueCreationItem;
      capital_gains_savings?: ValueCreationItem;
    };
    peer_cohort_stats?: {
      data_available: boolean;
      message: string;
      note?: string;
    };
    dd_checklist?: Array<{ category: string; item: string; priority: string }>;
    dd_checklist_total?: number;
  };
}

// Pricing configuration
const PRICING = {
  single: {
    price: 5000,
    currency: 'USD',
    memos: 1,
    features: [
      'Complete Pattern Analysis',
      'All identified opportunities',
      'Risk mitigation strategies',
      'Implementation roadmap',
      'PDF download'
    ]
  },
  premium: {
    price: 25000,
    currency: 'USD',
    memos: 10,
    features: [
      'This Decision Memo included',
      '9 additional Decision Memos',
      'Architect Tier access (1 year)',
      'Priority intelligence alerts',
      'Direct analyst support',
      'Quarterly portfolio reviews',
      'Tax optimization strategies',
      'Family office coordination'
    ]
  }
};

export default function DecisionMemoPreviewPage({ params }: PageProps) {
  const { intakeId } = params;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  usePageTitle(
    'Decision Memo - Preview',
    'Your pattern intelligence analysis is ready'
  );

  // Fetch preview data
  useEffect(() => {
    async function fetchPreview() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/decision-memo/preview/${intakeId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch preview');
        }

        const data = await response.json();
        setPreviewData(data);
      } catch (err) {
        console.error('Error fetching preview:', err);
        setError(err instanceof Error ? err.message : 'Failed to load preview');
      } finally {
        setIsLoading(false);
      }
    }

    fetchPreview();
  }, [intakeId]);

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

  // Handle payment
  const handlePayment = useCallback(async (tier: 'single' | 'premium') => {
    setIsProcessingPayment(true);

    try {
      const response = await fetch('/api/decision-memo/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intake_id: intakeId,
          tier: tier,
          product: tier === 'single' ? 'decision_memo_single' : 'premium_annual'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate payment');
      }

      const data = await response.json();
      const { order_id, amount, currency, key } = data;

      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: 'HNWI Chronicles',
        description: tier === 'single' ? 'Decision Memo' : 'Premium Annual',
        order_id: order_id,
        handler: async function (response: any) {
          // Verify payment
          const verifyResponse = await fetch('/api/decision-memo/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              intake_id: intakeId,
              tier: tier,
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
              signature: response.razorpay_signature
            }),
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            // Redirect to full memo
            router.push(`/decision-memo/memo/${intakeId}`);
          } else {
            alert('Payment verification failed. Please contact support.');
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          email: '',
          contact: ''
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
      console.error('Payment failed:', error);
      alert('Failed to initiate payment. Please try again.');
      setIsProcessingPayment(false);
    }
  }, [intakeId, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <CrownLoader
          size="lg"
          text="Analyzing Your Profile"
          subtext="Matching against 1,562 HNWI precedents..."
        />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">!</div>
          <h1 className="text-2xl font-bold mb-4 text-foreground">Preview Not Available</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link
            href="/decision-memo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Start New Assessment
          </Link>
        </div>
      </div>
    );
  }

  // Extract preview stats
  const opportunitiesCount = previewData?.opportunities_count || 0;
  const mistakesCount = previewData?.mistakes_count || 0;
  const intelligenceCount = previewData?.intelligence_count || 0;
  const totalSavings = previewData?.total_savings || 0;
  const savingsInMillions = (totalSavings / 1000000).toFixed(1);

  // Extract rich preview data
  const executiveVerdictPreview = previewData?.executive_verdict_preview || '';
  const executiveVerdictLocked = previewData?.executive_verdict_locked || '🔒 Complete strategic verdict unlocked after payment';
  const opportunitiesPreview = previewData?.opportunities_preview || [];
  const mistakesPreview = previewData?.mistakes_preview || [];
  const sequenceStep1 = previewData?.sequence_step_1 || '';
  const sequenceTotalSteps = previewData?.sequence_total_steps || 0;
  const sequenceLocked = previewData?.sequence_locked || '🔒 Full implementation roadmap unlocked after payment';
  const evidencePreview = previewData?.evidence_preview || [];
  const evidenceCount = previewData?.evidence_count || 0;
  const evidenceLocked = previewData?.evidence_locked || '🔒 All intelligence sources unlocked after payment';
  const kgv3PrecedentsUsed = previewData?.kgv3_precedents_used || 0;
  const kgv3FailureModesDetected = previewData?.kgv3_failure_modes_detected || 0;
  const riskSynthesisPreview = previewData?.risk_synthesis_preview || '';
  const riskSynthesisLocked = previewData?.risk_synthesis_locked || '🔒 Complete risk matrix unlocked after payment';
  const exposureClass = previewData?.exposure_class || 'Unknown';
  const totalSavingsDisplay = previewData?.total_savings_display || '$0';

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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">HC</span>
              </div>
              <div>
                <p className="text-foreground font-semibold">Decision Memo</p>
                <p className="text-muted-foreground text-xs">Analysis Complete</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/5 to-background py-12 sm:py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-primary text-sm font-medium">Analysis Complete</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              We Found <span className="text-primary">{mistakesCount} Six-Figure Mistakes</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Based on your 3 questions, our AI analyzed <span className="text-foreground font-semibold">{(kgv3PrecedentsUsed || intelligenceCount).toLocaleString()} HNWI precedents</span> and detected critical gaps in your allocation strategy.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6">
        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-primary/20 rounded-2xl p-6"
          >
            <Diamond className="w-10 h-10 text-primary mb-4" />
            <div className="text-4xl font-bold text-primary mb-2">{opportunitiesCount}</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wide">Matching Opportunities</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-primary/20 rounded-2xl p-6"
          >
            <AlertTriangle className="w-10 h-10 text-primary mb-4" />
            <div className="text-4xl font-bold text-primary mb-2">{mistakesCount}</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wide">Six-Figure Mistakes</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-primary/20 rounded-2xl p-6"
          >
            <TrendingUp className="w-10 h-10 text-primary mb-4" />
            <div className="text-4xl font-bold text-primary mb-2">{intelligenceCount}</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wide">Intelligence Matches</div>
          </motion.div>
        </div>
      </div>

      {/* KGv3 Intelligence Bar */}
      {(kgv3PrecedentsUsed > 0 || kgv3FailureModesDetected > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="max-w-5xl mx-auto px-4 sm:px-6 mt-6"
        >
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">KGv3 Precedents:</span>
              <span className="text-foreground font-semibold">{kgv3PrecedentsUsed.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="text-muted-foreground">Failure Modes:</span>
              <span className="text-foreground font-semibold">{kgv3FailureModesDetected}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full">
              <Scale className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Exposure Class:</span>
              <span className="text-foreground font-semibold">{exposureClass}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* NEW: Dynamic Analysis Panel - Data Quality, Profile, Value Creation */}
      {previewData?.preview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="max-w-5xl mx-auto px-4 sm:px-6 mt-8"
        >
          <div className="grid md:grid-cols-2 gap-4">
            {/* Data Quality & Profile Card */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Analysis Quality</h4>

              {/* Data Quality Indicator */}
              {previewData.preview.data_quality && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${
                      previewData.preview.data_quality === 'strong' ? 'bg-green-500' :
                      previewData.preview.data_quality === 'moderate' ? 'bg-yellow-500' :
                      previewData.preview.data_quality === 'limited' ? 'bg-orange-500' :
                      'bg-red-500'
                    }`} />
                    <span className="font-semibold capitalize">{previewData.preview.data_quality} Data</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{previewData.preview.data_quality_note}</p>
                </div>
              )}

              {/* Principal Profile */}
              {previewData.preview.principal_profile && (
                <div className="pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground mb-1">Your Profile</div>
                  <div className="text-lg font-bold text-primary">{previewData.preview.principal_profile}</div>
                  {previewData.preview.tax_differential !== undefined && previewData.preview.tax_differential > 0 && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Tax Differential: <span className="text-green-500 font-medium">{previewData.preview.tax_differential}%</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Value Creation Card */}
            {previewData.preview.value_creation && (
              <div className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border border-green-500/20 rounded-2xl p-6">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Projected Value Creation</h4>

                {previewData.preview.value_creation.annual_tax_savings && previewData.preview.value_creation.annual_tax_savings.amount > 0 && (
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-green-500">
                      ${previewData.preview.value_creation.annual_tax_savings.amount.toLocaleString()}
                      <span className="text-sm font-normal text-muted-foreground">/year</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {previewData.preview.value_creation.annual_tax_savings.note}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 font-mono bg-muted/50 rounded px-2 py-1">
                      {previewData.preview.value_creation.annual_tax_savings.calculation}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Source: {previewData.preview.value_creation.annual_tax_savings.source}
                    </div>
                  </div>
                )}

                {previewData.preview.value_creation.capital_gains_savings && previewData.preview.value_creation.capital_gains_savings.amount > 0 && (
                  <div className="pt-3 border-t border-green-500/20">
                    <div className="text-lg font-semibold text-green-500">
                      +${previewData.preview.value_creation.capital_gains_savings.amount.toLocaleString()}
                      <span className="text-sm font-normal text-muted-foreground"> CGT savings</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {previewData.preview.value_creation.capital_gains_savings.note}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* DD Checklist Preview */}
          {previewData.preview.dd_checklist && previewData.preview.dd_checklist.length > 0 && (
            <div className="mt-4 bg-card border border-border rounded-2xl p-6">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                Due Diligence Checklist ({previewData.preview.dd_checklist_total || previewData.preview.dd_checklist.length} items)
              </h4>
              <div className="space-y-2">
                {previewData.preview.dd_checklist.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${
                      item.priority === 'critical' ? 'bg-red-500' :
                      item.priority === 'high' ? 'bg-orange-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <span className="text-xs text-muted-foreground uppercase">{item.category}</span>
                      <div className="text-sm text-foreground">{item.item}</div>
                    </div>
                  </div>
                ))}
              </div>
              {(previewData.preview.dd_checklist_total || 0) > 3 && (
                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="w-3 h-3" />
                  +{(previewData.preview.dd_checklist_total || previewData.preview.dd_checklist.length) - 3} more items unlocked after payment
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Executive Verdict Preview */}
      {executiveVerdictPreview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-5xl mx-auto px-4 sm:px-6 mt-8"
        >
          <div className="bg-card border-2 border-primary/30 rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4 border-b border-primary/20">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Executive Verdict Preview
              </h3>
            </div>
            <div className="p-6">
              <p className="text-foreground text-lg leading-relaxed mb-4">
                {executiveVerdictPreview}
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-3">
                <Lock className="w-4 h-4" />
                {executiveVerdictLocked}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Opportunities Map Preview */}
      {opportunitiesPreview.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="max-w-5xl mx-auto px-4 sm:px-6 mt-8"
        >
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-transparent px-6 py-4 border-b border-border">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Opportunity Locations
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({opportunitiesPreview.length} identified)
                </span>
              </h3>
            </div>
            <div className="p-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {opportunitiesPreview.slice(0, 6).map((opp, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="flex items-start gap-3 p-4 bg-gradient-to-br from-primary/5 to-transparent border border-primary/20 rounded-xl"
                  >
                    <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground truncate">{opp.title}</div>
                      <div className="text-sm text-muted-foreground">{opp.jurisdiction}</div>
                      {opp.savings_potential && (
                        <div className="text-xs text-primary mt-1">{opp.savings_potential} potential</div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
              {opportunitiesPreview.length > 6 && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-full px-4 py-2">
                    <Lock className="w-3 h-3" />
                    +{opportunitiesPreview.length - 6} more opportunities unlocked after payment
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Mistakes Alert Panel */}
      {mistakesPreview.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-5xl mx-auto px-4 sm:px-6 mt-8"
        >
          <div className="bg-gradient-to-br from-red-500/5 to-amber-500/5 border-2 border-red-500/20 rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-red-500/10 to-amber-500/10 px-6 py-4 border-b border-red-500/20">
              <h3 className="text-lg font-bold flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-5 h-5" />
                Six-Figure Mistakes Identified
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {mistakesPreview.slice(0, 3).map((mistake, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 + index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-card/80 border border-red-500/20 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                        <span className="text-red-500 font-bold text-sm">{index + 1}</span>
                      </div>
                      <span className="font-medium text-foreground">{mistake.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-red-500" />
                      <span className="font-bold text-red-500">{mistake.cost}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              {mistakesPreview.length > 3 && (
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-3">
                  <Lock className="w-4 h-4" />
                  +{mistakesPreview.length - 3} more mistakes with fix strategies unlocked after payment
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Implementation Sequence Preview */}
      {sequenceStep1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="max-w-5xl mx-auto px-4 sm:px-6 mt-8"
        >
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-transparent px-6 py-4 border-b border-border">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Implementation Roadmap
                {sequenceTotalSteps > 0 && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({sequenceTotalSteps} steps)
                  </span>
                )}
              </h3>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground font-bold">1</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-primary font-medium mb-1">First Priority</div>
                  <p className="text-foreground">{sequenceStep1}</p>
                </div>
              </div>
              {sequenceTotalSteps > 1 && (
                <div className="mt-4 flex items-center gap-4">
                  {[2, 3, 4].slice(0, sequenceTotalSteps - 1).map((step) => (
                    <div
                      key={step}
                      className="flex-1 flex items-center gap-2 p-3 bg-muted/50 border border-border rounded-lg opacity-50"
                    >
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                        <Lock className="w-3 h-3 text-muted-foreground" />
                      </div>
                      <span className="text-sm text-muted-foreground">Step {step}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-3">
                <Lock className="w-4 h-4" />
                {sequenceLocked}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Evidence Citations Preview */}
      {evidencePreview.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-5xl mx-auto px-4 sm:px-6 mt-8"
        >
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-transparent px-6 py-4 border-b border-border">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Intelligence Sources
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({evidenceCount} citations)
                </span>
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                {evidencePreview.slice(0, 3).map((evidence, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                  >
                    <ChevronRight className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground">{evidence.source}</span>
                    {evidence.date && (
                      <span className="text-xs text-muted-foreground ml-auto">{evidence.date}</span>
                    )}
                  </div>
                ))}
              </div>
              {evidenceCount > 3 && (
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-3">
                  <Lock className="w-4 h-4" />
                  {evidenceLocked}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Risk Synthesis Preview */}
      {riskSynthesisPreview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="max-w-5xl mx-auto px-4 sm:px-6 mt-8"
        >
          <div className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/20 rounded-2xl p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <Scale className="w-5 h-5 text-amber-500" />
              Risk Synthesis
            </h3>
            <p className="text-foreground leading-relaxed mb-4">{riskSynthesisPreview}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card/50 rounded-lg px-4 py-3">
              <Lock className="w-4 h-4" />
              {riskSynthesisLocked}
            </div>
          </div>
        </motion.div>
      )}

      {/* Savings Banner */}
      {totalSavings > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="max-w-5xl mx-auto px-4 sm:px-6 mt-8"
        >
          <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-2xl p-8 sm:p-12 text-primary-foreground text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
              <div className="text-sm font-medium mb-3 opacity-90 uppercase tracking-wider">Total Potential Savings Identified</div>
              <div className="text-6xl sm:text-7xl font-bold mb-4">${savingsInMillions}M</div>
              <div className="text-lg opacity-90">
                From {mistakesCount} coordination failures across your allocation timeline
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* What's Locked */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-2xl p-6 sm:p-8"
        >
          <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-3 mb-6">
            <Target className="w-6 h-6 text-primary" />
            Your Full Decision Memo Includes
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              'Detailed analysis of each identified mistake',
              'Specific fix strategies with timelines',
              'Opportunity-by-opportunity breakdown',
              'Jurisdiction sequencing recommendations',
              'Tax optimization pathways',
              'Implementation roadmap with milestones',
              'Risk mitigation strategies',
              'Peer comparison insights'
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <Lock className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ROI Banner */}
      {totalSavings > 0 && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 sm:p-8 text-center">
            <div className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">Your Return on Investment</div>
            <div className="flex items-center justify-center gap-4 text-2xl sm:text-3xl font-bold flex-wrap">
              <span className="text-primary">${savingsInMillions}M prevented</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-foreground">$5,000</span>
              <span className="text-muted-foreground">=</span>
              <span className="text-primary text-4xl">{Math.round(totalSavings / 5000).toLocaleString()}x ROI</span>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-10">
          <h3 className="text-2xl sm:text-3xl font-bold mb-3">Choose Your Access Level</h3>
          <p className="text-muted-foreground">Unlock your complete Decision Memo with actionable intelligence</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Single Memo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border-2 border-border rounded-2xl p-6 sm:p-8 hover:border-primary/30 transition-all"
          >
            <div className="mb-6">
              <h4 className="text-xl font-bold text-foreground mb-2">Single Decision Memo</h4>
              <p className="text-sm text-muted-foreground">One-time purchase</p>
            </div>

            <div className="mb-6">
              <span className="text-5xl font-bold text-foreground">$5,000</span>
              <span className="text-muted-foreground ml-2">one-time</span>
            </div>

            <ul className="space-y-3 mb-8">
              {PRICING.single.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handlePayment('single')}
              disabled={isProcessingPayment}
              className="w-full py-4 px-6 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Get Memo
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>

          {/* Premium */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative bg-gradient-to-br from-primary/10 via-card to-primary/5 border-2 border-primary/50 rounded-2xl p-6 sm:p-8 shadow-xl"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="px-4 py-1.5 bg-primary text-primary-foreground text-sm font-bold rounded-full shadow-lg flex items-center gap-1.5">
                <Crown className="w-4 h-4" />
                BEST VALUE
              </div>
            </div>

            <div className="mb-6 pt-2">
              <h4 className="text-xl font-bold text-foreground mb-2">Premium Annual</h4>
              <p className="text-sm text-muted-foreground">Full platform access</p>
            </div>

            <div className="mb-4">
              <span className="text-5xl font-bold text-foreground">$25,000</span>
              <span className="text-muted-foreground ml-2">/year</span>
            </div>

            <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Architect Tier ($1,499/mo)</span>
                <span className="text-foreground font-medium">$17,988</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">10 Decision Memos</span>
                <span className="text-foreground font-medium">$25,000</span>
              </div>
              <div className="border-t border-primary/20 my-2 pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-primary font-semibold">You Save</span>
                  <span className="text-primary font-bold">$17,988 (42%)</span>
                </div>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {PRICING.premium.features.slice(0, 5).map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className={i < 2 ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handlePayment('premium')}
              disabled={isProcessingPayment}
              className="w-full py-4 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              Get Premium Access
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>

        {/* Trust */}
        <div className="mt-10 text-center">
          <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Secure payment via Razorpay</span>
          </div>
        </div>
      </div>
    </div>
  );
}
