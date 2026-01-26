// components/decision-memo/questions/Q5AssetBuckets.tsx
// Question 5: Asset Buckets (Allocation Intent & Liquidity)

"use client";

import { useFormContext } from 'react-hook-form';

const ASSET_CLASSES = [
  {
    id: 'real_estate',
    label: 'Real Estate',
    description: 'Direct ownership, REITs, fractional',
  },
  {
    id: 'private_equity',
    label: 'Private Equity / Alternatives',
    description: 'PE funds, hedge funds, private debt',
  },
  {
    id: 'public_markets',
    label: 'Public Markets',
    description: 'Stocks, bonds, ETFs',
  },
  {
    id: 'offshore_capital',
    label: 'Offshore Capital',
    description: 'Held outside tax jurisdiction',
  },
];

const INTENT_OPTIONS = [
  { value: 'hold', label: 'Hold', description: 'Maintain current allocation' },
  { value: 'add', label: 'Add', description: 'Increase exposure' },
  { value: 'reduce', label: 'Reduce', description: 'Decrease exposure' },
  { value: 'hold_add', label: 'Hold + Add selectively', description: 'Hold core, add opportunistic' },
];

const LIQUIDITY_OPTIONS = [
  { value: 'low', label: 'Low (90+ days)', color: 'red' },
  { value: 'medium', label: 'Medium (30-90 days)', color: 'orange' },
  { value: 'high', label: 'High (<30 days)', color: 'green' },
];

export function Q5AssetBuckets() {
  const { register, watch } = useFormContext();

  return (
    <div className="space-y-8">
      {/* Info Box */}
      <div className="bg-muted/50 border border-border rounded-lg p-6">
        <p className="text-base mb-2">
          <strong>Liquidity mismatch = forced selling at 10-20% discount</strong>
        </p>
        <p className="text-sm text-muted-foreground">
          If you need $2M in 90 days but 80% is in PE/RE with 180+ day liquidity, you're exposed.
        </p>
      </div>

      {/* Asset Classes */}
      {ASSET_CLASSES.map((assetClass) => (
        <AssetClassCard
          key={assetClass.id}
          id={assetClass.id}
          label={assetClass.label}
          description={assetClass.description}
          watch={watch}
          register={register}
        />
      ))}
    </div>
  );
}

function AssetClassCard({
  id,
  label,
  description,
  watch,
  register,
}: {
  id: string;
  label: string;
  description: string;
  watch: any;
  register: any;
}) {
  const intent = watch(`q5_${id}_intent`);
  const liquidity = watch(`q5_${id}_liquidity`);

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h4 className="text-xl font-bold mb-1">{label}</h4>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>

      {/* Intent */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Allocation Intent
        </label>
        <div className="grid grid-cols-2 gap-2">
          {INTENT_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`flex flex-col p-3 border rounded-lg cursor-pointer transition-colors ${
                intent === option.value
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-border hover:border-border/60'
              }`}
            >
              <input
                type="radio"
                {...register(`q5_${id}_intent`)}
                value={option.value}
                className="sr-only"
              />
              <span className="font-medium text-sm">{option.label}</span>
              <span className="text-xs text-muted-foreground">{option.description}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Liquidity */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Current Liquidity
        </label>
        <div className="grid grid-cols-3 gap-2">
          {LIQUIDITY_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                liquidity === option.value
                  ? `border-${option.color}-500 bg-${option.color}-500/10`
                  : 'border-border hover:border-border/60'
              }`}
            >
              <input
                type="radio"
                {...register(`q5_${id}_liquidity`)}
                value={option.value}
                className="sr-only"
              />
              <span className="text-sm text-center">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
