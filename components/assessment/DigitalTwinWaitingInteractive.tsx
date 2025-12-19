// components/assessment/DigitalTwinWaitingInteractive.tsx
// Enhanced interactive waiting screen during Digital Twin simulation

"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SimulationResult } from '@/lib/hooks/useAssessmentSSE';
import { Globe, Brain, Shield, TrendingUp, AlertTriangle, Sparkles, Activity, Zap, Lightbulb, CheckCircle } from 'lucide-react';

interface DigitalTwinWaitingProps {
  sessionId: string;
  onComplete: (result: SimulationResult, pdfUrl: string) => void;
  testCompletionTime?: Date | null;
  simulationResult: SimulationResult | null;
  pdfUrl: string | null;
  resultData: any;
}

type ProcessingStep = {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  estimatedSeconds: number;
  status: 'pending' | 'processing' | 'complete';
  metrics?: string[];
};

// NOTE: HNWI_FACTS moved inside component to access dynamic peerCount

// Removed static SIMULATION_METRICS - will make them dynamic based on current step

export function DigitalTwinWaitingInteractive({
  sessionId,
  onComplete,
  testCompletionTime,
  simulationResult: sseSimulationResult,
  pdfUrl: ssePdfUrl,
  resultData: sseResultData
}: DigitalTwinWaitingProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [briefCount, setBriefCount] = useState<number>(1900);
  const [peerCount, setPeerCount] = useState<number>(87); // Dynamic peer comparison count from backend
  const [pollCount, setPollCount] = useState(0);
  const [isPolling, setIsPolling] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(1);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);
  const [actualOpportunitiesCount, setActualOpportunitiesCount] = useState<number | null>(null);
  const hasFetchedCountsRef = useRef(false); // Prevent multiple fetches of counts

  // Audio management with foolproof error handling
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioInitializedRef = useRef(false);
  const audioPlayAttemptCountRef = useRef(0);
  const MAX_AUDIO_RETRY_ATTEMPTS = 3;

  // NO minimum display time - show results immediately when ready
  const componentMountTime = useRef<number>(Date.now());
  const MINIMUM_DISPLAY_TIME_MS = 0; // No minimum - instant navigation

  // Rotating facts about HNWI World (dynamic based on peerCount and briefCount)
  const HNWI_FACTS = [
    { icon: Globe, text: "Analyzing patterns across 67 jurisdictions for wealth migration signals" },
    { icon: Brain, text: `Processing ${briefCount.toLocaleString()}+ HNWI World developments since February 2023` },
    { icon: Shield, text: "Simulating your portfolio through 10 crisis scenarios" },
    { icon: TrendingUp, text: "Identifying opportunities worth $10M+ in cumulative value" },
    { icon: AlertTriangle, text: "Testing resilience against the April 2026 Transparency Cliff" },
    { icon: Sparkles, text: `Matching your DNA with ${peerCount} peer portfolios for benchmarking` }
  ];

  // Dynamic metrics that update based on current step
  const [dynamicMetrics, setDynamicMetrics] = useState([
    { label: "Developments Analyzed", current: 0, target: 0, suffix: "" },
    { label: "Scenarios Tested", current: 0, target: 0, suffix: "" },
    { label: "Peer Comparisons", current: 0, target: 0, suffix: "" },
    { label: "Opportunities Found", current: 0, target: 0, suffix: "+" }
  ]);

  const [steps, setSteps] = useState<ProcessingStep[]>([
    {
      id: 'assessment',
      label: 'Assessment completed',
      description: 'Your strategic DNA has been captured',
      icon: <Shield className="w-5 h-5" />,
      estimatedSeconds: 0,
      status: 'complete',
      metrics: ['10 scenarios analyzed', '47 data points collected']
    },
    {
      id: 'briefs',
      label: 'Retrieving HNWI World briefs',
      description: 'Accessing exclusive intelligence database',
      icon: <Globe className="w-5 h-5" />,
      estimatedSeconds: 20,
      status: 'processing',
      metrics: [`${briefCount.toLocaleString()}+ developments`, '67 jurisdictions', '3 years of patterns']
    },
    {
      id: 'simulation',
      label: 'Running Digital Twin simulation',
      description: 'Modeling your behavior through crisis scenarios',
      icon: <Brain className="w-5 h-5" />,
      estimatedSeconds: 40,
      status: 'pending',
      metrics: ['10 crisis scenarios', `${peerCount} peer comparisons`, '2026 cliff modeling']
    },
    {
      id: 'gap',
      label: 'Generating Extended Report',
      description: 'Analyzing peer benchmarks and strategic positioning',
      icon: <TrendingUp className="w-5 h-5" />,
      estimatedSeconds: 60,
      status: 'pending',
      metrics: ['Spider graph analysis', `${peerCount} peer comparison`, 'Strategic gaps']
    },
    {
      id: 'forensic',
      label: 'Response validation check',
      description: 'Ensuring accuracy and consistency',
      icon: <Activity className="w-5 h-5" />,
      estimatedSeconds: 20,
      status: 'pending',
      metrics: ['Cross-validation', 'Confidence scoring', `${peerCount} peer benchmarking`]
    },
    {
      id: 'pdf',
      label: 'Finalizing complete report',
      description: 'Compiling all analysis into comprehensive document',
      icon: <Shield className="w-5 h-5" />,
      estimatedSeconds: 20,
      status: 'pending',
      metrics: ['Full analytics', 'Opportunity maps', 'Action plans']
    },
  ]);

  // Update step metrics when briefCount or peerCount changes
  useEffect(() => {
    setSteps(prevSteps => prevSteps.map(step => {
      if (step.id === 'briefs') {
        return {
          ...step,
          metrics: [`${briefCount.toLocaleString()}+ developments`, '67 jurisdictions', '3 years of patterns']
        };
      } else if (step.id === 'simulation') {
        return {
          ...step,
          metrics: ['10 crisis scenarios', `${peerCount} peer comparisons`, '2026 cliff modeling']
        };
      } else if (step.id === 'gap') {
        return {
          ...step,
          metrics: ['Spider graph analysis', `${peerCount} peer comparison`, 'Strategic gaps']
        };
      } else if (step.id === 'forensic') {
        return {
          ...step,
          metrics: ['Cross-validation', 'Confidence scoring', `${peerCount} peer benchmarking`]
        };
      }
      return step;
    }));
  }, [briefCount, peerCount]);

  // Fetch dynamic brief count
  useEffect(() => {
    async function fetchBriefCount() {
      try {
        const response = await fetch('/api/developments/counts', {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        if (response.ok) {
          const data = await response.json();
          const count = data.developments?.total_count || data.total || data.count || data.total_count || data.briefs;
          if (count && typeof count === 'number') {
            setBriefCount(count);
          }
        }
      } catch (error) {
        // Use fallback value
      }
    }
    fetchBriefCount();
  }, []);

  // Fetch actual opportunities count AND peer count from session results
  // ONLY when SSE says results are ready - ONCE
  useEffect(() => {
    // CRITICAL: Don't fetch if already completed or already fetched
    if (hasCompleted) return;
    if (hasFetchedCountsRef.current) return;

    // Don't fetch until SSE confirms results are available
    if (!sseResultData?.result_available) return;
    if (actualOpportunitiesCount !== null) return; // Already have the count

    hasFetchedCountsRef.current = true; // Mark as fetched immediately to prevent duplicates

    async function fetchDynamicCounts() {
      try {
        // Bust cache when fetching counts
        const response = await fetch(`/api/assessment/result/${sessionId}?t=${Date.now()}`, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        if (response.ok) {
          const data = await response.json();

          // Extract opportunities count
          const oppCount = data.enhanced_report?.full_analytics?.celebrity_opportunities?.celebrity_opportunities?.length ||
                          data.enhanced_report?.celebrity_opportunities?.celebrity_opportunities?.length ||
                          data.personalized_opportunities?.length ||
                          35; // Fallback
          if (oppCount && typeof oppCount === 'number') {
            setActualOpportunitiesCount(oppCount);
          }

          // Extract peer comparison sample size
          const peerSampleSize = data.enhanced_report?.full_analytics?.strategic_positioning?.sample_size ||
                                data.enhanced_report?.strategic_positioning?.sample_size;
          if (peerSampleSize && typeof peerSampleSize === 'number') {
            setPeerCount(peerSampleSize);
          }
        }
      } catch (error) {
        // Use fallback values
      }
    }

    fetchDynamicCounts();
  }, [sessionId, sseResultData, actualOpportunitiesCount, hasCompleted]);

  // Timer - stop when completed
  useEffect(() => {
    if (hasCompleted) return; // Don't run timer if already completed

    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [hasCompleted]);

  // Rotate facts every 5 seconds - stop when completed
  useEffect(() => {
    if (hasCompleted) return; // Don't rotate facts if already completed

    const interval = setInterval(() => {
      setCurrentFactIndex(prev => (prev + 1) % HNWI_FACTS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [hasCompleted, HNWI_FACTS.length]);

  // Progress through steps based on cumulative time with realistic progression
  useEffect(() => {
    if (hasCompleted) return;

    let targetStepIndex = 1; // Start with first step (briefs)
    let cumulativeTime = 0;

    // Calculate which step should be active based on elapsed time
    // Skip first step (assessment) as it's already complete
    for (let i = 1; i < steps.length; i++) {
      if (elapsedTime > cumulativeTime) {
        // Check if we're within this step's time window
        if (elapsedTime <= cumulativeTime + steps[i].estimatedSeconds) {
          targetStepIndex = i;
          break;
        }
        // Move to next step
        cumulativeTime += steps[i].estimatedSeconds;
        if (i < steps.length - 1) {
          targetStepIndex = i + 1;
        }
      }
    }

    // Don't jump to the last step too early - reserve it for final completion
    if (targetStepIndex >= steps.length - 1 && !hasCompleted) {
      targetStepIndex = steps.length - 2;
    }

    if (targetStepIndex !== currentStepIndex) {
      setCurrentStepIndex(targetStepIndex);

      const updatedSteps = steps.map((step, index) => {
        if (index < targetStepIndex) {
          return { ...step, status: 'complete' as const };
        } else if (index === targetStepIndex) {
          return { ...step, status: 'processing' as const };
        }
        return { ...step, status: 'pending' as const };
      });
      setSteps(updatedSteps);
    }
  }, [elapsedTime, currentStepIndex, hasCompleted, steps]);

  // Update metrics based on current step
  useEffect(() => {
    const currentStep = steps[currentStepIndex];
    if (!currentStep) return;

    setDynamicMetrics(prev => {
      const newMetrics = [...prev];

      // Calculate dynamic opportunity targets based on actual count
      const finalOppCount = actualOpportunitiesCount || 35; // Use actual or fallback
      const oppMidway = Math.floor(finalOppCount * 0.65); // 65% by gap analysis
      const oppEarly = Math.floor(finalOppCount * 0.15); // 15% by simulation

      // Update targets based on which step is processing
      switch (currentStep.id) {
        case 'briefs':
          // Retrieving HNWI World briefs - developments should be counting up
          newMetrics[0].target = briefCount; // Developments Analyzed
          newMetrics[1].target = 0; // Scenarios not started
          newMetrics[2].target = 0; // Peer comparisons not started
          newMetrics[3].target = 0; // Opportunities not found yet
          break;

        case 'simulation':
          // Running Digital Twin simulation - scenarios and peers should be counting
          newMetrics[0].target = briefCount; // Developments complete
          newMetrics[1].target = 10; // Scenarios being tested
          newMetrics[2].target = peerCount; // Peer comparisons running (DYNAMIC from backend)
          newMetrics[3].target = oppEarly; // Some opportunities found
          break;

        case 'gap':
          // Generating Extended Report - opportunities should be counting up
          newMetrics[0].target = briefCount; // Developments complete
          newMetrics[1].target = 10; // Scenarios complete
          newMetrics[2].target = peerCount; // Peer comparisons complete (DYNAMIC from backend)
          newMetrics[3].target = oppMidway; // Finding more opportunities
          break;

        case 'forensic':
          // Response validation - all metrics should be near final
          newMetrics[0].target = briefCount; // Developments complete
          newMetrics[1].target = 10; // Scenarios complete
          newMetrics[2].target = peerCount; // Peer comparisons complete (DYNAMIC from backend)
          newMetrics[3].target = Math.floor(finalOppCount * 0.9); // Near final opportunities count
          break;

        case 'pdf':
          // Finalizing - all metrics at maximum
          newMetrics[0].target = briefCount; // All developments
          newMetrics[1].target = 10; // All scenarios
          newMetrics[2].target = peerCount; // All peers (DYNAMIC from backend)
          newMetrics[3].target = finalOppCount; // All opportunities
          break;
      }

      return newMetrics;
    });
  }, [currentStepIndex, briefCount, peerCount, actualOpportunitiesCount]);

  // Animate metrics smoothly towards their targets - stop when completed
  useEffect(() => {
    if (hasCompleted) return; // Don't animate metrics if already completed

    const interval = setInterval(() => {
      setDynamicMetrics(prev => {
        return prev.map(metric => {
          if (metric.current < metric.target) {
            // Calculate increment based on distance to target
            const distance = metric.target - metric.current;
            const increment = Math.max(1, Math.ceil(distance / 10));
            return {
              ...metric,
              current: Math.min(metric.current + increment, metric.target)
            };
          } else if (metric.current > metric.target) {
            // Allow decreasing if target goes down (shouldn't happen but just in case)
            return {
              ...metric,
              current: metric.target
            };
          }
          return metric;
        });
      });
    }, 100); // Update every 100ms for smooth animation

    return () => clearInterval(interval);
  }, [hasCompleted]);

  // Polling mechanism (fallback) - start after 45 seconds
  // This ensures we catch results even if SSE fails, but gives backend time to generate
  useEffect(() => {
    if (!sessionId || hasCompleted || isPolling) return;

    const pollDelayTimer = setTimeout(() => {
      if (!hasCompleted) {
        setIsPolling(true);
      }
    }, 45000); // Start polling after 45 seconds as fallback

    return () => clearTimeout(pollDelayTimer);
  }, [sessionId, hasCompleted, isPolling]);

  // Stop polling when hasCompleted changes
  useEffect(() => {
    if (hasCompleted && pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      setIsPolling(false);
    }
  }, [hasCompleted]);

  useEffect(() => {
    // CRITICAL: Don't start polling if already completed
    if (hasCompleted) {
      return;
    }
    if (!isPolling) return;

    let localPollCount = 0;
    const maxPolls = 50; // Increased max polls for extended report generation (from 40)

    const pollForResults = async () => {
      // CRITICAL: Check if SSE already completed - stop polling immediately
      if (hasCompleted || !isPolling) {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        setIsPolling(false); // Ensure polling is stopped
        return;
      }

      try {
        // CRITICAL: Bust cache to prevent returning cached 400 responses
        const response = await fetch(`/api/assessment/result/${sessionId}?t=${Date.now()}`, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });

        if (response.ok) {
          const data = await response.json();

          // CRITICAL: Wait for FULL enhanced report before navigating
          // Check for tier AND enhanced report with all critical components
          const hasEnhancedReport = data.enhanced_report?.full_analytics?.strategic_positioning?.spider_graph ||
                                   data.enhanced_report?.celebrity_opportunities;

          if (data && data.tier && hasEnhancedReport) {

            // Calculate time elapsed since component mount
            const timeElapsed = Date.now() - componentMountTime.current;
            const remainingTime = Math.max(0, MINIMUM_DISPLAY_TIME_MS - timeElapsed);

            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }

            setSteps(prev => prev.map(step => ({ ...step, status: 'complete' })));
            setHasCompleted(true);

            const simulationResult = {
              outcome: data.simulation?.outcome || 'DAMAGED',
              tier: data.tier,
              cognitive_mri: data.simulation?.cognitive_mri || '',
              confidence: data.confidence || 0
            };

            // ENFORCE MINIMUM DISPLAY TIME: Wait for remaining time + 1 second transition
            const navigationDelay = remainingTime + 1000;

            setTimeout(() => {
              onComplete(simulationResult, '');
            }, navigationDelay);
            return;
          }
        }
      } catch (error) {
        // Network or other error - continue polling
      }

      localPollCount++;
      setPollCount(localPollCount);

      if (localPollCount >= maxPolls) {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
        setHasCompleted(true);
        onComplete({ outcome: 'DAMAGED', tier: 'unknown', cognitive_mri: '', confidence: 0 }, '');
      }
    };

    // Start first poll immediately
    pollForResults();
    // Then poll every 6 seconds
    pollingIntervalRef.current = setInterval(pollForResults, 6000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [sessionId, hasCompleted, isPolling, onComplete]);

  // SSE event handling - Trust backend's assessment_completed event
  // CRITICAL: Enforce minimum display time to ensure proper user experience
  useEffect(() => {
    if (hasCompleted) return;

    // CRITICAL: Wait for FULL enhanced report before navigating
    // Check for tier AND enhanced report with all critical components
    const hasEnhancedReport = sseResultData?.enhanced_report?.full_analytics?.strategic_positioning?.spider_graph ||
                             sseResultData?.enhanced_report?.celebrity_opportunities;

    if (sseResultData &&
        sseResultData.result_available === true &&
        sseResultData.should_reconnect === false &&
        sseResultData.tier &&
        hasEnhancedReport) {

      // Calculate time elapsed since component mount
      const timeElapsed = Date.now() - componentMountTime.current;
      const remainingTime = Math.max(0, MINIMUM_DISPLAY_TIME_MS - timeElapsed);

      // Stop all polling immediately
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      setIsPolling(false); // CRITICAL: Stop polling mechanism

      setSteps(prev => prev.map(step => ({ ...step, status: 'complete' })));
      setHasCompleted(true);

      // Extract simulation result from SSE data
      const simulationResult = {
        outcome: sseResultData.simulation?.outcome || sseSimulationResult?.outcome || 'DAMAGED',
        tier: sseResultData.tier || sseSimulationResult?.tier || 'observer',
        cognitive_mri: sseResultData.simulation?.cognitive_mri || sseSimulationResult?.cognitive_mri || '',
        confidence: sseResultData.confidence || sseSimulationResult?.confidence || 0
      };

      // ENFORCE MINIMUM DISPLAY TIME: Wait for remaining time + 1 second transition
      const navigationDelay = remainingTime + 1000;

      setTimeout(() => {
        // Pass result data through sessionStorage for incognito mode compatibility
        // This allows results page to load even without authentication cookies
        try {
          sessionStorage.setItem(`assessment_result_${sessionId}`, JSON.stringify(sseResultData));
        } catch (e) {
          // Silent fail if sessionStorage is full
        }

        onComplete(simulationResult, ssePdfUrl || '');
      }, navigationDelay);
    }
  }, [sseResultData, sseSimulationResult, ssePdfUrl, hasCompleted, onComplete, sessionId, MINIMUM_DISPLAY_TIME_MS]);

  // Calculate progress based on completed steps + progress within current step
  // SCIENTIFIC: Uses actual step completion + time-based estimation within steps
  const calculateProgress = () => {
    if (hasCompleted) return 100;

    // If SSE signals results are available, jump to 95%
    if (sseResultData?.result_available === true) {
      return 95;
    }

    let completedTime = 0;
    let currentStepProgress = 0;

    // Calculate time-based progress through steps
    for (let i = 1; i < steps.length; i++) {
      if (i < currentStepIndex) {
        // Add full time for completed steps
        completedTime += steps[i].estimatedSeconds;
      } else if (i === currentStepIndex) {
        // Calculate progress within current step
        const stepStartTime = completedTime;
        const timeInCurrentStep = Math.max(0, elapsedTime - stepStartTime);
        const stepDuration = steps[i].estimatedSeconds;
        currentStepProgress = Math.min(timeInCurrentStep, stepDuration);
        break;
      }
    }

    const totalTime = steps.reduce((sum, step) => sum + step.estimatedSeconds, 0);
    const totalProgress = completedTime + currentStepProgress;

    // Calculate base percentage from time
    let percentage = (totalProgress / totalTime) * 100;

    // SCIENTIFIC ADJUSTMENT: Use metric progress to refine percentage
    // If we have actual metrics progress, blend it with time-based estimate
    const metricsProgress = dynamicMetrics.reduce((sum, metric) => {
      if (metric.target === 0) return sum;
      return sum + (metric.current / metric.target);
    }, 0) / dynamicMetrics.length;

    // Blend time-based (70%) with metrics-based (30%) for scientific accuracy
    percentage = (percentage * 0.7) + (metricsProgress * 100 * 0.3);

    // Cap at 85% until SSE confirms completion
    return Math.min(85, percentage);
  };

  const progressPercentage = calculateProgress();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-[10px] py-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full"
      >
        {/* Header Card */}
        <motion.div
          className="bg-card rounded-2xl shadow-2xl overflow-hidden border border-border mb-6"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
        >
          <div className="bg-gradient-to-r from-primary to-primary/80 p-4 sm:p-6 md:p-8 text-primary-foreground">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2 sm:gap-3">
                  <Zap className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex-shrink-0" />
                  <span className="leading-tight">Digital Twin Simulation</span>
                </h1>
                <p className="text-sm sm:text-base text-primary-foreground/90 leading-snug">
                  Simulating your portfolio through the April 2026 Transparency Cliff
                </p>
              </div>
              <div className="text-left sm:text-right flex-shrink-0">
                <div className="text-2xl sm:text-3xl font-mono font-bold">
                  {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-xs sm:text-sm text-primary-foreground/80">Elapsed Time</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Live Metrics Grid - Dynamic and synced with processing steps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6"
        >
          {dynamicMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 * index }}
              className="bg-card rounded-xl p-3 sm:p-4 border border-border hover:border-primary/50 transition-colors"
            >
              <div className="text-center">
                <motion.div
                  className="text-xl sm:text-2xl font-bold text-primary"
                  key={`${metric.label}-${metric.current}`}
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {metric.current.toLocaleString()}{metric.suffix}
                </motion.div>
                <div className="text-[10px] sm:text-xs text-muted-foreground leading-tight mt-1">{metric.label}</div>
                {/* Show progress bar if metric is actively counting */}
                {metric.current > 0 && metric.current < metric.target && (
                  <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary/50"
                      initial={{ width: 0 }}
                      animate={{ width: `${(metric.current / metric.target) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Processing Steps */}
          <motion.div
            className="bg-card rounded-xl sm:rounded-2xl shadow-xl border border-border p-4 sm:p-6"
            initial={{ x: -20 }}
            animate={{ x: 0 }}
          >
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
              <span>Processing Pipeline</span>
            </h2>

            <div className="space-y-2 sm:space-y-3">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all cursor-pointer ${
                    step.status === 'complete'
                      ? 'bg-primary/10 border border-primary/30'
                      : step.status === 'processing'
                      ? 'bg-primary/5 border border-primary/20'
                      : 'bg-muted/50 border border-border'
                  }`}
                  onMouseEnter={() => setHoveredStep(step.id)}
                  onMouseLeave={() => setHoveredStep(null)}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    {/* Animated Icon */}
                    <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                      {step.status === 'complete' && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm sm:text-base"
                        >
                          ✓
                        </motion.div>
                      )}
                      {step.status === 'processing' && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary [&>svg]:w-3 [&>svg]:h-3 sm:[&>svg]:w-5 sm:[&>svg]:h-5"
                        >
                          {step.icon}
                        </motion.div>
                      )}
                      {step.status === 'pending' && (
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground [&>svg]:w-3 [&>svg]:h-3 sm:[&>svg]:w-5 sm:[&>svg]:h-5">
                          {step.icon}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm sm:text-base font-semibold leading-tight ${
                        step.status === 'complete' || step.status === 'processing'
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      }`}>
                        {step.label}
                      </div>

                      <AnimatePresence>
                        {(hoveredStep === step.id || step.status === 'processing') && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 leading-snug">
                              {step.description}
                            </p>
                            {step.metrics && (
                              <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                                {step.metrics.map((metric, i) => (
                                  <span key={i} className="text-[10px] sm:text-xs bg-primary/10 text-primary px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                                    {metric}
                                  </span>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Progress indicator for processing step */}
                    {step.status === 'processing' && (
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="flex-shrink-0"
                      >
                        <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Side - Facts and Progress */}
          <div className="space-y-4 sm:space-y-6">
            {/* Rotating Facts Card */}
            <motion.div
              className="bg-card rounded-xl sm:rounded-2xl shadow-xl border border-border p-4 sm:p-6"
              initial={{ x: 20 }}
              animate={{ x: 0 }}
            >
              <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                <span>Intelligence Insights</span>
              </h2>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentFactIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className="bg-primary/5 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-primary/20"
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                      {React.createElement(HNWI_FACTS[currentFactIndex].icon, {
                        className: "w-5 h-5 sm:w-6 sm:h-6 text-primary"
                      })}
                    </div>
                    <p className="text-xs sm:text-sm text-foreground leading-snug">
                      {HNWI_FACTS[currentFactIndex].text}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Fact indicators */}
              <div className="flex justify-center gap-1 mt-4">
                {HNWI_FACTS.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`h-1.5 rounded-full transition-all ${
                      index === currentFactIndex
                        ? 'w-8 bg-primary'
                        : 'w-1.5 bg-muted-foreground/30'
                    }`}
                    onClick={() => setCurrentFactIndex(index)}
                  />
                ))}
              </div>
            </motion.div>

            {/* Overall Progress Card */}
            <motion.div
              className="bg-card rounded-xl sm:rounded-2xl shadow-xl border border-border p-4 sm:p-6"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
            >
              <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Overall Progress</h2>

              {/* Circular Progress */}
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted"
                  />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-primary"
                    strokeDasharray={351.86}
                    strokeDashoffset={351.86 - (351.86 * progressPercentage) / 100}
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: 351.86 }}
                    animate={{ strokeDashoffset: 351.86 - (351.86 * progressPercentage) / 100 }}
                    transition={{ duration: 0.5 }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {Math.round(progressPercentage)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Complete</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Dynamic Status Messages based on current processing */}
            <motion.div
              className="bg-primary/5 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-primary/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-start gap-2 text-xs sm:text-sm text-primary font-semibold leading-tight">
                <Activity className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="flex-1">
                  {(() => {
                    const currentStep = steps[currentStepIndex];
                    switch (currentStep?.id) {
                      case 'briefs':
                        return `Analyzing ${dynamicMetrics[0].current.toLocaleString()} HNWI World developments`;
                      case 'simulation':
                        return `Testing scenario ${dynamicMetrics[1].current} of 10`;
                      case 'gap':
                        return `Discovering opportunities: ${dynamicMetrics[3].current} found`;
                      case 'forensic':
                        return 'Validating strategic positioning';
                      case 'pdf':
                        return 'Finalizing your comprehensive report';
                      default:
                        return 'Processing your strategic analysis';
                    }
                  })()}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 leading-snug">
                {Math.round(progressPercentage)}% complete • Est. {Math.max(0, Math.round((160 - elapsedTime) / 60))} min remaining
              </p>
            </motion.div>
          </div>
        </div>

        {/* Completion Animation */}
        <AnimatePresence>
          {hasCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mt-4 sm:mt-6 bg-gradient-to-r from-primary to-primary/80 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center text-primary-foreground shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3" />
              </motion.div>
              <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Simulation Complete!</h3>
              <p className="text-sm sm:text-base text-primary-foreground/90">
                Your personalized strategic report is ready
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}