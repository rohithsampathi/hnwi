/**
 * PDF Golden Visa / Investment Migration Section
 * Premium institutional visualization for visa programs and destination drivers
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { colors, darkTheme, pdfStyles, spacing } from '../pdf-styles';
import { PdfSectionHeader, PdfGroundedNote, PdfBadge } from './primitives';
import { DestinationDrivers, VisaProgram, GoldenVisaIntelligence } from '../pdf-types';

interface PdfGoldenVisaSectionProps {
  destinationDrivers?: DestinationDrivers;
  destinationJurisdiction?: string;
  goldenVisaIntelligence?: GoldenVisaIntelligence | null;
}

const VisaMetricBox: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={{ flex: 1, backgroundColor: darkTheme.pageBg, borderWidth: 1, borderColor: darkTheme.border, padding: 10, marginRight: 12 }}>
    <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8.5, color: darkTheme.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{label}</Text>
    <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10, color: darkTheme.textPrimary }}>{value}</Text>
  </View>
);

const ChangesNotice: React.FC<{ title: string; text: string }> = ({ title, text }) => (
  <View style={{ backgroundColor: darkTheme.surfaceBg, borderWidth: 1, borderColor: darkTheme.border, padding: 10, marginTop: 12, flexDirection: 'row' }}>
    <View style={{ width: 16, height: 16, backgroundColor: 'rgba(212,168,67,0.25)', borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
      <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8, color: colors.amber[500] }}>!</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8.5, color: darkTheme.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{title}</Text>
      <Text style={{ fontFamily: 'Inter', fontSize: 9, color: darkTheme.textMuted, lineHeight: 1.5 }}>{text}</Text>
    </View>
  </View>
);

const VisaProgramCard: React.FC<{ program: VisaProgram }> = ({ program }) => {
  const programName = program.program_name || program.name || 'Investment Program';
  const investmentAmount = program.minimum_investment || program.investment_min;
  const benefits = program.key_benefits || program.benefits || [];
  const changes2025 = program["2025_changes"];
  const isActive = !!program.status && program.status.toLowerCase().includes('active') && !program.status.toLowerCase().includes('limited');

  return (
    <View style={{ backgroundColor: darkTheme.cardBg, borderWidth: 1, borderColor: darkTheme.border, marginBottom: 16, padding: 16 }} wrap={false}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 24, height: 24, backgroundColor: 'rgba(212,168,67,0.15)', borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10, color: colors.amber[500] }}>V</Text>
          </View>
          <View>
            <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: darkTheme.textPrimary }}>{programName}</Text>
            {!!program.investment_type && <Text style={{ fontFamily: 'Inter', fontSize: 9, color: darkTheme.textMuted, marginTop: 2 }}>{program.investment_type}</Text>}
          </View>
        </View>
        {!!program.status && (
          <View style={[pdfStyles.badge, isActive ? pdfStyles.badgeGreen : pdfStyles.badgeGray]}>
            <Text style={[pdfStyles.badgeText, { color: isActive ? colors.emerald[400] : darkTheme.textMuted }]}>{program.status}</Text>
          </View>
        )}
      </View>

      <View style={{ flexDirection: 'row', marginBottom: 12 }}>
        {!!investmentAmount && <VisaMetricBox label="Investment" value={investmentAmount} />}
        {!!program.duration && <VisaMetricBox label="Duration" value={program.duration} />}
        {!!program.processing_time && <VisaMetricBox label="Processing" value={program.processing_time} />}
        {!!program.physical_presence_required && <VisaMetricBox label="Presence" value={program.physical_presence_required} />}
      </View>

      {benefits.length > 0 && (
        <View>
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: darkTheme.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Key Benefits</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {benefits.slice(0, 6).map((benefit, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', width: '48%', marginRight: 4, marginBottom: 6 }}>
                <View style={{ width: 4, height: 4, backgroundColor: colors.amber[500], borderRadius: 2, marginTop: 3, marginRight: 4 }} />
                <Text style={{ fontFamily: 'Inter', fontSize: 9, color: darkTheme.textMuted, flex: 1 }}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {program.path_to_citizenship !== undefined && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <Text style={{ fontFamily: 'Inter', fontSize: 9, color: darkTheme.textMuted }}>
            Path to Citizenship: <Text style={{ fontFamily: 'Inter', fontWeight: 700 }}>{program.path_to_citizenship ? 'Yes' : 'No'}</Text>
          </Text>
        </View>
      )}

      {!!changes2025 && <ChangesNotice title="2025/2026 Update" text={changes2025} />}
    </View>
  );
};

const DriverCard: React.FC<{ title: string; pct: number; desc: string }> = ({ title, pct, desc }) => (
  <View style={{ flex: 1, backgroundColor: darkTheme.cardBg, borderWidth: 1, borderColor: darkTheme.border, padding: 12, marginRight: 12 }}>
    <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: darkTheme.textPrimary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</Text>
    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
      <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10, color: darkTheme.textPrimary }}>{pct}%</Text>
      <Text style={{ fontFamily: 'Inter', fontSize: 9, color: darkTheme.textMuted, flex: 1, lineHeight: 1.4 }}> {desc}</Text>
    </View>
  </View>
);

// =============================================================================
// KGv3 GOLDEN VISA INTELLIGENCE COMPONENTS
// Richer program details from the Knowledge Graph when available
// =============================================================================

/** Status badge color mapping for KGv3 program status */
const getStatusBadgeVariant = (status?: string): 'success' | 'gold' | 'info' => {
  switch (status) {
    case 'ACTIVE': return 'success';
    case 'MODIFIED': return 'gold';
    case 'ENDED': return 'info';
    default: return 'info';
  }
};

