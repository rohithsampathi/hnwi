// components/assessment/DigitalTwinWaitingInteractive.tsx
// Enhanced interactive waiting screen during Digital Twin simulation

"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SimulationResult } from '@/lib/hooks/useAssessmentSSE';
import { Globe, Brain, Shield, TrendingUp, AlertTriangle, Sparkles, Activity, Zap } from 'lucide-react';

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

// Rotating facts about HNWI World
const HNWI_FACTS = [
  { icon: Globe, text: "Analyzing patterns across 67 jurisdictions for wealth migration signals" },
  { icon: Brain, text: "Processing 1,900+ HNWI World developments since February 2023" },
  { icon: Shield, text: "Simulating your portfolio through 12 crisis scenarios" },
  { icon: TrendingUp, text: "Identifying opportunities worth $10M+ in cumulative value" },
  { icon: AlertTriangle, text: "Testing resilience against the April 2026 Transparency Cliff" },
  { icon: Sparkles, text: "Matching your DNA with 87 peer portfolios for benchmarking" }
];

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
  const [pollCount, setPollCount] = useState(0);
  const [isPolling, setIsPolling] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(1);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);

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
      metrics: ['1,900+ developments', '67 jurisdictions', '3 years of patterns']
    },
    {
      id: 'simulation',
      label: 'Running Digital Twin simulation',
      description: 'Modeling your behavior through crisis scenarios',
      icon: <Brain className="w-5 h-5" />,
      estimatedSeconds: 40,
      status: 'pending',
      metrics: ['12 crisis scenarios', '87 peer comparisons', '2026 cliff modeling']
    },
    {
      id: 'gap',
      label: 'Generating Extended Report',
      description: 'Analyzing peer benchmarks and strategic positioning',
      icon: <TrendingUp className="w-5 h-5" />,
      estimatedSeconds: 60,
      status: 'pending',
      metrics: ['Spider graph analysis', 'Peer comparison', 'Strategic gaps']
    },
    {
      id: 'forensic',
      label: 'Response validation check',
      description: 'Ensuring accuracy and consistency',
      icon: <Activity className="w-5 h-5" />,
      estimatedSeconds: 20,
      status: 'pending',
      metrics: ['Cross-validation', 'Confidence scoring', 'Peer benchmarking']
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

  // Fetch dynamic brief count
  useEffect(() => {
    async function fetchBriefCount() {
      try {
        const response = await fetch('/api/developments/counts');
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

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Rotate facts every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFactIndex(prev => (prev + 1) % HNWI_FACTS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
          newMetrics[1].target = 12; // Scenarios being tested
          newMetrics[2].target = 87; // Peer comparisons running
          newMetrics[3].target = 5; // Some opportunities found
          break;

        case 'gap':
          // Generating Extended Report - opportunities should be counting up
          newMetrics[0].target = briefCount; // Developments complete
          newMetrics[1].target = 12; // Scenarios complete
          newMetrics[2].target = 87; // Peer comparisons complete
          newMetrics[3].target = 23; // Finding more opportunities
          break;

        case 'forensic':
          // Response validation - all metrics should be near final
          newMetrics[0].target = briefCount; // Developments complete
          newMetrics[1].target = 12; // Scenarios complete
          newMetrics[2].target = 87; // Peer comparisons complete
          newMetrics[3].target = 31; // Final opportunities count
          break;

        case 'pdf':
          // Finalizing - all metrics at maximum
          newMetrics[0].target = briefCount; // All developments
          newMetrics[1].target = 12; // All scenarios
          newMetrics[2].target = 87; // All peers
          newMetrics[3].target = 35; // All opportunities
          break;
      }

      return newMetrics;
    });
  }, [currentStepIndex, briefCount]);

  // Animate metrics smoothly towards their targets
  useEffect(() => {
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
  }, []);

  // Polling mechanism (fallback)
  useEffect(() => {
    if (!sessionId || hasCompleted || isPolling) return;

    const pollDelayTimer = setTimeout(() => {
      if (!sseSimulationResult && !hasCompleted) {
        setIsPolling(true);
      }
    }, 45000); // Increased delay before starting to poll

    return () => clearTimeout(pollDelayTimer);
  }, [sessionId, hasCompleted, isPolling, sseSimulationResult]);

  useEffect(() => {
    if (!isPolling || hasCompleted) return;

    let localPollCount = 0;
    const maxPolls = 40; // Increased max polls for extended report generation

    const pollForResults = async () => {
      try {
        const response = await fetch(`/api/assessment/result/${sessionId}`);

        if (response.ok) {
          const data = await response.json();

          // Check if BOTH basic results AND enhanced report are ready
          if (data && data.tier && data.enhanced_report?.full_analytics?.strategic_positioning) {
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

            setTimeout(() => {
              onComplete(simulationResult, '');
            }, 1000);
            return;
          }
        }
      } catch (error) {
        // Silent fail
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

    pollForResults();
    pollingIntervalRef.current = setInterval(pollForResults, 5000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [sessionId, hasCompleted, isPolling, onComplete]);

  // SSE event handling - wait for enhanced report
  useEffect(() => {
    if (hasCompleted) return;

    if (sseSimulationResult && sseResultData) {
      // Check if BOTH basic results AND enhanced report are ready
      if (sseResultData.result_available === true &&
          sseResultData.enhanced_report_ready === true) {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }

        setSteps(prev => prev.map(step => ({ ...step, status: 'complete' })));
        setHasCompleted(true);

        setTimeout(() => {
          onComplete(sseSimulationResult, '');
        }, 1000);
      }
    }
  }, [sseSimulationResult, sseResultData, hasCompleted, onComplete]);

  // Calculate progress based on completed steps + progress within current step
  const calculateProgress = () => {
    if (hasCompleted) return 100;

    let completedTime = 0;
    let currentStepProgress = 0;

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
    return Math.min(95, (totalProgress / totalTime) * 100); // Cap at 95% until fully complete
  };

  const progressPercentage = calculateProgress();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
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
          <div className="bg-gradient-to-r from-primary to-primary/80 p-8 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                  <Zap className="w-8 h-8" />
                  Digital Twin Simulation
                </h1>
                <p className="text-primary-foreground/90">
                  Simulating your portfolio through the April 2026 Transparency Cliff
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-mono font-bold">
                  {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-primary-foreground/80">Elapsed Time</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Live Metrics Grid - Dynamic and synced with processing steps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-4 gap-4 mb-6"
        >
          {dynamicMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 * index }}
              className="bg-card rounded-xl p-4 border border-border hover:border-primary/50 transition-colors"
            >
              <div className="text-center">
                <motion.div
                  className="text-2xl font-bold text-primary"
                  key={`${metric.label}-${metric.current}`}
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {metric.current.toLocaleString()}{metric.suffix}
                </motion.div>
                <div className="text-xs text-muted-foreground">{metric.label}</div>
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
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Processing Steps */}
          <motion.div
            className="bg-card rounded-2xl shadow-xl border border-border p-6"
            initial={{ x: -20 }}
            animate={{ x: 0 }}
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Processing Pipeline
            </h2>

            <div className="space-y-3">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative p-4 rounded-xl transition-all cursor-pointer ${
                    step.status === 'complete'
                      ? 'bg-primary/10 border border-primary/30'
                      : step.status === 'processing'
                      ? 'bg-primary/5 border border-primary/20'
                      : 'bg-muted/50 border border-border'
                  }`}
                  onMouseEnter={() => setHoveredStep(step.id)}
                  onMouseLeave={() => setHoveredStep(null)}
                >
                  <div className="flex items-start gap-3">
                    {/* Animated Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {step.status === 'complete' && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground"
                        >
                          ✓
                        </motion.div>
                      )}
                      {step.status === 'processing' && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary"
                        >
                          {step.icon}
                        </motion.div>
                      )}
                      {step.status === 'pending' && (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                          {step.icon}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className={`font-semibold ${
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
                            <p className="text-xs text-muted-foreground mt-1">
                              {step.description}
                            </p>
                            {step.metrics && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {step.metrics.map((metric, i) => (
                                  <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
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
                        <Sparkles className="w-5 h-5 text-primary" />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Side - Facts and Progress */}
          <div className="space-y-6">
            {/* Rotating Facts Card */}
            <motion.div
              className="bg-card rounded-2xl shadow-xl border border-border p-6"
              initial={{ x: 20 }}
              animate={{ x: 0 }}
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Intelligence Insights
              </h2>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentFactIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className="bg-primary/5 rounded-xl p-4 border border-primary/20"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {React.createElement(HNWI_FACTS[currentFactIndex].icon, {
                        className: "w-6 h-6 text-primary"
                      })}
                    </div>
                    <p className="text-sm text-foreground">
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
              className="bg-card rounded-2xl shadow-xl border border-border p-6"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
            >
              <h2 className="text-xl font-bold mb-4">Overall Progress</h2>

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

              <div className="text-center text-sm text-muted-foreground">
                Analyzing {briefCount.toLocaleString()}+ HNWI World developments
              </div>
            </motion.div>

            {/* Dynamic Status Messages based on current processing */}
            <motion.div
              className="bg-primary/5 rounded-xl p-4 border border-primary/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-2 text-sm text-primary font-semibold">
                <Activity className="w-4 h-4" />
                {(() => {
                  const currentStep = steps[currentStepIndex];
                  switch (currentStep?.id) {
                    case 'briefs':
                      return `Analyzing ${dynamicMetrics[0].current.toLocaleString()} HNWI World developments`;
                    case 'simulation':
                      return `Testing scenario ${dynamicMetrics[1].current} of 12`;
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
              </div>
              <p className="text-xs text-muted-foreground mt-1">
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
              className="mt-6 bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 text-center text-primary-foreground shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                <Sparkles className="w-12 h-12 mx-auto mb-3" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-2">Simulation Complete!</h3>
              <p className="text-primary-foreground/90">
                Your personalized strategic report is ready
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}