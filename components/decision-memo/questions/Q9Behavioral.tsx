// components/decision-memo/questions/Q9Behavioral.tsx
// Question 9: Behavioral Patterns

"use client";

import { useFormContext } from 'react-hook-form';

export function Q9Behavioral() {
  const { register, watch } = useFormContext();

  const uncertainty = watch('q9_uncertainty');
  const pastBurns = watch('q9_past_burns') || '';

  return (
    <div className="space-y-6">
      {/* Info Box */}
      <div className="bg-muted/50 border border-border rounded-lg p-6">
        <p className="text-base mb-2">
          <strong>Pattern recognition: Past behavior predicts future coordination risk</strong>
        </p>
        <p className="text-sm text-muted-foreground">
          HNWIs who wait for certainty miss windows. HNWIs who act impulsively create cascades.
        </p>
      </div>

      {/* Uncertainty Response */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
          When facing regulatory uncertainty, you typically:
        </label>
        <div className="space-y-3">
          <label
            className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
              uncertainty === 'wait'
                ? 'border-orange-500 bg-orange-500/10'
                : 'border-border hover:border-border/60'
            }`}
          >
            <input
              type="radio"
              {...register('q9_uncertainty')}
              value="wait"
              className="mr-3 mt-1"
            />
            <div>
              <div className="font-medium">Wait for clarity before acting</div>
              <div className="text-sm text-muted-foreground">
                Analyze all options, consult advisors, move when path is clear
              </div>
            </div>
          </label>

          <label
            className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
              uncertainty === 'act'
                ? 'border-green-500 bg-green-500/10'
                : 'border-border hover:border-border/60'
            }`}
          >
            <input
              type="radio"
              {...register('q9_uncertainty')}
              value="act"
              className="mr-3 mt-1"
            />
            <div>
              <div className="font-medium">Act preemptively within windows</div>
              <div className="text-sm text-muted-foreground">
                Position before regulations finalize, adjust as clarity emerges
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Past Burns */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
          Past mistakes that cost you (Optional but revealing)
        </label>
        <p className="text-sm text-muted-foreground mb-3">
          Examples: Missed visa deadline, forced asset sale, unexpected tax bill, advisor delay
        </p>
        <textarea
          {...register('q9_past_burns')}
          className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none"
          rows={4}
          maxLength={300}
          placeholder="E.g., Missed Portugal Golden Visa window because immigration attorney didn't file in time. Lost $50K in real estate deposit."
        />
        <div className="text-xs text-muted-foreground mt-2 text-right">
          {pastBurns.length}/300 characters
        </div>
      </div>

      {/* Pattern Detection */}
      {uncertainty === 'wait' && (
        <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-4">
          <p className="text-orange-500 text-sm">
            ⚠️ <strong>Pattern detected:</strong> "Wait for clarity" = risk of missing windows.
            Regulatory windows close in 90-180 days. Waiting = forced decisions under time pressure.
          </p>
        </div>
      )}

      {pastBurns.length > 50 && (
        <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
          <p className="text-blue-500 text-sm">
            💡 <strong>Learning from past:</strong> Your memo will reference this experience
            to prevent similar coordination failures.
          </p>
        </div>
      )}
    </div>
  );
}