/** Priority → badge variant mapping for critical considerations */
const getPriorityVariant = (priority: string): 'high' | 'medium' | 'low' => {
  switch (priority) {
    case 'HIGH': return 'high';
    case 'MEDIUM': return 'medium';
    case 'LOW': return 'low';
    default: return 'medium';
  }
};

/** KGv3 Qualification Routes Table */
const KGv3QualificationRoutes: React.FC<{ routes: NonNullable<GoldenVisaIntelligence['qualification_routes']> }> = ({ routes }) => (
  <View style={{ marginBottom: spacing.lg }} wrap={false}>
    <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: darkTheme.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm }}>
      Qualification Routes
    </Text>
    {/* Table Header */}
    <View style={{ flexDirection: 'row', backgroundColor: darkTheme.surfaceBg, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderTopWidth: 3, borderTopColor: colors.amber[500] }}>
      <Text style={{ flex: 2, fontFamily: 'Inter', fontWeight: 600, fontSize: 8, color: darkTheme.textPrimary, textTransform: 'uppercase', letterSpacing: 1.2 }}>Route</Text>
      <Text style={{ flex: 2, fontFamily: 'Inter', fontWeight: 600, fontSize: 8, color: darkTheme.textPrimary, textTransform: 'uppercase', letterSpacing: 1.2 }}>Min Investment</Text>
      <Text style={{ flex: 2, fontFamily: 'Inter', fontWeight: 600, fontSize: 8, color: darkTheme.textPrimary, textTransform: 'uppercase', letterSpacing: 1.2 }}>Property Types</Text>
      <Text style={{ flex: 1.5, fontFamily: 'Inter', fontWeight: 600, fontSize: 8, color: darkTheme.textPrimary, textTransform: 'uppercase', letterSpacing: 1.2 }}>Processing</Text>
      <Text style={{ flex: 2, fontFamily: 'Inter', fontWeight: 600, fontSize: 8, color: darkTheme.textPrimary, textTransform: 'uppercase', letterSpacing: 1.2 }}>Family Coverage</Text>
    </View>
    {/* Table Rows */}
    {routes.map((route, i) => (
      <View
        key={i}
        style={{
          flexDirection: 'row',
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: darkTheme.borderSubtle,
          backgroundColor: i % 2 === 0 ? darkTheme.pageBg : darkTheme.cardBg,
        }}
      >
        <Text style={{ flex: 2, fontFamily: 'Inter', fontSize: 9, color: darkTheme.textSecondary, lineHeight: 1.5 }}>{route.route}</Text>
        <Text style={{ flex: 2, fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: darkTheme.textPrimary, lineHeight: 1.5 }}>{route.requirement}</Text>
        <Text style={{ flex: 2, fontFamily: 'Inter', fontSize: 9, color: darkTheme.textMuted, lineHeight: 1.5 }}>{route.property_types || '—'}</Text>
        <Text style={{ flex: 1.5, fontFamily: 'Inter', fontSize: 9, color: darkTheme.textMuted, lineHeight: 1.5 }}>{route.processing_time}</Text>
        <Text style={{ flex: 2, fontFamily: 'Inter', fontSize: 9, color: darkTheme.textMuted, lineHeight: 1.5 }}>{route.family_inclusion || '—'}</Text>
      </View>
    ))}
  </View>
);

