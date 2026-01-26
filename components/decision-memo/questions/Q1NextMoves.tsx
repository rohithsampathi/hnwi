// components/decision-memo/questions/Q1NextMoves.tsx
// Question 1: Next Allocation Moves (1-3 moves)

"use client";

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

export function Q1NextMoves() {
  const { register, formState: { errors }, watch } = useFormContext();
  const [showMove3, setShowMove3] = useState(false);

  const move1 = watch('q1_move1') || '';
  const move2 = watch('q1_move2') || '';
  const move3 = watch('q1_move3') || '';

  return (
    <div className="space-y-6">
      {/* Instruction */}
      <div className="bg-muted/50 border border-border rounded-lg p-6">
        <p className="text-base mb-4">
          Most HNWIs describe <strong>intent</strong>, not <strong>moves</strong>.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm uppercase tracking-wide text-amber-500 mb-2 font-semibold">❌ FAILS TEST</div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>"Diversify my portfolio"</li>
              <li>"Explore real estate opportunities"</li>
              <li>"Consider moving to Dubai"</li>
            </ul>
          </div>

          <div>
            <div className="text-sm uppercase tracking-wide text-green-500 mb-2 font-semibold">✅ PASSES TEST</div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>"Acquire $5M commercial RE in Miami for EB-5"</li>
              <li>"Apply for UK Innovator Founder Visa within 90 days"</li>
              <li>"Transfer $2M from Singapore to UK entity by Q2"</li>
            </ul>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Include: $amount, asset type, jurisdiction, timeline
        </p>
      </div>

      {/* Move 1 */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
          Move 1 (Required) *
        </label>
        <textarea
          {...register('q1_move1')}
          className={`w-full px-4 py-3 bg-background border ${
            errors.q1_move1 ? 'border-amber-500' : 'border-border'
          } rounded-lg text-foreground focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none`}
          rows={3}
          maxLength={200}
          placeholder="E.g., Acquire $5M commercial real estate in Miami for EB-5 investor visa by June 2026"
        />
        <div className="flex justify-between mt-2">
          <div className="text-xs text-amber-500">
            {errors.q1_move1?.message as string}
          </div>
          <div className="text-xs text-muted-foreground">
            {move1.length}/200
          </div>
        </div>
      </div>

      {/* Move 2 */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
          Move 2 (Recommended)
        </label>
        <p className="text-sm text-amber-500 mb-3">
          ⚠️ Most blind spots come from coordination between moves. If you have a second move, list it for complete analysis.
        </p>
        <textarea
          {...register('q1_move2')}
          className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none"
          rows={3}
          maxLength={200}
          placeholder="E.g., Apply for UK Innovator Founder Visa (Golden Visa track) within 3 months"
        />
        <div className="flex justify-between mt-2">
          <div className="text-xs text-muted-foreground">
            {move2.length}/200
          </div>
        </div>
      </div>

      {/* Move 3 - Optional expansion */}
      {showMove3 && (
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
            Move 3 (Optional)
          </label>
          <textarea
            {...register('q1_move3')}
            className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none"
            rows={3}
            maxLength={200}
            placeholder="E.g., Transfer $2M from Singapore VCC to UK LLP entity by Q2 2026"
          />
          <div className="flex justify-between mt-2">
            <div className="text-xs text-muted-foreground">
              {move3.length}/200
            </div>
          </div>
        </div>
      )}

      {/* Add Move 3 button - only show if Move 2 has content */}
      {!showMove3 && move2.length > 10 && (
        <button
          type="button"
          onClick={() => setShowMove3(true)}
          className="w-full px-4 py-3 border-2 border-dashed border-border hover:border-amber-500 rounded-lg text-sm font-medium text-muted-foreground hover:text-amber-500 transition-colors"
        >
          + Add Move 3 (for complex multi-step sequences)
        </button>
      )}
    </div>
  );
}
