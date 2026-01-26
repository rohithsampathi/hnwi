// components/decision-memo/TenQuestionForm.tsx
// Main 10-question stress test form with real-time discovery stream

"use client";

import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { stressTestSchema } from '@/lib/decision-memo/schemas';
import { ProgressBar } from './ProgressBar';
import { LiveIntelligenceStream } from './LiveIntelligenceStream';
import type { Opportunity, Mistake, IntelligenceMatch } from '@/lib/hooks/useDecisionMemoSSE';

// Import question components
import { Q1NextMoves } from './questions/Q1NextMoves';
import { Q2CurrentPosition } from './questions/Q2CurrentPosition';
import { Q3Jurisdictions } from './questions/Q3Jurisdictions';
import { Q4JurisdictionChanges } from './questions/Q4JurisdictionChanges';
import { Q5AssetBuckets } from './questions/Q5AssetBuckets';
import { Q6LiquidityTimeline } from './questions/Q6LiquidityTimeline';
import { Q7Structures } from './questions/Q7Structures';
import { Q8Advisors } from './questions/Q8Advisors';
import { Q9Behavioral } from './questions/Q9Behavioral';
import { Q10NonNegotiables } from './questions/Q10NonNegotiables';

const QUESTIONS = [
  { id: 'q1', component: Q1NextMoves, title: 'Next Allocation Moves', fields: ['q1_move1', 'q1_move2', 'q1_move3'] },
  { id: 'q2', component: Q2CurrentPosition, title: 'Current Position', fields: ['q2_residency', 'q2_tax_residence'] },
  { id: 'q3', component: Q3Jurisdictions, title: 'Asset & Entity Locations', fields: ['q3_asset_jurisdictions', 'q3_entity_jurisdictions'] },
  { id: 'q4', component: Q4JurisdictionChanges, title: 'Jurisdiction Changes', fields: ['q4_planning_move', 'q4_from', 'q4_to', 'q4_timeline', 'q4_reason'] },
  { id: 'q5', component: Q5AssetBuckets, title: 'Asset Buckets', fields: ['q5_real_estate_intent', 'q5_real_estate_liquidity', 'q5_private_equity_intent', 'q5_private_equity_liquidity'] },
  { id: 'q6', component: Q6LiquidityTimeline, title: 'Liquidity Forcing Timeline', fields: ['q6_timeline', 'q6_forcing_events'] },
  { id: 'q7', component: Q7Structures, title: 'Current Structures', fields: ['q7_structures'] },
  { id: 'q8', component: Q8Advisors, title: 'Advisor Coordination Risk', fields: ['q8_advisors', 'q8_following_playbook'] },
  { id: 'q9', component: Q9Behavioral, title: 'Behavioral Patterns', fields: ['q9_uncertainty', 'q9_past_burns'] },
  { id: 'q10', component: Q10NonNegotiables, title: 'Non-Negotiables', fields: ['q10_non_negotiable'] },
];

interface TenQuestionFormProps {
  intakeId: string;
  isConnected: boolean;
  sseError: string | null;
  opportunities: Opportunity[];
  mistakes: Mistake[];
  intelligenceMatches: IntelligenceMatch[];
}