/** KGv3 Critical Considerations list with priority badges */
const KGv3CriticalConsiderations: React.FC<{ items: NonNullable<GoldenVisaIntelligence['critical_considerations']> }> = ({ items }) => (
  <View style={{ marginBottom: spacing.lg }} wrap={false}>
    <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: darkTheme.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm }}>
      Critical Considerations
    </Text>
    {items.map((item, i) => (
      <View
        key={i}
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          backgroundColor: darkTheme.cardBg,
          borderWidth: 1,
          borderColor: darkTheme.border,
          padding: spacing.md,
          marginBottom: spacing.xs,
        }}
      >
        <View style={{ marginRight: spacing.sm, marginTop: 1 }}>
          <PdfBadge label={item.priority} variant={getPriorityVariant(item.priority)} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: darkTheme.textPrimary, marginBottom: 2 }}>{item.item}</Text>
          <Text style={{ fontFamily: 'Inter', fontSize: 9, color: darkTheme.textMuted, lineHeight: 1.5 }}>{item.detail}</Text>
        </View>
      </View>
    ))}
  </View>
);

/** KGv3 Application Process — numbered steps */
const KGv3ApplicationProcess: React.FC<{ steps: NonNullable<GoldenVisaIntelligence['application_process']> }> = ({ steps }) => (
  <View style={{ marginBottom: spacing.lg }} wrap={false}>
    <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: darkTheme.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm }}>
      Application Process
    </Text>
    {steps.map((step, i) => (
      <View
        key={i}
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          marginBottom: spacing.sm,
          paddingLeft: spacing.xs,
        }}
      >
        <View style={{
          width: 20,
          height: 20,
          backgroundColor: 'rgba(212, 168, 67, 0.15)',
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: spacing.sm,
        }}>
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8, color: colors.amber[500] }}>{step.step}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'Inter', fontSize: 9, color: darkTheme.textPrimary, lineHeight: 1.5 }}>{step.action}</Text>
          {!!step.timeline && (
            <Text style={{ fontFamily: 'Inter', fontSize: 8, color: darkTheme.textMuted, marginTop: 1 }}>{step.timeline}</Text>
          )}
        </View>
      </View>
    ))}
  </View>
);

