// components/decision-memo/PatternAuditWaitingInteractive.tsx
// Interactive waiting screen during SFO Pattern Audit generation

"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Brain,
  Shield,
  TrendingUp,
  AlertTriangle,
  Activity,
  Zap,
  Lightbulb,
  CheckCircle,
  FileText,
  Target,
  Clock
} from 'lucide-react';

interface PatternAuditWaitingProps {
  intakeId: string;
  onPreviewReady: () => void;
  sseConnected: boolean;
  ssePreviewReady: boolean;
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

const HNWI_FACTS = [
  { icon: Globe, text: "Cross-referencing your thesis against 1,875 wealth developments from 67 jurisdictions" },
  { icon: Brain, text: "Matching decision patterns from our library of 159 documented failure modes" },
  { icon: Shield, text: "Identifying liquidity timing conflicts and regulatory window closures" },
  { icon: TrendingUp, text: "Analyzing sequencing dependencies for optimal execution order" },
  { icon: AlertTriangle, text: "Stress-testing your decision posture against historical corridor signals" },
  { icon: FileText, text: "Generating IC-ready artifact with actionable next steps" }
];

export function PatternAuditWaitingInteractive({
  intakeId,
  onPreviewReady,
  sseConnected,
  ssePreviewReady
}: PatternAuditWaitingProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);

  const [dynamicMetrics, setDynamicMetrics] = useState([
    { label: "Developments Matched", current: 0, target: 47, suffix: "" },
    { label: "Failure Patterns", current: 0, target: 3, suffix: "" },
    { label: "Sequencing Rules", current: 0, target: 12, suffix: "" },
    { label: "Pattern Anchors", current: 0, target: 2, suffix: "" }
  ]);

  const [steps, setSteps] = useState<ProcessingStep[]>([
    {
      id: 'thesis',
      label: 'Parsing decision thesis',
      description: 'Extracting move description, expected outcome, and constraints',
      icon: <FileText className="w-5 h-5" />,
      estimatedSeconds: 3,
      status: 'processing',
      metrics: ['3 SFO-grade inputs', 'Structured extraction']
    },
    {
      id: 'developments',
      label: 'Matching HNWI World developments',
      description: 'Cross-referencing against 1,875+ wealth developments',
      icon: <Globe className="w-5 h-5" />,
      estimatedSeconds: 5,
      status: 'pending',
      metrics: ['1,875+ developments', '67 jurisdictions']
    },
    {
      id: 'patterns',
      label: 'Detecting failure patterns',
      description: 'Analyzing 159 documented failure modes for risks',
      icon: <AlertTriangle className="w-5 h-5" />,
      estimatedSeconds: 4,
      status: 'pending',
      metrics: ['159 failure modes', 'Historical corridor signals']
    },
    {
      id: 'sequencing',
      label: 'Computing optimal sequence',
      description: 'Determining execution order to avoid coordination failures',
      icon: <Target className="w-5 h-5" />,
      estimatedSeconds: 3,
      status: 'pending',
      metrics: ['Dependency mapping', 'Timeline optimization']
    },
    {
      id: 'artifact',
      label: 'Generating IC artifact',
      description: 'Compiling verdict, sequence, and next steps',
      icon: <Shield className="w-5 h-5" />,
      estimatedSeconds: 3,
      status: 'pending',
      metrics: ['Executive verdict', 'Actionable steps']
    }
  ]);

