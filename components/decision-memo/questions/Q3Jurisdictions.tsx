// components/decision-memo/questions/Q3Jurisdictions.tsx
// Question 3: Asset & Entity Locations

"use client";

import { useFormContext } from 'react-hook-form';

const JURISDICTIONS = [
  'United States', 'United Kingdom', 'UAE', 'Singapore', 'India',
  'Canada', 'Australia', 'Switzerland', 'Portugal', 'Spain',
  'France', 'Germany', 'Hong Kong', 'Thailand', 'Cayman Islands',
  'British Virgin Islands', 'Luxembourg', 'Netherlands', 'Other'
];

export function Q3Jurisdictions() {
  const { watch, setValue } = useFormContext();

  const assetJurisdictions = watch('q3_asset_jurisdictions') || [];
  const entityJurisdictions = watch('q3_entity_jurisdictions') || [];

  const toggleAssetJurisdiction = (jurisdiction: string) => {
    const current = assetJurisdictions || [];
    if (current.includes(jurisdiction)) {
      setValue('q3_asset_jurisdictions', current.filter((j: string) => j !== jurisdiction));
    } else {
      setValue('q3_asset_jurisdictions', [...current, jurisdiction]);
    }
  };

  const toggleEntityJurisdiction = (jurisdiction: string) => {
    const current = entityJurisdictions || [];
    if (current.includes(jurisdiction)) {
      setValue('q3_entity_jurisdictions', current.filter((j: string) => j !== jurisdiction));
    } else {
      setValue('q3_entity_jurisdictions', [...current, jurisdiction]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Box */}
      <div className="bg-muted/50 border border-border rounded-lg p-6">
        <p className="text-base mb-2">
          <strong>Coordination complexity = number of jurisdictions × number of advisors</strong>
        </p>
        <p className="text-sm text-muted-foreground">
          Each jurisdiction adds regulatory requirements, reporting obligations, and advisor dependencies.
        </p>
      </div>

      {/* Asset Jurisdictions */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
          Where are your assets located? *
        </label>
        <p className="text-sm text-muted-foreground mb-3">
          Physical or legal location of real estate, bank accounts, securities (select all that apply)
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {JURISDICTIONS.map((jurisdiction) => (
            <label
              key={jurisdiction}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                assetJurisdictions.includes(jurisdiction)
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-border hover:border-border/60'
              }`}
            >
              <input
                type="checkbox"
                checked={assetJurisdictions.includes(jurisdiction)}
                onChange={() => toggleAssetJurisdiction(jurisdiction)}
                className="mr-2"
              />
              <span className="text-sm">{jurisdiction}</span>
            </label>
          ))}
        </div>
        {assetJurisdictions.length === 0 && (
          <div className="text-xs text-amber-500 mt-2">
            Select at least one asset location
          </div>
        )}
        <div className="text-xs text-muted-foreground mt-2">
          {assetJurisdictions.length} jurisdiction{assetJurisdictions.length !== 1 ? 's' : ''} selected
        </div>
      </div>

      {/* Entity Jurisdictions */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
          Where are your entities incorporated? (Optional)
        </label>
        <p className="text-sm text-muted-foreground mb-3">
          Trusts, holding companies, foundations (select all that apply)
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {JURISDICTIONS.map((jurisdiction) => (
            <label
              key={jurisdiction}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                entityJurisdictions.includes(jurisdiction)
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-border hover:border-border/60'
              }`}
            >
              <input
                type="checkbox"
                checked={entityJurisdictions.includes(jurisdiction)}
                onChange={() => toggleEntityJurisdiction(jurisdiction)}
                className="mr-2"
              />
              <span className="text-sm">{jurisdiction}</span>
            </label>
          ))}
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          {entityJurisdictions.length} jurisdiction{entityJurisdictions.length !== 1 ? 's' : ''} selected
        </div>
      </div>

      {/* Complexity Warning */}
      {assetJurisdictions.length + entityJurisdictions.length >= 4 && (
        <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-4">
          <p className="text-orange-500 text-sm">
            ⚠️ <strong>High complexity:</strong> You have assets/entities in {assetJurisdictions.length + entityJurisdictions.length} jurisdictions.
            Each move requires cross-border coordination and compliance checks.
          </p>
        </div>
      )}
    </div>
  );
}
