// =============================================================================
// ASSET DETAILS INPUT
// Section 4: Dynamic fields based on Move Type selected in Decision Thesis
// =============================================================================

"use client";

import React from 'react';
import {
  AssetDetails,
  PROPERTY_TYPES,
  ART_CATEGORIES,
  ART_PERIODS,
  ART_MEDIUMS,
  JEWELLERY_TYPES,
  JEWELLERY_MATERIALS,
  METAL_TYPES,
  METAL_FORMS,
  STORAGE_METHODS,
  COLLECTIBLE_CATEGORIES,
  VEHICLE_TYPES,
  ASSET_CONDITIONS,
  PROVENANCE_OPTIONS,
} from '@/lib/decision-memo/pattern-audit-types';

interface AssetDetailsInputProps {
  value: Partial<AssetDetails> | undefined;
  onChange: (data: Partial<AssetDetails>) => void;
  moveType?: string;
}

const selectClass = "w-full px-3 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";
const inputClass = "w-full px-3 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40";
const smallSelectClass = "w-full px-2.5 py-1.5 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";
const smallInputClass = "w-full px-2.5 py-1.5 text-sm bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40";

export function AssetDetailsInput({ value, onChange, moveType }: AssetDetailsInputProps) {
  if (!moveType) {
    return (
      <div className="text-sm text-muted-foreground py-4 text-center">
        Select a Move Type in Decision Thesis to see asset-specific fields.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Estimated Value — common to all types */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Estimated value (USD)
        </label>
        <input
          type="number"
          value={value?.estimatedValue || ''}
          onChange={(e) => onChange({ estimatedValue: parseFloat(e.target.value) || 0 })}
          placeholder="6160000"
          min={0}
          step={1000}
          className={inputClass}
        />
      </div>

      {/* Type-specific fields */}
      {moveType === 'real_estate' && <RealEstateFields value={value} onChange={onChange} />}
      {moveType === 'art' && <ArtFields value={value} onChange={onChange} />}
      {moveType === 'jewellery' && <JewelleryFields value={value} onChange={onChange} />}
      {moveType === 'metals' && <MetalsFields value={value} onChange={onChange} />}
      {moveType === 'collectibles' && <CollectiblesFields value={value} onChange={onChange} />}
      {moveType === 'automotive' && <AutomotiveFields value={value} onChange={onChange} />}
    </div>
  );
}

// =============================================================================
// REAL ESTATE FIELDS
// =============================================================================

function RealEstateFields({ value, onChange }: { value: Partial<AssetDetails> | undefined; onChange: (d: Partial<AssetDetails>) => void }) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Property type</label>
        <select value={value?.propertyType || ''} onChange={(e) => onChange({ propertyType: e.target.value })} className={selectClass}>
          <option value="">Select type...</option>
          {PROPERTY_TYPES.map(pt => <option key={pt.id} value={pt.id}>{pt.label}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Location preference</label>
        <input type="text" value={value?.locationPreference || ''} onChange={(e) => onChange({ locationPreference: e.target.value })} placeholder="Orchard Road, Marina Bay, Sentosa Cove..." className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Size (sq ft)</label>
          <input type="number" value={value?.sizeSqft || ''} onChange={(e) => onChange({ sizeSqft: parseInt(e.target.value, 10) || 0 })} placeholder="3500" min={0} className={smallInputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Bedrooms</label>
          <select value={value?.bedrooms ?? ''} onChange={(e) => onChange({ bedrooms: parseInt(e.target.value, 10) || 0 })} className={smallSelectClass}>
            <option value="">Select...</option>
            <option value="0">Studio</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5+</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Expected rental yield (%)</label>
          <input type="number" value={value?.rentalYieldPct || ''} onChange={(e) => onChange({ rentalYieldPct: parseFloat(e.target.value) || 0 })} placeholder="9.0" min={0} max={100} step={0.1} className={smallInputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Expected appreciation (%)</label>
          <input type="number" value={value?.appreciationPct || ''} onChange={(e) => onChange({ appreciationPct: parseFloat(e.target.value) || 0 })} placeholder="16.0" min={0} max={100} step={0.1} className={smallInputClass} />
        </div>
      </div>
    </>
  );
}

// =============================================================================
// ART FIELDS
// =============================================================================

function ArtFields({ value, onChange }: { value: Partial<AssetDetails> | undefined; onChange: (d: Partial<AssetDetails>) => void }) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Category</label>
        <select value={value?.artCategory || ''} onChange={(e) => onChange({ artCategory: e.target.value })} className={selectClass}>
          <option value="">Select category...</option>
          {ART_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Artist / Maker</label>
        <input type="text" value={value?.artist || ''} onChange={(e) => onChange({ artist: e.target.value })} placeholder="Anish Kapoor, Banksy, Picasso..." className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Period</label>
          <select value={value?.period || ''} onChange={(e) => onChange({ period: e.target.value })} className={smallSelectClass}>
            <option value="">Select...</option>
            {ART_PERIODS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Medium</label>
          <select value={value?.medium || ''} onChange={(e) => onChange({ medium: e.target.value })} className={smallSelectClass}>
            <option value="">Select...</option>
            {ART_MEDIUMS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Condition</label>
          <select value={value?.condition || ''} onChange={(e) => onChange({ condition: e.target.value })} className={smallSelectClass}>
            <option value="">Select...</option>
            {ASSET_CONDITIONS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Provenance</label>
          <select value={value?.provenance || ''} onChange={(e) => onChange({ provenance: e.target.value })} className={smallSelectClass}>
            <option value="">Select...</option>
            {PROVENANCE_OPTIONS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>
      </div>
    </>
  );
}

// =============================================================================
// JEWELLERY FIELDS
// =============================================================================

function JewelleryFields({ value, onChange }: { value: Partial<AssetDetails> | undefined; onChange: (d: Partial<AssetDetails>) => void }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Type</label>
          <select value={value?.jewelleryType || ''} onChange={(e) => onChange({ jewelleryType: e.target.value })} className={selectClass}>
            <option value="">Select...</option>
            {JEWELLERY_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Primary material</label>
          <select value={value?.primaryMaterial || ''} onChange={(e) => onChange({ primaryMaterial: e.target.value })} className={selectClass}>
            <option value="">Select...</option>
            {JEWELLERY_MATERIALS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Brand / Maker</label>
        <input type="text" value={value?.brand || ''} onChange={(e) => onChange({ brand: e.target.value })} placeholder="Cartier, Van Cleef & Arpels, Graff..." className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Certification</label>
          <input type="text" value={value?.certification || ''} onChange={(e) => onChange({ certification: e.target.value })} placeholder="GIA, HRD, AGS..." className={smallInputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Condition</label>
          <select value={value?.condition || ''} onChange={(e) => onChange({ condition: e.target.value })} className={smallSelectClass}>
            <option value="">Select...</option>
            {ASSET_CONDITIONS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">Provenance</label>
        <select value={value?.provenance || ''} onChange={(e) => onChange({ provenance: e.target.value })} className={smallSelectClass}>
          <option value="">Select...</option>
          {PROVENANCE_OPTIONS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
      </div>
    </>
  );
}

// =============================================================================
// PRECIOUS METALS FIELDS
// =============================================================================

function MetalsFields({ value, onChange }: { value: Partial<AssetDetails> | undefined; onChange: (d: Partial<AssetDetails>) => void }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Metal</label>
          <select value={value?.metalType || ''} onChange={(e) => onChange({ metalType: e.target.value })} className={selectClass}>
            <option value="">Select...</option>
            {METAL_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Form</label>
          <select value={value?.metalForm || ''} onChange={(e) => onChange({ metalForm: e.target.value })} className={selectClass}>
            <option value="">Select...</option>
            {METAL_FORMS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Weight / Quantity</label>
        <input type="text" value={value?.weight || ''} onChange={(e) => onChange({ weight: e.target.value })} placeholder="100 oz, 5 kg, 200 coins..." className={inputClass} />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Storage method</label>
        <select value={value?.storageMethod || ''} onChange={(e) => onChange({ storageMethod: e.target.value })} className={selectClass}>
          <option value="">Select...</option>
          {STORAGE_METHODS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>
    </>
  );
}

// =============================================================================
// COLLECTIBLES FIELDS
// =============================================================================

function CollectiblesFields({ value, onChange }: { value: Partial<AssetDetails> | undefined; onChange: (d: Partial<AssetDetails>) => void }) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Category</label>
        <select value={value?.collectibleCategory || ''} onChange={(e) => onChange({ collectibleCategory: e.target.value })} className={selectClass}>
          <option value="">Select category...</option>
          {COLLECTIBLE_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
        <textarea value={value?.description || ''} onChange={(e) => onChange({ description: e.target.value })} placeholder="1945 Romanée-Conti, 24 bottles, stored at London City Bond..." rows={2} className={inputClass + " resize-none"} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Condition</label>
          <select value={value?.condition || ''} onChange={(e) => onChange({ condition: e.target.value })} className={smallSelectClass}>
            <option value="">Select...</option>
            {ASSET_CONDITIONS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Provenance</label>
          <select value={value?.provenance || ''} onChange={(e) => onChange({ provenance: e.target.value })} className={smallSelectClass}>
            <option value="">Select...</option>
            {PROVENANCE_OPTIONS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>
      </div>
    </>
  );
}

// =============================================================================
// AUTOMOTIVE FIELDS
// =============================================================================

function AutomotiveFields({ value, onChange }: { value: Partial<AssetDetails> | undefined; onChange: (d: Partial<AssetDetails>) => void }) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Vehicle type</label>
        <select value={value?.vehicleType || ''} onChange={(e) => onChange({ vehicleType: e.target.value })} className={selectClass}>
          <option value="">Select type...</option>
          {VEHICLE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Make & Model</label>
        <input type="text" value={value?.makeModel || ''} onChange={(e) => onChange({ makeModel: e.target.value })} placeholder="1963 Ferrari 250 GTO, 2022 Porsche 911 GT3 RS..." className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Year</label>
          <input type="number" value={value?.year || ''} onChange={(e) => onChange({ year: parseInt(e.target.value, 10) || 0 })} placeholder="1963" min={1900} max={2030} className={smallInputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Mileage</label>
          <input type="text" value={value?.mileage || ''} onChange={(e) => onChange({ mileage: e.target.value })} placeholder="12,000 miles" className={smallInputClass} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Condition</label>
          <select value={value?.condition || ''} onChange={(e) => onChange({ condition: e.target.value })} className={smallSelectClass}>
            <option value="">Select...</option>
            {ASSET_CONDITIONS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Provenance</label>
          <select value={value?.provenance || ''} onChange={(e) => onChange({ provenance: e.target.value })} className={smallSelectClass}>
            <option value="">Select...</option>
            {PROVENANCE_OPTIONS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>
      </div>
    </>
  );
}

export default AssetDetailsInput;
