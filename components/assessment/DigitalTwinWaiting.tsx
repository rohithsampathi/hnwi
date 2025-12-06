// components/assessment/DigitalTwinWaiting.tsx
// Waiting screen during Digital Twin simulation

"use client";

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { SimulationResult } from '@/lib/hooks/useAssessmentSSE';

interface DigitalTwinWaitingProps {
  sessionId: string;
  onComplete: (result: SimulationResult, pdfUrl: string) => void;
  testCompletionTime?: Date | null;
  // SSE data passed from parent (to avoid duplicate connections)
  simulationResult: SimulationResult | null;
  pdfUrl: string | null;
  resultData: any;
}

type ProcessingStep = {
  id: string;
  label: string;
  estimatedSeconds: number;
  status: 'pending' | 'processing' | 'complete';
};

export function DigitalTwinWaiting({
  sessionId,
  onComplete,
  testCompletionTime,
  simulationResult: sseSimulationResult, // Renamed to avoid conflict
  pdfUrl: ssePdfUrl, // Renamed to avoid conflict
  resultData: sseResultData // Renamed to avoid conflict
}: DigitalTwinWaitingProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [briefCount, setBriefCount] = useState<number>(1900); // Default fallback
  const [pollCount, setPollCount] = useState(0);
  const [isPolling, setIsPolling] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { id: 'assessment', label: 'Assessment completed', estimatedSeconds: 0, status: 'complete' },
    { id: 'briefs', label: 'Retrieving 20+ HNWI World briefs', estimatedSeconds: 30, status: 'processing' },
    { id: 'simulation', label: 'Running Digital Twin simulation', estimatedSeconds: 100, status: 'pending' },
    { id: 'gap', label: 'Generating Gap Analysis', estimatedSeconds: 30, status: 'pending' },
    { id: 'forensic', label: 'Response validation check', estimatedSeconds: 10, status: 'pending' },
    { id: 'pdf', label: 'Creating cryptographically signed PDF', estimatedSeconds: 10, status: 'pending' },
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

  // Update steps based on elapsed time
  useEffect(() => {
    let cumulativeTime = 0;
    const updatedSteps = steps.map(step => {
      if (step.id === 'assessment') return { ...step, status: 'complete' as const };

      cumulativeTime += step.estimatedSeconds;

      if (elapsedTime >= cumulativeTime) {
        return { ...step, status: 'complete' as const };
      } else if (elapsedTime >= cumulativeTime - step.estimatedSeconds) {
        return { ...step, status: 'processing' as const };
      }
      return { ...step, status: 'pending' as const };
    });

    setSteps(updatedSteps);
  }, [elapsedTime]);

  // PRIMARY MECHANISM: Start polling immediately (works on all browsers including mobile)
  useEffect(() => {
    if (!sessionId || hasCompleted || isPolling) return;

    setIsPolling(true);
    let localPollCount = 0;
    const maxPolls = 60; // 60 polls @ 3 seconds = 3 minutes max

    const pollForResults = async () => {
      try {
        const response = await fetch(`/api/assessment/results/${sessionId}`);

        if (response.ok) {
          const data = await response.json();

          // Check if results are ready (has tier and simulation)
          if (data && data.tier) {
            // Clear polling interval
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }

            // Mark all steps as complete
            setSteps(prev => prev.map(step => ({ ...step, status: 'complete' })));
            setHasCompleted(true);

            // Create simulation result from the data
            const simulationResult = {
              outcome: data.simulation?.outcome || 'DAMAGED',
              tier: data.tier,
              cognitive_mri: data.simulation?.cognitive_mri || '',
              confidence: data.confidence || 0
            };

            // Wait briefly for UI update then redirect
            setTimeout(() => {
              onComplete(simulationResult, '');
            }, 1000);
            return;
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }

      // Increment poll count
      localPollCount++;
      setPollCount(localPollCount);

      // Stop after max attempts
      if (localPollCount >= maxPolls) {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
        // Force completion after timeout
        setHasCompleted(true);
        onComplete({ outcome: 'DAMAGED', tier: 'unknown', cognitive_mri: '', confidence: 0 }, '');
      }
    };

    // Start polling immediately
    pollForResults();

    // Then poll every 3 seconds
    pollingIntervalRef.current = setInterval(pollForResults, 3000);

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [sessionId, hasCompleted, isPolling, onComplete]);

  // OPTIONAL: Listen for SSE events if they work (desktop fallback)
  useEffect(() => {
    // If we already completed via polling, ignore SSE
    if (hasCompleted) return;

    // If SSE provides data, use it (but don't rely on it)
    if (sseSimulationResult && sseResultData) {
      // Clear polling if still running
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }

      // Mark all steps as complete
      setSteps(prev => prev.map(step => ({ ...step, status: 'complete' })));
      setHasCompleted(true);

      // Use SSE data for completion
      setTimeout(() => {
        onComplete(sseSimulationResult, '');
      }, 1000);
    }
  }, [sseSimulationResult, sseResultData, hasCompleted, onComplete]);

  const totalEstimatedSeconds = steps.reduce((sum, step) => sum + step.estimatedSeconds, 0);
  const progressPercentage = Math.min((elapsedTime / totalEstimatedSeconds) * 100, 95); // Cap at 95% until PDF ready

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-card rounded-2xl shadow-2xl overflow-hidden border border-border"
      >
        {/* Header */}
        <div className="bg-primary p-8 text-primary-foreground text-center">
          <h1 className="text-3xl font-bold mb-2">
            Digital Twin Simulation
          </h1>
          <p className="text-primary-foreground/80">
            Simulating your portfolio through the April 2026 Transparency Cliff
          </p>
        </div>

        {/* Progress Overview */}
        <div className="p-8 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-foreground">
              Overall Progress
            </span>
            <div className="flex items-center gap-4">
              {testCompletionTime && (
                <span className="text-sm font-mono text-muted-foreground">
                  Test Time: {testCompletionTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                </span>
              )}
              <span className="text-sm font-mono text-muted-foreground">
                Elapsed: {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
          <div className="h-4 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-primary"
            />
          </div>
        </div>

        {/* Processing Steps */}
        <div className="p-8 space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                step.status === 'complete'
                  ? 'bg-primary/10 border border-primary/30'
                  : step.status === 'processing'
                  ? 'bg-primary/5 border border-primary/20'
                  : 'bg-muted/50 border border-border'
              }`}
            >
              {/* Icon */}
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                {step.status === 'complete' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold"
                  >
                    ✓
                  </motion.div>
                )}
                {step.status === 'processing' && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full"
                  />
                )}
                {step.status === 'pending' && (
                  <div className="w-6 h-6 border-2 border-muted-foreground/30 rounded-full" />
                )}
              </div>

              {/* Label */}
              <div className="flex-1">
                <div className={`font-semibold ${
                  step.status === 'complete'
                    ? 'text-foreground'
                    : step.status === 'processing'
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                }`}>
                  {step.label}
                </div>
                {step.status === 'processing' && (
                  <div className="text-xs text-primary mt-1">
                    Processing...
                  </div>
                )}
              </div>

              {/* Duration */}
              {step.estimatedSeconds > 0 && step.status !== 'complete' && (
                <div className="flex-shrink-0 text-xs text-muted-foreground">
                  ~{step.estimatedSeconds}s
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 bg-muted/50 border-t border-border">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              This analysis requires deep pattern matching across {briefCount.toLocaleString()}+ HNWI World developments.
            </p>
            <p className="text-xs text-muted-foreground">
              Digital Twin simulation models your behavioral responses in crisis scenarios.
            </p>
          </div>
        </div>

        {/* Simulation Result Preview - show if polling detects completion */}
        {hasCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-primary/10 border-t-4 border-primary"
          >
            <div className="text-center">
              <h3 className="text-xl font-bold text-foreground mb-1">
                Simulation Complete
              </h3>
              <p className="text-sm text-muted-foreground">
                Finalizing your personalized report...
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
