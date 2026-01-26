// components/decision-memo/questions/Q4JurisdictionChanges.tsx
// Question 4: Jurisdiction Changes (if planning to move)

"use client";

import { useFormContext } from 'react-hook-form';

const JURISDICTIONS = [
  'United States', 'United Kingdom', 'UAE', 'Singapore', 'India',
  'Canada', 'Australia', 'Switzerland', 'Portugal', 'Spain',
  'France', 'Germany', 'Hong Kong', 'Thailand', 'Other'
];

const REASONS = [
  'Tax optimization',
  'Visa/immigration requirements',
  'Business expansion',
  'Family/lifestyle',
  'Asset protection',
  'Regulatory arbitrage',
  'Exit planning',
  'Other',
];

export function Q4JurisdictionChanges() {
  const { register, watch, setValue } = useFormContext();

  const planningMove = watch('q4_planning_move');
  const from = watch('q4_from');
  const to = watch('q4_to');
  const timeline = watch('q4_timeline');

  return (
    <div className="space-y-6">
      {/* Planning Move? */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
          Are you planning to change jurisdictions? *
        </label>
        <div className="space-y-3">
          <label
            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
              planningMove === 'yes'
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-border hover:border-border/60'
            }`}
          >
            <input
              type="radio"
              {...register('q4_planning_move')}
              value="yes"
              className="mr-3"
              onChange={() => setValue('q4_planning_move', 'yes')}
            />
            <div>
              <div className="font-medium">Yes, planning jurisdiction change</div>
              <div className="text-sm text-muted-foreground">
                Relocating residence or tax domicile
              </div>
            </div>
          </label>

          <label
            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
              planningMove === 'no'
                ? 'border-green-500 bg-green-500/10'
                : 'border-border hover:border-border/60'
            }`}
          >
            <input
              type="radio"
              {...register('q4_planning_move')}
              value="no"
              className="mr-3"
              onChange={() => setValue('q4_planning_move', 'no')}
            />
            <div>
              <div className="font-medium">No, staying in current jurisdiction</div>
              <div className="text-sm text-muted-foreground">
                No planned relocation
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Conditional Fields - Only show if planning move */}
      {planningMove === 'yes' && (
        <>
          {/* From */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              Moving FROM which jurisdiction?
            </label>
            <select
              {...register('q4_from')}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            >
              <option value="">Select jurisdiction...</option>
              {JURISDICTIONS.map((jurisdiction) => (
                <option key={jurisdiction} value={jurisdiction}>
                  {jurisdiction}
                </option>
              ))}
            </select>
          </div>

          {/* To */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              Moving TO which jurisdiction?
            </label>
            <select
              {...register('q4_to')}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            >
              <option value="">Select jurisdiction...</option>
              {JURISDICTIONS.map((jurisdiction) => (
                <option key={jurisdiction} value={jurisdiction}>
                  {jurisdiction}
                </option>
              ))}
            </select>
          </div>

          {/* Timeline */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              When must this move complete?
            </label>
            <input
              type="text"
              {...register('q4_timeline')}
              placeholder="E.g., Q2 2026, before June 2026, within 6 months"
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              Primary reason for move
            </label>
            <select
              {...register('q4_reason')}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            >
              <option value="">Select reason...</option>
              {REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>

          {/* Sequencing Warning */}
          {from && to && (
            <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-4">
              <p className="text-orange-500 text-sm">
                ⚠️ <strong>Sequencing critical:</strong> {from} → {to} move requires exit tax analysis,
                residency establishment sequence, and timing of entity transfers. Order matters.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