export function TenQuestionForm({
  intakeId,
  isConnected,
  sseError,
  opportunities,
  mistakes,
  intelligenceMatches
}: TenQuestionFormProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const methods = useForm({
    resolver: zodResolver(stressTestSchema),
    mode: 'onChange',
  });

  // Submit answer to backend (triggers SSE events)
  const submitAnswer = async (questionId: string, answer: string) => {
    if (!intakeId) {
      console.error('No intake_id available');
      return;
    }

    try {
      const response = await fetch('/api/decision-memo/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intake_id: intakeId,
          question_id: questionId,
          answer: answer
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit answer: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Answer submitted:', data);

      // Save answer locally
      setAnswers(prev => ({
        ...prev,
        [questionId]: answer
      }));

    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  };

  const handleNext = async () => {
    const currentFieldNames = QUESTIONS[currentQuestion].fields;
    const isValid = await methods.trigger(currentFieldNames as any);

    if (!isValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Get field values for this question
      const formValues = methods.getValues();
      const questionData: Record<string, any> = {};

      // Collect all field values for this question
      currentFieldNames.forEach(fieldName => {
        if (formValues[fieldName] !== undefined) {
          questionData[fieldName] = formValues[fieldName];
        }
      });

      // Submit answer for each field (backend expects individual submissions)
      for (const [fieldName, value] of Object.entries(questionData)) {
        if (value) {
          const answerText = typeof value === 'object' ? JSON.stringify(value) : String(value);
          await submitAnswer(fieldName, answerText);
        }
      }

      // Move to next question
      if (currentQuestion < QUESTIONS.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      // If Q10, preview modal will automatically show via SSE previewReady event

    } catch (error) {
      console.error('Failed to submit answer:', error);
      alert('Failed to submit answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const CurrentQuestionComponent = QUESTIONS[currentQuestion]?.component;
  const questionTitle = QUESTIONS[currentQuestion]?.title;
  const isLastQuestion = currentQuestion === QUESTIONS.length - 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Bar - Sticky - Premium */}
      <div className="sticky top-0 z-40 bg-background/98 backdrop-blur-xl border-b border-primary/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4">
          <ProgressBar current={currentQuestion + 1} total={QUESTIONS.length} />
        </div>
      </div>

      {/* Main Content - Split Layout (Questions + Live Stream) */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
        {/* Question Content - Left on desktop, Top on mobile */}
        <div className="lg:w-1/2 overflow-y-auto">
          <div className="px-4 sm:px-6 md:px-8 py-8 lg:pt-8 max-w-3xl">
            {/* Form */}
            <FormProvider {...methods}>
              <form onSubmit={(e) => e.preventDefault()}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Question Header */}
                    <div className="mb-6 sm:mb-8">
                      <div className="inline-block px-3 py-1.5 bg-card/80 backdrop-blur-md border border-primary/40 rounded-full text-xs sm:text-sm font-bold text-primary uppercase tracking-wider mb-3 sm:mb-4">
                        Question {currentQuestion + 1} of {QUESTIONS.length}
                      </div>
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight tracking-tight">{questionTitle}</h2>
                    </div>

                    {/* Question Component */}
                    <div className="bg-card/60 backdrop-blur-xl border border-primary/30 rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
                      {CurrentQuestionComponent && <CurrentQuestionComponent />}
                    </div>

                    {/* Navigation - Premium */}
                    <div className="flex justify-between items-center gap-4">
                      <button
                        type="button"
                        onClick={handleBack}
                        disabled={currentQuestion === 0 || isSubmitting}
                        className="px-4 sm:px-6 py-2.5 sm:py-3 bg-card/60 backdrop-blur-xl border border-primary/30 hover:border-primary/40 rounded-xl font-medium text-foreground hover:bg-card/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                      >
                        ← Back
                      </button>

                      <div className="text-xs sm:text-sm text-muted-foreground font-medium hidden sm:block">
                        {currentQuestion + 1} / {QUESTIONS.length}
                      </div>

                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={isSubmitting}
                        className="px-6 sm:px-8 py-2.5 sm:py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 hover:shadow-primary/30"
                      >
                        {isSubmitting
                          ? 'Analyzing...'
                          : isLastQuestion
                          ? 'Complete Assessment →'
                          : 'Next →'}
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </form>
            </FormProvider>
          </div>
        </div>

        {/* Live Intelligence Stream - Right on desktop, Bottom on mobile */}
        <div className="lg:w-1/2 lg:border-l border-border bg-muted/10">
          <LiveIntelligenceStream
            opportunities={opportunities}
            mistakes={mistakes}
            intelligenceMatches={intelligenceMatches}
            sseConnected={isConnected}
            sseError={sseError}
          />
        </div>
      </div>
    </div>
  );
}
