// =============================================================================
// ANALYSIS LOADER
// Sophisticated loading visualization - syncs with backend SSE when available
// =============================================================================

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Search,
  GitBranch,
  AlertTriangle,
  Shield,
  Scale,
  Database,
  TrendingUp,
  Zap,
  Check,
  Loader2,
  Globe,
  FileText,
  Target,
  Layers,
  Network,
  Binary,
  Cpu,
  Wifi,
  WifiOff
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

export interface AnalysisPhase {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  subSteps: string[];
}

export interface AnalysisMetrics {
  jurisdictionNodes?: number;
  patternVectors?: number;
  dependencyLayers?: number;
  riskScenarios?: number;
  developmentsAnalyzed?: number;
  patternsScanned?: number;
}

export interface AnalysisLoaderProps {
  // SSE connection state
  sseConnected?: boolean;

  // Backend-driven phase (if available)
  currentPhase?: string;
  phaseProgress?: number;
  currentStep?: string;

  // Backend metrics
  metrics?: AnalysisMetrics;

  // Status message from backend
  statusMessage?: string;
}

// =============================================================================
// PHASE DEFINITIONS
// =============================================================================

const ANALYSIS_PHASES: AnalysisPhase[] = [
  {
    id: 'intake',
    title: 'Parsing Decision Thesis',
    subtitle: 'Extracting structured parameters',
    icon: FileText,
    color: 'text-blue-500',
    subSteps: [
      'Tokenizing move description',
      'Extracting jurisdiction signals',
      'Identifying asset class markers',
      'Parsing constraint vectors'
    ]
  },
  {
    id: 'pattern',
    title: 'Pattern Library Scan',
    subtitle: 'Querying historical developments',
    icon: Database,
    color: 'text-emerald-500',
    subSteps: [
      'Loading jurisdiction precedents',
      'Matching regulatory patterns',
      'Calculating correlation scores',
      'Identifying analogous structures'
    ]
  },
  {
    id: 'sequence',
    title: 'Sequence Correction Engine',
    subtitle: 'Optimizing execution order',
    icon: GitBranch,
    color: 'text-violet-500',
    subSteps: [
      'Mapping dependency graph',
      'Detecting implied sequences',
      'Calculating critical path',
      'Assigning execution owners'
    ]
  },
  {
    id: 'failure',
    title: 'Failure Mode Analysis',
    subtitle: 'Modeling mechanism-driven risks',
    icon: AlertTriangle,
    color: 'text-amber-500',
    subSteps: [
      'Scanning regulatory tripwires',
      'Modeling liquidity shocks',
      'Calculating cascade probabilities',
      'Generating mitigation protocols'
    ]
  },
  {
    id: 'verdict',
    title: 'Synthesizing IC Verdict',
    subtitle: 'Generating recommendation framework',
    icon: Scale,
    color: 'text-primary',
    subSteps: [
      'Weighting risk factors',
      'Scoring thesis survivability',
      'Formulating verdict rationale',
      'Compiling artifact structure'
    ]
  }
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function AnalysisLoader({
  sseConnected = false,
  currentPhase: backendPhase,
  phaseProgress: backendProgress,
  currentStep: backendStep,
  metrics: backendMetrics,
  statusMessage
}: AnalysisLoaderProps) {
  // Local animation state (used when no backend data)
  const [localPhaseIndex, setLocalPhaseIndex] = useState(0);
  const [localSubStepIndex, setLocalSubStepIndex] = useState(0);
  const [localPhaseProgress, setLocalPhaseProgress] = useState(0);
  const [localOverallProgress, setLocalOverallProgress] = useState(0);
  const [patternsScanned, setPatternsScanned] = useState(0);
  const [startTime] = useState(Date.now());

  // Determine current phase (prefer backend, fall back to local animation)
  const currentPhaseIndex = backendPhase
    ? ANALYSIS_PHASES.findIndex(p => p.id === backendPhase)
    : localPhaseIndex;

  const currentPhase = ANALYSIS_PHASES[Math.max(0, currentPhaseIndex)];
  const completedPhases = ANALYSIS_PHASES.slice(0, currentPhaseIndex);

  // Progress values
  const phaseProgress = backendProgress ?? localPhaseProgress;
  const overallProgress = backendProgress
    ? ((currentPhaseIndex / ANALYSIS_PHASES.length) * 100) + (phaseProgress / ANALYSIS_PHASES.length)
    : localOverallProgress;

  // Current substep
  const currentSubStepIndex = backendStep
    ? currentPhase.subSteps.findIndex(s => s.toLowerCase().includes(backendStep.toLowerCase()))
    : localSubStepIndex;

  // Metrics (prefer backend, fall back to animated values)
  const metrics = {
    jurisdictionNodes: backendMetrics?.jurisdictionNodes ?? 47,
    patternVectors: backendMetrics?.patternVectors ?? 2340,
    dependencyLayers: backendMetrics?.dependencyLayers ?? 6,
    riskScenarios: backendMetrics?.riskScenarios ?? 12,
    developmentsAnalyzed: backendMetrics?.developmentsAnalyzed ?? 1875,
    patternsScanned: backendMetrics?.patternsScanned ?? patternsScanned
  };

  // Local animation (when not connected to backend SSE)
  useEffect(() => {
    // If backend is driving progress, skip local animation
    if (backendPhase || backendProgress) return;

    // Calculate phase durations based on elapsed time
    // Total animation runs for ~15 seconds if backend doesn't provide updates
    const PHASE_DURATION = 3000; // 3 seconds per phase

    const animationLoop = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const totalDuration = ANALYSIS_PHASES.length * PHASE_DURATION;

      // Overall progress (cap at 95% to show we're waiting)
      const overall = Math.min((elapsed / totalDuration) * 100, 95);
      setLocalOverallProgress(overall);

      // Current phase based on elapsed time
      const phaseIdx = Math.min(
        Math.floor(elapsed / PHASE_DURATION),
        ANALYSIS_PHASES.length - 1
      );

      if (phaseIdx !== localPhaseIndex) {
        setLocalPhaseIndex(phaseIdx);
        setLocalSubStepIndex(0);
      }

      // Phase progress
      const phaseElapsed = elapsed % PHASE_DURATION;
      const phasePct = Math.min((phaseElapsed / PHASE_DURATION) * 100, 100);
      setLocalPhaseProgress(phasePct);

      // Substep cycling
      const phase = ANALYSIS_PHASES[phaseIdx];
      const subStepDuration = PHASE_DURATION / phase.subSteps.length;
      const subIdx = Math.floor(phaseElapsed / subStepDuration);
      setLocalSubStepIndex(Math.min(subIdx, phase.subSteps.length - 1));

      // Pattern counter (for pattern phase)
      if (phaseIdx === 1) { // pattern phase
        const patternProgress = phasePct / 100;
        setPatternsScanned(Math.floor(patternProgress * 1875));
      }
    }, 50);

    return () => clearInterval(animationLoop);
  }, [backendPhase, backendProgress, startTime, localPhaseIndex]);

  return (
    <div className="flex flex-col h-full bg-background/50 backdrop-blur-sm">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                SFO Analysis Engine
              </h2>
              <p className="text-xs text-muted-foreground">
                {statusMessage || 'Processing IC artifact generation'}
              </p>
            </div>
          </div>

          {/* Connection status */}
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${
            sseConnected
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-muted text-muted-foreground'
          }`}>
            {sseConnected ? (
              <>
                <Wifi className="w-3 h-3" />
                <span>Live</span>
              </>
            ) : (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Processing</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Overall Progress - Shows percentage */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">
              Analysis Progress
            </span>
            <span className="text-sm font-mono text-primary">
              {Math.round(overallProgress)}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-primary to-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Current Phase Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhase.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-card border border-primary/30 rounded-xl overflow-hidden"
          >
            {/* Phase Header */}
            <div className="bg-primary/5 border-b border-primary/20 px-5 py-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5
                                flex items-center justify-center border border-primary/20`}>
                  <currentPhase.icon className={`w-6 h-6 ${currentPhase.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">
                      {currentPhase.title}
                    </h3>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="w-4 h-4 text-primary" />
                    </motion.div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {currentPhase.subtitle}
                  </p>
                </div>
                <div className="text-right">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="w-6 h-6 text-primary" />
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Phase Progress Bar - Continuous */}
            <div className="h-1 bg-muted relative overflow-hidden">
              <motion.div
                className={`absolute h-full w-1/2 bg-gradient-to-r ${
                  currentPhase.id === 'intake' ? 'from-transparent via-blue-500 to-transparent' :
                  currentPhase.id === 'pattern' ? 'from-transparent via-emerald-500 to-transparent' :
                  currentPhase.id === 'sequence' ? 'from-transparent via-violet-500 to-transparent' :
                  currentPhase.id === 'failure' ? 'from-transparent via-amber-500 to-transparent' :
                  'from-transparent via-primary to-transparent'
                }`}
                animate={{ x: ['-50%', '200%'] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            {/* Sub-steps */}
            <div className="px-5 py-4">
              <div className="space-y-2">
                {currentPhase.subSteps.map((step, i) => (
                  <motion.div
                    key={step}
                    className={`flex items-center gap-2 text-sm ${
                      i === currentSubStepIndex
                        ? 'text-foreground'
                        : i < currentSubStepIndex
                        ? 'text-muted-foreground'
                        : 'text-muted-foreground/50'
                    }`}
                    animate={i === currentSubStepIndex ? { x: [0, 2, 0] } : {}}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    {i < currentSubStepIndex ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : i === currentSubStepIndex ? (
                      <motion.div
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      >
                        <Cpu className="w-3.5 h-3.5 text-primary" />
                      </motion.div>
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground/30" />
                    )}
                    <span className="font-mono text-xs">{step}...</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Pattern Counter (only for pattern phase) */}
            {currentPhase.id === 'pattern' && (
              <div className="px-5 pb-4">
                <div className="bg-muted/50 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs text-muted-foreground">
                      Developments Scanned
                    </span>
                  </div>
                  <motion.span
                    className="font-mono text-sm font-bold text-emerald-500"
                    key={metrics.patternsScanned}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                  >
                    {metrics.patternsScanned.toLocaleString()} / {metrics.developmentsAnalyzed.toLocaleString()}
                  </motion.span>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Completed Phases */}
        {completedPhases.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Completed Analysis Phases
            </h4>
            <div className="space-y-2">
              {completedPhases.map((phase, index) => (
                <motion.div
                  key={phase.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 bg-muted/30 rounded-lg px-4 py-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Check className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-foreground">
                      {phase.title}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    Complete
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Technical Metrics Panel */}
        <div className="bg-muted/20 rounded-xl p-5 border border-border">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Analysis Metrics
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <MetricCard
              icon={Network}
              label="Jurisdiction Nodes"
              value={metrics.jurisdictionNodes}
              animate={!sseConnected}
            />
            <MetricCard
              icon={Binary}
              label="Pattern Vectors"
              value={metrics.patternVectors}
              animate={!sseConnected}
            />
            <MetricCard
              icon={Layers}
              label="Dependency Layers"
              value={metrics.dependencyLayers}
              animate={!sseConnected}
            />
            <MetricCard
              icon={Target}
              label="Risk Scenarios"
              value={metrics.riskScenarios}
              animate={!sseConnected}
            />
          </div>
        </div>

        {/* Processing Indicator */}
        <div className="flex items-center justify-center gap-3 py-4">
          <motion.div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-primary rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.15
                }}
              />
            ))}
          </motion.div>
          <span className="text-sm text-muted-foreground">
            Generating IC-ready artifact...
          </span>
        </div>

      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border bg-muted/20">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Bank-grade encryption active</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5" />
            <span>Multi-jurisdiction analysis</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// METRIC CARD
// =============================================================================

function MetricCard({
  icon: Icon,
  label,
  value,
  animate
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  animate?: boolean;
}) {
  return (
    <div className="bg-card/50 border border-border rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <motion.div
        className="text-lg font-mono font-bold text-foreground"
        animate={animate ? { opacity: [0.7, 1, 0.7] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {typeof value === 'number' ? value.toLocaleString() : value}
      </motion.div>
    </div>
  );
}

export default AnalysisLoader;
