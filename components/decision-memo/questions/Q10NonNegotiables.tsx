// components/decision-memo/questions/Q10NonNegotiables.tsx
// Question 10: Non-Negotiables

"use client";

import { useFormContext } from 'react-hook-form';

export function Q10NonNegotiables() {
  const { register, watch } = useFormContext();

  const nonNegotiable = watch('q10_non_negotiable') || '';

  return (
    <div className="space-y-6">
      {/* Info Box */}
      <div className="bg-muted/50 border border-border rounded-lg p-6">
        <p className="text-base mb-2">
          <strong>Constraints define strategy. What you WON'T do matters more than what you will.</strong>
        </p>
        <p className="text-sm text-muted-foreground">
          Examples: Won't relocate family, won't give up US passport, won't expose assets to creditors
        </p>
      </div>

      {/* Non-Negotiable Input */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
          What is absolutely non-negotiable in your wealth planning?
        </label>
        <p className="text-sm text-muted-foreground mb-3">
          What constraints or red lines define your decision space?
        </p>
        <textarea
          {...register('q10_non_negotiable')}
          className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none"
          rows={5}
          maxLength={400}
          placeholder="E.g., Will not cede voting control in operating entities. Must maintain $5M liquid buffer for capital calls. Zero exposure to FATCA-reporting jurisdictions. No structures requiring public beneficial ownership disclosure."
        />
        <div className="text-xs text-muted-foreground mt-2 text-right">
          {nonNegotiable.length}/400 characters
        </div>
      </div>

      {/* Guidance Examples */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="font-semibold mb-3">Common non-negotiables that constrain strategy:</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• <strong>Family stability:</strong> Principal residence stays in current jurisdiction</li>
          <li>• <strong>Citizenship:</strong> Won't renounce passport for tax benefits</li>
          <li>• <strong>Liquidity:</strong> Must access $X within Y days for emergencies</li>
          <li>• <strong>Privacy:</strong> No public filings or beneficial ownership disclosure</li>
          <li>• <strong>Control:</strong> Won't cede decision authority to trustees/advisors</li>
          <li>• <strong>Legacy:</strong> Assets must transfer intact to heirs</li>
          <li>• <strong>Risk:</strong> Zero exposure to creditors/litigation in home jurisdiction</li>
        </ul>
      </div>

      {/* Clarity Note */}
      {nonNegotiable.length > 100 && (
        <div className="bg-green-500/10 border border-green-500 rounded-lg p-4">
          <p className="text-green-500 text-sm">
            ✓ <strong>Clear constraints:</strong> Your memo will filter out any strategies
            that violate these non-negotiables, saving you time evaluating dead-end paths.
          </p>
        </div>
      )}

      {nonNegotiable.length === 0 && (
        <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
          <p className="text-blue-500 text-sm">
            💡 <strong>Tip:</strong> Even if "flexible," most HNWIs have hidden constraints
            (family, citizenship, liquidity). Stating them explicitly prevents wasted analysis.
          </p>
        </div>
      )}
    </div>
  );
}