  // Timer
  useEffect(() => {
    if (hasCompleted) return;

    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [hasCompleted]);

  // Rotate facts every 4 seconds
  useEffect(() => {
    if (hasCompleted) return;

    const interval = setInterval(() => {
      setCurrentFactIndex(prev => (prev + 1) % HNWI_FACTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [hasCompleted]);

  // Progress through steps based on elapsed time
  useEffect(() => {
    if (hasCompleted) return;

    let targetStepIndex = 0;
    let cumulativeTime = 0;

    for (let i = 0; i < steps.length; i++) {
      if (elapsedTime >= cumulativeTime) {
        targetStepIndex = i;
        if (elapsedTime < cumulativeTime + steps[i].estimatedSeconds) {
          break;
        }
        cumulativeTime += steps[i].estimatedSeconds;
      }
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

      switch (currentStep.id) {
        case 'thesis':
          newMetrics[0].target = 10;
          newMetrics[1].target = 0;
          newMetrics[2].target = 0;
          newMetrics[3].target = 0;
          break;
        case 'developments':
          newMetrics[0].target = 47;
          newMetrics[1].target = 1;
          newMetrics[2].target = 3;
          newMetrics[3].target = 0;
          break;
        case 'patterns':
          newMetrics[0].target = 47;
          newMetrics[1].target = 3;
          newMetrics[2].target = 8;
          newMetrics[3].target = 1;
          break;
        case 'sequencing':
          newMetrics[0].target = 47;
          newMetrics[1].target = 3;
          newMetrics[2].target = 12;
          newMetrics[3].target = 2;
          break;
        case 'artifact':
          newMetrics[0].target = 47;
          newMetrics[1].target = 3;
          newMetrics[2].target = 12;
          newMetrics[3].target = 2;
          break;
      }

      return newMetrics;
    });
  }, [currentStepIndex, steps]);

  // Animate metrics towards targets
  useEffect(() => {
    if (hasCompleted) return;

    const interval = setInterval(() => {
      setDynamicMetrics(prev => {
        return prev.map(metric => {
          if (metric.current < metric.target) {
            const distance = metric.target - metric.current;
            const increment = Math.max(1, Math.ceil(distance / 5));
            return {
              ...metric,
              current: Math.min(metric.current + increment, metric.target)
            };
          }
          return metric;
        });
      });
    }, 150);

    return () => clearInterval(interval);
  }, [hasCompleted]);

  // Handle SSE preview ready
  useEffect(() => {
    if (ssePreviewReady && !hasCompleted) {
      // Mark all steps as complete
      setSteps(prev => prev.map(step => ({ ...step, status: 'complete' })));
      setHasCompleted(true);

      // Trigger callback after brief delay
      setTimeout(() => {
        onPreviewReady();
      }, 1500);
    }
  }, [ssePreviewReady, hasCompleted, onPreviewReady]);


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
                  <Brain className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex-shrink-0" />
                  <span className="leading-tight">Pattern Audit Analysis</span>
                </h1>
                <p className="text-sm sm:text-base text-primary-foreground/90 leading-snug">
                  Generating your IC-ready decision posture artifact
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

        {/* Live Metrics Grid */}
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
                    <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                      {step.status === 'complete' && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm sm:text-base"
                        >
                          <CheckCircle className="w-4 h-4" />
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

              <div className="flex justify-center gap-1 mt-4">
                {HNWI_FACTS.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
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
              <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center justify-between">
                <span>Overall Progress</span>
                <span className="text-primary font-mono text-base">
                  {Math.round((currentStepIndex / steps.length) * 100)}%
                </span>
              </h2>

              {/* Progress Bar */}
              <div className="h-3 bg-muted rounded-full overflow-hidden mb-4">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-primary/70"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStepIndex / steps.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Steps indicator */}
              <div className="flex justify-between mb-4">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step.status === 'complete'
                        ? 'bg-primary text-primary-foreground'
                        : step.status === 'processing'
                        ? 'bg-primary/20 text-primary ring-2 ring-primary ring-offset-2 ring-offset-background'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step.status === 'complete' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                ))}
              </div>

              <p className="text-center text-sm text-muted-foreground">
                This typically takes 2-3 minutes
              </p>
            </motion.div>

            {/* Status Message */}
            <motion.div
              className="bg-primary/5 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-primary/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-2 text-xs sm:text-sm text-primary font-semibold">
                {sseConnected ? (
                  <>
                    <Activity className="w-4 h-4 animate-pulse" />
                    <span>Connected to intelligence stream</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>Connecting to analysis engine...</span>
                  </>
                )}
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                {steps[currentStepIndex]?.label || 'Initializing...'}
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
              <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Analysis Complete!</h3>
              <p className="text-sm sm:text-base text-primary-foreground/90">
                Your decision posture preview is ready
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
