// components/decision-memo/questions/Q8Advisors.tsx
// Question 8: Advisor Coordination Risk

"use client";

import { useFormContext } from 'react-hook-form';

const ADVISOR_TYPES = [
  'Tax advisor (specify jurisdiction)',
  'Immigration attorney',
  'Wealth structurer / Family office',
  'Investment advisor / Deal broker',
  'Legal counsel (entity formation)',
  'Banking / Treasury advisor',
  'Accounting / Audit',
  'Real estate advisor',
  'Other',
];

export function Q8Advisors() {
  const { register, watch, setValue } = useFormContext();

  const advisors = watch('q8_advisors') || [];
  const followingPlaybook = watch('q8_following_playbook');

  const toggleAdvisor = (advisor: string) => {
    const current = advisors || [];
    if (current.includes(advisor)) {
      setValue('q8_advisors', current.filter((a: string) => a !== advisor), { shouldValidate: true });
    } else {
      setValue('q8_advisors', [...current, advisor], { shouldValidate: true });
    }
  };

  const handlePlaybookChange = (value: boolean) => {
    setValue('q8_following_playbook', value, { shouldValidate: true, shouldTouch: true });
  };

  return (
    <div className="space-y-6">
      {/* Warning Box */}
      <div className="bg-primary/10 border-2 border-primary rounded-lg p-6">
        <div className="flex items-start gap-3">
          <div className="text-3xl">⚡</div>
          <div>
            <h3 className="text-xl font-bold text-primary mb-2">COORDINATION BLIND SPOT DETECTOR</h3>
            <p className="text-base text-muted-foreground">
              Each advisor adds <strong>7-14 days</strong> to your timeline.<br />
              If you have <strong>4 advisors + 180-day deadline</strong> = cascade risk.
            </p>
          </div>
        </div>
      </div>

      {/* Advisor Selection */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
          Which advisors are involved in executing your next moves?
        </label>
        <p className="text-sm text-muted-foreground mb-4">
          Select all that apply
        </p>
        <div className="space-y-2">
          {ADVISOR_TYPES.map((advisor) => (
            <label
              key={advisor}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                advisors.includes(advisor)
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              <input
                type="checkbox"
                checked={advisors.includes(advisor)}
                onChange={() => toggleAdvisor(advisor)}
                className="mr-3 cursor-pointer"
              />
              <span>{advisor}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Playbook */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
          Are you following a standard playbook or custom structuring?
        </label>
        <div className="space-y-3">
          <label
            className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
              followingPlaybook === true
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/30'
            }`}
          >
            <input
              type="radio"
              checked={followingPlaybook === true}
              onChange={() => handlePlaybookChange(true)}
              className="mr-3 mt-1 cursor-pointer"
            />
            <div>
              <div className="font-medium">Standard playbook</div>
              <div className="text-sm text-muted-foreground">
                E.g., Golden Visa pathway → Lower coordination risk
              </div>
            </div>
          </label>

          <label
            className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
              followingPlaybook === false
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/30'
            }`}
          >
            <input
              type="radio"
              checked={followingPlaybook === false}
              onChange={() => handlePlaybookChange(false)}
              className="mr-3 mt-1 cursor-pointer"
            />
            <div>
              <div className="font-medium">Custom structuring</div>
              <div className="text-sm text-muted-foreground">
                Higher coordination risk, needs SLAs
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Warning if high risk */}
      {advisors.length >= 4 && (
        <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-4">
          <p className="text-orange-500 text-sm">
            ⚠️ <strong>High coordination risk:</strong> You selected {advisors.length} advisors.
            The system will recommend advisor SLAs in your memo.
          </p>
        </div>
      )}
    </div>
  );
}
