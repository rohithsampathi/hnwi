// components/assessment/AssessmentExistingResults.tsx
// Shows existing assessment results with download and share options

"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, Calendar, Brain, FileText, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AssessmentExistingResultsProps {
  latestAssessment: {
    session_id: string;
    tier: string;
    completed_at: string;
    can_retake_at: string;
    pdf_url?: string;
  };
}

const TIER_CONFIG = {
  architect: {
    label: 'ARCHITECT',
    gradient: 'from-yellow-500/20 to-yellow-600/10',
    border: 'border-yellow-500/40',
    description: 'Systems thinker, structural arbitrageur'
  },
  operator: {
    label: 'OPERATOR',
    gradient: 'from-blue-500/20 to-blue-600/10',
    border: 'border-blue-500/40',
    description: 'Tactical executor, opportunity maximizer'
  },
  observer: {
    label: 'OBSERVER',
    gradient: 'from-gray-500/20 to-gray-600/10',
    border: 'border-gray-500/40',
    description: 'Passive strategist, delegated monitor'
  }
};

export function AssessmentExistingResults({ latestAssessment }: AssessmentExistingResultsProps) {
  const router = useRouter();
  const [copying, setCopying] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const tierKey = latestAssessment.tier.toLowerCase() as keyof typeof TIER_CONFIG;
  const tierConfig = TIER_CONFIG[tierKey] || TIER_CONFIG.observer;

  const completedDate = new Date(latestAssessment.completed_at);
  const retakeDate = new Date(latestAssessment.can_retake_at);
  const now = new Date();
  const daysUntilRetake = Math.ceil((retakeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const canRetake = now >= retakeDate;

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/simulation`;

  const handleViewResults = () => {
    router.push(`/simulation/results/${latestAssessment.session_id}`);
  };

  const handleDownloadPDF = async () => {
    if (!latestAssessment.pdf_url) {
      alert('PDF is not available yet. Please try again in a few moments.');
      return;
    }

    setDownloading(true);
    try {
      const response = await fetch(latestAssessment.pdf_url);
      if (!response.ok) throw new Error('Failed to fetch PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HNWI_Assessment_${latestAssessment.session_id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(shareUrl);
      setTimeout(() => setCopying(false), 2000);
    } catch (error) {
      alert('Failed to copy link. Please try again.');
      setCopying(false);
    }
  };

  return (
    <div className="bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-xs sm:text-sm font-medium text-primary">Your C10 Classification</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Your Strategic DNA
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Completed on {completedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className={`bg-gradient-to-br ${tierConfig.gradient} border ${tierConfig.border} rounded-2xl p-8 mb-8`}>
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">{tierConfig.label}</h2>
            <p className="text-base text-muted-foreground mb-6">{tierConfig.description}</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <button onClick={handleViewResults} className="flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-all transform hover:scale-105">
            <ExternalLink className="w-5 h-5" />
            <span>View Full Report</span>
          </button>
          <button onClick={handleDownloadPDF} disabled={!latestAssessment.pdf_url || downloading} className="flex items-center justify-center gap-2 px-6 py-4 bg-card border border-border text-foreground rounded-xl font-semibold hover:bg-muted transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105">
            <Download className="w-5 h-5" />
            <span>{downloading ? 'Downloading...' : 'Download PDF'}</span>
          </button>
          <button onClick={handleShare} className="flex items-center justify-center gap-2 px-6 py-4 bg-card border border-border text-foreground rounded-xl font-semibold hover:bg-muted transition-all transform hover:scale-105">
            <Share2 className="w-5 h-5" />
            <span>{copying ? 'Link Copied!' : 'Share with Friends'}</span>
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }} className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0"><Calendar className="w-6 h-6 text-primary" /></div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">{canRetake ? 'Ready to Retake' : 'Next Assessment Available'}</h3>
              {canRetake ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-4">You can now retake the C10 Assessment to update your classification.</p>
                  <button onClick={() => window.location.reload()} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-all">Retake Assessment</button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">You can retake the assessment in <span className="font-bold text-foreground">{daysUntilRetake} days</span></p>
                  <p className="text-xs text-muted-foreground">Available on {retakeDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.8 }} className="mt-8 pt-8 border-t border-border text-center">
          <h3 className="text-lg font-semibold text-foreground mb-3">Invite Others to Discover Their Strategic DNA</h3>
          <p className="text-sm text-muted-foreground mb-4">Share the C10 Assessment with your network and compare strategic classifications</p>
          <div className="flex items-center justify-center gap-3 bg-muted rounded-lg p-4">
            <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <code className="text-sm text-foreground font-mono flex-1 text-left truncate">{shareUrl}</code>
            <button onClick={handleShare} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-all whitespace-nowrap">{copying ? 'Copied!' : 'Copy Link'}</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
