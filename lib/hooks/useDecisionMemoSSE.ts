// lib/hooks/useDecisionMemoSSE.ts
// Real-time Server-Sent Events for Decision Memo progressive discovery

import { useState, useEffect, useRef } from 'react';

export interface Opportunity {
  title: string;
  location: string;
  tier: string;
  expected_return: string;
  alignment_score: number;
  reason: string;
  latitude?: number;
  longitude?: number;
  category?: string;
  industry?: string;
  minimum_investment?: string;
}

export interface Mistake {
  title: string;
  cost: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  fix: string;
  deadline?: string;
  jurisdiction?: string;
}

export interface IntelligenceMatch {
  title: string;
  urgency: number; // 0-10
  impact: string;
  action: string;
  deadline?: string;
  source?: string;
}

export interface PreviewData {
  opportunities_found?: number;
  mistakes_identified?: number;
  potential_savings?: string;
  preview_url: string;
  artifact?: any; // SFO Pattern Audit IC Artifact
  message?: string;
}

export const useDecisionMemoSSE = (intakeId: string | null) => {
  const [isConnected, setIsConnected] = useState(false);
  const [sseError, setSseError] = useState<string | null>(null);

  // Real-time discoveries
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [intelligenceMatches, setIntelligenceMatches] = useState<IntelligenceMatch[]>([]);

  // Preview state
  const [previewReady, setPreviewReady] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);

  // Memo state
  const [memoReady, setMemoReady] = useState(false);
  const [memoUrl, setMemoUrl] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const retryCountRef = useRef<number>(0);
  const maxRetries = 5;

  useEffect(() => {
    if (!intakeId) return;

    // Real SSE connection to backend
    // Construct SSE URL - use relative URL to go through Next.js API routes
    // This ensures backend URL is never exposed to the client
    const sseUrl = `/api/decision-memo/stream/${intakeId}`;

    console.log('🔌 Connecting to Decision Memo SSE:', sseUrl);

    // Create EventSource
    const eventSource = new EventSource(sseUrl, { withCredentials: true });
    eventSourceRef.current = eventSource;

    // Connection established
    eventSource.addEventListener('connected', (e) => {
      const data = JSON.parse(e.data);
      console.log('✅ DECISION MEMO SSE: Connected to stream', { intakeId: data.session_id || intakeId });
      setIsConnected(true);
      setSseError(null);
      retryCountRef.current = 0;
    });

    // Reconnection (after network interruption)
    eventSource.addEventListener('reconnected', (e) => {
      const data = JSON.parse(e.data);
      console.log('🔄 SSE Reconnected from event:', data.resumed_from_event);
      setIsConnected(true);
      setSseError(null);
    });

    // Opportunity found
    eventSource.addEventListener('opportunity_found', (e) => {
      console.log('📨 RAW SSE EVENT (opportunity_found):', e.data);
      try {
        const data = JSON.parse(e.data);
        console.log('💎 Opportunity Found:', data.opportunity || data);
        const opportunity = data.opportunity || data;
        setOpportunities(prev => [...prev, opportunity]);
      } catch (error) {
        console.error('❌ Failed to parse opportunity_found event:', error, e.data);
      }
    });

    // Mistake identified
    eventSource.addEventListener('mistake_identified', (e) => {
      const data = JSON.parse(e.data);
      console.log('⚠️ Mistake Identified:', data.mistake);
      setMistakes(prev => [...prev, data.mistake]);
    });

    // Intelligence match
    eventSource.addEventListener('intelligence_match', (e) => {
      const data = JSON.parse(e.data);
      console.log('📊 Intelligence Match:', data.intelligence);
      setIntelligenceMatches(prev => [...prev, data.intelligence]);
    });

    // Preview ready (after Q10 or SFO Pattern Audit completion)
    eventSource.addEventListener('preview_ready', (e) => {
      const data = JSON.parse(e.data);
      console.log('🎯 Preview Ready:', data);

      setPreviewReady(true);
      setPreviewData({
        opportunities_found: data.opportunities_found,
        mistakes_identified: data.mistakes_identified,
        potential_savings: data.potential_savings,
        preview_url: data.preview_url,
        artifact: data.artifact, // SFO Pattern Audit IC Artifact
        message: data.message
      });

      // Store preview URL for later
      if (typeof window !== 'undefined' && data.preview_url) {
        sessionStorage.setItem('preview_url', data.preview_url);
      }
    });

    // Memo generating (after payment)
    eventSource.addEventListener('memo_generating', (e) => {
      const data = JSON.parse(e.data);
      console.log('⏳ Memo Generating:', data);
      // Could add progress tracking here
    });

    // Memo ready (final PDF)
    eventSource.addEventListener('memo_ready', (e) => {
      const data = JSON.parse(e.data);
      console.log('📄 Memo Ready:', data.memo_url);

      setMemoReady(true);
      setMemoUrl(data.memo_url);

      // Close SSE connection (no longer needed)
      if (data.should_reconnect === false) {
        eventSource.close();
        setIsConnected(false);
      }
    });

    // Connection error handling with retry
    eventSource.onerror = (error) => {
      console.error('❌ SSE Error:', error);
      setIsConnected(false);
      retryCountRef.current++;

      // Stop reconnecting if max retries exceeded
      if (retryCountRef.current >= maxRetries) {
        setSseError('Connection failed after multiple attempts. Please refresh the page.');
        eventSource.close();
        return;
      }

      setSseError(`Connection interrupted. Reconnecting (attempt ${retryCountRef.current}/${maxRetries})...`);

      // EventSource will automatically reconnect with Last-Event-ID header
      // If connection fails for 5+ minutes, show error
      setTimeout(() => {
        if (eventSource.readyState === EventSource.CLOSED) {
          setSseError('Connection failed. Please refresh the page.');
        }
      }, 300000); // 5 minutes
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [intakeId]);

  return {
    // Connection status
    isConnected,
    sseError,

    // Discoveries
    opportunities,
    mistakes,
    intelligenceMatches,

    // Preview
    previewReady,
    previewData,

    // Memo
    memoReady,
    memoUrl,

    // Control
    disconnect: () => eventSourceRef.current?.close()
  };
};
