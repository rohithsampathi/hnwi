// components/decision-memo/SmartQuestionsForm.tsx
// Premium 3 Smart Questions Form - Goldman/McKinsey Design Language
// Replaces TenQuestionForm with streamlined, high-end intake experience

"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { smartQuestionsSchema, type SmartQuestionsFormData } from '@/lib/decision-memo/schemas';
import { LiveIntelligenceStream } from './LiveIntelligenceStream';
import {
  TrendingUp,
  Globe,
  Clock,
  ChevronRight,
  ChevronLeft,
  Check,
  Building2,
  Briefcase,
  Coins,
  Gem,
  Palette,
  Loader2
} from 'lucide-react';

// 3 Smart Questions Configuration
const SMART_QUESTIONS = [
  {
    id: 'q1_wealth_moves',
    title: 'Your Next Wealth Moves',
    subtitle: 'What major allocation or restructuring decisions are you considering?',
    icon: TrendingUp,
    fields: ['q1_primary_move', 'q1_secondary_move', 'q1_asset_focus', 'q1_move_size'],
    insight: 'Based on 1,562+ HNWI precedents, 73% of allocation mistakes stem from unclear move definition.'
  },
  {
    id: 'q2_geography',
    title: 'Your Wealth Geography',
    subtitle: 'Where are you, your assets, and where are you headed?',
    icon: Globe,
    fields: ['q2_current_residency', 'q2_tax_residence', 'q2_asset_jurisdictions', 'q2_planning_move', 'q2_target_jurisdiction', 'q2_existing_structures'],
    insight: 'Jurisdiction sequencing errors cost HNWIs $200K+ on average. Order matters.'
  },
  {
    id: 'q3_timeline',
    title: 'Timeline & Forcing Events',
    subtitle: 'What deadlines or events are driving your decisions?',
    icon: Clock,
    fields: ['q3_liquidity_timeline', 'q3_forcing_events', 'q3_advisor_count', 'q3_decision_style', 'q3_non_negotiable'],
    insight: '60% of HNWIs have timeline mismatches between moves and liquidity needs.'
  }
];

// Asset categories with icons
const ASSET_CATEGORIES = [
  { id: 'real_estate', label: 'Real Estate', icon: Building2 },
  { id: 'private_equity', label: 'Private Equity', icon: Briefcase },
  { id: 'offshore_capital', label: 'Offshore Capital', icon: Coins },
  { id: 'crypto', label: 'Crypto/Digital', icon: Gem },
  { id: 'art_collectibles', label: 'Art & Collectibles', icon: Palette }
];

// Move size options
const MOVE_SIZES = [
  { id: 'under_500k', label: 'Under $500K' },
  { id: '500k_2m', label: '$500K - $2M' },
  { id: '2m_10m', label: '$2M - $10M' },
  { id: '10m_plus', label: '$10M+' }
];

// Popular jurisdictions
const JURISDICTIONS = [
  'United States', 'United Kingdom', 'Singapore', 'UAE', 'Switzerland',
  'Hong Kong', 'Cayman Islands', 'BVI', 'Luxembourg', 'Netherlands',
  'India', 'Australia', 'Canada', 'Germany', 'France', 'Portugal',
  'Malta', 'Cyprus', 'Mauritius', 'Bahamas'
];

// Structure types
const STRUCTURES = [
  'LLC/LLP', 'Corporation', 'Trust', 'Foundation', 'Family Office',
  'Holding Company', 'SPV', 'Fund Structure', 'None'
];

// Forcing events - SFO appropriate
const FORCING_EVENTS = [
  'Regulatory deadline', 'DTAA/Treaty deadline', 'Tax filing date',
  'Business sale/exit', 'Entity restructuring', 'Visa/residency deadline',
  'Capital call commitment', 'Fund close date', 'Succession transition', 'Market window'
];

// Decision styles
const DECISION_STYLES = [
  { id: 'deliberate', label: 'Deliberate', desc: 'I take time to analyze all options' },
  { id: 'opportunistic', label: 'Opportunistic', desc: 'I act quickly when I see value' },
  { id: 'deadline_driven', label: 'Deadline-Driven', desc: 'External events force my hand' }
];

interface SmartQuestionsFormProps {
  intakeId: string;
}

