// app/(authenticated)/simulation/page.tsx
// Complete C10 Simulation with SSE, calibration, and Digital Twin simulation

"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AssessmentLanding } from '@/components/assessment/AssessmentLanding';
import { MapIntroduction } from '@/components/assessment/MapIntroduction';
import { AssessmentQuestion } from '@/components/assessment/AssessmentQuestion';
import { DigitalTwinWaitingInteractive as DigitalTwinWaiting } from '@/components/assessment/DigitalTwinWaitingInteractive';
import { usePageTitle } from '@/hooks/use-page-title';
import { useAssessmentState, Question } from '@/lib/hooks/useAssessmentState';
import { useAssessmentAPI } from '@/lib/hooks/useAssessmentAPI';
import { useAssessmentSSE } from '@/lib/hooks/useAssessmentSSE';
import { getCurrentUser } from '@/lib/auth-manager';
import { CrownLoader } from '@/components/ui/crown-loader';

type FlowStage = 'landing' | 'map_intro' | 'retake_locked' | 'assessment' | 'digital_twin';

// MODULE-LEVEL FLAGS: Survive component re-mounts (same pattern as vault in AssessmentLanding)
// These persist through React re-renders, parent updates, auth changes, router state
// But reset on page refresh/navigation (desired behavior)
let simulationFlowStarted = false; // Set when user clicks "Begin the Drill"
let assessmentSessionActive = false; // Set when API returns questions

