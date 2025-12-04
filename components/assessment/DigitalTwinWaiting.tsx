// components/assessment/DigitalTwinWaiting.tsx
// Waiting screen during Digital Twin simulation

"use client";

import { useEffect, useState } from 'react';
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
  simulationResult,
  pdfUrl,
  resultData
}: DigitalTwinWaitingProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [briefCount, setBriefCount] = useState<number>(1900); // Default fallback
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

  // Listen for simulation result
  useEffect(() => {
    if (simulationResult) {
      // Mark simulation step as complete
      setSteps(prev => prev.map(step =>
        step.id === 'simulation' ? { ...step, status: 'complete' } : step
      ));
    }
  }, [simulationResult]);

  // Listen for assessment completion (with resultData)
  useEffect(() => {
    // CRITICAL: Wait for resultData (fetched from assessment_completed event)
    // This contains pdf_data for client-side PDF generation
    if (resultData && simulationResult) {
      console.log('[DigitalTwin] Assessment completed with result data:', resultData);

      // Mark all steps as complete
      setSteps(prev => prev.map(step => ({ ...step, status: 'complete' })));

      // Wait 1 second then redirect
      setTimeout(() => {
        // Pass empty string for pdfUrl since we'll generate client-side from resultData
        onComplete(simulationResult, '');
      }, 1000);
    }
    // Fallback: If we get pdfUrl but no resultData (legacy behavior)
    else if (pdfUrl && simulationResult && !resultData) {
      console.log('[DigitalTwin] Using legacy pdfUrl:', pdfUrl);

      setSteps(prev => prev.map(step => ({ ...step, status: 'complete' })));

      setTimeout(() => {
        onComplete(simulationResult, pdfUrl);
      }, 1000);
    }
  }, [resultData, pdfUrl, simulationResult, onComplete]);

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

        {/* Simulation Result Preview */}
        {simulationResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-primary/10 border-t-4 border-primary"
          >
            <div className="text-center">
              <h3 className="text-xl font-bold text-foreground mb-1">
                Simulation Complete: {simulationResult.outcome}
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
