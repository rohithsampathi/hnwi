// app/api/decision-memo/artifact/[intakeId]/route.ts
// Fetch full IC artifact for SFO Pattern Audit

import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'https://hnwi-uwind-p8oqb.ondigitalocean.app';

interface RouteParams {
  params: {
    intakeId: string;
  };
}

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  const { intakeId } = await Promise.resolve(context.params);

  try {
    console.log('📥 [Artifact] Fetching full artifact for:', intakeId);

    // Try the correct backend endpoints (based on actual backend code)
    // 1. /sfo-audit/{intake_id}/full - Full artifact endpoint (requires payment)
    // 2. /preview/{intake_id} - Preview endpoint (returns full if unlocked/paid)
    const endpoints = [
      `${API_BASE_URL}/api/decision-memo/sfo-audit/${intakeId}/full`,
      `${API_BASE_URL}/api/decision-memo/preview/${intakeId}`,
    ];

    for (const backendUrl of endpoints) {
      console.log('📥 [Artifact] Trying backend:', backendUrl);

      try {
        const response = await fetch(backendUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ [Artifact] Full artifact fetched from:', backendUrl);
          console.log('📦 [Artifact] Response keys:', Object.keys(data));

          // Format value_creation into preview_data.total_savings for frontend
          const formatValueCreation = (amount: number): string => {
            if (!amount || amount === 0) return '—';
            if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
            if (amount >= 1000) return `$${Math.round(amount / 1000)}K`;
            return `$${amount.toLocaleString()}`;
          };

          // Ensure preview_data exists and has value creation mapped
          if (!data.preview_data) {
            data.preview_data = {};
          }

          // Merge value_creation into preview_data
          // Backend sends value_creation in multiple possible locations:
          // 1. preview.value_creation (new API structure)
          // 2. preview_data.peer_cohort_stats.value_creation
          // 3. value_creation (root level - legacy)
          const previewVC = data.preview?.value_creation;
          const peerStatsVC = data.preview_data?.peer_cohort_stats?.value_creation;
          const rootVC = data.value_creation;

          // Calculate total from nested structure
          const getVCTotal = (vc: any): number => {
            if (!vc) return 0;
            // New structure: annual_tax_savings.amount + capital_gains_savings.amount
            if (vc.annual_tax_savings?.amount !== undefined) {
              return (vc.annual_tax_savings?.amount || 0) + (vc.capital_gains_savings?.amount || 0);
            }
            // Legacy structure: total_annual
            return vc.total_annual || 0;
          };

          // Try each location in priority order
          const vc = previewVC || peerStatsVC || rootVC;
          const vcTotal = getVCTotal(vc);

          if (vc && vcTotal > 0) {
            data.preview_data.total_savings = formatValueCreation(vcTotal);
            data.preview_data.annual_value_creation = formatValueCreation(vcTotal);
            data.preview_data.twenty_year_projection = formatValueCreation(vcTotal * 20);
            data.preview_data.five_year_projection = formatValueCreation(vcTotal * 5);
            data.preview_data.value_creation_raw = {
              annual_tax_savings: vc.annual_tax_savings?.amount || 0,
              annual_cgt_savings: vc.capital_gains_savings?.amount || vc.annual_cgt_savings?.amount || 0,
              total_annual: vcTotal,
              five_year_projected: vc.five_year_projected || vcTotal * 5
            };
            console.log('✅ [Artifact] Mapped value_creation to preview_data.total_savings:', data.preview_data.total_savings);
          }

          // Also check for preview.data_quality, principal_profile, tax_differential
          if (data.preview) {
            if (data.preview.data_quality) data.preview_data.data_quality = data.preview.data_quality;
            if (data.preview.data_quality_note) data.preview_data.data_quality_note = data.preview.data_quality_note;
            if (data.preview.principal_profile) data.preview_data.exposure_class = data.preview.principal_profile;
            if (data.preview.precedent_count) data.preview_data.precedent_count = data.preview.precedent_count;
            if (data.preview.tax_differential) data.preview_data.tax_differential = data.preview.tax_differential;
            if (data.preview.dd_checklist) data.preview_data.dd_checklist = data.preview.dd_checklist;
          }

          // Merge peer_cohort_stats and capital_flow_data if at top level
          if (data.peer_cohort_stats) {
            data.preview_data.peer_cohort_stats = data.peer_cohort_stats;
          }
          if (data.capital_flow_data) {
            // Sanitize capital_flow_data - ensure numeric fields are never null
            data.preview_data.capital_flow_data = {
              ...data.capital_flow_data,
              flow_intensity_index: data.capital_flow_data.flow_intensity_index ?? 0,
              source_flows: data.capital_flow_data.source_flows || [],
              destination_flows: data.capital_flow_data.destination_flows || [],
            };
          }

          // =====================================================================
          // STRUCTURED JSON DATA (preferred - no parsing needed)
          // =====================================================================

          // Find structured JSON data (preferred)
          const transparencyData = data.memo_data?.transparency_data ||
                                   data.preview_data?.transparency_data ||
                                   data.transparency_data ||
                                   null;
          const crisisData = data.memo_data?.crisis_data ||
                             data.preview_data?.crisis_data ||
                             data.crisis_data ||
                             null;

          // Pass structured data to frontend
          if (transparencyData && typeof transparencyData === 'object') {
            data.preview_data.transparency_data = transparencyData;
            console.log('✅ [Artifact] Using structured transparency_data JSON');
          }
          if (crisisData && typeof crisisData === 'object') {
            data.preview_data.crisis_data = crisisData;
            console.log('✅ [Artifact] Using structured crisis_data JSON');
          }

          // =====================================================================
          // LEGACY: Raw text fallback (for backward compatibility)
          // =====================================================================
          const transparencyRegime = data.memo_data?.transparency_regime_impact ||
                                     data.preview_data?.transparency_regime_impact ||
                                     data.transparency_regime_impact ||
                                     null;
          const crisisResilience = data.memo_data?.crisis_resilience_stress_test ||
                                   data.preview_data?.crisis_resilience_stress_test ||
                                   data.crisis_resilience_stress_test ||
                                   null;

          if (transparencyRegime) {
            data.preview_data.transparency_regime_impact = transparencyRegime;
          }
          if (crisisResilience) {
            data.preview_data.crisis_resilience_stress_test = crisisResilience;
          }

          // Ensure memo_data exists
          if (!data.memo_data) {
            data.memo_data = {};
          }
          if (transparencyData) {
            data.memo_data.transparency_data = transparencyData;
          }
          if (crisisData) {
            data.memo_data.crisis_data = crisisData;
          }
          if (transparencyRegime) {
            data.memo_data.transparency_regime_impact = transparencyRegime;
          }
          if (crisisResilience) {
            data.memo_data.crisis_resilience_stress_test = crisisResilience;
          }

          return NextResponse.json(data);
        } else {
          console.log(`⚠️ [Artifact] ${backendUrl} returned ${response.status}`);
        }
      } catch (err) {
        console.log(`⚠️ [Artifact] ${backendUrl} failed:`, err);
      }
    }

    // All endpoints failed
    console.error('❌ [Artifact] All backend endpoints failed');
    return NextResponse.json(
      { success: false, error: 'Artifact not available from any endpoint' },
      { status: 404 }
    );

  } catch (error) {
    console.error('💥 [Artifact] Error fetching artifact:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch artifact',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
