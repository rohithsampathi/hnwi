// app/api/decision-memo/preview/[intakeId]/route.ts
// Preview endpoint - returns teaser stats from the decision memo analysis
// NOTE: This endpoint does NOT require payment - it shows the "teaser" before paywall

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';
import { logger } from '@/lib/secure-logger';
import { safeError } from '@/lib/security/api-response';

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
    logger.info('Fetching preview', { intakeId });

    // Platform-verified client IP for backend geolocation (not the Vercel server IP)
    const clientIp = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();

    // ==========================================================================
    // SFO PATTERN AUDIT PREVIEW
    // ==========================================================================

    if (intakeId.startsWith('sfo_')) {
      logger.info('SFO Pattern Audit preview requested', { intakeId });

      const backendUrl = `${API_BASE_URL}/api/decision-memo/preview/${intakeId}`;
      const previewHeaders: Record<string, string> = { 'Accept': 'application/json' };
      const authHeader = request.headers.get('Authorization');
      if (authHeader) {
        previewHeaders['Authorization'] = authHeader;
      }
      if (clientIp) {
        previewHeaders['x-forwarded-for'] = clientIp;
        previewHeaders['x-real-ip'] = clientIp;
      }
      const response = await fetch(backendUrl, {
        method: 'GET',
        headers: previewHeaders,
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('Backend error in SFO preview', { status: response.status });
        return NextResponse.json(
          { success: false, error: `Backend returned ${response.status}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      logger.info('Backend SFO preview response received', { intakeId });

      // Format value_creation amount to display string
      const formatValueCreation = (amount: number): string => {
        if (!amount || amount === 0) return '—';
        if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
        if (amount >= 1000) return `$${Math.round(amount / 1000)}K`;
        return `$${amount.toLocaleString()}`;
      };

      // Ensure preview_data exists
      if (!data.preview_data) {
        data.preview_data = {};
      }

      // Map value_creation from preview.value_creation or peer_cohort_stats
      const previewVC = data.preview?.value_creation;
      const peerStatsVC = data.preview_data?.peer_cohort_stats?.value_creation;
      const vc = previewVC || peerStatsVC;

      if (vc) {
        const vcTotal = (vc.annual_tax_savings?.amount || 0) + (vc.capital_gains_savings?.amount || 0);
        if (vcTotal > 0) {
          data.preview_data.total_savings = formatValueCreation(vcTotal);
          data.preview_data.annual_value_creation = formatValueCreation(vcTotal);
          data.preview_data.value_creation_raw = {
            annual_tax_savings: vc.annual_tax_savings?.amount || 0,
            annual_cgt_savings: vc.capital_gains_savings?.amount || 0,
            total_annual: vcTotal
          };
          logger.info('Preview value_creation mapped', { totalSavings: data.preview_data.total_savings });
        }
      }

      // Map other preview fields to preview_data
      if (data.preview) {
        if (data.preview.data_quality) data.preview_data.data_quality = data.preview.data_quality;
        if (data.preview.principal_profile) data.preview_data.exposure_class = data.preview.principal_profile;
        if (data.preview.precedent_count) data.preview_data.precedent_count = data.preview.precedent_count;
      }

      // Sanitize capital_flow_data if present - ensure numeric fields are never null
      if (data.capital_flow_data) {
        data.preview_data.capital_flow_data = {
          ...data.capital_flow_data,
          flow_intensity_index: data.capital_flow_data.flow_intensity_index ?? 0,
          source_flows: data.capital_flow_data.source_flows || [],
          destination_flows: data.capital_flow_data.destination_flows || [],
        };
      }

      // Pass through expert analysis sections from memo_data
      // Backend sends these in memo_data (primary location)
      // Also check artifact.memo_data for nested structure
      const transparencyRegime = data.memo_data?.transparency_regime_impact ||
                                 data.artifact?.memo_data?.transparency_regime_impact ||
                                 data.transparency_regime_impact ||
                                 data.artifact?.transparency_regime_impact ||
                                 data.preview?.transparency_regime_impact ||
                                 data.preview_data?.transparency_regime_impact;
      const crisisResilience = data.memo_data?.crisis_resilience_stress_test ||
                               data.artifact?.memo_data?.crisis_resilience_stress_test ||
                               data.crisis_resilience_stress_test ||
                               data.artifact?.crisis_resilience_stress_test ||
                               data.preview?.crisis_resilience_stress_test ||
                               data.preview_data?.crisis_resilience_stress_test;

      logger.info('Preview expert sections search', { transparencyFound: !!transparencyRegime, crisisFound: !!crisisResilience });

      if (transparencyRegime) {
        data.preview_data.transparency_regime_impact = transparencyRegime;
        logger.info('Mapped transparency_regime_impact');
      }
      if (crisisResilience) {
        data.preview_data.crisis_resilience_stress_test = crisisResilience;
        logger.info('Mapped crisis_resilience_stress_test');
      }

      // Ensure memo_data exists and includes expert sections for frontend compatibility
      if (!data.memo_data) {
        data.memo_data = {};
      }
      if (transparencyRegime) {
        data.memo_data.transparency_regime_impact = transparencyRegime;
      }
      if (crisisResilience) {
        data.memo_data.crisis_resilience_stress_test = crisisResilience;
      }

      // IMPORTANT: Add intake_id to response - frontend requires it
      data.intake_id = intakeId;

      return NextResponse.json({ success: true, preview: data }, {
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
      });
    }

    // ==========================================================================
    // LEGACY DECISION MEMO PREVIEW
    // ==========================================================================

    const backendUrl = `${API_BASE_URL}/api/decision-memo/preview/${intakeId}`;
    const legacyHeaders: Record<string, string> = { 'Accept': 'application/json' };
    const legacyAuth = request.headers.get('Authorization');
    if (legacyAuth) {
      legacyHeaders['Authorization'] = legacyAuth;
    }
    if (clientIp) {
      legacyHeaders['x-forwarded-for'] = clientIp;
      legacyHeaders['x-real-ip'] = clientIp;
    }
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: legacyHeaders,
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Backend error in legacy preview', { status: response.status });

      if (response.status === 404) {
        return NextResponse.json(
          { success: false, error: 'Preview not ready yet', retry: true },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: false, error: `Backend returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    logger.info('Backend preview response received', { intakeId });
    return NextResponse.json({ success: true, ...data });

  } catch (error) {
    logger.error('Error fetching preview', { error: error instanceof Error ? error.message : String(error) });
    return safeError(error);
  }
}
