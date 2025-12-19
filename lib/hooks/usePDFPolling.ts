// lib/hooks/usePDFPolling.ts
// Poll for PDF generation completion

import { useState, useEffect } from 'react';

interface PDFPollingState {
  isPolling: boolean;
  isReady: boolean;
  progress: number;
  stage: string;
  error: string | null;
}

const POLLING_STAGES = [
  { time: 0, progress: 0, text: 'Initializing intelligence gathering...' },
  { time: 5000, progress: 12, text: 'Analyzing KG v2 developments...' },
  { time: 10000, progress: 24, text: 'Processing MoEv4 intelligence...' },
  { time: 15000, progress: 36, text: 'Cross-referencing Command Centre...' },
  { time: 20000, progress: 48, text: 'Integrating Katherine SOTA v2...' },
  { time: 25000, progress: 60, text: 'Matching HNWI World patterns...' },
  { time: 30000, progress: 72, text: 'Analyzing Crown Vault structures...' },
  { time: 35000, progress: 84, text: 'Synthesizing Elite Pulse data...' },
  { time: 40000, progress: 92, text: 'Generating strategic mandates...' },
  { time: 45000, progress: 96, text: 'Creating PDF document...' },
];

export const usePDFPolling = (sessionId: string | null, shouldStart: boolean) => {
  const [state, setState] = useState<PDFPollingState>({
    isPolling: false,
    isReady: false,
    progress: 0,
    stage: POLLING_STAGES[0].text,
    error: null,
  });

  useEffect(() => {
    if (!sessionId || !shouldStart) return;

    let pollingInterval: NodeJS.Timeout;
    let stageIndex = 0;
    let stageTimeout: NodeJS.Timeout;

    setState({
      isPolling: true,
      isReady: false,
      progress: 0,
      stage: POLLING_STAGES[0].text,
      error: null,
    });

    // Update stages based on elapsed time
    const updateStage = () => {
      if (stageIndex < POLLING_STAGES.length - 1) {
        stageIndex++;
        setState(prev => ({
          ...prev,
          progress: POLLING_STAGES[stageIndex].progress,
          stage: POLLING_STAGES[stageIndex].text,
        }));

        const nextStageDelay =
          POLLING_STAGES[stageIndex + 1]?.time - POLLING_STAGES[stageIndex].time;

        if (nextStageDelay) {
          stageTimeout = setTimeout(updateStage, nextStageDelay);
        }
      }
    };

    // Start stage progression
    stageTimeout = setTimeout(updateStage, POLLING_STAGES[1].time);

    // Poll for actual PDF completion
    const checkPDFReady = async () => {
      try {
        const response = await fetch(`/api/assessment/${sessionId}/pdf`, {
          method: 'HEAD',
        });

        if (response.ok) {
          // PDF is ready!
          clearInterval(pollingInterval);
          clearTimeout(stageTimeout);

          setState({
            isPolling: false,
            isReady: true,
            progress: 100,
            stage: 'Intelligence brief complete!',
            error: null,
          });
        }
      } catch (error) {
        // Continue polling on error
      }
    };

    // Poll every 3 seconds
    pollingInterval = setInterval(checkPDFReady, 3000);

    // Start first check immediately
    checkPDFReady();

    // Cleanup on unmount
    return () => {
      clearInterval(pollingInterval);
      clearTimeout(stageTimeout);
    };
  }, [sessionId, shouldStart]);

  return state;
};