export default function AuthenticatedAssessmentPage() {
  const router = useRouter();

  // MOBILE FIX: Initialize flowStage from localStorage to survive component remounts
  const getInitialFlowStage = (): FlowStage => {
    if (typeof window === 'undefined') return 'landing';

    // Check if there's an active assessment session
    const sessionId = localStorage.getItem('assessment_session_id');
    const savedFlowStage = localStorage.getItem('assessment_flow_stage');

    if (sessionId && savedFlowStage) {
      // Validate the saved stage is a valid FlowStage
      const validStages: FlowStage[] = ['landing', 'map_intro', 'retake_locked', 'assessment', 'digital_twin'];
      if (validStages.includes(savedFlowStage as FlowStage)) {
        // Mark that we've progressed if we're past landing
        if (savedFlowStage !== 'landing') {
          simulationFlowStarted = true;
          assessmentSessionActive = true;
        }
        return savedFlowStage as FlowStage;
      }
    }

    return 'landing';
  };

  const [flowStage, setFlowStageState] = useState<FlowStage>(getInitialFlowStage);
  const hasProgressedPastLanding = useRef(flowStage !== 'landing'); // Initialize based on flowStage
  const [user, setUser] = useState<any>(null);
  const [syntheticCalibrationEvents, setSyntheticCalibrationEvents] = useState<any[]>([]);
  const [testCompletionTime, setTestCompletionTime] = useState<Date | null>(null);
  const hasCheckedExistingRef = useRef(false);
  const shouldAbortRedirect = useRef(flowStage !== 'landing'); // Prevent redirects if already in flow

  // Wrapper for setFlowStage that also persists to localStorage
  const setFlowStage = (stage: FlowStage) => {
    setFlowStageState(stage);
    if (typeof window !== 'undefined') {
      localStorage.setItem('assessment_flow_stage', stage);
    }
  };

  // MOBILE FIX: Only clear stale state, NOT active sessions
  useEffect(() => {
    const clearStaleStateOnly = () => {
      if (typeof window === 'undefined') return;

      // Check if there's an ACTIVE assessment session
      const sessionId = localStorage.getItem('assessment_session_id');
      const savedFlowStage = localStorage.getItem('assessment_flow_stage');

      // If there's an active session (sessionId exists and flowStage is not landing)
      // DO NOT clear anything - this is a remount during active assessment
      if (sessionId && savedFlowStage && savedFlowStage !== 'landing') {
        // Active session detected - skip clearing
        hasProgressedPastLanding.current = true;
        shouldAbortRedirect.current = true;
        return;
      }

      // No active session - safe to clear stale sessionStorage only
      // (localStorage is managed by useAssessmentState hook)
      const keysToRemove = Object.keys(sessionStorage).filter(key =>
        key.includes('assessment') || key.includes('simulation')
      );
      keysToRemove.forEach(key => sessionStorage.removeItem(key));
    };

    clearStaleStateOnly();
  }, []); // Only run once on mount

  // Clear vault session storage when user navigates away or closes tab
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear the session storage when leaving the assessment
      sessionStorage.removeItem('assessmentVaultShownThisSession');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const {
    sessionId,
    allQuestions,
    currentQuestionIndex,
    progress,
    status,
    setSessionId,
    setAllQuestions,
    setCurrentQuestionIndex,
    setProgress,
    updateAnswer,
    addProgressiveSignal,
    setStatus,
  } = useAssessmentState();

  const {
    startAssessment,
    submitAnswer,
    completeAssessment,
    getAssessmentHistory,
    loading,
    error
  } = useAssessmentAPI();

  // SSE connection for real-time events
  const {
    isCalibrating,
    calibrationEvents,
    simulationResult,
    pdfUrl,
    resultData
  } = useAssessmentSSE(sessionId);

  // Dynamic page title and description based on flow stage
  const getPageTitle = () => {
    switch (flowStage) {
      case 'landing':
        return 'Strategic DNA Drill';
      case 'map_intro':
        return 'HNWI World';
      case 'assessment':
        return `Decision Drill - Scenario ${currentQuestionIndex + 1}/10`;
      case 'digital_twin':
        return 'Strategic DNA Analysis';
      default:
        return 'Strategic DNA Drill';
    }
  };

  const getPageDescription = () => {
    switch (flowStage) {
      case 'landing':
        return 'Reveal your strategic DNA under visibility pressure. A decision drill for cross-border and real-asset complexity that determines your wealth archetype.';
      case 'map_intro':
        return 'Explore the global landscape of wealth opportunities and strategic positioning across jurisdictions and asset classes.';
      case 'assessment':
        return 'Navigate complex scenarios to reveal your strategic decision-making patterns and wealth management style.';
      case 'digital_twin':
        return 'Your strategic DNA analysis is being generated. Comprehensive insights into your wealth archetype and personalized intelligence recommendations.';
      default:
        return 'Discover your wealth archetype through strategic decision scenarios tailored to HNWI complexity.';
    }
  };

  // Set dynamic page title based on current flow stage
  usePageTitle(getPageTitle(), getPageDescription(), [flowStage, currentQuestionIndex])

  // Load user data
  useEffect(() => {
    const authUser = getCurrentUser();
    if (authUser) {
      setUser(authUser);
    }

    const handleAuthUpdate = () => {
      const updatedUser = getCurrentUser();
      if (updatedUser) {
        setUser(updatedUser);
      }
    };

    window.addEventListener('auth:login', handleAuthUpdate);
    return () => window.removeEventListener('auth:login', handleAuthUpdate);
  }, []);

  // Scroll to top when assessment starts
  useEffect(() => {
    if (flowStage === 'assessment') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [flowStage]);

  // Check for existing completed assessment - ONCE on initial mount with user data
  useEffect(() => {
    // ═══════════════════════════════════════════════════════════════════════════
    // CRITICAL RACE CONDITION FIX: Check module-level flags FIRST
    // ═══════════════════════════════════════════════════════════════════════════
    // Module-level flags survive component re-mounts (unlike refs which reset)
    // If user has started the flow, NEVER run the redirect check
    if (simulationFlowStarted || assessmentSessionActive) {
      hasCheckedExistingRef.current = true; // Mark as checked to prevent future runs
      return; // EXIT IMMEDIATELY - user is mid-flow
    }

    // Only run if we have user data AND haven't checked yet
    if (!user?.id && !user?.user_id) return;
    if (hasCheckedExistingRef.current) return;

    // CRITICAL: Abort if user has already started the assessment flow
    if (shouldAbortRedirect.current) return;

    // CRITICAL: Don't redirect if user has already progressed past landing OR is in active session
    // This prevents the redirect when user data loads late (e.g., in incognito mode)
    if (flowStage !== 'landing' || hasProgressedPastLanding.current || sessionId) {
      // Mark as checked but don't redirect - user is already in the flow
      hasCheckedExistingRef.current = true;
      return;
    }

    // Mark as checked immediately to prevent any re-runs
    hasCheckedExistingRef.current = true;

    const checkExistingAssessment = async () => {
      try {
        // Triple-check abort conditions before proceeding
        if (shouldAbortRedirect.current || flowStage !== 'landing' || hasProgressedPastLanding.current) {
          return;
        }

        const userId = user?.id || user?.user_id;

        // Add timeout protection - abandon check after 3 seconds
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Assessment check timeout')), 3000)
        );

        // Race between the actual check and the timeout
        const history = await Promise.race([
          getAssessmentHistory(userId, user?.email),
          timeoutPromise
        ]).catch(() => null); // Return null on timeout

        // CRITICAL: Check abort flag again before any redirect
        if (shouldAbortRedirect.current) {
          return;
        }

        // Only redirect if user has completed assessments
        if (history && Array.isArray(history) && history.length > 0) {
          const mostRecent = history[0];

          // Only redirect if it's truly completed (has results/PDF)
          if (mostRecent.session_id && (mostRecent.pdf_url || mostRecent.status === 'completed')) {
            // Final check: only redirect if still on landing AND not aborted
            if (!shouldAbortRedirect.current && flowStage === 'landing' && !hasProgressedPastLanding.current) {
              // Clear vault session storage to prevent animation on redirect
              sessionStorage.removeItem('assessmentVaultShownThisSession');
              router.replace(`/simulation/results/${mostRecent.session_id}`);
            }
          }
        }
      } catch (error) {
        // Silent fail - allow user to continue
      }
    };

    checkExistingAssessment();
  }, [user, router, getAssessmentHistory, flowStage, sessionId]); // Added flowStage and sessionId to dependencies

  // Handle landing -> map intro
  const handleShowMapIntro = useCallback(() => {
    // Set BOTH module-level flag AND ref for maximum safety
    simulationFlowStarted = true; // Module-level: survives re-mounts
    hasProgressedPastLanding.current = true; // Ref: for within-render checks
    shouldAbortRedirect.current = true; // Prevent any late redirects
    setFlowStage('map_intro');
  }, []);

  // Handle map intro -> start assessment
  const handleStartAssessment = async () => {
    try {
      shouldAbortRedirect.current = true; // Ensure no late redirects
      const response = await startAssessment({
        user_id: user?.id || user?.user_id,
        email: user?.email
      });

      // Transform questions: ensure 'id' field exists (backend might use 'question_id')
      const questions = (response.questions || []).map((q: any) => ({
        ...q,
        id: q.id || q.question_id || q._id, // Fallback chain for ID field
      }));

      // CRITICAL: Set module-level flag BEFORE any state updates
      // This ensures even if component re-mounts during state updates, flag persists
      assessmentSessionActive = true;

      // Store session and questions
      setSessionId(response.session_id);
      setAllQuestions(questions);
      setCurrentQuestionIndex(0);
      setProgress({
        current: 1,
        total: response.questions?.length || 10,
        completed: false
      });
      setStatus('in_progress');
      setFlowStage('assessment');
    } catch (err: any) {
      // Backend will return error if retake not allowed - show message to user
      if (err.message?.includes('retake') || err.message?.includes('30 days') || err.message?.includes('wait')) {
        // Parse retake info from error if available
        alert(`Simulation Unavailable\n\n${err.message}\n\nPlease try again later.`);
      } else {
        alert(`Failed to start simulation: ${err.message}`);
      }
    }
  };

  // Handle answer submission
  const handleAnswerSubmit = async (choiceId: string, responseTime: number) => {
    if (!sessionId || !allQuestions[currentQuestionIndex]) return;

    const currentQuestion = allQuestions[currentQuestionIndex];

    const payload = {
      session_id: sessionId,
      question_id: currentQuestion.id,
      choice_id: choiceId,
      response_time: responseTime
    };

    try {
      const response = await submitAnswer(payload);

      // Move to next question index FIRST (before progress update)
      const nextIndex = currentQuestionIndex + 1;
      const isLastQuestion = nextIndex >= allQuestions.length;

      // Update progress - we're moving to the NEXT question after this answer
      // So progress should reflect where we are going, not where we were
      if (response.progress) {
        // Backend returns answers_submitted (completed count)
        // The NEXT question number is answers_submitted + 1 (unless we're done)
        const nextQuestionNumber = response.progress.is_complete
          ? response.progress.total_questions
          : Math.min(response.progress.answers_submitted + 1, response.progress.total_questions);

        setProgress({
          current: nextQuestionNumber,
          total: response.progress.total_questions,
          completed: response.progress.is_complete
        });
      } else {
        // Fallback: Manual progress calculation if backend doesn't return it
        // Show the NEXT question number (nextIndex + 1 for human-readable)
        setProgress({
          current: Math.min(nextIndex + 1, allQuestions.length), // Cap at total questions
          total: allQuestions.length,
          completed: isLastQuestion
        });
      }

      // Update state
      updateAnswer(currentQuestion.id, {
        choice_id: choiceId,
        insight: response.insight,
        tier_signal: response.tier_signal,
        matching_briefs: response.matching_briefs || [],
        answered_at: new Date().toISOString()
      });

      // Add progressive signal
      if (response.tier_signal) {
        addProgressiveSignal(response.tier_signal);
      }

      // Create synthetic calibration event from answer response
      if (response.opportunities !== undefined && response.total_command_centre !== undefined) {
        // CUMULATIVE GROWTH: Add opportunities progressively (never decrease)
        const previousCount = syntheticCalibrationEvents.length > 0
          ? syntheticCalibrationEvents[syntheticCalibrationEvents.length - 1].remaining
          : 0;

        // ACCUMULATE: Use actual number of opportunities sent by backend
        const increment = response.opportunities.length;
        const cumulativeCount = previousCount + increment;

        const calibrationEvent = {
          filter: 'progressive_calibration',
          message: increment > 0
            ? `+${increment} opportunities discovered matching your DNA`
            : `DNA analysis in progress...`,
          removed: increment,
          remaining: cumulativeCount,
          opportunities: response.opportunities || [] // Pass backend-selected opportunities
        };

        setSyntheticCalibrationEvents(prev => [...prev, calibrationEvent]);
      }

      // Move to next question or complete
      const shouldComplete = (response.progress && response.progress.is_complete) || isLastQuestion;

      if (shouldComplete) {
        // Trigger completion immediately (backend already saved the answer)
        await handleCompleteAssessment();
      } else {
        // Move to next question
        setCurrentQuestionIndex(nextIndex);
      }
    } catch (err) {
      alert('Failed to submit answer. Please try again.');
    }
  };

  // Handle assessment completion
  const handleCompleteAssessment = async () => {
    if (!sessionId) return;


    // Record test completion time
    const completionTime = new Date();
    setTestCompletionTime(completionTime);

    try {
      await completeAssessment({ session_id: sessionId });


      // Switch to Digital Twin waiting screen
      setFlowStage('digital_twin');
      setStatus('generating_pdf');
    } catch (err: any) {

      // On completion error, force switch to digital_twin anyway
      // The DigitalTwinWaiting component will handle retries
      setFlowStage('digital_twin');
      setStatus('generating_pdf');

      // Check if it's the incomplete assessment error
      if (err.message?.includes('Incomplete assessment') || err.message?.includes('answers submitted')) {
        const errorMsg = err.message || 'Some answers may not have been saved properly.';
        alert(`Simulation completion warning:\n\n${errorMsg}\n\nWe'll retry automatically. If this persists, please refresh the page.`);
      }
    }
  };

  // Handle Digital Twin completion
  const handleDigitalTwinComplete = (result: any, pdfUrlPath: string) => {
    if (sessionId) {
      // Reset module-level flags when navigating to results
      // This ensures clean state if user returns to /simulation page later
      simulationFlowStarted = false;
      assessmentSessionActive = false;

      // Clear flowStage from localStorage when assessment is complete
      if (typeof window !== 'undefined') {
        localStorage.removeItem('assessment_flow_stage');
      }

      router.push(`/simulation/results/${sessionId}`);
    }
  };

  // Prevent going back to landing after progressing
  useEffect(() => {
    if (flowStage === 'landing' && hasProgressedPastLanding.current) {
      // Something tried to reset us to landing - prevent it
      shouldAbortRedirect.current = true; // Make sure redirects are still blocked
      setFlowStage('map_intro');
    }
  }, [flowStage]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      shouldAbortRedirect.current = false;
      hasProgressedPastLanding.current = false;
    };
  }, []);

  // Landing page - always show, backend will handle restrictions
  if (flowStage === 'landing' && !hasProgressedPastLanding.current) {
    return (
        <AssessmentLanding onContinue={handleShowMapIntro} />
    );
  }

  // Map Introduction
  if (flowStage === 'map_intro') {
    return (
        <MapIntroduction onContinue={handleStartAssessment} />
    );
  }


  // Digital Twin waiting screen
  if (flowStage === 'digital_twin' && sessionId) {
    return (
        <DigitalTwinWaiting
          sessionId={sessionId}
          onComplete={handleDigitalTwinComplete}
          testCompletionTime={testCompletionTime}
          simulationResult={simulationResult}
          pdfUrl={pdfUrl}
          resultData={resultData}
        />
    );
  }

  // Assessment in progress
  if (flowStage === 'assessment') {
    // DEFENSIVE GUARD: Ensure we have all required data before rendering questions
    // This prevents edge cases where flowStage updates but questions haven't loaded yet
    if (!sessionId || allQuestions.length === 0 || currentQuestionIndex >= allQuestions.length) {
      // State is inconsistent - show brief loading while React batches settle
      return (
        <div className="flex items-center justify-center p-12">
          <CrownLoader
            size="lg"
            text="Loading Question"
            subtext="Preparing your first scenario..."
          />
        </div>
      );
    }

    const currentQuestion = allQuestions[currentQuestionIndex];

    return (
      <>
        {/* Question with Integrated Map and Calibration */}
        <AssessmentQuestion
          question={currentQuestion}
          progress={{
            ...progress,
            current: currentQuestionIndex + 1 // Show actual current question number
          }}
          onAnswer={handleAnswerSubmit}
          loading={loading}
          calibrationEvents={syntheticCalibrationEvents}
          isCalibrating={loading}
        />
      </>
    );
  }

  // Fallback: Assessment completed but not transitioned properly
  // This is now handled by the defensive guard in the assessment render block above
  // Keeping this useEffect as an additional safety net for edge cases
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - TS doesn't understand this is reachable via dependency changes
    if (flowStage === 'assessment' && sessionId && currentQuestionIndex >= allQuestions.length) {
      // Force transition to digital_twin stage
      setFlowStage('digital_twin');
      setStatus('generating_pdf');
    }
  }, [flowStage, sessionId, currentQuestionIndex, allQuestions.length, setFlowStage, setStatus]);

  // Loading or error state
  return (
    <>
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          {error ? (
            <>
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-primary text-white font-bold rounded"
              >
                Try Again
              </button>
            </>
          ) : (
            <CrownLoader
              size="lg"
              text="Initializing Simulation"
              subtext="Preparing your strategic classification protocol..."
            />
          )}
        </div>
      </div>
    </>
  );
}