/** KGv3 Costs Breakdown — two-column table */
const KGv3CostsBreakdown: React.FC<{ costs: NonNullable<GoldenVisaIntelligence['costs']> }> = ({ costs }) => {
  // Build cost items from the typed object, filtering out empty values
  const costEntries: Array<{ label: string; amount: string }> = [];
  if (costs.visa_fee) costEntries.push({ label: 'Visa Fee', amount: costs.visa_fee });
  if (costs.emirates_id) costEntries.push({ label: 'Emirates ID', amount: costs.emirates_id });
  if (costs.medical_test) costEntries.push({ label: 'Medical Test', amount: costs.medical_test });
  if (costs.insurance_annual) costEntries.push({ label: 'Insurance (Annual)', amount: costs.insurance_annual });
  if (costs.total_initial) costEntries.push({ label: 'Total Initial', amount: costs.total_initial });
  if (costs.total_range) costEntries.push({ label: 'Total Range', amount: costs.total_range });

  if (costEntries.length === 0) return null;

  return (
    <View style={{ marginBottom: spacing.lg }} wrap={false}>
      <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: darkTheme.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm }}>
        Costs Breakdown
      </Text>
      {/* Table Header */}
      <View style={{ flexDirection: 'row', backgroundColor: darkTheme.surfaceBg, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderTopWidth: 3, borderTopColor: colors.amber[500] }}>
        <Text style={{ flex: 1, fontFamily: 'Inter', fontWeight: 600, fontSize: 8, color: darkTheme.textPrimary, textTransform: 'uppercase', letterSpacing: 1.2 }}>Cost Item</Text>
        <Text style={{ flex: 1, fontFamily: 'Inter', fontWeight: 600, fontSize: 8, color: darkTheme.textPrimary, textTransform: 'uppercase', letterSpacing: 1.2, textAlign: 'right' }}>Amount</Text>
      </View>
      {/* Table Rows */}
      {costEntries.map((entry, i) => {
        const isTotal = entry.label.toLowerCase().startsWith('total');
        return (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.md,
              borderBottomWidth: 1,
              borderBottomColor: darkTheme.borderSubtle,
              backgroundColor: i % 2 === 0 ? darkTheme.pageBg : darkTheme.cardBg,
            }}
          >
            <Text style={{ flex: 1, fontFamily: 'Inter', fontWeight: isTotal ? 700 : 400, fontSize: 9, color: isTotal ? darkTheme.textPrimary : darkTheme.textSecondary }}>{entry.label}</Text>
            <Text style={{ flex: 1, fontFamily: 'Inter', fontWeight: isTotal ? 700 : 400, fontSize: 9, color: isTotal ? colors.amber[500] : darkTheme.textPrimary, textAlign: 'right' }}>{entry.amount}</Text>
          </View>
        );
      })}
    </View>
  );
};

