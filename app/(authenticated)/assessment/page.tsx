// app/(authenticated)/assessment/page.tsx
// Complete C10 Assessment with SSE, calibration, and Digital Twin simulation

"use client";

import { useState, useEffect } from 'react';
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

type FlowStage = 'landing' | 'map_intro' | 'retake_locked' | 'assessment' | 'digital_twin';

export default function AuthenticatedAssessmentPage() {
  const router = useRouter();
  const [flowStage, setFlowStage] = useState<FlowStage>('landing');
  const [user, setUser] = useState<any>(null);
  const [syntheticCalibrationEvents, setSyntheticCalibrationEvents] = useState<any[]>([]);
  const [testCompletionTime, setTestCompletionTime] = useState<Date | null>(null);
  const [existingAssessment, setExistingAssessment] = useState<any>(null);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [hasCheckedExisting, setHasCheckedExisting] = useState(false); // Prevent multiple checks

  const {
    sessionId,
    allQuestions,
    currentQuestionIndex,
    progress,
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

  // Check for existing assessment - ONLY ONCE to prevent 429 rate limiting
  useEffect(() => {
    // CRITICAL: Prevent multiple rapid API calls that cause 429 errors
    if (hasCheckedExisting) {
      return; // Already checked, skip
    }

    const checkExistingAssessment = async () => {
      if (!user?.id && !user?.user_id) {
        setCheckingExisting(false);
        return;
      }

      // Mark as checked IMMEDIATELY to prevent duplicate calls
      setHasCheckedExisting(true);

      try {
        const userId = user.id || user.user_id;
        console.log('[Assessment] Checking existing assessment for user:', userId);
        const response = await fetch(`/api/assessment/history/${userId}`);

        if (response.ok) {
          const data = await response.json();
          console.log('[Assessment] History API response:', data);
          const assessments = data?.assessments || data || [];
          console.log('[Assessment] Parsed assessments:', assessments);

          if (assessments.length > 0) {
            // Get the most recent assessment
            const latest = assessments[0];
            console.log('[Assessment] Latest assessment:', latest);

            // ALWAYS redirect to latest results if user has completed an assessment
            // They can choose to retake from the results page itself
            console.log('[Assessment] User has completed assessment - redirecting to results');
            router.push(`/assessment/results/${latest.session_id}`);
            return; // Exit early to prevent showing landing page
          } else {
            console.log('[Assessment] No assessments found - showing landing page');
          }
        } else {
          console.log('[Assessment] History API failed:', response.status, response.statusText);
          // On error, reset flag so they can try again
          if (response.status === 429) {
            console.error('[Assessment] Rate limited! Please wait before retrying.');
          }
        }
      } catch (error) {
        console.error('[Assessment] Failed to check existing:', error);
      } finally {
        setCheckingExisting(false);
      }
    };

    checkExistingAssessment();
  }, [user, hasCheckedExisting, router]);


  // Handle landing -> map intro
  const handleShowMapIntro = () => {
    setFlowStage('map_intro');
  };

  // Handle map intro -> start assessment
  const handleStartAssessment = async () => {
    try {
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
      console.error('[Assessment] Failed to start:', err);

      // Backend will return error if retake not allowed - show message to user
      if (err.message?.includes('retake') || err.message?.includes('30 days') || err.message?.includes('wait')) {
        // Parse retake info from error if available
        alert(`Assessment Unavailable\n\n${err.message}\n\nPlease try again later.`);
      } else {
        alert(`Failed to start assessment: ${err.message}`);
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
      console.log('[Assessment] Answer submitted, response:', response);

      // Move to next question index FIRST (before progress update)
      const nextIndex = currentQuestionIndex + 1;
      const isLastQuestion = nextIndex >= allQuestions.length;

      // Update progress - use backend's progress if available, otherwise calculate manually
      if (response.progress) {
        console.log('[Assessment] Progress update from backend:', response.progress);

        // Backend returns answers_submitted (completed count)
        // But we want to show CURRENT question number for display
        const currentQuestionDisplay = response.progress.is_complete
          ? response.progress.total_questions
          : response.progress.answers_submitted + 1;

        setProgress({
          current: currentQuestionDisplay,
          total: response.progress.total_questions,
          completed: response.progress.is_complete
        });
      } else {
        // Fallback: Manual progress calculation if backend doesn't return it
        console.log('[Assessment] No progress from backend, calculating manually');
        setProgress({
          current: isLastQuestion ? allQuestions.length : nextIndex + 1,
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
        console.log('[Assessment] Assessment is complete');
        // Trigger completion immediately (backend already saved the answer)
        await handleCompleteAssessment();
      } else {
        // Move to next question
        console.log(`[Assessment] Moving to next question: ${nextIndex + 1}/${allQuestions.length}`);
        setCurrentQuestionIndex(nextIndex);
      }
    } catch (err) {
      console.error('[Assessment] Failed to submit answer:', err);
      alert('Failed to submit answer. Please try again.');
    }
  };

  // Handle assessment completion
  const handleCompleteAssessment = async () => {
    if (!sessionId) return;

    console.log('[Assessment] Starting completion process...');

    // Record test completion time
    const completionTime = new Date();
    setTestCompletionTime(completionTime);

    try {
      await completeAssessment({ session_id: sessionId });

      console.log('[Assessment] Completion API succeeded, switching to digital_twin stage');

      // Switch to Digital Twin waiting screen
      setFlowStage('digital_twin');
      setStatus('generating_pdf');
    } catch (err: any) {
      console.error('[Assessment] Failed to complete:', err);

      // On completion error, force switch to digital_twin anyway
      // The DigitalTwinWaiting component will handle retries
      console.log('[Assessment] Completion failed but forcing digital_twin stage for retry handling');
      setFlowStage('digital_twin');
      setStatus('generating_pdf');

      // Check if it's the incomplete assessment error
      if (err.message?.includes('Incomplete assessment') || err.message?.includes('answers submitted')) {
        const errorMsg = err.message || 'Some answers may not have been saved properly.';
        alert(`Assessment completion warning:\n\n${errorMsg}\n\nWe'll retry automatically. If this persists, please refresh the page.`);
      }
    }
  };

  // Handle Digital Twin completion
  const handleDigitalTwinComplete = (result: any, pdfUrlPath: string) => {
    if (sessionId) {
      router.push(`/assessment/results/${sessionId}`);
    }
  };

  // Landing page or existing results
  if (flowStage === 'landing') {
    // Show loading while checking for existing assessment
    if (checkingExisting) {
      return (
        <>
          <MetaTags
            title="C10 Strategic Assessment - HNWI Chronicles"
            description="Take the exclusive 10-question assessment to discover your strategic tier and unlock personalized intelligence."
            image="https://app.hnwichronicles.com/images/assessment-og.png"
            url="https://app.hnwichronicles.com/assessment"
          />
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading assessment...</p>
            </div>
          </div>
        </>
      );
    }

    // Note: existingAssessment check is now handled by direct redirect in useEffect above
    // If we reach here, user either has no assessment or can retake

    // Show normal landing page
    return (
      <>
        <MetaTags
          title="C10 Strategic Assessment - HNWI Chronicles"
          description="Take the exclusive 10-question assessment to discover your strategic tier and unlock personalized intelligence."
          image="https://app.hnwichronicles.com/images/assessment-og.png"
          url="https://app.hnwichronicles.com/assessment"
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
          title="HNWI World - Strategic Assessment"
          description="Explore the reality of HNWI World before your assessment begins."
          image="https://app.hnwichronicles.com/images/assessment-og.png"
          url="https://app.hnwichronicles.com/assessment"
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
          title="C10 Assessment - Digital Twin Simulation"
          description="Running your personalized Digital Twin simulation through crisis scenarios."
          image="https://app.hnwichronicles.com/images/assessment-og.png"
          url="https://app.hnwichronicles.com/assessment"
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
          title={`C10 Assessment - Question ${currentQuestionIndex + 1}/10`}
          description="Strategic scenario analysis in progress."
          image="https://app.hnwichronicles.com/images/assessment-og.png"
          url="https://app.hnwichronicles.com/assessment"
        />

        {/* Question with Integrated Map and Calibration */}
        <AssessmentQuestion
          question={currentQuestion}
          progress={progress}
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
      console.warn('[Assessment] Fallback: All questions completed, forcing digital_twin stage');

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
          title="C10 Assessment - Completing"
          description="Finalizing your assessment results."
          image="https://app.hnwichronicles.com/images/assessment-og.png"
          url="https://app.hnwichronicles.com/assessment"
        />
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Finalizing assessment...</p>
          </div>
        </div>
      </>
    );
  }

  // Loading or error state
  return (
    <>
      <MetaTags
        title="C10 Assessment - Initializing"
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
            <>
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Initializing assessment...</p>
              <p className="text-xs text-muted-foreground mt-2">
                Debug: Stage={flowStage}, Questions={allQuestions.length}, Index={currentQuestionIndex}, Session={sessionId ? 'Yes' : 'No'}
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