// Opportunity type for SSE events
interface Opportunity {
  title: string;
  location: string;
  latitude?: number;
  longitude?: number;
  tier?: string;
  expected_return?: string;
  alignment_score?: number;
  reason?: string;
}

export function SmartQuestionsForm({
  intakeId
}: SmartQuestionsFormProps) {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState<number[]>([]);
  const [waitingForPreview, setWaitingForPreview] = useState(false);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const formRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Set up SSE connection for opportunity_found and preview_ready events
  useEffect(() => {
    if (!intakeId) return;

    const eventSource = new EventSource(`/api/decision-memo/stream/${intakeId}`);
    eventSourceRef.current = eventSource;

    // Listen for opportunities as they're found
    eventSource.addEventListener('opportunity_found', (e) => {
      console.log('💎 SSE: opportunity_found received');
      try {
        const data = JSON.parse(e.data);
        const opportunity = data.opportunity || data;
        console.log('💎 Opportunity:', opportunity);
        setOpportunities(prev => [...prev, opportunity]);
      } catch (error) {
        console.error('Failed to parse opportunity:', error);
      }
    });

    eventSource.addEventListener('preview_ready', (e) => {
      console.log('✅ SSE: preview_ready received');
      try {
        const data = JSON.parse(e.data);
        // Navigate to preview page - backend confirms it's ready
        router.push(`/decision-memo/preview/${data.intake_id || intakeId}`);
      } catch {
        // Fallback if parsing fails
        router.push(`/decision-memo/preview/${intakeId}`);
      }
    });

    eventSource.addEventListener('error', () => {
      console.log('⚠️ SSE connection error');
    });

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [intakeId, router]);

  const methods = useForm<SmartQuestionsFormData>({
    resolver: zodResolver(smartQuestionsSchema),
    mode: 'onChange',
    defaultValues: {
      q1_asset_focus: [],
      q2_asset_jurisdictions: [],
      q2_planning_move: false,
      q2_existing_structures: [],
      q3_liquidity_timeline: 365,
      q3_forcing_events: [],
      q3_advisor_count: 2,
    }
  });

  const { watch, setValue, trigger, getValues } = methods;
  const watchedValues = watch();

  // Submit answer to backend
  const submitAnswer = async (questionId: string, data: Record<string, any>) => {
    if (!intakeId) return;

    try {
      // Collect all field values for this question
      const fields: Record<string, string> = {};
      for (const [fieldName, value] of Object.entries(data)) {
        if (value !== undefined && value !== null && value !== '') {
          fields[fieldName] = typeof value === 'object' ? JSON.stringify(value) : String(value);
        }
      }

      // Submit all fields together with the parent question ID
      // This allows backend to know which question was completed (for opportunity count)
      await fetch('/api/decision-memo/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intake_id: intakeId,
          question_id: questionId, // Parent question ID: q1_wealth_moves, q2_geography, q3_timeline
          answer: JSON.stringify(fields), // All fields as JSON object
          fields: fields // Also send as separate object for easier backend parsing
        }),
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  };

  const handleNext = async () => {
    const currentFieldNames = SMART_QUESTIONS[currentQuestion].fields;
    const isValid = await trigger(currentFieldNames as any);

    if (!isValid) return;

    setIsSubmitting(true);

    try {
      const formValues = getValues();
      const questionData: Record<string, any> = {};

      currentFieldNames.forEach(fieldName => {
        if (formValues[fieldName as keyof SmartQuestionsFormData] !== undefined) {
          questionData[fieldName] = formValues[fieldName as keyof SmartQuestionsFormData];
        }
      });

      await submitAnswer(SMART_QUESTIONS[currentQuestion].id, questionData);

      setCompletedQuestions(prev => [...prev, currentQuestion]);

      if (currentQuestion < SMART_QUESTIONS.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // All questions completed - show analyzing screen
        // DecisionMemoAnalyzing handles SSE and fallback redirect
        console.log('✅ All questions completed, showing analyzing screen:', intakeId);
        setWaitingForPreview(true);
      }

    } catch (error) {
      console.error('Failed to submit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const CurrentIcon = SMART_QUESTIONS[currentQuestion].icon;
  const isLastQuestion = currentQuestion === SMART_QUESTIONS.length - 1;

  // Show generating state while waiting for preview_ready SSE
  if (waitingForPreview) {
    return (
      <DecisionMemoAnalyzing
        intakeId={intakeId}
        onComplete={() => router.push(`/decision-memo/preview/${intakeId}`)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Premium Progress Header */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-xl border-b border-primary/20 shadow-lg shadow-primary/5">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3 sm:py-4">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs sm:text-sm">HC</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-foreground font-semibold text-sm">Decision Memo</p>
                <p className="text-muted-foreground text-[10px] tracking-wider uppercase">Pattern Intelligence</p>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-2 sm:gap-4">
              {SMART_QUESTIONS.map((q, i) => (
                <div key={q.id} className="flex items-center gap-1 sm:gap-2">
                  <motion.div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                      completedQuestions.includes(i)
                        ? 'bg-primary text-primary-foreground'
                        : i === currentQuestion
                        ? 'bg-primary/20 border-2 border-primary text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                    animate={i === currentQuestion ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {completedQuestions.includes(i) ? (
                      <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <span className="text-xs sm:text-sm font-semibold">{i + 1}</span>
                    )}
                  </motion.div>
                  {i < SMART_QUESTIONS.length - 1 && (
                    <div className={`w-6 sm:w-12 h-0.5 ${
                      completedQuestions.includes(i) ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Connection Status */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="hidden sm:inline text-xs text-muted-foreground">
                Live
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-72px)]">
        {/* Question Content - Left Side */}
        <div ref={formRef} className="lg:w-1/2 overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-12 py-6 sm:py-10 max-w-2xl mx-auto lg:mx-0">
            <FormProvider {...methods}>
              <form onSubmit={(e) => e.preventDefault()}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  >
                    {/* Question Header */}
                    <div className="mb-6 sm:mb-10">
                      <motion.div
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-full mb-4"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <CurrentIcon className="w-4 h-4 text-primary" />
                        <span className="text-primary text-xs sm:text-sm font-semibold tracking-wide">
                          Question {currentQuestion + 1} of {SMART_QUESTIONS.length}
                        </span>
                      </motion.div>

                      <motion.h2
                        className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                      >
                        {SMART_QUESTIONS[currentQuestion].title}
                      </motion.h2>

                      <motion.p
                        className="text-muted-foreground text-base sm:text-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {SMART_QUESTIONS[currentQuestion].subtitle}
                      </motion.p>
                    </div>

                    {/* Question Content */}
                    <motion.div
                      className="bg-card/60 backdrop-blur-xl border border-primary/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 mb-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                    >
                      {/* Q1: Wealth Moves */}
                      {currentQuestion === 0 && (
                        <div className="space-y-6">
                          {/* Primary Move */}
                          <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">
                              Primary Move *
                            </label>
                            <textarea
                              {...methods.register('q1_primary_move')}
                              placeholder="e.g., Moving $2M from US public markets to Dubai real estate for tax optimization..."
                              className="w-full h-24 px-4 py-3 bg-muted/30 border border-primary/20 rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 resize-none"
                            />
                            {methods.formState.errors.q1_primary_move && (
                              <p className="mt-1 text-xs text-red-500">{methods.formState.errors.q1_primary_move.message}</p>
                            )}
                          </div>

                          {/* Secondary Move */}
                          <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">
                              Secondary Move (Optional)
                            </label>
                            <textarea
                              {...methods.register('q1_secondary_move')}
                              placeholder="e.g., Restructuring family trust to include Singapore entity..."
                              className="w-full h-20 px-4 py-3 bg-muted/30 border border-primary/20 rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 resize-none"
                            />
                          </div>

                          {/* Asset Categories */}
                          <div>
                            <label className="block text-sm font-semibold text-foreground mb-3">
                              Asset Categories Involved *
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                              {ASSET_CATEGORIES.map(cat => {
                                const isSelected = watchedValues.q1_asset_focus?.includes(cat.id as any);
                                const Icon = cat.icon;
                                return (
                                  <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => {
                                      const current = watchedValues.q1_asset_focus || [];
                                      if (isSelected) {
                                        setValue('q1_asset_focus', current.filter(c => c !== cat.id) as any);
                                      } else {
                                        setValue('q1_asset_focus', [...current, cat.id] as any);
                                      }
                                    }}
                                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all text-left ${
                                      isSelected
                                        ? 'bg-primary/15 border-primary text-primary'
                                        : 'bg-muted/20 border-primary/10 text-muted-foreground hover:border-primary/30'
                                    }`}
                                  >
                                    <Icon className="w-4 h-4 flex-shrink-0" />
                                    <span className="text-xs sm:text-sm font-medium truncate">{cat.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                            {methods.formState.errors.q1_asset_focus && (
                              <p className="mt-2 text-xs text-red-500">{methods.formState.errors.q1_asset_focus.message}</p>
                            )}
                          </div>

                          {/* Move Size */}
                          <div>
                            <label className="block text-sm font-semibold text-foreground mb-3">
                              Approximate Move Size
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {MOVE_SIZES.map(size => {
                                const isSelected = watchedValues.q1_move_size === size.id;
                                return (
                                  <button
                                    key={size.id}
                                    type="button"
                                    onClick={() => setValue('q1_move_size', size.id as any)}
                                    className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                                      isSelected
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-muted/20 border-primary/10 text-muted-foreground hover:border-primary/30'
                                    }`}
                                  >
                                    {size.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Q2: Wealth Geography */}
                      {currentQuestion === 1 && (
                        <div className="space-y-6">
                          {/* Current Residency */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-foreground mb-2">
                                Current Residency *
                              </label>
                              <select
                                {...methods.register('q2_current_residency')}
                                className="w-full px-4 py-3 bg-muted/30 border border-primary/20 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                              >
                                <option value="">Select country...</option>
                                {JURISDICTIONS.map(j => (
                                  <option key={j} value={j}>{j}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-foreground mb-2">
                                Tax Residence *
                              </label>
                              <select
                                {...methods.register('q2_tax_residence')}
                                className="w-full px-4 py-3 bg-muted/30 border border-primary/20 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                              >
                                <option value="">Select country...</option>
                                {JURISDICTIONS.map(j => (
                                  <option key={j} value={j}>{j}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Asset Jurisdictions */}
                          <div>
                            <label className="block text-sm font-semibold text-foreground mb-3">
                              Where Are Your Assets Located? *
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {JURISDICTIONS.map(j => {
                                const isSelected = watchedValues.q2_asset_jurisdictions?.includes(j);
                                return (
                                  <button
                                    key={j}
                                    type="button"
                                    onClick={() => {
                                      const current = watchedValues.q2_asset_jurisdictions || [];
                                      if (isSelected) {
                                        setValue('q2_asset_jurisdictions', current.filter(c => c !== j));
                                      } else {
                                        setValue('q2_asset_jurisdictions', [...current, j]);
                                      }
                                    }}
                                    className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-all ${
                                      isSelected
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-muted/20 border-primary/10 text-muted-foreground hover:border-primary/30'
                                    }`}
                                  >
                                    {j}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Planning Move */}
                          <div className="p-4 bg-muted/20 rounded-xl border border-primary/10">
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={watchedValues.q2_planning_move}
                                onChange={(e) => setValue('q2_planning_move', e.target.checked)}
                                className="w-5 h-5 rounded border-primary/30 text-primary focus:ring-primary/40"
                              />
                              <span className="text-sm font-medium text-foreground">
                                I'm planning to relocate or change tax residence
                              </span>
                            </label>

                            {watchedValues.q2_planning_move && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-4"
                              >
                                <label className="block text-sm font-semibold text-foreground mb-2">
                                  Target Jurisdiction
                                </label>
                                <select
                                  {...methods.register('q2_target_jurisdiction')}
                                  className="w-full px-4 py-3 bg-muted/30 border border-primary/20 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                                >
                                  <option value="">Select destination...</option>
                                  {JURISDICTIONS.map(j => (
                                    <option key={j} value={j}>{j}</option>
                                  ))}
                                </select>
                              </motion.div>
                            )}
                          </div>

                          {/* Existing Structures */}
                          <div>
                            <label className="block text-sm font-semibold text-foreground mb-3">
                              Existing Structures
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {STRUCTURES.map(s => {
                                const isSelected = watchedValues.q2_existing_structures?.includes(s);
                                return (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => {
                                      const current = watchedValues.q2_existing_structures || [];
                                      if (isSelected) {
                                        setValue('q2_existing_structures', current.filter(c => c !== s));
                                      } else {
                                        setValue('q2_existing_structures', [...current, s]);
                                      }
                                    }}
                                    className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-all ${
                                      isSelected
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-muted/20 border-primary/10 text-muted-foreground hover:border-primary/30'
                                    }`}
                                  >
                                    {s}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Q3: Timeline & Forcing Events */}
                      {currentQuestion === 2 && (
                        <div className="space-y-6">
                          {/* Liquidity Timeline Slider */}
                          <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">
                              When Do You Need Liquidity? *
                            </label>
                            <div className="px-2">
                              <input
                                type="range"
                                min={90}
                                max={730}
                                step={30}
                                value={watchedValues.q3_liquidity_timeline || 365}
                                onChange={(e) => setValue('q3_liquidity_timeline', parseInt(e.target.value))}
                                className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                              />
                              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                                <span>90 days</span>
                                <span className="text-primary font-semibold text-sm">
                                  {watchedValues.q3_liquidity_timeline || 365} days
                                </span>
                                <span>730 days</span>
                              </div>
                            </div>
                          </div>

                          {/* Forcing Events */}
                          <div>
                            <label className="block text-sm font-semibold text-foreground mb-3">
                              Forcing Events Driving Your Decisions
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {FORCING_EVENTS.map(event => {
                                const isSelected = watchedValues.q3_forcing_events?.includes(event);
                                return (
                                  <button
                                    key={event}
                                    type="button"
                                    onClick={() => {
                                      const current = watchedValues.q3_forcing_events || [];
                                      if (isSelected) {
                                        setValue('q3_forcing_events', current.filter(e => e !== event));
                                      } else {
                                        setValue('q3_forcing_events', [...current, event]);
                                      }
                                    }}
                                    className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-all ${
                                      isSelected
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-muted/20 border-primary/10 text-muted-foreground hover:border-primary/30'
                                    }`}
                                  >
                                    {event}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Advisor Count */}
                          <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">
                              How Many Advisors Coordinate Your Wealth?
                            </label>
                            <div className="flex items-center gap-4">
                              <button
                                type="button"
                                onClick={() => setValue('q3_advisor_count', Math.max(0, (watchedValues.q3_advisor_count || 2) - 1))}
                                className="w-10 h-10 rounded-full bg-muted/30 border border-primary/20 flex items-center justify-center text-foreground hover:bg-muted/50"
                              >
                                -
                              </button>
                              <span className="text-2xl font-bold text-primary w-12 text-center">
                                {watchedValues.q3_advisor_count || 2}
                              </span>
                              <button
                                type="button"
                                onClick={() => setValue('q3_advisor_count', Math.min(10, (watchedValues.q3_advisor_count || 2) + 1))}
                                className="w-10 h-10 rounded-full bg-muted/30 border border-primary/20 flex items-center justify-center text-foreground hover:bg-muted/50"
                              >
                                +
                              </button>
                              <span className="text-sm text-muted-foreground ml-2">advisors</span>
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                              3+ advisors creates 7-day approval chains. 5+ creates 21-day chains.
                            </p>
                          </div>

                          {/* Decision Style */}
                          <div>
                            <label className="block text-sm font-semibold text-foreground mb-3">
                              Your Decision-Making Style
                            </label>
                            <div className="space-y-2">
                              {DECISION_STYLES.map(style => {
                                const isSelected = watchedValues.q3_decision_style === style.id;
                                return (
                                  <button
                                    key={style.id}
                                    type="button"
                                    onClick={() => setValue('q3_decision_style', style.id as any)}
                                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                                      isSelected
                                        ? 'bg-primary/10 border-primary'
                                        : 'bg-muted/20 border-primary/10 hover:border-primary/30'
                                    }`}
                                  >
                                    <span className={`font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                      {style.label}
                                    </span>
                                    <p className="text-xs text-muted-foreground mt-0.5">{style.desc}</p>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Non-Negotiable */}
                          <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">
                              One Thing That's Non-Negotiable
                            </label>
                            <input
                              type="text"
                              {...methods.register('q3_non_negotiable')}
                              placeholder="e.g., Must maintain US green card, Children's education fund untouched..."
                              className="w-full px-4 py-3 bg-muted/30 border border-primary/20 rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>

                    {/* Insight Box */}
                    <motion.div
                      className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-xl"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        <span className="text-primary font-semibold">Pattern Insight:</span>{' '}
                        {SMART_QUESTIONS[currentQuestion].insight}
                      </p>
                    </motion.div>

                    {/* Navigation */}
                    <motion.div
                      className="flex justify-between items-center mt-8 gap-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <button
                        type="button"
                        onClick={handleBack}
                        disabled={currentQuestion === 0 || isSubmitting}
                        className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-muted/30 border border-primary/20 rounded-xl font-medium text-foreground hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Back</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-6 sm:px-10 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            <span>Analyzing...</span>
                          </>
                        ) : isLastQuestion ? (
                          <>
                            <span>Complete Assessment</span>
                            <Check className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            <span>Continue</span>
                            <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </form>
            </FormProvider>
          </div>
        </div>

        {/* Live Intelligence Stream - Right Side */}
        <div className="lg:w-1/2 lg:border-l border-primary/20 bg-muted/5">
          <LiveIntelligenceStream opportunities={opportunities} />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Premium Institutional Analyzing Screen
// Matches DigitalTwinWaiting style - clean, premium, SSE-synced
// =============================================================================

type ProcessingStep = {
  id: string;
  label: string;
  estimatedSeconds: number;
  status: 'pending' | 'processing' | 'complete';
};

interface DecisionMemoAnalyzingProps {
  intakeId: string;
  onComplete: () => void;
}

function DecisionMemoAnalyzing({ intakeId, onComplete }: DecisionMemoAnalyzingProps) {
  const router = useRouter();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(1);
  const [developmentCount, setDevelopmentCount] = useState(1875);
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { id: 'intake', label: 'Intake analysis completed', estimatedSeconds: 0, status: 'complete' },
    { id: 'precedents', label: 'Cross-referencing HNWI precedents', estimatedSeconds: 5, status: 'processing' },
    { id: 'opportunities', label: 'Matching opportunities to profile', estimatedSeconds: 8, status: 'pending' },
    { id: 'risks', label: 'Calculating exposure risks', estimatedSeconds: 5, status: 'pending' },
    { id: 'memo', label: 'Generating Decision Memo', estimatedSeconds: 7, status: 'pending' },
  ]);

  // Fetch actual development count
  useEffect(() => {
    async function fetchCount() {
      try {
        const response = await fetch('/api/developments/counts');
        if (response.ok) {
          const data = await response.json();
          const count = data.developments?.total_count || data.total_count || data.count || 1875;
          setDevelopmentCount(count);
        }
      } catch {
        // Keep default
      }
    }
    fetchCount();
  }, []);

  // SSE connection for analysis_step and preview_ready events
  useEffect(() => {
    if (!intakeId || hasCompleted) return;

    const eventSource = new EventSource(`/api/decision-memo/stream/${intakeId}`);

    // Listen for step progress updates from backend
    eventSource.addEventListener('analysis_step', (e) => {
      try {
        const data = JSON.parse(e.data);
        const stepId = data.step_id || data.step;
        console.log('📊 Analysis step:', stepId);

        // Find and update step status
        setSteps(prev => {
          const stepIndex = prev.findIndex(s => s.id === stepId);
          if (stepIndex === -1) return prev;

          return prev.map((step, i) => ({
            ...step,
            status: i < stepIndex ? 'complete' : i === stepIndex ? 'processing' : step.status
          }));
        });
      } catch (error) {
        console.error('Failed to parse analysis_step:', error);
      }
    });

    // Listen for preview ready - complete all steps and redirect
    eventSource.addEventListener('preview_ready', (e) => {
      console.log('✅ SSE: preview_ready received in analyzing screen');
      setHasCompleted(true);

      // Mark all steps complete
      setSteps(prev => prev.map(step => ({ ...step, status: 'complete' })));

      // Wait a moment to show completion, then redirect
      setTimeout(() => {
        eventSource.close();
        router.push(`/decision-memo/preview/${intakeId}`);
      }, 1000);
    });

    eventSource.addEventListener('error', () => {
      console.log('⚠️ SSE connection error in analyzing screen');
    });

    return () => {
      eventSource.close();
    };
  }, [intakeId, hasCompleted, router]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Progress through steps based on elapsed time (fallback if SSE doesn't send step events)
  useEffect(() => {
    if (hasCompleted) return;

    // More realistic step progression matching backend processing
    let targetStep = 1;
    if (elapsedTime >= 5) targetStep = 2;   // opportunities
    if (elapsedTime >= 13) targetStep = 3;  // risks
    // Don't auto-complete memo step - wait for SSE preview_ready

    targetStep = Math.min(targetStep, steps.length - 2);

    if (targetStep !== currentStepIndex) {
      setCurrentStepIndex(targetStep);
      setSteps(prev => prev.map((step, i) => ({
        ...step,
        status: i < targetStep ? 'complete' : i === targetStep ? 'processing' : 'pending'
      })));
    }
  }, [elapsedTime, currentStepIndex, hasCompleted, steps.length]);

  // Fallback timeout - if no preview_ready after 25s, redirect anyway
  useEffect(() => {
    if (hasCompleted) return;

    const timeout = setTimeout(() => {
      console.log('⏱️ Fallback timeout in analyzing screen - redirecting');
      setHasCompleted(true);
      setSteps(prev => prev.map(step => ({ ...step, status: 'complete' })));
      setTimeout(() => {
        router.push(`/decision-memo/preview/${intakeId}`);
      }, 500);
    }, 25000);

    return () => clearTimeout(timeout);
  }, [intakeId, hasCompleted, router]);

  const totalEstimatedSeconds = steps.reduce((sum, step) => sum + step.estimatedSeconds, 0);
  const progressPercentage = Math.min((elapsedTime / totalEstimatedSeconds) * 100, 95);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-background"
      style={{ padding: '20px 6px' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-card rounded-2xl shadow-2xl overflow-hidden border border-border"
        style={{
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)',
          willChange: 'transform'
        }}
      >
        {/* Header */}
        <div className="bg-primary p-6 text-primary-foreground text-center">
          <h1 className="text-3xl font-bold mb-2">
            Decision Memo Generation
          </h1>
          <p className="text-primary-foreground/80">
            Analyzing your wealth profile against {developmentCount.toLocaleString()}+ HNWI precedents
          </p>
        </div>

        {/* Progress Overview */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-foreground">
              Overall Progress
            </span>
            <span className="text-sm font-mono text-muted-foreground">
              Elapsed: {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
            </span>
          </div>
          <div className="h-4 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-primary"
            />
          </div>
        </div>

        {/* Processing Steps */}
        <div className="p-6 space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                step.status === 'complete'
                  ? 'bg-primary/10 border border-primary/30'
                  : step.status === 'processing'
                  ? 'bg-primary/5 border border-primary/20'
                  : 'bg-muted/50 border border-border'
              }`}
            >
              {/* Icon */}
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                {step.status === 'complete' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold"
                  >
                    ✓
                  </motion.div>
                )}
                {step.status === 'processing' && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full"
                  />
                )}
                {step.status === 'pending' && (
                  <div className="w-6 h-6 border-2 border-muted-foreground/30 rounded-full" />
                )}
              </div>

              {/* Label */}
              <div className="flex-1">
                <div className={`font-semibold ${
                  step.status === 'complete'
                    ? 'text-foreground'
                    : step.status === 'processing'
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                }`}>
                  {step.label}
                </div>
                {step.status === 'processing' && (
                  <div className="text-xs text-primary mt-1">
                    Processing...
                  </div>
                )}
              </div>

              {/* Duration */}
              {step.estimatedSeconds > 0 && step.status !== 'complete' && (
                <div className="flex-shrink-0 text-xs text-muted-foreground">
                  ~{step.estimatedSeconds}s
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-muted/50 border-t border-border">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              This analysis requires deep pattern matching across {developmentCount.toLocaleString()}+ HNWI World developments.
            </p>
            <p className="text-xs text-muted-foreground">
              Your personalized Decision Memo identifies opportunities and blind spots.
            </p>
          </div>
        </div>

        {/* Completion State */}
        {hasCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-primary/10 border-t-4 border-primary"
          >
            <div className="text-center">
              <h3 className="text-xl font-bold text-foreground mb-1">
                Analysis Complete
              </h3>
              <p className="text-sm text-muted-foreground">
                Preparing your personalized preview...
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
