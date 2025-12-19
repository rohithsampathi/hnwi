// lib/hooks/useAssessmentState.ts
// State management for assessment flow

import { useState, useEffect } from 'react';

export interface Answer {
  choice_id: string;
  insight: {
    headline: string;
    explanation: string;
    evidence: string[];
    confidence: number;
    what_this_means: string;
  };
  tier_signal: {
    leading_tier: 'architect' | 'operator' | 'observer';
    confidence: number;
    scores: {
      architect: number;
      operator: number;
      observer: number;
    };
    answers_processed: number;
    certainty_level: string;
  };
  matching_briefs: Array<{
    devid: string;
    title: string;
    _id: string;
  }>;
  answered_at: string;
}

export interface ProgressiveSignal {
  leading_tier: 'architect' | 'operator' | 'observer';
  confidence: number;
  scores: {
    architect: number;
    operator: number;
    observer: number;
  };
  answers_processed: number;
  certainty_level: string;
}

export interface TermDefinition {
  term: string;
  full_name: string;
  definition: string;
  category: 'tax' | 'legal' | 'financial' | 'trust' | 'regulatory' | 'investment';
}

export interface Question {
  id: string;
  question_number: number;
  title: string;
  scenario: string;
  question_text: string;
  choices: Array<{
    id: string;
    text: string;
    tier_mapping: {
      architect: number;
      operator: number;
      observer: number;
    };
    dna_signal: string;
    insight_architect: string;
    insight_operator: string;
    insight_observer: string;
  }>;
  weight: number;
  terms?: TermDefinition[]; // Terms with tooltips provided by backend
}

export interface Progress {
  current: number;
  total: number;
  completed?: boolean;
}

export interface AssessmentResults {
  session_id: string;
  user_id?: string;
  tier: 'architect' | 'operator' | 'observer';
  confidence: number;
  simulation: {
    outcome: 'SURVIVED' | 'DAMAGED' | 'DESTROYED';
    tier: string;
    confidence: number;
    simulation_narrative: string;
    reasoning_trace: string;
    timestamp: string;
  };
  gap_analysis: string;
  forensic_validation: {
    likely_cheating: boolean;
    confidence: number;
    flags: string[];
    evidence: {
      avg_response_time: number;
      pattern_consistency: string;
    };
    verdict: string;
  };
  pdf_url: string;
  completed_at: string;
  answers_count: number;
  briefs_cited: string[];
  personalized_opportunities?: any[]; // Opportunities matching user's DNA
  answers?: any[]; // User's answers with opportunities
}

type AssessmentStatus = 'not_started' | 'in_progress' | 'generating_pdf' | 'complete';

export const useAssessmentState = () => {
  // Session management - check for stale data first
  const [sessionId, setSessionIdState] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    // Check if session ID exists and is valid (not stale)
    const storedId = localStorage.getItem('assessment_session_id');
    return storedId || null;
  });

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [progress, setProgress] = useState<Progress>({ current: 0, total: 10 });
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [progressiveSignals, setProgressiveSignals] = useState<ProgressiveSignal[]>([]);
  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [status, setStatus] = useState<AssessmentStatus>('not_started');

  // ROOT FIX: Clear stale assessment data on mount (PWA/mobile fix)
  useEffect(() => {
    const checkAndClearStaleData = () => {
      if (typeof window === 'undefined') return;

      const storedSessionId = localStorage.getItem('assessment_session_id');
      if (storedSessionId) {
        const progressKey = `assessment_progress_${storedSessionId}`;
        const savedProgress = localStorage.getItem(progressKey);

        if (savedProgress) {
          try {
            const data = JSON.parse(savedProgress);
            const lastUpdated = data.lastUpdated;

            // If data is older than 24 hours, clear it
            if (lastUpdated) {
              const hoursSinceUpdate = (Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60);
              if (hoursSinceUpdate > 24) {
                localStorage.removeItem('assessment_session_id');
                localStorage.removeItem(progressKey);
                setSessionIdState(null); // Clear the state too
              }
            }
          } catch (error) {
            // Invalid data, clear it
            localStorage.removeItem('assessment_session_id');
            localStorage.removeItem(progressKey);
            setSessionIdState(null);
          }
        }
      }
    };

    checkAndClearStaleData();
  }, []); // Only run once on mount

  // Persist session ID to localStorage
  const setSessionId = (newSessionId: string | null) => {
    setSessionIdState(newSessionId);
    if (typeof window !== 'undefined') {
      if (newSessionId) {
        localStorage.setItem('assessment_session_id', newSessionId);
      } else {
        localStorage.removeItem('assessment_session_id');
      }
    }
  };

  // Update answer
  const updateAnswer = (questionId: string, answer: Answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Add progressive signal
  const addProgressiveSignal = (signal: ProgressiveSignal) => {
    setProgressiveSignals(prev => [...prev, signal]);
  };

  // Clear all assessment data
  const clearAssessment = () => {
    setSessionId(null);
    setCurrentQuestion(null);
    setProgress({ current: 0, total: 40 });
    setAnswers({});
    setProgressiveSignals([]);
    setResults(null);
    setStatus('not_started');
  };

  // Load persisted state on mount (for resume capability)
  useEffect(() => {
    if (typeof window === 'undefined' || !sessionId) return;

    const savedProgress = localStorage.getItem(`assessment_progress_${sessionId}`);
    if (savedProgress) {
      try {
        const data = JSON.parse(savedProgress);
        setProgress(data.progress || { current: 0, total: 10 });
        setAnswers(data.answers || {});
        setProgressiveSignals(data.progressiveSignals || []);
        setCurrentQuestionIndex(data.currentQuestionIndex || 0);
        setStatus(data.status || 'in_progress');
      } catch (error) {
        // Silent fail
      }
    }
  }, [sessionId]);

  // Persist state to localStorage for resume capability
  useEffect(() => {
    if (typeof window === 'undefined' || !sessionId || status === 'not_started') return;

    const progressData = {
      progress,
      answers,
      progressiveSignals,
      status,
      lastUpdated: new Date().toISOString()
    };

    localStorage.setItem(`assessment_progress_${sessionId}`, JSON.stringify(progressData));
  }, [sessionId, progress, answers, progressiveSignals, status]);

  return {
    sessionId,
    currentQuestion,
    allQuestions,
    currentQuestionIndex,
    progress,
    answers,
    progressiveSignals,
    results,
    status,
    setSessionId,
    setCurrentQuestion,
    setAllQuestions,
    setCurrentQuestionIndex,
    setProgress,
    updateAnswer,
    addProgressiveSignal,
    setResults,
    setStatus,
    clearAssessment,
  };
};
