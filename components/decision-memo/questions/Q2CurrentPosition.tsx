// components/decision-memo/questions/Q2CurrentPosition.tsx
// Question 2: Current Position (Residency & Tax Residence)

"use client";

import { useFormContext } from 'react-hook-form';

const COMMON_JURISDICTIONS = [
  'United States', 'United Kingdom', 'UAE', 'Singapore', 'India',
  'Canada', 'Australia', 'Switzerland', 'Portugal', 'Spain',
  'France', 'Germany', 'Hong Kong', 'Thailand', 'Other'
];

export function Q2CurrentPosition() {
  const { register, formState: { errors }, watch } = useFormContext();

  const residency = watch('q2_residency');
  const taxResidence = watch('q2_tax_residence');

  return (
    <div className="space-y-6">
      {/* Info Box */}
      <div className="bg-muted/50 border border-border rounded-lg p-6">
        <p className="text-base mb-2">
          <strong>Critical for sequencing:</strong> Your current position determines what you can and cannot do.
        </p>
        <p className="text-sm text-muted-foreground">
          Residency ≠ Tax residence. Many HNWIs are physically in one place but tax-resident elsewhere.
        </p>
      </div>

      {/* Current Residency */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
          Where do you currently reside? *
        </label>
        <p className="text-sm text-muted-foreground mb-3">
          Physical location where you spend most of your time
        </p>
        <select
          {...register('q2_residency')}
          className={`w-full px-4 py-3 bg-background border ${
            errors.q2_residency ? 'border-amber-500' : 'border-border'
          } rounded-lg text-foreground focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500`}
        >
          <option value="">Select jurisdiction...</option>
          {COMMON_JURISDICTIONS.map((jurisdiction) => (
            <option key={jurisdiction} value={jurisdiction}>
              {jurisdiction}
            </option>
          ))}
        </select>
        {errors.q2_residency && (
          <div className="text-xs text-amber-500 mt-2">
            {errors.q2_residency.message as string}
          </div>
        )}
      </div>

      {/* Tax Residence */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
          Where are you tax resident? *
        </label>
        <p className="text-sm text-muted-foreground mb-3">
          Jurisdiction where you file taxes (may differ from residency)
        </p>
        <select
          {...register('q2_tax_residence')}
          className={`w-full px-4 py-3 bg-background border ${
            errors.q2_tax_residence ? 'border-amber-500' : 'border-border'
          } rounded-lg text-foreground focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500`}
        >
          <option value="">Select jurisdiction...</option>
          {COMMON_JURISDICTIONS.map((jurisdiction) => (
            <option key={jurisdiction} value={jurisdiction}>
              {jurisdiction}
            </option>
          ))}
        </select>
        {errors.q2_tax_residence && (
          <div className="text-xs text-amber-500 mt-2">
            {errors.q2_tax_residence.message as string}
          </div>
        )}
      </div>

      {/* Warning if mismatch */}
      {residency && taxResidence && residency !== taxResidence && (
        <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-4">
          <p className="text-orange-500 text-sm">
            ⚠️ <strong>Mismatch detected:</strong> You reside in {residency} but are tax resident in {taxResidence}.
            This creates sequencing dependencies for any jurisdiction changes.
          </p>
        </div>
      )}
    </div>
  );
}