/** KGv3 Key Benefits list (handles both string and object forms) */
const KGv3KeyBenefits: React.FC<{ benefits: NonNullable<GoldenVisaIntelligence['key_benefits']> }> = ({ benefits }) => (
  <View style={{ marginBottom: spacing.lg }}>
    <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: darkTheme.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm }}>
      Key Benefits
    </Text>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {benefits.slice(0, 8).map((benefit, i) => {
        const text = typeof benefit === 'string' ? benefit : benefit.benefit;
        const detail = typeof benefit === 'object' ? benefit.detail : undefined;
        return (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', width: '48%', marginRight: 4, marginBottom: 6 }}>
            <View style={{ width: 4, height: 4, backgroundColor: colors.amber[500], borderRadius: 2, marginTop: 3, marginRight: 4 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Inter', fontSize: 9, color: darkTheme.textPrimary }}>{text}</Text>
              {!!detail && <Text style={{ fontFamily: 'Inter', fontSize: 8, color: darkTheme.textMuted, marginTop: 1 }}>{detail}</Text>}
            </View>
          </View>
        );
      })}
    </View>
  </View>
);

/** Full KGv3 Golden Visa Intelligence block */
const KGv3IntelligenceBlock: React.FC<{ data: GoldenVisaIntelligence }> = ({ data }) => (
  <View style={{ marginBottom: spacing.lg }}>
    {/* Program Header with Status Badge */}
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 13, color: darkTheme.textPrimary }}>
          {data.program_name || 'Golden Visa Program'}
        </Text>
        {!!data.jurisdiction && (
          <Text style={{ fontFamily: 'Inter', fontSize: 9, color: darkTheme.textMuted, marginTop: 2 }}>{data.jurisdiction}</Text>
        )}
      </View>
      {!!data.status && (
        <PdfBadge label={data.status} variant={getStatusBadgeVariant(data.status)} />
      )}
    </View>

    {/* Qualification Summary */}
    {!!data.qualification_summary && (
      <View style={{ backgroundColor: darkTheme.cardBg, borderWidth: 1, borderColor: darkTheme.border, borderLeftWidth: 3, borderLeftColor: colors.amber[500], padding: spacing.md, marginBottom: spacing.lg }}>
        <Text style={{ fontFamily: 'Inter', fontSize: 9.5, color: darkTheme.textSecondary, lineHeight: 1.6 }}>{data.qualification_summary}</Text>
        {data.qualifies_based_on_transaction !== undefined && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm }}>
            <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8.5, color: darkTheme.textMuted }}>
              Qualifies Based on Transaction:{' '}
            </Text>
            <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8.5, color: data.qualifies_based_on_transaction ? colors.emerald[400] : colors.red[400] }}>
              {data.qualifies_based_on_transaction ? 'Yes' : 'No'}
            </Text>
          </View>
        )}
      </View>
    )}

    {/* Key Benefits */}
    {data.key_benefits && data.key_benefits.length > 0 && (
      <KGv3KeyBenefits benefits={data.key_benefits} />
    )}

    {/* Qualification Routes Table */}
    {data.qualification_routes && data.qualification_routes.length > 0 && (
      <KGv3QualificationRoutes routes={data.qualification_routes} />
    )}

    {/* Critical Considerations */}
    {data.critical_considerations && data.critical_considerations.length > 0 && (
      <KGv3CriticalConsiderations items={data.critical_considerations} />
    )}

    {/* Application Process */}
    {data.application_process && data.application_process.length > 0 && (
      <KGv3ApplicationProcess steps={data.application_process} />
    )}

    {/* Costs Breakdown */}
    {data.costs && <KGv3CostsBreakdown costs={data.costs} />}
  </View>
);

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function PdfGoldenVisaSection({ destinationDrivers, destinationJurisdiction, goldenVisaIntelligence }: PdfGoldenVisaSectionProps) {
  const visaPrograms = destinationDrivers?.visa_programs;
  const hasKGv3 = goldenVisaIntelligence && (
    goldenVisaIntelligence.program_name ||
    (goldenVisaIntelligence.qualification_routes && goldenVisaIntelligence.qualification_routes.length > 0) ||
    (goldenVisaIntelligence.critical_considerations && goldenVisaIntelligence.critical_considerations.length > 0) ||
    (goldenVisaIntelligence.application_process && goldenVisaIntelligence.application_process.length > 0) ||
    goldenVisaIntelligence.costs
  );

  // Require at least some data to render
  if (!hasKGv3 && (!visaPrograms || visaPrograms.length === 0)) return null;

  const drivers = destinationDrivers?.primary_drivers;

  return (
    <View style={pdfStyles.section}>
      <PdfSectionHeader title="Investment Migration Programs" badge="Golden Visa" subtitle={`Investment migration programs available in ${destinationJurisdiction || 'destination jurisdiction'}`} />

      {/* KGv3 Intelligence (takes priority when available) */}
      {hasKGv3 && <KGv3IntelligenceBlock data={goldenVisaIntelligence!} />}

      {/* Fallback / supplementary: existing visa program cards */}
      {visaPrograms && visaPrograms.length > 0 && visaPrograms.map((program, index) => <VisaProgramCard key={index} program={program} />)}

      {drivers && (
        <View style={{ flexDirection: 'row', marginTop: 16 }} wrap={false}>
          {drivers.tax_optimization !== undefined && <DriverCard title="Tax Optimization" pct={drivers.tax_optimization} desc="of peers cite this as primary driver" />}
          {drivers.asset_protection !== undefined && <DriverCard title="Asset Protection" pct={drivers.asset_protection} desc="seeking enhanced protection" />}
          {drivers.lifestyle !== undefined && <DriverCard title="Lifestyle" pct={drivers.lifestyle} desc="prioritize lifestyle factors" />}
        </View>
      )}

      {!!destinationDrivers?.key_catalyst && <ChangesNotice title="Key Catalyst" text={destinationDrivers.key_catalyst} />}

      <PdfGroundedNote source={hasKGv3 ? "HNWI Chronicles KGv3 Golden Visa Intelligence + Investment Migration Database" : "HNWI Chronicles KG Golden Visa Programs 2026 + Investment Migration Database"} />
    </View>
  );
}

export default PdfGoldenVisaSection;
