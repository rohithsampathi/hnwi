// components/decision-memo/questions/Q6LiquidityTimeline.tsx
// Question 6: Liquidity Forcing Timeline - THE KILLER QUESTION

"use client";

import { useFormContext } from 'react-hook-form';

const FORCING_EVENTS = [
  'Visa/immigration deadline',
  'Tax residency deadline',
  'Investment opportunity closing',
  'Family relocation deadline',
  'Entity formation deadline',
  'Loan maturity/refinancing',
  'Exit event (M&A, IPO)',
  'Other',
];

export function Q6LiquidityTimeline() {
  const { register, watch, setValue } = useFormContext();

  const timeline = watch('q6_timeline');
  const forcingEvents = watch('q6_forcing_events') || [];

  const toggleEvent = (event: string) => {
    const current = forcingEvents || [];
    if (current.includes(event)) {
      setValue('q6_forcing_events', current.filter((e: string) => e !== event), { shouldValidate: true });
    } else {
      setValue('q6_forcing_events', [...current, event], { shouldValidate: true });
    }
  };

  const handleTimelineChange = (value: number) => {
    setValue('q6_timeline', value, { shouldValidate: true, shouldTouch: true });
  };

  return (
    <div className="space-y-6">
      {/* Warning Box */}
      <div className="bg-primary/10 border-2 border-primary rounded-lg p-6">
        <div className="flex items-start gap-3">
          <div className="text-3xl">⚠️</div>
          <div>
            <h3 className="text-xl font-bold text-primary mb-2">
              THIS IS THE QUESTION THAT BREAKS MOST HNWIS
            </h3>
            <p className="text-muted-foreground mb-3">
              60% select "730+ days" (no urgency).<br />
              Reality: They have a visa deadline in 180 days.
            </p>
            <p className="text-base font-medium">
              Your coordination risk isn't what you <strong>WANT</strong>.
              It's what you're <strong>FORCED</strong> to do.
            </p>
          </div>
        </div>
      </div>

      {/* Timeline Selection */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
          When do you have FORCED liquidity need?
        </label>
        <div className="space-y-3">
          {[
            { value: 90, label: 'Within 90 days', description: 'High urgency, severe coordination risk', color: 'red' },
            { value: 180, label: 'Within 180 days', description: 'Medium urgency, moderate risk', color: 'orange' },
            { value: 365, label: 'Within 365 days', description: 'Standard timeline, manageable risk', color: 'yellow' },
            { value: 730, label: '730+ days', description: 'No forcing event, flexible timeline', color: 'green' },
          ].map((option) => (
            <label
              key={option.value}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                timeline === option.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              <input
                type="radio"
                checked={timeline === option.value}
                onChange={() => handleTimelineChange(option.value)}
                value={option.value}
                className="mr-4 cursor-pointer"
              />
              <div className="flex-1">
                <div className="font-semibold text-lg">{option.label}</div>
                <div className="text-sm text-muted-foreground">{option.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Forcing Events */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
          What forcing events create this timeline?
        </label>
        <p className="text-sm text-muted-foreground mb-4">
          Optional but reveals exposure. Select all that apply.
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          {FORCING_EVENTS.map((event) => (
            <label
              key={event}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                forcingEvents.includes(event)
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              <input
                type="checkbox"
                checked={forcingEvents.includes(event)}
                onChange={() => toggleEvent(event)}
                className="mr-3 cursor-pointer"
              />
              <span>{event}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Warning if mismatch */}
      {timeline === 730 && forcingEvents.length > 0 && (
        <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-4">
          <p className="text-orange-500 text-sm">
            ⚠️ <strong>Blind spot detected:</strong> You selected "730+ days" but listed forcing events.
            This mismatch will be flagged in your stress test results.
          </p>
        </div>
      )}
    </div>
  );
}
