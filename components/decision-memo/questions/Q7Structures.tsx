// components/decision-memo/questions/Q7Structures.tsx
// Question 7: Current Structures

"use client";

import { useFormContext } from 'react-hook-form';

const STRUCTURE_TYPES = [
  'No formal structures (direct ownership)',
  'Living trust',
  'Irrevocable trust',
  'Family limited partnership (FLP)',
  'LLC / Holding company',
  'Offshore trust',
  'Foundation',
  'Multijurisdiction structure',
  'Other',
];

export function Q7Structures() {
  const { watch, setValue } = useFormContext();

  const structures = watch('q7_structures') || [];

  const toggleStructure = (structure: string) => {
    const current = structures || [];
    if (current.includes(structure)) {
      setValue('q7_structures', current.filter((s: string) => s !== structure));
    } else {
      setValue('q7_structures', [...current, structure]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Box */}
      <div className="bg-muted/50 border border-border rounded-lg p-6">
        <p className="text-base mb-2">
          <strong>Structures add protection but also coordination overhead</strong>
        </p>
        <p className="text-sm text-muted-foreground">
          Each structure layer = additional approval requirements, reporting, and time delays.
        </p>
      </div>

      {/* Structure Selection */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
          What wealth structures do you currently use?
        </label>
        <p className="text-sm text-muted-foreground mb-4">
          Select all that apply
        </p>
        <div className="space-y-2">
          {STRUCTURE_TYPES.map((structure) => (
            <label
              key={structure}
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                structures.includes(structure)
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-border hover:border-border/60'
              }`}
            >
              <input
                type="checkbox"
                checked={structures.includes(structure)}
                onChange={() => toggleStructure(structure)}
                className="mr-3"
              />
              <span>{structure}</span>
            </label>
          ))}
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          {structures.length} structure{structures.length !== 1 ? 's' : ''} selected
        </div>
      </div>

      {/* Warnings */}
      {structures.includes('No formal structures (direct ownership)') && structures.length === 1 && (
        <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-4">
          <p className="text-orange-500 text-sm">
            ⚠️ <strong>No asset protection:</strong> Direct ownership = full exposure to creditors, litigation, and estate taxes.
            Consider structuring before major moves.
          </p>
        </div>
      )}

      {structures.includes('Multijurisdiction structure') && (
        <div className="bg-amber-500/10 border border-amber-500 rounded-lg p-4">
          <p className="text-amber-500 text-sm">
            ⚠️ <strong>High complexity:</strong> Multijurisdiction structures require coordination across legal systems.
            Any move = cascade of approvals and filings.
          </p>
        </div>
      )}

      {structures.length >= 3 && !structures.includes('No formal structures (direct ownership)') && (
        <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-4">
          <p className="text-orange-500 text-sm">
            ⚠️ <strong>Coordination overhead:</strong> You have {structures.length} structure types.
            Each layer adds 7-14 days to decision timelines.
          </p>
        </div>
      )}
    </div>
  );
}
