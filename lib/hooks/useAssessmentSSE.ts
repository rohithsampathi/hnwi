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
  const maxRetries = 8; // Increased retries for better resilience
  const isMobileRef = useRef<boolean>(false);
  const [reconnectTrigger, setReconnectTrigger] = useState<number>(0); // Trigger reconnection

  useEffect(() => {
    if (!sessionId) return;

    // SSE works on all modern browsers including PWAs
    // We'll use SSE as primary and polling as fallback

    // Construct SSE URL - use relative URL to go through Next.js API routes
    // This ensures backend URL is never exposed to the client
    const sseUrl = `/api/assessment/stream/${sessionId}`;

    // Create EventSource only for desktop
    const eventSource = new EventSource(sseUrl, { withCredentials: true });
    eventSourceRef.current = eventSource;

    // Connection established
    eventSource.addEventListener('connected', (e) => {
      const data = JSON.parse(e.data);
      setIsConnected(true);
      // Reset retry count on successful connection
      retryCountRef.current = 0;
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

      setIsComplete(true);
      setEvents(prev => [...prev, {
        type: 'assessment_completed',
        data: completionData,
        timestamp: new Date().toISOString()
      }]);

      // CRITICAL: Check if results are actually available before proceeding
      if (completionData.result_available === true) {
        // Respect backend's should_reconnect flag
        if (completionData.should_reconnect === false) {
          shouldReconnectRef.current = false;

          // IMMEDIATELY set result data with completion flag to trigger UI update
          setResultData({
            ...completionData,
            result_available: true,
            should_reconnect: false
          });

          // If backend provides redirect URL, fetch full results IMMEDIATELY
          if (completionData.redirect_url) {
            setRedirectUrl(completionData.redirect_url);

            // Fetch the complete result data for PDF generation
            // Use Promise.race to timeout after 5 seconds
            const fetchPromise = fetch(completionData.redirect_url)
              .then(res => {
                if (!res.ok) {
                  throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
              })
              .then(data => {
                setResultData({
                  ...data,
                  result_available: true,
                  should_reconnect: false
                });

                // Close SSE connection AFTER successful fetch
                eventSource.close();
              })
              .catch(err => {
                // Still set completion flag even if fetch fails
                // The component will use polling as fallback
                setResultData({
                  ...completionData,
                  result_available: true,
                  should_reconnect: false,
                  fetch_failed: true
                });
                eventSource.close();
              });

            // Don't close connection yet - wait for fetch to complete
            // This prevents race condition where connection closes before fetch starts
          } else {
            // No redirect URL provided, close connection
            eventSource.close();
          }
        } else {
          // Legacy behavior - should_reconnect is true, keep connection open
          setResultData({
            ...completionData,
            result_available: true
          });
        }
      }
    });

    // Error handling with exponential backoff
    eventSource.onerror = (error) => {
      setIsConnected(false);
      retryCountRef.current++;

      // Stop reconnecting if max retries exceeded
      if (retryCountRef.current >= maxRetries) {
        shouldReconnectRef.current = false;
        eventSource.close();
        return;
      }

      // Only auto-reconnect if backend allows it AND not complete
      if (shouldReconnectRef.current && !isComplete) {
        // Implement exponential backoff: 2s, 4s, 8s, 16s, capped at 20s
        const backoffTime = Math.min(2000 * Math.pow(2, retryCountRef.current - 1), 20000);

        setTimeout(() => {
          // Trigger reconnection by updating state
          // This will cause the useEffect to re-run and create a new EventSource
          if (shouldReconnectRef.current && !isComplete) {
            setReconnectTrigger(prev => prev + 1);
          }
        }, backoffTime);
      } else {
        eventSource.close();
      }
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
    };
  }, [sessionId, isComplete, reconnectTrigger]);

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
