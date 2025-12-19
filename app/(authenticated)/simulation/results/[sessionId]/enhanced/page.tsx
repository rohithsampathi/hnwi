// app/(authenticated)/simulation/results/[sessionId]/enhanced/page.tsx
// Enhanced Simulation Report with visual analytics
// Implements all advanced report components

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { CrownLoader } from '@/components/ui/crown-loader';
import {
  ExecutiveSummary,
  SpiderGraphComparison,
  MissedOpportunities,
  CelebrityOpportunities,
  PeerBenchmarking
} from '@/components/report';
import type { EnhancedReportData } from '@/types/assessment-report';
import { downloadEnhancedPDF } from '@/lib/pdf-generator-enhanced';

export default function EnhancedReportPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [reportData, setReportData] = useState<EnhancedReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnhancedReport = async () => {
      try {
        // Backend now returns enhanced report data from the same results endpoint
        const response = await fetch(`/api/assessment/result/${sessionId}`);

        if (!response.ok) {
          throw new Error('Failed to load enhanced report');
        }

        const data = await response.json();

        // Backend returns enhanced_report field with all the visual analytics data
        if (data.enhanced_report) {
          setReportData(data.enhanced_report);
        } else {
          throw new Error('Enhanced report data not available');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };

    fetchEnhancedReport();
  }, [sessionId]);

  const handleBack = () => {
    router.push(`/simulation/results/${sessionId}`);
  };

  const handleDownload = () => {
    if (!reportData) {
      alert('Report data not loaded yet. Please wait.');
      return;
    }

    try {
      downloadEnhancedPDF(reportData, sessionId);
    } catch (err) {
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/simulation/results/${sessionId}/enhanced`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    } catch (err) {
      alert('Failed to copy link');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <CrownLoader
          size="lg"
          text="Generating Enhanced Report"
          subtext="Analyzing your performance against peers..."
        />
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Failed to load report'}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Results</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span className="text-sm font-medium">Share</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-lg transition-opacity"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Enhanced Assessment Report
          </h1>
          <p className="text-muted-foreground">
            Visual analytics and peer comparison for your strategic profile
          </p>
        </motion.div>

        {/* Executive Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ExecutiveSummary data={reportData.executive_summary} />
        </motion.div>

        {/* Spider Graph - Peer Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SpiderGraphComparison data={reportData.spider_graphs.peer_comparison} />
        </motion.div>

        {/* Missed Opportunities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <MissedOpportunities data={reportData.missed_opportunities} />
        </motion.div>

        {/* Celebrity Opportunities */}
        {reportData.celebrity_opportunities && reportData.celebrity_opportunities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <CelebrityOpportunities
              opportunities={reportData.celebrity_opportunities}
              userTier={reportData.executive_summary.tier}
            />
          </motion.div>
        )}

        {/* Peer Benchmarking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <PeerBenchmarking data={reportData.peer_analysis} />
        </motion.div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 p-8 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl text-center"
        >
          <h3 className="text-2xl font-bold text-foreground mb-2">
            Ready to Act on These Insights?
          </h3>
          <p className="text-muted-foreground mb-6">
            Access HNWI Chronicles intelligence platform to track these opportunities in real-time
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    </div>
  );
}
