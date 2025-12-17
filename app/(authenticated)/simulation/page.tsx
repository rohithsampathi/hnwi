// app/(authenticated)/assessment/page.tsx
// Complete C10 Simulation with SSE, calibration, and Digital Twin simulation

"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AssessmentLanding } from '@/components/assessment/AssessmentLanding';
import { MapIntroduction } from '@/components/assessment/MapIntroduction';
import { AssessmentQuestion } from '@/components/assessment/AssessmentQuestion';
import { DigitalTwinWaiting } from '@/components/assessment/DigitalTwinWaiting';
import { MetaTags } from '@/components/meta-tags';
import { useAssessmentState, Question } from '@/lib/hooks/useAssessmentState';
import { useAssessmentAPI } from '@/lib/hooks/useAssessmentAPI';
import { useAssessmentSSE } from '@/lib/hooks/useAssessmentSSE';
import { getCurrentUser } from '@/lib/auth-manager';
import { CrownLoader } from '@/components/ui/crown-loader';

type FlowStage = 'landing' | 'map_intro' | 'retake_locked' | 'assessment' | 'digital_twin';

export default function AuthenticatedAssessmentPage() {
  const router = useRouter();
  const [flowStage, setFlowStage] = useState<FlowStage>('landing');
  const hasProgressedPastLanding = useRef(false);
  const [user, setUser] = useState<any>(null);
  const [syntheticCalibrationEvents, setSyntheticCalibrationEvents] = useState<any[]>([]);
  const [testCompletionTime, setTestCompletionTime] = useState<Date | null>(null);
  const hasCheckedExistingRef = useRef(false);
  const shouldAbortRedirect = useRef(false); // New ref to prevent late redirects

  // ROOT FIX: Reset assessment state on mount (especially for PWA/mobile)
  useEffect(() => {
    // Clear any stale assessment state on component mount
    // This is critical for PWA/mobile where browser state persists
    const resetAssessmentState = () => {
      // Reset all refs to initial state
      hasProgressedPastLanding.current = false;
      hasCheckedExistingRef.current = false;
      shouldAbortRedirect.current = false;

      // Clear any stale session storage
      const keysToRemove = Object.keys(sessionStorage).filter(key =>
        key.includes('assessment') || key.includes('simulation')
      );
      keysToRemove.forEach(key => sessionStorage.removeItem(key));

      // If PWA, ensure we're starting fresh
      if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('[Assessment] PWA mode detected, state reset');
      }
    };

    resetAssessmentState();
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
    // Only run if we have user data AND haven't checked yet
    if (!user?.id && !user?.user_id) return;
    if (hasCheckedExistingRef.current) return;

    // CRITICAL: Abort if user has already started the assessment flow
    if (shouldAbortRedirect.current) return;

    // CRITICAL: Don't redirect if user has already progressed past landing
    // This prevents the redirect when user data loads late (e.g., in incognito mode)
    if (flowStage !== 'landing' || hasProgressedPastLanding.current) {
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
        console.error('Error checking assessment history:', error);
      }
    };

    checkExistingAssessment();
  }, [user, router, getAssessmentHistory, flowStage]); // Added flowStage to dependencies

  // Handle landing -> map intro
  const handleShowMapIntro = useCallback(() => {
    hasProgressedPastLanding.current = true;
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
      <>
        <MetaTags
          title="C10 Strategic Simulation - HNWI Chronicles"
          description="Take the exclusive 10-question simulation to discover your strategic tier and unlock personalized intelligence."
          image="https://app.hnwichronicles.com/images/assessment-og.png"
          url="https://app.hnwichronicles.com/simulation"
        />
        <AssessmentLanding onContinue={handleShowMapIntro} />
      </>
    );
  }

  // Map Introduction
  if (flowStage === 'map_intro') {
    return (
      <>
        <MetaTags
          title="HNWI World - Strategic Simulation"
          description="Explore the reality of HNWI World before your simulation begins."
          image="https://app.hnwichronicles.com/images/assessment-og.png"
          url="https://app.hnwichronicles.com/simulation"
        />
        <MapIntroduction onContinue={handleStartAssessment} />
      </>
    );
  }


  // Digital Twin waiting screen
  if (flowStage === 'digital_twin' && sessionId) {
    return (
      <>
        <MetaTags
          title="C10 Simulation - Digital Twin"
          description="Running your personalized Digital Twin simulation through crisis scenarios."
          image="https://app.hnwichronicles.com/images/assessment-og.png"
          url="https://app.hnwichronicles.com/simulation"
        />
        <DigitalTwinWaiting
          sessionId={sessionId}
          onComplete={handleDigitalTwinComplete}
          testCompletionTime={testCompletionTime}
          simulationResult={simulationResult}
          pdfUrl={pdfUrl}
          resultData={resultData}
        />
      </>
    );
  }

  // Assessment in progress
  if (flowStage === 'assessment' && allQuestions.length > 0 && currentQuestionIndex < allQuestions.length) {
    const currentQuestion = allQuestions[currentQuestionIndex];

    return (
      <>
        <MetaTags
          title={`C10 Simulation - Question ${currentQuestionIndex + 1}/10`}
          description="Strategic scenario analysis in progress."
          image="https://app.hnwichronicles.com/images/assessment-og.png"
          url="https://app.hnwichronicles.com/simulation"
        />

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
  // This can happen if all questions are answered but flowStage didn't update
  useEffect(() => {
    if (flowStage === 'assessment' && sessionId && currentQuestionIndex >= allQuestions.length) {

      // Force transition to digital_twin stage
      setFlowStage('digital_twin');
      setStatus('generating_pdf');
    }
  }, [flowStage, sessionId, currentQuestionIndex, allQuestions.length]);

  // Show completing state if we're in the fallback scenario
  if (flowStage === 'assessment' && sessionId && currentQuestionIndex >= allQuestions.length) {
    return (
      <>
        <MetaTags
          title="C10 Simulation - Completing"
          description="Finalizing your simulation results."
          image="https://app.hnwichronicles.com/images/assessment-og.png"
          url="https://app.hnwichronicles.com/simulation"
        />
        <div className="flex items-center justify-center p-12">
          <CrownLoader
            size="lg"
            text="Finalizing Simulation"
            subtext="Preparing your strategic DNA analysis..."
          />
        </div>
      </>
    );
  }

  // Loading or error state
  return (
    <>
      <MetaTags
        title="C10 Simulation - Initializing"
        description="Initializing strategic classification protocol."
        image="https://app.hnwichronicles.com/images/assessment-og.png"
        url="https://app.hnwichronicles.com/assessment"
      />
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
