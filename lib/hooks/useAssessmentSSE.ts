// lib/hooks/useAssessmentSSE.ts
// Real-time Server-Sent Events for assessment calibration

import { useState, useEffect, useRef } from 'react';

export interface SSEEvent {
  type: 'connected' | 'insight' | 'tier_signal' | 'calibration_start' | 'calibration_filter' | 'calibration_complete' | 'simulation_result' | 'pdf_ready' | 'assessment_completed';
  data: any;
  timestamp: string;
}

export interface CalibrationFilterEvent {
  type: 'calibration_filter';
  filter: string;
  message: string;
  removed: number;
  remaining: number;
  timestamp: string;
}

export interface SimulationResult {
  outcome: 'SURVIVED' | 'DAMAGED' | 'DESTROYED';
  tier: string;
  cognitive_mri: string;
  confidence: number;
}

export const useAssessmentSSE = (sessionId: string | null) => {
  const [events, setEvents] = useState<SSEEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [resultData, setResultData] = useState<any>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const shouldReconnectRef = useRef<boolean>(true);
  const retryCountRef = useRef<number>(0);
  const maxRetries = 3; // Limit retries to prevent infinite loops

  useEffect(() => {
    if (!sessionId) return;

    // Reset retry count when sessionId changes
    retryCountRef.current = 0;

    // Construct SSE URL
    const sseUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/assessment/stream/${sessionId}`;

    // Create EventSource
    const eventSource = new EventSource(sseUrl, { withCredentials: true });
    eventSourceRef.current = eventSource;

    // Connection established
    eventSource.addEventListener('connected', (e) => {
      const data = JSON.parse(e.data);
      setIsConnected(true);
      setEvents(prev => [...prev, {
        type: 'connected',
        data,
        timestamp: new Date().toISOString()
      }]);
    });

    // Per-answer insight
    eventSource.addEventListener('insight', (e) => {
      const insight = JSON.parse(e.data);
      setEvents(prev => [...prev, {
        type: 'insight',
        data: insight,
        timestamp: new Date().toISOString()
      }]);
    });

    // Progressive tier signal
    eventSource.addEventListener('tier_signal', (e) => {
      const tierSignal = JSON.parse(e.data);
      setEvents(prev => [...prev, {
        type: 'tier_signal',
        data: tierSignal,
        timestamp: new Date().toISOString()
      }]);
    });

    // CALIBRATION START
    eventSource.addEventListener('calibration_start', (e) => {
      const data = JSON.parse(e.data);
      setIsCalibrating(true);
      setEvents(prev => [...prev, {
        type: 'calibration_start',
        data,
        timestamp: new Date().toISOString()
      }]);
    });

    // CALIBRATION FILTER
    eventSource.addEventListener('calibration_filter', (e) => {
      const filterData = JSON.parse(e.data);

      setEvents(prev => {
        const newEvents = [...prev, {
          type: 'calibration_filter',
          data: filterData,
          timestamp: new Date().toISOString()
        }];
        return newEvents;
      });
    });

    // CALIBRATION COMPLETE
    eventSource.addEventListener('calibration_complete', (e) => {
      const data = JSON.parse(e.data);
      setIsCalibrating(false);
      setEvents(prev => [...prev, {
        type: 'calibration_complete',
        data,
        timestamp: new Date().toISOString()
      }]);
    });

    // Digital Twin simulation result
    eventSource.addEventListener('simulation_result', (e) => {
      const result = JSON.parse(e.data);
      setSimulationResult(result);
      setEvents(prev => [...prev, {
        type: 'simulation_result',
        data: result,
        timestamp: new Date().toISOString()
      }]);
    });

    // PDF ready
    eventSource.addEventListener('pdf_ready', (e) => {
      const data = JSON.parse(e.data);
      setPdfUrl(data.pdf_url);
      setEvents(prev => [...prev, {
        type: 'pdf_ready',
        data,
        timestamp: new Date().toISOString()
      }]);
    });

    // Assessment completed
    eventSource.addEventListener('assessment_completed', (e) => {
      const completionData = JSON.parse(e.data);
      console.log('[SSE] Assessment completed event:', completionData);

      setIsComplete(true);
      setEvents(prev => [...prev, {
        type: 'assessment_completed',
        data: completionData,
        timestamp: new Date().toISOString()
      }]);

      // Respect backend's should_reconnect flag (NEW from backend)
      if (completionData.should_reconnect === false) {
        console.log('[SSE] Backend requested no reconnection - closing stream');
        shouldReconnectRef.current = false;
        eventSource.close();

        // If backend provides redirect URL, fetch results
        if (completionData.redirect_url) {
          console.log('[SSE] Fetching results from:', completionData.redirect_url);
          setRedirectUrl(completionData.redirect_url);

          // Fetch the complete result data for PDF generation
          fetch(completionData.redirect_url)
            .then(res => res.json())
            .then(data => {
              console.log('[SSE] Results fetched successfully:', data);
              setResultData(data);
            })
            .catch(err => {
              console.error('[SSE] Failed to fetch results:', err);
            });
        }
      } else {
        // Legacy behavior - close stream
        eventSource.close();
      }
    });

    // Error handling
    eventSource.onerror = (error) => {
      console.log('[SSE] Error occurred:', error);
      setIsConnected(false);
      retryCountRef.current++;

      // Stop reconnecting if max retries exceeded
      if (retryCountRef.current >= maxRetries) {
        console.log(`[SSE] Max retries (${maxRetries}) exceeded - stopping reconnection`);
        shouldReconnectRef.current = false;
        eventSource.close();
        return;
      }

      // Only auto-reconnect if backend allows it AND not complete
      if (shouldReconnectRef.current && !isComplete) {
        console.log(`[SSE] Auto-reconnecting in 3 seconds... (attempt ${retryCountRef.current}/${maxRetries})`);
        setTimeout(() => {
          // Browser will automatically reconnect
        }, 3000);
      } else {
        console.log('[SSE] No reconnection - closing stream');
        eventSource.close();
      }
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
    };
  }, [sessionId, isComplete]);

  // Get calibration events (for animation)
  const calibrationEvents = events.filter(e =>
    e.type === 'calibration_filter'
  ).map(e => e.data);

  // Get latest tier signal
  const latestTierSignal = events
    .filter(e => e.type === 'tier_signal')
    .map(e => e.data)
    .pop();

  return {
    events,
    isConnected,
    isCalibrating,
    calibrationEvents,
    latestTierSignal,
    simulationResult,
    pdfUrl,
    isComplete,
    redirectUrl,
    resultData,
    disconnect: () => eventSourceRef.current?.close()
  };
};
